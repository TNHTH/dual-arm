#!/usr/bin/python3

from __future__ import annotations

import argparse
import json
import time
from datetime import datetime
from pathlib import Path
from typing import Any

import cv2
import numpy as np

import right_arm_grasp_precheck as precheck


ROOT = Path(__file__).resolve().parents[4]
DEFAULT_MODEL_PATH = precheck.DEFAULT_MODEL_PATH
DEFAULT_CAMERA_MATRIX = precheck.DEFAULT_CAMERA_MATRIX
DEFAULT_STATIC_TRANSFORMS = precheck.DEFAULT_STATIC_TRANSFORMS
DEFAULT_RIGHT_TO_LEFT_TRANSFORM = (
    ROOT / ".codex/tmp/runtime/dual-arm-cap-alignment-20260508-transform-candidate.json"
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="双相机 no-motion 可乐点云记忆生成")
    parser.add_argument("--left-color-device", required=True)
    parser.add_argument("--left-depth-device", required=True)
    parser.add_argument("--right-color-device", required=True)
    parser.add_argument("--right-depth-device", required=True)
    parser.add_argument("--left-color-topic", default="")
    parser.add_argument("--right-color-topic", default="")
    parser.add_argument("--ros-color-timeout-sec", type=float, default=5.0)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--left-rotate-180", action="store_true")
    parser.add_argument("--right-rotate-180", action="store_true")
    parser.add_argument("--color-width", type=int, default=640)
    parser.add_argument("--color-height", type=int, default=480)
    parser.add_argument("--depth-width", type=int, default=640)
    parser.add_argument("--depth-height", type=int, default=480)
    parser.add_argument("--capture-frames", type=int, default=5)
    parser.add_argument("--capture-timeout-sec", type=float, default=3.0)
    parser.add_argument("--model-path", default=str(DEFAULT_MODEL_PATH))
    parser.add_argument("--target-class-name", default="cocacola")
    parser.add_argument("--target-class-id", type=int, default=2)
    parser.add_argument("--confidence-threshold", type=float, default=0.30)
    parser.add_argument("--device", default="")
    parser.add_argument("--depth-scale-mm-per-raw", type=float, default=1.0)
    parser.add_argument("--min-depth-m", type=float, default=0.10)
    parser.add_argument("--max-depth-m", type=float, default=2.00)
    parser.add_argument("--target-depth-window-m", type=float, default=0.25)
    parser.add_argument("--camera-matrix-file", default=str(DEFAULT_CAMERA_MATRIX))
    parser.add_argument("--camera-matrix-source-width", type=int, default=1280)
    parser.add_argument("--camera-matrix-source-height", type=int, default=720)
    parser.add_argument("--static-transforms-file", default=str(DEFAULT_STATIC_TRANSFORMS))
    parser.add_argument("--right-extrinsic-assumption", default="operator_confirmed_same_as_left")
    parser.add_argument("--right-to-left-transform-json", default=str(DEFAULT_RIGHT_TO_LEFT_TRANSFORM))
    parser.add_argument("--obstacle-margin-px", type=int, default=80)
    parser.add_argument("--obstacle-target-exclusion-px", type=int, default=12)
    parser.add_argument("--obstacle-depth-window-m", type=float, default=0.35)
    parser.add_argument("--support-plane-ignore-height-m", type=float, default=0.04)
    parser.add_argument("--min-clearance-m", type=float, default=0.06)
    parser.add_argument("--target-alignment-mode", choices=["camera_center", "tcp_contact_projection", "either", "custom"], default="either")
    parser.add_argument("--gripper-contact-frame", default="Rend")
    parser.add_argument("--visual-center-tolerance-m", type=float, default=0.06)
    parser.add_argument("--alignment-desired-camera-xy-m", default="0.0,0.0")
    parser.add_argument("--alignment-label", default="camera_center")
    parser.add_argument("--target-pixel-margin-px", type=int, default=40)
    parser.add_argument("--max-points-per-camera", type=int, default=20000)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    report: dict[str, Any] = {
        "schema_version": 1,
        "created_at": datetime.now().isoformat(timespec="seconds"),
        "mode": "dual_camera_coke_pointcloud_memory_no_motion",
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
        left = process_side(args, "left", output_dir)
        right = process_side(args, "right", output_dir)
        report["left"] = side_report(left)
        report["right"] = side_report(right)

        transform = load_candidate_right_to_left_transform(Path(args.right_to_left_transform_json))
        fused = build_fused_memory(left, right, transform)
        report["fusion"] = fused["report"]

        npz_path = output_dir / "dual_camera_coke_memory_points.npz"
        np.savez_compressed(
            npz_path,
            left_points_camera_m=left["points_camera_m"],
            right_points_camera_m=right["points_camera_m"],
            right_points_in_left_camera_m=fused["right_points_in_left_camera_m"],
            fused_points_left_camera_m=fused["fused_points_left_camera_m"],
        )
        ply_path = output_dir / "dual_camera_coke_memory_candidate_left_camera.ply"
        write_ply(
            ply_path,
            left["points_camera_m"],
            fused["right_points_in_left_camera_m"],
        )

        report["artifacts"].update(
            {
                "points_npz": str(npz_path),
                "candidate_fused_ply": str(ply_path),
                "json": str(output_dir / "dual_camera_coke_memory.json"),
            }
        )
        report["right_arm_motion_gate"] = build_motion_gate(report)
        report["status"] = "completed_memory_candidate_no_motion"
        write_json(output_dir / "dual_camera_coke_memory.json", report)
        print(output_dir / "dual_camera_coke_memory.json")
        return 0
    except Exception as exc:  # pylint: disable=broad-except
        report["status"] = "failed"
        report["error"] = {"type": exc.__class__.__name__, "message": str(exc)}
        report["right_arm_motion_gate"] = {
            "passes": False,
            "reason": "memory_generation_failed",
            "motion_allowed": False,
        }
        write_json(output_dir / "dual_camera_coke_memory.json", report)
        print(output_dir / "dual_camera_coke_memory.json")
        return 1


def process_side(args: argparse.Namespace, side: str, output_dir: Path) -> dict[str, Any]:
    side_args = make_side_args(args, side)
    color, color_meta = capture_color(side_args)
    depth_raw, depth_meta = precheck.capture_depth(side_args)

    color_path = output_dir / f"{side}_color_snapshot.jpg"
    depth_raw_path = output_dir / f"{side}_depth_raw.npy"
    depth_vis_path = output_dir / f"{side}_depth_raw_vis.jpg"
    cv2.imwrite(str(color_path), color)
    np.save(str(depth_raw_path), depth_raw)
    cv2.imwrite(str(depth_vis_path), precheck.make_depth_vis(depth_raw))

    detections, model_meta = precheck.run_yolo(color, side_args)
    target = precheck.choose_target_detection(detections, side_args)
    if target is None:
        raise RuntimeError(f"{side} camera did not detect {args.target_class_name}")

    analysis = precheck.analyze_depth_model(color, depth_raw, target, side_args)
    annotated = precheck.draw_annotations(color, depth_raw, target, analysis)
    overlay_path = output_dir / f"{side}_coke_memory_overlay.jpg"
    cv2.imwrite(str(overlay_path), annotated)

    points = extract_target_points(depth_raw, color, target, side_args, analysis)
    return {
        "side": side,
        "args": side_args,
        "capture": {"color": color_meta, "depth": depth_meta},
        "model": model_meta,
        "detections": [item.to_dict() for item in detections],
        "target_detection": target.to_dict(),
        "analysis": analysis,
        "points_camera_m": points,
        "pointcloud_bbox_camera_m": precheck.bbox_from_points(points),
        "artifacts": {
            "color_snapshot": str(color_path),
            "depth_raw_npy": str(depth_raw_path),
            "depth_raw_visualization": str(depth_vis_path),
            "overlay": str(overlay_path),
        },
    }


def make_side_args(args: argparse.Namespace, side: str) -> argparse.Namespace:
    result = argparse.Namespace(**vars(args))
    result.color_device = args.left_color_device if side == "left" else args.right_color_device
    result.depth_device = args.left_depth_device if side == "left" else args.right_depth_device
    result.color_topic = args.left_color_topic if side == "left" else args.right_color_topic
    result.color_device_override = result.color_device
    result.depth_device_override = result.depth_device
    result.rotate_180 = bool(args.left_rotate_180 if side == "left" else args.right_rotate_180)
    result.max_points = int(args.max_points_per_camera)
    result.camera_fact_source_kind = "operator_supplied_stable_path"
    return result


def capture_color(args: argparse.Namespace) -> tuple[np.ndarray, dict[str, Any]]:
    if str(getattr(args, "color_topic", "")).strip():
        return capture_color_from_ros_topic(args)
    return precheck.capture_color(args)


def capture_color_from_ros_topic(args: argparse.Namespace) -> tuple[np.ndarray, dict[str, Any]]:
    try:
        import rclpy
        from rclpy.qos import qos_profile_sensor_data
        from sensor_msgs.msg import Image
    except Exception as exc:  # pylint: disable=broad-except
        raise RuntimeError("缺少 rclpy/sensor_msgs，无法从 ROS 图像话题读取彩色帧") from exc

    topic = str(args.color_topic).strip()
    holder: dict[str, Any] = {"message": None}
    rclpy.init(args=None)
    node = None
    try:
        node = rclpy.create_node(f"dual_camera_coke_memory_{int(time.time() * 1000)}")
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
    if args.rotate_180:
        frame = cv2.rotate(frame, cv2.ROTATE_180)
    return frame, {
        "backend": "ros2_topic",
        "topic": topic,
        "device": args.color_device,
        "source_kind": "ros_topic_from_existing_bridge",
        "width": int(frame.shape[1]),
        "height": int(frame.shape[0]),
        "encoding": str(message.encoding),
        "step": int(message.step),
        "stamp": {
            "sec": int(message.header.stamp.sec),
            "nanosec": int(message.header.stamp.nanosec),
        },
        "frame_id": str(message.header.frame_id),
        "rotate_180": bool(args.rotate_180),
    }


def ros_image_to_bgr(message: Any) -> np.ndarray:
    encoding = str(message.encoding).lower()
    if encoding not in {"bgr8", "rgb8"}:
        raise RuntimeError(f"不支持的 ROS 彩色图像编码: {message.encoding}")
    channels = 3
    row_bytes = int(message.width) * channels
    raw = np.frombuffer(message.data, dtype=np.uint8)
    expected = int(message.height) * int(message.step)
    if raw.size < expected:
        raise RuntimeError(f"ROS 图像数据长度不足: {raw.size} < {expected}")
    frame = raw[:expected].reshape((int(message.height), int(message.step)))[:, :row_bytes]
    frame = frame.reshape((int(message.height), int(message.width), channels)).copy()
    if encoding == "rgb8":
        frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
    return frame


def extract_target_points(
    depth_raw: np.ndarray,
    color: np.ndarray,
    target: precheck.Detection,
    args: argparse.Namespace,
    analysis: dict[str, Any],
) -> np.ndarray:
    depth_height, depth_width = depth_raw.shape[:2]
    color_height, color_width = color.shape[:2]
    depth_m = depth_raw.astype(np.float32) * float(args.depth_scale_mm_per_raw) / 1000.0
    valid_depth = (depth_raw > 0) & (depth_m >= float(args.min_depth_m)) & (depth_m <= float(args.max_depth_m))
    x0, y0, x1, y1 = precheck.map_bbox_to_depth_roi(target.xyxy, color_width, color_height, depth_width, depth_height)
    mask = np.zeros(depth_raw.shape, dtype=bool)
    mask[y0:y1, x0:x1] = True
    target_mask = mask & valid_depth
    window = analysis.get("depth_roi", {}).get("target_depth_window_m")
    if isinstance(window, list) and len(window) == 2:
        filtered = target_mask & (depth_m >= float(window[0])) & (depth_m <= float(window[1]))
        if np.count_nonzero(filtered) > 0:
            target_mask = filtered
    intrinsics = precheck.load_and_scale_intrinsics(args, depth_width, depth_height)
    return precheck.points_from_mask(depth_m, target_mask, intrinsics, int(args.max_points), bool(args.rotate_180))


def load_candidate_right_to_left_transform(path: Path) -> dict[str, Any]:
    if not path.is_file():
        return {
            "available": False,
            "status": "missing",
            "source": str(path),
            "rotation_matrix": None,
            "translation_m": None,
        }
    data = json.loads(path.read_text(encoding="utf-8"))
    raw = data.get("transform_right_camera_to_left_camera") or {}
    return {
        "available": bool(raw.get("rotation_matrix") and raw.get("translation_m")),
        "status": data.get("status", "unknown"),
        "source": str(path),
        "reason": data.get("reason"),
        "fit_quality": data.get("fit_quality"),
        "rotation_matrix": raw.get("rotation_matrix"),
        "translation_m": raw.get("translation_m"),
    }


def build_fused_memory(left: dict[str, Any], right: dict[str, Any], transform: dict[str, Any]) -> dict[str, Any]:
    left_points = left["points_camera_m"]
    right_points = right["points_camera_m"]
    if not transform.get("available"):
        right_in_left = np.empty((0, 3), dtype=np.float32)
        fused = left_points
    else:
        rotation = np.asarray(transform["rotation_matrix"], dtype=np.float64)
        translation = np.asarray(transform["translation_m"], dtype=np.float64)
        right_in_left = (right_points.astype(np.float64) @ rotation.T + translation).astype(np.float32)
        fused = np.vstack([left_points, right_in_left]).astype(np.float32)

    left_center = np.asarray(left["analysis"].get("target_center_camera_m"), dtype=np.float64)
    right_center = np.asarray(right["analysis"].get("target_center_camera_m"), dtype=np.float64)
    right_center_in_left = None
    fused_center = None
    if transform.get("available") and left_center.size == 3 and right_center.size == 3:
        rotation = np.asarray(transform["rotation_matrix"], dtype=np.float64)
        translation = np.asarray(transform["translation_m"], dtype=np.float64)
        right_center_in_left = rotation @ right_center + translation
        fused_center = 0.5 * (left_center + right_center_in_left)

    report = {
        "frame": "left_camera_candidate",
        "transform_right_camera_to_left_camera": transform,
        "status": "candidate_unverified" if transform.get("available") else "left_only_no_transform",
        "left_point_count": int(left_points.shape[0]),
        "right_point_count": int(right_points.shape[0]),
        "right_transformed_point_count": int(right_in_left.shape[0]),
        "fused_point_count": int(fused.shape[0]),
        "fused_bbox_left_camera_m": precheck.bbox_from_points(fused),
        "left_target_center_camera_m": left["analysis"].get("target_center_camera_m"),
        "right_target_center_camera_m": right["analysis"].get("target_center_camera_m"),
        "right_target_center_in_left_camera_m": None if right_center_in_left is None else right_center_in_left.tolist(),
        "fused_target_center_left_camera_m": None if fused_center is None else fused_center.tolist(),
        "memory_semantics": "candidate fused object memory only; not motion authority",
    }
    return {
        "report": report,
        "right_points_in_left_camera_m": right_in_left,
        "fused_points_left_camera_m": fused,
    }


def build_motion_gate(report: dict[str, Any]) -> dict[str, Any]:
    reasons = [
        "fused_camera_transform_not_verified",
        "right_camera_to_right_tcp_extrinsic_not_verified",
        "hardware_confirm_token_required_for_motion",
    ]
    right_gate = report.get("right", {}).get("safety_gate", {})
    if not right_gate.get("clearance_gate", {}).get("passes", False):
        reasons.append("right_precheck_clearance_gate_failed")
    return {
        "passes": False,
        "motion_allowed": False,
        "reasons": reasons,
        "allowed_next_step": "plan_only_or_no_motion_recheck",
    }


def side_report(side: dict[str, Any]) -> dict[str, Any]:
    analysis = side["analysis"]
    return {
        "capture": side["capture"],
        "model": side["model"],
        "detections": side["detections"],
        "target_detection": side["target_detection"],
        "depth_roi": analysis.get("depth_roi"),
        "target_center_camera_m": analysis.get("target_center_camera_m"),
        "target_3d_bbox_camera_m": analysis.get("target_3d_bbox_camera_m"),
        "target_alignment": analysis.get("target_alignment"),
        "obstacle_model": analysis.get("obstacle_model"),
        "safety_gate": precheck.build_safety_gate(analysis),
        "pointcloud_bbox_camera_m": side["pointcloud_bbox_camera_m"],
        "artifacts": side["artifacts"],
    }


def write_ply(path: Path, left_points: np.ndarray, right_points_in_left: np.ndarray) -> None:
    total = int(left_points.shape[0] + right_points_in_left.shape[0])
    with path.open("w", encoding="ascii") as handle:
        handle.write("ply\n")
        handle.write("format ascii 1.0\n")
        handle.write(f"element vertex {total}\n")
        handle.write("property float x\n")
        handle.write("property float y\n")
        handle.write("property float z\n")
        handle.write("property uchar red\n")
        handle.write("property uchar green\n")
        handle.write("property uchar blue\n")
        handle.write("end_header\n")
        for point in left_points:
            handle.write(f"{point[0]:.6f} {point[1]:.6f} {point[2]:.6f} 60 120 255\n")
        for point in right_points_in_left:
            handle.write(f"{point[0]:.6f} {point[1]:.6f} {point[2]:.6f} 255 90 60\n")


def write_json(path: Path, data: dict[str, Any]) -> None:
    path.write_text(json.dumps(precheck.to_jsonable(data), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    raise SystemExit(main())
