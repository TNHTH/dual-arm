from __future__ import annotations

import json
import math
import os
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple

import yaml


CONFIG_DIR = Path("config/quick_competition")
QUICK_CONFIG_FILES = [
    "quick_profile.yaml",
    "quick_calibration.yaml",
    "quick_waypoints.yaml",
    "quick_objects.yaml",
    "quick_motion_limits.yaml",
    "quick_pouring.yaml",
    "quick_ball_cage.yaml",
    "legacy_bridge.yaml",
]

RUN_SUCCESS = "SUCCESS"
RUN_PARTIAL_SUCCESS = "PARTIAL_SUCCESS"
RUN_FAILED_EMPTY = "FAILED_EMPTY_RUN"
RUN_ABORTED_HARDWARE = "ABORTED_HARDWARE_FAULT"
RUN_FATAL = "FATAL_ERROR"
RUN_DRY = "DRY_RUN_SIMULATED"

ITEM_PENDING = "PENDING"
ITEM_COMPLETED = "COMPLETED"
ITEM_FAILED = "FAILED"
ITEM_SKIPPED_PREFLIGHT = "SKIPPED_BY_PREFLIGHT"
ITEM_SKIPPED_RUNTIME = "SKIPPED_BY_RUNTIME"

PAYLOAD_EMPTY = "EMPTY_GRIPPER"
PAYLOAD_BALL = "BALL"
PAYLOAD_LIQUID = "LIQUID_CONTAINER"


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def find_repo_root(start: Optional[Path] = None) -> Path:
    candidates: List[Path] = []
    if os.environ.get("DUAL_ARM_REPO_ROOT"):
        candidates.append(Path(os.environ["DUAL_ARM_REPO_ROOT"]).resolve())
    candidates.append((start or Path.cwd()).resolve())
    candidates.extend(Path(__file__).resolve().parents)
    for candidate in candidates:
        if (candidate / "config/system/build_groups.yaml").exists() and (candidate / "packages").exists():
            return candidate
    return Path.cwd().resolve()


def quick_config_path(repo_root: Optional[Path] = None, name: str = "") -> Path:
    root = repo_root or find_repo_root()
    path = root / CONFIG_DIR
    return path / name if name else path


def load_yaml(path: Path) -> Dict[str, Any]:
    if not path.exists():
        raise FileNotFoundError(str(path))
    data = yaml.safe_load(path.read_text(encoding="utf-8"))
    return data or {}


def save_yaml(path: Path, data: Dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(yaml.safe_dump(data, allow_unicode=True, sort_keys=False), encoding="utf-8")


def load_quick_configs(repo_root: Optional[Path] = None) -> Dict[str, Dict[str, Any]]:
    root = repo_root or find_repo_root()
    configs: Dict[str, Dict[str, Any]] = {}
    for name in QUICK_CONFIG_FILES:
        configs[name] = load_yaml(quick_config_path(root, name))
    return configs


def deep_get(data: Dict[str, Any], dotted: str, default: Any = None) -> Any:
    current: Any = data
    for part in dotted.split("."):
        if not isinstance(current, dict) or part not in current:
            return default
        current = current[part]
    return current


def normalize_arm(arm: str) -> str:
    arm = arm.strip().lower()
    if arm in {"left", "left_arm", "l"}:
        return "left_arm"
    if arm in {"right", "right_arm", "r"}:
        return "right_arm"
    raise ValueError(f"未知机械臂: {arm}")


def arm_prefix(arm: str) -> str:
    return "L" if normalize_arm(arm) == "left_arm" else "R"


def service_arm_key(arm: str) -> str:
    return "left" if normalize_arm(arm) == "left_arm" else "right"


@dataclass
class Result:
    success: bool
    message: str = ""
    code: str = "success"
    fatal: bool = False
    data: Dict[str, Any] = field(default_factory=dict)

    @classmethod
    def ok(cls, message: str = "OK", **data: Any) -> "Result":
        return cls(True, message, "success", False, data)

    @classmethod
    def fail(cls, message: str, code: str = "failed", fatal: bool = False, **data: Any) -> "Result":
        return cls(False, message, code, fatal, data)


@dataclass
class PreflightIssue:
    level: str
    message: str
    key: str = ""
    data: Dict[str, Any] = field(default_factory=dict)


@dataclass
class MotionCommandLog:
    stamp: str
    arm: str
    command_type: str
    target_joint: Optional[List[float]] = None
    target_tcp: Optional[List[float]] = None
    actual_joint_before: Optional[List[float]] = None
    actual_joint_after: Optional[List[float]] = None
    result: str = ""
    error: str = ""
    dry_run: bool = True

    def to_json(self) -> str:
        return json.dumps(asdict(self), ensure_ascii=False)


def ensure_list(value: Any, length: int, name: str) -> List[float]:
    if value is None:
        raise ValueError(f"{name} 缺失")
    if len(value) != length:
        raise ValueError(f"{name} 长度应为 {length}，实际 {len(value)}")
    return [float(item) for item in value]


def waypoint_variants(waypoints: Dict[str, Any], arm: str, waypoint_name: str) -> List[Dict[str, Any]]:
    arm_name = normalize_arm(arm)
    raw = (waypoints.get(arm_name) or {}).get(waypoint_name)
    if raw is None:
        return []
    if "primary" in raw or "fallback" in raw:
        variants: List[Dict[str, Any]] = []
        primary = raw.get("primary")
        if isinstance(primary, dict):
            variants.append(primary)
        variants.extend(item for item in raw.get("fallback", []) if isinstance(item, dict))
        return variants
    if isinstance(raw, dict):
        return [raw]
    return []


def waypoint_primary(waypoints: Dict[str, Any], arm: str, waypoint_name: str) -> Optional[Dict[str, Any]]:
    variants = waypoint_variants(waypoints, arm, waypoint_name)
    return variants[0] if variants else None


def waypoint_is_usable(entry: Optional[Dict[str, Any]]) -> bool:
    if not entry:
        return False
    joint = entry.get("joint_deg")
    tcp = entry.get("tcp_pose_table_frame") or entry.get("tcp_pose")
    return isinstance(joint, list) and len(joint) == 6 or isinstance(tcp, list) and len(tcp) >= 3


def waypoint_xyz(entry: Dict[str, Any]) -> Optional[Tuple[float, float, float]]:
    pose = entry.get("tcp_pose_table_frame") or entry.get("tcp_pose")
    if isinstance(pose, list) and len(pose) >= 3:
        return float(pose[0]), float(pose[1]), float(pose[2])
    return None


def is_nonzero_xyz(value: Iterable[Any], eps: float = 1e-9) -> bool:
    return any(abs(float(item)) > eps for item in value)


def distance_xyz(a: Tuple[float, float, float], b: Tuple[float, float, float]) -> float:
    return math.sqrt(sum((a[i] - b[i]) ** 2 for i in range(3)))


def write_jsonl(path: Path, rows: Iterable[Dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False) + "\n")
