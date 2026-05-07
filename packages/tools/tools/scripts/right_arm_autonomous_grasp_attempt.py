#!/usr/bin/python3

from __future__ import annotations

import argparse
import json
import math
import time
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

import numpy as np
from epg50_gripper_ros.srv import GripperStatus as GripperStatusSrv
import rclpy
from geometry_msgs.msg import Point, PoseStamped, Quaternion, Vector3
from rclpy.action import ActionClient
from rclpy.node import Node
from rclpy.time import Time
from sensor_msgs.msg import JointState
from std_msgs.msg import Header
from tf2_ros import Buffer, TransformListener

from dualarm_interfaces.action import ExecuteTrajectory
from dualarm_interfaces.msg import SceneObject, SceneObjectArray, Subframe
from dualarm_interfaces.srv import PlanPose, SetGripper
from robo_ctrl.msg import RobotState


ROOT = Path(__file__).resolve().parents[4]
DEFAULT_OUTPUT_DIR = ROOT / ".codex/tmp/runtime"
DEFAULT_STATIC_TRANSFORMS = Path(__file__).resolve().parents[1] / "config/static_transforms.yaml"


@dataclass
class PosePlan:
    name: str
    pose: PoseStamped
    target_contact_world: np.ndarray
    tcp_goal_world: np.ndarray
    distance_m: float


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="右臂脚本化视觉目标靠近与夹取尝试")
    parser.add_argument("--precheck-json", required=True)
    parser.add_argument("--output-dir", default="")
    parser.add_argument("--arm-group", default="right_arm")
    parser.add_argument("--world-frame", default="world")
    parser.add_argument("--tcp-frame", default="right_tcp")
    parser.add_argument("--object-id", default="right_cocacola_candidate")
    parser.add_argument("--semantic-type", default="cola_bottle")
    parser.add_argument("--motion-mode", choices=("contact_approach", "visual_center_step"), default="contact_approach")
    parser.add_argument("--scene-object-size-m", default="0.07,0.07,0.16")
    parser.add_argument("--right-base-xyz-m", default="0.0,-0.35,0.0")
    parser.add_argument("--right-base-rpy-deg", default="0.0,0.0,0.0")
    parser.add_argument("--static-transforms-file", default=str(DEFAULT_STATIC_TRANSFORMS))
    parser.add_argument("--gripper-contact-frame", default="Rend")
    parser.add_argument("--pregrasp-standoff-m", type=float, default=0.08)
    parser.add_argument("--grasp-standoff-m", type=float, default=0.025)
    parser.add_argument("--visual-center-desired-camera-xy-m", default="0.0,0.0")
    parser.add_argument("--visual-center-axis", choices=("x", "y", "xy"), default="xy")
    parser.add_argument("--visual-center-gain", type=float, default=1.0)
    parser.add_argument(
        "--target-alignment-mode",
        choices=("camera_center", "tcp_contact_projection", "either"),
        default="either",
    )
    parser.add_argument("--alignment-desired-camera-xy-m", default="")
    parser.add_argument("--visual-center-tolerance-m", type=float, default=0.06)
    parser.add_argument("--grasp-visual-center-tolerance-m", type=float, default=0.035)
    parser.add_argument("--target-pixel-margin-px", type=int, default=40)
    parser.add_argument("--max-plan-distance-m", type=float, default=0.26)
    parser.add_argument("--max-single-stage-distance-m", type=float, default=0.14)
    parser.add_argument("--max-precheck-age-sec", type=float, default=180.0)
    parser.add_argument("--scene-publish-hz", type=float, default=10.0)
    parser.add_argument("--scene-warmup-sec", type=float, default=1.0)
    parser.add_argument("--plan-timeout-sec", type=float, default=12.0)
    parser.add_argument("--execute-timeout-sec", type=float, default=40.0)
    parser.add_argument("--state-timeout-sec", type=float, default=5.0)
    parser.add_argument("--gripper-open-position", type=int, default=0)
    parser.add_argument("--gripper-close-position", type=int, default=255)
    parser.add_argument("--gripper-speed", type=int, default=30)
    parser.add_argument("--gripper-torque", type=int, default=80)
    parser.add_argument("--gripper-settle-sec", type=float, default=2.0)
    parser.add_argument("--gripper-status-timeout-sec", type=float, default=8.0)
    parser.add_argument("--gripper-position-tolerance", type=int, default=3)
    parser.add_argument("--right-gripper-slave-id", type=int, default=10)
    parser.add_argument("--execute", action="store_true")
    parser.add_argument("--skip-gripper", action="store_true")
    parser.add_argument("--disable-reopen-on-grasp-miss", action="store_true")
    parser.add_argument("--allow-extrinsic-candidate", action="store_true")
    parser.add_argument("--allow-clearance-fail", action="store_true")
    parser.add_argument("--allow-offcenter-contact-approach", action="store_true")
    parser.add_argument(
        "--require-target-alignment-for-contact",
        action="store_true",
        help="默认不把目标居中/TCP 对齐作为 contact approach 硬门禁；开启后才强制阻断",
    )
    parser.add_argument(
        "--require-target-alignment-for-gripper",
        action="store_true",
        help="默认不把目标居中/TCP 对齐作为合爪硬门禁；开启后才强制阻断",
    )
    parser.add_argument("--disable-precheck-age-gate", action="store_true")
    return parser.parse_args()


class RightArmAutonomousGrasp(Node):
    def __init__(self, args: argparse.Namespace) -> None:
        super().__init__("right_arm_autonomous_grasp_attempt")
        self._args = args
        self._latest_state: Optional[RobotState] = None
        self._scene_version = 1
        self._scene_msg: Optional[SceneObjectArray] = None

        self._state_sub = self.create_subscription(RobotState, "/R/robot_state", self._state_cb, 10)
        self._scene_pub = self.create_publisher(SceneObjectArray, "/scene_fusion/scene_objects", 10)
        self._raw_scene_pub = self.create_publisher(SceneObjectArray, "/scene_fusion/raw_scene_objects", 10)
        self._plan_pose_client = self.create_client(PlanPose, "/planning/plan_pose")
        self._set_gripper_client = self.create_client(SetGripper, "/execution/set_gripper")
        self._right_gripper_status_client = self.create_client(GripperStatusSrv, "/gripper1/epg50_gripper/status")
        self._execute_client = ActionClient(self, ExecuteTrajectory, "/execution/execute_trajectory")
        self._tf_buffer = Buffer()
        self._tf_listener = TransformListener(self._tf_buffer, self)

        self._report: dict[str, Any] = {
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
            "mode": "right_arm_autonomous_grasp_attempt",
            "execute_requested": bool(args.execute),
            "steps": [],
        }

    def _state_cb(self, message: RobotState) -> None:
        self._latest_state = message

    def run(self) -> int:
        precheck = load_json(Path(self._args.precheck_json))
        self._report["precheck_json"] = str(Path(self._args.precheck_json).resolve())
        gate_ok, gate_reasons = self._validate_precheck(precheck)
        self._report["precheck_gate"] = {"passes": gate_ok, "reasons": gate_reasons}
        if not gate_ok:
            self._write_report("precheck_gate_failed")
            return 3

        if not self._wait_for_robot_state():
            self._write_report("robot_state_unavailable")
            return 4
        if not self._robot_ready():
            self._write_report("robot_state_not_ready")
            return 5

        if not self._wait_for_core_services():
            self._write_report("core_services_unavailable")
            return 6

        contact_offset_tcp = load_contact_offset_tcp(
            Path(self._args.static_transforms_file),
            self._args.gripper_contact_frame,
        )
        current_tcp_world, current_rotation = self._current_tcp_world_transform()
        target_tcp = np.asarray(precheck["candidate_tcp_point_m"], dtype=np.float64)
        target_contact_world = current_tcp_world + current_rotation @ target_tcp
        contact_goal_offset_world = current_rotation @ contact_offset_tcp
        approach_axis_world = unit_vector(contact_goal_offset_world)
        if np.linalg.norm(approach_axis_world) < 1e-9:
            approach_axis_world = current_rotation @ np.array([0.0, 0.0, 1.0], dtype=np.float64)
            approach_axis_world = unit_vector(approach_axis_world)

        target_bbox = precheck.get("target_3d_bbox_camera_m", {})
        scene = self._build_scene(precheck, target_contact_world, target_bbox)
        self._scene_msg = scene
        self._publish_scene_for(self._args.scene_warmup_sec)

        if self._args.motion_mode == "visual_center_step":
            plans = self._build_visual_center_sequence(precheck, current_tcp_world, current_rotation)
        else:
            plans = self._build_pose_sequence(
                current_tcp_world=current_tcp_world,
                current_rotation=current_rotation,
                target_contact_world=target_contact_world,
                contact_offset_world=contact_goal_offset_world,
                approach_axis_world=approach_axis_world,
            )
        self._report["computed_geometry"] = {
            "motion_mode": self._args.motion_mode,
            "current_tcp_world_m": current_tcp_world.tolist(),
            "target_point_tcp_m": target_tcp.tolist(),
            "target_contact_world_m": target_contact_world.tolist(),
            "contact_offset_tcp_m": contact_offset_tcp.tolist(),
            "contact_offset_world_m": contact_goal_offset_world.tolist(),
            "approach_axis_world": approach_axis_world.tolist(),
            "plans": [self._pose_plan_dict(plan) for plan in plans],
        }

        if not plans:
            self._write_report("no_plan_sequence")
            return 7

        for plan in plans:
            plan_response = self._call_plan_pose(plan)
            if plan_response is None:
                self._write_report(f"{plan.name}_plan_timeout")
                return 8
            self._record_plan_response(plan.name, plan_response)
            if not bool(plan_response.success):
                self._write_report(f"{plan.name}_plan_failed")
                return 9
            if not self._args.execute:
                continue
            if plan.name == "pregrasp" and not self._args.skip_gripper:
                if not self._set_gripper_command(1, 0, "enable_before_approach"):
                    self._write_report("gripper_enable_failed")
                    return 10
                if not self._set_gripper_command(2, self._args.gripper_open_position, "open_before_approach"):
                    self._write_report("gripper_open_failed")
                    return 11
                if not self._wait_gripper_target(
                    "status_after_open_before_approach",
                    self._args.gripper_open_position,
                    require_target_position=True,
                ):
                    self._write_report("gripper_open_not_settled")
                    return 18
            if not self._execute_plan(plan.name, plan_response):
                self._write_report(f"{plan.name}_execute_failed")
                return 12
            self._publish_scene_for(0.3)
            if not self._wait_motion_done():
                self._write_report(f"{plan.name}_motion_done_failed")
                return 13

        executed_grasp = bool(self._args.execute and plans and plans[-1].name == "grasp")
        grasp_contact_failed = False
        if executed_grasp and not self._args.skip_gripper:
            if not self._set_gripper_command(2, self._args.gripper_close_position, "close_on_target"):
                self._write_report("gripper_close_failed")
                return 14
            close_status = self._wait_gripper_target(
                "status_after_close_on_target",
                self._args.gripper_close_position,
                require_target_position=False,
            )
            contact_verified = self._gripper_contact_verified(close_status)
            self._report["grasp_contact_gate"] = {
                "passes": contact_verified,
                "status": close_status,
                "rule": "EPG50 gobj in {1,2} is required before reporting grasp success",
            }
            if not contact_verified:
                grasp_contact_failed = True
                if not self._args.disable_reopen_on_grasp_miss:
                    if not self._set_gripper_command(2, self._args.gripper_open_position, "reopen_after_grasp_miss"):
                        self._write_report("gripper_reopen_after_miss_failed")
                        return 16
                    if not self._wait_gripper_target(
                        "status_after_reopen_after_grasp_miss",
                        self._args.gripper_open_position,
                        require_target_position=True,
                    ):
                        self._write_report("gripper_reopen_after_miss_not_settled")
                        return 19
            retreat = PosePlan(
                name="retreat",
                pose=plans[0].pose,
                target_contact_world=plans[0].target_contact_world,
                tcp_goal_world=plans[0].tcp_goal_world,
                distance_m=plans[0].distance_m,
            )
            retreat_response = self._call_plan_pose(retreat)
            if retreat_response is not None:
                self._record_plan_response(retreat.name, retreat_response)
            if retreat_response is not None and bool(retreat_response.success):
                if not self._execute_plan(retreat.name, retreat_response):
                    self._write_report("retreat_execute_failed")
                    return 15
                self._wait_motion_done()

        if grasp_contact_failed:
            self._write_report("grasp_contact_not_verified_reopened")
            return 17
        self._write_report("completed")
        return 0

    def _validate_precheck(self, precheck: dict[str, Any]) -> tuple[bool, list[str]]:
        reasons: list[str] = []
        if not precheck.get("candidate_tcp_point_m"):
            reasons.append("candidate_tcp_point_missing")
        depth_gate = precheck.get("safety_gate", {}).get("depth_model_gate", {})
        if not depth_gate.get("passes"):
            reasons.append("depth_model_gate_failed")
        clearance = precheck.get("safety_gate", {}).get("clearance_gate", {})
        if not clearance.get("passes") and not self._args.allow_clearance_fail:
            reasons.append("clearance_gate_failed")
        extrinsic = precheck.get("safety_gate", {}).get("extrinsic_gate", {})
        if not extrinsic.get("passes") and not self._args.allow_extrinsic_candidate:
            reasons.append("extrinsic_not_verified")
        age_ok, age_gate = self._precheck_age_gate(precheck)
        self._report["precheck_age_gate"] = age_gate
        if not age_ok:
            reasons.append("precheck_json_too_old")
        alignment_ok, alignment_gate = self._target_alignment_gate(precheck)
        self._report["target_alignment_gate"] = alignment_gate
        if self._args.motion_mode != "visual_center_step" and not alignment_ok:
            if not self._args.skip_gripper and self._args.require_target_alignment_for_gripper:
                reasons.append("target_not_centered_for_gripper")
            elif (
                self._args.skip_gripper
                and self._args.require_target_alignment_for_contact
                and not self._args.allow_offcenter_contact_approach
            ):
                reasons.append("target_not_centered_run_visual_center_step_first")
        return not reasons, reasons

    def _wait_for_robot_state(self) -> bool:
        deadline = time.monotonic() + float(self._args.state_timeout_sec)
        while rclpy.ok() and time.monotonic() < deadline:
            rclpy.spin_once(self, timeout_sec=0.1)
            if self._latest_state is not None:
                return True
        return False

    def _robot_ready(self) -> bool:
        state = self._latest_state
        ready = bool(state is not None and state.motion_done and int(state.error_code) == 0)
        self._report["initial_robot_state"] = robot_state_to_dict(state)
        return ready

    def _wait_for_core_services(self) -> bool:
        checks = {
            "/planning/plan_pose": self._plan_pose_client.wait_for_service(timeout_sec=5.0),
            "/execution/execute_trajectory": self._execute_client.wait_for_server(timeout_sec=5.0),
        }
        if not self._args.skip_gripper:
            checks["/execution/set_gripper"] = self._set_gripper_client.wait_for_service(timeout_sec=5.0)
            checks["/gripper1/epg50_gripper/status"] = self._right_gripper_status_client.wait_for_service(
                timeout_sec=5.0
            )
        self._report["service_checks"] = checks
        return all(checks.values())

    def _target_alignment_gate(self, precheck: dict[str, Any]) -> tuple[bool, dict[str, Any]]:
        alignment = dict(precheck.get("target_alignment") or {})
        center_camera = precheck.get("target_center_camera_m")
        detection = precheck.get("target_detection") or {}
        capture = precheck.get("capture", {}).get("color", {})
        width = int(capture.get("width", 0) or (alignment.get("image_size_px") or [0, 0])[0])
        height = int(capture.get("height", 0) or (alignment.get("image_size_px") or [0, 0])[1])
        if "bbox_edge_margin_px" not in alignment and detection.get("xyxy") and width > 0 and height > 0:
            x0, y0, x1, y1 = [float(value) for value in detection["xyxy"]]
            alignment["bbox_edge_margin_px"] = min(x0, y0, float(width) - x1, float(height) - y1)

        tolerance = float(self._args.visual_center_tolerance_m)
        if not self._args.skip_gripper:
            tolerance = min(tolerance, float(self._args.grasp_visual_center_tolerance_m))
        margin_px = alignment.get("bbox_edge_margin_px")
        margin_passes = margin_px is not None and float(margin_px) >= float(self._args.target_pixel_margin_px)
        candidates = self._alignment_candidates(precheck, alignment)
        evaluated: dict[str, Any] = {}
        for label, candidate in candidates.items():
            desired_xy = candidate.get("desired_camera_xy_m")
            camera_offset_xy = candidate.get("camera_offset_xy_m")
            camera_xy_norm = candidate.get("camera_xy_norm_m")
            if center_camera and desired_xy:
                camera_offset_xy = [
                    float(center_camera[0]) - float(desired_xy[0]),
                    float(center_camera[1]) - float(desired_xy[1]),
                ]
                camera_xy_norm = float(math.hypot(camera_offset_xy[0], camera_offset_xy[1]))
            center_passes = camera_xy_norm is not None and float(camera_xy_norm) <= tolerance
            evaluated[label] = {
                **candidate,
                "alignment_label": label,
                "camera_offset_xy_m": camera_offset_xy,
                "camera_xy_norm_m": camera_xy_norm,
                "center_passes": bool(center_passes),
                "visible_margin_passes": bool(margin_passes),
                "passes": bool(center_passes and margin_passes),
            }
        selected_label, selected = self._select_alignment_candidate(evaluated)
        passes = bool(selected.get("passes"))
        alignment.update(
            {
                "required_for_motion_mode": self._args.motion_mode != "visual_center_step",
                "required_for_gripper": not self._args.skip_gripper,
                "enforcement": (
                    "required_for_gripper"
                    if (not self._args.skip_gripper and self._args.require_target_alignment_for_gripper)
                    else (
                        "required_for_contact"
                        if (self._args.skip_gripper and self._args.require_target_alignment_for_contact)
                        else "advisory_reference_only"
                    )
                ),
                "target_alignment_mode": self._args.target_alignment_mode,
                "selected_alignment_label": selected_label,
                "alignment_candidates": evaluated,
                "desired_camera_xy_m": selected.get("desired_camera_xy_m"),
                "camera_offset_xy_m": selected.get("camera_offset_xy_m"),
                "camera_xy_norm_m": selected.get("camera_xy_norm_m"),
                "used_center_tolerance_m": tolerance,
                "used_pixel_margin_threshold_px": int(self._args.target_pixel_margin_px),
                "center_passes": bool(selected.get("center_passes")),
                "visible_margin_passes": bool(margin_passes),
                "passes": passes,
                "recommendation": (
                    "contact_or_grasp_allowed"
                    if passes
                    else "run_visual_center_step_and_recheck_before_contact_or_grasp"
                ),
            }
        )
        return passes, alignment

    def _alignment_candidates(self, precheck: dict[str, Any], alignment: dict[str, Any]) -> dict[str, dict[str, Any]]:
        if str(self._args.alignment_desired_camera_xy_m).strip():
            return {
                "custom": {
                    "desired_camera_xy_m": parse_floats(self._args.alignment_desired_camera_xy_m, 2),
                    "source": "operator_parameter:alignment_desired_camera_xy_m",
                }
            }
        raw_candidates = alignment.get("alignment_candidates")
        if isinstance(raw_candidates, dict) and raw_candidates:
            candidates: dict[str, dict[str, Any]] = {}
            for label, raw_candidate in raw_candidates.items():
                if not isinstance(raw_candidate, dict):
                    continue
                desired = raw_candidate.get("desired_camera_xy_m")
                if desired is None:
                    continue
                candidates[str(label)] = {
                    "desired_camera_xy_m": [float(desired[0]), float(desired[1])],
                    "source": raw_candidate.get("source", "precheck_json"),
                    "camera_offset_xy_m": raw_candidate.get("camera_offset_xy_m"),
                    "camera_xy_norm_m": raw_candidate.get("camera_xy_norm_m"),
                }
            if candidates:
                return candidates
        candidates = {
            "camera_center": {
                "desired_camera_xy_m": parse_floats(self._args.visual_center_desired_camera_xy_m, 2),
                "source": "runtime_parameter:visual_center_desired_camera_xy_m",
            }
        }
        contact_offset_tcp = load_contact_offset_tcp(
            Path(self._args.static_transforms_file),
            self._args.gripper_contact_frame,
        )
        camera_offset_tcp = load_camera_offset_tcp(Path(self._args.static_transforms_file))
        desired_camera = contact_offset_tcp - camera_offset_tcp
        candidates["tcp_contact_projection"] = {
            "desired_camera_xy_m": [float(desired_camera[0]), float(desired_camera[1])],
            "source": (
                f"{self._args.static_transforms_file}: "
                f"{self._args.gripper_contact_frame} minus reused Ltcp->camera_link offset"
            ),
        }
        return candidates

    def _select_alignment_candidate(self, candidates: dict[str, Any]) -> tuple[str, dict[str, Any]]:
        if not candidates:
            return "missing", {}
        if self._args.target_alignment_mode == "either":
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
        candidate = candidates.get(self._args.target_alignment_mode)
        if candidate is not None:
            return self._args.target_alignment_mode, candidate
        label = next(iter(candidates))
        return label, candidates[label]

    def _desired_camera_xy(self, precheck: Optional[dict[str, Any]] = None) -> list[float]:
        if str(self._args.alignment_desired_camera_xy_m).strip():
            return parse_floats(self._args.alignment_desired_camera_xy_m, 2)
        if precheck is not None:
            alignment = dict(precheck.get("target_alignment") or {})
            selected_label, selected = self._select_alignment_candidate(self._alignment_candidates(precheck, alignment))
            if selected.get("desired_camera_xy_m"):
                self._report["visual_center_selected_alignment"] = {
                    "selected_alignment_label": selected_label,
                    "target_alignment_mode": self._args.target_alignment_mode,
                    "desired_camera_xy_m": selected.get("desired_camera_xy_m"),
                    "camera_xy_norm_m": selected.get("camera_xy_norm_m"),
                }
                return [float(selected["desired_camera_xy_m"][0]), float(selected["desired_camera_xy_m"][1])]
        if self._args.target_alignment_mode == "tcp_contact_projection":
            contact_offset_tcp = load_contact_offset_tcp(
                Path(self._args.static_transforms_file),
                self._args.gripper_contact_frame,
            )
            camera_offset_tcp = load_camera_offset_tcp(Path(self._args.static_transforms_file))
            desired_camera = contact_offset_tcp - camera_offset_tcp
            return [float(desired_camera[0]), float(desired_camera[1])]
        return parse_floats(self._args.visual_center_desired_camera_xy_m, 2)

    def _precheck_age_gate(self, precheck: dict[str, Any]) -> tuple[bool, dict[str, Any]]:
        if self._args.disable_precheck_age_gate or not self._args.execute:
            return True, {"enabled": False}
        created_at = precheck.get("created_at")
        result = {
            "enabled": True,
            "created_at": created_at,
            "threshold_sec": float(self._args.max_precheck_age_sec),
        }
        if not created_at:
            result["reason"] = "precheck_created_at_missing"
            return False, result
        try:
            created = datetime.fromisoformat(str(created_at))
            age_sec = (datetime.now() - created).total_seconds()
        except Exception as exc:  # pylint: disable=broad-except
            result["reason"] = f"precheck_created_at_parse_failed: {exc}"
            return False, result
        result["age_sec"] = age_sec
        passes = age_sec <= float(self._args.max_precheck_age_sec)
        if not passes:
            result["reason"] = "precheck_json_too_old_reacquire_target_before_motion"
        return passes, result

    def _current_tcp_world_transform(self) -> tuple[np.ndarray, np.ndarray]:
        try:
            transform = self._tf_buffer.lookup_transform(
                self._args.world_frame,
                self._args.tcp_frame,
                Time(),
                timeout=rclpy.duration.Duration(seconds=1.0),
            )
            translation = transform.transform.translation
            rotation = transform.transform.rotation
            return (
                np.array([translation.x, translation.y, translation.z], dtype=np.float64),
                quaternion_matrix(rotation.x, rotation.y, rotation.z, rotation.w),
            )
        except Exception as exc:  # pylint: disable=broad-except
            self._report["tf_fallback_reason"] = str(exc)
            assert self._latest_state is not None
            base_xyz = parse_floats(self._args.right_base_xyz_m, 3)
            base_rpy = parse_floats(self._args.right_base_rpy_deg, 3)
            state = self._latest_state
            base_rotation = rpy_matrix_deg(*base_rpy)
            tcp_base = np.array(
                [
                    float(state.tcp_pose.x) / 1000.0,
                    float(state.tcp_pose.y) / 1000.0,
                    float(state.tcp_pose.z) / 1000.0,
                ],
                dtype=np.float64,
            )
            tcp_world = np.asarray(base_xyz, dtype=np.float64) + base_rotation @ tcp_base
            tcp_rotation = base_rotation @ rpy_matrix_deg(
                float(state.tcp_pose.rx),
                float(state.tcp_pose.ry),
                float(state.tcp_pose.rz),
            )
            return tcp_world, tcp_rotation

    def _build_scene(
        self,
        precheck: dict[str, Any],
        target_contact_world: np.ndarray,
        target_bbox: dict[str, Any],
    ) -> SceneObjectArray:
        now = self.get_clock().now().to_msg()
        pose = PoseStamped()
        pose.header = Header(stamp=now, frame_id=self._args.world_frame)
        pose.pose.position = Point(
            x=float(target_contact_world[0]),
            y=float(target_contact_world[1]),
            z=float(target_contact_world[2]),
        )
        pose.pose.orientation = Quaternion(w=1.0)

        scene_object = SceneObject()
        scene_object.id = self._args.object_id
        scene_object.semantic_type = self._args.semantic_type
        scene_object.pose = pose
        requested_size = parse_floats(self._args.scene_object_size_m, 3)
        raw_size = target_bbox.get("size_xyz") or requested_size
        size = [
            min(max(float(raw_size[index]), 0.02), float(requested_size[index]))
            for index in range(3)
        ]
        scene_object.size = Vector3(x=float(size[0]), y=float(size[1]), z=float(size[2]))
        scene_object.confidence = float(precheck.get("target_detection", {}).get("score", 0.5))
        scene_object.graspable = True
        scene_object.movable = True
        scene_object.source = "right_arm_grasp_precheck"
        scene_object.source_views = ["right_camera_candidate"]
        scene_object.shape_type = "bbox"
        scene_object.pose_source = "scripted_precheck_candidate_not_calibration_verified"
        scene_object.quality_score = scene_object.confidence
        scene_object.last_seen = now
        scene_object.scene_version = self._scene_version
        scene_object.lifecycle_state = "stable"
        scene_object.reserved_by = "none"
        scene_object.attached_link = ""
        scene_object.pose_covariance_diagonal = [0.0] * 6
        self._report["scene_object_model"] = {
            "requested_size_m": requested_size,
            "raw_depth_bbox_size_m": raw_size,
            "used_collision_size_m": size,
            "reason": "depth_bbox_clamped_to_operator_task_object_size_for_planning_scene",
        }

        body = Subframe()
        body.name = "bottle_body_grasp"
        body.pose = pose
        scene_object.subframes = [body]

        scene = SceneObjectArray()
        scene.header = Header(stamp=now, frame_id=self._args.world_frame)
        scene.scene_version = self._scene_version
        scene.objects = [scene_object]
        return scene

    def _publish_scene_for(self, duration_sec: float) -> None:
        if self._scene_msg is None:
            return
        end = time.monotonic() + max(0.0, duration_sec)
        period = 1.0 / max(1.0, float(self._args.scene_publish_hz))
        while rclpy.ok() and time.monotonic() < end:
            stamp = self.get_clock().now().to_msg()
            self._scene_msg.header.stamp = stamp
            for item in self._scene_msg.objects:
                item.pose.header.stamp = stamp
                item.last_seen = stamp
                for subframe in item.subframes:
                    subframe.pose.header.stamp = stamp
            self._scene_pub.publish(self._scene_msg)
            self._raw_scene_pub.publish(self._scene_msg)
            rclpy.spin_once(self, timeout_sec=0.01)
            time.sleep(period)

    def _build_pose_sequence(
        self,
        current_tcp_world: np.ndarray,
        current_rotation: np.ndarray,
        target_contact_world: np.ndarray,
        contact_offset_world: np.ndarray,
        approach_axis_world: np.ndarray,
    ) -> list[PosePlan]:
        plans: list[PosePlan] = []
        orientation = quaternion_from_matrix(current_rotation)
        for name, standoff in (("pregrasp", self._args.pregrasp_standoff_m), ("grasp", self._args.grasp_standoff_m)):
            tcp_goal = target_contact_world - contact_offset_world - approach_axis_world * float(standoff)
            delta = tcp_goal - current_tcp_world
            distance = float(np.linalg.norm(delta))
            if name == "grasp":
                # grasp 阶段不允许裁剪成小步后合爪；必须真实抓取目标本身就在允许距离内。
                if distance > float(self._args.max_single_stage_distance_m):
                    continue
                if distance > float(self._args.max_plan_distance_m):
                    continue
            elif distance > float(self._args.max_plan_distance_m):
                scale = float(self._args.max_plan_distance_m) / max(distance, 1e-9)
                tcp_goal = current_tcp_world + delta * scale
                distance = float(np.linalg.norm(tcp_goal - current_tcp_world))
            pose = PoseStamped()
            pose.header = Header(stamp=self.get_clock().now().to_msg(), frame_id=self._args.world_frame)
            pose.pose.position = Point(x=float(tcp_goal[0]), y=float(tcp_goal[1]), z=float(tcp_goal[2]))
            pose.pose.orientation = orientation
            plans.append(
                PosePlan(
                    name=name,
                    pose=pose,
                    target_contact_world=target_contact_world,
                    tcp_goal_world=tcp_goal,
                    distance_m=distance,
                )
            )
        return plans

    def _build_visual_center_sequence(
        self,
        precheck: dict[str, Any],
        current_tcp_world: np.ndarray,
        current_rotation: np.ndarray,
    ) -> list[PosePlan]:
        center_camera = np.asarray(precheck.get("target_center_camera_m"), dtype=np.float64)
        desired_xy = self._desired_camera_xy(precheck)
        correction_camera = np.array(
            [
                float(center_camera[0]) - float(desired_xy[0]),
                float(center_camera[1]) - float(desired_xy[1]),
                0.0,
            ],
            dtype=np.float64,
        )
        if self._args.visual_center_axis == "x":
            correction_camera[1] = 0.0
        elif self._args.visual_center_axis == "y":
            correction_camera[0] = 0.0
        correction_camera *= float(self._args.visual_center_gain)
        extrinsic = precheck.get("candidate_extrinsic") or {}
        rpy_deg = extrinsic.get("rpy_deg") or [0.0, 0.0, 0.0]
        camera_to_tcp_rotation = rpy_matrix_deg(float(rpy_deg[0]), float(rpy_deg[1]), float(rpy_deg[2]))
        correction_tcp = camera_to_tcp_rotation @ correction_camera
        distance = float(np.linalg.norm(correction_tcp))
        if distance > float(self._args.max_plan_distance_m):
            correction_tcp *= float(self._args.max_plan_distance_m) / max(distance, 1e-9)
            distance = float(np.linalg.norm(correction_tcp))
        tcp_goal = current_tcp_world + current_rotation @ correction_tcp
        pose = PoseStamped()
        pose.header = Header(stamp=self.get_clock().now().to_msg(), frame_id=self._args.world_frame)
        pose.pose.position = Point(x=float(tcp_goal[0]), y=float(tcp_goal[1]), z=float(tcp_goal[2]))
        pose.pose.orientation = quaternion_from_matrix(current_rotation)
        self._report["visual_center_control"] = {
            "target_center_camera_m": center_camera.tolist(),
            "desired_camera_xy_m": desired_xy,
            "axis": self._args.visual_center_axis,
            "gain": float(self._args.visual_center_gain),
            "correction_camera_m": correction_camera.tolist(),
            "correction_tcp_m": correction_tcp.tolist(),
            "distance_m": distance,
            "extrinsic_status": extrinsic.get("status", "missing"),
        }
        return [
            PosePlan(
                name="visual_center",
                pose=pose,
                target_contact_world=current_tcp_world,
                tcp_goal_world=tcp_goal,
                distance_m=distance,
            )
        ]

    def _call_plan_pose(self, plan: PosePlan):
        self._publish_scene_for(0.4)
        request = PlanPose.Request()
        request.arm_group = self._args.arm_group
        request.target_pose = plan.pose
        request.planner_id = ""
        request.cartesian = False
        future = self._plan_pose_client.call_async(request)
        rclpy.spin_until_future_complete(self, future, timeout_sec=float(self._args.plan_timeout_sec))
        return future.result() if future.done() else None

    def _record_plan_response(self, name: str, response: Any) -> None:
        self._report["steps"].append(
            {
                "name": name,
                "type": "plan_pose",
                "success": bool(response.success),
                "result_code": response.result_code,
                "failure_stage": response.failure_stage,
                "message": response.message,
                "planning_time_ms": float(response.planning_time_ms),
                "joint_names": list(response.joint_trajectory.joint_names),
                "point_count": len(response.joint_trajectory.points),
            }
        )

    def _execute_plan(self, name: str, response: Any) -> bool:
        goal = ExecuteTrajectory.Goal()
        goal.arm_group = response.primary_arm_group or self._args.arm_group
        goal.secondary_arm_group = response.secondary_arm_group
        goal.joint_trajectory = response.joint_trajectory
        goal.secondary_joint_trajectory = response.secondary_joint_trajectory
        goal.cartesian_waypoints = response.cartesian_waypoints
        goal.synchronized = bool(response.synchronized)
        goal.use_cartesian_execution = False
        goal.execution_profile = "right_arm_autonomous_grasp_attempt"
        send_future = self._execute_client.send_goal_async(goal)
        rclpy.spin_until_future_complete(self, send_future, timeout_sec=5.0)
        goal_handle = send_future.result() if send_future.done() else None
        if goal_handle is None or not goal_handle.accepted:
            self._report["steps"].append({"name": name, "type": "execute", "accepted": False})
            return False
        result_future = goal_handle.get_result_async()
        rclpy.spin_until_future_complete(self, result_future, timeout_sec=float(self._args.execute_timeout_sec))
        if not result_future.done() or result_future.result() is None:
            self._report["steps"].append({"name": name, "type": "execute", "accepted": True, "result": "timeout"})
            return False
        result = result_future.result().result
        self._report["steps"].append(
            {
                "name": name,
                "type": "execute",
                "accepted": True,
                "success": bool(result.success),
                "result_code": result.result_code,
                "message": result.message,
                "final_primary_joint_state": joint_state_to_dict(result.final_primary_joint_state),
            }
        )
        return bool(result.success)

    def _wait_motion_done(self) -> bool:
        end = time.monotonic() + float(self._args.state_timeout_sec)
        stable_count = 0
        samples: list[dict[str, Any]] = []
        while rclpy.ok() and time.monotonic() < end:
            rclpy.spin_once(self, timeout_sec=0.1)
            state = self._latest_state
            if state is None:
                continue
            samples.append(robot_state_to_dict(state))
            if state.motion_done and int(state.error_code) == 0:
                stable_count += 1
                if stable_count >= 3:
                    self._report["post_motion_samples"] = samples[-5:]
                    return True
            else:
                stable_count = 0
        self._report["post_motion_samples"] = samples[-5:]
        return False

    def _set_gripper_command(self, command: int, position: int, label: str) -> bool:
        request = SetGripper.Request()
        request.arm_name = self._args.arm_group
        request.command = int(command)
        request.slave_id = int(self._args.right_gripper_slave_id)
        request.position = int(position)
        request.speed = int(self._args.gripper_speed)
        request.torque = int(self._args.gripper_torque)
        request.object_id = ""
        request.link_name = ""
        request.attach_on_success = False
        request.detach_on_success = False
        future = self._set_gripper_client.call_async(request)
        rclpy.spin_until_future_complete(self, future, timeout_sec=8.0)
        response = future.result() if future.done() else None
        self._report["steps"].append(
            {
                "name": label,
                "type": "set_gripper",
                "position": int(position),
                "success": bool(response is not None and response.success),
                "message": "" if response is None else response.message,
            }
        )
        return response is not None and bool(response.success)

    def _read_gripper_status(self, label: str) -> Optional[dict[str, Any]]:
        if not self._right_gripper_status_client.wait_for_service(timeout_sec=2.0):
            self._report["steps"].append({"name": label, "type": "gripper_status", "success": False})
            return None
        request = GripperStatusSrv.Request()
        request.slave_id = int(self._args.right_gripper_slave_id)
        future = self._right_gripper_status_client.call_async(request)
        rclpy.spin_until_future_complete(self, future, timeout_sec=2.0)
        response = future.result() if future.done() else None
        if response is None:
            status = {"success": False, "message": "status_timeout"}
        else:
            status = {
                "success": bool(response.success),
                "status": int(response.status),
                "gact": bool(response.gact),
                "gsta": int(response.gsta),
                "gobj": int(response.gobj),
                "error": int(response.error),
                "position": int(response.position),
                "speed": int(response.speed),
                "force": int(response.force),
                "object_status": response.object_status,
                "error_message": response.error_message,
            }
        self._report["steps"].append({"name": label, "type": "gripper_status", **status})
        return status

    def _wait_gripper_target(
        self,
        label: str,
        target_position: int,
        require_target_position: bool,
    ) -> Optional[dict[str, Any]]:
        deadline = time.monotonic() + max(float(self._args.gripper_status_timeout_sec), 0.0)
        last_status: Optional[dict[str, Any]] = None
        while rclpy.ok() and time.monotonic() < deadline:
            last_status = self._read_gripper_status(label)
            if last_status is None or not last_status.get("success"):
                time.sleep(0.2)
                continue
            if int(last_status.get("error", -1)) != 0:
                return last_status
            speed = abs(int(last_status.get("speed", 0)))
            position = int(last_status.get("position", -1))
            gobj = int(last_status.get("gobj", -1))
            target_reached = abs(position - int(target_position)) <= int(self._args.gripper_position_tolerance)
            if require_target_position:
                if target_reached and speed == 0:
                    last_status["settled"] = True
                    return last_status
            elif speed == 0 and (target_reached or gobj in (1, 2, 3)):
                last_status["settled"] = True
                return last_status
            time.sleep(0.2)
        if last_status is not None:
            self._report["steps"].append(
                {
                    "name": f"{label}_timeout",
                    "type": "gripper_status_wait",
                    "success": False,
                    "target_position": int(target_position),
                    "last_status": last_status,
                }
            )
        return None

    @staticmethod
    def _gripper_contact_verified(status: Optional[dict[str, Any]]) -> bool:
        if not status or not status.get("success"):
            return False
        if int(status.get("error", -1)) != 0:
            return False
        # EPG50/Robotiq-style gobj: 1/2 表示检测到物体接触；3 表示到达目标位置但未检测到物体。
        return int(status.get("gobj", -1)) in (1, 2)

    def _pose_plan_dict(self, plan: PosePlan) -> dict[str, Any]:
        return {
            "name": plan.name,
            "target_contact_world_m": plan.target_contact_world.tolist(),
            "tcp_goal_world_m": plan.tcp_goal_world.tolist(),
            "distance_m": plan.distance_m,
            "pose": pose_to_dict(plan.pose),
        }

    def _write_report(self, status: str) -> None:
        output_dir = Path(self._args.output_dir) if self._args.output_dir else (
            DEFAULT_OUTPUT_DIR / f"right-arm-autonomous-grasp-{time.strftime('%Y%m%d-%H%M%S')}"
        )
        output_dir.mkdir(parents=True, exist_ok=True)
        self._report["status"] = status
        self._report["final_robot_state"] = robot_state_to_dict(self._latest_state)
        path = output_dir / "right_arm_autonomous_grasp_attempt.json"
        path.write_text(json.dumps(to_jsonable(self._report), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(str(path))


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def parse_floats(raw: str, count: int) -> list[float]:
    values = [float(item.strip()) for item in raw.split(",") if item.strip()]
    if len(values) != count:
        raise ValueError(f"参数数量错误: expected={count}, actual={len(values)}, raw={raw}")
    return values


def load_contact_offset_tcp(path: Path, child_frame: str) -> np.ndarray:
    try:
        import yaml

        data = yaml.safe_load(path.read_text(encoding="utf-8"))
    except Exception:
        data = {}
    for item in data.get("transforms", []):
        frames = item.get("frames", {})
        if frames.get("parent") == "Rtcp" and frames.get("child") == child_frame:
            trans = item.get("translation", {})
            return np.array(
                [float(trans.get("x", 0.0)), float(trans.get("y", 0.0)), float(trans.get("z", 0.0))],
                dtype=np.float64,
            )
    return np.array([0.0, 0.0, 0.15], dtype=np.float64)


def load_camera_offset_tcp(path: Path) -> np.ndarray:
    try:
        import yaml

        data = yaml.safe_load(path.read_text(encoding="utf-8"))
    except Exception:
        data = {}
    for item in data.get("transforms", []):
        frames = item.get("frames", {})
        if frames.get("parent") == "Ltcp" and frames.get("child") == "camera_link":
            trans = item.get("translation", {})
            return np.array(
                [float(trans.get("x", 0.0)), float(trans.get("y", 0.0)), float(trans.get("z", 0.0))],
                dtype=np.float64,
            )
    return np.array([0.0, 0.0, 0.0], dtype=np.float64)


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


def quaternion_matrix(x: float, y: float, z: float, w: float) -> np.ndarray:
    norm = x * x + y * y + z * z + w * w
    if norm < 1e-12:
        return np.eye(3, dtype=np.float64)
    scale = 2.0 / norm
    xx, yy, zz = x * x * scale, y * y * scale, z * z * scale
    xy, xz, yz = x * y * scale, x * z * scale, y * z * scale
    wx, wy, wz = w * x * scale, w * y * scale, w * z * scale
    return np.array(
        [
            [1.0 - yy - zz, xy - wz, xz + wy],
            [xy + wz, 1.0 - xx - zz, yz - wx],
            [xz - wy, yz + wx, 1.0 - xx - yy],
        ],
        dtype=np.float64,
    )


def quaternion_from_matrix(matrix: np.ndarray) -> Quaternion:
    trace = float(np.trace(matrix))
    if trace > 0.0:
        s = math.sqrt(trace + 1.0) * 2.0
        w = 0.25 * s
        x = (matrix[2, 1] - matrix[1, 2]) / s
        y = (matrix[0, 2] - matrix[2, 0]) / s
        z = (matrix[1, 0] - matrix[0, 1]) / s
    else:
        index = int(np.argmax([matrix[0, 0], matrix[1, 1], matrix[2, 2]]))
        if index == 0:
            s = math.sqrt(1.0 + matrix[0, 0] - matrix[1, 1] - matrix[2, 2]) * 2.0
            w = (matrix[2, 1] - matrix[1, 2]) / s
            x = 0.25 * s
            y = (matrix[0, 1] + matrix[1, 0]) / s
            z = (matrix[0, 2] + matrix[2, 0]) / s
        elif index == 1:
            s = math.sqrt(1.0 + matrix[1, 1] - matrix[0, 0] - matrix[2, 2]) * 2.0
            w = (matrix[0, 2] - matrix[2, 0]) / s
            x = (matrix[0, 1] + matrix[1, 0]) / s
            y = 0.25 * s
            z = (matrix[1, 2] + matrix[2, 1]) / s
        else:
            s = math.sqrt(1.0 + matrix[2, 2] - matrix[0, 0] - matrix[1, 1]) * 2.0
            w = (matrix[1, 0] - matrix[0, 1]) / s
            x = (matrix[0, 2] + matrix[2, 0]) / s
            y = (matrix[1, 2] + matrix[2, 1]) / s
            z = 0.25 * s
    return Quaternion(x=float(x), y=float(y), z=float(z), w=float(w))


def unit_vector(vector: np.ndarray) -> np.ndarray:
    norm = float(np.linalg.norm(vector))
    if norm < 1e-12:
        return np.zeros(3, dtype=np.float64)
    return vector / norm


def pose_to_dict(pose: PoseStamped) -> dict[str, Any]:
    return {
        "frame_id": pose.header.frame_id,
        "position": {
            "x": pose.pose.position.x,
            "y": pose.pose.position.y,
            "z": pose.pose.position.z,
        },
        "orientation": {
            "x": pose.pose.orientation.x,
            "y": pose.pose.orientation.y,
            "z": pose.pose.orientation.z,
            "w": pose.pose.orientation.w,
        },
    }


def robot_state_to_dict(state: Optional[RobotState]) -> Optional[dict[str, Any]]:
    if state is None:
        return None
    return {
        "stamp": {"sec": state.header.stamp.sec, "nanosec": state.header.stamp.nanosec},
        "joint_position_deg": [
            state.joint_position.j1,
            state.joint_position.j2,
            state.joint_position.j3,
            state.joint_position.j4,
            state.joint_position.j5,
            state.joint_position.j6,
        ],
        "tcp_pose_mm_deg": [
            state.tcp_pose.x,
            state.tcp_pose.y,
            state.tcp_pose.z,
            state.tcp_pose.rx,
            state.tcp_pose.ry,
            state.tcp_pose.rz,
        ],
        "motion_done": bool(state.motion_done),
        "error_code": int(state.error_code),
    }


def joint_state_to_dict(state: JointState) -> dict[str, Any]:
    return {
        "name": list(state.name),
        "position": list(state.position),
        "stamp": {"sec": state.header.stamp.sec, "nanosec": state.header.stamp.nanosec},
    }


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


def main() -> int:
    args = parse_args()
    rclpy.init()
    node = RightArmAutonomousGrasp(args)
    try:
        return node.run()
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    raise SystemExit(main())
