from pathlib import Path
import sys

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT / "packages/quick_competition"))

from quick_competition.quick_motion_executor import MotionSafety, QuickMotionExecutor  # noqa: E402
from quick_competition.quick_types import PAYLOAD_BALL, PAYLOAD_EMPTY, PAYLOAD_LIQUID, load_yaml  # noqa: E402


def test_movecart_distance_is_refused_over_limit():
    limits = load_yaml(REPO_ROOT / "config/quick_competition/quick_motion_limits.yaml")
    safety = MotionSafety(limits)
    result = safety.check_movecart_distance((0.0, 0.0, 0.1), (0.10, 0.0, 0.1))
    assert not result.success
    assert result.code == "movecart_distance_exceeded"


def test_z_raise_checks_current_and_target_z():
    limits = load_yaml(REPO_ROOT / "config/quick_competition/quick_motion_limits.yaml")
    safety = MotionSafety(limits)
    assert not safety.check_z_raise(-0.01, 0.1).success
    assert not safety.check_z_raise(0.1, 1.5).success
    assert safety.check_z_raise(0.1, 0.2).success


def test_liquid_payload_never_auto_releases():
    assert MotionSafety.allow_auto_release(PAYLOAD_EMPTY)
    assert MotionSafety.allow_auto_release(PAYLOAD_BALL)
    assert not MotionSafety.allow_auto_release(PAYLOAD_LIQUID)


def test_hardware_preflight_checks_all_required_waypoints():
    executor = QuickMotionExecutor(dry_run=True)
    errors = executor.prevalidate_waypoints("pouring", hardware=True)
    assert any("home" in item for item in errors)
    assert any("bottle_upright_after_pour" in item for item in errors)


def test_offset_nonzero_requires_tcp_pose_when_hardware():
    executor = QuickMotionExecutor(dry_run=True)
    executor.manual_offset_nonzero = True
    result = executor._static_ik_check({"joint_deg": [0, 0, 0, 0, 0, 0], "verified": True}, hardware=True)
    assert not result.success
    assert result.code == "offset_requires_tcp_pose"
