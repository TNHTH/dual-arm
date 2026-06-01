from __future__ import annotations

from dataclasses import dataclass
import math
from typing import Dict, Iterable, List, Tuple

from .quick_grasp_template_library import QuickGraspTemplateLibrary
from .quick_scene_provider import QuickSceneProvider


@dataclass(frozen=True)
class GeneratedPose:
    step_id: str
    arm: str
    object_id: str
    pose_table: List[float]
    payload_state: str = "EMPTY_GRIPPER"
    keep_orientation_upright: bool = False
    source: str = "computed_templates"
    score_hint: float = 0.0


DIRS: Dict[str, Tuple[float, float]] = {
    "+x": (1.0, 0.0),
    "-x": (-1.0, 0.0),
    "+y": (0.0, 1.0),
    "-y": (0.0, -1.0),
}


class QuickTaskPoseGenerator:
    def __init__(self, scene: QuickSceneProvider | None = None, templates: QuickGraspTemplateLibrary | None = None) -> None:
        self.scene = scene or QuickSceneProvider()
        self.templates = templates or QuickGraspTemplateLibrary()

    def generate_for_step(self, step_id: str, object_id: str = "") -> List[GeneratedPose]:
        if step_id.startswith("ball_"):
            ball_id = object_id or ("basketball" if "left" in step_id or "right" in step_id else "basketball")
            return self._ball_step(step_id, ball_id)
        if step_id.startswith("bottle_") or step_id == "pregrasp_bottle":
            return self._bottle_step(step_id, object_id or "water_bottle")
        if step_id.startswith("cup_") or step_id == "pregrasp_cup":
            return self._cup_step(step_id, object_id or "cup_1")
        return []

    def generate_task(self, task: str) -> Dict[str, List[GeneratedPose]]:
        if task == "pouring":
            return {
                "pregrasp_cup": self._cup_step("pregrasp_cup", "cup_1"),
                "cup_lift": self._cup_step("cup_lift", "cup_1"),
                "cup_pour_hold": self._cup_step("cup_pour_hold", "cup_1"),
                "cup_place": self._cup_step("cup_place", "cup_1"),
                "pregrasp_bottle": self._bottle_step("pregrasp_bottle", "water_bottle"),
                "bottle_lift": self._bottle_step("bottle_lift", "water_bottle"),
                "bottle_pour_above_cup": self._bottle_step("bottle_pour_above_cup", "water_bottle"),
                "bottle_pour_tilt": self._bottle_step("bottle_pour_tilt", "water_bottle"),
                "bottle_upright_after_pour": self._bottle_step("bottle_upright_after_pour", "water_bottle"),
                "bottle_place": self._bottle_step("bottle_place", "water_bottle"),
            }
        if task == "handover":
            return {
                "ball_left_pre_cage": self._ball_step("ball_left_pre_cage", "basketball"),
                "ball_right_pre_cage": self._ball_step("ball_right_pre_cage", "basketball"),
                "ball_left_cage": self._ball_step("ball_left_cage", "basketball"),
                "ball_right_cage": self._ball_step("ball_right_cage", "basketball"),
                "ball_left_lift": self._ball_step("ball_left_lift", "basketball"),
                "ball_right_lift": self._ball_step("ball_right_lift", "basketball"),
                "ball_left_basket_top": self._ball_step("ball_left_basket_top", "basketball"),
                "ball_right_basket_top": self._ball_step("ball_right_basket_top", "basketball"),
                "ball_left_release_retreat": self._ball_step("ball_left_release_retreat", "basketball"),
                "ball_right_release_retreat": self._ball_step("ball_right_release_retreat", "basketball"),
            }
        return {}

    def _cup_step(self, step_id: str, object_id: str) -> List[GeneratedPose]:
        obj = self._object_required(object_id)
        template = self.templates.template("cup")
        center = self._center(obj)
        size = self._size(obj, template["default_radius_m"] * 2.0, template["default_height_m"])
        grip_z = center[2] + size[2] * (float(template["grip_height_ratio"]) - 0.5)
        poses: List[GeneratedPose] = []
        for direction in template.get("approach_dirs_table", ["+x"]):
            dx, dy = DIRS[direction]
            grasp = [center[0] + dx * (size[0] * 0.5 + float(template["grasp_distance_m"])), center[1] + dy * (size[1] * 0.5 + float(template["grasp_distance_m"])), grip_z, 180.0, 0.0, self._yaw_for_direction(dx, dy)]
            if step_id == "pregrasp_cup":
                pose = [grasp[0] + dx * float(template["pregrasp_distance_m"]), grasp[1] + dy * float(template["pregrasp_distance_m"]), grasp[2], *grasp[3:]]
            elif step_id == "cup_lift":
                pose = [grasp[0], grasp[1], grasp[2] + float(template["lift_height_m"]), *grasp[3:]]
            elif step_id == "cup_pour_hold":
                pose = [center[0], center[1], center[2] + float(template["hold_above_table_m"]), 180.0, 0.0, 0.0]
            elif step_id == "cup_place":
                pose = [center[0], center[1], grip_z, *grasp[3:]]
            else:
                pose = grasp
            poses.append(GeneratedPose(step_id, "left_arm", object_id, pose, "LIQUID_CONTAINER", True))
        return poses

    def _bottle_step(self, step_id: str, object_id: str) -> List[GeneratedPose]:
        obj = self._object_required(object_id)
        cup = self.scene.get_object("cup_1") or self.scene.get_object("cup_2")
        template = self.templates.template("bottle")
        center = self._center(obj)
        size = self._size(obj, template["default_radius_m"] * 2.0, template["default_height_m"])
        grip_z = center[2] + size[2] * (float(template["grip_height_ratio"]) - 0.5)
        cup_center = self._center(cup) if cup else [center[0] + 0.15, center[1], center[2]]
        poses: List[GeneratedPose] = []
        for direction in template.get("approach_dirs_table", ["+x"]):
            dx, dy = DIRS[direction]
            grasp = [center[0] + dx * (size[0] * 0.5 + float(template["grasp_distance_m"])), center[1] + dy * (size[1] * 0.5 + float(template["grasp_distance_m"])), grip_z, 180.0, 0.0, self._yaw_for_direction(dx, dy)]
            if step_id == "pregrasp_bottle":
                pose = [grasp[0] + dx * float(template["pregrasp_distance_m"]), grasp[1] + dy * float(template["pregrasp_distance_m"]), grasp[2], *grasp[3:]]
            elif step_id == "bottle_lift":
                pose = [grasp[0], grasp[1], grasp[2] + float(template["lift_height_m"]), *grasp[3:]]
            elif step_id in {"bottle_pour_above_cup", "bottle_upright_after_pour"}:
                offset = template.get("pour_offset_xy_m", [0.05, 0.0])
                pose = [cup_center[0] + float(offset[0]), cup_center[1] + float(offset[1]), cup_center[2] + float(template["pour_height_above_cup_m"]), 180.0, 0.0, 0.0]
            elif step_id == "bottle_pour_tilt":
                offset = template.get("pour_offset_xy_m", [0.05, 0.0])
                pose = [cup_center[0] + float(offset[0]), cup_center[1] + float(offset[1]), cup_center[2] + float(template["pour_height_above_cup_m"]), 180.0, float(template["tilt_pitch_deg"]), 0.0]
            elif step_id == "bottle_place":
                pose = [center[0], center[1], grip_z, *grasp[3:]]
            else:
                pose = grasp
            poses.append(GeneratedPose(step_id, "right_arm", object_id, pose, "LIQUID_CONTAINER", True))
        return poses

    def _ball_step(self, step_id: str, object_id: str) -> List[GeneratedPose]:
        ball = self._object_required(object_id)
        basket = self.scene.get_object("basket")
        template = self.templates.template("ball")
        basket_template = self.templates.template("basket")
        center = self._center(ball)
        radius = self._size(ball, template["default_radius_m"] * 2.0, template["default_radius_m"] * 2.0)[0] * 0.5
        cage_half = float(template["cage_spacing_m"]) * 0.5
        side = 1.0 if "_left_" in step_id else -1.0
        arm = "left_arm" if "_left_" in step_id else "right_arm"
        base = [center[0], center[1] + side * cage_half, center[2], 180.0, 0.0, -90.0 if arm == "left_arm" else 90.0]
        if "pre_cage" in step_id:
            base[1] += side * radius
        elif "lift" in step_id:
            base[2] += float(template["lift_height_m"])
        elif "basket_top" in step_id or "release_retreat" in step_id:
            basket_center = self._center(basket) if basket else [center[0] + 0.20, 0.0, center[2]]
            release_z = basket_center[2] + float(basket_template["release_height_above_basket_m"])
            base = [basket_center[0], basket_center[1] + side * cage_half, release_z, 180.0, 0.0, -90.0 if arm == "left_arm" else 90.0]
            if "release_retreat" in step_id:
                base[1] += side * float(template["release_retreat_m"])
        return [GeneratedPose(step_id, arm, object_id, base, "BALL", False)]

    def _object_required(self, object_id: str) -> Dict[str, object]:
        obj = self.scene.get_object(object_id)
        if obj is None:
            raise KeyError(f"缺少对象 pose: {object_id}")
        return obj

    def _center(self, obj: Dict[str, object]) -> List[float]:
        pose = obj.get("pose")
        if not isinstance(pose, list) or len(pose) < 3:
            raise ValueError(f"{obj.get('name', '')} pose 无效")
        return [float(pose[0]), float(pose[1]), float(pose[2])]

    def _size(self, obj: Dict[str, object], default_width: float, default_height: float) -> List[float]:
        size = obj.get("size_m")
        if isinstance(size, list) and len(size) >= 3:
            return [float(size[0]), float(size[1]), float(size[2])]
        return [default_width, default_width, default_height]

    def _yaw_for_direction(self, dx: float, dy: float) -> float:
        return math.degrees(math.atan2(dy, dx))


def main() -> None:
    generator = QuickTaskPoseGenerator()
    generated = generator.generate_task("pouring")
    print("[OK] generated quick task poses")
    print({key: len(value) for key, value in generated.items()})


if __name__ == "__main__":
    main()
