from pathlib import Path
from types import SimpleNamespace
import sys


SCRIPT_DIR = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPT_DIR))

from task_contract import (  # noqa: E402
    CHECKPOINT_EVIDENCE_KEYS,
    HANDOVER_PRIMITIVE_SEQUENCE,
    POURING_PRIMITIVE_SEQUENCE,
    handover_ball_semantic_for_state,
    normalize_task_sequence,
    parse_task_sequence,
    rank_scene_objects,
)


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


def test_handover_ball_semantic_parses_full_state_names():
    assert handover_ball_semantic_for_state("GRASP_BALL_1") == "basketball"
    assert handover_ball_semantic_for_state("HOLD_BALL_1_3S") == "basketball"
    assert handover_ball_semantic_for_state("VERIFY_BALL_1_DROP") == "basketball"
    assert handover_ball_semantic_for_state("GRASP_BALL_2") == "soccer_ball"
    assert handover_ball_semantic_for_state("HOLD_BALL_2_3S") == "soccer_ball"
    assert handover_ball_semantic_for_state("VERIFY_BALL_2_DROP") == "soccer_ball"


def test_handover_hold_verify_is_not_marked_synchronized():
    source = (SCRIPT_DIR / "behaviors" / "handover_boundary.py").read_text(encoding="utf-8")
    hold_block = source[source.index('if state.startswith("HOLD_BALL_")') : source.index('if state.startswith("RELEASE_BALL_")')]
    assert 'primitive_id="hold_verify"' in hold_block
    assert "synchronized=True" not in hold_block


def test_handover_release_executes_last_plan_before_release_guard():
    source = (SCRIPT_DIR / "behaviors" / "handover_boundary.py").read_text(encoding="utf-8")
    release_block = source[source.index('if state.startswith("RELEASE_BALL_")') :]

    assert 'primitive_id="release_guard"' in release_block
    assert "execute_last_plan=True" in release_block


def test_competition_primitive_sequences_match_runtime_authority_skeleton():
    assert POURING_PRIMITIVE_SEQUENCE == (
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
    assert HANDOVER_PRIMITIVE_SEQUENCE == (
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
    assert {"checkpoint", "perception_timestamp", "planning_result", "execution_result"}.issubset(
        set(CHECKPOINT_EVIDENCE_KEYS)
    )
