#!/usr/bin/python3

from __future__ import annotations

import argparse
import json
import math
import os
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Optional

import rclpy
from rclpy.action import ActionClient
from rclpy.node import Node
from sensor_msgs.msg import JointState

from dualarm_interfaces.action import ExecuteTrajectory
from dualarm_interfaces.srv import PlanDualJoint, PlanJoint, SetGripper
from robo_ctrl.msg import RobotState


ROOT = Path(__file__).resolve().parents[4]
DEFAULT_POSITIONS_JSON = ROOT / "docs/operations/reports/2026-05-09-coke-cap-unscrew-position-images.json"
DEFAULT_OUTPUT_ROOT = ROOT / ".codex/tmp/runtime"


@dataclass(frozen=True)
class SequenceStep:
    kind: str
    arm: str
    label: str
    sequence: Optional[int] = None
    secondary_arm: str = ""
    secondary_sequence: Optional[int] = None
    gripper_action: str = ""
    gripper_position: int = 0
    slave_id: int = 0
    repeat_index: int = 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="可乐拧瓶盖示教序列受控执行入口")
    parser.add_argument("--positions-json", default=str(DEFAULT_POSITIONS_JSON))
    parser.add_argument("--output-dir", default="")
    parser.add_argument("--mode", choices=("dry-run", "plan-only", "execute"), default="dry-run")
    parser.add_argument("--repeat-left-twist", type=int, default=6)
    parser.add_argument("--fuse-right4-left5", action="store_true")
    parser.add_argument("--start-step-index", type=int, default=1)
    parser.add_argument("--right-open-position", type=int, default=0)
    parser.add_argument("--right-close-position", type=int, default=220)
    parser.add_argument("--left-open-position", type=int, default=0)
    parser.add_argument("--left-close-position", type=int, default=220)
    parser.add_argument("--gripper-speed", type=int, default=20)
    parser.add_argument("--gripper-torque", type=int, default=80)
    parser.add_argument("--left-gripper-slave-id", type=int, default=9)
    parser.add_argument("--right-gripper-slave-id", type=int, default=10)
    parser.add_argument("--planner-id", default="RRTConnectkConfigDefault")
    parser.add_argument("--execution-profile", default="coke_cap_unscrew_low_speed")
    parser.add_argument("--service-timeout-sec", type=float, default=10.0)
    parser.add_argument("--execute-timeout-sec", type=float, default=45.0)
    parser.add_argument("--state-timeout-sec", type=float, default=3.0)
    parser.add_argument("--max-state-age-sec", type=float, default=1.0)
    parser.add_argument("--max-final-joint-error-deg", type=float, default=2.0)
    parser.add_argument("--hardware-confirm-token", default="")
    parser.add_argument("--operator-confirm-site", action="store_true")
    return parser.parse_args()


def load_positions(path: Path) -> dict[int, dict[str, Any]]:
    data = json.loads(path.read_text(encoding="utf-8"))
    positions: dict[int, dict[str, Any]] = {}
    for item in data.get("sequence", []):
        sequence = int(item["sequence"])
        positions[sequence] = item
    missing = [index for index in range(1, 7) if index not in positions]
    if missing:
        raise ValueError(f"positions json missing sequences: {missing}")
    return positions


def expand_sequence(args: argparse.Namespace) -> list[SequenceStep]:
    steps: list[SequenceStep] = [
        SequenceStep("move", "left_arm", "1 左臂观察", sequence=1),
        SequenceStep(
            "gripper",
            "right_arm",
            "右夹爪张开",
            gripper_action="open",
            gripper_position=int(args.right_open_position),
            slave_id=int(args.right_gripper_slave_id),
        ),
        SequenceStep("move", "right_arm", "2 右臂准备夹取", sequence=2),
        SequenceStep("move", "right_arm", "3 右臂夹取", sequence=3),
        SequenceStep(
            "gripper",
            "right_arm",
            "右夹爪夹紧",
            gripper_action="close",
            gripper_position=int(args.right_close_position),
            slave_id=int(args.right_gripper_slave_id),
        ),
    ]
    if bool(args.fuse_right4_left5):
        steps.append(
            SequenceStep(
                "dual_move",
                "right_arm",
                "4 右臂准备拧 + 5 左臂准备拧 循环1",
                sequence=4,
                secondary_arm="left_arm",
                secondary_sequence=5,
                repeat_index=1,
            )
        )
    else:
        steps.append(SequenceStep("move", "right_arm", "4 右臂准备拧", sequence=4))
    for repeat_index in range(1, int(args.repeat_left_twist) + 1):
        if not (bool(args.fuse_right4_left5) and repeat_index == 1):
            steps.append(
                SequenceStep(
                    "move",
                    "left_arm",
                    f"5 左臂准备拧 循环{repeat_index}",
                    sequence=5,
                    repeat_index=repeat_index,
                )
            )
        steps.extend(
            [
                SequenceStep(
                    "gripper",
                    "left_arm",
                    f"左夹爪夹紧 循环{repeat_index}",
                    gripper_action="close",
                    gripper_position=int(args.left_close_position),
                    slave_id=int(args.left_gripper_slave_id),
                    repeat_index=repeat_index,
                ),
                SequenceStep("move", "left_arm", f"6 左臂拧 循环{repeat_index}", sequence=6, repeat_index=repeat_index),
                SequenceStep(
                    "gripper",
                    "left_arm",
                    f"左夹爪松开 循环{repeat_index}",
                    gripper_action="open",
                    gripper_position=int(args.left_open_position),
                    slave_id=int(args.left_gripper_slave_id),
                    repeat_index=repeat_index,
                ),
            ]
        )
    return steps


def hardware_token_matches(token: str) -> bool:
    expected = os.environ.get("DUALARM_HARDWARE_CONFIRM_TOKEN", "")
    return bool(expected and token and token == expected)


def validate_execute_gates(args: argparse.Namespace) -> list[str]:
    blockers: list[str] = []
    if args.mode != "execute":
        return blockers
    if not hardware_token_matches(str(args.hardware_confirm_token)):
        blockers.append("hardware_confirm_token_mismatch_or_unset")
    if not bool(args.operator_confirm_site):
        blockers.append("operator_confirm_site_required")
    return blockers


class SequenceRunner(Node):
    def __init__(self, args: argparse.Namespace, positions: dict[int, dict[str, Any]]) -> None:
        super().__init__("coke_cap_unscrew_sequence_runner")
        self._args = args
        self._positions = positions
        self._states: dict[str, tuple[RobotState, float]] = {}
        self._plan_joint_client = self.create_client(PlanJoint, "/planning/plan_joint")
        self._plan_dual_joint_client = self.create_client(PlanDualJoint, "/planning/plan_dual_joint")
        self._set_gripper_client = self.create_client(SetGripper, "/execution/set_gripper")
        self._execute_client = ActionClient(self, ExecuteTrajectory, "/execution/execute_trajectory")
        self.create_subscription(RobotState, "/L/robot_state", lambda msg: self._state_cb("left_arm", msg), 10)
        self.create_subscription(RobotState, "/R/robot_state", lambda msg: self._state_cb("right_arm", msg), 10)

    def _state_cb(self, arm_name: str, msg: RobotState) -> None:
        self._states[arm_name] = (msg, time.monotonic())

    def _spin_until(self, predicate, timeout_sec: float) -> bool:
        deadline = time.monotonic() + float(timeout_sec)
        while time.monotonic() < deadline:
            if predicate():
                return True
            rclpy.spin_once(self, timeout_sec=0.05)
        return bool(predicate())

    def _wait_future(self, future, timeout_sec: float):
        deadline = time.monotonic() + float(timeout_sec)
        while time.monotonic() < deadline:
            rclpy.spin_once(self, timeout_sec=0.05)
            if future.done():
                return future.result()
        return None

    def _latest_state(self, arm_name: str) -> Optional[RobotState]:
        if not self._spin_until(lambda: self._has_fresh_state(arm_name), self._args.state_timeout_sec):
            return None
        state, received_at = self._states[arm_name]
        return state

    def _has_fresh_state(self, arm_name: str) -> bool:
        if arm_name not in self._states:
            return False
        _, received_at = self._states[arm_name]
        return time.monotonic() - received_at <= float(self._args.max_state_age_sec)

    def _state_gate(self, arm_name: str) -> tuple[bool, dict[str, Any]]:
        state = self._latest_state(arm_name)
        if state is None:
            return False, {"success": False, "reason": "robot_state_missing_or_stale", "arm": arm_name}
        ok = bool(state.motion_done) and int(state.error_code) == 0
        return ok, {
            "success": ok,
            "arm": arm_name,
            "motion_done": bool(state.motion_done),
            "error_code": int(state.error_code),
            "joint_deg": self._robot_joint_positions(state),
        }

    @staticmethod
    def _robot_joint_positions(state: RobotState) -> list[float]:
        return [
            float(state.joint_position.j1),
            float(state.joint_position.j2),
            float(state.joint_position.j3),
            float(state.joint_position.j4),
            float(state.joint_position.j5),
            float(state.joint_position.j6),
        ]

    @staticmethod
    def _joint_state_target(arm_name: str, joints_deg: list[float]) -> JointState:
        target = JointState()
        prefix = "left" if arm_name == "left_arm" else "right"
        target.name = [f"{prefix}_j{index}" for index in range(1, 7)]
        target.position = [math.radians(float(value)) for value in joints_deg]
        return target

    def _plan_move(self, step: SequenceStep) -> tuple[bool, dict[str, Any]]:
        assert step.sequence is not None
        position = self._positions[int(step.sequence)]
        target_joints = [float(value) for value in position["joints_deg"]]
        state_ok, state_payload = self._state_gate(step.arm)
        payload: dict[str, Any] = {
            "type": "move",
            "label": step.label,
            "arm": step.arm,
            "sequence": int(step.sequence),
            "target_joints_deg": target_joints,
            "state_gate": state_payload,
        }
        if not state_ok:
            payload["stage"] = "state_gate"
            return False, payload
        if not self._plan_joint_client.wait_for_service(timeout_sec=1.0):
            payload.update({"stage": "planning", "success": False, "message": "plan_joint service unavailable"})
            return False, payload
        request = PlanJoint.Request()
        request.arm_group = step.arm
        request.target_joints = self._joint_state_target(step.arm, target_joints)
        request.planner_id = str(self._args.planner_id)
        response = self._wait_future(self._plan_joint_client.call_async(request), self._args.service_timeout_sec)
        if response is None:
            payload.update({"stage": "planning", "success": False, "message": "plan_joint timeout"})
            return False, payload
        payload.update(
            {
                "stage": "planning",
                "success": bool(response.success),
                "message": response.message,
                "result_code": response.result_code,
                "failure_stage": response.failure_stage,
                "planning_time_ms": float(response.planning_time_ms),
                "points": len(response.joint_trajectory.points),
                "synchronized": bool(response.synchronized),
            }
        )
        if not bool(response.success):
            return False, payload
        if self._args.mode != "execute":
            return True, payload
        return self._execute_move(step, response, target_joints, payload)

    def _execute_move(self, step: SequenceStep, plan_response, target_joints: list[float], payload: dict[str, Any]) -> tuple[bool, dict[str, Any]]:
        if not self._execute_client.wait_for_server(timeout_sec=1.0):
            payload.update({"stage": "execution", "success": False, "message": "execute_trajectory action unavailable"})
            return False, payload
        goal = ExecuteTrajectory.Goal()
        goal.arm_group = plan_response.primary_arm_group or step.arm
        goal.secondary_arm_group = plan_response.secondary_arm_group
        goal.joint_trajectory = plan_response.joint_trajectory
        goal.secondary_joint_trajectory = plan_response.secondary_joint_trajectory
        goal.cartesian_waypoints = []
        goal.synchronized = bool(plan_response.synchronized)
        goal.use_cartesian_execution = False
        goal.execution_profile = str(self._args.execution_profile)
        goal_handle = self._wait_future(self._execute_client.send_goal_async(goal), 3.0)
        if goal_handle is None or not goal_handle.accepted:
            payload.update({"stage": "execution", "success": False, "message": "execute_trajectory goal rejected or timeout"})
            return False, payload
        result_wrapper = self._wait_future(goal_handle.get_result_async(), self._args.execute_timeout_sec)
        if result_wrapper is None:
            payload.update({"stage": "execution", "success": False, "message": "execute_trajectory result timeout"})
            return False, payload
        result = result_wrapper.result
        post_state = self._latest_state(step.arm)
        final_joints = self._robot_joint_positions(post_state) if post_state is not None else []
        max_error = max((abs(current - target) for current, target in zip(final_joints, target_joints)), default=float("inf"))
        final_ok = bool(result.success) and max_error <= float(self._args.max_final_joint_error_deg)
        payload.update(
            {
                "stage": "execution",
                "success": final_ok,
                "action_success": bool(result.success),
                "message": result.message,
                "result_code": result.result_code,
                "actual_duration_s": float(result.actual_duration_s),
                "final_joint_deg": final_joints,
                "max_final_joint_error_deg": float(max_error),
                "max_allowed_final_joint_error_deg": float(self._args.max_final_joint_error_deg),
            }
        )
        if bool(result.success) and not final_ok:
            payload["message"] = "execute_trajectory reported success but final joint verification failed"
        return final_ok, payload

    def _dual_targets(self, step: SequenceStep) -> tuple[list[float], list[float]]:
        if step.sequence is None or step.secondary_sequence is None:
            raise ValueError("dual_move requires sequence and secondary_sequence")
        primary_joints = [float(value) for value in self._positions[int(step.sequence)]["joints_deg"]]
        secondary_joints = [float(value) for value in self._positions[int(step.secondary_sequence)]["joints_deg"]]
        if step.arm == "left_arm" and step.secondary_arm == "right_arm":
            return primary_joints, secondary_joints
        if step.arm == "right_arm" and step.secondary_arm == "left_arm":
            return secondary_joints, primary_joints
        raise ValueError(f"unsupported dual_move arm pair: {step.arm}, {step.secondary_arm}")

    def _plan_dual_move(self, step: SequenceStep) -> tuple[bool, dict[str, Any]]:
        assert step.sequence is not None
        assert step.secondary_sequence is not None
        left_target_joints, right_target_joints = self._dual_targets(step)
        left_state_ok, left_state_payload = self._state_gate("left_arm")
        right_state_ok, right_state_payload = self._state_gate("right_arm")
        payload: dict[str, Any] = {
            "type": "dual_move",
            "label": step.label,
            "arm": "dual_arm",
            "primary_arm": step.arm,
            "secondary_arm": step.secondary_arm,
            "sequence": int(step.sequence),
            "secondary_sequence": int(step.secondary_sequence),
            "left_target_joints_deg": left_target_joints,
            "right_target_joints_deg": right_target_joints,
            "left_state_gate": left_state_payload,
            "right_state_gate": right_state_payload,
        }
        if not (left_state_ok and right_state_ok):
            payload["stage"] = "state_gate"
            return False, payload
        if not self._plan_dual_joint_client.wait_for_service(timeout_sec=1.0):
            payload.update({"stage": "planning", "success": False, "message": "plan_dual_joint service unavailable"})
            return False, payload
        request = PlanDualJoint.Request()
        request.left_target_joints = self._joint_state_target("left_arm", left_target_joints)
        request.right_target_joints = self._joint_state_target("right_arm", right_target_joints)
        request.planner_id = str(self._args.planner_id)
        request.coordination_mode = "synchronized"
        request.primary_arm = "left_arm"
        request.sync_policy = "time_parameterized"
        response = self._wait_future(self._plan_dual_joint_client.call_async(request), self._args.service_timeout_sec)
        if response is None:
            payload.update({"stage": "planning", "success": False, "message": "plan_dual_joint timeout"})
            return False, payload
        payload.update(
            {
                "stage": "planning",
                "success": bool(response.success),
                "message": response.message,
                "result_code": response.result_code,
                "failure_stage": response.failure_stage,
                "planning_time_ms": float(response.planning_time_ms),
                "left_points": len(response.left_joint_trajectory.points),
                "right_points": len(response.right_joint_trajectory.points),
                "synchronized": True,
            }
        )
        if not bool(response.success):
            return False, payload
        if self._args.mode != "execute":
            return True, payload
        return self._execute_dual_move(response, left_target_joints, right_target_joints, payload)

    def _execute_dual_move(
        self,
        plan_response,
        left_target_joints: list[float],
        right_target_joints: list[float],
        payload: dict[str, Any],
    ) -> tuple[bool, dict[str, Any]]:
        if not self._execute_client.wait_for_server(timeout_sec=1.0):
            payload.update({"stage": "execution", "success": False, "message": "execute_trajectory action unavailable"})
            return False, payload
        goal = ExecuteTrajectory.Goal()
        goal.arm_group = "dual_arm"
        goal.secondary_arm_group = "right_arm"
        goal.joint_trajectory = plan_response.left_joint_trajectory
        goal.secondary_joint_trajectory = plan_response.right_joint_trajectory
        goal.cartesian_waypoints = []
        goal.synchronized = True
        goal.use_cartesian_execution = False
        goal.execution_profile = str(self._args.execution_profile)
        goal_handle = self._wait_future(self._execute_client.send_goal_async(goal), 3.0)
        if goal_handle is None or not goal_handle.accepted:
            payload.update({"stage": "execution", "success": False, "message": "execute_trajectory dual goal rejected or timeout"})
            return False, payload
        result_wrapper = self._wait_future(goal_handle.get_result_async(), self._args.execute_timeout_sec)
        if result_wrapper is None:
            payload.update({"stage": "execution", "success": False, "message": "execute_trajectory dual result timeout"})
            return False, payload
        result = result_wrapper.result
        left_state = self._latest_state("left_arm")
        right_state = self._latest_state("right_arm")
        final_left_joints = self._robot_joint_positions(left_state) if left_state is not None else []
        final_right_joints = self._robot_joint_positions(right_state) if right_state is not None else []
        left_error = max((abs(current - target) for current, target in zip(final_left_joints, left_target_joints)), default=float("inf"))
        right_error = max((abs(current - target) for current, target in zip(final_right_joints, right_target_joints)), default=float("inf"))
        final_ok = (
            bool(result.success)
            and left_error <= float(self._args.max_final_joint_error_deg)
            and right_error <= float(self._args.max_final_joint_error_deg)
        )
        payload.update(
            {
                "stage": "execution",
                "success": final_ok,
                "action_success": bool(result.success),
                "message": result.message,
                "result_code": result.result_code,
                "actual_duration_s": float(result.actual_duration_s),
                "sync_skew_ms": float(result.sync_skew_ms),
                "primary_started": bool(result.primary_started),
                "secondary_started": bool(result.secondary_started),
                "primary_completed": bool(result.primary_completed),
                "secondary_completed": bool(result.secondary_completed),
                "final_left_joint_deg": final_left_joints,
                "final_right_joint_deg": final_right_joints,
                "max_final_left_joint_error_deg": float(left_error),
                "max_final_right_joint_error_deg": float(right_error),
                "max_allowed_final_joint_error_deg": float(self._args.max_final_joint_error_deg),
            }
        )
        if bool(result.success) and not final_ok:
            payload["message"] = "execute_trajectory reported success but dual final joint verification failed"
        return final_ok, payload

    def _run_gripper(self, step: SequenceStep) -> tuple[bool, dict[str, Any]]:
        payload: dict[str, Any] = {
            "type": "gripper",
            "label": step.label,
            "arm": step.arm,
            "action": step.gripper_action,
            "position": int(step.gripper_position),
            "slave_id": int(step.slave_id),
        }
        if self._args.mode != "execute":
            payload.update({"success": True, "stage": self._args.mode, "message": "gripper command not sent"})
            return True, payload
        if not self._set_gripper_client.wait_for_service(timeout_sec=1.0):
            payload.update({"success": False, "stage": "gripper", "message": "set_gripper service unavailable"})
            return False, payload
        request = SetGripper.Request()
        request.arm_name = step.arm
        request.command = 2
        request.slave_id = int(step.slave_id)
        request.position = int(step.gripper_position)
        request.speed = int(self._args.gripper_speed)
        request.torque = int(self._args.gripper_torque)
        request.object_id = ""
        request.link_name = ""
        request.attach_on_success = False
        request.detach_on_success = False
        response = self._wait_future(self._set_gripper_client.call_async(request), self._args.service_timeout_sec)
        if response is None:
            payload.update({"success": False, "stage": "gripper", "message": "set_gripper timeout"})
            return False, payload
        payload.update({"success": bool(response.success), "stage": "gripper", "message": response.message})
        return bool(response.success), payload

    def run_steps(self, steps: list[SequenceStep]) -> tuple[bool, list[dict[str, Any]]]:
        results: list[dict[str, Any]] = []
        overall = True
        for index, step in enumerate(steps, start=int(self._args.start_step_index)):
            if step.kind == "move":
                ok, payload = self._plan_move(step)
            elif step.kind == "dual_move":
                ok, payload = self._plan_dual_move(step)
            else:
                ok, payload = self._run_gripper(step)
            payload["step_index"] = index
            payload["repeat_index"] = int(step.repeat_index)
            results.append(payload)
            if not ok:
                overall = False
                break
        return overall, results


def step_to_dict(step: SequenceStep) -> dict[str, Any]:
    return {
        "kind": step.kind,
        "arm": step.arm,
        "label": step.label,
        "sequence": step.sequence,
        "secondary_arm": step.secondary_arm,
        "secondary_sequence": step.secondary_sequence,
        "gripper_action": step.gripper_action,
        "gripper_position": step.gripper_position,
        "slave_id": step.slave_id,
        "repeat_index": step.repeat_index,
    }


def write_report(args: argparse.Namespace, payload: dict[str, Any]) -> Path:
    if args.output_dir:
        output_dir = Path(args.output_dir)
    else:
        timestamp = time.strftime("%Y%m%d-%H%M%S")
        millis = int((time.time() % 1.0) * 1000)
        output_dir = DEFAULT_OUTPUT_ROOT / f"coke-cap-unscrew-sequence-{args.mode}-{timestamp}-{millis:03d}"
    output_dir.mkdir(parents=True, exist_ok=True)
    report_path = output_dir / "coke_cap_unscrew_sequence_report.json"
    report_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return report_path


def main() -> int:
    args = parse_args()
    positions_path = Path(args.positions_json)
    positions = load_positions(positions_path)
    steps = expand_sequence(args)
    start_step_index = max(1, int(args.start_step_index))
    if start_step_index > len(steps) + 1:
        print(f"invalid --start-step-index: {start_step_index}, expanded steps: {len(steps)}")
        return 2
    steps_to_run = steps[start_step_index - 1 :]
    blockers = validate_execute_gates(args)
    initial_payload: dict[str, Any] = {
        "mode": args.mode,
        "positions_json": str(positions_path),
        "expanded_step_count": len(steps),
        "run_start_step_index": start_step_index,
        "run_step_count": len(steps_to_run),
        "fuse_right4_left5": bool(args.fuse_right4_left5),
        "skipped_steps": [step_to_dict(step) for step in steps[: start_step_index - 1]],
        "steps": [step_to_dict(step) for step in steps],
        "execute_gate": {
            "passes": not blockers,
            "blockers": blockers,
            "requires_token": args.mode == "execute",
            "operator_confirm_site": bool(args.operator_confirm_site),
            "token_matches": hardware_token_matches(str(args.hardware_confirm_token)),
            "note": "用户已说明该序列实测可行；脚本不再把 screenshot_candidate 和已实测声明作为额外硬门禁，但仍保留硬件 token、现场确认、逐段规划和执行后关节误差校验。",
        },
    }
    if blockers:
        report_path = write_report(args, {**initial_payload, "success": False, "stage": "execute_gate"})
        print(f"blocked: {', '.join(blockers)}")
        print(f"report: {report_path}")
        return 2
    if args.mode == "dry-run":
        report_path = write_report(args, {**initial_payload, "success": True, "stage": "dry_run"})
        print(f"dry-run ok: {len(steps_to_run)} run steps / {len(steps)} expanded steps")
        print(f"report: {report_path}")
        return 0

    rclpy.init()
    node = SequenceRunner(args, positions)
    try:
        success, results = node.run_steps(steps_to_run)
    finally:
        node.destroy_node()
        rclpy.shutdown()
    report_path = write_report(args, {**initial_payload, "success": success, "stage": args.mode, "results": results})
    print(f"{args.mode} success={success}")
    print(f"report: {report_path}")
    return 0 if success else 3


if __name__ == "__main__":
    sys.exit(main())
