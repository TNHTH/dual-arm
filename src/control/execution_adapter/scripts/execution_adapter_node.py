#!/usr/bin/python3

from __future__ import annotations

import math
import time
from dataclasses import dataclass
from typing import Dict, Optional, Tuple

import rclpy
from epg50_gripper_ros.msg import GripperStatus
from epg50_gripper_ros.srv import GripperCommand, GripperStatus as GripperStatusSrv
from rclpy.action import ActionServer, CancelResponse, GoalResponse
from rclpy.callback_groups import ReentrantCallbackGroup
from rclpy.executors import MultiThreadedExecutor
from rclpy.node import Node
from sensor_msgs.msg import JointState

from dualarm_interfaces.action import ExecutePrimitive, ExecuteTrajectory
from dualarm_interfaces.msg import SceneObjectArray
from dualarm_interfaces.srv import AttachObject, DetachObject, SetGripper
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
    primary_started: bool = False
    secondary_started: bool = False
    primary_completed: bool = False
    secondary_completed: bool = False


class ExecutionAdapterNode(Node):
    def __init__(self) -> None:
        super().__init__("execution_adapter")
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

        self._left_robot_state: Optional[RobotState] = None
        self._right_robot_state: Optional[RobotState] = None
        self._scene_cache = SceneObjectArray()
        self._gripper_status_cache: Dict[int, GripperStatus] = {}

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
        self.get_logger().info("execution_adapter 已启动")

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
            success, message = self._execute_cartesian_sequence(goal.arm_group, goal.cartesian_waypoints)
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
        if valid and contract is not None:
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
            )
            outcome.primary_completed = outcome.success
            if outcome.success:
                outcome.success = self._set_gripper_internal(primary_arm_group(goal.arm_group), command=2, position=0)
                if outcome.success:
                    detached = self._call_detach(goal.object_id)
                    outcome.detach_verified = detached and self._verify_detached(goal.object_id)
                    outcome.success = outcome.detach_verified
                outcome.message = "cap 放置并释放完成" if outcome.success else "cap 放置后释放验证失败"
            outcome.result_code = RESULT_SUCCESS if outcome.success else (
                RESULT_DETACH_FAILED if outcome.primary_completed else RESULT_DRIVER_FAILURE
            )
        elif goal.primitive_id == "pour_tilt":
            outcome = self._execute_dual_or_single_cartesian(goal)
            outcome.result_code = self._primitive_motion_result_code(outcome)
        elif goal.primitive_id == "hold_verify":
            outcome.success, outcome.contact_verified = self._hold_verify(
                primary_arm_group(goal.arm_group),
                goal.object_id,
                goal.hold_duration_s or 3.0,
            )
            outcome.primary_started = True
            outcome.primary_completed = outcome.success
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
                outcome.detach_verified = self._call_detach(goal.object_id)
            outcome.detach_verified = outcome.detach_verified and self._verify_detached(goal.object_id)
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
            )
            return outcome
        outcome.success, outcome.message = self._execute_cartesian_sequence(
            primary_arm_group(goal.arm_group),
            goal.primary_cartesian_waypoints,
        )
        outcome.primary_completed = outcome.success
        return outcome

    def _execute_dual_cartesian(
        self,
        primary_arm: str,
        secondary_arm: str,
        primary_waypoints,
        secondary_waypoints,
    ) -> tuple[bool, str, float, bool, bool, bool, bool]:
        if not primary_waypoints or not secondary_waypoints:
            return False, "双臂 cartesian primitive 缺少 waypoint", 0.0, False, False, False, False
        if len(primary_waypoints) != len(secondary_waypoints):
            return False, "双臂 cartesian primitive waypoint 数量不一致", 0.0, False, False, False, False
        for pose_stamped in list(primary_waypoints) + list(secondary_waypoints):
            if not self._cartesian_waypoint_frame_valid(pose_stamped):
                return False, f"双臂 cartesian primitive waypoint 必须是 {self._world_frame} frame", 0.0, False, False, False, False
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

    def _execute_cartesian_sequence(self, arm_group: str, waypoints) -> tuple[bool, str]:
        if not waypoints:
            return False, "cartesian waypoints 为空"
        for index, pose_stamped in enumerate(waypoints):
            if not self._cartesian_waypoint_frame_valid(pose_stamped):
                return False, f"step={index}: cartesian waypoint 必须是 {self._world_frame} frame"
            success, message = self._execute_cartesian(arm_group, pose_stamped)
            if not success:
                return False, f"step={index}: {message}"
        return True, "cartesian sequence 执行成功"

    def _cartesian_waypoint_frame_valid(self, pose_stamped) -> bool:
        frame_id = pose_stamped.header.frame_id.strip()
        return bool(frame_id) and frame_id == self._world_frame

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
        return bool(response.success), response.message

    def _execute_dual_arm(self, primary_joint_trajectory, secondary_joint_trajectory) -> tuple[bool, str, str, bool, bool, bool, bool, float]:
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
        return True, "双臂执行成功", "success", True, True, True, True, sync_skew_ms

    def _build_servo_joint_request(self, joint_trajectory) -> RobotServoJoint.Request:
        request = RobotServoJoint.Request()
        request.command_type = 0
        request.acc = 30.0
        request.vel = 30.0
        request.cmd_time = 0.01
        request.filter_time = 0.003
        request.gain = 0.0
        request.use_incremental = False
        request.joint_positions = []
        for point in joint_trajectory.points:
            joint_state = JointState()
            joint_state.name = list(joint_trajectory.joint_names)
            joint_state.position = [math.degrees(value) for value in point.positions]
            request.joint_positions.append(joint_state)
        return request

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
            self.get_logger().warn("detach_object 服务不可用，跳过 detach 同步")
            return False
        request = DetachObject.Request()
        request.object_id = object_id
        future = self._detach_client.call_async(request)
        response = self._wait_future(future, 2.0)
        return response is not None and bool(response.success)

    def _verify_detached(self, object_id: str) -> bool:
        if not object_id:
            return False
        for scene_object in self._scene_cache.objects:
            if scene_object.id == object_id:
                return scene_object.attached_link == ""
        return True

    def _check_gripper_contact(self, arm_name: str) -> bool:
        status = self._get_gripper_status(arm_name)
        if status is None:
            return False
        return bool(status.gobj in (1, 2) or status.gsta == 3)

    def _hold_verify(self, arm_name: str, object_id: str, duration_s: float) -> tuple[bool, bool]:
        deadline = time.monotonic() + max(duration_s, 0.1)
        while time.monotonic() < deadline:
            status_ok = self._check_gripper_contact(arm_name)
            attached_ok = self._verify_object_attached_or_hidden(object_id)
            if not status_ok or not attached_ok:
                return False, status_ok
            time.sleep(0.05)
        return True, True

    def _verify_object_attached_or_hidden(self, object_id: str) -> bool:
        if not object_id:
            return False
        for scene_object in self._scene_cache.objects:
            if scene_object.id == object_id:
                return scene_object.attached_link != "" or scene_object.lifecycle_state == "lost"
        return True

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
