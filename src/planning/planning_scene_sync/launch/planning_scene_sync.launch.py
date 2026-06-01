from launch import LaunchDescription
from launch_ros.actions import Node


def generate_launch_description():
    return LaunchDescription(
        [
            Node(
                package="planning_scene_sync",
                executable="planning_scene_sync_node.py",
                name="planning_scene_sync",
                output="screen",
            )
        ]
    )
