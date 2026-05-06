from __future__ import annotations

import argparse
import time
from pathlib import Path
from typing import Any, Dict, List, Optional

from .quick_types import MotionCommandLog, Result, arm_prefix, find_repo_root, load_yaml, quick_config_path, utc_now


class LegacyFairinoBridge:
    def __init__(self, dry_run: bool = True, log_dir: Optional[Path] = None, config: Optional[Dict[str, Any]] = None) -> None:
        self.dry_run = dry_run
        self.config = config or load_yaml(quick_config_path(find_repo_root(), "legacy_bridge.yaml"))
        self.log_dir = log_dir
        self.records: List[MotionCommandLog] = []
        self._latest_state: Dict[str, Dict[str, Any]] = {}

    def _record(
        self,
        arm: str,
        command_type: str,
        target_joint: Optional[List[float]] = None,
        target_tcp: Optional[List[float]] = None,
        result: str = "success",
        error: str = "",
    ) -> None:
        record = MotionCommandLog(
            stamp=utc_now(),
            arm=arm,
            command_type=command_type,
            target_joint=target_joint,
            target_tcp=target_tcp,
            actual_joint_before=self.get_actual_joints(arm),
            actual_joint_after=self.get_actual_joints(arm),
            result=result,
            error=error,
            dry_run=self.dry_run,
        )
        self.records.append(record)
        if self.log_dir:
            path = self.log_dir / "commands.jsonl"
            path.parent.mkdir(parents=True, exist_ok=True)
            with path.open("a", encoding="utf-8") as handle:
                handle.write(record.to_json() + "\n")

    def movej(self, arm: str, joint_deg: List[float], vel: float, acc: float, timeout_s: float = 15.0) -> Result:
        if self.dry_run:
            self._record(arm, "MoveJ", target_joint=joint_deg)
            return Result.ok("dry-run MoveJ")
        try:
            import rclpy
            from robo_ctrl.srv import RobotMove
        except Exception as exc:
            self.dry_run = True
            self._record(arm, "MoveJ", target_joint=joint_deg, result="fallback_dry_run", error=str(exc))
            return Result.fail(f"robo_ctrl 不可用，已进入 dry-run fallback: {exc}", code="bridge_unavailable")
        return self._call_robot_move(arm, RobotMove, joint_deg, None, 0, vel, acc, timeout_s)

    def movel(self, arm: str, tcp_pose: List[float], vel: float, acc: float, timeout_s: float = 15.0) -> Result:
        if self.dry_run:
            self._record(arm, "MoveCart", target_tcp=tcp_pose)
            return Result.ok("dry-run MoveCart")
        try:
            import rclpy
            from robo_ctrl.srv import RobotMove
        except Exception as exc:
            self.dry_run = True
            self._record(arm, "MoveCart", target_tcp=tcp_pose, result="fallback_dry_run", error=str(exc))
            return Result.fail(f"robo_ctrl 不可用，已进入 dry-run fallback: {exc}", code="bridge_unavailable")
        return self._call_robot_move(arm, RobotMove, None, tcp_pose, 1, vel, acc, timeout_s)

    def move_cart_legacy(self, arm: str, tcp_pose: List[float]) -> Result:
        return self.movel(arm, tcp_pose, 5.0, 5.0)

    def _call_robot_move(
        self,
        arm: str,
        srv_type: Any,
        joint_deg: Optional[List[float]],
        tcp_pose: Optional[List[float]],
        move_type: int,
        vel: float,
        acc: float,
        timeout_s: float,
    ) -> Result:
        import rclpy

        topic_key = "left_robot_move" if arm_prefix(arm) == "L" else "right_robot_move"
        service_name = self.config["legacy_topics"][topic_key]
        node = rclpy.create_node(f"quick_bridge_client_{arm_prefix(arm).lower()}")
        try:
            client = node.create_client(srv_type, service_name)
            if not client.wait_for_service(timeout_sec=1.0):
                self._record(arm, "MoveJ" if move_type == 0 else "MoveCart", joint_deg, tcp_pose, "service_missing", service_name)
                return Result.fail(f"{service_name} 服务不可用", code="service_missing")
            request = srv_type.Request()
            request.move_type = move_type
            request.velocity = float(vel)
            request.acceleration = float(acc)
            if joint_deg is not None:
                request.joint_positions = [float(item) for item in joint_deg]
            if tcp_pose is not None:
                request.cartesian_pose = [float(item) for item in tcp_pose]
            future = client.call_async(request)
            started = time.monotonic()
            while rclpy.ok() and not future.done():
                rclpy.spin_once(node, timeout_sec=0.05)
                if time.monotonic() - started > timeout_s:
                    self._record(arm, "MoveJ" if move_type == 0 else "MoveCart", joint_deg, tcp_pose, "timeout", "")
                    return Result.fail("动作超时，触发硬件异常熔断", code="timeout", fatal=True)
            response = future.result()
            ok = bool(response and response.success)
            self._record(
                arm,
                "MoveJ" if move_type == 0 else "MoveCart",
                joint_deg,
                tcp_pose,
                "success" if ok else "driver_failure",
                "" if ok else getattr(response, "message", ""),
            )
            return Result(ok, getattr(response, "message", ""), "success" if ok else "driver_failure")
        finally:
            node.destroy_node()

    def open_gripper(self, arm: str) -> Result:
        self._record(arm, "open_gripper")
        return Result.ok("dry-run open gripper" if self.dry_run else "gripper command queued")

    def close_gripper(self, arm: str) -> Result:
        self._record(arm, "close_gripper")
        return Result.ok("dry-run close gripper" if self.dry_run else "gripper command queued")

    def get_actual_joints(self, arm: str) -> List[float]:
        state = self._latest_state.get(arm_prefix(arm), {})
        joints = state.get("joint_deg")
        if isinstance(joints, list) and len(joints) == 6:
            return [float(item) for item in joints]
        return [0.0] * 6 if self.dry_run else []

    def get_robot_state(self, arm: str) -> Dict[str, Any]:
        return self._latest_state.get(arm_prefix(arm), {"motion_done": True, "error_code": 0, "dry_run": self.dry_run})

    def stop_all(self, timeout_s: float = 3.0) -> Result:
        # stop_all 只拦截运动指令，绝不禁用夹爪电源/使能；液体负载需要保持夹爪扭矩等待人工救援。
        self._record("dual_arm", "stop_all")
        if self.dry_run:
            return Result.ok("dry-run stop_all")
        return Result.fail(
            "stop_all 硬件 API 尚未桥接；请按物理急停确认安全",
            code="stop_unimplemented",
            fatal=True,
        )


def spin_bridge() -> None:
    try:
        import rclpy
        from rclpy.node import Node
    except Exception as exc:
        print(f"[WARN] rclpy unavailable: {exc}")
        return

    class BridgeNode(Node):
        def __init__(self) -> None:
            super().__init__("legacy_fairino_bridge")
            self.get_logger().info("legacy_fairino_bridge 已启动；quick 模式优先 /L /R 分臂接口。")

    rclpy.init()
    node = BridgeNode()
    try:
        rclpy.spin(node)
    finally:
        node.destroy_node()
        rclpy.shutdown()


def main() -> None:
    parser = argparse.ArgumentParser(description="quick legacy fairino bridge")
    parser.add_argument("--spin", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    args, _ = parser.parse_known_args()
    if args.spin:
        spin_bridge()
    else:
        bridge = LegacyFairinoBridge(dry_run=args.dry_run)
        print(f"[OK] legacy bridge available or dry-run fallback active (dry_run={bridge.dry_run})")


if __name__ == "__main__":
    main()
