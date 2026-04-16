from launch import LaunchDescription
from launch_ros.actions import Node


def generate_launch_description():
    return LaunchDescription(
        [
            Node(
                package="competition_console_api",
                executable="competition_console_api_node.py",
                name="competition_console_api",
                output="screen",
            ),
        ]
    )
