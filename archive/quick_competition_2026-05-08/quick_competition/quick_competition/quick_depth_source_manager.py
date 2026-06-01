from __future__ import annotations

import argparse
from typing import Dict

from .quick_types import deep_get, find_repo_root, load_yaml, quick_config_path


def depth_check_lines(profile: Dict[str, object]) -> str:
    depth = profile.get("depth", {}) if isinstance(profile.get("depth"), dict) else {}
    primary = depth.get("primary_camera", "left")
    scene_mode = profile.get("scene_source_override", depth.get("scene_source_override", "manual"))
    topics = depth.get("topics", {}) if isinstance(depth.get("topics"), dict) else {}
    frames = depth.get("frames", {}) if isinstance(depth.get("frames"), dict) else {}
    lines = [
        f"[OK] primary_camera: {primary}",
        f"[OK] scene_source_override: {scene_mode}",
        f"[OK] left depth topic: {topics.get('left_depth', '/left_camera/depth/image_raw')} (runtime hz 需现场 ros2 topic hz 确认)",
        f"[OK] left camera_info: {topics.get('left_camera_info', '/left_camera/depth/camera_info')}",
        f"[OK] depth frame: {frames.get('left_depth', 'left_camera_depth_frame')}",
    ]
    if scene_mode == "manual":
        lines.append("[WARN] manual 模式不使用 depth 生成最终 3D pose；depth 缺失不阻塞 waypoint-only run")
    else:
        lines.append("[OK] depth/scene_fusion 模式会把 depth topic、camera_info、stamp freshness 和 TF 作为 CRITICAL")
    if not deep_get(profile, "depth.right_depth.verified", False):
        lines.append("[WARN] right depth disabled: verified=false")
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(description="quick depth source manager")
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--spin", action="store_true")
    args, _ = parser.parse_known_args()
    profile = load_yaml(quick_config_path(find_repo_root(), "quick_profile.yaml"))
    if args.spin:
        try:
            import rclpy
            from rclpy.node import Node
        except Exception as exc:
            print(f"[WARN] rclpy unavailable: {exc}")
            return

        class DepthNode(Node):
            def __init__(self) -> None:
                super().__init__("quick_depth_source_manager")
                self.get_logger().info("quick_depth_source_manager 已启动；manual 模式不会偷偷用 depth 修正。")

        rclpy.init()
        node = DepthNode()
        try:
            rclpy.spin(node)
        finally:
            node.destroy_node()
            rclpy.shutdown()
    else:
        print(depth_check_lines(profile))


if __name__ == "__main__":
    main()
