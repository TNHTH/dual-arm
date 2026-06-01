from __future__ import annotations

import argparse
import time
from pathlib import Path
from typing import Any, Dict, List, Optional

from .quick_types import (
    MotionCommandLog,
    Result,
    arm_prefix,
    find_repo_root,
    load_yaml,
    quick_config_path,
    service_arm_key,
    utc_now,
)


class LegacyFairinoBridge:
    def __init__(self, dry_run: bool = True, log_dir: Optional[Path] = None, config: Optional[Dict[str, Any]] = None) -> None:
        self.dry_run = dry_run
        self.config = config or load_yaml(quick_config_path(find_repo_root(), "legacy_bridge.yaml"))
        self.log_dir = log_dir
        self.records: List[MotionCommandLog] = []
        self._latest_state: Dict[str, Dict[str, Any]] = {}
        self._motion_blocked = False
        self._motion_block_reason = ""

    def _reject_if_blocked(self, arm: str, command_type: str) -> Optional[Result]:
        if not self._motion_blocked:
            return None
        self._record(arm, command_type, result="motion_blocked", error=self._motion_block_reason)
        return Result.fail(self._motion_block_reason, code="motion_blocked", fatal=True)

    def _record(
        self,
        arm: str,
        command_type: str,
        target_joint: Optional[List[float]] = None,
        target_tcp: Optional[List[float]] = None,
        result: str = "success",
        error: str = "",
    ) -> None:
        actual_joints = [] if arm == "dual_arm" else self.get_actual_joints(arm)
        record = MotionCommandLog(
            stamp=utc_now(),
            arm=arm,
            command_type=command_type,
            target_joint=target_joint,
            target_tcp=target_tcp,
            actual_joint_before=actual_joints,
            actual_joint_after=actual_joints,
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
        blocked = self._reject_if_blocked(arm, "MoveJ")
        if blocked:
            return blocked
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
        blocked = self._reject_if_blocked(arm, "MoveCart")
        if blocked:
            return blocked
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

        started_rclpy = False
        if not rclpy.ok():
            rclpy.init(args=None)
            started_rclpy = True
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
            if started_rclpy:
                rclpy.shutdown()

    def open_gripper(self, arm: str) -> Result:
        return self._set_gripper(arm, open_gripper=True)

    def close_gripper(self, arm: str) -> Result:
        return self._set_gripper(arm, open_gripper=False)

    def _set_gripper(self, arm: str, open_gripper: bool, timeout_s: float = 2.0) -> Result:
        command_name = "open_gripper" if open_gripper else "close_gripper"
        blocked = self._reject_if_blocked(arm, command_name)
        if blocked:
            return blocked
        if self.dry_run:
            self._record(arm, command_name)
            return Result.ok(f"dry-run {command_name}")
        try:
            import rclpy
            from epg50_gripper_ros.srv import GripperCommand
        except Exception as exc:
            self._record(arm, command_name, result="service_type_missing", error=str(exc))
            return Result.fail(f"epg50_gripper_ros 不可用: {exc}", code="gripper_bridge_unavailable")

        key = service_arm_key(arm)
        gripper_cfg = (self.config.get("grippers") or {}).get(key, {})
        service_name = gripper_cfg.get("topic") or self.config.get("legacy_topics", {}).get(f"{key}_gripper_command")
        if not service_name:
            self._record(arm, command_name, result="config_missing", error="gripper topic missing")
            return Result.fail(f"{key} gripper topic 未配置", code="gripper_config_missing")

        slave_id = int(gripper_cfg.get("slave_id", 0))
        position_key = "open_position" if open_gripper else "close_position"
        position = int(gripper_cfg.get(position_key, 255 if open_gripper else 60))
        speed = int(gripper_cfg.get("speed", 80))
        torque = int(gripper_cfg.get("torque", 80))

        started_rclpy = False
        if not rclpy.ok():
            rclpy.init(args=None)
            started_rclpy = True
        node = rclpy.create_node(f"quick_gripper_client_{key}")
        try:
            client = node.create_client(GripperCommand, service_name)
            if not client.wait_for_service(timeout_sec=1.0):
                self._record(arm, command_name, result="service_missing", error=service_name)
                return Result.fail(f"{service_name} 服务不可用", code="gripper_service_missing")

            enable = self._call_gripper_request(
                node=node,
                client=client,
                srv_type=GripperCommand,
                slave_id=slave_id,
                command=1,
                position=position,
                speed=speed,
                torque=torque,
                timeout_s=timeout_s,
            )
            if not enable.success:
                self._record(arm, command_name, result=enable.code, error=enable.message)
                return enable

            move = self._call_gripper_request(
                node=node,
                client=client,
                srv_type=GripperCommand,
                slave_id=slave_id,
                command=2,
                position=position,
                speed=speed,
                torque=torque,
                timeout_s=timeout_s,
            )
            self._record(arm, command_name, result="success" if move.success else move.code, error="" if move.success else move.message)
            if not move.success:
                return move
            return Result.ok(f"{command_name} executed", service=service_name, slave_id=slave_id, position=position)
        finally:
            node.destroy_node()
            if started_rclpy:
                rclpy.shutdown()

    @staticmethod
    def _call_gripper_request(
        node: Any,
        client: Any,
        srv_type: Any,
        slave_id: int,
        command: int,
        position: int,
        speed: int,
        torque: int,
        timeout_s: float,
    ) -> Result:
        import rclpy

        request = srv_type.Request()
        request.slave_id = int(slave_id)
        request.command = int(command)
        request.position = int(position)
        request.speed = int(speed)
        request.torque = int(torque)
        future = client.call_async(request)
        started = time.monotonic()
        while rclpy.ok() and not future.done():
            rclpy.spin_once(node, timeout_sec=0.05)
            if time.monotonic() - started > timeout_s:
                return Result.fail("夹爪命令超时", code="gripper_timeout")
        response = future.result()
        if not response or not bool(response.success):
            return Result.fail(getattr(response, "message", "夹爪命令失败"), code="gripper_driver_failure")
        return Result.ok(getattr(response, "message", "gripper OK"))

    def get_actual_joints(self, arm: str) -> List[float]:
        state = self._latest_state.get(arm_prefix(arm), {})
        joints = state.get("joint_deg")
        if isinstance(joints, list) and len(joints) == 6:
            return [float(item) for item in joints]
        return [0.0] * 6 if self.dry_run else []

    def get_robot_state(self, arm: str) -> Dict[str, Any]:
        return self._latest_state.get(arm_prefix(arm), {"motion_done": True, "error_code": 0, "dry_run": self.dry_run})

    def stop_all(self, timeout_s: float = 3.0) -> Result:
        # stop_all 不主动禁用夹爪电源/使能；fail-closed 后拒绝后续软件运动/夹爪动作，保持当前扭矩等待人工救援。
        self._record("dual_arm", "stop_all")
        if self.dry_run:
            return Result.ok("dry-run stop_all")
        # fail-closed：当前 quick bridge 没有通用 StopMotion/abort 服务可确认，因此立即拒绝后续运动/夹爪动作。
        self._motion_blocked = True
        self._motion_block_reason = (
            "stop_all fail-closed: 当前接口缺少已验证的通用 StopMotion/abort 路径；"
            "已拒绝后续运动指令，请人工按物理急停并接管"
        )
        servo_stop = self._best_effort_servo_stop(timeout_s)
        return Result.fail(
            self._motion_block_reason,
            code="stop_general_stop_unavailable",
            fatal=True,
            servo_stop=servo_stop.message,
        )

    def _best_effort_servo_stop(self, timeout_s: float) -> Result:
        try:
            import rclpy
            from robo_ctrl.srv import RobotServo, RobotServoJoint, RobotServoLine
        except Exception as exc:
            return Result.fail(f"servo-stop 服务类型不可用: {exc}", code="servo_stop_type_missing")

        started_rclpy = False
        if not rclpy.ok():
            rclpy.init(args=None)
            started_rclpy = True
        node = rclpy.create_node("quick_bridge_stop_all_client")
        attempts: List[str] = []
        try:
            services = [
                (RobotServoLine, "/L/robot_servo_line"),
                (RobotServoLine, "/R/robot_servo_line"),
                (RobotServoJoint, "/L/robot_servo_joint"),
                (RobotServoJoint, "/R/robot_servo_joint"),
                (RobotServo, "/L/robot_servo"),
                (RobotServo, "/R/robot_servo"),
            ]
            for srv_type, service_name in services:
                result = self._call_stop_request(node, srv_type, service_name, timeout_s=min(timeout_s, 0.5))
                attempts.append(f"{service_name}:{result.code}")
            if all(item.endswith(":success") for item in attempts):
                return Result.ok("best-effort servo-stop sent", attempts=attempts)
            return Result.fail("best-effort servo-stop 未全部确认", code="servo_stop_partial", attempts=attempts)
        finally:
            node.destroy_node()
            if started_rclpy:
                rclpy.shutdown()

    @staticmethod
    def _call_stop_request(node: Any, srv_type: Any, service_name: str, timeout_s: float) -> Result:
        import rclpy

        client = node.create_client(srv_type, service_name)
        if not client.wait_for_service(timeout_sec=timeout_s):
            return Result.fail("stop service missing", code="service_missing")
        request = srv_type.Request()
        request.command_type = 1
        future = client.call_async(request)
        started = time.monotonic()
        while rclpy.ok() and not future.done():
            rclpy.spin_once(node, timeout_sec=0.05)
            if time.monotonic() - started > timeout_s:
                return Result.fail("stop service timeout", code="timeout")
        response = future.result()
        if response and bool(response.success):
            return Result.ok(getattr(response, "message", "stop OK"))
        return Result.fail(getattr(response, "message", "stop failed"), code="driver_failure")


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

    started_rclpy = False
    if not rclpy.ok():
        rclpy.init()
        started_rclpy = True
    node = BridgeNode()
    try:
        rclpy.spin(node)
    finally:
        node.destroy_node()
        if started_rclpy:
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
