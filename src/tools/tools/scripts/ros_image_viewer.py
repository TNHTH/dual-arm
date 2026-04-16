#!/usr/bin/python3

from __future__ import annotations

import cv2
import rclpy
from cv_bridge import CvBridge
from rclpy.node import Node
from sensor_msgs.msg import Image


class RosImageViewer(Node):
    def __init__(self) -> None:
        super().__init__("ros_image_viewer")
        self.declare_parameter("image_topic", "/detector/detections/image")
        self.declare_parameter("window_name", "detector_view")
        self._topic = str(self.get_parameter("image_topic").value)
        self._window = str(self.get_parameter("window_name").value)
        self._bridge = CvBridge()
        cv2.namedWindow(self._window, cv2.WINDOW_NORMAL)
        self.create_subscription(Image, self._topic, self._callback, 10)
        self.get_logger().info(f"正在显示图像话题: {self._topic}")

    def _callback(self, message: Image) -> None:
        frame = self._bridge.imgmsg_to_cv2(message, desired_encoding="bgr8")
        cv2.imshow(self._window, frame)
        cv2.waitKey(1)


def main() -> None:
    rclpy.init()
    node = RosImageViewer()
    try:
        rclpy.spin(node)
    finally:
        node.destroy_node()
        cv2.destroyAllWindows()
        rclpy.shutdown()


if __name__ == "__main__":
    main()
