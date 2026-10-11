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
        return self.executor.execute_dual_waypoints("ball_left_pre_cage", "ball_right_pre_cage", object_id_override=ball_type)

    def open_both_grippers(self) -> Result:
        left = self.executor.bridge.open_gripper("left_arm")
        right = self.executor.bridge.open_gripper("right_arm")
        if not left.success or not right.success:
            return Result.fail(f"open grippers failed: left={left.message}, right={right.message}", code="gripper_open_failed")
        return Result.ok("both grippers opened")

    def move_both_to_cage(self, ball_type: str) -> Result:
        return self.executor.execute_dual_waypoints("ball_left_cage", "ball_right_cage", object_id_override=ball_type)

    def wait_for_human_release(self) -> Result:
        wait_s = float((self.config.get("handover") or {}).get("wait_for_human_release_s", 0.5))
        if not self.executor.dry_run:
            time.sleep(wait_s)
        return Result.ok(f"waited human release {wait_s}s")

    def lift_ball(self, ball_type: str) -> Result:
        return self.executor.execute_dual_waypoints("ball_left_lift", "ball_right_lift", object_id_override=ball_type)

    def hold_ball_3_sec(self) -> Result:
        hold_s = float((self.config.get("handover") or {}).get("hold_duration_after_cage_s", 3.2))
        if not self.executor.dry_run:
            time.sleep(hold_s)
        return Result.ok(f"hold ball {hold_s}s")

    def move_ball_to_basket_top(self, ball_type: str, basket_pose=None) -> Result:
        return self.executor.execute_dual_waypoints("ball_left_basket_top", "ball_right_basket_top", object_id_override=ball_type)

    def release_before_contact(self, ball_type: str) -> Result:
        retreat = self.executor.execute_dual_waypoints("ball_left_release_retreat", "ball_right_release_retreat", object_id_override=ball_type)
        if not retreat.success:
            return retreat
        left = self.executor.bridge.open_gripper("left_arm")
        right = self.executor.bridge.open_gripper("right_arm")
        if not left.success or not right.success:
            return Result.fail(f"release grippers failed: left={left.message}, right={right.message}", code="gripper_release_failed")
        return Result.ok("released before basket contact")

    def run_ball_to_basket(self, ball_type: str) -> Result:
        print(f"[INFO] 请举起{ball_type}")
        for step in [
            self.wait_ball_stable(ball_type),
            self.move_both_to_pre_cage(ball_type),
            self.open_both_grippers(),
            self.move_both_to_cage(ball_type),
            self.wait_for_human_release(),
            self.lift_ball(ball_type),
            self.hold_ball_3_sec(),
            self.move_ball_to_basket_top(ball_type),
            self.release_before_contact(ball_type),
        ]:
            if not step.success:
                return step
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
