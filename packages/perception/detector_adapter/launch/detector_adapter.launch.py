from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node
from ament_index_python.packages import get_package_share_directory
import os


def generate_launch_description():
    pkg_share = get_package_share_directory("detector_adapter")
    default_class_map = os.path.join(pkg_share, "config", "class_map.yaml")

    return LaunchDescription(
        [
            DeclareLaunchArgument("input_topic", default_value="/detector/detections"),
            DeclareLaunchArgument("output_topic", default_value="/perception/detection_2d"),
            DeclareLaunchArgument("class_map_file", default_value=default_class_map),
            Node(
                package="detector_adapter",
                executable="detector_adapter_node.py",
                name="detector_adapter",
                output="screen",
                parameters=[
                    {
                        "input_topic": LaunchConfiguration("input_topic"),
                        "output_topic": LaunchConfiguration("output_topic"),
                        "class_map_file": LaunchConfiguration("class_map_file"),
                    }
                ],
            ),
        ]
    )
