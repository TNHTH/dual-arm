from launch import LaunchDescription
from launch_ros.actions import Node


def generate_launch_description():
    return LaunchDescription(
        [
            Node(
                package="dualarm_task_manager",
                executable="dualarm_task_manager_node.py",
                name="dualarm_task_manager",
                output="screen",
            )
        ]
    )
