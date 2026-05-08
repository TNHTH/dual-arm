#!/usr/bin/python3

from __future__ import annotations

import argparse
import ctypes
import fcntl
import json
import math
import mmap
import os
import select
import sys
import time
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

import cv2
import numpy as np
import yaml


ROOT = Path(__file__).resolve().parents[4]
DEFAULT_MODEL_PATH = (
    ROOT
    / "packages/perception/detector/models/yolov8/yolo_runs/final_dataset_v1/weights/best.pt"
)
DEFAULT_CAMERA_MATRIX = Path(__file__).resolve().parent / "camera_matrix.json"
DEFAULT_STATIC_TRANSFORMS = ROOT / "packages/tools/tools/config/static_transforms.yaml"
DEFAULT_CAMERA_PROFILES = ROOT / "config/competition/camera_profiles.yaml"

VIDIOC_G_FMT = 0xC0D05604
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


@dataclass
class Detection:
    class_id: int
    class_name: str
    score: float
    xyxy: tuple[float, float, float, float]

    @property
    def center(self) -> tuple[float, float]:
        x0, y0, x1, y1 = self.xyxy
        return (0.5 * (x0 + x1), 0.5 * (y0 + y1))

    def to_dict(self) -> dict[str, Any]:
        x0, y0, x1, y1 = self.xyxy
        cx, cy = self.center
        return {
            "class_id": self.class_id,
            "class_name": self.class_name,
            "score": self.score,
            "xyxy": [x0, y0, x1, y1],
            "center_xy": [cx, cy],
            "width": x1 - x0,
            "height": y1 - y0,
        }


@dataclass
class Intrinsics:
    fx: float
    fy: float
    cx: float
    cy: float

    def to_dict(self) -> dict[str, float]:
        return {"fx": self.fx, "fy": self.fy, "cx": self.cx, "cy": self.cy}


@dataclass
class Transform:
    parent: str
    child: str
    translation_m: np.ndarray
    rpy_deg: tuple[float, float, float]
    status: str
    source: str

    def camera_point_to_tcp(self, point_camera_m: np.ndarray) -> np.ndarray:
        rotation = rpy_matrix_deg(*self.rpy_deg)
        return rotation @ point_camera_m + self.translation_m

    def to_dict(self) -> dict[str, Any]:
        return {
            "parent": self.parent,
            "child": self.child,
            "translation_m": self.translation_m.tolist(),
            "rpy_deg": list(self.rpy_deg),
            "status": self.status,
            "source": self.source,
            "semantics": "tf2 parent->child static transform; camera point to TCP uses p_tcp = R_tcp_camera @ p_camera + t_tcp_camera",
        }


class NativeZ16Capture:
    def __init__(
        self,
        device: str,
        width: int,
        height: int,
        frame_count: int,
        timeout_sec: float,
    ) -> None:
        self._device = device
        self._width = width
        self._height = height
        self._frame_count = max(1, frame_count)
        self._timeout_sec = timeout_sec
        self._fd: Optional[int] = None
        self._maps: list[mmap.mmap] = []

    def capture(self) -> tuple[np.ndarray, dict[str, Any]]:
        self._fd = os.open(self._device, os.O_RDWR)
        try:
            width, height, pixfmt = self._set_or_get_format()
            self._request_buffers()
            for index in range(len(self._maps)):
                self._queue_buffer(index)
            self._stream_on()
            frame = None
            bytesused = 0
            for _ in range(self._frame_count):
                frame, bytesused = self._dequeue_frame(width, height)
            self._stream_off()
            if frame is None:
                raise RuntimeError("V4L2 mmap 未读到 Z16 帧")
            metadata = {
                "backend": "native_v4l2_mmap",
                "device": self._device,
                "width": width,
                "height": height,
                "pixelformat": fourcc_to_str(pixfmt),
                "bytesused": bytesused,
                "frames_read": self._frame_count,
            }
            return frame, metadata
        finally:
            self.close()

    def close(self) -> None:
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

    def _set_or_get_format(self) -> tuple[int, int, int]:
        assert self._fd is not None
        fmt = V4L2Format()
        fmt.type = V4L2_BUF_TYPE_VIDEO_CAPTURE
        fmt.fmt.pix.width = self._width
        fmt.fmt.pix.height = self._height
        fmt.fmt.pix.pixelformat = V4L2_PIX_FMT_Z16
        fmt.fmt.pix.field = V4L2_FIELD_ANY
        try:
            fcntl.ioctl(self._fd, VIDIOC_S_FMT, fmt)
        except OSError:
            fcntl.ioctl(self._fd, VIDIOC_G_FMT, fmt)
        width = int(fmt.fmt.pix.width)
        height = int(fmt.fmt.pix.height)
        pixfmt = int(fmt.fmt.pix.pixelformat)
        if pixfmt != V4L2_PIX_FMT_Z16:
            raise RuntimeError(f"{self._device} 当前格式不是 Z16: {fourcc_to_str(pixfmt)}")
        return width, height, pixfmt

    def _request_buffers(self) -> None:
        assert self._fd is not None
        req = V4L2RequestBuffers()
        req.count = 4
        req.type = V4L2_BUF_TYPE_VIDEO_CAPTURE
        req.memory = V4L2_MEMORY_MMAP
        fcntl.ioctl(self._fd, VIDIOC_REQBUFS, req)
        if req.count < 2:
            raise RuntimeError(f"{self._device} V4L2 mmap buffer 数不足: {req.count}")
        for index in range(int(req.count)):
            buf = V4L2Buffer()
            buf.type = V4L2_BUF_TYPE_VIDEO_CAPTURE
            buf.memory = V4L2_MEMORY_MMAP
            buf.index = index
            fcntl.ioctl(self._fd, VIDIOC_QUERYBUF, buf)
            mapped = mmap.mmap(
                self._fd,
                int(buf.length),
                flags=mmap.MAP_SHARED,
                prot=mmap.PROT_READ | mmap.PROT_WRITE,
                offset=int(buf.m.offset),
            )
            self._maps.append(mapped)

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

    def _dequeue_frame(self, width: int, height: int) -> tuple[np.ndarray, int]:
        assert self._fd is not None
        ready, _, _ = select.select([self._fd], [], [], self._timeout_sec)
        if not ready:
            raise TimeoutError(f"{self._device} 等待 Z16 帧超时")
        buf = V4L2Buffer()
        buf.type = V4L2_BUF_TYPE_VIDEO_CAPTURE
        buf.memory = V4L2_MEMORY_MMAP
        fcntl.ioctl(self._fd, VIDIOC_DQBUF, buf)
        mapped = self._maps[int(buf.index)]
        bytesused = int(buf.bytesused) or width * height * 2
        raw = mapped[:bytesused]
        expected = width * height * 2
        if len(raw) < expected:
            self._queue_buffer(int(buf.index))
            raise RuntimeError(f"{self._device} Z16 帧长度不足: {len(raw)} < {expected}")
        frame = np.frombuffer(raw[:expected], dtype=np.uint16).reshape((height, width)).copy()
        self._queue_buffer(int(buf.index))
        return frame, bytesused


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="右臂 no-motion 视觉/深度/避障预检")
    parser.add_argument("--camera-profile", default="competition_default.right_camera")
    parser.add_argument("--camera-profiles-file", default=str(DEFAULT_CAMERA_PROFILES))
    parser.add_argument("--color-device", default="", help="debug-only alias for --color-device-override")
    parser.add_argument("--depth-device", default="", help="debug-only alias for --depth-device-override")
    parser.add_argument("--color-device-override", default="", help="debug-only ephemeral override; never verified")
    parser.add_argument("--depth-device-override", default="", help="debug-only ephemeral override; never verified")
    parser.add_argument("--color-width", type=int, default=640)
    parser.add_argument("--color-height", type=int, default=480)
    parser.add_argument("--depth-width", type=int, default=640)
    parser.add_argument("--depth-height", type=int, default=480)
    parser.add_argument("--capture-frames", type=int, default=5)
    parser.add_argument("--capture-timeout-sec", type=float, default=3.0)
    parser.add_argument("--rotate-180", dest="rotate_180", action="store_true", default=True)
    parser.add_argument("--no-rotate-180", dest="rotate_180", action="store_false")
    parser.add_argument("--model-path", default=str(DEFAULT_MODEL_PATH))
    parser.add_argument("--target-class-name", default="cocacola")
    parser.add_argument("--target-class-id", type=int, default=2)
    parser.add_argument("--confidence-threshold", type=float, default=0.35)
    parser.add_argument("--device", default="")
    parser.add_argument("--depth-scale-mm-per-raw", type=float, default=1.0)
    parser.add_argument("--min-depth-m", type=float, default=0.10)
    parser.add_argument("--max-depth-m", type=float, default=2.00)
    parser.add_argument("--target-depth-window-m", type=float, default=0.25)
    parser.add_argument("--camera-matrix-file", default=str(DEFAULT_CAMERA_MATRIX))
    parser.add_argument("--camera-matrix-source-width", type=int, default=1280)
    parser.add_argument("--camera-matrix-source-height", type=int, default=720)
    parser.add_argument("--static-transforms-file", default=str(DEFAULT_STATIC_TRANSFORMS))
    parser.add_argument(
        "--right-extrinsic-assumption",
        choices=["candidate_reference_left", "operator_confirmed_same_as_left"],
        default="candidate_reference_left",
        help="右相机到右 TCP 外参假设；operator_confirmed_same_as_left 仍不等同标定验收 verified",
    )
    parser.add_argument("--obstacle-margin-px", type=int, default=80)
    parser.add_argument("--obstacle-target-exclusion-px", type=int, default=12)
    parser.add_argument("--obstacle-depth-window-m", type=float, default=0.35)
    parser.add_argument("--support-plane-ignore-height-m", type=float, default=0.04)
    parser.add_argument("--min-clearance-m", type=float, default=0.06)
    parser.add_argument(
        "--target-alignment-mode",
        choices=["camera_center", "tcp_contact_projection", "either", "custom"],
        default="either",
        help="目标对齐门禁：画面中心、TCP/夹爪投影、二者任一通过，或自定义相机 XY 目标",
    )
    parser.add_argument("--gripper-contact-frame", default="Rend")
    parser.add_argument("--visual-center-tolerance-m", type=float, default=0.06)
    parser.add_argument("--alignment-desired-camera-xy-m", default="0.0,0.0")
    parser.add_argument("--alignment-label", default="camera_center")
    parser.add_argument("--target-pixel-margin-px", type=int, default=40)
    parser.add_argument("--max-points", type=int, default=20000)
    parser.add_argument("--output-dir", default="")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    output_dir = resolve_output_dir(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    result: dict[str, Any] = {
        "schema_version": 1,
        "created_at": datetime.now().isoformat(timespec="seconds"),
        "mode": "no_motion_depth_grasp_precheck",
        "forbidden_runtime_call_classes": [
            "right_arm_motion_services",
            "right_arm_servo_services",
            "gripper_command_services",
            "competition_run_action",
        ],
        "artifacts": {},
    }

    try:
        result["camera_fact_source"] = resolve_camera_devices(args)
        result["parameters"] = dict(vars(args))
        color, color_meta = capture_color(args)
        depth, depth_meta = capture_depth(args)
        result["capture"] = {"color": color_meta, "depth": depth_meta}

        color_path = output_dir / "right_color_snapshot.jpg"
        depth_vis_path = output_dir / "right_depth_raw_vis.jpg"
        cv2.imwrite(str(color_path), color)
        cv2.imwrite(str(depth_vis_path), make_depth_vis(depth))
        result["artifacts"].update(
            {
                "color_snapshot": str(color_path),
                "depth_raw_visualization": str(depth_vis_path),
            }
        )

        detections, model_meta = run_yolo(color, args)
        result["model"] = model_meta
        result["detections"] = [detection.to_dict() for detection in detections]
        target = choose_target_detection(detections, args)
        if target is None:
            result["safety_gate"] = fail_gate("no_target_detection", "未检测到目标类别")
            return write_result(output_dir, result, exit_code=2)

        analysis = analyze_depth_model(color, depth, target, args)
        result.update(analysis)

        annotated = draw_annotations(color, depth, target, analysis)
        annotated_path = output_dir / "right_color_depth_precheck_overlay.jpg"
        cv2.imwrite(str(annotated_path), annotated)
        result["artifacts"]["color_depth_overlay"] = str(annotated_path)

        safety_gate = build_safety_gate(analysis)
        result["safety_gate"] = safety_gate
        return write_result(output_dir, result, exit_code=0 if safety_gate["depth_model_gate"]["passes"] else 3)
    except Exception as exc:  # pylint: disable=broad-except
        result["error"] = {"type": exc.__class__.__name__, "message": str(exc)}
        result["safety_gate"] = fail_gate("exception", str(exc))
        return write_result(output_dir, result, exit_code=1)


def resolve_camera_devices(args: argparse.Namespace) -> dict[str, Any]:
    profile_name, camera_key = parse_camera_profile_ref(str(args.camera_profile))
    data = yaml.safe_load(Path(args.camera_profiles_file).read_text(encoding="utf-8"))
    profiles = data.get("profiles", {}) if isinstance(data, dict) else {}
    if not profile_name:
        profile_name = str(data.get("active_profile", "competition_default"))
    profile = profiles.get(profile_name)
    if not isinstance(profile, dict):
        raise RuntimeError(f"camera profile 不存在: {profile_name}")
    cameras = profile.get("cameras", {})
    camera = cameras.get(camera_key)
    if not isinstance(camera, dict):
        raise RuntimeError(f"camera profile 缺少 camera key: {profile_name}.{camera_key}")

    color_override = str(args.color_device_override or args.color_device or "").strip()
    depth_override = str(args.depth_device_override or args.depth_device or "").strip()
    color_profile_device = first_non_empty(camera.get("color_device_by_id"), camera.get("color_device_by_path"))
    depth_profile_device = first_non_empty(camera.get("depth_device_by_id"), camera.get("depth_device_by_path"))

    source_kind = "override" if color_override or depth_override else "profile"
    color_device = color_override or color_profile_device
    depth_device = depth_override or depth_profile_device
    if not color_device or not depth_device:
        raise RuntimeError(
            "camera profile 未提供稳定 color/depth 设备身份；"
            "生产 profile 必须使用 serial/usb_port/by-id/by-path，临时调试才可传入 override。"
        )

    args.color_device = color_device
    args.depth_device = depth_device
    args.camera_profile_name = profile_name
    args.camera_profile_key = camera_key
    args.camera_fact_source_kind = source_kind
    args.camera_override_verified = False
    args.camera_profile_calibration_status = str(camera.get("calibration_status", profile.get("calibration_status", "unverified")))
    return {
        "source_kind": source_kind,
        "profile_name": profile_name,
        "camera_key": camera_key,
        "color_device": color_device,
        "depth_device": depth_device,
        "calibration_status": args.camera_profile_calibration_status,
        "override_verified": False,
        "verified": source_kind == "profile" and args.camera_profile_calibration_status == "verified",
        "policy": "override is debug_ephemeral and never verified",
    }


def parse_camera_profile_ref(raw: str) -> tuple[str, str]:
    value = raw.strip()
    if "." in value:
        profile_name, camera_key = value.split(".", 1)
        return profile_name, camera_key
    return "", value or "right_camera"


def first_non_empty(*values: object) -> str:
    for value in values:
        text = str(value or "").strip()
        if text:
            return text
    return ""


def resolve_output_dir(raw: str) -> Path:
    if raw:
        return Path(raw)
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    return ROOT / ".codex/tmp/runtime" / f"right-arm-grasp-precheck-{stamp}"


def capture_color(args: argparse.Namespace) -> tuple[np.ndarray, dict[str, Any]]:
    attempts = [
        ("opencv_v4l2_mjpg", cv2.CAP_V4L2, "MJPG"),
        ("opencv_v4l2_yuyv", cv2.CAP_V4L2, "YUYV"),
        ("opencv_v4l2_default", cv2.CAP_V4L2, ""),
        ("opencv_default", 0, ""),
    ]
    errors: list[str] = []
    for backend_name, backend, fourcc in attempts:
        cap = cv2.VideoCapture(args.color_device, backend)
        try:
            if not cap.isOpened():
                errors.append(f"{backend_name}: open failed")
                continue
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, args.color_width)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, args.color_height)
            if fourcc:
                cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*fourcc))
            frame = None
            frames_read = 0
            for _ in range(max(1, args.capture_frames)):
                try:
                    ok, image = cap.read()
                except cv2.error as exc:
                    errors.append(f"{backend_name}: read error: {exc}")
                    ok, image = False, None
                if ok and image is not None and image.size:
                    frame = image
                    frames_read += 1
            if frame is None:
                errors.append(f"{backend_name}: no frame")
                continue
            if args.rotate_180:
                frame = cv2.rotate(frame, cv2.ROTATE_180)
            return frame, {
                "backend": backend_name,
                "device": args.color_device,
                "source_kind": getattr(args, "camera_fact_source_kind", "unknown"),
                "width": int(frame.shape[1]),
                "height": int(frame.shape[0]),
                "frames_read": frames_read,
                "rotate_180": bool(args.rotate_180),
                "fallback_errors": errors,
            }
        finally:
            cap.release()
    raise RuntimeError(f"右彩色设备未读到帧: {args.color_device}; attempts={errors}")


def capture_depth(args: argparse.Namespace) -> tuple[np.ndarray, dict[str, Any]]:
    opencv_error = ""
    cap = cv2.VideoCapture(args.depth_device, cv2.CAP_V4L2)
    try:
        if cap.isOpened():
            cap.set(cv2.CAP_PROP_CONVERT_RGB, 0)
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, args.depth_width)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, args.depth_height)
            cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*"Z16 "))
            frame = None
            frames_read = 0
            for _ in range(max(1, args.capture_frames)):
                ok, depth = cap.read()
                if ok and depth is not None and len(depth.shape) == 2 and depth.dtype == np.uint16:
                    frame = depth
                    frames_read += 1
            if frame is not None:
                if args.rotate_180:
                    frame = cv2.rotate(frame, cv2.ROTATE_180)
                return frame, {
                    "backend": "opencv_v4l2_z16",
                    "device": args.depth_device,
                    "source_kind": getattr(args, "camera_fact_source_kind", "unknown"),
                    "width": int(frame.shape[1]),
                    "height": int(frame.shape[0]),
                    "frames_read": frames_read,
                    "rotate_180": bool(args.rotate_180),
                }
            opencv_error = "OpenCV V4L2 打开成功但未返回 uint16 单通道 Z16"
        else:
            opencv_error = "OpenCV V4L2 无法打开设备"
    finally:
        cap.release()

    native = NativeZ16Capture(
        args.depth_device,
        args.depth_width,
        args.depth_height,
        args.capture_frames,
        args.capture_timeout_sec,
    )
    frame, metadata = native.capture()
    if args.rotate_180:
        frame = cv2.rotate(frame, cv2.ROTATE_180)
    metadata["opencv_fallback_reason"] = opencv_error
    metadata["rotate_180"] = bool(args.rotate_180)
    metadata["source_kind"] = getattr(args, "camera_fact_source_kind", "unknown")
    return frame, metadata


def run_yolo(frame: np.ndarray, args: argparse.Namespace) -> tuple[list[Detection], dict[str, Any]]:
    model_path = Path(args.model_path)
    if not model_path.is_file():
        raise FileNotFoundError(f"YOLO 模型不存在: {model_path}")
    try:
        import torch
        from ultralytics import YOLO
    except Exception as exc:  # pylint: disable=broad-except
        raise RuntimeError("缺少 ultralytics/torch，无法运行本地 YOLO") from exc

    device = args.device or ("cuda:0" if torch.cuda.is_available() else "cpu")
    model = YOLO(str(model_path))
    class_names = {int(index): str(name) for index, name in model.names.items()}
    results = model.predict(
        source=frame,
        conf=float(args.confidence_threshold),
        device=device,
        verbose=False,
    )
    detections: list[Detection] = []
    if results:
        boxes = results[0].boxes
        if boxes is not None:
            xyxy = boxes.xyxy.detach().cpu().numpy()
            confs = boxes.conf.detach().cpu().numpy()
            clss = boxes.cls.detach().cpu().numpy()
            for idx in range(len(xyxy)):
                class_id = int(clss[idx])
                detections.append(
                    Detection(
                        class_id=class_id,
                        class_name=class_names.get(class_id, str(class_id)),
                        score=float(confs[idx]),
                        xyxy=tuple(float(v) for v in xyxy[idx]),
                    )
                )
    return detections, {
        "model_path": str(model_path),
        "device": device,
        "confidence_threshold": float(args.confidence_threshold),
        "class_names": class_names,
    }


def choose_target_detection(detections: list[Detection], args: argparse.Namespace) -> Optional[Detection]:
    candidates = [
        item
        for item in detections
        if item.class_id == args.target_class_id or item.class_name == args.target_class_name
    ]
    if not candidates:
        return None
    return max(candidates, key=lambda item: item.score)


def analyze_depth_model(
    color: np.ndarray,
    depth_raw: np.ndarray,
    target: Detection,
    args: argparse.Namespace,
) -> dict[str, Any]:
    depth_height, depth_width = depth_raw.shape[:2]
    color_height, color_width = color.shape[:2]
    intrinsics = load_and_scale_intrinsics(args, depth_width, depth_height)
    depth_m = depth_raw.astype(np.float32) * float(args.depth_scale_mm_per_raw) / 1000.0
    valid_depth = (depth_raw > 0) & (depth_m >= args.min_depth_m) & (depth_m <= args.max_depth_m)

    depth_roi = map_bbox_to_depth_roi(target.xyxy, color_width, color_height, depth_width, depth_height)
    x0, y0, x1, y1 = depth_roi
    roi_mask = np.zeros(depth_raw.shape, dtype=bool)
    roi_mask[y0:y1, x0:x1] = True
    target_mask = roi_mask & valid_depth
    target_depth_values = depth_m[target_mask]

    target_unfiltered_points = points_from_mask(depth_m, target_mask, intrinsics, args.max_points, args.rotate_180)
    target_unfiltered_bbox = bbox_from_points(target_unfiltered_points)
    target_center_px = [0.5 * (x0 + x1), 0.5 * (y0 + y1)]
    target_depth_median = finite_percentile(target_depth_values, 50)
    target_model_mask = target_mask
    target_depth_window = None
    if target_depth_median is not None and float(args.target_depth_window_m) > 0.0:
        target_depth_window = [
            max(float(args.min_depth_m), target_depth_median - float(args.target_depth_window_m)),
            min(float(args.max_depth_m), target_depth_median + float(args.target_depth_window_m)),
        ]
        filtered_mask = target_mask & (depth_m >= target_depth_window[0]) & (depth_m <= target_depth_window[1])
        if np.count_nonzero(filtered_mask) >= max(100, int(0.05 * np.count_nonzero(target_mask))):
            target_model_mask = filtered_mask
    target_points = points_from_mask(depth_m, target_model_mask, intrinsics, args.max_points, args.rotate_180)
    target_bbox = bbox_from_points(target_points)
    camera_point = None
    if target_depth_median is not None:
        camera_point = pixel_to_camera_point(
            target_center_px[0],
            target_center_px[1],
            target_depth_median,
            intrinsics,
            args.rotate_180,
            depth_width,
            depth_height,
        )

    transform = load_reference_left_extrinsic(args.static_transforms_file, args.right_extrinsic_assumption)
    candidate_tcp_point = None
    if camera_point is not None and transform is not None:
        candidate_tcp_point = transform.camera_point_to_tcp(camera_point)

    obstacle = build_obstacle_model(
        depth_m=depth_m,
        valid_depth=valid_depth,
        target_roi=depth_roi,
        target_bbox=target_bbox,
        target_depth_median=target_depth_median,
        intrinsics=intrinsics,
        args=args,
    )

    return {
        "target_detection": target.to_dict(),
        "depth_scale": {
            "depth_scale_mm_per_raw": float(args.depth_scale_mm_per_raw),
            "interpretation": "raw depth unit is millimeter for this run",
            "status": "operator_selected_not_global_verified",
        },
        "intrinsics": {
            "source_file": str(args.camera_matrix_file),
            "source_width": int(args.camera_matrix_source_width),
            "source_height": int(args.camera_matrix_source_height),
            "scaled_width": int(depth_width),
            "scaled_height": int(depth_height),
            "scaled": intrinsics.to_dict(),
            "pixel_coordinate_note": (
                "images were rotated 180 deg for detection/display; geometry maps rotated pixels back to the original camera ray"
                if args.rotate_180
                else "images were not rotated before geometry"
            ),
        },
        "depth_roi": {
            "xyxy": [int(v) for v in depth_roi],
            "valid_pixel_count": int(target_depth_values.size),
            "target_model_pixel_count": int(np.count_nonzero(target_model_mask)),
            "target_depth_window_m": target_depth_window,
            "raw_stats": stats_for_values(depth_raw[target_mask].astype(np.float32)),
            "depth_m_stats": stats_for_values(target_depth_values.astype(np.float32)),
        },
        "target_3d_bbox_unfiltered_camera_m": target_unfiltered_bbox,
        "target_3d_bbox_camera_m": target_bbox,
        "target_center_camera_m": None if camera_point is None else camera_point.tolist(),
        "candidate_tcp_point_m": None if candidate_tcp_point is None else candidate_tcp_point.tolist(),
        "candidate_extrinsic": None if transform is None else transform.to_dict(),
        "target_alignment": build_target_alignment(
            target=target,
            camera_point=camera_point,
            color_width=color_width,
            color_height=color_height,
            args=args,
        ),
        "obstacle_model": obstacle,
    }


def build_target_alignment(
    target: Detection,
    camera_point: Optional[np.ndarray],
    color_width: int,
    color_height: int,
    args: argparse.Namespace,
) -> dict[str, Any]:
    target_center_x, target_center_y = target.center
    desired_candidates = build_alignment_desired_candidates(args)
    image_center = [0.5 * float(color_width - 1), 0.5 * float(color_height - 1)]
    pixel_offset = [float(target_center_x - image_center[0]), float(target_center_y - image_center[1])]
    x0, y0, x1, y1 = target.xyxy
    margin_px = min(float(x0), float(y0), float(color_width) - float(x1), float(color_height) - float(y1))
    margin_passes = margin_px >= float(args.target_pixel_margin_px)
    candidate_results: dict[str, Any] = {}
    for label, candidate in desired_candidates.items():
        desired_camera_xy = candidate["desired_camera_xy_m"]
        camera_xy_norm = None
        camera_offset_xy = None
        if camera_point is not None:
            camera_offset_xy = [
                float(camera_point[0]) - float(desired_camera_xy[0]),
                float(camera_point[1]) - float(desired_camera_xy[1]),
            ]
            camera_xy_norm = float(math.hypot(camera_offset_xy[0], camera_offset_xy[1]))
        center_passes = bool(
            camera_xy_norm is not None and camera_xy_norm <= float(args.visual_center_tolerance_m)
        )
        candidate_results[label] = {
            "alignment_label": label,
            "desired_camera_xy_m": desired_camera_xy,
            "source": candidate["source"],
            "camera_offset_xy_m": camera_offset_xy,
            "camera_xy_norm_m": camera_xy_norm,
            "center_passes": center_passes,
            "visible_margin_passes": bool(margin_passes),
            "passes": bool(center_passes and margin_passes),
        }
    selected_label, selected = select_alignment_candidate(candidate_results, args.target_alignment_mode)
    return {
        "image_size_px": [int(color_width), int(color_height)],
        "target_center_px": [float(target_center_x), float(target_center_y)],
        "image_center_px": image_center,
        "pixel_offset_xy": pixel_offset,
        "bbox_edge_margin_px": margin_px,
        "target_pixel_margin_threshold_px": int(args.target_pixel_margin_px),
        "target_alignment_mode": str(args.target_alignment_mode),
        "selected_alignment_label": selected_label,
        "alignment_label": selected_label,
        "desired_camera_xy_m": selected.get("desired_camera_xy_m"),
        "camera_offset_xy_m": selected.get("camera_offset_xy_m"),
        "camera_xy_norm_m": selected.get("camera_xy_norm_m"),
        "visual_center_tolerance_m": float(args.visual_center_tolerance_m),
        "alignment_candidates": candidate_results,
        "center_passes": bool(selected.get("center_passes")),
        "visible_margin_passes": bool(margin_passes),
        "passes": bool(selected.get("passes")),
        "recommendation": (
            "centered_or_tcp_aligned_for_contact_approach"
            if selected.get("passes")
            else "run_visual_center_step_before_contact_or_grasp"
        ),
    }


def build_alignment_desired_candidates(args: argparse.Namespace) -> dict[str, dict[str, Any]]:
    candidates: dict[str, dict[str, Any]] = {
        "camera_center": {
            "desired_camera_xy_m": [0.0, 0.0],
            "source": "image_center_optical_axis",
        }
    }
    tcp_projection = desired_tcp_contact_projection_camera_xy(args)
    if tcp_projection is not None:
        candidates["tcp_contact_projection"] = {
            "desired_camera_xy_m": tcp_projection,
            "source": (
                f"{args.static_transforms_file}: "
                f"right gripper contact frame {args.gripper_contact_frame} minus reused Ltcp->camera_link offset"
            ),
        }
    custom_xy = (
        parse_float_list(args.alignment_desired_camera_xy_m, 2)
        if str(args.alignment_desired_camera_xy_m).strip()
        else [0.0, 0.0]
    )
    if str(args.target_alignment_mode) == "custom" or custom_xy != [0.0, 0.0]:
        candidates["custom"] = {
            "desired_camera_xy_m": custom_xy,
            "source": f"operator_parameter:{args.alignment_label}",
        }
    return candidates


def desired_tcp_contact_projection_camera_xy(args: argparse.Namespace) -> Optional[list[float]]:
    camera_offset = load_transform_translation(args.static_transforms_file, "Ltcp", "camera_link")
    contact_offset = load_transform_translation(args.static_transforms_file, "Rtcp", args.gripper_contact_frame)
    if camera_offset is None or contact_offset is None:
        return None
    desired = contact_offset - camera_offset
    return [float(desired[0]), float(desired[1])]


def select_alignment_candidate(
    candidates: dict[str, Any],
    mode: str,
) -> tuple[str, dict[str, Any]]:
    if not candidates:
        return "missing", {}
    if mode == "either":
        for label in ("camera_center", "tcp_contact_projection"):
            candidate = candidates.get(label)
            if candidate and candidate.get("passes"):
                return label, candidate
        ranked = [
            (float(value.get("camera_xy_norm_m")), key, value)
            for key, value in candidates.items()
            if value.get("camera_xy_norm_m") is not None
        ]
        if ranked:
            _, label, candidate = min(ranked, key=lambda item: item[0])
            return label, candidate
        label = next(iter(candidates))
        return label, candidates[label]
    if mode in candidates:
        return mode, candidates[mode]
    if mode == "custom" and "custom" in candidates:
        return "custom", candidates["custom"]
    label = next(iter(candidates))
    return label, candidates[label]


def parse_float_list(raw: str, count: int) -> list[float]:
    values = [float(item.strip()) for item in str(raw).split(",") if item.strip()]
    if len(values) != count:
        raise ValueError(f"参数数量错误: expected={count}, actual={len(values)}, raw={raw}")
    return values


def load_transform_translation(static_transforms_file: str, parent: str, child: str) -> Optional[np.ndarray]:
    path = Path(static_transforms_file)
    if not path.is_file():
        return None
    try:
        import yaml

        data = yaml.safe_load(path.read_text(encoding="utf-8"))
    except Exception:
        data = parse_static_transform_yaml_fallback(path)
    for item in data.get("transforms", []):
        frames = item.get("frames", {})
        if frames.get("parent") == parent and frames.get("child") == child:
            trans = item.get("translation", {})
            return np.array(
                [float(trans.get("x", 0.0)), float(trans.get("y", 0.0)), float(trans.get("z", 0.0))],
                dtype=np.float64,
            )
    return None



def load_and_scale_intrinsics(args: argparse.Namespace, width: int, height: int) -> Intrinsics:
    path = Path(args.camera_matrix_file)
    if path.is_file():
        data = json.loads(path.read_text(encoding="utf-8"))
        matrix = data.get("k", [])
        if len(matrix) >= 6:
            sx = width / float(args.camera_matrix_source_width)
            sy = height / float(args.camera_matrix_source_height)
            return Intrinsics(
                fx=float(matrix[0]) * sx,
                fy=float(matrix[4]) * sy,
                cx=float(matrix[2]) * sx,
                cy=float(matrix[5]) * sy,
            )
    return Intrinsics(fx=525.0, fy=525.0, cx=width / 2.0, cy=height / 2.0)


def map_bbox_to_depth_roi(
    xyxy: tuple[float, float, float, float],
    color_width: int,
    color_height: int,
    depth_width: int,
    depth_height: int,
) -> tuple[int, int, int, int]:
    x0, y0, x1, y1 = xyxy
    sx = depth_width / max(1.0, float(color_width))
    sy = depth_height / max(1.0, float(color_height))
    dx0 = clamp_int(math.floor(x0 * sx), 0, depth_width - 1)
    dy0 = clamp_int(math.floor(y0 * sy), 0, depth_height - 1)
    dx1 = clamp_int(math.ceil(x1 * sx), dx0 + 1, depth_width)
    dy1 = clamp_int(math.ceil(y1 * sy), dy0 + 1, depth_height)
    return dx0, dy0, dx1, dy1


def points_from_mask(
    depth_m: np.ndarray,
    mask: np.ndarray,
    intrinsics: Intrinsics,
    max_points: int,
    rotate_180: bool = False,
) -> np.ndarray:
    ys, xs = np.nonzero(mask)
    if xs.size == 0:
        return np.empty((0, 3), dtype=np.float32)
    if xs.size > max_points:
        step = int(math.ceil(xs.size / max_points))
        xs = xs[::step]
        ys = ys[::step]
    z = depth_m[ys, xs]
    ray_xs = xs.astype(np.float32)
    ray_ys = ys.astype(np.float32)
    if rotate_180:
        height, width = depth_m.shape[:2]
        ray_xs = (float(width - 1) - ray_xs).astype(np.float32)
        ray_ys = (float(height - 1) - ray_ys).astype(np.float32)
    x = (ray_xs - intrinsics.cx) / intrinsics.fx * z
    y = (ray_ys - intrinsics.cy) / intrinsics.fy * z
    return np.stack([x, y, z], axis=1).astype(np.float32)


def pixel_to_camera_point(
    u: float,
    v: float,
    z_m: float,
    intrinsics: Intrinsics,
    rotate_180: bool = False,
    width: int = 0,
    height: int = 0,
) -> np.ndarray:
    ray_u = float(u)
    ray_v = float(v)
    if rotate_180:
        if width <= 0 or height <= 0:
            raise ValueError("rotate_180 geometry requires image width and height")
        ray_u = float(width - 1) - ray_u
        ray_v = float(height - 1) - ray_v
    return np.array(
        [
            (ray_u - intrinsics.cx) / intrinsics.fx * z_m,
            (ray_v - intrinsics.cy) / intrinsics.fy * z_m,
            z_m,
        ],
        dtype=np.float64,
    )


def bbox_from_points(points: np.ndarray) -> dict[str, Any]:
    if points.size == 0:
        return {"valid": False, "point_count": 0, "min_xyz": None, "max_xyz": None, "center_xyz": None}
    min_xyz = np.min(points, axis=0)
    max_xyz = np.max(points, axis=0)
    return {
        "valid": True,
        "point_count": int(points.shape[0]),
        "min_xyz": min_xyz.astype(float).tolist(),
        "max_xyz": max_xyz.astype(float).tolist(),
        "center_xyz": ((min_xyz + max_xyz) * 0.5).astype(float).tolist(),
        "size_xyz": (max_xyz - min_xyz).astype(float).tolist(),
    }


def build_obstacle_model(
    depth_m: np.ndarray,
    valid_depth: np.ndarray,
    target_roi: tuple[int, int, int, int],
    target_bbox: dict[str, Any],
    target_depth_median: Optional[float],
    intrinsics: Intrinsics,
    args: argparse.Namespace,
) -> dict[str, Any]:
    height, width = depth_m.shape[:2]
    x0, y0, x1, y1 = target_roi
    margin = max(0, int(args.obstacle_margin_px))
    wx0 = clamp_int(x0 - margin, 0, width - 1)
    wy0 = clamp_int(y0 - margin, 0, height - 1)
    wx1 = clamp_int(x1 + margin, wx0 + 1, width)
    wy1 = clamp_int(y1 + margin, wy0 + 1, height)
    window = np.zeros(depth_m.shape, dtype=bool)
    window[wy0:wy1, wx0:wx1] = True
    exclusion = max(0, int(args.obstacle_target_exclusion_px))
    ex0 = clamp_int(x0 - exclusion, 0, width - 1)
    ey0 = clamp_int(y0 - exclusion, 0, height - 1)
    ex1 = clamp_int(x1 + exclusion, ex0 + 1, width)
    ey1 = clamp_int(y1 + exclusion, ey0 + 1, height)
    exclude = np.zeros(depth_m.shape, dtype=bool)
    exclude[ey0:ey1, ex0:ex1] = True
    obstacle_candidates = window & (~exclude) & valid_depth
    if target_depth_median is not None:
        obstacle_candidates &= np.abs(depth_m - target_depth_median) <= float(args.obstacle_depth_window_m)
    support_depth_m = finite_percentile(depth_m[obstacle_candidates], 75)
    obstacle_mask = obstacle_candidates.copy()
    if support_depth_m is not None and float(args.support_plane_ignore_height_m) > 0.0:
        # 右相机为俯视候选姿态时，桌面/支撑平面通常比瓶身更远。
        # 只把明显“更靠近相机”的邻域点当成独立障碍物，避免把支撑桌面误判为碰撞物。
        obstacle_mask &= depth_m <= support_depth_m - float(args.support_plane_ignore_height_m)
    obstacle_points = points_from_mask(depth_m, obstacle_mask, intrinsics, args.max_points, args.rotate_180)
    obstacle_bbox = bbox_from_points(obstacle_points)
    min_distance = None
    if target_bbox.get("valid") and obstacle_points.size:
        min_distance = distance_points_to_bbox(obstacle_points, target_bbox)
    clearance_passes = (
        bool(target_bbox.get("valid"))
        and (min_distance is None or min_distance >= float(args.min_clearance_m))
    )
    return {
        "search_window_xyxy": [wx0, wy0, wx1, wy1],
        "target_exclusion_xyxy": [ex0, ey0, ex1, ey1],
        "support_plane_depth_estimate_m": support_depth_m,
        "support_plane_ignore_height_m": float(args.support_plane_ignore_height_m),
        "depth_window_m": None if target_depth_median is None else [
            max(float(args.min_depth_m), target_depth_median - float(args.obstacle_depth_window_m)),
            min(float(args.max_depth_m), target_depth_median + float(args.obstacle_depth_window_m)),
        ],
        "valid_obstacle_candidate_pixel_count": int(np.count_nonzero(obstacle_candidates)),
        "valid_obstacle_pixel_count": int(np.count_nonzero(obstacle_mask)),
        "obstacle_3d_bbox_camera_m": obstacle_bbox,
        "obstacle_min_distance_m": min_distance,
        "clearance_gate": {
            "passes": bool(clearance_passes),
            "threshold_m": float(args.min_clearance_m),
            "reason": "clearance_ok" if clearance_passes else "obstacle_too_close_or_target_invalid",
        },
    }


def distance_points_to_bbox(points: np.ndarray, bbox: dict[str, Any]) -> float:
    min_xyz = np.array(bbox["min_xyz"], dtype=np.float32)
    max_xyz = np.array(bbox["max_xyz"], dtype=np.float32)
    below = np.maximum(min_xyz - points, 0.0)
    above = np.maximum(points - max_xyz, 0.0)
    delta = below + above
    distances = np.linalg.norm(delta, axis=1)
    return float(np.min(distances))


def stats_for_values(values: np.ndarray) -> dict[str, Any]:
    if values.size == 0:
        return {"valid": False, "count": 0}
    percentiles = np.percentile(values, [5, 25, 50, 75, 95])
    return {
        "valid": True,
        "count": int(values.size),
        "min": float(np.min(values)),
        "p05": float(percentiles[0]),
        "p25": float(percentiles[1]),
        "median": float(percentiles[2]),
        "p75": float(percentiles[3]),
        "p95": float(percentiles[4]),
        "max": float(np.max(values)),
        "mean": float(np.mean(values)),
    }


def finite_percentile(values: np.ndarray, percentile: float) -> Optional[float]:
    if values.size == 0:
        return None
    return float(np.percentile(values, percentile))


def build_safety_gate(analysis: dict[str, Any]) -> dict[str, Any]:
    depth_roi = analysis["depth_roi"]
    target_bbox = analysis["target_3d_bbox_camera_m"]
    obstacle_model = analysis["obstacle_model"]
    candidate_extrinsic = analysis.get("candidate_extrinsic")
    depth_model_passes = bool(depth_roi["depth_m_stats"].get("valid")) and bool(target_bbox.get("valid"))
    clearance_gate = obstacle_model["clearance_gate"]
    extrinsic_status = candidate_extrinsic.get("status") if candidate_extrinsic else ""
    extrinsic_verified = bool(extrinsic_status == "verified")
    extrinsic_available_for_jog_context = bool(
        extrinsic_status in ("candidate/reference_left_extrinsic", "operator_confirmed_same_as_left_not_calibration_verified")
    )
    passes = depth_model_passes and bool(clearance_gate["passes"]) and extrinsic_verified
    reasons: list[str] = []
    if not depth_model_passes:
        reasons.append("target_depth_model_invalid")
    if not clearance_gate["passes"]:
        reasons.append(clearance_gate["reason"])
    if not extrinsic_verified:
        reasons.append("right_camera_to_right_tcp_extrinsic_not_verified")
    return {
        "passes": bool(passes),
        "auto_grasp_allowed": bool(passes),
        "depth_model_gate": {
            "passes": bool(depth_model_passes),
            "reason": "target_3d_bbox_valid" if depth_model_passes else "target_3d_bbox_invalid",
        },
        "clearance_gate": clearance_gate,
        "extrinsic_gate": {
            "passes": bool(extrinsic_verified),
            "available_for_scripted_candidate_geometry": extrinsic_available_for_jog_context,
            "reason": "verified" if extrinsic_verified else "not_calibration_verified",
        },
        "motion_recommendation": (
            "auto_grasp_allowed"
            if passes
            else "fail_closed_for_auto_grasp_safe_direction_jog_only"
        ),
        "reasons": reasons,
    }


def fail_gate(reason: str, message: str) -> dict[str, Any]:
    return {
        "passes": False,
        "auto_grasp_allowed": False,
        "depth_model_gate": {"passes": False, "reason": reason},
        "clearance_gate": {"passes": False, "reason": reason},
        "extrinsic_gate": {"passes": False, "reason": "not_evaluated"},
        "motion_recommendation": "fail_closed_no_auto_grasp",
        "reasons": [reason],
        "message": message,
    }


def load_reference_left_extrinsic(static_transforms_file: str, assumption: str) -> Optional[Transform]:
    path = Path(static_transforms_file)
    if not path.is_file():
        return None
    data: Any
    try:
        import yaml

        data = yaml.safe_load(path.read_text(encoding="utf-8"))
    except Exception:
        data = parse_static_transform_yaml_fallback(path)
    for item in data.get("transforms", []):
        frames = item.get("frames", {})
        if frames.get("parent") == "Ltcp" and frames.get("child") == "camera_link":
            trans = item.get("translation", {})
            rot = item.get("rotation", {})
            return Transform(
                parent="right_tcp",
                child="right_camera_link_candidate",
                translation_m=np.array(
                    [float(trans.get("x", 0.0)), float(trans.get("y", 0.0)), float(trans.get("z", 0.0))],
                    dtype=np.float64,
                ),
                rpy_deg=(
                    float(rot.get("roll", 0.0)),
                    float(rot.get("pitch", 0.0)),
                    float(rot.get("yaw", 0.0)),
                ),
                status=(
                    "operator_confirmed_same_as_left_not_calibration_verified"
                    if assumption == "operator_confirmed_same_as_left"
                    else "candidate/reference_left_extrinsic"
                ),
                source=(
                    f"{path}: Ltcp->camera_link reused for right_tcp->right_camera; "
                    f"assumption={assumption}; not a calibration verification"
                ),
            )
    return None


def parse_static_transform_yaml_fallback(path: Path) -> dict[str, Any]:
    transforms: list[dict[str, Any]] = []
    current: dict[str, Any] = {}
    section = ""
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("- frames:"):
            if current:
                transforms.append(current)
            current = {"frames": {}, "translation": {}, "rotation": {}}
            section = "frames"
            continue
        if line in ("frames:", "translation:", "rotation:"):
            section = line[:-1]
            continue
        if ":" not in line or not current:
            continue
        key, value = [part.strip() for part in line.split(":", 1)]
        value = value.split("#", 1)[0].strip()
        if section == "frames":
            current["frames"][key] = value
        elif section in ("translation", "rotation"):
            current[section][key] = float(value)
    if current:
        transforms.append(current)
    return {"transforms": transforms}


def rpy_matrix_deg(roll_deg: float, pitch_deg: float, yaw_deg: float) -> np.ndarray:
    roll = math.radians(roll_deg)
    pitch = math.radians(pitch_deg)
    yaw = math.radians(yaw_deg)
    cr, sr = math.cos(roll), math.sin(roll)
    cp, sp = math.cos(pitch), math.sin(pitch)
    cy, sy = math.cos(yaw), math.sin(yaw)
    rx = np.array([[1, 0, 0], [0, cr, -sr], [0, sr, cr]], dtype=np.float64)
    ry = np.array([[cp, 0, sp], [0, 1, 0], [-sp, 0, cp]], dtype=np.float64)
    rz = np.array([[cy, -sy, 0], [sy, cy, 0], [0, 0, 1]], dtype=np.float64)
    return rz @ ry @ rx


def make_depth_vis(depth: np.ndarray) -> np.ndarray:
    valid = depth[depth > 0]
    if valid.size == 0:
        return np.zeros((*depth.shape[:2], 3), dtype=np.uint8)
    lo, hi = np.percentile(valid, [2, 98])
    if hi <= lo:
        hi = lo + 1.0
    scaled = np.clip((depth.astype(np.float32) - lo) * 255.0 / (hi - lo), 0, 255).astype(np.uint8)
    return cv2.applyColorMap(scaled, cv2.COLORMAP_TURBO)


def draw_annotations(
    color: np.ndarray,
    depth: np.ndarray,
    target: Detection,
    analysis: dict[str, Any],
) -> np.ndarray:
    annotated = color.copy()
    x0, y0, x1, y1 = [int(round(v)) for v in target.xyxy]
    cv2.rectangle(annotated, (x0, y0), (x1, y1), (0, 255, 0), 2)
    label = f"{target.class_name} {target.score:.2f}"
    cv2.putText(annotated, label, (x0, max(20, y0 - 8)), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 255, 0), 1)
    depth_roi = analysis["depth_roi"]["xyxy"]
    cv2.putText(
        annotated,
        f"depth_roi={depth_roi}",
        (12, 24),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.55,
        (255, 255, 255),
        1,
        cv2.LINE_AA,
    )
    obstacle = analysis["obstacle_model"]
    cv2.putText(
        annotated,
        f"obstacle_px={obstacle['valid_obstacle_pixel_count']} clearance={obstacle['clearance_gate']['passes']}",
        (12, 48),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.55,
        (255, 255, 255),
        1,
        cv2.LINE_AA,
    )
    return annotated


def write_result(output_dir: Path, result: dict[str, Any], exit_code: int) -> int:
    output_path = output_dir / "right_arm_grasp_precheck.json"
    result["artifacts"]["json"] = str(output_path)
    output_path.write_text(json.dumps(to_jsonable(result), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(str(output_path))
    return exit_code


def to_jsonable(value: Any) -> Any:
    if isinstance(value, np.ndarray):
        return value.tolist()
    if isinstance(value, np.generic):
        return value.item()
    if isinstance(value, dict):
        return {str(key): to_jsonable(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [to_jsonable(item) for item in value]
    return value


def clamp_int(value: int, low: int, high: int) -> int:
    return max(low, min(high, value))


def fourcc_to_str(value: int) -> str:
    return "".join(chr((value >> (8 * offset)) & 0xFF) for offset in range(4)).strip()


if __name__ == "__main__":
    raise SystemExit(main())
