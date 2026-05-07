from pathlib import Path
import sys


REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT / "packages/quick_competition"))

from quick_competition.legacy_fairino_bridge import LegacyFairinoBridge  # noqa: E402
from quick_competition.quick_types import Result  # noqa: E402


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


def test_quick_stop_all_fail_closed_blocks_future_actuation(monkeypatch):
    bridge = LegacyFairinoBridge(dry_run=False, config={"legacy_topics": {}, "grippers": {}})
    monkeypatch.setattr(
        bridge,
        "_best_effort_servo_stop",
        lambda timeout_s: Result.fail("no generic stop path", code="service_missing"),
    )

    stop = bridge.stop_all()
    move = bridge.movej("left_arm", [0.0] * 6, 1.0, 1.0)
    gripper = bridge.open_gripper("left_arm")

    assert not stop.success
    assert stop.code == "stop_general_stop_unavailable"
    assert not move.success
    assert move.code == "motion_blocked"
    assert not gripper.success
    assert gripper.code == "motion_blocked"


def test_rclpy_shutdown_only_when_this_function_started_rclpy():
    legacy = _read("packages/quick_competition/quick_competition/legacy_fairino_bridge.py")
    recorder = _read("packages/quick_competition/quick_competition/quick_waypoint_recorder.py")
    assert legacy.count("started_rclpy = False") >= 4
    assert "if started_rclpy:\n                rclpy.shutdown()" in legacy
    assert "if started_rclpy:\n            rclpy.shutdown()" in legacy
    assert "started_rclpy = False" in recorder
    assert "if started_rclpy:\n            rclpy.shutdown()" in recorder


def test_compat_nodes_do_not_expose_fake_success_handlers_or_vexing_executor():
    main = _read("packages/compat/dualarm/src/main.cpp")
    refactored = _read("packages/compat/dualarm/src/main_refactored.cpp")
    assert "MultiThreadedExecutor executor();" not in main
    assert "MultiThreadedExecutor executor;" in main
    assert "executor.add_node(node)" in main
    assert "未验证转发链路，拒绝假成功" in refactored
    assert "response->success = true;" not in refactored[refactored.index("void handleRobotMoveRequest") : refactored.index("};", refactored.index("void handleRobotMoveRequest"))]
