from launch import LaunchDescription
from launch_ros.actions import Node


def generate_launch_description():
    return LaunchDescription(
        [
            Node(
                package="scene_fusion",
                executable="scene_fusion_node.py",
                name="scene_fusion",
                output="screen",
            )
        ]
    )
