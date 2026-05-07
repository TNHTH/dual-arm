from __future__ import annotations

import argparse
from dataclasses import asdict, dataclass, field
from typing import Any, Dict, Iterable, List, Optional, Sequence, Tuple

from .quick_collision_scene_builder import CollisionSpec, QuickCollisionSceneBuilder
from .quick_grasp_template_library import QuickGraspTemplateLibrary
from .quick_ik_planner import QuickIKPlanner
from .quick_motion_executor import QuickMotionExecutor
from .quick_scene_provider import QuickSceneProvider
from .quick_task_pose_generator import QuickTaskPoseGenerator
from .quick_types import Result, find_repo_root, load_yaml, quick_config_path


@dataclass(frozen=True)
class ComputedStepSpec:
    task: str
    arm: str
    step_id: str
    object_ids: Tuple[str, ...] = ()
    computed_required: bool = True


@dataclass
class ComputedStepEvidence:
    task: str
    arm: str
    step_id: str
    object_ids: List[str] = field(default_factory=list)
    computed_ok: bool = False
    fallback_ok: bool = False
    passed: bool = False
    message: str = ""
    key: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class QuickComputedMotionExecutor:
    """quick computed-template preflight 与运行期解缓存。

    该类只在 preflight 阶段生成和验证 computed pose；运行期 executor 只消费
    `solutions` 字典，找不到 preflight 解时不得现场首次 IK。
    """

    REQUIRED_TEMPLATE_KEYS = {
        "pouring": ("bottle", "cup"),
        "handover": ("ball", "basket"),
    }

    def __init__(self) -> None:
        self.repo_root = find_repo_root()
        self.profile = load_yaml(quick_config_path(self.repo_root, "quick_profile.yaml"))
        self.template_config = load_yaml(quick_config_path(self.repo_root, "quick_grasp_templates.yaml"))
        self.computed_config = self.template_config.get("computed_templates", {})
        self.require_moveit_service = bool(self.computed_config.get("require_moveit_service", True))
        self.scene = QuickSceneProvider(scene_source_override=self.profile.get("scene_source_override", "manual"))
        self.templates = QuickGraspTemplateLibrary()
        self.generator = QuickTaskPoseGenerator(scene=self.scene, templates=self.templates)
        self.ik_planner = QuickIKPlanner()
        self.scene_builder = QuickCollisionSceneBuilder(scene=self.scene)

    def evaluate(
        self,
        tasks: Sequence[str],
        mode: str,
        motion_executor: QuickMotionExecutor,
        hardware: bool,
    ) -> Result:
        if mode not in {"computed_templates", "hybrid"}:
            return Result.fail(f"unsupported computed mode: {mode}", code="unsupported_mode")

        issues: List[str] = []
        step_evidence: List[Dict[str, Any]] = []
        skipped_tasks: List[str] = []
        solutions: Dict[str, Dict[str, Any]] = {}

        static_result = self._validate_static_inputs(tasks)
        issues.extend(static_result.data.get("issues", []))
        collision_specs = self.scene_builder.build_static_specs()

        anchor_evidence = self._evaluate_anchor_waypoints(motion_executor, hardware=hardware)
        step_evidence.extend(item.to_dict() for item in anchor_evidence)

        for task in tasks:
            task_failed = any(not item.passed for item in anchor_evidence)
            for spec in self.step_specs_for_task(task):
                evidence, step_solutions = self._evaluate_step_spec(
                    spec,
                    collision_specs=collision_specs,
                    motion_executor=motion_executor,
                    hardware=hardware,
                    allow_fallback=mode == "hybrid",
                )
                step_evidence.append(evidence.to_dict())
                solutions.update(step_solutions)
                if not evidence.passed:
                    task_failed = True
            if task_failed:
                skipped_tasks.append(task)

        passed = not issues and not skipped_tasks
        data = {
            "issues": issues,
            "step_evidence": step_evidence,
            "solutions": solutions,
            "skipped_tasks": sorted(set(skipped_tasks)),
            "collision_scene": self.scene_builder.preflight_build(),
        }
        if passed:
            return Result.ok("quick computed preflight passed", **data)
        return Result.fail("quick computed preflight failed", code="computed_preflight_failed", **data)

    def step_specs_for_task(self, task: str) -> List[ComputedStepSpec]:
        if task == "pouring":
            return [
                ComputedStepSpec(task, "left_arm", "pregrasp_cup", ("cup_1", "cup_2")),
                ComputedStepSpec(task, "left_arm", "cup_lift", ("cup_1", "cup_2")),
                ComputedStepSpec(task, "left_arm", "cup_pour_hold", ("cup_1", "cup_2")),
                ComputedStepSpec(task, "left_arm", "cup_place", ("cup_1", "cup_2")),
                ComputedStepSpec(task, "right_arm", "pregrasp_bottle", ("water_bottle", "cola_bottle")),
                ComputedStepSpec(task, "right_arm", "bottle_lift", ("water_bottle", "cola_bottle")),
                ComputedStepSpec(task, "right_arm", "bottle_pour_above_cup", ("water_bottle", "cola_bottle")),
                ComputedStepSpec(task, "right_arm", "bottle_pour_tilt", ("water_bottle", "cola_bottle")),
                ComputedStepSpec(task, "right_arm", "bottle_upright_after_pour", ("water_bottle", "cola_bottle")),
                ComputedStepSpec(task, "right_arm", "bottle_place", ("water_bottle", "cola_bottle")),
            ]
        if task == "handover":
            return [
                ComputedStepSpec(task, "left_arm", "ball_left_pre_cage", ("basketball", "soccer_ball")),
                ComputedStepSpec(task, "right_arm", "ball_right_pre_cage", ("basketball", "soccer_ball")),
                ComputedStepSpec(task, "left_arm", "ball_left_cage", ("basketball", "soccer_ball")),
                ComputedStepSpec(task, "right_arm", "ball_right_cage", ("basketball", "soccer_ball")),
                ComputedStepSpec(task, "left_arm", "ball_left_lift", ("basketball", "soccer_ball")),
                ComputedStepSpec(task, "right_arm", "ball_right_lift", ("basketball", "soccer_ball")),
                ComputedStepSpec(task, "left_arm", "ball_left_basket_top", ("basketball", "soccer_ball")),
                ComputedStepSpec(task, "right_arm", "ball_right_basket_top", ("basketball", "soccer_ball")),
                ComputedStepSpec(task, "left_arm", "ball_left_release_retreat", ("basketball", "soccer_ball")),
                ComputedStepSpec(task, "right_arm", "ball_right_release_retreat", ("basketball", "soccer_ball")),
            ]
        return []

    def _validate_static_inputs(self, tasks: Sequence[str]) -> Result:
        issues: List[str] = []
        template_keys = self.template_config.get("grasp_templates", {})
        for task in tasks:
            for key in self.REQUIRED_TEMPLATE_KEYS.get(task, ()):
                if key not in template_keys:
                    issues.append(f"缺少 grasp template: {key}")

        for object_id in self._required_object_ids(tasks):
            obj = self.scene.get_object(object_id)
            pose = obj.get("pose") if obj else None
            if not isinstance(pose, list) or len(pose) < 3:
                issues.append(f"缺少对象 pose: {object_id}")

        collision = self.scene_builder.preflight_build()
        computed_config = self.template_config.get("computed_templates", {})
        if computed_config.get("require_collision_check", True) and not collision.get("success"):
            issues.append("quick collision scene 为空，computed_templates 不能通过")

        return Result.ok("static inputs checked", issues=issues)

    def _evaluate_anchor_waypoints(self, motion_executor: QuickMotionExecutor, hardware: bool) -> List[ComputedStepEvidence]:
        scene_mode = str(self.profile.get("scene_source_override", "manual"))
        anchors = self.templates.required_anchor_waypoints(scene_mode)
        evidence: List[ComputedStepEvidence] = []
        for arm, names in anchors.items():
            for name in names:
                fallback = motion_executor.validate_waypoint_step(arm, name, hardware=hardware)
                evidence.append(
                    ComputedStepEvidence(
                        task="critical",
                        arm=arm,
                        step_id=name,
                        computed_ok=False,
                        fallback_ok=fallback.success,
                        passed=fallback.success,
                        message=fallback.message,
                        key=f"hybrid.anchor.{arm}.{name}",
                    )
                )
        return evidence

    def _evaluate_step_spec(
        self,
        spec: ComputedStepSpec,
        collision_specs: Sequence[CollisionSpec],
        motion_executor: QuickMotionExecutor,
        hardware: bool,
        allow_fallback: bool,
    ) -> Tuple[ComputedStepEvidence, Dict[str, Dict[str, Any]]]:
        step_solutions: Dict[str, Dict[str, Any]] = {}
        computed_messages: List[str] = []
        computed_ok = True
        object_ids = list(spec.object_ids) or [""]
        for object_id in object_ids:
            try:
                candidates = self.generator.generate_for_step(spec.step_id, object_id=object_id)
            except (KeyError, ValueError) as exc:
                computed_ok = False
                computed_messages.append(str(exc))
                continue
            candidates = [candidate for candidate in candidates if candidate.arm == spec.arm]
            selected = self.ik_planner.select_best(candidates, require_moveit_service=self.require_moveit_service)
            if not selected.success:
                computed_ok = False
                computed_messages.append(selected.message)
                continue
            solution = selected.data["solution"]
            collision = self._check_solution_collision(solution, collision_specs)
            if not collision.success:
                computed_ok = False
                computed_messages.append(collision.message)
                continue
            step_solutions[self.solution_key(spec.arm, spec.step_id, object_id)] = solution

        fallback = (
            motion_executor.validate_waypoint_step(spec.arm, spec.step_id, hardware=hardware, object_ids=object_ids)
            if allow_fallback
            else Result.fail("fallback disabled for computed_templates mode", code="fallback_disabled")
        )
        passed = computed_ok or (allow_fallback and fallback.success)
        message_parts = []
        if computed_ok:
            message_parts.append("computed IK/collision OK")
        else:
            message_parts.append("; ".join(computed_messages) or "computed unavailable")
        if allow_fallback:
            message_parts.append(f"fallback={'OK' if fallback.success else fallback.message}")
        return (
            ComputedStepEvidence(
                task=spec.task,
                arm=spec.arm,
                step_id=spec.step_id,
                object_ids=object_ids,
                computed_ok=computed_ok,
                fallback_ok=fallback.success,
                passed=passed,
                message="; ".join(message_parts),
                key=f"hybrid.step.{spec.arm}.{spec.step_id}",
            ),
            step_solutions if computed_ok else {},
        )

    def _check_solution_collision(self, solution: Dict[str, Any], specs: Sequence[CollisionSpec]) -> Result:
        pose = solution.get("pose_table")
        if not isinstance(pose, list) or len(pose) < 3:
            return Result.fail("computed solution 缺少 pose_table", code="computed_pose_missing")
        x, y, z = (float(pose[0]), float(pose[1]), float(pose[2]))
        if z < 0.0:
            return Result.fail(f"computed pose z={z:.3f} 低于 table frame", code="computed_pose_below_table")
        target_object = str(solution.get("object_id", ""))
        for spec in specs:
            if spec.object_id == target_object:
                continue
            if self._inside_box((x, y, z), spec):
                return Result.fail(f"computed pose 与 {spec.object_id} 静态碰撞", code="computed_collision")
        return Result.ok("computed collision check OK")

    def _inside_box(self, xyz: Tuple[float, float, float], spec: CollisionSpec) -> bool:
        px, py, pz = xyz
        ox, oy, oz = (float(spec.pose_table[0]), float(spec.pose_table[1]), float(spec.pose_table[2]))
        sx, sy, sz = (max(float(spec.size_m[0]), 0.0), max(float(spec.size_m[1]), 0.0), max(float(spec.size_m[2]), 0.0))
        if spec.shape_type == "sphere":
            radius = max(sx, sy, sz) * 0.5
            return (px - ox) * (px - ox) + (py - oy) * (py - oy) + (pz - oz) * (pz - oz) <= radius * radius
        if spec.shape_type == "cylinder":
            radius = max(sx, sy) * 0.5
            in_xy = (px - ox) * (px - ox) + (py - oy) * (py - oy) <= radius * radius
            in_z = abs(pz - oz) <= sz * 0.5
            return in_xy and in_z
        return abs(px - ox) <= sx * 0.5 and abs(py - oy) <= sy * 0.5 and abs(pz - oz) <= sz * 0.5

    def _required_object_ids(self, tasks: Sequence[str]) -> List[str]:
        result: List[str] = []
        for task in tasks:
            for spec in self.step_specs_for_task(task):
                result.extend(object_id for object_id in spec.object_ids if object_id)
        if "handover" in tasks:
            result.append("basket")
        return sorted(set(result))

    @staticmethod
    def solution_key(arm: str, step_id: str, object_id: str = "") -> str:
        return f"{arm}.{step_id}.{object_id}".rstrip(".")


def main() -> None:
    parser = argparse.ArgumentParser(description="quick computed motion executor")
    parser.add_argument("--task", choices=["pouring", "handover"], default="pouring")
    parser.add_argument("--full", action="store_true")
    parser.add_argument("--hardware", action="store_true")
    args, _ = parser.parse_known_args()
    tasks = ["pouring", "handover"] if args.full else [args.task]
    executor = QuickMotionExecutor(dry_run=not args.hardware)
    result = QuickComputedMotionExecutor().evaluate(tasks, mode="hybrid", motion_executor=executor, hardware=args.hardware)
    for issue in result.data.get("issues", []):
        print(f"[CRITICAL] {issue}")
    for item in result.data.get("step_evidence", []):
        state = "OK" if item.get("passed") else "CRITICAL"
        print(f"[{state}] {item.get('key')}: {item.get('message')}")
    if not result.success:
        raise SystemExit(2)
    print("[OK] quick computed motion preflight passed")


if __name__ == "__main__":
    main()
