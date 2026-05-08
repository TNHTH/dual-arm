from __future__ import annotations

import argparse
from pathlib import Path
from typing import List

import yaml

from .quick_ball_cage_primitives import QuickBallCagePrimitives
from .quick_motion_executor import QuickMotionExecutor
from .quick_pouring_primitives import QuickPouringPrimitives
from .quick_preflight_check import QuickPreflightCheck
from .quick_task_scoreboard import QuickTaskScoreboard
from .quick_types import (
    ITEM_SKIPPED_PREFLIGHT,
    Result,
    find_repo_root,
    load_quick_configs,
    load_yaml,
    quick_config_path,
    utc_now,
)


class QuickCompetitionOrchestrator:
    def __init__(self, dry_run: bool, task: str, hardware_confirm_token: str = "") -> None:
        self.repo_root = find_repo_root()
        self.configs = load_quick_configs(self.repo_root)
        self.profile = self.configs["quick_profile.yaml"]
        self.dry_run = dry_run
        self.task = task
        self.hardware_confirm_token = hardware_confirm_token
        self.run_dir = self._make_run_dir()
        self.executor = QuickMotionExecutor(dry_run=dry_run, log_dir=self.run_dir)
        self.scoreboard = QuickTaskScoreboard(dry_run=dry_run)

    def _make_run_dir(self) -> Path:
        save_dir = self.profile.get("logging", {}).get("save_dir", ".artifacts/quick_runs")
        stamp = utc_now().replace(":", "").replace("-", "")
        path = self.repo_root / save_dir / f"run-{stamp}"
        path.mkdir(parents=True, exist_ok=True)
        return path

    def run(self) -> Result:
        for name in ["quick_profile.yaml", "quick_calibration.yaml", "quick_waypoints.yaml"]:
            print(f"[OK] loaded {name}")
        print("[OK] legacy bridge available or dry-run fallback active")
        preflight = QuickPreflightCheck().run(
            dry_run=self.dry_run,
            task=self.task,
            hardware_confirm_token=self.hardware_confirm_token,
        )
        for issue in preflight.issues:
            if issue.level in {"CRITICAL", "WARN"}:
                print(f"[{issue.level}] {issue.message}")
        if not preflight.passed:
            for item in preflight.skipped_items:
                self.scoreboard.skip_preflight(item, "preflight failed")
            self._export_summary(preflight_passed=False)
            return Result.fail("preflight failed", code="preflight_failed")
        self.executor.install_computed_solutions(preflight.computed_solutions)
        print("[OK] preflight passed")
        self.executor.execute_dual_waypoints("home", "home")
        if self.executor.has_waypoint_or_computed("left_arm", "observe_table") and self.executor.has_waypoint_or_computed("right_arm", "observe_table"):
            self.executor.execute_dual_waypoints("observe_table", "observe_table")
        else:
            print("[WARN] observe_table skipped: no preflight solution or manual fallback in manual quick mode")
        if self.task in {"full", "pouring"}:
            self._run_pouring()
        if self.task in {"full", "handover"}:
            self._run_handover()
        if self.dry_run or not self.scoreboard.fatal_message:
            self.executor.execute_dual_waypoints("home", "home")
        self.scoreboard.finalize()
        self._export_summary(preflight_passed=True)
        print("[OK] quick run log exported")
        return Result.ok("quick competition run complete")

    def _run_pouring(self) -> None:
        pouring = QuickPouringPrimitives(self.executor)
        for bottle, cup in [("water", "cup_1"), ("cola", "cup_2")]:
            result = pouring.run_pouring_once(bottle, cup)
            if result.success:
                self.scoreboard.complete(f"{bottle}_poured", result.message)
            else:
                self.scoreboard.fail(f"{bottle}_poured", result.message)
        print("[OK] pouring sequence simulated" if self.dry_run else "[OK] pouring sequence executed")

    def _run_handover(self) -> None:
        cage = QuickBallCagePrimitives(self.executor)
        for ball in ["basketball", "soccer_ball"]:
            result = cage.run_ball_to_basket(ball)
            if result.success:
                self.scoreboard.complete(f"{ball}_handover", result.message)
            else:
                self.scoreboard.fail(f"{ball}_handover", result.message)
        print("[OK] ball cage sequence simulated" if self.dry_run else "[OK] ball cage sequence executed")

    def _export_summary(self, preflight_passed: bool) -> None:
        self.scoreboard.write(self.run_dir / "scoreboard.yaml")
        summary = {
            "mode": "dry_run" if self.dry_run else "hardware",
            "task": self.task,
            "preflight_passed": preflight_passed,
            "run_status": self.scoreboard.run_status,
            "run_dir": str(self.run_dir),
            "dry_run_marker": "DRY_RUN_SIMULATED" if self.dry_run else "",
        }
        (self.run_dir / "summary.yaml").write_text(yaml.safe_dump(summary, allow_unicode=True, sort_keys=False), encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="quick competition orchestrator")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--hardware", action="store_true")
    parser.add_argument("--task", choices=["pouring", "handover"], default="full")
    parser.add_argument("--full", action="store_true")
    parser.add_argument("--hardware-confirm-token", default="")
    args, _ = parser.parse_known_args()
    return args


def main() -> None:
    args = parse_args()
    dry_run = args.dry_run or not args.hardware
    task = "full" if args.full or args.task == "full" else args.task
    result = QuickCompetitionOrchestrator(dry_run=dry_run, task=task, hardware_confirm_token=args.hardware_confirm_token).run()
    if not result.success:
        raise SystemExit(2)


if __name__ == "__main__":
    main()
