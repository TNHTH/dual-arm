#!/usr/bin/python3

from __future__ import annotations

import argparse
import json
import math
import time
from datetime import datetime
from pathlib import Path
from typing import Any

import cv2
import numpy as np

import right_arm_grasp_precheck as precheck


ROOT = Path(__file__).resolve().parents[4]
DEFAULT_CAMERA_MATRIX = precheck.DEFAULT_CAMERA_MATRIX


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="No-motion depth-camera table height probe")
    parser.add_argument("--side", choices=["left", "right"], required=True)
    parser.add_argument("--color-device", default="")
    parser.add_argument("--color-topic", default="")
    parser.add_argument("--depth-device", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--color-width", type=int, default=640)
    parser.add_argument("--color-height", type=int, default=480)
    parser.add_argument("--depth-width", type=int, default=640)
    parser.add_argument("--depth-height", type=int, default=480)
    parser.add_argument("--capture-frames", type=int, default=5)
    parser.add_argument("--capture-timeout-sec", type=float, default=3.0)
    parser.add_argument("--ros-color-timeout-sec", type=float, default=5.0)
    parser.add_argument("--rotate-180", action="store_true")
    parser.add_argument("--depth-scale-mm-per-raw", type=float, default=1.0)
    parser.add_argument("--min-depth-m", type=float, default=0.10)
    parser.add_argument("--max-depth-m", type=float, default=2.00)
    parser.add_argument("--camera-matrix-file", default=str(DEFAULT_CAMERA_MATRIX))
    parser.add_argument("--camera-matrix-source-width", type=int, default=1280)
    parser.add_argument("--camera-matrix-source-height", type=int, default=720)
    parser.add_argument("--roi-x-frac", default="0.06,0.94")
    parser.add_argument("--roi-y-frac", default="0.30,0.96")
    parser.add_argument("--ransac-threshold-m", type=float, default=0.012)
    parser.add_argument("--ransac-iterations", type=int, default=900)
    parser.add_argument("--max-fit-points", type=int, default=30000)
    parser.add_argument("--min-inliers", type=int, default=2000)
    parser.add_argument("--min-inlier-ratio", type=float, default=0.35)
    parser.add_argument("--safety-margin-m", type=float, default=0.050)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    output_dir = Path(args.output_dir).expanduser().resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    result: dict[str, Any] = {
        "schema_version": 1,
        "created_at": datetime.now().isoformat(timespec="seconds"),
        "mode": "no_motion_depth_table_height_probe",
        "side": args.side,
        "status": "in_progress",
        "forbidden_runtime_call_classes": [
            "robot_motion_services",
            "robot_servo_services",
            "gripper_command_services",
            "competition_run_action",
        ],
        "artifacts": {},
    }

    try:
        color, color_meta = capture_color_optional(args)
        depth_raw, depth_meta = precheck.capture_depth(args)
        color_path = output_dir / f"{args.side}_table_probe_color.jpg"
        depth_raw_path = output_dir / f"{args.side}_table_probe_depth_raw.npy"
        depth_vis_path = output_dir / f"{args.side}_table_probe_depth_vis.jpg"
        overlay_path = output_dir / f"{args.side}_table_probe_overlay.jpg"
        json_path = output_dir / f"{args.side}_table_height_probe.json"

        if color is not None:
            cv2.imwrite(str(color_path), color)
            result["artifacts"]["color"] = str(color_path)
        np.save(depth_raw_path, depth_raw)
        cv2.imwrite(str(depth_vis_path), precheck.make_depth_vis(depth_raw))
        result["artifacts"].update(
            {
                "depth_raw_npy": str(depth_raw_path),
                "depth_raw_visualization": str(depth_vis_path),
                "overlay": str(overlay_path),
                "json": str(json_path),
            }
        )
        result["capture"] = {"color": color_meta, "depth": depth_meta}

        analysis = analyze_table_plane(depth_raw, color, args)
        result["analysis"] = json_safe_analysis(analysis)
        overlay = draw_overlay(depth_raw, color, analysis)
        cv2.imwrite(str(overlay_path), overlay)

        passes = bool(
            analysis["plane_fit"]["valid"]
            and analysis["plane_fit"]["inlier_count"] >= int(args.min_inliers)
            and analysis["plane_fit"]["inlier_ratio"] >= float(args.min_inlier_ratio)
        )
        result["calibration_candidate"] = {
            "status": "candidate_not_world_verified" if passes else "failed",
            "frame_id": f"{args.side}_camera_depth_frame",
            "table_plane_camera_frame": analysis["plane_camera_frame"],
            "table_center_camera_m": analysis["table_center_camera_m"],
            "camera_to_table_perpendicular_distance_m": analysis["plane_camera_frame"][
                "perpendicular_distance_m"
            ],
            "depth_scale_status": "operator_selected_not_global_verified",
            "world_height_m": None,
            "world_height_status": "unavailable_without_verified_camera_to_world_tf",
        }
        result["motion_safety_gate"] = {
            "passes": False,
            "motion_allowed": False,
            "reason": "table_height_is_camera_frame_candidate_only",
            "required_before_motion": [
                "verified camera_to_world or camera_to_robot_base transform",
                "fresh robot_state motion_done=true error_code=0",
                "planner table_surface collision object confirmed",
                f"planned TCP/object path stays at least {float(args.safety_margin_m):.3f} m above table plane",
            ],
        }
        result["status"] = "completed_candidate_no_motion" if passes else "failed_plane_fit"
        json_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
        print(json_path)
        return 0 if passes else 2
    except Exception as exc:  # pylint: disable=broad-except
        result["status"] = "failed"
        result["error"] = {"type": exc.__class__.__name__, "message": str(exc)}
        result["motion_safety_gate"] = {
            "passes": False,
            "motion_allowed": False,
            "reason": "probe_failed",
        }
        json_path = output_dir / f"{args.side}_table_height_probe.json"
        json_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
        print(json_path)
        return 1


def capture_color_optional(args: argparse.Namespace) -> tuple[np.ndarray | None, dict[str, Any]]:
    if args.color_topic.strip():
        return capture_color_from_ros_topic(args)
    if not args.color_device.strip():
        return None, {"backend": "none", "reason": "color input not requested"}
    try:
        return precheck.capture_color(args)
    except Exception as exc:  # pylint: disable=broad-except
        return None, {"backend": "failed_optional_color", "message": str(exc)}


def capture_color_from_ros_topic(args: argparse.Namespace) -> tuple[np.ndarray, dict[str, Any]]:
    try:
        import rclpy
        from rclpy.qos import qos_profile_sensor_data
        from sensor_msgs.msg import Image
    except Exception as exc:  # pylint: disable=broad-except
        raise RuntimeError("缺少 rclpy/sensor_msgs，无法读取 ROS 彩色图像话题") from exc

    holder: dict[str, Any] = {"message": None}
    rclpy.init(args=None)
    node = None
    topic = args.color_topic.strip()
    try:
        node = rclpy.create_node(f"table_height_probe_{int(time.time() * 1000)}")
        node.create_subscription(
            Image,
            topic,
            lambda message: holder.__setitem__("message", message),
            qos_profile_sensor_data,
        )
        deadline = time.monotonic() + float(args.ros_color_timeout_sec)
        while rclpy.ok() and holder["message"] is None and time.monotonic() < deadline:
            rclpy.spin_once(node, timeout_sec=0.1)
    finally:
        if node is not None:
            node.destroy_node()
        rclpy.shutdown()

    message = holder["message"]
    if message is None:
        raise TimeoutError(f"等待 ROS 彩色图像超时: {topic}")
    frame = ros_image_to_bgr(message)
    return frame, {
        "backend": "ros2_topic",
        "topic": topic,
        "width": int(frame.shape[1]),
        "height": int(frame.shape[0]),
        "encoding": str(message.encoding),
        "frame_id": str(message.header.frame_id),
        "stamp": {"sec": int(message.header.stamp.sec), "nanosec": int(message.header.stamp.nanosec)},
    }


def ros_image_to_bgr(message: Any) -> np.ndarray:
    encoding = str(message.encoding).lower()
    data = np.frombuffer(message.data, dtype=np.uint8)
    if encoding == "bgr8":
        return data.reshape((message.height, message.width, 3)).copy()
    if encoding == "rgb8":
        rgb = data.reshape((message.height, message.width, 3))
        return cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    raise RuntimeError(f"不支持的 ROS 彩色图像编码: {message.encoding}")


def analyze_table_plane(depth_raw: np.ndarray, color: np.ndarray | None, args: argparse.Namespace) -> dict[str, Any]:
    depth_m = depth_raw.astype(np.float32) * float(args.depth_scale_mm_per_raw) / 1000.0
    valid = (depth_raw > 0) & np.isfinite(depth_m) & (depth_m >= args.min_depth_m) & (depth_m <= args.max_depth_m)
    roi_mask, roi_xyxy = make_roi_mask(depth_raw.shape[:2], args)
    candidate_mask = valid & roi_mask
    intrinsics = precheck.load_and_scale_intrinsics(args, depth_raw.shape[1], depth_raw.shape[0])
    points, pixels = points_from_mask(depth_m, candidate_mask, intrinsics, int(args.max_fit_points))
    plane = fit_plane_ransac(points, float(args.ransac_threshold_m), int(args.ransac_iterations))
    if plane is None:
        return {
            "plane_fit": {"valid": False, "reason": "insufficient_points", "candidate_count": int(len(points))},
            "roi_xyxy": roi_xyxy,
        }

    normal, d, inlier_mask, distances = plane
    if normal[2] > 0.0:
        normal = -normal
        d = -d
    inlier_points = points[inlier_mask]
    inlier_pixels = pixels[inlier_mask]
    center = np.median(inlier_points, axis=0)
    residuals = distances[inlier_mask]
    size = np.percentile(inlier_points, 95, axis=0) - np.percentile(inlier_points, 5, axis=0)
    plane_mask = np.zeros(depth_raw.shape[:2], dtype=bool)
    plane_mask[inlier_pixels[:, 1], inlier_pixels[:, 0]] = True
    color_stats = color_summary(color, plane_mask) if color is not None else None
    return {
        "roi_xyxy": roi_xyxy,
        "depth_scale": {
            "depth_scale_mm_per_raw": float(args.depth_scale_mm_per_raw),
            "status": "operator_selected_not_global_verified",
        },
        "intrinsics": {
            "fx": float(intrinsics.fx),
            "fy": float(intrinsics.fy),
            "cx": float(intrinsics.cx),
            "cy": float(intrinsics.cy),
            "source_file": str(args.camera_matrix_file),
        },
        "plane_fit": {
            "valid": True,
            "candidate_count": int(len(points)),
            "inlier_count": int(np.count_nonzero(inlier_mask)),
            "inlier_ratio": float(np.count_nonzero(inlier_mask) / max(len(points), 1)),
            "ransac_threshold_m": float(args.ransac_threshold_m),
            "median_residual_m": float(np.median(residuals)),
            "p95_residual_m": float(np.percentile(residuals, 95)),
        },
        "plane_camera_frame": {
            "equation": "normal.dot(point_m) + d = 0",
            "normal": [float(v) for v in normal],
            "d_m": float(d),
            "perpendicular_distance_m": float(abs(d)),
        },
        "table_center_camera_m": [float(v) for v in center],
        "table_extent_p05_p95_m": [float(v) for v in size],
        "table_center_depth_m": float(center[2]),
        "color_stats_on_inliers": color_stats,
        "plane_mask": plane_mask,
    }


def make_roi_mask(shape: tuple[int, int], args: argparse.Namespace) -> tuple[np.ndarray, list[int]]:
    height, width = shape
    x0f, x1f = parse_frac_pair(args.roi_x_frac)
    y0f, y1f = parse_frac_pair(args.roi_y_frac)
    x0 = clamp_int(math.floor(width * x0f), 0, width - 1)
    x1 = clamp_int(math.ceil(width * x1f), x0 + 1, width)
    y0 = clamp_int(math.floor(height * y0f), 0, height - 1)
    y1 = clamp_int(math.ceil(height * y1f), y0 + 1, height)
    mask = np.zeros((height, width), dtype=bool)
    mask[y0:y1, x0:x1] = True
    return mask, [x0, y0, x1, y1]


def parse_frac_pair(value: str) -> tuple[float, float]:
    parts = [float(item.strip()) for item in value.split(",")]
    if len(parts) != 2:
        raise ValueError(f"fraction pair must contain two values: {value}")
    return max(0.0, min(1.0, parts[0])), max(0.0, min(1.0, parts[1]))


def points_from_mask(
    depth_m: np.ndarray,
    mask: np.ndarray,
    intrinsics: precheck.Intrinsics,
    max_points: int,
) -> tuple[np.ndarray, np.ndarray]:
    ys, xs = np.where(mask)
    if len(xs) > max_points:
        selected = np.random.default_rng(19).choice(len(xs), size=max_points, replace=False)
        xs = xs[selected]
        ys = ys[selected]
    z = depth_m[ys, xs].astype(np.float64)
    x = (xs.astype(np.float64) - float(intrinsics.cx)) * z / float(intrinsics.fx)
    y = (ys.astype(np.float64) - float(intrinsics.cy)) * z / float(intrinsics.fy)
    return np.stack([x, y, z], axis=1), np.stack([xs, ys], axis=1)


def fit_plane_ransac(
    points: np.ndarray,
    threshold_m: float,
    iterations: int,
) -> tuple[np.ndarray, float, np.ndarray, np.ndarray] | None:
    if len(points) < 3:
        return None
    rng = np.random.default_rng(23)
    best = None
    best_count = -1
    for _ in range(iterations):
        sample = points[rng.choice(len(points), size=3, replace=False)]
        normal = np.cross(sample[1] - sample[0], sample[2] - sample[0])
        norm = np.linalg.norm(normal)
        if norm < 1e-9:
            continue
        normal = normal / norm
        d = -float(np.dot(normal, sample[0]))
        distances = np.abs(points @ normal + d)
        inliers = distances < threshold_m
        count = int(np.count_nonzero(inliers))
        if count > best_count:
            best_count = count
            best = (normal, d, inliers, distances)
    if best is None:
        return None
    normal, d, inliers, _ = best
    refined = refine_plane(points[inliers])
    if refined is None:
        return best
    normal, d = refined
    distances = np.abs(points @ normal + d)
    inliers = distances < threshold_m
    return normal, d, inliers, distances


def refine_plane(points: np.ndarray) -> tuple[np.ndarray, float] | None:
    if len(points) < 3:
        return None
    center = np.mean(points, axis=0)
    _, _, vh = np.linalg.svd(points - center, full_matrices=False)
    normal = vh[-1]
    norm = np.linalg.norm(normal)
    if norm < 1e-9:
        return None
    normal = normal / norm
    d = -float(np.dot(normal, center))
    return normal, d


def color_summary(color: np.ndarray, mask: np.ndarray) -> dict[str, Any]:
    if color.shape[:2] != mask.shape:
        color = cv2.resize(color, (mask.shape[1], mask.shape[0]), interpolation=cv2.INTER_LINEAR)
    pixels = color[mask]
    if pixels.size == 0:
        return {"valid": False}
    gray = cv2.cvtColor(color, cv2.COLOR_BGR2GRAY)[mask]
    return {
        "valid": True,
        "bgr_mean": [float(v) for v in np.mean(pixels, axis=0)],
        "gray_mean": float(np.mean(gray)),
        "gray_p50": float(np.percentile(gray, 50)),
    }


def draw_overlay(depth_raw: np.ndarray, color: np.ndarray | None, analysis: dict[str, Any]) -> np.ndarray:
    base = color
    if base is None:
        base = precheck.make_depth_vis(depth_raw)
    if base.shape[:2] != depth_raw.shape[:2]:
        base = cv2.resize(base, (depth_raw.shape[1], depth_raw.shape[0]), interpolation=cv2.INTER_LINEAR)
    overlay = base.copy()
    x0, y0, x1, y1 = analysis.get("roi_xyxy", [0, 0, depth_raw.shape[1], depth_raw.shape[0]])
    cv2.rectangle(overlay, (x0, y0), (x1 - 1, y1 - 1), (0, 255, 255), 2)
    plane_mask = analysis.get("plane_mask")
    if isinstance(plane_mask, np.ndarray):
        tint = np.zeros_like(overlay)
        tint[:, :] = (0, 255, 0)
        alpha = (plane_mask.astype(np.float32) * 0.42)[:, :, None]
        overlay = (overlay * (1.0 - alpha) + tint * alpha).astype(np.uint8)
    fit = analysis.get("plane_fit", {})
    label = f"table plane valid={fit.get('valid')} inliers={fit.get('inlier_count', 0)}"
    cv2.putText(overlay, label, (16, 28), cv2.FONT_HERSHEY_SIMPLEX, 0.62, (0, 255, 255), 2, cv2.LINE_AA)
    if fit.get("valid"):
        center = analysis["table_center_camera_m"]
        dist = analysis["plane_camera_frame"]["perpendicular_distance_m"]
        text = f"center_z={center[2]:.3f}m perp={dist:.3f}m residual={fit['median_residual_m']*1000:.1f}mm"
        cv2.putText(overlay, text, (16, 54), cv2.FONT_HERSHEY_SIMPLEX, 0.56, (0, 255, 255), 2, cv2.LINE_AA)
    return overlay


def json_safe_analysis(analysis: dict[str, Any]) -> dict[str, Any]:
    safe = dict(analysis)
    safe.pop("plane_mask", None)
    return safe


def clamp_int(value: int, lower: int, upper: int) -> int:
    return max(lower, min(upper, int(value)))


if __name__ == "__main__":
    raise SystemExit(main())
