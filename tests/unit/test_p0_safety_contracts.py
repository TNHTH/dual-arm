from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]


def _read(relative_path: str) -> str:
    return (REPO_ROOT / relative_path).read_text(encoding="utf-8")


def test_keyboard_tcp_controller_converts_mm_to_m_for_ros_pose():
    source = _read("packages/tools/tools/src/keyboard_tcp_controller.cpp")
    assert "pose.position.x = delta_pose[0] / 1000.0" in source
    assert "pose.position.y = delta_pose[1] / 1000.0" in source
    assert "pose.position.z = delta_pose[2] / 1000.0" in source


def test_robo_ctrl_polls_emergency_stop_and_rejects_motion_services():
    source = _read("packages/control/robo_ctrl/src/robo_ctrl_node.cpp")
    header = _read("packages/control/robo_ctrl/include/robo_ctrl/robo_ctrl_node.hpp")
    assert "GetRobotEmergencyStopState" in source
    assert "motion_blocked_by_emergency_stop" in source
    assert 'motion_blocked_by_emergency_stop("RobotMove"' in source
    assert 'motion_blocked_by_emergency_stop("RobotMoveCart"' in source
    assert 'request->command_type != 1 && motion_blocked_by_emergency_stop("RobotServo"' in source
    assert 'request->command_type != 1 && motion_blocked_by_emergency_stop("RobotServoLine"' in source
    assert 'request->command_type != 1 && motion_blocked_by_emergency_stop("RobotServoJoint"' in source
    assert 'motion_blocked_by_emergency_stop("RobotSetSpeed"' in source
    assert "std::atomic<bool> e_stop_active_ { true }" in header


def test_quick_is_archived_outside_active_colcon_path():
    assert not (REPO_ROOT / "packages/quick_competition").exists()
    archive_root = REPO_ROOT / "archive/quick_competition_2026-05-08"
    assert (archive_root / "COLCON_IGNORE").is_file()
    assert (archive_root / "quick_competition/package.xml").is_file()
    launch = _read("packages/bringup/dualarm_bringup/launch/quick_competition.launch.py")
    assert "Shutdown(reason=\"quick_competition archived and disabled\")" in launch
    assert "package=\"quick_competition\"" not in launch


def test_compat_nodes_do_not_expose_fake_success_handlers_or_vexing_executor():
    main = _read("packages/compat/dualarm/src/main.cpp")
    refactored = _read("packages/compat/dualarm/src/main_refactored.cpp")
    assert "MultiThreadedExecutor executor();" not in main
    assert "MultiThreadedExecutor executor;" in main
    assert "executor.add_node(node)" in main
    assert "未验证转发链路，拒绝假成功" in refactored
    assert "response->success = true;" not in refactored[refactored.index("void handleRobotMoveRequest") : refactored.index("};", refactored.index("void handleRobotMoveRequest"))]
