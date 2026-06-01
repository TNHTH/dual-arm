from pathlib import Path
import sys

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT / "packages/quick_competition"))

from quick_competition.quick_computed_motion_executor import QuickComputedMotionExecutor  # noqa: E402
from quick_competition.quick_ik_planner import QuickIKPlanner  # noqa: E402
from quick_competition.quick_motion_executor import QuickMotionExecutor  # noqa: E402
from quick_competition.quick_preflight_check import QuickPreflightCheck  # noqa: E402


def _fake_select_best(self, candidates, require_moveit_service=None):
    candidates = list(candidates)
    if not candidates:
        from quick_competition.quick_types import Result

        return Result.fail("no candidates")
    candidate = candidates[0]
    from quick_competition.quick_types import Result

    return Result.ok(
        "fake IK selected",
        solution={
            "step_id": candidate.step_id,
            "arm": candidate.arm,
            "object_id": candidate.object_id,
            "pose_table": list(candidate.pose_table),
            "score": 1.0,
            "source": "computed_templates",
            "joint_deg": [0.0] * 6,
        },
        rejected=[],
    )


def test_hybrid_preflight_marks_missing_anchor_as_skipped_by_preflight():
    report = QuickPreflightCheck().run(dry_run=True, task="pouring")

    assert not report.passed
    assert "pouring" in report.skipped_items
    assert any("SKIPPED_BY_PREFLIGHT" in issue.message for issue in report.issues)
    assert any(issue.key == "hybrid.anchor.left_arm.home" for issue in report.issues)


def test_computed_templates_generate_step_solutions_but_do_not_bypass_anchor_gate(monkeypatch):
    monkeypatch.setattr(QuickIKPlanner, "select_best", _fake_select_best)
    executor = QuickMotionExecutor(dry_run=True)
    result = QuickComputedMotionExecutor().evaluate(["pouring"], mode="hybrid", motion_executor=executor, hardware=False)

    assert not result.success
    assert "pouring" in result.data["skipped_tasks"]
    assert "left_arm.pregrasp_cup.cup_1" in result.data["solutions"]
    assert any(item["key"] == "hybrid.anchor.left_arm.safe_stow" for item in result.data["step_evidence"])


def test_runtime_first_ik_is_blocked_without_preflight_solution_or_manual_fallback():
    executor = QuickMotionExecutor(dry_run=True)

    result = executor.move_to_waypoint("left_arm", "pregrasp_cup", object_id_override="cup_1")

    assert not result.success
    assert result.code == "runtime_first_ik_blocked"


def test_runtime_consumes_preflight_computed_solution_without_generating_new_ik():
    executor = QuickMotionExecutor(
        dry_run=True,
        computed_solutions={
            "left_arm.pregrasp_cup.cup_1": {
                "step_id": "pregrasp_cup",
                "arm": "left_arm",
                "object_id": "cup_1",
                "pose_table": [0.1, 0.2, 0.3, 180.0, 0.0, 0.0],
                "score": 1.0,
                "source": "computed_templates",
            }
        },
    )

    result = executor.move_to_waypoint("left_arm", "pregrasp_cup", object_id_override="cup_1")

    assert result.success
    assert result.message == "dry-run MoveCart"
    assert executor.bridge.records[-1].target_tcp == [0.1, 0.2, 0.3, 180.0, 0.0, 0.0]


def test_quick_ik_planner_requires_moveit_service_by_default():
    planner = QuickIKPlanner()

    assert planner.require_moveit_service_default is True
