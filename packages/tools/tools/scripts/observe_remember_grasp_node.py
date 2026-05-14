#!/usr/bin/python3

from __future__ import annotations

import argparse
import copy
import json
import math
import os
import sys
import time
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

import cv2
import numpy as np
import rclpy
from cv_bridge import CvBridge
from epg50_gripper_ros.srv import GripperStatus as GripperStatusSrv
from geometry_msgs.msg import Point, Pose, PoseStamped, Quaternion, Vector3
from rclpy.action import ActionClient
from rclpy.duration import Duration
from rclpy.node import Node
from rclpy.qos import qos_profile_sensor_data
from rclpy.time import Time
from sensor_msgs.msg import CameraInfo, Image, JointState
from std_msgs.msg import Header
from tf2_ros import Buffer, TransformListener

from detector.msg import Bbox2dArray
from dualarm_interfaces.action import ExecuteTrajectory
from dualarm_interfaces.msg import SceneObject, SceneObjectArray, Subframe
from dualarm_interfaces.srv import AttachObject, PlanPose, SetGripper, SetObjectInteraction
from robo_ctrl.msg import RobotState


ROOT = Path(__file__).resolve().parents[4]
DEFAULT_OUTPUT_ROOT = ROOT / ".codex/tmp/runtime"
DEFAULT_STATIC_TRANSFORMS = ROOT / "packages/tools/tools/config/static_transforms.yaml"

TABLE_TOP_REAL_Z = -0.070
TABLE_TOP_COLLISION_Z = -0.060
TABLE_THICKNESS_M = 0.040
TABLE_COLLISION_CENTER_Z = -0.080
COKE_RADIUS_M = 0.033
COKE_HEIGHT_M = 0.122
COKE_COLLISION_RADIUS_M = 0.040
COKE_COLLISION_HEIGHT_M = 0.130
COKE_CENTER_Z_M = TABLE_TOP_REAL_Z + COKE_HEIGHT_M / 2.0
COKE_COLLISION_CENTER_Z_M = -0.005
CALIBRATION_STATUS = "candidate_not_calibration_verified"
RUNTIME_TABLE_CORRECTED_STATUS = "runtime_table_corrected_candidate_not_verified"
ONE_SHOT_MODE = "one-shot-live"

EXECUTION_MODES = {"execute-pregrasp", "execute-final", "full", ONE_SHOT_MODE}


@dataclass
class ObservationBundle:
    color_msg: Image
    depth_msg: Image
    camera_info: CameraInfo
    detections_msg: Optional[Bbox2dArray]


@dataclass
class DetectionBox:
    class_id: int
    score: float
    xyxy: tuple[float, float, float, float]

    @property
    def center_xy(self) -> tuple[float, float]:
        x0, y0, x1, y1 = self.xyxy
        return 0.5 * (x0 + x1), 0.5 * (y0 + y1)

    @property
    def width(self) -> float:
        return self.xyxy[2] - self.xyxy[0]

    @property
    def height(self) -> float:
        return self.xyxy[3] - self.xyxy[1]

    def central_roi(self, image_width: int, image_height: int) -> tuple[int, int, int, int]:
        cx, cy = self.center_xy
        half_w = max(self.width * 0.50 * 0.5, 1.0)
        half_h = max(self.height * 0.70 * 0.5, 1.0)
        x0 = int(max(0, math.floor(cx - half_w)))
        x1 = int(min(image_width, math.ceil(cx + half_w)))
        y0 = int(max(0, math.floor(cy - half_h)))
        y1 = int(min(image_height, math.ceil(cy + half_h)))
        return x0, y0, x1, y1

    def to_dict(self) -> dict[str, Any]:
        return {
            "class_id": int(self.class_id),
            "score": float(self.score),
            "xyxy": [float(value) for value in self.xyxy],
            "center_xy": [float(value) for value in self.center_xy],
            "width": float(self.width),
            "height": float(self.height),
        }


@dataclass
class PinchTarget:
    name: str
    pinch_xyz_m: np.ndarray
    target_tcp_pose: PoseStamped
    min_allowed_z_m: float
    stage_kind: str


@dataclass
class DepthPointCloud:
    points_cam: np.ndarray
    u: np.ndarray
    v: np.ndarray
    valid_mask: np.ndarray
    image_shape: tuple[int, int]


@dataclass
class TablePlane:
    normal: np.ndarray
    offset: float
    table_points_cam: np.ndarray
    inlier_count: int
    inlier_ratio: float
    median_residual_m: float


@dataclass
class SegmentedObject:
    points_cam: np.ndarray
    mask: np.ndarray
    mode: str
    debug: dict[str, Any]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="右臂单帧 RGB-D 记忆抓取节点")
    parser.add_argument(
        "--mode",
        choices=("observe-only", "publish-scene", "plan-pregrasp", "execute-pregrasp", "execute-final", "full", ONE_SHOT_MODE),
        default="observe-only",
    )
    parser.add_argument("--arm", choices=("right",), default="right")
    parser.add_argument("--output-dir", default="")
    parser.add_argument("--memory-json", default="")
    parser.add_argument("--report-json", default="")
    parser.add_argument("--world-frame", default="world")
    parser.add_argument("--frame", dest="world_frame", default=argparse.SUPPRESS)
    parser.add_argument("--right-tcp-frame", default="right_tcp")
    parser.add_argument("--right-base-xyz-m", default="0.0,-0.35,0.0")
    parser.add_argument("--right-base-rpy-deg", default="0.0,0.0,180.0")
    parser.add_argument("--static-transforms-file", default=str(DEFAULT_STATIC_TRANSFORMS))

    parser.add_argument("--color-topic", default="/right_camera_rgb/color/image_raw")
    parser.add_argument("--depth-topic", default="/right_camera/depth/image_raw")
    parser.add_argument("--camera-info-topic", default="/right_camera/depth/camera_info")
    parser.add_argument("--detections-topic", default="/detector/right_rgb/detections")
    parser.add_argument("--snapshot-timeout-sec", type=float, default=5.0)
    parser.add_argument("--max-image-time-delta-sec", type=float, default=0.50)
    parser.add_argument("--assume-depth-aligned-to-rgb", action="store_true")
    parser.add_argument("--depth-unit-to-m", type=float, default=0.001)
    parser.add_argument("--min-depth-m", type=float, default=0.08)
    parser.add_argument("--max-depth-m", type=float, default=2.00)
    parser.add_argument("--target-class-id", type=int, default=2)
    parser.add_argument("--target-class-name", default="cocacola")
    parser.add_argument("--object-class", dest="target_class_name", default=argparse.SUPPRESS)
    parser.add_argument("--confidence-threshold", type=float, default=0.30)
    parser.add_argument("--one-shot-confidence-threshold", type=float, default=0.50)
    parser.add_argument("--min-roi-world-points", type=int, default=100)
    parser.add_argument("--manual-depth-pixel", default="")
    parser.add_argument("--manual-pick-radius-px", type=int, default=10)
    parser.add_argument("--manual-min-valid-points", type=int, default=5)
    parser.add_argument("--table-ransac-threshold-m", type=float, default=0.008)
    parser.add_argument("--table-ransac-iterations", type=int, default=220)
    parser.add_argument("--max-table-ransac-points", type=int, default=12000)
    parser.add_argument("--min-table-inliers", type=int, default=3000)
    parser.add_argument("--min-table-inlier-ratio", type=float, default=0.25)
    parser.add_argument("--min-object-depth-points", type=int, default=100)
    parser.add_argument("--max-optical-frame-normal-angle-deg", type=float, default=35.0)
    parser.add_argument("--depth-frame-auto", action="store_true")
    parser.add_argument("--runtime-table-plane-correction", action="store_true")
    parser.add_argument("--depth-only-fallback-when-unaligned", action="store_true")
    parser.add_argument("--single-object-tabletop", action="store_true")
    parser.add_argument("--auto-reobserve-at-pregrasp", action="store_true")

    parser.add_argument("--scene-publish-duration-sec", type=float, default=3.0)
    parser.add_argument("--scene-publish-hz", type=float, default=10.0)
    parser.add_argument("--raw-scene-topic", default="/scene_fusion/raw_scene_objects")
    parser.add_argument("--managed-scene-topic", default="/scene_fusion/scene_objects")
    parser.add_argument("--table-center-xy-m", default="0.55,0.0")
    parser.add_argument("--table-top-real-z", type=float, default=TABLE_TOP_REAL_Z)
    parser.add_argument("--table-top-collision-z", type=float, default=TABLE_TOP_COLLISION_Z)
    parser.add_argument("--coke-radius", type=float, default=COKE_RADIUS_M)
    parser.add_argument("--coke-height", type=float, default=COKE_HEIGHT_M)
    parser.add_argument("--collision-radius", type=float, default=COKE_COLLISION_RADIUS_M)
    parser.add_argument("--collision-height", type=float, default=COKE_COLLISION_HEIGHT_M)
    parser.add_argument("--workspace-x-m", default="0.20,0.95")
    parser.add_argument("--workspace-y-m", default="-0.55,0.55")

    parser.add_argument("--arm-group", default="right_arm")
    parser.add_argument("--plan-timeout-sec", type=float, default=12.0)
    parser.add_argument("--execute-timeout-sec", type=float, default=60.0)
    parser.add_argument("--state-timeout-sec", type=float, default=5.0)
    parser.add_argument("--post-execute-settle-sec", type=float, default=1.0)
    parser.add_argument(
        "--execute-final-start-stage",
        choices=("pregrasp_high", "pregrasp_low", "grasp"),
        default="pregrasp_high",
        help="Recovery-only start point for execute-final after a verified partial live run.",
    )
    parser.add_argument("--right-gripper-slave-id", type=int, default=10)
    parser.add_argument("--gripper-open-position", type=int, default=0)
    parser.add_argument("--gripper-close-position", type=int, default=220)
    parser.add_argument("--gripper-speed", type=int, default=20)
    parser.add_argument("--gripper-torque", type=int, default=80)
    parser.add_argument("--gripper-status-timeout-sec", type=float, default=8.0)
    parser.add_argument("--trajectory-point-multiplier", type=int, default=4)
    parser.add_argument("--execution-profile", default="observe_remember_grasp_low_speed")
    parser.add_argument("--speed-scale", type=float, default=1.0)
    parser.add_argument("--cartesian-speed-scale", type=float, default=1.0)
    parser.add_argument("--effective-gripper-opening-m", type=float, default=0.0)

    parser.add_argument("--rend-frame", default="Rend")
    parser.add_argument("--static-right-tcp-frame", default="Rtcp")
    parser.add_argument("--rend-to-pinch-center-xyz-m", default="")
    parser.add_argument("--rend-to-pinch-center-rpy-deg", default="0.0,0.0,0.0")
    parser.add_argument("--target-rpy-deg", default="")

    parser.add_argument("--operator-confirm-memory", action="store_true")
    parser.add_argument("--operator-confirm-scene", action="store_true")
    parser.add_argument("--operator-confirm-pregrasp", action="store_true")
    parser.add_argument(
        "--plan-stage",
        choices=("pregrasp_high", "pregrasp_low", "grasp", "lift"),
        default="pregrasp_high",
        help="Plan-only target stage for plan-pregrasp diagnostics.",
    )
    return parser.parse_args()


class ObserveRememberGraspNode(Node):
    def __init__(self, args: argparse.Namespace) -> None:
        super().__init__("observe_remember_grasp_node")
        if args.mode == ONE_SHOT_MODE:
            args.depth_frame_auto = True
            args.runtime_table_plane_correction = True
            args.depth_only_fallback_when_unaligned = True
            args.single_object_tabletop = True
        self._args = args
        self._bridge = CvBridge()
        self._color_msg: Optional[Image] = None
        self._depth_msg: Optional[Image] = None
        self._camera_info: Optional[CameraInfo] = None
        self._detections_msg: Optional[Bbox2dArray] = None
        self._latest_state: Optional[RobotState] = None
        self._scene_version = 1

        self.create_subscription(Image, args.color_topic, self._color_cb, qos_profile_sensor_data)
        self.create_subscription(Image, args.depth_topic, self._depth_cb, qos_profile_sensor_data)
        self.create_subscription(CameraInfo, args.camera_info_topic, self._camera_info_cb, 10)
        self.create_subscription(Bbox2dArray, args.detections_topic, self._detections_cb, 10)
        self.create_subscription(RobotState, "/R/robot_state", self._robot_state_cb, 10)

        self._raw_scene_pub = self.create_publisher(SceneObjectArray, args.raw_scene_topic, 10)
        self._managed_scene_pub = self.create_publisher(SceneObjectArray, args.managed_scene_topic, 10)
        self._plan_pose_client = self.create_client(PlanPose, "/planning/plan_pose")
        self._set_gripper_client = self.create_client(SetGripper, "/execution/set_gripper")
        self._right_gripper_status_client = self.create_client(GripperStatusSrv, "/gripper1/epg50_gripper/status")
        self._set_interaction_client = self.create_client(SetObjectInteraction, "/scene/set_object_interaction")
        self._attach_client = self.create_client(AttachObject, "/scene/attach_object")
        self._execute_client = ActionClient(self, ExecuteTrajectory, "/execution/execute_trajectory")
        self._tf_buffer = Buffer()
        self._tf_listener = TransformListener(self._tf_buffer, self)

        self._output_dir = self._resolve_output_dir()
        self._output_dir.mkdir(parents=True, exist_ok=True)
        self._memory_path = Path(args.memory_json) if args.memory_json else self._output_dir / "coke_can_memory.json"
        self._report_path = Path(args.report_json) if args.report_json else self._output_dir / "report.json"
        self._report: dict[str, Any] = {
            "schema_version": 1,
            "created_at": datetime.now().isoformat(timespec="seconds"),
            "mode": args.mode,
            "result": "running",
            "failure_stage": "",
            "robot_motion_executed": False,
            "gripper_command_sent": False,
            "gripper_closed": False,
            "lift_executed": False,
            "pregrasp_plan_success": False,
            "executed_pregrasp_high": False,
            "executed_final_approach": False,
            "used_depth_only_segmentation": False,
            "runtime_table_plane_correction": False,
            "status": "in_progress",
            "output_dir": str(self._output_dir),
            "memory_json": str(self._memory_path),
            "runtime_parameters": {
                "arm": args.arm,
                "world_frame": args.world_frame,
                "target_class_name": args.target_class_name,
                "table_top_real_z_m": float(args.table_top_real_z),
                "table_top_collision_z_m": float(args.table_top_collision_z),
                "coke_radius_m": float(args.coke_radius),
                "coke_height_m": float(args.coke_height),
                "collision_radius_m": float(args.collision_radius),
                "collision_height_m": float(args.collision_height),
                "speed_scale": float(args.speed_scale),
                "cartesian_speed_scale": float(args.cartesian_speed_scale),
                "effective_gripper_opening_m": float(args.effective_gripper_opening_m),
            },
            "forbidden_runtime_call_classes": [
                "raw_right_arm_motion_services",
                "raw_right_arm_servo_services",
                "direct_epg50_gripper_command",
                "competition_run_action",
            ],
            "steps": [],
        }

    def _color_cb(self, message: Image) -> None:
        self._color_msg = message

    def _depth_cb(self, message: Image) -> None:
        self._depth_msg = message

    def _camera_info_cb(self, message: CameraInfo) -> None:
        self._camera_info = message

    def _detections_cb(self, message: Bbox2dArray) -> None:
        self._detections_msg = message

    def _robot_state_cb(self, message: RobotState) -> None:
        self._latest_state = message

    def run(self) -> int:
        try:
            if self._args.arm != "right":
                return self._finish("unsupported_arm", 2)
            if self._args.mode == "full" and not self._full_token_matches():
                return self._finish("full_mode_token_rejected", 2)
            if self._args.mode in EXECUTION_MODES and not self._hardware_token_matches():
                return self._finish("hardware_token_rejected", 3)
            if self._args.mode == ONE_SHOT_MODE:
                return self._run_one_shot_live()

            memory = self._memory_for_mode()
            if memory is None:
                return self._finish("memory_unavailable", 4)

            if self._args.mode == "observe-only":
                return self._finish("observe_only_completed", 0)

            if not self._workspace_gate(memory):
                return self._finish("workspace_gate_failed", 5)

            if self._args.mode in {"plan-pregrasp", "execute-pregrasp", "execute-final", "full"}:
                if not self._args.operator_confirm_memory:
                    return self._finish("operator_memory_confirmation_missing", 6)

            scene_include_coke = not (self._args.mode == "plan-pregrasp" and self._args.plan_stage in {"grasp", "lift"})
            scene = self._build_scene(memory, include_coke=scene_include_coke)
            self._publish_scene(scene, self._args.scene_publish_duration_sec)
            if self._args.mode == "publish-scene":
                return self._finish("publish_scene_completed", 0)

            if self._args.mode in EXECUTION_MODES and not self._args.operator_confirm_scene:
                return self._finish("operator_scene_confirmation_missing", 7)

            if not self._wait_for_robot_state():
                return self._finish("robot_state_unavailable", 8)
            if self._args.mode in EXECUTION_MODES and not self._robot_ready():
                return self._finish("robot_state_not_ready", 9)
            if not self._wait_for_plan_service():
                return self._finish("plan_pose_unavailable", 10)

            transform_context = self._build_transform_context()
            if transform_context is None:
                return self._finish("target_transform_unavailable", 11)

            targets = self._build_motion_targets(memory, transform_context)
            if not self._motion_target_gate(targets):
                return self._finish("motion_target_gate_failed", 12)

            if self._args.mode == "plan-pregrasp":
                plan_stage = str(self._args.plan_stage)
                response = self._plan_target(targets[plan_stage])
                if response is None:
                    return self._finish(f"{plan_stage}_plan_timeout", 13)
                self._record_plan_response(plan_stage, response)
                return self._finish(f"plan_{plan_stage}_completed" if response.success else f"{plan_stage}_plan_failed", 0 if response.success else 14)

            if self._args.mode in {"execute-pregrasp", "full"}:
                if not self._execution_gate(transform_context, require_pinch_offset=True):
                    return self._finish("execution_gate_failed", 15)
                if not self._execute_planned_target(targets["pregrasp_high"]):
                    return self._finish("pregrasp_high_execute_failed", 16)
                if self._args.mode == "execute-pregrasp":
                    return self._finish("execute_pregrasp_completed_wait_operator", 0)

            if self._args.mode == "execute-final" and not self._args.operator_confirm_pregrasp:
                return self._finish("operator_pregrasp_confirmation_missing", 17)
            if self._args.mode == "execute-final":
                if not self._execution_gate(transform_context, require_pinch_offset=True):
                    return self._finish("execution_gate_failed", 15)

            if self._args.mode in {"execute-final", "full"}:
                final_status, final_code = self._execute_final_sequence(memory, targets)
                return self._finish(final_status, final_code)

            return self._finish(f"unsupported_mode_{self._args.mode}", 18)
        except Exception as exc:  # pylint: disable=broad-except
            self._report["error"] = {"type": exc.__class__.__name__, "message": str(exc)}
            return self._finish("exception", 99)

    def _run_one_shot_live(self) -> int:
        self._report["one_shot_live_policy"] = {
            "runtime_table_plane_correction": True,
            "depth_only_fallback_when_unaligned": True,
            "manual_depth_pixel_allowed": False,
            "calibration_status": RUNTIME_TABLE_CORRECTED_STATUS,
        }
        if not self._wait_for_robot_state():
            return self._finish("robot_state_unavailable", 8)
        if not self._robot_ready():
            return self._finish("robot_state_not_ready", 9)
        if not self._wait_for_plan_service():
            return self._finish("plan_pose_unavailable", 10)

        transform_context = self._build_transform_context()
        if transform_context is None:
            return self._finish("target_transform_unavailable", 11)
        if not self._execution_gate(transform_context, require_pinch_offset=True):
            return self._finish("execution_gate_failed", 15)
        if not self._one_shot_gripper_opening_gate():
            return self._finish("gripper_opening_too_small_for_coke_can", 30)

        self._publish_scene(self._build_scene({}, include_coke=False), max(1.0, float(self._args.scene_publish_duration_sec)))
        if not self._set_gripper_open():
            return self._finish("gripper_open_failed", 31)

        memory = self._observe_table_corrected_memory(source="one_shot_live_depth_table_segmentation")
        if memory is None:
            return self._finish("one_shot_observe_failed", 32)
        if not self._workspace_gate(memory):
            return self._finish("workspace_gate_failed", 5)

        self._publish_scene(self._build_scene(memory, include_coke=True), self._args.scene_publish_duration_sec)
        targets = self._build_motion_targets(memory, transform_context)
        if not self._motion_target_gate(targets):
            return self._finish("motion_target_gate_failed", 12)

        pregrasp_plan = self._plan_target(targets["pregrasp_high"])
        if pregrasp_plan is None:
            self._report["pregrasp_plan_success"] = False
            self._report["steps"].append({"name": "pregrasp_high", "type": "plan_pose", "success": False, "reason": "timeout"})
            return self._finish("pregrasp_high_plan_timeout", 13)
        self._record_plan_response("pregrasp_high", pregrasp_plan)
        self._report["pregrasp_plan_success"] = bool(pregrasp_plan.success)
        if not bool(pregrasp_plan.success):
            return self._finish("pregrasp_high_plan_failed", 14)
        if not self._execute_plan_response("pregrasp_high", pregrasp_plan):
            return self._finish("pregrasp_high_execute_failed", 16)
        self._report["executed_pregrasp_high"] = True

        if not self._robot_ready():
            return self._finish("robot_state_not_ready_after_pregrasp_high", 33)

        if self._args.auto_reobserve_at_pregrasp:
            refreshed = self._observe_table_corrected_memory(source="one_shot_live_pregrasp_reobserve")
            if refreshed is None:
                return self._finish("pregrasp_reobserve_failed", 34)
            xy_delta = float(
                np.linalg.norm(
                    np.asarray(refreshed["center_xyz_m"][:2], dtype=np.float64)
                    - np.asarray(memory["center_xyz_m"][:2], dtype=np.float64)
                )
            )
            self._report["pregrasp_reobserve"] = {
                "success": True,
                "xy_delta_m": xy_delta,
                "max_allowed_xy_delta_m": 0.030,
            }
            if xy_delta >= 0.030:
                return self._finish("pregrasp_reobserve_correction_too_large", 35)
            memory = refreshed
            if not self._workspace_gate(memory):
                return self._finish("workspace_gate_failed_after_reobserve", 36)
            self._publish_scene(self._build_scene(memory, include_coke=True), self._args.scene_publish_duration_sec)
            targets = self._build_motion_targets(memory, transform_context)
            if not self._motion_target_gate(targets):
                return self._finish("motion_target_gate_failed_after_reobserve", 37)

        if not self._execute_planned_target(targets["pregrasp_low"]):
            return self._finish("pregrasp_low_execute_failed", 20)

        self._publish_scene(self._build_scene(memory, include_coke=False), 1.6)
        self._report["steps"].append(
            {
                "name": "remove_coke_collision_before_grasp",
                "type": "publish_scene",
                "success": True,
                "removed_object_id": "coke_can_snapshot",
                "kept_object_id": "table_surface_manual",
            }
        )

        if not self._execute_planned_target(targets["grasp"]):
            return self._finish("grasp_execute_failed", 22)
        self._report["executed_final_approach"] = True

        if not self._set_gripper_close():
            return self._finish("gripper_close_failed", 23)
        close_status = self._wait_gripper_contact()
        gobj = None if close_status is None else int(close_status.get("gobj", -1))
        contact_ok = bool(close_status and int(close_status.get("gobj", -1)) in (1, 2))
        self._report["gobj"] = gobj
        self._report["grasp_contact_gate"] = {
            "passes": contact_ok,
            "rule": "gobj in {1,2} required before lift",
            "status": close_status,
        }
        if not contact_ok:
            return self._finish("grasp_contact_not_verified_no_lift", 24)

        attached = self._attach_coke_for_lift(memory)
        self._report["attach_or_remove_for_lift"] = attached
        if not self._execute_planned_target(targets["lift"]):
            return self._finish("lift_execute_failed", 25)
        self._report["lift_executed"] = True
        self._report["lift_distance_m"] = 0.150
        return self._finish("one_shot_live_completed", 0)

    def _one_shot_gripper_opening_gate(self) -> bool:
        opening = float(self._args.effective_gripper_opening_m)
        passes = opening >= 0.070
        self._report["gripper_opening_gate"] = {
            "passes": bool(passes),
            "effective_gripper_opening_m": opening,
            "min_required_opening_m": 0.070,
            "reason": "" if passes else "gripper opening too small for side grasp coke can",
        }
        return bool(passes)

    def _memory_for_mode(self) -> Optional[dict[str, Any]]:
        if self._args.mode in {"observe-only", "full"}:
            return self._observe_and_write_memory()
        if self._memory_path.is_file():
            memory = load_json(self._memory_path)
            self._report["steps"].append({"name": "load_memory", "success": True, "path": str(self._memory_path)})
            return memory
        if self._args.mode in {"publish-scene", "plan-pregrasp"}:
            return self._observe_and_write_memory()
        self._report["steps"].append({"name": "load_memory", "success": False, "path": str(self._memory_path)})
        return None

    def _observe_and_write_memory(self) -> Optional[dict[str, Any]]:
        bundle = self._wait_for_snapshot()
        if bundle is None:
            self._report["steps"].append({"name": "observe_snapshot", "success": False, "reason": "timeout"})
            return None

        color = self._bridge.imgmsg_to_cv2(bundle.color_msg, desired_encoding="bgr8")
        depth_raw = self._bridge.imgmsg_to_cv2(bundle.depth_msg, desired_encoding="passthrough")
        if depth_raw.ndim == 3:
            depth_raw = depth_raw[:, :, 0]
        depth_m = depth_image_to_meters(depth_raw, bundle.depth_msg.encoding, self._args.depth_unit_to_m)
        if color.shape[:2] != depth_m.shape[:2]:
            depth_vis_for_overlay = cv2.resize(
                make_depth_vis(depth_m),
                (color.shape[1], color.shape[0]),
                interpolation=cv2.INTER_NEAREST,
            )
        else:
            depth_vis_for_overlay = make_depth_vis(depth_m)

        detection = choose_detection(bundle.detections_msg, self._args)
        alignment = self._rgb_depth_alignment(bundle, color.shape, depth_m.shape)
        self._report["rgb_depth_alignment"] = alignment
        selection_mode = "none"
        roi = None
        valid_world = np.empty((0, 3), dtype=np.float64)
        raw_world = np.empty((0, 3), dtype=np.float64)
        tf_matrix, tf_detail = self._lookup_depth_to_world(bundle)
        if tf_matrix is None:
            self._report["steps"].append({"name": "lookup_depth_to_world", "success": False, "detail": tf_detail})
            self._write_manual_overlay(color, depth_vis_for_overlay, detection, None, "world_tf_missing")
            return None

        if detection is not None and alignment["rgb_depth_aligned"]:
            roi = detection.central_roi(depth_m.shape[1], depth_m.shape[0])
            raw_world, valid_world = self._points_from_roi(depth_m, bundle.camera_info, roi, tf_matrix, self._args.min_roi_world_points)
            selection_mode = "yolo_center_roi"

        manual_pixel = parse_optional_pair(self._args.manual_depth_pixel)
        need_manual = (
            detection is None
            or not alignment["rgb_depth_aligned"]
            or int(valid_world.shape[0]) < int(self._args.min_roi_world_points)
        )
        if need_manual:
            if manual_pixel is None:
                reason = "manual_depth_pixel_required"
                if detection is None:
                    reason = "target_detection_missing_manual_depth_pixel_required"
                elif not alignment["rgb_depth_aligned"]:
                    reason = "rgb_depth_not_aligned_manual_depth_pixel_required"
                elif int(valid_world.shape[0]) < int(self._args.min_roi_world_points):
                    reason = "roi_valid_points_below_100_manual_depth_pixel_required"
                self._write_manual_overlay(color, depth_vis_for_overlay, detection, roi, reason)
                self._report["steps"].append(
                    {
                        "name": "observe_memory",
                        "success": False,
                        "reason": reason,
                        "roi_valid_world_points": int(valid_world.shape[0]),
                    }
                )
                return None
            roi = roi_around_pixel(manual_pixel, depth_m.shape[1], depth_m.shape[0], int(self._args.manual_pick_radius_px))
            raw_world, valid_world = self._points_from_roi(
                depth_m,
                bundle.camera_info,
                roi,
                tf_matrix,
                int(self._args.manual_min_valid_points),
            )
            selection_mode = "manual_depth_pixel"
            if int(valid_world.shape[0]) < int(self._args.manual_min_valid_points):
                self._write_manual_overlay(color, depth_vis_for_overlay, detection, roi, "manual_depth_pixel_invalid")
                self._report["steps"].append(
                    {
                        "name": "manual_depth_pixel",
                        "success": False,
                        "valid_world_points": int(valid_world.shape[0]),
                    }
                )
                return None

        if int(valid_world.shape[0]) <= 0:
            self._write_manual_overlay(color, depth_vis_for_overlay, detection, roi, "no_valid_world_points")
            return None

        surface_xy = np.median(valid_world[:, :2], axis=0)
        camera_origin_world = tf_matrix[:3, 3]
        view_vec = surface_xy - camera_origin_world[:2]
        view_dir = normalize_xy(view_vec)
        if view_dir is None:
            self._report["steps"].append({"name": "estimate_view_dir", "success": False})
            return None
        center_xy = surface_xy + 0.7 * COKE_RADIUS_M * view_dir
        center_xyz = np.array([center_xy[0], center_xy[1], COKE_CENTER_Z_M], dtype=np.float64)

        memory = {
            "schema_version": 1,
            "created_at": datetime.now().isoformat(timespec="seconds"),
            "frame_id": "world",
            "object_id": "coke_can_snapshot",
            "center_xyz_m": center_xyz.tolist(),
            "surface_xy_m": surface_xy.tolist(),
            "radius_m": COKE_RADIUS_M,
            "height_m": COKE_HEIGHT_M,
            "view_dir_xy": view_dir.tolist(),
            "grasp_dir_xy": view_dir.tolist(),
            "table_top_real_z_m": TABLE_TOP_REAL_Z,
            "table_top_collision_z_m": TABLE_TOP_COLLISION_Z,
            "calibration_status": CALIBRATION_STATUS,
            "debug": {
                "rgb_depth_aligned": bool(alignment["rgb_depth_aligned"]),
                "rgb_depth_alignment": alignment,
                "depth_selection_mode": selection_mode,
                "target_detection": None if detection is None else detection.to_dict(),
                "roi_xyxy": None if roi is None else [int(value) for value in roi],
                "roi_valid_world_points": int(valid_world.shape[0]),
                "roi_raw_world_points": int(raw_world.shape[0]),
                "world_z_filter_m": [-0.055, 0.090],
                "camera_origin_world_m": camera_origin_world.tolist(),
                "depth_to_world_tf": tf_detail,
            },
        }
        self._memory_path.write_text(json.dumps(to_jsonable(memory), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        self._write_observation_artifacts(color, depth_vis_for_overlay, detection, roi, raw_world, valid_world, memory)
        self._report["steps"].append(
            {
                "name": "observe_memory",
                "success": True,
                "memory_json": str(self._memory_path),
                "selection_mode": selection_mode,
                "roi_valid_world_points": int(valid_world.shape[0]),
            }
        )
        return memory

    def _observe_table_corrected_memory(self, source: str) -> Optional[dict[str, Any]]:
        bundle = self._wait_for_snapshot()
        if bundle is None:
            self._report["steps"].append({"name": source, "success": False, "reason": "timeout"})
            return None

        color = self._bridge.imgmsg_to_cv2(bundle.color_msg, desired_encoding="bgr8")
        depth_raw = self._bridge.imgmsg_to_cv2(bundle.depth_msg, desired_encoding="passthrough")
        if depth_raw.ndim == 3:
            depth_raw = depth_raw[:, :, 0]
        depth_m = depth_image_to_meters(depth_raw, bundle.depth_msg.encoding, self._args.depth_unit_to_m)
        depth_vis = make_depth_vis(depth_m)
        if color.shape[:2] != depth_m.shape[:2]:
            depth_vis_for_overlay = cv2.resize(depth_vis, (color.shape[1], color.shape[0]), interpolation=cv2.INTER_NEAREST)
        else:
            depth_vis_for_overlay = depth_vis

        detection = choose_detection(bundle.detections_msg, self._args)
        if detection is None or float(detection.score) < float(self._args.one_shot_confidence_threshold):
            self._write_manual_overlay(color, depth_vis_for_overlay, detection, None, "cocacola_detector_confidence_too_low")
            self._report["steps"].append(
                {
                    "name": source,
                    "success": False,
                    "reason": "cocacola_detector_confidence_too_low",
                    "threshold": float(self._args.one_shot_confidence_threshold),
                    "detection": None if detection is None else detection.to_dict(),
                }
            )
            return None

        alignment = self._rgb_depth_alignment(bundle, color.shape, depth_m.shape)
        self._report["rgb_depth_alignment"] = alignment
        self._report["rgb_depth_aligned"] = bool(alignment["rgb_depth_aligned"])
        self._report["detected_class"] = self._args.target_class_name
        self._report["yolo_score"] = float(detection.score)

        cloud = unproject_depth_image(
            depth_m,
            bundle.camera_info,
            float(self._args.min_depth_m),
            float(self._args.max_depth_m),
        )
        if int(cloud.points_cam.shape[0]) < int(self._args.min_table_inliers):
            self._report["steps"].append(
                {
                    "name": source,
                    "success": False,
                    "reason": "not_enough_depth_points_for_table_fit",
                    "depth_points": int(cloud.points_cam.shape[0]),
                    "min_required": int(self._args.min_table_inliers),
                }
            )
            return None

        plane = fit_table_plane_ransac(
            cloud.points_cam,
            threshold_m=float(self._args.table_ransac_threshold_m),
            iterations=int(self._args.table_ransac_iterations),
            max_sample_points=int(self._args.max_table_ransac_points),
        )
        if plane is None:
            self._report["steps"].append({"name": source, "success": False, "reason": "table_plane_fit_failed"})
            return None
        table_passes = (
            plane.inlier_count >= int(self._args.min_table_inliers)
            and plane.inlier_ratio >= float(self._args.min_table_inlier_ratio)
        )
        self._report["table_plane_fit"] = {
            "passes": bool(table_passes),
            "normal_cam": plane.normal.tolist(),
            "offset_m": float(plane.offset),
            "inlier_count": int(plane.inlier_count),
            "inlier_ratio": float(plane.inlier_ratio),
            "median_residual_m": float(plane.median_residual_m),
            "threshold_m": float(self._args.table_ransac_threshold_m),
        }
        if not table_passes:
            self._report["steps"].append({"name": source, "success": False, "reason": "table_plane_quality_gate_failed"})
            return None

        tf_candidate, tf_detail = self._resolve_depth_optical_to_world(bundle, plane.normal)
        if tf_candidate is None:
            self._report["steps"].append({"name": source, "success": False, "reason": "depth_optical_to_world_unavailable", "detail": tf_detail})
            return None

        runtime_tf, runtime_detail = make_runtime_table_corrected_tf(
            tf_candidate,
            plane.normal,
            plane.table_points_cam,
            table_top_real_z=float(self._args.table_top_real_z),
        )
        self._report["runtime_table_plane_correction"] = True
        self._report["calibration_status"] = RUNTIME_TABLE_CORRECTED_STATUS
        self._report["runtime_table_correction"] = {
            **runtime_detail,
            "candidate_tf": tf_detail,
            "runtime_tf": matrix_to_dict(runtime_tf),
        }

        if alignment["rgb_depth_aligned"]:
            roi = detection.central_roi(depth_m.shape[1], depth_m.shape[0])
            segmented = segment_object_from_yolo_roi(
                cloud,
                plane,
                roi,
                min_points=int(self._args.min_object_depth_points),
            )
        else:
            roi = None
            segmented = segment_single_tabletop_object_depth_only(
                cloud,
                plane,
                min_points=int(self._args.min_object_depth_points),
                single_object_required=bool(self._args.single_object_tabletop),
            )

        used_depth_only = not bool(alignment["rgb_depth_aligned"])
        self._report["used_depth_only_segmentation"] = bool(used_depth_only)
        if segmented is None or int(segmented.points_cam.shape[0]) < int(self._args.min_object_depth_points):
            failed_mask = np.zeros(depth_m.shape[:2], dtype=np.uint8) if segmented is None else segmented.mask
            self._report["object_segmentation"] = None if segmented is None else segmented.debug
            self._write_table_corrected_artifacts(
                color,
                depth_vis_for_overlay,
                detection,
                roi,
                np.empty((0, 3), dtype=np.float64),
                np.empty((0, 3), dtype=np.float64),
                failed_mask,
                None,
            )
            self._report["steps"].append(
                {
                    "name": source,
                    "success": False,
                    "reason": "not_enough_valid_object_depth_points",
                    "object_points": 0 if segmented is None else int(segmented.points_cam.shape[0]),
                    "min_required": int(self._args.min_object_depth_points),
                }
            )
            return None

        object_points_world = transform_points(runtime_tf, segmented.points_cam)
        table_points_world = transform_points(runtime_tf, plane.table_points_cam)
        world_height = object_points_world[:, 2] - float(self._args.table_top_real_z)
        world_height_gate = bool(
            np.isfinite(world_height).all()
            and float(np.median(world_height)) > 0.005
            and float(np.median(world_height)) < 0.170
        )
        self._report["runtime_corrected_object_world_height_gate"] = {
            "passes": world_height_gate,
            "median_height_above_table_m": float(np.median(world_height)) if world_height.size else None,
            "p05_m": float(np.percentile(world_height, 5.0)) if world_height.size else None,
            "p95_m": float(np.percentile(world_height, 95.0)) if world_height.size else None,
        }
        if not world_height_gate:
            self._report["steps"].append({"name": source, "success": False, "reason": "runtime_corrected_world_height_sanity_failed"})
            return None

        surface_xy = np.median(object_points_world[:, :2], axis=0)
        camera_origin_world = runtime_tf[:3, 3]
        view_dir = normalize_xy(surface_xy - camera_origin_world[:2])
        if view_dir is None:
            self._report["steps"].append({"name": source, "success": False, "reason": "estimate_view_dir_failed"})
            return None

        center_xy = surface_xy + 0.7 * float(self._args.coke_radius) * view_dir
        center_z = float(self._args.table_top_real_z) + float(self._args.coke_height) / 2.0
        center_xyz = np.array([center_xy[0], center_xy[1], center_z], dtype=np.float64)

        memory = {
            "schema_version": 1,
            "created_at": datetime.now().isoformat(timespec="seconds"),
            "object_id": "coke_can_snapshot",
            "class_name": self._args.target_class_name,
            "frame_id": self._args.world_frame,
            "source": source,
            "calibration_status": RUNTIME_TABLE_CORRECTED_STATUS,
            "center_xyz_m": center_xyz.tolist(),
            "surface_xy_m": surface_xy.tolist(),
            "radius_m": float(self._args.coke_radius),
            "height_m": float(self._args.coke_height),
            "view_dir_xy": view_dir.tolist(),
            "grasp_dir_xy": view_dir.tolist(),
            "table_top_real_z_m": float(self._args.table_top_real_z),
            "table_top_collision_z_m": float(self._args.table_top_collision_z),
            "debug": {
                "rgb_depth_aligned": bool(alignment["rgb_depth_aligned"]),
                "rgb_depth_alignment": alignment,
                "used_depth_only_segmentation": bool(used_depth_only),
                "runtime_table_correction": True,
                "depth_selection_mode": segmented.mode,
                "target_detection": detection.to_dict(),
                "yolo_score": float(detection.score),
                "roi_xyxy": None if roi is None else [int(value) for value in roi],
                "object_depth_points": int(segmented.points_cam.shape[0]),
                "table_plane": self._report["table_plane_fit"],
                "segmentation": segmented.debug,
                "runtime_tf": matrix_to_dict(runtime_tf),
                "camera_origin_world_m": camera_origin_world.tolist(),
            },
        }
        self._memory_path.write_text(json.dumps(to_jsonable(memory), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        self._write_table_corrected_artifacts(
            color,
            depth_vis_for_overlay,
            detection,
            roi,
            object_points_world,
            table_points_world,
            segmented.mask,
            memory,
        )
        self._report["coke_memory_frame"] = memory["frame_id"]
        self._report["steps"].append(
            {
                "name": source,
                "success": True,
                "memory_json": str(self._memory_path),
                "selection_mode": segmented.mode,
                "object_depth_points": int(segmented.points_cam.shape[0]),
                "rgb_depth_aligned": bool(alignment["rgb_depth_aligned"]),
            }
        )
        return memory

    def _wait_for_snapshot(self) -> Optional[ObservationBundle]:
        deadline = time.monotonic() + float(self._args.snapshot_timeout_sec)
        while rclpy.ok() and time.monotonic() < deadline:
            rclpy.spin_once(self, timeout_sec=0.1)
            if self._color_msg is not None and self._depth_msg is not None and self._camera_info is not None:
                return ObservationBundle(
                    color_msg=copy.deepcopy(self._color_msg),
                    depth_msg=copy.deepcopy(self._depth_msg),
                    camera_info=copy.deepcopy(self._camera_info),
                    detections_msg=copy.deepcopy(self._detections_msg) if self._detections_msg is not None else None,
                )
        return None

    def _rgb_depth_alignment(
        self,
        bundle: ObservationBundle,
        color_shape: tuple[int, ...],
        depth_shape: tuple[int, ...],
    ) -> dict[str, Any]:
        color_h, color_w = int(color_shape[0]), int(color_shape[1])
        depth_h, depth_w = int(depth_shape[0]), int(depth_shape[1])
        color_frame = bundle.color_msg.header.frame_id
        depth_frame = bundle.depth_msg.header.frame_id or bundle.camera_info.header.frame_id
        detections_frame = bundle.detections_msg.header.frame_id if bundle.detections_msg is not None else ""
        same_resolution = color_w == depth_w and color_h == depth_h
        camera_info_matches_depth = (
            int(bundle.camera_info.width) in (0, depth_w)
            and int(bundle.camera_info.height) in (0, depth_h)
        )
        stamp_delta = abs(stamp_to_sec(bundle.color_msg.header.stamp) - stamp_to_sec(bundle.depth_msg.header.stamp))
        frame_proves_alignment = bool(depth_frame and (color_frame == depth_frame or detections_frame == depth_frame))
        aligned = bool(
            same_resolution
            and camera_info_matches_depth
            and stamp_delta <= float(self._args.max_image_time_delta_sec)
            and (frame_proves_alignment or self._args.assume_depth_aligned_to_rgb)
        )
        return {
            "rgb_depth_aligned": aligned,
            "same_resolution": bool(same_resolution),
            "camera_info_matches_depth": bool(camera_info_matches_depth),
            "stamp_delta_sec": float(stamp_delta),
            "max_allowed_stamp_delta_sec": float(self._args.max_image_time_delta_sec),
            "color_frame_id": str(color_frame),
            "depth_frame_id": str(depth_frame),
            "detections_frame_id": str(detections_frame),
            "frame_proves_alignment": bool(frame_proves_alignment),
            "operator_assumed_alignment": bool(self._args.assume_depth_aligned_to_rgb),
            "policy": "YOLO depth lookup is enabled only when this object reports rgb_depth_aligned=true",
        }

    def _lookup_depth_to_world(self, bundle: ObservationBundle) -> tuple[Optional[np.ndarray], dict[str, Any]]:
        source_frame = bundle.depth_msg.header.frame_id or bundle.camera_info.header.frame_id
        if not source_frame:
            return None, {"reason": "depth_frame_missing"}
        try:
            transform = self._tf_buffer.lookup_transform(
                self._args.world_frame,
                source_frame,
                Time(),
                timeout=Duration(seconds=1.0),
            )
        except Exception as exc:  # pylint: disable=broad-except
            return None, {"source_frame": source_frame, "target_frame": self._args.world_frame, "error": str(exc)}
        matrix = transform_to_matrix(transform.transform.translation, transform.transform.rotation)
        return matrix, {
            "source_frame": source_frame,
            "target_frame": self._args.world_frame,
            "translation_m": matrix[:3, 3].tolist(),
            "quaternion_xyzw": [
                float(transform.transform.rotation.x),
                float(transform.transform.rotation.y),
                float(transform.transform.rotation.z),
                float(transform.transform.rotation.w),
            ],
        }

    def _resolve_depth_optical_to_world(self, bundle: ObservationBundle, plane_normal_cam: np.ndarray) -> tuple[Optional[np.ndarray], dict[str, Any]]:
        frame_candidates: list[tuple[str, str, str]] = []
        preferred = bundle.camera_info.header.frame_id or bundle.depth_msg.header.frame_id
        depth_frame = bundle.depth_msg.header.frame_id or bundle.camera_info.header.frame_id
        for label, frame, optical_rotation_mode in (
            ("camera_info_frame", preferred, "none"),
            ("right_camera_depth_optical_frame", "right_camera_depth_optical_frame", "none"),
            ("right_camera_color_optical_frame", "right_camera_color_optical_frame", "none"),
            ("depth_frame_standard_optical_rotation", depth_frame, "standard"),
            ("depth_frame_inverse_standard_optical_rotation", depth_frame, "inverse_standard"),
            ("depth_frame_positive_standard_optical_rotation", depth_frame, "positive_standard"),
        ):
            if frame:
                frame_candidates.append((label, frame, optical_rotation_mode))

        seen: set[tuple[str, str]] = set()
        evaluated: list[dict[str, Any]] = []
        best_matrix: Optional[np.ndarray] = None
        best_detail: Optional[dict[str, Any]] = None
        world_z = np.array([0.0, 0.0, 1.0], dtype=np.float64)
        standard_optical = make_transform(np.zeros(3, dtype=np.float64), rpy_matrix_deg(-90.0, 0.0, -90.0))
        inverse_standard_optical = np.linalg.inv(standard_optical)
        positive_standard_optical = make_transform(np.zeros(3, dtype=np.float64), rpy_matrix_deg(90.0, 0.0, 90.0))

        for label, frame, optical_rotation_mode in frame_candidates:
            key = (frame, optical_rotation_mode)
            if key in seen:
                continue
            seen.add(key)
            try:
                transform = self._tf_buffer.lookup_transform(
                    self._args.world_frame,
                    frame,
                    Time(),
                    timeout=Duration(seconds=1.0),
                )
            except Exception as exc:  # pylint: disable=broad-except
                evaluated.append({"label": label, "frame": frame, "success": False, "error": str(exc)})
                continue
            matrix = transform_to_matrix(transform.transform.translation, transform.transform.rotation)
            if optical_rotation_mode == "standard":
                matrix = matrix @ standard_optical
            elif optical_rotation_mode == "inverse_standard":
                matrix = matrix @ inverse_standard_optical
            elif optical_rotation_mode == "positive_standard":
                matrix = matrix @ positive_standard_optical
            raw_angle = angle_between_vectors(matrix[:3, :3] @ plane_normal_cam, world_z)
            detail = {
                "label": label,
                "frame": frame,
                "uses_standard_optical_rotation": bool(optical_rotation_mode != "none"),
                "optical_rotation_mode": optical_rotation_mode,
                "success": True,
                "raw_angle_deg": float(raw_angle),
                "translation_m": matrix[:3, 3].tolist(),
            }
            evaluated.append(detail)
            if best_detail is None or raw_angle < float(best_detail["raw_angle_deg"]):
                best_matrix = matrix
                best_detail = detail

        if best_matrix is None or best_detail is None:
            return None, {"reason": "no_tf_candidate_available", "candidates": evaluated}
        passes = float(best_detail["raw_angle_deg"]) < float(self._args.max_optical_frame_normal_angle_deg)
        result = {
            "passes": bool(passes),
            "selected": best_detail,
            "candidates": evaluated,
            "max_allowed_raw_angle_deg": float(self._args.max_optical_frame_normal_angle_deg),
        }
        if not passes:
            return None, {"reason": "optical_frame_normal_angle_gate_failed", **result}
        return best_matrix, result

    def _points_from_roi(
        self,
        depth_m: np.ndarray,
        camera_info: CameraInfo,
        roi: tuple[int, int, int, int],
        tf_matrix: np.ndarray,
        min_points: int,
    ) -> tuple[np.ndarray, np.ndarray]:
        x0, y0, x1, y1 = roi
        points_camera = backproject_roi(
            depth_m,
            camera_info,
            x0,
            y0,
            x1,
            y1,
            float(self._args.min_depth_m),
            float(self._args.max_depth_m),
        )
        raw_world = transform_points(tf_matrix, points_camera)
        if raw_world.size == 0:
            return raw_world, raw_world
        z = raw_world[:, 2]
        valid = raw_world[np.isfinite(z) & (z > -0.055) & (z < 0.090)]
        if int(valid.shape[0]) < int(min_points):
            return raw_world, valid
        return raw_world, valid

    def _write_observation_artifacts(
        self,
        color: np.ndarray,
        depth_vis: np.ndarray,
        detection: Optional[DetectionBox],
        roi: Optional[tuple[int, int, int, int]],
        raw_world: np.ndarray,
        valid_world: np.ndarray,
        memory: dict[str, Any],
    ) -> None:
        color_path = self._output_dir / "right_rgb_snapshot.jpg"
        depth_path = self._output_dir / "right_depth_snapshot_vis.jpg"
        overlay_path = self._output_dir / "coke_can_memory_overlay.jpg"
        points_path = self._output_dir / "coke_can_memory_points_world.npz"
        ply_path = self._output_dir / "coke_can_memory_valid_points_world.ply"
        cv2.imwrite(str(color_path), color)
        cv2.imwrite(str(depth_path), depth_vis)
        overlay = color.copy()
        if detection is not None:
            draw_detection(overlay, detection, (0, 220, 255))
        if roi is not None:
            draw_roi(overlay, roi, (0, 255, 0))
        cv2.putText(
            overlay,
            f"memory center world: {memory['center_xyz_m'][0]:.3f},{memory['center_xyz_m'][1]:.3f},{memory['center_xyz_m'][2]:.3f}",
            (12, max(24, overlay.shape[0] - 18)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.50,
            (255, 255, 255),
            1,
            cv2.LINE_AA,
        )
        cv2.imwrite(str(overlay_path), overlay)
        np.savez_compressed(points_path, raw_world_m=raw_world, valid_world_m=valid_world)
        write_ply(ply_path, valid_world)
        self._report["artifacts"] = {
            "right_rgb_snapshot": str(color_path),
            "right_depth_snapshot_vis": str(depth_path),
            "memory_overlay": str(overlay_path),
            "memory_points_npz": str(points_path),
            "memory_valid_points_ply": str(ply_path),
        }

    def _write_table_corrected_artifacts(
        self,
        color: np.ndarray,
        depth_vis: np.ndarray,
        detection: Optional[DetectionBox],
        roi: Optional[tuple[int, int, int, int]],
        object_points_world: np.ndarray,
        table_points_world: np.ndarray,
        object_mask: np.ndarray,
        memory: Optional[dict[str, Any]],
    ) -> None:
        color_path = self._output_dir / "right_rgb_snapshot.jpg"
        depth_path = self._output_dir / "right_depth_snapshot_vis.jpg"
        overlay_path = self._output_dir / "coke_can_memory_overlay.jpg"
        depth_overlay_path = self._output_dir / "coke_can_depth_object_overlay.jpg"
        mask_path = self._output_dir / "coke_can_depth_object_mask.png"
        points_path = self._output_dir / "coke_can_memory_points_world.npz"
        ply_path = self._output_dir / "coke_can_memory_valid_points_world.ply"

        cv2.imwrite(str(color_path), color)
        cv2.imwrite(str(depth_path), depth_vis)
        overlay = color.copy()
        if detection is not None:
            draw_detection(overlay, detection, (0, 220, 255))
        if roi is not None:
            draw_roi(overlay, roi, (0, 255, 0))
        if object_mask.shape[:2] == overlay.shape[:2] and np.any(object_mask):
            overlay[object_mask.astype(bool)] = (
                0.45 * overlay[object_mask.astype(bool)] + 0.55 * np.array([0, 255, 0], dtype=np.float64)
            ).astype(np.uint8)
        if memory is not None:
            cv2.putText(
                overlay,
                f"runtime center world: {memory['center_xyz_m'][0]:.3f},{memory['center_xyz_m'][1]:.3f},{memory['center_xyz_m'][2]:.3f}",
                (12, max(24, overlay.shape[0] - 18)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.50,
                (255, 255, 255),
                1,
                cv2.LINE_AA,
            )
        cv2.imwrite(str(overlay_path), overlay)

        mask_u8 = (object_mask.astype(np.uint8) * 255) if object_mask.size else np.zeros(depth_vis.shape[:2], dtype=np.uint8)
        cv2.imwrite(str(mask_path), mask_u8)
        depth_overlay = depth_vis.copy()
        if mask_u8.shape[:2] == depth_overlay.shape[:2] and np.any(mask_u8):
            active = mask_u8.astype(bool)
            depth_overlay[active] = (0.35 * depth_overlay[active] + 0.65 * np.array([0, 255, 0], dtype=np.float64)).astype(np.uint8)
        cv2.imwrite(str(depth_overlay_path), depth_overlay)

        np.savez_compressed(
            points_path,
            object_points_world_m=object_points_world,
            table_points_world_m=table_points_world,
        )
        write_ply(ply_path, object_points_world)
        self._report["artifacts"] = {
            "right_rgb_snapshot": str(color_path),
            "right_depth_snapshot_vis": str(depth_path),
            "memory_overlay": str(overlay_path),
            "depth_object_overlay": str(depth_overlay_path),
            "depth_object_mask": str(mask_path),
            "memory_points_npz": str(points_path),
            "memory_valid_points_ply": str(ply_path),
        }

    def _write_manual_overlay(
        self,
        color: np.ndarray,
        depth_vis: np.ndarray,
        detection: Optional[DetectionBox],
        roi: Optional[tuple[int, int, int, int]],
        reason: str,
    ) -> None:
        overlay = color.copy()
        if detection is not None:
            draw_detection(overlay, detection, (0, 220, 255))
        if roi is not None:
            draw_roi(overlay, roi, (0, 255, 0))
        cv2.putText(overlay, reason, (12, 28), cv2.FONT_HERSHEY_SIMPLEX, 0.58, (0, 0, 255), 2, cv2.LINE_AA)
        color_path = self._output_dir / "manual_depth_pick_rgb_overlay.jpg"
        depth_path = self._output_dir / "manual_depth_pick_depth_overlay.jpg"
        cv2.imwrite(str(color_path), overlay)
        cv2.imwrite(str(depth_path), depth_vis)
        self._report.setdefault("artifacts", {})
        self._report["artifacts"].update(
            {"manual_depth_pick_rgb_overlay": str(color_path), "manual_depth_pick_depth_overlay": str(depth_path)}
        )

    def _build_scene(self, memory: dict[str, Any], include_coke: bool) -> SceneObjectArray:
        stamp = self.get_clock().now().to_msg()
        scene = SceneObjectArray()
        scene.header = Header(stamp=stamp, frame_id=self._args.world_frame)
        scene.scene_version = self._scene_version
        table_xy = parse_floats(self._args.table_center_xy_m, 2)
        table_center_z = float(self._args.table_top_collision_z) - TABLE_THICKNESS_M / 2.0
        scene.objects.append(
            make_scene_object(
                object_id="table_surface_manual",
                semantic_type="table_surface",
                shape_type="box",
                position=[table_xy[0], table_xy[1], table_center_z],
                size=[1.2, 0.8, TABLE_THICKNESS_M],
                stamp=stamp,
                frame_id=self._args.world_frame,
                source="observe_remember_grasp_node",
                movable=False,
                graspable=False,
            )
        )
        if include_coke:
            center = [float(value) for value in memory["center_xyz_m"]]
            collision_center_z = float(self._args.table_top_real_z) + float(self._args.collision_height) / 2.0
            calibration_status = str(memory.get("calibration_status", CALIBRATION_STATUS))
            scene.objects.append(
                make_scene_object(
                    object_id="coke_can_snapshot",
                    semantic_type="coke_can",
                    shape_type="cylinder",
                    position=[center[0], center[1], collision_center_z],
                    size=[2.0 * float(self._args.collision_radius), 2.0 * float(self._args.collision_radius), float(self._args.collision_height)],
                    stamp=stamp,
                    frame_id=self._args.world_frame,
                    source="observe_remember_grasp_node",
                    movable=True,
                    graspable=True,
                    confidence=0.80,
                    subframes=[
                        ("pinch_center", [center[0], center[1], center[2]]),
                        ("body_center", [center[0], center[1], collision_center_z]),
                    ],
                    pose_source=calibration_status,
                )
            )
        return scene

    def _publish_scene(self, scene: SceneObjectArray, duration_sec: float) -> None:
        end = time.monotonic() + max(0.0, float(duration_sec))
        period = 1.0 / max(1.0, float(self._args.scene_publish_hz))
        count = 0
        while rclpy.ok() and time.monotonic() < end:
            stamp = self.get_clock().now().to_msg()
            scene.header.stamp = stamp
            for scene_object in scene.objects:
                scene_object.pose.header.stamp = stamp
                scene_object.last_seen = stamp
                for subframe in scene_object.subframes:
                    subframe.pose.header.stamp = stamp
            self._raw_scene_pub.publish(scene)
            self._managed_scene_pub.publish(scene)
            rclpy.spin_once(self, timeout_sec=0.01)
            count += 1
            time.sleep(period)
        self._report["steps"].append(
            {
                "name": "publish_scene",
                "success": True,
                "message_count": count,
                "object_ids": [item.id for item in scene.objects],
                "raw_scene_subscribers": self._raw_scene_pub.get_subscription_count(),
            }
        )

    def _workspace_gate(self, memory: dict[str, Any]) -> bool:
        center = [float(value) for value in memory.get("center_xyz_m", [])]
        x_range = parse_floats(self._args.workspace_x_m, 2)
        y_range = parse_floats(self._args.workspace_y_m, 2)
        passes = (
            len(center) == 3
            and x_range[0] <= center[0] <= x_range[1]
            and y_range[0] <= center[1] <= y_range[1]
            and abs(float(memory.get("table_top_real_z_m", 999.0)) - float(self._args.table_top_real_z)) < 1e-9
            and str(memory.get("frame_id")) == self._args.world_frame
        )
        self._report["workspace_gate"] = {
            "passes": bool(passes),
            "center_xyz_m": center,
            "workspace_x_m": x_range,
            "workspace_y_m": y_range,
            "required_frame_id": self._args.world_frame,
            "required_table_top_real_z_m": float(self._args.table_top_real_z),
        }
        return bool(passes)

    def _wait_for_robot_state(self) -> bool:
        deadline = time.monotonic() + float(self._args.state_timeout_sec)
        while rclpy.ok() and time.monotonic() < deadline:
            rclpy.spin_once(self, timeout_sec=0.1)
            if self._latest_state is not None:
                self._report["initial_robot_state"] = robot_state_to_dict(self._latest_state)
                return True
        return False

    def _robot_ready(self) -> bool:
        state = self._latest_state
        ready = bool(state is not None and state.motion_done and int(state.error_code) == 0)
        self._report["robot_ready_gate"] = {
            "passes": ready,
            "motion_done": None if state is None else bool(state.motion_done),
            "error_code": None if state is None else int(state.error_code),
        }
        return ready

    def _wait_for_plan_service(self) -> bool:
        available = self._plan_pose_client.wait_for_service(timeout_sec=5.0)
        self._report.setdefault("service_checks", {})["/planning/plan_pose"] = bool(available)
        return bool(available)

    def _execution_gate(self, transform_context: dict[str, Any], require_pinch_offset: bool) -> bool:
        checks: dict[str, Any] = {
            "/planning/plan_pose": self._plan_pose_client.wait_for_service(timeout_sec=1.0),
            "/execution/execute_trajectory": self._execute_client.wait_for_server(timeout_sec=3.0),
            "/execution/execute_trajectory_unique": self._execute_action_unique(),
            "/gripper1/epg50_gripper/status": self._right_gripper_status_client.wait_for_service(timeout_sec=2.0),
            "/execution/set_gripper": self._set_gripper_client.wait_for_service(timeout_sec=2.0),
            "pinch_offset_available": bool(transform_context["pinch_offset_available"]),
            "hardware_token": self._hardware_token_matches(),
        }
        status = self._read_gripper_status("execution_gate_gripper_status")
        checks["right_gripper_status_readable"] = bool(status and status.get("success") and int(status.get("error", -1)) == 0)
        if require_pinch_offset and not transform_context["pinch_offset_available"]:
            checks["pinch_offset_reason"] = "Rend_to_pinch_center is required for execution and gripper commands"
        passes = all(bool(value) for key, value in checks.items() if key != "pinch_offset_reason")
        self._report["execution_gate"] = {"passes": bool(passes), "checks": checks}
        return bool(passes)

    def _execute_action_unique(self) -> bool:
        send_goal = "/execution/execute_trajectory/_action/send_goal"
        names = [name for name, _types in self.get_service_names_and_types() if name == send_goal]
        return len(names) == 1

    def _build_transform_context(self) -> Optional[dict[str, Any]]:
        current_tcp_world, current_tcp_rotation = self._current_tcp_world_transform()
        if current_tcp_world is None or current_tcp_rotation is None:
            return None
        t_tcp_rend = load_static_transform(
            Path(self._args.static_transforms_file),
            self._args.static_right_tcp_frame,
            self._args.rend_frame,
        )
        if t_tcp_rend is None:
            t_tcp_rend = np.eye(4, dtype=np.float64)
            tcp_to_rend_status = "missing_identity_plan_debug_only"
        else:
            tcp_to_rend_status = "candidate_from_static_transforms"
        pinch_xyz = parse_optional_floats(self._args.rend_to_pinch_center_xyz_m, 3)
        pinch_offset_available = pinch_xyz is not None
        if pinch_xyz is None:
            t_rend_pinch = np.eye(4, dtype=np.float64)
            pinch_status = "missing_identity_plan_debug_only"
        else:
            t_rend_pinch = make_transform(
                np.asarray(pinch_xyz, dtype=np.float64),
                rpy_matrix_deg(*parse_floats(self._args.rend_to_pinch_center_rpy_deg, 3)),
            )
            pinch_status = "operator_supplied_not_calibration_verified"
        rpy_override = parse_optional_floats(self._args.target_rpy_deg, 3)
        if rpy_override is None:
            target_rotation = current_tcp_rotation
            orientation_source = "current_right_tcp_orientation"
        else:
            target_rotation = rpy_matrix_deg(*rpy_override)
            orientation_source = "operator_target_rpy_deg"
        context = {
            "current_tcp_world_m": current_tcp_world,
            "current_tcp_rotation": current_tcp_rotation,
            "target_rotation": target_rotation,
            "orientation_source": orientation_source,
            "t_tcp_rend": t_tcp_rend,
            "t_rend_pinch": t_rend_pinch,
            "tcp_to_rend_status": tcp_to_rend_status,
            "pinch_offset_available": pinch_offset_available,
            "pinch_offset_status": pinch_status,
        }
        self._report["transform_context"] = {
            "current_tcp_world_m": current_tcp_world.tolist(),
            "orientation_source": orientation_source,
            "tcp_to_rend_status": tcp_to_rend_status,
            "pinch_offset_available": bool(pinch_offset_available),
            "pinch_offset_status": pinch_status,
            "t_tcp_rend": matrix_to_dict(t_tcp_rend),
            "t_rend_pinch": matrix_to_dict(t_rend_pinch),
        }
        return context

    def _current_tcp_world_transform(self) -> tuple[Optional[np.ndarray], Optional[np.ndarray]]:
        try:
            transform = self._tf_buffer.lookup_transform(
                self._args.world_frame,
                self._args.right_tcp_frame,
                Time(),
                timeout=Duration(seconds=1.0),
            )
            matrix = transform_to_matrix(transform.transform.translation, transform.transform.rotation)
            return matrix[:3, 3], matrix[:3, :3]
        except Exception as exc:  # pylint: disable=broad-except
            self._report["right_tcp_tf_fallback_reason"] = str(exc)
        state = self._latest_state
        if state is None:
            return None, None
        base_xyz = np.asarray(parse_floats(self._args.right_base_xyz_m, 3), dtype=np.float64)
        base_rotation = rpy_matrix_deg(*parse_floats(self._args.right_base_rpy_deg, 3))
        tcp_base = np.array(
            [float(state.tcp_pose.x) / 1000.0, float(state.tcp_pose.y) / 1000.0, float(state.tcp_pose.z) / 1000.0],
            dtype=np.float64,
        )
        tcp_rotation = base_rotation @ rpy_matrix_deg(
            float(state.tcp_pose.rx),
            float(state.tcp_pose.ry),
            float(state.tcp_pose.rz),
        )
        return base_xyz + base_rotation @ tcp_base, tcp_rotation

    def _build_motion_targets(self, memory: dict[str, Any], context: dict[str, Any]) -> dict[str, PinchTarget]:
        center = np.asarray(memory["center_xyz_m"], dtype=np.float64)
        grasp_dir = np.asarray(memory["grasp_dir_xy"], dtype=np.float64)
        grasp_dir = grasp_dir / max(np.linalg.norm(grasp_dir), 1e-9)
        table_z = float(self._args.table_top_real_z)
        pregrasp_high_z = table_z + 0.100
        pregrasp_low_z = table_z + 0.070
        grasp_z = table_z + 0.070
        lift_z = grasp_z + 0.150
        specs = {
            "pregrasp_high": (np.array([center[0], center[1], pregrasp_high_z]) - np.array([grasp_dir[0] * 0.15, grasp_dir[1] * 0.15, 0.0]), table_z + 0.080, "ordinary_move"),
            "pregrasp_low": (np.array([center[0], center[1], pregrasp_low_z]) - np.array([grasp_dir[0] * 0.15, grasp_dir[1] * 0.15, 0.0]), table_z + 0.060, "grasp_segment"),
            "grasp": (np.array([center[0], center[1], grasp_z]), table_z + 0.060, "grasp_segment"),
            "lift": (np.array([center[0], center[1], lift_z]), table_z + 0.080, "ordinary_move"),
        }
        targets: dict[str, PinchTarget] = {}
        for name, (pinch_xyz, min_z, kind) in specs.items():
            target_pose = self._pinch_to_tcp_pose(name, pinch_xyz, context)
            targets[name] = PinchTarget(
                name=name,
                pinch_xyz_m=np.asarray(pinch_xyz, dtype=np.float64),
                target_tcp_pose=target_pose,
                min_allowed_z_m=float(min_z),
                stage_kind=str(kind),
            )
        self._report["motion_targets"] = {
            name: {
                "pinch_xyz_m": target.pinch_xyz_m.tolist(),
                "target_tcp_pose": pose_to_dict(target.target_tcp_pose),
                "min_allowed_z_m": target.min_allowed_z_m,
                "stage_kind": target.stage_kind,
            }
            for name, target in targets.items()
        }
        return targets

    def _pinch_to_tcp_pose(self, name: str, pinch_xyz: np.ndarray, context: dict[str, Any]) -> PoseStamped:
        t_world_pinch = make_transform(np.asarray(pinch_xyz, dtype=np.float64), context["target_rotation"])
        t_world_rend = t_world_pinch @ np.linalg.inv(context["t_rend_pinch"])
        t_world_tcp = t_world_rend @ np.linalg.inv(context["t_tcp_rend"])
        pose = PoseStamped()
        pose.header = Header(stamp=self.get_clock().now().to_msg(), frame_id=self._args.world_frame)
        pose.pose = matrix_to_pose(t_world_tcp)
        self._report.setdefault("pinch_transform_debug", {})[name] = {
            "pinch_xyz_m": pinch_xyz.tolist(),
            "target_rend_pose": pose_to_dict_pose(matrix_to_pose(t_world_rend)),
            "target_tcp_pose": pose_to_dict(pose),
            "semantics": "target_Rend = target_pinch * inverse(T_Rend_pinch); target_right_tcp = target_Rend * inverse(T_right_tcp_Rend)",
        }
        return pose

    def _motion_target_gate(self, targets: dict[str, PinchTarget]) -> bool:
        results = {}
        for name, target in targets.items():
            z = float(target.pinch_xyz_m[2])
            results[name] = {
                "pinch_z_m": z,
                "min_allowed_z_m": float(target.min_allowed_z_m),
                "passes": bool(z >= float(target.min_allowed_z_m)),
                "stage_kind": target.stage_kind,
            }
        passes = all(item["passes"] for item in results.values())
        self._report["motion_target_gate"] = {
            "passes": bool(passes),
            "table_top_real_z_m": float(self._args.table_top_real_z),
            "rules": {
                "ordinary_move_min_pinch_z_m": float(self._args.table_top_real_z) + 0.080,
                "grasp_segment_min_pinch_z_m": float(self._args.table_top_real_z) + 0.060,
            },
            "targets": results,
        }
        return bool(passes)

    def _plan_target(self, target: PinchTarget):
        request = PlanPose.Request()
        request.arm_group = self._args.arm_group
        request.target_pose = target.target_tcp_pose
        request.planner_id = ""
        request.cartesian = False
        future = self._plan_pose_client.call_async(request)
        rclpy.spin_until_future_complete(self, future, timeout_sec=float(self._args.plan_timeout_sec))
        return future.result() if future.done() else None

    def _execute_planned_target(self, target: PinchTarget) -> bool:
        if not self._wait_fresh_robot_state_for_planner(f"{target.name}_pre_plan_state"):
            self._report["steps"].append({"name": target.name, "type": "pre_execute_robot_state", "success": False})
            return False
        response = self._plan_target(target)
        if response is None:
            self._report["steps"].append({"name": target.name, "type": "plan_pose", "success": False, "reason": "timeout"})
            return False
        self._record_plan_response(target.name, response)
        if not bool(response.success):
            return False
        return self._execute_plan_response(target.name, response)

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

    def _execute_plan_response(self, name: str, response: Any) -> bool:
        goal = ExecuteTrajectory.Goal()
        goal.arm_group = response.primary_arm_group or self._args.arm_group
        goal.secondary_arm_group = response.secondary_arm_group
        goal.joint_trajectory = densify_joint_trajectory(response.joint_trajectory, int(self._args.trajectory_point_multiplier))
        goal.secondary_joint_trajectory = response.secondary_joint_trajectory
        goal.cartesian_waypoints = response.cartesian_waypoints
        goal.synchronized = bool(response.synchronized)
        goal.use_cartesian_execution = False
        goal.execution_profile = self._args.execution_profile
        send_future = self._execute_client.send_goal_async(goal)
        rclpy.spin_until_future_complete(self, send_future, timeout_sec=5.0)
        goal_handle = send_future.result() if send_future.done() else None
        if goal_handle is None or not goal_handle.accepted:
            self._report["steps"].append({"name": name, "type": "execute", "accepted": False})
            return False
        self._report["robot_motion_executed"] = True
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
                "trajectory_point_multiplier": int(self._args.trajectory_point_multiplier),
                "final_primary_joint_state": joint_state_to_dict(result.final_primary_joint_state),
            }
        )
        if not bool(result.success):
            return False
        settle_sec = max(0.0, float(self._args.post_execute_settle_sec))
        if settle_sec > 0.0:
            time.sleep(settle_sec)
        return self._wait_motion_done(name)

    def _robot_state_age_sec(self, state: RobotState) -> float:
        age = self.get_clock().now() - Time.from_msg(state.header.stamp)
        return float(age.nanoseconds) / 1e9

    def _wait_fresh_robot_state_for_planner(self, label: str, max_age_sec: float = 0.050) -> bool:
        deadline = time.monotonic() + float(self._args.state_timeout_sec)
        samples: list[dict[str, Any]] = []
        while rclpy.ok() and time.monotonic() < deadline:
            rclpy.spin_once(self, timeout_sec=0.05)
            state = self._latest_state
            if state is None:
                continue
            age_sec = self._robot_state_age_sec(state)
            sample = robot_state_to_dict(state)
            if sample is not None:
                sample["age_sec"] = age_sec
                samples.append(sample)
            if state.motion_done and int(state.error_code) == 0 and 0.0 <= age_sec <= max_age_sec:
                self._report["steps"].append({"name": label, "type": "robot_state_fresh", "success": True, "samples": samples[-3:]})
                return True
        self._report["steps"].append({"name": label, "type": "robot_state_fresh", "success": False, "samples": samples[-5:]})
        return False

    def _wait_motion_done(self, label: str) -> bool:
        deadline = time.monotonic() + float(self._args.state_timeout_sec)
        stable_count = 0
        samples: list[dict[str, Any]] = []
        while rclpy.ok() and time.monotonic() < deadline:
            rclpy.spin_once(self, timeout_sec=0.05)
            state = self._latest_state
            if state is None:
                continue
            age_sec = self._robot_state_age_sec(state)
            sample = robot_state_to_dict(state)
            if sample is not None:
                sample["age_sec"] = age_sec
                samples.append(sample)
            if state.motion_done and int(state.error_code) == 0 and 0.0 <= age_sec <= 0.250:
                stable_count += 1
                if stable_count >= 3:
                    self._report["steps"].append({"name": f"{label}_motion_done", "type": "robot_state", "success": True, "samples": samples[-5:]})
                    return True
            else:
                stable_count = 0
        self._report["steps"].append({"name": f"{label}_motion_done", "type": "robot_state", "success": False, "samples": samples[-5:]})
        return False

    def _execute_final_sequence(self, memory: dict[str, Any], targets: dict[str, PinchTarget]) -> tuple[str, int]:
        start_stage = str(self._args.execute_final_start_stage)
        pregrasp_stages = ("pregrasp_high", "pregrasp_low")
        if start_stage == "pregrasp_low":
            pregrasp_stages = ("pregrasp_low",)
        elif start_stage == "grasp":
            pregrasp_stages = ()
            self._report["steps"].append(
                {
                    "name": "skip_pregrasp_stages_for_recovery",
                    "type": "execute_final_start_stage",
                    "success": True,
                    "start_stage": start_stage,
                    "reason": "operator-requested continuation after verified pregrasp_low",
                }
            )
        for stage in pregrasp_stages:
            self._publish_scene(self._build_scene(memory, include_coke=True), self._args.scene_publish_duration_sec)
            if not self._execute_planned_target(targets[stage]):
                return f"{stage}_execute_failed", 20
        self._publish_scene(self._build_scene(memory, include_coke=False), self._args.scene_publish_duration_sec)
        self._report["steps"].append(
            {
                "name": "remove_coke_collision_before_grasp",
                "type": "publish_scene",
                "success": True,
                "removed_object_id": "coke_can_snapshot",
                "kept_object_id": "table_surface_manual",
            }
        )
        if not self._execute_planned_target(targets["grasp"]):
            return "grasp_execute_failed", 22
        if not self._set_gripper_close():
            return "gripper_close_failed", 23
        close_status = self._wait_gripper_contact()
        contact_ok = bool(close_status and int(close_status.get("gobj", -1)) in (1, 2))
        self._report["grasp_contact_gate"] = {
            "passes": contact_ok,
            "rule": "gobj in {1,2} required before lift",
            "status": close_status,
        }
        if not contact_ok:
            return "grasp_contact_not_verified_no_lift", 24
        attached = self._attach_coke_for_lift(memory)
        self._report["attach_or_remove_for_lift"] = attached
        self._publish_scene(self._build_scene(memory, include_coke=False), self._args.scene_publish_duration_sec)
        if not self._execute_planned_target(targets["lift"]):
            return "lift_execute_failed", 25
        return "execute_final_completed", 0

    def _set_coke_interaction(self, mode: str, owner: str, enable: bool, label: str) -> bool:
        if not self._set_interaction_client.wait_for_service(timeout_sec=2.0):
            self._report["steps"].append({"name": label, "type": "set_object_interaction", "success": False, "reason": "service_unavailable"})
            return False
        request = SetObjectInteraction.Request()
        request.object_id = "coke_can_snapshot"
        request.interaction_mode = mode
        request.owner = owner
        request.primary_link = self._args.right_tcp_frame
        request.secondary_link = ""
        request.enable = bool(enable)
        future = self._set_interaction_client.call_async(request)
        rclpy.spin_until_future_complete(self, future, timeout_sec=3.0)
        response = future.result() if future.done() else None
        success = bool(response is not None and response.success)
        self._report["steps"].append(
            {
                "name": label,
                "type": "set_object_interaction",
                "mode": mode,
                "enable": bool(enable),
                "success": success,
                "message": "" if response is None else response.message,
            }
        )
        return success

    def _set_gripper_close(self) -> bool:
        success = self._set_gripper_position("close_gripper", int(self._args.gripper_close_position))
        if success:
            self._report["gripper_closed"] = True
        return success

    def _set_gripper_open(self) -> bool:
        return self._set_gripper_position("open_gripper", int(self._args.gripper_open_position))

    def _set_gripper_position(self, label: str, position: int) -> bool:
        request = SetGripper.Request()
        request.arm_name = self._args.arm_group
        request.command = 2
        request.slave_id = int(self._args.right_gripper_slave_id)
        request.position = int(position)
        request.speed = int(self._args.gripper_speed)
        request.torque = int(self._args.gripper_torque)
        request.object_id = ""
        request.link_name = ""
        request.attach_on_success = False
        request.detach_on_success = False
        self._report["gripper_command_sent"] = True
        future = self._set_gripper_client.call_async(request)
        rclpy.spin_until_future_complete(self, future, timeout_sec=8.0)
        response = future.result() if future.done() else None
        success = bool(response is not None and response.success)
        self._report["steps"].append(
            {
                "name": label,
                "type": "set_gripper",
                "success": success,
                "position": int(position),
                "speed": int(self._args.gripper_speed),
                "message": "" if response is None else response.message,
            }
        )
        return success

    def _wait_gripper_contact(self) -> Optional[dict[str, Any]]:
        deadline = time.monotonic() + float(self._args.gripper_status_timeout_sec)
        last_status: Optional[dict[str, Any]] = None
        while rclpy.ok() and time.monotonic() < deadline:
            last_status = self._read_gripper_status("status_after_close")
            if last_status and last_status.get("success") and int(last_status.get("error", -1)) == 0:
                if int(last_status.get("gobj", -1)) in (1, 2):
                    return last_status
                if abs(int(last_status.get("speed", 0))) == 0 and int(last_status.get("gobj", -1)) == 3:
                    return last_status
            time.sleep(0.2)
        return last_status

    def _read_gripper_status(self, label: str) -> Optional[dict[str, Any]]:
        if not self._right_gripper_status_client.wait_for_service(timeout_sec=1.0):
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

    def _attach_coke_for_lift(self, memory: dict[str, Any]) -> dict[str, Any]:
        if self._set_coke_interaction("free", owner="observe_remember_grasp", enable=False, label="restore_coke_world_before_attach"):
            self._publish_scene(self._build_scene(memory, include_coke=True), 1.2)
        if self._attach_client.wait_for_service(timeout_sec=2.0):
            request = AttachObject.Request()
            request.object_id = "coke_can_snapshot"
            request.link_name = self._args.right_tcp_frame
            future = self._attach_client.call_async(request)
            rclpy.spin_until_future_complete(self, future, timeout_sec=4.0)
            response = future.result() if future.done() else None
            if response is not None and response.success:
                self._report["steps"].append({"name": "attach_coke_for_lift", "type": "attach_object", "success": True, "message": response.message})
                return {"mode": "attached", "success": True, "message": response.message}
            self._report["steps"].append(
                {
                    "name": "attach_coke_for_lift",
                    "type": "attach_object",
                    "success": False,
                    "message": "" if response is None else response.message,
                }
            )
        table_only = self._build_scene(memory, include_coke=False)
        self._publish_scene(table_only, 1.6)
        return {"mode": "fallback_remove_world_coke", "success": True, "message": "attach failed or unavailable; coke omitted from world before lift"}

    def _resolve_output_dir(self) -> Path:
        if self._args.output_dir:
            return Path(self._args.output_dir)
        return DEFAULT_OUTPUT_ROOT / f"observe-remember-grasp-{time.strftime('%Y%m%d-%H%M%S')}"

    def _finish(self, status: str, code: int) -> int:
        self._report["status"] = status
        self._report["result"] = "success" if int(code) == 0 else "failure"
        if int(code) != 0 and not self._report.get("failure_stage"):
            self._report["failure_stage"] = status
        self._report["finished_at"] = datetime.now().isoformat(timespec="seconds")
        self._report["exit_code"] = int(code)
        self._report["final_robot_state"] = robot_state_to_dict(self._latest_state)
        if self._latest_state is not None:
            self._report["robot_motion_done"] = bool(self._latest_state.motion_done)
            self._report["robot_error_code"] = int(self._latest_state.error_code)
        self._report_path.write_text(json.dumps(to_jsonable(self._report), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(str(self._report_path))
        return int(code)


def unproject_depth_image(
    depth_m: np.ndarray,
    camera_info: CameraInfo,
    min_depth_m: float,
    max_depth_m: float,
) -> DepthPointCloud:
    fx, fy, cx, cy = scaled_intrinsics(camera_info, depth_m.shape[1], depth_m.shape[0])
    valid = np.isfinite(depth_m) & (depth_m >= min_depth_m) & (depth_m <= max_depth_m)
    if not np.any(valid):
        return DepthPointCloud(
            points_cam=np.empty((0, 3), dtype=np.float64),
            u=np.empty((0,), dtype=np.int32),
            v=np.empty((0,), dtype=np.int32),
            valid_mask=valid,
            image_shape=depth_m.shape[:2],
        )
    v, u = np.nonzero(valid)
    z = depth_m[valid].astype(np.float64)
    x = (u.astype(np.float64) - cx) * z / fx
    y = (v.astype(np.float64) - cy) * z / fy
    return DepthPointCloud(
        points_cam=np.stack([x, y, z], axis=1),
        u=u.astype(np.int32),
        v=v.astype(np.int32),
        valid_mask=valid,
        image_shape=depth_m.shape[:2],
    )


def fit_table_plane_ransac(
    points: np.ndarray,
    threshold_m: float,
    iterations: int,
    max_sample_points: int,
) -> Optional[TablePlane]:
    if points.shape[0] < 3:
        return None
    finite = np.all(np.isfinite(points), axis=1)
    points = points[finite]
    if points.shape[0] < 3:
        return None

    rng = np.random.default_rng(42)
    if points.shape[0] > max_sample_points:
        sample_indices = rng.choice(points.shape[0], size=max_sample_points, replace=False)
        sample_points = points[sample_indices]
    else:
        sample_points = points

    best_normal: Optional[np.ndarray] = None
    best_offset = 0.0
    best_count = 0
    sample_count = sample_points.shape[0]
    for _ in range(max(1, int(iterations))):
        ids = rng.choice(sample_count, size=3, replace=False)
        p0, p1, p2 = sample_points[ids]
        normal = np.cross(p1 - p0, p2 - p0)
        norm = float(np.linalg.norm(normal))
        if norm < 1e-9:
            continue
        normal = normal / norm
        offset = -float(normal @ p0)
        distances = np.abs(sample_points @ normal + offset)
        count = int(np.count_nonzero(distances <= threshold_m))
        if count > best_count:
            best_count = count
            best_normal = normal
            best_offset = offset

    if best_normal is None:
        return None

    coarse_distances = np.abs(points @ best_normal + best_offset)
    coarse_inliers = points[coarse_distances <= threshold_m]
    if coarse_inliers.shape[0] < 3:
        return None

    centroid = np.mean(coarse_inliers, axis=0)
    _, _, vh = np.linalg.svd(coarse_inliers - centroid, full_matrices=False)
    normal = vh[-1]
    normal = normal / max(float(np.linalg.norm(normal)), 1e-12)
    offset = -float(normal @ centroid)
    if offset < 0.0:
        normal = -normal
        offset = -offset

    residuals = np.abs(points @ normal + offset)
    inlier_mask = residuals <= threshold_m
    table_points = points[inlier_mask]
    if table_points.shape[0] < 3:
        return None
    return TablePlane(
        normal=normal.astype(np.float64),
        offset=float(offset),
        table_points_cam=table_points.astype(np.float64),
        inlier_count=int(table_points.shape[0]),
        inlier_ratio=float(table_points.shape[0]) / float(points.shape[0]),
        median_residual_m=float(np.median(residuals[inlier_mask])),
    )


def signed_height_above_table(cloud: DepthPointCloud, plane: TablePlane) -> np.ndarray:
    return cloud.points_cam @ plane.normal + float(plane.offset)


def segment_object_from_yolo_roi(
    cloud: DepthPointCloud,
    plane: TablePlane,
    roi: tuple[int, int, int, int],
    min_points: int,
) -> Optional[SegmentedObject]:
    x0, y0, x1, y1 = roi
    height = signed_height_above_table(cloud, plane)
    in_roi = (cloud.u >= x0) & (cloud.u < x1) & (cloud.v >= y0) & (cloud.v < y1)
    object_indices = np.nonzero(in_roi & (height > 0.015) & (height < 0.160))[0]
    mask = np.zeros(cloud.image_shape, dtype=np.uint8)
    if object_indices.size > 0:
        mask[cloud.v[object_indices], cloud.u[object_indices]] = 1
        mask = morph_object_mask(mask)
        keep = mask[cloud.v, cloud.u].astype(bool) & in_roi & (height > 0.015) & (height < 0.160)
        object_indices = np.nonzero(keep)[0]
    debug = {
        "roi_xyxy": [int(value) for value in roi],
        "points_before_morphology": int(np.count_nonzero(in_roi & (height > 0.015) & (height < 0.160))),
        "points_after_morphology": int(object_indices.size),
        "min_required_points": int(min_points),
    }
    if int(object_indices.size) < int(min_points):
        return None
    return SegmentedObject(
        points_cam=cloud.points_cam[object_indices],
        mask=mask,
        mode="yolo_center_roi_table_height",
        debug=debug,
    )


def segment_single_tabletop_object_depth_only(
    cloud: DepthPointCloud,
    plane: TablePlane,
    min_points: int,
    single_object_required: bool,
    can_geometry_filter: bool = True,
) -> Optional[SegmentedObject]:
    height = signed_height_above_table(cloud, plane)
    object_indices = np.nonzero((height > 0.015) & (height < 0.160))[0]
    mask = np.zeros(cloud.image_shape, dtype=np.uint8)
    if object_indices.size > 0:
        mask[cloud.v[object_indices], cloud.u[object_indices]] = 1
    mask = morph_object_mask(mask)

    labels_count, labels, stats, _centroids = cv2.connectedComponentsWithStats(mask.astype(np.uint8), connectivity=8)
    candidates: list[dict[str, Any]] = []
    rejected_candidates: list[dict[str, Any]] = []
    for label_id in range(1, labels_count):
        area = int(stats[label_id, cv2.CC_STAT_AREA])
        if area < 80:
            continue
        in_label = labels[cloud.v, cloud.u] == label_id
        candidate_indices = np.nonzero(in_label & (height > 0.015) & (height < 0.160))[0]
        if int(candidate_indices.size) < int(min_points):
            continue
        h_med = float(np.median(height[candidate_indices]))
        if not (0.020 < h_med < 0.140):
            continue
        pts = cloud.points_cam[candidate_indices]
        extents = np.max(pts, axis=0) - np.min(pts, axis=0)
        extent_sorted = sorted(float(value) for value in extents)
        candidate = {
            "label": int(label_id),
            "area_px": area,
            "point_count": int(candidate_indices.size),
            "height_median_m": h_med,
            "height_p95_m": float(np.percentile(height[candidate_indices], 95.0)),
            "camera_extent_m": [float(value) for value in extents],
            "camera_extent_sorted_m": extent_sorted,
            "indices": candidate_indices,
        }
        if can_geometry_filter:
            max_extent = extent_sorted[-1]
            mid_extent = extent_sorted[-2]
            if not (area >= 1000 and 0.080 <= max_extent <= 0.160 and mid_extent <= 0.130):
                rejected = {key: value for key, value in candidate.items() if key != "indices"}
                rejected["reject_reason"] = "outside_coke_can_depth_extent_gate"
                rejected["extent_gate_m"] = {
                    "min_area_px": 1000,
                    "max_extent_range": [0.080, 0.160],
                    "mid_extent_max": 0.130,
                }
                rejected_candidates.append(rejected)
                continue
        candidates.append(candidate)

    public_candidates = [
        {key: value for key, value in candidate.items() if key != "indices"}
        for candidate in candidates
    ]
    if not candidates:
        if rejected_candidates:
            return SegmentedObject(
                points_cam=np.empty((0, 3), dtype=np.float64),
                mask=mask,
                mode="depth_only_tabletop_no_reasonable_coke_component",
                debug={"candidate_count": 0, "rejected_candidates": rejected_candidates},
            )
        return None
    if single_object_required and len(candidates) != 1:
        return SegmentedObject(
            points_cam=np.empty((0, 3), dtype=np.float64),
            mask=mask,
            mode="depth_only_tabletop_ambiguous",
            debug={
                "candidate_count": len(candidates),
                "candidates": public_candidates,
                "rejected_candidates": rejected_candidates,
            },
        )

    target = max(candidates, key=lambda item: item["point_count"])
    target_mask = np.zeros(cloud.image_shape, dtype=np.uint8)
    target_mask[labels == int(target["label"])] = 1
    return SegmentedObject(
        points_cam=cloud.points_cam[target["indices"]],
        mask=target_mask,
        mode="depth_only_tabletop_single_component",
        debug={
            "candidate_count": len(candidates),
            "selected_label": int(target["label"]),
            "selected_point_count": int(target["point_count"]),
            "selected_area_px": int(target["area_px"]),
            "candidates": public_candidates,
            "rejected_candidates": rejected_candidates,
        },
    )


def morph_object_mask(mask: np.ndarray) -> np.ndarray:
    kernel = np.ones((5, 5), dtype=np.uint8)
    opened = cv2.morphologyEx(mask.astype(np.uint8), cv2.MORPH_OPEN, kernel)
    return cv2.morphologyEx(opened, cv2.MORPH_CLOSE, kernel)


def make_runtime_table_corrected_tf(
    t_world_cam_candidate: np.ndarray,
    normal_cam: np.ndarray,
    table_points_cam: np.ndarray,
    table_top_real_z: float,
) -> tuple[np.ndarray, dict[str, Any]]:
    z_axis = np.array([0.0, 0.0, 1.0], dtype=np.float64)
    rotation0 = t_world_cam_candidate[:3, :3]
    translation0 = t_world_cam_candidate[:3, 3]
    normal_world0 = rotation0 @ normal_cam
    align = rotation_between_vectors(normal_world0, z_axis)
    rotation1 = align @ rotation0
    table_world_tmp = transform_points(make_transform(translation0.copy(), rotation1), table_points_cam)
    table_z_median = float(np.median(table_world_tmp[:, 2]))
    translation1 = translation0.copy()
    translation1[2] += float(table_top_real_z) - table_z_median
    runtime = make_transform(translation1, rotation1)
    corrected_table_world = transform_points(runtime, table_points_cam)
    return runtime, {
        "normal_world_before": normal_world0.tolist(),
        "raw_normal_angle_deg": float(angle_between_vectors(normal_world0, z_axis)),
        "table_z_median_before_m": table_z_median,
        "table_z_median_after_m": float(np.median(corrected_table_world[:, 2])),
        "target_table_top_real_z_m": float(table_top_real_z),
        "translation_z_delta_m": float(translation1[2] - translation0[2]),
    }


def rotation_between_vectors(source: np.ndarray, target: np.ndarray) -> np.ndarray:
    source = source.astype(np.float64)
    target = target.astype(np.float64)
    source = source / max(float(np.linalg.norm(source)), 1e-12)
    target = target / max(float(np.linalg.norm(target)), 1e-12)
    cross = np.cross(source, target)
    dot = float(np.clip(source @ target, -1.0, 1.0))
    cross_norm = float(np.linalg.norm(cross))
    if cross_norm < 1e-12:
        if dot > 0.0:
            return np.eye(3, dtype=np.float64)
        axis = np.cross(source, np.array([1.0, 0.0, 0.0], dtype=np.float64))
        if np.linalg.norm(axis) < 1e-12:
            axis = np.cross(source, np.array([0.0, 1.0, 0.0], dtype=np.float64))
        axis = axis / max(float(np.linalg.norm(axis)), 1e-12)
        return axis_angle_matrix(axis, math.pi)
    axis = cross / cross_norm
    angle = math.atan2(cross_norm, dot)
    return axis_angle_matrix(axis, angle)


def axis_angle_matrix(axis: np.ndarray, angle: float) -> np.ndarray:
    x, y, z = axis / max(float(np.linalg.norm(axis)), 1e-12)
    c = math.cos(angle)
    s = math.sin(angle)
    one_c = 1.0 - c
    return np.array(
        [
            [c + x * x * one_c, x * y * one_c - z * s, x * z * one_c + y * s],
            [y * x * one_c + z * s, c + y * y * one_c, y * z * one_c - x * s],
            [z * x * one_c - y * s, z * y * one_c + x * s, c + z * z * one_c],
        ],
        dtype=np.float64,
    )


def angle_between_vectors(lhs: np.ndarray, rhs: np.ndarray) -> float:
    lhs_norm = lhs / max(float(np.linalg.norm(lhs)), 1e-12)
    rhs_norm = rhs / max(float(np.linalg.norm(rhs)), 1e-12)
    dot = float(np.clip(lhs_norm @ rhs_norm, -1.0, 1.0))
    return math.degrees(math.acos(dot))


def choose_detection(message: Optional[Bbox2dArray], args: argparse.Namespace) -> Optional[DetectionBox]:
    if message is None:
        return None
    candidates: list[DetectionBox] = []
    for item in message.results:
        if int(args.target_class_id) >= 0 and int(item.class_id) != int(args.target_class_id):
            continue
        if float(item.score) < float(args.confidence_threshold):
            continue
        half_w = float(item.width) * 0.5
        half_h = float(item.height) * 0.5
        candidates.append(
            DetectionBox(
                class_id=int(item.class_id),
                score=float(item.score),
                xyxy=(float(item.x) - half_w, float(item.y) - half_h, float(item.x) + half_w, float(item.y) + half_h),
            )
        )
    if not candidates:
        return None
    return max(candidates, key=lambda detection: detection.score)


def depth_image_to_meters(depth: np.ndarray, encoding: str, unit_to_m: float) -> np.ndarray:
    if depth.dtype.kind == "f" or encoding.upper() == "32FC1":
        return depth.astype(np.float32)
    return depth.astype(np.float32) * float(unit_to_m)


def backproject_roi(
    depth_m: np.ndarray,
    camera_info: CameraInfo,
    x0: int,
    y0: int,
    x1: int,
    y1: int,
    min_depth_m: float,
    max_depth_m: float,
) -> np.ndarray:
    if x1 <= x0 or y1 <= y0:
        return np.empty((0, 3), dtype=np.float64)
    fx, fy, cx, cy = scaled_intrinsics(camera_info, depth_m.shape[1], depth_m.shape[0])
    roi = depth_m[y0:y1, x0:x1]
    valid = np.isfinite(roi) & (roi >= min_depth_m) & (roi <= max_depth_m)
    if not np.any(valid):
        return np.empty((0, 3), dtype=np.float64)
    ys, xs = np.nonzero(valid)
    u = xs.astype(np.float64) + float(x0)
    v = ys.astype(np.float64) + float(y0)
    z = roi[valid].astype(np.float64)
    x = (u - cx) * z / fx
    y = (v - cy) * z / fy
    return np.stack([x, y, z], axis=1)


def scaled_intrinsics(camera_info: CameraInfo, width: int, height: int) -> tuple[float, float, float, float]:
    fx = float(camera_info.k[0])
    fy = float(camera_info.k[4])
    cx = float(camera_info.k[2])
    cy = float(camera_info.k[5])
    info_w = int(camera_info.width)
    info_h = int(camera_info.height)
    if info_w > 0 and info_w != width:
        scale_x = float(width) / float(info_w)
        fx *= scale_x
        cx *= scale_x
    if info_h > 0 and info_h != height:
        scale_y = float(height) / float(info_h)
        fy *= scale_y
        cy *= scale_y
    if abs(fx) < 1e-9 or abs(fy) < 1e-9:
        raise ValueError("camera_info intrinsics invalid")
    return fx, fy, cx, cy


def transform_points(matrix: np.ndarray, points: np.ndarray) -> np.ndarray:
    if points.size == 0:
        return np.empty((0, 3), dtype=np.float64)
    hom = np.concatenate([points.astype(np.float64), np.ones((points.shape[0], 1), dtype=np.float64)], axis=1)
    transformed = (matrix @ hom.T).T
    return transformed[:, :3]


def transform_to_matrix(translation: Any, rotation: Any) -> np.ndarray:
    matrix = np.eye(4, dtype=np.float64)
    matrix[:3, :3] = quaternion_matrix(float(rotation.x), float(rotation.y), float(rotation.z), float(rotation.w))
    matrix[:3, 3] = [float(translation.x), float(translation.y), float(translation.z)]
    return matrix


def make_transform(translation: np.ndarray, rotation: np.ndarray) -> np.ndarray:
    matrix = np.eye(4, dtype=np.float64)
    matrix[:3, :3] = rotation
    matrix[:3, 3] = translation.astype(np.float64)
    return matrix


def matrix_to_pose(matrix: np.ndarray) -> Pose:
    pose = Pose()
    pose.position = Point(x=float(matrix[0, 3]), y=float(matrix[1, 3]), z=float(matrix[2, 3]))
    pose.orientation = quaternion_from_matrix(matrix[:3, :3])
    return pose


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
        idx = int(np.argmax([matrix[0, 0], matrix[1, 1], matrix[2, 2]]))
        if idx == 0:
            s = math.sqrt(max(1.0 + matrix[0, 0] - matrix[1, 1] - matrix[2, 2], 1e-12)) * 2.0
            w = (matrix[2, 1] - matrix[1, 2]) / s
            x = 0.25 * s
            y = (matrix[0, 1] + matrix[1, 0]) / s
            z = (matrix[0, 2] + matrix[2, 0]) / s
        elif idx == 1:
            s = math.sqrt(max(1.0 + matrix[1, 1] - matrix[0, 0] - matrix[2, 2], 1e-12)) * 2.0
            w = (matrix[0, 2] - matrix[2, 0]) / s
            x = (matrix[0, 1] + matrix[1, 0]) / s
            y = 0.25 * s
            z = (matrix[1, 2] + matrix[2, 1]) / s
        else:
            s = math.sqrt(max(1.0 + matrix[2, 2] - matrix[0, 0] - matrix[1, 1], 1e-12)) * 2.0
            w = (matrix[1, 0] - matrix[0, 1]) / s
            x = (matrix[0, 2] + matrix[2, 0]) / s
            y = (matrix[1, 2] + matrix[2, 1]) / s
            z = 0.25 * s
    norm = math.sqrt(x * x + y * y + z * z + w * w)
    if norm < 1e-12:
        return Quaternion(w=1.0)
    return Quaternion(x=float(x / norm), y=float(y / norm), z=float(z / norm), w=float(w / norm))


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


def load_static_transform(path: Path, parent: str, child: str) -> Optional[np.ndarray]:
    try:
        import yaml

        data = yaml.safe_load(path.read_text(encoding="utf-8"))
    except Exception:
        return None
    for item in data.get("transforms", []):
        frames = item.get("frames", {})
        if str(frames.get("parent")) == parent and str(frames.get("child")) == child:
            trans = item.get("translation", {})
            rot = item.get("rotation", {})
            return make_transform(
                np.array(
                    [float(trans.get("x", 0.0)), float(trans.get("y", 0.0)), float(trans.get("z", 0.0))],
                    dtype=np.float64,
                ),
                rpy_matrix_deg(float(rot.get("roll", 0.0)), float(rot.get("pitch", 0.0)), float(rot.get("yaw", 0.0))),
            )
    return None


def densify_joint_trajectory(joint_trajectory: Any, multiplier: int) -> Any:
    multiplier = max(1, int(multiplier))
    if multiplier <= 1 or len(joint_trajectory.points) < 2:
        return joint_trajectory
    result = copy.deepcopy(joint_trajectory)
    points = []
    for index in range(len(joint_trajectory.points) - 1):
        start = joint_trajectory.points[index]
        end = joint_trajectory.points[index + 1]
        if index == 0:
            points.append(copy.deepcopy(start))
        for step in range(1, multiplier + 1):
            ratio = float(step) / float(multiplier)
            point = copy.deepcopy(end)
            point.positions = [
                float(a) + (float(b) - float(a)) * ratio
                for a, b in zip(start.positions, end.positions)
            ]
            if start.velocities and end.velocities and len(start.velocities) == len(end.velocities):
                point.velocities = [
                    (float(a) + (float(b) - float(a)) * ratio) / float(multiplier)
                    for a, b in zip(start.velocities, end.velocities)
                ]
            if start.accelerations and end.accelerations and len(start.accelerations) == len(end.accelerations):
                point.accelerations = [
                    (float(a) + (float(b) - float(a)) * ratio) / float(multiplier * multiplier)
                    for a, b in zip(start.accelerations, end.accelerations)
                ]
            points.append(point)
    result.points = points
    return result


def make_scene_object(
    object_id: str,
    semantic_type: str,
    shape_type: str,
    position: list[float],
    size: list[float],
    stamp: Any,
    frame_id: str,
    source: str,
    movable: bool,
    graspable: bool,
    confidence: float = 1.0,
    subframes: Optional[list[tuple[str, list[float]]]] = None,
    pose_source: str = CALIBRATION_STATUS,
) -> SceneObject:
    pose = PoseStamped()
    pose.header = Header(stamp=stamp, frame_id=frame_id)
    pose.pose.position = Point(x=float(position[0]), y=float(position[1]), z=float(position[2]))
    pose.pose.orientation = Quaternion(w=1.0)

    scene_object = SceneObject()
    scene_object.id = object_id
    scene_object.semantic_type = semantic_type
    scene_object.pose = pose
    scene_object.size = Vector3(x=float(size[0]), y=float(size[1]), z=float(size[2]))
    scene_object.confidence = float(confidence)
    scene_object.graspable = bool(graspable)
    scene_object.movable = bool(movable)
    scene_object.source = source
    scene_object.source_views = ["right_camera_single_frame_memory"]
    scene_object.shape_type = shape_type
    scene_object.pose_source = pose_source
    scene_object.quality_score = float(confidence)
    scene_object.last_seen = stamp
    scene_object.scene_version = 1
    scene_object.lifecycle_state = "stable"
    scene_object.reserved_by = "none"
    scene_object.attached_link = ""
    scene_object.pose_covariance_diagonal = [0.0] * 6
    for name, xyz in subframes or []:
        subframe_pose = PoseStamped()
        subframe_pose.header = Header(stamp=stamp, frame_id=frame_id)
        subframe_pose.pose.position = Point(x=float(xyz[0]), y=float(xyz[1]), z=float(xyz[2]))
        subframe_pose.pose.orientation = Quaternion(w=1.0)
        subframe = Subframe()
        subframe.name = name
        subframe.pose = subframe_pose
        scene_object.subframes.append(subframe)
    return scene_object


def parse_floats(raw: str, count: int) -> list[float]:
    values = [float(item.strip()) for item in raw.split(",") if item.strip()]
    if len(values) != count:
        raise ValueError(f"参数数量错误: expected={count}, actual={len(values)}, raw={raw}")
    return values


def parse_optional_floats(raw: str, count: int) -> Optional[list[float]]:
    if not raw.strip():
        return None
    return parse_floats(raw, count)


def parse_optional_pair(raw: str) -> Optional[tuple[int, int]]:
    values = parse_optional_floats(raw, 2)
    if values is None:
        return None
    return int(round(values[0])), int(round(values[1]))


def roi_around_pixel(pixel: tuple[int, int], width: int, height: int, radius: int) -> tuple[int, int, int, int]:
    u, v = pixel
    radius = max(1, int(radius))
    return max(0, u - radius), max(0, v - radius), min(width, u + radius + 1), min(height, v + radius + 1)


def normalize_xy(vector: np.ndarray) -> Optional[np.ndarray]:
    norm = float(np.linalg.norm(vector))
    if norm < 1e-9:
        return None
    return vector.astype(np.float64) / norm


def stamp_to_sec(stamp: Any) -> float:
    return float(stamp.sec) + float(stamp.nanosec) * 1e-9


def make_depth_vis(depth_m: np.ndarray) -> np.ndarray:
    valid = np.isfinite(depth_m) & (depth_m > 0.0)
    if not np.any(valid):
        return np.zeros((*depth_m.shape[:2], 3), dtype=np.uint8)
    lo = float(np.percentile(depth_m[valid], 2.0))
    hi = float(np.percentile(depth_m[valid], 98.0))
    if hi <= lo:
        hi = lo + 1.0
    scaled = np.clip((depth_m - lo) / (hi - lo), 0.0, 1.0)
    return cv2.applyColorMap((scaled * 255).astype(np.uint8), cv2.COLORMAP_TURBO)


def draw_detection(image: np.ndarray, detection: DetectionBox, color: tuple[int, int, int]) -> None:
    x0, y0, x1, y1 = [int(round(value)) for value in detection.xyxy]
    cv2.rectangle(image, (x0, y0), (x1, y1), color, 2)
    cv2.putText(
        image,
        f"class={detection.class_id} score={detection.score:.2f}",
        (x0, max(18, y0 - 8)),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.48,
        color,
        1,
        cv2.LINE_AA,
    )


def draw_roi(image: np.ndarray, roi: tuple[int, int, int, int], color: tuple[int, int, int]) -> None:
    x0, y0, x1, y1 = roi
    cv2.rectangle(image, (x0, y0), (x1, y1), color, 2)


def write_ply(path: Path, points: np.ndarray) -> None:
    with path.open("w", encoding="utf-8") as handle:
        handle.write("ply\nformat ascii 1.0\n")
        handle.write(f"element vertex {int(points.shape[0])}\n")
        handle.write("property float x\nproperty float y\nproperty float z\n")
        handle.write("end_header\n")
        for point in points:
            handle.write(f"{float(point[0]):.6f} {float(point[1]):.6f} {float(point[2]):.6f}\n")


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def to_jsonable(value: Any) -> Any:
    if isinstance(value, np.ndarray):
        return value.tolist()
    if isinstance(value, (np.floating, np.integer)):
        return value.item()
    if isinstance(value, Path):
        return str(value)
    if isinstance(value, dict):
        return {str(key): to_jsonable(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [to_jsonable(item) for item in value]
    return value


def matrix_to_dict(matrix: np.ndarray) -> dict[str, Any]:
    return {"translation_m": matrix[:3, 3].tolist(), "rotation_matrix": matrix[:3, :3].tolist()}


def pose_to_dict(pose: PoseStamped) -> dict[str, Any]:
    return {"frame_id": pose.header.frame_id, "pose": pose_to_dict_pose(pose.pose)}


def pose_to_dict_pose(pose: Pose) -> dict[str, Any]:
    return {
        "position": [float(pose.position.x), float(pose.position.y), float(pose.position.z)],
        "orientation_xyzw": [
            float(pose.orientation.x),
            float(pose.orientation.y),
            float(pose.orientation.z),
            float(pose.orientation.w),
        ],
    }


def robot_state_to_dict(state: Optional[RobotState]) -> Optional[dict[str, Any]]:
    if state is None:
        return None
    return {
        "stamp": {"sec": int(state.header.stamp.sec), "nanosec": int(state.header.stamp.nanosec)},
        "motion_done": bool(state.motion_done),
        "error_code": int(state.error_code),
        "tcp_pose_mm_deg": [
            float(state.tcp_pose.x),
            float(state.tcp_pose.y),
            float(state.tcp_pose.z),
            float(state.tcp_pose.rx),
            float(state.tcp_pose.ry),
            float(state.tcp_pose.rz),
        ],
        "joint_position_deg": [
            float(state.joint_position.j1),
            float(state.joint_position.j2),
            float(state.joint_position.j3),
            float(state.joint_position.j4),
            float(state.joint_position.j5),
            float(state.joint_position.j6),
        ],
    }


def joint_state_to_dict(state: JointState) -> dict[str, Any]:
    return {
        "name": list(state.name),
        "position": [float(value) for value in state.position],
        "velocity": [float(value) for value in state.velocity],
        "effort": [float(value) for value in state.effort],
    }


def main() -> int:
    args = parse_args()
    rclpy.init()
    node = ObserveRememberGraspNode(args)
    try:
        return node.run()
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    sys.exit(main())
