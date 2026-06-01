#!/usr/bin/python3

from __future__ import annotations

from typing import Iterable, Sequence


ALLOWED_TASKS: tuple[str, ...] = ("handover", "pouring")


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


def rank_scene_objects(objects: Iterable[object]) -> list[object]:
    def sort_key(scene_object: object) -> tuple[int, float, int, str]:
        lifecycle_state = str(getattr(scene_object, "lifecycle_state", ""))
        stable_rank = 0 if lifecycle_state == "stable" else 1
        confidence = float(getattr(scene_object, "confidence", 0.0))
        scene_version = int(getattr(scene_object, "scene_version", 0))
        object_id = str(getattr(scene_object, "id", ""))
        return (stable_rank, -confidence, -scene_version, object_id)

    return sorted(objects, key=sort_key)
