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


def test_task_manager_rejects_direct_action_goal_at_start_gate():
    source = (
        REPO_ROOT / "packages/tasks/dualarm_task_manager/scripts/dualarm_task_manager_node.py"
    ).read_text(encoding="utf-8")
    assert "direct_action_goal" in source
    assert "WAIT_START 拒绝直接 action goal" in source


def test_execution_adapter_does_not_treat_missing_objects_as_success():
    source = (
        REPO_ROOT / "packages/control/execution_adapter/scripts/execution_adapter_node.py"
    ).read_text(encoding="utf-8")
    assert "RESULT_UNVERIFIED_EVIDENCE" in source
    assert "has_pour_evidence" in source
    assert "return True" not in source[source.index("def _verify_detached") : source.index("def _check_gripper_contact")]
    assert "lost" not in source[source.index("def _verify_object_attached_or_hidden") : source.index("def _set_object_interaction")]


def test_wave5_runtime_modules_are_split_without_renaming_entrypoints():
    expected_files = [
        "packages/ops/competition_console_api/scripts/process_manager.py",
        "packages/control/execution_adapter/scripts/primitive_evidence.py",
        "packages/control/robo_ctrl/include/robo_ctrl/safety_limits.hpp",
        "packages/ops/competition_console_web/src/apiClient.ts",
    ]
    for relative_path in expected_files:
        assert (REPO_ROOT / relative_path).exists(), relative_path

    assert "competition_console_api_node.py" in (
        REPO_ROOT / "packages/ops/competition_console_api/CMakeLists.txt"
    ).read_text(encoding="utf-8")
    assert "execution_adapter_node.py" in (
        REPO_ROOT / "packages/control/execution_adapter/CMakeLists.txt"
    ).read_text(encoding="utf-8")
