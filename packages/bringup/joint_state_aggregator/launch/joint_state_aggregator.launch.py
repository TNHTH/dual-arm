from launch import LaunchDescription
from launch_ros.actions import Node


def generate_launch_description():
    return LaunchDescription(
        [
            Node(
                package="joint_state_aggregator",
                executable="joint_state_aggregator_node.py",
                name="joint_state_aggregator",
                output="screen",
            )
        ]
    )
