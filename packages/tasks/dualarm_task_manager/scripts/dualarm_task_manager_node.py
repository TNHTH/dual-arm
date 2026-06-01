#!/usr/bin/python3

from __future__ import annotations

import hashlib
import json
import math
import time
from pathlib import Path
from types import SimpleNamespace
from typing import Dict, List, Optional, Tuple

import rclpy
from ament_index_python.packages import get_package_prefix
from geometry_msgs.msg import PoseStamped
from rclpy.action import ActionClient, ActionServer, CancelResponse, GoalResponse
from rclpy.action import graph as action_graph
from rclpy.executors import MultiThreadedExecutor
from rclpy.node import Node
import yaml

from behavior_contract import BehaviorGripperCommand, BehaviorPlanExecutionCall, BehaviorPrimitiveCall, summarize_behavior_call
from behaviors.cap_pour_boundary import CAP_POUR_BEHAVIOR_STATES, build_cap_pour_behavior_call
from behaviors.handover_boundary import HANDOVER_BEHAVIOR_STATES, build_handover_behavior_call
from dualarm_interfaces.action import ExecutePrimitive, ExecuteTrajectory, RunCompetition
from dualarm_interfaces.msg import GraspTarget, SceneObject, SceneObjectArray, TaskEvent
from dualarm_interfaces.srv import PlanPose, ReleaseObject, ReserveObject, SetGripper, SetObjectInteraction, TaskCommand
from task_contract import normalize_task_sequence, parse_task_sequence, rank_scene_objects


class DualArmTaskManagerNode(Node):
    def __init__(self) -> None:
        super().__init__("dualarm_task_manager")
        self.declare_parameter("task_sequence", "handover,pouring")
        repo_root = Path(get_package_prefix("dualarm_task_manager")).parent.parent
        self.declare_parameter("checkpoint_dir", str(repo_root / ".artifacts" / "checkpoints" / "competition"))
        self.declare_parameter("workspace_profiles_file", str(repo_root / "config" / "competition" / "workspace_profiles.yaml"))
        self.declare_parameter("reobserve_once_enabled", True)
        self.declare_parameter("reobserve_once_timeout_sec", 1.5)
        self.declare_parameter("reobserve_once_interval_sec", 0.05)

        self._scene_cache = SceneObjectArray()
        self._grasp_targets: Dict[str, GraspTarget] = {}
        self._assignments: Dict[str, str] = {}
        self._current_task_sequence = ""
        self._current_states: List[str] = []
        self._last_plan = None
        self._last_plan_digest = ""
        self._last_behavior_call = None
        self._start_immediately = False
        self._start_gate_source = ""
        self._config_fingerprint = ""
        self._checkpoint_dir = Path(str(self.get_parameter("checkpoint_dir").value))
        self._checkpoint_dir.mkdir(parents=True, exist_ok=True)
        (self._checkpoint_dir / "runs").mkdir(parents=True, exist_ok=True)
        workspace_profiles_file = Path(str(self.get_parameter("workspace_profiles_file").value)).expanduser().resolve()
        self._config_fingerprint = self._file_sha256(workspace_profiles_file)
        workspace_profiles = yaml.safe_load(workspace_profiles_file.read_text(encoding="utf-8"))
        active_profile_name = str(workspace_profiles.get("active_profile", "competition_default"))
        self._active_workspace_profile = workspace_profiles.get("profiles", {}).get(active_profile_name, {})
        self._reobserve_once_enabled = bool(self.get_parameter("reobserve_once_enabled").value)
        self._reobserve_once_timeout_sec = float(self.get_parameter("reobserve_once_timeout_sec").value)
        self._reobserve_once_interval_sec = float(self.get_parameter("reobserve_once_interval_sec").value)

        self._event_publisher = self.create_publisher(TaskEvent, "/task_manager/events", 10)
        self.create_subscription(SceneObjectArray, "/scene_fusion/scene_objects", self._handle_scene, 10)
        self.create_subscription(GraspTarget, "/planning/grasp_targets", self._handle_grasp_target, 10)

        self._plan_pose_client = self.create_client(PlanPose, "/planning/plan_pose")
        self._reserve_client = self.create_client(ReserveObject, "/scene/reserve_object")
        self._release_client = self.create_client(ReleaseObject, "/scene/release_object")
        self._set_gripper_client = self.create_client(SetGripper, "/execution/set_gripper")
        self._set_object_interaction_client = self.create_client(SetObjectInteraction, "/scene/set_object_interaction")
        self._execute_client = ActionClient(self, ExecuteTrajectory, "/execution/execute_trajectory")
        self._primitive_client = ActionClient(self, ExecutePrimitive, "/execution/execute_primitive")
        self.create_service(TaskCommand, "/task/command", self._handle_task_command)

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

    def _handle_task_command(self, request: TaskCommand.Request, response: TaskCommand.Response):
        command_id = request.command_id.strip()
        object_id = request.object_id.strip()
        response.active_state = command_id

        if command_id == "scan_table":
            response.success, response.message = self._move_arm_to_named_pose("left_scan_table_pose_1")
            return response
        if command_id == "scan_basket":
            response.success, response.message = self._move_arm_to_named_pose("left_scan_basket_pose")
            return response
        if command_id == "move_to_cap_workspace":
            response.success, response.message = self._move_arm_to_named_pose("right_cap_workspace_pose")
            return response
        if command_id == "yield_left":
            response.success, response.message = self._move_arm_to_named_pose("left_scan_yield_pose")
            return response
        if command_id == "yield_right":
            response.success, response.message = self._move_arm_to_named_pose("right_scan_yield_pose")
            return response
        if command_id == "home_left":
            response.success, response.message = self._move_arm_to_named_pose("left_home_pose")
            return response
        if command_id == "home_right":
            response.success, response.message = self._move_arm_to_named_pose("right_home_pose")
            return response
        if command_id == "reobserve_once":
            response.success, response.message = self._reobserve_once("manual_command", object_id)
            return response
        if command_id == "preview_pick":
            response.success, response.message = self._preview_pick(object_id)
            return response
        if command_id == "execute_pick":
            response.success, response.message = self._direct_grasp(object_id, f"rviz_pick:{object_id}")
            return response
        if command_id == "open_cap":
            response.success, response.message = self._execute_open_cap_command(object_id)
            return response
        if command_id == "pick_cup":
            response.success, response.message = self._execute_pick_cup_command(object_id)
            return response
        if command_id == "align_pour":
            response.success, response.message = self._execute_align_pour_command(object_id)
            return response
        if command_id == "pour":
            response.success, response.message = self._execute_pour_command(object_id)
            return response
        if command_id == "plan_ball_pair":
            response.success, response.message = self._execute_plan_ball_pair_command(object_id)
            return response
        if command_id == "execute_ball_close":
            response.success, response.message = self._execute_ball_close_command(object_id)
            return response
        if command_id == "release_ball":
            response.success, response.message = self._execute_release_ball_command(object_id)
            return response
        if command_id == "abort":
            response.success = True
            response.message = "task_manager 已收到 abort 请求；当前版本请通过 action cancel 或上层中止联动"
            return response

        response.success = False
        response.message = f"当前命令未实现: {command_id}"
        return response

    def _handle_scene(self, message: SceneObjectArray) -> None:
        self._scene_cache = message

    def _handle_grasp_target(self, message: GraspTarget) -> None:
        self._grasp_targets[message.object_id] = message

    def _count_action_servers(self, action_name: str) -> int:
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
            for discovered_name, _types in servers:
                if discovered_name == action_name:
                    count += 1
        return count

    def _execute_competition(self, goal_handle):
        run_id = f"run-{int(time.time())}"
        checkpoint_state = None
        self._assignments = {}
        self._last_plan = None
        self._last_plan_digest = ""
        self._last_behavior_call = None
        self._start_immediately = goal_handle.request.start_immediately
        self._start_gate_source = "start_gate_action" if goal_handle.request.start_immediately else "direct_action_goal"
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

        try:
            sequence = self._normalize_task_sequence(goal_handle.request.requested_order or self.get_parameter("task_sequence").value)
            checkpoint_sequence = self._normalize_task_sequence(str(checkpoint_state.get("task_sequence", ""))) if checkpoint_state else ""
        except ValueError as exc:
            result = RunCompetition.Result()
            result.success = False
            result.message = f"task_sequence 非法: {exc}"
            result.final_checkpoint_id = goal_handle.request.checkpoint_id
            result.resume_hint = "请按双臂比赛合同设置 task_sequence，例如 handover,pouring"
            goal_handle.abort()
            return result
        if checkpoint_sequence and checkpoint_sequence != sequence:
            if goal_handle.request.allow_reconcile:
                self.get_logger().warn(
                    f"[task_manager] checkpoint task_sequence={checkpoint_sequence} 覆盖 requested_order={sequence}"
                )
                sequence = checkpoint_sequence
            else:
                result = RunCompetition.Result()
                result.success = False
                result.message = "checkpoint task_sequence 与 requested_order 不一致"
                result.final_checkpoint_id = goal_handle.request.checkpoint_id
                result.resume_hint = "如需按 checkpoint 中的状态序列恢复，请设置 allow_reconcile=true"
                goal_handle.abort()
                return result

        self._current_task_sequence = sequence
        ordered_tasks = self._parse_task_sequence(sequence)
        states = self._build_states(ordered_tasks)
        self._current_states = list(states)
        if checkpoint_state:
            checkpoint_error = self._validate_checkpoint_state(checkpoint_state, states, goal_handle.request.allow_reconcile)
            if checkpoint_error:
                result = RunCompetition.Result()
                result.success = False
                result.message = f"checkpoint 校验失败: {checkpoint_error}"
                result.final_checkpoint_id = goal_handle.request.checkpoint_id
                result.resume_hint = "请修正 checkpoint 或重新开始一轮运行"
                goal_handle.abort()
                return result

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
            return self._execute_orchestration_gate(state)

        if state == "SCAN_BASKET":
            return self._require_object("basket", allowed_states=("stable",))
        if state == "WAIT_BALL_1_STABLE":
            return self._require_object("basketball", allowed_states=("stable",))
        if state == "WAIT_BALL_2_STABLE":
            return self._require_object("soccer_ball", allowed_states=("stable",))
        if state == "SCAN_TABLE_OBJECTS":
            ok1, _ = self._require_object("water_bottle", allowed_states=("stable",))
            ok2, _ = self._require_object("cola_bottle", allowed_states=("stable",))
            cups = self._objects_by_prefix("cup", allowed_states=("stable",))
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

        behavior_call, behavior_error = self._build_behavior_call(state)
        if behavior_error is not None:
            return False, behavior_error
        if behavior_call is not None:
            return self._execute_behavior_call(state, behavior_call)

        if state in {"VERIFY_BALL_1_DROP", "VERIFY_BALL_2_DROP"}:
            object_id = self._assignments.get("basketball" if state.endswith("1") else "soccer_ball")
            return self._verify_drop_in_basket(object_id)

        if state == "GRASP_WATER_BOTTLE_BODY":
            return self._direct_grasp("water_bottle", "water_task")
        if state == "GRASP_COLA_BOTTLE_BODY":
            return self._direct_grasp("cola_bottle", "cola_task")
        if state == "GRASP_WATER_CUP":
            return self._direct_grasp(self._assignments.get("cup_water", "cup"), "water_task")
        if state == "GRASP_COLA_CUP":
            return self._direct_grasp(self._assignments.get("cup_cola", "cup"), "cola_task")
        if state == "PLACE_WATER_BOTTLE":
            return self._place_object("water_bottle")
        if state == "PLACE_COLA_BOTTLE":
            return self._place_object("cola_bottle")
        if state == "PLACE_WATER_CUP":
            return self._place_object("cup_water")
        if state == "PLACE_COLA_CUP":
            return self._place_object("cup_cola")

        return False, f"未定义状态: {state}"

    def _execute_orchestration_gate(self, state: str) -> Tuple[bool, str]:
        if state == "BOOT":
            if not self._checkpoint_dir.exists() or not self._checkpoint_dir.is_dir():
                return False, f"checkpoint_dir 不可用: {self._checkpoint_dir}"
            return True, f"checkpoint_dir ready: {self._checkpoint_dir}"

        if state == "SELF_CHECK":
            missing = []
            service_checks = [
                ("/planning/plan_pose", self._plan_pose_client.wait_for_service(timeout_sec=0.1)),
                ("/scene/reserve_object", self._reserve_client.wait_for_service(timeout_sec=0.1)),
                ("/scene/release_object", self._release_client.wait_for_service(timeout_sec=0.1)),
                ("/execution/set_gripper", self._set_gripper_client.wait_for_service(timeout_sec=0.1)),
            ]
            missing.extend(name for name, ready in service_checks if not ready)
            if not self._execute_client.wait_for_server(timeout_sec=0.1):
                missing.append("/execution/execute_trajectory")
            if not self._primitive_client.wait_for_server(timeout_sec=0.1):
                missing.append("/execution/execute_primitive")
            if missing:
                return False, f"SELF_CHECK 缺少依赖: {', '.join(missing)}"
            if self._count_action_servers("/execution/execute_trajectory") != 1:
                return False, "SELF_CHECK 发现 /execution/execute_trajectory action server 数量不是 1"
            return True, "SELF_CHECK 依赖可用"

        if state == "LOAD_CALIBRATION":
            frame_id = self._scene_cache.header.frame_id.strip()
            if not frame_id:
                return False, "scene_fusion 尚未提供 frame_id，不能确认标定/场景参考系"
            return True, f"scene frame ready: {frame_id}"

        if state == "HOME_ARMS":
            return self._verify_no_live_allocations("HOME_ARMS")

        if state == "WAIT_START":
            if self._start_gate_source == "start_gate_action":
                return True, "WAIT_START 通过：start gate 已发送授权 RunCompetition goal"
            if self._start_gate_source == "direct_action_goal":
                return False, "WAIT_START 拒绝直接 action goal；请通过 /competition/start_signal 或 mock/dev 显式 start gate"
            return False, "WAIT_START 缺少合法开赛来源"

        if state in {"PARK", "DONE"}:
            return self._verify_no_live_allocations(state)

        return False, f"未定义 orchestration gate: {state}"

    def _require_object(self, semantic_type: str, allowed_states: Tuple[str, ...] = ("stable", "reserved", "attached")) -> Tuple[bool, str]:
        scene_object = self._find_object(semantic_type, allowed_states=allowed_states)
        if scene_object is None:
            reobserve_ok, reobserve_detail = self._reobserve_once("missing_object", semantic_type)
            if reobserve_ok:
                scene_object = self._find_object(semantic_type, allowed_states=allowed_states)
            if scene_object is None:
                return False, f"未找到 {semantic_type}; {reobserve_detail}"
        self._assignments[semantic_type] = scene_object.id
        return True, f"{semantic_type}={scene_object.id}"

    def _assign_table_objects(self) -> Tuple[bool, str]:
        water = self._find_object("water_bottle", allowed_states=("stable",))
        cola = self._find_object("cola_bottle", allowed_states=("stable",))
        cups = self._objects_by_prefix("cup", allowed_states=("stable",))
        if water is None or cola is None or len(cups) < 2:
            return False, "桌面对象不完整，正式流程要求两只杯子"
        self._assignments["water_bottle"] = water.id
        self._assignments["cola_bottle"] = cola.id
        ranked_cups = self._rank_scene_objects(cups)
        self._assignments["cup_water"] = ranked_cups[0].id
        self._assignments["cup_cola"] = ranked_cups[1].id
        return True, f"water={water.id}, cola={cola.id}, cups={[cup.id for cup in ranked_cups]}"

    def _plan_for_object(self, semantic_type: str, target_field: str, reserved_by: str) -> Tuple[bool, str]:
        scene_object = self._find_object(semantic_type, allowed_states=("stable",))
        if scene_object is None:
            reobserve_ok, reobserve_detail = self._reobserve_once("missing_plan_object", semantic_type)
            if reobserve_ok:
                scene_object = self._find_object(semantic_type, allowed_states=("stable",))
            if scene_object is None:
                return False, f"未找到 {semantic_type}; {reobserve_detail}"
        target = self._grasp_targets.get(scene_object.id)
        if target is None:
            reobserve_ok, reobserve_detail = self._reobserve_once("missing_grasp_target", scene_object.id)
            if reobserve_ok:
                target = self._grasp_targets.get(scene_object.id)
            if target is None:
                return False, f"{scene_object.id} 的 grasp target 不存在; {reobserve_detail}"
        if not self._reserve(scene_object.id, reserved_by, target.arm_mode):
            return False, f"{scene_object.id} reservation 失败"
        pose = getattr(target, target_field)
        planner_response = self._call_plan_pose(target.arm_mode, pose)
        if planner_response is None or not planner_response.success or planner_response.result_code != "success":
            self._release(scene_object.id)
            return False, f"planner 失败: {planner_response.result_code if planner_response else 'no_response'}"
        self._set_last_plan(planner_response)
        return True, f"planner 成功: {scene_object.id}, scene_version={planner_response.scene_version}"

    def _direct_grasp(self, semantic_type_or_id: str, reserved_by: str) -> Tuple[bool, str]:
        scene_object = self._find_object_by_id_or_semantic(semantic_type_or_id)
        if scene_object is None:
            reobserve_ok, reobserve_detail = self._reobserve_once("missing_direct_grasp_object", semantic_type_or_id)
            if reobserve_ok:
                scene_object = self._find_object_by_id_or_semantic(semantic_type_or_id)
            if scene_object is None:
                return False, f"未找到 {semantic_type_or_id}; {reobserve_detail}"
        target = self._grasp_targets.get(scene_object.id)
        if target is None:
            reobserve_ok, reobserve_detail = self._reobserve_once("missing_direct_grasp_target", scene_object.id)
            if reobserve_ok:
                target = self._grasp_targets.get(scene_object.id)
            if target is None:
                return False, f"{scene_object.id} 的 grasp target 不存在; {reobserve_detail}"
        planner_response = self._call_plan_pose(target.arm_mode, target.pregrasp)
        if planner_response is None or not planner_response.success:
            return False, "抓取前规划失败"
        self._set_last_plan(planner_response)
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

    def _place_object(self, key: str) -> Tuple[bool, str]:
        object_id = self._assignments.get(key, key)
        scene_object = self._find_object_by_id_or_semantic(object_id)
        target = self._grasp_targets.get(object_id) if object_id else None
        if scene_object is None or target is None:
            return False, f"{object_id} 放置前对象或 target 缺失"
        planner_response = self._call_plan_pose(target.arm_mode, target.place)
        if planner_response is None or not planner_response.success:
            return False, f"{object_id} 放置前规划失败"
        self._set_last_plan(planner_response)
        executed = self._execute_plan(planner_response)
        if executed is None or not executed.success:
            return False, f"{object_id} 放置前执行失败"
        detached = self._set_gripper(target.arm_mode, command=2, position=0, object_id=object_id, detach=True)
        if not detached:
            return False, f"{object_id} 放置释放失败"
        if not self._release(object_id):
            return False, f"{object_id} release 失败"
        position_tolerance = target.position_tolerance if target.position_tolerance > 0.0 else 0.08
        return self._verify_placed_near_target(object_id, target.place, position_tolerance)

    def _verify_drop_in_basket(self, object_id: Optional[str]) -> Tuple[bool, str]:
        if not object_id:
            return False, "VERIFY_BALL_* 缺少球体 object_id"

        def predicate() -> Tuple[bool, str]:
            scene_object = self._find_object_by_id_or_semantic(object_id)
            basket = self._find_object("basket", allowed_states=("stable", "reserved", "attached"))
            if scene_object is None:
                return False, f"{object_id} 尚未在 managed scene 中稳定可见"
            if basket is None:
                return False, "basket 尚未在 managed scene 中稳定可见"
            if scene_object.attached_link:
                return False, f"{object_id} 仍 attached 到 {scene_object.attached_link}"
            if scene_object.reserved_by:
                return False, f"{object_id} 仍被 {scene_object.reserved_by} 占用"
            if scene_object.lifecycle_state != "stable":
                return False, f"{object_id} 当前 lifecycle_state={scene_object.lifecycle_state}"
            basket_radius = max(basket.size.x, basket.size.y, 0.18) * 0.6
            dx = scene_object.pose.pose.position.x - basket.pose.pose.position.x
            dy = scene_object.pose.pose.position.y - basket.pose.pose.position.y
            dz = abs(scene_object.pose.pose.position.z - basket.pose.pose.position.z)
            distance_xy = (dx * dx + dy * dy) ** 0.5
            vertical_tolerance = max(basket.size.z, 0.12) + 0.10
            if distance_xy > basket_radius:
                return False, f"{object_id} 距篮筐中心过远: {distance_xy:.3f}m > {basket_radius:.3f}m"
            if dz > vertical_tolerance:
                return False, f"{object_id} 与篮筐高度差过大: {dz:.3f}m > {vertical_tolerance:.3f}m"
            return True, f"{object_id} 已稳定进入篮筐区域"

        return self._poll_scene_predicate(predicate, timeout_sec=1.5, interval_sec=0.1)

    def _verify_placed_near_target(self, object_id: str, target_pose: PoseStamped, position_tolerance: float) -> Tuple[bool, str]:
        tolerance = max(position_tolerance, 0.05)

        def predicate() -> Tuple[bool, str]:
            scene_object = self._find_object_by_id_or_semantic(object_id)
            if scene_object is None:
                return False, f"{object_id} 尚未在 managed scene 中稳定可见"
            if scene_object.attached_link:
                return False, f"{object_id} 仍 attached 到 {scene_object.attached_link}"
            if scene_object.reserved_by:
                return False, f"{object_id} 仍被 {scene_object.reserved_by} 占用"
            if scene_object.lifecycle_state != "stable":
                return False, f"{object_id} 当前 lifecycle_state={scene_object.lifecycle_state}"
            distance = self._pose_distance(scene_object.pose, target_pose)
            if distance > tolerance:
                return False, f"{object_id} 仍未到达放置位: {distance:.3f}m > {tolerance:.3f}m"
            return True, f"{object_id} 已稳定到达放置位"

        return self._poll_scene_predicate(predicate, timeout_sec=1.5, interval_sec=0.1)

    def _scene_version(self) -> int:
        return int(getattr(self._scene_cache, "scene_version", 0))

    def _wait_for_scene_update(self, after_version: int, timeout_sec: float) -> bool:
        deadline = time.monotonic() + timeout_sec
        while time.monotonic() < deadline:
            if self._scene_version() > after_version:
                return True
            time.sleep(self._reobserve_once_interval_sec)
        return self._scene_version() > after_version

    def _reobserve_once(self, reason: str, object_key: str = "") -> Tuple[bool, str]:
        if not self._reobserve_once_enabled:
            return False, f"reobserve_once disabled: reason={reason}, object={object_key}"
        before = self._scene_version()
        if self._wait_for_scene_update(before, self._reobserve_once_timeout_sec):
            after = self._scene_version()
            return True, f"reobserve_once ok: scene_version {before}->{after}, reason={reason}, object={object_key}"
        return False, f"reobserve_once timeout: scene_version={before}, reason={reason}, object={object_key}"

    def _find_object(self, semantic_type: str, allowed_states: Optional[Tuple[str, ...]] = None) -> Optional[SceneObject]:
        candidates = [
            obj for obj in self._scene_cache.objects
            if obj.semantic_type == semantic_type and self._is_usable_world_object(obj)
        ]
        if allowed_states is not None:
            candidates = [obj for obj in candidates if obj.lifecycle_state in allowed_states]
        ranked = self._rank_scene_objects(candidates)
        return ranked[0] if ranked else None

    def _objects_by_prefix(self, prefix: str, allowed_states: Optional[Tuple[str, ...]] = None) -> List[SceneObject]:
        candidates = [
            obj for obj in self._scene_cache.objects
            if obj.semantic_type.startswith(prefix) and self._is_usable_world_object(obj)
        ]
        if allowed_states is not None:
            candidates = [obj for obj in candidates if obj.lifecycle_state in allowed_states]
        return self._rank_scene_objects(candidates)

    def _rank_scene_objects(self, objects: List[SceneObject]) -> List[SceneObject]:
        return rank_scene_objects(objects)

    def _find_object_by_id_or_semantic(self, key: str) -> Optional[SceneObject]:
        for scene_object in self._scene_cache.objects:
            if (scene_object.id == key or scene_object.semantic_type == key) and self._is_usable_world_object(scene_object):
                return scene_object
        return None

    def _is_usable_world_object(self, scene_object: SceneObject) -> bool:
        if scene_object.pose.header.frame_id != "world":
            return False
        if not scene_object.source:
            return False
        return bool(scene_object.id and scene_object.semantic_type)

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
            return SimpleNamespace(success=False, result_code="server_unavailable")
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
        goal_handle = goal_future.result()
        if goal_handle is None:
            return SimpleNamespace(success=False, result_code="goal_send_timeout")
        if not goal_handle.accepted:
            return SimpleNamespace(success=False, result_code="goal_rejected")
        result_future = goal_handle.get_result_async()
        rclpy.spin_until_future_complete(self, result_future, timeout_sec=15.0)
        if result_future.result() is None:
            return SimpleNamespace(success=False, result_code="result_timeout")
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
            return SimpleNamespace(success=False, message="primitive server unavailable", result_code="server_unavailable")
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
        goal_handle = goal_future.result()
        if goal_handle is None:
            return SimpleNamespace(success=False, message="primitive goal 发送超时", result_code="goal_send_timeout")
        if not goal_handle.accepted:
            return SimpleNamespace(success=False, message="primitive goal 被拒绝", result_code="goal_rejected")
        result_future = goal_handle.get_result_async()
        rclpy.spin_until_future_complete(self, result_future, timeout_sec=20.0)
        if result_future.result() is None:
            return SimpleNamespace(success=False, message="primitive result 等待超时", result_code="result_timeout")
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
            "checkpoint_schema_version": 2,
            "task_sequence": self._current_task_sequence or self.get_parameter("task_sequence").value,
            "effective_requested_order": self._current_task_sequence or self.get_parameter("task_sequence").value,
            "state_sequence_digest": self._state_sequence_digest(self._current_states),
            "behavior_contract_version": 1,
            "completed_states": completed_states,
            "next_state": next_state,
            "next_state_owner": self._state_owner(next_state),
            "next_behavior_group": self._behavior_group_for_state(next_state),
            "scene_version": int(getattr(self._scene_cache, "scene_version", 0)),
            "config_fingerprint": self._config_fingerprint,
            "start_gate_source": self._start_gate_source,
            "selected_objects": dict(self._assignments),
            "assignments": self._assignments,
            "reserved_objects": [
                {"id": obj.id, "reserved_by": obj.reserved_by}
                for obj in self._scene_cache.objects
                if obj.reserved_by
            ],
            "attached_objects": [
                {"id": obj.id, "attached_link": obj.attached_link}
                for obj in self._scene_cache.objects
                if obj.attached_link
            ],
            "gripper_snapshot": {
                "captured": False,
                "reason": "task_manager_has_no_gripper_feedback_subscription",
            },
            "robot_state_stamps": {
                "captured": False,
                "reason": "task_manager_has_no_robot_state_subscription",
            },
            "last_plan_digest": self._last_plan_digest,
            "last_behavior_call": self._last_behavior_call,
            "pending_transition": pending_transition,
            "resume_hint": f"从 latest.json 的 next_state={next_state} 恢复",
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

    def _build_behavior_call(self, state: str) -> Tuple[Optional[object], Optional[str]]:
        if state in HANDOVER_BEHAVIOR_STATES:
            return build_handover_behavior_call(state, self._assignments, self._grasp_targets)
        if state in CAP_POUR_BEHAVIOR_STATES:
            return build_cap_pour_behavior_call(state, self._assignments, self._grasp_targets)
        return None, None

    def _execute_behavior_call(self, state: str, call) -> Tuple[bool, str]:
        self._last_behavior_call = summarize_behavior_call(state, call)
        if isinstance(call, BehaviorPlanExecutionCall):
            return self._execute_behavior_plan_call(call)
        primitive_result = self._execute_primitive_action(
            primitive_id=call.primitive_id,
            arm_group=call.arm_group,
            object_id=call.object_id,
            reference_object_id=call.reference_object_id,
            secondary_arm_group=call.secondary_arm_group,
            primary_waypoints=call.primary_waypoints,
            secondary_waypoints=call.secondary_waypoints,
            execution_profile=call.execution_profile,
            hold_duration_s=call.hold_duration_s,
            synchronized=call.synchronized,
        )
        return primitive_result.success, primitive_result.message

    def _execute_behavior_plan_call(self, call: BehaviorPlanExecutionCall) -> Tuple[bool, str]:
        if call.execute_last_plan:
            if self._last_plan is None:
                return False, "行为调用缺少可执行规划结果"
            action_result = self._execute_plan(self._last_plan)
            if not action_result.success:
                return False, f"行为规划执行失败: {action_result.result_code}"

        for command in call.gripper_commands:
            if not self._apply_gripper_command(command):
                return False, f"{command.arm_name} gripper command 执行失败"

        if call.behavior_group == "handover":
            object_id = call.object_id
            if object_id and ("basketball" in object_id or "soccer_ball" in object_id):
                interaction_ok = self._set_object_interaction(
                    object_id=object_id,
                    interaction_mode="dual_contact",
                    owner="handover",
                    primary_link="left_tcp",
                    secondary_link="right_tcp",
                    enable=True,
                )
                if not interaction_ok:
                    return False, "球体 dual_contact 切换失败"

        return True, f"{call.behavior_group} 行为规划执行完成"

    def _apply_gripper_command(self, command: BehaviorGripperCommand) -> bool:
        return self._set_gripper(
            arm_name=command.arm_name,
            command=command.command,
            position=command.position,
            object_id=command.object_id,
            link_name=command.link_name,
            attach=command.attach,
            detach=command.detach,
        )

    def _set_object_interaction(
        self,
        object_id: str,
        interaction_mode: str,
        owner: str,
        primary_link: str,
        secondary_link: str,
        enable: bool,
    ) -> bool:
        if not self._set_object_interaction_client.wait_for_service(timeout_sec=0.5):
            return False
        request = SetObjectInteraction.Request()
        request.object_id = object_id
        request.interaction_mode = interaction_mode
        request.owner = owner
        request.primary_link = primary_link
        request.secondary_link = secondary_link
        request.enable = enable
        future = self._set_object_interaction_client.call_async(request)
        rclpy.spin_until_future_complete(self, future, timeout_sec=3.0)
        return future.result() is not None and future.result().success

    def _verify_no_live_allocations(self, state: str) -> Tuple[bool, str]:
        attached = [obj.id for obj in self._scene_cache.objects if obj.attached_link]
        reserved = [obj.id for obj in self._scene_cache.objects if obj.reserved_by]
        if attached or reserved:
            return False, f"{state} 前仍有 live allocation: attached={attached}, reserved={reserved}"
        return True, f"{state} 前未检测到 live allocation"

    def _poll_scene_predicate(self, predicate, timeout_sec: float, interval_sec: float) -> Tuple[bool, str]:
        deadline = time.monotonic() + timeout_sec
        last_detail = "scene predicate 未执行"
        while time.monotonic() < deadline:
            success, detail = predicate()
            if success:
                return True, detail
            last_detail = detail
            time.sleep(interval_sec)
        return False, last_detail

    def _move_arm_to_named_pose(self, pose_name: str) -> Tuple[bool, str]:
        poses = self._active_workspace_profile.get("poses", {})
        pose_spec = poses.get(pose_name)
        if pose_spec is None:
            return False, f"workspace profile 缺少 pose={pose_name}"
        arm_group = str(pose_spec.get("arm", "")).strip()
        pose = self._pose_from_spec(pose_spec)
        planner_response = self._call_plan_pose(arm_group, pose)
        if planner_response is None or not planner_response.success:
            return False, f"{pose_name} 规划失败"
        self._set_last_plan(planner_response)
        executed = self._execute_plan(planner_response)
        if executed is None or not executed.success:
            return False, f"{pose_name} 执行失败"
        return True, f"{pose_name} 执行成功"

    def _pose_from_spec(self, pose_spec: Dict[str, object]) -> PoseStamped:
        pose = PoseStamped()
        pose.header.frame_id = str(self._active_workspace_profile.get("frame_id", "world"))
        xyz = pose_spec.get("position_m", [0.0, 0.0, 0.0])
        rpy = pose_spec.get("rpy_deg", [0.0, 0.0, 0.0])
        pose.pose.position.x = float(xyz[0])
        pose.pose.position.y = float(xyz[1])
        pose.pose.position.z = float(xyz[2])
        roll, pitch, yaw = [math.radians(float(value)) for value in rpy]
        qx, qy, qz, qw = self._quaternion_from_rpy(roll, pitch, yaw)
        pose.pose.orientation.x = qx
        pose.pose.orientation.y = qy
        pose.pose.orientation.z = qz
        pose.pose.orientation.w = qw
        return pose

    def _quaternion_from_rpy(self, roll: float, pitch: float, yaw: float) -> Tuple[float, float, float, float]:
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

    def _preview_pick(self, object_id: str) -> Tuple[bool, str]:
        scene_object = self._find_object_by_id_or_semantic(object_id)
        if scene_object is None:
            return False, f"未找到 {object_id}"
        target = self._grasp_targets.get(scene_object.id)
        if target is None:
            return False, f"{scene_object.id} 的 grasp target 不存在"
        planner_response = self._call_plan_pose(target.arm_mode, target.pregrasp)
        if planner_response is None or not planner_response.success:
            return False, f"{scene_object.id} 预抓取规划失败"
        self._set_last_plan(planner_response)
        return True, f"{scene_object.id} 预抓取规划成功"

    def _execute_open_cap_command(self, object_id: str) -> Tuple[bool, str]:
        scene_object = self._find_object_by_id_or_semantic(object_id)
        if scene_object is None or scene_object.semantic_type not in {"water_bottle", "cola_bottle"}:
            return False, f"{object_id} 不是可开盖瓶子"
        self._assignments[scene_object.semantic_type] = scene_object.id
        moved, detail = self._move_arm_to_named_pose("right_cap_workspace_pose")
        if not moved:
            return False, f"开盖工作位移动失败: {detail}"
        grasp_state = "GRASP_WATER_CAP" if scene_object.semantic_type == "water_bottle" else "GRASP_COLA_CAP"
        open_state = "OPEN_WATER_CAP" if scene_object.semantic_type == "water_bottle" else "OPEN_COLA_CAP"
        grasp_call, grasp_error = self._build_behavior_call(grasp_state)
        if grasp_error or grasp_call is None:
            return False, grasp_error or f"{grasp_state} 行为构造失败"
        success, detail = self._execute_behavior_call(grasp_state, grasp_call)
        if not success:
            return False, detail
        open_call, open_error = self._build_behavior_call(open_state)
        if open_error or open_call is None:
            return False, open_error or f"{open_state} 行为构造失败"
        return self._execute_behavior_call(open_state, open_call)

    def _execute_pick_cup_command(self, object_id: str) -> Tuple[bool, str]:
        scene_object = self._find_object_by_id_or_semantic(object_id)
        if scene_object is None or not scene_object.semantic_type.startswith("cup"):
            return False, f"{object_id} 不是 cup"
        return self._direct_grasp(scene_object.id, f"rviz_cup:{scene_object.id}")

    def _execute_align_pour_command(self, object_id: str) -> Tuple[bool, str]:
        scene_object = self._find_object_by_id_or_semantic(object_id)
        if scene_object is None or scene_object.semantic_type not in {"water_bottle", "cola_bottle"}:
            return False, f"{object_id} 不是 bottle"
        self._assignments[scene_object.semantic_type] = scene_object.id
        target = self._grasp_targets.get(scene_object.id)
        if target is None:
            return False, f"{scene_object.id} grasp target 缺失"
        planner_response = self._call_plan_pose(target.arm_mode, target.operate)
        if planner_response is None or not planner_response.success:
            return False, "倒水对位规划失败"
        self._set_last_plan(planner_response)
        return True, "倒水对位规划成功"

    def _execute_pour_command(self, object_id: str) -> Tuple[bool, str]:
        scene_object = self._find_object_by_id_or_semantic(object_id)
        if scene_object is None or scene_object.semantic_type not in {"water_bottle", "cola_bottle"}:
            return False, f"{object_id} 不是 bottle"
        bottle_key = scene_object.semantic_type
        cup_key = "cup_water" if bottle_key == "water_bottle" else "cup_cola"
        self._assignments[bottle_key] = scene_object.id
        if cup_key not in self._assignments:
            cups = self._objects_by_prefix("cup", allowed_states=("stable", "reserved", "attached"))
            if not cups:
                return False, "当前没有可用 cup"
            self._assignments[cup_key] = cups[0].id
        state = "EXECUTE_WATER_POUR" if bottle_key == "water_bottle" else "EXECUTE_COLA_POUR"
        behavior_call, behavior_error = self._build_behavior_call(state)
        if behavior_error or behavior_call is None:
            return False, behavior_error or f"{state} 行为构造失败"
        return self._execute_behavior_call(state, behavior_call)

    def _execute_plan_ball_pair_command(self, object_id: str) -> Tuple[bool, str]:
        scene_object = self._find_object_by_id_or_semantic(object_id)
        if scene_object is None or scene_object.semantic_type not in {"basketball", "soccer_ball"}:
            return False, f"{object_id} 不是球体"
        self._assignments[scene_object.semantic_type] = scene_object.id
        target = self._grasp_targets.get(scene_object.id)
        if target is None:
            return False, f"{scene_object.id} grasp target 缺失"
        planner_response = self._call_plan_pose(target.arm_mode, target.pregrasp)
        if planner_response is None or not planner_response.success:
            return False, "双臂预抓规划失败"
        self._set_last_plan(planner_response)
        return True, "双臂预抓规划成功"

    def _execute_ball_close_command(self, object_id: str) -> Tuple[bool, str]:
        scene_object = self._find_object_by_id_or_semantic(object_id)
        if scene_object is None or scene_object.semantic_type not in {"basketball", "soccer_ball"}:
            return False, f"{object_id} 不是球体"
        self._assignments[scene_object.semantic_type] = scene_object.id
        state = "GRASP_BALL_1" if scene_object.semantic_type == "basketball" else "GRASP_BALL_2"
        behavior_call, behavior_error = self._build_behavior_call(state)
        if behavior_error or behavior_call is None:
            return False, behavior_error or f"{state} 行为构造失败"
        return self._execute_behavior_call(state, behavior_call)

    def _execute_release_ball_command(self, object_id: str) -> Tuple[bool, str]:
        scene_object = self._find_object_by_id_or_semantic(object_id)
        if scene_object is None or scene_object.semantic_type not in {"basketball", "soccer_ball"}:
            return False, f"{object_id} 不是球体"
        self._assignments[scene_object.semantic_type] = scene_object.id
        state = "RELEASE_BALL_1" if scene_object.semantic_type == "basketball" else "RELEASE_BALL_2"
        behavior_call, behavior_error = self._build_behavior_call(state)
        if behavior_error or behavior_call is None:
            return False, behavior_error or f"{state} 行为构造失败"
        return self._execute_behavior_call(state, behavior_call)

    def _pose_distance(self, lhs: PoseStamped, rhs: PoseStamped) -> float:
        dx = lhs.pose.position.x - rhs.pose.position.x
        dy = lhs.pose.position.y - rhs.pose.position.y
        dz = lhs.pose.position.z - rhs.pose.position.z
        return (dx * dx + dy * dy + dz * dz) ** 0.5

    def _state_owner(self, state: str) -> str:
        if state == "competition_done":
            return "terminal"
        behavior_group = self._behavior_group_for_state(state)
        if behavior_group:
            return f"behavior:{behavior_group}"
        return "orchestration"

    def _behavior_group_for_state(self, state: str) -> str:
        if state in HANDOVER_BEHAVIOR_STATES:
            return "handover"
        if state in CAP_POUR_BEHAVIOR_STATES:
            return "cap_pour"
        return ""

    def _normalize_task_sequence(self, raw_sequence: str) -> str:
        return normalize_task_sequence(raw_sequence)

    def _parse_task_sequence(self, raw_sequence: str) -> List[str]:
        return parse_task_sequence(raw_sequence)

    def _file_sha256(self, path: Path) -> str:
        if not path.exists():
            return ""
        return hashlib.sha256(path.read_bytes()).hexdigest()

    def _validate_checkpoint_state(self, checkpoint_state, states: List[str], allow_reconcile: bool) -> Optional[str]:
        schema_version = int(checkpoint_state.get("checkpoint_schema_version", 0))
        if schema_version not in (1, 2):
            return f"不支持的 checkpoint_schema_version={schema_version}"
        if schema_version == 1 and not allow_reconcile:
            return "legacy checkpoint schema_version=1 仅允许在 allow_reconcile=true 时恢复"

        completed_states = checkpoint_state.get("completed_states", [])
        unknown_completed = [state for state in completed_states if state not in states]
        if unknown_completed:
            return f"checkpoint 含未知 completed_states={unknown_completed}"

        next_state = str(checkpoint_state.get("next_state", "")).strip()
        if next_state and next_state not in states and next_state != "competition_done":
            return f"checkpoint next_state 不在当前状态序列内: {next_state}"

        pending_transition = checkpoint_state.get("pending_transition")
        if pending_transition and not allow_reconcile:
            return f"checkpoint 仍处于 pending_transition={pending_transition}，需 allow_reconcile=true"

        if schema_version == 2:
            required_fields = [
                "effective_requested_order",
                "state_sequence_digest",
                "behavior_contract_version",
                "next_state_owner",
            ]
            missing_fields = [
                field
                for field in required_fields
                if field not in checkpoint_state or checkpoint_state.get(field) in ("", None)
            ]
            if missing_fields:
                return f"schema 2 checkpoint 缺少必填字段: {missing_fields}"

            effective_requested_order = self._normalize_task_sequence(str(checkpoint_state.get("effective_requested_order", "")))
            if not effective_requested_order:
                return "schema 2 checkpoint 的 effective_requested_order 不能为空"
            if effective_requested_order != self._current_task_sequence and not allow_reconcile:
                return "schema 2 checkpoint 的 effective_requested_order 与当前请求不一致"

            try:
                behavior_contract_version = int(checkpoint_state.get("behavior_contract_version", 0))
            except (TypeError, ValueError):
                return "schema 2 checkpoint 的 behavior_contract_version 非法"
            if behavior_contract_version < 1:
                return "schema 2 checkpoint 的 behavior_contract_version 必须大于 0"

        stored_digest = str(checkpoint_state.get("state_sequence_digest", "")).strip()
        current_digest = self._state_sequence_digest(states)
        if stored_digest and stored_digest != current_digest and not allow_reconcile:
            return "checkpoint state_sequence_digest 与当前状态序列不一致"

        stored_owner = str(checkpoint_state.get("next_state_owner", "")).strip()
        if stored_owner and next_state and stored_owner != self._state_owner(next_state) and not allow_reconcile:
            return f"checkpoint next_state_owner 与当前边界不一致: {stored_owner}"
        if schema_version == 2 and next_state and not stored_owner:
            return "schema 2 checkpoint 缺少 next_state_owner"

        return None

    def _state_sequence_digest(self, states: List[str]) -> str:
        digest_source = "|".join(states).encode("utf-8")
        return hashlib.sha256(digest_source).hexdigest()[:16]

    def _set_last_plan(self, planner_response) -> None:
        self._last_plan = planner_response
        self._last_plan_digest = self._plan_digest(planner_response)

    def _plan_digest(self, planner_response) -> str:
        if planner_response is None:
            return ""
        summary = {
            "primary_arm_group": planner_response.primary_arm_group,
            "secondary_arm_group": planner_response.secondary_arm_group,
            "scene_version": getattr(planner_response, "scene_version", 0),
            "primary_joint_points": len(getattr(planner_response.joint_trajectory, "points", [])),
            "secondary_joint_points": len(getattr(planner_response.secondary_joint_trajectory, "points", [])),
            "cartesian_waypoints": len(getattr(planner_response, "cartesian_waypoints", [])),
            "synchronized": getattr(planner_response, "synchronized", False),
        }
        return hashlib.sha256(json.dumps(summary, sort_keys=True).encode("utf-8")).hexdigest()[:16]


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
