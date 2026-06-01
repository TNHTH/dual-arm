from __future__ import annotations

from typing import Any, Dict, List

from .quick_types import find_repo_root, load_yaml, quick_config_path


class QuickGraspTemplateLibrary:
    def __init__(self) -> None:
        self.repo_root = find_repo_root()
        self.config = load_yaml(quick_config_path(self.repo_root, "quick_grasp_templates.yaml"))

    def template(self, object_kind: str) -> Dict[str, Any]:
        templates = self.config.get("grasp_templates", {})
        if object_kind not in templates:
            raise KeyError(f"缺少 grasp template: {object_kind}")
        return templates[object_kind]

    def required_anchor_waypoints(self, scene_source_override: str) -> Dict[str, List[str]]:
        anchors = self.config.get("required_anchor_waypoints", {})
        result = {
            "left_arm": list(anchors.get("left_arm", [])),
            "right_arm": list(anchors.get("right_arm", [])),
        }
        observe_sources = set(anchors.get("observe_table_required_for_scene_sources", []))
        if scene_source_override in observe_sources:
            result["left_arm"].append("observe_table")
            result["right_arm"].append("observe_table")
        return result


def main() -> None:
    library = QuickGraspTemplateLibrary()
    print("[OK] quick grasp templates loaded")
    print(sorted((library.config.get("grasp_templates") or {}).keys()))


if __name__ == "__main__":
    main()
