import os
import yaml

from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.conditions import IfCondition
from launch.substitutions import Command, LaunchConfiguration, PathJoinSubstitution
from launch_ros.actions import Node
from launch_ros.substitutions import FindPackageShare


def load_yaml(package_name, relative_path):
    package_path = get_package_share_directory(package_name)
    absolute_path = os.path.join(package_path, relative_path)
    with open(absolute_path, "r", encoding="utf-8") as file:
        return yaml.safe_load(file)


def generate_launch_description():
    use_sim_time = LaunchConfiguration("use_sim_time")
    publish_fake_joint_states = LaunchConfiguration("publish_fake_joint_states")
    left_base_xyz = LaunchConfiguration("left_base_xyz")
    left_base_rpy = LaunchConfiguration("left_base_rpy")
    right_base_xyz = LaunchConfiguration("right_base_xyz")
    right_base_rpy = LaunchConfiguration("right_base_rpy")
    description_package = "fairino_dualarm_description"
    config_package = "fairino_dualarm_moveit_config"

    robot_description_content = Command(
        [
            "xacro ",
            PathJoinSubstitution(
                [
                    FindPackageShare(description_package),
                    "urdf",
                    "fairino_dualarm.urdf.xacro",
                ]
            ),
            " left_base_xyz:=", left_base_xyz,
            " left_base_rpy:=", left_base_rpy,
            " right_base_xyz:=", right_base_xyz,
            " right_base_rpy:=", right_base_rpy,
        ]
    )
    robot_description = {"robot_description": robot_description_content}

    robot_description_semantic = {
        "robot_description_semantic": Command(
            [
                "cat ",
                PathJoinSubstitution(
                    [
                        FindPackageShare(config_package),
                        "config",
                        "fairino_dualarm.srdf",
                    ]
                ),
            ]
        )
    }

    robot_description_kinematics = {
        "robot_description_kinematics": load_yaml(config_package, "config/kinematics.yaml")
    }
    planning_pipelines = {
        "planning_pipelines": ["ompl"],
        "default_planning_pipeline": "ompl",
        "ompl": load_yaml(config_package, "config/ompl_planning.yaml"),
    }
    joint_limits = {"robot_description_planning": load_yaml(config_package, "config/joint_limits.yaml")}
    trajectory_execution = {
        "moveit_manage_controllers": False,
        "trajectory_execution.allowed_execution_duration_scaling": 1.2,
        "trajectory_execution.allowed_goal_duration_margin": 0.5,
        "trajectory_execution.allowed_start_tolerance": 0.01,
    }
    moveit_controllers = load_yaml(config_package, "config/moveit_controllers.yaml")
    planning_scene_monitor_parameters = {
        "publish_planning_scene": True,
        "publish_geometry_updates": True,
        "publish_state_updates": True,
        "publish_transforms_updates": True,
    }

    robot_state_publisher = Node(
        package="robot_state_publisher",
        executable="robot_state_publisher",
        output="screen",
        parameters=[robot_description, {"use_sim_time": use_sim_time}],
    )

    joint_state_publisher = Node(
        package="joint_state_publisher",
        executable="joint_state_publisher",
        output="screen",
        condition=IfCondition(publish_fake_joint_states),
        parameters=[robot_description, {"use_sim_time": use_sim_time}],
    )

    move_group = Node(
        package="moveit_ros_move_group",
        executable="move_group",
        output="screen",
        parameters=[
            robot_description,
            robot_description_semantic,
            robot_description_kinematics,
            planning_pipelines,
            joint_limits,
            moveit_controllers,
            trajectory_execution,
            planning_scene_monitor_parameters,
            {"use_sim_time": use_sim_time},
        ],
    )

    return LaunchDescription(
        [
            DeclareLaunchArgument("use_sim_time", default_value="false"),
            DeclareLaunchArgument("publish_fake_joint_states", default_value="false"),
            DeclareLaunchArgument("left_base_xyz", default_value="0 0.35 0"),
            DeclareLaunchArgument("left_base_rpy", default_value="0 0 0"),
            DeclareLaunchArgument("right_base_xyz", default_value="0 -0.35 0"),
            DeclareLaunchArgument("right_base_rpy", default_value="0 0 3.141592653589793"),
            robot_state_publisher,
            joint_state_publisher,
            move_group,
        ]
    )
