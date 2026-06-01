from __future__ import annotations

import argparse
import time
from typing import List, Optional

from .quick_types import find_repo_root, load_yaml, normalize_arm, quick_config_path, save_yaml, utc_now


def _arm_topic(arm: str) -> str:
    return "/L/robot_state" if normalize_arm(arm) == "left_arm" else "/R/robot_state"


def read_robot_state_once(arm: str, timeout_s: float = 2.0) -> Optional[dict]:
    try:
        import rclpy
        from robo_ctrl.msg import RobotState
    except Exception:
        return None
    result = {"message": None}

    def callback(msg):
        result["message"] = msg

    started_rclpy = False
    if not rclpy.ok():
        rclpy.init()
        started_rclpy = True
    node = rclpy.create_node(f"quick_waypoint_recorder_{normalize_arm(arm)}")
    sub = node.create_subscription(RobotState, _arm_topic(arm), callback, 10)
    started = time.monotonic()
    try:
        while rclpy.ok() and result["message"] is None and time.monotonic() - started < timeout_s:
            rclpy.spin_once(node, timeout_sec=0.05)
        msg = result["message"]
        if msg is None:
            return None
        return {
            "joint_deg": [
                msg.joint_position.j1,
                msg.joint_position.j2,
                msg.joint_position.j3,
                msg.joint_position.j4,
                msg.joint_position.j5,
                msg.joint_position.j6,
            ],
            "tcp_pose_table_frame": [
                msg.tcp_pose.x,
                msg.tcp_pose.y,
                msg.tcp_pose.z,
                msg.tcp_pose.rx,
                msg.tcp_pose.ry,
                msg.tcp_pose.rz,
            ],
        }
    finally:
        node.destroy_subscription(sub)
        node.destroy_node()
        if started_rclpy:
            rclpy.shutdown()


def record_waypoint(arm: str, name: str, dry_run: bool = False) -> None:
    repo_root = find_repo_root()
    path = quick_config_path(repo_root, "quick_waypoints.yaml")
    config = load_yaml(path)
    arm_key = normalize_arm(arm)
    state = None if dry_run else read_robot_state_once(arm_key)
    if state is None:
        if not dry_run:
            raise RuntimeError(f"未能读取 {_arm_topic(arm_key)}；禁止用目标关节角代替实际反馈")
        state = {"joint_deg": [0.0] * 6, "tcp_pose_table_frame": [0.0] * 6}
    entry = {
        "primary": {
            "joint_deg": [float(item) for item in state["joint_deg"]],
            "tcp_pose_table_frame": [float(item) for item in state["tcp_pose_table_frame"]],
            "source": "actual_robot_feedback" if not dry_run else "dry_run_placeholder",
            "created_at": utc_now(),
            "verified": not dry_run,
            "keep_orientation_upright": False,
            "payload_state": "EMPTY_GRIPPER",
            "safe_release_strategy": "none",
        },
        "fallback": [],
    }
    config.setdefault(arm_key, {})[name] = entry
    save_yaml(path, config)
    print(f"[OK] recorded waypoint {arm_key}.{name} source={entry['primary']['source']}")


def main() -> None:
    parser = argparse.ArgumentParser(description="quick waypoint recorder")
    parser.add_argument("--arm", required=True, choices=["left", "right", "left_arm", "right_arm"])
    parser.add_argument("--name", required=True)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    record_waypoint(args.arm, args.name, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
