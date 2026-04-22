#!/usr/bin/python3

from __future__ import annotations

import os
import signal
import subprocess
import sys
import time
from pathlib import Path
from typing import Optional

import numpy as np
import rclpy
from cv_bridge import CvBridge
from geometry_msgs.msg import TransformStamped
from rclpy.node import Node
from sensor_msgs.msg import CameraInfo, Image
from tf2_ros import TransformBroadcaster

from dualarm_interfaces.msg import Detection2D, Detection2DArray, SceneObjectArray


PROJECT_ROOT = Path("/home/gwh/dashgo_rl_project/workspaces/dual-arm")


class DepthHandlerFutureTfSmoke(Node):
    def __init__(self) -> None:
        super().__init__("depth_handler_future_tf_smoke")
        self._bridge = CvBridge()
        self._transform_broadcaster = TransformBroadcaster(self)
        self._camera_info_pub = self.create_publisher(CameraInfo, "/test/right/camera_info", 10)
        self._depth_pub = self.create_publisher(Image, "/test/right/depth", 10)
        self._detection_pub = self.create_publisher(Detection2DArray, "/test/right/detections", 10)
        self._scene_messages: list[SceneObjectArray] = []
        self.create_subscription(SceneObjectArray, "/test/right/scene_objects", self._scene_cb, 10)

    def _scene_cb(self, message: SceneObjectArray) -> None:
        self._scene_messages.append(message)
        self._scene_messages = self._scene_messages[-10:]

    def _publish_transform(self, stamp) -> None:
        transform = TransformStamped()
        transform.header.stamp = stamp
        transform.header.frame_id = "world"
        transform.child_frame_id = "right_camera_depth_frame"
        transform.transform.translation.x = 0.5
        transform.transform.translation.y = -0.2
        transform.transform.translation.z = 0.8
        transform.transform.rotation.w = 1.0
        self._transform_broadcaster.sendTransform(transform)

    def _publish_inputs(self, stamp) -> None:
        width = 16
        height = 16

        camera_info = CameraInfo()
        camera_info.header.stamp = stamp
        camera_info.header.frame_id = "right_camera_depth_frame"
        camera_info.width = width
        camera_info.height = height
        camera_info.k = [525.0, 0.0, width / 2.0, 0.0, 525.0, height / 2.0, 0.0, 0.0, 1.0]
        camera_info.p = [525.0, 0.0, width / 2.0, 0.0, 0.0, 525.0, height / 2.0, 0.0, 0.0, 0.0, 1.0, 0.0]
        self._camera_info_pub.publish(camera_info)

        depth = np.full((height, width), 1000, dtype=np.uint16)
        depth_msg = self._bridge.cv2_to_imgmsg(depth, encoding="16UC1")
        depth_msg.header.stamp = stamp
        depth_msg.header.frame_id = "right_camera_depth_frame"
        self._depth_pub.publish(depth_msg)

        detections = Detection2DArray()
        detections.header.stamp = stamp
        detections.header.frame_id = "right_camera_color_frame"
        detection = Detection2D()
        detection.header.stamp = stamp
        detection.header.frame_id = "right_camera_color_frame"
        detection.semantic_type = "water_bottle"
        detection.source = "right_camera"
        detection.x = width / 2.0
        detection.y = height / 2.0
        detection.width = width - 2.0
        detection.height = height - 2.0
        detection.score = 0.95
        detections.detections.append(detection)
        self._detection_pub.publish(detections)

    def run(self) -> int:
        env = os.environ.copy()
        env["PATH"] = "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
        env["LD_PRELOAD"] = "/usr/lib/x86_64-linux-gnu/libstdc++.so.6"
        for key in ("PYTHONPATH", "LD_LIBRARY_PATH", "LIBRARY_PATH", "CMAKE_PREFIX_PATH"):
            env.pop(key, None)

        command = (
            "source /opt/ros/humble/setup.bash && "
            f"source {PROJECT_ROOT / 'install' / 'setup.bash'} && "
            "ros2 run depth_handler depth_processor_node --ros-args "
            "-r __node:=depth_handler_future_tf_test "
            "-p camera_info_topic:=/test/right/camera_info "
            "-p depth_topic:=/test/right/depth "
            "-p detection_topic:=/test/right/detections "
            "-p scene_objects_topic:=/test/right/scene_objects "
            "-p pointcloud_topic:=/test/right/pointcloud "
            "-p visualization_topic:=/test/right/visualization "
            "-p target_frame:=world "
            "-p source_name:=right_camera "
            "-p require_depth_aligned_detections:=false "
            "-p require_camera_info_depth_frame:=true "
            "-p expected_detection_frame:=right_camera_color_frame"
        )
        process = subprocess.Popen(
            ["/bin/bash", "-lc", command],
            cwd=str(PROJECT_ROOT),
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
        )

        try:
            deadline = time.monotonic() + 8.0
            warmed_up = False
            transform_sent = False
            while time.monotonic() < deadline:
                now = self.get_clock().now()
                if not transform_sent:
                    self._publish_transform(now.to_msg())
                    transform_sent = True
                if time.monotonic() - (deadline - 8.0) > 1.0 and not warmed_up:
                    warmed_up = True

                if warmed_up:
                    future_stamp = (now + rclpy.duration.Duration(seconds=0.25)).to_msg()
                    self._publish_inputs(future_stamp)

                rclpy.spin_once(self, timeout_sec=0.05)
                for message in self._scene_messages:
                    if message.objects and message.header.frame_id == "world":
                        print("depth_handler future-tf smoke passed")
                        return 0
        finally:
            if process.poll() is None:
                process.send_signal(signal.SIGINT)
                try:
                    process.wait(timeout=5.0)
                except subprocess.TimeoutExpired:
                    process.kill()
                    process.wait(timeout=5.0)

            output = ""
            if process.stdout is not None:
                output = process.stdout.read()
            if process.returncode not in (0, -2, 130, None):
                print(output, file=sys.stderr)

        print("depth_handler future-tf smoke failed", file=sys.stderr)
        if output:
            print(output, file=sys.stderr)
        return 1


def main() -> int:
    rclpy.init()
    node: Optional[DepthHandlerFutureTfSmoke] = None
    try:
        node = DepthHandlerFutureTfSmoke()
        return node.run()
    finally:
        if node is not None:
            node.destroy_node()
        try:
            rclpy.shutdown()
        except Exception:
            pass


if __name__ == "__main__":
    raise SystemExit(main())
