from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node


def generate_launch_description():
    return LaunchDescription(
        [
            DeclareLaunchArgument("reobserve_once_enabled", default_value="true"),
            DeclareLaunchArgument("reobserve_once_timeout_sec", default_value="1.5"),
            DeclareLaunchArgument("reobserve_once_interval_sec", default_value="0.05"),
            Node(
                package="dualarm_task_manager",
                executable="dualarm_task_manager_node.py",
                name="dualarm_task_manager",
                output="screen",
                parameters=[
                    {
                        "reobserve_once_enabled": LaunchConfiguration("reobserve_once_enabled"),
                        "reobserve_once_timeout_sec": LaunchConfiguration("reobserve_once_timeout_sec"),
                        "reobserve_once_interval_sec": LaunchConfiguration("reobserve_once_interval_sec"),
                    }
                ],
            )
        ]
    )
