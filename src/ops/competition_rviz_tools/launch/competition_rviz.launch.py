from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.conditions import IfCondition
from launch.substitutions import LaunchConfiguration
from launch.substitutions import PathJoinSubstitution
from launch_ros.actions import Node
from launch_ros.substitutions import FindPackageShare


def generate_launch_description():
    rviz_config = PathJoinSubstitution(
        [
            FindPackageShare("competition_rviz_tools"),
            "config",
            "competition_control.rviz",
        ]
    )

    return LaunchDescription(
        [
            DeclareLaunchArgument("use_sim_time", default_value="false"),
            DeclareLaunchArgument("rviz", default_value="true"),
            DeclareLaunchArgument("frame_id", default_value="world"),
            DeclareLaunchArgument("command_topic", default_value="/competition/rviz/operator_command"),
            DeclareLaunchArgument("scene_topic", default_value="/scene_fusion/scene_objects"),
            DeclareLaunchArgument("grasp_target_topic", default_value="/planning/grasp_targets"),
            DeclareLaunchArgument("marker_topic", default_value="/competition/rviz/grasp_debug_markers"),
            DeclareLaunchArgument("scene_model_pointcloud_topic", default_value="/competition/rviz/scene_model_points"),
            DeclareLaunchArgument("enable_action_bridge", default_value="false"),
            DeclareLaunchArgument("dry_run", default_value="true"),
            DeclareLaunchArgument("rviz_config", default_value=rviz_config),
            Node(
                package="competition_rviz_tools",
                executable="rviz_task_bridge",
                name="competition_rviz_task_bridge",
                output="screen",
                parameters=[
                    {
                        "use_sim_time": LaunchConfiguration("use_sim_time"),
                        "command_topic": LaunchConfiguration("command_topic"),
                        "enable_action_bridge": LaunchConfiguration("enable_action_bridge"),
                        "dry_run": LaunchConfiguration("dry_run"),
                    }
                ],
            ),
            Node(
                package="competition_rviz_tools",
                executable="scene_interactive_markers",
                name="competition_scene_interactive_markers",
                output="screen",
                parameters=[
                    {
                        "use_sim_time": LaunchConfiguration("use_sim_time"),
                        "frame_id": LaunchConfiguration("frame_id"),
                        "command_topic": LaunchConfiguration("command_topic"),
                        "scene_topic": LaunchConfiguration("scene_topic"),
                    }
                ],
            ),
            Node(
                package="competition_rviz_tools",
                executable="grasp_debug_markers",
                name="competition_grasp_debug_markers",
                output="screen",
                parameters=[
                    {
                        "use_sim_time": LaunchConfiguration("use_sim_time"),
                        "frame_id": LaunchConfiguration("frame_id"),
                        "grasp_target_topic": LaunchConfiguration("grasp_target_topic"),
                        "marker_topic": LaunchConfiguration("marker_topic"),
                    }
                ],
            ),
            Node(
                package="competition_rviz_tools",
                executable="scene_model_pointcloud",
                name="competition_scene_model_pointcloud",
                output="screen",
                parameters=[
                    {
                        "frame_id": LaunchConfiguration("frame_id"),
                        "scene_topic": LaunchConfiguration("scene_topic"),
                        "pointcloud_topic": LaunchConfiguration("scene_model_pointcloud_topic"),
                    }
                ],
            ),
            Node(
                package="rviz2",
                executable="rviz2",
                name="competition_operator_rviz",
                output="screen",
                arguments=["-d", LaunchConfiguration("rviz_config")],
                condition=IfCondition(LaunchConfiguration("rviz")),
            ),
        ]
    )
