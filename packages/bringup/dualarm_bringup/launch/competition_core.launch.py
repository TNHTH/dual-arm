from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import LaunchConfiguration
from ament_index_python.packages import get_package_share_directory
import os
from pathlib import Path

import yaml


def _find_repo_root() -> Path:
    env_root = os.environ.get("DUAL_ARM_REPO_ROOT")
    if env_root:
        return Path(env_root).expanduser().resolve()
    current = Path(__file__).resolve()
    for parent in [current.parent, *current.parents]:
        if (parent / "STATE.md").exists() and (parent / "packages").is_dir():
            return parent
    return Path.cwd()


def _load_profile() -> dict:
    repo_root = _find_repo_root()
    profile_path = Path(os.environ.get("DUAL_ARM_COMPETITION_PROFILE", repo_root / "config" / "profiles" / "competition_default.yaml"))
    if not profile_path.exists():
        return {}
    return yaml.safe_load(profile_path.read_text(encoding="utf-8")) or {}


def _profile_get(profile: dict, dotted_key: str, default):
    value = profile
    for part in dotted_key.split("."):
        if not isinstance(value, dict) or part not in value:
            return default
        value = value[part]
    return value


def _space_join(values, default: str) -> str:
    if not isinstance(values, list):
        return default
    return " ".join(str(item) for item in values)


def _resolve_repo_path(repo_root: Path, maybe_relative_path) -> str:
    path = Path(str(maybe_relative_path))
    return str(path if path.is_absolute() else repo_root / path)


def generate_launch_description():
    profile = _load_profile()
    repo_root = _find_repo_root()
    detector_share = get_package_share_directory("detector")
    detector_model_from_profile = _profile_get(
        profile,
        "perception.detector.model_path",
        os.path.join(
            "packages",
            "perception",
            "detector",
            "models",
            "yolov8",
            "yolo_runs",
            "final_dataset_v1",
            "weights",
            "best.pt",
        ),
    )
    default_detector_model = os.environ.get("DUALARM_DETECTOR_MODEL_PATH") or (
        str(repo_root / detector_model_from_profile)
        if not os.path.isabs(str(detector_model_from_profile))
        else str(detector_model_from_profile)
    )
    if not Path(default_detector_model).exists():
        default_detector_model = os.path.join(
            detector_share,
            "models",
            "yolov8",
            "yolo_runs",
            "final_dataset_v1",
            "weights",
            "best.pt",
        )
    default_object_geometry_file = _resolve_repo_path(
        repo_root,
        _profile_get(profile, "paths.object_geometry", "config/competition/object_geometry.yaml"),
    )
    competition_launch = os.path.join(
        get_package_share_directory("dualarm_bringup"),
        "launch",
        "competition.launch.py",
    )
    return LaunchDescription(
        [
            DeclareLaunchArgument("start_hardware", default_value="false"),
            DeclareLaunchArgument("start_detector", default_value="false"),
            DeclareLaunchArgument("start_left_detector", default_value="true"),
            DeclareLaunchArgument("start_right_detector", default_value="true"),
            DeclareLaunchArgument("start_table_surface_detector", default_value="true"),
            DeclareLaunchArgument("start_camera_bridge", default_value="false"),
            DeclareLaunchArgument("dual_camera_mode", default_value="reobserve_only"),
            DeclareLaunchArgument("active_depth_camera", default_value="left"),
            DeclareLaunchArgument("enable_left_camera", default_value="true"),
            DeclareLaunchArgument("enable_right_camera", default_value="true"),
            DeclareLaunchArgument("require_verified_camera_extrinsics", default_value="true"),
            DeclareLaunchArgument("allow_unverified_camera_extrinsics", default_value="false"),
            DeclareLaunchArgument("required_camera_calibration_status", default_value="verified"),
            DeclareLaunchArgument("use_mock_camera_stream", default_value="false"),
            DeclareLaunchArgument("camera_color_device", default_value="auto"),
            DeclareLaunchArgument("camera_depth_device", default_value="auto"),
            DeclareLaunchArgument("camera_depth_backend", default_value="auto"),
            DeclareLaunchArgument("camera_v4l2_depth_unit_to_mm_scale", default_value="0.125"),
            DeclareLaunchArgument("left_camera_color_device", default_value="auto"),
            DeclareLaunchArgument("left_camera_depth_device", default_value="auto"),
            DeclareLaunchArgument("left_camera_enable_depth", default_value="true"),
            DeclareLaunchArgument("left_camera_fps", default_value="5.0"),
            DeclareLaunchArgument("left_camera_rotate_180", default_value="true"),
            DeclareLaunchArgument("left_camera_depth_obsensor_index", default_value="0"),
            DeclareLaunchArgument("right_camera_color_device", default_value="auto"),
            DeclareLaunchArgument("right_camera_depth_device", default_value="auto"),
            DeclareLaunchArgument("right_camera_enable_depth", default_value="false"),
            DeclareLaunchArgument("right_camera_fps", default_value="5.0"),
            DeclareLaunchArgument("right_camera_rotate_180", default_value="false"),
            DeclareLaunchArgument("publish_fake_joint_states", default_value="false"),
            DeclareLaunchArgument("detector_executable", default_value=str(_profile_get(profile, "perception.detector.executable", "detector_pt_node.py"))),
            DeclareLaunchArgument("detector_model_path", default_value=default_detector_model),
            DeclareLaunchArgument("detector_image_topic", default_value=str(_profile_get(profile, "perception.detector.image_topic", "/left_camera/color/image_raw"))),
            DeclareLaunchArgument("detector_allowed_class_ids", default_value="[0,1,2,3,4,5]"),
            DeclareLaunchArgument("depth_require_depth_aligned_detections", default_value="true"),
            DeclareLaunchArgument("depth_require_camera_info_depth_frame", default_value="true"),
            DeclareLaunchArgument("depth_expected_detection_frame", default_value="left_camera_color_frame"),
            DeclareLaunchArgument("ball_require_depth_aligned_detections", default_value="true"),
            DeclareLaunchArgument("ball_require_camera_info_depth_frame", default_value="true"),
            DeclareLaunchArgument("ball_expected_detection_frame", default_value="left_camera_color_frame"),
            DeclareLaunchArgument("table_timer_hz", default_value="2.0"),
            DeclareLaunchArgument("table_min_depth_mm", default_value="60.0"),
            DeclareLaunchArgument("table_max_depth_mm", default_value="3000.0"),
            DeclareLaunchArgument("table_plane_threshold_mm", default_value="22.0"),
            DeclareLaunchArgument("table_color_distance_threshold", default_value="34.0"),
            DeclareLaunchArgument("table_min_inlier_ratio", default_value="0.45"),
            DeclareLaunchArgument("table_min_inliers", default_value="500"),
            DeclareLaunchArgument("pick_assist_rgb_overlay_topic", default_value="/perception/pick_assist/rgb_overlay"),
            DeclareLaunchArgument("left_robot_ip", default_value=str(_profile_get(profile, "robot.left.ip", "192.168.58.2"))),
            DeclareLaunchArgument("right_robot_ip", default_value=str(_profile_get(profile, "robot.right.ip", "192.168.58.3"))),
            DeclareLaunchArgument("left_base_xyz", default_value=_space_join(_profile_get(profile, "robot.left.base_xyz", []), "0 0.35 0")),
            DeclareLaunchArgument("left_base_rpy", default_value=_space_join(_profile_get(profile, "robot.left.base_rpy", []), "0 0 0")),
            DeclareLaunchArgument("right_base_xyz", default_value=_space_join(_profile_get(profile, "robot.right.base_xyz", []), "0 -0.35 0")),
            DeclareLaunchArgument("right_base_rpy", default_value=_space_join(_profile_get(profile, "robot.right.base_rpy", []), "0 0 180")),
            DeclareLaunchArgument("left_robot_port", default_value=str(_profile_get(profile, "robot.left.port", 8080))),
            DeclareLaunchArgument("right_robot_port", default_value=str(_profile_get(profile, "robot.right.port", 8080))),
            DeclareLaunchArgument("robot_state_query_interval", default_value=str(_profile_get(profile, "robot.state_query_interval_sec", 0.05))),
            DeclareLaunchArgument(
                "left_gripper_port",
                default_value=str(_profile_get(profile, "gripper.left.port", "auto")),
            ),
            DeclareLaunchArgument(
                "right_gripper_port",
                default_value=str(_profile_get(profile, "gripper.right.port", "auto")),
            ),
            DeclareLaunchArgument("scene_age_limit_ms", default_value="800"),
            DeclareLaunchArgument("robot_state_age_limit_ms", default_value="100"),
            DeclareLaunchArgument("planning_time", default_value="5.0"),
            DeclareLaunchArgument("planning_attempts", default_value="10"),
            DeclareLaunchArgument("allow_dual_arm_sequential_fallback", default_value="false"),
            DeclareLaunchArgument("apply_default_tcp_orientation_to_dual_pose_targets", default_value="false"),
            DeclareLaunchArgument("allow_vendor_direct_cartesian", default_value="false"),
            DeclareLaunchArgument("vendor_direct_cartesian_profiles", default_value=""),
            DeclareLaunchArgument("use_sim_time", default_value="false"),
            DeclareLaunchArgument("scene_fusion_input_topics", default_value="['/perception/left/scene_objects','/perception/right/scene_objects','/perception/left/ball_basket_scene_objects','/perception/right/ball_basket_scene_objects','/perception/table_scene_objects']"),
            DeclareLaunchArgument("scene_fusion_rgb_detection_topics", default_value="['/perception/right/detection_2d']"),
            DeclareLaunchArgument("object_geometry_file", default_value=default_object_geometry_file),
            DeclareLaunchArgument("execution_backend", default_value="hardware"),
            DeclareLaunchArgument("simulation_mode", default_value="false"),
            DeclareLaunchArgument("sim_grasp_contact_threshold_m", default_value="0.04"),
            DeclareLaunchArgument("sim_contact_retry_max", default_value="2"),
            DeclareLaunchArgument("sim_robot_state_freshness_max_age_s", default_value="0.5"),
            DeclareLaunchArgument("sim_visual_playback_rate_hz", default_value="20.0"),
            DeclareLaunchArgument("sim_basket_accept_radius_m", default_value="0.15"),
            DeclareLaunchArgument("sim_basket_accept_z_below_rim_m", default_value="0.05"),
            DeclareLaunchArgument("sim_basketball_pregrasp_left_joints_rad", default_value="0.25 -0.75 1.15 0.0 0.55 0.0"),
            DeclareLaunchArgument("sim_basketball_pregrasp_right_joints_rad", default_value="-0.25 -0.75 1.15 0.0 0.55 0.0"),
            DeclareLaunchArgument("sim_soccer_ball_pregrasp_left_joints_rad", default_value="-0.10 -0.75 1.15 0.0 0.55 0.0"),
            DeclareLaunchArgument("sim_soccer_ball_pregrasp_right_joints_rad", default_value="0.10 -0.75 1.15 0.0 0.55 0.0"),
            DeclareLaunchArgument("sim_basketball_release_left_joints_rad", default_value="0.0 -0.8 1.2 0.0 0.6 0.0"),
            DeclareLaunchArgument("sim_basketball_release_right_joints_rad", default_value="0.0 -0.8 1.2 0.0 0.6 0.0"),
            DeclareLaunchArgument("sim_soccer_ball_release_left_joints_rad", default_value="0.0 -0.8 1.2 0.0 0.6 0.0"),
            DeclareLaunchArgument("sim_soccer_ball_release_right_joints_rad", default_value="0.0 -0.8 1.2 0.0 0.6 0.0"),
            DeclareLaunchArgument("sim_bottle_grasp_right_joints_rad", default_value="-1.094 -0.985 1.319 -0.354 0.803 0.390"),
            DeclareLaunchArgument("sim_cup_grasp_left_joints_rad", default_value="2.248 -1.144 0.507 -0.089 0.343 -0.090"),
            DeclareLaunchArgument("sim_cap_workspace_left_joints_rad", default_value="2.248 -1.144 0.507 -0.089 0.343 -0.090"),
            DeclareLaunchArgument("sim_pour_tilt_right_joints_rad", default_value="-1.094 -0.985 1.319 -0.354 0.803 1.000"),
            DeclareLaunchArgument("sim_place_left_joints_rad", default_value="2.428 -1.082 0.486 -0.283 0.997 -0.609"),
            DeclareLaunchArgument("sim_place_right_joints_rad", default_value="-1.000 -1.000 1.200 -0.200 1.000 0.800"),
            IncludeLaunchDescription(
                PythonLaunchDescriptionSource(competition_launch),
                launch_arguments={
                    "start_hardware": LaunchConfiguration("start_hardware"),
                    "start_detector": LaunchConfiguration("start_detector"),
                    "start_left_detector": LaunchConfiguration("start_left_detector"),
                    "start_right_detector": LaunchConfiguration("start_right_detector"),
                    "start_table_surface_detector": LaunchConfiguration("start_table_surface_detector"),
                    "start_camera_bridge": LaunchConfiguration("start_camera_bridge"),
                    "dual_camera_mode": LaunchConfiguration("dual_camera_mode"),
                    "active_depth_camera": LaunchConfiguration("active_depth_camera"),
                    "enable_left_camera": LaunchConfiguration("enable_left_camera"),
                    "enable_right_camera": LaunchConfiguration("enable_right_camera"),
                    "require_verified_camera_extrinsics": LaunchConfiguration("require_verified_camera_extrinsics"),
                    "allow_unverified_camera_extrinsics": LaunchConfiguration("allow_unverified_camera_extrinsics"),
                    "required_camera_calibration_status": LaunchConfiguration("required_camera_calibration_status"),
                    "use_mock_camera_stream": LaunchConfiguration("use_mock_camera_stream"),
                    "camera_color_device": LaunchConfiguration("camera_color_device"),
                    "camera_depth_device": LaunchConfiguration("camera_depth_device"),
                    "camera_depth_backend": LaunchConfiguration("camera_depth_backend"),
                    "camera_v4l2_depth_unit_to_mm_scale": LaunchConfiguration("camera_v4l2_depth_unit_to_mm_scale"),
                    "left_camera_color_device": LaunchConfiguration("left_camera_color_device"),
                    "left_camera_depth_device": LaunchConfiguration("left_camera_depth_device"),
                    "left_camera_enable_depth": LaunchConfiguration("left_camera_enable_depth"),
                    "left_camera_fps": LaunchConfiguration("left_camera_fps"),
                    "left_camera_rotate_180": LaunchConfiguration("left_camera_rotate_180"),
                    "left_camera_depth_obsensor_index": LaunchConfiguration("left_camera_depth_obsensor_index"),
                    "right_camera_color_device": LaunchConfiguration("right_camera_color_device"),
                    "right_camera_depth_device": LaunchConfiguration("right_camera_depth_device"),
                    "right_camera_enable_depth": LaunchConfiguration("right_camera_enable_depth"),
                    "right_camera_fps": LaunchConfiguration("right_camera_fps"),
                    "right_camera_rotate_180": LaunchConfiguration("right_camera_rotate_180"),
                    "publish_fake_joint_states": LaunchConfiguration("publish_fake_joint_states"),
                    "detector_executable": LaunchConfiguration("detector_executable"),
                    "detector_model_path": LaunchConfiguration("detector_model_path"),
                    "detector_image_topic": LaunchConfiguration("detector_image_topic"),
                    "detector_allowed_class_ids": LaunchConfiguration("detector_allowed_class_ids"),
                    "object_geometry_file": LaunchConfiguration("object_geometry_file"),
                    "depth_require_depth_aligned_detections": LaunchConfiguration("depth_require_depth_aligned_detections"),
                    "depth_require_camera_info_depth_frame": LaunchConfiguration("depth_require_camera_info_depth_frame"),
                    "depth_expected_detection_frame": LaunchConfiguration("depth_expected_detection_frame"),
                    "ball_require_depth_aligned_detections": LaunchConfiguration("ball_require_depth_aligned_detections"),
                    "ball_require_camera_info_depth_frame": LaunchConfiguration("ball_require_camera_info_depth_frame"),
                    "ball_expected_detection_frame": LaunchConfiguration("ball_expected_detection_frame"),
                    "table_timer_hz": LaunchConfiguration("table_timer_hz"),
                    "table_min_depth_mm": LaunchConfiguration("table_min_depth_mm"),
                    "table_max_depth_mm": LaunchConfiguration("table_max_depth_mm"),
                    "table_plane_threshold_mm": LaunchConfiguration("table_plane_threshold_mm"),
                    "table_color_distance_threshold": LaunchConfiguration("table_color_distance_threshold"),
                    "table_min_inlier_ratio": LaunchConfiguration("table_min_inlier_ratio"),
                    "table_min_inliers": LaunchConfiguration("table_min_inliers"),
                    "pick_assist_rgb_overlay_topic": LaunchConfiguration("pick_assist_rgb_overlay_topic"),
                    "left_robot_ip": LaunchConfiguration("left_robot_ip"),
                    "right_robot_ip": LaunchConfiguration("right_robot_ip"),
                    "left_base_xyz": LaunchConfiguration("left_base_xyz"),
                    "left_base_rpy": LaunchConfiguration("left_base_rpy"),
                    "right_base_xyz": LaunchConfiguration("right_base_xyz"),
                    "right_base_rpy": LaunchConfiguration("right_base_rpy"),
                    "left_robot_port": LaunchConfiguration("left_robot_port"),
                    "right_robot_port": LaunchConfiguration("right_robot_port"),
                    "robot_state_query_interval": LaunchConfiguration("robot_state_query_interval"),
                    "left_gripper_port": LaunchConfiguration("left_gripper_port"),
                    "right_gripper_port": LaunchConfiguration("right_gripper_port"),
                    "scene_age_limit_ms": LaunchConfiguration("scene_age_limit_ms"),
                    "robot_state_age_limit_ms": LaunchConfiguration("robot_state_age_limit_ms"),
                    "planning_time": LaunchConfiguration("planning_time"),
                    "planning_attempts": LaunchConfiguration("planning_attempts"),
                    "allow_dual_arm_sequential_fallback": LaunchConfiguration("allow_dual_arm_sequential_fallback"),
                    "apply_default_tcp_orientation_to_dual_pose_targets": LaunchConfiguration(
                        "apply_default_tcp_orientation_to_dual_pose_targets"
                    ),
                    "allow_vendor_direct_cartesian": LaunchConfiguration("allow_vendor_direct_cartesian"),
                    "vendor_direct_cartesian_profiles": LaunchConfiguration("vendor_direct_cartesian_profiles"),
                    "use_sim_time": LaunchConfiguration("use_sim_time"),
                    "scene_fusion_input_topics": LaunchConfiguration("scene_fusion_input_topics"),
                    "scene_fusion_rgb_detection_topics": LaunchConfiguration("scene_fusion_rgb_detection_topics"),
                    "execution_backend": LaunchConfiguration("execution_backend"),
                    "simulation_mode": LaunchConfiguration("simulation_mode"),
                    "sim_grasp_contact_threshold_m": LaunchConfiguration("sim_grasp_contact_threshold_m"),
                    "sim_contact_retry_max": LaunchConfiguration("sim_contact_retry_max"),
                    "sim_robot_state_freshness_max_age_s": LaunchConfiguration("sim_robot_state_freshness_max_age_s"),
                    "sim_visual_playback_rate_hz": LaunchConfiguration("sim_visual_playback_rate_hz"),
                    "sim_basket_accept_radius_m": LaunchConfiguration("sim_basket_accept_radius_m"),
                    "sim_basket_accept_z_below_rim_m": LaunchConfiguration("sim_basket_accept_z_below_rim_m"),
                    "sim_basketball_pregrasp_left_joints_rad": LaunchConfiguration("sim_basketball_pregrasp_left_joints_rad"),
                    "sim_basketball_pregrasp_right_joints_rad": LaunchConfiguration("sim_basketball_pregrasp_right_joints_rad"),
                    "sim_soccer_ball_pregrasp_left_joints_rad": LaunchConfiguration("sim_soccer_ball_pregrasp_left_joints_rad"),
                    "sim_soccer_ball_pregrasp_right_joints_rad": LaunchConfiguration("sim_soccer_ball_pregrasp_right_joints_rad"),
                    "sim_basketball_release_left_joints_rad": LaunchConfiguration("sim_basketball_release_left_joints_rad"),
                    "sim_basketball_release_right_joints_rad": LaunchConfiguration("sim_basketball_release_right_joints_rad"),
                    "sim_soccer_ball_release_left_joints_rad": LaunchConfiguration("sim_soccer_ball_release_left_joints_rad"),
                    "sim_soccer_ball_release_right_joints_rad": LaunchConfiguration("sim_soccer_ball_release_right_joints_rad"),
                    "sim_bottle_grasp_right_joints_rad": LaunchConfiguration("sim_bottle_grasp_right_joints_rad"),
                    "sim_cup_grasp_left_joints_rad": LaunchConfiguration("sim_cup_grasp_left_joints_rad"),
                    "sim_cap_workspace_left_joints_rad": LaunchConfiguration("sim_cap_workspace_left_joints_rad"),
                    "sim_pour_tilt_right_joints_rad": LaunchConfiguration("sim_pour_tilt_right_joints_rad"),
                    "sim_place_left_joints_rad": LaunchConfiguration("sim_place_left_joints_rad"),
                    "sim_place_right_joints_rad": LaunchConfiguration("sim_place_right_joints_rad"),
                }.items(),
            )
        ]
    )
