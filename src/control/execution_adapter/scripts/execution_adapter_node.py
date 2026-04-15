#!/usr/bin/python3

from __future__ import annotations

import math
from typing import Dict, Optional
import time

import rclpy
from rclpy.action import ActionServer, CancelResponse, GoalResponse
from rclpy.executors import MultiThreadedExecutor
from rclpy.node import Node

from dualarm_interfaces.action import ExecuteTrajectory
from dualarm_interfaces.srv import SetGripper
from epg50_gripper_ros.srv import GripperCommand
from robo_ctrl.msg import RobotState
from robo_ctrl.srv import RobotMove, RobotMoveCart, RobotServoJoint
from dualarm_interfaces.srv import AttachObject, DetachObject
from sensor_msgs.msg import JointState


class ExecutionAdapterNode(Node):
    def __init__(self) -> None:
        super().__init__("execution_adapter")

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
        self._attach_client = self.create_client(AttachObject, "/scene/attach_object")
        self._detach_client = self.create_client(DetachObject, "/scene/detach_object")
        self._left_robot_state: Optional[RobotState] = None
        self._right_robot_state: Optional[RobotState] = None
        self.create_subscription(RobotState, "/L/robot_state", self._handle_left_state, 10)
        self.create_subscription(RobotState, "/R/robot_state", self._handle_right_state, 10)

        self.create_service(SetGripper, "/execution/set_gripper", self._handle_set_gripper)
        self._action_server = ActionServer(
            self,
            ExecuteTrajectory,
            "/execution/execute_trajectory",
            execute_callback=self._execute_trajectory,
            goal_callback=self._goal_callback,
            cancel_callback=self._cancel_callback,
        )
        self.get_logger().info("execution_adapter 已启动")

    def _handle_left_state(self, message: RobotState) -> None:
        self._left_robot_state = message

    def _handle_right_state(self, message: RobotState) -> None:
        self._right_robot_state = message

    def _goal_callback(self, goal_request: ExecuteTrajectory.Goal) -> GoalResponse:
        if goal_request.arm_group not in ("left_arm", "right_arm", "dual_arm"):
            self.get_logger().warn(f"拒绝未知 arm_group: {goal_request.arm_group}")
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
                self._execute_dual_arm(goal)
            )
        elif goal.use_cartesian_execution and goal.cartesian_waypoints:
            primary_started = True
            success, message = self._execute_cartesian(goal.arm_group, goal.cartesian_waypoints[-1])
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
        result.final_primary_joint_state = self._robot_state_to_joint_state(self._left_robot_state if goal.arm_group != "right_arm" else self._right_robot_state, goal.arm_group if goal.arm_group != "dual_arm" else "left_arm")
        result.final_secondary_joint_state = self._robot_state_to_joint_state(self._right_robot_state, "right_arm")
        if success:
            goal_handle.succeed()
        else:
            goal_handle.abort()
        return result

    def _execute_cartesian(self, arm_group: str, pose_stamped) -> tuple[bool, str]:
        client = self._robot_move_cart_clients.get(arm_group)
        if client is None or not client.wait_for_service(timeout_sec=0.5):
            return False, f"{arm_group} 的 /robot_move_cart 服务不可用"

        request = RobotMoveCart.Request()
        request.tcp_pose.x = float(pose_stamped.pose.position.x * 1000.0)
        request.tcp_pose.y = float(pose_stamped.pose.position.y * 1000.0)
        request.tcp_pose.z = float(pose_stamped.pose.position.z * 1000.0)
        request.tcp_pose.rx = 0.0
        request.tcp_pose.ry = 0.0
        request.tcp_pose.rz = 0.0
        request.velocity = 30.0
        request.acceleration = 30.0
        request.ovl = 100.0
        request.blend_time = -1.0
        request.tool = 0
        request.user = 0
        request.config = -1
        request.use_increment = False

        future = client.call_async(request)
        rclpy.spin_until_future_complete(self, future, timeout_sec=10.0)
        if future.result() is None:
            return False, f"{arm_group} 的笛卡尔执行超时"
        return bool(future.result().success), future.result().message

    def _execute_joint(self, arm_group: str, joint_trajectory) -> tuple[bool, str]:
        client = self._robot_servo_joint_clients.get(arm_group)
        if client is None or not client.wait_for_service(timeout_sec=0.5):
            return False, f"{arm_group} 的 /robot_servo_joint 服务不可用"
        if not joint_trajectory.points:
            return False, "关节轨迹为空"

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

        future = client.call_async(request)
        rclpy.spin_until_future_complete(self, future, timeout_sec=10.0)
        if future.result() is None:
            return False, f"{arm_group} 的关节执行超时"
        return bool(future.result().success), future.result().message

    def _execute_dual_arm(self, goal) -> tuple[bool, str, str, bool, bool, bool, bool, float]:
        primary_client = self._robot_servo_joint_clients.get("left_arm")
        secondary_client = self._robot_servo_joint_clients.get("right_arm")
        if primary_client is None or secondary_client is None:
            return False, "双臂执行客户端不存在", "driver_failure", False, False, False, False, 0.0
        if not primary_client.wait_for_service(timeout_sec=0.5) or not secondary_client.wait_for_service(timeout_sec=0.5):
            return False, "双臂 servo_joint 服务不可用", "driver_failure", False, False, False, False, 0.0
        if not goal.joint_trajectory.points or not goal.secondary_joint_trajectory.points:
            return False, "双臂轨迹不完整", "cancelled", False, False, False, False, 0.0

        left_request = self._build_servo_joint_request(goal.joint_trajectory)
        right_request = self._build_servo_joint_request(goal.secondary_joint_trajectory)
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
        if sync_skew_ms > 100.0:
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
        if not self._gripper_client.wait_for_service(timeout_sec=0.5):
            response.success = False
            response.message = "夹爪服务不可用"
            return response

        gripper_request = GripperCommand.Request()
        gripper_request.slave_id = int(request.slave_id)
        gripper_request.command = int(request.command)
        gripper_request.position = int(request.position)
        gripper_request.speed = int(request.speed)
        gripper_request.torque = int(request.torque)

        future = self._gripper_client.call_async(gripper_request)
        rclpy.spin_until_future_complete(self, future, timeout_sec=5.0)
        if future.result() is None:
            response.success = False
            response.message = "夹爪命令超时"
            return response

        response.success = bool(future.result().success)
        response.message = future.result().message
        if response.success and request.attach_on_success and request.object_id and request.link_name:
            self._call_attach(request.object_id, request.link_name)
        if response.success and request.detach_on_success and request.object_id:
            self._call_detach(request.object_id)
        return response

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


def main() -> None:
    rclpy.init()
    node = ExecutionAdapterNode()
    executor = MultiThreadedExecutor()
    executor.add_node(node)
    try:
        executor.spin()
    finally:
        executor.shutdown()
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    main()
