from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]


def _read(relative_path: str) -> str:
    return (REPO_ROOT / relative_path).read_text(encoding="utf-8")


def test_v1_interface_fields_are_declared():
    detection = _read("packages/interfaces/dualarm_interfaces/msg/Detection2D.msg")
    scene_object = _read("packages/interfaces/dualarm_interfaces/msg/SceneObject.msg")
    primitive = _read("packages/interfaces/dualarm_interfaces/action/ExecutePrimitive.action")

    assert "string view_id" in detection
    assert "string mask_topic" in detection
    assert "float32 bbox_quality" in detection
    assert "string[] source_views" in scene_object
    assert "string shape_type" in scene_object
    assert "string pose_source" in scene_object
    assert "float32 quality_score" in scene_object
    assert "estimated covariance" in scene_object.lower()
    assert "guarded_grasp" in primitive
    assert "unverified_evidence" in primitive
    assert "bool fill_target_reached" in primitive
    assert "float32 estimated_poured_mass_g" in primitive


def test_launch_depth_fail_fast_and_detector_decoupling_contracts():
    source = _read("packages/bringup/dualarm_bringup/launch/competition.launch.py")
    assert "OpaqueFunction(function=_validate_depth_configuration)" in source
    assert "left_camera_enable_depth 与 right_camera_enable_depth 不能同时为 true" in source
    assert 'DeclareLaunchArgument("active_depth_camera", default_value="left")' in source
    assert 'DeclareLaunchArgument("depth_require_depth_aligned_detections", default_value="true")' in source
    assert 'DeclareLaunchArgument("ball_require_depth_aligned_detections", default_value="true")' in source

    right_condition = source[source.index("right_detector_condition") : source.index("left_depth_chain_condition")]
    assert "start_detector" in right_condition
    assert "start_right_detector" in right_condition
    assert "enable_right_camera" in right_condition
    assert "dual_camera_mode" not in right_condition


def test_scene_fusion_has_rgb_only_non_authoritative_path():
    source = _read("packages/perception/scene_fusion/scripts/scene_fusion_node.py")
    assert "rgb_detection_topics" in source
    assert "Detection2DArray" in source
    assert "def _handle_rgb_detections" in source
    rgb_section = source[source.index("def _handle_rgb_detections") : source.index("def _create_track")]
    assert "_create_track" not in rgb_section
    assert "source_views" in rgb_section


def test_planning_scene_subframes_are_written_as_object_local():
    source = _read("packages/planning/planning_scene_sync/scripts/planning_scene_sync_node.py")
    assert "def _pose_to_object_local" in source
    assert "collision_object.pose = deepcopy(collision_entry.object_pose)" in source
    assert "collision_object.subframe_names.extend(collision_entry.subframe_names)" in source
    assert "collision_object.subframe_poses.extend(collision_entry.subframe_poses)" in source
    assert "_local_subframes_for(scene_object, object_pose)" in source


def test_execution_adapter_uses_planner_first_cartesian_and_vendor_double_gate():
    source = _read("packages/control/execution_adapter/scripts/execution_adapter_node.py")
    assert "_plan_pose_client" in source
    assert "_plan_cartesian_client" in source
    assert "_plan_dual_pose_client" in source
    assert "def _vendor_direct_allowed" in source
    vendor_start = source.index("def _vendor_direct_allowed")
    vendor_end = source.index("def _cartesian_waypoint_frame_valid", vendor_start)
    vendor_gate = source[vendor_start:vendor_end]
    assert "_allow_vendor_direct_cartesian" in vendor_gate
    assert "_vendor_direct_cartesian_profiles" in vendor_gate
    assert "profile_name in self._vendor_direct_cartesian_profiles" in vendor_gate

    cartesian_sequence = source[source.index("def _execute_cartesian_sequence") : source.index("def _execute_vendor_cartesian_sequence")]
    assert "PlanPose.Request()" in cartesian_sequence
    assert "PlanCartesian.Request()" in cartesian_sequence
    assert "_execute_joint" in cartesian_sequence
    assert "execute_trajectory" not in cartesian_sequence


def test_guarded_grasp_contact_false_prevents_attach():
    source = _read("packages/control/execution_adapter/scripts/execution_adapter_node.py")
    guarded = source[source.index("def _execute_guarded_grasp") : source.index("def _primitive_motion_result_code")]
    contact_block = guarded[guarded.index("if not outcome.contact_verified") : guarded.index("link_name = self._tool_link_for_arm")]
    assert "RESULT_CONTACT_FAILED" in contact_block
    assert "return outcome" in contact_block
    assert "_call_attach" not in contact_block


def test_pour_without_real_evidence_is_unverified():
    source = _read("packages/control/execution_adapter/scripts/execution_adapter_node.py")
    pour_section = source[source.index('elif goal.primitive_id == "pour_tilt"') : source.index('elif goal.primitive_id == "guarded_grasp"')]
    assert "RESULT_UNVERIFIED_EVIDENCE" in pour_section
    assert "fill_target_reached = False" in pour_section
    assert "estimated_poured_mass_g = -1.0" in pour_section
    assert "evidence_confidence = 0.0" in pour_section


def test_task_manager_uses_guarded_grasp_and_table_gate():
    source = _read("packages/tasks/dualarm_task_manager/scripts/dualarm_task_manager_node.py")
    assert "POURING_TABLE_REQUIRED_STATES" in source
    assert "def _require_table_surface" in source
    assert 'primitive_id="guarded_grasp"' in source
    direct_grasp = source[source.index("def _direct_grasp") : source.index("def _place_object")]
    assert "_execute_primitive_action" in direct_grasp
    assert "self._release(scene_object.id)" in direct_grasp
    assert "_set_gripper(" not in direct_grasp
