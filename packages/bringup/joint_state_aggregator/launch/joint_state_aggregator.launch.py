from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node


def generate_launch_description():
    return LaunchDescription(
        [
            DeclareLaunchArgument("active_arms", default_value="dual"),
            Node(
                package="joint_state_aggregator",
                executable="joint_state_aggregator_node.py",
                name="joint_state_aggregator",
                parameters=[{"active_arms": LaunchConfiguration("active_arms")}],
                output="screen",
            )
        ]
    )
