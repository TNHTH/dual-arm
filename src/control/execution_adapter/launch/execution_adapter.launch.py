from launch import LaunchDescription
from launch_ros.actions import Node


def generate_launch_description():
    return LaunchDescription(
        [
            Node(
                package="execution_adapter",
                executable="execution_adapter_node.py",
                name="execution_adapter",
                output="screen",
            )
        ]
    )
