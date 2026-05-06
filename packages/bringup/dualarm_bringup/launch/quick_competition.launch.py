"""quick_competition 快速实机旁路启动入口。

冷启动顺序：
1. ros2 launch dualarm_bringup quick_competition.launch.py dry_run:=true
2. ros2 run quick_competition quick_calibration_manager --solve
3. ros2 run quick_competition quick_competition_orchestrator --dry-run --full

TF 方向固定：
- quick_left_motion_base -> table_frame
- quick_right_motion_base -> table_frame
- table_frame -> table_frame_corrected
"""

from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.conditions import IfCondition
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node


def generate_launch_description():
    dry_run = LaunchConfiguration("dry_run")
    start_legacy_bridge = LaunchConfiguration("start_legacy_bridge")
    start_scene_provider = LaunchConfiguration("start_scene_provider")
    start_orchestrator = LaunchConfiguration("start_orchestrator")
    hardware_confirm_token = LaunchConfiguration("hardware_confirm_token")

    return LaunchDescription(
        [
            DeclareLaunchArgument("dry_run", default_value="true"),
            DeclareLaunchArgument("start_legacy_bridge", default_value="true"),
            DeclareLaunchArgument("start_scene_provider", default_value="true"),
            DeclareLaunchArgument("start_orchestrator", default_value="false"),
            DeclareLaunchArgument("hardware_confirm_token", default_value=""),
            Node(
                package="quick_competition",
                executable="legacy_fairino_bridge",
                name="legacy_fairino_bridge",
                arguments=["--spin"],
                condition=IfCondition(start_legacy_bridge),
                output="screen",
            ),
            Node(
                package="quick_competition",
                executable="quick_calibration_manager",
                name="quick_calibration_manager",
                arguments=["--spin"],
                output="screen",
            ),
            Node(
                package="quick_competition",
                executable="quick_scene_provider",
                name="quick_scene_provider",
                arguments=["--spin"],
                condition=IfCondition(start_scene_provider),
                output="screen",
            ),
            Node(
                package="quick_competition",
                executable="quick_depth_source_manager",
                name="quick_depth_source_manager",
                arguments=["--spin"],
                output="screen",
            ),
            Node(
                package="quick_competition",
                executable="quick_motion_executor",
                name="quick_motion_executor",
                arguments=["--spin"],
                output="screen",
            ),
            Node(
                package="quick_competition",
                executable="quick_preflight_check",
                name="quick_preflight_check",
                arguments=["--spin"],
                output="screen",
            ),
            Node(
                package="quick_competition",
                executable="quick_competition_orchestrator",
                name="quick_competition_orchestrator",
                arguments=["--dry-run", "--full"],
                condition=IfCondition(start_orchestrator),
                output="screen",
            ),
        ]
    )
