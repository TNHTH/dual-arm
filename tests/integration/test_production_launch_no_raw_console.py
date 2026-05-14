from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]


def test_competition_integrated_console_api_is_enabled_and_raw_motion_allowed():
    source = (
        REPO_ROOT / "packages/bringup/dualarm_bringup/launch/competition_integrated.launch.py"
    ).read_text(encoding="utf-8")

    assert 'DeclareLaunchArgument("start_console_api", default_value="true")' in source
    assert 'condition=IfCondition(LaunchConfiguration("start_console_api"))' in source
    assert '"allow_raw_motion_debug": True' in source
    assert "quick_competition" not in source
