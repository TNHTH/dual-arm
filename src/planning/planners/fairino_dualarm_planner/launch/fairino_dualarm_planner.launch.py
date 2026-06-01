from launch import LaunchDescription
from launch.substitutions import Command, PathJoinSubstitution
from launch_ros.actions import Node
from launch_ros.substitutions import FindPackageShare


def generate_launch_description():
    robot_description_content = Command(
        [
            "xacro ",
            PathJoinSubstitution(
                [
                    FindPackageShare("fairino_dualarm_description"),
                    "urdf",
                    "fairino_dualarm.urdf.xacro",
                ]
            ),
        ]
    )
    return LaunchDescription(
        [
            Node(
                package="fairino_dualarm_planner",
                executable="fairino_dualarm_planner_node",
                name="fairino_dualarm_planner",
                output="screen",
                parameters=[
                    {
                        "scene_topic": "/scene_fusion/scene_objects",
                        "planning_time": 5.0,
                        "planning_attempts": 10,
                        "robot_description": robot_description_content,
                        "robot_description_semantic": Command(
                            [
                                "cat ",
                                PathJoinSubstitution(
                                    [
                                        FindPackageShare("fairino_dualarm_moveit_config"),
                                        "config",
                                        "fairino_dualarm.srdf",
                                    ]
                                ),
                            ]
                        ),
                    }
                ],
            )
        ]
    )
