from __future__ import annotations

import argparse
import math
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple

from .legacy_fairino_bridge import LegacyFairinoBridge
from .quick_scene_provider import QuickSceneProvider
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
    def __init__(
        self,
        dry_run: bool = True,
        log_dir: Optional[Path] = None,
        computed_solutions: Optional[Dict[str, Dict[str, Any]]] = None,
    ) -> None:
        self.repo_root = find_repo_root()
        self.profile = load_yaml(quick_config_path(self.repo_root, "quick_profile.yaml"))
        self.waypoints = load_yaml(quick_config_path(self.repo_root, "quick_waypoints.yaml"))
        self.limits = load_yaml(quick_config_path(self.repo_root, "quick_motion_limits.yaml"))
        self.safety = MotionSafety(self.limits)
        self.dry_run = dry_run
        self.computed_solutions = computed_solutions or {}
        self.bridge = LegacyFairinoBridge(dry_run=dry_run, log_dir=log_dir)
        self.scene = QuickSceneProvider(scene_source_override=self.profile.get("scene_source_override", "manual"))
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
                check = self.validate_waypoint_step(arm, name, hardware=hardware)
                if not check.success:
                    errors.append(check.message)
        return errors

    def validate_waypoint_step(
        self,
        arm: str,
        waypoint_name: str,
        hardware: bool,
        object_ids: Optional[Iterable[str]] = None,
    ) -> Result:
        variants = waypoint_variants(self.waypoints, arm, waypoint_name)
        if not variants:
            return Result.fail(f"{arm}.{waypoint_name} missing", code="waypoint_missing")
        required_object_ids = [str(item) for item in object_ids or [] if str(item)]
        for entry in variants:
            if required_object_ids:
                if all(self._static_ik_check(entry, hardware=hardware, object_id_override=object_id).success for object_id in required_object_ids):
                    return Result.ok(f"{arm}.{waypoint_name} fallback waypoint OK")
                continue
            check = self._static_ik_check(entry, hardware=hardware)
            if check.success:
                return Result.ok(f"{arm}.{waypoint_name} fallback waypoint OK")
        return Result.fail(f"{arm}.{waypoint_name} has no validated IK/waypoint solution", code="waypoint_unavailable")

    def install_computed_solutions(self, solutions: Dict[str, Dict[str, Any]]) -> None:
        self.computed_solutions = dict(solutions or {})

    def has_waypoint_or_computed(self, arm: str, waypoint_name: str, object_id_override: Optional[str] = None) -> bool:
        if self._computed_solution_for(arm, waypoint_name, object_id_override=object_id_override):
            return True
        return bool(waypoint_primary(self.waypoints, arm, waypoint_name))

    def _static_ik_check(self, entry: Dict[str, Any], hardware: bool, object_id_override: Optional[str] = None) -> Result:
        if not waypoint_is_usable(entry):
            return Result.fail("waypoint 缺少 joint_deg 或 tcp_pose_table_frame", code="waypoint_empty")
        object_ids = entry.get("object_ids")
        if isinstance(object_ids, list) and object_ids and object_id_override is None:
            for object_id in object_ids:
                check = self._static_ik_check(entry, hardware=hardware, object_id_override=str(object_id))
                if not check.success:
                    return check
            return Result.ok("object-relative variants static IK precheck OK")
        pose_result = self.resolve_waypoint_pose(entry, object_id_override=object_id_override)
        if not pose_result.success and (
            isinstance(entry.get("object_relative_tcp_offset"), list)
            or isinstance(entry.get("tcp_pose_table_frame") or entry.get("tcp_pose"), list)
        ):
            return pose_result
        pose = pose_result.data.get("pose") if pose_result.success else None
        xyz = (float(pose[0]), float(pose[1]), float(pose[2])) if isinstance(pose, list) and len(pose) >= 3 else waypoint_xyz(entry)
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

    def resolve_waypoint_pose(self, entry: Dict[str, Any], object_id_override: Optional[str] = None) -> Result:
        relative = entry.get("object_relative_tcp_offset")
        object_id = object_id_override or entry.get("object_id")
        if isinstance(relative, list) and len(relative) >= 3:
            if not isinstance(object_id, str) or not object_id:
                return Result.fail("object-relative waypoint 缺少 object_id", code="object_id_missing")
            obj = self.scene.get_object(object_id)
            if not obj:
                return Result.fail(f"找不到对象 {object_id}，请更新 quick_objects.yaml 或启用稳定 scene source", code="object_missing")
            object_pose = obj.get("pose")
            if not isinstance(object_pose, list) or len(object_pose) < 3:
                return Result.fail(f"对象 {object_id} 缺少 pose", code="object_pose_missing")
            # quick v1 的 object_relative_tcp_offset 只做 table-frame 平移叠加；
            # 姿态取 offset 的 rx/ry/rz，避免把 manual quaternion 当作 TCP 欧拉角误用。
            rx_ry_rz = [float(relative[i]) for i in range(3, 6)] if len(relative) >= 6 else [0.0, 0.0, 0.0]
            pose = [
                float(object_pose[0]) + float(relative[0]),
                float(object_pose[1]) + float(relative[1]),
                float(object_pose[2]) + float(relative[2]),
                *rx_ry_rz,
            ]
            return Result.ok("object-relative waypoint resolved", pose=pose, object_id=object_id)
        pose = entry.get("tcp_pose_table_frame") or entry.get("tcp_pose")
        if isinstance(pose, list) and len(pose) >= 6:
            return Result.ok("absolute tcp waypoint resolved", pose=[float(item) for item in pose[:6]])
        return Result.fail("waypoint 没有可解析 TCP pose", code="waypoint_pose_missing")

    def move_to_waypoint(self, arm: str, waypoint_name: str, object_id_override: Optional[str] = None) -> Result:
        computed = self._computed_solution_for(arm, waypoint_name, object_id_override=object_id_override)
        if computed is not None:
            pose = computed.get("pose_table")
            if isinstance(pose, list) and len(pose) >= 6:
                timeout_s = float(self.limits.get("timeouts", {}).get("action_timeout_s", 15.0))
                return self.bridge.movel(arm, [float(item) for item in pose[:6]], self._cart_vel(), self._cart_acc(), timeout_s=timeout_s)
            return Result.fail(f"computed solution {arm}.{waypoint_name} 缺少 pose_table", code="computed_solution_invalid")
        entry = waypoint_primary(self.waypoints, arm, waypoint_name)
        if not entry:
            if self._blocks_runtime_first_ik():
                return Result.fail(
                    f"{arm}.{waypoint_name} 没有 preflight computed solution 或 manual fallback，禁止 runtime 首次 IK",
                    code="runtime_first_ik_blocked",
                )
            if self.dry_run:
                return Result.ok(f"dry-run skipped missing waypoint {arm}.{waypoint_name}")
            return Result.fail(f"缺少 waypoint {arm}.{waypoint_name}", code="waypoint_missing")
        joint = entry.get("joint_deg")
        timeout_s = float(self.limits.get("timeouts", {}).get("action_timeout_s", 15.0))
        has_object_relative = isinstance(entry.get("object_relative_tcp_offset"), list)
        if has_object_relative:
            resolved = self.resolve_waypoint_pose(entry, object_id_override=object_id_override)
            if not resolved.success:
                return resolved
            pose = resolved.data["pose"]
            return self.bridge.movel(arm, [float(item) for item in pose[:6]], self._cart_vel(), self._cart_acc(), timeout_s=timeout_s)
        if isinstance(joint, list) and len(joint) == 6 and not self.manual_offset_nonzero:
            return self.bridge.movej(arm, [float(item) for item in joint], self._vel(), self._acc(), timeout_s=timeout_s)
        resolved = self.resolve_waypoint_pose(entry, object_id_override=object_id_override)
        if resolved.success:
            pose = resolved.data["pose"]
            return self.bridge.movel(arm, [float(item) for item in pose[:6]], self._cart_vel(), self._cart_acc(), timeout_s=timeout_s)
        if self._blocks_runtime_first_ik():
            return Result.fail(
                f"{arm}.{waypoint_name} 没有可执行 fallback，禁止 runtime 首次 IK",
                code="runtime_first_ik_blocked",
            )
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

    def execute_dual_waypoints(self, left_wp: str, right_wp: str, object_id_override: Optional[str] = None) -> Result:
        timeout_s = float(self.limits.get("timeouts", {}).get("bimanual_sync_timeout_s", 20.0))
        left = self.move_to_waypoint("left_arm", left_wp, object_id_override=object_id_override)
        right = self.move_to_waypoint("right_arm", right_wp, object_id_override=object_id_override)
        if left.success and right.success:
            return Result.ok(f"dual waypoint OK within {timeout_s}s")
        return Result.fail(f"dual waypoint failed: left={left.message}, right={right.message}", code="dual_waypoint_failed")

    def execute_dual_waypoints_for_objects(
        self,
        left_wp: str,
        right_wp: str,
        left_object_id: Optional[str] = None,
        right_object_id: Optional[str] = None,
    ) -> Result:
        timeout_s = float(self.limits.get("timeouts", {}).get("bimanual_sync_timeout_s", 20.0))
        left = self.move_to_waypoint("left_arm", left_wp, object_id_override=left_object_id)
        right = self.move_to_waypoint("right_arm", right_wp, object_id_override=right_object_id)
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

    def _blocks_runtime_first_ik(self) -> bool:
        mode = str(self.profile.get("motion_generation_mode", "manual_waypoints")).strip()
        allow_runtime_first_ik = bool(self.profile.get("execution", {}).get("allow_runtime_first_ik", False))
        return mode in {"computed_templates", "hybrid"} and not allow_runtime_first_ik

    def _computed_solution_for(
        self,
        arm: str,
        waypoint_name: str,
        object_id_override: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        normalized_arm = "left_arm" if arm in {"left", "left_arm", "l"} else "right_arm"
        object_ids = [object_id_override] if object_id_override else []
        object_ids.append("")
        for object_id in object_ids:
            key = self._computed_key(normalized_arm, waypoint_name, object_id or "")
            if key in self.computed_solutions:
                return self.computed_solutions[key]
        prefix = f"{normalized_arm}.{waypoint_name}."
        for key in sorted(self.computed_solutions):
            if key.startswith(prefix):
                return self.computed_solutions[key]
        return None

    @staticmethod
    def _computed_key(arm: str, waypoint_name: str, object_id: str = "") -> str:
        return f"{arm}.{waypoint_name}.{object_id}".rstrip(".")


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
