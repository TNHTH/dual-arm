#!/usr/bin/python3

from __future__ import annotations

import ctypes
import fcntl
import json
import mmap
import os
import select
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Optional

import cv2
import numpy as np
import rclpy
from cv_bridge import CvBridge
from rclpy.node import Node
from sensor_msgs.msg import CameraInfo, Image


VIDIOC_ENUM_FMT = 0xC0405602
VIDIOC_S_FMT = 0xC0D05605
VIDIOC_REQBUFS = 0xC0145608
VIDIOC_QUERYBUF = 0xC0585609
VIDIOC_QBUF = 0xC058560F
VIDIOC_DQBUF = 0xC0585611
VIDIOC_STREAMON = 0x40045612
VIDIOC_STREAMOFF = 0x40045613
V4L2_BUF_TYPE_VIDEO_CAPTURE = 1
V4L2_MEMORY_MMAP = 1
V4L2_FIELD_ANY = 0
V4L2_PIX_FMT_Z16 = 0x2036315A


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


class TimeVal(ctypes.Structure):
    _fields_ = [("tv_sec", ctypes.c_long), ("tv_usec", ctypes.c_long)]


class V4L2TimeCode(ctypes.Structure):
    _fields_ = [
        ("type", ctypes.c_uint32),
        ("flags", ctypes.c_uint32),
        ("frames", ctypes.c_uint8),
        ("seconds", ctypes.c_uint8),
        ("minutes", ctypes.c_uint8),
        ("hours", ctypes.c_uint8),
        ("userbits", ctypes.c_uint8 * 4),
    ]


class V4L2PixFormat(ctypes.Structure):
    _fields_ = [
        ("width", ctypes.c_uint32),
        ("height", ctypes.c_uint32),
        ("pixelformat", ctypes.c_uint32),
        ("field", ctypes.c_uint32),
        ("bytesperline", ctypes.c_uint32),
        ("sizeimage", ctypes.c_uint32),
        ("colorspace", ctypes.c_uint32),
        ("priv", ctypes.c_uint32),
        ("flags", ctypes.c_uint32),
        ("ycbcr_enc", ctypes.c_uint32),
        ("quantization", ctypes.c_uint32),
        ("xfer_func", ctypes.c_uint32),
    ]


class V4L2FormatUnion(ctypes.Union):
    _fields_ = [
        ("pix", V4L2PixFormat),
        ("raw_data", ctypes.c_uint8 * 200),
        ("align", ctypes.c_uint64),
    ]


class V4L2Format(ctypes.Structure):
    _fields_ = [("type", ctypes.c_uint32), ("fmt", V4L2FormatUnion)]


class V4L2RequestBuffers(ctypes.Structure):
    _fields_ = [
        ("count", ctypes.c_uint32),
        ("type", ctypes.c_uint32),
        ("memory", ctypes.c_uint32),
        ("capabilities", ctypes.c_uint32),
        ("flags", ctypes.c_uint32),
    ]


class V4L2BufferM(ctypes.Union):
    _fields_ = [
        ("offset", ctypes.c_uint32),
        ("userptr", ctypes.c_ulong),
        ("planes", ctypes.c_ulong),
        ("fd", ctypes.c_int32),
    ]


class V4L2Buffer(ctypes.Structure):
    _fields_ = [
        ("index", ctypes.c_uint32),
        ("type", ctypes.c_uint32),
        ("bytesused", ctypes.c_uint32),
        ("flags", ctypes.c_uint32),
        ("field", ctypes.c_uint32),
        ("timestamp", TimeVal),
        ("timecode", V4L2TimeCode),
        ("sequence", ctypes.c_uint32),
        ("memory", ctypes.c_uint32),
        ("m", V4L2BufferM),
        ("length", ctypes.c_uint32),
        ("reserved2", ctypes.c_uint32),
        ("request_fd", ctypes.c_int32),
    ]


class NativeV4L2Z16Stream:
    def __init__(self, device: str, width: int = 640, height: int = 480, timeout_sec: float = 1.0) -> None:
        self.device = device
        self._requested_width = width
        self._requested_height = height
        self._timeout_sec = timeout_sec
        self._fd: int | None = None
        self._maps: list[mmap.mmap] = []
        self.width = width
        self.height = height
        self.open()

    def open(self) -> None:
        self._fd = os.open(self.device, os.O_RDWR)
        width, height, pixfmt = self._set_format()
        if pixfmt != V4L2_PIX_FMT_Z16:
            raise RuntimeError(f"{self.device} 当前格式不是 Z16: {fourcc_to_str(pixfmt)}")
        self.width = width
        self.height = height
        self._request_buffers()
        for index in range(len(self._maps)):
            self._queue_buffer(index)
        self._stream_on()

    def release(self) -> None:
        self._stream_off()
        for item in self._maps:
            try:
                item.close()
            except Exception:
                pass
        self._maps = []
        if self._fd is not None:
            try:
                os.close(self._fd)
            except OSError:
                pass
            self._fd = None

    def read(self) -> tuple[bool, Optional[np.ndarray]]:
        if self._fd is None:
            return False, None
        try:
            ready, _, _ = select.select([self._fd], [], [], self._timeout_sec)
            if not ready:
                return False, None
            buf = V4L2Buffer()
            buf.type = V4L2_BUF_TYPE_VIDEO_CAPTURE
            buf.memory = V4L2_MEMORY_MMAP
            fcntl.ioctl(self._fd, VIDIOC_DQBUF, buf)
            mapped = self._maps[int(buf.index)]
            expected = self.width * self.height * 2
            bytesused = int(buf.bytesused) or expected
            raw = mapped[:bytesused]
            if len(raw) < expected:
                self._queue_buffer(int(buf.index))
                return False, None
            frame = np.frombuffer(raw[:expected], dtype=np.uint16).reshape((self.height, self.width)).copy()
            self._queue_buffer(int(buf.index))
            return True, frame
        except Exception:
            return False, None

    def _set_format(self) -> tuple[int, int, int]:
        assert self._fd is not None
        fmt = V4L2Format()
        fmt.type = V4L2_BUF_TYPE_VIDEO_CAPTURE
        fmt.fmt.pix.width = self._requested_width
        fmt.fmt.pix.height = self._requested_height
        fmt.fmt.pix.pixelformat = V4L2_PIX_FMT_Z16
        fmt.fmt.pix.field = V4L2_FIELD_ANY
        fcntl.ioctl(self._fd, VIDIOC_S_FMT, fmt)
        return int(fmt.fmt.pix.width), int(fmt.fmt.pix.height), int(fmt.fmt.pix.pixelformat)

    def _request_buffers(self) -> None:
        assert self._fd is not None
        req = V4L2RequestBuffers()
        req.count = 4
        req.type = V4L2_BUF_TYPE_VIDEO_CAPTURE
        req.memory = V4L2_MEMORY_MMAP
        fcntl.ioctl(self._fd, VIDIOC_REQBUFS, req)
        if req.count < 2:
            raise RuntimeError(f"{self.device} V4L2 mmap buffer 数不足: {req.count}")
        for index in range(int(req.count)):
            buf = V4L2Buffer()
            buf.type = V4L2_BUF_TYPE_VIDEO_CAPTURE
            buf.memory = V4L2_MEMORY_MMAP
            buf.index = index
            fcntl.ioctl(self._fd, VIDIOC_QUERYBUF, buf)
            self._maps.append(
                mmap.mmap(
                    self._fd,
                    int(buf.length),
                    mmap.MAP_SHARED,
                    mmap.PROT_READ | mmap.PROT_WRITE,
                    offset=int(buf.m.offset),
                )
            )

    def _queue_buffer(self, index: int) -> None:
        assert self._fd is not None
        buf = V4L2Buffer()
        buf.type = V4L2_BUF_TYPE_VIDEO_CAPTURE
        buf.memory = V4L2_MEMORY_MMAP
        buf.index = index
        fcntl.ioctl(self._fd, VIDIOC_QBUF, buf)

    def _stream_on(self) -> None:
        assert self._fd is not None
        buf_type = ctypes.c_int(V4L2_BUF_TYPE_VIDEO_CAPTURE)
        fcntl.ioctl(self._fd, VIDIOC_STREAMON, buf_type)

    def _stream_off(self) -> None:
        if self._fd is None:
            return
        buf_type = ctypes.c_int(V4L2_BUF_TYPE_VIDEO_CAPTURE)
        try:
            fcntl.ioctl(self._fd, VIDIOC_STREAMOFF, buf_type)
        except OSError:
            pass


@dataclass
class StreamState:
    color_cap: cv2.VideoCapture
    depth_cap: Optional[Any]
    depth_backend: str
    color_device: str
    depth_device: str
    shared_obsensor: bool = False


@dataclass
class CameraModel:
    fx: float
    fy: float
    cx: float
    cy: float
    distortion: list[float]


def fourcc_to_str(value: int) -> str:
    return "".join(chr((int(value) >> (8 * index)) & 0xFF) for index in range(4)).strip()


def parameter_bool(value: object) -> bool:
    if isinstance(value, str):
        return value.strip().lower() in {"1", "true", "yes", "on"}
    return bool(value)


class OrbbecGeminiRosBridge(Node):
    def __init__(self) -> None:
        super().__init__("orbbec_gemini_ros_bridge")

        self.declare_parameter("color_device", "auto")
        self.declare_parameter("depth_device", "auto")
        self.declare_parameter("depth_backend", "auto")
        self.declare_parameter("depth_obsensor_index", 0)
        self.declare_parameter("enable_depth", True)
        self.declare_parameter("fps", 15.0)
        self.declare_parameter("rotate_180", True)
        self.declare_parameter("color_topic", "/camera/color/image_raw")
        self.declare_parameter("depth_topic", "/camera/depth/image_raw")
        self.declare_parameter("color_camera_info_topic", "/camera/color/camera_info")
        self.declare_parameter("depth_camera_info_topic", "/camera/depth/camera_info")
        self.declare_parameter("color_frame_id", "left_camera_color_frame")
        self.declare_parameter("depth_frame_id", "left_camera_depth_frame")
        self.declare_parameter("publish_color_camera_info", True)
        self.declare_parameter("allow_auto_device_scan", False)
        self.declare_parameter("depth_alignment_mode", "raw_unregistered")
        self.declare_parameter("color_camera_info_source", "copy_depth_intrinsics")
        self.declare_parameter("camera_matrix_file", "")
        self.declare_parameter("v4l2_depth_unit_to_mm_scale", 0.125)

        requested_color_device = str(self.get_parameter("color_device").value)
        requested_depth_device = str(self.get_parameter("depth_device").value)
        requested_depth_backend = str(self.get_parameter("depth_backend").value)
        depth_obsensor_index = int(self.get_parameter("depth_obsensor_index").value)
        self._enable_depth = parameter_bool(self.get_parameter("enable_depth").value)
        fps = float(self.get_parameter("fps").value)
        self._color_frame_id = str(self.get_parameter("color_frame_id").value)
        self._depth_frame_id = str(self.get_parameter("depth_frame_id").value)
        self._rotate_180 = parameter_bool(self.get_parameter("rotate_180").value)
        self._publish_color_camera_info = parameter_bool(self.get_parameter("publish_color_camera_info").value)
        self._allow_auto_device_scan = parameter_bool(self.get_parameter("allow_auto_device_scan").value)
        self._depth_alignment_mode = str(self.get_parameter("depth_alignment_mode").value)
        self._color_camera_info_source = str(self.get_parameter("color_camera_info_source").value)
        self._v4l2_depth_unit_to_mm_scale = float(self.get_parameter("v4l2_depth_unit_to_mm_scale").value)
        self._camera_model = self._load_camera_model(str(self.get_parameter("camera_matrix_file").value))

        # 先尝试打开深度（obsensor 模式下 color/depth 可能共享设备）
        if self._enable_depth:
            depth_cap, depth_backend, resolved_depth_device = self._open_depth_capture(
                requested_depth_backend,
                requested_depth_device,
                depth_obsensor_index,
            )
        else:
            depth_cap = None
            depth_backend = "disabled"
            resolved_depth_device = "disabled"

        shared_obsensor = False
        if requested_color_device == "auto" and depth_backend == "obsensor" and depth_cap is not None:
            # V4L2 无法打开 Orbbec Gemini 335，直接用同一个 obsensor 设备提供彩色流
            color_cap = depth_cap
            resolved_color_device = f"obsensor:{depth_obsensor_index}"
            shared_obsensor = True
            self.get_logger().info(f"彩色流复用 OBSENSOR 设备 idx={depth_obsensor_index}")
        else:
            resolved_color_device = self._resolve_color_device(requested_color_device)
            color_cap = self._open_color_capture(resolved_color_device)
            if not color_cap.isOpened():
                if depth_backend == "obsensor" and depth_cap is not None:
                    color_cap = depth_cap
                    resolved_color_device = f"obsensor:{depth_obsensor_index}"
                    shared_obsensor = True
                    self.get_logger().warn(
                        f"V4L2 彩色设备 {resolved_color_device} 无法打开，回退到 OBSENSOR idx={depth_obsensor_index}"
                    )
                else:
                    raise RuntimeError(f"无法打开 Orbbec 彩色设备: {resolved_color_device}")

        self._streams = StreamState(
            color_cap=color_cap,
            depth_cap=depth_cap,
            depth_backend=depth_backend,
            color_device=resolved_color_device,
            depth_device=resolved_depth_device,
            shared_obsensor=shared_obsensor,
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
            if self._streams.depth_cap is not None and self._streams.depth_cap is not self._streams.color_cap:
                self._streams.depth_cap.release()
        finally:
            return super().destroy_node()

    def _tick(self) -> None:
        if self._streams.shared_obsensor:
            cap = self._streams.color_cap
            grabbed = cap.grab()
            if not grabbed:
                self.get_logger().warn("OBSENSOR grab 失败", throttle_duration_sec=2.0)
                return
            color_ok, color = cap.retrieve()
            depth_ok, depth = self._read_depth_frame() if self._enable_depth else (True, None)
        else:
            color_ok, color = self._streams.color_cap.read()
            depth_ok, depth = self._read_depth_frame() if self._enable_depth else (True, None)

        if not color_ok:
            self.get_logger().warn("读取彩色图失败", throttle_duration_sec=2.0)
            return
        if self._enable_depth and (not depth_ok or depth is None):
            self.get_logger().warn("读取深度图失败", throttle_duration_sec=2.0)
            return

        if self._rotate_180:
            color = cv2.rotate(color, cv2.ROTATE_180)
            if depth is not None:
                depth = cv2.rotate(depth, cv2.ROTATE_180)

        stamp = self.get_clock().now().to_msg()

        color_msg = self._bridge.cv2_to_imgmsg(color, encoding="bgr8")
        color_msg.header.stamp = stamp
        color_msg.header.frame_id = self._color_frame_id
        self._color_pub.publish(color_msg)

        if self._enable_depth and depth is not None:
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
        if not self._allow_auto_device_scan:
            raise RuntimeError(
                "color_device 未提供稳定设备身份，且 allow_auto_device_scan=false；"
                "production profile 必须使用 serial/usb_port/by-id/by-path。"
            )
        detected = self._select_v4l2_device({"YUYV", "MJPG"})
        if detected:
            self.get_logger().warn(
                f"auto 彩色设备发现结果 {detected} 仅作为 debug_ephemeral；"
                "production profile 应使用 serial/usb_port/by-id/by-path。"
            )
            return detected
        raise RuntimeError(
            "未提供稳定彩色设备身份，且 auto 扫描未找到设备；"
            "production profile 必须使用 serial/usb_port/by-id/by-path。"
        )

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
            if requested_device and requested_device != "auto":
                resolved_depth_device = requested_device
            else:
                if not self._allow_auto_device_scan:
                    raise RuntimeError(
                        "depth_device 未提供稳定设备身份，且 allow_auto_device_scan=false；"
                        "production profile 必须使用 serial/usb_port/by-id/by-path。"
                    )
                resolved_depth_device = self._select_v4l2_device({"Z16"})
                if resolved_depth_device:
                    self.get_logger().warn(
                        f"auto 深度设备发现结果 {resolved_depth_device} 仅作为 debug_ephemeral；"
                        "production profile 应使用 serial/usb_port/by-id/by-path。"
                    )
                elif backend == "v4l2":
                    raise RuntimeError(
                        "未提供稳定深度设备身份，且 auto 扫描未找到 Z16 设备；"
                        "production profile 必须使用 serial/usb_port/by-id/by-path。"
                    )
            if resolved_depth_device:
                depth_cap = cv2.VideoCapture(resolved_depth_device)
                if depth_cap.isOpened():
                    depth_cap.set(cv2.CAP_PROP_CONVERT_RGB, 0)
                    depth_cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*"Z16 "))
                    for _ in range(20):
                        ok, depth = depth_cap.read()
                        if ok and depth is not None and depth.dtype == "uint16":
                            return depth_cap, "v4l2_z16", resolved_depth_device
                        time.sleep(0.1)
                    depth_cap.release()
                try:
                    native_depth = NativeV4L2Z16Stream(resolved_depth_device)
                    ok, depth = native_depth.read()
                    if ok and depth is not None and depth.dtype == "uint16":
                        self.get_logger().warn(
                            f"OpenCV V4L2 无法稳定读取 {resolved_depth_device}，"
                            "已回退到 native_v4l2_mmap Z16。"
                        )
                        return native_depth, "native_v4l2_z16", resolved_depth_device
                    native_depth.release()
                except Exception as exc:  # pylint: disable=broad-except
                    self.get_logger().warn(f"native V4L2 Z16 fallback 打开失败: {exc}")
            if backend == "v4l2":
                raise RuntimeError(f"无法通过 V4L2 打开 Z16 深度设备: {resolved_depth_device}")

        depth_cap = cv2.VideoCapture(obsensor_index, cv2.CAP_OBSENSOR)
        if not depth_cap.isOpened():
            raise RuntimeError(f"无法打开 Orbbec OBSENSOR 深度设备索引: {obsensor_index}")
        return depth_cap, "obsensor", f"obsensor:{obsensor_index}"

    def _read_depth_frame(self) -> tuple[bool, Optional[object]]:
        if self._streams.depth_cap is None:
            return False, None
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

        if self._streams.depth_backend == "native_v4l2_z16":
            ok, depth = self._streams.depth_cap.read()
            if not ok or depth is None:
                return False, None
            depth = np.clip(
                depth.astype(np.float32) * self._v4l2_depth_unit_to_mm_scale,
                0.0,
                float(np.iinfo(np.uint16).max),
            ).astype(np.uint16)
            return True, depth

        # 共享 obsensor 模式下 _tick 已调用 grab()，这里只需 retrieve
        if self._streams.shared_obsensor:
            depth_ok, depth = self._streams.depth_cap.retrieve(None, cv2.CAP_OBSENSOR_DEPTH_MAP)
            if not depth_ok or depth is None:
                return False, None
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
        # auto 扫描只允许作为 debug_ephemeral 发现结果，不能写入 production profile。
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
