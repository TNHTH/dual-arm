#!/usr/bin/python3

from __future__ import annotations

import json
import math
import time
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import rclpy
from ament_index_python.packages import get_package_prefix
from geometry_msgs.msg import PoseStamped
from rclpy.action import ActionClient, ActionServer, CancelResponse, GoalResponse
from rclpy.executors import MultiThreadedExecutor
from rclpy.node import Node

from dualarm_interfaces.action import ExecutePrimitive, ExecuteTrajectory, RunCompetition
from dualarm_interfaces.msg import GraspTarget, SceneObject, SceneObjectArray, TaskEvent
from dualarm_interfaces.srv import PlanPose, ReleaseObject, ReserveObject, SetGripper


class DualArmTaskManagerNode(Node):
    def __init__(self) -> None:
        super().__init__("dualarm_task_manager")
        self.declare_parameter("task_sequence", "handover,pouring")
        repo_root = Path(get_package_prefix("dualarm_task_manager")).parent.parent
        self.declare_parameter("checkpoint_dir", str(repo_root / ".artifacts" / "checkpoints" / "competition"))

        self._scene_cache = SceneObjectArray()
        self._grasp_targets: Dict[str, GraspTarget] = {}
        self._assignments: Dict[str, str] = {}
        self._last_plan = None
        self._checkpoint_dir = Path(str(self.get_parameter("checkpoint_dir").value))
        self._checkpoint_dir.mkdir(parents=True, exist_ok=True)
        (self._checkpoint_dir / "runs").mkdir(parents=True, exist_ok=True)

        self._event_publisher = self.create_publisher(TaskEvent, "/task_manager/events", 10)
        self.create_subscription(SceneObjectArray, "/scene_fusion/scene_objects", self._handle_scene, 10)
        self.create_subscription(GraspTarget, "/planning/grasp_targets", self._handle_grasp_target, 10)

        self._plan_pose_client = self.create_client(PlanPose, "/planning/plan_pose")
        self._reserve_client = self.create_client(ReserveObject, "/scene/reserve_object")
        self._release_client = self.create_client(ReleaseObject, "/scene/release_object")
        self._set_gripper_client = self.create_client(SetGripper, "/execution/set_gripper")
        self._execute_client = ActionClient(self, ExecuteTrajectory, "/execution/execute_trajectory")
        self._primitive_client = ActionClient(self, ExecutePrimitive, "/execution/execute_primitive")

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
        run_id = f"run-{int(time.time())}"
        checkpoint_state = None
        if goal_handle.request.resume_from_checkpoint:
            checkpoint_state = self._load_checkpoint(goal_handle.request.checkpoint_id)
            if checkpoint_state is None:
                result = RunCompetition.Result()
                result.success = False
                result.message = "请求恢复的 checkpoint 不存在"
                result.final_checkpoint_id = ""
                result.resume_hint = "请检查 latest.json 或传入合法 checkpoint_id"
                goal_handle.abort()
                return result
            run_id = checkpoint_state["run_id"]
            self._assignments = dict(checkpoint_state.get("assignments", {}))

        sequence = goal_handle.request.requested_order or self.get_parameter("task_sequence").value
        ordered_tasks = [item.strip() for item in sequence.split(",") if item.strip()]
        states = self._build_states(ordered_tasks)

        resume_completed_order = list(checkpoint_state.get("completed_states", [])) if checkpoint_state else []
        resume_completed = set(resume_completed_order)
        resume_next = checkpoint_state.get("next_state", "") if checkpoint_state else ""
        checkpoint_id = checkpoint_state.get("checkpoint_id", "") if checkpoint_state else ""

        result = RunCompetition.Result()
        feedback = RunCompetition.Feedback()

        total = len(states)
        for index, state in enumerate(states, start=1):
            if checkpoint_state and state in resume_completed and state != resume_next:
                continue
            if goal_handle.is_cancel_requested:
                goal_handle.canceled()
                result.success = False
                result.message = f"任务在 {state} 被取消"
                result.final_checkpoint_id = checkpoint_id
                result.resume_hint = f"可从 {state} 的前一已提交端点恢复"
                return result

            self._write_pending_checkpoint(run_id, list(resume_completed_order), state)
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
                result.final_checkpoint_id = checkpoint_id
                result.resume_hint = f"请从 {state} 的前一已提交端点恢复"
                return result

            resume_completed.add(state)
            resume_completed_order.append(state)
            next_state = states[index] if index < total else "competition_done"
            checkpoint_id = self._commit_checkpoint(run_id, list(resume_completed_order), state, next_state)
            self._publish_event(state, "progress", "info", f"step={index}/{total}")

        goal_handle.succeed()
        result.success = True
        result.message = "比赛状态机已完成一轮执行"
        result.final_checkpoint_id = checkpoint_id
        result.resume_hint = "competition_done"
        return result

    def _build_states(self, ordered_tasks: List[str]) -> List[str]:
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
        return states

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
            return ok1 and ok2 and len(cups) >= 2, f"water={ok1}, cola={ok2}, cups={len(cups)}"
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
            return self._execute_release_guard(object_id)
        if state in {"VERIFY_BALL_1_DROP", "VERIFY_BALL_2_DROP"}:
            object_id = self._assignments.get("basketball" if state.endswith("1") else "soccer_ball")
            return self._verify_detached(object_id)
        if state in {"HOLD_BALL_1_3S", "HOLD_BALL_2_3S"}:
            object_id = self._assignments.get("basketball" if state.endswith("1") else "soccer_ball", "")
            return self._execute_hold_verify(object_id)

        if state == "GRASP_WATER_BOTTLE_BODY":
            return self._direct_grasp("water_bottle", "water_task")
        if state == "GRASP_COLA_BOTTLE_BODY":
            return self._direct_grasp("cola_bottle", "cola_task")
        if state == "GRASP_WATER_CAP":
            return self._execute_cap_align_and_grasp(self._assignments.get("water_bottle", ""))
        if state == "GRASP_COLA_CAP":
            return self._execute_cap_align_and_grasp(self._assignments.get("cola_bottle", ""))
        if state == "OPEN_WATER_CAP":
            return self._execute_cap_twist(self._assignments.get("water_bottle", ""))
        if state == "OPEN_COLA_CAP":
            return self._execute_cap_twist(self._assignments.get("cola_bottle", ""))
        if state == "PLACE_WATER_CAP":
            return self._execute_cap_place(self._assignments.get("water_bottle", ""))
        if state == "PLACE_COLA_CAP":
            return self._execute_cap_place(self._assignments.get("cola_bottle", ""))
        if state == "GRASP_WATER_CUP":
            return self._direct_grasp(self._assignments.get("cup_water", "cup"), "water_task")
        if state == "GRASP_COLA_CUP":
            return self._direct_grasp(self._assignments.get("cup_cola", "cup"), "cola_task")
        if state == "EXECUTE_WATER_POUR":
            return self._execute_pour(self._assignments.get("water_bottle", ""), self._assignments.get("cup_water", ""))
        if state == "EXECUTE_COLA_POUR":
            return self._execute_pour(self._assignments.get("cola_bottle", ""), self._assignments.get("cup_cola", ""))
        if state == "PLACE_WATER_BOTTLE":
            return self._place_object("water_bottle", "water_task")
        if state == "PLACE_COLA_BOTTLE":
            return self._place_object("cola_bottle", "cola_task")
        if state == "PLACE_WATER_CUP":
            return self._place_object("cup_water", "water_task")
        if state == "PLACE_COLA_CUP":
            return self._place_object("cup_cola", "cola_task")

        return False, f"未定义状态: {state}"

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
        if water is None or cola is None or len(cups) < 2:
            return False, "桌面对象不完整，正式流程要求两只杯子"
        self._assignments["water_bottle"] = water.id
        self._assignments["cola_bottle"] = cola.id
        self._assignments["cup_water"] = cups[0].id
        self._assignments["cup_cola"] = cups[1].id
        return True, f"water={water.id}, cola={cola.id}, cups={[cup.id for cup in cups]}"

    def _plan_for_object(self, semantic_type: str, target_field: str, reserved_by: str) -> Tuple[bool, str]:
        scene_object = self._find_object(semantic_type)
        if scene_object is None:
            return False, f"未找到 {semantic_type}"
        target = self._grasp_targets.get(scene_object.id)
        if target is None:
            return False, f"{scene_object.id} 的 grasp target 不存在"
        if not self._reserve(scene_object.id, reserved_by, target.arm_mode):
            return False, f"{scene_object.id} reservation 失败"
        pose = getattr(target, target_field)
        planner_response = self._call_plan_pose(target.arm_mode, pose)
        if planner_response is None or not planner_response.success or planner_response.result_code != "success":
            self._release(scene_object.id)
            return False, f"planner 失败: {planner_response.result_code if planner_response else 'no_response'}"
        self._last_plan = planner_response
        return True, f"planner 成功: {scene_object.id}, scene_version={planner_response.scene_version}"

    def _execute_last_plan_and_grasp(self, object_id: Optional[str], dual: bool = False) -> Tuple[bool, str]:
        if self._last_plan is None:
            return False, "没有可执行的规划结果"
        action_result = self._execute_plan(self._last_plan)
        if action_result is None or not action_result.success:
            return False, f"执行失败: {action_result.result_code if action_result else 'no_result'}"
        if object_id is None:
            return False, "object_id 缺失"
        if dual:
            left_ok = self._set_gripper("left_arm", object_id=object_id, link_name="left_tcp", attach=True)
            right_ok = self._set_gripper("right_arm", command=2, position=200)
            return left_ok and right_ok, "双臂抓取执行完成" if left_ok and right_ok else "双臂抓取失败"
        return self._set_gripper("left_arm", object_id=object_id, link_name="left_tcp", attach=True), "单臂抓取完成"

    def _execute_release_guard(self, object_id: Optional[str]) -> Tuple[bool, str]:
        if self._last_plan is None or object_id is None:
            return False, "释放保护前置条件不足"
        action_result = self._execute_plan(self._last_plan)
        if action_result is None or not action_result.success:
            return False, "释放前轨迹执行失败"
        primitive_result = self._execute_primitive_action(
            primitive_id="release_guard",
            arm_group="left_arm",
            secondary_arm_group="right_arm",
            object_id=object_id,
            synchronized=True,
        )
        if primitive_result is None:
            return False, "release_guard 无响应"
        return primitive_result.success, primitive_result.message

    def _direct_grasp(self, semantic_type_or_id: str, reserved_by: str) -> Tuple[bool, str]:
        scene_object = self._find_object_by_id_or_semantic(semantic_type_or_id)
        if scene_object is None:
            return False, f"未找到 {semantic_type_or_id}"
        target = self._grasp_targets.get(scene_object.id)
        if target is None:
            return False, f"{scene_object.id} 的 grasp target 不存在"
        planner_response = self._call_plan_pose(target.arm_mode, target.pregrasp)
        if planner_response is None or not planner_response.success:
            return False, "抓取前规划失败"
        self._last_plan = planner_response
        executed = self._execute_plan(planner_response)
        if executed is None or not executed.success:
            return False, "抓取前执行失败"
        if not self._reserve(scene_object.id, reserved_by, target.arm_mode):
            return False, "reservation 失败"
        link_name = "left_tcp" if target.arm_mode == "left_arm" else "right_tcp"
        attached = self._set_gripper(
            target.arm_mode,
            object_id=scene_object.id,
            link_name=link_name,
            attach=True,
        )
        return attached, f"{scene_object.id} 抓取{'成功' if attached else '失败'}"

    def _execute_cap_align_and_grasp(self, object_id: str) -> Tuple[bool, str]:
        target = self._grasp_targets.get(object_id)
        if target is None:
            return False, "瓶盖交互 target 不存在"
        primitive_result = self._execute_primitive_action(
            primitive_id="cap_align_and_grasp",
            arm_group=target.partner_arm_mode,
            object_id=object_id,
            primary_waypoints=[target.operate],
            execution_profile=target.execution_profile,
        )
        if primitive_result is None:
            return False, "cap_align_and_grasp 无响应"
        return primitive_result.success, primitive_result.message

    def _execute_cap_twist(self, object_id: str) -> Tuple[bool, str]:
        target = self._grasp_targets.get(object_id)
        if target is None:
            return False, "瓶盖旋拧 target 不存在"
        cap_waypoints = self._build_cap_twist_waypoints(target)
        hold_waypoints = [deepcopy(target.grasp) for _ in cap_waypoints]
        primitive_result = self._execute_primitive_action(
            primitive_id="cap_twist_and_unthread",
            arm_group=target.arm_mode,
            secondary_arm_group=target.partner_arm_mode,
            object_id=object_id,
            primary_waypoints=hold_waypoints,
            secondary_waypoints=cap_waypoints,
            synchronized=True,
            execution_profile=target.execution_profile,
        )
        if primitive_result is None:
            return False, "cap_twist_and_unthread 无响应"
        return primitive_result.success, primitive_result.message

    def _execute_cap_place(self, object_id: str) -> Tuple[bool, str]:
        target = self._grasp_targets.get(object_id)
        if target is None:
            return False, "瓶盖放置 target 不存在"
        primitive_result = self._execute_primitive_action(
            primitive_id="cap_place_or_release",
            arm_group=target.partner_arm_mode,
            object_id=object_id,
            primary_waypoints=[target.place],
            execution_profile=target.execution_profile,
        )
        if primitive_result is None:
            return False, "cap_place_or_release 无响应"
        return primitive_result.success, primitive_result.message

    def _execute_pour(self, bottle_id: str, cup_id: str) -> Tuple[bool, str]:
        bottle_target = self._grasp_targets.get(bottle_id)
        cup_target = self._grasp_targets.get(cup_id)
        if bottle_target is None or cup_target is None:
            return False, "倒水 target 不存在"
        bottle_waypoints = self._build_pour_waypoints(bottle_target)
        cup_hold_waypoints = [deepcopy(cup_target.grasp) for _ in bottle_waypoints]
        primitive_result = self._execute_primitive_action(
            primitive_id="pour_tilt",
            arm_group=bottle_target.arm_mode,
            secondary_arm_group=cup_target.arm_mode,
            object_id=bottle_id,
            reference_object_id=cup_id,
            primary_waypoints=bottle_waypoints,
            secondary_waypoints=cup_hold_waypoints,
            synchronized=True,
            execution_profile=bottle_target.execution_profile,
        )
        if primitive_result is None:
            return False, "pour_tilt 无响应"
        return primitive_result.success, primitive_result.message

    def _execute_hold_verify(self, object_id: str) -> Tuple[bool, str]:
        primitive_result = self._execute_primitive_action(
            primitive_id="hold_verify",
            arm_group="left_arm",
            object_id=object_id,
            hold_duration_s=3.0,
        )
        if primitive_result is None:
            return False, "hold_verify 无响应"
        return primitive_result.success, primitive_result.message

    def _place_object(self, key: str, reserved_by: str) -> Tuple[bool, str]:
        object_id = self._assignments.get(key, key)
        scene_object = self._find_object_by_id_or_semantic(object_id)
        target = self._grasp_targets.get(object_id) if object_id else None
        if scene_object is None or target is None:
            return False, f"{object_id} 放置前对象或 target 缺失"
        planner_response = self._call_plan_pose(target.arm_mode, target.place)
        if planner_response is None or not planner_response.success:
            return False, f"{object_id} 放置前规划失败"
        self._last_plan = planner_response
        executed = self._execute_plan(planner_response)
        if executed is None or not executed.success:
            return False, f"{object_id} 放置前执行失败"
        detached = self._set_gripper(target.arm_mode, command=2, position=0, object_id=object_id, detach=True)
        if not detached:
            return False, f"{object_id} 放置释放失败"
        if not self._release(object_id):
            return False, f"{object_id} release 失败"
        return True, f"{object_id} 已放置并释放"

    def _verify_detached(self, object_id: Optional[str]) -> Tuple[bool, str]:
        if object_id is None:
            return False, "object_id 缺失"
        scene_object = self._find_object_by_id_or_semantic(object_id)
        if scene_object is None:
            return True, f"{object_id} 已从场景中移除"
        if scene_object.attached_link:
            return False, f"{object_id} 仍处于 attached 状态"
        return True, f"{object_id} 已脱附"

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

    def _call_plan_pose(self, arm_group: str, target_pose: PoseStamped):
        if not self._plan_pose_client.wait_for_service(timeout_sec=1.0):
            return None
        request = PlanPose.Request()
        request.arm_group = arm_group
        request.target_pose = target_pose
        request.planner_id = ""
        request.cartesian = False
        future = self._plan_pose_client.call_async(request)
        rclpy.spin_until_future_complete(self, future, timeout_sec=5.0)
        return future.result()

    def _execute_plan(self, planner_response):
        if not self._execute_client.wait_for_server(timeout_sec=1.0):
            return None
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

    def _execute_primitive_action(
        self,
        primitive_id: str,
        arm_group: str,
        object_id: str = "",
        reference_object_id: str = "",
        secondary_arm_group: str = "",
        primary_waypoints: Optional[List[PoseStamped]] = None,
        secondary_waypoints: Optional[List[PoseStamped]] = None,
        execution_profile: str = "default",
        hold_duration_s: float = 0.0,
        synchronized: bool = False,
    ):
        if not self._primitive_client.wait_for_server(timeout_sec=1.0):
            return None
        goal = ExecutePrimitive.Goal()
        goal.primitive_id = primitive_id
        goal.arm_group = arm_group
        goal.secondary_arm_group = secondary_arm_group
        goal.object_id = object_id
        goal.reference_object_id = reference_object_id
        goal.primary_cartesian_waypoints = primary_waypoints or []
        goal.secondary_cartesian_waypoints = secondary_waypoints or []
        goal.execution_profile = execution_profile
        goal.stop_condition_id = ""
        goal.hold_duration_s = hold_duration_s
        goal.synchronized = synchronized
        goal_future = self._primitive_client.send_goal_async(goal)
        rclpy.spin_until_future_complete(self, goal_future, timeout_sec=2.0)
        if goal_future.result() is None:
            return None
        result_future = goal_future.result().get_result_async()
        rclpy.spin_until_future_complete(self, result_future, timeout_sec=20.0)
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

    def _write_pending_checkpoint(self, run_id: str, completed_states: List[str], next_state: str) -> None:
        data = self._checkpoint_payload(run_id, completed_states, next_state, pending_transition=next_state)
        (self._checkpoint_dir / "latest.json").write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        self._append_run_event(run_id, "pending_transition", next_state, data)

    def _commit_checkpoint(self, run_id: str, completed_states: List[str], state: str, next_state: str) -> str:
        checkpoint_id = f"{run_id}:{state}"
        data = self._checkpoint_payload(run_id, completed_states, next_state, pending_transition=None)
        data["checkpoint_id"] = checkpoint_id
        (self._checkpoint_dir / "latest.json").write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        self._append_run_event(run_id, "committed", state, data)
        return checkpoint_id

    def _load_checkpoint(self, checkpoint_id: str):
        latest_path = self._checkpoint_dir / "latest.json"
        if not latest_path.exists():
            return None
        data = json.loads(latest_path.read_text(encoding="utf-8"))
        if checkpoint_id and data.get("checkpoint_id") != checkpoint_id:
            return None
        return data

    def _checkpoint_payload(self, run_id: str, completed_states: List[str], next_state: str, pending_transition: Optional[str]):
        return {
            "run_id": run_id,
            "checkpoint_id": "",
            "checkpoint_schema_version": 1,
            "task_sequence": self.get_parameter("task_sequence").value,
            "completed_states": completed_states,
            "next_state": next_state,
            "scene_version": int(getattr(self._scene_cache, "scene_version", 0)),
            "assignments": self._assignments,
            "reserved_objects": [],
            "attached_objects": [
                {"id": obj.id, "attached_link": obj.attached_link}
                for obj in self._scene_cache.objects
                if obj.attached_link
            ],
            "gripper_snapshot": {},
            "robot_state_stamps": {},
            "last_plan_digest": "",
            "pending_transition": pending_transition,
            "resume_hint": "从 latest.json 的 next_state 恢复",
        }

    def _append_run_event(self, run_id: str, event_type: str, state: str, data) -> None:
        event = {
            "timestamp": int(time.time()),
            "run_id": run_id,
            "event_type": event_type,
            "state": state,
            "detail": data,
            "scene_version": data.get("scene_version", 0),
        }
        run_file = self._checkpoint_dir / "runs" / f"{run_id}.jsonl"
        with run_file.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(event, ensure_ascii=False) + "\n")

    def _publish_event(self, state: str, event: str, level: str, detail: str) -> None:
        message = TaskEvent()
        message.header.stamp = self.get_clock().now().to_msg()
        message.header.frame_id = "world"
        message.state = state
        message.event = event
        message.level = level
        message.detail = detail
        self._event_publisher.publish(message)

    def _build_cap_twist_waypoints(self, target: GraspTarget) -> List[PoseStamped]:
        base = deepcopy(target.operate)
        waypoints = [deepcopy(target.pregrasp), deepcopy(base)]
        for index, angle_deg in enumerate((15.0, 30.0, 45.0), start=1):
            pose = deepcopy(base)
            pose.pose.orientation = self._quaternion_from_rpy(0.0, 0.0, math.radians(angle_deg))
            pose.pose.position.z += 0.003 * index
            waypoints.append(pose)
        waypoints.append(deepcopy(target.retreat))
        return waypoints

    def _build_pour_waypoints(self, target: GraspTarget) -> List[PoseStamped]:
        base = deepcopy(target.operate)
        waypoints = [deepcopy(target.pregrasp), deepcopy(base)]
        for index, pitch_deg in enumerate((15.0, 30.0, 45.0, 55.0), start=1):
            pose = deepcopy(base)
            pose.pose.orientation = self._quaternion_from_rpy(0.0, math.radians(pitch_deg), 0.0)
            pose.pose.position.z -= 0.002 * index
            pose.pose.position.x += 0.004 * index
            waypoints.append(pose)
        reset = deepcopy(base)
        waypoints.append(reset)
        waypoints.append(deepcopy(target.retreat))
        return waypoints

    def _quaternion_from_rpy(self, roll: float, pitch: float, yaw: float):
        from geometry_msgs.msg import Quaternion

        cy = math.cos(yaw * 0.5)
        sy = math.sin(yaw * 0.5)
        cp = math.cos(pitch * 0.5)
        sp = math.sin(pitch * 0.5)
        cr = math.cos(roll * 0.5)
        sr = math.sin(roll * 0.5)
        q = Quaternion()
        q.x = sr * cp * cy - cr * sp * sy
        q.y = cr * sp * cy + sr * cp * sy
        q.z = cr * cp * sy - sr * sp * cy
        q.w = cr * cp * cy + sr * sp * sy
        return q


def main() -> None:
    rclpy.init()
    node = DualArmTaskManagerNode()
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
