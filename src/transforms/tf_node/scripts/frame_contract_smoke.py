#!/usr/bin/python3

from __future__ import annotations

import time

import rclpy
from rclpy.node import Node
from sensor_msgs.msg import CameraInfo, Image
from tf2_ros import Buffer, TransformListener


class FrameContractSmoke(Node):
    def __init__(self) -> None:
        super().__init__("frame_contract_smoke")
        self.declare_parameter("color_topic", "/camera/color/image_raw")
        self.declare_parameter("depth_topic", "/camera/depth/image_raw")
        self.declare_parameter("color_camera_info_topic", "/camera/color/camera_info")
        self.declare_parameter("depth_camera_info_topic", "/camera/depth/camera_info")
        self.declare_parameter("left_camera_frame", "left_camera")
        self.declare_parameter("left_tcp_frame", "left_tcp")
        self.declare_parameter("expected_color_frame", "left_camera_color_frame")
        self.declare_parameter("expected_depth_frame", "left_camera_depth_frame")
        self.declare_parameter("require_aligned_depth_to_color", False)
        self.declare_parameter("message_timeout_sec", 5.0)
        self.declare_parameter("transform_timeout_sec", 5.0)
        self.declare_parameter("max_depth_info_delta_sec", 0.2)

        self._color: Image | None = None
        self._depth: Image | None = None
        self._color_camera_info: CameraInfo | None = None
        self._depth_camera_info: CameraInfo | None = None
        self._buffer = Buffer()
        self._listener = TransformListener(self._buffer, self)

        self._left_camera_frame = str(self.get_parameter("left_camera_frame").value)
        self._left_tcp_frame = str(self.get_parameter("left_tcp_frame").value)
        self._expected_color_frame = str(self.get_parameter("expected_color_frame").value)
        self._expected_depth_frame = str(self.get_parameter("expected_depth_frame").value)
        self._require_aligned_depth_to_color = bool(self.get_parameter("require_aligned_depth_to_color").value)
        self._message_timeout_sec = float(self.get_parameter("message_timeout_sec").value)
        self._transform_timeout_sec = float(self.get_parameter("transform_timeout_sec").value)
        self._max_depth_info_delta_sec = float(self.get_parameter("max_depth_info_delta_sec").value)

        self.create_subscription(
            Image,
            str(self.get_parameter("color_topic").value),
            self._color_cb,
            10,
        )
        self.create_subscription(
            Image,
            str(self.get_parameter("depth_topic").value),
            self._depth_cb,
            10,
        )
        self.create_subscription(
            CameraInfo,
            str(self.get_parameter("color_camera_info_topic").value),
            self._color_camera_info_cb,
            10,
        )
        self.create_subscription(
            CameraInfo,
            str(self.get_parameter("depth_camera_info_topic").value),
            self._depth_camera_info_cb,
            10,
        )

    def _color_cb(self, message: Image) -> None:
        self._color = message

    def _depth_cb(self, message: Image) -> None:
        self._depth = message

    def _color_camera_info_cb(self, message: CameraInfo) -> None:
        self._color_camera_info = message

    def _depth_camera_info_cb(self, message: CameraInfo) -> None:
        self._depth_camera_info = message

    def wait_for_topics(self) -> None:
        deadline = time.monotonic() + self._message_timeout_sec
        while time.monotonic() < deadline:
            rclpy.spin_once(self, timeout_sec=0.1)
            if self._color and self._depth and self._color_camera_info and self._depth_camera_info:
                return
        raise RuntimeError("camera topics missing")

    def assert_headers(self) -> None:
        assert self._color is not None
        assert self._depth is not None
        assert self._color_camera_info is not None
        assert self._depth_camera_info is not None

        if self._color.header.frame_id != self._expected_color_frame:
            raise RuntimeError(
                f"color frame mismatch: expected {self._expected_color_frame}, got {self._color.header.frame_id}"
            )
        if self._depth.header.frame_id != self._expected_depth_frame:
            raise RuntimeError(
                f"depth frame mismatch: expected {self._expected_depth_frame}, got {self._depth.header.frame_id}"
            )
        if self._color_camera_info.header.frame_id != self._expected_color_frame:
            raise RuntimeError(
                "color camera_info frame mismatch: "
                f"expected {self._expected_color_frame}, got {self._color_camera_info.header.frame_id}"
            )
        if self._depth_camera_info.header.frame_id != self._expected_depth_frame:
            raise RuntimeError(
                "depth camera_info frame mismatch: "
                f"expected {self._expected_depth_frame}, got {self._depth_camera_info.header.frame_id}"
            )

        depth_stamp = rclpy.time.Time.from_msg(self._depth.header.stamp)
        color_info_stamp = rclpy.time.Time.from_msg(self._color_camera_info.header.stamp)
        depth_info_stamp = rclpy.time.Time.from_msg(self._depth_camera_info.header.stamp)
        delta = abs((depth_stamp - depth_info_stamp).nanoseconds) / 1e9
        if delta > self._max_depth_info_delta_sec:
            raise RuntimeError(
                f"depth/camera_info timestamp delta too large: {delta:.3f}s > {self._max_depth_info_delta_sec:.3f}s"
            )
        color_delta = abs((depth_stamp - color_info_stamp).nanoseconds) / 1e9
        if color_delta > self._max_depth_info_delta_sec:
            raise RuntimeError(
                f"color_camera_info/depth timestamp delta too large: {color_delta:.3f}s > {self._max_depth_info_delta_sec:.3f}s"
            )
        if self._require_aligned_depth_to_color and (
            int(self._color_camera_info.width) != int(self._depth.width)
            or int(self._color_camera_info.height) != int(self._depth.height)
        ):
            raise RuntimeError("aligned_to_color 合同要求 color camera_info 与 depth 图像分辨率一致")

    def wait_for_transforms(self) -> None:
        required_pairs = [
            (self._left_tcp_frame, self._left_camera_frame),
            (self._left_camera_frame, self._expected_color_frame),
            (self._left_camera_frame, self._expected_depth_frame),
        ]
        deadline = time.monotonic() + self._transform_timeout_sec
        while time.monotonic() < deadline:
            rclpy.spin_once(self, timeout_sec=0.1)
            if all(
                self._buffer.can_transform(parent, child, rclpy.time.Time())
                for parent, child in required_pairs
            ):
                return
        missing = [
            f"{parent}->{child}"
            for parent, child in required_pairs
            if not self._buffer.can_transform(parent, child, rclpy.time.Time())
        ]
        raise RuntimeError(f"tf lookup failed: {', '.join(missing)}")


def main() -> int:
    rclpy.init()
    node = FrameContractSmoke()
    try:
        node.wait_for_topics()
        node.assert_headers()
        node.wait_for_transforms()
        print("frame contract smoke passed")
        print(f"color_frame={node._color.header.frame_id}")
        print(f"depth_frame={node._depth.header.frame_id}")
        print(f"color_camera_info_frame={node._color_camera_info.header.frame_id}")
        print(f"depth_camera_info_frame={node._depth_camera_info.header.frame_id}")
        print(f"tf_chain={node._left_tcp_frame}->{node._left_camera_frame}->{node._expected_color_frame},{node._expected_depth_frame}")
        return 0
    except Exception as exc:  # pylint: disable=broad-except
        print(f"frame contract smoke failed: {exc}")
        return 1
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    raise SystemExit(main())
