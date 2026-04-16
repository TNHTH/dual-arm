from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, IncludeLaunchDescription
from launch.conditions import IfCondition
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node
from ament_index_python.packages import get_package_share_directory
import os


def _include(package_name: str, relative_launch: str, condition=None, launch_arguments=None):
    return IncludeLaunchDescription(
        PythonLaunchDescriptionSource(
            os.path.join(get_package_share_directory(package_name), "launch", relative_launch)
        ),
        condition=condition,
        launch_arguments=launch_arguments or {},
    )


def generate_launch_description():
    return LaunchDescription(
        [
            DeclareLaunchArgument("start_hardware", default_value="false"),
            DeclareLaunchArgument("start_detector", default_value="false"),
            DeclareLaunchArgument("start_camera_bridge", default_value="false"),
            DeclareLaunchArgument("use_mock_camera_stream", default_value="false"),
            DeclareLaunchArgument("publish_fake_joint_states", default_value="false"),
            DeclareLaunchArgument("start_console_web", default_value="false"),
            DeclareLaunchArgument("profile", default_value="test"),
            _include(
                "dualarm_bringup",
                "competition_core.launch.py",
                launch_arguments={
                    "start_hardware": LaunchConfiguration("start_hardware"),
                    "start_detector": LaunchConfiguration("start_detector"),
                    "start_camera_bridge": LaunchConfiguration("start_camera_bridge"),
                    "use_mock_camera_stream": LaunchConfiguration("use_mock_camera_stream"),
                    "publish_fake_joint_states": LaunchConfiguration("publish_fake_joint_states"),
                }.items(),
            ),
            Node(
                package="competition_console_api",
                executable="competition_console_api_node.py",
                name="competition_console_api",
                output="screen",
                parameters=[{"profile": LaunchConfiguration("profile")}],
            ),
            Node(
                package="competition_console_api",
                executable="competition_console_static_server.py",
                name="competition_console_web",
                condition=IfCondition(LaunchConfiguration("start_console_web")),
                output="screen",
            ),
        ]
    )
