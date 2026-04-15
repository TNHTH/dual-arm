from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.conditions import IfCondition
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node


ROBOT_NAME = "R"


def generate_launch_description():
    robot_ip = LaunchConfiguration("robot_ip")
    robot_port = LaunchConfiguration("robot_port")
    robot_name = LaunchConfiguration("robot_name")
    state_query_interval = LaunchConfiguration("state_query_interval")
    start_high_level = LaunchConfiguration("start_high_level")

    return LaunchDescription(
        [
            DeclareLaunchArgument("robot_ip", default_value="10.2.20.202", description="机器人控制器 IP"),
            DeclareLaunchArgument("robot_port", default_value="8080", description="机器人控制器端口"),
            DeclareLaunchArgument("robot_name", default_value=ROBOT_NAME, description="机器人名称"),
            DeclareLaunchArgument(
                "state_query_interval", default_value="0.01", description="机器人状态查询周期（秒）"
            ),
            DeclareLaunchArgument(
                "start_high_level",
                default_value="false",
                description="是否启动旧 high_level_node（仅调试，不进入生产链）",
            ),
            Node(
                package="robo_ctrl",
                executable="robo_ctrl_node",
                name=f"{ROBOT_NAME}_robo_ctrl",
                parameters=[
                    {
                        "robot_ip": robot_ip,
                        "robot_port": robot_port,
                        "robot_name": robot_name,
                        "state_query_interval": state_query_interval,
                    }
                ],
                output="screen",
            ),
            Node(
                package="robo_ctrl",
                executable="high_level_node",
                name=f"{ROBOT_NAME}_high_level",
                parameters=[{"robot_name": robot_name}],
                condition=IfCondition(start_high_level),
                output="screen",
            ),
        ]
    )
