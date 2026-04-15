#!/usr/bin/python3

from __future__ import annotations

from typing import Dict, Optional

import rclpy
from rclpy.action import ActionServer, CancelResponse, GoalResponse
from rclpy.executors import MultiThreadedExecutor
from rclpy.node import Node

from dualarm_interfaces.action import ExecuteTrajectory
from dualarm_interfaces.srv import SetGripper
from epg50_gripper_ros.srv import GripperCommand
from robo_ctrl.srv import RobotMove, RobotMoveCart


class ExecutionAdapterNode(Node):
    def __init__(self) -> None:
        super().__init__("execution_adapter")

        self._robot_move_clients: Dict[str, any] = {
            "left_arm": self.create_client(RobotMove, "/L/robot_move"),
            "right_arm": self.create_client(RobotMove, "/R/robot_move"),
        }
        self._robot_move_cart_clients: Dict[str, any] = {
            "left_arm": self.create_client(RobotMoveCart, "/L/robot_move_cart"),
            "right_arm": self.create_client(RobotMoveCart, "/R/robot_move_cart"),
        }
        self._gripper_client = self.create_client(GripperCommand, "/epg50_gripper/command")

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

        success = True
        message = "未执行任何运动"

        if goal.arm_group == "dual_arm":
            success = False
            message = "当前版本尚未支持 dual_arm 同步执行，请分别下发 left_arm/right_arm"
        elif goal.use_cartesian_execution and goal.cartesian_waypoints:
            success, message = self._execute_cartesian(goal.arm_group, goal.cartesian_waypoints[-1])
        elif goal.joint_trajectory.points:
            success, message = self._execute_joint(goal.arm_group, goal.joint_trajectory)
        else:
            success = False
            message = "轨迹为空，拒绝执行"

        feedback.progress = 1.0
        feedback.state = "finished" if success else "failed"
        goal_handle.publish_feedback(feedback)

        result = ExecuteTrajectory.Result()
        result.success = success
        result.message = message
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
        client = self._robot_move_clients.get(arm_group)
        if client is None or not client.wait_for_service(timeout_sec=0.5):
            return False, f"{arm_group} 的 /robot_move 服务不可用"
        if not joint_trajectory.points:
            return False, "关节轨迹为空"

        last_point = joint_trajectory.points[-1]
        request = RobotMove.Request()
        request.move_type = 0
        request.joint_positions = list(last_point.positions)
        request.velocity = 30.0
        request.acceleration = 30.0

        future = client.call_async(request)
        rclpy.spin_until_future_complete(self, future, timeout_sec=10.0)
        if future.result() is None:
            return False, f"{arm_group} 的关节执行超时"
        return bool(future.result().success), future.result().message

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
        return response


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
