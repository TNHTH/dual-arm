from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]


def test_competition_integrated_console_api_is_opt_in_and_non_raw():
    source = (
        REPO_ROOT / "packages/bringup/dualarm_bringup/launch/competition_integrated.launch.py"
    ).read_text(encoding="utf-8")

    assert 'DeclareLaunchArgument("start_console_api", default_value="false")' in source
    assert 'condition=IfCondition(LaunchConfiguration("start_console_api"))' in source
    assert '"allow_raw_motion_debug": False' in source
    assert "quick_competition" not in source
