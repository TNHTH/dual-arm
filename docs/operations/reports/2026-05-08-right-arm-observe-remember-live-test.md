# 2026-05-08 右臂单帧 RGB-D 记忆抓取实机尝试

## 结论

本轮按用户要求设置一次性 `DUALARM_HARDWARE_CONFIRM_TOKEN=TOKEN`，并拉起右臂低速控制、MoveIt、planner、scene、execution、右夹爪 status、右 RGB-D 和右 detector。没有执行真实轨迹，没有发送夹爪 command，没有调用 `/competition/run`。

停止原因：`observe_remember_grasp_node.py observe-only` 在感知阶段 fail-closed。右 RGB-D 与检测已可用，但深度为 `raw_unregistered`，首次观察要求 manual depth pixel；手动点 `(286,384)` 后，ROI 投到 `world` 的 z 中位数约 `0.197 m`，不满足计划要求的 `-0.055 < z < 0.090` 桌面过滤范围，`valid_world_points=0`。这说明当前 `right_camera_depth_frame -> world` 外参/桌面 frame 不可信，不能继续 publish-scene、plan-pregrasp 或 execution。

## 已启动链路

- `/R_robo_ctrl`
- `/joint_state_aggregator`
- `/robot_state_publisher`
- `/move_group`
- `/fairino_dualarm_planner`
- `/planning_scene_sync`
- `/execution_adapter`
- `/gripper1/gripper_node_right`
- `/tf_frame_authority`
- `/right_orbbec_gemini_bridge`
- `/detector_right`

低速参数：

- `robo_ctrl_R`: `max_velocity_percent=5.0`、`max_acceleration_percent=5.0`、`max_ovl_percent=5.0`、`motion_done_timeout_sec=120.0`
- `execution_adapter`: `trajectory_servo_joint_vel=0.2`、`trajectory_servo_joint_acc=0.2`、`trajectory_servo_joint_cmd_time=0.08`、`trajectory_servo_joint_duration_cmd_time=0.20`

## 关键证据

- `/R/robot_state`: `motion_done=true`、`error_code=0`
- 当前 TCP mm/deg: `[-24.034, -128.921, 363.514, 177.451, 58.571, 24.328]`
- `/planning/plan_pose`、`/execution/execute_trajectory`、`/execution/set_gripper`、`/gripper1/epg50_gripper/status` 均可见
- 右夹爪 status 可读：`success=True`、`gact=False`、`error=0`、`position=0`
- `/right_camera/color/image_raw`: 约 `2.0 Hz`
- `/right_camera/depth/image_raw`: 约 `2.0 Hz`
- `/detector/right/detections`: `cocacola`，score 约 `0.9166`
- `observe-only` 未传 manual pixel: `.codex/tmp/runtime/right-arm-observe-remember-live-20260508-2150/report.json`
  - `status=memory_unavailable`
  - reason `rgb_depth_not_aligned_manual_depth_pixel_required`
- `observe-only --manual-depth-pixel 286,384`: `.codex/tmp/runtime/right-arm-observe-remember-live-20260508-2150-manual/report.json`
  - `status=memory_unavailable`
  - `manual_depth_pixel.success=false`
  - `valid_world_points=0`
- 手动点 debug probe:
  - camera ROI points: `264`
  - depth z median: `0.3655 m`
  - projected world z min/median/max: `0.1878 / 0.1967 / 0.2120 m`
  - valid z-filter points: `0`
- TF echo `world -> right_camera_depth_frame`:
  - translation `[-0.024, -0.479, 0.364]`
  - RPY `[177.451, 58.571, 24.328] deg`

## Bridge 修复

`orbbec_gemini_bridge` 原 OpenCV V4L2 Z16 路径无法稳定读取 `/dev/video8`，但 native V4L2 mmap 能读。已给 `packages/perception/orbbec_gemini_bridge/scripts/orbbec_gemini_ros_bridge.py` 增加 `native_v4l2_mmap` Z16 fallback，并用直接 `ros2 run` 参数将右 RGB-D 降到 `fps=2.0`。

验证：

- `/usr/bin/python3 -m py_compile packages/perception/orbbec_gemini_bridge/scripts/orbbec_gemini_ros_bridge.py`: 通过
- `git diff --check -- packages/perception/orbbec_gemini_bridge/scripts/orbbec_gemini_ros_bridge.py`: 通过
- `colcon build --base-paths packages --packages-select orbbec_gemini_bridge`: `1 package finished`

## 安全决定

- 不运行 `publish-scene`，因为没有可信 `coke_can_memory.json`。
- 不运行 `plan-pregrasp`，因为 memory 未生成。
- 不运行 `execute-pregrasp` / `execute-final`，因为感知门禁失败，且仍没有 verified `Rend_to_pinch_center`。
- 不合爪，不抬起。

## 收尾

已停止本轮临时运行图：

- `execution_adapter`
- `planning_scene_sync`
- `fairino_dualarm_planner`
- `move_group`
- `joint_state_aggregator`
- `R_robo_ctrl`
- `/gripper1` 右夹爪节点
- `right_orbbec_gemini_bridge`
- `detector_right`
- `tf_frame_authority`

收尾检查：

- `pgrep -af 'ros2 launch|move_group|fairino_dualarm_planner|competition_console_api|planning_scene_sync|execution_adapter|robo_ctrl|epg50|orbbec_gemini|detector_right|joint_state_aggregator'`: 无输出
- `ROS_DOMAIN_ID=0 ros2 node list`: 无输出

退出噪声：

- `move_group` 在 Ctrl+C teardown 阶段 exit code `-11`，与既有 MoveIt teardown 噪声一致；本轮没有运动执行，停止前 `/R/robot_state` 为 `motion_done=true`、`error_code=0`。

## 下一步

1. 修正或临时加载可信的 `right_camera_depth_frame -> world` candidate，使桌面/可乐 ROI 投影后的 z 落入计划过滤范围。
2. 重新运行 `observe-only`，必须生成 `coke_can_memory.json` 和 overlay。
3. 人工确认 overlay/RViz 后再进入 `publish-scene` 和 `plan-pregrasp`。
4. 真实执行前仍必须提供 token、人工确认和 `Rend_to_pinch_center`。
