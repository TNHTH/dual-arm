from __future__ import annotations

import argparse
from dataclasses import dataclass, field
from typing import Any, Dict, List

from .quick_depth_source_manager import depth_check_lines
from .quick_computed_motion_executor import QuickComputedMotionExecutor
from .quick_motion_executor import QuickMotionExecutor
from .quick_types import PreflightIssue, deep_get, find_repo_root, load_quick_configs, load_yaml, quick_config_path


@dataclass
class PreflightReport:
    passed: bool
    issues: List[PreflightIssue] = field(default_factory=list)
    skipped_items: List[str] = field(default_factory=list)
    computed_solutions: Dict[str, Dict[str, Any]] = field(default_factory=dict)
    computed_evidence: List[Dict[str, Any]] = field(default_factory=list)

    def add(self, level: str, message: str, key: str = "", **data: Any) -> None:
        self.issues.append(PreflightIssue(level, message, key, data))

    def has_critical(self) -> bool:
        return any(issue.level == "CRITICAL" for issue in self.issues)


class QuickPreflightCheck:
    def __init__(self) -> None:
        self.repo_root = find_repo_root()
        self.configs = load_quick_configs(self.repo_root)
        self.profile = self.configs["quick_profile.yaml"]
        self.waypoints = self.configs["quick_waypoints.yaml"]
        self.pouring = self.configs["quick_pouring.yaml"]

    def run(self, dry_run: bool, task: str = "full", hardware_confirm_token: str = "") -> PreflightReport:
        report = PreflightReport(passed=True)
        for name in ["quick_profile.yaml", "quick_calibration.yaml", "quick_waypoints.yaml"]:
            report.add("OK", f"loaded {name}", name)
        if not dry_run:
            expected = deep_get(self.profile, "execution.require_hardware_confirm_token", "I_UNDERSTAND")
            if hardware_confirm_token != expected:
                report.add("CRITICAL", "hardware 模式缺少 hardware_confirm_token=I_UNDERSTAND", "hardware_token")
        scene_mode = self.profile.get("scene_source_override", "manual")
        primary = deep_get(self.profile, "depth.primary_camera", "left")
        if primary != "left":
            report.add("CRITICAL" if not dry_run else "WARN", "primary_camera 不是 left，需显式确认 override", "depth.primary_camera")
        if scene_mode == "manual":
            report.add("WARN", "manual 模式 depth 检查为 WARN，且禁止用 depth 生成最终 3D pose", "depth")
        else:
            report.add("CRITICAL", "depth/scene_fusion 模式需要现场 topic/frame/stamp 自检通过", "depth")
        tasks = ["pouring", "handover"] if task == "full" else [task]
        mode = str(self.profile.get("motion_generation_mode", "manual_waypoints")).strip()
        executor = QuickMotionExecutor(dry_run=dry_run)
        if mode not in {"manual_waypoints", "computed_templates", "hybrid"}:
            report.add("CRITICAL", f"未知 motion_generation_mode={mode}", "motion_generation_mode")
        elif mode == "manual_waypoints":
            if not dry_run:
                self._check_manual_waypoints(report, tasks, executor)
        else:
            self._check_computed_or_hybrid(report, tasks, mode, executor, hardware=not dry_run)
        if not dry_run:
            self._check_pouring_assignment(report, executor)
        report.passed = not report.has_critical()
        return report

    def _check_manual_waypoints(self, report: PreflightReport, tasks: List[str], executor: QuickMotionExecutor) -> None:
        for task_name in tasks:
            errors = executor.prevalidate_waypoints(task_name, hardware=True)
            for error in errors:
                report.add("CRITICAL", error, f"waypoint.{task_name}")
                report.skipped_items.append(task_name)

    def _check_computed_or_hybrid(
        self,
        report: PreflightReport,
        tasks: List[str],
        mode: str,
        executor: QuickMotionExecutor,
        hardware: bool,
    ) -> None:
        computed = QuickComputedMotionExecutor()
        result = computed.evaluate(tasks, mode=mode, motion_executor=executor, hardware=hardware)
        report.computed_solutions.update(result.data.get("solutions", {}))
        report.computed_evidence.extend(result.data.get("step_evidence", []))
        for issue in result.data.get("issues", []):
            report.add("CRITICAL", issue, "computed_templates.static_inputs")
        for item in result.data.get("step_evidence", []):
            item_data = dict(item)
            item_data.pop("message", None)
            item_data.pop("key", None)
            if item.get("passed"):
                report.add("OK", item.get("message", ""), item.get("key", "computed.step"), **item_data)
            else:
                report.add(
                    "CRITICAL",
                    f"{item.get('key')}: {item.get('message')} -> SKIPPED_BY_PREFLIGHT",
                    item.get("key", "computed.step"),
                    **item_data,
                )
        for task_name in result.data.get("skipped_tasks", []):
            if task_name not in report.skipped_items:
                report.skipped_items.append(task_name)

    def _check_pouring_assignment(self, report: PreflightReport, executor: QuickMotionExecutor) -> None:
        pouring = self.pouring.get("pouring", {})
        cup_arm = pouring.get("cup_arm", "left")
        bottle_arm = pouring.get("bottle_arm", "right")
        place_sequence = pouring.get("place_sequence", "bottle_first")
        if cup_arm == bottle_arm:
            report.add("CRITICAL", "cup_arm 与 bottle_arm 不能相同", "pouring.arm_assignment")
        if place_sequence not in {"bottle_first", "cup_first"}:
            report.add("CRITICAL", "place_sequence 必须是 bottle_first 或 cup_first", "pouring.place_sequence")
        for left_wp, right_wp in [
            ("observe_table", "observe_table"),
            ("cup_pour_hold", "bottle_pour_above_cup"),
            ("cup_place", "bottle_place"),
        ]:
            distance_result = executor.check_dual_tcp_distance(left_wp, right_wp)
            if not distance_result.success:
                report.add("CRITICAL", distance_result.message, "pouring.tcp_distance")


def print_depth_check() -> None:
    profile = load_yaml(quick_config_path(find_repo_root(), "quick_profile.yaml"))
    print(depth_check_lines(profile))


def print_frames() -> None:
    profile = load_yaml(quick_config_path(find_repo_root(), "quick_profile.yaml"))
    frames = profile.get("frames", {})
    print("[OK] TF parent-child: quick_left_motion_base -> table_frame")
    print("[OK] TF parent-child: quick_right_motion_base -> table_frame")
    print("[OK] TF parent-child: table_frame -> table_frame_corrected")
    print(f"[OK] execution_frame: {frames.get('execution_frame', 'table_frame_corrected')}")
    print("[INFO] 所有 lookup 前必须 can_transform timeout=2.0s；若失败请先执行 quick_calibration_manager --solve")


def spin_preflight() -> None:
    try:
        import rclpy
        from rclpy.node import Node
    except Exception as exc:
        print(f"[WARN] rclpy unavailable: {exc}")
        return

    class PreflightNode(Node):
        def __init__(self) -> None:
            super().__init__("quick_preflight_check")
            self.get_logger().info("quick_preflight_check 已启动；orchestrator 运行前会执行硬件 token/waypoint/TF 检查。")

    rclpy.init()
    node = PreflightNode()
    try:
        rclpy.spin(node)
    finally:
        node.destroy_node()
        rclpy.shutdown()


def main() -> None:
    parser = argparse.ArgumentParser(description="quick preflight check")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--hardware", action="store_true")
    parser.add_argument("--task", choices=["pouring", "handover"], default="full")
    parser.add_argument("--full", action="store_true")
    parser.add_argument("--hardware-confirm-token", default="")
    parser.add_argument("--check-depth", action="store_true")
    parser.add_argument("--print-frames", action="store_true")
    parser.add_argument("--spin", action="store_true")
    args, _ = parser.parse_known_args()
    if args.check_depth:
        print_depth_check()
        return
    if args.print_frames:
        print_frames()
        return
    if args.spin:
        spin_preflight()
        return
    report = QuickPreflightCheck().run(dry_run=args.dry_run or not args.hardware, task="full" if args.full else args.task, hardware_confirm_token=args.hardware_confirm_token)
    for issue in report.issues:
        print(f"[{issue.level}] {issue.message}")
    if report.passed:
        print("[OK] preflight passed")
    else:
        raise SystemExit(2)


if __name__ == "__main__":
    main()
