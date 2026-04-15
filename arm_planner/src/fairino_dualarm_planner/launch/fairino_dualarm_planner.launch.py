from launch import LaunchDescription
from launch_ros.actions import Node


def generate_launch_description():
    return LaunchDescription(
        [
            Node(
                package="fairino_dualarm_planner",
                executable="fairino_dualarm_planner_node.py",
                name="fairino_dualarm_planner",
                output="screen",
            )
        ]
    )
