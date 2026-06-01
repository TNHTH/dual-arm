from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node


def generate_launch_description():
    return LaunchDescription(
        [
            DeclareLaunchArgument("scene_topic", default_value="/scene_fusion/scene_objects"),
            DeclareLaunchArgument("task_event_topic", default_value="/task_manager/events"),
            DeclareLaunchArgument("evidence_event_topic", default_value="/evidence/events"),
            DeclareLaunchArgument("left_robot_state_topic", default_value="/L/robot_state"),
            DeclareLaunchArgument("right_robot_state_topic", default_value="/R/robot_state"),
            DeclareLaunchArgument("left_gripper_status_topic", default_value="/gripper0/epg50_gripper/status_stream"),
            DeclareLaunchArgument("right_gripper_status_topic", default_value="/gripper1/epg50_gripper/status_stream"),
            Node(
                package="evidence_manager",
                executable="evidence_manager_node.py",
                name="evidence_manager",
                output="screen",
                parameters=[
                    {
                        "scene_topic": LaunchConfiguration("scene_topic"),
                        "task_event_topic": LaunchConfiguration("task_event_topic"),
                        "evidence_event_topic": LaunchConfiguration("evidence_event_topic"),
                        "left_robot_state_topic": LaunchConfiguration("left_robot_state_topic"),
                        "right_robot_state_topic": LaunchConfiguration("right_robot_state_topic"),
                        "left_gripper_status_topic": LaunchConfiguration("left_gripper_status_topic"),
                        "right_gripper_status_topic": LaunchConfiguration("right_gripper_status_topic"),
                    }
                ],
            ),
        ]
    )
