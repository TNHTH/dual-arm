from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node


SYSTEM_LIBSTDCXX = "/usr/lib/x86_64-linux-gnu/libstdc++.so.6"


def generate_launch_description():
    return LaunchDescription(
        [
            DeclareLaunchArgument("camera_info_topic", default_value="/camera/depth/camera_info"),
            DeclareLaunchArgument("depth_topic", default_value="/camera/depth/image_raw"),
            DeclareLaunchArgument("detection_topic", default_value="/perception/detection_2d"),
            DeclareLaunchArgument("bbox3d_topic", default_value="/depth_handler/bbox3d"),
            DeclareLaunchArgument("pointcloud_topic", default_value="/depth_handler/pointcloud"),
            DeclareLaunchArgument("visualization_topic", default_value="/depth_handler/visualization"),
            DeclareLaunchArgument("target_frame", default_value="world"),
            DeclareLaunchArgument("enable_visualization", default_value="true"),
            DeclareLaunchArgument("enable_pointcloud", default_value="true"),
            Node(
                package="depth_handler",
                executable="depth_processor_node",
                name="depth_processor_node",
                output="screen",
                additional_env={"LD_PRELOAD": SYSTEM_LIBSTDCXX},
                parameters=[
                    {
                        "camera_info_topic": LaunchConfiguration("camera_info_topic"),
                        "depth_topic": LaunchConfiguration("depth_topic"),
                        "detection_topic": LaunchConfiguration("detection_topic"),
                        "bbox3d_topic": LaunchConfiguration("bbox3d_topic"),
                        "pointcloud_topic": LaunchConfiguration("pointcloud_topic"),
                        "visualization_topic": LaunchConfiguration("visualization_topic"),
                        "target_frame": LaunchConfiguration("target_frame"),
                        "enable_visualization": LaunchConfiguration("enable_visualization"),
                        "enable_pointcloud": LaunchConfiguration("enable_pointcloud"),
                    }
                ],
            ),
        ]
    )
