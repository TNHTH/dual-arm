#!/usr/bin/python3

from __future__ import annotations

import sys

import rclpy

from single_arm_pick_debug import SingleArmPickDebug


def _ensure_ros_param(args: list[str], name: str, value: str) -> list[str]:
    marker = f"{name}:="
    if any(marker in arg for arg in args):
        return args
    if "--ros-args" not in args:
        args = list(args) + ["--ros-args"]
    return list(args) + ["-p", f"{name}:={value}"]


def main() -> None:
    args = list(sys.argv)
    args = _ensure_ros_param(args, "allow_raw_scene_fallback", "false")
    args = _ensure_ros_param(args, "allow_cartesian_fallback", "false")
    args = _ensure_ros_param(args, "require_world_tf", "true")
    rclpy.init(args=args)
    node = SingleArmPickDebug()
    try:
        exit_code = node.run()
    finally:
        node.destroy_node()
        rclpy.shutdown()
    raise SystemExit(exit_code)


if __name__ == "__main__":
    main()
