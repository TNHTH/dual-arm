#!/usr/bin/python3

from __future__ import annotations

import time

import rclpy
from rclpy.node import Node
from sensor_msgs.msg import CameraInfo, Image
from tf2_ros import Buffer, TransformListener


class CameraFrameSmoke(Node):
    def __init__(self) -> None:
        super().__init__("camera_frame_smoke")
        self.declare_parameter("camera_info_topic", "/left_camera/depth/camera_info")
        self.declare_parameter("color_topic", "/left_camera/color/image_raw")
        self.declare_parameter("depth_topic", "/left_camera/depth/image_raw")
        self.declare_parameter("world_frame", "world")
        self.declare_parameter("camera_frame", "left_camera")
        self.declare_parameter("depth_frame", "left_camera_depth_frame")
        self.declare_parameter("require_world_tf", True)
        self.declare_parameter("timeout_sec", 5.0)
        self._camera_info = None
        self._color = None
        self._depth = None
        self._camera_info_topic = str(self.get_parameter("camera_info_topic").value)
        self._color_topic = str(self.get_parameter("color_topic").value)
        self._depth_topic = str(self.get_parameter("depth_topic").value)
        self._world_frame = str(self.get_parameter("world_frame").value)
        self._camera_frame = str(self.get_parameter("camera_frame").value)
        self._depth_frame = str(self.get_parameter("depth_frame").value)
        self._require_world_tf = bool(self.get_parameter("require_world_tf").value)
        self._timeout_sec = float(self.get_parameter("timeout_sec").value)
        self._buffer = Buffer()
        self._listener = TransformListener(self._buffer, self)
        self.create_subscription(CameraInfo, self._camera_info_topic, self._camera_info_cb, 10)
        self.create_subscription(Image, self._color_topic, self._color_cb, 10)
        self.create_subscription(Image, self._depth_topic, self._depth_cb, 10)

    def _camera_info_cb(self, msg):
        self._camera_info = msg

    def _color_cb(self, msg):
        self._color = msg

    def _depth_cb(self, msg):
        self._depth = msg


def main() -> int:
    rclpy.init()
    node = CameraFrameSmoke()
    try:
        deadline = time.monotonic() + node._timeout_sec
        while time.monotonic() < deadline:
            rclpy.spin_once(node, timeout_sec=0.1)
            if node._camera_info and node._color and node._depth:
                break
        if not node._camera_info or not node._color or not node._depth:
            print(
                "camera topics missing: "
                f"color={bool(node._color)}({node._color_topic}) "
                f"depth={bool(node._depth)}({node._depth_topic}) "
                f"camera_info={bool(node._camera_info)}({node._camera_info_topic})"
            )
            return 2

        tf_deadline = time.monotonic() + node._timeout_sec
        world_ok = not node._require_world_tf
        depth_ok = False
        while time.monotonic() < tf_deadline:
            rclpy.spin_once(node, timeout_sec=0.1)
            if node._require_world_tf:
                world_ok = node._buffer.can_transform(node._world_frame, node._camera_frame, rclpy.time.Time())
            depth_ok = node._buffer.can_transform(node._camera_frame, node._depth_frame, rclpy.time.Time())
            if world_ok and depth_ok:
                break
        if not world_ok or not depth_ok:
            print(
                "tf lookup failed: "
                f"world_ok={world_ok}({node._world_frame}->{node._camera_frame}) "
                f"depth_ok={depth_ok}({node._camera_frame}->{node._depth_frame})"
            )
            return 3

        print("camera frame smoke passed")
        print(node._color.header.frame_id)
        print(node._depth.header.frame_id)
        print(node._camera_info.header.frame_id)
        return 0
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    raise SystemExit(main())
