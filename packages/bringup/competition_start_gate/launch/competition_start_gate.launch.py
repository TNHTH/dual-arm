from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node


def generate_launch_description():
    return LaunchDescription(
        [
            DeclareLaunchArgument("start_mode", default_value="external_gate"),
            DeclareLaunchArgument("start_signal_topic", default_value="/competition/start_signal"),
            DeclareLaunchArgument("task_sequence", default_value="handover,pouring"),
            Node(
                package="competition_start_gate",
                executable="competition_start_gate_node.py",
                name="competition_start_gate",
                output="screen",
                parameters=[
                    {
                        "start_mode": LaunchConfiguration("start_mode"),
                        "start_signal_topic": LaunchConfiguration("start_signal_topic"),
                        "task_sequence": LaunchConfiguration("task_sequence"),
                    }
                ],
            ),
        ]
    )
