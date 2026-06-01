from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node
from ament_index_python.packages import get_package_share_directory
import os


def generate_launch_description():
    pkg_share = get_package_share_directory("tf_node")
    default_config = os.path.join(pkg_share, "config", "calibration_transforms.yaml")

    return LaunchDescription(
        [
            DeclareLaunchArgument("config_file", default_value=default_config),
            DeclareLaunchArgument("require_verified_calibration", default_value="true"),
            DeclareLaunchArgument("allow_unverified_extrinsics", default_value="false"),
            DeclareLaunchArgument("required_calibration_status", default_value="verified"),
            Node(
                package="tf_node",
                executable="static_frame_authority.py",
                name="tf_frame_authority",
                output="screen",
                parameters=[
                    {
                        "config_file": LaunchConfiguration("config_file"),
                        "require_verified_calibration": LaunchConfiguration("require_verified_calibration"),
                        "allow_unverified_extrinsics": LaunchConfiguration("allow_unverified_extrinsics"),
                        "required_calibration_status": LaunchConfiguration("required_calibration_status"),
                    }
                ],
            ),
        ]
    )
