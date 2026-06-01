from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, IncludeLaunchDescription
from launch.conditions import IfCondition
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node
from ament_index_python.packages import get_package_share_directory
import os


def _include(package_name: str, relative_launch: str, launch_arguments=None, condition=None):
    return IncludeLaunchDescription(
        PythonLaunchDescriptionSource(
            os.path.join(get_package_share_directory(package_name), "launch", relative_launch)
        ),
        launch_arguments=(launch_arguments or {}),
        condition=condition,
    )


def generate_launch_description():
    sim_share = get_package_share_directory("dualarm_simulation")
    config_file = os.path.join(sim_share, "config", "competition_gazebo_full.yaml")

    return LaunchDescription(
        [
            DeclareLaunchArgument("gui", default_value="false"),
            DeclareLaunchArgument("start_gazebo", default_value="true"),
            DeclareLaunchArgument("config_file", default_value=config_file),
            DeclareLaunchArgument("task_sequence", default_value="handover,pouring"),
            DeclareLaunchArgument("start_mode", default_value="external_gate"),
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
            # 冷启动顺序：先启动本 launch，让 sim truth / robot_state / MoveIt / task manager 就绪；
            # 再用 /competition/run 发送 start_immediately=true 的仿真 goal。
            _include(
                "gazebo_ros",
                "gazebo.launch.py",
                condition=IfCondition(LaunchConfiguration("start_gazebo")),
                launch_arguments={
                    "gui": LaunchConfiguration("gui"),
                    "server": "true",
                }.items(),
            ),
            Node(
                package="dualarm_simulation",
                executable="sim_truth_manager",
                name="sim_truth_manager",
                output="screen",
                parameters=[{"config_file": LaunchConfiguration("config_file")}],
            ),
            Node(
                package="dualarm_simulation",
                executable="sim_robot_state_publisher",
                name="sim_robot_state_publisher",
                output="screen",
                parameters=[{"config_file": LaunchConfiguration("config_file")}],
            ),
            Node(
                package="dualarm_simulation",
                executable="sim_pour_state_manager",
                name="sim_pour_state_manager",
                output="screen",
                parameters=[{"config_file": LaunchConfiguration("config_file")}],
            ),
            _include(
                "dualarm_bringup",
                "competition.launch.py",
                launch_arguments={
                    "start_hardware": "false",
                    "start_detector": "false",
                    "start_table_surface_detector": "false",
                    "start_camera_bridge": "false",
                    "publish_fake_joint_states": "false",
                    "scene_fusion_input_topics": "['/perception/sim_scene_objects']",
                    "scene_fusion_rgb_detection_topics": "",
                    "execution_backend": "sim",
                    "simulation_mode": "true",
                    "task_sequence": LaunchConfiguration("task_sequence"),
                    "start_mode": LaunchConfiguration("start_mode"),
                    "left_base_xyz": "0 0.35 0",
                    "left_base_rpy": "0 0 0",
                    "right_base_xyz": "0 -0.35 0",
                    "right_base_rpy": "0 0 180",
                    "allow_dual_arm_sequential_fallback": "true",
                    "apply_default_tcp_orientation_to_dual_pose_targets": "true",
                    "sim_grasp_contact_threshold_m": "0.04",
                    "sim_contact_retry_max": "2",
                    "sim_robot_state_freshness_max_age_s": "0.5",
                    "sim_visual_playback_rate_hz": "20.0",
                    "sim_basket_accept_radius_m": "0.15",
                    "sim_basket_accept_z_below_rim_m": "0.05",
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
            ),
        ]
    )
