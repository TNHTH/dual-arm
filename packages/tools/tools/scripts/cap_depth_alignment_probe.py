#!/usr/bin/python3

from __future__ import annotations

import argparse
import ctypes
import fcntl
import json
import mmap
import os
import select
from datetime import datetime
from pathlib import Path
from typing import Any

import cv2
import numpy as np


ROOT = Path(__file__).resolve().parents[4]
DEFAULT_CAMERA_MATRIX = Path(__file__).resolve().parent / "camera_matrix.json"

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


class NativeZ16Capture:
    def __init__(self, device: str, width: int, height: int, frame_count: int, timeout_sec: float) -> None:
        self._device = device
        self._width = width
        self._height = height
        self._frame_count = max(1, frame_count)
        self._timeout_sec = timeout_sec
        self._fd: int | None = None
        self._maps: list[mmap.mmap] = []

    def capture(self) -> tuple[np.ndarray, dict[str, Any]]:
        self._fd = os.open(self._device, os.O_RDWR)
        try:
            width, height, pixfmt = self._set_format()
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
                raise RuntimeError("Z16 capture returned no frame")
            return frame, {
                "backend": "native_v4l2_mmap",
                "device": self._device,
                "width": width,
                "height": height,
                "pixelformat": fourcc_to_str(pixfmt),
                "bytesused": bytesused,
                "frames_read": self._frame_count,
            }
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

    def _set_format(self) -> tuple[int, int, int]:
        assert self._fd is not None
        fmt = V4L2Format()
        fmt.type = V4L2_BUF_TYPE_VIDEO_CAPTURE
        fmt.fmt.pix.width = self._width
        fmt.fmt.pix.height = self._height
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
            raise RuntimeError(f"{self._device} did not allocate enough V4L2 buffers")
        for index in range(int(req.count)):
            buf = V4L2Buffer()
            buf.type = V4L2_BUF_TYPE_VIDEO_CAPTURE
            buf.memory = V4L2_MEMORY_MMAP
            buf.index = index
            fcntl.ioctl(self._fd, VIDIOC_QUERYBUF, buf)
            self._maps.append(
                mmap.mmap(self._fd, int(buf.length), mmap.MAP_SHARED, mmap.PROT_READ | mmap.PROT_WRITE, offset=int(buf.m.offset))
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

    def _dequeue_frame(self, width: int, height: int) -> tuple[np.ndarray, int]:
        assert self._fd is not None
        ready, _, _ = select.select([self._fd], [], [], self._timeout_sec)
        if not ready:
            raise TimeoutError(f"{self._device} timeout waiting for Z16 frame")
        buf = V4L2Buffer()
        buf.type = V4L2_BUF_TYPE_VIDEO_CAPTURE
        buf.memory = V4L2_MEMORY_MMAP
        fcntl.ioctl(self._fd, VIDIOC_DQBUF, buf)
        mapped = self._maps[int(buf.index)]
        bytesused = int(buf.bytesused) or width * height * 2
        expected = width * height * 2
        raw = mapped[:bytesused]
        if len(raw) < expected:
            self._queue_buffer(int(buf.index))
            raise RuntimeError(f"{self._device} short Z16 frame: {len(raw)} < {expected}")
        frame = np.frombuffer(raw[:expected], dtype=np.uint16).reshape((height, width)).copy()
        self._queue_buffer(int(buf.index))
        return frame, bytesused


def main() -> int:
    parser = argparse.ArgumentParser(description="No-motion RGB/Z16 cap depth alignment probe")
    subparsers = parser.add_subparsers(dest="command", required=True)

    capture = subparsers.add_parser("capture")
    capture.add_argument("--label", required=True)
    capture.add_argument("--side", required=True, choices=["left", "right"])
    capture.add_argument("--color-device", required=True)
    capture.add_argument("--depth-device", required=True)
    capture.add_argument("--output-dir", required=True)
    capture.add_argument("--color-width", type=int, default=640)
    capture.add_argument("--color-height", type=int, default=480)
    capture.add_argument("--depth-width", type=int, default=640)
    capture.add_argument("--depth-height", type=int, default=480)
    capture.add_argument("--frames", type=int, default=5)
    capture.add_argument("--timeout-sec", type=float, default=3.0)
    capture.add_argument("--rotate-180", action="store_true")
    capture.add_argument("--depth-scale-mm-per-raw", type=float, default=1.0)
    capture.add_argument("--camera-matrix-file", default=str(DEFAULT_CAMERA_MATRIX))
    capture.add_argument("--camera-matrix-source-width", type=int, default=1280)
    capture.add_argument("--camera-matrix-source-height", type=int, default=720)

    analyze = subparsers.add_parser("analyze")
    analyze.add_argument("--capture-dir", required=True)
    analyze.add_argument("--pixel-x", type=float, required=True)
    analyze.add_argument("--pixel-y", type=float, required=True)
    analyze.add_argument("--roi-radius-px", type=int, default=8)

    args = parser.parse_args()
    if args.command == "capture":
        return run_capture(args)
    if args.command == "analyze":
        return run_analyze(args)
    raise RuntimeError(f"unknown command: {args.command}")


def run_capture(args: argparse.Namespace) -> int:
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    color, color_meta = capture_color(args)
    depth_raw, depth_meta = NativeZ16Capture(
        args.depth_device,
        args.depth_width,
        args.depth_height,
        args.frames,
        args.timeout_sec,
    ).capture()
    if args.rotate_180:
        color = cv2.rotate(color, cv2.ROTATE_180)
        depth_raw = cv2.rotate(depth_raw, cv2.ROTATE_180)

    color_path = output_dir / f"{args.label}_{args.side}_color.jpg"
    depth_npy_path = output_dir / f"{args.label}_{args.side}_depth_raw.npy"
    depth_vis_path = output_dir / f"{args.label}_{args.side}_depth_raw_vis.jpg"
    metadata_path = output_dir / f"{args.label}_{args.side}_capture.json"
    cv2.imwrite(str(color_path), color)
    np.save(str(depth_npy_path), depth_raw)
    cv2.imwrite(str(depth_vis_path), make_depth_vis(depth_raw))

    intrinsics = scaled_intrinsics(
        args.camera_matrix_file,
        args.camera_matrix_source_width,
        args.camera_matrix_source_height,
        int(depth_raw.shape[1]),
        int(depth_raw.shape[0]),
        bool(args.rotate_180),
    )
    metadata = {
        "schema_version": 1,
        "created_at": datetime.now().isoformat(timespec="seconds"),
        "mode": "no_motion_cap_depth_alignment_capture",
        "side": args.side,
        "label": args.label,
        "parameters": vars(args),
        "capture": {
            "color": color_meta,
            "depth": depth_meta,
            "rotate_180": bool(args.rotate_180),
        },
        "depth_scale": {
            "depth_scale_mm_per_raw": float(args.depth_scale_mm_per_raw),
            "status": "operator_selected_not_global_verified",
        },
        "intrinsics": intrinsics,
        "artifacts": {
            "color_snapshot": str(color_path),
            "depth_raw_npy": str(depth_npy_path),
            "depth_raw_visualization": str(depth_vis_path),
            "capture_json": str(metadata_path),
        },
        "forbidden_runtime_call_classes": [
            "robot_motion_services",
            "robot_servo_services",
            "gripper_command_services",
            "competition_run_action",
        ],
    }
    metadata_path.write_text(json.dumps(to_jsonable(metadata), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(metadata_path)
    return 0


def run_analyze(args: argparse.Namespace) -> int:
    capture_dir = Path(args.capture_dir)
    captures = sorted(capture_dir.glob("*_capture.json"))
    if len(captures) != 1:
        raise RuntimeError(f"expected exactly one *_capture.json in {capture_dir}, got {len(captures)}")
    metadata = json.loads(captures[0].read_text(encoding="utf-8"))
    depth_raw = np.load(metadata["artifacts"]["depth_raw_npy"])
    scale = float(metadata["depth_scale"]["depth_scale_mm_per_raw"])
    intrinsics = metadata["intrinsics"]["scaled"]

    x = int(round(args.pixel_x))
    y = int(round(args.pixel_y))
    radius = int(args.roi_radius_px)
    x0 = max(0, x - radius)
    y0 = max(0, y - radius)
    x1 = min(depth_raw.shape[1], x + radius + 1)
    y1 = min(depth_raw.shape[0], y + radius + 1)
    roi = depth_raw[y0:y1, x0:x1]
    valid = roi[roi > 0]
    if valid.size == 0:
        depth_stats = {"valid": False, "valid_pixel_count": 0}
        camera_point_m = None
    else:
        raw_median = float(np.median(valid))
        depth_m = raw_median * scale / 1000.0
        camera_point_m = [
            (float(args.pixel_x) - float(intrinsics["cx"])) * depth_m / float(intrinsics["fx"]),
            (float(args.pixel_y) - float(intrinsics["cy"])) * depth_m / float(intrinsics["fy"]),
            depth_m,
        ]
        depth_stats = {
            "valid": True,
            "valid_pixel_count": int(valid.size),
            "raw_min": int(np.min(valid)),
            "raw_p05": float(np.percentile(valid, 5)),
            "raw_median": raw_median,
            "raw_p95": float(np.percentile(valid, 95)),
            "raw_max": int(np.max(valid)),
            "depth_median_m": depth_m,
        }

    color = cv2.imread(metadata["artifacts"]["color_snapshot"])
    overlay_path = capture_dir / f"{metadata['label']}_{metadata['side']}_cap_pixel_overlay.jpg"
    if color is not None:
        cv2.circle(color, (x, y), max(5, radius), (0, 255, 255), 2)
        cv2.drawMarker(color, (x, y), (0, 0, 255), cv2.MARKER_CROSS, 18, 2)
        cv2.rectangle(color, (x0, y0), (max(x0, x1 - 1), max(y0, y1 - 1)), (255, 255, 0), 1)
        cv2.imwrite(str(overlay_path), color)

    analysis_path = capture_dir / f"{metadata['label']}_{metadata['side']}_cap_depth_analysis.json"
    analysis = {
        "schema_version": 1,
        "created_at": datetime.now().isoformat(timespec="seconds"),
        "mode": "no_motion_cap_depth_alignment_analysis",
        "capture_json": str(captures[0]),
        "side": metadata["side"],
        "label": metadata["label"],
        "selected_pixel": {"x": float(args.pixel_x), "y": float(args.pixel_y), "coordinate_frame": "saved_color_image"},
        "roi": {"radius_px": radius, "xyxy": [x0, y0, x1, y1]},
        "depth_stats": depth_stats,
        "camera_point_m": camera_point_m,
        "artifacts": {"pixel_overlay": str(overlay_path), "analysis_json": str(analysis_path)},
    }
    analysis_path.write_text(json.dumps(to_jsonable(analysis), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(analysis_path)
    return 0 if depth_stats.get("valid") else 2


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
            for _ in range(max(1, args.frames)):
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
            return frame, {
                "backend": backend_name,
                "device": args.color_device,
                "width": int(frame.shape[1]),
                "height": int(frame.shape[0]),
                "frames_read": frames_read,
                "fallback_errors": errors,
            }
        finally:
            cap.release()
    raise RuntimeError(f"color capture failed for {args.color_device}: {errors}")


def scaled_intrinsics(
    camera_matrix_file: str,
    source_width: int,
    source_height: int,
    width: int,
    height: int,
    rotate_180: bool,
) -> dict[str, Any]:
    path = Path(camera_matrix_file)
    if path.exists():
        data = json.loads(path.read_text(encoding="utf-8"))
        k = data.get("k") or data.get("K")
        if isinstance(k, list) and len(k) >= 6:
            sx = width / float(source_width)
            sy = height / float(source_height)
            fx = float(k[0]) * sx
            fy = float(k[4]) * sy
            cx = float(k[2]) * sx
            cy = float(k[5]) * sy
            if rotate_180:
                cx = float(width - 1) - cx
                cy = float(height - 1) - cy
            return {
                "source_file": str(path),
                "source_width": source_width,
                "source_height": source_height,
                "scaled_width": width,
                "scaled_height": height,
                "rotate_180_adjusted": rotate_180,
                "scaled": {"fx": fx, "fy": fy, "cx": cx, "cy": cy},
            }
    return {
        "source_file": str(path),
        "fallback": "pinhole_default",
        "scaled_width": width,
        "scaled_height": height,
        "rotate_180_adjusted": rotate_180,
        "scaled": {"fx": 525.0, "fy": 525.0, "cx": width / 2.0, "cy": height / 2.0},
    }


def make_depth_vis(depth: np.ndarray) -> np.ndarray:
    valid = depth[depth > 0]
    if valid.size == 0:
        return np.zeros((*depth.shape[:2], 3), dtype=np.uint8)
    lo, hi = np.percentile(valid, [2, 98])
    if hi <= lo:
        hi = lo + 1.0
    scaled = np.clip((depth.astype(np.float32) - lo) * 255.0 / (hi - lo), 0, 255).astype(np.uint8)
    return cv2.applyColorMap(scaled, cv2.COLORMAP_TURBO)


def fourcc_to_str(value: int) -> str:
    return "".join(chr((value >> (8 * offset)) & 0xFF) for offset in range(4)).strip()


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


if __name__ == "__main__":
    raise SystemExit(main())
