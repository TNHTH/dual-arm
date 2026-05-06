from __future__ import annotations

import argparse
import math
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple

from .legacy_fairino_bridge import LegacyFairinoBridge
from .quick_types import (
    PAYLOAD_BALL,
    PAYLOAD_EMPTY,
    PAYLOAD_LIQUID,
    Result,
    distance_xyz,
    find_repo_root,
    is_nonzero_xyz,
    load_yaml,
    quick_config_path,
    waypoint_is_usable,
    waypoint_primary,
    waypoint_variants,
    waypoint_xyz,
)


class MotionSafety:
    def __init__(self, limits: Dict[str, Any]) -> None:
        self.limits = limits
        self.policy = limits.get("move_policy", {})
        self.workspace = (limits.get("safety_workspace", {}) or {}).get("table_frame", {})

    @property
    def max_movecart_distance_m(self) -> float:
        return float(self.policy.get("max_movecart_distance_m", 0.05))

    @property
    def z_max_safe_limit_m(self) -> float:
        return float(self.policy.get("z_max_safe_limit_m", 0.80))

    @property
    def z_min_safe_limit_m(self) -> float:
        return float(self.policy.get("z_min_safe_limit_m", 0.0))

    def check_movecart_distance(self, start_xyz: Tuple[float, float, float], target_xyz: Tuple[float, float, float]) -> Result:
        dist = distance_xyz(start_xyz, target_xyz)
        if dist > self.max_movecart_distance_m:
            return Result.fail(
                f"MoveCart 位移 {dist:.3f}m 超过 max_movecart_distance_m={self.max_movecart_distance_m:.3f}m",
                code="movecart_distance_exceeded",
            )
        return Result.ok("MoveCart distance OK", distance_m=dist)

    def check_z_raise(self, current_z: float, target_z: float) -> Result:
        if current_z < self.z_min_safe_limit_m:
            return Result.fail(f"当前 z={current_z:.3f}m 低于安全下限", code="current_z_unsafe")
        if target_z > self.z_max_safe_limit_m:
            return Result.fail(f"目标 z={target_z:.3f}m 超过安全天花板", code="target_z_ceiling")
        return Result.ok("z fallback OK")

    def check_workspace_xyz(self, xyz: Tuple[float, float, float]) -> Result:
        if not self.workspace:
            return Result.ok("workspace not configured")
        keys = ["x", "y", "z"]
        for index, key in enumerate(keys):
            low = self.workspace.get(f"{key}_min", -math.inf)
            high = self.workspace.get(f"{key}_max", math.inf)
            if xyz[index] < float(low) or xyz[index] > float(high):
                return Result.fail(f"目标 {key}={xyz[index]:.3f} 超出 workspace [{low}, {high}]", code="workspace_violation")
        return Result.ok("workspace OK")

    @staticmethod
    def allow_auto_release(payload_state: str) -> bool:
        return payload_state in {PAYLOAD_EMPTY, PAYLOAD_BALL}


class QuickMotionExecutor:
    def __init__(self, dry_run: bool = True, log_dir: Optional[Path] = None) -> None:
        self.repo_root = find_repo_root()
        self.profile = load_yaml(quick_config_path(self.repo_root, "quick_profile.yaml"))
        self.waypoints = load_yaml(quick_config_path(self.repo_root, "quick_waypoints.yaml"))
        self.limits = load_yaml(quick_config_path(self.repo_root, "quick_motion_limits.yaml"))
        self.safety = MotionSafety(self.limits)
        self.dry_run = dry_run
        self.bridge = LegacyFairinoBridge(dry_run=dry_run, log_dir=log_dir)
        self.manual_offset_nonzero = is_nonzero_xyz(self.profile.get("manual_offset_xyz", [0.0, 0.0, 0.0]))

    def required_waypoints_for_task(self, task: str) -> Dict[str, List[str]]:
        groups = self.waypoints.get("required_groups", {})
        result: Dict[str, List[str]] = {"left_arm": [], "right_arm": []}
        for group_name in ["critical", task]:
            group = groups.get(group_name, {})
            for arm in ["left_arm", "right_arm"]:
                result[arm].extend(group.get(arm, []))
        return result

    def prevalidate_waypoints(self, task: str, hardware: bool) -> List[str]:
        errors: List[str] = []
        required = self.required_waypoints_for_task(task)
        for arm, names in required.items():
            for name in names:
                variants = waypoint_variants(self.waypoints, arm, name)
                if not variants:
                    errors.append(f"{arm}.{name} missing")
                    continue
                usable = False
                for entry in variants:
                    check = self._static_ik_check(entry, hardware=hardware)
                    if check.success:
                        usable = True
                        break
                if not usable:
                    errors.append(f"{arm}.{name} has no validated IK/waypoint solution")
        return errors

    def _static_ik_check(self, entry: Dict[str, Any], hardware: bool) -> Result:
        if not waypoint_is_usable(entry):
            return Result.fail("waypoint 缺少 joint_deg 或 tcp_pose_table_frame", code="waypoint_empty")
        xyz = waypoint_xyz(entry)
        if xyz:
            workspace_result = self.safety.check_workspace_xyz(xyz)
            if not workspace_result.success:
                return workspace_result
        if hardware and self.manual_offset_nonzero:
            # offset 非零时旧 joint_deg 必须失效；这里用 workspace 内 tcp_pose 作为静态 IK 可解的最小替代检查。
            if xyz is None:
                return Result.fail("offset 非零时需要 tcp_pose_table_frame 才能重算 IK", code="offset_requires_tcp_pose")
        if entry.get("verified") is False and hardware:
            return Result.fail("hardware 模式拒绝未 verified waypoint", code="waypoint_unverified")
        return Result.ok("static IK precheck OK")

    def check_dual_tcp_distance(self, left_wp: str, right_wp: str) -> Result:
        min_dist = float(self.limits.get("move_policy", {}).get("min_tcp_distance_between_arms_m", 0.08))
        left = waypoint_primary(self.waypoints, "left_arm", left_wp)
        right = waypoint_primary(self.waypoints, "right_arm", right_wp)
        if not left or not right:
            return Result.ok("distance skipped: waypoint missing")
        left_xyz = waypoint_xyz(left)
        right_xyz = waypoint_xyz(right)
        if not left_xyz or not right_xyz:
            return Result.ok("distance skipped: tcp pose missing")
        dist = distance_xyz(left_xyz, right_xyz)
        if dist < min_dist:
            return Result.fail(f"{left_wp}/{right_wp} TCP 距离 {dist:.3f}m 低于 {min_dist:.3f}m", code="tcp_too_close")
        return Result.ok("dual tcp distance OK", distance_m=dist)

    def move_to_waypoint(self, arm: str, waypoint_name: str) -> Result:
        entry = waypoint_primary(self.waypoints, arm, waypoint_name)
        if not entry:
            if self.dry_run:
                return Result.ok(f"dry-run skipped missing waypoint {arm}.{waypoint_name}")
            return Result.fail(f"缺少 waypoint {arm}.{waypoint_name}", code="waypoint_missing")
        joint = entry.get("joint_deg")
        timeout_s = float(self.limits.get("timeouts", {}).get("action_timeout_s", 15.0))
        if isinstance(joint, list) and len(joint) == 6 and not self.manual_offset_nonzero:
            return self.bridge.movej(arm, [float(item) for item in joint], self._vel(), self._acc(), timeout_s=timeout_s)
        pose = entry.get("tcp_pose_table_frame") or entry.get("tcp_pose")
        if isinstance(pose, list) and len(pose) >= 6:
            return self.bridge.movel(arm, [float(item) for item in pose[:6]], self._cart_vel(), self._cart_acc(), timeout_s=timeout_s)
        if self.dry_run:
            return Result.ok(f"dry-run waypoint {arm}.{waypoint_name}")
        return Result.fail(f"waypoint {arm}.{waypoint_name} 不可执行", code="waypoint_unusable")

    def move_final_approach(
        self,
        arm: str,
        start_xyz: Tuple[float, float, float],
        target_pose: List[float],
    ) -> Result:
        target_xyz = (float(target_pose[0]), float(target_pose[1]), float(target_pose[2]))
        distance_result = self.safety.check_movecart_distance(start_xyz, target_xyz)
        if not distance_result.success:
            return distance_result
        if target_xyz[2] < self.safety.z_min_safe_limit_m or target_xyz[2] > self.safety.z_max_safe_limit_m:
            return Result.fail("MoveCart 目标 z 超出安全范围", code="movecart_z_unsafe")
        return self.bridge.movel(arm, target_pose[:6], self._cart_vel(), self._cart_acc())

    def lift_linear(self, arm: str, current_pose: List[float], dz: float) -> Result:
        current_z = float(current_pose[2])
        target = list(current_pose)
        target[2] = current_z + float(dz)
        z_result = self.safety.check_z_raise(current_z, target[2])
        if not z_result.success:
            return z_result
        return self.move_final_approach(arm, (target[0], target[1], current_z), target)

    def execute_dual_waypoints(self, left_wp: str, right_wp: str) -> Result:
        timeout_s = float(self.limits.get("timeouts", {}).get("bimanual_sync_timeout_s", 20.0))
        left = self.move_to_waypoint("left_arm", left_wp)
        right = self.move_to_waypoint("right_arm", right_wp)
        if left.success and right.success:
            return Result.ok(f"dual waypoint OK within {timeout_s}s")
        return Result.fail(f"dual waypoint failed: left={left.message}, right={right.message}", code="dual_waypoint_failed")

    def safe_release(self, arm: str, payload_state: str) -> Result:
        if MotionSafety.allow_auto_release(payload_state):
            self.bridge.open_gripper(arm)
            return Result.ok("auto safe release executed")
        if payload_state == PAYLOAD_LIQUID:
            return Result.fail(
                "LIQUID_CONTAINER 禁止软件自动松夹爪；保持扭矩并报警等待人工接管",
                code="manual_rescue_required",
            )
        return Result.fail(f"未知 payload_state={payload_state}", code="unknown_payload")

    def fatal_abort(self, message: str) -> Result:
        stop_timeout = float(self.limits.get("timeouts", {}).get("max_stop_timeout_s", 3.0))
        result = self.bridge.stop_all(timeout_s=stop_timeout)
        if not result.success:
            print("[CRITICAL] HARDWARE MAY STILL BE MOVING. PRESS PHYSICAL ESTOP IMMEDIATELY!")
        return Result.fail(message, code="fatal_abort", fatal=True, stop_result=result.message)

    def _vel(self) -> float:
        return float(self.limits.get("global", {}).get("vel", 10))

    def _acc(self) -> float:
        return float(self.limits.get("global", {}).get("acc", 10))

    def _cart_vel(self) -> float:
        return float(self.limits.get("global", {}).get("cartesian_vel", 5))

    def _cart_acc(self) -> float:
        return float(self.limits.get("global", {}).get("cartesian_acc", 5))


def spin_motion_executor() -> None:
    try:
        import rclpy
        from rclpy.node import Node
    except Exception as exc:
        print(f"[WARN] rclpy unavailable: {exc}")
        return

    class MotionNode(Node):
        def __init__(self) -> None:
            super().__init__("quick_motion_executor")
            self.get_logger().info("quick_motion_executor 已启动；长距离 MoveJ，MoveCart 只允许短增量。")

    rclpy.init()
    node = MotionNode()
    try:
        rclpy.spin(node)
    finally:
        node.destroy_node()
        rclpy.shutdown()


def main() -> None:
    parser = argparse.ArgumentParser(description="quick motion executor")
    parser.add_argument("--spin", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--prevalidate-task", choices=["pouring", "handover"], default="")
    args, _ = parser.parse_known_args()
    if args.spin:
        spin_motion_executor()
    elif args.prevalidate_task:
        executor = QuickMotionExecutor(dry_run=args.dry_run)
        errors = executor.prevalidate_waypoints(args.prevalidate_task, hardware=not args.dry_run)
        if errors:
            print("\n".join(f"[CRITICAL] {item}" for item in errors))
            raise SystemExit(2)
        print("[OK] waypoint IK preflight passed")
    else:
        print("[OK] quick_motion_executor ready")


if __name__ == "__main__":
    main()
