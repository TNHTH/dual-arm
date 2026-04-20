#!/usr/bin/python3

from __future__ import annotations

import ctypes
import fcntl
import json
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import cv2
import numpy as np
import rclpy
from cv_bridge import CvBridge
from rclpy.node import Node
from sensor_msgs.msg import CameraInfo, Image


VIDIOC_ENUM_FMT = 0xC0405602
V4L2_BUF_TYPE_VIDEO_CAPTURE = 1


class V4L2FormatDesc(ctypes.Structure):
    _fields_ = [
        ("index", ctypes.c_uint32),
        ("type", ctypes.c_uint32),
        ("flags", ctypes.c_uint32),
        ("description", ctypes.c_uint8 * 32),
        ("pixelformat", ctypes.c_uint32),
        ("mbus_code", ctypes.c_uint32),
        ("reserved", ctypes.c_uint32 * 3),
    ]


@dataclass
class StreamState:
    color_cap: cv2.VideoCapture
    depth_cap: cv2.VideoCapture
    depth_backend: str
    color_device: str
    depth_device: str


@dataclass
class CameraModel:
    fx: float
    fy: float
    cx: float
    cy: float
    distortion: list[float]


class OrbbecGeminiRosBridge(Node):
    def __init__(self) -> None:
        super().__init__("orbbec_gemini_ros_bridge")

        self.declare_parameter("color_device", "auto")
        self.declare_parameter("depth_device", "auto")
        self.declare_parameter("depth_backend", "auto")
        self.declare_parameter("depth_obsensor_index", 0)
        self.declare_parameter("fps", 15.0)
        self.declare_parameter("rotate_180", True)
        self.declare_parameter("color_topic", "/camera/color/image_raw")
        self.declare_parameter("depth_topic", "/camera/depth/image_raw")
        self.declare_parameter("color_camera_info_topic", "/camera/color/camera_info")
        self.declare_parameter("depth_camera_info_topic", "/camera/depth/camera_info")
        self.declare_parameter("color_frame_id", "left_camera_color_frame")
        self.declare_parameter("depth_frame_id", "left_camera_depth_frame")
        self.declare_parameter("publish_color_camera_info", True)
        self.declare_parameter("depth_alignment_mode", "raw_unregistered")
        self.declare_parameter("color_camera_info_source", "copy_depth_intrinsics")
        self.declare_parameter("camera_matrix_file", "")
        self.declare_parameter("v4l2_depth_unit_to_mm_scale", 0.125)

        requested_color_device = str(self.get_parameter("color_device").value)
        requested_depth_device = str(self.get_parameter("depth_device").value)
        requested_depth_backend = str(self.get_parameter("depth_backend").value)
        depth_obsensor_index = int(self.get_parameter("depth_obsensor_index").value)
        fps = float(self.get_parameter("fps").value)
        self._color_frame_id = str(self.get_parameter("color_frame_id").value)
        self._depth_frame_id = str(self.get_parameter("depth_frame_id").value)
        self._rotate_180 = bool(self.get_parameter("rotate_180").value)
        self._publish_color_camera_info = bool(self.get_parameter("publish_color_camera_info").value)
        self._depth_alignment_mode = str(self.get_parameter("depth_alignment_mode").value)
        self._color_camera_info_source = str(self.get_parameter("color_camera_info_source").value)
        self._v4l2_depth_unit_to_mm_scale = float(self.get_parameter("v4l2_depth_unit_to_mm_scale").value)
        self._camera_model = self._load_camera_model(str(self.get_parameter("camera_matrix_file").value))

        resolved_color_device = self._resolve_color_device(requested_color_device)
        color_cap = self._open_color_capture(resolved_color_device)
        if not color_cap.isOpened():
            raise RuntimeError(f"无法打开 Orbbec 彩色设备: {resolved_color_device}")

        depth_cap, depth_backend, resolved_depth_device = self._open_depth_capture(
            requested_depth_backend,
            requested_depth_device,
            depth_obsensor_index,
        )

        self._streams = StreamState(
            color_cap=color_cap,
            depth_cap=depth_cap,
            depth_backend=depth_backend,
            color_device=resolved_color_device,
            depth_device=resolved_depth_device,
        )
        self._bridge = CvBridge()
        self._color_pub = self.create_publisher(Image, str(self.get_parameter("color_topic").value), 10)
        self._depth_pub = self.create_publisher(Image, str(self.get_parameter("depth_topic").value), 10)
        self._color_info_pub = self.create_publisher(
            CameraInfo, str(self.get_parameter("color_camera_info_topic").value), 10
        )
        self._depth_info_pub = self.create_publisher(
            CameraInfo, str(self.get_parameter("depth_camera_info_topic").value), 10
        )

        self._timer = self.create_timer(1.0 / max(fps, 1.0), self._tick)
        self.get_logger().info(
            f"Orbbec Gemini ROS bridge 已启动，color={resolved_color_device}，"
            f"depth_backend={depth_backend}，depth_device={resolved_depth_device}，fps={fps:.1f}，"
            f"rotate_180={self._rotate_180}，depth_alignment_mode={self._depth_alignment_mode}，"
            f"color_camera_info_source={self._color_camera_info_source}，"
            f"v4l2_depth_unit_to_mm_scale={self._v4l2_depth_unit_to_mm_scale:.6f}"
        )
        if self._publish_color_camera_info and self._color_camera_info_source == "copy_depth_intrinsics":
            self.get_logger().warn(
                "当前 color_camera_info 使用 depth intrinsics 显式复制；"
                "这不代表真实彩色相机标定，也不代表 color/depth 已完成像素对齐。"
            )

    def destroy_node(self) -> bool:
        try:
            self._streams.color_cap.release()
            self._streams.depth_cap.release()
        finally:
            return super().destroy_node()

    def _tick(self) -> None:
        color_ok, color = self._streams.color_cap.read()
        depth_ok, depth = self._read_depth_frame()

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

        depth_info = self._build_camera_info(depth.shape[1], depth.shape[0], stamp, self._depth_frame_id)
        self._depth_info_pub.publish(depth_info)

        if self._publish_color_camera_info:
            color_info = self._build_color_camera_info(color.shape[1], color.shape[0], stamp)
            self._color_info_pub.publish(color_info)

    def _resolve_color_device(self, requested: str) -> str:
        if requested and requested != "auto":
            return requested
        detected = self._select_v4l2_device({"YUYV", "MJPG"})
        return detected or "/dev/video8"

    def _open_color_capture(self, device: str) -> cv2.VideoCapture:
        cap = cv2.VideoCapture(device, cv2.CAP_V4L2)
        if cap.isOpened():
            return cap
        cap = cv2.VideoCapture(device)
        return cap

    def _open_depth_capture(
        self,
        requested_backend: str,
        requested_device: str,
        obsensor_index: int,
    ) -> tuple[cv2.VideoCapture, str, str]:
        backend = requested_backend.strip().lower() or "auto"
        if backend not in ("auto", "v4l2", "obsensor"):
            raise RuntimeError(f"不支持的 depth_backend: {requested_backend}")

        if backend in ("auto", "v4l2"):
            resolved_depth_device = requested_device if requested_device and requested_device != "auto" else (
                self._select_v4l2_device({"Z16"}) or "/dev/video0"
            )
            depth_cap = cv2.VideoCapture(resolved_depth_device)
            if depth_cap.isOpened():
                depth_cap.set(cv2.CAP_PROP_CONVERT_RGB, 0)
                depth_cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*"Z16 "))
                ok, depth = depth_cap.read()
                if ok and depth is not None and depth.dtype == "uint16":
                    return depth_cap, "v4l2_z16", resolved_depth_device
                depth_cap.release()
            if backend == "v4l2":
                raise RuntimeError(f"无法通过 V4L2 打开 Z16 深度设备: {resolved_depth_device}")

        depth_cap = cv2.VideoCapture(obsensor_index, cv2.CAP_OBSENSOR)
        if not depth_cap.isOpened():
            raise RuntimeError(f"无法打开 Orbbec OBSENSOR 深度设备索引: {obsensor_index}")
        return depth_cap, "obsensor", f"obsensor:{obsensor_index}"

    def _read_depth_frame(self) -> tuple[bool, Optional[object]]:
        if self._streams.depth_backend == "v4l2_z16":
            ok, depth = self._streams.depth_cap.read()
            if not ok or depth is None:
                return False, None
            if len(depth.shape) != 2 or depth.dtype != "uint16":
                return False, None
            depth = np.clip(
                depth.astype(np.float32) * self._v4l2_depth_unit_to_mm_scale,
                0.0,
                float(np.iinfo(np.uint16).max),
            ).astype(np.uint16)
            return True, depth

        depth_ok = self._streams.depth_cap.grab()
        depth = None
        if depth_ok:
            depth_ok, depth = self._streams.depth_cap.retrieve(None, cv2.CAP_OBSENSOR_DEPTH_MAP)
        if not depth_ok or depth is None:
            return False, None
        return True, depth

    def _build_camera_info(self, width: int, height: int, stamp, frame_id: str) -> CameraInfo:
        if self._camera_model is not None:
            fx = self._camera_model.fx
            fy = self._camera_model.fy
            cx = self._camera_model.cx
            cy = self._camera_model.cy
            distortion = list(self._camera_model.distortion)
        else:
            fx, fy, cx, cy = self._query_depth_intrinsics(width, height)
            distortion = [0.0, 0.0, 0.0, 0.0, 0.0]

        msg = CameraInfo()
        msg.header.stamp = stamp
        msg.header.frame_id = frame_id
        msg.width = width
        msg.height = height
        msg.distortion_model = "plumb_bob"
        msg.d = distortion
        msg.k = [fx, 0.0, cx, 0.0, fy, cy, 0.0, 0.0, 1.0]
        msg.r = [1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0]
        msg.p = [fx, 0.0, cx, 0.0, 0.0, fy, cy, 0.0, 0.0, 0.0, 1.0, 0.0]
        return msg

    def _build_color_camera_info(self, width: int, height: int, stamp) -> CameraInfo:
        if self._color_camera_info_source != "copy_depth_intrinsics":
            raise RuntimeError(
                f"当前不支持的 color_camera_info_source: {self._color_camera_info_source}"
            )
        return self._build_camera_info(width, height, stamp, self._color_frame_id)

    def _query_depth_intrinsics(self, width: int, height: int) -> tuple[float, float, float, float]:
        if self._streams.depth_backend == "obsensor":
            cap = self._streams.depth_cap
            fx = float(cap.get(cv2.CAP_PROP_OBSENSOR_INTRINSIC_FX))
            fy = float(cap.get(cv2.CAP_PROP_OBSENSOR_INTRINSIC_FY))
            cx = float(cap.get(cv2.CAP_PROP_OBSENSOR_INTRINSIC_CX))
            cy = float(cap.get(cv2.CAP_PROP_OBSENSOR_INTRINSIC_CY))
            if fx > 0.0 and fy > 0.0:
                return fx, fy, cx, cy
        return 525.0, 525.0, width / 2.0, height / 2.0

    def _load_camera_model(self, camera_matrix_file: str) -> Optional[CameraModel]:
        if not camera_matrix_file:
            return None
        path = Path(camera_matrix_file)
        if not path.is_file():
            self.get_logger().warn(f"camera_matrix_file 不存在，回退默认内参: {camera_matrix_file}")
            return None
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            matrix = data.get("k", [])
            distortion = [float(value) for value in data.get("d", [])]
            if len(matrix) < 6:
                return None
            return CameraModel(
                fx=float(matrix[0]),
                fy=float(matrix[4]),
                cx=float(matrix[2]),
                cy=float(matrix[5]),
                distortion=distortion,
            )
        except Exception as exc:  # pylint: disable=broad-except
            self.get_logger().warn(f"读取 camera_matrix_file 失败，回退默认内参: {exc}")
            return None

    def _select_v4l2_device(self, required_formats: set[str]) -> Optional[str]:
        candidates: list[tuple[int, str]] = []
        for index in range(10):
            device = f"/dev/video{index}"
            if not os.path.exists(device):
                continue
            formats = self._enumerate_v4l2_formats(device)
            if required_formats.intersection(formats):
                candidates.append((index, device))
        if not candidates:
            return None
        # 对彩色设备优先选择索引更高的 interface，当前实机上通常是 /dev/video8。
        return sorted(candidates, key=lambda item: item[0])[-1][1]

    def _enumerate_v4l2_formats(self, device: str) -> set[str]:
        try:
            fd = os.open(device, os.O_RDWR | os.O_NONBLOCK)
        except OSError:
            return set()

        formats: set[str] = set()
        try:
            index = 0
            while True:
                desc = V4L2FormatDesc()
                desc.index = index
                desc.type = V4L2_BUF_TYPE_VIDEO_CAPTURE
                try:
                    fcntl.ioctl(fd, VIDIOC_ENUM_FMT, desc)
                except OSError:
                    break
                formats.add(self._fourcc_to_str(desc.pixelformat))
                index += 1
        finally:
            os.close(fd)
        return formats

    def _fourcc_to_str(self, value: int) -> str:
        return "".join(chr((value >> (8 * offset)) & 0xFF) for offset in range(4)).strip()


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
