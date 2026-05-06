from __future__ import annotations

import argparse
import time
from typing import Dict

from .quick_motion_executor import QuickMotionExecutor
from .quick_types import Result, find_repo_root, load_yaml, quick_config_path


class QuickPouringPrimitives:
    def __init__(self, executor: QuickMotionExecutor) -> None:
        self.executor = executor
        self.config = load_yaml(quick_config_path(find_repo_root(), "quick_pouring.yaml"))
        pouring = self.config.get("pouring", {})
        self.cup_arm = "left_arm" if pouring.get("cup_arm", "left") == "left" else "right_arm"
        self.bottle_arm = "left_arm" if pouring.get("bottle_arm", "right") == "left" else "right_arm"
        self.place_sequence = pouring.get("place_sequence", "bottle_first")

    def pick_cup(self, cup_id: str) -> Result:
        self.executor.move_to_waypoint(self.cup_arm, "pregrasp_cup")
        self.executor.bridge.close_gripper(self.cup_arm)
        return self.executor.move_to_waypoint(self.cup_arm, "cup_lift")

    def pick_bottle(self, bottle_id: str) -> Result:
        self.executor.move_to_waypoint(self.bottle_arm, "pregrasp_bottle")
        self.executor.bridge.close_gripper(self.bottle_arm)
        return self.executor.move_to_waypoint(self.bottle_arm, "bottle_lift")

    def move_to_pour_pose(self, bottle_id: str, cup_id: str) -> Result:
        left_wp = "cup_pour_hold" if self.cup_arm == "left_arm" else "bottle_pour_above_cup"
        right_wp = "bottle_pour_above_cup" if self.bottle_arm == "right_arm" else "cup_pour_hold"
        if self.cup_arm == "left_arm" and self.bottle_arm == "right_arm":
            return self.executor.execute_dual_waypoints("cup_pour_hold", "bottle_pour_above_cup")
        self.executor.move_to_waypoint(self.cup_arm, "cup_pour_hold")
        return self.executor.move_to_waypoint(self.bottle_arm, "bottle_pour_above_cup")

    def timed_pour(self, bottle_type: str) -> Result:
        liquid = (self.config.get("pouring", {}) or {}).get(bottle_type, {})
        hold_sec = float(liquid.get("hold_sec", 2.0))
        self.executor.move_to_waypoint(self.bottle_arm, "bottle_pour_tilt")
        if not self.executor.dry_run:
            time.sleep(hold_sec)
        return Result.ok(f"{bottle_type} timed pour simulated hold={hold_sec}s")

    def return_bottle_upright(self) -> Result:
        return self.executor.move_to_waypoint(self.bottle_arm, "bottle_upright_after_pour")

    def place_bottle(self) -> Result:
        result = self.executor.move_to_waypoint(self.bottle_arm, "bottle_place")
        self.executor.bridge.open_gripper(self.bottle_arm)
        return result

    def place_cup(self) -> Result:
        result = self.executor.move_to_waypoint(self.cup_arm, "cup_place")
        self.executor.bridge.open_gripper(self.cup_arm)
        return result

    def run_pouring_once(self, bottle_type: str, cup_id: str) -> Result:
        self.pick_cup(cup_id)
        self.pick_bottle(bottle_type)
        self.move_to_pour_pose(bottle_type, cup_id)
        self.timed_pour(bottle_type)
        upright = self.return_bottle_upright()
        if not upright.success:
            return upright
        if self.place_sequence == "cup_first":
            self.place_cup()
            self.place_bottle()
        else:
            self.place_bottle()
            self.place_cup()
        return Result.ok(f"{bottle_type}->{cup_id} pouring sequence simulated")


def main() -> None:
    parser = argparse.ArgumentParser(description="quick pouring primitives")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--bottle", default="water")
    parser.add_argument("--cup", default="cup_1")
    args = parser.parse_args()
    result = QuickPouringPrimitives(QuickMotionExecutor(dry_run=args.dry_run)).run_pouring_once(args.bottle, args.cup)
    print(f"[{'OK' if result.success else 'FAIL'}] {result.message}")


if __name__ == "__main__":
    main()
