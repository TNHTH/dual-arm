from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.conditions import IfCondition, UnlessCondition
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node
from ament_index_python.packages import get_package_share_directory
import os


def generate_launch_description():
    pkg_share = get_package_share_directory("orbbec_gemini_bridge")
    default_camera_matrix = os.path.join(pkg_share, "config", "camera_matrix.json")
    return LaunchDescription(
        [
            DeclareLaunchArgument("color_device", default_value="auto"),
            DeclareLaunchArgument("depth_device", default_value="auto"),
            DeclareLaunchArgument("node_name", default_value="orbbec_gemini_ros_bridge"),
            DeclareLaunchArgument("color_topic", default_value="/camera/color/image_raw"),
            DeclareLaunchArgument("depth_topic", default_value="/camera/depth/image_raw"),
            DeclareLaunchArgument("color_camera_info_topic", default_value="/camera/color/camera_info"),
            DeclareLaunchArgument("depth_camera_info_topic", default_value="/camera/depth/camera_info"),
            DeclareLaunchArgument("color_frame_id", default_value="left_camera_color_frame"),
            DeclareLaunchArgument("depth_frame_id", default_value="left_camera_depth_frame"),
            DeclareLaunchArgument("depth_backend", default_value="auto"),
            DeclareLaunchArgument("depth_obsensor_index", default_value="0"),
            DeclareLaunchArgument("enable_depth", default_value="true"),
            DeclareLaunchArgument("rotate_180", default_value="true"),
            DeclareLaunchArgument("use_mock_stream", default_value="false"),
            DeclareLaunchArgument("publish_color_camera_info", default_value="true"),
            DeclareLaunchArgument("depth_alignment_mode", default_value="raw_unregistered"),
            DeclareLaunchArgument("camera_matrix_file", default_value=default_camera_matrix),
            DeclareLaunchArgument("v4l2_depth_unit_to_mm_scale", default_value="0.125"),
            Node(
                package="orbbec_gemini_bridge",
                executable="orbbec_gemini_ros_bridge.py",
                name=LaunchConfiguration("node_name"),
                condition=UnlessCondition(LaunchConfiguration("use_mock_stream")),
                output="screen",
                parameters=[
                    {
                        "color_topic": LaunchConfiguration("color_topic"),
                        "depth_topic": LaunchConfiguration("depth_topic"),
                        "color_camera_info_topic": LaunchConfiguration("color_camera_info_topic"),
                        "depth_camera_info_topic": LaunchConfiguration("depth_camera_info_topic"),
                        "color_frame_id": LaunchConfiguration("color_frame_id"),
                        "depth_frame_id": LaunchConfiguration("depth_frame_id"),
                        "color_device": LaunchConfiguration("color_device"),
                        "depth_device": LaunchConfiguration("depth_device"),
                        "depth_backend": LaunchConfiguration("depth_backend"),
                        "depth_obsensor_index": LaunchConfiguration("depth_obsensor_index"),
                        "enable_depth": LaunchConfiguration("enable_depth"),
                        "rotate_180": LaunchConfiguration("rotate_180"),
                        "publish_color_camera_info": LaunchConfiguration("publish_color_camera_info"),
                        "depth_alignment_mode": LaunchConfiguration("depth_alignment_mode"),
                        "camera_matrix_file": LaunchConfiguration("camera_matrix_file"),
                        "v4l2_depth_unit_to_mm_scale": LaunchConfiguration("v4l2_depth_unit_to_mm_scale"),
                    }
                ],
            ),
            Node(
                package="orbbec_gemini_bridge",
                executable="mock_camera_stream.py",
                name=LaunchConfiguration("node_name"),
                condition=IfCondition(LaunchConfiguration("use_mock_stream")),
                output="screen",
                parameters=[
                    {
                        "color_topic": LaunchConfiguration("color_topic"),
                        "depth_topic": LaunchConfiguration("depth_topic"),
                        "color_camera_info_topic": LaunchConfiguration("color_camera_info_topic"),
                        "depth_camera_info_topic": LaunchConfiguration("depth_camera_info_topic"),
                        "color_frame_id": LaunchConfiguration("color_frame_id"),
                        "depth_frame_id": LaunchConfiguration("depth_frame_id"),
                        "publish_color_camera_info": LaunchConfiguration("publish_color_camera_info"),
                    }
                ],
            ),
        ]
    )
