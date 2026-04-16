#!/usr/bin/python3

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

import cv2
import rclpy
from cv_bridge import CvBridge
from rclpy.node import Node
from sensor_msgs.msg import CameraInfo, Image


@dataclass
class StreamState:
    color_cap: cv2.VideoCapture
    depth_cap: cv2.VideoCapture


class OrbbecGeminiRosBridge(Node):
    def __init__(self) -> None:
        super().__init__("orbbec_gemini_ros_bridge")

        self.declare_parameter("color_device", "/dev/video8")
        self.declare_parameter("depth_obsensor_index", 0)
        self.declare_parameter("fps", 15.0)
        self.declare_parameter("rotate_180", True)
        self.declare_parameter("color_topic", "/camera/color/image_raw")
        self.declare_parameter("depth_topic", "/camera/depth/image_raw")
        self.declare_parameter("depth_camera_info_topic", "/camera/depth/camera_info")
        self.declare_parameter("color_frame_id", "left_camera_color_frame")
        self.declare_parameter("depth_frame_id", "left_camera_depth_frame")

        color_device = self.get_parameter("color_device").value
        depth_obsensor_index = int(self.get_parameter("depth_obsensor_index").value)
        fps = float(self.get_parameter("fps").value)
        self._color_frame_id = str(self.get_parameter("color_frame_id").value)
        self._depth_frame_id = str(self.get_parameter("depth_frame_id").value)
        self._rotate_180 = bool(self.get_parameter("rotate_180").value)

        color_cap = cv2.VideoCapture(color_device, cv2.CAP_V4L2)
        if not color_cap.isOpened():
            raise RuntimeError(f"无法打开 Orbbec 彩色设备: {color_device}")

        depth_cap = cv2.VideoCapture(depth_obsensor_index, cv2.CAP_OBSENSOR)
        if not depth_cap.isOpened():
            raise RuntimeError(f"无法打开 Orbbec OBSENSOR 深度设备索引: {depth_obsensor_index}")

        self._streams = StreamState(color_cap=color_cap, depth_cap=depth_cap)
        self._bridge = CvBridge()
        self._color_pub = self.create_publisher(Image, str(self.get_parameter("color_topic").value), 10)
        self._depth_pub = self.create_publisher(Image, str(self.get_parameter("depth_topic").value), 10)
        self._depth_info_pub = self.create_publisher(
            CameraInfo, str(self.get_parameter("depth_camera_info_topic").value), 10
        )

        self._timer = self.create_timer(1.0 / max(fps, 1.0), self._tick)
        self.get_logger().info(
            f"Orbbec Gemini ROS bridge 已启动，color={color_device}，"
            f"depth_obsensor_index={depth_obsensor_index}，fps={fps:.1f}，rotate_180={self._rotate_180}"
        )

    def destroy_node(self) -> bool:
        try:
            self._streams.color_cap.release()
            self._streams.depth_cap.release()
        finally:
            return super().destroy_node()

    def _tick(self) -> None:
        color_ok, color = self._streams.color_cap.read()

        depth_ok = self._streams.depth_cap.grab()
        depth = None
        if depth_ok:
            depth_ok, depth = self._streams.depth_cap.retrieve(None, cv2.CAP_OBSENSOR_DEPTH_MAP)

        if not color_ok:
            self.get_logger().warn("读取彩色图失败", throttle_duration_sec=2.0)
            return
        if not depth_ok or depth is None:
            self.get_logger().warn("读取深度图失败", throttle_duration_sec=2.0)
            return

        if self._rotate_180:
            color = cv2.rotate(color, cv2.ROTATE_180)
            depth = cv2.rotate(depth, cv2.ROTATE_180)

        stamp = self.get_clock().now().to_msg()

        color_msg = self._bridge.cv2_to_imgmsg(color, encoding="bgr8")
        color_msg.header.stamp = stamp
        color_msg.header.frame_id = self._color_frame_id
        self._color_pub.publish(color_msg)

        depth_msg = self._bridge.cv2_to_imgmsg(depth, encoding="16UC1")
        depth_msg.header.stamp = stamp
        depth_msg.header.frame_id = self._depth_frame_id
        self._depth_pub.publish(depth_msg)

        camera_info = self._build_depth_camera_info(depth.shape[1], depth.shape[0], stamp)
        self._depth_info_pub.publish(camera_info)

    def _build_depth_camera_info(self, width: int, height: int, stamp) -> CameraInfo:
        cap = self._streams.depth_cap
        fx = float(cap.get(cv2.CAP_PROP_OBSENSOR_INTRINSIC_FX))
        fy = float(cap.get(cv2.CAP_PROP_OBSENSOR_INTRINSIC_FY))
        cx = float(cap.get(cv2.CAP_PROP_OBSENSOR_INTRINSIC_CX))
        cy = float(cap.get(cv2.CAP_PROP_OBSENSOR_INTRINSIC_CY))

        if fx <= 0.0 or fy <= 0.0:
            fx = 525.0
            fy = 525.0
            cx = width / 2.0
            cy = height / 2.0

        msg = CameraInfo()
        msg.header.stamp = stamp
        msg.header.frame_id = self._depth_frame_id
        msg.width = width
        msg.height = height
        msg.distortion_model = "plumb_bob"
        msg.d = [0.0, 0.0, 0.0, 0.0, 0.0]
        msg.k = [fx, 0.0, cx, 0.0, fy, cy, 0.0, 0.0, 1.0]
        msg.r = [1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0]
        msg.p = [fx, 0.0, cx, 0.0, 0.0, fy, cy, 0.0, 0.0, 0.0, 1.0, 0.0]
        return msg


def main() -> None:
    rclpy.init()
    node: Optional[OrbbecGeminiRosBridge] = None
    try:
        node = OrbbecGeminiRosBridge()
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        if node is not None:
            node.destroy_node()
        try:
            rclpy.shutdown()
        except Exception:  # pylint: disable=broad-except
            pass


if __name__ == "__main__":
    main()
