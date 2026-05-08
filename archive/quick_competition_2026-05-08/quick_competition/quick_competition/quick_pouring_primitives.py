from __future__ import annotations

import argparse
import time

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
        approach = self.executor.move_to_waypoint(self.cup_arm, "pregrasp_cup", object_id_override=cup_id)
        if not approach.success:
            return approach
        grip = self.executor.bridge.close_gripper(self.cup_arm)
        if not grip.success:
            return grip
        return self.executor.move_to_waypoint(self.cup_arm, "cup_lift", object_id_override=cup_id)

    def pick_bottle(self, bottle_id: str) -> Result:
        object_id = {"water": "water_bottle", "cola": "cola_bottle"}.get(bottle_id, bottle_id)
        approach = self.executor.move_to_waypoint(self.bottle_arm, "pregrasp_bottle", object_id_override=object_id)
        if not approach.success:
            return approach
        grip = self.executor.bridge.close_gripper(self.bottle_arm)
        if not grip.success:
            return grip
        return self.executor.move_to_waypoint(self.bottle_arm, "bottle_lift", object_id_override=object_id)

    def move_to_pour_pose(self, bottle_id: str, cup_id: str) -> Result:
        object_id = {"water": "water_bottle", "cola": "cola_bottle"}.get(bottle_id, bottle_id)
        left_wp = "cup_pour_hold" if self.cup_arm == "left_arm" else "bottle_pour_above_cup"
        right_wp = "bottle_pour_above_cup" if self.bottle_arm == "right_arm" else "cup_pour_hold"
        if self.cup_arm == "left_arm" and self.bottle_arm == "right_arm":
            return self.executor.execute_dual_waypoints_for_objects(
                "cup_pour_hold",
                "bottle_pour_above_cup",
                left_object_id=cup_id,
                right_object_id=object_id,
            )
        cup = self.executor.move_to_waypoint(self.cup_arm, "cup_pour_hold", object_id_override=cup_id)
        if not cup.success:
            return cup
        return self.executor.move_to_waypoint(self.bottle_arm, "bottle_pour_above_cup", object_id_override=object_id)

    def timed_pour(self, bottle_type: str) -> Result:
        object_id = {"water": "water_bottle", "cola": "cola_bottle"}.get(bottle_type, bottle_type)
        liquid = (self.config.get("pouring", {}) or {}).get(bottle_type, {})
        hold_sec = float(liquid.get("hold_sec", 2.0))
        tilt = self.executor.move_to_waypoint(self.bottle_arm, "bottle_pour_tilt", object_id_override=object_id)
        if not tilt.success:
            return tilt
        if not self.executor.dry_run:
            time.sleep(hold_sec)
        return Result.ok(f"{bottle_type} timed pour simulated hold={hold_sec}s")

    def return_bottle_upright(self, bottle_type: str) -> Result:
        object_id = {"water": "water_bottle", "cola": "cola_bottle"}.get(bottle_type, bottle_type)
        return self.executor.move_to_waypoint(self.bottle_arm, "bottle_upright_after_pour", object_id_override=object_id)

    def place_bottle(self, bottle_type: str) -> Result:
        object_id = {"water": "water_bottle", "cola": "cola_bottle"}.get(bottle_type, bottle_type)
        result = self.executor.move_to_waypoint(self.bottle_arm, "bottle_place", object_id_override=object_id)
        if not result.success:
            return result
        grip = self.executor.bridge.open_gripper(self.bottle_arm)
        return result if grip.success else grip

    def place_cup(self, cup_id: str) -> Result:
        result = self.executor.move_to_waypoint(self.cup_arm, "cup_place", object_id_override=cup_id)
        if not result.success:
            return result
        grip = self.executor.bridge.open_gripper(self.cup_arm)
        return result if grip.success else grip

    def run_pouring_once(self, bottle_type: str, cup_id: str) -> Result:
        step = self.pick_cup(cup_id)
        if not step.success:
            return step
        step = self.pick_bottle(bottle_type)
        if not step.success:
            return step
        step = self.move_to_pour_pose(bottle_type, cup_id)
        if not step.success:
            return step
        step = self.timed_pour(bottle_type)
        if not step.success:
            return step
        upright = self.return_bottle_upright(bottle_type)
        if not upright.success:
            return upright
        if self.place_sequence == "cup_first":
            first = self.place_cup(cup_id)
            second = self.place_bottle(bottle_type) if first.success else first
        else:
            first = self.place_bottle(bottle_type)
            second = self.place_cup(cup_id) if first.success else first
        if not second.success:
            return second
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
