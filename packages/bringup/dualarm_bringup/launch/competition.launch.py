from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, IncludeLaunchDescription
from launch.conditions import IfCondition
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node
from ament_index_python.packages import get_package_share_directory
import os


def _include(package_name: str, relative_launch: str, condition=None, launch_arguments=None):
    return IncludeLaunchDescription(
        PythonLaunchDescriptionSource(
            os.path.join(get_package_share_directory(package_name), "launch", relative_launch)
        ),
        condition=condition,
        launch_arguments=launch_arguments or {},
    )


def generate_launch_description():
    detector_adapter_share = get_package_share_directory("detector_adapter")
    detector_share = get_package_share_directory("detector")
    default_detector_class_map = os.path.join(detector_adapter_share, "config", "class_map_best_pt.yaml")
    default_detector_model = os.path.join(
        detector_share,
        "models",
        "yolov8",
        "yolo_runs",
        "final_dataset_v1",
        "weights",
        "best.pt",
    )

    return LaunchDescription(
        [
            DeclareLaunchArgument("start_detector", default_value="false"),
            DeclareLaunchArgument("start_camera_bridge", default_value="false"),
            DeclareLaunchArgument("use_mock_camera_stream", default_value="false"),
            DeclareLaunchArgument("publish_fake_joint_states", default_value="false"),
            DeclareLaunchArgument("detector_executable", default_value="detector_pt_node.py"),
            DeclareLaunchArgument("detector_model_path", default_value=default_detector_model),
            DeclareLaunchArgument("detector_image_topic", default_value="/camera/color/image_raw"),
            DeclareLaunchArgument("detector_confidence_threshold", default_value="0.5"),
            DeclareLaunchArgument("detector_device", default_value=""),
            DeclareLaunchArgument("detector_allowed_class_ids", default_value=""),
            DeclareLaunchArgument("detector_class_map_file", default_value=default_detector_class_map),
            DeclareLaunchArgument("start_hardware", default_value="false"),
            DeclareLaunchArgument("start_camera_info_interceptor", default_value="false"),
            DeclareLaunchArgument("gripper_port", default_value="auto"),
            DeclareLaunchArgument("gripper_debug", default_value="false"),
            DeclareLaunchArgument("gripper_default_slave_id", default_value="9"),
            DeclareLaunchArgument("gripper_disable_on_shutdown", default_value="false"),
            DeclareLaunchArgument("left_gripper_slave_id", default_value="9"),
            DeclareLaunchArgument("right_gripper_slave_id", default_value="10"),
            DeclareLaunchArgument("start_mode", default_value="external_gate"),
            DeclareLaunchArgument("start_signal_topic", default_value="/competition/start_signal"),
            DeclareLaunchArgument("task_sequence", default_value="handover,pouring"),
            _include("tf_node", "frame_authority.launch.py"),
            _include(
                "orbbec_gemini_bridge",
                "orbbec_gemini_bridge.launch.py",
                condition=IfCondition(LaunchConfiguration("start_camera_bridge")),
                launch_arguments={
                    "use_mock_stream": LaunchConfiguration("use_mock_camera_stream"),
                }.items(),
            ),
            _include(
                "detector_adapter",
                "detector_adapter.launch.py",
                launch_arguments={"class_map_file": LaunchConfiguration("detector_class_map_file")}.items(),
            ),
            _include("depth_handler", "depth_processor.launch.py"),
            _include("ball_basket_pose_estimator", "ball_basket_pose_estimator.launch.py"),
            _include("scene_fusion", "scene_fusion.launch.py"),
            _include("planning_scene_sync", "planning_scene_sync.launch.py"),
            _include("grasp_pose_generator", "grasp_pose_generator.launch.py"),
            _include("joint_state_aggregator", "joint_state_aggregator.launch.py"),
            _include(
                "fairino_dualarm_moveit_config",
                "move_group.launch.py",
                launch_arguments={"publish_fake_joint_states": LaunchConfiguration("publish_fake_joint_states")}.items(),
            ),
            _include("fairino_dualarm_planner", "fairino_dualarm_planner.launch.py"),
            _include(
                "execution_adapter",
                "execution_adapter.launch.py",
                launch_arguments={
                    "left_gripper_slave_id": LaunchConfiguration("left_gripper_slave_id"),
                    "right_gripper_slave_id": LaunchConfiguration("right_gripper_slave_id"),
                }.items(),
            ),
            _include("dualarm_task_manager", "dualarm_task_manager.launch.py"),
            _include(
                "competition_start_gate",
                "competition_start_gate.launch.py",
                launch_arguments={
                    "start_mode": LaunchConfiguration("start_mode"),
                    "start_signal_topic": LaunchConfiguration("start_signal_topic"),
                    "task_sequence": LaunchConfiguration("task_sequence"),
                }.items(),
            ),
            Node(
                package="detector",
                executable=LaunchConfiguration("detector_executable"),
                name="detector_node",
                condition=IfCondition(LaunchConfiguration("start_detector")),
                output="screen",
                parameters=[
                    {
                        "model_path": LaunchConfiguration("detector_model_path"),
                        "image_topic": LaunchConfiguration("detector_image_topic"),
                        "confidence_threshold": LaunchConfiguration("detector_confidence_threshold"),
                        "device": LaunchConfiguration("detector_device"),
                        "allowed_class_ids": LaunchConfiguration("detector_allowed_class_ids"),
                    }
                ],
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
                parameters=[
                    {
                        "port": LaunchConfiguration("gripper_port"),
                        "debug": LaunchConfiguration("gripper_debug"),
                        "default_slave_id": LaunchConfiguration("gripper_default_slave_id"),
                        "disable_on_shutdown": LaunchConfiguration("gripper_disable_on_shutdown"),
                    }
                ],
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
