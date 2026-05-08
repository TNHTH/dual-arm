from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]


def test_console_api_raw_motion_clients_are_debug_gated():
    source = (
        REPO_ROOT / "packages/ops/competition_console_api/scripts/competition_console_api_node.py"
    ).read_text(encoding="utf-8")
    production_constructor = source[source.index("self._plan_joint_client") : source.index("def _initialize_raw_motion_debug_clients")]
    assert "from robo_ctrl.srv" not in production_constructor
    assert "create_client(RobotMove" not in production_constructor
    assert "allow_raw_motion_debug" in source
    assert "from robo_ctrl.srv import RobotMoveCart, RobotServoJoint" in source
