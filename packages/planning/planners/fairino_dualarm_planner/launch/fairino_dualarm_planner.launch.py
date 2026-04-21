from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import Command, PathJoinSubstitution
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node
from launch_ros.substitutions import FindPackageShare


SYSTEM_LIBSTDCXX = "/usr/lib/x86_64-linux-gnu/libstdc++.so.6"


def generate_launch_description():
    left_base_x = LaunchConfiguration("left_base_x")
    left_base_y = LaunchConfiguration("left_base_y")
    left_base_z = LaunchConfiguration("left_base_z")
    left_base_roll = LaunchConfiguration("left_base_roll")
    left_base_pitch = LaunchConfiguration("left_base_pitch")
    left_base_yaw = LaunchConfiguration("left_base_yaw")
    right_base_x = LaunchConfiguration("right_base_x")
    right_base_y = LaunchConfiguration("right_base_y")
    right_base_z = LaunchConfiguration("right_base_z")
    right_base_roll = LaunchConfiguration("right_base_roll")
    right_base_pitch = LaunchConfiguration("right_base_pitch")
    right_base_yaw = LaunchConfiguration("right_base_yaw")
    robot_description_content = Command(
        [
            "xacro ",
            PathJoinSubstitution(
                [
                    FindPackageShare("fairino_dualarm_description"),
                    "urdf",
                    "fairino_dualarm.urdf.xacro",
                ]
            ),
            " left_base_x:=", left_base_x,
            " left_base_y:=", left_base_y,
            " left_base_z:=", left_base_z,
            " left_base_roll:=", left_base_roll,
            " left_base_pitch:=", left_base_pitch,
            " left_base_yaw:=", left_base_yaw,
            " right_base_x:=", right_base_x,
            " right_base_y:=", right_base_y,
            " right_base_z:=", right_base_z,
            " right_base_roll:=", right_base_roll,
            " right_base_pitch:=", right_base_pitch,
            " right_base_yaw:=", right_base_yaw,
        ]
    )
    return LaunchDescription(
        [
            DeclareLaunchArgument("left_base_x", default_value="0"),
            DeclareLaunchArgument("left_base_y", default_value="0.35"),
            DeclareLaunchArgument("left_base_z", default_value="0"),
            DeclareLaunchArgument("left_base_roll", default_value="0"),
            DeclareLaunchArgument("left_base_pitch", default_value="0"),
            DeclareLaunchArgument("left_base_yaw", default_value="0"),
            DeclareLaunchArgument("right_base_x", default_value="0"),
            DeclareLaunchArgument("right_base_y", default_value="-0.35"),
            DeclareLaunchArgument("right_base_z", default_value="0"),
            DeclareLaunchArgument("right_base_roll", default_value="0"),
            DeclareLaunchArgument("right_base_pitch", default_value="0"),
            DeclareLaunchArgument("right_base_yaw", default_value="3.141592653589793"),
            Node(
                package="fairino_dualarm_planner",
                executable="fairino_dualarm_planner_node",
                name="fairino_dualarm_planner",
                additional_env={"LD_PRELOAD": SYSTEM_LIBSTDCXX},
                output="screen",
                parameters=[
                    {
                        "scene_topic": "/scene_fusion/scene_objects",
                        "planning_time": 5.0,
                        "planning_attempts": 10,
                        "robot_description": robot_description_content,
                        "robot_description_semantic": Command(
                            [
                                "cat ",
                                PathJoinSubstitution(
                                    [
                                        FindPackageShare("fairino_dualarm_moveit_config"),
                                        "config",
                                        "fairino_dualarm.srdf",
                                    ]
                                ),
                            ]
                        ),
                    }
                ],
            )
        ]
    )
