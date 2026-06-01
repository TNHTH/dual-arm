from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.conditions import IfCondition, UnlessCondition
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node


def generate_launch_description():
    return LaunchDescription(
        [
            DeclareLaunchArgument("color_device", default_value="/dev/video8"),
            DeclareLaunchArgument("depth_obsensor_index", default_value="0"),
            DeclareLaunchArgument("rotate_180", default_value="true"),
            DeclareLaunchArgument("use_mock_stream", default_value="false"),
            Node(
                package="orbbec_gemini_bridge",
                executable="orbbec_gemini_ros_bridge.py",
                name="orbbec_gemini_ros_bridge",
                condition=UnlessCondition(LaunchConfiguration("use_mock_stream")),
                output="screen",
                parameters=[
                    {
                        "color_device": LaunchConfiguration("color_device"),
                        "depth_obsensor_index": LaunchConfiguration("depth_obsensor_index"),
                        "rotate_180": LaunchConfiguration("rotate_180"),
                    }
                ],
            ),
            Node(
                package="orbbec_gemini_bridge",
                executable="mock_camera_stream.py",
                name="mock_camera_stream",
                condition=IfCondition(LaunchConfiguration("use_mock_stream")),
                output="screen",
            ),
        ]
    )
