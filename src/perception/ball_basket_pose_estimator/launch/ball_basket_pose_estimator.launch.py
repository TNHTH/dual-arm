from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node
from ament_index_python.packages import get_package_share_directory
import os


def generate_launch_description():
    pkg_share = get_package_share_directory("ball_basket_pose_estimator")
    config_file = os.path.join(pkg_share, "config", "roi_defaults.yaml")

    return LaunchDescription(
        [
            DeclareLaunchArgument("params_file", default_value=config_file),
            DeclareLaunchArgument("require_depth_aligned_detections", default_value="true"),
            DeclareLaunchArgument("expected_detection_frame", default_value=""),
            DeclareLaunchArgument("require_camera_info_depth_frame", default_value="true"),
            Node(
                package="ball_basket_pose_estimator",
                executable="ball_basket_pose_estimator_node.py",
                name="ball_basket_pose_estimator",
                output="screen",
                parameters=[
                    LaunchConfiguration("params_file"),
                    {
                        "require_depth_aligned_detections": LaunchConfiguration("require_depth_aligned_detections"),
                        "expected_detection_frame": LaunchConfiguration("expected_detection_frame"),
                        "require_camera_info_depth_frame": LaunchConfiguration("require_camera_info_depth_frame"),
                    },
                ],
            ),
        ]
    )
