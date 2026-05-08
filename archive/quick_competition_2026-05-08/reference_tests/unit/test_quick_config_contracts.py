from pathlib import Path
import sys

import yaml

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT / "packages/quick_competition"))

from quick_competition.quick_types import load_yaml  # noqa: E402


def test_quick_profile_defaults_are_safe():
    profile = load_yaml(REPO_ROOT / "config/quick_competition/quick_profile.yaml")
    assert profile["dry_run_default"] is True
    assert profile["scene_source_override"] == "manual"
    assert profile["execution_frame"] == "table_frame_corrected"
    assert profile["depth"]["primary_camera"] == "left"
    assert profile["depth"]["right_depth"]["verified"] is False


def test_quick_waypoints_support_primary_and_fallback_schema():
    waypoints = load_yaml(REPO_ROOT / "config/quick_competition/quick_waypoints.yaml")
    upright = waypoints["right_arm"]["bottle_upright_after_pour"]
    assert "primary" in upright
    assert "fallback" in upright
    assert upright["primary"]["source"] == "actual_robot_feedback"
    assert upright["primary"]["payload_state"] == "LIQUID_CONTAINER"


def test_motion_limits_lock_short_movecart_and_bimanual_timeout():
    limits = load_yaml(REPO_ROOT / "config/quick_competition/quick_motion_limits.yaml")
    assert limits["move_policy"]["final_approach_distance_m"] == 0.04
    assert limits["move_policy"]["max_movecart_distance_m"] == 0.05
    assert limits["timeouts"]["action_timeout_s"] == 15.0
    assert limits["timeouts"]["bimanual_sync_timeout_s"] == 20.0


def test_pouring_assignment_and_place_sequence_are_configurable():
    pouring = load_yaml(REPO_ROOT / "config/quick_competition/quick_pouring.yaml")
    assert pouring["pouring"]["cup_arm"] in {"left", "right"}
    assert pouring["pouring"]["bottle_arm"] in {"left", "right"}
    assert pouring["pouring"]["place_sequence"] in {"bottle_first", "cup_first"}


def test_launch_keeps_orchestrator_off_by_default():
    source = (REPO_ROOT / "packages/bringup/dualarm_bringup/launch/quick_competition.launch.py").read_text(
        encoding="utf-8"
    )
    assert 'DeclareLaunchArgument("start_orchestrator", default_value="false")' in source
    assert "quick_left_motion_base -> table_frame" in source
    assert "table_frame -> table_frame_corrected" in source
