from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from ament_index_python.packages import get_package_share_directory
import os


def _include(package_name: str, relative_launch: str):
    return IncludeLaunchDescription(
        PythonLaunchDescriptionSource(
            os.path.join(get_package_share_directory(package_name), "launch", relative_launch)
        )
    )


def generate_launch_description():
    return LaunchDescription(
        [
            _include("tf_node", "frame_authority.launch.py"),
            _include("detector_adapter", "detector_adapter.launch.py"),
            _include("depth_handler", "depth_processor.launch.py"),
            _include("ball_basket_pose_estimator", "ball_basket_pose_estimator.launch.py"),
            _include("scene_fusion", "scene_fusion.launch.py"),
            _include("planning_scene_sync", "planning_scene_sync.launch.py"),
            _include("grasp_pose_generator", "grasp_pose_generator.launch.py"),
            _include("fairino_dualarm_planner", "fairino_dualarm_planner.launch.py"),
            _include("execution_adapter", "execution_adapter.launch.py"),
            _include("dualarm_task_manager", "dualarm_task_manager.launch.py"),
        ]
    )
