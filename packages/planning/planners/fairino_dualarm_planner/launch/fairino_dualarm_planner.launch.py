from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import Command, PathJoinSubstitution
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node
from launch_ros.substitutions import FindPackageShare


SYSTEM_LIBSTDCXX = "/usr/lib/x86_64-linux-gnu/libstdc++.so.6"


def generate_launch_description():
    left_base_xyz = LaunchConfiguration("left_base_xyz")
    left_base_rpy = LaunchConfiguration("left_base_rpy")
    right_base_xyz = LaunchConfiguration("right_base_xyz")
    right_base_rpy = LaunchConfiguration("right_base_rpy")
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
            " left_base_xyz:=\"", left_base_xyz, "\"",
            " left_base_rpy:=\"", left_base_rpy, "\"",
            " right_base_xyz:=\"", right_base_xyz, "\"",
            " right_base_rpy:=\"", right_base_rpy, "\"",
        ]
    )
    return LaunchDescription(
        [
            DeclareLaunchArgument("left_base_xyz", default_value="0 0.35 0"),
            DeclareLaunchArgument("left_base_rpy", default_value="0 0 0"),
            DeclareLaunchArgument("right_base_xyz", default_value="0 -0.35 0"),
            DeclareLaunchArgument("right_base_rpy", default_value="0 0 0"),
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
