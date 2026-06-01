from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node


def generate_launch_description():
    return LaunchDescription(
        [
            DeclareLaunchArgument("profile", default_value="test"),
            Node(
                package="competition_console_api",
                executable="competition_console_api_node.py",
                name="competition_console_api",
                output="screen",
                parameters=[
                    {
                        "profile": LaunchConfiguration("profile"),
                        "allow_raw_motion_debug": True,
                    }
                ],
            ),
        ]
    )
