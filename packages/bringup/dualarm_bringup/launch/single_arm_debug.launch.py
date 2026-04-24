from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, IncludeLaunchDescription, GroupAction
from launch.conditions import IfCondition
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import LaunchConfiguration, PythonExpression
from launch_ros.actions import Node
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

    debug_arm = LaunchConfiguration("debug_arm")
    start_perception = LaunchConfiguration("start_perception")
    start_camera_bridge = LaunchConfiguration("start_camera_bridge")
    left_arm_condition = IfCondition(PythonExpression(["'", debug_arm, "' == 'left'"]))
    right_arm_condition = IfCondition(PythonExpression(["'", debug_arm, "' == 'right'"]))
    perception_condition = IfCondition(start_perception)
    camera_bridge_condition = IfCondition(
        PythonExpression(["'", start_perception, "' == 'true' and '", start_camera_bridge, "' == 'true'"])
    )

    return LaunchDescription(
        [
            DeclareLaunchArgument("debug_arm", default_value="left"),
            DeclareLaunchArgument("start_perception", default_value="true"),
            DeclareLaunchArgument("start_camera_bridge", default_value="true"),
            DeclareLaunchArgument("use_mock_camera_stream", default_value="false"),
            DeclareLaunchArgument("camera_color_device", default_value="auto"),
            DeclareLaunchArgument("camera_depth_device", default_value="auto"),
            DeclareLaunchArgument("camera_depth_backend", default_value="auto"),
            DeclareLaunchArgument("start_detector", default_value="true"),
            DeclareLaunchArgument("publish_fake_joint_states", default_value="false"),
            DeclareLaunchArgument("start_gripper", default_value="true"),
            DeclareLaunchArgument("left_robot_ip", default_value="192.168.58.2"),
            DeclareLaunchArgument("right_robot_ip", default_value="192.168.58.3"),
            DeclareLaunchArgument("state_query_interval", default_value="0.05"),
            DeclareLaunchArgument("gripper_port", default_value="auto"),
            DeclareLaunchArgument("gripper_debug", default_value="false"),
            DeclareLaunchArgument("left_gripper_slave_id", default_value="9"),
            DeclareLaunchArgument("right_gripper_slave_id", default_value="10"),
            DeclareLaunchArgument("gripper_disable_on_shutdown", default_value="false"),
            DeclareLaunchArgument("allow_unverified_camera_extrinsics", default_value="true"),
            DeclareLaunchArgument("require_verified_camera_extrinsics", default_value="true"),
            DeclareLaunchArgument("required_camera_calibration_status", default_value="verified"),
            DeclareLaunchArgument("detector_executable", default_value="detector_pt_node.py"),
            DeclareLaunchArgument("detector_model_path", default_value=default_detector_model),
            DeclareLaunchArgument("detector_image_topic", default_value="/camera/color/image_raw"),
            DeclareLaunchArgument("detector_confidence_threshold", default_value="0.5"),
            DeclareLaunchArgument("detector_device", default_value=""),
            DeclareLaunchArgument("detector_allowed_class_ids", default_value=""),
            DeclareLaunchArgument("detector_class_map_file", default_value=default_detector_class_map),
            _include(
                "tf_node",
                "frame_authority.launch.py",
                launch_arguments={
                    "allow_unverified_extrinsics": LaunchConfiguration("allow_unverified_camera_extrinsics"),
                    "require_verified_calibration": LaunchConfiguration("require_verified_camera_extrinsics"),
                    "required_calibration_status": LaunchConfiguration("required_camera_calibration_status"),
                }.items(),
            ),
            _include(
                "orbbec_gemini_bridge",
                "orbbec_gemini_bridge.launch.py",
                condition=camera_bridge_condition,
                launch_arguments={
                    "use_mock_stream": LaunchConfiguration("use_mock_camera_stream"),
                    "color_device": LaunchConfiguration("camera_color_device"),
                    "depth_device": LaunchConfiguration("camera_depth_device"),
                    "depth_backend": LaunchConfiguration("camera_depth_backend"),
                }.items(),
            ),
            _include(
                "detector_adapter",
                "detector_adapter.launch.py",
                condition=perception_condition,
                launch_arguments={"class_map_file": LaunchConfiguration("detector_class_map_file")}.items(),
            ),
            _include(
                "depth_handler",
                "depth_processor.launch.py",
                condition=perception_condition,
                launch_arguments={"expected_detection_frame": "left_camera_color_frame"}.items(),
            ),
            _include("ball_basket_pose_estimator", "ball_basket_pose_estimator.launch.py", condition=perception_condition),
            _include("scene_fusion", "scene_fusion.launch.py", condition=perception_condition),
            _include("planning_scene_sync", "planning_scene_sync.launch.py", condition=perception_condition),
            _include("grasp_pose_generator", "grasp_pose_generator.launch.py", condition=perception_condition),
            _include(
                "joint_state_aggregator",
                "joint_state_aggregator.launch.py",
                launch_arguments={"active_arms": debug_arm}.items(),
            ),
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
            Node(
                package="robo_ctrl",
                executable="robo_ctrl_node",
                name="L_robo_ctrl",
                condition=left_arm_condition,
                additional_env={"LD_PRELOAD": SYSTEM_LIBSTDCXX},
                parameters=[
                    {
                        "robot_ip": LaunchConfiguration("left_robot_ip"),
                        "robot_name": "L",
                        "state_query_interval": LaunchConfiguration("state_query_interval"),
                    }
                ],
                output="screen",
            ),
            Node(
                package="robo_ctrl",
                executable="robo_ctrl_node",
                name="R_robo_ctrl",
                condition=right_arm_condition,
                additional_env={"LD_PRELOAD": SYSTEM_LIBSTDCXX},
                parameters=[
                    {
                        "robot_ip": LaunchConfiguration("right_robot_ip"),
                        "robot_name": "R",
                        "state_query_interval": LaunchConfiguration("state_query_interval"),
                    }
                ],
                output="screen",
            ),
            GroupAction(
                condition=left_arm_condition,
                actions=[
                    Node(
                        package="epg50_gripper_ros",
                        executable="epg50_gripper_node",
                        name="single_arm_debug_gripper_left",
                        condition=IfCondition(LaunchConfiguration("start_gripper")),
                        output="screen",
                        parameters=[
                            {
                                "port": LaunchConfiguration("gripper_port"),
                                "debug": LaunchConfiguration("gripper_debug"),
                                "default_slave_id": LaunchConfiguration("left_gripper_slave_id"),
                                "disable_on_shutdown": LaunchConfiguration("gripper_disable_on_shutdown"),
                            }
                        ],
                    )
                ],
            ),
            GroupAction(
                condition=right_arm_condition,
                actions=[
                    Node(
                        package="epg50_gripper_ros",
                        executable="epg50_gripper_node",
                        name="single_arm_debug_gripper_right",
                        condition=IfCondition(LaunchConfiguration("start_gripper")),
                        output="screen",
                        parameters=[
                            {
                                "port": LaunchConfiguration("gripper_port"),
                                "debug": LaunchConfiguration("gripper_debug"),
                                "default_slave_id": LaunchConfiguration("right_gripper_slave_id"),
                                "disable_on_shutdown": LaunchConfiguration("gripper_disable_on_shutdown"),
                            }
                        ],
                    )
                ],
            ),
            GroupAction(
                condition=perception_condition,
                actions=[
                    Node(
                        package="detector",
                        executable=LaunchConfiguration("detector_executable"),
                        name="detector_node",
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
                    )
                ],
            ),
        ]
    )
