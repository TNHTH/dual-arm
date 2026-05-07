from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node


def generate_launch_description():
    return LaunchDescription(
        [
            DeclareLaunchArgument("left_gripper_slave_id", default_value="9"),
            DeclareLaunchArgument("right_gripper_slave_id", default_value="10"),
            DeclareLaunchArgument("left_gripper_command_service", default_value="/gripper0/epg50_gripper/command"),
            DeclareLaunchArgument("right_gripper_command_service", default_value="/gripper1/epg50_gripper/command"),
            DeclareLaunchArgument("left_gripper_status_service", default_value="/gripper0/epg50_gripper/status"),
            DeclareLaunchArgument("right_gripper_status_service", default_value="/gripper1/epg50_gripper/status"),
            DeclareLaunchArgument("left_gripper_status_topic", default_value="/gripper0/epg50_gripper/status_stream"),
            DeclareLaunchArgument("right_gripper_status_topic", default_value="/gripper1/epg50_gripper/status_stream"),
            DeclareLaunchArgument("gripper_command_timeout_s", default_value="8.0"),
            DeclareLaunchArgument("allow_vendor_direct_cartesian", default_value="false"),
            DeclareLaunchArgument("vendor_direct_cartesian_profiles", default_value=""),
            DeclareLaunchArgument("execution_backend", default_value="hardware"),
            DeclareLaunchArgument("sim_grasp_contact_threshold_m", default_value="0.04"),
            DeclareLaunchArgument("sim_contact_retry_max", default_value="2"),
            DeclareLaunchArgument("sim_robot_state_freshness_max_age_s", default_value="0.5"),
            DeclareLaunchArgument("sim_visual_playback_rate_hz", default_value="20.0"),
            Node(
                package="execution_adapter",
                executable="execution_adapter_node.py",
                name="execution_adapter",
                parameters=[
                    {
                        "left_gripper_slave_id": LaunchConfiguration("left_gripper_slave_id"),
                        "right_gripper_slave_id": LaunchConfiguration("right_gripper_slave_id"),
                        "left_gripper_command_service": LaunchConfiguration("left_gripper_command_service"),
                        "right_gripper_command_service": LaunchConfiguration("right_gripper_command_service"),
                        "left_gripper_status_service": LaunchConfiguration("left_gripper_status_service"),
                        "right_gripper_status_service": LaunchConfiguration("right_gripper_status_service"),
                        "left_gripper_status_topic": LaunchConfiguration("left_gripper_status_topic"),
                        "right_gripper_status_topic": LaunchConfiguration("right_gripper_status_topic"),
                        "gripper_command_timeout_s": LaunchConfiguration("gripper_command_timeout_s"),
                        "allow_vendor_direct_cartesian": LaunchConfiguration("allow_vendor_direct_cartesian"),
                        "vendor_direct_cartesian_profiles": LaunchConfiguration("vendor_direct_cartesian_profiles"),
                        "execution_backend": LaunchConfiguration("execution_backend"),
                        "sim_grasp_contact_threshold_m": LaunchConfiguration("sim_grasp_contact_threshold_m"),
                        "sim_contact_retry_max": LaunchConfiguration("sim_contact_retry_max"),
                        "sim_robot_state_freshness_max_age_s": LaunchConfiguration("sim_robot_state_freshness_max_age_s"),
                        "sim_visual_playback_rate_hz": LaunchConfiguration("sim_visual_playback_rate_hz"),
                    }
                ],
                output="screen",
            )
        ]
    )
