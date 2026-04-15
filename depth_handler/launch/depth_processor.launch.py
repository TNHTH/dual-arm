from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node


def generate_launch_description():
    return LaunchDescription(
        [
            DeclareLaunchArgument("camera_info_topic", default_value="/camera/depth/camera_info"),
            DeclareLaunchArgument("depth_topic", default_value="/camera/depth/image_raw"),
            DeclareLaunchArgument("bbox2d_topic", default_value="/detector/detections"),
            DeclareLaunchArgument("bbox3d_topic", default_value="/depth_handler/bbox3d"),
            DeclareLaunchArgument("pointcloud_topic", default_value="/depth_handler/pointcloud"),
            DeclareLaunchArgument("visualization_topic", default_value="/depth_handler/visualization"),
            DeclareLaunchArgument("target_frame", default_value="world"),
            DeclareLaunchArgument("source_frame", default_value="camera_depth_frame"),
            DeclareLaunchArgument("enable_visualization", default_value="true"),
            DeclareLaunchArgument("enable_pointcloud", default_value="true"),
            Node(
                package="depth_handler",
                executable="depth_processor_node",
                name="depth_processor_node",
                output="screen",
                parameters=[
                    {
                        "camera_info_topic": LaunchConfiguration("camera_info_topic"),
                        "depth_topic": LaunchConfiguration("depth_topic"),
                        "bbox2d_topic": LaunchConfiguration("bbox2d_topic"),
                        "bbox3d_topic": LaunchConfiguration("bbox3d_topic"),
                        "pointcloud_topic": LaunchConfiguration("pointcloud_topic"),
                        "visualization_topic": LaunchConfiguration("visualization_topic"),
                        "target_frame": LaunchConfiguration("target_frame"),
                        "source_frame": LaunchConfiguration("source_frame"),
                        "enable_visualization": LaunchConfiguration("enable_visualization"),
                        "enable_pointcloud": LaunchConfiguration("enable_pointcloud"),
                    }
                ],
            ),
        ]
    )
