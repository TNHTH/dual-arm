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
        self._camera_info = None
        self._color = None
        self._depth = None
        self._buffer = Buffer()
        self._listener = TransformListener(self._buffer, self)
        self.create_subscription(CameraInfo, "/camera/depth/camera_info", self._camera_info_cb, 10)
        self.create_subscription(Image, "/camera/color/image_raw", self._color_cb, 10)
        self.create_subscription(Image, "/camera/depth/image_raw", self._depth_cb, 10)

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
        deadline = time.monotonic() + 5.0
        while time.monotonic() < deadline:
            rclpy.spin_once(node, timeout_sec=0.1)
            if node._camera_info and node._color and node._depth:
                break
        if not node._camera_info or not node._color or not node._depth:
            print("camera topics missing")
            return 2

        tf_deadline = time.monotonic() + 5.0
        world_ok = False
        depth_ok = False
        while time.monotonic() < tf_deadline:
            rclpy.spin_once(node, timeout_sec=0.1)
            world_ok = node._buffer.can_transform("world", "left_camera", rclpy.time.Time())
            depth_ok = node._buffer.can_transform("left_camera", "left_camera_depth_frame", rclpy.time.Time())
            if world_ok and depth_ok:
                break
        if not world_ok or not depth_ok:
            print(f"tf lookup failed: world_ok={world_ok}, depth_ok={depth_ok}")
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
