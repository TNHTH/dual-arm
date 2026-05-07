from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]


def _read(relative_path: str) -> str:
    return (REPO_ROOT / relative_path).read_text(encoding="utf-8")


def _function_body(source: str, signature: str) -> str:
    start = source.index(signature)
    brace = source.index("{", start)
    depth = 0
    for index in range(brace, len(source)):
        char = source[index]
        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return source[start : index + 1]
    raise AssertionError(f"function body not found: {signature}")


def _python_function_block(source: str, signature: str) -> str:
    start = source.index(signature)
    lines = source[start:].splitlines(keepends=True)
    block = [lines[0]]
    for line in lines[1:]:
        if line.startswith("    def ") or line.startswith("def "):
            break
        block.append(line)
    return "".join(block)


def test_robo_ctrl_servo_exception_paths_return_failure_and_servoj_avoids_const_cast():
    source = _read("packages/control/robo_ctrl/src/robo_ctrl_node.cpp")
    servo_line = _function_body(source, "void RoboCtrlNode::handle_robot_servo_line")
    servo_joint = _function_body(source, "void RoboCtrlNode::handle_robot_servo_joint")

    assert "const_cast<JointPos*>" not in source
    assert "JointPos mutable_target_pose = target_pose;" in servo_joint
    assert "ret = robot_->ServoJ(&mutable_target_pose" in servo_joint
    assert "response->success = false;" in servo_line[servo_line.rindex("catch (const std::exception& e)") :]
    assert "response->message = e.what();" in servo_line[servo_line.rindex("catch (const std::exception& e)") :]
    assert "response->success = false;" in servo_joint[servo_joint.rindex("catch (const std::exception& e)") :]
    assert "response->message = e.what();" in servo_joint[servo_joint.rindex("catch (const std::exception& e)") :]


def test_depth_cluster_uses_atomic_byte_flags_not_vector_bool_in_openmp_claim_path():
    source = _read("packages/perception/depth_handler/include/depth_handler/cluster.hpp")
    body = _function_body(source, "std::vector<std::vector<Eigen::Vector3f>> clusterPointsKDTree")

    assert "std::vector<bool>" not in body
    assert "std::vector<std::atomic<std::uint8_t>> processed" in body
    assert "compare_exchange_strong" in body
    assert "#pragma omp parallel for" in body


def test_fairino_dualarm_planner_protects_scene_and_robot_state_snapshots():
    source = _read("packages/planning/planners/fairino_dualarm_planner/src/fairino_dualarm_planner_node.cpp")

    assert "mutable std::mutex state_mutex_;" in source
    assert "std::lock_guard<std::mutex> lock(state_mutex_);" in source
    assert "latest_scene_ = *msg;" in source
    assert "left_robot_state_ = *msg;" in source
    assert "right_robot_state_ = *msg;" in source
    assert "rclcpp::executors::MultiThreadedExecutor executor;" in source


def test_planning_scene_sync_cache_updates_and_liveness_checks_are_locked():
    source = _read("packages/planning/planning_scene_sync/scripts/planning_scene_sync_node.py")
    handle_scene = _python_function_block(source, "    def _handle_scene")
    has_live_object = _python_function_block(source, "    def _has_live_object")

    assert "with self._sync_lock:" in handle_scene
    assert "self._raw_scene = deepcopy(message)" in handle_scene
    assert "self._object_cache[scene_object.id] = deepcopy(scene_object)" in handle_scene
    assert "with self._sync_lock:" in has_live_object
    assert "self._object_last_seen_monotonic.get(object_id)" in has_live_object


def test_legacy_pose_goal_planner_uses_local_plan_and_mutex_snapshot():
    header = _read("packages/planning/legacy/fairino3_v6_planner/include/fairino3_v6_planner/pose_goal_planner.hpp")
    source = _read("packages/planning/legacy/fairino3_v6_planner/src/pose_goal_planner.cpp")

    assert "mutable std::mutex current_plan_mutex_;" in header
    assert "MoveGroupInterface::Plan* planned_output" in header
    assert "move_group_->plan(current_plan_)" not in source
    assert "moveit::planning_interface::MoveGroupInterface::Plan planned_plan;" in source
    assert "std::lock_guard<std::mutex> lock(current_plan_mutex_);" in source
    assert "move_group_->execute(plan_snapshot)" in source
    assert "extractTrajectoryPoses(planned_plan.trajectory_)" in source


def test_depth_processor_uses_immutable_camera_and_table_snapshots():
    header = _read("packages/perception/depth_handler/include/depth_handler/depth_processor_node.hpp")
    source = _read("packages/perception/depth_handler/src/depth_processor_node.cpp")

    assert "std::shared_ptr<const sensor_msgs::msg::CameraInfo> camera_info_;" in header
    assert "std::shared_ptr<const dualarm_interfaces::msg::SceneObjectArray> table_scene_;" in header
    assert "mutable std::mutex perception_state_mutex_;" in header
    assert "std::lock_guard<std::mutex> lock(perception_state_mutex_);" in source
    assert "camera_info = camera_info_;" in source
    assert "table_scene = table_scene_;" in source
    assert "buildGeometry(detection, depth_image, *camera_info, table_scene" in source
    assert "camera_info_->k" not in source
    assert "table_scene_->objects" not in source


def test_lwdetr_cuda_tensorrt_lifecycle_is_checked_and_ordered():
    header = _read("packages/perception/detector/include/detector/lw_detr.hpp")
    source = _read("packages/perception/detector/src/lw_detr.cpp")
    destructor = _function_body(source, "detector::LwDetr::~LwDetr")

    assert "context {nullptr}" in header
    assert "cuda_inputs {nullptr}" in header
    assert "void* plugin_handle {nullptr};" in header
    assert "bool check_cuda(cudaError_t result" in source
    assert "plugin_handle = dlopen" in source
    assert "dlclose(plugin_handle)" in destructor
    assert destructor.index("cudaStreamSynchronize") < destructor.index("destroy_trt_object(context)")
    assert destructor.index("destroy_trt_object(runtime)") < destructor.index("free_cuda_buffer(cuda_inputs)")
    assert destructor.index("free_cuda_buffer(cuda_labels)") < destructor.index("cudaStreamDestroy")
    assert destructor.index("cudaStreamDestroy") < destructor.index("dlclose(plugin_handle)")
    assert source.count("check_cuda(cudaMalloc") >= 6
    assert "check_cuda(cudaMemcpyAsync" in source
    assert "check_cuda(cudaStreamSynchronize(stream)" in source


def test_competition_console_stop_process_swaps_state_under_lock_and_waits_outside_lock():
    source = _read("packages/ops/competition_console_api/scripts/competition_console_api_node.py")
    stop_body = _python_function_block(source, "    def _stop_core_process")

    assert "self._core_process_lock = threading.Lock()" in source
    assert "self._core_process_stopping = False" in source
    assert 'return {"started": False, "status": "stopping"}' in source
    assert "with self._core_process_lock:" in stop_body
    assert "if self._core_process_stopping:" in stop_body
    assert "process = self._core_process" in stop_body
    assert "log_handle = self._core_log_handle" in stop_body
    assert "self._core_process = None" in stop_body
    assert "self._core_log_handle = None" in stop_body
    assert "self._core_process_stopping = process is not None and process.poll() is None" in stop_body
    assert "self._core_process_stopping = False" in stop_body
    assert stop_body.index("with self._core_process_lock:") < stop_body.index("process.wait(timeout=5.0)")
    assert "except ProcessLookupError:" in stop_body
    assert "except subprocess.TimeoutExpired:" in stop_body
