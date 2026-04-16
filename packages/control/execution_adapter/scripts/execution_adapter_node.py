#!/usr/bin/python3

from __future__ import annotations

import math
import time
from typing import Dict, Optional, Tuple

import rclpy
from epg50_gripper_ros.msg import GripperStatus
from epg50_gripper_ros.srv import GripperCommand, GripperStatus as GripperStatusSrv
from rclpy.action import ActionServer, CancelResponse, GoalResponse
from rclpy.executors import MultiThreadedExecutor
from rclpy.node import Node
from sensor_msgs.msg import JointState

from dualarm_interfaces.action import ExecutePrimitive, ExecuteTrajectory
from dualarm_interfaces.msg import SceneObjectArray
from dualarm_interfaces.srv import AttachObject, DetachObject, SetGripper
from robo_ctrl.msg import RobotState
from robo_ctrl.srv import RobotMove, RobotMoveCart, RobotServoJoint


class ExecutionAdapterNode(Node):
    def __init__(self) -> None:
        super().__init__("execution_adapter")
        self.declare_parameter("left_gripper_slave_id", 9)
        self.declare_parameter("right_gripper_slave_id", 10)
        self.declare_parameter("dual_arm_skew_limit_ms", 30.0)
        self._left_gripper_slave_id = int(self.get_parameter("left_gripper_slave_id").value)
        self._right_gripper_slave_id = int(self.get_parameter("right_gripper_slave_id").value)
        self._dual_arm_skew_limit_ms = float(self.get_parameter("dual_arm_skew_limit_ms").value)

        self._robot_move_clients: Dict[str, any] = {
            "left_arm": self.create_client(RobotMove, "/L/robot_move"),
            "right_arm": self.create_client(RobotMove, "/R/robot_move"),
        }
        self._robot_servo_joint_clients: Dict[str, any] = {
            "left_arm": self.create_client(RobotServoJoint, "/L/robot_servo_joint"),
            "right_arm": self.create_client(RobotServoJoint, "/R/robot_servo_joint"),
        }
        self._robot_move_cart_clients: Dict[str, any] = {
            "left_arm": self.create_client(RobotMoveCart, "/L/robot_move_cart"),
            "right_arm": self.create_client(RobotMoveCart, "/R/robot_move_cart"),
        }
        self._gripper_client = self.create_client(GripperCommand, "/epg50_gripper/command")
        self._gripper_status_client = self.create_client(GripperStatusSrv, "/epg50_gripper/status")
        self._attach_client = self.create_client(AttachObject, "/scene/attach_object")
        self._detach_client = self.create_client(DetachObject, "/scene/detach_object")

        self._left_robot_state: Optional[RobotState] = None
        self._right_robot_state: Optional[RobotState] = None
        self._scene_cache = SceneObjectArray()
        self._gripper_status_cache: Dict[int, GripperStatus] = {}

        self.create_subscription(RobotState, "/L/robot_state", self._handle_left_state, 10)
        self.create_subscription(RobotState, "/R/robot_state", self._handle_right_state, 10)
        self.create_subscription(SceneObjectArray, "/scene_fusion/scene_objects", self._handle_scene, 10)
        self.create_subscription(GripperStatus, "/epg50_gripper/status_stream", self._handle_gripper_status, 10)

        self.create_service(SetGripper, "/execution/set_gripper", self._handle_set_gripper)
        self._trajectory_action_server = ActionServer(
            self,
            ExecuteTrajectory,
            "/execution/execute_trajectory",
            execute_callback=self._execute_trajectory,
            goal_callback=self._goal_callback,
            cancel_callback=self._cancel_callback,
        )
        self._primitive_action_server = ActionServer(
            self,
            ExecutePrimitive,
            "/execution/execute_primitive",
            execute_callback=self._execute_primitive,
            goal_callback=self._primitive_goal_callback,
            cancel_callback=self._cancel_callback,
        )
        self.get_logger().info("execution_adapter 已启动")

    def _resolve_gripper_slave_id(self, arm_name: str, requested_slave_id: int) -> int:
        if requested_slave_id > 0:
            return requested_slave_id
        if arm_name == "left_arm":
            return self._left_gripper_slave_id
        if arm_name == "right_arm":
            return self._right_gripper_slave_id
        return self._left_gripper_slave_id

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
        result.final_secondary_joint_state = self._robot_state_to_joint_state(self._right_robot_state, "right_arm")
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
        success = False
        message = "未执行 primitive"
        result_code = "cancelled"
        sync_skew_ms = 0.0
        contact_verified = False
        detach_verified = False
        spill_detected = False

        if goal.primitive_id == "cap_align_and_grasp":
            success, message = self._execute_cartesian_sequence(goal.arm_group, goal.primary_cartesian_waypoints)
            if success:
                success = self._set_gripper_internal(goal.arm_group, command=2, position=200)
                message = "cap 对准并夹持完成" if success else "cap 对准后夹持失败"
                contact_verified = self._check_gripper_contact(goal.arm_group)
                result_code = "success" if success else "contact_failed"
        elif goal.primitive_id == "cap_twist_and_unthread":
            success, message, sync_skew_ms = self._execute_dual_or_single_cartesian(goal)
            contact_verified = self._check_gripper_contact(goal.arm_group) or self._check_gripper_contact(goal.secondary_arm_group)
            result_code = "success" if success else "driver_failure"
        elif goal.primitive_id == "cap_place_or_release":
            success, message = self._execute_cartesian_sequence(goal.arm_group, goal.primary_cartesian_waypoints)
            if success:
                success = self._set_gripper_internal(goal.arm_group, command=2, position=0)
                message = "cap 放置并释放完成" if success else "cap 放置后释放失败"
            detach_verified = True
            result_code = "success" if success else "driver_failure"
        elif goal.primitive_id == "pour_tilt":
            success, message, sync_skew_ms = self._execute_dual_or_single_cartesian(goal)
            result_code = "success" if success else "driver_failure"
        elif goal.primitive_id == "hold_verify":
            success, contact_verified = self._hold_verify(goal.arm_group, goal.object_id, goal.hold_duration_s or 3.0)
            message = "持物保持验证通过" if success else "持物保持验证失败"
            result_code = "success" if success else "hold_failed"
        elif goal.primitive_id == "release_guard":
            success = self._set_gripper_internal(goal.arm_group, command=2, position=0)
            if success and goal.secondary_arm_group:
                success = self._set_gripper_internal(goal.secondary_arm_group, command=2, position=0)
            if success and goal.object_id:
                self._call_detach(goal.object_id)
            detach_verified = self._verify_detached(goal.object_id)
            success = success and detach_verified
            message = "释放保护动作完成" if success else "释放保护动作失败"
            result_code = "success" if success else "detach_failed"
        else:
            message = f"未知 primitive_id: {goal.primitive_id}"
            result_code = "unknown_primitive"

        feedback.progress = 1.0
        feedback.state = "finished" if success else "failed"
        goal_handle.publish_feedback(feedback)

        result = ExecutePrimitive.Result()
        result.success = success
        result.message = message
        result.result_code = result_code
        result.actual_duration_s = float(time.monotonic() - started_at)
        result.sync_skew_ms = float(sync_skew_ms)
        result.contact_verified = contact_verified
        result.detach_verified = detach_verified
        result.spill_detected = spill_detected
        result.final_primary_joint_state = self._robot_state_to_joint_state(
            self._left_robot_state if goal.arm_group != "right_arm" else self._right_robot_state,
            goal.arm_group if goal.arm_group != "dual_arm" else "left_arm",
        )
        result.final_secondary_joint_state = self._robot_state_to_joint_state(self._right_robot_state, "right_arm")
        if success:
            goal_handle.succeed()
        else:
            goal_handle.abort()
        return result

    def _execute_dual_or_single_cartesian(self, goal: ExecutePrimitive.Goal) -> tuple[bool, str, float]:
        if goal.synchronized or goal.arm_group == "dual_arm":
            return self._execute_dual_cartesian(goal.primary_cartesian_waypoints, goal.secondary_cartesian_waypoints)
        success, message = self._execute_cartesian_sequence(goal.arm_group, goal.primary_cartesian_waypoints)
        return success, message, 0.0

    def _execute_dual_cartesian(self, primary_waypoints, secondary_waypoints) -> tuple[bool, str, float]:
        if not primary_waypoints or not secondary_waypoints:
            return False, "双臂 cartesian primitive 缺少 waypoint", 0.0
        max_skew_ms = 0.0
        count = min(len(primary_waypoints), len(secondary_waypoints))
        for index in range(count):
            primary_client = self._robot_move_cart_clients.get("left_arm")
            secondary_client = self._robot_move_cart_clients.get("right_arm")
            if primary_client is None or secondary_client is None:
                return False, "双臂 robot_move_cart 客户端不存在", max_skew_ms
            if not primary_client.wait_for_service(timeout_sec=0.5) or not secondary_client.wait_for_service(timeout_sec=0.5):
                return False, "双臂 robot_move_cart 服务不可用", max_skew_ms
            left_request = self._build_robot_move_cart_request(primary_waypoints[index])
            right_request = self._build_robot_move_cart_request(secondary_waypoints[index])
            send_left = time.monotonic()
            left_future = primary_client.call_async(left_request)
            send_right = time.monotonic()
            right_future = secondary_client.call_async(right_request)
            max_skew_ms = max(max_skew_ms, abs(send_right - send_left) * 1000.0)
            rclpy.spin_until_future_complete(self, left_future, timeout_sec=10.0)
            rclpy.spin_until_future_complete(self, right_future, timeout_sec=10.0)
            if left_future.result() is None or right_future.result() is None:
                return False, f"双臂 cartesian step {index} 超时", max_skew_ms
            if max_skew_ms > self._dual_arm_skew_limit_ms:
                return False, "双臂 cartesian primitive 启动偏差超限", max_skew_ms
            if not bool(left_future.result().success) or not bool(right_future.result().success):
                return False, f"双臂 cartesian step {index} 执行失败", max_skew_ms
        return True, "双臂 cartesian primitive 执行成功", max_skew_ms

    def _execute_cartesian_sequence(self, arm_group: str, waypoints) -> tuple[bool, str]:
        if not waypoints:
            return False, "cartesian waypoints 为空"
        for index, pose_stamped in enumerate(waypoints):
            success, message = self._execute_cartesian(arm_group, pose_stamped)
            if not success:
                return False, f"step={index}: {message}"
        return True, "cartesian sequence 执行成功"

    def _execute_cartesian(self, arm_group: str, pose_stamped) -> tuple[bool, str]:
        client = self._robot_move_cart_clients.get(arm_group)
        if client is None or not client.wait_for_service(timeout_sec=0.5):
            return False, f"{arm_group} 的 /robot_move_cart 服务不可用"

        request = self._build_robot_move_cart_request(pose_stamped)
        future = client.call_async(request)
        rclpy.spin_until_future_complete(self, future, timeout_sec=10.0)
        if future.result() is None:
            return False, f"{arm_group} 的笛卡尔执行超时"
        return bool(future.result().success), future.result().message

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
        rclpy.spin_until_future_complete(self, future, timeout_sec=10.0)
        if future.result() is None:
            return False, f"{arm_group} 的关节执行超时"
        return bool(future.result().success), future.result().message

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
        rclpy.spin_until_future_complete(self, left_future, timeout_sec=10.0)
        rclpy.spin_until_future_complete(self, right_future, timeout_sec=10.0)
        if left_future.result() is None or right_future.result() is None:
            return False, "双臂执行超时", "timeout", True, True, False, False, sync_skew_ms
        left_success = bool(left_future.result().success)
        right_success = bool(right_future.result().success)
        if sync_skew_ms > self._dual_arm_skew_limit_ms:
            return False, "双臂启动偏差超限", "sync_violation", True, True, left_success, right_success, sync_skew_ms
        if not left_success and not right_success:
            return False, "双臂都执行失败", "driver_failure", True, True, False, False, sync_skew_ms
        if not left_success:
            return False, left_future.result().message, "primary_abort", True, True, False, right_success, sync_skew_ms
        if not right_success:
            return False, right_future.result().message, "secondary_abort", True, True, left_success, False, sync_skew_ms
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
        if not self._gripper_client.wait_for_service(timeout_sec=0.5):
            return False

        resolved_slave_id = self._resolve_gripper_slave_id(arm_name, slave_id)
        gripper_request = GripperCommand.Request()
        gripper_request.slave_id = resolved_slave_id
        gripper_request.command = int(command)
        gripper_request.position = int(position)
        gripper_request.speed = int(speed)
        gripper_request.torque = int(torque)
        future = self._gripper_client.call_async(gripper_request)
        rclpy.spin_until_future_complete(self, future, timeout_sec=5.0)
        if future.result() is None or not bool(future.result().success):
            return False

        if attach_on_success and object_id and link_name:
            self._call_attach(object_id, link_name)
        if detach_on_success and object_id:
            self._call_detach(object_id)
        return True

    def _call_attach(self, object_id: str, link_name: str) -> None:
        if not self._attach_client.wait_for_service(timeout_sec=0.5):
            self.get_logger().warn("attach_object 服务不可用，跳过 attach 同步")
            return
        request = AttachObject.Request()
        request.object_id = object_id
        request.link_name = link_name
        future = self._attach_client.call_async(request)
        rclpy.spin_until_future_complete(self, future, timeout_sec=2.0)

    def _call_detach(self, object_id: str) -> None:
        if not self._detach_client.wait_for_service(timeout_sec=0.5):
            self.get_logger().warn("detach_object 服务不可用，跳过 detach 同步")
            return
        request = DetachObject.Request()
        request.object_id = object_id
        future = self._detach_client.call_async(request)
        rclpy.spin_until_future_complete(self, future, timeout_sec=2.0)

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
        cached = self._gripper_status_cache.get(resolved_slave_id)
        if cached is not None:
            return cached
        if not self._gripper_status_client.wait_for_service(timeout_sec=0.2):
            return None
        request = GripperStatusSrv.Request()
        request.slave_id = resolved_slave_id
        future = self._gripper_status_client.call_async(request)
        rclpy.spin_until_future_complete(self, future, timeout_sec=1.0)
        if future.result() is None or not bool(future.result().success):
            return None
        status = GripperStatus()
        status.slave_id = resolved_slave_id
        status.gact = future.result().gact
        status.gsta = future.result().gsta
        status.gobj = future.result().gobj
        status.object_status = future.result().object_status
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
