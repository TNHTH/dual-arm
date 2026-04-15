#!/usr/bin/python3

from __future__ import annotations

from typing import Dict, List, Optional

import rclpy
from rclpy.node import Node
from rclpy.time import Time

from dualarm_interfaces.msg import SceneObjectArray
from dualarm_interfaces.srv import PlanCartesian, PlanJoint, PlanPose
from robo_ctrl.msg import RobotState
from trajectory_msgs.msg import JointTrajectory, JointTrajectoryPoint


class FairinoDualArmPlannerNode(Node):
    def __init__(self) -> None:
        super().__init__("fairino_dualarm_planner")
        self._groups: Dict[str, List[str]] = {
            "left_arm": [f"left_joint_{index}" for index in range(1, 7)],
            "right_arm": [f"right_joint_{index}" for index in range(1, 7)],
            "dual_arm": [f"{arm}_joint_{index}" for arm in ("left", "right") for index in range(1, 7)],
        }
        self.declare_parameter("scene_topic", "/scene_fusion/scene_objects")
        self.declare_parameter("robot_state_age_limit_ms", 100)
        self.declare_parameter("scene_age_limit_ms", 200)
        self._scene_cache: Optional[SceneObjectArray] = None
        self._left_robot_state: Optional[RobotState] = None
        self._right_robot_state: Optional[RobotState] = None
        self.create_subscription(SceneObjectArray, self.get_parameter("scene_topic").value, self._handle_scene, 10)
        self.create_subscription(RobotState, "/L/robot_state", self._handle_left_state, 10)
        self.create_subscription(RobotState, "/R/robot_state", self._handle_right_state, 10)

        self.create_service(PlanPose, "/planning/plan_pose", self._handle_plan_pose)
        self.create_service(PlanCartesian, "/planning/plan_cartesian", self._handle_plan_cartesian)
        self.create_service(PlanJoint, "/planning/plan_joint", self._handle_plan_joint)
        self.get_logger().info("fairino_dualarm_planner 已启动")

    def _handle_scene(self, message: SceneObjectArray) -> None:
        self._scene_cache = message

    def _handle_left_state(self, message: RobotState) -> None:
        self._left_robot_state = message

    def _handle_right_state(self, message: RobotState) -> None:
        self._right_robot_state = message

    def _latest_scene_version(self) -> int:
        if self._scene_cache is None:
            return 0
        if not self._scene_cache.objects:
            return 0
        return max(scene_object.scene_version for scene_object in self._scene_cache.objects)

    def _is_scene_fresh(self) -> bool:
        if self._scene_cache is None:
            return False
        age_limit = int(self.get_parameter("scene_age_limit_ms").value) * 1_000_000
        scene_stamp = Time.from_msg(self._scene_cache.header.stamp)
        return (self.get_clock().now() - scene_stamp).nanoseconds <= age_limit

    def _robot_state_is_fresh(self, arm_group: str) -> bool:
        age_limit = int(self.get_parameter("robot_state_age_limit_ms").value) * 1_000_000
        states = []
        if arm_group in ("left_arm", "dual_arm"):
            states.append(self._left_robot_state)
        if arm_group in ("right_arm", "dual_arm"):
            states.append(self._right_robot_state)
        if any(state is None for state in states):
            return False
        return all((self.get_clock().now() - Time.from_msg(state.header.stamp)).nanoseconds <= age_limit for state in states)

    def _fill_common_response(self, arm_group: str, response) -> None:
        response.primary_arm_group = arm_group
        response.secondary_arm_group = "right_arm" if arm_group == "dual_arm" else ""
        response.scene_version = self._latest_scene_version()
        state = self._left_robot_state if arm_group != "right_arm" else self._right_robot_state
        if arm_group == "dual_arm":
            state = self._left_robot_state
        if state is not None:
            response.start_state_stamp = state.header.stamp
        response.synchronized = arm_group == "dual_arm"

    def _handle_plan_pose(self, request: PlanPose.Request, response: PlanPose.Response):
        self._fill_common_response(request.arm_group, response)
        if not self._is_scene_fresh():
            response.success = False
            response.result_code = "scene_stale"
            response.failure_stage = "scene"
            response.message = "scene_fusion 数据过期，拒绝规划"
            return response
        if not self._robot_state_is_fresh(request.arm_group):
            response.success = False
            response.result_code = "scene_stale"
            response.failure_stage = "validation"
            response.message = "机器人状态过期，拒绝规划"
            return response
        response.success = True
        response.result_code = "success"
        response.failure_stage = ""
        response.message = f"已生成 {request.arm_group} 的位姿规划骨架"
        response.joint_trajectory = self._make_pose_trajectory(request.arm_group, request.target_pose.pose.position)
        if request.arm_group == "dual_arm":
            response.secondary_joint_trajectory = self._make_secondary_dual_arm_trajectory(request.target_pose.pose.position)
        response.cartesian_waypoints = [request.target_pose]
        response.planning_time_ms = 5.0
        return response

    def _handle_plan_cartesian(self, request: PlanCartesian.Request, response: PlanCartesian.Response):
        self._fill_common_response(request.arm_group, response)
        if not self._is_scene_fresh():
            response.success = False
            response.result_code = "scene_stale"
            response.failure_stage = "scene"
            response.message = "scene_fusion 数据过期，拒绝规划"
            return response
        response.success = len(request.waypoints) > 0
        response.result_code = "success" if response.success else "partial"
        response.failure_stage = "" if response.success else "path_search"
        response.message = "已返回笛卡尔路径骨架" if response.success else "waypoints 为空"
        response.joint_trajectory = self._make_empty_trajectory(request.arm_group)
        response.secondary_joint_trajectory = self._make_empty_trajectory("right_arm") if request.arm_group == "dual_arm" else JointTrajectory()
        response.planning_time_ms = 3.0
        return response

    def _handle_plan_joint(self, request: PlanJoint.Request, response: PlanJoint.Response):
        self._fill_common_response(request.arm_group, response)
        trajectory = self._make_empty_trajectory(request.arm_group)
        point = JointTrajectoryPoint()
        point.positions = list(request.target_joints.position)
        point.time_from_start.sec = 1
        trajectory.points.append(point)
        response.success = True
        response.result_code = "success"
        response.failure_stage = ""
        response.message = f"已生成 {request.arm_group} 的关节规划骨架"
        response.joint_trajectory = trajectory
        response.secondary_joint_trajectory = self._make_empty_trajectory("right_arm") if request.arm_group == "dual_arm" else JointTrajectory()
        response.planning_time_ms = 1.0
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

    def _make_secondary_dual_arm_trajectory(self, position) -> JointTrajectory:
        trajectory = self._make_empty_trajectory("right_arm")
        point = JointTrajectoryPoint()
        base_values = [position.x, -position.y, position.z, 0.0, 0.0, 0.0]
        while len(base_values) < len(trajectory.joint_names):
            base_values.extend([0.0] * min(6, len(trajectory.joint_names) - len(base_values)))
        point.positions = [float(value) for value in base_values[: len(trajectory.joint_names)]]
        point.time_from_start.sec = 1
        trajectory.points.append(point)
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
