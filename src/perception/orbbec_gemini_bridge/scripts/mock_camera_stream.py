#!/usr/bin/python3

from __future__ import annotations

import numpy as np
import rclpy
from cv_bridge import CvBridge
from rclpy.node import Node
from sensor_msgs.msg import CameraInfo, Image


class MockCameraStream(Node):
    def __init__(self) -> None:
        super().__init__("mock_camera_stream")
        self.declare_parameter("fps", 10.0)
        self.declare_parameter("color_topic", "/camera/color/image_raw")
        self.declare_parameter("depth_topic", "/camera/depth/image_raw")
        self.declare_parameter("color_camera_info_topic", "/camera/color/camera_info")
        self.declare_parameter("depth_camera_info_topic", "/camera/depth/camera_info")
        self.declare_parameter("color_frame_id", "left_camera_color_frame")
        self.declare_parameter("depth_frame_id", "left_camera_depth_frame")
        self.declare_parameter("width", 640)
        self.declare_parameter("height", 480)
        self.declare_parameter("publish_color_camera_info", True)

        self._bridge = CvBridge()
        self._color_frame_id = str(self.get_parameter("color_frame_id").value)
        self._depth_frame_id = str(self.get_parameter("depth_frame_id").value)
        self._width = int(self.get_parameter("width").value)
        self._height = int(self.get_parameter("height").value)
        self._color_pub = self.create_publisher(Image, str(self.get_parameter("color_topic").value), 10)
        self._depth_pub = self.create_publisher(Image, str(self.get_parameter("depth_topic").value), 10)
        self._color_info_pub = self.create_publisher(
            CameraInfo, str(self.get_parameter("color_camera_info_topic").value), 10
        )
        self._depth_info_pub = self.create_publisher(
            CameraInfo, str(self.get_parameter("depth_camera_info_topic").value), 10
        )
        self._publish_color_camera_info = bool(self.get_parameter("publish_color_camera_info").value)
        fps = float(self.get_parameter("fps").value)
        self.create_timer(1.0 / max(fps, 1.0), self._tick)
        self.get_logger().info("mock_camera_stream 已启动")

    def _tick(self) -> None:
        stamp = self.get_clock().now().to_msg()
        color = np.zeros((self._height, self._width, 3), dtype=np.uint8)
        color[:, :, 1] = 80
        color_msg = self._bridge.cv2_to_imgmsg(color, encoding="bgr8")
        color_msg.header.stamp = stamp
        color_msg.header.frame_id = self._color_frame_id
        self._color_pub.publish(color_msg)

        depth = np.full((self._height, self._width), 1000, dtype=np.uint16)
        depth_msg = self._bridge.cv2_to_imgmsg(depth, encoding="16UC1")
        depth_msg.header.stamp = stamp
        depth_msg.header.frame_id = self._depth_frame_id
        self._depth_pub.publish(depth_msg)

        depth_info = self._build_camera_info(stamp, self._depth_frame_id)
        self._depth_info_pub.publish(depth_info)
        if self._publish_color_camera_info:
            color_info = self._build_camera_info(stamp, self._color_frame_id)
            self._color_info_pub.publish(color_info)

    def _build_camera_info(self, stamp, frame_id: str) -> CameraInfo:
        info = CameraInfo()
        info.header.stamp = stamp
        info.header.frame_id = frame_id
        info.width = self._width
        info.height = self._height
        fx = 525.0
        fy = 525.0
        cx = self._width / 2.0
        cy = self._height / 2.0
        info.distortion_model = "plumb_bob"
        info.d = [0.0] * 5
        info.k = [fx, 0.0, cx, 0.0, fy, cy, 0.0, 0.0, 1.0]
        info.r = [1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0]
        info.p = [fx, 0.0, cx, 0.0, 0.0, fy, cy, 0.0, 0.0, 0.0, 1.0, 0.0]
        return info


def main() -> None:
    rclpy.init()
    node = MockCameraStream()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        try:
            rclpy.shutdown()
        except Exception:  # pylint: disable=broad-except
            pass


if __name__ == "__main__":
    main()
