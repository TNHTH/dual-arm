from pathlib import Path
import sys


SCRIPT_DIR = Path(__file__).resolve().parents[2] / "packages" / "ops" / "competition_console_api" / "scripts"
sys.path.insert(0, str(SCRIPT_DIR))

from competition_console_security import authorize_dangerous_request, is_dangerous_api_request, validate_jog_command  # noqa: E402


def test_dangerous_api_token_contract():
    assert is_dangerous_api_request("POST", "/api/bringup/start")
    assert authorize_dangerous_request({}, api_token="")["error"] == "api_token_required"
    assert authorize_dangerous_request({"x-dual-arm-token": "ok"}, api_token="ok") is None


def test_jog_limit_contract():
    assert validate_jog_command(1.0, 1.0, 1.0, max_delta_mm=10.0, max_velocity=20.0, max_acceleration=20.0) is None
    assert validate_jog_command(float("nan"), 1.0, 1.0, max_delta_mm=10.0, max_velocity=20.0, max_acceleration=20.0)
