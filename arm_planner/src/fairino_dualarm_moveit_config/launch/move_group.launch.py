from launch import LaunchDescription
from launch.actions import LogInfo


def generate_launch_description():
    return LaunchDescription(
        [
            LogInfo(msg="fairino_dualarm_moveit_config 当前提供配置骨架，运行时规划由 fairino_dualarm_planner 提供。")
        ]
    )
