#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]

SKIP_DIRS = {
    ".git",
    ".codex",
    ".pytest_cache",
    "__pycache__",
    "build",
    "install",
    "log",
    "vendor",
}

RAW_MOTION_PATTERNS = (
    "RobotMove",
    "RobotMoveCart",
    "RobotServoJoint",
)

MOTION_TOOL_PATTERNS = (
    "RobotMove",
    "RobotMoveCart",
    "RobotServoLine",
    "RobotServoJoint",
    "ExecuteTrajectory",
    "ExecutePrimitive",
    "SetGripper",
)

PRODUCTION_LAUNCHES = (
    "packages/bringup/dualarm_bringup/launch/competition_integrated.launch.py",
    "packages/bringup/dualarm_bringup/launch/competition_core.launch.py",
    "packages/bringup/dualarm_bringup/launch/competition_gazebo_full.launch.py",
)


class Findings:
    def __init__(self) -> None:
        self.items: list[str] = []

    def add(self, message: str) -> None:
        self.items.append(message)

    def extend(self, messages: list[str]) -> None:
        self.items.extend(messages)

    def fail_if_any(self) -> int:
        if not self.items:
            print("runtime authority check passed.")
            return 0
        print("runtime authority check failed:", file=sys.stderr)
        for item in self.items:
            print(f"- {item}", file=sys.stderr)
        return 1


def iter_text_files() -> list[Path]:
    files: list[Path] = []
    for path in REPO_ROOT.rglob("*"):
        if not path.is_file():
            continue
        rel_parts = path.relative_to(REPO_ROOT).parts
        if any(part in SKIP_DIRS for part in rel_parts):
            continue
        if path.suffix.lower() in {".pyc", ".png", ".jpg", ".jpeg", ".pdf", ".bag", ".db3"}:
            continue
        files.append(path)
    return files


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return path.read_text(encoding="utf-8", errors="ignore")


def rel(path: Path) -> str:
    return path.relative_to(REPO_ROOT).as_posix()


def raw_motion_allowed(relative: str, text: str) -> bool:
    if relative.startswith("archive/"):
        return True
    if relative.startswith("docs/") or relative.startswith("tests/"):
        return True
    if relative.startswith("packages/control/robo_ctrl/"):
        return True
    if relative.startswith("packages/control/execution_adapter/"):
        return True
    if relative.startswith("packages/compat/"):
        return True
    if relative == "packages/ops/competition_console_api/scripts/competition_console_api_node.py":
        return "allow_raw_motion_debug" in text and "def _initialize_raw_motion_debug_clients" in text
    if relative.startswith("packages/tools/tools/"):
        return "DUALARM_HARDWARE_CONFIRM_TOKEN" in text
    return False


def check_raw_motion(files: list[Path]) -> list[str]:
    findings: list[str] = []
    for path in files:
        relative = rel(path)
        if not relative.startswith(("packages/", "scripts/")):
            continue
        if relative == "scripts/check_runtime_authority.py":
            continue
        text = read_text(path)
        if not any(pattern in text for pattern in RAW_MOTION_PATTERNS):
            continue
        if not raw_motion_allowed(relative, text):
            findings.append(f"{relative}: raw robot motion service outside allowed authority boundary")
    return findings


def check_get_position_ik(files: list[Path]) -> list[str]:
    findings: list[str] = []
    for path in files:
        relative = rel(path)
        if relative == "scripts/check_runtime_authority.py":
            continue
        text = read_text(path)
        if "GetPositionIK" not in text:
            continue
        if relative.startswith(("archive/", "docs/", "tests/", "packages/planning/")):
            continue
        findings.append(f"{relative}: GetPositionIK outside planning/debug/archive boundary")
    return findings


def check_quick_archive_boundary() -> list[str]:
    findings: list[str] = []
    archive_root = REPO_ROOT / "archive/quick_competition_2026-05-08"
    required_missing = [
        "packages/quick_competition",
        "config/quick_competition",
        "scripts/quick",
    ]
    for relative in required_missing:
        if (REPO_ROOT / relative).exists():
            findings.append(f"{relative}: quick must not exist in active workspace")
    if not (archive_root / "COLCON_IGNORE").is_file():
        findings.append("archive/quick_competition_2026-05-08/COLCON_IGNORE missing")
    for relative in ("config/system/build_groups.yaml", "scripts/ci/software_check.sh"):
        text = read_text(REPO_ROOT / relative)
        if "quick_competition" in text:
            findings.append(f"{relative}: active build/CI must not reference quick_competition")
    return findings


def check_production_launch_contracts() -> list[str]:
    findings: list[str] = []
    for relative in PRODUCTION_LAUNCHES:
        path = REPO_ROOT / relative
        if not path.is_file():
            findings.append(f"{relative}: production launch missing")
            continue
        text = read_text(path)
        if 'package="quick_competition"' in text or "package='quick_competition'" in text:
            findings.append(f"{relative}: production launch starts quick_competition")
        if "RobotMove" in text or "RobotMoveCart" in text or "RobotServoJoint" in text:
            findings.append(f"{relative}: production launch references raw motion services")

    integrated = read_text(REPO_ROOT / PRODUCTION_LAUNCHES[0])
    if 'condition=IfCondition(LaunchConfiguration("start_console_api"))' not in integrated:
        findings.append("competition_integrated.launch.py: console API node must be gated by start_console_api")
    return findings


def check_console_api_contract() -> list[str]:
    findings: list[str] = []
    path = REPO_ROOT / "packages/ops/competition_console_api/scripts/competition_console_api_node.py"
    text = read_text(path)
    constructor = text[text.find("self._plan_joint_client") : text.find("def _initialize_raw_motion_debug_clients")]
    if "from robo_ctrl.srv" in constructor or "create_client(RobotMove" in constructor:
        findings.append("competition_console_api_node.py: production constructor creates raw motion clients")
    if "allow_raw_motion_debug" not in text:
        findings.append("competition_console_api_node.py: missing allow_raw_motion_debug gate")
    return findings


def check_motion_tools(files: list[Path]) -> list[str]:
    findings: list[str] = []
    for path in files:
        relative = rel(path)
        if not relative.startswith(("packages/tools/tools/scripts/", "packages/tools/tools/src/")):
            continue
        text = read_text(path)
        if not any(pattern in text for pattern in MOTION_TOOL_PATTERNS):
            continue
    return findings


def check_camera_facts(files: list[Path]) -> list[str]:
    findings: list[str] = []
    checked_roots = (
        "config/competition/",
        "config/profiles/",
    )
    video_index = re.compile(r"/dev/video\d+")
    for path in files:
        relative = rel(path)
        if not relative.startswith(checked_roots):
            continue
        text = read_text(path)
        if video_index.search(text):
            findings.append(f"{relative}: production camera config uses unstable /dev/video* index")
    camera_profiles = read_text(REPO_ROOT / "config/competition/camera_profiles.yaml")
    if "calibration_status" not in camera_profiles:
        findings.append("config/competition/camera_profiles.yaml: missing calibration_status")
    bridge_launch = read_text(REPO_ROOT / "packages/perception/orbbec_gemini_bridge/launch/orbbec_gemini_bridge.launch.py")
    if 'DeclareLaunchArgument("allow_auto_device_scan", default_value="false")' not in bridge_launch:
        findings.append("orbbec_gemini_bridge.launch.py: allow_auto_device_scan must default false")
    return findings


def main() -> int:
    parser = argparse.ArgumentParser(description="Check dual-arm production runtime authority contracts")
    parser.add_argument("--launch-contracts", action="store_true")
    args = parser.parse_args()

    findings = Findings()
    files = iter_text_files()
    findings.extend(check_production_launch_contracts())
    findings.extend(check_console_api_contract())
    if not args.launch_contracts:
        findings.extend(check_raw_motion(files))
        findings.extend(check_get_position_ik(files))
        findings.extend(check_quick_archive_boundary())
        findings.extend(check_motion_tools(files))
        findings.extend(check_camera_facts(files))
    return findings.fail_if_any()


if __name__ == "__main__":
    raise SystemExit(main())
