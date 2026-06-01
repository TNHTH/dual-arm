from pathlib import Path
from types import SimpleNamespace
import sys


SCRIPT_DIR = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPT_DIR))

from task_contract import normalize_task_sequence, parse_task_sequence, rank_scene_objects  # noqa: E402


def test_task_sequence_allows_only_competition_tasks():
    assert parse_task_sequence("handover,pouring") == ["handover", "pouring"]

    try:
        parse_task_sequence("handover,debug_task")
    except ValueError as exc:
        assert "未知任务" in str(exc)
    else:
        raise AssertionError("unknown task must fail")


def test_task_sequence_rejects_empty_and_duplicates():
    for raw_sequence in ("", "handover,handover"):
        try:
            normalize_task_sequence(raw_sequence)
        except ValueError:
            continue
        raise AssertionError(f"{raw_sequence!r} must fail")


def test_rank_scene_objects_prefers_stable_confident_recent_objects():
    old_stable = SimpleNamespace(id="cup_old", lifecycle_state="stable", confidence=0.7, scene_version=2)
    recent_stable = SimpleNamespace(id="cup_recent", lifecycle_state="stable", confidence=0.7, scene_version=4)
    high_confidence = SimpleNamespace(id="cup_high", lifecycle_state="stable", confidence=0.9, scene_version=1)
    reserved = SimpleNamespace(id="cup_reserved", lifecycle_state="reserved", confidence=0.99, scene_version=5)

    ranked = rank_scene_objects([reserved, old_stable, recent_stable, high_confidence])

    assert [item.id for item in ranked] == ["cup_high", "cup_recent", "cup_old", "cup_reserved"]
