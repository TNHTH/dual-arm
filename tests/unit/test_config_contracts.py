from pathlib import Path

import yaml


REPO_ROOT = Path(__file__).resolve().parents[2]


def load_yaml(path: str) -> dict:
    return yaml.safe_load((REPO_ROOT / path).read_text(encoding="utf-8"))


def test_safety_limits_keep_console_local_and_hardware_blocked_by_default():
    config = load_yaml("config/control/safety_limits.yaml")
    assert config["console_api"]["host_default"] == "127.0.0.1"
    assert config["console_api"]["require_token_for_dangerous_api"] is True
    assert config["console_api"]["allow_external_host_default"] is False
    assert config["console_api"]["allow_hardware_bringup_default"] is False


def test_competition_profile_points_to_canonical_config_paths():
    config = load_yaml("config/profiles/competition_default.yaml")
    assert config["paths"]["packages_root"] == "packages"
    assert config["paths"]["config_root"] == "config"
    assert config["paths"]["object_geometry"] == "config/competition/object_geometry.yaml"
    assert config["paths"]["task_thresholds"] == "config/competition/task_thresholds.yaml"
    assert config["robot"]["right"]["base_rpy"] == [0.0, 0.0, 180.0]
    assert config["gripper"]["left"]["port"] == "auto"


def test_object_geometry_contains_official_dual_arm_semantics():
    config = load_yaml("config/competition/object_geometry.yaml")
    object_ids = set(config["official_semantics"]["object_ids"])
    assert object_ids == {"water_bottle", "cola_bottle", "cup", "basketball", "soccer_ball", "basket"}
    assert config["official_semantics"]["aliases"]["football"] == "soccer_ball"


def test_task_thresholds_require_evidence_for_competition_success():
    config = load_yaml("config/competition/task_thresholds.yaml")
    required = config["acceptance"]["required_evidence"]
    assert "cup_level_over_half" in required["pouring_service"]
    assert "detached_before_basket_contact" in required["human_handover"]
    assert config["tasks"]["human_handover"]["dual_arm_hold_min_sec"]["value"] == 3.0
