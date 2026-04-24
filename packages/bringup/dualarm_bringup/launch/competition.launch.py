from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, IncludeLaunchDescription
from launch.conditions import IfCondition
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import LaunchConfiguration, PythonExpression
from launch_ros.actions import Node
from launch_ros.parameter_descriptions import ParameterValue
from ament_index_python.packages import get_package_share_directory
import os


SYSTEM_LIBSTDCXX = "/usr/lib/x86_64-linux-gnu/libstdc++.so.6"


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
    left_gripper_port_default = (
        "/dev/serial/by-id/usb-Prolific_Technology_Inc._USB-Serial_Controller_A7BIb114J19-if00-port0"
    )
    right_gripper_port_default = (
        "/dev/serial/by-id/usb-Prolific_Technology_Inc._USB-Serial_Controller_A_COb114J19-if00-port0"
    )
    default_detector_class_map = os.path.join(detector_adapter_share, "config", "class_map_best_pt.yaml")
    default_detector_model = os.environ.get("DUALARM_DETECTOR_MODEL_PATH") or os.path.join(
        detector_share,
        "models",
        "yolov8",
        "yolo_runs",
        "final_dataset_v1",
        "weights",
        "best.pt",
    )
    default_pick_assist_rgb_overlay_topic = "/perception/pick_assist/rgb_overlay"
    left_camera_bridge_condition = IfCondition(
        PythonExpression(
            ["'", LaunchConfiguration("start_camera_bridge"), "' == 'true' and '", LaunchConfiguration("enable_left_camera"), "' == 'true'"]
        )
    )
    right_camera_bridge_condition = IfCondition(
        PythonExpression(
            ["'", LaunchConfiguration("start_camera_bridge"), "' == 'true' and '", LaunchConfiguration("enable_right_camera"), "' == 'true'"]
        )
    )
    right_full_condition = IfCondition(PythonExpression(["'", LaunchConfiguration("dual_camera_mode"), "' == 'full'"]))
    right_detector_condition = IfCondition(
        PythonExpression(
            ["'", LaunchConfiguration("start_detector"), "' == 'true' and '", LaunchConfiguration("dual_camera_mode"), "' == 'full'"]
        )
    )
    left_depth_chain_condition = IfCondition(
        PythonExpression(
            ["'", LaunchConfiguration("enable_left_camera"), "' == 'true' and '", LaunchConfiguration("left_camera_enable_depth"), "' == 'true'"]
        )
    )
    right_depth_chain_condition = IfCondition(
        PythonExpression(
            [
                "'",
                LaunchConfiguration("dual_camera_mode"),
                "' == 'full' and '",
                LaunchConfiguration("enable_right_camera"),
                "' == 'true' and '",
                LaunchConfiguration("right_camera_enable_depth"),
                "' == 'true'",
            ]
        )
    )
    table_surface_condition = IfCondition(
        PythonExpression(
            [
                "'",
                LaunchConfiguration("start_table_surface_detector"),
                "' == 'true' and '",
                LaunchConfiguration("enable_left_camera"),
                "' == 'true' and '",
                LaunchConfiguration("left_camera_enable_depth"),
                "' == 'true'",
            ]
        )
    )

    return LaunchDescription(
        [
            DeclareLaunchArgument("start_detector", default_value="false"),
            DeclareLaunchArgument("start_table_surface_detector", default_value="true"),
            DeclareLaunchArgument("start_camera_bridge", default_value="false"),
            DeclareLaunchArgument("dual_camera_mode", default_value="reobserve_only"),
            DeclareLaunchArgument("enable_left_camera", default_value="true"),
            DeclareLaunchArgument("enable_right_camera", default_value="true"),
            DeclareLaunchArgument("require_verified_camera_extrinsics", default_value="true"),
            DeclareLaunchArgument("allow_unverified_camera_extrinsics", default_value="false"),
            DeclareLaunchArgument("required_camera_calibration_status", default_value="verified"),
            DeclareLaunchArgument("use_mock_camera_stream", default_value="false"),
            DeclareLaunchArgument("camera_color_device", default_value="auto"),
            DeclareLaunchArgument("camera_depth_device", default_value="auto"),
            DeclareLaunchArgument("camera_depth_backend", default_value="auto"),
            DeclareLaunchArgument("camera_v4l2_depth_unit_to_mm_scale", default_value="0.125"),
            DeclareLaunchArgument("left_camera_color_device", default_value="auto"),
            DeclareLaunchArgument("left_camera_depth_device", default_value="auto"),
            DeclareLaunchArgument("left_camera_depth_backend", default_value="auto"),
            DeclareLaunchArgument("left_camera_enable_depth", default_value="true"),
            DeclareLaunchArgument("left_camera_fps", default_value="5.0"),
            DeclareLaunchArgument("left_camera_color_topic", default_value="/left_camera/color/image_raw"),
            DeclareLaunchArgument("left_camera_depth_topic", default_value="/left_camera/depth/image_raw"),
            DeclareLaunchArgument("left_camera_color_info_topic", default_value="/left_camera/color/camera_info"),
            DeclareLaunchArgument("left_camera_depth_info_topic", default_value="/left_camera/depth/camera_info"),
            DeclareLaunchArgument("left_camera_color_frame", default_value="left_camera_color_frame"),
            DeclareLaunchArgument("left_camera_depth_frame", default_value="left_camera_depth_frame"),
            DeclareLaunchArgument("left_camera_rotate_180", default_value="true"),
            DeclareLaunchArgument("right_camera_color_device", default_value="auto"),
            DeclareLaunchArgument("right_camera_depth_device", default_value="auto"),
            DeclareLaunchArgument("right_camera_depth_backend", default_value="auto"),
            DeclareLaunchArgument("right_camera_enable_depth", default_value="false"),
            DeclareLaunchArgument("right_camera_fps", default_value="5.0"),
            DeclareLaunchArgument("right_camera_color_topic", default_value="/right_camera/color/image_raw"),
            DeclareLaunchArgument("right_camera_depth_topic", default_value="/right_camera/depth/image_raw"),
            DeclareLaunchArgument("right_camera_color_info_topic", default_value="/right_camera/color/camera_info"),
            DeclareLaunchArgument("right_camera_depth_info_topic", default_value="/right_camera/depth/camera_info"),
            DeclareLaunchArgument("right_camera_color_frame", default_value="right_camera_color_frame"),
            DeclareLaunchArgument("right_camera_depth_frame", default_value="right_camera_depth_frame"),
            DeclareLaunchArgument("right_camera_rotate_180", default_value="false"),
            DeclareLaunchArgument("publish_fake_joint_states", default_value="false"),
            DeclareLaunchArgument("detector_executable", default_value="detector_pt_node.py"),
            DeclareLaunchArgument("detector_model_path", default_value=default_detector_model),
            DeclareLaunchArgument("detector_image_topic", default_value="/left_camera/color/image_raw"),
            DeclareLaunchArgument("left_detector_detections_topic", default_value="/detector/left/detections"),
            DeclareLaunchArgument("right_detector_detections_topic", default_value="/detector/right/detections"),
            DeclareLaunchArgument("left_detection_2d_topic", default_value="/perception/left/detection_2d"),
            DeclareLaunchArgument("right_detection_2d_topic", default_value="/perception/right/detection_2d"),
            DeclareLaunchArgument("detector_confidence_threshold", default_value="0.5"),
            DeclareLaunchArgument("detector_device", default_value=""),
            DeclareLaunchArgument("detector_allowed_class_ids", default_value="[0,1,2,3,4,5]"),
            DeclareLaunchArgument("detector_class_map_file", default_value=default_detector_class_map),
            DeclareLaunchArgument("depth_require_depth_aligned_detections", default_value="false"),
            DeclareLaunchArgument("depth_require_camera_info_depth_frame", default_value="true"),
            DeclareLaunchArgument("depth_expected_detection_frame", default_value="left_camera_color_frame"),
            DeclareLaunchArgument("ball_require_depth_aligned_detections", default_value="false"),
            DeclareLaunchArgument("ball_require_camera_info_depth_frame", default_value="true"),
            DeclareLaunchArgument("ball_expected_detection_frame", default_value="left_camera_color_frame"),
            DeclareLaunchArgument("table_timer_hz", default_value="2.0"),
            DeclareLaunchArgument("table_min_depth_mm", default_value="60.0"),
            DeclareLaunchArgument("table_max_depth_mm", default_value="3000.0"),
            DeclareLaunchArgument("table_plane_threshold_mm", default_value="22.0"),
            DeclareLaunchArgument("table_color_distance_threshold", default_value="34.0"),
            DeclareLaunchArgument("table_min_inlier_ratio", default_value="0.45"),
            DeclareLaunchArgument("table_min_inliers", default_value="500"),
            DeclareLaunchArgument(
                "pick_assist_rgb_overlay_topic",
                default_value=default_pick_assist_rgb_overlay_topic,
            ),
            DeclareLaunchArgument("start_hardware", default_value="false"),
            DeclareLaunchArgument("left_robot_ip", default_value="192.168.58.2"),
            DeclareLaunchArgument("right_robot_ip", default_value="192.168.58.3"),
            DeclareLaunchArgument("left_base_xyz", default_value="0 0.35 0"),
            DeclareLaunchArgument("left_base_rpy", default_value="0 0 0"),
            DeclareLaunchArgument("right_base_xyz", default_value="0 -0.35 0"),
            DeclareLaunchArgument("right_base_rpy", default_value="0 0 0"),
            DeclareLaunchArgument("left_robot_port", default_value="8080"),
            DeclareLaunchArgument("right_robot_port", default_value="8080"),
            DeclareLaunchArgument("robot_state_query_interval", default_value="0.05"),
            DeclareLaunchArgument("start_camera_info_interceptor", default_value="false"),
            DeclareLaunchArgument("gripper_port", default_value="auto"),
            DeclareLaunchArgument("left_gripper_port", default_value=left_gripper_port_default),
            DeclareLaunchArgument("right_gripper_port", default_value=right_gripper_port_default),
            DeclareLaunchArgument("gripper_debug", default_value="false"),
            DeclareLaunchArgument("gripper_default_slave_id", default_value="9"),
            DeclareLaunchArgument("gripper_disable_on_shutdown", default_value="false"),
            DeclareLaunchArgument("left_gripper_slave_id", default_value="9"),
            DeclareLaunchArgument("right_gripper_slave_id", default_value="10"),
            DeclareLaunchArgument("start_mode", default_value="external_gate"),
            DeclareLaunchArgument("start_signal_topic", default_value="/competition/start_signal"),
            DeclareLaunchArgument("task_sequence", default_value="handover,pouring"),
            _include(
                "tf_node",
                "frame_authority.launch.py",
                launch_arguments={
                    "require_verified_calibration": LaunchConfiguration("require_verified_camera_extrinsics"),
                    "allow_unverified_extrinsics": LaunchConfiguration("allow_unverified_camera_extrinsics"),
                    "required_calibration_status": LaunchConfiguration("required_camera_calibration_status"),
                }.items(),
            ),
            _include(
                "orbbec_gemini_bridge",
                "orbbec_gemini_bridge.launch.py",
                condition=left_camera_bridge_condition,
                launch_arguments={
                    "use_mock_stream": LaunchConfiguration("use_mock_camera_stream"),
                    "node_name": "left_orbbec_gemini_bridge",
                    "fps": LaunchConfiguration("left_camera_fps"),
                    "color_device": LaunchConfiguration("left_camera_color_device"),
                    "depth_device": LaunchConfiguration("left_camera_depth_device"),
                    "depth_backend": LaunchConfiguration("left_camera_depth_backend"),
                    "enable_depth": LaunchConfiguration("left_camera_enable_depth"),
                    "color_topic": LaunchConfiguration("left_camera_color_topic"),
                    "depth_topic": LaunchConfiguration("left_camera_depth_topic"),
                    "color_camera_info_topic": LaunchConfiguration("left_camera_color_info_topic"),
                    "depth_camera_info_topic": LaunchConfiguration("left_camera_depth_info_topic"),
                    "color_frame_id": LaunchConfiguration("left_camera_color_frame"),
                    "depth_frame_id": LaunchConfiguration("left_camera_depth_frame"),
                    "rotate_180": LaunchConfiguration("left_camera_rotate_180"),
                    "v4l2_depth_unit_to_mm_scale": LaunchConfiguration("camera_v4l2_depth_unit_to_mm_scale"),
                }.items(),
            ),
            _include(
                "orbbec_gemini_bridge",
                "orbbec_gemini_bridge.launch.py",
                condition=right_camera_bridge_condition,
                launch_arguments={
                    "use_mock_stream": LaunchConfiguration("use_mock_camera_stream"),
                    "node_name": "right_orbbec_gemini_bridge",
                    "fps": LaunchConfiguration("right_camera_fps"),
                    "color_device": LaunchConfiguration("right_camera_color_device"),
                    "depth_device": LaunchConfiguration("right_camera_depth_device"),
                    "depth_backend": LaunchConfiguration("right_camera_depth_backend"),
                    "enable_depth": LaunchConfiguration("right_camera_enable_depth"),
                    "color_topic": LaunchConfiguration("right_camera_color_topic"),
                    "depth_topic": LaunchConfiguration("right_camera_depth_topic"),
                    "color_camera_info_topic": LaunchConfiguration("right_camera_color_info_topic"),
                    "depth_camera_info_topic": LaunchConfiguration("right_camera_depth_info_topic"),
                    "color_frame_id": LaunchConfiguration("right_camera_color_frame"),
                    "depth_frame_id": LaunchConfiguration("right_camera_depth_frame"),
                    "rotate_180": LaunchConfiguration("right_camera_rotate_180"),
                    "v4l2_depth_unit_to_mm_scale": LaunchConfiguration("camera_v4l2_depth_unit_to_mm_scale"),
                }.items(),
            ),
            _include(
                "detector_adapter",
                "detector_adapter.launch.py",
                launch_arguments={
                    "node_name": "detector_adapter_left",
                    "input_topic": LaunchConfiguration("left_detector_detections_topic"),
                    "output_topic": LaunchConfiguration("left_detection_2d_topic"),
                    "class_map_file": LaunchConfiguration("detector_class_map_file"),
                    "source_name": "left_camera",
                }.items(),
            ),
            _include(
                "detector_adapter",
                "detector_adapter.launch.py",
                condition=right_full_condition,
                launch_arguments={
                    "node_name": "detector_adapter_right",
                    "input_topic": LaunchConfiguration("right_detector_detections_topic"),
                    "output_topic": LaunchConfiguration("right_detection_2d_topic"),
                    "class_map_file": LaunchConfiguration("detector_class_map_file"),
                    "source_name": "right_camera",
                }.items(),
            ),
            _include(
                "depth_handler",
                "depth_processor.launch.py",
                condition=left_depth_chain_condition,
                launch_arguments={
                    "node_name": "depth_handler_left",
                    "camera_info_topic": LaunchConfiguration("left_camera_depth_info_topic"),
                    "depth_topic": LaunchConfiguration("left_camera_depth_topic"),
                    "detection_topic": LaunchConfiguration("left_detection_2d_topic"),
                    "bbox3d_topic": "/depth_handler/left/bbox3d",
                    "scene_objects_topic": "/perception/left/scene_objects",
                    "pointcloud_topic": "/depth_handler/left/pointcloud",
                    "visualization_topic": "/depth_handler/left/visualization",
                    "require_depth_aligned_detections": LaunchConfiguration("depth_require_depth_aligned_detections"),
                    "require_camera_info_depth_frame": LaunchConfiguration("depth_require_camera_info_depth_frame"),
                    "expected_detection_frame": LaunchConfiguration("left_camera_color_frame"),
                    "source_name": "left_camera",
                }.items(),
            ),
            _include(
                "depth_handler",
                "depth_processor.launch.py",
                condition=right_depth_chain_condition,
                launch_arguments={
                    "node_name": "depth_handler_right",
                    "camera_info_topic": LaunchConfiguration("right_camera_depth_info_topic"),
                    "depth_topic": LaunchConfiguration("right_camera_depth_topic"),
                    "detection_topic": LaunchConfiguration("right_detection_2d_topic"),
                    "bbox3d_topic": "/depth_handler/right/bbox3d",
                    "scene_objects_topic": "/perception/right/scene_objects",
                    "pointcloud_topic": "/depth_handler/right/pointcloud",
                    "visualization_topic": "/depth_handler/right/visualization",
                    "require_depth_aligned_detections": LaunchConfiguration("depth_require_depth_aligned_detections"),
                    "require_camera_info_depth_frame": LaunchConfiguration("depth_require_camera_info_depth_frame"),
                    "expected_detection_frame": LaunchConfiguration("right_camera_color_frame"),
                    "source_name": "right_camera",
                }.items(),
            ),
            _include(
                "ball_basket_pose_estimator",
                "ball_basket_pose_estimator.launch.py",
                condition=left_depth_chain_condition,
                launch_arguments={
                    "node_name": "ball_basket_pose_estimator_left",
                    "detections_topic": LaunchConfiguration("left_detection_2d_topic"),
                    "depth_topic": LaunchConfiguration("left_camera_depth_topic"),
                    "camera_info_topic": LaunchConfiguration("left_camera_depth_info_topic"),
                    "output_topic": "/perception/left/ball_basket_scene_objects",
                    "source_name": "left_camera",
                    "require_depth_aligned_detections": LaunchConfiguration("ball_require_depth_aligned_detections"),
                    "require_camera_info_depth_frame": LaunchConfiguration("ball_require_camera_info_depth_frame"),
                    "expected_detection_frame": LaunchConfiguration("left_camera_color_frame"),
                }.items(),
            ),
            _include(
                "ball_basket_pose_estimator",
                "ball_basket_pose_estimator.launch.py",
                condition=right_depth_chain_condition,
                launch_arguments={
                    "node_name": "ball_basket_pose_estimator_right",
                    "detections_topic": LaunchConfiguration("right_detection_2d_topic"),
                    "depth_topic": LaunchConfiguration("right_camera_depth_topic"),
                    "camera_info_topic": LaunchConfiguration("right_camera_depth_info_topic"),
                    "output_topic": "/perception/right/ball_basket_scene_objects",
                    "source_name": "right_camera",
                    "require_depth_aligned_detections": LaunchConfiguration("ball_require_depth_aligned_detections"),
                    "require_camera_info_depth_frame": LaunchConfiguration("ball_require_camera_info_depth_frame"),
                    "expected_detection_frame": LaunchConfiguration("right_camera_color_frame"),
                }.items(),
            ),
            _include(
                "scene_fusion",
                "scene_fusion.launch.py",
                launch_arguments={
                    "scene_fusion_input_topics": "['/perception/left/scene_objects','/perception/right/scene_objects','/perception/left/ball_basket_scene_objects','/perception/right/ball_basket_scene_objects','/perception/table_scene_objects']",
                }.items(),
            ),
            _include("planning_scene_sync", "planning_scene_sync.launch.py"),
            _include("grasp_pose_generator", "grasp_pose_generator.launch.py"),
            _include("joint_state_aggregator", "joint_state_aggregator.launch.py"),
            _include(
                "fairino_dualarm_moveit_config",
                "move_group.launch.py",
                launch_arguments={
                    "publish_fake_joint_states": LaunchConfiguration("publish_fake_joint_states"),
                    "left_base_xyz": LaunchConfiguration("left_base_xyz"),
                    "left_base_rpy": LaunchConfiguration("left_base_rpy"),
                    "right_base_xyz": LaunchConfiguration("right_base_xyz"),
                    "right_base_rpy": LaunchConfiguration("right_base_rpy"),
                }.items(),
            ),
            _include(
                "fairino_dualarm_planner",
                "fairino_dualarm_planner.launch.py",
                launch_arguments={
                    "left_base_xyz": LaunchConfiguration("left_base_xyz"),
                    "left_base_rpy": LaunchConfiguration("left_base_rpy"),
                    "right_base_xyz": LaunchConfiguration("right_base_xyz"),
                    "right_base_rpy": LaunchConfiguration("right_base_rpy"),
                }.items(),
            ),
            _include(
                "execution_adapter",
                "execution_adapter.launch.py",
                launch_arguments={
                    "left_gripper_slave_id": LaunchConfiguration("left_gripper_slave_id"),
                    "right_gripper_slave_id": LaunchConfiguration("right_gripper_slave_id"),
                    "left_gripper_command_service": "/gripper0/epg50_gripper/command",
                    "right_gripper_command_service": "/gripper1/epg50_gripper/command",
                    "left_gripper_status_service": "/gripper0/epg50_gripper/status",
                    "right_gripper_status_service": "/gripper1/epg50_gripper/status",
                    "left_gripper_status_topic": "/gripper0/epg50_gripper/status_stream",
                    "right_gripper_status_topic": "/gripper1/epg50_gripper/status_stream",
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
                name="detector_left",
                condition=IfCondition(LaunchConfiguration("start_detector")),
                output="screen",
                parameters=[
                    {
                        "model_path": LaunchConfiguration("detector_model_path"),
                        "image_topic": LaunchConfiguration("left_camera_color_topic"),
                        "detections_topic": LaunchConfiguration("left_detector_detections_topic"),
                        "confidence_threshold": LaunchConfiguration("detector_confidence_threshold"),
                        "device": LaunchConfiguration("detector_device"),
                        "allowed_class_ids": ParameterValue(
                            LaunchConfiguration("detector_allowed_class_ids"),
                            value_type=str,
                        ),
                    }
                ],
            ),
            Node(
                package="detector",
                executable=LaunchConfiguration("detector_executable"),
                name="detector_right",
                condition=right_detector_condition,
                output="screen",
                parameters=[
                    {
                        "model_path": LaunchConfiguration("detector_model_path"),
                        "image_topic": LaunchConfiguration("right_camera_color_topic"),
                        "detections_topic": LaunchConfiguration("right_detector_detections_topic"),
                        "confidence_threshold": LaunchConfiguration("detector_confidence_threshold"),
                        "device": LaunchConfiguration("detector_device"),
                        "allowed_class_ids": ParameterValue(
                            LaunchConfiguration("detector_allowed_class_ids"),
                            value_type=str,
                        ),
                    }
                ],
            ),
            Node(
                package="tools",
                executable="table_surface_detector.py",
                name="table_surface_detector",
                condition=table_surface_condition,
                output="screen",
                parameters=[
                    {
                        "color_topic": LaunchConfiguration("left_camera_color_topic"),
                        "depth_topic": LaunchConfiguration("left_camera_depth_topic"),
                        "camera_info_topic": LaunchConfiguration("left_camera_depth_info_topic"),
                        "detections_topic": LaunchConfiguration("left_detection_2d_topic"),
                        "rgb_overlay_topic": LaunchConfiguration("pick_assist_rgb_overlay_topic"),
                        "timer_hz": LaunchConfiguration("table_timer_hz"),
                        "min_depth_mm": LaunchConfiguration("table_min_depth_mm"),
                        "max_depth_mm": LaunchConfiguration("table_max_depth_mm"),
                        "plane_threshold_mm": LaunchConfiguration("table_plane_threshold_mm"),
                        "color_distance_threshold": LaunchConfiguration("table_color_distance_threshold"),
                        "min_inlier_ratio": LaunchConfiguration("table_min_inlier_ratio"),
                        "min_inliers": LaunchConfiguration("table_min_inliers"),
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
                namespace="gripper0",
                name="gripper_node_left",
                condition=IfCondition(LaunchConfiguration("start_hardware")),
                parameters=[
                    {
                        "port": LaunchConfiguration("left_gripper_port"),
                        "debug": LaunchConfiguration("gripper_debug"),
                        "default_slave_id": LaunchConfiguration("left_gripper_slave_id"),
                        "disable_on_shutdown": LaunchConfiguration("gripper_disable_on_shutdown"),
                    }
                ],
                output="screen",
            ),
            Node(
                package="epg50_gripper_ros",
                executable="epg50_gripper_node",
                namespace="gripper1",
                name="gripper_node_right",
                condition=IfCondition(LaunchConfiguration("start_hardware")),
                parameters=[
                    {
                        "port": LaunchConfiguration("right_gripper_port"),
                        "debug": LaunchConfiguration("gripper_debug"),
                        "default_slave_id": LaunchConfiguration("right_gripper_slave_id"),
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
                additional_env={"LD_PRELOAD": SYSTEM_LIBSTDCXX},
                parameters=[
                    {
                        "robot_ip": LaunchConfiguration("left_robot_ip"),
                        "robot_port": LaunchConfiguration("left_robot_port"),
                        "robot_name": "L",
                        "state_query_interval": LaunchConfiguration("robot_state_query_interval"),
                    }
                ],
                output="screen",
            ),
            Node(
                package="robo_ctrl",
                executable="robo_ctrl_node",
                name="right_robo_ctrl",
                condition=IfCondition(LaunchConfiguration("start_hardware")),
                additional_env={"LD_PRELOAD": SYSTEM_LIBSTDCXX},
                parameters=[
                    {
                        "robot_ip": LaunchConfiguration("right_robot_ip"),
                        "robot_port": LaunchConfiguration("right_robot_port"),
                        "robot_name": "R",
                        "state_query_interval": LaunchConfiguration("robot_state_query_interval"),
                    }
                ],
                output="screen",
            ),
        ]
    )
