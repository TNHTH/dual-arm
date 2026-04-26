from pathlib import Path
from types import SimpleNamespace
import sys


SCRIPT_DIR = Path(__file__).resolve().parents[2] / "packages" / "tasks" / "dualarm_task_manager" / "scripts"
sys.path.insert(0, str(SCRIPT_DIR))

from task_contract import normalize_task_sequence, rank_scene_objects  # noqa: E402


def test_task_sequence_contract_normalizes_known_tasks_only():
    assert normalize_task_sequence(" handover , pouring ") == "handover,pouring"

    try:
        normalize_task_sequence("handover,free_drive")
    except ValueError as exc:
        assert "free_drive" in str(exc)
    else:
        raise AssertionError("unknown tasks must not enter the competition state machine")


def test_scene_object_selection_contract_is_deterministic():
    objects = [
        SimpleNamespace(id="b", lifecycle_state="stable", confidence=0.5, scene_version=2),
        SimpleNamespace(id="a", lifecycle_state="stable", confidence=0.5, scene_version=2),
        SimpleNamespace(id="c", lifecycle_state="lost", confidence=1.0, scene_version=9),
    ]

    assert [item.id for item in rank_scene_objects(objects)] == ["a", "b", "c"]
