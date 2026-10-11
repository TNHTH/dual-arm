from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List

from .quick_scene_provider import QuickSceneProvider


@dataclass(frozen=True)
class CollisionSpec:
    object_id: str
    shape_type: str
    pose_table: List[float]
    size_m: List[float]


class QuickCollisionSceneBuilder:
    """quick computed 模式的静态场景构建器。

    本轮 quick 默认不启动正式 planning_scene_sync，避免两个节点同时写 PlanningScene。
    preflight 只静态构建初始 table/objects/basket；执行阶段 attach/detach 由 quick executor
    或正式 sim/hardware execution path 的动态接口维护。
    """

    def __init__(self, scene: QuickSceneProvider | None = None) -> None:
        self.scene = scene or QuickSceneProvider()

    def build_static_specs(self) -> List[CollisionSpec]:
        specs: List[CollisionSpec] = []
        for object_id, raw in (self.scene.objects.get("objects") or {}).items():
            if raw.get("enabled") is False:
                continue
            pose = raw.get("pose")
            size = raw.get("size_m")
            if not isinstance(pose, list) or len(pose) < 3 or not isinstance(size, list) or len(size) < 3:
                continue
            specs.append(
                CollisionSpec(
                    object_id=str(object_id),
                    shape_type=self._shape_for(str(object_id)),
                    pose_table=[float(value) for value in pose[:7]],
                    size_m=[float(value) for value in size[:3]],
                )
            )
        return specs

    def preflight_build(self) -> Dict[str, object]:
        specs = self.build_static_specs()
        return {
            "success": bool(specs),
            "count": len(specs),
            "objects": [spec.object_id for spec in specs],
            "mode": "quick_direct_planning_scene_specs",
        }

    def _shape_for(self, object_id: str) -> str:
        if "bottle" in object_id or "cup" in object_id:
            return "cylinder"
        if "ball" in object_id:
            return "sphere"
        return "box"


def main() -> None:
    builder = QuickCollisionSceneBuilder()
    print(builder.preflight_build())


if __name__ == "__main__":
    main()
