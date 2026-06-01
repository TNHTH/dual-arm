from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import LaunchConfiguration
from ament_index_python.packages import get_package_share_directory
import os


def generate_launch_description():
    competition_launch = os.path.join(
        get_package_share_directory("dualarm_bringup"),
        "launch",
        "competition.launch.py",
    )
    return LaunchDescription(
        [
            IncludeLaunchDescription(
                PythonLaunchDescriptionSource(competition_launch),
                launch_arguments={
                    "start_hardware": LaunchConfiguration("start_hardware"),
                    "start_detector": LaunchConfiguration("start_detector"),
                    "start_camera_bridge": LaunchConfiguration("start_camera_bridge"),
                    "use_mock_camera_stream": LaunchConfiguration("use_mock_camera_stream"),
                    "publish_fake_joint_states": LaunchConfiguration("publish_fake_joint_states"),
                }.items(),
            )
        ]
    )
