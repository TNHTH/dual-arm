from pathlib import Path

import yaml

REPO_ROOT = Path(__file__).resolve().parents[2]


def test_dualarm_simulation_config_contract():
    config = yaml.safe_load(
        (REPO_ROOT / "packages/simulation/dualarm_simulation/config/competition_gazebo_full.yaml").read_text(
            encoding="utf-8"
        )
    )

    assert config["schema_version"] == "competition_gazebo_full.v1"
    assert config["sim"]["grasp_contact_threshold_m"] == 0.04
    assert config["sim"]["robot_state_freshness_max_age_s"] == 0.5
    assert config["sim"]["use_moveit_fk_service"] is True
    assert config["sim"]["use_gazebo_model_states"] is True
    assert config["sim"]["pour_min_hold_duration_s"] > 0.0
    assert {"water_bottle", "cup_1", "basketball", "basket"}.issubset(config["objects"].keys())


def test_competition_gazebo_full_launch_uses_formal_sim_backend():
    source = (
        REPO_ROOT / "packages/bringup/dualarm_bringup/launch/competition_gazebo_full.launch.py"
    ).read_text(encoding="utf-8")

    assert "sim_truth_manager" in source
    assert "sim_robot_state_publisher" in source
    assert "sim_pour_state_manager" in source
    assert '"execution_backend": "sim"' in source
    assert '"simulation_mode": "true"' in source
    assert "/perception/sim_scene_objects" in source
    assert '"right_base_rpy": "0 0 180"' in source
    assert 'DeclareLaunchArgument("sim_soccer_ball_pregrasp_left_joints_rad", default_value="-0.10 -0.75 1.15 0.0 0.55 0.0")' in source
    assert '"sim_soccer_ball_pregrasp_right_joints_rad": LaunchConfiguration("sim_soccer_ball_pregrasp_right_joints_rad")' in source


def test_execution_backend_and_task_manager_sim_contracts_are_wired():
    execution_launch = (
        REPO_ROOT / "packages/control/execution_adapter/launch/execution_adapter.launch.py"
    ).read_text(encoding="utf-8")
    execution_node = (
        REPO_ROOT / "packages/control/execution_adapter/scripts/execution_adapter_node.py"
    ).read_text(encoding="utf-8")
    task_launch = (
        REPO_ROOT / "packages/tasks/dualarm_task_manager/launch/dualarm_task_manager.launch.py"
    ).read_text(encoding="utf-8")
    task_node = (
        REPO_ROOT / "packages/tasks/dualarm_task_manager/scripts/dualarm_task_manager_node.py"
    ).read_text(encoding="utf-8")

    assert 'DeclareLaunchArgument("execution_backend", default_value="hardware")' in execution_launch
    assert 'DeclareLaunchArgument("sim_visual_playback_rate_hz", default_value="20.0")' in execution_launch
    assert 'self.declare_parameter("execution_backend", "hardware")' in execution_node
    assert 'self.declare_parameter("sim_visual_playback_rate_hz", 20.0)' in execution_node
    assert 'return self._execution_backend == "sim"' in execution_node
    assert "def _sim_play_dual_joint_trajectories" in execution_node
    assert "_sim_positions_at_time" in execution_node
    assert 'DeclareLaunchArgument("simulation_mode", default_value="false")' in task_launch
    assert 'DeclareLaunchArgument("sim_basketball_release_left_joints_rad"' in task_launch
    assert "simulation_mode 允许 start_immediately action goal" in task_node
    assert '{"", "none", "null"}' in task_node
    assert "self._reservation_owner(obj.reserved_by)" in task_node
    assert 'DeclareLaunchArgument("sim_soccer_ball_pregrasp_left_joints_rad", default_value="-0.10 -0.75 1.15 0.0 0.55 0.0")' in task_launch
    assert '"sim_soccer_ball_pregrasp_right_joints_rad": LaunchConfiguration("sim_soccer_ball_pregrasp_right_joints_rad")' in task_launch
    assert 'DeclareLaunchArgument("sim_bottle_grasp_right_joints_rad", default_value="-1.094 -0.985 1.319 -0.354 0.803 0.390")' in task_launch
    assert '"sim_pour_tilt_right_joints_rad": LaunchConfiguration("sim_pour_tilt_right_joints_rad")' in task_launch
    assert 'self.declare_parameter("sim_soccer_ball_pregrasp_left_joints_rad", [-0.10, -0.75, 1.15, 0.0, 0.55, 0.0]' in task_node
    assert 'self.declare_parameter("sim_bottle_grasp_right_joints_rad", [-1.094, -0.985, 1.319, -0.354, 0.803, 0.390]' in task_node
    assert 'self.declare_parameter("sim_basketball_release_left_joints_rad"' in task_node
    assert 'self.declare_parameter("sim_soccer_ball_release_right_joints_rad"' in task_node
    assert '("/planning/plan_joint", self._plan_joint_client.wait_for_service(timeout_sec=0.1))' in task_node
    assert 'planner_path = "sim_basket_release_joint_fallback"' in task_node
    assert "def _call_sim_ball_release_joint_plan" in task_node
    assert "def _execute_sim_pouring_state" in task_node
    assert "def _call_plan_joint_for_arm" in task_node
    assert "sim_prepour_joint_fallback" in task_node
    assert "self._sim_pour_event_pub.publish(msg)" in task_node
    assert 'interaction_mode="opened_split"' in task_node
    assert "if getattr(call, \"execute_last_plan\", False):" in task_node
    assert 'call.primitive_id == "release_guard"' in task_node
    assert "reservation release 失败" in task_node
    assert "basket reservation released" in task_node
    assert "from rclpy.callback_groups import ReentrantCallbackGroup" in task_node
    assert "callback_group=self._scene_callback_group" in task_node
    assert "callback_group=self._client_callback_group" in task_node
    assert "def _wait_for_future" in task_node
    assert "rclpy.spin_until_future_complete" not in task_node


def test_task_drop_verification_allows_sim_truth_observed_without_relaxing_hardware_stable_gate():
    task_node = (
        REPO_ROOT / "packages/tasks/dualarm_task_manager/scripts/dualarm_task_manager_node.py"
    ).read_text(encoding="utf-8")
    drop_verify = task_node[
        task_node.index("def _verify_drop_in_basket") : task_node.index("def _verify_placed_near_target")
    ]

    assert 'accepted_lifecycle_states = {"stable"}' in drop_verify
    assert 'self._simulation_mode and scene_object.source == "sim_truth"' in drop_verify
    assert 'accepted_lifecycle_states.add("observed")' in drop_verify
    assert "scene_object.lifecycle_state not in accepted_lifecycle_states" in drop_verify
    assert "scene_object.attached_link" in drop_verify
    assert "self._reservation_owner(scene_object.reserved_by)" in drop_verify
    assert "distance_xy >= self._basket_accept_radius_m" in drop_verify
    assert "ball_z > required_below_z" in drop_verify


def test_sim_release_guard_has_truth_evidence_fallback_for_planning_scene_timeout():
    execution_node = (
        REPO_ROOT / "packages/control/execution_adapter/scripts/execution_adapter_node.py"
    ).read_text(encoding="utf-8")
    task_node = (
        REPO_ROOT / "packages/tasks/dualarm_task_manager/scripts/dualarm_task_manager_node.py"
    ).read_text(encoding="utf-8")

    release_section = execution_node[
        execution_node.index('elif goal.primitive_id == "release_guard"') :
        execution_node.index('else:\n            outcome.message = f"未知 primitive_id', execution_node.index('elif goal.primitive_id == "release_guard"'))
    ]

    assert "release_pose = self._sim_release_pose_for_goal(goal) if self._sim_mode() else None" in release_section
    assert 'self._sim_publish_truth_pose(goal.object_id, release_pose, lifecycle_state="observed")' in release_section
    assert "interaction_detached = self._set_object_interaction" in release_section
    assert "sim_release_verified = self._wait_for_sim_release_evidence" in release_section
    assert "interaction_detached or sim_release_verified" in release_section
    assert "MoveIt PlanningScene interaction 同步未在超时内确认" in release_section
    assert "def _wait_for_sim_release_evidence" in execution_node
    assert "scene_object.source != \"sim_truth\"" in execution_node
    assert "<= 0.08" in execution_node

    assert "def _release(self, object_id: str, timeout_sec: float = 2.0)" in task_node
    assert "release_timeout = 12.0 if self._simulation_mode else 2.0" in task_node
    assert "self._release(call.object_id, timeout_sec=release_timeout)" in task_node


def test_software_check_builds_dualarm_simulation():
    source = (REPO_ROOT / "scripts/ci/software_check.sh").read_text(encoding="utf-8")

    assert "dualarm_simulation" in source


def test_quick_is_not_active_sim_or_ci_dependency():
    assert not (REPO_ROOT / "packages/quick_competition").exists()
    assert not (REPO_ROOT / "config/quick_competition").exists()
    build_groups = (REPO_ROOT / "config/system/build_groups.yaml").read_text(encoding="utf-8")
    software_check = (REPO_ROOT / "scripts/ci/software_check.sh").read_text(encoding="utf-8")
    assert "quick_competition" not in build_groups
    assert "quick_competition" not in software_check


def test_sim_runtime_truth_fk_and_pour_are_service_backed_not_unconditional():
    scene_fusion = (
        REPO_ROOT / "packages/perception/scene_fusion/scripts/scene_fusion_node.py"
    ).read_text(encoding="utf-8")
    robot_state = (
        REPO_ROOT / "packages/simulation/dualarm_simulation/dualarm_simulation/sim_robot_state_publisher.py"
    ).read_text(encoding="utf-8")
    truth = (
        REPO_ROOT / "packages/simulation/dualarm_simulation/dualarm_simulation/sim_truth_manager.py"
    ).read_text(encoding="utf-8")
    pour = (
        REPO_ROOT / "packages/simulation/dualarm_simulation/dualarm_simulation/sim_pour_state_manager.py"
    ).read_text(encoding="utf-8")
    package_xml = (REPO_ROOT / "packages/simulation/dualarm_simulation/package.xml").read_text(encoding="utf-8")

    assert 'source == "sim_truth"' in scene_fusion
    assert 'track_id.startswith(f"{source_id}_")' in scene_fusion
    assert "from moveit_msgs.srv import GetPositionFK" in robot_state
    assert "self._fk_client = self.create_client(GetPositionFK" in robot_state
    assert "from gazebo_msgs.msg import ModelStates" in truth
    assert "_handle_gazebo_model_states" in truth
    assert "fill_target_reached = (" in pour
    assert '"fill_target_reached": fill_target_reached' in pour
    assert "<exec_depend>moveit_msgs</exec_depend>" in package_xml
    assert "<exec_depend>gazebo_msgs</exec_depend>" in package_xml


def test_right_tcp_camera_self_collision_is_disabled_for_sim_start_state():
    source = (
        REPO_ROOT / "packages/planning/moveit/fairino_dualarm_moveit_config/config/fairino_dualarm.srdf"
    ).read_text(encoding="utf-8")

    assert 'link1="right_wrist3_link" link2="right_camera_body"' in source
    assert 'link1="right_tcp" link2="right_camera_body"' in source


def test_formal_planner_launch_loads_kinematics_for_move_group_interface():
    source = (
        REPO_ROOT / "packages/planning/planners/fairino_dualarm_planner/launch/fairino_dualarm_planner.launch.py"
    ).read_text(encoding="utf-8")

    assert '"robot_description_kinematics": load_yaml(' in source
    assert '"config/kinematics.yaml"' in source


def test_task_grasp_targets_use_tcp_orientations_not_object_identity():
    generator = (
        REPO_ROOT / "packages/planning/grasp_pose_generator/scripts/grasp_pose_generator_node.py"
    ).read_text(encoding="utf-8")
    planner = (
        REPO_ROOT / "packages/planning/planners/fairino_dualarm_planner/src/fairino_dualarm_planner_node.cpp"
    ).read_text(encoding="utf-8")

    assert "self._apply_tcp_orientation(target)" in generator
    assert "yaw_deg = -90.0 if arm_mode == \"left_arm\" else 90.0" in generator
    assert "set_default_tcp_orientation(left_pose, \"left_arm\")" in planner
    assert "set_default_tcp_orientation(right_pose, \"right_arm\")" in planner
    assert "geometry_msgs::msg::PoseStamped planning_pose" in planner
    assert "pose.header.stamp.sec = 0" in planner
    assert "group->clearPoseTargets();" in planner
    assert "group->setStartStateToCurrentState();" in planner
