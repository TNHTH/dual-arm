#!/usr/bin/python3

from __future__ import annotations

import sys
import time
from typing import Dict, Optional, Tuple

import rclpy
from geometry_msgs.msg import PoseStamped
from rclpy.action import ActionClient
from rclpy.action import graph as action_graph
from rclpy.node import Node
from robo_ctrl.msg import RobotState
from robo_ctrl.srv import RobotMoveCart

from dualarm_interfaces.action import ExecutePrimitive, ExecuteTrajectory
from dualarm_interfaces.msg import GraspTarget, SceneObject, SceneObjectArray
from dualarm_interfaces.srv import PlanPose, ReserveObject, ReleaseObject, SetGripper


class SingleArmPickDebug(Node):
    def __init__(self) -> None:
        super().__init__("single_arm_pick_debug")
        self.declare_parameter("semantic_type", "water_bottle")
        self.declare_parameter("object_id", "")
        self.declare_parameter("arm_name", "auto")
        self.declare_parameter("reservation_owner", "single_arm_debug")
        self.declare_parameter("wait_timeout_sec", 8.0)
        self.declare_parameter("gripper_open_position", 0)
        self.declare_parameter("gripper_close_position", 200)
        self.declare_parameter("hold_duration_s", 0.6)
        self.declare_parameter("execute_retreat", True)
        self.declare_parameter("allow_cartesian_fallback", True)
        self.declare_parameter("allow_raw_scene_fallback", True)
        self.declare_parameter("grasp_mode", "body")
        self.declare_parameter("use_current_tool_orientation", True)
        self.declare_parameter("coordination_mode", "single_arm")
        self.declare_parameter("require_world_tf", True)
        self.declare_parameter("world_frame", "world")
        self.declare_parameter("cartesian_fallback_mode", "incremental")
        self.declare_parameter("max_increment_step_mm", 30.0)
        self.declare_parameter("max_total_increment_mm", 260.0)
        self.declare_parameter("cartesian_velocity", 20.0)
        self.declare_parameter("cartesian_acceleration", 20.0)

        self._semantic_type = str(self.get_parameter("semantic_type").value).strip()
        self._object_id = str(self.get_parameter("object_id").value).strip()
        self._requested_arm_name = str(self.get_parameter("arm_name").value).strip()
        self._reservation_owner = str(self.get_parameter("reservation_owner").value).strip()
        self._wait_timeout_sec = float(self.get_parameter("wait_timeout_sec").value)
        self._gripper_open_position = int(self.get_parameter("gripper_open_position").value)
        self._gripper_close_position = int(self.get_parameter("gripper_close_position").value)
        self._hold_duration_s = float(self.get_parameter("hold_duration_s").value)
        self._execute_retreat = bool(self.get_parameter("execute_retreat").value)
        self._allow_cartesian_fallback = bool(self.get_parameter("allow_cartesian_fallback").value)
        self._allow_raw_scene_fallback = bool(self.get_parameter("allow_raw_scene_fallback").value)
        self._grasp_mode = str(self.get_parameter("grasp_mode").value).strip()
        self._use_current_tool_orientation = bool(self.get_parameter("use_current_tool_orientation").value)
        self._coordination_mode = str(self.get_parameter("coordination_mode").value).strip()
        self._require_world_tf = bool(self.get_parameter("require_world_tf").value)
        self._world_frame = str(self.get_parameter("world_frame").value).strip()
        self._cartesian_fallback_mode = str(self.get_parameter("cartesian_fallback_mode").value).strip()
        self._max_increment_step_mm = float(self.get_parameter("max_increment_step_mm").value)
        self._max_total_increment_mm = float(self.get_parameter("max_total_increment_mm").value)
        self._cartesian_velocity = float(self.get_parameter("cartesian_velocity").value)
        self._cartesian_acceleration = float(self.get_parameter("cartesian_acceleration").value)

        self._scene_cache = SceneObjectArray()
        self._raw_scene_cache = SceneObjectArray()
        self._grasp_targets: Dict[str, GraspTarget] = {}
        self._left_robot_state: Optional[RobotState] = None
        self._right_robot_state: Optional[RobotState] = None

        self.create_subscription(SceneObjectArray, "/scene_fusion/scene_objects", self._scene_cb, 10)
        self.create_subscription(SceneObjectArray, "/scene_fusion/raw_scene_objects", self._raw_scene_cb, 10)
        self.create_subscription(GraspTarget, "/planning/grasp_targets", self._grasp_target_cb, 10)
        self.create_subscription(RobotState, "/L/robot_state", self._left_robot_state_cb, 10)
        self.create_subscription(RobotState, "/R/robot_state", self._right_robot_state_cb, 10)

        self._plan_pose_client = self.create_client(PlanPose, "/planning/plan_pose")
        self._reserve_client = self.create_client(ReserveObject, "/scene/reserve_object")
        self._release_client = self.create_client(ReleaseObject, "/scene/release_object")
        self._set_gripper_client = self.create_client(SetGripper, "/execution/set_gripper")
        self._robot_move_cart_clients = {
            "left_arm": self.create_client(RobotMoveCart, "/L/robot_move_cart"),
            "right_arm": self.create_client(RobotMoveCart, "/R/robot_move_cart"),
        }
        self._execute_client = ActionClient(self, ExecuteTrajectory, "/execution/execute_trajectory")
        self._primitive_client = ActionClient(self, ExecutePrimitive, "/execution/execute_primitive")

    def _scene_cb(self, message: SceneObjectArray) -> None:
        self._scene_cache = message

    def _raw_scene_cb(self, message: SceneObjectArray) -> None:
        self._raw_scene_cache = message

    def _grasp_target_cb(self, message: GraspTarget) -> None:
        self._grasp_targets[message.object_id] = message

    def _left_robot_state_cb(self, message: RobotState) -> None:
        self._left_robot_state = message

    def _right_robot_state_cb(self, message: RobotState) -> None:
        self._right_robot_state = message

    def run(self) -> int:
        dependency_error = self._wait_for_dependencies()
        if dependency_error is not None:
            self.get_logger().error(dependency_error)
            return 2

        scene_object, target, using_raw_scene = self._wait_for_target()
        if scene_object is None or target is None:
            self.get_logger().error("等待目标物体或 grasp target 超时")
            return 3

        arm_name = target.arm_mode if self._requested_arm_name in ("", "auto") else self._requested_arm_name
        if arm_name not in ("left_arm", "right_arm"):
            self.get_logger().error(f"非法 arm_name={arm_name}")
            return 4
        gate_ok, gate_message = self._validate_runtime_gates(scene_object, target, arm_name)
        if not gate_ok:
            self.get_logger().error(gate_message)
            return 4
        if arm_name != target.arm_mode:
            self.get_logger().warn(
                f"当前目标默认 arm_mode={target.arm_mode}，但调试接口强制使用 {arm_name}；请确认现场布局允许"
            )
        if self._coordination_mode == "dual_arm_assist":
            self.get_logger().info(
                f"dual_arm_assist 模式：执行臂={arm_name}，协作臂={'right_arm' if arm_name == 'left_arm' else 'left_arm'}，目标仍只来自左相机 world pose"
            )

        attached = False
        reserved = False
        try:
            self.get_logger().info(f"锁定目标 {scene_object.id} ({scene_object.semantic_type})，arm={arm_name}")
            reserved = self._reserve(scene_object.id, arm_name)
            if not reserved and not using_raw_scene:
                self.get_logger().error(f"{scene_object.id} reservation 失败")
                return 5
            if not reserved and using_raw_scene:
                self.get_logger().warn("managed scene reservation 不可用，按 raw scene fallback 继续调试抓取")

            if not self._set_gripper(arm_name, self._gripper_open_position):
                self.get_logger().error("抓取前张开夹爪失败")
                return 6

            if not self._plan_and_execute(arm_name, target.pregrasp, "pregrasp"):
                return 7
            if not self._plan_and_execute(arm_name, target.grasp, "grasp"):
                return 8

            link_name = "left_tcp" if arm_name == "left_arm" else "right_tcp"
            attached = self._set_gripper(
                arm_name,
                self._gripper_close_position,
                object_id=scene_object.id if reserved else "",
                link_name=link_name if reserved else "",
                attach_on_success=reserved,
            )
            if not attached:
                self.get_logger().error("合爪或 attach 失败")
                return 9

            if reserved:
                hold_ok, hold_message = self._hold_verify(arm_name, scene_object.id)
                if not hold_ok:
                    self.get_logger().error(f"持物验证失败: {hold_message}")
                    return 10
            else:
                self.get_logger().warn("当前使用 raw scene fallback，跳过 attach/hold_verify 的 managed scene 校验")

            if self._execute_retreat and not self._plan_and_execute(arm_name, target.retreat, "retreat"):
                self.get_logger().error("retreat 执行失败，请现场确认瓶子是否仍安全夹持")
                return 11

            self.get_logger().info(
                f"single arm pick debug 成功: object_id={scene_object.id}, semantic_type={scene_object.semantic_type}, arm={arm_name}"
            )
            return 0
        finally:
            if reserved and not attached:
                self._release(scene_object.id)

    def _wait_for_dependencies(self) -> Optional[str]:
        dependencies = [
            ("/planning/plan_pose", self._plan_pose_client),
            ("/scene/reserve_object", self._reserve_client),
            ("/scene/release_object", self._release_client),
            ("/execution/set_gripper", self._set_gripper_client),
        ]
        for name, client in dependencies:
            if not client.wait_for_service(timeout_sec=5.0):
                return f"依赖服务不可用: {name}"
        if not self._execute_client.wait_for_server(timeout_sec=5.0):
            return "/execution/execute_trajectory action 不可用"
        if not self._primitive_client.wait_for_server(timeout_sec=5.0):
            return "/execution/execute_primitive action 不可用"
        for arm_name, client in self._robot_move_cart_clients.items():
            if arm_name == self._requested_arm_name or self._requested_arm_name in ("", "auto"):
                if not client.wait_for_service(timeout_sec=5.0):
                    return f"{arm_name} robot_move_cart service 不可用"
        return None

    def _wait_for_target(self) -> Tuple[Optional[SceneObject], Optional[GraspTarget], bool]:
        deadline = time.monotonic() + self._wait_timeout_sec
        while time.monotonic() < deadline:
            rclpy.spin_once(self, timeout_sec=0.1)
            scene_object = self._find_target_object()
            if scene_object is not None:
                target = self._grasp_targets.get(scene_object.id)
                if target is not None:
                    return scene_object, target, False

            if self._allow_raw_scene_fallback and not self._require_world_tf:
                raw_scene_object = self._find_target_object(raw=True)
                if raw_scene_object is not None:
                    return raw_scene_object, self._build_target_from_scene_object(raw_scene_object), True
        return None, None, False

    def _find_target_object(self, raw: bool = False) -> Optional[SceneObject]:
        source = self._raw_scene_cache if raw else self._scene_cache
        candidates = []
        for scene_object in source.objects:
            if self._object_id and scene_object.id != self._object_id:
                continue
            if not self._object_id and scene_object.semantic_type != self._semantic_type:
                continue
            if not raw and scene_object.lifecycle_state not in ("stable", "reserved", "attached"):
                continue
            if self._require_world_tf and not self._scene_object_has_world_pose(scene_object):
                continue
            candidates.append(scene_object)
        if not candidates:
            return None
        return min(candidates, key=self._distance_to_current_tcp)

    def _scene_object_has_world_pose(self, scene_object: SceneObject) -> bool:
        frame_id = scene_object.pose.header.frame_id.strip()
        return bool(frame_id) and frame_id == self._world_frame

    def _target_has_world_poses(self, target: GraspTarget) -> bool:
        relevant_poses = [target.pregrasp, target.grasp, target.retreat]
        for pose in relevant_poses:
            if pose.header.frame_id.strip() != self._world_frame:
                return False
        return True

    def _validate_runtime_gates(
        self,
        scene_object: SceneObject,
        target: GraspTarget,
        arm_name: str,
    ) -> tuple[bool, str]:
        if self._require_world_tf and not self._scene_object_has_world_pose(scene_object):
            return False, f"{scene_object.id} 缺少 world pose，当前 require_world_tf=true，拒绝自动夹取"
        if self._require_world_tf and not self._target_has_world_poses(target):
            return False, f"{scene_object.id} 的 grasp/pregrasp/retreat 不是 {self._world_frame}，拒绝自动夹取"
        if arm_name == "right_arm" and not self._require_world_tf:
            return False, "右臂自动夹取只允许消费 world pose，请保持 require_world_tf=true"
        if self._count_execute_trajectory_servers() != 1:
            return False, "/execution/execute_trajectory action server 数量不是 1，拒绝自动夹取"
        if not self._robot_state_valid(arm_name):
            return False, f"{arm_name} robot_state 无效，拒绝自动夹取"
        if arm_name == "right_arm" and not self._robot_state_valid("left_arm"):
            return False, "右臂执行前要求左臂状态有效，当前 left_arm robot_state 无效"
        if self._coordination_mode == "dual_arm_assist":
            partner_arm = "right_arm" if arm_name == "left_arm" else "left_arm"
            if not self._robot_state_valid(partner_arm):
                return False, f"dual_arm_assist 要求 {partner_arm} 状态有效，当前门禁未通过"
        if not self._table_collision_valid():
            return False, "桌面 collision/table_surface 无效，拒绝自动夹取"
        return True, "ok"

    def _robot_state_valid(self, arm_name: str) -> bool:
        state = self._left_robot_state if arm_name == "left_arm" else self._right_robot_state
        if state is None:
            return False
        return bool(state.motion_done) and int(state.error_code) == 0

    def _table_collision_valid(self) -> bool:
        for scene_object in self._scene_cache.objects:
            if scene_object.semantic_type != "table_surface":
                continue
            if not self._scene_object_has_world_pose(scene_object):
                continue
            if scene_object.lifecycle_state not in ("stable", "reserved", "attached"):
                continue
            if float(scene_object.confidence) <= 0.0:
                continue
            return True
        return False

    def _count_execute_trajectory_servers(self) -> int:
        target_action = "/execution/execute_trajectory"
        count = 0
        for node_name, node_namespace in self.get_node_names_and_namespaces():
            try:
                servers = action_graph.get_action_server_names_and_types_by_node(
                    self,
                    node_name,
                    node_namespace,
                )
            except Exception:  # pylint: disable=broad-except
                continue
            for action_name, _action_types in servers:
                if action_name == target_action:
                    count += 1
        return count

    def _distance_to_current_tcp(self, scene_object: SceneObject) -> float:
        robot_state = self._left_robot_state if self._requested_arm_name != "right_arm" else self._right_robot_state
        if robot_state is None:
            return -float(scene_object.confidence)
        dx = scene_object.pose.pose.position.x * 1000.0 - robot_state.tcp_pose.x
        dy = scene_object.pose.pose.position.y * 1000.0 - robot_state.tcp_pose.y
        dz = scene_object.pose.pose.position.z * 1000.0 - robot_state.tcp_pose.z
        return dx * dx + dy * dy + dz * dz

    def _reserve(self, object_id: str, arm_name: str) -> bool:
        request = ReserveObject.Request()
        request.object_id = object_id
        request.reserved_by = self._reservation_owner
        request.arm_mode = arm_name
        future = self._reserve_client.call_async(request)
        rclpy.spin_until_future_complete(self, future, timeout_sec=3.0)
        return future.result() is not None and bool(future.result().success)

    def _release(self, object_id: str) -> bool:
        request = ReleaseObject.Request()
        request.object_id = object_id
        future = self._release_client.call_async(request)
        rclpy.spin_until_future_complete(self, future, timeout_sec=3.0)
        return future.result() is not None and bool(future.result().success)

    def _plan_and_execute(self, arm_name: str, pose: PoseStamped, stage: str) -> bool:
        adjusted_pose = self._pose_with_current_tool_orientation(arm_name, pose)
        planner_response = self._call_plan_pose(arm_name, adjusted_pose)
        if planner_response is None:
            self.get_logger().error(f"{stage} 规划请求超时")
            return False
        if not planner_response.success:
            if self._allow_cartesian_fallback and planner_response.result_code in ("ik_failed", "scene_stale"):
                self.get_logger().warn(
                    f"{stage} PlanPose 返回 {planner_response.result_code}，回退到单点笛卡尔执行"
                )
                return self._execute_cartesian_fallback(arm_name, adjusted_pose, stage)
            self.get_logger().error(
                f"{stage} 规划失败: result_code={planner_response.result_code}, message={planner_response.message}"
            )
            return False

        goal = ExecuteTrajectory.Goal()
        goal.arm_group = planner_response.primary_arm_group or arm_name
        goal.secondary_arm_group = planner_response.secondary_arm_group
        goal.joint_trajectory = planner_response.joint_trajectory
        goal.secondary_joint_trajectory = planner_response.secondary_joint_trajectory
        goal.cartesian_waypoints = planner_response.cartesian_waypoints
        goal.synchronized = planner_response.synchronized
        goal.use_cartesian_execution = False
        goal.execution_profile = "single_arm_debug"

        send_future = self._execute_client.send_goal_async(goal)
        rclpy.spin_until_future_complete(self, send_future, timeout_sec=3.0)
        goal_handle = send_future.result()
        if goal_handle is None or not goal_handle.accepted:
            self.get_logger().error(f"{stage} 执行 goal 被拒绝")
            return False

        result_future = goal_handle.get_result_async()
        rclpy.spin_until_future_complete(self, result_future, timeout_sec=20.0)
        if result_future.result() is None:
            self.get_logger().error(f"{stage} 执行结果超时")
            return False

        result = result_future.result().result
        if not result.success:
            self.get_logger().error(
                f"{stage} 执行失败: result_code={result.result_code}, message={result.message}"
            )
            return False

        self.get_logger().info(f"{stage} 执行成功")
        return True

    def _execute_cartesian_fallback(self, arm_name: str, pose: PoseStamped, stage: str) -> bool:
        if self._cartesian_fallback_mode == "incremental":
            return self._execute_incremental_cartesian_fallback(arm_name, pose, stage)

        goal = ExecuteTrajectory.Goal()
        goal.arm_group = arm_name
        goal.secondary_arm_group = ""
        goal.synchronized = False
        goal.use_cartesian_execution = True
        goal.execution_profile = "single_arm_debug_cartesian_fallback"
        goal.cartesian_waypoints = [pose]

        send_future = self._execute_client.send_goal_async(goal)
        rclpy.spin_until_future_complete(self, send_future, timeout_sec=3.0)
        goal_handle = send_future.result()
        if goal_handle is None or not goal_handle.accepted:
            self.get_logger().error(f"{stage} 笛卡尔 fallback goal 被拒绝")
            return False

        result_future = goal_handle.get_result_async()
        rclpy.spin_until_future_complete(self, result_future, timeout_sec=20.0)
        if result_future.result() is None:
            self.get_logger().error(f"{stage} 笛卡尔 fallback 结果超时")
            return False

        result = result_future.result().result
        if not result.success:
            self.get_logger().error(
                f"{stage} 笛卡尔 fallback 失败: result_code={result.result_code}, message={result.message}"
            )
            return False

        self.get_logger().info(f"{stage} 笛卡尔 fallback 执行成功")
        return True

    def _execute_incremental_cartesian_fallback(self, arm_name: str, pose: PoseStamped, stage: str) -> bool:
        robot_state = self._left_robot_state if arm_name == "left_arm" else self._right_robot_state
        if robot_state is None:
            self.get_logger().error(f"{stage} incremental fallback 缺少 robot_state")
            return False

        target_mm = (
            pose.pose.position.x * 1000.0,
            pose.pose.position.y * 1000.0,
            pose.pose.position.z * 1000.0,
        )
        current_mm = (
            robot_state.tcp_pose.x,
            robot_state.tcp_pose.y,
            robot_state.tcp_pose.z,
        )
        delta = [target_mm[index] - current_mm[index] for index in range(3)]
        total = sum(value * value for value in delta) ** 0.5
        if total > self._max_total_increment_mm:
            self.get_logger().error(
                f"{stage} incremental fallback 目标距离过大: {total:.1f}mm > {self._max_total_increment_mm:.1f}mm"
            )
            return False
        steps = max(1, int(total / max(self._max_increment_step_mm, 1.0)) + 1)
        self.get_logger().info(
            f"{stage} incremental fallback: total={total:.1f}mm, steps={steps}, "
            f"delta=({delta[0]:.1f},{delta[1]:.1f},{delta[2]:.1f})"
        )

        for step in range(steps):
            waypoint = PoseStamped()
            waypoint.header = pose.header
            waypoint.pose.position.x = (delta[0] / steps) / 1000.0
            waypoint.pose.position.y = (delta[1] / steps) / 1000.0
            waypoint.pose.position.z = (delta[2] / steps) / 1000.0
            waypoint.pose.orientation.x = 0.0
            waypoint.pose.orientation.y = 0.0
            waypoint.pose.orientation.z = 0.0
            waypoint.pose.orientation.w = 1.0
            if not self._call_robot_move_cart_increment(arm_name, waypoint, f"{stage}[{step + 1}/{steps}]"):
                return False
        return True

    def _call_robot_move_cart_increment(self, arm_name: str, waypoint: PoseStamped, stage: str) -> bool:
        client = self._robot_move_cart_clients.get(arm_name)
        if client is None or not client.wait_for_service(timeout_sec=1.0):
            self.get_logger().error(f"{stage} robot_move_cart 服务不可用")
            return False
        request = RobotMoveCart.Request()
        request.tcp_pose.x = waypoint.pose.position.x * 1000.0
        request.tcp_pose.y = waypoint.pose.position.y * 1000.0
        request.tcp_pose.z = waypoint.pose.position.z * 1000.0
        request.tcp_pose.rx = 0.0
        request.tcp_pose.ry = 0.0
        request.tcp_pose.rz = 0.0
        request.velocity = self._cartesian_velocity
        request.acceleration = self._cartesian_acceleration
        request.ovl = 100.0
        request.blend_time = -1.0
        request.tool = 0
        request.user = 0
        request.config = -1
        request.use_increment = True
        future = client.call_async(request)
        rclpy.spin_until_future_complete(self, future, timeout_sec=20.0)
        response = future.result()
        if response is None or not response.success:
            self.get_logger().error(
                f"{stage} robot_move_cart 增量失败: {'' if response is None else response.message}"
            )
            return False
        return True

    def _send_cartesian_waypoint(self, arm_name: str, pose: PoseStamped, stage: str, use_increment: bool) -> bool:
        goal = ExecuteTrajectory.Goal()
        goal.arm_group = arm_name
        goal.secondary_arm_group = ""
        goal.synchronized = False
        goal.use_cartesian_execution = True
        goal.execution_profile = "single_arm_debug_cartesian_fallback"
        goal.cartesian_waypoints = [pose]

        send_future = self._execute_client.send_goal_async(goal)
        rclpy.spin_until_future_complete(self, send_future, timeout_sec=3.0)
        goal_handle = send_future.result()
        if goal_handle is None or not goal_handle.accepted:
            self.get_logger().error(f"{stage} 笛卡尔 fallback goal 被拒绝")
            return False

        result_future = goal_handle.get_result_async()
        rclpy.spin_until_future_complete(self, result_future, timeout_sec=20.0)
        if result_future.result() is None:
            self.get_logger().error(f"{stage} 笛卡尔 fallback 结果超时")
            return False
        result = result_future.result().result
        if not result.success:
            self.get_logger().error(
                f"{stage} 笛卡尔 fallback 失败: result_code={result.result_code}, message={result.message}"
            )
            return False
        return True

    def _call_plan_pose(self, arm_name: str, pose: PoseStamped):
        request = PlanPose.Request()
        request.arm_group = arm_name
        request.target_pose = pose
        request.planner_id = ""
        request.cartesian = False
        future = self._plan_pose_client.call_async(request)
        rclpy.spin_until_future_complete(self, future, timeout_sec=8.0)
        return future.result()

    def _set_gripper(
        self,
        arm_name: str,
        position: int,
        object_id: str = "",
        link_name: str = "",
        attach_on_success: bool = False,
    ) -> bool:
        request = SetGripper.Request()
        request.arm_name = arm_name
        request.command = 2
        request.slave_id = 0
        request.position = int(position)
        request.speed = 255
        request.torque = 255
        request.object_id = object_id
        request.link_name = link_name
        request.attach_on_success = attach_on_success
        request.detach_on_success = False
        future = self._set_gripper_client.call_async(request)
        rclpy.spin_until_future_complete(self, future, timeout_sec=5.0)
        return future.result() is not None and bool(future.result().success)

    def _hold_verify(self, arm_name: str, object_id: str) -> Tuple[bool, str]:
        goal = ExecutePrimitive.Goal()
        goal.primitive_id = "hold_verify"
        goal.arm_group = arm_name
        goal.object_id = object_id
        goal.hold_duration_s = self._hold_duration_s

        send_future = self._primitive_client.send_goal_async(goal)
        rclpy.spin_until_future_complete(self, send_future, timeout_sec=3.0)
        goal_handle = send_future.result()
        if goal_handle is None or not goal_handle.accepted:
            return False, "hold_verify goal 被拒绝"

        result_future = goal_handle.get_result_async()
        rclpy.spin_until_future_complete(self, result_future, timeout_sec=10.0)
        if result_future.result() is None:
            return False, "hold_verify 超时"

        result = result_future.result().result
        return bool(result.success), result.message

    def _pose_with_current_tool_orientation(self, arm_name: str, pose: PoseStamped) -> PoseStamped:
        if not self._use_current_tool_orientation:
            return pose
        robot_state = self._left_robot_state if arm_name == "left_arm" else self._right_robot_state
        if robot_state is None:
            return pose

        adjusted = PoseStamped()
        adjusted.header = pose.header
        adjusted.pose.position = pose.pose.position
        quaternion = self._rpy_degrees_to_quaternion(
            robot_state.tcp_pose.rx,
            robot_state.tcp_pose.ry,
            robot_state.tcp_pose.rz,
        )
        adjusted.pose.orientation.x = quaternion[0]
        adjusted.pose.orientation.y = quaternion[1]
        adjusted.pose.orientation.z = quaternion[2]
        adjusted.pose.orientation.w = quaternion[3]
        return adjusted

    def _build_target_from_scene_object(self, scene_object: SceneObject) -> GraspTarget:
        target = GraspTarget()
        target.object_id = scene_object.id
        target.arm_mode = "right_arm" if scene_object.semantic_type == "cola_bottle" else "left_arm"
        target.partner_arm_mode = "left_arm" if target.arm_mode == "right_arm" else "right_arm"
        target.target_type = "grasp"
        target.position_tolerance = 0.01
        target.orientation_tolerance_deg = 10.0
        target.grasp = scene_object.pose
        target.operate = scene_object.pose
        target.pregrasp = scene_object.pose
        target.pregrasp.pose.position.z += 0.10
        target.retreat = scene_object.pose
        target.retreat.pose.position.z += 0.15
        target.place = scene_object.pose
        target.release = scene_object.pose
        target.release.pose.position.z += 0.04

        for subframe in scene_object.subframes:
            if subframe.name == "bottle_body_grasp":
                target.grasp = subframe.pose
                target.pregrasp = subframe.pose
                target.pregrasp.pose.position.z += 0.10
            if self._grasp_mode == "cap" and subframe.name == "bottle_cap_pregrasp":
                target.pregrasp = subframe.pose
                target.target_type = "cap_pregrasp"
            if self._grasp_mode == "cap" and subframe.name == "bottle_cap_center":
                target.operate = subframe.pose
            if subframe.name == "bottle_pour_pivot":
                target.place = subframe.pose
            if subframe.name == "cup_side_grasp":
                target.grasp = subframe.pose
            if subframe.name == "cup_fill_target":
                target.operate = subframe.pose
                target.target_type = "prepour"

        return target

    def _rpy_degrees_to_quaternion(self, roll_deg: float, pitch_deg: float, yaw_deg: float):
        import math

        roll = math.radians(roll_deg)
        pitch = math.radians(pitch_deg)
        yaw = math.radians(yaw_deg)
        cy = math.cos(yaw * 0.5)
        sy = math.sin(yaw * 0.5)
        cp = math.cos(pitch * 0.5)
        sp = math.sin(pitch * 0.5)
        cr = math.cos(roll * 0.5)
        sr = math.sin(roll * 0.5)
        return (
            sr * cp * cy - cr * sp * sy,
            cr * sp * cy + sr * cp * sy,
            cr * cp * sy - sr * sp * cy,
            cr * cp * cy + sr * sp * sy,
        )


def main() -> None:
    rclpy.init()
    node = SingleArmPickDebug()
    try:
        exit_code = node.run()
    finally:
        node.destroy_node()
        rclpy.shutdown()
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
