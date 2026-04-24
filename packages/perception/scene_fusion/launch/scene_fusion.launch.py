from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node


def generate_launch_description():
    return LaunchDescription(
        [
            DeclareLaunchArgument(
                "scene_fusion_input_topics",
                default_value="['/perception/scene_objects','/perception/ball_basket_scene_objects','/perception/table_scene_objects']",
            ),
            DeclareLaunchArgument("scene_fusion_output_topic", default_value="/scene_fusion/raw_scene_objects"),
            DeclareLaunchArgument("scene_fusion_stability_count", default_value="5"),
            DeclareLaunchArgument("scene_fusion_stale_timeout", default_value="0.4"),
            DeclareLaunchArgument("scene_fusion_lost_timeout", default_value="1.0"),
            Node(
                package="scene_fusion",
                executable="scene_fusion_node.py",
                name="scene_fusion",
                output="screen",
                parameters=[
                    {
                        "input_topics": LaunchConfiguration("scene_fusion_input_topics"),
                        "output_topic": LaunchConfiguration("scene_fusion_output_topic"),
                        "stability_count": LaunchConfiguration("scene_fusion_stability_count"),
                        "stale_timeout": LaunchConfiguration("scene_fusion_stale_timeout"),
                        "lost_timeout": LaunchConfiguration("scene_fusion_lost_timeout"),
                    }
                ],
            )
        ]
    )
