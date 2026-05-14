#!/usr/bin/python3

from __future__ import annotations

import argparse
import json
import math
import os
import sys
import time
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Callable, Optional

import rclpy
from rclpy.node import Node

from robo_ctrl.msg import RobotState
from robo_ctrl.srv import RobotMoveCart


ROOT = Path(__file__).resolve().parents[4]
DEFAULT_OUTPUT_ROOT = ROOT / ".codex/tmp/runtime"

ARM_CONFIG = {
    "left": {
        "label": "left_arm",
        "prefix": "L",
        "move_cart_service": "/L/robot_move_cart",
        "state": "/L/robot_state",
    },
    "right": {
        "label": "right_arm",
        "prefix": "R",
        "move_cart_service": "/R/robot_move_cart",
        "state": "/R/robot_state",
    },
}


@dataclass(frozen=True)
class NudgeStep:
    arm: str
    direction: str
    distance_mm: float


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="双臂 TCP 增量移动工具：支持左/右臂执行 +X 50 mm 和 +Y 50 mm"
    )
    parser.add_argument("--mode", choices=("dry-run", "execute"), default="dry-run")
    parser.add_argument("--arm", choices=("left", "right", "both"), default="left")
    parser.add_argument(
        "--directions",
        default="x",
        help="逗号分隔方向，当前只允许正向 x,y；默认 x",
    )
    parser.add_argument("--distance-mm", type=float, default=50.0)
    parser.add_argument("--velocity", type=float, default=5.0)
    parser.add_argument("--acceleration", type=float, default=5.0)
    parser.add_argument("--ovl", type=float, default=5.0)
    parser.add_argument("--blend-time", type=float, default=-1.0)
    parser.add_argument("--tool", type=int, default=0)
    parser.add_argument("--user", type=int, default=0)
    parser.add_argument("--config", type=int, default=-1)
    parser.add_argument("--service-timeout-sec", type=float, default=180.0)
    parser.add_argument("--state-timeout-sec", type=float, default=5.0)
    parser.add_argument("--max-state-age-sec", type=float, default=1.0)
    parser.add_argument("--max-final-error-mm", type=float, default=5.0)
    parser.add_argument("--hardware-confirm-token", default="")
    parser.add_argument("--operator-confirm-site", action="store_true")
    parser.add_argument("--output-dir", default="")
    return parser.parse_args()


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
    if args.distance_mm <= 0.0:
        blockers.append("distance_mm_must_be_positive")
    for name in ("velocity", "acceleration", "ovl"):
        value = float(getattr(args, name))
        if value <= 0.0 or value > 100.0:
            blockers.append(f"{name}_must_be_in_0_100")
    return blockers


def parse_directions(raw: str) -> list[str]:
    directions = [item.strip().lower().lstrip("+") for item in raw.split(",") if item.strip()]
    invalid = [item for item in directions if item not in {"x", "y"}]
    if invalid:
        raise ValueError(f"directions 只允许 x,y；收到: {invalid}")
    if not directions:
        raise ValueError("directions 不能为空")
    return directions


def expand_steps(args: argparse.Namespace) -> list[NudgeStep]:
    arms = ["left", "right"] if args.arm == "both" else [str(args.arm)]
    directions = parse_directions(str(args.directions))
    steps: list[NudgeStep] = []
    for arm in arms:
        for direction in directions:
            steps.append(NudgeStep(arm=arm, direction=direction, distance_mm=float(args.distance_mm)))
    return steps


def output_dir(args: argparse.Namespace) -> Path:
    if args.output_dir:
        path = Path(args.output_dir).expanduser()
    else:
        stamp = datetime.now().strftime("%Y%m%d-%H%M%S-%f")
        path = DEFAULT_OUTPUT_ROOT / f"dual-arm-xy-50mm-nudge-{stamp}"
    path.mkdir(parents=True, exist_ok=True)
    return path


def tcp_pose_to_list(state: RobotState) -> list[float]:
    return [
        float(state.tcp_pose.x),
        float(state.tcp_pose.y),
        float(state.tcp_pose.z),
        float(state.tcp_pose.rx),
        float(state.tcp_pose.ry),
        float(state.tcp_pose.rz),
    ]


def joint_pose_to_list(state: RobotState) -> list[float]:
    return [
        float(state.joint_position.j1),
        float(state.joint_position.j2),
        float(state.joint_position.j3),
        float(state.joint_position.j4),
        float(state.joint_position.j5),
        float(state.joint_position.j6),
    ]


def delta_for_step(step: NudgeStep) -> tuple[float, float, float]:
    if step.direction == "x":
        return step.distance_mm, 0.0, 0.0
    if step.direction == "y":
        return 0.0, step.distance_mm, 0.0
    raise ValueError(f"unsupported direction: {step.direction}")


class CartesianNudgeRunner(Node):
    def __init__(self, args: argparse.Namespace) -> None:
        super().__init__("dual_arm_xy_50mm_nudge")
        self._args = args
        self._states: dict[str, tuple[RobotState, float]] = {}
        self._move_cart_clients = {
            arm: self.create_client(RobotMoveCart, config["move_cart_service"]) for arm, config in ARM_CONFIG.items()
        }
        for arm, config in ARM_CONFIG.items():
            self.create_subscription(
                RobotState,
                config["state"],
                lambda msg, arm_name=arm: self._state_cb(arm_name, msg),
                10,
            )

    def _state_cb(self, arm: str, msg: RobotState) -> None:
        self._states[arm] = (msg, time.monotonic())

    def _spin_until(self, predicate: Callable[[], bool], timeout_sec: float) -> bool:
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

    def _has_fresh_state(self, arm: str, after_received_at: float = 0.0) -> bool:
        if arm not in self._states:
            return False
        _, received_at = self._states[arm]
        return received_at > after_received_at and time.monotonic() - received_at <= float(self._args.max_state_age_sec)

    def _latest_state(self, arm: str, after_received_at: float = 0.0) -> Optional[tuple[RobotState, float]]:
        ok = self._spin_until(
            lambda: self._has_fresh_state(arm, after_received_at),
            float(self._args.state_timeout_sec),
        )
        if not ok:
            return None
        return self._states[arm]

    def _state_gate(self, arm: str) -> tuple[bool, dict]:
        latest = self._latest_state(arm)
        if latest is None:
            return False, {"success": False, "reason": "robot_state_missing_or_stale", "arm": arm}
        state, received_at = latest
        ok = bool(state.motion_done) and int(state.error_code) == 0
        return ok, {
            "success": ok,
            "arm": arm,
            "received_at_monotonic": received_at,
            "motion_done": bool(state.motion_done),
            "error_code": int(state.error_code),
            "tcp_pose": tcp_pose_to_list(state),
            "joint_deg": joint_pose_to_list(state),
        }

    def execute_step(self, step: NudgeStep) -> tuple[bool, dict]:
        return self._execute_step_move_cart(step)

    def _execute_step_move_cart(self, step: NudgeStep) -> tuple[bool, dict]:
        client = self._move_cart_clients[step.arm]
        if not client.wait_for_service(timeout_sec=float(self._args.service_timeout_sec)):
            return False, {
                "success": False,
                "arm": step.arm,
                "direction": step.direction,
                "reason": "robot_move_cart_service_unavailable",
                "service": ARM_CONFIG[step.arm]["move_cart_service"],
            }

        state_ok, before_payload = self._state_gate(step.arm)
        if not state_ok:
            return False, {
                "success": False,
                "arm": step.arm,
                "direction": step.direction,
                "reason": "pre_state_gate_failed",
                "pre_state": before_payload,
            }

        before_tcp = list(before_payload["tcp_pose"])
        before_received_at = float(before_payload["received_at_monotonic"])
        dx, dy, dz = delta_for_step(step)

        request = RobotMoveCart.Request()
        request.tcp_pose.x = dx
        request.tcp_pose.y = dy
        request.tcp_pose.z = dz
        request.tcp_pose.rx = 0.0
        request.tcp_pose.ry = 0.0
        request.tcp_pose.rz = 0.0
        request.tool = int(self._args.tool)
        request.user = int(self._args.user)
        request.velocity = float(self._args.velocity)
        request.acceleration = float(self._args.acceleration)
        request.ovl = float(self._args.ovl)
        request.blend_time = float(self._args.blend_time)
        request.config = int(self._args.config)
        request.use_increment = True

        future = client.call_async(request)
        response = self._wait_future(future, float(self._args.service_timeout_sec) + 60.0)
        if response is None:
            return False, {
                "success": False,
                "arm": step.arm,
                "direction": step.direction,
                "reason": "robot_move_cart_call_timeout",
                "pre_tcp_pose": before_tcp,
            }
        if not bool(response.success):
            return False, {
                "success": False,
                "arm": step.arm,
                "direction": step.direction,
                "reason": "robot_move_cart_failed",
                "message": str(response.message),
                "pre_tcp_pose": before_tcp,
            }

        latest_after = self._latest_state(step.arm, after_received_at=before_received_at)
        if latest_after is None:
            return False, {
                "success": False,
                "arm": step.arm,
                "direction": step.direction,
                "reason": "post_robot_state_missing_or_stale",
                "message": str(response.message),
                "pre_tcp_pose": before_tcp,
            }

        after_state, after_received_at = latest_after
        after_tcp = tcp_pose_to_list(after_state)
        expected_tcp = [
            before_tcp[0] + dx,
            before_tcp[1] + dy,
            before_tcp[2] + dz,
            before_tcp[3],
            before_tcp[4],
            before_tcp[5],
        ]
        translation_error = math.sqrt(
            (after_tcp[0] - expected_tcp[0]) ** 2
            + (after_tcp[1] - expected_tcp[1]) ** 2
            + (after_tcp[2] - expected_tcp[2]) ** 2
        )
        state_complete = bool(after_state.motion_done) and int(after_state.error_code) == 0
        success = state_complete and translation_error <= float(self._args.max_final_error_mm)
        return success, {
            "success": success,
            "arm": step.arm,
            "method": "move-cart",
            "arm_label": ARM_CONFIG[step.arm]["label"],
            "direction": f"+{step.direction.upper()}",
            "distance_mm": float(step.distance_mm),
            "requested_delta_tcp_mm_deg": [dx, dy, dz, 0.0, 0.0, 0.0],
            "service_message": str(response.message),
            "pre_tcp_pose": before_tcp,
            "expected_tcp_pose": expected_tcp,
            "post_tcp_pose": after_tcp,
            "post_joint_deg": joint_pose_to_list(after_state),
            "post_received_at_monotonic": after_received_at,
            "motion_done": bool(after_state.motion_done),
            "error_code": int(after_state.error_code),
            "translation_error_mm": translation_error,
            "max_final_error_mm": float(self._args.max_final_error_mm),
        }


def dry_run_payload(args: argparse.Namespace, steps: list[NudgeStep]) -> dict:
    return {
        "mode": "dry-run",
        "requires_execute_flags": [
            "--mode execute",
            "--operator-confirm-site",
            "--hardware-confirm-token <TOKEN>",
        ],
        "required_services": sorted(
            {ARM_CONFIG[step.arm]["move_cart_service"] for step in steps}
        ),
        "required_state_topics": sorted({ARM_CONFIG[step.arm]["state"] for step in steps}),
        "parameters": {
            "distance_mm": float(args.distance_mm),
            "velocity": float(args.velocity),
            "acceleration": float(args.acceleration),
            "ovl": float(args.ovl),
            "method": "move-cart",
            "blend_time": float(args.blend_time),
            "tool": int(args.tool),
            "user": int(args.user),
            "config": int(args.config),
            "max_final_error_mm": float(args.max_final_error_mm),
        },
        "steps": [
            {
                "index": index,
                "arm": step.arm,
                "arm_label": ARM_CONFIG[step.arm]["label"],
                "service": ARM_CONFIG[step.arm]["move_cart_service"],
                "state_topic": ARM_CONFIG[step.arm]["state"],
                "direction": f"+{step.direction.upper()}",
                "distance_mm": float(step.distance_mm),
            }
            for index, step in enumerate(steps, start=1)
        ],
    }


def run_execute(args: argparse.Namespace, steps: list[NudgeStep]) -> tuple[bool, list[dict]]:
    rclpy.init()
    runner = CartesianNudgeRunner(args)
    results: list[dict] = []
    try:
        for index, step in enumerate(steps, start=1):
            runner.get_logger().info(
                f"执行 {index}/{len(steps)}: {step.arm} +{step.direction.upper()} {step.distance_mm:.1f} mm"
            )
            success, payload = runner.execute_step(step)
            payload["index"] = index
            results.append(payload)
            if not success:
                runner.get_logger().error(f"步骤失败，停止后续动作: {payload}")
                return False, results
        return True, results
    finally:
        runner.destroy_node()
        rclpy.shutdown()


def main() -> int:
    args = parse_args()
    try:
        steps = expand_steps(args)
    except ValueError as exc:
        print(json.dumps({"success": False, "error": str(exc)}, ensure_ascii=False, indent=2))
        return 2

    blockers = validate_execute_gates(args)
    if blockers:
        print(
            json.dumps(
                {
                    "success": False,
                    "mode": args.mode,
                    "blockers": blockers,
                    "message": "真实执行被门禁阻断；确认现场安全并设置 DUALARM_HARDWARE_CONFIRM_TOKEN 后再执行。",
                },
                ensure_ascii=False,
                indent=2,
            )
        )
        return 2

    out_dir = output_dir(args)
    report_path = out_dir / "dual_arm_xy_50mm_nudge_report.json"

    if args.mode == "dry-run":
        report = dry_run_payload(args, steps)
        report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(json.dumps(report, ensure_ascii=False, indent=2))
        print(f"report: {report_path}")
        return 0

    success, results = run_execute(args, steps)
    report = {
        "success": success,
        "mode": "execute",
        "created_at": datetime.now().isoformat(timespec="seconds"),
        "steps": results,
    }
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    print(f"report: {report_path}")
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
