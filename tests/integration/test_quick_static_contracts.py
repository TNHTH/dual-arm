from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]


def test_competition_integrated_launch_is_not_modified_for_quick_mode():
    source = (REPO_ROOT / "packages/bringup/dualarm_bringup/launch/competition_integrated.launch.py").read_text(
        encoding="utf-8"
    )
    assert "quick_competition" not in source


def test_hardware_smoke_checks_robot_state_values_for_manual_review():
    source = (REPO_ROOT / "scripts/quick/quick_hardware_smoke_test.sh").read_text(encoding="utf-8")
    assert "ros2 topic hz /L/robot_state" in source
    assert "ros2 topic echo /L/robot_state --once" in source
    assert "人工确认关节角和 TCP" in source
