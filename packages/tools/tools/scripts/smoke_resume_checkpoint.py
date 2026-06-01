#!/usr/bin/python3

from __future__ import annotations

import json
import time
from pathlib import Path

import rclpy
from rclpy.action import ActionClient
from rclpy.node import Node

from dualarm_interfaces.action import RunCompetition


class ResumeCheckpointSmoke(Node):
    def __init__(self) -> None:
        super().__init__("resume_checkpoint_smoke")
        self._action_client = ActionClient(self, RunCompetition, "/competition/run")

    def wait_for_server(self) -> bool:
        return self._action_client.wait_for_server(timeout_sec=3.0)

    def run_resume(self, checkpoint_id: str):
        goal = RunCompetition.Goal()
        goal.start_immediately = False
        goal.requested_order = "handover,pouring"
        goal.resume_from_checkpoint = True
        goal.checkpoint_id = checkpoint_id
        goal.allow_reconcile = True
        future = self._action_client.send_goal_async(goal)
        deadline = time.monotonic() + 5.0
        while time.monotonic() < deadline:
            rclpy.spin_once(self, timeout_sec=0.1)
            if future.done():
                break
        if future.result() is None:
            return None
        result_future = future.result().get_result_async()
        deadline = time.monotonic() + 10.0
        while time.monotonic() < deadline:
            rclpy.spin_once(self, timeout_sec=0.1)
            if result_future.done():
                break
        if result_future.result() is None:
            return None
        return result_future.result().result


def main() -> int:
    repo_root = Path(__file__).resolve().parents[4]
    checkpoint_dir = repo_root / ".artifacts" / "checkpoints" / "competition"
    checkpoint_dir.mkdir(parents=True, exist_ok=True)
    (checkpoint_dir / "runs").mkdir(parents=True, exist_ok=True)
    latest = checkpoint_dir / "latest.json"
    checkpoint_id = "resume-smoke:SELF_CHECK"
    completed_states = [
        "BOOT",
        "SELF_CHECK",
        "LOAD_CALIBRATION",
        "HOME_ARMS",
        "WAIT_START",
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
        "PARK",
        "DONE",
    ]
    payload = {
        "run_id": "resume-smoke",
        "checkpoint_id": checkpoint_id,
        "checkpoint_schema_version": 1,
        "task_sequence": "handover,pouring",
        "completed_states": completed_states,
        "next_state": "competition_done",
        "scene_version": 0,
        "assignments": {},
        "reserved_objects": [],
        "attached_objects": [],
        "gripper_snapshot": {},
        "robot_state_stamps": {},
        "last_plan_digest": "",
        "pending_transition": None,
        "resume_hint": "resume smoke",
    }
    latest.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    rclpy.init()
    node = ResumeCheckpointSmoke()
    try:
        if not node.wait_for_server():
            print("RunCompetition action unavailable")
            return 2
        result = node.run_resume(checkpoint_id)
        if result is None:
            print("resume result timeout")
            return 3
        if not result.success:
            print(f"resume failed: {result.message}")
            return 4
        print("resume checkpoint smoke passed")
        print(result.message)
        print(result.final_checkpoint_id)
        return 0
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    raise SystemExit(main())
