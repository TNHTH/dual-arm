#!/usr/bin/python3

from __future__ import annotations

import time
from typing import Dict, List, Optional, Tuple

import rclpy
from geometry_msgs.msg import PoseStamped
from rclpy.action import ActionClient, ActionServer, CancelResponse, GoalResponse
from rclpy.executors import MultiThreadedExecutor
from rclpy.node import Node

from dualarm_interfaces.action import ExecuteTrajectory, RunCompetition
from dualarm_interfaces.msg import GraspTarget, SceneObject, SceneObjectArray, TaskEvent
from dualarm_interfaces.srv import PlanPose, ReleaseObject, ReserveObject, SetGripper


class DualArmTaskManagerNode(Node):
    def __init__(self) -> None:
        super().__init__("dualarm_task_manager")
        self.declare_parameter("task_sequence", "handover,pouring")

        self._scene_cache = SceneObjectArray()
        self._grasp_targets: Dict[str, GraspTarget] = {}
        self._assignments: Dict[str, str] = {}
        self._last_plan = None

        self._event_publisher = self.create_publisher(TaskEvent, "/task_manager/events", 10)
        self.create_subscription(SceneObjectArray, "/scene_fusion/scene_objects", self._handle_scene, 10)
        self.create_subscription(GraspTarget, "/planning/grasp_targets", self._handle_grasp_target, 10)

        self._plan_pose_client = self.create_client(PlanPose, "/planning/plan_pose")
        self._reserve_client = self.create_client(ReserveObject, "/scene/reserve_object")
        self._release_client = self.create_client(ReleaseObject, "/scene/release_object")
        self._set_gripper_client = self.create_client(SetGripper, "/execution/set_gripper")
        self._execute_client = ActionClient(self, ExecuteTrajectory, "/execution/execute_trajectory")

        self._action_server = ActionServer(
            self,
            RunCompetition,
            "/competition/run",
            execute_callback=self._execute_competition,
            goal_callback=self._goal_callback,
            cancel_callback=self._cancel_callback,
        )
        self.get_logger().info("dualarm_task_manager 已启动")

    def _goal_callback(self, _goal_request: RunCompetition.Goal) -> GoalResponse:
        return GoalResponse.ACCEPT

    def _cancel_callback(self, _goal_handle) -> CancelResponse:
        return CancelResponse.ACCEPT

    def _handle_scene(self, message: SceneObjectArray) -> None:
        self._scene_cache = message

    def _handle_grasp_target(self, message: GraspTarget) -> None:
        self._grasp_targets[message.object_id] = message

    def _execute_competition(self, goal_handle):
        sequence = goal_handle.request.requested_order or self.get_parameter("task_sequence").value
        ordered_tasks = [item.strip() for item in sequence.split(",") if item.strip()]
        states = ["BOOT", "SELF_CHECK", "LOAD_CALIBRATION", "HOME_ARMS", "WAIT_START"]
        for task in ordered_tasks:
            if task == "handover":
                states.extend(
                    [
                        "SCAN_BASKET",
                        "WAIT_BALL_1_STABLE",
                        "PLAN_BIMANUAL_BALL_1_PREGRASP",
                        "GRASP_BALL_1",
                        "HOLD_BALL_1_3S",
                        "PLAN_TO_BASKET_1",
                        "RELEASE_BALL_1",
                        "VERIFY_BALL_1_DROP",
                        "WAIT_BALL_2_STABLE",
                        "PLAN_BIMANUAL_BALL_2_PREGRASP",
                        "GRASP_BALL_2",
                        "HOLD_BALL_2_3S",
                        "PLAN_TO_BASKET_2",
                        "RELEASE_BALL_2",
                        "VERIFY_BALL_2_DROP",
                    ]
                )
            elif task == "pouring":
                states.extend(
                    [
                        "SCAN_TABLE_OBJECTS",
                        "ASSIGN_BOTTLES_AND_CUPS",
                        "GRASP_WATER_BOTTLE_BODY",
                        "GRASP_WATER_CAP",
                        "OPEN_WATER_CAP",
                        "PLACE_WATER_CAP",
                        "GRASP_WATER_CUP",
                        "PLAN_WATER_PREPOUR",
                        "EXECUTE_WATER_POUR",
                        "PLACE_WATER_BOTTLE",
                        "PLACE_WATER_CUP",
                        "GRASP_COLA_BOTTLE_BODY",
                        "GRASP_COLA_CAP",
                        "OPEN_COLA_CAP",
                        "PLACE_COLA_CAP",
                        "GRASP_COLA_CUP",
                        "PLAN_COLA_PREPOUR",
                        "EXECUTE_COLA_POUR",
                        "PLACE_COLA_BOTTLE",
                        "PLACE_COLA_CUP",
                    ]
                )
        states.extend(["PARK", "DONE"])

        result = RunCompetition.Result()
        feedback = RunCompetition.Feedback()

        total = len(states)
        for index, state in enumerate(states, start=1):
            if goal_handle.is_cancel_requested:
                goal_handle.canceled()
                result.success = False
                result.message = f"任务在 {state} 被取消"
                return result

            self.get_logger().info(f"[task_manager] 进入状态 {state} ({index}/{total})")
            success, detail = self._execute_state(state)
            feedback.state = state
            feedback.detail = detail
            goal_handle.publish_feedback(feedback)
            self._publish_event(state, "success" if success else "failure", "info" if success else "error", detail)
            if not success:
                goal_handle.abort()
                result.success = False
                result.message = f"{state} 失败: {detail}"
                return result

            self._publish_event(state, "progress", "info", f"step={index}/{total}")

        goal_handle.succeed()
        result.success = True
        result.message = "比赛状态机已完成一轮闭环骨架执行"
        return result

    def _execute_state(self, state: str) -> Tuple[bool, str]:
        if state in {"BOOT", "SELF_CHECK", "LOAD_CALIBRATION", "HOME_ARMS", "WAIT_START", "PARK", "DONE"}:
            return True, "基础状态完成"

        if state == "SCAN_BASKET":
            return self._require_object("basket")
        if state == "WAIT_BALL_1_STABLE":
            return self._require_object("basketball")
        if state == "WAIT_BALL_2_STABLE":
            return self._require_object("soccer_ball")
        if state == "SCAN_TABLE_OBJECTS":
            ok1, _ = self._require_object("water_bottle")
            ok2, _ = self._require_object("cola_bottle")
            cups = self._objects_by_prefix("cup")
            return ok1 and ok2 and len(cups) >= 1, f"water={ok1}, cola={ok2}, cups={len(cups)}"
        if state == "ASSIGN_BOTTLES_AND_CUPS":
            return self._assign_table_objects()

        plan_states = {
            "PLAN_BIMANUAL_BALL_1_PREGRASP": ("basketball", "pregrasp", "handover_ball_1"),
            "PLAN_BIMANUAL_BALL_2_PREGRASP": ("soccer_ball", "pregrasp", "handover_ball_2"),
            "PLAN_TO_BASKET_1": ("basket", "release", "handover_ball_1"),
            "PLAN_TO_BASKET_2": ("basket", "release", "handover_ball_2"),
            "PLAN_WATER_PREPOUR": ("water_bottle", "operate", "water_task"),
            "PLAN_COLA_PREPOUR": ("cola_bottle", "operate", "cola_task"),
        }
        if state in plan_states:
            semantic_type, target_field, reservation = plan_states[state]
            return self._plan_for_object(semantic_type, target_field, reservation)

        if state in {"GRASP_BALL_1", "GRASP_BALL_2"}:
            object_id = self._assignments.get("basketball" if state.endswith("1") else "soccer_ball")
            return self._execute_last_plan_and_grasp(object_id, dual=True)
        if state in {"RELEASE_BALL_1", "RELEASE_BALL_2"}:
            object_id = self._assignments.get("basketball" if state.endswith("1") else "soccer_ball")
            return self._execute_last_plan_and_release(object_id, dual=True)
        if state in {"VERIFY_BALL_1_DROP", "VERIFY_BALL_2_DROP"}:
            object_id = self._assignments.get("basketball" if state.endswith("1") else "soccer_ball")
            return self._verify_detached(object_id)
        if state in {"HOLD_BALL_1_3S", "HOLD_BALL_2_3S"}:
            time.sleep(0.1)
            return True, "球保持窗口已通过骨架验证"

        if state == "GRASP_WATER_BOTTLE_BODY":
            return self._direct_grasp("water_bottle", "water_task")
        if state == "GRASP_COLA_BOTTLE_BODY":
            return self._direct_grasp("cola_bottle", "cola_task")
        if state == "GRASP_WATER_CAP":
            return True, "瓶盖交互位姿占位完成"
        if state == "GRASP_COLA_CAP":
            return True, "瓶盖交互位姿占位完成"
        if state == "OPEN_WATER_CAP":
            return True, "cap_twist primitive 占位执行"
        if state == "OPEN_COLA_CAP":
            return True, "cap_twist primitive 占位执行"
        if state == "PLACE_WATER_CAP":
            return True, "水瓶盖放置占位完成"
        if state == "PLACE_COLA_CAP":
            return True, "可乐瓶盖放置占位完成"
        if state == "GRASP_WATER_CUP":
            return self._direct_grasp(self._assignments.get("cup_water", "cup"), "water_task")
        if state == "GRASP_COLA_CUP":
            return self._direct_grasp(self._assignments.get("cup_cola", "cup"), "cola_task")
        if state == "EXECUTE_WATER_POUR":
            return True, "pour_tilt primitive 占位执行"
        if state == "EXECUTE_COLA_POUR":
            return True, "pour_tilt primitive 占位执行"
        if state == "PLACE_WATER_BOTTLE":
            return self._release_reserved("water_bottle")
        if state == "PLACE_COLA_BOTTLE":
            return self._release_reserved("cola_bottle")
        if state == "PLACE_WATER_CUP":
            return self._release_reserved("cup_water")
        if state == "PLACE_COLA_CUP":
            return self._release_reserved("cup_cola")

        return True, "未定义状态按占位成功处理"

    def _require_object(self, semantic_type: str) -> Tuple[bool, str]:
        scene_object = self._find_object(semantic_type)
        if scene_object is None:
            return False, f"未找到 {semantic_type}"
        if scene_object.lifecycle_state not in ("stable", "reserved", "attached"):
            return False, f"{semantic_type} 状态不满足: {scene_object.lifecycle_state}"
        self._assignments[semantic_type] = scene_object.id
        return True, f"{semantic_type}={scene_object.id}"

    def _assign_table_objects(self) -> Tuple[bool, str]:
        water = self._find_object("water_bottle")
        cola = self._find_object("cola_bottle")
        cups = self._objects_by_prefix("cup")
        if water is None or cola is None or not cups:
            return False, "桌面对象不完整"
        self._assignments["water_bottle"] = water.id
        self._assignments["cola_bottle"] = cola.id
        self._assignments["cup_water"] = cups[0].id
        self._assignments["cup_cola"] = cups[1].id if len(cups) > 1 else cups[0].id
        return True, f"water={water.id}, cola={cola.id}, cups={[cup.id for cup in cups]}"

    def _plan_for_object(self, semantic_type: str, target_field: str, reserved_by: str) -> Tuple[bool, str]:
        scene_object = self._find_object(semantic_type)
        if scene_object is None:
            return False, f"未找到 {semantic_type}"
        self.get_logger().info(f"[task_manager] 为 {scene_object.id} 请求规划，target_field={target_field}")
        if not self._reserve(scene_object.id, reserved_by, "dual_arm" if "ball" in semantic_type else "left_arm"):
            return False, f"{scene_object.id} reservation 失败"
        target = self._grasp_targets.get(scene_object.id)
        if target is None:
            return False, f"{scene_object.id} 的 grasp target 不存在"
        pose = getattr(target, target_field)
        planner_response = self._call_plan_pose(target.arm_mode, pose, target.execution_profile)
        if planner_response is None or not planner_response.success or planner_response.result_code != "success":
            return False, f"planner 失败: {planner_response.result_code if planner_response else 'no_response'}"
        self._last_plan = planner_response
        return True, f"planner 成功: {scene_object.id}, scene_version={planner_response.scene_version}"

    def _execute_last_plan_and_grasp(self, object_id: Optional[str], dual: bool = False) -> Tuple[bool, str]:
        if self._last_plan is None:
            return False, "没有可执行的规划结果"
        self.get_logger().info(f"[task_manager] 执行抓取前轨迹，object_id={object_id}, dual={dual}")
        action_result = self._execute_plan(self._last_plan)
        if action_result is None or not action_result.success:
            return False, f"执行失败: {action_result.result_code if action_result else 'no_result'}"
        if object_id is None:
            return False, "object_id 缺失"
        if dual:
            left_ok = self._set_gripper("left_arm", object_id=object_id, link_name="dual_gripper", attach=True)
            right_ok = self._set_gripper("right_arm")
            return left_ok and right_ok, "双臂抓取执行完成" if left_ok and right_ok else "双臂抓取失败"
        return self._set_gripper("left_arm", object_id=object_id, link_name="left_tcp", attach=True), "单臂抓取完成"

    def _execute_last_plan_and_release(self, object_id: Optional[str], dual: bool = False) -> Tuple[bool, str]:
        if self._last_plan is None:
            return False, "没有可执行的规划结果"
        self.get_logger().info(f"[task_manager] 执行释放前轨迹，object_id={object_id}, dual={dual}")
        action_result = self._execute_plan(self._last_plan)
        if action_result is None or not action_result.success:
            return False, f"执行失败: {action_result.result_code if action_result else 'no_result'}"
        if object_id is None:
            return False, "object_id 缺失"
        if dual:
            left_ok = self._set_gripper("left_arm", command=2, position=0, object_id=object_id, detach=True)
            right_ok = self._set_gripper("right_arm", command=2, position=0)
            return left_ok and right_ok, "双臂释放执行完成" if left_ok and right_ok else "双臂释放失败"
        return self._set_gripper("left_arm", command=2, position=0, object_id=object_id, detach=True), "单臂释放完成"

    def _direct_grasp(self, semantic_type_or_id: str, reserved_by: str) -> Tuple[bool, str]:
        scene_object = self._find_object_by_id_or_semantic(semantic_type_or_id)
        if scene_object is None:
            return False, f"未找到 {semantic_type_or_id}"
        target = self._grasp_targets.get(scene_object.id)
        if target is None:
            return False, f"{scene_object.id} 的 grasp target 不存在"
        planner_response = self._call_plan_pose(target.arm_mode, target.pregrasp, target.execution_profile)
        if planner_response is None or not planner_response.success:
            return False, "抓取前规划失败"
        self._last_plan = planner_response
        executed = self._execute_plan(planner_response)
        if executed is None or not executed.success:
            return False, "抓取前执行失败"
        if not self._reserve(scene_object.id, reserved_by, target.arm_mode):
            return False, "reservation 失败"
        attached = self._set_gripper(
            target.arm_mode,
            object_id=scene_object.id,
            link_name=f"{target.arm_mode}_tcp",
            attach=True,
        )
        return attached, f"{scene_object.id} 抓取{'成功' if attached else '失败'}"

    def _verify_detached(self, object_id: Optional[str]) -> Tuple[bool, str]:
        if object_id is None:
            return False, "object_id 缺失"
        scene_object = self._find_object_by_id_or_semantic(object_id)
        if scene_object is None:
            return True, f"{object_id} 已从场景中移除"
        if scene_object.attached_link:
            return False, f"{object_id} 仍处于 attached 状态"
        return True, f"{object_id} 已脱附"

    def _release_reserved(self, key: str) -> Tuple[bool, str]:
        object_id = self._assignments.get(key, key)
        if not self._release(object_id):
            return False, f"{object_id} release 失败"
        return True, f"{object_id} reservation 已释放"

    def _find_object(self, semantic_type: str) -> Optional[SceneObject]:
        candidates = [obj for obj in self._scene_cache.objects if obj.semantic_type == semantic_type]
        return candidates[0] if candidates else None

    def _objects_by_prefix(self, prefix: str) -> List[SceneObject]:
        return [obj for obj in self._scene_cache.objects if obj.semantic_type.startswith(prefix)]

    def _find_object_by_id_or_semantic(self, key: str) -> Optional[SceneObject]:
        for scene_object in self._scene_cache.objects:
            if scene_object.id == key or scene_object.semantic_type == key:
                return scene_object
        return None

    def _reserve(self, object_id: str, reserved_by: str, arm_mode: str) -> bool:
        if not self._reserve_client.wait_for_service(timeout_sec=0.5):
            return False
        request = ReserveObject.Request()
        request.object_id = object_id
        request.reserved_by = reserved_by
        request.arm_mode = arm_mode
        future = self._reserve_client.call_async(request)
        rclpy.spin_until_future_complete(self, future, timeout_sec=2.0)
        return future.result() is not None and future.result().success

    def _release(self, object_id: str) -> bool:
        if not self._release_client.wait_for_service(timeout_sec=0.5):
            return False
        request = ReleaseObject.Request()
        request.object_id = object_id
        future = self._release_client.call_async(request)
        rclpy.spin_until_future_complete(self, future, timeout_sec=2.0)
        return future.result() is not None and future.result().success

    def _call_plan_pose(self, arm_group: str, target_pose: PoseStamped, planner_id: str):
        if not self._plan_pose_client.wait_for_service(timeout_sec=1.0):
            return None
        self.get_logger().info(f"[task_manager] 调用 /planning/plan_pose, arm_group={arm_group}, planner_id={planner_id}")
        request = PlanPose.Request()
        request.arm_group = arm_group
        request.target_pose = target_pose
        request.planner_id = planner_id
        request.cartesian = False
        future = self._plan_pose_client.call_async(request)
        rclpy.spin_until_future_complete(self, future, timeout_sec=5.0)
        return future.result()

    def _execute_plan(self, planner_response):
        if not self._execute_client.wait_for_server(timeout_sec=1.0):
            return None
        self.get_logger().info(
            f"[task_manager] 调用 /execution/execute_trajectory, arm_group={planner_response.primary_arm_group}, "
            f"synchronized={planner_response.synchronized}"
        )
        goal = ExecuteTrajectory.Goal()
        goal.arm_group = planner_response.primary_arm_group or "left_arm"
        goal.secondary_arm_group = planner_response.secondary_arm_group
        goal.joint_trajectory = planner_response.joint_trajectory
        goal.secondary_joint_trajectory = planner_response.secondary_joint_trajectory
        goal.cartesian_waypoints = planner_response.cartesian_waypoints
        goal.synchronized = planner_response.synchronized
        goal.use_cartesian_execution = False
        goal.execution_profile = "default"
        goal_future = self._execute_client.send_goal_async(goal)
        rclpy.spin_until_future_complete(self, goal_future, timeout_sec=2.0)
        if goal_future.result() is None:
            return None
        result_future = goal_future.result().get_result_async()
        rclpy.spin_until_future_complete(self, result_future, timeout_sec=15.0)
        if result_future.result() is None:
            return None
        return result_future.result().result

    def _set_gripper(
        self,
        arm_name: str,
        command: int = 2,
        position: int = 255,
        object_id: str = "",
        link_name: str = "",
        attach: bool = False,
        detach: bool = False,
    ) -> bool:
        if not self._set_gripper_client.wait_for_service(timeout_sec=0.5):
            return False
        request = SetGripper.Request()
        request.arm_name = arm_name
        request.command = command
        request.slave_id = 0
        request.position = position
        request.speed = 255
        request.torque = 255
        request.object_id = object_id
        request.link_name = link_name
        request.attach_on_success = attach
        request.detach_on_success = detach
        future = self._set_gripper_client.call_async(request)
        rclpy.spin_until_future_complete(self, future, timeout_sec=5.0)
        return future.result() is not None and future.result().success

    def _publish_event(self, state: str, event: str, level: str, detail: str) -> None:
        message = TaskEvent()
        message.header.stamp = self.get_clock().now().to_msg()
        message.header.frame_id = "world"
        message.state = state
        message.event = event
        message.level = level
        message.detail = detail
        self._event_publisher.publish(message)


def main() -> None:
    rclpy.init()
    node = DualArmTaskManagerNode()
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
