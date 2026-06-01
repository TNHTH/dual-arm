#!/usr/bin/python3

from __future__ import annotations

from typing import Iterable, Sequence


ALLOWED_TASKS: tuple[str, ...] = ("handover", "pouring")

POURING_PRIMITIVE_SEQUENCE: tuple[str, ...] = (
    "detect_objects",
    "verify_scene_freshness",
    "grasp_cup",
    "grasp_bottle",
    "lift_cup",
    "lift_bottle",
    "align_pour",
    "pour_until_time_or_level_proxy",
    "return_bottle_upright",
    "place_bottle",
    "place_cup",
    "release",
    "retreat",
)

HANDOVER_PRIMITIVE_SEQUENCE: tuple[str, ...] = (
    "detect_ball",
    "verify_human_static_window",
    "move_to_pre_cage",
    "open_grippers",
    "cage_ball",
    "wait_human_release",
    "lift_and_hold_3s",
    "move_to_basket_pre_drop",
    "release_before_contact",
    "retreat",
)

CHECKPOINT_EVIDENCE_KEYS: tuple[str, ...] = (
    "checkpoint",
    "ros_topic_or_action_result",
    "perception_timestamp",
    "planning_result",
    "execution_result",
)


def parse_task_sequence(raw_sequence: str, allowed_tasks: Sequence[str] = ALLOWED_TASKS) -> list[str]:
    tasks = [item.strip() for item in raw_sequence.split(",") if item.strip()]
    if not tasks:
        raise ValueError("task_sequence 不能为空")

    unknown_tasks = [task for task in tasks if task not in allowed_tasks]
    if unknown_tasks:
        raise ValueError(f"task_sequence 含未知任务: {unknown_tasks}; allowed={list(allowed_tasks)}")

    duplicated_tasks = sorted({task for task in tasks if tasks.count(task) > 1})
    if duplicated_tasks:
        raise ValueError(f"task_sequence 含重复任务: {duplicated_tasks}")

    return tasks


def normalize_task_sequence(raw_sequence: str, allowed_tasks: Sequence[str] = ALLOWED_TASKS) -> str:
    return ",".join(parse_task_sequence(raw_sequence, allowed_tasks))


def handover_ball_semantic_for_state(state: str) -> str:
    if "BALL_1" in state:
        return "basketball"
    if "BALL_2" in state:
        return "soccer_ball"
    raise ValueError(f"handover state 缺少 BALL_1/BALL_2 标记: {state}")


def rank_scene_objects(objects: Iterable[object]) -> list[object]:
    def sort_key(scene_object: object) -> tuple[int, float, int, str]:
        lifecycle_state = str(getattr(scene_object, "lifecycle_state", ""))
        stable_rank = 0 if lifecycle_state == "stable" else 1
        confidence = float(getattr(scene_object, "confidence", 0.0))
        scene_version = int(getattr(scene_object, "scene_version", 0))
        object_id = str(getattr(scene_object, "id", ""))
        return (stable_rank, -confidence, -scene_version, object_id)

    return sorted(objects, key=sort_key)
