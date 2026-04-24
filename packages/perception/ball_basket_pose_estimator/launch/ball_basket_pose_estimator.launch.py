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
            DeclareLaunchArgument("node_name", default_value="ball_basket_pose_estimator"),
            DeclareLaunchArgument("world_frame", default_value="world"),
            DeclareLaunchArgument("output_topic", default_value="/perception/ball_basket_scene_objects"),
            DeclareLaunchArgument("detections_topic", default_value="/perception/detection_2d"),
            DeclareLaunchArgument("depth_topic", default_value="/camera/depth/image_raw"),
            DeclareLaunchArgument("camera_info_topic", default_value="/camera/depth/camera_info"),
            DeclareLaunchArgument("source_name", default_value="ball_basket_pose_estimator"),
            DeclareLaunchArgument("require_depth_aligned_detections", default_value="true"),
            DeclareLaunchArgument("expected_detection_frame", default_value=""),
            DeclareLaunchArgument("require_camera_info_depth_frame", default_value="true"),
            Node(
                package="ball_basket_pose_estimator",
                executable="ball_basket_pose_estimator_node.py",
                name=LaunchConfiguration("node_name"),
                output="screen",
                parameters=[
                    LaunchConfiguration("params_file"),
                    {
                        "world_frame": LaunchConfiguration("world_frame"),
                        "output_topic": LaunchConfiguration("output_topic"),
                        "detections_topic": LaunchConfiguration("detections_topic"),
                        "depth_topic": LaunchConfiguration("depth_topic"),
                        "camera_info_topic": LaunchConfiguration("camera_info_topic"),
                        "source_name": LaunchConfiguration("source_name"),
                        "require_depth_aligned_detections": LaunchConfiguration("require_depth_aligned_detections"),
                        "expected_detection_frame": LaunchConfiguration("expected_detection_frame"),
                        "require_camera_info_depth_frame": LaunchConfiguration("require_camera_info_depth_frame"),
                    },
                ],
            ),
        ]
    )
