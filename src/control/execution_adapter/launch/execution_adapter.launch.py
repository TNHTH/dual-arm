from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node


def generate_launch_description():
    return LaunchDescription(
        [
            DeclareLaunchArgument("left_gripper_slave_id", default_value="9"),
            DeclareLaunchArgument("right_gripper_slave_id", default_value="10"),
            Node(
                package="execution_adapter",
                executable="execution_adapter_node.py",
                name="execution_adapter",
                parameters=[
                    {
                        "left_gripper_slave_id": LaunchConfiguration("left_gripper_slave_id"),
                        "right_gripper_slave_id": LaunchConfiguration("right_gripper_slave_id"),
                    }
                ],
                output="screen",
            )
        ]
    )
