from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node


def generate_launch_description():
    return LaunchDescription(
        [
            DeclareLaunchArgument("reobserve_once_enabled", default_value="true"),
            DeclareLaunchArgument("reobserve_once_timeout_sec", default_value="1.5"),
            DeclareLaunchArgument("reobserve_once_interval_sec", default_value="0.05"),
            DeclareLaunchArgument("simulation_mode", default_value="false"),
            DeclareLaunchArgument("basket_accept_radius_m", default_value="0.15"),
            DeclareLaunchArgument("basket_accept_z_below_rim_m", default_value="0.05"),
            DeclareLaunchArgument("sim_basketball_pregrasp_left_joints_rad", default_value="0.25 -0.75 1.15 0.0 0.55 0.0"),
            DeclareLaunchArgument("sim_basketball_pregrasp_right_joints_rad", default_value="-0.25 -0.75 1.15 0.0 0.55 0.0"),
            DeclareLaunchArgument("sim_soccer_ball_pregrasp_left_joints_rad", default_value="-0.10 -0.75 1.15 0.0 0.55 0.0"),
            DeclareLaunchArgument("sim_soccer_ball_pregrasp_right_joints_rad", default_value="0.10 -0.75 1.15 0.0 0.55 0.0"),
            DeclareLaunchArgument("sim_basketball_release_left_joints_rad", default_value="0.0 -0.8 1.2 0.0 0.6 0.0"),
            DeclareLaunchArgument("sim_basketball_release_right_joints_rad", default_value="0.0 -0.8 1.2 0.0 0.6 0.0"),
            DeclareLaunchArgument("sim_soccer_ball_release_left_joints_rad", default_value="0.0 -0.8 1.2 0.0 0.6 0.0"),
            DeclareLaunchArgument("sim_soccer_ball_release_right_joints_rad", default_value="0.0 -0.8 1.2 0.0 0.6 0.0"),
            DeclareLaunchArgument("sim_bottle_grasp_right_joints_rad", default_value="-1.094 -0.985 1.319 -0.354 0.803 0.390"),
            DeclareLaunchArgument("sim_cup_grasp_left_joints_rad", default_value="2.248 -1.144 0.507 -0.089 0.343 -0.090"),
            DeclareLaunchArgument("sim_cap_workspace_left_joints_rad", default_value="2.248 -1.144 0.507 -0.089 0.343 -0.090"),
            DeclareLaunchArgument("sim_pour_tilt_right_joints_rad", default_value="-1.094 -0.985 1.319 -0.354 0.803 1.000"),
            DeclareLaunchArgument("sim_place_left_joints_rad", default_value="2.428 -1.082 0.486 -0.283 0.997 -0.609"),
            DeclareLaunchArgument("sim_place_right_joints_rad", default_value="-1.000 -1.000 1.200 -0.200 1.000 0.800"),
            Node(
                package="dualarm_task_manager",
                executable="dualarm_task_manager_node.py",
                name="dualarm_task_manager",
                output="screen",
                parameters=[
                    {
                        "reobserve_once_enabled": LaunchConfiguration("reobserve_once_enabled"),
                        "reobserve_once_timeout_sec": LaunchConfiguration("reobserve_once_timeout_sec"),
                        "reobserve_once_interval_sec": LaunchConfiguration("reobserve_once_interval_sec"),
                        "simulation_mode": LaunchConfiguration("simulation_mode"),
                        "basket_accept_radius_m": LaunchConfiguration("basket_accept_radius_m"),
                        "basket_accept_z_below_rim_m": LaunchConfiguration("basket_accept_z_below_rim_m"),
                        "sim_basketball_pregrasp_left_joints_rad": LaunchConfiguration("sim_basketball_pregrasp_left_joints_rad"),
                        "sim_basketball_pregrasp_right_joints_rad": LaunchConfiguration("sim_basketball_pregrasp_right_joints_rad"),
                        "sim_soccer_ball_pregrasp_left_joints_rad": LaunchConfiguration("sim_soccer_ball_pregrasp_left_joints_rad"),
                        "sim_soccer_ball_pregrasp_right_joints_rad": LaunchConfiguration("sim_soccer_ball_pregrasp_right_joints_rad"),
                        "sim_basketball_release_left_joints_rad": LaunchConfiguration("sim_basketball_release_left_joints_rad"),
                        "sim_basketball_release_right_joints_rad": LaunchConfiguration("sim_basketball_release_right_joints_rad"),
                        "sim_soccer_ball_release_left_joints_rad": LaunchConfiguration("sim_soccer_ball_release_left_joints_rad"),
                        "sim_soccer_ball_release_right_joints_rad": LaunchConfiguration("sim_soccer_ball_release_right_joints_rad"),
                        "sim_bottle_grasp_right_joints_rad": LaunchConfiguration("sim_bottle_grasp_right_joints_rad"),
                        "sim_cup_grasp_left_joints_rad": LaunchConfiguration("sim_cup_grasp_left_joints_rad"),
                        "sim_cap_workspace_left_joints_rad": LaunchConfiguration("sim_cap_workspace_left_joints_rad"),
                        "sim_pour_tilt_right_joints_rad": LaunchConfiguration("sim_pour_tilt_right_joints_rad"),
                        "sim_place_left_joints_rad": LaunchConfiguration("sim_place_left_joints_rad"),
                        "sim_place_right_joints_rad": LaunchConfiguration("sim_place_right_joints_rad"),
                    }
                ],
            )
        ]
    )
