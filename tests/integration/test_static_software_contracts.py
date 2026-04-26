from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]


def test_console_static_server_uses_canonical_packages_path():
    source = (REPO_ROOT / "packages/ops/competition_console_api/scripts/competition_console_static_server.py").read_text(
        encoding="utf-8"
    )
    assert '"packages"' in source
    assert '"src"' not in source


def test_console_api_defaults_to_localhost_and_blocks_external_host():
    source = (REPO_ROOT / "packages/ops/competition_console_api/scripts/competition_console_api_node.py").read_text(
        encoding="utf-8"
    )
    assert 'DUAL_ARM_CONSOLE_API_HOST", "127.0.0.1"' in source
    assert "allow_external_host" in source
    assert "allow_hardware_bringup" in source


def test_robo_ctrl_timeout_requests_stop_motion():
    source = (REPO_ROOT / "packages/control/robo_ctrl/src/robo_ctrl_node.cpp").read_text(encoding="utf-8")
    assert "motion_done_timeout_sec" in source
    assert "StopMotion" in source


def test_runtime_code_does_not_use_configs_compat_alias_for_workspace_profile():
    source = (
        REPO_ROOT / "packages/planning/grasp_pose_generator/scripts/grasp_pose_generator_node.py"
    ).read_text(encoding="utf-8")
    assert '"config"' in source
    assert '"configs"' not in source
