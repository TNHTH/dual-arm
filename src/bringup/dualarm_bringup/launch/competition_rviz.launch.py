from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import LaunchConfiguration
from ament_index_python.packages import get_package_share_directory
import os


def _include(package_name: str, relative_launch: str, launch_arguments=None):
    return IncludeLaunchDescription(
        PythonLaunchDescriptionSource(
            os.path.join(get_package_share_directory(package_name), "launch", relative_launch)
        ),
        launch_arguments=(launch_arguments or {}).items(),
    )


def generate_launch_description():
    return LaunchDescription(
        [
            DeclareLaunchArgument("start_hardware", default_value="true"),
            DeclareLaunchArgument("start_detector", default_value="true"),
            DeclareLaunchArgument("start_table_surface_detector", default_value="true"),
            DeclareLaunchArgument("start_camera_bridge", default_value="true"),
            DeclareLaunchArgument("use_mock_camera_stream", default_value="false"),
            DeclareLaunchArgument("publish_fake_joint_states", default_value="false"),
            DeclareLaunchArgument("left_base_xyz", default_value="0 0.35 0"),
            DeclareLaunchArgument("left_base_rpy", default_value="0 0 0"),
            DeclareLaunchArgument("right_base_xyz", default_value="0 -0.35 0"),
            DeclareLaunchArgument("right_base_rpy", default_value="0 0 3.141592653589793"),
            DeclareLaunchArgument("dry_run", default_value="true"),
            DeclareLaunchArgument("enable_action_bridge", default_value="false"),
            DeclareLaunchArgument("rviz", default_value="true"),
            _include(
                "dualarm_bringup",
                "competition_core.launch.py",
                {
                    "start_hardware": LaunchConfiguration("start_hardware"),
                    "start_detector": LaunchConfiguration("start_detector"),
                    "start_table_surface_detector": LaunchConfiguration("start_table_surface_detector"),
                    "start_camera_bridge": LaunchConfiguration("start_camera_bridge"),
                    "use_mock_camera_stream": LaunchConfiguration("use_mock_camera_stream"),
                    "publish_fake_joint_states": LaunchConfiguration("publish_fake_joint_states"),
                    "left_base_xyz": LaunchConfiguration("left_base_xyz"),
                    "left_base_rpy": LaunchConfiguration("left_base_rpy"),
                    "right_base_xyz": LaunchConfiguration("right_base_xyz"),
                    "right_base_rpy": LaunchConfiguration("right_base_rpy"),
                },
            ),
            _include(
                "competition_rviz_tools",
                "competition_rviz.launch.py",
                {
                    "dry_run": LaunchConfiguration("dry_run"),
                    "enable_action_bridge": LaunchConfiguration("enable_action_bridge"),
                    "rviz": LaunchConfiguration("rviz"),
                },
            ),
        ]
    )
