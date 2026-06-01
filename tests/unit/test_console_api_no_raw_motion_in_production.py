from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]


def test_console_api_raw_motion_clients_are_always_enabled():
    source = (
        REPO_ROOT / "packages/ops/competition_console_api/scripts/competition_console_api_node.py"
    ).read_text(encoding="utf-8")
    assert "allow_raw_motion_debug" in source
    assert "from robo_ctrl.srv import RobotMoveCart, RobotServoJoint" in source
