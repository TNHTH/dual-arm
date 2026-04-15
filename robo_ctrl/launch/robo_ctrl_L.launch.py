from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.conditions import IfCondition
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node
from ament_index_python.packages import get_package_share_directory
import os


ROBOT_NAME = "L"


def generate_launch_description():
    robot_ip = LaunchConfiguration("robot_ip")
    robot_port = LaunchConfiguration("robot_port")
    robot_name = LaunchConfiguration("robot_name")
    state_query_interval = LaunchConfiguration("state_query_interval")

    gripper_frame = LaunchConfiguration("gripper_frame")
    base_frame = LaunchConfiguration("base_frame")
    fake_frame = LaunchConfiguration("fake_frame")
    reference_frame = LaunchConfiguration("reference_frame")
    rate = LaunchConfiguration("rate")
    config_file = LaunchConfiguration("config_file")

    start_high_level = LaunchConfiguration("start_high_level")
    start_static_tf = LaunchConfiguration("start_static_tf")
    start_fake_gripper_tf = LaunchConfiguration("start_fake_gripper_tf")
    start_detector = LaunchConfiguration("start_detector")
    start_depth_handler = LaunchConfiguration("start_depth_handler")
    start_camera_info_interceptor = LaunchConfiguration("start_camera_info_interceptor")
    start_gripper = LaunchConfiguration("start_gripper")

    tools_pkg_dir = get_package_share_directory("tools")

    return LaunchDescription(
        [
            DeclareLaunchArgument("robot_ip", default_value="10.2.20.201", description="机器人控制器 IP"),
            DeclareLaunchArgument("robot_port", default_value="8080", description="机器人控制器端口"),
            DeclareLaunchArgument("robot_name", default_value=ROBOT_NAME, description="机器人名称"),
            DeclareLaunchArgument(
                "state_query_interval", default_value="0.01", description="机器人状态查询周期（秒）"
            ),
            DeclareLaunchArgument(
                "gripper_frame", default_value=f"{ROBOT_NAME}gripper", description="真实夹爪坐标系"
            ),
            DeclareLaunchArgument(
                "base_frame", default_value=f"{ROBOT_NAME}robot_base", description="机械臂基坐标系"
            ),
            DeclareLaunchArgument(
                "fake_frame", default_value=f"{ROBOT_NAME}fake_gripper_frame", description="虚拟夹爪坐标系"
            ),
            DeclareLaunchArgument("reference_frame", default_value="world", description="参考坐标系"),
            DeclareLaunchArgument("rate", default_value="50.0", description="TF 发布频率"),
            DeclareLaunchArgument(
                "config_file",
                default_value=os.path.join(tools_pkg_dir, "config", "static_transforms.yaml"),
                description="静态 TF 配置文件",
            ),
            DeclareLaunchArgument(
                "start_high_level",
                default_value="false",
                description="是否启动旧 high_level_node（仅调试，不进入生产链）",
            ),
            DeclareLaunchArgument("start_static_tf", default_value="false", description="是否启动静态 TF 发布器"),
            DeclareLaunchArgument(
                "start_fake_gripper_tf", default_value="false", description="是否启动虚拟夹爪 TF 发布器"
            ),
            DeclareLaunchArgument("start_detector", default_value="false", description="是否启动 detector"),
            DeclareLaunchArgument(
                "start_depth_handler", default_value="false", description="是否启动旧 depth_handler"
            ),
            DeclareLaunchArgument(
                "start_camera_info_interceptor",
                default_value="false",
                description="是否启动相机信息中继节点",
            ),
            DeclareLaunchArgument("start_gripper", default_value="false", description="是否启动 EPG50 夹爪节点"),
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
                parameters=[
                    {
                        "robot_name": robot_name,
                    }
                ],
                condition=IfCondition(start_high_level),
                output="screen",
            ),
            Node(
                package="tools",
                executable="fake_gripper_tf_publisher_node",
                name=f"{ROBOT_NAME}_fake_gripper_tf_publisher",
                parameters=[
                    {
                        "gripper_frame": gripper_frame,
                        "base_frame": base_frame,
                        "fake_frame": fake_frame,
                        "reference_frame": reference_frame,
                        "rate": rate,
                    }
                ],
                condition=IfCondition(start_fake_gripper_tf),
                output="screen",
            ),
            Node(
                package="tools",
                executable="static_tf_publisher_node",
                name="static_tf_publisher",
                parameters=[{"config_file": config_file}],
                condition=IfCondition(start_static_tf),
                output="screen",
                emulate_tty=True,
            ),
            Node(
                package="detector",
                executable="detector_node_exe",
                name="detector_node",
                condition=IfCondition(start_detector),
                output="screen",
            ),
            Node(
                package="depth_handler",
                executable="depth_processor_node",
                name="depth_handler_node",
                condition=IfCondition(start_depth_handler),
                output="screen",
            ),
            Node(
                package="camera_info_interceptor",
                executable="camera_info_interceptor_node",
                name="camera_info_interceptor_node",
                condition=IfCondition(start_camera_info_interceptor),
                output="screen",
            ),
            Node(
                package="epg50_gripper_ros",
                executable="epg50_gripper_node",
                name="gripper_node",
                condition=IfCondition(start_gripper),
                output="screen",
            ),
        ]
    )
