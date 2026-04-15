from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, IncludeLaunchDescription
from launch.conditions import IfCondition
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node
from ament_index_python.packages import get_package_share_directory
import os


def _include(package_name: str, relative_launch: str, condition=None):
    return IncludeLaunchDescription(
        PythonLaunchDescriptionSource(
            os.path.join(get_package_share_directory(package_name), "launch", relative_launch)
        ),
        condition=condition,
    )


def generate_launch_description():
    return LaunchDescription(
        [
            DeclareLaunchArgument("start_detector", default_value="false"),
            DeclareLaunchArgument("start_hardware", default_value="false"),
            DeclareLaunchArgument("start_camera_info_interceptor", default_value="false"),
            _include("tf_node", "frame_authority.launch.py"),
            _include("detector_adapter", "detector_adapter.launch.py"),
            _include("depth_handler", "depth_processor.launch.py"),
            _include("ball_basket_pose_estimator", "ball_basket_pose_estimator.launch.py"),
            _include("scene_fusion", "scene_fusion.launch.py"),
            _include("grasp_pose_generator", "grasp_pose_generator.launch.py"),
            _include("fairino_dualarm_planner", "fairino_dualarm_planner.launch.py"),
            _include("execution_adapter", "execution_adapter.launch.py"),
            _include("dualarm_task_manager", "dualarm_task_manager.launch.py"),
            Node(
                package="detector",
                executable="detector_node_exe",
                name="detector_node",
                condition=IfCondition(LaunchConfiguration("start_detector")),
                output="screen",
            ),
            Node(
                package="camera_info_interceptor",
                executable="camera_info_interceptor_node",
                name="camera_info_interceptor_node",
                condition=IfCondition(LaunchConfiguration("start_camera_info_interceptor")),
                output="screen",
            ),
            Node(
                package="epg50_gripper_ros",
                executable="epg50_gripper_node",
                name="gripper_node",
                condition=IfCondition(LaunchConfiguration("start_hardware")),
                output="screen",
            ),
            Node(
                package="robo_ctrl",
                executable="robo_ctrl_node",
                name="left_robo_ctrl",
                condition=IfCondition(LaunchConfiguration("start_hardware")),
                parameters=[{"robot_name": "L"}],
                output="screen",
            ),
            Node(
                package="robo_ctrl",
                executable="robo_ctrl_node",
                name="right_robo_ctrl",
                condition=IfCondition(LaunchConfiguration("start_hardware")),
                parameters=[{"robot_name": "R"}],
                output="screen",
            ),
        ]
    )
