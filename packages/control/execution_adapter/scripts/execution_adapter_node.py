#!/usr/bin/python3

from __future__ import annotations

import math
import json
import time
from copy import deepcopy
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple

import rclpy
import yaml
from epg50_gripper_ros.msg import GripperStatus
from epg50_gripper_ros.srv import GripperCommand, GripperStatus as GripperStatusSrv
from rcl_interfaces.msg import ParameterDescriptor
from rclpy.action import ActionServer, CancelResponse, GoalResponse
from rclpy.callback_groups import ReentrantCallbackGroup
from rclpy.executors import MultiThreadedExecutor
from rclpy.node import Node
from sensor_msgs.msg import JointState
from std_msgs.msg import String

from dualarm_interfaces.action import ExecutePrimitive, ExecuteTrajectory
from dualarm_interfaces.msg import SceneObjectArray
from dualarm_interfaces.srv import AttachObject, DetachObject, PlanCartesian, PlanDualPose, PlanPose, SetGripper, SetObjectInteraction
from primitive_contract import (
    PRIMITIVE_CONTRACT_VERSION,
    RESULT_CONTACT_FAILED,
    RESULT_DETACH_FAILED,
    RESULT_DRIVER_FAILURE,
    RESULT_HOLD_FAILED,
    RESULT_INVALID_REQUEST,
    RESULT_SUCCESS,
    RESULT_SYNC_VIOLATION,
    RESULT_TIMEOUT,
    PrimitiveContract,
    primary_arm_group,
    secondary_arm_group,
    supported_primitive_ids,
    validate_primitive_goal,
)
from primitive_evidence import RESULT_UNVERIFIED_EVIDENCE, has_pour_evidence
from robo_ctrl.msg import RobotState
from robo_ctrl.srv import RobotMove, RobotMoveCart, RobotServoJoint


@dataclass
class PrimitiveExecutionOutcome:
    success: bool = False
    message: str = "未执行 primitive"
    result_code: str = "cancelled"
    sync_skew_ms: float = 0.0
    contact_verified: bool = False
    detach_verified: bool = False
    spill_detected: bool = False
    fill_target_reached: bool = False
    estimated_poured_mass_g: float = -1.0
    evidence_confidence: float = 0.0
    evidence_sources: Tuple[str, ...] = ()
    primary_started: bool = False
    secondary_started: bool = False
    primary_completed: bool = False
    secondary_completed: bool = False


class ExecutionAdapterNode(Node):
    def __init__(self) -> None:
        super().__init__("execution_adapter")
        profile_list_descriptor = ParameterDescriptor(dynamic_typing=True)
        self.declare_parameter("left_gripper_slave_id", 9)
        self.declare_parameter("right_gripper_slave_id", 10)
        self.declare_parameter("left_gripper_command_service", "/gripper0/epg50_gripper/command")
        self.declare_parameter("right_gripper_command_service", "/gripper1/epg50_gripper/command")
        self.declare_parameter("left_gripper_status_service", "/gripper0/epg50_gripper/status")
        self.declare_parameter("right_gripper_status_service", "/gripper1/epg50_gripper/status")
        self.declare_parameter("left_gripper_status_topic", "/gripper0/epg50_gripper/status_stream")
        self.declare_parameter("right_gripper_status_topic", "/gripper1/epg50_gripper/status_stream")
        self.declare_parameter("gripper_command_timeout_s", 8.0)
        self.declare_parameter("dual_arm_skew_limit_ms", 30.0)
        self.declare_parameter("world_frame", "world")
        self.declare_parameter("allow_vendor_direct_cartesian", False)
        self.declare_parameter("vendor_direct_cartesian_profiles", "", profile_list_descriptor)
        self.declare_parameter("execution_backend", "hardware")
        self.declare_parameter("sim_grasp_contact_threshold_m", 0.04)
        self.declare_parameter("sim_contact_retry_max", 2)
        self.declare_parameter("sim_robot_state_freshness_max_age_s", 0.5)
        self.declare_parameter("sim_visual_playback_rate_hz", 20.0)
        self.declare_parameter("sim_truth_command_topic", "/simulation/truth_command")
        self.declare_parameter("sim_pour_event_topic", "/simulation/pour_event")
        self.declare_parameter("sim_pour_state_topic", "/competition/pour_state")
        self.declare_parameter("trajectory_servo_joint_acc", 2.0)
        self.declare_parameter("trajectory_servo_joint_vel", 2.0)
        self.declare_parameter("trajectory_servo_joint_cmd_time", 0.02)
        self.declare_parameter("trajectory_servo_joint_filter_time", 0.02)
        self.declare_parameter("trajectory_servo_joint_gain", 0.0)
        self.declare_parameter("trajectory_servo_joint_completion_margin_s", 0.5)
        self.declare_parameter("trajectory_servo_joint_motion_done_timeout_s", 12.0)
        self.declare_parameter("trajectory_servo_joint_resample_enabled", True)
        self.declare_parameter("trajectory_servo_joint_duration_cmd_time", 0.10)
        self.declare_parameter("trajectory_servo_joint_max_resampled_points", 800)
        self._left_gripper_slave_id = int(self.get_parameter("left_gripper_slave_id").value)
        self._right_gripper_slave_id = int(self.get_parameter("right_gripper_slave_id").value)
        self._left_gripper_command_service = str(self.get_parameter("left_gripper_command_service").value)
        self._right_gripper_command_service = str(self.get_parameter("right_gripper_command_service").value)
        self._left_gripper_status_service = str(self.get_parameter("left_gripper_status_service").value)
        self._right_gripper_status_service = str(self.get_parameter("right_gripper_status_service").value)
        self._left_gripper_status_topic = str(self.get_parameter("left_gripper_status_topic").value)
        self._right_gripper_status_topic = str(self.get_parameter("right_gripper_status_topic").value)
        self._gripper_command_timeout_s = float(self.get_parameter("gripper_command_timeout_s").value)
        self._dual_arm_skew_limit_ms = float(self.get_parameter("dual_arm_skew_limit_ms").value)
        self._world_frame = str(self.get_parameter("world_frame").value)
        self._allow_vendor_direct_cartesian = self._parse_bool(self.get_parameter("allow_vendor_direct_cartesian").value)
        self._vendor_direct_cartesian_profiles = self._parse_profile_list(
            self.get_parameter("vendor_direct_cartesian_profiles").value
        )
        self._execution_backend = str(self.get_parameter("execution_backend").value).strip().lower()
        if self._execution_backend not in {"hardware", "sim"}:
            self.get_logger().warn(f"未知 execution_backend={self._execution_backend}，回退 hardware")
            self._execution_backend = "hardware"
        self._sim_grasp_contact_threshold_m = float(self.get_parameter("sim_grasp_contact_threshold_m").value)
        self._sim_contact_retry_max = int(self.get_parameter("sim_contact_retry_max").value)
        self._sim_robot_state_freshness_max_age_s = float(self.get_parameter("sim_robot_state_freshness_max_age_s").value)
        self._sim_visual_playback_rate_hz = max(float(self.get_parameter("sim_visual_playback_rate_hz").value), 1.0)
        self._trajectory_servo_joint_acc = self._clamp_percent_parameter("trajectory_servo_joint_acc")
        self._trajectory_servo_joint_vel = self._clamp_percent_parameter("trajectory_servo_joint_vel")
        self._trajectory_servo_joint_cmd_time = max(
            float(self.get_parameter("trajectory_servo_joint_cmd_time").value), 0.001
        )
        self._trajectory_servo_joint_filter_time = max(
            float(self.get_parameter("trajectory_servo_joint_filter_time").value), 0.0
        )
        self._trajectory_servo_joint_gain = max(float(self.get_parameter("trajectory_servo_joint_gain").value), 0.0)
        self._trajectory_servo_joint_completion_margin_s = max(
            float(self.get_parameter("trajectory_servo_joint_completion_margin_s").value), 0.0
        )
        self._trajectory_servo_joint_motion_done_timeout_s = max(
            float(self.get_parameter("trajectory_servo_joint_motion_done_timeout_s").value), 0.0
        )
        self._trajectory_servo_joint_resample_enabled = self._parse_bool(
            self.get_parameter("trajectory_servo_joint_resample_enabled").value
        )
        self._trajectory_servo_joint_duration_cmd_time = max(
            float(self.get_parameter("trajectory_servo_joint_duration_cmd_time").value),
            self._trajectory_servo_joint_cmd_time,
        )
        self._trajectory_servo_joint_max_resampled_points = max(
            int(self.get_parameter("trajectory_servo_joint_max_resampled_points").value), 1
        )
        self._reentrant_group = ReentrantCallbackGroup()

        self._robot_move_clients: Dict[str, any] = {
            "left_arm": self.create_client(RobotMove, "/L/robot_move", callback_group=self._reentrant_group),
            "right_arm": self.create_client(RobotMove, "/R/robot_move", callback_group=self._reentrant_group),
        }
        self._robot_servo_joint_clients: Dict[str, any] = {
            "left_arm": self.create_client(RobotServoJoint, "/L/robot_servo_joint", callback_group=self._reentrant_group),
            "right_arm": self.create_client(RobotServoJoint, "/R/robot_servo_joint", callback_group=self._reentrant_group),
        }
        self._robot_move_cart_clients: Dict[str, any] = {
            "left_arm": self.create_client(RobotMoveCart, "/L/robot_move_cart", callback_group=self._reentrant_group),
            "right_arm": self.create_client(RobotMoveCart, "/R/robot_move_cart", callback_group=self._reentrant_group),
        }
        self._gripper_command_clients: Dict[str, any] = {
            "left_arm": self.create_client(
                GripperCommand, self._left_gripper_command_service, callback_group=self._reentrant_group
            ),
            "right_arm": self.create_client(
                GripperCommand, self._right_gripper_command_service, callback_group=self._reentrant_group
            ),
        }
        self._gripper_status_clients: Dict[str, any] = {
            "left_arm": self.create_client(
                GripperStatusSrv, self._left_gripper_status_service, callback_group=self._reentrant_group
            ),
            "right_arm": self.create_client(
                GripperStatusSrv, self._right_gripper_status_service, callback_group=self._reentrant_group
            ),
        }
        self._attach_client = self.create_client(
            AttachObject, "/scene/attach_object", callback_group=self._reentrant_group
        )
        self._detach_client = self.create_client(
            DetachObject, "/scene/detach_object", callback_group=self._reentrant_group
        )
        self._set_interaction_client = self.create_client(
            SetObjectInteraction, "/scene/set_object_interaction", callback_group=self._reentrant_group
        )
        self._plan_pose_client = self.create_client(PlanPose, "/planning/plan_pose", callback_group=self._reentrant_group)
        self._plan_cartesian_client = self.create_client(
            PlanCartesian, "/planning/plan_cartesian", callback_group=self._reentrant_group
        )
        self._plan_dual_pose_client = self.create_client(
            PlanDualPose, "/planning/plan_dual_pose", callback_group=self._reentrant_group
        )

        self._left_robot_state: Optional[RobotState] = None
        self._right_robot_state: Optional[RobotState] = None
        self._scene_cache = SceneObjectArray()
        self._gripper_status_cache: Dict[int, GripperStatus] = {}
        self._latest_pour_state: Dict[str, object] = {}
        self._sim_tcp_pose_by_arm: Dict[str, Optional[any]] = {"left_arm": None, "right_arm": None}
        self._sim_left_setpoint_pub = self.create_publisher(JointState, "/simulation/left_joint_state_setpoint", 10)
        self._sim_right_setpoint_pub = self.create_publisher(JointState, "/simulation/right_joint_state_setpoint", 10)
        self._sim_left_gripper_pub = self.create_publisher(GripperStatus, self._left_gripper_status_topic, 10)
        self._sim_right_gripper_pub = self.create_publisher(GripperStatus, self._right_gripper_status_topic, 10)
        self._sim_truth_command_pub = self.create_publisher(
            String,
            str(self.get_parameter("sim_truth_command_topic").value),
            10,
        )
        self._sim_pour_event_pub = self.create_publisher(
            String,
            str(self.get_parameter("sim_pour_event_topic").value),
            10,
        )

        self.create_subscription(RobotState, "/L/robot_state", self._handle_left_state, 10, callback_group=self._reentrant_group)
        self.create_subscription(RobotState, "/R/robot_state", self._handle_right_state, 10, callback_group=self._reentrant_group)
        self.create_subscription(
            SceneObjectArray, "/scene_fusion/scene_objects", self._handle_scene, 10, callback_group=self._reentrant_group
        )
        self.create_subscription(
            GripperStatus,
            self._left_gripper_status_topic,
            self._handle_gripper_status,
            10,
            callback_group=self._reentrant_group,
        )
        self.create_subscription(
            GripperStatus,
            self._right_gripper_status_topic,
            self._handle_gripper_status,
            10,
            callback_group=self._reentrant_group,
        )
        self.create_subscription(
            String,
            str(self.get_parameter("sim_pour_state_topic").value),
            self._handle_pour_state,
            10,
            callback_group=self._reentrant_group,
        )

        self.create_service(SetGripper, "/execution/set_gripper", self._handle_set_gripper, callback_group=self._reentrant_group)
        self._trajectory_action_server = ActionServer(
            self,
            ExecuteTrajectory,
            "/execution/execute_trajectory",
            execute_callback=self._execute_trajectory,
            goal_callback=self._goal_callback,
            cancel_callback=self._cancel_callback,
            callback_group=self._reentrant_group,
        )
        self._primitive_action_server = ActionServer(
            self,
            ExecutePrimitive,
            "/execution/execute_primitive",
            execute_callback=self._execute_primitive,
            goal_callback=self._primitive_goal_callback,
            cancel_callback=self._cancel_callback,
            callback_group=self._reentrant_group,
        )
        self.get_logger().info(
            f"execution_adapter 已启动，backend={self._execution_backend}，"
            f"ServoJ vel={self._trajectory_servo_joint_vel:.1f} "
            f"acc={self._trajectory_servo_joint_acc:.1f} "
            f"cmd_time={self._trajectory_servo_joint_cmd_time:.3f} "
            f"filter_time={self._trajectory_servo_joint_filter_time:.3f} "
            f"completion_margin={self._trajectory_servo_joint_completion_margin_s:.2f}s "
            f"resample={self._trajectory_servo_joint_resample_enabled} "
            f"duration_cmd_time={self._trajectory_servo_joint_duration_cmd_time:.3f}"
        )

    def _parse_profile_list(self, value) -> set[str]:
        if isinstance(value, str):
            try:
                parsed = yaml.safe_load(value)
            except Exception:  # pylint: disable=broad-except
                parsed = None
            if isinstance(parsed, list):
                return {str(item) for item in parsed if str(item).strip()}
            return {item.strip() for item in value.split(",") if item.strip()}
        if isinstance(value, (list, tuple)):
            return {str(item) for item in value if str(item).strip()}
        return set()

    def _parse_bool(self, value) -> bool:
        if isinstance(value, bool):
            return value
        return str(value).strip().lower() in {"1", "true", "yes", "on"}

    def _clamp_percent_parameter(self, parameter_name: str) -> float:
        value = float(self.get_parameter(parameter_name).value)
        if value < 0.1:
            self.get_logger().warn(f"{parameter_name}={value} 过低，钳制到 0.1")
            return 0.1
        if value > 100.0:
            self.get_logger().warn(f"{parameter_name}={value} 过高，钳制到 100.0")
            return 100.0
        return value

    def _wait_future(self, future, timeout_sec: float):
        deadline = time.monotonic() + max(timeout_sec, 0.0)
        while time.monotonic() < deadline:
            if future.done():
                try:
                    return future.result()
                except Exception:  # pylint: disable=broad-except
                    return None
            time.sleep(0.01)
        return None

    def _resolve_gripper_slave_id(self, arm_name: str, requested_slave_id: int) -> int:
        if requested_slave_id > 0:
            return requested_slave_id
        if arm_name == "left_arm":
            return self._left_gripper_slave_id
        if arm_name == "right_arm":
            return self._right_gripper_slave_id
        return self._left_gripper_slave_id

    def _resolve_gripper_arm(self, arm_name: str, resolved_slave_id: int) -> str:
        if resolved_slave_id == self._right_gripper_slave_id:
            return "right_arm"
        if resolved_slave_id == self._left_gripper_slave_id:
            return "left_arm"
        if arm_name == "right_arm":
            return "right_arm"
        return "left_arm"

    def _handle_left_state(self, message: RobotState) -> None:
        self._left_robot_state = message

    def _handle_right_state(self, message: RobotState) -> None:
        self._right_robot_state = message

    def _handle_scene(self, message: SceneObjectArray) -> None:
        self._scene_cache = message

    def _handle_gripper_status(self, message: GripperStatus) -> None:
        self._gripper_status_cache[int(message.slave_id)] = message

    def _handle_pour_state(self, message: String) -> None:
        try:
            self._latest_pour_state = json.loads(message.data)
        except json.JSONDecodeError:
            self.get_logger().warn(f"忽略非法 /competition/pour_state JSON: {message.data}")

    def _sim_mode(self) -> bool:
        return self._execution_backend == "sim"

    def _robot_state_fresh(self, state: Optional[RobotState]) -> bool:
        if state is None:
            return False
        stamp = time.time()
        msg_stamp = float(state.header.stamp.sec) + float(state.header.stamp.nanosec) * 1e-9
        return msg_stamp > 0.0 and (stamp - msg_stamp) <= self._sim_robot_state_freshness_max_age_s

    def _sim_robot_state_gate(self, require_dual: bool = True) -> PrimitiveExecutionOutcome:
        outcome = PrimitiveExecutionOutcome(success=True, message="sim robot_state fresh", result_code=RESULT_SUCCESS)
        left_ok = self._robot_state_fresh(self._left_robot_state)
        right_ok = self._robot_state_fresh(self._right_robot_state)
        if require_dual and not (left_ok and right_ok):
            outcome.success = False
            outcome.message = (
                "sim robot_state 过期或缺失: "
                f"left={left_ok}, right={right_ok}, max_age={self._sim_robot_state_freshness_max_age_s:.3f}s"
            )
            outcome.result_code = RESULT_TIMEOUT
        return outcome

    def _goal_callback(self, goal_request: ExecuteTrajectory.Goal) -> GoalResponse:
        if goal_request.arm_group not in ("left_arm", "right_arm", "dual_arm"):
            self.get_logger().warn(f"拒绝未知 arm_group: {goal_request.arm_group}")
            return GoalResponse.REJECT
        return GoalResponse.ACCEPT

    def _primitive_goal_callback(self, goal_request: ExecutePrimitive.Goal) -> GoalResponse:
        if goal_request.arm_group not in ("left_arm", "right_arm", "dual_arm"):
            self.get_logger().warn(f"拒绝未知 primitive arm_group: {goal_request.arm_group}")
            return GoalResponse.REJECT
        if goal_request.primitive_id not in supported_primitive_ids():
            self.get_logger().warn(f"拒绝未知 primitive_id: {goal_request.primitive_id}")
            return GoalResponse.REJECT
        return GoalResponse.ACCEPT

    def _cancel_callback(self, _goal_handle) -> CancelResponse:
        return CancelResponse.ACCEPT

    def _execute_trajectory(self, goal_handle):
        goal = goal_handle.request
        feedback = ExecuteTrajectory.Feedback()
        feedback.progress = 0.1
        feedback.state = "accepted"
        goal_handle.publish_feedback(feedback)

        started_at = time.monotonic()
        success = True
        message = "未执行任何运动"
        result_code = "success"
        primary_started = False
        secondary_started = False
        primary_completed = False
        secondary_completed = False
        sync_skew_ms = 0.0

        if goal.synchronized or goal.arm_group == "dual_arm":
            success, message, result_code, primary_started, secondary_started, primary_completed, secondary_completed, sync_skew_ms = (
                self._execute_dual_arm(goal.joint_trajectory, goal.secondary_joint_trajectory)
            )
        elif goal.use_cartesian_execution and goal.cartesian_waypoints:
            primary_started = True
            success, message = self._execute_cartesian_sequence(goal.arm_group, goal.cartesian_waypoints, goal.execution_profile)
            primary_completed = success
            result_code = "success" if success else "driver_failure"
        elif goal.joint_trajectory.points:
            primary_started = True
            success, message = self._execute_joint(goal.arm_group, goal.joint_trajectory)
            primary_completed = success
            result_code = "success" if success else "driver_failure"
        else:
            success = False
            message = "轨迹为空，拒绝执行"
            result_code = "cancelled"

        if self._sim_mode() and success:
            self._sim_update_tcp_from_trajectory_goal(goal)

        feedback.progress = 1.0
        feedback.state = "finished" if success else "failed"
        goal_handle.publish_feedback(feedback)

        result = ExecuteTrajectory.Result()
        result.success = success
        result.message = message
        result.result_code = result_code
        result.actual_duration_s = float(time.monotonic() - started_at)
        result.sync_skew_ms = float(sync_skew_ms)
        result.primary_started = primary_started
        result.secondary_started = secondary_started
        result.primary_completed = primary_completed
        result.secondary_completed = secondary_completed
        result.final_primary_joint_state = self._robot_state_to_joint_state(
            self._left_robot_state if goal.arm_group != "right_arm" else self._right_robot_state,
            goal.arm_group if goal.arm_group != "dual_arm" else "left_arm",
        )
        secondary_arm = secondary_arm_group(goal.arm_group, goal.secondary_arm_group)
        secondary_state = self._right_robot_state if secondary_arm != "left_arm" else self._left_robot_state
        result.final_secondary_joint_state = self._robot_state_to_joint_state(secondary_state, secondary_arm or "right_arm")
        if success:
            goal_handle.succeed()
        else:
            goal_handle.abort()
        return result

    def _execute_primitive(self, goal_handle):
        goal = goal_handle.request
        feedback = ExecutePrimitive.Feedback()
        feedback.progress = 0.05
        feedback.state = "accepted"
        goal_handle.publish_feedback(feedback)

        started_at = time.monotonic()
        valid, validation_code, validation_message, contract = validate_primitive_goal(goal)
        if valid and contract is not None and self._sim_mode():
            gate = self._sim_robot_state_gate(require_dual=True)
            if not gate.success:
                outcome = gate
            else:
                outcome = self._dispatch_primitive(goal, contract)
        elif valid and contract is not None:
            outcome = self._dispatch_primitive(goal, contract)
        else:
            outcome = PrimitiveExecutionOutcome(
                success=False,
                message=validation_message,
                result_code=validation_code or RESULT_INVALID_REQUEST,
            )

        feedback.progress = 1.0
        feedback.state = "finished" if outcome.success else "failed"
        goal_handle.publish_feedback(feedback)

        result = ExecutePrimitive.Result()
        result.success = outcome.success
        result.message = outcome.message
        result.result_code = outcome.result_code
        result.primitive_family = contract.family if contract is not None else ""
        result.contract_version = PRIMITIVE_CONTRACT_VERSION
        result.actual_duration_s = float(time.monotonic() - started_at)
        result.sync_skew_ms = float(outcome.sync_skew_ms)
        result.primary_started = outcome.primary_started
        result.secondary_started = outcome.secondary_started
        result.primary_completed = outcome.primary_completed
        result.secondary_completed = outcome.secondary_completed
        result.contact_verified = outcome.contact_verified
        result.detach_verified = outcome.detach_verified
        result.spill_detected = outcome.spill_detected
        result.fill_target_reached = outcome.fill_target_reached
        result.estimated_poured_mass_g = float(outcome.estimated_poured_mass_g)
        result.evidence_confidence = float(outcome.evidence_confidence)
        result.evidence_sources = list(outcome.evidence_sources)
        result.final_primary_joint_state = self._robot_state_to_joint_state(
            self._left_robot_state if goal.arm_group != "right_arm" else self._right_robot_state,
            goal.arm_group if goal.arm_group != "dual_arm" else "left_arm",
        )
        result.final_secondary_joint_state = self._robot_state_to_joint_state(self._right_robot_state, "right_arm")
        if outcome.success:
            goal_handle.succeed()
        else:
            goal_handle.abort()
        return result

    def _dispatch_primitive(self, goal: ExecutePrimitive.Goal, contract: PrimitiveContract) -> PrimitiveExecutionOutcome:
        outcome = PrimitiveExecutionOutcome()
        if goal.primitive_id == "cap_align_and_grasp":
            outcome.primary_started = True
            outcome.success, outcome.message = self._execute_cartesian_sequence(
                primary_arm_group(goal.arm_group),
                goal.primary_cartesian_waypoints,
                goal.execution_profile,
            )
            outcome.primary_completed = outcome.success
            if outcome.success:
                outcome.success = self._set_gripper_internal(primary_arm_group(goal.arm_group), command=2, position=200)
                outcome.contact_verified = self._check_gripper_contact(primary_arm_group(goal.arm_group))
                outcome.success = outcome.success and outcome.contact_verified
                outcome.message = "cap 对准并夹持完成" if outcome.success else "cap 对准后接触验证失败"
            outcome.result_code = RESULT_SUCCESS if outcome.success else (
                RESULT_CONTACT_FAILED if outcome.primary_completed else RESULT_DRIVER_FAILURE
            )
        elif goal.primitive_id == "cap_twist_and_unthread":
            outcome = self._execute_dual_or_single_cartesian(goal)
            motion_success = outcome.success
            outcome.contact_verified = self._check_gripper_contact(primary_arm_group(goal.arm_group)) or self._check_gripper_contact(
                secondary_arm_group(goal.arm_group, goal.secondary_arm_group)
            )
            outcome.success = motion_success and outcome.contact_verified
            if outcome.success:
                primary_link = self._tool_link_for_arm(primary_arm_group(goal.arm_group))
                secondary_link = self._tool_link_for_arm(secondary_arm_group(goal.arm_group, goal.secondary_arm_group))
                outcome.detach_verified = self._set_object_interaction(
                    object_id=goal.object_id,
                    interaction_mode="opened_split",
                    owner="cap_pour",
                    primary_link=primary_link,
                    secondary_link=secondary_link,
                    enable=True,
                )
                outcome.success = outcome.success and outcome.detach_verified
            outcome.result_code = (
                RESULT_SUCCESS
                if outcome.success
                else RESULT_CONTACT_FAILED
                if motion_success and not outcome.contact_verified
                else self._primitive_motion_result_code(outcome)
            )
        elif goal.primitive_id == "cap_place_or_release":
            outcome.primary_started = True
            outcome.success, outcome.message = self._execute_cartesian_sequence(
                primary_arm_group(goal.arm_group),
                goal.primary_cartesian_waypoints,
                goal.execution_profile,
            )
            outcome.primary_completed = outcome.success
            if outcome.success:
                outcome.success = self._set_gripper_internal(primary_arm_group(goal.arm_group), command=2, position=0)
                if outcome.success:
                    outcome.detach_verified = self._set_object_interaction(
                        object_id=goal.object_id,
                        interaction_mode="opened_split",
                        owner="cap_pour",
                        primary_link=self._tool_link_for_arm(
                            secondary_arm_group(goal.arm_group, goal.secondary_arm_group) or goal.arm_group
                        ),
                        secondary_link="",
                        enable=True,
                    )
                    outcome.success = outcome.detach_verified
                outcome.message = "cap 放置并释放完成" if outcome.success else "cap 放置后释放验证失败"
            outcome.result_code = RESULT_SUCCESS if outcome.success else (
                RESULT_DETACH_FAILED if outcome.primary_completed else RESULT_DRIVER_FAILURE
            )
        elif goal.primitive_id == "pour_tilt":
            outcome = self._execute_dual_or_single_cartesian(goal)
            if outcome.success and self._sim_mode():
                self._sim_publish_pour_event(goal)
                if self._wait_for_sim_pour_evidence(goal):
                    outcome.fill_target_reached = True
                    outcome.spill_detected = False
                    outcome.estimated_poured_mass_g = float(self._latest_pour_state.get("estimated_poured_mass_g", 120.0))
                    outcome.evidence_confidence = float(self._latest_pour_state.get("evidence_confidence", 0.9))
                    outcome.evidence_sources = ("/competition/pour_state",)
                    outcome.result_code = RESULT_SUCCESS
                    outcome.message = "sim pour_tilt 运动和倒水证据均通过"
                else:
                    outcome.success = False
                    outcome.message = "sim pour_tilt 运动完成，但 /competition/pour_state 未确认 fill_target_reached"
                    outcome.result_code = RESULT_UNVERIFIED_EVIDENCE
            elif outcome.success and not has_pour_evidence(goal.stop_condition_id):
                outcome.success = False
                outcome.message = "pour_tilt 运动完成，但缺少 fill/spill evidence，不能判定成功"
                outcome.result_code = RESULT_UNVERIFIED_EVIDENCE
                outcome.fill_target_reached = False
                outcome.estimated_poured_mass_g = -1.0
                outcome.evidence_confidence = 0.0
                outcome.evidence_sources = ()
            else:
                outcome.result_code = self._primitive_motion_result_code(outcome)
        elif goal.primitive_id == "guarded_grasp":
            outcome = self._execute_guarded_grasp(goal)
        elif goal.primitive_id == "hold_verify":
            outcome.success, outcome.contact_verified = self._hold_verify(
                primary_arm_group(goal.arm_group),
                goal.object_id,
                goal.hold_duration_s or 3.0,
                secondary_arm_group(goal.arm_group, goal.secondary_arm_group),
            )
            outcome.primary_started = True
            outcome.secondary_started = bool(secondary_arm_group(goal.arm_group, goal.secondary_arm_group))
            outcome.primary_completed = outcome.success
            outcome.secondary_completed = outcome.success if outcome.secondary_started else False
            outcome.message = "持物保持验证通过" if outcome.success else "持物保持验证失败"
            outcome.result_code = RESULT_SUCCESS if outcome.success else RESULT_HOLD_FAILED
        elif goal.primitive_id == "release_guard":
            outcome.primary_started = True
            outcome.success = self._set_gripper_internal(primary_arm_group(goal.arm_group), command=2, position=0)
            outcome.primary_completed = outcome.success
            secondary_arm = secondary_arm_group(goal.arm_group, goal.secondary_arm_group)
            if outcome.success and secondary_arm:
                outcome.secondary_started = True
                secondary_success = self._set_gripper_internal(secondary_arm, command=2, position=0)
                outcome.secondary_completed = secondary_success
                outcome.success = secondary_success
            if outcome.success:
                release_pose = self._sim_release_pose_for_goal(goal) if self._sim_mode() else None
                if release_pose is not None:
                    self._sim_publish_truth_pose(goal.object_id, release_pose, lifecycle_state="observed")
                interaction_detached = self._set_object_interaction(
                    object_id=goal.object_id,
                    interaction_mode="dual_contact" if goal.synchronized or goal.arm_group == "dual_arm" else "free",
                    owner="handover",
                    primary_link="",
                    secondary_link="",
                    enable=False,
                    timeout_sec=3.0,
                )
                if self._sim_mode():
                    if release_pose is not None:
                        self._sim_publish_truth_pose(goal.object_id, release_pose, lifecycle_state="observed")
                    sim_release_verified = self._wait_for_sim_release_evidence(
                        goal.object_id,
                        release_pose,
                        timeout_sec=10.0,
                    )
                    if sim_release_verified and not interaction_detached:
                        self.get_logger().warn(
                            f"{goal.object_id} sim release 使用 managed scene evidence 兜底；"
                            "MoveIt PlanningScene interaction 同步未在超时内确认"
                        )
                    outcome.detach_verified = (interaction_detached or sim_release_verified) and self._verify_released(goal.object_id)
                else:
                    outcome.detach_verified = interaction_detached and self._verify_released(goal.object_id)
            outcome.success = outcome.success and outcome.detach_verified
            outcome.message = "释放保护动作完成" if outcome.success else "释放保护动作失败"
            outcome.result_code = RESULT_SUCCESS if outcome.success else RESULT_DETACH_FAILED
        else:
            outcome.message = f"未知 primitive_id: {goal.primitive_id}"
            outcome.result_code = "unknown_primitive"

        if contract.contact_required_for_success and not outcome.contact_verified:
            outcome.success = False
            if outcome.result_code == RESULT_SUCCESS:
                outcome.result_code = RESULT_CONTACT_FAILED
        if contract.detach_required_for_success and not outcome.detach_verified:
            outcome.success = False
            if outcome.result_code == RESULT_SUCCESS:
                outcome.result_code = RESULT_DETACH_FAILED
        return outcome

    def _execute_guarded_grasp(self, goal: ExecutePrimitive.Goal) -> PrimitiveExecutionOutcome:
        outcome = PrimitiveExecutionOutcome(primary_started=True)
        primary_arm = primary_arm_group(goal.arm_group)
        if len(goal.primary_cartesian_waypoints) < 2:
            outcome.message = "guarded_grasp 至少需要 pregrasp 和 grasp 两个 waypoint"
            outcome.result_code = RESULT_INVALID_REQUEST
            return outcome

        pregrasp = goal.primary_cartesian_waypoints[0]
        grasp = goal.primary_cartesian_waypoints[1]
        retreat = goal.primary_cartesian_waypoints[2] if len(goal.primary_cartesian_waypoints) >= 3 else pregrasp

        pregrasp_ok, pregrasp_message = self._execute_cartesian_sequence(primary_arm, [pregrasp], goal.execution_profile)
        if not pregrasp_ok:
            outcome.message = f"guarded_grasp pregrasp 失败: {pregrasp_message}"
            outcome.result_code = RESULT_DRIVER_FAILURE
            return outcome

        approach_ok, approach_message = self._execute_cartesian_sequence(primary_arm, [grasp], goal.execution_profile)
        if not approach_ok:
            outcome.message = f"guarded_grasp approach 失败: {approach_message}"
            outcome.result_code = RESULT_DRIVER_FAILURE
            return outcome

        if self._sim_mode():
            contact_distance = self._sim_contact_distance(primary_arm, grasp)
            if contact_distance > self._sim_grasp_contact_threshold_m:
                for _ in range(max(self._sim_contact_retry_max, 0)):
                    retry_ok, _retry_message = self._execute_cartesian_sequence(primary_arm, [grasp], goal.execution_profile)
                    if retry_ok:
                        contact_distance = self._sim_contact_distance(primary_arm, grasp)
                    if contact_distance <= self._sim_grasp_contact_threshold_m:
                        break
                if contact_distance > self._sim_grasp_contact_threshold_m:
                    outcome.message = (
                        f"sim guarded_grasp contact_failed: distance={contact_distance:.3f}m "
                        f"> threshold={self._sim_grasp_contact_threshold_m:.3f}m"
                    )
                    outcome.result_code = RESULT_CONTACT_FAILED
                    return outcome

        gripper_ok = self._set_gripper_internal(primary_arm, command=2, position=255)
        if not gripper_ok:
            outcome.message = "guarded_grasp 夹爪闭合命令失败"
            outcome.result_code = RESULT_DRIVER_FAILURE
            return outcome

        outcome.contact_verified = self._check_gripper_contact(primary_arm)
        if not outcome.contact_verified:
            outcome.message = "guarded_grasp 接触未验证，禁止 attach"
            outcome.result_code = RESULT_CONTACT_FAILED
            return outcome

        link_name = self._tool_link_for_arm(primary_arm)
        attach_ok = self._call_attach(goal.object_id, link_name)
        if not attach_ok:
            outcome.message = "guarded_grasp 接触已验证但 attach 同步失败"
            outcome.result_code = RESULT_DRIVER_FAILURE
            return outcome

        retreat_ok, retreat_message = self._execute_cartesian_sequence(primary_arm, [retreat], goal.execution_profile)
        outcome.primary_completed = retreat_ok
        outcome.success = retreat_ok
        outcome.message = "guarded_grasp 完成" if retreat_ok else f"guarded_grasp retreat 失败: {retreat_message}"
        outcome.result_code = RESULT_SUCCESS if retreat_ok else RESULT_DRIVER_FAILURE
        return outcome

    def _primitive_motion_result_code(self, outcome: PrimitiveExecutionOutcome) -> str:
        if outcome.success:
            return RESULT_SUCCESS
        if outcome.sync_skew_ms > self._dual_arm_skew_limit_ms:
            return RESULT_SYNC_VIOLATION
        if "超时" in outcome.message:
            return RESULT_TIMEOUT
        if "偏差超限" in outcome.message:
            return RESULT_SYNC_VIOLATION
        return RESULT_DRIVER_FAILURE

    def _execute_dual_or_single_cartesian(self, goal: ExecutePrimitive.Goal) -> PrimitiveExecutionOutcome:
        outcome = PrimitiveExecutionOutcome(primary_started=True)
        if goal.synchronized or goal.arm_group == "dual_arm":
            primary_arm = primary_arm_group(goal.arm_group)
            secondary_arm = secondary_arm_group(goal.arm_group, goal.secondary_arm_group)
            (
                outcome.success,
                outcome.message,
                outcome.sync_skew_ms,
                outcome.primary_started,
                outcome.secondary_started,
                outcome.primary_completed,
                outcome.secondary_completed,
            ) = self._execute_dual_cartesian(
                primary_arm,
                secondary_arm,
                goal.primary_cartesian_waypoints,
                goal.secondary_cartesian_waypoints,
                goal.execution_profile,
            )
            return outcome
        outcome.success, outcome.message = self._execute_cartesian_sequence(
            primary_arm_group(goal.arm_group),
            goal.primary_cartesian_waypoints,
            goal.execution_profile,
        )
        outcome.primary_completed = outcome.success
        return outcome

    def _execute_dual_cartesian(
        self,
        primary_arm: str,
        secondary_arm: str,
        primary_waypoints,
        secondary_waypoints,
        execution_profile: str,
    ) -> tuple[bool, str, float, bool, bool, bool, bool]:
        if not primary_waypoints or not secondary_waypoints:
            return False, "双臂 cartesian primitive 缺少 waypoint", 0.0, False, False, False, False
        if len(primary_waypoints) != len(secondary_waypoints):
            return False, "双臂 cartesian primitive waypoint 数量不一致", 0.0, False, False, False, False
        for pose_stamped in list(primary_waypoints) + list(secondary_waypoints):
            if not self._cartesian_waypoint_frame_valid(pose_stamped):
                return False, f"双臂 cartesian primitive waypoint 必须是 {self._world_frame} frame", 0.0, False, False, False, False
        if self._vendor_direct_allowed(execution_profile):
            return self._execute_vendor_dual_cartesian(primary_arm, secondary_arm, primary_waypoints, secondary_waypoints)

        max_skew_ms = 0.0
        primary_completed = False
        secondary_completed = False
        for index in range(len(primary_waypoints)):
            if not self._plan_dual_pose_client.wait_for_service(timeout_sec=0.5):
                return False, "/planning/plan_dual_pose 服务不可用", max_skew_ms, False, False, primary_completed, secondary_completed
            request = PlanDualPose.Request()
            if primary_arm == "left_arm":
                request.left_target_pose = primary_waypoints[index]
                request.right_target_pose = secondary_waypoints[index]
            else:
                request.left_target_pose = secondary_waypoints[index]
                request.right_target_pose = primary_waypoints[index]
            request.primary_arm = primary_arm
            request.planner_id = ""
            request.coordination_mode = "paired_pose"
            request.sync_policy = "software_pair"
            future = self._plan_dual_pose_client.call_async(request)
            response = self._wait_future(future, 5.0)
            if response is None:
                return False, f"双臂 cartesian step {index} 规划超时", max_skew_ms, False, False, primary_completed, secondary_completed
            if not bool(response.success) or response.result_code != RESULT_SUCCESS:
                return False, f"双臂 cartesian step {index} 规划失败: {response.result_code}", max_skew_ms, False, False, primary_completed, secondary_completed
            (
                success,
                message,
                result_code,
                primary_started,
                secondary_started,
                primary_done,
                secondary_done,
                sync_skew_ms,
            ) = self._execute_dual_arm(response.left_joint_trajectory, response.right_joint_trajectory)
            max_skew_ms = max(max_skew_ms, sync_skew_ms)
            primary_completed = primary_done
            secondary_completed = secondary_done
            if not success:
                if result_code == RESULT_SYNC_VIOLATION:
                    return False, message, max_skew_ms, primary_started, secondary_started, primary_completed, secondary_completed
                return False, f"双臂 cartesian step {index} 执行失败: {message}", max_skew_ms, primary_started, secondary_started, primary_completed, secondary_completed
            if self._sim_mode():
                self._sim_tcp_pose_by_arm[primary_arm] = primary_waypoints[index]
                self._sim_tcp_pose_by_arm[secondary_arm] = secondary_waypoints[index]
        return True, "双臂 cartesian primitive 经 MoveIt 规划后执行成功", max_skew_ms, True, True, True, True

    def _execute_vendor_dual_cartesian(
        self,
        primary_arm: str,
        secondary_arm: str,
        primary_waypoints,
        secondary_waypoints,
    ) -> tuple[bool, str, float, bool, bool, bool, bool]:
        max_skew_ms = 0.0
        primary_completed = False
        secondary_completed = False
        for index in range(len(primary_waypoints)):
            primary_client = self._robot_move_cart_clients.get(primary_arm)
            secondary_client = self._robot_move_cart_clients.get(secondary_arm)
            if primary_client is None or secondary_client is None:
                return False, "双臂 robot_move_cart 客户端不存在", max_skew_ms, False, False, primary_completed, secondary_completed
            if not primary_client.wait_for_service(timeout_sec=0.5) or not secondary_client.wait_for_service(timeout_sec=0.5):
                return False, "双臂 robot_move_cart 服务不可用", max_skew_ms, False, False, primary_completed, secondary_completed
            left_request = self._build_robot_move_cart_request(primary_waypoints[index])
            right_request = self._build_robot_move_cart_request(secondary_waypoints[index])
            send_left = time.monotonic()
            left_future = primary_client.call_async(left_request)
            send_right = time.monotonic()
            right_future = secondary_client.call_async(right_request)
            max_skew_ms = max(max_skew_ms, abs(send_right - send_left) * 1000.0)
            left_response = self._wait_future(left_future, 10.0)
            right_response = self._wait_future(right_future, 10.0)
            if left_response is None or right_response is None:
                return False, f"双臂 cartesian step {index} 超时", max_skew_ms, True, True, primary_completed, secondary_completed
            if max_skew_ms > self._dual_arm_skew_limit_ms:
                return False, "双臂 cartesian primitive 启动偏差超限", max_skew_ms, True, True, primary_completed, secondary_completed
            primary_completed = bool(left_response.success)
            secondary_completed = bool(right_response.success)
            if not primary_completed or not secondary_completed:
                return False, f"双臂 cartesian step {index} 执行失败", max_skew_ms, True, True, primary_completed, secondary_completed
        return True, "双臂 cartesian primitive 执行成功", max_skew_ms, True, True, True, True

    def _execute_cartesian_sequence(self, arm_group: str, waypoints, execution_profile: str = "") -> tuple[bool, str]:
        if not waypoints:
            return False, "cartesian waypoints 为空"
        for index, pose_stamped in enumerate(waypoints):
            if not self._cartesian_waypoint_frame_valid(pose_stamped):
                return False, f"step={index}: cartesian waypoint 必须是 {self._world_frame} frame"
        if self._vendor_direct_allowed(execution_profile):
            return self._execute_vendor_cartesian_sequence(arm_group, waypoints)
        if len(waypoints) == 1:
            if not self._plan_pose_client.wait_for_service(timeout_sec=0.5):
                return False, "/planning/plan_pose 服务不可用"
            request = PlanPose.Request()
            request.arm_group = arm_group
            request.target_pose = waypoints[0]
            request.planner_id = ""
            request.cartesian = False
            response = self._wait_future(self._plan_pose_client.call_async(request), 5.0)
        else:
            if not self._plan_cartesian_client.wait_for_service(timeout_sec=0.5):
                return False, "/planning/plan_cartesian 服务不可用"
            request = PlanCartesian.Request()
            request.arm_group = arm_group
            request.waypoints = list(waypoints)
            request.planner_id = ""
            response = self._wait_future(self._plan_cartesian_client.call_async(request), 5.0)
        if response is None:
            return False, "cartesian planning 超时"
        if not bool(response.success) or response.result_code != RESULT_SUCCESS:
            return False, f"cartesian planning 失败: {response.result_code}"
        success, message = self._execute_joint(arm_group, response.joint_trajectory)
        if self._sim_mode() and success and waypoints:
            self._sim_tcp_pose_by_arm[arm_group] = waypoints[-1]
        return success, message if not success else "cartesian sequence 经 MoveIt 规划后执行成功"

    def _execute_vendor_cartesian_sequence(self, arm_group: str, waypoints) -> tuple[bool, str]:
        for index, pose_stamped in enumerate(waypoints):
            success, message = self._execute_cartesian(arm_group, pose_stamped)
            if not success:
                return False, f"step={index}: {message}"
        return True, "vendor direct cartesian sequence 执行成功"

    def _vendor_direct_allowed(self, execution_profile: str) -> bool:
        profile_name = (execution_profile or "").strip()
        return (
            self._allow_vendor_direct_cartesian
            and bool(profile_name)
            and profile_name in self._vendor_direct_cartesian_profiles
        )

    def _cartesian_waypoint_frame_valid(self, pose_stamped) -> bool:
        frame_id = pose_stamped.header.frame_id.strip()
        return bool(frame_id) and frame_id == self._world_frame

    def _sim_update_tcp_from_trajectory_goal(self, goal) -> None:
        if not goal.cartesian_waypoints:
            return
        if goal.arm_group == "dual_arm" and len(goal.cartesian_waypoints) >= 2:
            self._sim_tcp_pose_by_arm["left_arm"] = goal.cartesian_waypoints[0]
            self._sim_tcp_pose_by_arm["right_arm"] = goal.cartesian_waypoints[1]
            return
        arm = goal.arm_group if goal.arm_group in ("left_arm", "right_arm") else "left_arm"
        self._sim_tcp_pose_by_arm[arm] = goal.cartesian_waypoints[-1]

    def _execute_cartesian(self, arm_group: str, pose_stamped) -> tuple[bool, str]:
        client = self._robot_move_cart_clients.get(arm_group)
        if client is None or not client.wait_for_service(timeout_sec=0.5):
            return False, f"{arm_group} 的 /robot_move_cart 服务不可用"

        request = self._build_robot_move_cart_request(pose_stamped)
        future = client.call_async(request)
        response = self._wait_future(future, 10.0)
        if response is None:
            return False, f"{arm_group} 的笛卡尔执行超时"
        return bool(response.success), response.message

    def _build_robot_move_cart_request(self, pose_stamped) -> RobotMoveCart.Request:
        request = RobotMoveCart.Request()
        request.tcp_pose.x = float(pose_stamped.pose.position.x * 1000.0)
        request.tcp_pose.y = float(pose_stamped.pose.position.y * 1000.0)
        request.tcp_pose.z = float(pose_stamped.pose.position.z * 1000.0)
        request.tcp_pose.rx, request.tcp_pose.ry, request.tcp_pose.rz = self._quaternion_to_rpy_degrees(
            pose_stamped.pose.orientation.x,
            pose_stamped.pose.orientation.y,
            pose_stamped.pose.orientation.z,
            pose_stamped.pose.orientation.w,
        )
        request.velocity = 30.0
        request.acceleration = 30.0
        request.ovl = 100.0
        request.blend_time = -1.0
        request.tool = 0
        request.user = 0
        request.config = -1
        request.use_increment = False
        return request

    def _execute_joint(self, arm_group: str, joint_trajectory) -> tuple[bool, str]:
        if self._sim_mode():
            if not joint_trajectory.points:
                return False, "关节轨迹为空"
            return self._sim_play_joint_trajectory(arm_group, joint_trajectory)
        client = self._robot_servo_joint_clients.get(arm_group)
        if client is None or not client.wait_for_service(timeout_sec=0.5):
            return False, f"{arm_group} 的 /robot_servo_joint 服务不可用"
        if not joint_trajectory.points:
            return False, "关节轨迹为空"

        request = self._build_servo_joint_request(joint_trajectory)
        future = client.call_async(request)
        response = self._wait_future(future, 10.0)
        if response is None:
            return False, f"{arm_group} 的关节执行超时"
        if not bool(response.success):
            return False, response.message
        if not self._wait_for_hardware_servo_completion(arm_group, len(request.joint_positions)):
            return False, f"{arm_group} ServoJ 执行后未在超时内确认 motion_done=true"
        return True, f"{response.message}; 已等待 ServoJ 执行窗口并确认 motion_done=true"

    def _execute_dual_arm(self, primary_joint_trajectory, secondary_joint_trajectory) -> tuple[bool, str, str, bool, bool, bool, bool, float]:
        if self._sim_mode():
            if not primary_joint_trajectory.points or not secondary_joint_trajectory.points:
                return False, "双臂轨迹不完整", "cancelled", False, False, False, False, 0.0
            success, message = self._sim_play_dual_joint_trajectories(primary_joint_trajectory, secondary_joint_trajectory)
            return success, message, "success" if success else "driver_failure", True, True, success, success, 0.0
        primary_client = self._robot_servo_joint_clients.get("left_arm")
        secondary_client = self._robot_servo_joint_clients.get("right_arm")
        if primary_client is None or secondary_client is None:
            return False, "双臂执行客户端不存在", "driver_failure", False, False, False, False, 0.0
        if not primary_client.wait_for_service(timeout_sec=0.5) or not secondary_client.wait_for_service(timeout_sec=0.5):
            return False, "双臂 servo_joint 服务不可用", "driver_failure", False, False, False, False, 0.0
        if not primary_joint_trajectory.points or not secondary_joint_trajectory.points:
            return False, "双臂轨迹不完整", "cancelled", False, False, False, False, 0.0

        left_request = self._build_servo_joint_request(primary_joint_trajectory)
        right_request = self._build_servo_joint_request(secondary_joint_trajectory)
        send_left = time.monotonic()
        left_future = primary_client.call_async(left_request)
        send_right = time.monotonic()
        right_future = secondary_client.call_async(right_request)
        sync_skew_ms = abs(send_right - send_left) * 1000.0
        left_response = self._wait_future(left_future, 10.0)
        right_response = self._wait_future(right_future, 10.0)
        if left_response is None or right_response is None:
            return False, "双臂执行超时", "timeout", True, True, False, False, sync_skew_ms
        left_success = bool(left_response.success)
        right_success = bool(right_response.success)
        if sync_skew_ms > self._dual_arm_skew_limit_ms:
            return False, "双臂启动偏差超限", "sync_violation", True, True, left_success, right_success, sync_skew_ms
        if not left_success and not right_success:
            return False, "双臂都执行失败", "driver_failure", True, True, False, False, sync_skew_ms
        if not left_success:
            return False, left_response.message, "primary_abort", True, True, False, right_success, sync_skew_ms
        if not right_success:
            return False, right_response.message, "secondary_abort", True, True, left_success, False, sync_skew_ms
        left_done = self._wait_for_hardware_servo_completion("left_arm", len(left_request.joint_positions))
        right_done = self._wait_for_hardware_servo_completion("right_arm", len(right_request.joint_positions))
        if not left_done or not right_done:
            return False, "双臂 ServoJ 执行后未在超时内确认 motion_done=true", "timeout", True, True, left_done, right_done, sync_skew_ms
        return True, "双臂执行成功", "success", True, True, True, True, sync_skew_ms

    def _sim_play_joint_trajectory(self, arm_group: str, joint_trajectory) -> tuple[bool, str]:
        start = self._current_joint_positions_rad(arm_group)
        duration_s = self._trajectory_duration_s(joint_trajectory)
        steps = max(int(math.ceil(duration_s * self._sim_visual_playback_rate_hz)), 1)
        interval_s = duration_s / float(steps)
        for step in range(steps + 1):
            t = duration_s * float(step) / float(steps)
            self._sim_publish_joint_positions(
                arm_group,
                self._sim_joint_names(arm_group, joint_trajectory),
                self._sim_positions_at_time(joint_trajectory, start, t),
            )
            if step < steps:
                time.sleep(interval_s)
        return True, f"{arm_group} sim joint trajectory visual playback completed in {duration_s:.2f}s"

    def _sim_play_dual_joint_trajectories(self, left_trajectory, right_trajectory) -> tuple[bool, str]:
        left_start = self._current_joint_positions_rad("left_arm")
        right_start = self._current_joint_positions_rad("right_arm")
        duration_s = max(self._trajectory_duration_s(left_trajectory), self._trajectory_duration_s(right_trajectory))
        steps = max(int(math.ceil(duration_s * self._sim_visual_playback_rate_hz)), 1)
        interval_s = duration_s / float(steps)
        left_names = self._sim_joint_names("left_arm", left_trajectory)
        right_names = self._sim_joint_names("right_arm", right_trajectory)
        for step in range(steps + 1):
            t = duration_s * float(step) / float(steps)
            self._sim_publish_joint_positions(
                "left_arm",
                left_names,
                self._sim_positions_at_time(left_trajectory, left_start, t),
            )
            self._sim_publish_joint_positions(
                "right_arm",
                right_names,
                self._sim_positions_at_time(right_trajectory, right_start, t),
            )
            if step < steps:
                time.sleep(interval_s)
        return True, f"双臂 sim 可视化轨迹执行成功，duration={duration_s:.2f}s"

    def _sim_publish_joint_setpoint(self, arm_group: str, joint_trajectory) -> None:
        self._sim_publish_joint_positions(
            arm_group,
            self._sim_joint_names(arm_group, joint_trajectory),
            self._normalize_joint_positions(joint_trajectory.points[-1].positions, self._current_joint_positions_rad(arm_group)),
        )

    def _sim_publish_joint_positions(self, arm_group: str, names: List[str], positions: List[float]) -> None:
        msg = JointState()
        msg.header.stamp = self.get_clock().now().to_msg()
        msg.name = list(names)
        msg.position = list(positions)
        msg.velocity = [0.0] * len(msg.position)
        msg.effort = [0.0] * len(msg.position)
        if arm_group == "right_arm":
            self._sim_right_setpoint_pub.publish(msg)
        else:
            self._sim_left_setpoint_pub.publish(msg)

    def _sim_positions_at_time(self, joint_trajectory, start: List[float], t: float) -> List[float]:
        previous_time = 0.0
        previous_positions = list(start)
        for point in joint_trajectory.points:
            point_time = self._point_time_s(point)
            target_positions = self._normalize_joint_positions(point.positions, previous_positions)
            if t <= point_time:
                span = max(point_time - previous_time, 1e-6)
                alpha = min(max((t - previous_time) / span, 0.0), 1.0)
                return [
                    previous + (target - previous) * alpha
                    for previous, target in zip(previous_positions, target_positions)
                ]
            previous_time = point_time
            previous_positions = target_positions
        return previous_positions

    def _current_joint_positions_rad(self, arm_group: str) -> List[float]:
        state = self._right_robot_state if arm_group == "right_arm" else self._left_robot_state
        if state is None:
            return [0.0] * 6
        return [
            math.radians(float(state.joint_position.j1)),
            math.radians(float(state.joint_position.j2)),
            math.radians(float(state.joint_position.j3)),
            math.radians(float(state.joint_position.j4)),
            math.radians(float(state.joint_position.j5)),
            math.radians(float(state.joint_position.j6)),
        ]

    @staticmethod
    def _normalize_joint_positions(positions, fallback: List[float]) -> List[float]:
        normalized = list(fallback[:6])
        while len(normalized) < 6:
            normalized.append(0.0)
        for index, value in enumerate(list(positions)[:6]):
            normalized[index] = float(value)
        return normalized

    @staticmethod
    def _trajectory_duration_s(joint_trajectory) -> float:
        if not joint_trajectory.points:
            return 0.1
        return max(ExecutionAdapterNode._point_time_s(joint_trajectory.points[-1]), 0.1)

    @staticmethod
    def _point_time_s(point) -> float:
        return float(point.time_from_start.sec) + float(point.time_from_start.nanosec) * 1e-9

    @staticmethod
    def _sim_joint_names(arm_group: str, joint_trajectory) -> List[str]:
        if joint_trajectory.joint_names:
            return list(joint_trajectory.joint_names)
        prefix = "right" if arm_group == "right_arm" else "left"
        return [f"{prefix}_j{index}" for index in range(1, 7)]

    def _build_servo_joint_request(self, joint_trajectory) -> RobotServoJoint.Request:
        request = RobotServoJoint.Request()
        request.command_type = 0
        request.acc = self._trajectory_servo_joint_acc
        request.vel = self._trajectory_servo_joint_vel
        request.cmd_time = self._trajectory_servo_joint_cmd_time
        request.filter_time = self._trajectory_servo_joint_filter_time
        request.gain = self._trajectory_servo_joint_gain
        request.use_incremental = False
        request.joint_positions = []
        positions = self._resample_servo_joint_positions(joint_trajectory)
        if len(positions) != len(joint_trajectory.points):
            self.get_logger().info(
                f"ServoJ 轨迹重采样: original_points={len(joint_trajectory.points)} "
                f"resampled_points={len(positions)} cmd_time={self._trajectory_servo_joint_cmd_time:.3f}"
            )
        for position in positions:
            joint_state = JointState()
            joint_state.name = list(joint_trajectory.joint_names)
            joint_state.position = [math.degrees(value) for value in position]
            request.joint_positions.append(joint_state)
        return request

    def _resample_servo_joint_positions(self, joint_trajectory) -> List[List[float]]:
        raw_positions = [list(point.positions) for point in joint_trajectory.points]
        if not raw_positions or not self._trajectory_servo_joint_resample_enabled:
            return raw_positions
        if len(raw_positions) < 2:
            return raw_positions
        target_duration_s = float(len(raw_positions)) * self._trajectory_servo_joint_duration_cmd_time
        target_count = max(
            len(raw_positions),
            int(math.ceil(target_duration_s / max(self._trajectory_servo_joint_cmd_time, 1e-6))),
        )
        target_count = min(target_count, self._trajectory_servo_joint_max_resampled_points)
        if target_count <= len(raw_positions):
            return raw_positions
        span = float(len(raw_positions) - 1)
        resampled: List[List[float]] = []
        for index in range(target_count):
            position_on_raw = span * float(index) / float(target_count - 1)
            lower = int(math.floor(position_on_raw))
            upper = min(lower + 1, len(raw_positions) - 1)
            ratio = position_on_raw - float(lower)
            lower_values = raw_positions[lower]
            upper_values = raw_positions[upper]
            resampled.append(
                [
                    float(low) + (float(high) - float(low)) * ratio
                    for low, high in zip(lower_values, upper_values)
                ]
            )
        return resampled

    def _hardware_servo_expected_duration_s(self, point_count: int) -> float:
        driver_window_s = float(point_count) * float(self._trajectory_servo_joint_cmd_time) * 1.10
        return max(driver_window_s, 0.1) + self._trajectory_servo_joint_completion_margin_s

    def _wait_for_hardware_servo_completion(self, arm_group: str, point_count: int) -> bool:
        expected_duration_s = self._hardware_servo_expected_duration_s(point_count)
        self.get_logger().info(
            f"{arm_group} ServoJ 等待执行窗口 {expected_duration_s:.2f}s "
            f"(points={point_count}, cmd_time={self._trajectory_servo_joint_cmd_time:.3f})"
        )
        self._sleep_with_callbacks(expected_duration_s)
        return self._wait_for_motion_done(
            arm_group,
            timeout_sec=self._trajectory_servo_joint_motion_done_timeout_s,
            stable_samples=3,
        )

    def _sleep_with_callbacks(self, duration_sec: float) -> None:
        deadline = time.monotonic() + max(duration_sec, 0.0)
        while time.monotonic() < deadline:
            time.sleep(min(0.05, max(deadline - time.monotonic(), 0.0)))

    def _state_for_arm(self, arm_group: str) -> Optional[RobotState]:
        return self._right_robot_state if arm_group == "right_arm" else self._left_robot_state

    def _wait_for_motion_done(self, arm_group: str, timeout_sec: float, stable_samples: int = 3) -> bool:
        deadline = time.monotonic() + max(timeout_sec, 0.0)
        stable_count = 0
        while time.monotonic() < deadline:
            state = self._state_for_arm(arm_group)
            if state is not None:
                if int(state.error_code) != 0:
                    self.get_logger().error(f"{arm_group} robot_state error_code={int(state.error_code)}")
                    return False
                if bool(state.motion_done):
                    stable_count += 1
                    if stable_count >= stable_samples:
                        return True
                else:
                    stable_count = 0
            time.sleep(0.1)
        return False

    def _handle_set_gripper(self, request: SetGripper.Request, response: SetGripper.Response):
        response.success = self._set_gripper_internal(
            request.arm_name,
            int(request.command),
            int(request.position),
            int(request.speed),
            int(request.torque),
            int(request.slave_id),
            request.object_id,
            request.link_name,
            request.attach_on_success,
            request.detach_on_success,
        )
        response.message = "夹爪命令完成" if response.success else "夹爪命令失败"
        return response

    def _set_gripper_internal(
        self,
        arm_name: str,
        command: int,
        position: int,
        speed: int = 255,
        torque: int = 255,
        slave_id: int = 0,
        object_id: str = "",
        link_name: str = "",
        attach_on_success: bool = False,
        detach_on_success: bool = False,
    ) -> bool:
        resolved_slave_id = self._resolve_gripper_slave_id(arm_name, slave_id)
        gripper_arm = self._resolve_gripper_arm(arm_name, resolved_slave_id)
        if self._sim_mode():
            status = GripperStatus()
            status.slave_id = resolved_slave_id
            status.gact = True
            status.gsta = 3
            status.gobj = 2 if int(position) > 0 else 3
            status.position = int(position)
            status.speed = int(speed)
            status.force = int(torque)
            status.object_status = "sim_contact" if int(position) > 0 else "sim_open"
            self._gripper_status_cache[resolved_slave_id] = status
            if gripper_arm == "right_arm":
                self._sim_right_gripper_pub.publish(status)
            else:
                self._sim_left_gripper_pub.publish(status)
            if attach_on_success and object_id and link_name:
                if not self._call_attach(object_id, link_name):
                    return False
            if detach_on_success and object_id:
                if not self._call_detach(object_id):
                    return False
                self._sim_publish_truth_release(object_id, arm_name)
            return True
        gripper_client = self._gripper_command_clients.get(gripper_arm)
        if gripper_client is None or not gripper_client.wait_for_service(timeout_sec=0.5):
            return False

        gripper_request = GripperCommand.Request()
        gripper_request.slave_id = resolved_slave_id
        gripper_request.command = int(command)
        gripper_request.position = int(position)
        gripper_request.speed = int(speed)
        gripper_request.torque = int(torque)
        future = gripper_client.call_async(gripper_request)
        response = self._wait_future(future, self._gripper_command_timeout_s)
        if response is None or not bool(response.success):
            return False

        if attach_on_success and object_id and link_name:
            if not self._call_attach(object_id, link_name):
                return False
        if detach_on_success and object_id:
            if not self._call_detach(object_id):
                return False
        return True

    def _call_attach(self, object_id: str, link_name: str) -> bool:
        if not self._attach_client.wait_for_service(timeout_sec=0.5):
            self.get_logger().warn("attach_object 服务不可用，跳过 attach 同步")
            return False
        request = AttachObject.Request()
        request.object_id = object_id
        request.link_name = link_name
        future = self._attach_client.call_async(request)
        response = self._wait_future(future, 2.0)
        return response is not None and bool(response.success)

    def _call_detach(self, object_id: str) -> bool:
        if not self._detach_client.wait_for_service(timeout_sec=0.5):
            return self._fallback_free_interaction(object_id)
        request = DetachObject.Request()
        request.object_id = object_id
        future = self._detach_client.call_async(request)
        response = self._wait_future(future, 2.0)
        if response is not None and bool(response.success):
            return True
        return self._fallback_free_interaction(object_id)

    def _sim_publish_truth_release(self, object_id: str, arm_name: str = "") -> None:
        pose_stamped = self._sim_tcp_pose_by_arm.get(arm_name) if arm_name else None
        if pose_stamped is None:
            scene_object = self._find_scene_object(object_id)
            pose_stamped = scene_object.pose if scene_object is not None else None
        if pose_stamped is None:
            return
        self._sim_publish_truth_pose(object_id, pose_stamped, lifecycle_state="observed")

    def _sim_publish_truth_pose(self, object_id: str, pose_stamped, lifecycle_state: str = "observed") -> None:
        msg = String()
        msg.data = json.dumps(
            {
                "action": "set_pose",
                "object_id": object_id,
                "pose": self._pose_stamped_to_list(pose_stamped),
                "lifecycle_state": lifecycle_state,
                "attached_link": "",
                "reserved_by": "none",
            },
            ensure_ascii=False,
        )
        self._sim_truth_command_pub.publish(msg)

    def _sim_release_pose_for_goal(self, goal: ExecutePrimitive.Goal):
        basket = self._find_scene_object(goal.reference_object_id or "basket")
        if basket is None:
            basket = self._find_scene_object("basket")
        if basket is None:
            return None
        release_pose = deepcopy(basket.pose)
        release_pose.pose.position.z = float(basket.pose.pose.position.z)
        return release_pose

    def _pose_stamped_to_list(self, pose_stamped) -> list[float]:
        return [
            float(pose_stamped.pose.position.x),
            float(pose_stamped.pose.position.y),
            float(pose_stamped.pose.position.z),
            float(pose_stamped.pose.orientation.x),
            float(pose_stamped.pose.orientation.y),
            float(pose_stamped.pose.orientation.z),
            float(pose_stamped.pose.orientation.w),
        ]

    def _sim_contact_distance(self, arm_name: str, target_pose) -> float:
        tcp_pose = self._sim_tcp_pose_by_arm.get(arm_name)
        if tcp_pose is None:
            return float("inf")
        dx = float(tcp_pose.pose.position.x - target_pose.pose.position.x)
        dy = float(tcp_pose.pose.position.y - target_pose.pose.position.y)
        dz = float(tcp_pose.pose.position.z - target_pose.pose.position.z)
        return math.sqrt(dx * dx + dy * dy + dz * dz)

    def _sim_publish_pour_event(self, goal: ExecutePrimitive.Goal) -> None:
        msg = String()
        msg.data = json.dumps(
            {
                "object_id": goal.object_id,
                "reference_object_id": goal.reference_object_id,
                "bottle": goal.object_id,
                "cup": goal.reference_object_id,
                "hold_duration_s": float(goal.hold_duration_s),
                "tilt_waypoint_count": len(goal.primary_cartesian_waypoints),
                "motion_success": True,
                "evidence_confidence": 0.9,
            },
            ensure_ascii=False,
        )
        self._sim_pour_event_pub.publish(msg)

    def _wait_for_sim_pour_evidence(self, goal: ExecutePrimitive.Goal, timeout_s: float = 1.5) -> bool:
        deadline = time.monotonic() + timeout_s
        while time.monotonic() < deadline:
            if bool(self._latest_pour_state.get("fill_target_reached", False)):
                bottle = str(self._latest_pour_state.get("bottle", ""))
                cup = str(self._latest_pour_state.get("cup", ""))
                if not bottle or bottle == goal.object_id or cup == goal.reference_object_id:
                    return True
            time.sleep(0.02)
        return False

    def _verify_detached(self, object_id: str) -> bool:
        if not object_id:
            return False
        for scene_object in self._scene_cache.objects:
            if scene_object.id == object_id:
                return scene_object.attached_link == ""
        return False

    def _check_gripper_contact(self, arm_name: str) -> bool:
        status = self._get_gripper_status(arm_name)
        if status is None:
            return False
        return bool(status.gobj in (1, 2) or status.gsta == 3)

    def _hold_verify(self, arm_name: str, object_id: str, duration_s: float, secondary_arm: str = "") -> tuple[bool, bool]:
        deadline = time.monotonic() + max(duration_s, 0.1)
        while time.monotonic() < deadline:
            status_ok = self._check_gripper_contact(arm_name)
            if secondary_arm:
                status_ok = status_ok and self._check_gripper_contact(secondary_arm)
                attached_ok = self._verify_dual_contact(object_id)
            else:
                attached_ok = self._verify_object_attached_or_hidden(object_id)
            if not status_ok or not attached_ok:
                return False, status_ok
            time.sleep(0.05)
        return True, True

    def _verify_dual_contact(self, object_id: str) -> bool:
        for scene_object in self._scene_cache.objects:
            if scene_object.id == object_id:
                return scene_object.lifecycle_state == "held_dual_contact"
        return False

    def _verify_released(self, object_id: str) -> bool:
        for scene_object in self._scene_cache.objects:
            if scene_object.id == object_id:
                return scene_object.lifecycle_state not in {"held_dual_contact", "attached", "opened_split_active"}
        return False

    def _wait_for_sim_release_evidence(self, object_id: str, release_pose, timeout_sec: float) -> bool:
        if release_pose is None:
            return False
        deadline = time.monotonic() + max(timeout_sec, 0.1)
        while time.monotonic() < deadline:
            for scene_object in self._scene_cache.objects:
                if scene_object.id != object_id:
                    continue
                if scene_object.attached_link:
                    break
                if scene_object.lifecycle_state in {"held_dual_contact", "attached", "opened_split_active"}:
                    break
                if scene_object.source != "sim_truth":
                    break
                dx = float(scene_object.pose.pose.position.x - release_pose.pose.position.x)
                dy = float(scene_object.pose.pose.position.y - release_pose.pose.position.y)
                dz = float(scene_object.pose.pose.position.z - release_pose.pose.position.z)
                if (dx * dx + dy * dy + dz * dz) ** 0.5 <= 0.08:
                    return True
            time.sleep(0.05)
        return False

    def _verify_object_attached_or_hidden(self, object_id: str) -> bool:
        if not object_id:
            return False
        for scene_object in self._scene_cache.objects:
            if scene_object.id == object_id:
                return scene_object.attached_link != "" or scene_object.lifecycle_state in {"opened_split_active", "opened_split"}
        return False

    def _set_object_interaction(
        self,
        object_id: str,
        interaction_mode: str,
        owner: str,
        primary_link: str,
        secondary_link: str,
        enable: bool,
        timeout_sec: float = 2.0,
    ) -> bool:
        if not self._set_interaction_client.wait_for_service(timeout_sec=0.5):
            return False
        request = SetObjectInteraction.Request()
        request.object_id = object_id
        request.interaction_mode = interaction_mode
        request.owner = owner
        request.primary_link = primary_link
        request.secondary_link = secondary_link
        request.enable = enable
        future = self._set_interaction_client.call_async(request)
        response = self._wait_future(future, timeout_sec)
        return response is not None and bool(response.success)

    def _tool_link_for_arm(self, arm_name: str) -> str:
        return "left_tcp" if arm_name == "left_arm" else "right_tcp"

    def _fallback_free_interaction(self, object_id: str) -> bool:
        scene_object = self._find_scene_object(object_id)
        if scene_object is None:
            return False
        if scene_object.lifecycle_state.startswith("opened_split"):
            return self._set_object_interaction(
                object_id=object_id,
                interaction_mode="free",
                owner="cap_pour",
                primary_link="",
                secondary_link="",
                enable=False,
            )
        if scene_object.lifecycle_state == "held_dual_contact":
            return self._set_object_interaction(
                object_id=object_id,
                interaction_mode="dual_contact",
                owner="handover",
                primary_link="",
                secondary_link="",
                enable=False,
            )
        self.get_logger().warn("detach_object 服务不可用，且没有可用 interaction fallback")
        return False

    def _find_scene_object(self, object_id: str):
        for scene_object in self._scene_cache.objects:
            if scene_object.id == object_id or scene_object.semantic_type == object_id:
                return scene_object
        return None

    def _get_gripper_status(self, arm_name: str) -> Optional[GripperStatus]:
        resolved_slave_id = self._resolve_gripper_slave_id(arm_name, 0)
        gripper_arm = self._resolve_gripper_arm(arm_name, resolved_slave_id)
        cached = self._gripper_status_cache.get(resolved_slave_id)
        if cached is not None:
            return cached
        gripper_status_client = self._gripper_status_clients.get(gripper_arm)
        if gripper_status_client is None or not gripper_status_client.wait_for_service(timeout_sec=0.2):
            return None
        request = GripperStatusSrv.Request()
        request.slave_id = resolved_slave_id
        future = gripper_status_client.call_async(request)
        response = self._wait_future(future, 1.0)
        if response is None or not bool(response.success):
            return None
        status = GripperStatus()
        status.slave_id = resolved_slave_id
        status.gact = response.gact
        status.gsta = response.gsta
        status.gobj = response.gobj
        status.object_status = response.object_status
        self._gripper_status_cache[resolved_slave_id] = status
        return status

    def _robot_state_to_joint_state(self, robot_state: Optional[RobotState], arm_group: str) -> JointState:
        joint_state = JointState()
        if robot_state is None:
            return joint_state
        prefix = "left" if arm_group == "left_arm" else "right"
        joint_state.header = robot_state.header
        joint_state.name = [f"{prefix}_j{index}" for index in range(1, 7)]
        joint_state.position = [
            robot_state.joint_position.j1,
            robot_state.joint_position.j2,
            robot_state.joint_position.j3,
            robot_state.joint_position.j4,
            robot_state.joint_position.j5,
            robot_state.joint_position.j6,
        ]
        return joint_state

    def _quaternion_to_rpy_degrees(self, x: float, y: float, z: float, w: float) -> Tuple[float, float, float]:
        sinr_cosp = 2.0 * (w * x + y * z)
        cosr_cosp = 1.0 - 2.0 * (x * x + y * y)
        roll = math.atan2(sinr_cosp, cosr_cosp)

        sinp = 2.0 * (w * y - z * x)
        if abs(sinp) >= 1.0:
            pitch = math.copysign(math.pi / 2.0, sinp)
        else:
            pitch = math.asin(sinp)

        siny_cosp = 2.0 * (w * z + x * y)
        cosy_cosp = 1.0 - 2.0 * (y * y + z * z)
        yaw = math.atan2(siny_cosp, cosy_cosp)

        return math.degrees(roll), math.degrees(pitch), math.degrees(yaw)


def main() -> None:
    rclpy.init()
    node = ExecutionAdapterNode()
    executor = MultiThreadedExecutor()
    executor.add_node(node)
    try:
        executor.spin()
    except KeyboardInterrupt:
        pass
    finally:
        executor.shutdown()
        node.destroy_node()
        try:
            rclpy.shutdown()
        except Exception:  # pylint: disable=broad-except
            pass


if __name__ == "__main__":
    main()
