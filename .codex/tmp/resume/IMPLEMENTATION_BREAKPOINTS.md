# Implementation Breakpoints

更新时间: 2026-05-08

## 2026-05-09 FairinoDualArm 上游项目接入当前模型与基座配置
- 当前波次：fairino-dualarm-upstream-model-detection-base-config
- 状态：completed_no_motion_ready_for_measured_base_entry
- 权威进度报告：
  - `docs/operations/reports/2026-05-09-fairino-dualarm-upstream-model-detection-base-config.md`
- 当前运行状态：
  - `/home/gwh/FairinoDualArm` 中 detector/depth_handler smoke 使用隔离 `ROS_DOMAIN_ID=77/78`，已结束。
  - 后置检查发现 `/home/gwh/dual-arm` 既存 `robo_ctrl`、MoveIt、planner、execution_adapter 等进程仍在运行；这些不是本轮启动，未停止。
- 已完成：
  1. `/home/gwh/FairinoDualArm` 浅克隆上游 commit `f1c2c1e`。
  2. 接入 `best.pt/last.pt` 和 `detector_pt_node.py`，新增 `detector_pt.launch.py`。
  3. detector 默认关闭旧 C++ TensorRT runtime，避免新版 TensorRT API 编译失败阻断 PT 模型链路。
  4. `depth_handler` launch 补齐并支持 `target_frame/source_frame`。
  5. `robo_ctrl` 基座 TF 从硬编码改为 `base_x/y/z_m` 与 `base_roll/pitch/yaw_deg` 参数，默认全零占位。
  6. `tools` 缺失 `opencv_test.cpp` 时跳过该测试 target，`tools` 构建通过。
- 验证证据：
  - `colcon build --packages-select detector depth_handler robo_ctrl --cmake-args -DPython3_EXECUTABLE=/usr/bin/python3`：通过。
  - `colcon build --packages-select tools --cmake-args -DPython3_EXECUTABLE=/usr/bin/python3`：通过。
  - detector no-motion smoke 成功加载 `best.pt`。
  - depth_handler no-motion smoke 成功初始化。
  - `robo_ctrl_L/R.launch.py --show-args` 显示基座测量参数。
- 当前阻塞/下一步：
  1. 用户现场测量左右基座平移和 RPY 后，填入 `robo_ctrl_L/R.launch.py` 参数。
  2. 在默认 ROS 域做任何 planner/硬件验证前，先确认是否清理当前 `/home/gwh/dual-arm` 既存控制图进程。
  3. 若要真接相机检测，再启动真实相机输入并验证 `/detector/detections` 与 `/depth_handler/bbox3d`，仍不直接放行运动。

## 2026-05-08 右臂 one-shot-live 实机测试
- 当前波次：right-arm-one-shot-live-real-test
- 状态：real_hardware_grasp_attempt_failed_closed_no_lift
- 权威进度报告：
  - `docs/operations/reports/2026-05-08-right-arm-one-shot-live-real-test.md`
- 当前运行状态：
  - 实机图已停止；`pgrep` 控制类进程无输出。
  - `ROS_DOMAIN_ID=0 ros2 daemon stop/start` 后 `ros2 node list` 为空。
  - 最后一次停止前右臂 `motion_done=true`、`error_code=0`。
  - 右夹爪已通过 `/execution/set_gripper` 打开，status position `0`、`gobj=3`、error `0`。
- 已完成：
  1. `one-shot-live` 实机完成 depth table correction、depth-only segmentation、memory、scene 和 pregrasp_high 真实执行。
  2. 恢复执行完成 pregrasp_high、pregrasp_low、grasp 真实执行和夹爪 close。
  3. 最终 `gobj=3`，按 gate 未 attach、未 lift。
  4. 修复/记录现场问题：depth scale `1.0`、right_base_rpy 弧度、positive standard optical rotation candidate、scene 发布时长、planner state freshness。
- 关键 artifact：
  - `.codex/tmp/runtime/one-shot-live-real-20260508-r9/coke_can_memory.json`
  - `.codex/tmp/runtime/one-shot-live-real-20260508-r9/report.json`
  - `.codex/tmp/runtime/one-shot-live-real-20260508-r9-execute-final8-grasp-rpy190--10-30/report.json`
- 当前阻塞：
  - 没有抓起可乐；不能声明成功。
  - `Rend_to_pinch_center` 仍未 verified，本轮 `0,0,0` 很可能导致夹爪实际中心不对。
  - `190,-10,30` 可规划但路径过长，不应继续作为盲重试方案。
- 下一步唯一入口：
  1. 先标定 `Rend_to_pinch_center` 并加入 grasp 轨迹长度/关节距离上限。
  2. 重新从真实 grasp 前视角观测目标，生成新 memory。
  3. plan-only 同时验证 grasp 和 lift，且路径短、姿态合理后，才能再次实机合爪。

## 2026-05-08 右臂单帧 RGB-D 记忆抓取实机尝试
- 当前波次：right-arm-observe-remember-live-test
- 状态：blocked_before_motion_by_untrusted_camera_world_projection
- 权威进度报告：
  - `docs/operations/reports/2026-05-08-right-arm-observe-remember-live-test.md`
- 当前运行状态：
  - 本轮拉起了右臂低速控制、MoveIt、planner、`planning_scene_sync`、`execution_adapter`、右夹爪 status、右 RGB-D 和右 detector。
  - 没有执行真实轨迹，没有发送夹爪 command，没有调用 `/competition/run`。
  - 收尾后关键进程检查和 `ROS_DOMAIN_ID=0 ros2 node list` 均为空。
- 已完成：
  1. `DUALARM_HARDWARE_CONFIRM_TOKEN=TOKEN` 仅作为一次性现场确认使用，没有取消 gate。
  2. 右臂状态可读：`motion_done=true`、`error_code=0`。
  3. planner/action/gripper status 服务可见：`/planning/plan_pose`、`/execution/execute_trajectory`、`/execution/set_gripper`、`/gripper1/epg50_gripper/status`。
  4. `orbbec_gemini_bridge` 新增 native V4L2 mmap Z16 fallback；右 RGB-D 发布约 `2.0 Hz`。
  5. 右检测输出 `cocacola` score 约 `0.9166`。
  6. `observe-only` 未传 manual pixel 时输出 manual overlay 并停止。
  7. `observe-only --manual-depth-pixel 286,384` 后仍停止：投影到 `world` 的 z 中位数约 `0.197 m`，`valid_world_points=0`。
- 关键 artifact：
  - `.codex/tmp/runtime/right-arm-observe-remember-live-20260508-2150/report.json`
  - `.codex/tmp/runtime/right-arm-observe-remember-live-20260508-2150/manual_depth_pick_rgb_overlay.jpg`
  - `.codex/tmp/runtime/right-arm-observe-remember-live-20260508-2150/manual_depth_pick_depth_overlay.jpg`
  - `.codex/tmp/runtime/right-arm-observe-remember-live-20260508-2150-manual/report.json`
- 当前阻塞：
  - `right_camera_depth_frame -> world` 外参/桌面 frame 不可信；不能生成 `coke_can_memory.json`。
  - 没有 memory，因此不得 publish scene、plan 或执行。
  - `Rend_to_pinch_center` 仍未 verified；后续真实 final approach 仍需该参数。
- 下一步唯一入口：
  1. 修正或临时加载可信 `right_camera_depth_frame -> world` candidate。
  2. 重新运行 `observe-only`，必须生成 memory、overlay 和 debug points。
  3. 人工确认 scene 后才能 `plan-pregrasp`；真实执行仍需 token、人工确认和 pinch offset。

## 2026-05-08 深度相机桌面高度候选标定
- 当前波次：table-height-depth-probe
- 状态：completed_camera_frame_table_candidate_motion_gate_closed
- 权威进度报告：
  - `docs/operations/reports/2026-05-08-table-height-depth-probe.md`
- 当前运行状态：
  - `ROS_DOMAIN_ID=0` 仅保留左右 RGB bridge、detector 和 viewer。
  - 未启动 `robo_ctrl`、MoveIt、planner、`planning_scene_sync`、`execution_adapter`、夹爪节点或 `/competition/run`。
- 已完成：
  1. 新增 `packages/tools/tools/scripts/table_height_probe.py`，只读采 RGB/Z16 并拟合桌面平面。
  2. 右相机候选桌面平面质量较好：inlier ratio `0.7389`，median residual `0.577 mm`，camera-to-table perpendicular distance `0.326731 m`，table center camera `[0.036304,0.121831,0.500500] m`。
  3. 左相机候选：inlier ratio `0.4607`，median residual `1.094 mm`，camera-to-table perpendicular distance `0.420600 m`。
  4. 静态安全扫描、`py_compile`、`git diff --check`、`colcon build --packages-select tools` 通过。
- 关键 artifact：
  - `.codex/tmp/runtime/table-height-probe-20260508-right/right_table_height_probe.json`
  - `.codex/tmp/runtime/table-height-probe-20260508-right/right_table_probe_overlay.jpg`
  - `.codex/tmp/runtime/table-height-probe-20260508-left/left_table_height_probe.json`
  - `.codex/tmp/runtime/table-height-probe-20260508-left/left_table_probe_overlay.jpg`
- 当前阻塞：
  - 当前只是 camera-frame candidate，缺 verified `camera_to_world` 或 `camera_to_robot_base`。
  - 尚未把 `table_surface` 接入 planner collision object 做 runtime 验证。
  - `motion_safety_gate.motion_allowed=false`；不得基于该结果真实运动。
- 下一步唯一入口：
  1. 在 no-motion ROS 图里启动 `table_surface_detector`，要求 camera_info + TF 闭合，输出 world `table_surface`。
  2. 采至少 3 个桌面样本并用 `evaluate_table_calibration_run.py` 检查高度范围、法向漂移和残差。
  3. 只有 verified world 高度 + planner table collision + `0.050 m` 离桌 margin 通过后，才进入 plan-only。

## 2026-05-08 双相机点云记忆与右臂夹取候选
- 当前波次：dual-camera-memory-right-grasp-candidate
- 状态：memory_candidate_ready_no_motion_motion_gate_closed
- 权威进度报告：
  - `docs/operations/reports/2026-05-08-dual-camera-memory-right-grasp-candidate.md`
- 已完成：
  1. 生成双相机点云记忆：`.codex/tmp/runtime/dual-camera-coke-memory-20260508-ros-topic/dual_camera_coke_memory.json`。
  2. 生成本地 3D HTML 可视化：`.codex/tmp/runtime/dual-camera-coke-memory-20260508-ros-topic/dual_camera_coke_memory_view.html`。
  3. 匹配 `cocacola -> cola_bottle`，使用 `object_geometry.yaml` 硬编码 bbox `[0.060,0.060,0.145] m`、抓取区 `body_mid`、推荐夹爪宽度 `0.066 m`。
  4. 生成右臂候选：`.codex/tmp/runtime/dual-camera-coke-memory-20260508-ros-topic/right_arm_grasp_memory/right_arm_grasp_memory_candidate.json`。
  5. 新增并安装 `dual_camera_coke_memory.py`、`visualize_dual_camera_coke_memory.py`、`build_right_arm_grasp_from_memory.py`。
- 当前阻塞：
  - `DUALARM_HARDWARE_CONFIRM_TOKEN=unset`。
  - `/planning/plan_pose`、`/execution/execute_trajectory`、`/R/robot_state`、右夹爪 status 服务当前不可用。
  - clearance、右相机外参和右到左融合变换仍 fail-closed / candidate-only。
- 下一步唯一入口：
  1. 受控启动核心控制栈，只读确认右臂和右夹爪状态。
  2. 新鲜重采 memory candidate。
  3. token 和现场安全确认后先 plan-only，再执行单右臂夹取。

## 2026-05-08 右相机曝光检查与可乐 no-motion 预检
- 当前波次：right-camera-exposure-coke-precheck
- 状态：live_rgb_detection_view_running_no_motion_grasp_blocked
- 权威进度报告：
  - `docs/operations/reports/2026-05-08-right-camera-exposure-and-coke-precheck.md`
- 当前运行状态：
  - 未执行真实运动、未调用夹爪 command、未调用 `/competition/run`。
  - 当前按用户要求保留左右 RGB bridge、detector 和 viewer 运行。
  - 当前 ROS 节点：`/left_rgb_bridge`、`/right_rgb_bridge`、`/detector_left_rgb`、`/detector_right_rgb`、`/left_rgb_detection_viewer`、`/right_rgb_detection_viewer`。
  - 右彩色口当前 live 保留自动 `auto_exposure=0`、`exposure_dynamic_framerate=1`、`gain=16`。
- 已完成：
  1. 复现右相机自动曝光暗图：灰度均值约 `18.7`，YOLO 无 `cocacola` 检测。
  2. 对比左相机同场景，确认不是全局光照或目标缺失。
  3. 扫描右相机同 serial `CP02653000G2` 的 video 节点，确认 `/dev/video14` 是需修正的彩色口。
  4. 读取 UVC 控制项并试验手动曝光；`exposure=300/gain=32` 恢复可用图像。
  5. 重新运行 `right_arm_grasp_precheck.py`，检测 `cocacola` score `0.9229`。
  6. 输出 depth ROI median `0.408 m`、target center camera `[-0.010557, 0.002254, 0.408000] m`、candidate TCP point `[-0.020557, -0.087746, 0.464000] m`。
  7. 已启动左右 RGB 检测可视化窗口：左侧 `cocacola 0.9281`，右侧自动曝光最终 `cocacola 0.9328`。
- 关键 artifact：
  - `.codex/tmp/runtime/right-arm-coke-precheck-20260508-0001/right_arm_grasp_precheck.json`
  - `.codex/tmp/runtime/right-camera-exposure-check-20260508-device-scan/scan.json`
  - `.codex/tmp/runtime/right-camera-exposure-check-20260508-manual-exp300-gain32/right_manual_exp300_gain32_right_color.jpg`
  - `.codex/tmp/runtime/right-arm-coke-precheck-20260508-exp300-gain32/right_arm_grasp_precheck.json`
  - `.codex/tmp/runtime/right-arm-coke-precheck-20260508-exp300-gain32/right_color_depth_precheck_overlay.jpg`
  - `.codex/tmp/runtime/dual-rgb-detection-view-20260508/left_overlay_snapshot.jpg`
  - `.codex/tmp/runtime/dual-rgb-detection-view-20260508/right_overlay_snapshot_exp200_gain16.jpg`
  - `.codex/tmp/runtime/dual-rgb-detection-view-20260508/auto-exposure-probe/right_auto0_dyn1_final_overlay.jpg`
  - `.codex/tmp/runtime/dual-rgb-detection-view-20260508/auto-exposure-probe/auto_exposure_probe.json`
- 当前阻塞：
  - `DUALARM_HARDWARE_CONFIRM_TOKEN` 未设置。
  - `clearance_gate.passes=false`，`extrinsic_gate.passes=false`，`auto_grasp_allowed=false`。
  - 右相机外参仍不是 calibration verified；点云障碍分割仍受线缆/桌面/目标周边影响。
- 下一步唯一入口：
  1. 继续单右臂路线；先在当前曝光下清理目标周边或调整障碍分割，重新生成干净点云预检。
  2. 只读确认右臂 `robot_state` 和右夹爪 status。
  3. 设置硬件 token 且现场确认安全后，才允许 plan-only 之后进入真实单步动作。

## 2026-05-08 Production Runtime Authority Closure
- 当前波次：production-runtime-authority-closure
- 状态：completed_software_architecture_closure_no_hardware_motion
- 权威进度报告：
  - `docs/operations/reports/2026-05-08-architecture-closure-baseline.md`
  - `docs/operations/reports/2026-05-08-production-runtime-authority-closure.md`
- 当前运行状态：
  - 本轮未启动真实硬件，未调用 `/competition/run`，未运行 `start_hardware:=true`。
  - mock/no-motion smoke 已结束；后置 stale process 检查未发现控制图残留。
- 已完成：
  1. 新增 `docs/architecture/runtime-authority.md` 与 `docs/architecture/adr/ADR-0001-production-runtime-authority.md`。
  2. 新增 `scripts/check_runtime_authority.py` 并接入 `scripts/ci/software_check.sh` 与 GitHub software-check workflow。
  3. `competition_integrated.launch.py` 默认不启动 console API；console API production 构造路径不创建 raw motion clients。
  4. 新增 debug console launch，raw jog/direct send 只允许 debug token gate。
  5. `quick_competition`、quick config、quick scripts 和旧 quick tests 已归档到 `archive/quick_competition_2026-05-08/`，归档根有 `COLCON_IGNORE`。
  6. active build group、bringup dependency、CI build/test 路径不再要求 quick。
  7. 新增 competition/profiles camera config；precheck 与 Orbbec bridge 采用 profile-first/fail-closed 语义。
  8. task contract 增加 pouring/handover primitive sequence 与 checkpoint evidence skeleton。
- 验证证据：
  - `python3 scripts/check_path_hardcodes.py`：passed。
  - `python3 scripts/check_readme_coverage.py`：passed。
  - `python3 scripts/check_runtime_authority.py`：passed。
  - `python3 scripts/check_runtime_authority.py --launch-contracts`：passed。
  - `/usr/bin/python3 -m pytest -q tests/unit tests/integration packages/tasks/dualarm_task_manager/test/test_dualarm_task_contract.py`：`60 passed`。
  - `colcon build --base-paths packages --packages-select competition_console_api robo_ctrl dualarm_task_manager execution_adapter competition_start_gate dualarm_bringup dualarm_simulation tools`：8 packages finished。
  - `colcon build --base-paths packages --packages-select orbbec_gemini_bridge dualarm_bringup`：2 packages finished。
  - `PYTHON_BIN=/usr/bin/python3 bash scripts/ci/software_check.sh`：passed，包含 15 colcon tests、web build 与 Playwright 2 passed。
- 当前阻塞/风险：
  - 本轮只证明软件架构收口，不证明真机安全或比赛成功。
  - 右臂夹取恢复必须重新采集 precheck，验证外参、深度单位、ROI、clearance gate、`motion_done` 和 gripper status。
- 下一步唯一入口：
  1. 保持 production runtime authority checker 为 CI 必过项。
  2. 若要恢复右臂夹取，先按 profile 采集新的 no-motion precheck 和现场证据；通过前不得调用真实 motion 或 `/competition/run`。

## 2026-05-08 双臂连接检测与双相机瓶盖单点深度采样
- 当前波次：dual-arm-hardware-camera-alignment-log
- 状态：completed_no_motion_single_cap_point_captured_need_more_points
- 权威进度报告：
  - `docs/operations/reports/2026-05-08-dual-arm-hardware-camera-alignment-log.md`
- 当前运行状态：
  - `ROS_DOMAIN_ID=0 ROS2CLI_ENABLE_DAEMON=0 ros2 node list` 为空。
  - 关键进程检查无 `robo_ctrl`、MoveIt、planner、相机采样脚本残留。
  - 未执行真实运动、未调用夹爪 command、未调用 `/competition/run`。
- 已完成：
  1. 新增 `packages/tools/tools/scripts/cap_depth_alignment_probe.py` 并加入 `tools` 安装清单。
  2. 工具静态验证和 `tools` 构建通过。
  3. 双臂网络和只读 `robot_state` 检测通过：左右状态约 `4.996 Hz`，均 `motion_done=true`、`error_code=0`。
  4. 左相机 `/dev/video6` RGB + `/dev/video0` Z16 采样成功。
  5. 右相机 `/dev/video14` RGB + `/dev/video8` Z16 采样成功。
  6. `cap_p1` 瓶盖像素、ROI 深度和相机点均已输出 JSON。
  7. `cap_p2` 追加采样完成：左 camera point `[-0.089138, -0.058286, 0.410] m`，右 camera point `[-0.072663, 0.061278, 0.412] m`。
  8. `cap_p3` 追加采样完成：左 camera point `[0.045768, -0.005558, 0.443] m`，右 camera point `[0.051995, -0.001598, 0.443] m`。
  9. `cap_p4` 追加采样完成：左 camera point `[0.010202, -0.077279, 0.394] m`，右 camera point `[-0.068143, 0.001595, 0.464] m`。
  10. 已用 `cap_p1..cap_p4` 计算右相机到左相机候选刚体变换：RMSE `0.013744 m`，最大误差 `0.020159 m`。
  11. `cap_p5` 独立验证采样完成：左 camera point `[-0.056907, -0.011099, 0.372] m`，右 camera point `[-0.065067, 0.015704, 0.455] m`。
  12. `cap_p5` 独立验证失败：候选变换预测误差 `0.083752 m`，状态 `candidate_validation_failed_high_error`。
  13. 已按“瓶盖顶部中心”语义重标记并重拟合：`cap_p1..cap_p3` 为 inlier，`cap_p4` 为 weak inlier，`cap_p5` 为 rejected validation outlier。
  14. 已用 camera+TCP 链路推导候选 `right_base -> left_base` 并与历史指尖接触候选对比；两者平移差约 `254.949 mm`，旋转差约 `90.002 deg`。
- 关键 artifact：
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-left/cap_p1_left_capture.json`
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-left/cap_p1_left_cap_depth_analysis.json`
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-left/cap_p1_left_cap_pixel_overlay.jpg`
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-right/cap_p1_right_capture.json`
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-right/cap_p1_right_cap_depth_analysis.json`
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-right/cap_p1_right_cap_pixel_overlay.jpg`
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-left-p2/cap_p2_left_capture.json`
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-left-p2/cap_p2_left_cap_depth_analysis.json`
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-left-p2/cap_p2_left_cap_pixel_overlay.jpg`
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-right-p2/cap_p2_right_capture.json`
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-right-p2/cap_p2_right_cap_depth_analysis.json`
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-right-p2/cap_p2_right_cap_pixel_overlay.jpg`
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-left-p3/cap_p3_left_capture.json`
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-left-p3/cap_p3_left_cap_depth_analysis.json`
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-left-p3/cap_p3_left_cap_pixel_overlay.jpg`
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-right-p3/cap_p3_right_capture.json`
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-right-p3/cap_p3_right_cap_depth_analysis.json`
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-right-p3/cap_p3_right_cap_pixel_overlay.jpg`
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-left-p4/cap_p4_left_capture.json`
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-left-p4/cap_p4_left_cap_depth_analysis.json`
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-left-p4/cap_p4_left_cap_pixel_overlay.jpg`
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-right-p4/cap_p4_right_capture.json`
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-right-p4/cap_p4_right_cap_depth_analysis.json`
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-right-p4/cap_p4_right_cap_pixel_overlay.jpg`
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-transform-candidate.json`
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-left-p5/cap_p5_left_capture.json`
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-left-p5/cap_p5_left_cap_depth_analysis.json`
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-left-p5/cap_p5_left_cap_pixel_overlay.jpg`
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-right-p5/cap_p5_right_capture.json`
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-right-p5/cap_p5_right_cap_depth_analysis.json`
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-right-p5/cap_p5_right_cap_pixel_overlay.jpg`
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-cap-p5-validation.json`
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-refit-with-labels.json`
  - `.codex/tmp/runtime/dual-arm-camera-tcp-vs-contact-transform-compare-20260508.json`
- 当前阻塞：
  - 4 点候选刚体变换未通过 `cap_p5` 独立验证，误差约 `0.083752 m`。
  - `cap_p5` 附近有浅色长条物体，左 ROI 有效像素较少且 raw min 有离群值，存在混合深度风险。
  - 瓶盖高度不应从相机到相机的“瓶盖顶部中心”刚体拟合里扣除；桌面接触点换算需要桌面法向和瓶盖实测高度。
  - camera+TCP 推导和指尖接触候选差异远超内部残差，不能互相验证，不能标记 verified。
  - 深度单位 `raw=mm` 仍不是全局 verified。
- 下一步唯一入口：
  1. 建议重新采 `cap_p5_repeat`：瓶盖周围尽量不要贴近长条、线缆或反光边缘。
  2. 复用 `cap_depth_alignment_probe.py capture/analyze` 采左右相机和像素深度。
  3. 若重复验证仍大于约 `30 mm`，继续采更多无干扰点并重新拟合；通过前不得标记 verified。

## 2026-05-07 右臂脚本化靠近收口与架构审查接续
- 当前波次：right-arm-autonomous-approach-closure-and-architecture-handoff
- 状态：closed_no_live_ros_graph_grasp_not_attempted_architecture_review_next
- 权威进度报告：
  - `docs/operations/reports/2026-05-07-right-arm-practice-control-log.md`
  - `.codex/tmp/resume/NEXT_WINDOW_PROMPT_2026-05-07-right-arm-architecture-and-grasp.md`
- 当前运行状态：
  - 已停止 `robo_ctrl`、MoveIt、planner、`planning_scene_sync`、`execution_adapter` 和右夹爪节点。
  - `ros2 daemon stop` 后复查没有有效 `ROS_DOMAIN_ID=0` 控制节点或关键进程残留。
  - 右臂最后有效状态在停图前为 `motion_done=true`、`error_code=0`。
- 最后有效硬件状态：
  - 右臂 TCP 约 `[-226.135, -262.203, 236.498, -171.249, 38.941, 37.351] mm/deg`。
  - 右夹爪 status：`success=true`、`gact=true`、`gsta=3`、`gobj=3`、`error=0`、`position=0`，夹爪打开。
- 已完成：
  1. `right_arm_grasp_precheck.py` 修正 camera->TCP forward transform 和 180 度旋转几何，输出 camera-center/TCP-contact 两套 alignment 候选。
  2. `right_arm_autonomous_grasp_attempt.py` 默认把 alignment 改为 advisory；显式 `--require-target-alignment-for-*` 才作为硬门禁。
  3. 执行两段 MoveIt/`execution_adapter` 右臂 `pregrasp` 靠近，均成功并闭环。
  4. 目标贴边后未合爪，改执行一段 `visual_center_step` 视野恢复。
  5. 未调用 `/competition/run`，未做双臂协作，未执行合爪。
- 关键 artifact：
  - `.codex/tmp/runtime/right-arm-contact-approach-execute-pregrasp-advisory-20260507-162142/right_arm_autonomous_grasp_attempt.json`
  - `.codex/tmp/runtime/right-arm-contact-approach-execute-second-pregrasp-advisory-20260507-162307/right_arm_autonomous_grasp_attempt.json`
  - `.codex/tmp/runtime/right-arm-visual-recover-execute-edge-20260507-162508/right_arm_autonomous_grasp_attempt.json`
  - `.codex/tmp/runtime/right-arm-grasp-precheck-after-visual-recover-20260507-162527/right_arm_grasp_precheck.json`
- 当前阻塞：
  - 最新视觉仍识别到 `cocacola`，但 bbox 贴底边，`bbox_edge_margin_px=0.0`。
  - clearance gate 失败；右相机到右 TCP 仍不是 calibration verified。
  - 目标 alignment 只是参考，不是默认硬门禁；但贴边/深度跳变时不能直接合爪。
- 用户新增下窗口要求：
  - external review 完整审查指出项目存在正式主链、Quick 实机旁路、Gazebo 仿真链三套分裂路径，以及 Orbbec bridge、camera matrix、执行层、任务编排、pouring、夹爪、launch、配置和实机脚本重复。
  - 下窗口必须先解决这些建议体现的问题，再接续右臂夹取任务。
- 下一步唯一入口：
  1. 先读 `.codex/tmp/resume/NEXT_WINDOW_PROMPT_2026-05-07-right-arm-architecture-and-grasp.md`。
  2. 将 external review 架构审查转成 PRD Story，先做 P0/P1 小波次清理，不触发硬件。
  3. 架构清理完成并验证后，重新启动右臂控制图，重新跑 precheck，禁止复用旧 JSON 直接运动。
  4. 若目标可见且 plan 生成实际 `grasp` 段，才进入合爪；合爪后以 EPG50 `gobj in {1,2}` 声明抓取成功。

## 2026-05-07 右臂深度建模预检与实践控制待确认
- 当前波次：right-arm-depth-model-practice-control
- 状态：no_motion_depth_precheck_done_waiting_field_safety_confirmation_for_jog
- 权威进度报告：
  - `docs/operations/reports/2026-05-07-right-arm-practice-control-log.md`
- 当前运行状态：
  - `ROS_DOMAIN_ID=0 ros2 node list` 为空。
  - 未启动 `/right_robo_ctrl`。
  - 未执行本轮右臂 jog。
  - 未执行右夹爪 command。
- 已完成：
  - 新增 `packages/tools/tools/scripts/right_arm_grasp_precheck.py`。
  - `py_compile`、禁用动作 endpoint 静态扫描、`git diff --check`、`colcon build --packages-select tools` 通过。
  - no-motion 输出：`.codex/tmp/runtime/right-arm-grasp-precheck-20260507-143327/right_arm_grasp_precheck.json`。
  - 右臂控制器 `192.168.58.3:8080` 可达；右夹爪 by-id 串口存在。
- 预检结论：
  - 目标深度模型有效。
  - 障碍物 clearance gate 失败。
  - 右相机到右 TCP 仅 candidate，不 verified。
  - `safety_gate.passes=false`，不允许自动抓取。
- 用户授权状态：
  - 用户要求今天实践为主并让机械臂动起来。
  - 当前仍缺真实运动前现场安全确认短语：`确认执行右臂Z+2mm`。
- 下一步唯一入口：
  1. 收到现场确认后，启动右臂 `robo_ctrl_R.launch.py`。
  2. 采样 `/R/robot_state` 5 帧，要求 fresh、`motion_done=true`、`error_code=0`。
  3. 只发送一次低速 `Z +2.0 mm` 增量 `/R/robot_move_cart`。
  4. 运动后采样闭环；若 `motion_done=false` 持续，立即 `StopMotion()`。
  5. 右臂停稳后才进入右夹爪原地 status/enable/open-close-open。

## 2026-05-07 右臂运动停稳与脚本化几何接续
- 当前波次：right-arm-single-arm-scripted-geometry-handoff
- 状态：right_z_plus_3mm_motion_stopped_scripted_geometry_required
- 权威进度报告：
  - `docs/operations/reports/2026-05-06-real-hardware-debug-log.md`
  - `docs/operations/reports/2026-05-07-right-arm-motion-stop-and-scripted-geometry-handoff.md`
- 当前运行状态：
  - `/right_robo_ctrl` 已停止。
  - `ROS_DOMAIN_ID=0 ros2 node list` 为空。
  - 当前没有由本窗口保留的右臂运动 service 节点。
- 已完成：
  - 已识别并处理上次右臂低速 `Z +3.0 mm` 增量测试后 `motion_done=false` 的风险。
  - 直连 Fairino SDK helper 调用 `StopMotion()` 返回 `ret=0`。
  - 停止后连续 5 帧 `/R/robot_state` 均为 `motion_done=true`、`error_code=0`，TCP `z` 稳定在约 `643.086 mm`。
- 未计入通过证据：
  - 未做夹爪 enable/open/close。
  - 未调用 `/competition/run`。
  - 未做双臂协作。
  - 未证明自动夹取、避障、右相机外参或 color/depth 对齐 verified。
- 用户新增要求：
  - 几何计算必须全部脚本化，不能由助手在聊天里手算。
  - 本轮右深度按 `raw=mm` 使用，即 `676 raw = 676 mm = 0.676 m`。
  - 右相机到右 TCP 可以临时参考左臂参数，但只能作为 candidate。
- 下一步唯一入口：
  1. 新增或继续实现 `packages/tools/tools/scripts/right_arm_grasp_precheck.py`。
  2. 脚本输出 JSON，包含检测、ROI 深度、相机点、候选 TCP 点、障碍物距离和 safety gate。
  3. 第一版只做 no-motion 计算，不调用运动或夹爪。
  4. 任何后续真实 motion 前，重新启动右臂状态节点并确认 fresh、`motion_done=true`、`error_code=0`，再由用户授权具体单步动作。

## 2026-05-06 右臂单臂夹取链路预检查
- 当前波次：right-arm-single-arm-grasp-precheck-no-motion
- 状态：target_detected_depth_raw_estimated_grasp_blocked_fail_closed
- 权威进度报告：`docs/operations/reports/2026-05-06-real-hardware-debug-log.md`
- 当前运行状态：
  - `/right_robo_ctrl` 已停止。
  - 右侧 color-only 可视化/检测链路已停止以释放深度设备。
- 已完成：
  - 右臂只读状态接入：`/R/robot_state` 约 `4.995 Hz`，`motion_done=true`，`error_code=0`。
  - 原生 V4L2 ioctl/mmap 读取 `/dev/video0` Z16 成功。
  - 右彩色快照 YOLOv8 检测到 `cocacola`，confidence `0.894`。
  - 近似 bbox-to-depth ROI 得到 target raw depth p05 `555`、median `676`。
- 未计入通过证据：
  - 未执行 `/R/robot_move*`、`/R/robot_servo*`、`/R/robot_set_speed`。
  - 未启动或控制夹爪。
  - 未执行真实夹取、预抓取或靠近动作。
  - 未调用 `/competition/run`。
- 阻塞原因：
  - Z16 单位比例未 verified：仓内默认 0.125 解释为 target median `84.5 mm`，raw=mm 解释为 `676 mm`。
  - 缺可信 `Rtcp/right_tcp -> right_camera_depth_frame` 外参。
  - color/depth 未正式对齐，当前只是交替快照估计。
  - 右视野有障碍物且没有 verified 三维避障模型。
- 下一步唯一入口：
  1. 先做右 Z16 单位比例校准。
  2. 再建立右相机到右 TCP/基座 verified 外参。
  3. 再做 no-motion 目标位姿估计和障碍物门控。
  4. 首个真实动作只能是右臂单步小增量或预抓取空走，不能直接合爪夹取。

## 2026-05-06 右相机确认与右臂只读控制状态接入
- 当前波次：right-camera-confirmed-and-right-arm-readonly-control-precheck
- 状态：right_camera_confirmed_right_robo_ctrl_readonly_verified_stopped
- 权威进度报告：`docs/operations/reports/2026-05-06-real-hardware-debug-log.md`
- 当前运行状态：
  - `ROS_DOMAIN_ID=0` 保留右相机/检测可视化节点。
  - `/right_robo_ctrl` 已停止，当前不保留运动服务。
- 已完成：
  - 用户现场确认 `/dev/video6` / `CP02653000G2` 彩色画面是右侧相机。
  - 右臂控制器 `192.168.58.3:8080` TCP 可达。
  - 受控前台会话启动右臂 `robo_ctrl_node` 成功，仅做状态读取。
- 验证证据：
  - `/right_robo_ctrl` 日志显示成功连接并启动状态线程。
  - `/R/robot_state`：约 `4.995 Hz`。
  - `/R/robot_state` 单帧：`joint_position=[52.3965, -83.5825, -12.4235, -30.0943, -107.9497, 0.1314]`；`tcp_pose=[-31.8716, -158.0354, 640.1603, -142.5021, -14.3388, 131.4828]`；`motion_done=true`；`error_code=0`。
- 未计入通过证据：
  - 未调用 `/R/robot_move`、`/R/robot_move_cart`、`/R/robot_servo*` 或 `/R/robot_set_speed`。
  - 未做夹爪动作，未调用 `/competition/run`。
  - 未验证右深度/table overlay。
  - 未验证双臂坐标系、指尖工具模型或互碰安全。
- 下一步唯一入口：
  1. 若继续真实运动，先重新启动右臂 `robo_ctrl_node` 只读状态，确认状态 fresh、`motion_done=true`、`error_code=0`。
  2. 运动前由现场明确确认：右臂或左臂、坐标系、方向、距离、速度/override、工作区无人、手在急停、末端和周边安全距离。
  3. 首次只允许单臂小增量 jog；不得做双臂协作或夹爪动作。

## 2026-05-06 右机械臂候选相机彩色可视化
- 当前波次：right-arm-candidate-camera-color-viz-no-motion
- 状态：right_candidate_color_detector_overlay_running_depth_unverified
- 权威进度报告：`docs/operations/reports/2026-05-06-real-hardware-debug-log.md`
- 当前运行日志目录：`.codex/tmp/runtime/right-arm-candidate-cp026-color-viz-domain0-20260506-215108`
- 当前运行节点：
  - `/right_orbbec_gemini_bridge`
  - `/detector_right`
  - `/detector_adapter_right`
  - `/right_camera_color_viewer`
  - `/right_detector_overlay_viewer`
- 已完成：
  - 停止用户现场确认实际为左机械臂相机的 `/dev/video16` 误命名链路。
  - 启动 `/dev/video6` 作为右机械臂候选彩色口，topic 为 `/right_camera/color/image_raw`。
  - 打开 `right_camera_color` 和 `right_detector_overlay` 两个 OpenCV 窗口。
- 验证证据：
  - `/right_camera/color/image_raw`：约 `13.9 Hz` 到 `15.0 Hz`。
  - `/detector/right/detections/image`：约 `15.0 Hz`。
  - `/detector/right/detections` 一帧检测包含 class id `2/0/4/3`，最高置信度约 `0.85`。
- 未计入通过证据：
  - 右相机深度/table overlay 未通过；color+Z16 双流最小复现显示深度读帧失败。
  - `/dev/video6` 仍需用户现场画面确认确为右机械臂相机。
  - 双臂 base 外参、相机外参和指尖工具模型仍未 verified，不能进行协作运动或声明互碰安全。
- 下一步唯一入口：
  1. 用户先确认当前 `right_camera_color` 画面是否确为右机械臂相机。
  2. 若确认正确，再单独做 right depth-only 验证，不要直接开完整 depth/table 链。
  3. 协作动作前必须先完成 base 外参 verified、指尖模型 verified、MoveIt 互碰/自碰 smoke 和低速 no-motion/mock 规划验证。

## 2026-05-06 实机代码审查修复 P1 崩溃风险批次
- 当前波次：hardware-code-review-p1-crash-risk-repair
- 状态：p1_implemented_static_build_runtime_stress_partially_verified
- 权威进度报告：`docs/operations/reports/2026-05-06-p1-crash-code-review-repair.md`
- 当前代码范围：
  - control: `packages/control/robo_ctrl/src/robo_ctrl_node.cpp`
  - perception: `packages/perception/depth_handler/include/depth_handler/cluster.hpp`、`packages/perception/depth_handler/include/depth_handler/depth_processor_node.hpp`、`packages/perception/depth_handler/src/depth_processor_node.cpp`、`packages/perception/detector/include/detector/lw_detr.hpp`、`packages/perception/detector/src/lw_detr.cpp`
  - planning: `packages/planning/planners/fairino_dualarm_planner/src/fairino_dualarm_planner_node.cpp`、`packages/planning/planning_scene_sync/scripts/planning_scene_sync_node.py`、`packages/planning/legacy/fairino3_v6_planner/include/fairino3_v6_planner/pose_goal_planner.hpp`、`packages/planning/legacy/fairino3_v6_planner/src/pose_goal_planner.cpp`
  - ops: `packages/ops/competition_console_api/scripts/competition_console_api_node.py`
  - tests: `tests/unit/test_p1_crash_contracts.py`、`tests/unit/test_p1_runtime_stress.py`
- 已完成：
  - Servo catch failure response 与 ServoJ `const_cast` 删除。
  - KDTree atomic byte flag claim。
  - planner/depth_processor/PlanningSceneSync/legacy planner 共享状态最小锁与快照化。
  - LwDetr CUDA/TensorRT/plugin 生命周期初始化、检查和释放顺序。
  - console core stop 状态锁内交换、锁外 wait。
  - KDTree atomic claim、PlanningSceneSync cache、console stop 三项 runtime stress 测试已补齐并通过。
- 验证证据：
  - `/usr/bin/python3 -m py_compile packages/planning/planning_scene_sync/scripts/planning_scene_sync_node.py packages/ops/competition_console_api/scripts/competition_console_api_node.py tests/unit/test_p1_crash_contracts.py`：通过。
  - `/usr/bin/python3 -m pytest -q tests/unit/test_p0_safety_contracts.py tests/unit/test_p1_crash_contracts.py`：`13 passed in 0.03s`。
  - `/usr/bin/python3 -m py_compile tests/unit/test_p1_runtime_stress.py`：通过。
  - `/usr/bin/python3 -m pytest -q tests/unit/test_p1_runtime_stress.py`：`3 passed in 9.49s`。
  - `/usr/bin/python3 -m py_compile packages/planning/planning_scene_sync/scripts/planning_scene_sync_node.py packages/ops/competition_console_api/scripts/competition_console_api_node.py tests/unit/test_p1_crash_contracts.py tests/unit/test_p1_runtime_stress.py`：通过。
  - `/usr/bin/python3 -m pytest -q tests/unit/test_p0_safety_contracts.py tests/unit/test_p1_crash_contracts.py tests/unit/test_p1_runtime_stress.py`：`16 passed in 9.32s`。
  - `git diff --check`：通过。
  - `colcon build --base-paths packages --packages-select robo_ctrl depth_handler fairino_dualarm_planner planning_scene_sync fairino3_v6_planner competition_console_api`：活跃 5 包通过；legacy `fairino3_v6_planner` 因 `COLCON_IGNORE` 未被发现。
  - `colcon build --base-paths packages --packages-select robo_ctrl depth_handler fairino_dualarm_planner planning_scene_sync competition_console_api`：`5 packages finished [3.93s]`。
  - `colcon build --base-paths packages --packages-select detector`：通过；仅有自定义 TensorRT plugin warning。
- 未计入关闭证据：
  - 未做 TSAN、sanitizer、valgrind。
  - planner scene/robot state、legacy planner、depth_processor 未做 stress/TSAN；Servo 未做 service failure injection；LwDetr 未做 CUDA/TensorRT inference runtime。
  - 未做真实硬件验证。
  - legacy planner 没有构建证据。
- 下一步唯一入口：
  1. 若继续 P1 关闭剩余并发项，为 planner scene/robot state、legacy planner plan、depth_processor 补 TSAN/stress；否则继续保持“已修改待验证”或“环境阻塞”。
  2. 决定 legacy `fairino3_v6_planner` 的状态：解除 `COLCON_IGNORE` 后构建验证，或正式归档并从活跃 P1 范围移除。
  3. 若要关闭 Servo/LwDetr，分别补 service failure injection 与 CUDA/TensorRT runtime inference 证据。
  4. P1 运行态证据补齐前，不进入 P2 混改，也不做实机运动验证。

## 2026-05-06 实机代码审查修复 P0 安全批次
- 当前波次：hardware-code-review-p0-safety-repair
- 状态：p0_implemented_and_verified_software_mock_no_motion
- 权威进度报告：`docs/operations/reports/2026-05-06-p0-safety-code-review-repair.md`
- 当前代码范围：
  - tools: `packages/tools/tools/src/keyboard_tcp_controller.cpp`
  - control: `packages/control/robo_ctrl/include/robo_ctrl/robo_ctrl_node.hpp`、`packages/control/robo_ctrl/src/robo_ctrl_node.cpp`
  - quick: `packages/quick_competition/quick_competition/legacy_fairino_bridge.py`、`packages/quick_competition/quick_competition/quick_waypoint_recorder.py`
  - compat: `packages/compat/dualarm/src/main.cpp`、`packages/compat/dualarm/src/main_refactored.cpp`
  - tests: `tests/unit/test_p0_safety_contracts.py`
- 已完成：
  - 键盘 TCP 增量 mm->m。
  - `robo_ctrl` 急停轮询与 fail-closed 服务 gate；ServoEnd/stop 命令不被 gate 拦截。
  - quick `stop_all()` hardware 缺通用停止路径时 fail-closed，拒绝后续软件运动/夹爪动作并返回失败。
  - compat executor most-vexing-parse 和 fake-success handlers 收口。
  - rclpy shutdown 全局副作用修复。
- 验证证据：
  - `/usr/bin/python3 -m py_compile packages/quick_competition/quick_competition/legacy_fairino_bridge.py packages/quick_competition/quick_competition/quick_waypoint_recorder.py tests/unit/test_p0_safety_contracts.py`：通过。
  - `/usr/bin/python3 -m pytest -q tests/unit/test_p0_safety_contracts.py`：`5 passed in 0.01s`。
  - `git diff --check`：通过。
  - `colcon build --base-paths packages --packages-select tools robo_ctrl quick_competition dualarm`：通过，`4 packages finished [1min 1s]`。
- 未计入通过证据：
  - 未执行实机急停验证。
  - 未执行真实运动链路、夹爪动作或 `/competition/run`。
  - `quick` `stop_all()` best-effort ServoEnd 不代表通用停止能力；缺 `StopMotion/abort` 服务仍是 blocker。
- 下一步唯一入口：
  1. 进入 P1 崩溃风险批次。
  2. 先修异常返回、资源生命周期、未定义行为，再处理并发项。
  3. KDTree、planner scene/robot state、PlanningSceneSync cache、legacy planner plan、depth_processor 五处并发项必须用 TSAN 或可重复 stress test 证据关闭。

## 2026-05-06 Gazebo 正式主链仿真闭环 + quick hybrid
- 当前波次：gazebo-full-sim-mainchain-and-quick-hybrid
- 状态：in_progress_half_implemented_not_verified
- 权威进度报告：`docs/operations/reports/2026-05-06-gazebo-full-sim-quick-hybrid-progress.md`
- 当前代码范围：
  - simulation: `packages/simulation/dualarm_simulation/**`
  - launch: `packages/bringup/dualarm_bringup/launch/competition_gazebo_full.launch.py`
  - launch plumbing: `competition.launch.py`、`competition_core.launch.py`、`execution_adapter.launch.py`、`dualarm_task_manager.launch.py`
  - control: `packages/control/execution_adapter/scripts/execution_adapter_node.py`
  - tasks: `packages/tasks/dualarm_task_manager/scripts/dualarm_task_manager_node.py`
  - quick config: `config/quick_competition/quick_profile.yaml`、`quick_waypoints.yaml`、`quick_grasp_templates.yaml`
  - quick computed modules: `quick_grasp_template_library.py`、`quick_task_pose_generator.py`、`quick_ik_planner.py`、`quick_collision_scene_builder.py`
  - build deps: `config/system/build_groups.yaml`、`packages/bringup/dualarm_bringup/package.xml`
- 已完成：
  - `dualarm_simulation` 包骨架与 sim truth / robot_state / pour_state 三节点已创建。
  - `competition_gazebo_full.launch.py` 已创建，目标是 `execution_backend=sim` 启动正式链。
  - sim backend 参数已开始从 bringup launch 透传到 `execution_adapter` 与 `dualarm_task_manager`。
  - `execution_adapter` 已开始实现 sim robot state freshness、guarded_grasp contact threshold/retry、truth attach/detach、pour evidence。
  - `dualarm_task_manager` 已开始实现 sim mode start_immediately 和 basket acceptance 判定。
  - quick 默认配置已开始切到 `motion_generation_mode: hybrid`，新增 `safe_stow` 必需锚点占位和 grasp templates。
  - quick computed 四个基础模块已创建。
- 未完成：
  - `quick_computed_motion_executor.py` 未创建。
  - quick computed 模块未接入 `QuickPreflightCheck`、orchestrator、motion executor/primitives。
  - quick setup entry points 未更新。
  - hybrid preflight 的 computed OR fallback 接受条件未实现。
  - tests/runbook/CI/software_check 未补齐。
  - 未执行 py_compile、pytest、colcon build、launch show-args、runtime smoke。
- 当前验证证据：
  - 仅有文件存在性和人工阅读证据；没有构建/运行态通过证据。
  - 保存前旧进程检查未发现真实 ROS/Gazebo 长进程，只匹配当前 sandbox/pgrep 命令本身。
- 下一步唯一入口：
  1. 补齐 quick hybrid 接线：`quick_computed_motion_executor.py`、setup entry points、`QuickPreflightCheck` hybrid acceptance。
  2. 补 tests：sim config/launch/backend/task_manager/quick computed/quick hybrid preflight。
  3. 补 runbook：`docs/operations/runbooks/competition_gazebo_full.md`。
  4. 补 CI build group/package list。
  5. 运行 `/usr/bin/python3 -m py_compile ...`、pytest、`./build_workspace.sh --group simulation,bringup,control,tasks,quick`。
  6. `source install/setup.bash && ros2 launch dualarm_bringup competition_gazebo_full.launch.py --show-args`。
  7. 干净 ROS graph 后再做 Gazebo full-chain runtime smoke 和 `/competition/run`。
- 禁止声明：
  - 不得声明 Gazebo full-chain 完成。
  - 不得声明 `/competition/run` 成功。
  - 不得声明 quick hybrid runtime 已接通。
  - 不得声明 `competition_integrated.launch.py` 未破坏，直到有 contract/launch 证据。

## 2026-05-06 quick_competition 快速实机旁路
- 当前波次：quick-competition-sidepath
- 状态：implemented_and_verified_software_only
- 代码范围：
  - config: `config/quick_competition/*.yaml`
  - package: `packages/quick_competition`
  - launch: `packages/bringup/dualarm_bringup/launch/quick_competition.launch.py`
  - scripts: `scripts/quick/*`
  - docs: `docs/operations/runbooks/quick_*.md`
  - tests: `tests/unit/test_quick_*`、`tests/integration/test_quick_*`
- 验证证据：
  - `/usr/bin/python3 scripts/quick/validate_quick_config.py` -> 8 个 quick config loaded
  - `PYTHONPATH=packages/quick_competition /usr/bin/python3 -m pytest -q tests/unit tests/integration` -> `42 passed`
  - `./build_workspace.sh --group quick,bringup` -> `25 packages finished`
  - `source install/setup.bash && ros2 launch dualarm_bringup quick_competition.launch.py --show-args` -> quick launch args 可见
  - `source install/setup.bash && timeout 5s ros2 launch dualarm_bringup quick_competition.launch.py dry_run:=true` -> 基础节点启动，timeout 退出为预期
  - `source install/setup.bash && ros2 run quick_competition quick_competition_orchestrator --dry-run --full` -> preflight/pouring/ball cage/log exported
  - `bash scripts/ci/software_check.sh` -> `45 passed`、7 包构建、2 包 colcon test、Playwright `2 passed`
- 未计入通过证据：
  - TNHTH sidecar scout 两次未提供可用证据，已记录到 ERROR_TRACE Incident 35。
  - 未执行真实硬件运动或夹爪动作。
- 下一步：
  - 现场先跑 `bash scripts/quick/quick_hardware_smoke_test.sh`，人工确认 `/L/robot_state`、`/R/robot_state` 数值真实。
  - 录制 verified waypoint 后再进入 hardware pouring / handover / full。

## 2026-04-28 v1 Hardware-Interface Hardening
- 当前波次：v1-hardware-interface-hardening
- 状态：implemented_and_verified_software_only
- 代码范围：
  - interfaces: `Detection2D` / `SceneObject` / `ExecutePrimitive`
  - launch: `competition.launch.py` / core / integrated
  - perception: detector_adapter, depth_handler, ball_basket_pose_estimator, table_surface_detector, scene_fusion
  - planning: planning_scene_sync subframes, fairino_dualarm_planner launch/default freshness
  - control: execution_adapter planner-first Cartesian, vendor direct double gate, guarded_grasp
  - tasks: direct_grasp -> guarded_grasp, pouring table gate
  - ops: new evidence_manager package
  - docs/tests: v1 runbook and `tests/unit/test_v1_hardening_contracts.py`
- 验证证据：
  - `/usr/bin/python3 -m pytest -q tests/unit tests/integration packages/tasks/dualarm_task_manager/test/test_dualarm_task_contract.py` -> `28 passed`
  - `colcon build --base-paths packages --packages-select dualarm_interfaces dualarm_bringup detector_adapter depth_handler scene_fusion planning_scene_sync fairino_dualarm_planner execution_adapter dualarm_task_manager evidence_manager` -> `10 packages finished`
  - `ros2 interface show` 三个接口确认新字段
  - `ros2 launch dualarm_bringup competition_core.launch.py --show-args` 通过
  - 非法 depth：`active_depth_camera:=right right_camera_enable_depth:=false` fail-fast
  - `bash scripts/ci/software_check.sh` 通过
- 未计入通过证据：
  - `smoke_depth_handler_future_tf.py` 本轮未正常退出，已 kill 残留并记录到 ERROR_TRACE Incident 31。
- 下一步：
  - 硬件联调前先 clean launch smoke，保持 `start_hardware=false`，再由操作员明确切换。
  - v2 单独处理人体安全、真实 fill/spill、dense occupancy、标定验收、6D pose refine。

## 2026-04-26 Software Engineering Hardening
- 当前分支：`codex/software-engineering-hardening-20260426`
- 当前波次：Wave 0-6 软件-only 工程化整改
- 软件-only 护栏：`docs/operations/runbooks/software-only-refactor-guard.md`
- 当前基线：
  - 路径硬编码检查通过。
  - README 覆盖检查缺 `packages/ops/competition_rviz_tools/README.md`。
  - `pytest --collect-only tests` 在当前 shell 中失败，原因是 `pytest` 命令不存在。
  - `colcon list --base-paths packages --names-only | sort` 发现 27 个包。
- 下一步入口：
  1. Wave 6 文档、仓库卫生与本地主验证已完成。
  2. 下一步执行 staged diff 敏感信息扫描、最终 verifier subagent、Wave 6 提交和 push。
- Wave 1 当前证据：
  - py_compile 通过。
  - `colcon build --base-paths packages --packages-select competition_console_api robo_ctrl` 通过。
  - console API / static server / robo_ctrl_node.cpp 中已无 `0.0.0.0`、`std::cout`、`print(` 匹配。
- Wave 2 当前证据：
  - `/usr/bin/python3 -m pytest -q tests/unit tests/integration packages/ops/competition_console_api/test/test_console_security.py`：`14 passed`。
  - `colcon test --base-paths packages --packages-select competition_console_api --event-handlers console_direct+`：通过。
  - `bash scripts/ci/software_check.sh`：通过，含前端 Playwright `2 passed`。
- Wave 3 当前证据：
  - `competition_core.launch.py --show-args` 显示 profile 默认值：右臂 yaw `180.0`，gripper port `auto`。
  - `colcon build --base-paths packages --packages-select dualarm_bringup grasp_pose_generator`：通过。
  - `bash scripts/ci/software_check.sh`：通过。
- Wave 4 当前证据：
  - 新增 `task_contract.py`，任务序列只允许 `handover,pouring`，对象选择排序可单测。
  - `WAIT_START` 默认拒绝直接 action goal，start gate 负责在外部条件满足后发送授权 goal。
  - `execution_adapter` 对 missing object 不再返回成功，`pour_tilt` 缺 evidence 返回 `unverified_evidence`。
  - `/usr/bin/python3 -m pytest -q tests/unit tests/integration packages/tasks/dualarm_task_manager/test/test_dualarm_task_contract.py`：`17 passed`。
  - `colcon test --base-paths packages --packages-select dualarm_task_manager --event-handlers console_direct+`：通过。
  - `bash scripts/ci/software_check.sh`：通过。
- Wave 5 当前证据：
  - 新增 `process_manager.py`、`primitive_evidence.py`、`safety_limits.hpp`、`apiClient.ts`，原入口和 ROS 名称保持不变。
  - `/usr/bin/python3 -m pytest -q tests/unit tests/integration packages/tasks/dualarm_task_manager/test/test_dualarm_task_contract.py packages/ops/competition_console_api/test/test_console_security.py`：`26 passed`。
  - `colcon build --base-paths packages --packages-select competition_console_api execution_adapter robo_ctrl`：通过。
  - `npm run build`：通过。
  - `bash scripts/ci/software_check.sh`：通过。
  - Wave 5 reviewer subagent 120 秒未返回，已关闭并记录到 `SUBAGENT_REGISTRY.json`。
- Wave 6 当前证据：
  - 新增 runtime architecture、safety runbook、API interfaces、artifact manifest。
  - 根 README、control package README、docs index、stale SETUP 历史标记和 `.gitignore` 已更新。
  - `bash scripts/ci/software_check.sh`：通过。
  - `colcon test-result --all`：`11 tests, 0 errors, 0 failures, 0 skipped`。

## 当前波次
- Wave: 0-5
- 状态: in_progress

## 当前目标
- 收口 Wave 5：PlanningScene 真同步运行态 smoke

## 当前断点
- 单工作区迁移已完成，正式包根为 `src/`
- 接口基座已完成：`ExecutePrimitive`、`PlanDualPose`、`PlanDualJoint`、`SceneObjectArray.scene_version`、`RunCompetition` 恢复字段
- 控制台骨架已完成：`competition_console_api`、`competition_console_web`
- 控制台 API 已接入：
  - bringup start/stop
  - acceptance run
  - RunCompetition start
  - latest checkpoint resume
- 控制台前端已将：
  - 启动集成栈
  - 停止集成栈
  - 工作区验收
  - PlanningScene smoke
  - 接续 smoke
  - 网页验收
  - 整轮比赛
  - 从断点恢复
  绑定到真实 API
- 全量构建已通过
- 网页 build 与 Playwright smoke 已通过
- Wave 1 恢复 smoke 已通过：`smoke_resume_checkpoint.py`
- Wave 2 相机 frame smoke 已通过：`smoke_camera_frames.py`
- Wave 3 默认已关闭 ROI fallback，detector 默认已切 `detector_pt_node.py`
- Wave 5 当前阻塞：
  - `smoke_planning_scene_sync.py` 仍未最终通过
  - reviewer 和资料 agent 指出 MoveIt diff 语义问题
  - 已修复：
    - service 假成功
    - attached ADD + world REMOVE 冲突
    - cwd 依赖
    - detector 默认错配
    - ROI fallback 默认开启
    - planning 失败 reservation 泄漏
  - 最新补丁：
    - `planning_scene_sync` 在 service 路径等待 pending apply 完成
    - `planning_scene_sync` 已增加 pending wait 超时日志
- 下一步唯一入口：
  - 启动 core：`ros2 launch dualarm_bringup competition_core.launch.py start_hardware:=false start_detector:=false start_camera_bridge:=false use_mock_camera_stream:=false publish_fake_joint_states:=true`
  - 跑：`/usr/bin/python3 src/tools/tools/scripts/smoke_planning_scene_sync.py 2>&1`
  - 观察 `planning_scene_sync` 日志，优先定位 pending apply 超时还是 MoveIt success=false
- 新增流程规范：
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm/docs/runbooks/engineering-process-standards.md`

## 风险
- 当前还有大量旧文档引用旧路径，需要继续清理或归档
- Wave 5 还没有通过最终验收，不能声明 PlanningScene 收口完成
- primitive / task manager 仍是基座实现，不能作为比赛完成证据
- 网页按钮已接入部分真实 API，但倒水/人机验收和证据包导出仍需继续

## Resume Hint
- 恢复时先读本文件、`SUBAGENT_REGISTRY.json`、`ERROR_TRACE.md` 的 Incident 19，再继续 Wave 5 smoke

## 2026-04-16 最新接续
- Wave 5 已通过：
  - `smoke_planning_scene_sync.py` 当前增强版已通过
  - `GetPlanningScene` 最终 world / attached 均为空
  - `/scene_fusion/scene_objects` 最终 `objects: []`
- 当前最优先目标已切换：
  1. Wave 4：`scene_version` / freshness / authoritative state 保持测试
  2. Wave 6：`ExecutePrimitive` 与 execution_adapter 的真实闭环
- 下一步标准入口：
  - 起 core：`ros2 launch dualarm_bringup competition_core.launch.py start_hardware:=false start_detector:=false start_camera_bridge:=false use_mock_camera_stream:=false publish_fake_joint_states:=true`
  - 回归 Wave 5：`/usr/bin/python3 src/tools/tools/scripts/smoke_planning_scene_sync.py`
  - 然后开始 Wave 4 freshness 专项检查

## 2026-04-16 Repo Reorg 断点
- 当前结构重构已经落到隔离 worktree：
  - 正式源码主根：`packages/`
  - 兼容别名：`src -> packages`
  - vendor 收口：`third_party -> vendor`
  - legacy 收口：`arm_planner -> archive/legacy/arm_planner`
- 已新增路径层：
  - Shell：`scripts/lib/paths.sh`
  - Python：`packages/tools/tools/scripts/dual_arm_paths.py`
- 已新增结构治理脚本：
  - `scripts/check_readme_coverage.py`
  - `scripts/check_path_hardcodes.py`
- 已完成验证：
  - README 覆盖通过
  - 路径硬编码检查通过
  - `build_workspace.sh --group full` 通过
  - `competition_integrated.launch.py --show-args` 通过
  - `single_arm_debug.launch.py --show-args` 通过
  - `competition_console_api` 的 workspace acceptance 已切到 `packages/...`
- 如果下次从这里恢复：
  1. 先读 `STATE.md`
  2. 再读 `docs/reference/path-migration-map.md`
  3. 复核 reviewer / verifier 结果
  4. 推送到远程 `test`
  5. 执行阶段二部署到 `/home/gwh/dual-arm`

## 2026-05-07 右臂实机控制断点

- 状态：right_arm_practice_motion_done_waiting_j6_visual_confirmation
- 当前运行中的前台会话：
  - 右臂相机可视化保持运行，用户现场确认 `/dev/video14` 是右臂相机。
  - 右臂 `robo_ctrl_R.launch.py` 仍在前台会话中运行，节点为 `/R_robo_ctrl`。
- 已完成：
  1. `right_arm_grasp_precheck.py` 默认右相机改为 `/dev/video14`，默认右深度改为 `/dev/video8`。
  2. `robo_ctrl_R.launch.py` 增加 `motion_done_timeout_sec` 与速度上限参数透传。
  3. 对比 HDU-PHOENIX/FairinoDualArm：`RobotMoveCart.srv` 一致，参考任务代码常用 `tool=-1/user=-1/blend_time=0.0`。
  4. 右臂真实完成 `Z -20mm x 2` 和 `X -20mm -> Y +20mm -> X +20mm -> Y -20mm`，累计请求路径 `120mm`。
  5. J6 直接 MoveJ 到 `45deg` 失败，错误码 `14`；已 StopMotion/ResetAllError 收口。
  6. J6 改用 ServoJ 小步增量 `+10deg` 成功，J6 约 `10.16deg`，状态正常。
- 当前等待：
  - 用户从视觉窗口确认 J6 `+10deg` 后相机画面方向是否朝“上方”变好。
- 下一步：
  1. 若方向正确，继续用 `ServoMoveStart + /R/robot_servo_joint + ServoMoveEnd` 每次 `+10deg` 小步调整。
  2. 若方向相反，先用 `-10deg` 抵消，再按负方向小步调整。
  3. 每步后采样 `/R/robot_state`，必须 `motion_done=true`、`error_code=0`。
  4. 若出现 `motion_done=false` 或错误码，立即直连 SDK `StopMotion()`，必要时 `ResetAllError()`。
- 禁止：
  - 不再用 `/R/robot_move` 直接把 J6 推到大角度目标。
  - 不执行自动抓取、双臂协作或 `/competition/run`。

## 2026-05-08 右臂低速记忆夹取断点

- 状态：right_arm_slow_memory_plan_only_blocked_by_token
- 当前运行中的 ROS 图：
  - 只保留左右 RGB bridge、左右 RGB detector 和左右检测 viewer。
  - 临时右臂控制/规划栈已经停止。
- 已完成：
  1. 右臂网络 `192.168.58.3:8080` 可达。
  2. 受控 PTY 启动 `robo_ctrl_R.launch.py` 成功，`/R/robot_state` 可读，`motion_done=true`、`error_code=0`。
  3. 低速参数已验证可拉起：`max_velocity_percent=5.0`、`max_acceleration_percent=5.0`、`max_ovl_percent=5.0`，`ServoJ vel=0.2 acc=0.2`。
  4. 旧记忆候选 plan-only 成功。
  5. fresh-memory 第一版因内参源尺寸误设为 `640x480` 作废。
  6. fresh-memory-v2 生成成功：
     - `.codex/tmp/runtime/right-arm-slow-grasp-attempt-20260508-195853/fresh-memory-v2/dual_camera_coke_memory.json`
     - `.codex/tmp/runtime/right-arm-slow-grasp-attempt-20260508-195853/fresh-memory-v2/dual_camera_coke_memory_view.html`
     - `.codex/tmp/runtime/right-arm-slow-grasp-attempt-20260508-195853/fresh-memory-v2/right_arm_grasp_memory/right_arm_grasp_memory_candidate.json`
  7. fresh-memory-v2 plan-only 成功，输出 `.codex/tmp/runtime/right-arm-slow-grasp-attempt-20260508-195853/plan-only-fresh-v2/right_arm_autonomous_grasp_attempt.json`。
- 当前阻塞：
  - `DUALARM_HARDWARE_CONFIRM_TOKEN=unset`。
  - right camera extrinsic 和 fused transform 仍是 candidate，不是 verified。
  - clearance gate 仍为 false。
  - 本轮未启动右夹爪 status 节点。
- 下一步：
  1. 只有在 token 设置后，才允许重新启动低速右臂控制栈。
  2. 执行前必须重新采 fresh memory，使用默认 `1280x720 -> 640x480` 内参缩放。
  3. 先启动右夹爪 status 并只读确认。
  4. 先 plan-only，再单步执行 `pregrasp -> grasp -> close -> contact/status -> retreat`。
  5. 每步后采样 `/R/robot_state`，必须 `motion_done=true`、`error_code=0`。

## 2026-05-08 右臂 token 低速执行收尾断点

- 状态：right_arm_token_pregrasp_executed_grasp_blocked
- 当前位置：
  - 右臂真实执行 `pregrasp` 成功后停在预抓取附近。
  - 收尾前 `/R/robot_state`: `motion_done=true`、`error_code=0`。
  - joint deg `[1.848531,15.000362,-122.971382,-8.469262,-64.814552,60.500076]`。
  - TCP mm/deg `[-323.200745,-155.061249,260.209229,172.103897,35.111542,34.854973]`。
- 本轮已完成：
  1. 用户提供 token `TOKEN` 后，使用现有 `DUALARM_HARDWARE_CONFIRM_TOKEN` gate 执行，没有取消门禁。
  2. fresh memory age gate 和 target alignment gate 通过。
  3. 右夹爪 enable/open 成功，最终打开状态 `position=0`、`error=0`。
  4. `pregrasp` plan success 并执行成功。
  5. `grasp` plan 失败，`result_code=ik_failed`、`failure_stage=path_search`、`point_count=0`。
  6. 预抓取位重新采集 fresh memory 失败，左右检测无可用可乐目标。
  7. 没有合爪，没有抓住可乐，没有 retreat。
- 当前运行中的 ROS 图：
  - 控制类进程已清空。
  - 只保留左右 RGB bridge、左右 RGB detector 和左右 detection viewer。
- 关键证据：
  - 执行报告：`.codex/tmp/runtime/right-arm-token-execute-20260508-202525/execute-full-grasp2/right_arm_autonomous_grasp_attempt.json`
  - 预抓取后记忆失败报告：`.codex/tmp/runtime/right-arm-token-execute-20260508-202525/fresh-memory-after-pregrasp/dual_camera_coke_memory.json`
  - 详细报告：`docs/operations/reports/2026-05-08-right-arm-token-execution-pregrasp-stop.md`
- 新窗口第一步：
  1. 先读 `STATE.md` 本节和详细报告。
  2. 现场确认右臂当前预抓取姿态、可乐位置和安全范围。
  3. 不要直接合爪；如果需要恢复，先只规划慢速 retreat 或小步后撤。
  4. 重新确认 RGB 检测能看到可乐，再生成 fresh memory 与 3D 可视化。
  5. 修正 `grasp` IK/path_search 失败后，再尝试 `grasp -> close`。

## 2026-05-08 右臂单帧 RGB-D 记忆抓取节点断点

- 状态：right_arm_observe_remember_grasp_node_implemented_runtime_unverified
- 当前运行状态：
  - 本轮未启动真实硬件，未执行轨迹，未调用夹爪 command，未调用 `/competition/run`。
  - 只完成代码实现、静态扫描、安装检查和构建。
- 已完成：
  1. 新增 `packages/tools/tools/scripts/observe_remember_grasp_node.py`。
  2. 默认 `observe-only`，并提供 `publish-scene`、`plan-pregrasp`、`execute-pregrasp`、`execute-final`、`full`。
  3. `coke_can_memory.json` schema 固定为 world frame、固定 can/table 参数和 candidate calibration status。
  4. RGB-depth alignment 不可信时要求 `--manual-depth-pixel`，否则停止。
  5. 新节点只通过 `/planning/plan_pose`、`/execution/execute_trajectory` 和 `/execution/set_gripper` 进入生产链，不新增 raw motion 调用。
  6. `planning_scene_sync` 支持 `coke_can` collision managed object。
- 关键证据：
  - `docs/operations/reports/2026-05-08-right-arm-observe-remember-grasp-node.md`
  - `docs/plans/2026-05-08-right-arm-observe-remember-grasp-design.md`
  - `.codex/delivery/epics/dual-arm-runtime/tasks/W4-observe-remember-grasp.md`
  - `py_compile`、raw endpoint scan、`git diff --check`、`colcon build --packages-select tools planning_scene_sync` 均通过。
- 下一步唯一入口：
  1. 清理旧 ROS 图和 stale planner/MoveIt/planning_scene_sync/mock feeder。
  2. 运行 `observe-only` 并人工检查 overlay；如果 depth 未证明 aligned，使用 `--manual-depth-pixel`。
  3. 运行 `publish-scene` 并在 RViz 检查 `table_surface_manual` 与 `coke_can_snapshot`。
  4. 运行 `plan-pregrasp`，确认 pregrasp 在可乐外侧约 `15 cm` 且轨迹不穿桌。
  5. 真实执行前必须提供 token、人工确认和 `--rend-to-pinch-center-xyz-m`。

## 2026-05-09 可乐开盖序列实机执行断点

- 状态：coke_cap_unscrew_partial_right_at_4_left_driver_blocked
- 用户目标：
  - 完整连续执行 `1 -> 右夹爪张开 -> 2 -> 3 -> 右夹爪夹紧 -> 4 -> (5 -> 左夹爪夹紧 -> 6 -> 左夹爪松开) * 6`。
  - 运动要更平滑。
- 本轮已完成的真实动作：
  1. 左臂到 `1`。
  2. 右夹爪张开。
  3. 右臂到 `2`。
  4. 右臂到 `3`。
  5. 右夹爪夹紧。
  6. 右臂到 `4`。
- 当前真实状态：
  - 左臂仍在 `1`：`[-39.653683, -155.320786, 65.204620, -45.636337, -93.823898, -75.789780] deg`，`motion_done=true`，`error_code=0`。
  - 右臂在 `4`：`[-98.042427, -140.282791, -10.381972, -211.277313, -85.398361, 85.641579] deg`，`motion_done=true`，`error_code=0`。
  - 左夹爪 open `position=0`，右夹爪 close `position=219`，右夹爪 `gobj=3`。
- 关键失败：
  1. `left=1 + right=4` 单臂右 4 在 MoveIt 模型里 collision。
  2. `right4 + left5` dual plan 成功，但左臂 ServoJ 未动，右臂到 `4`。
  3. `/L/robot_move` MoveJ 到左 `5` 返回 `154`。
  4. `/L/robot_servo_joint` accepted 但左臂不动，日志 `ServoJ线程异常: 未知异常`。
  5. `/L/robot_servo` no-op ServoJ 触发 `L_robo_ctrl` `XmlRpc::XmlRpcException` 崩溃。
- 代码状态：
  - `packages/tools/tools/scripts/coke_cap_unscrew_sequence_runner.py` 已新增 token 校验、fresh state 等待、`--fuse-right4-left5`、`--start-step-index`。
  - `py_compile` 已通过。
- 关键报告：
  - `docs/operations/reports/2026-05-09-coke-cap-unscrew-live-execute-failed.md`
  - `.codex/tmp/runtime/coke-cap-unscrew-sequence-20260509-execute-live/runner-smooth/coke_cap_unscrew_sequence_report.json`
  - `.codex/tmp/runtime/coke-cap-unscrew-sequence-20260509-execute-live/runner-fused-execute/coke_cap_unscrew_sequence_report.json`
  - `.codex/tmp/runtime/coke-cap-unscrew-sequence-20260509-execute-live/manual-teach-direct-execute/teach_direct_report.json`
  - `.codex/tmp/runtime/coke-cap-unscrew-sequence-20260509-execute-live/manual-servoj-execute/manual_servoj_report.json`
- 下一步唯一安全入口：
  1. 不要继续重发完整开盖序列。
  2. 先修 `L_robo_ctrl`：捕获 `XmlRpc::XmlRpcException`，查 `ServoJ线程异常` 和 MoveJ `154`。
  3. 修复后先做左臂 no-op ServoJ、ServoMoveEnd、小步单关节验证。
  4. 验证通过后，从当前真实状态重新规划恢复；不要假设左臂已经到 `5`。

## 2026-05-09 可乐开盖序列继续执行成功断点

- 状态：coke_cap_unscrew_remaining_left_cycles_completed_movej_fk_desc_fix
- 用户最新确认：
  - 用户现场确认同一动作可以发出，并要求继续测试。
- 本轮代码修复：
  1. `packages/control/robo_ctrl/src/robo_ctrl_node.cpp`：MoveJ 关节目标执行前先 `GetForwardKin()`，把目标关节对应的 `DescPose` 传给 SDK。
  2. `packages/control/robo_ctrl/src/robot_mode_helper.cpp`：同样改为目标 FK 后 MoveJ，并输出目标 TCP。
  3. `robo_ctrl` 构建通过。
- 本轮实机完成：
  1. 左臂从点 `1` 低速 MoveJ 到点 `5` 成功。
  2. 完整执行 `(5 -> 左夹爪夹紧 -> 6 -> 左夹爪松开) * 6`。
  3. 左夹爪最终打开，`position=0/error=0/gobj=3`。
  4. 右臂只读复核仍在点 `4`，`motion_done=true/error_code=0`。
- 当前真实状态：
  - 左臂在点 `6`：`[-63.2077, -77.6081, -5.62652, -14.4191, -92.9763, -117.205] deg`。
  - 左夹爪打开：`position=0`。
  - 右臂在点 `4`：`[-98.042648, -140.282791, -10.382189, -211.277313, -85.398575, 85.641800] deg`。
  - ROS 图已清空。
- 关键报告：
  - `docs/operations/reports/2026-05-09-coke-cap-unscrew-live-continued-success.md`
- 仍未关闭的问题：
  1. `RobotServoJoint` accepted-but-no-motion。
  2. `ServoJ线程异常: 未知异常`。
  3. `XmlRpc::XmlRpcException` 崩溃。
  4. 夹爪 `gobj=3` 表示未检测到物体，不能作为真实抓稳/拧开成功证据。
  5. `robo_ctrl_R.launch.py` 默认 IP `10.2.20.202` 与当前右臂实机 IP `192.168.58.3` 不一致。
- 下一步唯一安全入口：
  1. 如果要再跑自动完整序列，先把 MoveJ FK DescPose 修复纳入正式 runner 或 production execution 路径。
  2. 如果要追求平滑连续，不要回到当前 ServoJ 路径，先修 RobotServoJoint lifecycle 和 false success。
  3. 如果要验收“拧开瓶盖”，必须增加瓶体/瓶盖夹持和旋转结果证据，而不是只看动作命令成功。
