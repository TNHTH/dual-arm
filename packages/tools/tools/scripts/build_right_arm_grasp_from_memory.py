#!/usr/bin/python3

from __future__ import annotations

import argparse
import json
import os
from datetime import datetime
from pathlib import Path
from typing import Any

import numpy as np
import yaml

import right_arm_grasp_precheck as precheck


ROOT = Path(__file__).resolve().parents[4]
DEFAULT_OBJECT_GEOMETRY = ROOT / "config/competition/object_geometry.yaml"
DEFAULT_STATIC_TRANSFORMS = ROOT / "packages/tools/tools/config/static_transforms.yaml"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="把双相机点云记忆匹配到比赛物体硬编码规格，并生成右臂夹取候选")
    parser.add_argument("--memory-json", required=True)
    parser.add_argument("--object-geometry-file", default=str(DEFAULT_OBJECT_GEOMETRY))
    parser.add_argument("--static-transforms-file", default=str(DEFAULT_STATIC_TRANSFORMS))
    parser.add_argument("--right-extrinsic-assumption", default="operator_confirmed_same_as_left")
    parser.add_argument("--gripper-contact-frame", default="Rend")
    parser.add_argument("--object-id", default="right_cocacola_memory_candidate")
    parser.add_argument("--arm-group", default="right_arm")
    parser.add_argument("--output-dir", default="")
    parser.add_argument("--min-confidence", type=float, default=0.45)
    parser.add_argument("--default-gripper-close-position", type=int, default=220)
    parser.add_argument("--execute-profile", default="right_arm_memory_matched_grasp")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    memory_path = Path(args.memory_json)
    memory = json.loads(memory_path.read_text(encoding="utf-8"))
    geometry = yaml.safe_load(Path(args.object_geometry_file).read_text(encoding="utf-8"))

    right = memory.get("right", {})
    detection = right.get("target_detection", {})
    semantic_id = resolve_semantic_id(detection.get("class_name"), geometry)
    if not semantic_id:
        raise RuntimeError(f"无法把检测类别映射到 object_geometry.yaml: {detection.get('class_name')}")
    object_spec = geometry.get("objects", {}).get(semantic_id)
    if not isinstance(object_spec, dict):
        raise RuntimeError(f"object_geometry.yaml 缺少物体规格: {semantic_id}")

    output_dir = Path(args.output_dir) if args.output_dir else memory_path.parent / "right_arm_grasp_memory"
    output_dir.mkdir(parents=True, exist_ok=True)

    right_center = np.asarray(right.get("target_center_camera_m"), dtype=np.float64)
    if right_center.shape != (3,) or not np.isfinite(right_center).all():
        raise RuntimeError("memory JSON 缺少可用 right.target_center_camera_m")
    transform = precheck.load_reference_left_extrinsic(args.static_transforms_file, args.right_extrinsic_assumption)
    candidate_tcp = None if transform is None else transform.camera_point_to_tcp(right_center)

    expected_size = expected_bounding_box_m(object_spec)
    matched_bbox = bbox_centered_at(right_center, expected_size)
    object_match = build_object_match(memory, semantic_id, object_spec, expected_size, args)
    grasp_region = select_grasp_region(object_spec, args.arm_group)
    gripper_plan = build_gripper_plan(grasp_region, args)
    safety_gate = build_memory_safety_gate(memory, right, transform, semantic_id, object_match, args)

    candidate = {
        "schema_version": 1,
        "created_at": datetime.now().isoformat(timespec="seconds"),
        "mode": "right_arm_grasp_precheck_from_dual_camera_memory_and_object_geometry",
        "source_memory_json": str(memory_path),
        "object_geometry_file": str(Path(args.object_geometry_file)),
        "object_id": args.object_id,
        "semantic_type": semantic_id,
        "target_detection": detection,
        "capture": right.get("capture", {}),
        "target_center_camera_m": right_center.tolist(),
        "candidate_tcp_point_m": None if candidate_tcp is None else candidate_tcp.tolist(),
        "candidate_extrinsic": None if transform is None else transform.to_dict(),
        "target_3d_bbox_raw_camera_m": right.get("pointcloud_bbox_camera_m"),
        "target_3d_bbox_camera_m": matched_bbox,
        "target_alignment": right.get("target_alignment", {}),
        "obstacle_model": right.get("obstacle_model", {}),
        "object_match": object_match,
        "grasp_region": grasp_region,
        "gripper_plan": gripper_plan,
        "safety_gate": safety_gate,
        "right_arm_motion_gate": build_motion_gate(memory, safety_gate),
        "runtime_commands": build_runtime_commands(output_dir / "right_arm_grasp_memory_candidate.json", expected_size, gripper_plan, args),
        "notes": [
            "target_3d_bbox_camera_m 使用 object_geometry.yaml 硬编码尺寸围绕点云中心生成，用于稳定 planning scene 尺寸。",
            "target_3d_bbox_raw_camera_m 保留原始点云外包围盒，用于识别背景/桌面混入。",
            "当前右相机外参和双相机融合变换仍不是 verified，真实运动必须重新过硬件确认和现场安全确认。",
        ],
    }

    output_path = output_dir / "right_arm_grasp_memory_candidate.json"
    output_path.write_text(json.dumps(precheck.to_jsonable(candidate), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(output_path)
    return 0


def resolve_semantic_id(class_name: Any, geometry: dict[str, Any]) -> str:
    raw = str(class_name or "").strip()
    if not raw:
        return ""
    objects = geometry.get("objects", {})
    if raw in objects:
        return raw
    aliases = geometry.get("official_semantics", {}).get("aliases", {})
    return str(aliases.get(raw, ""))


def expected_bounding_box_m(object_spec: dict[str, Any]) -> list[float]:
    geometry = object_spec.get("geometry", {})
    bbox = geometry.get("bounding_box_m")
    if isinstance(bbox, list) and len(bbox) == 3:
        return [float(item) for item in bbox]
    proxy = geometry.get("proxy_shape", {})
    if proxy.get("type") == "sphere":
        radius = float(proxy.get("radius_m", 0.0))
        return [2.0 * radius, 2.0 * radius, 2.0 * radius]
    if proxy.get("type") == "box":
        size = proxy.get("size_m", [])
        if isinstance(size, list) and len(size) == 3:
            return [float(item) for item in size]
    if proxy.get("type") == "cylinder":
        radius = float(proxy.get("radius_m", 0.0))
        height = float(proxy.get("height_m", 0.0))
        return [2.0 * radius, 2.0 * radius, height]
    raise RuntimeError("object_geometry 缺少可用 bounding_box_m/proxy_shape")


def bbox_centered_at(center: np.ndarray, size: list[float]) -> dict[str, Any]:
    half = np.asarray(size, dtype=np.float64) * 0.5
    min_xyz = center - half
    max_xyz = center + half
    return {
        "valid": True,
        "source": "object_geometry_matched_bbox_centered_on_right_camera_depth_center",
        "point_count": 0,
        "min_xyz": min_xyz.tolist(),
        "max_xyz": max_xyz.tolist(),
        "center_xyz": center.tolist(),
        "size_xyz": [float(item) for item in size],
    }


def build_object_match(
    memory: dict[str, Any],
    semantic_id: str,
    object_spec: dict[str, Any],
    expected_size: list[float],
    args: argparse.Namespace,
) -> dict[str, Any]:
    measurements = {
        "left_pointcloud_bbox_m": bbox_size(memory.get("left", {}).get("pointcloud_bbox_camera_m")),
        "right_pointcloud_bbox_m": bbox_size(memory.get("right", {}).get("pointcloud_bbox_camera_m")),
        "fused_pointcloud_bbox_m": bbox_size(memory.get("fusion", {}).get("fused_bbox_left_camera_m")),
    }
    scores = {
        key: dimension_match_score(value, expected_size)
        for key, value in measurements.items()
        if value is not None
    }
    best_key = max(scores, key=scores.get) if scores else ""
    confidence = float(memory.get("right", {}).get("target_detection", {}).get("score", 0.0) or 0.0)
    role = str(object_spec.get("role", ""))
    planning = object_spec.get("planning", {})
    return {
        "semantic_id": semantic_id,
        "label_zh": object_spec.get("label_zh", ""),
        "role": role,
        "expected_bounding_box_m": expected_size,
        "expected_proxy_shape": object_spec.get("geometry", {}).get("proxy_shape", {}),
        "planning_collision_proxy_shape": planning.get("collision_proxy_shape", ""),
        "right_detection_confidence": confidence,
        "confidence_threshold": float(args.min_confidence),
        "confidence_passes": confidence >= float(args.min_confidence),
        "measured_bbox_sizes_m": measurements,
        "dimension_match_scores": scores,
        "best_pointcloud_dimension_source": best_key,
        "best_pointcloud_dimension_score": None if not best_key else scores[best_key],
        "selected_geometry_source": "object_geometry_yaml",
        "selection_reason": "pointcloud_bbox_is_used_for_center_memory; hardcoded_geometry_is_used_for_collision_and_gripper_sizing",
    }


def bbox_size(raw_bbox: Any) -> list[float] | None:
    if not isinstance(raw_bbox, dict):
        return None
    size = raw_bbox.get("size_xyz")
    if not isinstance(size, list) or len(size) != 3:
        return None
    return [float(item) for item in size]


def dimension_match_score(measured: list[float] | None, expected: list[float]) -> float:
    if measured is None:
        return 0.0
    measured_sorted = sorted(max(float(item), 1e-6) for item in measured)
    expected_sorted = sorted(max(float(item), 1e-6) for item in expected)
    errors = [
        min(abs(m - e) / e, 2.0)
        for m, e in zip(measured_sorted, expected_sorted)
    ]
    return float(max(0.0, 1.0 - sum(errors) / (2.0 * len(errors))))


def select_grasp_region(object_spec: dict[str, Any], arm_group: str) -> dict[str, Any]:
    regions = object_spec.get("planning", {}).get("grasp_regions", {})
    for name, region in regions.items():
        allowed = region.get("allowed_arms", [])
        if not allowed or arm_group in allowed:
            return {"name": name, **region}
    if regions:
        name, region = next(iter(regions.items()))
        return {"name": name, **region}
    return {"name": "default_center_grasp", "allowed_arms": [arm_group]}


def build_gripper_plan(grasp_region: dict[str, Any], args: argparse.Namespace) -> dict[str, Any]:
    preferred_width = grasp_region.get("preferred_gripper_width_m")
    return {
        "preferred_gripper_width_m": preferred_width,
        "open_position": 0,
        "close_position": int(args.default_gripper_close_position),
        "speed": 30,
        "torque": 80,
        "close_position_reason": (
            "EPG50 position is controller-scale 0..255; no calibrated width-to-position curve in repo, "
            "so use existing bottle-hold close position and verify by gobj contact."
        ),
    }


def build_memory_safety_gate(
    memory: dict[str, Any],
    right: dict[str, Any],
    transform: Any,
    semantic_id: str,
    object_match: dict[str, Any],
    args: argparse.Namespace,
) -> dict[str, Any]:
    depth_model_passes = bool(right.get("depth_roi", {}).get("depth_m_stats", {}).get("valid")) and bool(
        right.get("target_center_camera_m")
    )
    clearance_gate = right.get("safety_gate", {}).get("clearance_gate") or {"passes": False, "reason": "not_evaluated"}
    extrinsic_status = transform.status if transform is not None else "missing"
    extrinsic_verified = extrinsic_status == "verified"
    fusion_status = str(memory.get("fusion", {}).get("transform_right_camera_to_left_camera", {}).get("status", "missing"))
    fusion_verified = fusion_status == "verified"
    allowed_arms = object_match.get("role") != "placement_target"
    reasons: list[str] = []
    if not depth_model_passes:
        reasons.append("target_depth_model_invalid")
    if not object_match.get("confidence_passes"):
        reasons.append("detection_confidence_below_object_threshold")
    if semantic_id != "cola_bottle":
        reasons.append("current_right_arm_attempt_expected_cola_bottle")
    if not allowed_arms:
        reasons.append("object_not_graspable_by_right_arm")
    if not clearance_gate.get("passes"):
        reasons.append(str(clearance_gate.get("reason", "clearance_gate_failed")))
    if not extrinsic_verified:
        reasons.append("right_camera_to_right_tcp_extrinsic_not_verified")
    if not fusion_verified:
        reasons.append("fused_camera_transform_not_verified")
    passes = not reasons
    return {
        "passes": bool(passes),
        "auto_grasp_allowed": bool(passes),
        "depth_model_gate": {
            "passes": bool(depth_model_passes),
            "reason": "target_center_and_depth_roi_valid" if depth_model_passes else "target_depth_model_invalid",
        },
        "object_match_gate": {
            "passes": bool(object_match.get("confidence_passes") and semantic_id == "cola_bottle" and allowed_arms),
            "semantic_id": semantic_id,
            "reason": "hardcoded_object_geometry_matched" if semantic_id == "cola_bottle" else "unexpected_semantic",
        },
        "clearance_gate": clearance_gate,
        "extrinsic_gate": {
            "passes": bool(extrinsic_verified),
            "available_for_scripted_candidate_geometry": transform is not None,
            "status": extrinsic_status,
            "reason": "verified" if extrinsic_verified else "not_calibration_verified",
        },
        "fusion_gate": {
            "passes": bool(fusion_verified),
            "status": fusion_status,
            "reason": "verified" if fusion_verified else "candidate_transform_only",
        },
        "motion_recommendation": "auto_grasp_allowed" if passes else "fail_closed_prepare_only_or_operator_supervised_override",
        "reasons": reasons,
    }


def build_motion_gate(memory: dict[str, Any], safety_gate: dict[str, Any]) -> dict[str, Any]:
    return {
        "passes": bool(safety_gate.get("passes")),
        "motion_allowed": bool(safety_gate.get("auto_grasp_allowed")),
        "reasons": list(safety_gate.get("reasons", [])),
        "memory_status": memory.get("status"),
        "allowed_next_step": (
            "right_arm_autonomous_grasp_attempt_execute"
            if safety_gate.get("passes")
            else "plan_only_or_recheck_extrinsic_clearance_then_execute"
        ),
    }


def build_runtime_commands(
    precheck_path: Path,
    expected_size: list[float],
    gripper_plan: dict[str, Any],
    args: argparse.Namespace,
) -> dict[str, str]:
    size_arg = ",".join(f"{item:.3f}" for item in expected_size)
    base = (
        "source /opt/ros/humble/setup.bash && source install/setup.bash && "
        "/usr/bin/python3 packages/tools/tools/scripts/right_arm_autonomous_grasp_attempt.py "
        f"--precheck-json {precheck_path} "
        f"--object-id {args.object_id} --semantic-type cola_bottle "
        f"--scene-object-size-m {size_arg} "
        f"--gripper-close-position {int(gripper_plan['close_position'])} "
        "--allow-extrinsic-candidate --allow-clearance-fail "
        "--target-alignment-mode either "
    )
    return {
        "plan_only_no_gripper": base + "--skip-gripper --disable-precheck-age-gate",
        "execute": base + "--execute",
    }


if __name__ == "__main__":
    raise SystemExit(main())
