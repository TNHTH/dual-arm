# 2026-05-08 深度相机桌面高度候选标定

## 结论

已完成 no-motion 深度相机桌面平面检测和候选高度输出。右相机桌面平面拟合质量较好，可作为当前视觉安全参考：右相机到桌面平面的垂直距离候选为 `0.326731 m`，桌面中心深度约 `0.500500 m`，平面残差中位数约 `0.577 mm`。

本轮未启动 `robo_ctrl`，未调用任何 `/L|R/robot_move*`、`/L|R/robot_servo*`、夹爪 command、planner、execution adapter 或 `/competition/run`。当前结果仍是 `camera-frame candidate`，不是 verified world/table height；真实机械臂运动仍 fail-closed，不能用该结果直接下发动作。

## 现场运行边界

- 工作目录：`/home/gwh/dual-arm`
- 时间：`2026-05-08`
- ROS 域：`ROS_DOMAIN_ID=0`
- 当前 ROS 节点仅为左右 RGB bridge、YOLO detector 和 viewer：
  - `/left_rgb_bridge`
  - `/right_rgb_bridge`
  - `/detector_left_rgb`
  - `/detector_right_rgb`
  - `/left_rgb_detection_viewer`
  - `/right_rgb_detection_viewer`
- 未发现 `robo_ctrl`、MoveIt、planner、`planning_scene_sync`、`execution_adapter`、mock feeder 等控制链路节点。

## 新增工具

- `packages/tools/tools/scripts/table_height_probe.py`

工具行为：

- 只读打开 RGB/Z16 相机。
- 从 Z16 深度图中按 ROI 反投影点云。
- 用 RANSAC + SVD refine 拟合桌面平面。
- 输出 JSON、raw depth、depth visualization、overlay。
- `motion_safety_gate.motion_allowed=false` 固定 fail-closed，直到具备 verified camera-to-world 或 camera-to-robot-base transform、fresh robot state、planner collision object 和最小离桌 margin 证据。

静态验证：

- `/usr/bin/python3 -m py_compile packages/tools/tools/scripts/table_height_probe.py`：通过。
- 动作端点扫描无命中：`/[LR]/robot_move`、`/[LR]/robot_servo`、`epg50_gripper/command`、`/competition/run`、`execute_trajectory`、`plan_pose`。
- `git diff --check -- packages/tools/tools/scripts/table_height_probe.py packages/tools/tools/CMakeLists.txt`：通过。
- `colcon build --base-paths packages --packages-select tools`：`1 package finished [1.65s]`。
- `ros2 pkg executables tools` 已包含 `tools table_height_probe.py`。

## 采样命令

左相机：

```bash
/usr/bin/python3 packages/tools/tools/scripts/table_height_probe.py \
  --side left \
  --depth-device /dev/v4l/by-id/usb-Orbbec_R__Orbbec_Gemini_335_CP1E5420007N-video-index0 \
  --output-dir .codex/tmp/runtime/table-height-probe-20260508-left \
  --depth-scale-mm-per-raw 1.0 \
  --roi-y-frac 0.30,0.98 \
  --roi-x-frac 0.04,0.96
```

右相机：

```bash
/usr/bin/python3 packages/tools/tools/scripts/table_height_probe.py \
  --side right \
  --color-topic /right_camera_rgb/color/image_raw \
  --depth-device /dev/v4l/by-id/usb-Orbbec_R__Orbbec_Gemini_335_CP02653000G2-video-index0 \
  --output-dir .codex/tmp/runtime/table-height-probe-20260508-right \
  --depth-scale-mm-per-raw 1.0 \
  --roi-y-frac 0.30,0.98 \
  --roi-x-frac 0.04,0.96
```

## 结果

右相机结果：

- JSON：`.codex/tmp/runtime/table-height-probe-20260508-right/right_table_height_probe.json`
- Overlay：`.codex/tmp/runtime/table-height-probe-20260508-right/right_table_probe_overlay.jpg`
- 状态：`completed_candidate_no_motion`
- inlier count：`22168`
- inlier ratio：`0.7389`
- median residual：`0.577 mm`
- p95 residual：`2.078 mm`
- camera-frame plane normal：`[-0.001227, -0.900854, -0.434120]`
- camera-frame plane `d_m`：`0.326731`
- camera-to-table perpendicular distance：`0.326731 m`
- table center camera：`[0.036304, 0.121831, 0.500500] m`
- table center depth：`0.500500 m`

左相机结果：

- JSON：`.codex/tmp/runtime/table-height-probe-20260508-left/left_table_height_probe.json`
- Overlay：`.codex/tmp/runtime/table-height-probe-20260508-left/left_table_probe_overlay.jpg`
- 状态：`completed_candidate_no_motion`
- inlier count：`13821`
- inlier ratio：`0.4607`
- median residual：`1.094 mm`
- p95 residual：`6.846 mm`
- camera-frame plane normal：`[0.006013, 0.758224, -0.651966]`
- camera-frame plane `d_m`：`0.420600`
- camera-to-table perpendicular distance：`0.420600 m`
- table center camera：`[0.099584, -0.005545, 0.641000] m`
- table center depth：`0.641000 m`

## 安全判断

当前不能让机械臂基于该结果运动，原因：

- 该结果只在相机坐标系中成立，缺少 verified `camera_to_world` 或 `camera_to_robot_base` 变换。
- `depth_scale_mm_per_raw=1.0` 仍是本轮 operator-selected，不是全局 verified。
- 当前没有启动 planner / PlanningScene，因此没有把 `table_surface` 作为 MoveIt collision object 验证。
- 没有 fresh `/L|R/robot_state`、`motion_done=true`、`error_code=0` 证据。

安全门禁保持：

- `motion_safety_gate.passes=false`
- `motion_safety_gate.motion_allowed=false`
- 任何后续真实运动至少需要：verified world 高度、fresh robot state、table collision object、规划路径全程离桌面不少于 `0.050 m`。

## 下一步

1. 用 ROS `table_surface_detector` 在有 camera_info + TF 的 no-motion 图中重跑，输出 `table_surface` 到 `world` 的 pose。
2. 对同一桌面采至少 3 帧不同视角/时间的样本，用 `evaluate_table_calibration_run.py` 汇总高度稳定性。
3. 只有 world/table height 通过稳定性门禁后，才能把桌面 collision object 接入 planner；真实运动仍先 plan-only，再执行低速单步。
