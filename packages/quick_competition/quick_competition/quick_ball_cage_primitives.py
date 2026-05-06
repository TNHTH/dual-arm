from __future__ import annotations

import argparse
import time

from .quick_motion_executor import QuickMotionExecutor
from .quick_pose_filter import QuickPoseFilter
from .quick_scene_provider import QuickSceneProvider
from .quick_types import Result, find_repo_root, load_yaml, quick_config_path


class QuickBallCagePrimitives:
    def __init__(self, executor: QuickMotionExecutor) -> None:
        self.executor = executor
        self.config = load_yaml(quick_config_path(find_repo_root(), "quick_ball_cage.yaml"))
        handover = self.config.get("handover", {})
        self.filter = QuickPoseFilter(
            min_frames=int(handover.get("stable_frames", 5)),
            max_position_std_m=float(handover.get("max_position_std_m", 0.02)),
            max_age_sec=2.0,
        )
        self.scene = QuickSceneProvider()

    def wait_ball_stable(self, ball_type: str) -> Result:
        obj = self.scene.get_object(ball_type)
        if not obj:
            return Result.fail(f"未找到 {ball_type} manual/scene pose", code="ball_missing")
        # manual 模式下用同一 pose 填充 N 帧，表示由人工确认球已静止。
        for _ in range(self.filter.min_frames):
            self.filter.add_sample(ball_type, str(obj["frame"]), obj["pose"], float(obj.get("confidence", 0.5)), str(obj["source"]))
        if self.filter.require_stable(ball_type):
            return Result.ok(f"{ball_type} stable")
        return Result.fail(f"{ball_type} 不稳定，等待或人工确认", code="ball_unstable")

    def move_both_to_pre_cage(self, ball_type: str) -> Result:
        return self.executor.execute_dual_waypoints("ball_left_pre_cage", "ball_right_pre_cage")

    def open_both_grippers(self) -> Result:
        self.executor.bridge.open_gripper("left_arm")
        self.executor.bridge.open_gripper("right_arm")
        return Result.ok("both grippers opened")

    def move_both_to_cage(self, ball_type: str) -> Result:
        return self.executor.execute_dual_waypoints("ball_left_cage", "ball_right_cage")

    def wait_for_human_release(self) -> Result:
        wait_s = float((self.config.get("handover") or {}).get("wait_for_human_release_s", 0.5))
        if not self.executor.dry_run:
            time.sleep(wait_s)
        return Result.ok(f"waited human release {wait_s}s")

    def lift_ball(self) -> Result:
        return self.executor.execute_dual_waypoints("ball_left_lift", "ball_right_lift")

    def hold_ball_3_sec(self) -> Result:
        hold_s = float((self.config.get("handover") or {}).get("hold_duration_after_cage_s", 3.2))
        if not self.executor.dry_run:
            time.sleep(hold_s)
        return Result.ok(f"hold ball {hold_s}s")

    def move_ball_to_basket_top(self, basket_pose=None) -> Result:
        return self.executor.execute_dual_waypoints("ball_left_basket_top", "ball_right_basket_top")

    def release_before_contact(self) -> Result:
        self.executor.execute_dual_waypoints("ball_left_release_retreat", "ball_right_release_retreat")
        self.executor.bridge.open_gripper("left_arm")
        self.executor.bridge.open_gripper("right_arm")
        return Result.ok("released before basket contact")

    def run_ball_to_basket(self, ball_type: str) -> Result:
        print(f"[INFO] 请举起{ball_type}")
        stable = self.wait_ball_stable(ball_type)
        if not stable.success:
            return stable
        self.move_both_to_pre_cage(ball_type)
        self.open_both_grippers()
        self.move_both_to_cage(ball_type)
        self.wait_for_human_release()
        self.lift_ball()
        self.hold_ball_3_sec()
        self.move_ball_to_basket_top()
        self.release_before_contact()
        return Result.ok(f"{ball_type} ball cage sequence simulated")


def main() -> None:
    parser = argparse.ArgumentParser(description="quick ball cage primitives")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--ball", default="basketball")
    args = parser.parse_args()
    result = QuickBallCagePrimitives(QuickMotionExecutor(dry_run=args.dry_run)).run_ball_to_basket(args.ball)
    print(f"[{'OK' if result.success else 'FAIL'}] {result.message}")


if __name__ == "__main__":
    main()
