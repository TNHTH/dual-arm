#!/usr/bin/python3

from __future__ import annotations

from typing import Dict, List

import rclpy
from rclpy.node import Node

from dualarm_interfaces.srv import PlanCartesian, PlanJoint, PlanPose
from trajectory_msgs.msg import JointTrajectory, JointTrajectoryPoint


class FairinoDualArmPlannerNode(Node):
    def __init__(self) -> None:
        super().__init__("fairino_dualarm_planner")
        self._groups: Dict[str, List[str]] = {
            "left_arm": [f"left_joint_{index}" for index in range(1, 7)],
            "right_arm": [f"right_joint_{index}" for index in range(1, 7)],
            "dual_arm": [f"{arm}_joint_{index}" for arm in ("left", "right") for index in range(1, 7)],
        }

        self.create_service(PlanPose, "/planning/plan_pose", self._handle_plan_pose)
        self.create_service(PlanCartesian, "/planning/plan_cartesian", self._handle_plan_cartesian)
        self.create_service(PlanJoint, "/planning/plan_joint", self._handle_plan_joint)
        self.get_logger().info("fairino_dualarm_planner 已启动")

    def _handle_plan_pose(self, request: PlanPose.Request, response: PlanPose.Response):
        response.success = True
        response.message = f"已生成 {request.arm_group} 的位姿规划骨架"
        response.joint_trajectory = self._make_pose_trajectory(request.arm_group, request.target_pose.pose.position)
        response.cartesian_waypoints = [request.target_pose]
        return response

    def _handle_plan_cartesian(self, request: PlanCartesian.Request, response: PlanCartesian.Response):
        response.success = len(request.waypoints) > 0
        response.message = "已返回笛卡尔路径骨架" if response.success else "waypoints 为空"
        response.joint_trajectory = self._make_empty_trajectory(request.arm_group)
        return response

    def _handle_plan_joint(self, request: PlanJoint.Request, response: PlanJoint.Response):
        trajectory = self._make_empty_trajectory(request.arm_group)
        point = JointTrajectoryPoint()
        point.positions = list(request.target_joints.position)
        point.time_from_start.sec = 1
        trajectory.points.append(point)
        response.success = True
        response.message = f"已生成 {request.arm_group} 的关节规划骨架"
        response.joint_trajectory = trajectory
        return response

    def _make_pose_trajectory(self, arm_group: str, position) -> JointTrajectory:
        trajectory = self._make_empty_trajectory(arm_group)
        point = JointTrajectoryPoint()
        base_values = [position.x, position.y, position.z, 0.0, 0.0, 0.0]
        while len(base_values) < len(trajectory.joint_names):
            base_values.extend([0.0] * min(6, len(trajectory.joint_names) - len(base_values)))
        point.positions = [float(value) for value in base_values[: len(trajectory.joint_names)]]
        point.time_from_start.sec = 1
        trajectory.points.append(point)
        return trajectory

    def _make_empty_trajectory(self, arm_group: str) -> JointTrajectory:
        trajectory = JointTrajectory()
        trajectory.joint_names = self._groups.get(arm_group, [])
        return trajectory


def main() -> None:
    rclpy.init()
    node = FairinoDualArmPlannerNode()
    try:
        rclpy.spin(node)
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    main()
