from pathlib import Path
import sys


SCRIPT_DIR = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPT_DIR))

from competition_console_security import (  # noqa: E402
    authorize_dangerous_request,
    clamp_gripper_value,
    is_dangerous_api_request,
    is_loopback_host,
    validate_jog_command,
)


def test_dangerous_routes_require_token_by_default():
    assert is_dangerous_api_request("POST", "/api/control/arm/jog")
    error = authorize_dangerous_request({}, api_token="")
    assert error is not None
    assert error["error"] == "api_token_required"


def test_bearer_token_authorizes_dangerous_route():
    error = authorize_dangerous_request({"Authorization": "Bearer token-1"}, api_token="token-1")
    assert error is None


def test_safe_get_routes_do_not_require_token_classification():
    assert not is_dangerous_api_request("GET", "/api/status")
    assert not is_dangerous_api_request("GET", "/api/control/state")


def test_loopback_detection_blocks_external_defaults():
    assert is_loopback_host("127.0.0.1")
    assert is_loopback_host("localhost")
    assert not is_loopback_host("0.0.0.0")


def test_jog_validation_limits_delta_and_velocity():
    assert validate_jog_command(5.0, 5.0, 5.0, max_delta_mm=10.0, max_velocity=20.0, max_acceleration=20.0) is None
    assert "delta_mm" in validate_jog_command(20.0, 5.0, 5.0, max_delta_mm=10.0, max_velocity=20.0, max_acceleration=20.0)
    assert "velocity" in validate_jog_command(5.0, 25.0, 5.0, max_delta_mm=10.0, max_velocity=20.0, max_acceleration=20.0)


def test_gripper_clamp_uses_configured_bounds():
    assert clamp_gripper_value(300, 1, 160) == 160
    assert clamp_gripper_value(-5, 0, 255) == 0
    assert clamp_gripper_value(42, 1, 160) == 42
