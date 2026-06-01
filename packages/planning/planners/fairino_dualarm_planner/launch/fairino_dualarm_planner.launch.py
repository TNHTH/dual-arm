from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import Command, PathJoinSubstitution
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node
from launch_ros.parameter_descriptions import ParameterValue
from launch_ros.substitutions import FindPackageShare
import os
import yaml
from ament_index_python.packages import get_package_share_directory


SYSTEM_LIBSTDCXX = "/usr/lib/x86_64-linux-gnu/libstdc++.so.6"


def load_yaml(package_name, relative_path):
    package_path = get_package_share_directory(package_name)
    absolute_path = os.path.join(package_path, relative_path)
    with open(absolute_path, "r", encoding="utf-8") as file:
        return yaml.safe_load(file)


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
            DeclareLaunchArgument("scene_age_limit_ms", default_value="800"),
            DeclareLaunchArgument("robot_state_age_limit_ms", default_value="100"),
            DeclareLaunchArgument("planning_time", default_value="5.0"),
            DeclareLaunchArgument("planning_attempts", default_value="10"),
            DeclareLaunchArgument("allow_dual_arm_sequential_fallback", default_value="false"),
            DeclareLaunchArgument("apply_default_tcp_orientation_to_dual_pose_targets", default_value="false"),
            Node(
                package="fairino_dualarm_planner",
                executable="fairino_dualarm_planner_node",
                name="fairino_dualarm_planner",
                additional_env={"LD_PRELOAD": SYSTEM_LIBSTDCXX},
                output="screen",
                parameters=[
                    {
                        "scene_topic": "/scene_fusion/scene_objects",
                        "planning_time": ParameterValue(LaunchConfiguration("planning_time"), value_type=float),
                        "planning_attempts": ParameterValue(LaunchConfiguration("planning_attempts"), value_type=int),
                        "scene_age_limit_ms": ParameterValue(LaunchConfiguration("scene_age_limit_ms"), value_type=int),
                        "robot_state_age_limit_ms": ParameterValue(LaunchConfiguration("robot_state_age_limit_ms"), value_type=int),
                        "allow_dual_arm_sequential_fallback": ParameterValue(
                            LaunchConfiguration("allow_dual_arm_sequential_fallback"),
                            value_type=bool,
                        ),
                        "apply_default_tcp_orientation_to_dual_pose_targets": ParameterValue(
                            LaunchConfiguration("apply_default_tcp_orientation_to_dual_pose_targets"),
                            value_type=bool,
                        ),
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
                        "robot_description_kinematics": load_yaml(
                            "fairino_dualarm_moveit_config",
                            "config/kinematics.yaml",
                        ),
                    }
                ],
            )
        ]
    )
