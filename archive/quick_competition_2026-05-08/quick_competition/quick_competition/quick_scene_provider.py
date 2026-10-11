from __future__ import annotations

import argparse
from typing import Dict, Optional

from .quick_types import find_repo_root, load_yaml, quick_config_path


class QuickSceneProvider:
    def __init__(self, scene_source_override: str = "manual") -> None:
        self.repo_root = find_repo_root()
        self.profile = load_yaml(quick_config_path(self.repo_root, "quick_profile.yaml"))
        self.objects = load_yaml(quick_config_path(self.repo_root, "quick_objects.yaml"))
        self.scene_source_override = scene_source_override or self.profile.get("scene_source_override", "manual")

    def get_object(self, name: str) -> Optional[Dict[str, object]]:
        if self.scene_source_override == "manual":
            raw = (self.objects.get("objects") or {}).get(name)
            if not raw or raw.get("enabled") is False:
                return None
            return {
                "name": name,
                "frame": self.objects.get("frame", "table_frame"),
                "pose": raw.get("pose"),
                "confidence": raw.get("confidence", 0.5),
                "source": "manual",
                "stable": True,
                "size_m": raw.get("size_m"),
                "grasp_height_ratio": raw.get("grasp_height_ratio"),
            }
        # depth/scene_fusion 的真实订阅留给后续硬件联调；quick v1 不在 manual 模式偷偷修正。
        return None


def spin_scene_provider() -> None:
    try:
        import rclpy
        from rclpy.node import Node
    except Exception as exc:
        print(f"[WARN] rclpy unavailable: {exc}")
        return

    class SceneNode(Node):
        def __init__(self) -> None:
            super().__init__("quick_scene_provider")
            self.get_logger().info("quick_scene_provider 已启动；manual 模式只读取 quick_objects.yaml。")

    rclpy.init()
    node = SceneNode()
    try:
        rclpy.spin(node)
    finally:
        node.destroy_node()
        rclpy.shutdown()


def main() -> None:
    parser = argparse.ArgumentParser(description="quick scene provider")
    parser.add_argument("--object", default="")
    parser.add_argument("--spin", action="store_true")
    args, _ = parser.parse_known_args()
    if args.spin:
        spin_scene_provider()
    elif args.object:
        print(QuickSceneProvider().get_object(args.object))
    else:
        print("[OK] quick_scene_provider ready")


if __name__ == "__main__":
    main()
