from __future__ import annotations

import math
import os
from http import HTTPStatus
from typing import Mapping, Optional


def env_bool(name: str, default: bool = False) -> bool:
    value = os.environ.get(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def is_loopback_host(host: str) -> bool:
    return host.strip().lower() in {"127.0.0.1", "localhost", "::1"}


def is_dangerous_api_request(method: str, path: str) -> bool:
    if method.upper() not in {"POST", "PUT", "PATCH", "DELETE"}:
        return False
    dangerous_prefixes = (
        "/api/bringup",
        "/api/control",
        "/api/tasks",
        "/api/acceptance/run",
        "/api/presets",
        "/api/action-groups",
        "/api/recordings",
    )
    return path.startswith(dangerous_prefixes)


def authorize_dangerous_request(
    headers: Mapping[str, str],
    *,
    api_token: str,
    allow_unsafe_without_token: bool = False,
) -> Optional[dict[str, object]]:
    if not api_token:
        if allow_unsafe_without_token:
            return None
        return {
            "status_code": HTTPStatus.FORBIDDEN,
            "error": "api_token_required",
            "message": "dangerous API requires api_token; set DUAL_ARM_CONSOLE_API_TOKEN or api_token parameter",
        }

    normalized_headers = {key.lower(): value for key, value in headers.items()}
    provided = normalized_headers.get("x-dual-arm-token", "")
    authorization = normalized_headers.get("authorization", "")
    if authorization.lower().startswith("bearer "):
        provided = authorization.split(" ", 1)[1].strip()
    if provided != api_token:
        return {
            "status_code": HTTPStatus.UNAUTHORIZED,
            "error": "invalid_api_token",
            "message": "dangerous API token missing or invalid",
        }
    return None


def validate_jog_command(
    delta_mm: float,
    velocity: float,
    acceleration: float,
    *,
    max_delta_mm: float,
    max_velocity: float,
    max_acceleration: float,
) -> Optional[str]:
    values = {
        "delta_mm": float(delta_mm),
        "velocity": float(velocity),
        "acceleration": float(acceleration),
    }
    for name, value in values.items():
        if not math.isfinite(value):
            return f"{name} must be finite"
    if math.isclose(values["delta_mm"], 0.0, abs_tol=1e-9):
        return "delta_mm must be non-zero"
    if abs(values["delta_mm"]) > max_delta_mm:
        return f"delta_mm exceeds max_jog_delta_mm={max_delta_mm}"
    if values["velocity"] <= 0.0 or values["velocity"] > max_velocity:
        return f"velocity must be in (0, {max_velocity}]"
    if values["acceleration"] <= 0.0 or values["acceleration"] > max_acceleration:
        return f"acceleration must be in (0, {max_acceleration}]"
    return None


def clamp_gripper_value(value: int, minimum: int, maximum: int) -> int:
    return min(max(int(value), minimum), maximum)
