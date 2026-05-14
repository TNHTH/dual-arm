# dual-arm STATE

更新时间：2026-05-09

## 2026-05-09 左夹爪打开命令
- Wave: left-gripper-open-command
- 状态：completed_no_arm_motion_left_gripper_opened；已按用户要求打开左夹爪，最终状态 `position=0/error=0/gobj=3`。
- 详细记录：
  - `docs/operations/reports/2026-05-09-left-gripper-open-command.md`
- 已完成：
  - 发现既有左夹爪节点进程处于 `T/Tl` 暂停状态且未注册 ROS service。
  - 清理不可用进程后，临时拉起 `/gripper0` 左夹爪节点。
  - 调用 `/gripper0/epg50_gripper/command`，`slave_id=9`、`position=0`、`speed=20`、`torque=80`。
  - 连续 3 次状态确认 `position=0`、`speed=0`、`error=0`、`object_status=手指已到达指定位置，但未检测到物体或物体已脱落`。
- 验证证据：
  - service response: `success=True`、`设置参数成功 [位置=0, 速度=20, 力矩=80]`。
  - 状态日志目录：
    - `.codex/tmp/runtime/left-gripper-open-20260509-224936/`
    - `.codex/tmp/runtime/left-gripper-status-after-open-20260509-224957/`
- 当前边界与风险：
  - 本轮没有发送任何机械臂运动、MoveJ、MoveCart、Servo、planner 或 execution 命令。
  - 临时左夹爪节点已停止；刷新 ROS daemon 后，ROS 图中只剩用户已拉起的 `/left_rgb_bridge` 和 `/detector_left_rgb`。

## 2026-05-09 左 RGB 识别窗口终端 D 修正
- Wave: left-rgb-detection-window-command-fix
- 状态：completed_no_motion_visual_command_fixed；用户执行 Obsidian 终端 D 后没有彩色窗口，已定位为 `/dev/video7` 当前不是 capture 口，修正为 `/dev/video6` 并增加 topic 到达检查。
- 详细记录：
  - `docs/operations/reports/2026-05-09-dual-rgb-detection-view.md`
- 已完成：
  - 清理失败后残留的 `detector_left_rgb` 进程。
  - 用 `/sys/class/video4linux` 与 `udevadm` 确认 `/dev/video6` 有 `:capture:`，`/dev/video7` 无 capture capability。
  - 用 OpenCV 只读探测确认 `/dev/video6 opened=True read=True shape=(480, 640, 3)`，`/dev/video7 opened=False`。
  - 用 `/dev/video6` 做 bridge + detector 无窗口 smoke。
  - 更新 Obsidian 文件 `DualArm_可乐拧瓶盖完整实机流程指令_2026-05-09.md` 的终端 D 命令：默认 `COLOR_DEVICE=/dev/video6`，并在启动 detector/viewer 前检查 `/left_camera/color/image_raw` 和 `/detector/left_rgb/detections/image`。
- 验证证据：
  - `.codex/tmp/runtime/left-rgb-detection-video6-smoke-20260509-222943/color_hz.log`：`/left_camera/color/image_raw` 约 `15 Hz`。
  - `.codex/tmp/runtime/left-rgb-detection-video6-smoke-20260509-222943/overlay_hz.log`：`/detector/left_rgb/detections/image` 约 `15 Hz`。
- 当前边界与风险：
  - 本轮没有启动右相机 pipeline；右相机仍按已拆除处理。
  - 本轮没有启动 `robo_ctrl`、MoveIt、planner、`planning_scene_sync`，没有发送机械臂运动或夹爪命令。
  - `/dev/video*` 仍可能随设备重插漂移；若窗口打不开，先复查 capture 口，不要直接换成右相机话题。

## 2026-05-09 双臂 XY 50mm 单独控制实测收口
- Wave: dual-arm-xy-50mm-nudge-live-debug
- 状态：not_runnable_current_pose_fail_closed；用户要求“先跑通”后，已对左臂当前姿态做实机最小验证，`+X 50mm` 与 `+Y 50mm` MoveCart 均未跑通，当前工具已回退为仅保留 MoveCart fail-closed 路径。
- 详细记录：
  - `docs/operations/reports/2026-05-09-dual-arm-xy-50mm-nudge-tool.md`
- 已完成：
  - 修复 `dual_arm_xy_50mm_nudge.py` 中 rclpy `Node._clients` 字段覆盖问题，改为 `self._move_cart_clients`。
  - 左臂当前 TCP 附近实测 `+X 50mm` 与 `+Y 50mm`，均返回 `112（目标位姿不可达）`。
  - 临时验证 `StartJOG` 路径后判定不可作为 50mm 精确单轴位移工具：出现正交漂移、进度反向和 `StopJOG=-1`。
  - 已删除临时 `RobotJog.srv`、`/L|R/robot_jog` 服务和工具脚本 JOG 分支。
  - 已撤回临时 MoveCart `112 -> IK MoveJ` fallback，保持 MoveCart 不可达时直接失败。
  - 清理 `build/robo_ctrl install/robo_ctrl` 后重建，避免安装树残留已删除接口。
- 验证证据：
  - `/usr/bin/python3 -m py_compile packages/tools/tools/scripts/dual_arm_xy_50mm_nudge.py`：通过。
  - `git diff --check -- packages/control/robo_ctrl/CMakeLists.txt packages/control/robo_ctrl/include/robo_ctrl/robo_ctrl_node.hpp packages/control/robo_ctrl/src/robo_ctrl_node.cpp packages/tools/tools/scripts/dual_arm_xy_50mm_nudge.py`：通过。
  - `colcon build --base-paths packages --packages-select robo_ctrl tools --cmake-args -DPython3_EXECUTABLE=/usr/bin/python3 -DPYTHON_EXECUTABLE=/usr/bin/python3`：通过；`tools` 仍有既有 Miniconda/libcurl RPATH warning。
  - `ros2 interface list | rg 'robo_ctrl/srv/RobotJog|robo_ctrl/srv/RobotMoveCart'` 只显示 `robo_ctrl/srv/RobotMoveCart`。
  - `ros2 run tools dual_arm_xy_50mm_nudge.py --mode dry-run --arm both --directions x,y`：通过，展开 left/right `+X/+Y` 四步。
  - token unset 的 execute gate 返回 `hardware_confirm_token_mismatch_or_unset`。
  - 收尾 `ros2 node list` 无输出，关键 ROS/robo_ctrl 进程检查无输出。
- 当前边界与风险：
  - 50mm execute 命令当前不能标记为“可用/已跑通”；Obsidian 指令文件已更新为当前不可直接执行。
  - 本轮实机测试移动过左臂，代表最终 TCP 约 `[-151.9719, 131.1456, 660.6482, -81.5161, -1.5220, 42.7854]`；随后控制节点已停止，ROS 图清空。
  - 右臂本轮没有执行 XY 50mm 实机测试。
- 下一步范围：
  - 若继续实现 XY 50mm，需要先做当前位置可达性预检查，再设计小步 MoveCart 闭环；每小步必须用 `/robot_state` 校验目标轴误差、正交漂移、`motion_done` 和 `error_code`。
  - 不能恢复 JOG 路径，除非先独立证明 StopJOG、位移精度和漂移边界。

## 2026-05-09 FairinoDualArm 上游项目接入当前模型与基座配置
- Wave: fairino-dualarm-upstream-model-detection-base-config
- 状态：completed_no_motion_external_repo_ready_for_measured_base_config；已将上游仓库浅克隆到 `/home/gwh/FairinoDualArm`，并在该仓库中接入当前 `best.pt/last.pt` PT 检测链路；双臂基座 TF 已从硬编码改为 launch 参数，默认全零占位，等待现场测量填入。
- 详细记录：
  - `docs/operations/reports/2026-05-09-fairino-dualarm-upstream-model-detection-base-config.md`
- 新增/修改重点：
  - `/home/gwh/FairinoDualArm/detector/scripts/detector_pt_node.py`
  - `/home/gwh/FairinoDualArm/detector/launch/detector_pt.launch.py`
  - `/home/gwh/FairinoDualArm/detector/models/yolov8/yolo_runs/final_dataset_v1/weights/best.pt`
  - `/home/gwh/FairinoDualArm/depth_handler/launch/depth_processor.launch.py`
  - `/home/gwh/FairinoDualArm/robo_ctrl/src/robo_ctrl_node.cpp`
  - `/home/gwh/FairinoDualArm/robo_ctrl/launch/robo_ctrl_L.launch.py`
  - `/home/gwh/FairinoDualArm/robo_ctrl/launch/robo_ctrl_R.launch.py`
  - `/home/gwh/FairinoDualArm/docs/base-frame-config.md`
- 验证证据：
  - `/usr/bin/python3 -m py_compile` 覆盖 detector/depth_handler/robo_ctrl 相关 Python launch 和 PT 节点：通过。
  - `colcon build --packages-select detector depth_handler robo_ctrl --cmake-args -DPython3_EXECUTABLE=/usr/bin/python3`：通过。
  - `colcon build --packages-select tools --cmake-args -DPython3_EXECUTABLE=/usr/bin/python3`：通过。
  - detector no-motion smoke 在 `ROS_DOMAIN_ID=77` 成功加载 `best.pt`，打印类别 `{0: basket, 1: basketball, 2: cocacola, 3: cup, 4: football, 5: yibao}`，SIGINT 后 clean exit。
  - depth_handler no-motion smoke 在 `ROS_DOMAIN_ID=78` 成功初始化 `camera_depth_frame -> Lrobot_base` 参数，SIGINT 后 clean exit。
  - `robo_ctrl_L/R.launch.py --show-args` 均显示 `base_x/y/z_m` 与 `base_roll/pitch/yaw_deg`，默认 `0.0`。
- 当前边界与风险：
  - 本轮没有启动真实相机、没有连接 `/home/gwh/FairinoDualArm` 硬件控制链、没有发送任何机械臂或夹爪命令。
  - 后置进程检查发现 `/home/gwh/dual-arm` 仍有既存 `robo_ctrl`、MoveIt、planner、execution_adapter 等运行进程；这些不是本轮启动，也未停止。后续 planner/硬件验证前必须先确认并清理。
  - 基座坐标未采用 `/home/gwh/dual-arm` 历史值；必须由现场测量后通过 launch 参数填入。

## 2026-05-09 可乐拧瓶盖完整序列当前尝试
- Wave: coke-cap-unscrew-full-sequence-current-attempt
- 状态：execute_blocked_by_token_no_motion_runner_gate_fixed；已重新读取项目状态、工程规范、Obsidian 入口和 `/home/gwh/下载/位置` 6 张截图，确认 30 步完整序列解释；本轮未执行真实机械臂运动或夹爪命令。
- 详细记录：
  - `docs/operations/reports/2026-05-09-coke-cap-unscrew-sequence-current-attempt.md`
- 本轮修复：
  - `packages/tools/tools/scripts/coke_cap_unscrew_sequence_runner.py` 补回 `hardware_token_matches()`。
  - `execute` 模式重新把 `DUALARM_HARDWARE_CONFIRM_TOKEN` mismatch/unset 纳入硬阻断。
  - 默认报告目录加入 mode 与毫秒，避免同一秒连续运行覆盖 evidence。
- 验证证据：
  - 当前 `DUALARM_HARDWARE_CONFIRM_TOKEN=unset`。
  - stale process 检查未发现关键 ROS/MoveIt/robo_ctrl/夹爪残留。
  - `/usr/bin/python3 -m py_compile packages/tools/tools/scripts/coke_cap_unscrew_sequence_runner.py`：通过。
  - 源码入口 execute gate 按预期阻断：`hardware_confirm_token_mismatch_or_unset`。
  - `build/tools`、`install/tools` 已清理后重建；第一次因 Conda Python 缺 `em` 失败，随后用 `/usr/bin/python3` 强制 CMake Python 重建 `tools` 成功。
  - 安装入口 `ros2 run tools coke_cap_unscrew_sequence_runner.py --mode dry-run --repeat-left-twist 6`：成功展开 `30` 步。
  - 安装入口 `--mode execute --operator-confirm-site --hardware-confirm-token TEST` 在 token unset 时按预期阻断：`hardware_confirm_token_mismatch_or_unset`。
- 当前边界与风险：
  - 本轮没有启动 `robo_ctrl`、MoveIt、planner、`execution_adapter` 或夹爪节点。
  - 本轮没有发送任何机械臂运动、Servo、PTP、MoveJ、MoveCart、程序运行或夹爪命令。
  - 若继续真实执行，必须由现场设置 token，并确认运动范围安全；不能绕过 runner 的逐段 plan、execute 和最终关节误差校验。

## 2026-05-09 可乐拧瓶盖完整序列请求阻断
- Wave: coke-cap-unscrew-full-sequence-request
- 状态：controlled_runner_added_no_motion_core_gate_retained；用户要求执行 `1 -> 右夹爪张开 -> 2 -> 3 -> 右夹爪夹紧 -> 4 -> (5 -> 左夹爪夹紧 -> 6 -> 左夹爪松开) * 6`，本轮未执行真实运动或夹爪命令；已新增受控序列入口并收敛额外门禁。
- 详细记录：
  - `docs/operations/reports/2026-05-09-coke-cap-unscrew-sequence-request-blocked.md`
  - `docs/operations/reports/2026-05-09-coke-cap-unscrew-sequence-request-blocked.json`
- 新增入口：
  - `packages/tools/tools/scripts/coke_cap_unscrew_sequence_runner.py`
- 当前阻断：
  - `DUALARM_HARDWARE_CONFIRM_TOKEN` 当前为空。
  - `1..6` 点仍是截图候选，不是 ROS `/robot_state` verified preset。
  - 同日已有双臂 ServoJ timeout、左臂 ServoJ 未知异常和左臂 MoveJ 错误码 `154` 记录；修复前不能直接重发大跨度轨迹。
- 门禁收敛：
  - 已按用户“序列实测可行”的反馈，移除新脚本中额外的“截图候选许可/已实测声明/接受风险”硬阻断。
  - 保留 `DUALARM_HARDWARE_CONFIRM_TOKEN`、`--operator-confirm-site`、逐段 plan-only 和执行后最终关节误差校验。
- 验证证据：
  - stale process 检查未发现关键 ROS/MoveIt/robo_ctrl/夹爪运行残留。
  - 已读取夹爪 runbook，确认张开 `position=0`、测试夹紧 `position=220`、左 slave `9`、右 slave `10`。
  - 序列 JSON 通过 `/usr/bin/python3 -m json.tool` 校验。
  - 新脚本通过 `/usr/bin/python3 -m py_compile`。
  - `source /opt/ros/humble/setup.bash && source install/setup.bash && /usr/bin/python3 packages/tools/tools/scripts/coke_cap_unscrew_sequence_runner.py --mode dry-run ...`：成功展开 `30` 步。
  - `--mode execute --operator-confirm-site --hardware-confirm-token TEST` 在环境 token 为空时按预期阻断：`hardware_confirm_token_mismatch_or_unset`。
  - `source /opt/ros/humble/setup.bash && source install/setup.bash && colcon build --base-paths packages --packages-select tools`：通过。
  - `scripts/check_runtime_authority.py` 已运行但失败于既有 `.tmp/codex/2026-05-08/*` 历史文本中的 `GetPositionIK` 命中；该失败与新增序列脚本无关。
- 当前边界与风险：
  - 本轮没有启动 ROS、没有连接硬件、没有发送任何机械臂运动、Servo、PTP、MoveJ、MoveCart、程序运行或夹爪命令。
  - 若要继续，必须由现场设置 token，并以该受控入口逐段执行；不能删除项目全局硬件门禁。

## 2026-05-09 可乐抓取拧瓶盖截图位置记录
- Wave: coke-cap-unscrew-controller-screenshot-positions
- 状态：screenshot_candidate_recorded_no_motion；已读取 `/home/gwh/下载/位置` 中 6 张控制器截图，按文件名 `1.jpg` 到 `6.jpg` 作为动作顺序记录左右臂关节角和 TCP。
- 详细记录：
  - `docs/operations/reports/2026-05-09-coke-cap-unscrew-position-images.md`
  - `docs/operations/reports/2026-05-09-coke-cap-unscrew-position-images.json`
- 当前截图序列：
  1. 左臂 `观察`：joint deg `[-39.655, -155.319, 65.205, -45.636, -93.824, -75.789]`，TCP `[25.595, -145.029, 500.357, -169.366, -44.896, 120.118]`
  2. 右臂 `准备夹取`：joint deg `[-101.278, -101.799, -78.836, -181.355, -36.069, 85.654]`，TCP `[-248.245, -309.988, 307.429, 101.156, -83.929, -76.317]`
  3. 右臂 `夹取`：joint deg `[-116.296, -114.995, -118.686, -126.748, -69.524, 85.654]`，TCP `[-279.349, -256.125, 97.698, 95.106, -85.485, -51.863]`
  4. 右臂 `准备拧`：joint deg `[-98.039, -140.277, -10.387, -211.274, -85.404, 85.638]`，TCP `[-181.769, -500.282, 331.149, 113.223, -85.085, -35.786]`
  5. 左臂 `准备拧`：joint deg `[-63.208, -77.609, -5.625, -14.419, -92.976, -75.787]`，TCP `[-177.806, 137.347, 566.420, 179.006, -8.149, 102.449]`
  6. 左臂 `拧`：joint deg `[-63.208, -77.608, -5.627, -14.419, -92.976, -117.207]`，TCP `[-177.809, 137.354, 566.418, 173.849, -5.449, 144.094]`
- 验证证据：
  - 图片目录存在且包含 `1.jpg`、`2.jpg`、`3.jpg`、`4.png`、`5.jpg`、`6.jpg`。
  - 逐张原图读取 Robot 面板数值后落盘。
  - JSON 文件通过 `/usr/bin/python3 -m json.tool` 结构校验。
- 当前边界与风险：
  - 本轮没有启动 ROS、没有连接硬件、没有发送任何机械臂运动、Servo、PTP、MoveJ、MoveCart、程序运行或夹爪命令。
  - 数据来自截图人工读取，只能标记为 `screenshot_candidate`，不是 ROS `/robot_state` verified joint preset。
  - `2.jpg` 的 PTP 行文本被截图截断；动作标签和 Robot 面板数值可读，完整 PTP 参数需回控制器程序确认。
  - 后续使用前必须只读复采 `/L/robot_state`、`/R/robot_state`，再走 `/planning/*` plan-only。

## 2026-05-09 双臂准备释放点关节采样
- Wave: dual-arm-release-point-sampled
- 状态：release_joint_sampled_no_motion_ready_for_grasp_to_release_plan_when_at_grasp；已只读采样准备释放点左右 6 轴关节角；当前机器人停在 release 点，不能直接用当前状态验证“夹取点 -> release 点”的轨迹。
- 详细记录：
  - `docs/operations/reports/2026-05-09-dual-arm-release-point-sampled.md`
- 当前准备释放点候选：
  - 名称：`dual_release_pose_2026-05-09-0503`
  - 左臂 joint deg：`[-15.461136, -49.818974, 87.178581, -211.765930, -166.409805, -82.553879]`
  - 右臂 joint deg：`[-128.693848, -133.301804, -46.161942, 0.469475, 112.015732, 89.747856]`
- 已具备双点：
  - `dual_grasp_pose_2026-05-09-0459`
  - `dual_release_pose_2026-05-09-0503`
- 验证证据：
  - 左臂连续 5 次 release 点采样均为 `motion_done=true`、`error_code=0`。
  - 右臂连续 5 次 release 点采样均为 `motion_done=true`、`error_code=0`。
  - 本轮只读 `robo_ctrl` 已停止并刷新 ROS daemon。
- 当前边界与风险：
  - 本轮没有发送机械臂运动、Servo、PTP、MoveJ、MoveCart、程序运行或夹爪命令。
  - 现有 `/planning/plan_dual_joint` 使用当前机器人状态作为起点；现在机器人停在 release 点，直接规划到 release 点不能代表“grasp -> release”。
  - 要执行从夹取点到准备释放点，必须先让用户把双臂回到夹取点，再做 plan-only，最后等待用户明确确认后才执行。

## 2026-05-09 双臂夹取点关节采样
- Wave: dual-arm-grasp-point-sampled
- 状态：grasp_joint_sampled_no_motion_release_joint_missing；已只读采样当前夹取点左右 6 轴关节角，但准备释放点尚未采样，不能执行“夹取点 -> 准备释放点”轨迹。
- 详细记录：
  - `docs/operations/reports/2026-05-09-dual-arm-grasp-point-sampled.md`
- 当前夹取点候选：
  - 名称：`dual_grasp_pose_2026-05-09-0459`
  - 左臂 joint deg：`[-47.121994, -52.515736, 86.086037, -215.939865, -79.598450, -90.014793]`
  - 右臂 joint deg：`[-129.529678, -120.581802, -55.148106, -4.471327, 77.114014, 89.689338]`
- 验证证据：
  - 左臂连续 5 次采样均为 `motion_done=true`、`error_code=0`。
  - 右臂连续 5 次采样均为 `motion_done=true`、`error_code=0`。
  - 本轮只读 `robo_ctrl` 已停止并刷新 ROS daemon。
- 当前边界与风险：
  - 本轮没有发送机械臂运动、Servo、PTP、MoveJ、MoveCart、程序运行或夹爪命令。
  - 准备释放点此前只有 operator mark，没有保存数值化左右 6 轴关节角。
  - 下一步必须移动到准备释放点并只读采样左右 6 轴关节角；随后先做 `/planning/plan_dual_joint` plan-only，再询问用户是否执行。

## 2026-05-09 双臂准备释放位置现场标记
- Wave: dual-arm-release-position-operator-mark
- 状态：operator_marked_release_position_no_motion；2026-05-09 04:56:39 CST，用户现场确认当前两个机械臂已到准备释放位置。
- 详细记录：
  - `docs/operations/reports/2026-05-09-dual-arm-release-position-operator-mark.md`
- 当前结论：
  - 左臂在下方托住球，右臂在上方夹住球。
  - 用户观察控制器网页速度倍率：左臂 `45`，右臂 `10`。
  - 速度差异来自两台法奥控制器网页各自独立的全局速度倍率；左臂网页只改左臂控制器，右臂网页只改右臂控制器，不会自动同步。
  - 本轮没有读取新的 `/L/robot_state` 或 `/R/robot_state` 关节采样。
  - 本轮没有发送机械臂运动、Servo、PTP、MoveJ、MoveCart、程序运行或夹爪命令。
- 当前边界与风险：
  - 夹取点和准备释放点当前都只有 operator mark，尚未保存为 verified joint preset。
  - 从夹取点到准备释放点的动作执行前，必须先保存两组左右 6 轴关节角，并先做 `/planning/plan_dual_joint` plan-only。
  - 执行前应统一左右控制器速度倍率；建议取低值，例如左右都设为 `10` 或 `5`。
  - 真正执行 `/execution/execute_trajectory synchronized=true` 前必须再次向用户询问确认。

## 2026-05-09 双臂夹取位置现场标记
- Wave: dual-arm-grasp-position-operator-mark
- 状态：operator_marked_grasp_position_no_motion；2026-05-09 04:51:59 CST，用户现场确认当前两个机械臂都在夹取位置上。
- 详细记录：
  - `docs/operations/reports/2026-05-09-dual-arm-grasp-position-operator-mark.md`
- 当前结论：
  - 这是操作者现场标记，用于后续保存双臂夹取示教点。
  - 本轮没有读取新的 `/L/robot_state` 或 `/R/robot_state` 关节采样。
  - 本轮没有发送机械臂运动、Servo、PTP、MoveJ、MoveCart、程序运行或夹爪命令。
- 当前边界与风险：
  - 该状态不是 verified joint preset，不能直接作为自动运动目标。
  - 后续若要让双臂同步回到该位置，必须先分别保存左右臂 6 轴关节角，再走 `/planning/plan_dual_joint` 和 `/execution/execute_trajectory synchronized=true` 的 plan-only 验证。
  - 右臂 `motion_done=false` 问题按用户要求暂不处理；恢复前不要执行右臂自动运动测试。

## 2026-05-09 双臂速度上限配置同步
- Wave: dual-arm-speed-sync-config
- 状态：config_synced_no_motion；已把左臂 `robo_ctrl_L.launch.py` 补齐为与右臂相同的速度上限参数接口，并完成安装验证。
- 详细记录：
  - `docs/operations/reports/2026-05-09-dual-arm-speed-sync-config.md`
- 已完成：
  - 左臂 launch 新增并传入 `motion_done_timeout_sec`、`max_velocity_percent`、`max_acceleration_percent`、`max_ovl_percent`。
  - `robo_ctrl` 已重新构建，安装目录中左右 launch 均可使用同一组速度上限参数。
  - 当前 `/execution_adapter` 参数确认：`trajectory_servo_joint_vel=2.0`、`trajectory_servo_joint_acc=2.0`，左右执行共用同一套 ServoJ 参数。
- 验证证据：
  - `/usr/bin/python3 -m py_compile packages/control/robo_ctrl/launch/robo_ctrl_L.launch.py packages/control/robo_ctrl/launch/robo_ctrl_R.launch.py`：通过。
  - `colcon build --base-paths packages --packages-select robo_ctrl`：通过。
  - `rg` 安装目录确认左右 launch 均包含 `max_velocity_percent/max_acceleration_percent/max_ovl_percent/motion_done_timeout_sec`。
  - `git diff --check -- packages/control/robo_ctrl/launch/robo_ctrl_L.launch.py`：通过。
- 当前边界与风险：
  - 本轮没有启动 `/L_robo_ctrl` 或 `/R_robo_ctrl`。
  - 本轮没有发送机械臂运动、Servo、PTP、MoveJ、MoveCart 或夹爪命令。
  - 右臂 `motion_done=false` 问题按用户要求暂不处理；恢复前不得用右臂做运动速度测试。

## 2026-05-09 右臂 PTP 关节指令超限恢复
- Wave: right-arm-ptp-limit-recovery
- 状态：error_cleared_motion_done_false_fail_closed；右臂 PTP 超限错误已清除，但 `motion_done=false` 未恢复，因此禁止继续自动运动。
- 详细记录：
  - `docs/operations/reports/2026-05-09-right-arm-ptp-limit-recovery.md`
- 已完成：
  - 网络确认右臂控制器 `192.168.58.3:8080` 可达。
  - 直连 SDK helper 执行 `StopMotion()` 和 `ResetAllError()`，返回均为 `0`。
  - 只读拉起 `/R_robo_ctrl`，确认 `/R/robot_state` 可读约 `5 Hz`。
  - 执行 `robot_mode_helper --normal-only --keep-mode` 和 `--auto-mode`，只清错/退出拖动/上使能，不执行待机动作。
  - `/R/robot_servo_joint command_type=1` 返回当前没有 ServoJ 任务。
  - 停止 `/R_robo_ctrl`，刷新 ROS daemon，右臂 raw motion services 不再暴露。
  - 03:34 追加查验后台占用：未发现真实右臂运动进程或到 `192.168.58.3:8080` 的后台 TCP 连接；ROS `/R/robot_move*` 残留被判定为 discovery 残留。
  - 03:34 再次只读拉起右臂、执行 `StopMotion()`/`ResetAllError()` 和 `robot_mode_helper --auto-mode`，仍未恢复 `motion_done=true`。
  - 03:49 使用 `.codex/tmp/runtime/right_state_diag_20260509` 做 SDK 细诊断：通信正常、程序停止/无程序运行、非拖动、无急停、无安全停止、主/子错误码为 0，但 `motion_done=0` 持续。
  - 03:49 执行停止栈 `ImmStopJOG`、`StopJOG`、`ServoMoveEnd`、`ProgramStop`、`StopMotion`、`ResetAllError`，全部返回 0，但 `motion_done` 未恢复。
  - 03:49 查明 console presets/action groups 为空，当前 gripper web API 未启用 raw motion debug，本机日志无 preset/action-group/arm motion API 调用证据。
- 当前证据：
  - 最新代表状态：J `[-123.405, -124.787, -43.862, -16.909, 100.274, 92.584] deg`。
  - TCP 约 `[-347.114, -373.452, 509.189, 146.896, 83.469, 33.642]` mm/deg。
  - `error_code=0`。
  - `motion_done=false` 连续多帧。
- 当前边界与风险：
  - 本轮没有发送 PTP、MoveJ、MoveL、MoveCart、轨迹执行或夹爪命令。
  - 用户要求“稍微移动右臂”未执行；原因是 `motion_done=false` 状态门未通过。
  - `motion_done=false` 未恢复前，禁止继续自动运动。
  - 当前 `PTP 关节指令超限` 更可能来自某个被控制器拒绝的 PTP/MoveJ 目标或路径，不是当前静止关节值本身越过 URDF/MoveIt 范围。
  - 下一步必须先在示教器/控制器侧确认没有任务占用或持续运动标志，再只读复查 `/R/robot_state`。

## 2026-05-09 左右夹爪网页按钮控制
- Wave: gripper-web-control
- 状态：web_control_running_localhost；已生成并启动独立夹爪控制网页，未启动机械臂运动链路。
- 详细记录：
  - `docs/operations/reports/2026-05-09-gripper-web-control.md`
  - `packages/ops/competition_console_web/public/gripper.html`
  - `packages/ops/competition_console_web/dist/gripper.html`
  - `.codex/tmp/runtime/gripper-web-20260509/`
- 当前入口：
  - Web：`http://127.0.0.1:18081/gripper.html`
  - API：`http://127.0.0.1:18080/api/health`
- 已完成：
  - `competition_console_api` 新增 `GET /api/control/gripper/status`。
  - 独立 HTML 页面包含左夹爪、右夹爪、左右同时使能/打开/闭合按钮。
  - 页面按钮调用现有 `/api/control/gripper`，后端再调用 ROS `/execution/set_gripper`。
  - 页面要求输入 `ARM` 才启用动作按钮，并支持 API token 输入。
  - 本机已启动 API 与静态网页服务；`allow_raw_motion_debug=false`。
- 验证证据：
  - `/usr/bin/python3 -m py_compile packages/ops/competition_console_api/scripts/competition_console_api_node.py`：通过。
  - `npm run build`：通过，`dist/gripper.html` 已生成。
  - `npx playwright test --reporter=line`：`3 passed`。
  - `colcon build --base-paths packages --packages-select competition_console_api`：通过。
  - `curl http://127.0.0.1:18081/api/control/gripper/status`：左右夹爪状态可读。
- 当前夹爪状态：
  - 左夹爪 slave `9`：`success=true`、`error=0`、`position=219`、`gobj=3`。
  - 右夹爪 slave `10`：`success=true`、`error=0`、`position=219`、`gobj=3`。
- 当前边界与风险：
  - 本轮没有启动 `robo_ctrl`、MoveIt、planner、`planning_scene_sync` 或 `/competition/run`。
  - 本轮没有发送机械臂运动命令。
  - `gobj=3` 不能作为抓住物体证据。
  - 当前网页服务只监听 `127.0.0.1`；不要开放到外部 host。

## 2026-05-09 TCP 位置可视化
- Wave: tcp-location-visualization
- 状态：visual_artifact_generated_no_motion；只生成模型位置可视化，没有启动 ROS 控制链路。
- 详细记录：
  - `docs/operations/reports/2026-05-09-tcp-location-visualization.md`
  - `.codex/tmp/runtime/tcp-location-20260509/tcp_location_visual.html`
  - `.codex/tmp/runtime/tcp-location-20260509/tcp_location_visual.png`
  - `.codex/tmp/runtime/tcp-location-20260509/right_arm_urdf_tcp_model.html`
  - `.codex/tmp/runtime/tcp-location-20260509/right_arm_urdf_tcp_model.png`
  - `.codex/tmp/runtime/tcp-location-20260509/right_arm_urdf_tcp_closeup.png`
  - `.codex/tmp/runtime/tcp-location-20260509/right_arm_tcp_gripping_center_intuitive.png`
  - `.codex/tmp/runtime/tcp-location-20260509/right_arm_tcp_gripping_center_clean_schematic.png`
  - `.codex/tmp/runtime/tcp-location-20260509/right_arm_tcp_gripping_center_candidate.json`
  - `.codex/tmp/runtime/tcp-location-20260509/right_arm_tcp_real_urdf_shape_plus_gripper_front_view.png`
  - `.codex/tmp/runtime/tcp-location-20260509/right_arm_tcp_real_urdf_shape_full_stl.png`
  - `.codex/tmp/runtime/tcp-location-20260509/right_arm_tcp_closed_gripper_center_full_shape.png`
  - `.codex/tmp/runtime/tcp-location-20260509/right_arm_tcp_closed_gripper_center_candidate.json`
- 已完成：
  - 生成 active 模型 TCP 位置可视化，展示 `wrist3_link/tool0 -> tcp = [0,0,0.100] m`。
  - 按用户要求用展开后的 active URDF 和 STL mesh 生成右臂三维模型，并用红色球标出 `right_tcp`。
  - 图中红点标出当前 MoveIt/planner 使用的 `left_tcp/right_tcp`，候选 `Lend/Rend` 以蓝点单独标出。
  - 明确当前 active URDF 没有正式 gripper/fingertip link，`left_tcp/right_tcp` 不是夹爪指尖或 pinch center。
  - 按用户要求基于 vendor `gripper1.stl` 自动识别两片夹指相对内侧夹持面，并把候选 TCP 放在两片夹持面的面积加权中点。
  - 生成直观版可视化：粗彩色连杆右臂、夹爪局部、俯视/侧视/夹爪 Y-Z 剖面图；灰球为旧 active `right_tcp`，红球为候选夹持中心。
  - 候选数值：`tool0 -> TCP = [-0.000066, -0.000206, 0.231706] m`；相对旧 `right_tcp` 为 `[-0.000066, -0.000206, 0.131706] m`。
  - 根据用户反馈重新生成完整机械臂外形版本：`right_arm_tcp_real_urdf_shape_plus_gripper_front_view.png` 左侧保留完整右臂 STL 机械臂外形，右侧用真实 gripper STL 正视投影清楚显示红色 TCP 位于两片夹持面之间。
  - 根据用户进一步要求改为“闭合状态的夹爪中心”：将两侧夹持面沿 gripper local `Y` 合到中心线，候选 `tool0 -> TCP = [-0.000000, -0.000206, 0.231706] m`，相对旧 `right_tcp` 为 `[-0.000000, -0.000206, 0.131706] m`。
- 当前边界与风险：
  - 本次没有执行机械臂运动或夹爪命令。
  - `Lend/Rend` 仍是历史候选末端偏移，不是 verified pinch center。
  - 后续实机抓取前必须标定 `TCP -> pinch center` 或 `TCP -> fingertip_contact`。
  - 当前夹持中心 TCP 仍是 mesh-derived candidate，尚未写入 active URDF/MoveIt，也未通过实物量尺或实机接触验证。
  - 当前 active URDF 没有夹爪开合关节；闭合状态图是基于 gripper STL 的可视化候选，不是实机夹爪闭合关节模型。

## 2026-05-09 左右夹爪最大打开与 RGB 检测可视化
- Wave: dual-gripper-open-and-dual-rgb-detection-view
- 状态：left_rgb_detection_visualization_restarted_no_motion；左 RGB 检测可视化已重新拉起，未启动机械臂控制链路。
- 详细记录：
  - `docs/operations/reports/2026-05-09-dual-gripper-open-max.md`
  - `docs/operations/reports/2026-05-09-dual-rgb-detection-view.md`
  - `docs/operations/runbooks/dualarm-operation-command-cheatsheet.md`
  - `/home/gwh/文档/Obsidian Vault/03_项目记录/FairinoDualArm/DualArm_操作指令速查表_2026-05-06.md`
- 已完成：
  - 左夹爪 `/gripper0` slave `9` 和右夹爪 `/gripper1` slave `10` 已通过 `/execution/set_gripper` 打开到 position `0`。
  - 夹爪最终状态：左右均 `position=0`、`gobj=3`、`error=0`。
  - 临时夹爪节点和 `execution_adapter` 已停止。
  - 启动左右 RGB bridge、左右 detector 和左右 overlay viewer。
  - 左 RGB/右 RGB 话题均约 `15 Hz`；左右 overlay 话题均约 `15 Hz`。
  - 当前左检测看到 `cocacola`，score 约 `0.828`；右检测当前为空。
  - 已把左右夹爪的启动、状态读取、最大打开、测试闭合和收尾命令写入 Obsidian 同名速查表，并同步保留仓库 runbook 副本。
  - 修正速查表可操作性：补充 `/home/gwh/dual-arm/install/setup.bash` 绝对路径、`~` 下相对路径失败原因、四终端启动顺序、`/execution/set_gripper` 参数解释。
- 当前运行：
  - `/left_rgb_bridge`
  - `/detector_left_rgb`
  - `/left_rgb_detection_viewer`
- 当前边界与风险：
  - 本轮没有启动 `robo_ctrl`、MoveIt、planner、`planning_scene_sync` 或 `execution_adapter`。
  - 没有发送机械臂运动命令或夹爪命令。
  - 本次速查表更新只修改 Obsidian/仓库文档，没有执行新的夹爪或机械臂命令。
  - 用户已拆除右相机；已停止 `/right_rgb_bridge`、`/detector_right_rgb`、`/right_rgb_detection_viewer`。
  - 后续不得把 `/right_camera/*` 或 `/detector/right_rgb/*` 作为可用现场输入，除非右相机重新安装并完成连通性检查。
  - 当前只保留左 RGB 检测可视化；左 RGB 约 `15 Hz`，左检测仍看到 `cocacola`，score 约 `0.862`。
- 2026-05-09 追加重启：
  - 用户要求重新拉起 RGB 检测可视化脚本。
  - 旧左侧 bridge 指向的 `/dev/video6` 当前不存在；本轮探测确认 `/dev/video7` 可读 `640x480` 彩色帧。
  - 已重新启动 `/left_rgb_bridge`、`/detector_left_rgb`、`/left_rgb_detection_viewer`。
  - `/left_camera/color/image_raw` 约 `15 Hz`，`/detector/left_rgb/detections/image` 约 `15 Hz`。
  - `/detector/left_rgb/detections` 当前可读，但采样结果为 `results=[]`，表示当前画面暂未稳定识别目标。
  - 日志目录：`.codex/tmp/runtime/left-rgb-detection-restart-20260509/`。
  - 本次没有启动 `robo_ctrl`、MoveIt、planner、`planning_scene_sync`，没有发送机械臂运动或夹爪命令。
- 2026-05-09 图像方向修正：
  - 用户反馈 RGB 检测可视化画面倒置。
  - 已只重启左侧视觉 pipeline，将 `/left_rgb_bridge` 参数从 `rotate_180:=false` 改为 `rotate_180:=true`。
  - 当前 `/left_rgb_bridge` 使用 `color_device=/dev/video7`、`rotate_180:=true`。
  - `/detector/left_rgb/detections/image` 约 `15 Hz`，`/left_rgb_detection_viewer` 正在显示 overlay。
  - 日志目录：`.codex/tmp/runtime/left-rgb-detection-rotate180-20260509/`。
  - 本次没有启动右相机 pipeline、`robo_ctrl`、MoveIt、planner、`planning_scene_sync`，没有发送机械臂运动或夹爪命令。

## 2026-05-08 右臂 one-shot-live 实机测试
- Wave: right-arm-one-shot-live-real-test
- 状态：real_hardware_grasp_attempt_failed_closed_no_lift；已真实执行右臂轨迹和夹爪闭合，`gobj=3` 夹空后安全停止；已重新打开夹爪并清理 ROS 图。
- 详细记录：
  - `docs/operations/reports/2026-05-08-right-arm-one-shot-live-real-test.md`
- 已完成：
  - 在实机图中运行 `one-shot-live`，完成右 RGB-D 感知、YOLO 确认、depth 桌面平面拟合、runtime table correction、depth-only 可乐凸起分割、`coke_can_memory.json` 生成和 scene 发布。
  - 修正现场阻塞：右 Orbbec Z16 depth scale 使用 `1.0`；MoveIt/planner `right_base_rpy` 使用弧度 `3.141592653589793`；optical resolver 增加正向 standard optical rotation candidate。
  - `one-shot-live` 真实执行到 `pregrasp_high`；随后自动二次观测未检测到可乐而停止。
  - 恢复执行中真实执行 `pregrasp_high`、`pregrasp_low`、`grasp` 和右夹爪 close；最终 `gobj=3`，脚本未 attach、未 lift。
  - 夹爪收尾打开到 position `0`；最后可读右臂状态 `motion_done=true`、`error_code=0`；控制类 ROS 进程和节点已清空。
- 验证证据：
  - memory：`.codex/tmp/runtime/one-shot-live-real-20260508-r9/coke_can_memory.json`。
  - 最终合爪失败报告：`.codex/tmp/runtime/one-shot-live-real-20260508-r9-execute-final8-grasp-rpy190--10-30/report.json`，`failure_stage=grasp_contact_not_verified_no_lift`，`gripper_command_sent=true`，`gripper_closed=true`，`lift_executed=false`。
  - 最终夹爪恢复：`/execution/set_gripper` position `0` success；status `position=0`、`gobj=3`、`error=0`。
  - `/usr/bin/python3 -m py_compile packages/tools/tools/scripts/observe_remember_grasp_node.py tests/unit/test_observe_remember_grasp_one_shot_math.py`：通过。
  - `source install/setup.bash && /usr/bin/python3 -m pytest -q tests/unit/test_observe_remember_grasp_one_shot_math.py`：`5 passed`。
  - raw endpoint 静态扫描无命中。
  - `colcon build --base-paths packages --packages-select tools`：通过。
- 当前边界与风险：
  - 本轮没有抓起可乐；不能声明实机抓取成功。
  - `--rend-to-pinch-center-xyz-m 0,0,0` 不是 verified pinch center 标定，只是现场参数占位；这很可能导致夹爪实际接触几何错误。
  - `190,-10,30` grasp 可规划但路径很长，不适合作为稳定 final approach 策略继续盲重试。
  - runtime table correction 只用于本轮候选感知，不写入 verified profile。
- 下一步范围：
  1. 先标定或实测 `Rend_to_pinch_center`，并把 grasp 轨迹长度/关节距离上限加入 gate。
  2. 从实际 grasp 前相机位重新二次观测，避免继续使用 r9 旧 memory。
  3. 只有短路径 grasp plan、夹爪接触几何和 `gobj` gate 方案通过后，才允许下一轮实机重试。
- 追加现场观察：
  - 用户手动移动右臂并夹住可乐后，只启动左相机与左 detector 观察。
  - 左相机确认看到可乐：`class_id=2 cocacola`，score 约 `0.831`，overlay `.codex/tmp/runtime/left-camera-held-coke-20260508/left_cocacola_overlay.jpg`。
  - 这确认上一轮右相机 runtime world 坐标方向/目标方向与现场视角相反；旧 r9 memory 不得继续作为 motion authority。

## 2026-05-08 右臂 one-shot-live 单命令实现
- Wave: right-arm-one-shot-live-implementation
- 状态：software_completed_no_motion_smoke_fail_closed；未启动实机控制图、未执行真实轨迹、未发送夹爪 command、未调用 `/competition/run`。
- 详细记录：
  - `docs/operations/reports/2026-05-08-right-arm-one-shot-live-implementation.md`
- 已完成：
  - `observe_remember_grasp_node.py` 新增 `--mode one-shot-live`，一次运行串联安全门禁、table scene、右 RGB-D、YOLO 确认、depth 桌面平面拟合、runtime table correction、depth-only 单凸起物分割、memory、coke scene、pregrasp planning/execution、可选 reobserve、final approach、合爪、`gobj` gate、attach/remove 和 lift。
  - `one-shot-live` 不再把 candidate `right_camera_depth_frame -> world` 的 z 作为第一道过滤；先在 camera optical 点云里用桌面平面高度分割，再用 runtime-corrected TF 生成 world memory。
  - RGB-depth 未对齐时不要求 manual depth pixel，YOLO 只用于确认 `cocacola` 存在，定位改为 depth-only tabletop object segmentation。
  - 新增 optical frame candidate 选择与 `<35deg` normal gate；新增 `calibration_status=runtime_table_corrected_candidate_not_verified`。
  - 新增离线单元测试 `tests/unit/test_observe_remember_grasp_one_shot_math.py`，覆盖 RANSAC 符号、runtime z correction、depth-only 单目标/多目标和向量旋转。
- 验证证据：
  - `/usr/bin/python3 -m py_compile packages/tools/tools/scripts/observe_remember_grasp_node.py tests/unit/test_observe_remember_grasp_one_shot_math.py`：通过。
  - `source install/setup.bash && /usr/bin/python3 -m pytest -q tests/unit/test_observe_remember_grasp_one_shot_math.py`：`5 passed`。
  - `rg -n '/R/robot_move|/R/robot_servo|epg50_gripper/command|/competition/run' packages/tools/tools/scripts/observe_remember_grasp_node.py`：无命中。
  - `git diff --check -- packages/tools/tools/scripts/observe_remember_grasp_node.py tests/unit/test_observe_remember_grasp_one_shot_math.py`：通过。
  - `colcon build --base-paths packages --packages-select tools`：`1 package finished`。
  - no-motion gate smoke report：`.codex/tmp/runtime/one-shot-live-no-motion-smoke-20260508/report.json`，状态 `robot_state_unavailable`，`robot_motion_executed=false`，`gripper_command_sent=false`。
- 当前边界与风险：
  - 未执行真实 `one-shot-live`，未验证现场 TF candidate、runtime table correction 的实测角度、RViz scene、planner/execution 和 `gobj`。
  - `Rend_to_pinch_center` 仍必须由现场参数提供；缺失时 execution gate fail-closed。
  - `effective_gripper_opening_m` 默认 `0.0`；未显式传入 `>=0.070` 时 fail-closed。
- 下一步范围：
  1. 清理 ROS 图并拉起右臂控制、planner、scene sync、execution、右夹爪 status、右 RGB-D 和 detector。
  2. 用实机命令运行 `one-shot-live`，必须传入 token、`--rend-to-pinch-center-xyz-m` 和 `--effective-gripper-opening-m >= 0.070`。
  3. 若 runtime table correction、optical frame gate、单目标分割、planner、execution 或 `gobj` 任一失败，保留 report 后停止，不允许盲动。

## 2026-05-08 右臂单帧 RGB-D 记忆抓取实机尝试
- Wave: right-arm-observe-remember-live-test
- 状态：blocked_before_motion_by_untrusted_camera_world_projection；未执行真实轨迹、未发送夹爪 command、未调用 `/competition/run`。
- 详细记录：
  - `docs/operations/reports/2026-05-08-right-arm-observe-remember-live-test.md`
- 已完成：
  - 用户提供一次性 token `TOKEN` 后，按低速参数拉起右臂 driver、MoveIt、planner、`planning_scene_sync`、`execution_adapter`、右夹爪 status、右 RGB-D 和右 detector。
  - `/R/robot_state` 可读：`motion_done=true`、`error_code=0`，当前 TCP 约 `[-24.034, -128.921, 363.514, 177.451, 58.571, 24.328]` mm/deg。
  - `/planning/plan_pose`、`/execution/execute_trajectory`、`/execution/set_gripper`、`/gripper1/epg50_gripper/status` 均可见。
  - 右 RGB-D 通过 `orbbec_gemini_bridge` native V4L2 Z16 fallback 发布，color/depth 均约 `2.0 Hz`。
  - `/detector/right/detections` 检出 `cocacola`，score 约 `0.9166`。
  - `observe-only` 未传 manual pixel 时按预期停止：`rgb_depth_not_aligned_manual_depth_pixel_required`。
  - 使用 manual depth pixel `(286,384)` 后仍停止：ROI 投到 `world` 后 z 中位数约 `0.197 m`，不满足计划过滤 `-0.055 < z < 0.090`，`valid_world_points=0`。
  - `orbbec_gemini_bridge` 增加 native V4L2 mmap Z16 fallback；`py_compile`、`git diff --check`、`colcon build --packages-select orbbec_gemini_bridge` 通过。
  - 已停止临时运行图；`pgrep` 关键进程检查和 `ROS_DOMAIN_ID=0 ros2 node list` 均无输出。
- 当前风险：
  - 当前 `right_camera_depth_frame -> world` 外参/桌面 frame 不可信；不能生成 `coke_can_memory.json`。
  - 没有 memory，因此未发布 scene、未 plan-pregrasp、未执行 pregrasp/final。
  - 仍没有 verified `Rend_to_pinch_center`；即使后续 memory 生成，也不能直接 final approach。
- 下一步范围：
  1. 修正或临时加载可信的 `right_camera_depth_frame -> world` candidate，使桌面/可乐 ROI 投影 z 落入固定桌面过滤范围。
  2. 重新运行 `observe-only`，必须生成 `coke_can_memory.json`、overlay 和 debug points。
  3. 人工确认 overlay/RViz 后再进入 `publish-scene`、`plan-pregrasp` 和后续真实单步执行。

## 2026-05-08 深度相机桌面高度候选标定
- Wave: table-height-depth-probe
- 状态：已完成 no-motion 左右深度相机桌面平面候选拟合；右相机结果质量较好；未启动 `robo_ctrl`、planner、execution adapter、夹爪或 `/competition/run`；真实运动仍 fail-closed。
- 详细记录：
  - `docs/operations/reports/2026-05-08-table-height-depth-probe.md`
- 已完成：
  - 新增 `packages/tools/tools/scripts/table_height_probe.py`，并加入 `packages/tools/tools/CMakeLists.txt` 安装清单。
  - 当前 ROS 域只保留左右 RGB bridge、detector 和 viewer；无 `robo_ctrl`、MoveIt、planner、`planning_scene_sync`、`execution_adapter` 控制链路。
  - 右相机 raw Z16 桌面平面候选：inlier ratio `0.7389`，median residual `0.577 mm`，camera-to-table perpendicular distance `0.326731 m`，table center camera `[0.036304, 0.121831, 0.500500] m`。
  - 左相机 raw Z16 桌面平面候选：inlier ratio `0.4607`，median residual `1.094 mm`，camera-to-table perpendicular distance `0.420600 m`，table center camera `[0.099584, -0.005545, 0.641000] m`。
- 验证证据：
  - 右相机 JSON：`.codex/tmp/runtime/table-height-probe-20260508-right/right_table_height_probe.json`。
  - 右相机 overlay：`.codex/tmp/runtime/table-height-probe-20260508-right/right_table_probe_overlay.jpg`。
  - 左相机 JSON：`.codex/tmp/runtime/table-height-probe-20260508-left/left_table_height_probe.json`。
  - 左相机 overlay：`.codex/tmp/runtime/table-height-probe-20260508-left/left_table_probe_overlay.jpg`。
  - `/usr/bin/python3 -m py_compile packages/tools/tools/scripts/table_height_probe.py`：通过。
  - 动作端点静态扫描无命中：`/[LR]/robot_move`、`/[LR]/robot_servo`、`epg50_gripper/command`、`/competition/run`、`execute_trajectory`、`plan_pose`。
  - `git diff --check -- packages/tools/tools/scripts/table_height_probe.py packages/tools/tools/CMakeLists.txt`：通过。
  - `colcon build --base-paths packages --packages-select tools`：`1 package finished [1.65s]`。
  - `ros2 pkg executables tools` 已包含 `tools table_height_probe.py`。
- 当前边界与风险：
  - 当前结果是 `camera-frame candidate`，不是 verified world/table height；不能直接用于真实运动。
  - `depth_scale_mm_per_raw=1.0` 仍是 operator-selected，不是全局 verified。
  - 缺少 verified `camera_to_world` 或 `camera_to_robot_base` 变换，未把 `table_surface` 作为 MoveIt collision object 做 runtime 验证。
  - `motion_safety_gate.motion_allowed=false`；机械臂不得基于本轮结果靠近桌面。
- 下一步范围：
  1. 用 ROS `table_surface_detector` 在 camera_info + TF 闭合的 no-motion 图中重跑，输出 `table_surface` 到 `world` 的 pose。
  2. 对同一桌面采至少 3 帧样本，用 `evaluate_table_calibration_run.py` 汇总高度稳定性。
  3. world 高度、table collision object 和最小 `0.050 m` 离桌 margin 通过后，才允许 plan-only；真实执行仍需 hardware token 和现场安全确认。

## 2026-05-08 双相机点云记忆与右臂夹取候选
- Wave: dual-camera-memory-right-grasp-candidate
- 状态：已完成 no-motion 点云记忆、3D 可视化、硬编码物体规格匹配和右臂夹取候选生成；未执行真实运动、未调用夹爪 command、未调用 `/competition/run`。
- 详细记录：
  - `docs/operations/reports/2026-05-08-dual-camera-memory-right-grasp-candidate.md`
- 已完成：
  - 新增 `packages/tools/tools/scripts/dual_camera_coke_memory.py`，支持左右 RGB/Z16 no-motion 点云记忆；在彩色设备被 live viewer 占用时，可通过 `--left-color-topic` / `--right-color-topic` 直接复用 ROS RGB 话题。
  - 新增 `packages/tools/tools/scripts/visualize_dual_camera_coke_memory.py`，生成本地 HTML 3D 点云可视化。
  - 新增 `packages/tools/tools/scripts/build_right_arm_grasp_from_memory.py`，把 YOLO 类别和 fused point cloud memory 匹配到 `config/competition/object_geometry.yaml` 的硬编码物体规格。
  - 双相机点云记忆状态 `completed_memory_candidate_no_motion`；融合点数 `25388`。
  - 右相机检测 `cocacola 0.9323`，通过 alias 匹配到 `cola_bottle`。
  - 当前右臂候选使用硬编码可乐瓶 bbox `[0.060, 0.060, 0.145] m`，抓取区 `body_mid`，推荐夹爪宽度 `0.066 m`，夹爪 close position 暂用 `220` 并要求 `gobj` 接触确认。
  - 右臂候选关键点：右相机目标中心 `[-0.008869, -0.002203, 0.412000] m`，候选 TCP 点 `[-0.018869, -0.092203, 0.468000] m`。
  - 已生成并打开本地 3D 可视化 HTML。
- 验证证据：
  - 点云记忆：`.codex/tmp/runtime/dual-camera-coke-memory-20260508-ros-topic/dual_camera_coke_memory.json`。
  - 融合 PLY：`.codex/tmp/runtime/dual-camera-coke-memory-20260508-ros-topic/dual_camera_coke_memory_candidate_left_camera.ply`。
  - 3D HTML：`.codex/tmp/runtime/dual-camera-coke-memory-20260508-ros-topic/dual_camera_coke_memory_view.html`。
  - 右臂夹取候选：`.codex/tmp/runtime/dual-camera-coke-memory-20260508-ros-topic/right_arm_grasp_memory/right_arm_grasp_memory_candidate.json`。
  - `/usr/bin/python3 -m py_compile packages/tools/tools/scripts/visualize_dual_camera_coke_memory.py packages/tools/tools/scripts/build_right_arm_grasp_from_memory.py packages/tools/tools/scripts/dual_camera_coke_memory.py`：通过。
  - `git diff --check -- packages/tools/tools/scripts/visualize_dual_camera_coke_memory.py packages/tools/tools/scripts/build_right_arm_grasp_from_memory.py packages/tools/tools/scripts/dual_camera_coke_memory.py packages/tools/tools/CMakeLists.txt`：通过。
  - `colcon build --base-paths packages --packages-select tools`：`1 package finished [1.56s]`。
  - `ros2 pkg executables tools` 已包含新增脚本。
- 当前边界与风险：
  - `DUALARM_HARDWARE_CONFIRM_TOKEN` 未设置；真实运动仍不可执行。
  - `/planning/plan_pose`、`/execution/execute_trajectory`、`/R/robot_state`、`/gripper1/epg50_gripper/status` 当前均不可用。
  - 右点云原始 bbox `[0.160385, 0.178633, 0.387000] m` 明显膨胀，说明背景/桌面/邻近物体混入；因此只用点云中心做记忆，用硬编码规格做碰撞与夹爪尺寸。
  - 右相机外参仍不是 calibration verified；右到左融合变换仍是 `candidate_not_verified`；当前 motion gate 仍 fail-closed。
- 下一步范围：
  1. 若用户要真实夹取，必须先受控启动核心控制栈并只读确认 `/R/robot_state`、planner、execution adapter、右夹爪 status。
  2. 重新采集新鲜的 memory/grasp candidate，避免旧 precheck age。
  3. 设置 `DUALARM_HARDWARE_CONFIRM_TOKEN` 并现场确认安全后，先 plan-only，再单步执行 `pregrasp -> grasp -> close -> gobj contact -> retreat`。

## 2026-05-08 右相机曝光检查与可乐 no-motion 预检
- Wave: right-camera-exposure-coke-precheck
- 状态：右相机曝光问题已定位并临时修正；可乐检测和右相机深度预检恢复；按用户要求已拉起左右 RGB 检测可视化窗口；未执行真实运动、未调用夹爪 command、未调用 `/competition/run`。当前右彩色口 live 保留自动曝光 `auto_exposure=0`、`exposure_dynamic_framerate=1`、`gain=16`。
- 详细记录：
  - `docs/operations/reports/2026-05-08-right-camera-exposure-and-coke-precheck.md`
- 已完成：
  - 确认右相机 serial `CP02653000G2`：彩色 `/dev/video14`，深度 `/dev/video8`；稳定路径分别为 `/dev/v4l/by-path/pci-0000:06:00.4-usb-0:2.2:1.4-video-index0` 与 `/dev/v4l/by-id/usb-Orbbec_R__Orbbec_Gemini_335_CP02653000G2-video-index0`。
  - 复现自动曝光异常：右彩色自动曝光下灰度均值约 `18.7`、近黑像素约 `80.3%`，YOLO `detections=[]`。
  - 左相机对比灰度均值约 `100.2`、近黑像素约 `1.86%`，说明主要问题集中在右彩色口曝光。
  - 读取右相机 UVC 控制项：初始 `auto_exposure=0`、`exposure_absolute=156`、`gain=16`；手动 `exposure=600/gain=64` 证明可恢复但偏亮。
  - 当前保留手动 `exposure_absolute=300`、`gain=32`；右图灰度均值约 `180.1`，过曝比例约 `0.012%`。
  - 使用手动曝光重新运行 `right_arm_grasp_precheck.py`：YOLO 检测 `cocacola` score `0.9229`，bbox `[261.08, 152.38, 357.02, 332.37]`。
  - depth ROI median `0.408 m`，target center camera `[-0.010557, 0.002254, 0.408000] m`，candidate TCP point `[-0.020557, -0.087746, 0.464000] m`。
  - 用户要求看到左右 RGB 检测可视化后，已启动 `/left_rgb_bridge`、`/right_rgb_bridge`、`/detector_left_rgb`、`/detector_right_rgb`、`/left_rgb_detection_viewer`、`/right_rgb_detection_viewer`。
  - live 右相机从 `300/32` 下调到手动 `exposure_absolute=200`、`gain=16`，右侧检测从误标 `yibao 0.90` 恢复为 `cocacola 0.9313`。
  - 继续测试自动曝光后，当前保留 `auto_exposure=0`、`exposure_dynamic_framerate=1`、`gain=16`；右侧最终检测 `cocacola 0.9328`，灰度均值约 `110.0`。
  - 2026-05-08 19:39 复核：`/detector/right_rgb/detections` 输出 `cocacola 0.9349`；`/right_camera_rgb/color/image_raw` 灰度均值约 `111.7`、近黑像素约 `4.16%`、过曝像素约 `0.99%`。
  - 左右 RGB 与 detection image 话题均约 `15 Hz`；左侧检测 `cocacola 0.9281`，右侧检测 `cocacola 0.9313`。
- 当前边界与风险：
  - `DUALARM_HARDWARE_CONFIRM_TOKEN` 未设置；真实运动仍不可执行。
  - `right_camera_to_right_tcp` 外参仍是 `operator_confirmed_same_as_left_not_calibration_verified`，不能作为 verified evidence。
  - 当前 safety gate 仍 fail-closed：`clearance_gate.passes=false`，`extrinsic_gate.passes=false`，`auto_grasp_allowed=false`。
  - 目标检测恢复不等于可抓取；线缆/桌面/目标周边点云仍需清理或重新分割。
- 验证证据：
  - 曝光异常预检：`.codex/tmp/runtime/right-arm-coke-precheck-20260508-0001/right_arm_grasp_precheck.json`。
  - 手动曝光图：`.codex/tmp/runtime/right-camera-exposure-check-20260508-manual-exp300-gain32/right_manual_exp300_gain32_right_color.jpg`。
  - 恢复后预检：`.codex/tmp/runtime/right-arm-coke-precheck-20260508-exp300-gain32/right_arm_grasp_precheck.json`。
  - Overlay：`.codex/tmp/runtime/right-arm-coke-precheck-20260508-exp300-gain32/right_color_depth_precheck_overlay.jpg`。
  - live 可视化运行目录：`.codex/tmp/runtime/dual-rgb-detection-view-20260508/`。
  - live 快照：`.codex/tmp/runtime/dual-rgb-detection-view-20260508/left_overlay_snapshot.jpg` 与 `.codex/tmp/runtime/dual-rgb-detection-view-20260508/right_overlay_snapshot_exp200_gain16.jpg`。
  - 自动曝光最终快照：`.codex/tmp/runtime/dual-rgb-detection-view-20260508/auto-exposure-probe/right_auto0_dyn1_final_overlay.jpg`。
  - 自动曝光探针：`.codex/tmp/runtime/dual-rgb-detection-view-20260508/auto-exposure-probe/auto_exposure_probe.json`。
  - 2026-05-08 19:39 复核命令：`ros2 topic echo --once /detector/right_rgb/detections` 与一次性 `/right_camera_rgb/color/image_raw` 灰度统计。
- 当前运行：
  - 为满足用户查看需求，当前保留左右 RGB bridge、detector、viewer 运行。
  - 当前节点：`/left_rgb_bridge`、`/right_rgb_bridge`、`/detector_left_rgb`、`/detector_right_rgb`、`/left_rgb_detection_viewer`、`/right_rgb_detection_viewer`。
- 下一步范围：
  1. 继续单右臂路线，先在当前曝光参数下重做干净点云建模，移开线缆或调整障碍 ROI。
  2. 只读确认 `/R/robot_state` fresh、`motion_done=true`、`error_code=0`，并只读确认右夹爪 status。
  3. 若要进入真实动作，必须设置 `DUALARM_HARDWARE_CONFIRM_TOKEN` 并重新确认现场安全、单步距离和 stop 路径。

## 2026-05-08 Production Runtime Authority Closure
- Wave: production-runtime-authority-closure
- 状态：软件架构收口完成；未启动真实硬件、未调用 `/competition/run`、未设置 `start_hardware:=true`；mock/no-motion smoke 已启动核心软件图并用 timeout 收口，无关键 ROS 进程残留。
- 详细记录：
  - `docs/operations/reports/2026-05-08-architecture-closure-baseline.md`
  - `docs/operations/reports/2026-05-08-production-runtime-authority-closure.md`
- 已完成：
  - 新增 `docs/architecture/runtime-authority.md` 与 `docs/architecture/adr/ADR-0001-production-runtime-authority.md`。
  - 新增 `scripts/check_runtime_authority.py`，并接入 `scripts/ci/software_check.sh` 与 `.github/workflows/software-check.yml`。
  - `competition_integrated.launch.py` 新增 `start_console_api`，默认 `false`；production 参数强制 `allow_raw_motion_debug=false`。
  - `competition_console_api_node.py` 默认不创建 `/L|R/robot_move*` 或 `/L|R/robot_servo_joint` raw clients；debug raw 模式必须匹配 `DUALARM_HARDWARE_CONFIRM_TOKEN`。
  - `quick_competition`、`config/quick_competition`、`scripts/quick` 和 quick tests 已迁入 `archive/quick_competition_2026-05-08/`，archive root 放置 `COLCON_IGNORE`。
  - 新增 `config/competition/camera_profiles.yaml`、`pouring.yaml`、`handover.yaml`，并更新 `config/profiles/competition_default.yaml`。
  - `right_arm_grasp_precheck.py` 改为 profile-first；`--color-device*` / `--depth-device*` 只能作为 debug ephemeral override，不能标记 verified。
  - `orbbec_gemini_bridge` 默认 `allow_auto_device_scan=false`；production 缺少稳定设备身份时 fail-closed。
  - motion-capable tools 默认 no-motion；真实动作需要显式 hardware 参数和 `DUALARM_HARDWARE_CONFIRM_TOKEN`。
  - `task_contract.py` 增加 pouring/handover primitive sequence 与 checkpoint evidence skeleton。
- 验证证据：
  - `python3 scripts/check_path_hardcodes.py`：通过。
  - `python3 scripts/check_readme_coverage.py`：通过，检查 61 个目录。
  - `python3 scripts/check_runtime_authority.py`：通过。
  - `python3 scripts/check_runtime_authority.py --launch-contracts`：通过。
  - `git diff --check`：通过。
  - `/usr/bin/python3 -m pytest -q tests/unit tests/integration packages/tasks/dualarm_task_manager/test/test_dualarm_task_contract.py`：`60 passed in 7.16s`。
  - `colcon build --base-paths packages --packages-select competition_console_api robo_ctrl dualarm_task_manager execution_adapter competition_start_gate dualarm_bringup dualarm_simulation tools`：`8 packages finished`。
  - `colcon build --base-paths packages --packages-select orbbec_gemini_bridge dualarm_bringup`：`2 packages finished`。
  - `PYTHON_BIN=/usr/bin/python3 bash scripts/ci/software_check.sh`：path/readme/runtime checks 通过，`60 passed`，8 包构建，15 个 colcon tests，web build 通过，Playwright `2 passed`。
  - `competition_integrated.launch.py --show-args`、`competition_core.launch.py --show-args`、`competition_gazebo_full.launch.py --show-args`：均通过。
  - Mock/no-motion smoke：旧进程检查无残留；`timeout 10s ros2 launch dualarm_bringup competition_integrated.launch.py start_hardware:=false use_mock_camera_stream:=true publish_fake_joint_states:=true start_console_api:=false start_camera_bridge:=false start_detector:=false` 启动核心软件图，timeout `124` 为预期；后置旧进程检查无残留。
- 当前边界与风险：
  - 本轮只证明软件架构收口，不证明真机安全、比赛成功或右臂夹取可恢复。
  - `execution_adapter` 仍是唯一 production raw robot service caller；`robo_ctrl` 只作为 driver/provider。
  - archived quick 只作 reference，不得作为 active package 或 production fallback 重新引入。
  - 相机 profile 当前 `calibration_status=unverified`，不能作为 verified hardware evidence。
- 下一步范围：
  1. 右臂夹取恢复前重新采集 camera by-id/by-path/serial/usb_port、外参、深度单位、ROI、clearance gate、`motion_done` 和 gripper status。
  2. 若要启用 debug/manual 真动作，必须显式 hardware 参数并匹配 `DUALARM_HARDWARE_CONFIRM_TOKEN`。
  3. 不复用旧 quick JSON 或旧 `/dev/video*` 设备号作为 verified 事实。

## 2026-05-08 双臂连接检测与双相机瓶盖单点深度采样
- Wave: dual-arm-hardware-camera-alignment-log
- 状态：no-motion 双臂连接检测与双相机单点瓶盖采样完成；未执行真实运动、未调用夹爪 command、未调用 `/competition/run`。当前 `ROS_DOMAIN_ID=0` 已清理为空，关键进程无残留。
- 详细记录：
  - `docs/operations/reports/2026-05-08-dual-arm-hardware-camera-alignment-log.md`
- 已完成：
  - 新增 `packages/tools/tools/scripts/cap_depth_alignment_probe.py`，支持 `capture` 固化 RGB/Z16 raw/metadata，支持 `analyze` 在同一份 raw depth 上按像素点计算 ROI 深度和相机坐标。
  - `py_compile`、动作端点静态扫描、`git diff --check`、`colcon build --base-paths packages --packages-select tools` 均通过。
  - 网络：`enp5s0=192.168.58.10/24`；`192.168.58.2:8080` 与 `192.168.58.3:8080` 均可达。
  - 只读 `robo_ctrl`：`/L/robot_state` 与 `/R/robot_state` 均约 `4.996 Hz`，均为 `motion_done=true`、`error_code=0`。
  - 左相机采样：RGB `/dev/video6`，Z16 `/dev/video0`；右相机采样：RGB `/dev/video14`，Z16 `/dev/video8`。
  - 瓶盖 `cap_p1` 单点深度：
    - 左像素 `(377.70, 226.89)`，depth median `0.440 m`，camera point `[0.075594, -0.012506, 0.440] m`。
    - 右像素 `(357.96, 219.75)`，depth median `0.459 m`，camera point `[0.052596, -0.020173, 0.459] m`。
  - 瓶盖 `cap_p2` 追加采样：
    - 左像素 `(243.42, 174.59)`，depth median `0.410 m`，camera point `[-0.089138, -0.058286, 0.410] m`。
    - 右像素 `(257.58, 308.35)`，depth median `0.412 m`，camera point `[-0.072663, 0.061278, 0.412] m`。
  - 瓶盖 `cap_p3` 追加采样：
    - 左像素 `(354.07, 234.19)`，depth median `0.443 m`，camera point `[0.045768, -0.005558, 0.443] m`。
    - 右像素 `(358.92, 238.30)`，depth median `0.443 m`，camera point `[0.051995, -0.001598, 0.443] m`。
  - 瓶盖 `cap_p4` 追加采样：
    - 左像素 `(327.36, 149.77)`，depth median `0.394 m`，camera point `[0.010202, -0.077279, 0.394] m`。
    - 右像素 `(267.76, 241.54)`，depth median `0.464 m`，camera point `[-0.068143, 0.001595, 0.464] m`。
  - 已用 `cap_p1..cap_p4` 计算右相机到左相机候选刚体变换：RMSE `0.013744 m`，最大误差 `0.020159 m`，输出 `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-transform-candidate.json`。
  - 瓶盖 `cap_p5` 独立验证采样：
    - 左像素 `(265.65, 226.24)`，depth median `0.372 m`，camera point `[-0.056907, -0.011099, 0.372] m`。
    - 右像素 `(269.09, 255.83)`，depth median `0.455 m`，camera point `[-0.065067, 0.015704, 0.455] m`。
    - 用 `cap_p1..cap_p4` 候选变换预测 `cap_p5`，独立验证误差 `0.083752 m`，状态 `candidate_validation_failed_high_error`。
  - 已按“瓶盖顶部中心”语义重标记并重拟合：
    - `cap_p1..cap_p3` 标记为 inlier。
    - `cap_p4` 标记为 weak inlier。
    - `cap_p5` 标记为 rejected validation outlier。
    - 重拟合 JSON：`.codex/tmp/runtime/dual-arm-cap-alignment-20260508-refit-with-labels.json`。
  - 已用 camera+TCP 链路推导候选双臂变换并与历史指尖接触候选对比：
    - JSON：`.codex/tmp/runtime/dual-arm-camera-tcp-vs-contact-transform-compare-20260508.json`。
    - camera+TCP 推导 `right_base -> left_base` translation `[-184.040, 653.847, -135.691] mm`，rpy `[91.686, 48.006, 53.481] deg`。
    - 历史指尖接触候选 `right_base -> left_base` translation `[-143.040, 871.374, -9.201] mm`，rpy `[3.359, -0.274, 21.311] deg`。
    - 两者平移差范数约 `254.949 mm`，旋转差约 `90.002 deg`。
- 当前边界与风险：
  - `depth_scale_mm_per_raw=1.0` 仍是 `operator_selected_not_global_verified`。
  - 当前 4 点候选变换未通过 `cap_p5` 独立验证，误差约 `83.8 mm`；不能标记 verified。
  - `cap_p5` 瓶盖旁有浅色长条物体，左 ROI 有效像素较少且 raw min 有离群值，存在局部混合深度风险。
  - 瓶盖高度不应从相机到相机的“瓶盖顶部中心”刚体拟合里扣除；如果后续要换算桌面接触点，必须先有桌面法向和实测瓶盖高度。
  - camera+TCP 推导和历史指尖接触候选差异远超内部残差，当前不能互相验证；两者都只能保留为 candidate。
  - 工作区仍不得进入双臂协作、自动抓取或合爪；任何真实运动前必须重新现场确认。
- 下一步范围：
  1. 建议重新采 `cap_p5_repeat`：瓶盖周围尽量不要贴近长条、线缆或反光边缘，保持左右采样期间不移动。
  2. 若重复验证仍大于约 `30 mm`，继续采更多无干扰点并重新拟合；通过前不标记 verified。
  3. 若要提升到手眼/双臂统一坐标系，后续必须引入机械臂位姿或独立标定板验证，不能只靠当前候选变换。

## 2026-05-07 右臂脚本化靠近收口与架构审查接续
- Wave: right-arm-autonomous-approach-closure-and-architecture-handoff
- 状态：已按用户要求停止继续实机动作并清理控制图；右臂停稳，右夹爪打开；未合爪，未调用 `/competition/run`，未做双臂协作。下一窗口先处理 external review 架构审查暴露的重复/分裂问题，再重新启动右臂链路接续夹取。
- 详细记录：
  - `docs/operations/reports/2026-05-07-right-arm-practice-control-log.md`
  - `.codex/tmp/resume/NEXT_WINDOW_PROMPT_2026-05-07-right-arm-architecture-and-grasp.md`
- 已完成：
  - `right_arm_grasp_precheck.py` 修正 camera->TCP 变换方向、180 度旋转画面几何、目标深度窗口和 `target_alignment` 输出。
  - `right_arm_autonomous_grasp_attempt.py` 通过 MoveIt `/planning/plan_pose` + `/execution/execute_trajectory` 完成右臂脚本化靠近，target alignment 默认改为 advisory；只有显式参数才作为硬门禁。
  - 已执行两段 `pregrasp` 靠近：
    - `.codex/tmp/runtime/right-arm-contact-approach-execute-pregrasp-advisory-20260507-162142/right_arm_autonomous_grasp_attempt.json`
    - `.codex/tmp/runtime/right-arm-contact-approach-execute-second-pregrasp-advisory-20260507-162307/right_arm_autonomous_grasp_attempt.json`
  - 已执行一段视野恢复：
    - `.codex/tmp/runtime/right-arm-visual-recover-execute-edge-20260507-162508/right_arm_autonomous_grasp_attempt.json`
  - 最新视觉预检：
    - `.codex/tmp/runtime/right-arm-grasp-precheck-after-visual-recover-20260507-162527/right_arm_grasp_precheck.json`
- 当前最终状态：
  - 清理前最后 `/R/robot_state`：TCP 约 `[-226.135, -262.203, 236.498, -171.249, 38.941, 37.351] mm/deg`，`motion_done=true`，`error_code=0`。
  - 清理前右夹爪 status：`success=true`、`gact=true`、`gsta=3`、`gobj=3`、`error=0`、`position=0`，夹爪打开且未检测到物体。
  - 已停止 `robo_ctrl`、MoveIt、planner、`planning_scene_sync`、`execution_adapter`、右夹爪节点；`ros2 daemon stop` 后没有有效 `ROS_DOMAIN_ID=0` 控制节点或关键进程残留。
- 当前未完成：
  - 未完成自动夹取；未执行合爪。
  - 靠近后目标持续贴到画面底边，最新 `bbox_edge_margin_px=0.0`，depth median 约 `0.210 m`，clearance gate 失败，外参仍是 `operator_confirmed_same_as_left_not_calibration_verified`。
  - 目标居中/TCP 对齐按用户要求是参考项，不是默认硬门禁；但目标贴边、深度跳变或 ROI 混背景时仍必须先恢复视野。
- external review 架构审查接续要求：
  - 下窗口先处理项目三条执行路径分裂：正式主链、Quick 实机旁路、Gazebo 仿真链。
  - 优先收口重复 Orbbec bridge、重复 camera matrix、Quick 执行路径与 `execution_adapter` 分裂、launch 三层透传、配置 schema 分裂、右臂实机脚本 JSON 串联问题。
  - 架构清理阶段不得触发真实硬件运动；删除/归档前必须先 `rg` 引用并保留兼容入口或迁移说明。
- 下一步范围：
  1. 读取 `.codex/tmp/resume/NEXT_WINDOW_PROMPT_2026-05-07-right-arm-architecture-and-grasp.md`。
  2. 将 external review 审查转成 PRD Story 和小波次，先做 P0/P1 重复源码/执行路径收口。
  3. 架构清理验证完成后，重新启动右臂控制图并重新采集 precheck；不要复用旧 JSON 直接运动。
  4. 若目标仍贴边，先做小步视野恢复；若 plan 实际出现 `grasp` 段且夹爪打开、现场安全，再执行合爪并用 `gobj` 验证是否夹到。

## 2026-05-07 右臂深度建模预检与实践控制待确认
- Wave: right-arm-depth-model-practice-control
- 状态：no-motion 预检脚本已实现并运行；目标深度模型有效，但障碍物 clearance gate 与 verified 外参 gate 未通过；用户补充确认左右相机-TCP 变换相同且机械臂周围 `30cm` 半径无障碍物，当前准备将实践 jog 从 `Z +2.0 mm / 5%` 更新为 `Z +20.0 mm / 15%`。未执行本轮右臂 jog，未执行右夹爪 command，未调用 `/competition/run`。
- 详细记录：
  - `docs/operations/reports/2026-05-07-right-arm-practice-control-log.md`
- 已完成：
  - 新增 `packages/tools/tools/scripts/right_arm_grasp_precheck.py` 并加入 `tools` 安装清单。
  - 脚本读取右彩色 `/dev/video6` 和右 Z16 `/dev/video0`；右深度按 `depth_scale_mm_per_raw=1.0` 写入 JSON。
  - 本地 YOLO 检测到 `cocacola`，并输出 depth ROI、目标 3D bbox、障碍物 bbox、candidate TCP point 和 safety gate。
  - 静态验证通过：`py_compile`、禁用动作端点 `rg` 无命中、`git diff --check`。
  - `colcon build --base-paths packages --packages-select tools` 通过。
  - no-motion 输出目录：`.codex/tmp/runtime/right-arm-grasp-precheck-20260507-143327/`。
- 当前预检结论：
  - `target_3d_bbox_camera_m.valid=true`。
  - `obstacle_model.clearance_gate.passes=false`，`obstacle_min_distance_m=0.0`。
  - `candidate_extrinsic.status=candidate/reference_left_extrinsic`，不是 verified；用户后续补充可按左右相机-TCP 变换相同处理，脚本将记录为 `operator_confirmed_same_as_left_not_calibration_verified`。
  - `safety_gate.passes=false`，`auto_grasp_allowed=false`。
- 运动前准备检查：
  - `ROS_DOMAIN_ID=0` node list 为空。
  - 旧进程检查未发现有效残留。
  - `192.168.58.3:8080` TCP 可达。
  - 右夹爪 by-id 串口存在。
- 当前硬边界：
  - 不允许自动靠近、预抓取或自动合爪抓取。
  - 若用户现场确认安全，只允许先执行右臂安全方向低速 `Z +2.0 mm` 增量 jog 并做 `/R/robot_state` 闭环。
  - 若运动后状态不闭环，立即走直连 SDK `StopMotion()`。
- 下一步范围：
  1. 等待现场明确确认：工作区无人、手在急停、右臂末端 `Z +2.0 mm` 安全方向无遮挡，并允许发送一次低速增量 jog。
  2. 启动 `robo_ctrl_R.launch.py`，采样运动前 5 帧 `/R/robot_state`。
  3. 若 fresh、`motion_done=true`、`error_code=0`，执行一次 `/R/robot_move_cart` `use_increment=true`、`z=+20.0 mm`、`velocity=15.0`、`acceleration=15.0`、`ovl=15.0`。
  4. 运动后采样 5 帧，确认 `motion_done=true`、`error_code=0` 和 TCP 稳定。
  5. 右臂停稳后才进入右夹爪原地 status/enable/open-close-open。

## 2026-05-07 右臂小增量运动停稳与脚本化几何接续
- Wave: right-arm-single-arm-scripted-geometry-handoff
- 状态：已收口上次右臂低速 `Z +3.0 mm` 增量测试后的 `motion_done=false` 风险；已通过直连 Fairino SDK `StopMotion()` 停稳并确认 `/R/robot_state` 连续采样为 `motion_done=true`、`error_code=0`；`/right_robo_ctrl` 已停止，`ROS_DOMAIN_ID=0` node list 为空。未执行夹爪 enable/open/close，未调用 `/competition/run`，未做双臂协作。
- 详细记录：
  - `docs/operations/reports/2026-05-06-real-hardware-debug-log.md`
  - `docs/operations/reports/2026-05-07-right-arm-motion-stop-and-scripted-geometry-handoff.md`
- 已发生的真实运动：
  - 右臂 `/R/robot_move_cart` 低速增量命令：base/tool 当前接口 `use_increment=true`，`tcp_pose.z=+3.0 mm`，`velocity=5.0`、`acceleration=5.0`、`ovl=5.0`。
  - 服务曾返回 `success=true`，但随后 `/R/robot_state` 长时间显示 `motion_done=false`，TCP `z` 从约 `640.160 mm` 慢速变化到约 `642.919 mm`。
  - 直连 SDK helper 调用 `RPC(192.168.58.3)` 与 `StopMotion()`，返回 `ret=0`。
  - 停止后连续 5 帧 `/R/robot_state` 均为 `motion_done=true`、`error_code=0`，TCP `z` 稳定在约 `643.086 mm`。
- 当前硬边界：
  - 后续几何、深度、像素到相机点、相机到 TCP/基座候选转换必须全部由脚本计算并输出 JSON；聊天中不得手算几何结果。
  - 本会话用户指定右深度 raw 单位按 `raw=mm` 解释，即 `676 raw = 676 mm = 0.676 m`；该结论仍应由脚本作为输入参数记录，不能隐式写死为全局 verified 标定。
  - 右相机到右 TCP 外参可临时参考左臂 `Ltcp -> camera_link` 参数，但只能标记为 `candidate/reference_left_extrinsic`，不能标记为 verified。
  - 当前不能直接进入自动夹取或合爪；右相机视野有障碍物，右相机外参、color/depth 对齐、三维避障和抓取门控仍未 verified。
- 下一步范围：
  1. 新增或继续实现脚本化预检查工具，建议入口 `packages/tools/tools/scripts/right_arm_grasp_precheck.py`，负责采集右彩色/右 Z16、YOLO 检测、ROI 深度统计、内参缩放、候选相机点/TCP 点、障碍物距离和 fail-closed gate，输出 JSON 与标注图。
  2. 脚本只做 no-motion 计算；运行前先确认 `ROS_DOMAIN_ID=0` 干净或只包含预期节点。
  3. 任何后续真实 motion 前必须先重新启动右臂 `robo_ctrl_node`，确认状态 fresh、`motion_done=true`、`error_code=0`，并明确本次单步距离/方向/速度；不得直接夹取、不得双臂协作。

## 2026-05-06 右臂单臂夹取链路预检查
- Wave: right-arm-single-arm-grasp-precheck-no-motion
- 状态：完成 no-motion 目标识别、右臂状态读取和右深度原始 ROI 估计；安全门控拒绝真实夹取；未执行真实运动，未调用夹爪 enable/open/close，未调用 `/competition/run`；右臂状态节点已停止。
- 详细记录：`docs/operations/reports/2026-05-06-real-hardware-debug-log.md`。
- 已完成：
  - 按用户确认“现场无人、右相机视野有障碍物”继续做单臂夹取链路预检查。
  - 停止右侧 color-only 可视化/检测链路以释放右深度设备。
  - 右臂 `robo_ctrl_node` 只读状态接入成功：`/R/robot_state` 约 `4.995 Hz`，`motion_done=true`，`error_code=0`。
  - 使用原生 V4L2 ioctl/mmap 从 `/dev/video0` 读取右侧 `640x480 Z16` 深度帧；OpenCV V4L2 路径仍打不开，OBSENSOR 返回全 0。
  - 用 YOLOv8 `.pt` 对右彩色快照检测到 `cocacola`，confidence `0.894`，bbox center `(358.8, 277.4)`。
  - 近似 bbox-to-depth ROI 得到 target raw depth p05 `555`、median `676`。
- 验证证据：
  - 快照输出目录：`.codex/tmp/runtime/right-grasp-precheck-20260506/`，含 `right_color_snapshot.jpg`、`right_color_detection.jpg`、`right_depth_raw_vis.jpg`。
  - 按仓内默认 `v4l2_depth_unit_to_mm_scale=0.125` 解释，target median 约 `84.5 mm`；按 raw=mm 解释，target median 约 `676 mm`。
- 当前边界与风险：
  - 深度单位存在 `0.125x` 与 `1.0x` 冲突，未校准前不能作为真实安全距离。
  - 当前缺可信 `Rtcp/right_tcp -> right_camera_depth_frame` 外参；历史静态 TF 只有 `Ltcp -> camera_link`。
  - color/depth 当前为交替快照且未正式对齐，bbox-to-depth ROI 只能作为调试估计。
  - 右相机视野内有障碍物，且没有 verified 三维避障/碰撞模型；因此真实夹取被 fail-closed 拒绝。
- 下一步范围：
  1. 先校准 `/dev/video0` Z16 单位比例，确定 raw depth 是否乘 `0.125`。
  2. 建立并验证右相机到右 TCP/基座外参。
  3. 再做 no-motion 目标位姿估计和 workspace/障碍物门控。
  4. 真实动作只能从右臂单步小增量或预抓取空走开始，不允许直接合爪夹取。

## 2026-05-06 右相机确认与右臂只读控制状态接入
- Wave: right-camera-confirmed-and-right-arm-readonly-control-precheck
- 状态：已完成 no-motion 右臂状态接入；未执行真实运动，未调用夹爪 enable/open/close，未调用 `/competition/run`；受控前台状态节点已停止，当前 `ROS_DOMAIN_ID=0` 仍保留右相机/检测可视化节点。
- 详细记录：`docs/operations/reports/2026-05-06-real-hardware-debug-log.md`。
- 已完成：
  - 用户现场确认当前 `/dev/video6` / `CP02653000G2` 彩色画面是右侧相机；右相机从 candidate 更新为现场确认。
  - 检查 `ROS_DOMAIN_ID=0` 初始 graph：仅有 `/right_orbbec_gemini_bridge`、`/detector_right`、`/detector_adapter_right`、`/right_camera_color_viewer`、`/right_detector_overlay_viewer`。
  - 网络检查：`enp5s0=192.168.58.10/24`，`192.168.58.2:8080` 和 `192.168.58.3:8080` 均可达。
  - 单独以受控前台会话启动右臂 `robo_ctrl_node`，只读发布 `/R/robot_state`，未调用任何 `/R/robot_move*` 或 `/R/robot_servo*` 服务。
- 验证证据：
  - `/right_robo_ctrl` 日志显示成功连接 `192.168.58.3` 并启动状态线程。
  - `/R/robot_state` 约 `4.995 Hz`。
  - 采样帧：`joint_position=[52.3965, -83.5825, -12.4235, -30.0943, -107.9497, 0.1314]`，`tcp_pose=[-31.8716, -158.0354, 640.1603, -142.5021, -14.3388, 131.4828]`，`motion_done=true`，`error_code=0`。
- 当前边界与风险：
  - 右深度/table overlay 仍未验证。
  - 双臂坐标系、相机外参和夹爪指尖模型仍不能标为 `verified`，不得做协作运动或声明“不打架”。
  - 后台方式启动 `robo_ctrl_node` 未形成可用状态证据；本轮有效证据来自受控前台会话。
- 下一步范围：
  1. 若用户授权真实运动，只允许右臂单臂小增量 jog，并在发命令前确认方向/坐标系、距离、速度、工作区无人、手在急停、末端和周边安全距离。
  2. 任何双臂协作前必须先完成 base 外参 verified、工具/指尖模型 verified、MoveIt 互碰/自碰 smoke 和低速 no-motion/mock 规划验证。

## 2026-05-06 右机械臂候选相机彩色可视化与坐标系安全结论
- Wave: right-arm-candidate-camera-color-viz-no-motion
- 状态：进行中；已按用户现场观察纠正相机物理归属，当前打开的是另一台 Orbbec `CP02653000G2` 的彩色-only 右机械臂候选相机；未执行真实运动，未调用夹爪 enable/open/close，未调用 `/competition/run`。
- 详细记录：`docs/operations/reports/2026-05-06-real-hardware-debug-log.md`。
- 已完成：
  - 停止误命名为 `right_camera`、但用户现场确认实际为左机械臂相机的 `/dev/video16` 可视化链路。
  - 启动 `/dev/video6` 作为右机械臂候选彩色口，节点为 `/right_orbbec_gemini_bridge`，topic 为 `/right_camera/color/image_raw`。
  - 启动 OpenCV 窗口 `right_camera_color` 与 `right_detector_overlay`。
  - 启动 CPU detector：`/detector/right/detections` 和 `/detector/right/detections/image` 已发布。
- 验证证据：
  - 当前日志目录：`.codex/tmp/runtime/right-arm-candidate-cp026-color-viz-domain0-20260506-215108`。
  - `/right_camera/color/image_raw`：约 `13.9 Hz` 到 `15.0 Hz`。
  - `/detector/right/detections/image`：约 `15.0 Hz`。
  - `/detector/right/detections` 一帧检测包含 class id `2/0/4/3`，最高置信度约 `0.85`，header frame 为 `right_camera_color_frame`。
- 当前边界与风险：
  - 右相机深度/table overlay 未通过；最小复现显示同一台 Orbbec 同时打开彩色和 Z16 深度时，彩色可读但深度读帧失败，单独深度可读。
  - 当前 `/dev/video6` 仅为“右机械臂候选”，仍需用户基于现场画面确认它确实是右机械臂相机。
  - 双臂坐标系仍不能标为 `verified`：四点候选外参 RMS 残差约 `18.459 mm`、最大残差约 `21.547 mm`，且夹爪指尖偏移仍是 candidate。
  - 当前不能进行协作动作，也不能保证双臂“不打架”；任何真实协作运动前必须完成 base 外参、指尖工具模型、MoveIt 互碰/自碰、低速 mock/no-motion 规划和现场安全确认。

## 2026-05-06 实机代码审查修复 P1 崩溃风险批次
- Wave: hardware-code-review-p1-crash-risk-repair
- 状态：P1 代码修改、静态合同、runtime stress（KDTree / PlanningSceneSync cache / competition_console stop）、py_compile、pytest、核心构建和 detector 单独构建已完成；planner/depth_processor/legacy/LwDetr/Servo runtime 证据仍不足，按规则保留“已修改待验证”或“环境阻塞”；未执行真实机械臂运动，未调用夹爪 enable/open/close，未调用 `/competition/run`。
- 详细记录：`docs/operations/reports/2026-05-06-p1-crash-code-review-repair.md`。
- 已完成：
  - `robo_ctrl` ServoLine/ServoJoint 异常 catch 路径返回 `success=false` 和异常消息；ServoJ SDK 调用删除 `const_cast`，改为本地可变副本。
  - `depth_handler` KDTree OpenMP claim 路径删除 `std::vector<bool>`，改用 atomic byte flag。
  - `fairino_dualarm_planner` 的 scene/robot state 共享状态加 mutex；MoveIt planning 保持锁外执行。
  - `planning_scene_sync` raw/cache/last_seen 更新与 live-object 检查进入 `_sync_lock`。
  - legacy `fairino3_v6_planner` 的 `current_plan_` 改为局部 plan + 短锁快照。
  - `depth_processor_node` 的 `camera_info_`、`table_scene_` 改为不可变 shared_ptr 快照，图像/点云循环锁外执行。
  - `LwDetr` 初始化 CUDA/TensorRT/plugin 指针，检查 CUDA API 返回值，并按 stream sync -> TRT destroy -> buffer free -> stream destroy -> dlclose 顺序释放资源。
  - `competition_console_api` stop 流程锁内交换 process 状态，锁外 kill/wait，并处理 stop 竞态异常。
  - 新增 `tests/unit/test_p1_runtime_stress.py`，为 KDTree atomic claim、PlanningSceneSync cache 和 competition_console stop 并发路径提供可重复 stress 证据。
- 验证证据：
  - `/usr/bin/python3 -m py_compile packages/planning/planning_scene_sync/scripts/planning_scene_sync_node.py packages/ops/competition_console_api/scripts/competition_console_api_node.py tests/unit/test_p1_crash_contracts.py`：通过。
  - `/usr/bin/python3 -m pytest -q tests/unit/test_p0_safety_contracts.py tests/unit/test_p1_crash_contracts.py`：`13 passed in 0.03s`。
  - `/usr/bin/python3 -m py_compile tests/unit/test_p1_runtime_stress.py`：通过。
  - `/usr/bin/python3 -m pytest -q tests/unit/test_p1_runtime_stress.py`：`3 passed in 9.49s`。
  - `/usr/bin/python3 -m py_compile packages/planning/planning_scene_sync/scripts/planning_scene_sync_node.py packages/ops/competition_console_api/scripts/competition_console_api_node.py tests/unit/test_p1_crash_contracts.py tests/unit/test_p1_runtime_stress.py`：通过。
  - `/usr/bin/python3 -m pytest -q tests/unit/test_p0_safety_contracts.py tests/unit/test_p1_crash_contracts.py tests/unit/test_p1_runtime_stress.py`：`16 passed in 9.32s`。
  - `git diff --check`：通过。
  - `colcon build --base-paths packages --packages-select robo_ctrl depth_handler fairino_dualarm_planner planning_scene_sync fairino3_v6_planner competition_console_api`：活跃包 `robo_ctrl depth_handler planning_scene_sync competition_console_api fairino_dualarm_planner` 构建通过；`fairino3_v6_planner` 因 `COLCON_IGNORE` 为 unknown package。
  - `colcon build --base-paths packages --packages-select robo_ctrl depth_handler fairino_dualarm_planner planning_scene_sync competition_console_api`：`5 packages finished [3.93s]`。
  - `colcon build --base-paths packages --packages-select detector`：通过；仅有自定义 TensorRT plugin 未设置 warning。
  - 进程检查确认本轮 stress 自建 `sleep 30` / `kdtree_stress` 无残留；工作区仍有既有 Gazebo/MoveIt/PlanningScene 相关进程，本轮未启动 launch、未清理、未作为验证依赖。
- 当前边界与风险：
  - KDTree、PlanningSceneSync cache、competition_console stop 已有可重复 stress 证据，可在 P1 报告中标为“已关闭”。
  - planner scene/robot state、legacy planner plan、depth_processor 三处并发修复缺 TSAN/stress 运行证据，只能标为“已修改待验证”或“环境阻塞”。
  - legacy `fairino3_v6_planner` 目录存在 `COLCON_IGNORE`，本轮没有构建证据。
  - LwDetr 没有 CUDA/TensorRT runtime inference 证据。
  - 当前仍有 Gazebo/quick/perception/P0 既有脏变更，P1 报告已列 dirty baseline。
- 下一步范围：
  1. 若继续 P1 关闭剩余并发项，先补 planner scene/robot state、legacy planner plan、depth_processor 的可重复 stress 或 TSAN 证据。
  2. 若需要 legacy planner 关闭，先决定是否解除 `COLCON_IGNORE` 或改为归档不修；不得静默把未构建 legacy 项标为关闭。
  3. 若要关闭 Servo/LwDetr，分别补 service failure injection 与 CUDA/TensorRT runtime inference 证据。
  4. P0/P1 运行态证据全部补齐前，仍只允许 no-motion smoke、service mock、静态/构建/单测验证。

## 2026-05-06 实机代码审查修复 P0 安全批次
- Wave: hardware-code-review-p0-safety-repair
- 状态：P0 软件/mock/no-motion 验证已完成；未执行真实机械臂运动，未调用夹爪 enable/open/close，未调用 `/competition/run`，未声明急停或执行器实机通过。
- 详细记录：`docs/operations/reports/2026-05-06-p0-safety-code-review-repair.md`。
- 已完成：
  - `keyboard_tcp_controller.cpp` 将键盘 TCP 增量 `x/y/z` 从 mm 显式转换为 ROS `Pose` 的 m。
  - `robo_ctrl` 状态线程轮询 `GetRobotEmergencyStopState()`；急停状态未知或激活时，`RobotMove`、`RobotMoveCart`、motion/start 类 `RobotServo*` 和 `RobotSetSpeed` fail-closed 返回失败；ServoEnd/stop 类 `command_type=1` 不被急停 gate 拦截。
  - `legacy_fairino_bridge.py stop_all()` 在 hardware 路径没有通用 `StopMotion/abort` 服务时 fail-closed：先拒绝后续软件运动/夹爪动作并返回失败，best-effort 发送 ServoEnd，但不冒充 stop 成功。
  - `dualarm/src/main.cpp` 修复 `MultiThreadedExecutor executor()` most-vexing-parse。
  - `dualarm/src/main_refactored.cpp` 的 5 个假成功服务 handler 改为明确 `success=false`。
  - `legacy_fairino_bridge.py` 与 `quick_waypoint_recorder.py` 只在本函数实际初始化 rclpy 时 shutdown，避免全局副作用。
- 验证证据：
  - `/usr/bin/python3 -m py_compile packages/quick_competition/quick_competition/legacy_fairino_bridge.py packages/quick_competition/quick_competition/quick_waypoint_recorder.py tests/unit/test_p0_safety_contracts.py`：通过。
  - `/usr/bin/python3 -m pytest -q tests/unit/test_p0_safety_contracts.py`：`5 passed in 0.01s`。
  - `git diff --check`：通过。
  - `colcon build --base-paths packages --packages-select tools robo_ctrl quick_competition dualarm`：通过，`4 packages finished [1min 1s]`；`dualarm` 仍有既有 deprecation/std::async warning。
- 当前边界与风险：
  - 急停轮询和 fail-closed gate 已实现并静态/构建验证；未做实机急停触发验证。
  - `quick` hardware `stop_all()` 因缺通用 `StopMotion/abort` 服务仍返回失败并要求人工物理急停接管；ServoEnd 只是 best-effort，不作为完整停止能力。
  - P1/P2 尚未启动，现有 Gazebo/quick/perception 脏变更均未回滚。
- 下一步范围：
  1. 进入 P1 崩溃风险批次，只修线程安全、异常返回、资源生命周期和未定义行为。
  2. P1 并发项必须拿到 TSAN 或可重复 stress test 证据才能标记关闭；否则只能标为“已修改待验证”。
  3. P0/P1 全部通过前仍只允许 no-motion smoke、service mock、静态/构建/单测验证。

## 2026-05-06 实机默认域污染处理与左深度相机检测可视化
- Wave: real-hardware-domain0-cleanup-and-camera-detection-viz
- 状态：进行中；`ROS_DOMAIN_ID=0` 当前已拉起 no-motion 左相机感知可视化；未执行真实运动，未调用夹爪 enable/open/close，未调用 `/competition/run`。
- 详细记录：`docs/operations/reports/2026-05-06-real-hardware-debug-log.md`。
- 已确认：
  - 已清理 `ROS_DOMAIN_ID=0/unset` 中两套 software-only `competition_core` 派生节点和两个临时 `/tmp/depth_detection_viewer.py`，清理后默认域 `ros2 node list` 一度为空。
  - 未清理另一个窗口 `ROS_DOMAIN_ID=162` 的 `competition_gazebo_full.launch.py`、`move_group`、`planning_scene_sync`、`fairino_dualarm_planner`、RViz 等仿真进程。
  - 只读设备检查通过：`enp5s0=192.168.58.10/24`，`192.168.58.2:8080` 和 `192.168.58.3:8080` ping/TCP 均可达；夹爪串口 by-id 仍存在。
  - V4L2 枚举确认 Orbbec `CP02653000G2` 对应 `/dev/video0=Z16` 与 `/dev/video6=YUYV,MJPG`；`CP1E5420007N` 对应 `/dev/video10=Z16` 与 `/dev/video16=YUYV,MJPG`；`/dev/video8` 是笔记本 `Integrated Camera`，不能当 Orbbec 彩色口。
  - 第一次感知 core 使用默认 `obsensor:0` 时持续 `读取深度图失败`，未作为通过证据。
  - 当前成功入口使用明确 V4L2 设备：
    - `start_hardware:=false`
    - `start_camera_bridge:=true`
    - `start_detector:=true`
    - `start_right_detector:=false`
    - `enable_right_camera:=false`
    - `left_camera_color_device:=/dev/video6`
    - `left_camera_depth_device:=/dev/video0`
    - `left_camera_depth_backend:=v4l2`
    - `publish_fake_joint_states:=true`
    - `allow_unverified_camera_extrinsics:=true`
  - 当前运行日志目录：`.codex/tmp/runtime/real-camera-detection-viz-domain0-20260506-172023`。
  - 当前运行 PID：core launch `69100`，RViz launch `70273`，detector overlay viewer `70274`，table/depth overlay viewer `70275`。
  - RViz 使用 `dry_run:=true`、`enable_action_bridge:=false`、`scene_topic:=/scene_fusion/scene_objects`。
  - OpenCV 窗口已启动：
    - `/left_detector_overlay_viewer` 订阅 `/detector/left/detections/image`
    - `/table_depth_overlay_viewer` 订阅 `/perception/pick_assist/rgb_overlay`
  - 当前 `ROS_DOMAIN_ID=0 ros2 node list` 无重复 `/ros_image_viewer`，含 `/left_orbbec_gemini_bridge`、`/detector_left`、`/depth_handler_left`、`/scene_fusion`、`/planning_scene_sync`、`/competition_operator_rviz` 等 no-motion 感知/可视化节点。
  - topic 证据：
    - `/left_camera/color/image_raw` 约 `13.1 Hz`
    - `/left_camera/depth/image_raw` 约 `13.4 Hz`
    - `/detector/left/detections/image` 约 `11.2 Hz`
    - `/scene_fusion/scene_objects` 一帧包含 `table_surface_*` 和 `water_bottle_*`，`water_bottle` 来源为 `left_camera`，`pose_source=depth_roi_primitive_fit`。
- 当前边界与风险：
  - 当前只证明 no-motion 左相机深度/检测/场景可视化链路有真实 topic 和 managed scene evidence，不证明真实运动链路跑通。
  - 相机外参仍以 `allow_unverified_camera_extrinsics:=true` 调试发布，不能标为 `verified`。
  - 当前 `ROS_DOMAIN_ID=0` 不再是空图，而是有意运行的 no-motion 可视化图；后续若继续做 `robo_ctrl` 只读采样，必须先决定是否保留或停止该可视化图，避免把感知图误当干净实机状态图。
- 下一步范围：
  1. 用户可先查看 `left_detector_overlay`、`table_depth_overlay` 和 RViz 中的 scene objects。
  2. 若要继续标定采样，先明确是否停止当前感知可视化 core；如保留，所有 `ROS_DOMAIN_ID=0` 证据必须标注当前已有 no-motion camera/detector/MoveIt 节点。
  3. 进入任何 motion 前仍必须先确认急停、人员离开、低速 profile、机械臂空间安全、夹爪状态和操作员授权。

## 2026-05-06 实机只读复测与桌角接触点标定候选
- Wave: real-hardware-readonly-contact-calibration-candidate
- 状态：已完成 no-motion/read-only 采集；未执行真实运动，未调用夹爪 enable/open/close，未调用 `/competition/run`。
- 详细记录：`docs/operations/reports/2026-05-06-real-hardware-debug-log.md`。
- 已确认：
  - 实机窗口使用 `ROS_DOMAIN_ID=0`；初始 `ros2 node list` 为空，未进入另一个窗口的 Gazebo/MoveIt 仿真 graph。
  - 另一个窗口的 `competition_gazebo_full.launch.py`、`move_group`、`planning_scene_sync`、`fairino_dualarm_planner_node`、RViz 进程存在；本轮只记录，未清理。
  - 网络可达：宿主机 `enp5s0=192.168.58.10/24`，`192.168.58.2:8080` 与 `192.168.58.3:8080` 均 ping/TCP 成功。
  - 串口 by-id 存在，但裸 `/dev/ttyUSB*` 映射与 2026-05-01 不同；后续必须继续使用 by-id。
  - 左 `robo_ctrl` 只读启动成功：`/L/robot_state` 约 5 Hz，当前帧 `motion_done=true`、`error_code=0`，TCP 约 `[-459.9956, 245.9422, 436.6226, -174.8978, -20.2733, 123.9204]`。
  - 右 `robo_ctrl` 只读启动成功：`/R/robot_state` 约 5 Hz，当前帧 `motion_done=true`、`error_code=0`，TCP 约 `[24.7092, -490.8670, 218.0168, -177.2486, -5.1831, 171.5636]`。
  - 用户现场先将右夹爪放在两条相邻桌边夹角的桌角顶点，随后左臂移到同一物理点、右臂又移到新的非桌角点；这些都只作为世界坐标/桌面标定候选点，不代表安全可动。
  - 用户补充确认：此前所有触桌接触都是夹爪指尖触桌，不是机器人控制器 TCP 直接触桌；因此 `tcp_pose` 必须结合左右夹爪 `tcp_to_fingertip_offset` 才能换算到真实接触点。
  - 模型检查：当前 active MoveIt 双臂 URDF/SRDF 未发现正式 gripper/fingertip link，tip 仍是 `left_tcp` / `right_tcp`；vendor SDK `fr3v6.urdf` 有 `j6_Link -> gripper_Link = [0,0,0.107] m + Rz(90deg)` 和 gripper mesh，但没有接入当前 active robot description。按 vendor mesh bbox 推得两侧远端指尖相对当前 TCP 约为 `[+/-76.7, +/-9.0, 95.0] mm`，整体 mesh z 范围约 `[-3.9, 161.0] mm`；与触桌候选点 base-z 一致性对比后，本轮继续把 `packages/tools/tools/config/static_transforms.yaml` 中历史末端 TF 作为更符合现场的候选偏移：`Ltcp -> Lend = [-0.019899, -0.003972, 0.191327] m`，`Rtcp -> Rend = [0.030650, -0.007066, 0.190848] m`。该偏移是否等同真实触桌指尖仍待三点/四点残差验证确认。
  - 左右 EPG50 只读 status service 均成功：左 slave `9`、右 slave `10`，`success=True`、`error=0`、`gact=False`，电压均 `23V`。
  - `bash scripts/quick/quick_hardware_smoke_test.sh` 在 no-motion 条件下通过，输出 `[OK] hardware smoke no-motion checks completed`；该 smoke 只证明话题/状态/quick frame 配置可读，不证明实机运动安全。
  - 15:41 补充采样形成桌角点对 `P_corner_R_candidate`/`P_corner_L_candidate`，并记录右臂新点 `P2_R_candidate`。按实际 topic 命令顺序校正后：`P_corner_L_candidate` TCP 约 `[12.2232, 415.7925, 185.2491, -179.0144, -2.9791, 58.3001]`；`P2_R_candidate` TCP 约 `[-389.7625, -393.3788, 217.4781, -179.8124, -5.2444, 125.4291]`。当前可用于标定的只有桌角点对，新点还不能单独算有效配对。
  - 15:51 补充采样记录左臂当前点 `P_left_current_1551_candidate` 与右臂新点 `P3_R_candidate`：左 TCP 约 `[-378.3639, 414.0353, 183.7158, -177.4574, -1.5350, 105.8155]`，右 TCP 约 `[-169.0668, -267.7144, 214.6276, 178.8996, 4.5532, 127.1735]`。用户描述左臂保持上一点，但该左 TCP 与 15:41 `P_corner_L_candidate` 位置差约 390.6 mm；结合用户补充的“夹爪指尖触桌”前提，后续应优先建模 TCP 到指尖偏移，而不是直接把 TCP 当接触点。
  - 16:04 补充采样形成第二组候选点对 `P3_R_candidate`/`P3_L_candidate`，并记录右臂新边角点 `P_corner2_R_candidate`。`P3_L_candidate` TCP 约 `[-184.7715, 552.6743, 185.8906, -172.3366, -2.1623, 81.5593]`，用 `Lend` 候选偏移换算指尖点约 `[-215.775, 544.385, -3.814] mm`；`P_corner2_R_candidate` TCP 约 `[-348.8521, 134.4679, 211.6604, -179.9173, 4.6610, 51.6649]`，用 `Rend` 候选偏移换算指尖点约 `[-345.281, 150.820, 18.963] mm`。
  - 16:22 先采到左臂第三点候选 `P_calib3_L_candidate`：左 TCP 约 `[-374.6696, 499.1434, 188.5948, -171.3510, -5.6079, 100.6662]`，用 `Lend` 候选偏移换算指尖点约 `[-406.548, 491.737, -1.001] mm`；随后在 16:31 补齐右臂同物理点。
  - 16:31 补充采样形成右臂第三点候选 `P_calib3_R_candidate`：右 TCP 约 `[-379.9695, -268.3993, 216.2925, -177.7920, 1.7410, 112.1220]`，用 `Rend` 候选偏移换算指尖点约 `[-402.680, -250.806, 25.015] mm`。结合 16:22 左点，第三个物理点已形成完整点对 `P_calib3_R_candidate/P_calib3_L_candidate`；左臂随后已移动到相机可见桌面位姿，不再参与该点配对。
  - 16:38 补充采样形成右臂第四点候选 `P_calib4_R_candidate`：右 TCP 约 `[-286.0629, -531.1006, 219.7707, -176.8804, 1.3777, 141.6689]`，用 `Rend` 候选偏移换算指尖点约 `[-317.329, -528.615, 28.908] mm`。左臂尚未放到同物理点，当前不能作为完整验证点对。
  - 16:44 补充采样形成左臂第四点候选 `P_calib4_L_candidate`：左 TCP 约 `[-247.0098, 256.7064, 179.2065, -179.9009, -9.2076, 102.0195]`，用 `Lend` 候选偏移换算指尖点约 `[-253.503, 266.541, -12.832] mm`。结合 16:38 右点，第四个物理点已形成完整点对 `P_calib4_R_candidate/P_calib4_L_candidate`。
  - 四点候选外参计算：用前三点拟合 `right_base -> left_base` 得 `translation=[-147.292, 871.190, -11.580] mm`、`rpy=[3.051746, -0.111474, 22.295896] deg`，第四点独立验证残差约 `14.626 mm`；四点整体最小二乘候选为 `translation=[-143.040, 871.374, -9.201] mm`、`rpy=[3.358771, -0.273581, 21.311430] deg`，RMS 残差约 `18.459 mm`、最大残差约 `21.547 mm`。当前只能作为 candidate，不能标为 `verified`。
- 发现与风险：
  - `/L/robot_state` 的 `ros2 topic echo --once` 偶发 CLI/DDS 发现失败；显式指定消息类型后可读，`topic hz` 约 5 Hz。后续记录可优先使用显式消息类型。
  - 右夹爪接触桌角时禁止自动运动、禁止夹爪控制；三点标定必须由人工拖动/轻触后只读采集。
  - 未建立左右夹爪指尖工具偏移前，不得把任何 `tcp_pose` 点对直接标为 `verified` 世界/桌面外参。
  - 当前 Gazebo/quick hybrid 仍处于半实现脏变更状态，本轮没有验证或修改该实现。
- 清理：
  - 本窗口启动的左右 `robo_ctrl` 和左右 EPG50 节点已停止；未遗留硬件状态节点。
  - 16:46 后续收口检查发现 `ROS_DOMAIN_ID=0` 中有另一个命令启动的 software-only `competition_core` 图，包含 `move_group`、`planning_scene_sync`、`fairino_dualarm_planner`、`execution_adapter`、`dualarm_task_manager`、左相机/检测相关节点等；命令含 `start_hardware:=false`、`publish_fake_joint_states:=true`，不是本窗口实机 `robo_ctrl` 采样节点。本轮未清理或 kill。
  - 后续继续实机采样前，必须重新检查 `ROS_DOMAIN_ID=0` graph；若这些 software-only core 节点仍在，应先由用户授权停止或隔离，否则不得把 `ROS_DOMAIN_ID=0` 图当作干净实机图。
  - 另一个窗口的仿真/RViz 进程当前使用 `ROS_DOMAIN_ID=162`，本轮未清理。
- 下一步范围：
  1. 继续接触点标定时，先复启左右 `robo_ctrl` 只读状态节点。
  2. 先把当前桌角点对固定为 `P_corner_R_candidate`/`P_corner_L_candidate` 的第一组候选；`P2_R_candidate` 与 `P3_R_candidate` 还需要左臂同物理点读数。
  3. 继续使用 `Lend/Rend` 作为当前优先候选指尖偏移；若三点/四点残差异常，回到 vendor mesh 指尖侧别或现场实测方式重新建立左右夹爪 `tcp_to_fingertip_offset`。
  4. 现在四组完整候选点对分别为 `P_corner_R_candidate/P_corner_L_candidate`、`P3_R_candidate/P3_L_candidate`、`P_calib3_R_candidate/P_calib3_L_candidate`、`P_calib4_R_candidate/P_calib4_L_candidate`；候选外参残差仍为厘米级，下一步应复核指尖接触侧/`Lend/Rend` 偏移/接触是否滑动或压缩，不能把外参标为 `verified`。
  5. 任何真实运动前仍必须先完成急停、人员离开、低速 profile、机械臂空间安全、夹爪状态确认和操作员授权。

## 2026-05-06 Gazebo 正式主链仿真闭环 + quick hybrid 接续断点
- Wave: gazebo-full-sim-mainchain-and-quick-hybrid
- 状态：进行中；当前为半实现断点，尚未构建、尚未运行 Gazebo/full chain smoke，不能声明验收通过。
- 本轮目标：
  - 正式主链以 `competition_gazebo_full.launch.py` + `/competition/run` 作为仿真验收入口。
  - `quick_competition` 保留为实机保底路径，并升级为 `hybrid` computed-template 模式，但不作为本轮主验收入口。
- 已落地的代码/配置：
  - 新增 `packages/simulation/dualarm_simulation` 包骨架与 3 个节点：`sim_truth_manager`、`sim_robot_state_publisher`、`sim_pour_state_manager`。
  - 新增 `packages/simulation/dualarm_simulation/config/competition_gazebo_full.yaml`，集中放置 sim 阈值：grasp contact、retry、robot_state freshness、basket acceptance。
  - 新增 `packages/bringup/dualarm_bringup/launch/competition_gazebo_full.launch.py`，目标是启动 Gazebo、sim truth、sim robot state、sim pour state，并用 `execution_backend=sim` 包装正式 competition launch。
  - `competition.launch.py`、`competition_core.launch.py`、`execution_adapter.launch.py`、`dualarm_task_manager.launch.py` 已开始透传 `execution_backend`、sim threshold、simulation mode 参数。
  - `execution_adapter_node.py` 已开始实现 sim backend：不调用真实 Fairino/EPG50，发布 sim joint setpoint、truth command、pour event，增加 robot_state freshness gate、guarded_grasp contact threshold/retry、release_guard truth pose、pour_state evidence 等逻辑。
  - `dualarm_task_manager_node.py` 已开始实现仿真 start gate 放行与 basket acceptance 判定，按球/篮筐最终 pose 打印验收信息。
  - `config/system/build_groups.yaml` 已加入 `simulation` group；`dualarm_bringup/package.xml` 已加入仿真相关依赖。
  - `quick_profile.yaml` 已改为 `motion_generation_mode: hybrid`，并记录 `execution.use_formal_scene_sync: false`、`allow_runtime_first_ik: false`。
  - 新增 `config/quick_competition/quick_grasp_templates.yaml`。
  - `quick_waypoints.yaml` 已加入 `safe_stow: null` 锚点占位，critical required group 包含 `home` 和 `safe_stow`。
  - `quick_types.py` 已把 `quick_grasp_templates.yaml` 加入 quick config contract。
  - 新增 quick computed 模块：`quick_grasp_template_library.py`、`quick_task_pose_generator.py`、`quick_ik_planner.py`、`quick_collision_scene_builder.py`。
- 尚未完成：
  - `quick_computed_motion_executor.py` 还未创建。
  - quick 新模块还未接入 `QuickPreflightCheck`、orchestrator、motion executor 或 pouring/ball primitives。
  - `packages/quick_competition/setup.py` 还未加入 quick computed console entry points。
  - quick hybrid preflight 的正式条件还未实现：computed IK/collision 通过 OR fallback waypoint IK 通过；两者失败才 `SKIPPED_BY_PREFLIGHT`。
  - quick 模式下 PlanningScene 边界仍需实现为：默认不运行正式 `planning_scene_sync`；quick 静态场景由 `quick_collision_scene_builder` 负责，执行阶段 attach/detach 由 quick executor 或正式 sim/hardware execution path 维护。
  - Wave 2 独立 MoveIt service/action 名称发现命令尚未执行：`ros2 service list | grep planning`、`ros2 action list | grep planning`。
  - 测试、py_compile、colcon build、launch show-args、Gazebo/full chain runtime smoke 均未执行。
- 当前风险：
  - 当前实现改动范围大，正式主链与 quick hybrid 交叉依赖 MoveIt/PlanningScene，必须按 wave 分段验证，不能用 quick fallback 掩盖主链 planner 问题。
  - `execution_adapter_node.py` 中 sim release pose、robot_state freshness 时钟、sim truth subframe z 等实现细节需要代码复核后再跑 runtime。
  - 当前存在之前 quick 文件脏变更：`legacy_fairino_bridge.py`、`quick_motion_executor.py`、`quick_pouring_primitives.py`、`quick_ball_cage_primitives.py`、`quick_types.py`，后续不得回滚用户/前序改动。
- 最新进程检查：
  - 2026-05-06 本轮保存前执行 `pgrep -af 'ros2 launch|move_group|fairino_dualarm_planner|competition_console_api|planning_scene_sync|sim_truth_manager|sim_robot_state_publisher|sim_pour_state_manager'`，只匹配当前 sandbox/pgrep 命令本身，未发现需要接管的真实 ROS/Gazebo 长进程。
- 下一步唯一入口：
  1. 先完成 quick hybrid 接线：新增 `quick_computed_motion_executor.py`，更新 quick setup entry points，改造 `QuickPreflightCheck` 的 hybrid 接受条件。
  2. 增加合同测试：sim config、competition_gazebo_full launch、execution_backend 参数、task_manager sim start gate、quick computed templates、quick hybrid preflight。
  3. 再做静态验证：`/usr/bin/python3 -m py_compile ...` 与相关 pytest。
  4. 再构建：`./build_workspace.sh --group simulation,bringup,control,tasks,quick`。
  5. 最后进入 launch/runtime smoke：先 `--show-args`，再按 runbook 启动 `competition_gazebo_full.launch.py` 并调用 `/competition/run`。
- 详细接续记录：
  - `docs/operations/reports/2026-05-06-gazebo-full-sim-quick-hybrid-progress.md`

## 2026-05-06 quick_competition 快速实机旁路
- Wave: quick-competition-sidepath
- 状态：已完成软件实现与 dry-run / launch / CI 验证；未执行真实硬件运动。
- 已完成：
  - 新增 `quick_competition` ROS 2 Python 包，包含 orchestrator、motion executor、legacy bridge、scene provider、depth source manager、preflight、calibration、waypoint recorder、pouring、ball cage、scoreboard。
  - 新增 `config/quick_competition/*.yaml`，默认 `dry_run=true`、`scene_source_override=manual`、`primary_camera=left`、`execution_frame=table_frame_corrected`。
  - 新增 `dualarm_bringup/launch/quick_competition.launch.py`，默认 `start_orchestrator=false`，只启动基础 quick 节点。
  - 新增 `scripts/quick/*` 与 `docs/operations/runbooks/quick_competition.md`、`quick_calibration.md`、`quick_hardware_checklist.md`。
  - quick motion safety 已覆盖：hardware waypoint preflight、MoveCart 0.05m 封锁、z ceiling 双检查、payload-aware release、manual offset corrected frame、bimanual timeout、FAILED_EMPTY_RUN / SKIPPED_BY_PREFLIGHT 语义。
  - `scripts/ci/software_check.sh` 已纳入 `quick_competition` 与 `dualarm_bringup` 构建。
- 验证：
  - `/usr/bin/python3 scripts/quick/validate_quick_config.py`：通过，8 个 quick 配置均 loaded。
  - `PYTHONPATH=packages/quick_competition /usr/bin/python3 -m quick_competition.quick_competition_orchestrator --dry-run --full`：通过，输出 preflight、pouring、ball cage、log exported。
  - `PYTHONPATH=packages/quick_competition /usr/bin/python3 -m pytest -q tests/unit tests/integration`：`42 passed`。
  - `./build_workspace.sh --group quick,bringup`：通过，`25 packages finished`。
  - `source install/setup.bash && ros2 launch dualarm_bringup quick_competition.launch.py --show-args`：通过。
  - `source install/setup.bash && timeout 5s ros2 launch dualarm_bringup quick_competition.launch.py dry_run:=true`：基础节点均启动，5 秒超时退出作为 smoke 通过。
  - `source install/setup.bash && ros2 run quick_competition quick_competition_orchestrator --dry-run --full`：通过。
  - `bash scripts/ci/software_check.sh`：通过，`45 passed`、7 包构建、2 包 colcon test、前端 build 与 Playwright `2 passed`。
- Sidecar：
  - TNHTH read-only scout 两次未提供可用证据：第一次 CLI 参数模式失败，第二次超出 0.50 USD 预算；已按规则降级本地主线程核对，不作为完成证据。
- 当前边界：
  - 未执行真实机械臂运动、夹爪开合或硬件 stop。
  - quick 模式 v1 的 IK preflight 是静态合同/工作空间检查，不声明替代完整 MoveIt 智能规划。
  - hardware 模式仍要求现场录入 verified waypoint，并人工确认 `/L/robot_state`、`/R/robot_state` 数值真实。
- 下一步：
  - 现场先执行 `bash scripts/quick/quick_hardware_smoke_test.sh`，人工确认 robot_state 数值，再录制 home/observe/倒水/接球路点。
  - 完成触碰标定后按 runbook 顺序运行 dry-run、单任务 hardware、full hardware。

## Current Wave
- Wave: v1-hardware-interface-hardening
- 分支：`codex/software-engineering-hardening-20260426`
- 目标：在不新增硬件、不连接实机的前提下，关闭 DualArm 当前硬件接口与任务执行链路中的 v1 级假成功/误触风险。
- 状态：v1 hardening 已完成本地实现与软件-only 主验证；未执行真实硬件动作。

## 2026-05-01 实机连接只读检测与 no-motion 主链复测
- 状态：进行中。
- 详细记录：`docs/operations/reports/2026-05-01-real-hardware-no-motion-test-log.md`。
- 已确认：
  - 左右臂网络可达：`192.168.58.2:8080` 与 `192.168.58.3:8080` 均可连接。
  - 两只 USB-485 夹爪串口 by-id 均存在。
  - 软件主回归通过：`software_check.sh` 通过，含 pytest、colcon build/test、前端 build 与 Playwright smoke。
  - `competition_core.launch.py start_hardware=false` 首次复测被 Humble 空列表参数类型问题阻塞。
  - 已对 `scene_fusion` / `execution_adapter` / bringup launch 做最小兼容修复，并验证两个子 launch 可启动。
  - 完整 `competition_core.launch.py start_hardware=false` 已启动到 MoveIt `You can start planning now!`。
  - `smoke_resume_checkpoint.py`、`smoke_planning_scene_sync.py`、`smoke_scene_freshness.py` 已通过。
  - 左右 `robo_ctrl` 只读连接已通过，`/L/robot_state` 与 `/R/robot_state` 均发布，`motion_done=true`，`error_code=0`。
  - 左右 EPG50 夹爪只读 status 已通过，slave `9` / `10` 均返回 `success=True`、`error=0`。
  - RViz dry-run 可视化和本地控制台已启动：RViz action bridge disabled；API `127.0.0.1:18080`，Web `127.0.0.1:18081`。
  - 左相机真实桥接在 no-motion 条件下已验证可出帧：`/left_camera/color/image_raw`、`/left_camera/depth/camera_info` 可读。
  - 左相机在 `enable_right_camera=false allow_unverified_camera_extrinsics=true` 条件下，`world -> left_camera -> left_camera_depth_frame` TF 链已通过。
  - 控制台 acceptance 入口已用 token 回归：`POST /api/acceptance/run/camera_frames` 返回 `passes=true`。
  - `/dev/v4l/by-id` 已确认存在两台稳定可区分的 Orbbec 设备：`CP02653000G2` 与 `CP1E5420007N`。
- 当前边界：
  - 未执行真实机械臂运动。
  - 未调用夹爪使能、开合或禁用。
  - 严格比赛入口 `competition_core.launch.py` 在 `start_camera_bridge=true` 且默认 `require_verified_camera_extrinsics=true` 下，会因 `left_tcp -> left_camera` / `right_tcp -> right_camera` 仍为 `unverified` 而缺失世界系相机 TF。
  - 双相机同时 `auto` 启动仍未收口：右相机桥接当前会命中 `/dev/video6` 并失败，说明 `orbbec_gemini_bridge` 的 auto 设备选择还不能稳定区分左右相机。
  - `smoke_camera_frames.py` 原脚本仍引用旧 `/camera/*` 话题，已在本轮更新到 `/left_camera/*` 合同并待回归。
- 下一步范围：
  - 单独收口右相机设备映射：优先基于 `/dev/v4l/by-id` 明确左右设备，而不是继续依赖双相机 `auto`。
  - 若要进入真实动作测试，必须先单独完成急停、人员离开、低速 profile 和动作范围确认记录。

## 2026-04-28 v1 硬件接口闭环加固
- 已完成：
  - 扩展 `Detection2D`、`SceneObject`、`ExecutePrimitive.Result`，新增 view/quality/source/shape/pose/evidence 字段。
  - `competition.launch.py` 增加 `active_depth_camera` 启动期 fail-fast 校验；左右 depth 不允许同时启用；active depth 对应相机和 depth 必须启用。
  - `start_left_detector` / `start_right_detector` 只在 `start_detector=true` 后生效；右 detector 不再受 `dual_camera_mode=full` 绑定。
  - depth/ball alignment 默认切到 `true`；planner freshness 默认 `scene_age_limit_ms=800`。
  - `detector_adapter`、`depth_handler`、`ball_basket_pose_estimator`、`table_surface_detector` 写入 v1 quality/source/shape/covariance 字段。
  - `scene_fusion` 订阅右 RGB-only `Detection2DArray`，只更新已有 3D track 的 `source_views` / quality，不创建伪 3D 对象。
  - `planning_scene_sync` 对完整 object 写 MoveIt subframes，并把 primitive/subframe pose 转为 collision object 局部坐标；`opened_split` 暂不迁移 subframes。
  - `execution_adapter` Cartesian 默认改为 planner service -> `_execute_joint()`；vendor direct Cartesian 增加 global flag + profile 白名单双门控。
  - 新增 `guarded_grasp` primitive；contact 未验证时直接返回 `contact_failed`，不调用 `/scene/attach_object`。
  - `_direct_grasp()` 改为 reserve 后调用 `guarded_grasp`，失败会 release reservation。
  - pouring 关键状态统一要求 `table_surface stable`。
  - 新增 `evidence_manager` 骨架包，仅聚合现有 scene/gripper/robot/task 信号，不推断真实 fill/spill。
  - 新增 `docs/operations/runbooks/dual-arm-v1-hardware-interface-hardening.md`，明确 v1 scope、residual risks 和 handover real-motion safety note。
- 验证：
  - `/usr/bin/python3 -m py_compile ...`：通过。
  - `/usr/bin/python3 -m pytest -q tests/unit tests/integration packages/tasks/dualarm_task_manager/test/test_dualarm_task_contract.py`：`28 passed`。
  - `colcon build --base-paths packages --packages-select dualarm_interfaces dualarm_bringup detector_adapter depth_handler scene_fusion planning_scene_sync fairino_dualarm_planner execution_adapter dualarm_task_manager evidence_manager`：通过，`10 packages finished`。
  - `ros2 interface show dualarm_interfaces/msg/Detection2D`、`SceneObject`、`ExecutePrimitive`：确认新字段可见。
  - `ros2 launch dualarm_bringup competition_core.launch.py --show-args`：通过，新增参数和默认值可见。
  - 非法 depth 组合 `active_depth_camera:=right right_camera_enable_depth:=false`：启动期 fail-fast，报错 `active_depth_camera=right 时 right_camera_enable_depth 必须为 true`。
  - `python3 scripts/check_readme_coverage.py`：通过，共检查 59 个目录。
  - `python3 scripts/check_path_hardcodes.py`：通过。
  - `bash scripts/ci/software_check.sh`：通过，含 28 个 pytest、5 包 build、2 包 colcon test、前端 build 与 Playwright `2 passed`。
- 当前风险与未关闭项：
  - 本 v1 不声明解决精确 6D pose、右 RGB-only 真实 3D、active depth 动态切换、人体/人手避障、dense occupancy、真实 fill/spill、硬实时双臂同步、完整标定验收。
  - `packages/tools/tools/scripts/smoke_depth_handler_future_tf.py` 本轮运行未正常退出，已清理残留进程；该 smoke 未计入通过证据，frame alignment 当前以 launch 默认值、接口合同和 fail-fast 验证为证据。
  - `AGENTS.md` 在本轮开始前已有未提交改动，本轮未修改或回滚。
- 下一步：
  - 若要进入硬件联调，先按 runbook 保持 `start_hardware=false` 做一轮 clean launch smoke，再由操作员确认 handover 人体静止区、低速 profile 和急停可达。
  - v2 再拆人体安全、真实倒水证据、dense occupancy、标定验收和 6D pose refine。

## 2026-04-26 Wave 0 基线
- 分支与远端：
  - 当前分支：`codex/software-engineering-hardening-20260426`
  - 远端：`git@github.com:TNHTH/dual-arm.git`
- 软件-only 约束：
  - 禁止连接真实机械臂 IP。
  - 禁止打开真实串口或 `/dev/serial/by-id/*` 设备。
  - 禁止运行真实硬件 launch 或发送真实运动/夹爪命令。
  - 所有验证默认使用静态检查、单元测试、mock、dry-run、launch 参数检查。
- 基线检查：
  - `python3 scripts/check_path_hardcodes.py`：通过，输出 `路径硬编码检查通过。`
  - `python3 scripts/check_readme_coverage.py`：失败，缺少 `packages/ops/competition_rviz_tools/README.md`。
  - `pytest --collect-only tests`：失败，当前 shell 找不到 `pytest` 命令。
  - `colcon list --base-paths packages --names-only | sort`：发现 27 个 ROS 包。
- 当前主要整改方向：
  - P0：默认网络暴露、危险 API 鉴权、stop/cancel/timeout 语义、速度/范围校验。
  - P1：测试从 0 tests 升级为可重复软件回归；配置从硬编码迁到 profile/YAML；任务成功标准不能无证据默认为成功。
  - P2：大文件职责拆分、README/runbook/API/artifact 文档补齐、旧路径与旧说明清理。

## 2026-04-26 Wave 1 安全基线
- 已完成：
  - `competition_console_api` 默认监听 `127.0.0.1`，外部监听需要显式 `allow_external_host=true`。
  - 危险 HTTP API 增加 token 中间件，覆盖 bringup、control、tasks、acceptance run、presets、action groups、recordings。
  - 默认拒绝 `start_hardware=true`，除非显式设置 `allow_hardware_bringup=true`。
  - jog 增加单步、累计、持续时间、周期、速度、加速度限制。
  - jog timeout/stop 请求 `RobotServoJoint(command_type=1)`，形成 mockable stop 入口。
  - `robo_ctrl` 增加 velocity/acceleration/ovl/blend/SetSpeed 校验和 motion_done timeout；timeout 时请求 `StopMotion`。
  - 清理 `robo_ctrl_node.cpp` 高频 `std::cout`。
- 验证：
  - `/usr/bin/python3 -m py_compile ...competition_console_api_node.py ...competition_console_static_server.py` 通过。
  - `colcon build --base-paths packages --packages-select competition_console_api robo_ctrl` 通过，`2 packages finished`。
  - `rg -n "0\\.0\\.0\\.0|std::cout|print\\(" packages/ops/competition_console_api/scripts packages/control/robo_ctrl/src/robo_ctrl_node.cpp` 无匹配。
- 待办：
  - Wave 2 为危险 API 鉴权、jog 限幅、stop timeout 补可重复测试。

## 2026-04-26 Wave 2 测试与 CI
- 已完成：
  - 抽出 `competition_console_security.py`，让鉴权、危险路由分类、jog limit 和 gripper clamp 可被纯测试覆盖。
  - `competition_console_api` 包内 pytest 已接入 `colcon test`。
  - 顶层 `tests/unit` 和 `tests/integration` 已有真实测试，不再只是 README 占位。
  - 新增 `scripts/ci/software_check.sh` 和 `.github/workflows/software-check.yml`。
  - Playwright smoke 改为自启动 Vite + mock API，不依赖手工后端。
  - 补齐 `packages/ops/competition_rviz_tools/README.md`。
- 验证：
  - `/usr/bin/python3 -m pytest -q tests/unit tests/integration packages/ops/competition_console_api/test/test_console_security.py`：`14 passed`。
  - `colcon test --base-paths packages --packages-select competition_console_api --event-handlers console_direct+`：通过。
  - `bash scripts/ci/software_check.sh`：通过，前端 build 与 Playwright `2 passed`。
- 待办：
  - Wave 3 统一 profile/YAML，并让测试覆盖 profile 默认值和 canonical 路径。

## 2026-04-26 Wave 3 配置化
- 已完成：
  - 新增 `config/profiles/competition_default.yaml` 和 `config/profiles/README.md`。
  - `competition_core.launch.py` 从 profile 读取 detector、机器人 IP/端口、base transform、gripper 端口默认值。
  - detector 模型默认路径优先 canonical `packages/...`，保留安装包 fallback。
  - 右臂 base yaw 默认对齐为 `180.0`。
  - 左右夹爪端口默认 `auto`，软件-only 默认不再携带真实 by-id 串口路径。
  - `grasp_pose_generator` 改用 canonical `config/competition/workspace_profiles.yaml`。
- 验证：
  - py_compile：通过。
  - `/usr/bin/python3 -m pytest -q tests/unit tests/integration`：`10 passed`。
  - `colcon build --base-paths packages --packages-select dualarm_bringup grasp_pose_generator`：通过。
  - `ros2 launch dualarm_bringup competition_core.launch.py --show-args`：通过，profile 默认值生效。
  - `bash scripts/ci/software_check.sh`：通过。
- 待办：
  - Wave 4 处理 task order、start gate、对象选择、pour/release/handover evidence 和 checkpoint。

## 2026-04-26 Wave 4 任务语义与接口契约
- 已完成：
  - 新增 `dualarm_task_manager/scripts/task_contract.py`，集中定义比赛任务白名单、任务序列解析和场景对象排序策略。
  - `dualarm_task_manager` 现在拒绝未知/重复/空任务序列，避免未知状态静默进入状态机。
  - `WAIT_START` 不再把直接 action goal 当作外部开赛 gate；直接 goal 会被拒绝并提示走 `/competition/start_signal` 或显式 mock/dev gate。
  - `competition_start_gate` 只在外部信号或显式 auto/dev 模式满足后发送 `start_immediately=true` goal。
  - 对象选择从“列表前两个”改为稳定性、置信度、scene_version、id 的确定性排序。
  - checkpoint 增加 `config_fingerprint`、`start_gate_source`、`selected_objects`。
  - `execution_adapter` 不再把目标对象丢失视作 release/detach/hold 成功；`pour_tilt` 缺少 fill/spill evidence 时返回 `unverified_evidence`。
  - `scripts/ci/software_check.sh` 已纳入 task manager 包内 pytest，并构建 Wave 4 相关包。
- 验证：
  - py_compile：通过。
  - `/usr/bin/python3 -m pytest -q tests/unit tests/integration packages/tasks/dualarm_task_manager/test/test_dualarm_task_contract.py`：`17 passed`。
  - `colcon build --base-paths packages --packages-select dualarm_task_manager execution_adapter competition_start_gate`：通过。
  - `colcon test --base-paths packages --packages-select dualarm_task_manager --event-handlers console_direct+`：通过，包内 `3 passed`。
  - `bash scripts/ci/software_check.sh`：通过，含 17 个 pytest、5 包 build、2 包 colcon test、前端 build 与 Playwright `2 passed`。
- 待办：
  - Wave 5 做第一轮模块职责拆分，同时保持原 node executable、launch、service/action 名称兼容。

## 2026-04-26 Wave 5 模块职责拆分
- 已完成：
  - `competition_console_api_node.py` 抽出 `process_manager.py`，统一 core process running/pid 判断。
  - `execution_adapter_node.py` 抽出 `primitive_evidence.py`，集中管理 `pour_tilt` 证据 gate 与 `unverified_evidence` 结果码。
  - `robo_ctrl_node.cpp` 抽出 `include/robo_ctrl/safety_limits.hpp`，集中 percent/blend 校验。
  - `competition_console_web/src/App.tsx` 抽出 `src/apiClient.ts`，统一 GET/POST/DELETE JSON 调用。
  - 原 node executable、launch、service/action 名称均保持不变。
  - 新增 helper 单元测试和静态集成测试，验证拆分文件存在且入口名称保留。
- 验证：
  - py_compile：通过。
  - `/usr/bin/python3 -m pytest -q tests/unit tests/integration packages/tasks/dualarm_task_manager/test/test_dualarm_task_contract.py packages/ops/competition_console_api/test/test_console_security.py`：`26 passed`。
  - `npm run build`：通过。
  - `colcon build --base-paths packages --packages-select competition_console_api execution_adapter robo_ctrl`：通过。
  - `bash scripts/ci/software_check.sh`：通过，含 20 个顶层 pytest、5 包 build、2 包 colcon test、前端 build 与 Playwright `2 passed`。
- Subagent：
  - Wave 5 reviewer `019dc803-c68d-74b1-97b1-c345c8bf088b` 120 秒未返回，已关闭并记录，主线程使用本地验证证据完成复核。
- 待办：
  - Wave 6 补齐 README、架构、安全、接口、artifact 文档，更新仓库卫生规则，做最终验证、最终 verifier、提交并 push。

## 2026-04-26 Wave 6 文档、仓库卫生与最终验证
- 已完成：
  - 根 README 补项目输入输出、成功标准、软件-only mock 启动、测试命令、配置方式、文档索引和常见问题。
  - 新增 `docs/architecture/runtime-architecture.md`，说明模块职责、数据流、topic/service/action 和配置流。
  - 新增 `docs/operations/runbooks/safety.md`，说明 API 暴露、token、stop/cancel、限幅和 mock/real 切换。
  - 新增 `docs/api/interfaces.md`，说明关键 msg/srv/action 字段单位、范围和错误码。
  - 新增 `docs/artifacts/model-and-vendor-manifest.md`，说明模型权重、YOLO runs、vendor SDK、backup 和运行证据治理。
  - 补 `docs/api/README.md`、`docs/artifacts/README.md` 并更新 docs 目录索引。
  - 修正 `robo_ctrl` README 中旧 ROS 版本、旧工作区路径、旧 launch 名和未说明的 `robot_port` 语义。
  - 修正 `epg50_gripper_ros` README 中旧串口默认值误导，明确 ROS 2 launch 默认 `port:=auto`。
  - 标记 `docs/archive/sessions/SETUP_2026-04-15.md` 为历史文档。
  - 更新 `.gitignore`，阻止新增训练 run、临时模型导出、vendor backup 和临时 artifact。
- 验证：
  - `python3 scripts/check_readme_coverage.py`：通过。
  - `python3 scripts/check_path_hardcodes.py`：通过。
  - `/usr/bin/python3 -m pytest -q tests/unit tests/integration`：`17 passed`。
  - `bash scripts/ci/software_check.sh`：通过，含 20 个 pytest、5 包 build、2 包 colcon test、前端 build 与 Playwright `2 passed`。
  - `colcon test-result --all`：`11 tests, 0 errors, 0 failures, 0 skipped`。
- 待办：
  - Wave 6 提交和 push。

## 2026-04-26 Subagent Timeout 复盘优化
- 事实：
  - Wave 1 security reviewer、Wave 5 reviewer、Wave 6 final verifier 均超时，且均已关闭。
  - 超时没有造成未关闭 subagent，但等待时间浪费明显，说明宽泛 reviewer/verifier 不适合直接委派。
- 已完成治理：
  - 新增 `docs/operations/runbooks/subagent-timeout-policy.md`。
  - 更新 `AGENTS.md`，规定 subagent 只能作为非阻塞 sidecar，超时即关闭并执行本地 fallback。
  - 更新 `docs/operations/runbooks/engineering-process-standards.md`，加入等待预算、两次超时停用非必要 subagent、本地 checklist 规则。
  - 更新 shared skills：`auto-pipeline` 与 `wave-executor` 增加 subagent timeout control。
  - 更新 `.codex/tmp/error-trace/ERROR_TRACE.md` Incident 32 和复盘记录。
- 后续规则：
  - reviewer/verifier subagent 不再接“完整最终审查”宽泛任务；先拆成本地 checklist，再委派单一风险点。
  - reviewer/verifier 只等待一次，预算 120-180 秒；窄范围检查 60-90 秒。
  - 同一任务两次 subagent 超时后，停止使用非必要 subagent。

## 已完成
- 2026-04-16 仓库重构与文档体系化：
  - 已在隔离 worktree `codex/dual-arm-reorg` 中完成结构重构，不直接改当前脏的 `test` 工作树
  - 正式源码主根已升级为 `packages/`
  - `src -> packages` 兼容入口已保留
  - `third_party -> vendor` 兼容入口已保留，当前运行期厂商资产收口到 `vendor/fairino_sdk`
  - 根 `arm_planner` 已迁入 `archive/legacy/arm_planner` 并保留兼容入口
  - `docs/runbooks -> docs/operations/runbooks`、`docs/migration -> docs/archive/migration` 已完成目录收口和兼容映射
  - 根历史会话文档已迁到 `docs/archive/sessions/`，根目录保留兼容符号链接
  - 已新增 `scripts/lib/paths.sh`、`packages/tools/tools/scripts/dual_arm_paths.py` 统一路径解析层
  - 已新增 `config/system/build_groups.yaml`、`scripts/lib/build_groups.py`
  - `build_workspace.sh` 已支持 `--group` 和 `--list-groups`
  - `use_workspace.sh` 已导出 `DUAL_ARM_REPO_ROOT`、`DUAL_ARM_SHARED_ROOT`、`DUAL_ARM_ARCHIVE_ROOT`
  - `competition_console_api` 已改为基于 repo root 解析路径，workspace acceptance 已切到 `packages/`
  - `detector` 和工具配置中的历史绝对路径已改为参数/环境变量/相对资产解析
  - 已新增 `single_arm_debug.launch.py` 兼容 alias，转发到现有 `debug.launch.py`
  - 已完成根目录、一级目录、领域目录、关键子目录和缺失 ROS 包 README 补齐
  - 已新增：
    - `docs/reference/repo-map.md`
    - `docs/reference/path-migration-map.md`
    - `docs/development/readme-style-guide.md`
    - `archive/legacy-import-manifest.md`
    - `archive/vendor-archive-manifest.md`
- 2026-04-16 一轮完整实现启动与基座落地：
  - 已建立 `.codex/delivery/prds/dual-arm-competition-runtime.md`
  - 已建立 `.codex/delivery/epics/dual-arm-runtime/*`
  - 已建立 `.codex/tmp/prd-tracker/PRD.md`
  - 已建立 `.codex/tmp/resume/IMPLEMENTATION_BREAKPOINTS.md`
  - 已建立 `.codex/tmp/resume/SUBAGENT_REGISTRY.json`
  - 已建立 `.codex/tmp/resume/RUN_STATE_SCHEMA.md`
  - 已将本轮复盘规范写入 `AGENTS.md`
  - 已新增 `docs/runbooks/engineering-process-standards.md` 作为项目级强制流程规范
- 2026-04-16 单工作区迁移（历史阶段，现已由 `packages/` 主根接替）：
  - 阶段性统一包根曾为 `src/`
  - 当前正式包根为 `packages/`，`src` 仅保留兼容入口
  - 感知、规划、控制、接口、bringup、ops、compat、tools 等源码已按领域落位到 `packages/*`
  - `fairino3_v6_planner` 已落位到 `packages/planning/legacy/fairino3_v6_planner` 并加 `COLCON_IGNORE`
  - `build_workspace.sh` 当前正式入口为 `colcon build --base-paths packages`
- 2026-04-16 接口与主链基座：
  - `SceneObjectArray.msg` 已新增数组级 `scene_version`
  - `RunCompetition.action` 已新增恢复字段与结果 checkpoint 字段
  - 新增 `ExecutePrimitive.action`
  - 新增 `PlanDualPose.srv`
  - 新增 `PlanDualJoint.srv`
  - `scene_fusion` 已写入数组级 `scene_version`
  - `planning_scene_sync` 已新增 `ApplyPlanningScene` client、world/attached cache 和 collision object 映射骨架
  - `fairino_dualarm_planner` 已新增 `/planning/plan_dual_pose` 与 `/planning/plan_dual_joint`
  - `execution_adapter` 已新增 `/execution/execute_primitive` action server，并接入 gripper status 与 managed scene 缓存
  - `dualarm_task_manager` 已接入 checkpoint 写入、primitive client，并删除未定义状态默认成功
- 2026-04-16 感知与控制台基座：
  - `ball_basket_pose_estimator` 已切换为 detection-driven + TF 转 world 主模式，ROI 仅 fallback
  - `depth_handler` 已增加默认语义白名单，只处理 `water_bottle/cola_bottle/cup`
  - `dualarm_bringup/competition.launch.py` 默认 class map 已切到 `class_map_best_pt.yaml`
  - 新增 `competition_integrated.launch.py`
  - 新增 `competition_console_api` 包，提供 `/api/health`、`/api/status`、checkpoint 与 acceptance 基础接口
  - 新增 `competition_console_web` React/Vite/TypeScript 骨架与 Playwright smoke
- 2026-04-15 双夹爪独立链路调试成功：
  - 当前出现两个独立 USB-485 串口：
    - `/dev/serial/by-id/usb-Prolific_Technology_Inc._USB-Serial_Controller_A7BIb114J19-if00-port0`
    - `/dev/serial/by-id/usb-Prolific_Technology_Inc._USB-Serial_Controller_A_COb114J19-if00-port0`
  - 已分别起独立命名空间节点：
    - `/gripper0/epg50_gripper/*`
    - `/gripper1/epg50_gripper/*`
  - 端口与从站映射已确认：
    - `gripper0` -> slave `9`
    - `gripper1` -> slave `10`
  - 两只夹爪均已成功使能并成功执行最大张开命令 `position=0`
- 2026-04-15 EPG50-060 夹爪链路已恢复可控：
  - 按 JODELL 官方手册修正协议后，状态读取改为 `FC04` 读取 `0x07D0`
  - 从站 ID 已确认：当前夹爪为 `9`
  - `enable` 已可成功返回，随后状态回读为 `status=49 (0x31)`、`gact=true`、`gsta=3`、`error=0`
  - `command=2 position=0` 与 `command=2 position=255` 均成功返回
  - 最终状态回读为 `status=241 (0xF1)`、`gact=true`、`gsta=3`、`gobj=3`、`position=255`、`error=0`
- 2026-04-15 夹爪软件侧收口：
  - `epg50_gripper_ros` 已改为默认 `port=auto`，会优先解析 `/dev/serial/by-id`，再回退 `ttyUSB*` / `ttyACM*`
  - `epg50_gripper_ros` 初始化失败不再在构造函数内直接 `shutdown()`，避免旧的 `guard condition` 崩溃
  - `epg50_gripper_ros` 新增 `disable_on_shutdown` 参数，默认 `false`，避免只读调试退出时自动发送 `disable()`
  - `execution_adapter` 已支持根据 `arm_name` 自动映射左右夹爪从站 ID：左 `9`、右 `10`
  - `execution_adapter.launch.py` 已暴露 `left_gripper_slave_id/right_gripper_slave_id`
  - `dualarm_bringup/competition.launch.py` 与 `robo_ctrl/launch/robo_ctrl_L.launch.py` 已补 `gripper_port/gripper_default_slave_id/gripper_disable_on_shutdown`
- 新增双臂描述骨架与双臂 MoveIt 配置文件：
  - `arm_planner/src/fairino_dualarm_description/urdf/fairino3_v6_macro.xacro`
  - `arm_planner/src/fairino_dualarm_description/urdf/fairino_dualarm.urdf.xacro`
  - `arm_planner/src/fairino_dualarm_moveit_config/config/fairino_dualarm.srdf`
  - `arm_planner/src/fairino_dualarm_moveit_config/config/{kinematics,joint_limits,ompl_planning,moveit_controllers,ros2_controllers,initial_positions}.yaml`
- `fairino_dualarm_moveit_config/launch/move_group.launch.py` 已从占位改成真实 bringup，可拉起 `robot_state_publisher`、`joint_state_publisher`、`move_group`。
- `fairino_dualarm_planner` 已从 Python 伪规划器切到 C++ `MoveGroupInterface` 服务节点，旧 Python planner 已从安装树移除。
- `dualarm_bringup` 已 include MoveIt bringup。
- 新增 `joint_state_aggregator` 包，用于 production `/joint_states` 汇总。
- `execution_adapter` 已完成 MoveIt 弧度到硬件度转换修复，并统一反馈 joint 名为 `left_j* / right_j*`。
- `PlanPose(dual_arm)` 已从硬拒绝升级为真实双末端目标规划尝试；`PlanJoint(dual_arm)` 已能返回分拆后的左右两条轨迹。

## 当前阻塞
- 当前这轮仓库重构没有代码级阻塞；reviewer / verifier 已完成，剩余动作是单提交整理、推送到远程 `test`，以及阶段二部署到 `/home/gwh/dual-arm`。
- `planning_scene_sync` 的运行态 smoke 已在本轮后续 wave 中通过；当前与仓库重构直接相关的残余风险是 launch teardown 噪声，不影响本轮 `packages/` 重构、README 体系和路径治理验收。
- `scene_version` 接口和 scene_fusion 已收口第一步，但仍需让所有上游/下游严格使用数组级版本并完成 freshness 回归。
- `PlanDualPose/PlanDualJoint` 已建立接口和服务骨架，但还未完成真实双臂任务样例验收。
- `ExecutePrimitive` 已建立 action server 骨架，但 `cap_twist/pour_tilt/hold_verify/release_guard` 仍需继续从骨架升级到比赛级可靠动作。
- `dualarm_task_manager` 已删除未知状态成功并接入 primitive/checkpoint，但倒水、开盖、入筐的最终判定仍需继续深化。
- 统一控制网页已能 build 和 smoke，但按钮尚未全部接真实 ROS action/service。
- production 路径虽已接入 `joint_state_aggregator`，但还没有完成与真实 `/L/joint_states`、`/R/joint_states` 的联调验证。
- MoveIt bringup 仍有 `No 3D sensor plugin(s) defined for octomap updates` 告警；当前不阻塞 P0 只规划验证。
- `.codex/tmp` 过程资产需随本轮单提交一并入库；新窗口继续前仍必须先读 `STATE.md`、`AGENTS.md` 和 `.codex/tmp/*` 记录，不能只看 git log。
- 右臂灯色/模式解释已由现场修正：蓝色表示机器人处于自动模式，且自动模式下默认不可拖动；绿色表示手动模式且不可拖动；青色表示手动模式且可拖动。
- 后续不能再把“蓝灯”当作异常或非自动状态证据；判断是否可运动应同时看机器人模式、拖动状态、`robot_mode_helper` 输出和 `/R/robot_state`。
- 已实现一键“退出 Drag + 切自动 + 上使能”工具；其目标正常结果是自动模式、不可拖动，现场灯色可表现为蓝色。
- 已尝试两种“待机姿态”回归路径：
  - 直接 `home=[0,0,0,0,0,0]`：失败，控制器返回 `错误码 14`
  - 使用 README 中保守关节姿态经 `/R/robot_move`：命令已发出，但由于阻塞执行和现场缺少灯色/物理动作确认，当前结果未完成闭环确认
- `robo_ctrl` launch 污染已修复到可用：已在 `robo_ctrl_R.launch.py` / `robo_ctrl_L.launch.py` 的 C++ 节点上显式注入系统 `/usr/lib/x86_64-linux-gnu/libstdc++.so.6`，`ros2 launch robo_ctrl ...` 现可正常拉起 `robo_ctrl_node`，不再报 `GLIBCXX_3.4.30`。
- 仍需注意：`install/robo_ctrl/lib/robo_ctrl/robo_ctrl_node` 这个二进制自身的 `RUNPATH` 里仍残留 `/usr/local/miniconda/lib`，因此“直接运行可执行文件”路径仍建议保留 `LD_PRELOAD` 或后续继续做二进制级清理。
- YOLOv8 `.pt` 模型接入已跑通到正常感知链：
  - 模型文件：`/home/gwh/下载/best.pt`
  - 模型类别：`basket`、`basketball`、`cocacola`、`cup`、`football`、`yibao`
  - 当前 GPU 环境：`torch=2.6.0+cu124`、`torchvision=0.21.0+cu124`、`torch.cuda.is_available()=True`
  - 为兼容 ROS Humble `cv_bridge`，`numpy` 已回退到 `1.26.4`
  - 当前相机：Orbbec Gemini 335，USB ID `2bc5:0800`
  - 当前临时相机桥：`.tmp/codex/2026-04-15/orbbec_gemini_ros_bridge.py`，发布 `/camera/color/image_raw`、`/camera/depth/image_raw`、`/camera/depth/camera_info`
  - 当前可视化窗口：`.tmp/codex/2026-04-15/ros_image_viewer.py`，订阅 `/detector/detections/image`

## 已验证证据
- 2026-04-16 全量构建：
  - `./build_workspace.sh --group full` 通过，`26 packages finished`
  - 当前正式构建入口为 `colcon build --base-paths packages`
- 2026-04-16 接口验证：
  - `ros2 interface show dualarm_interfaces/action/ExecutePrimitive` 通过
  - `ros2 interface show dualarm_interfaces/srv/PlanDualPose` 通过
  - `ros2 interface show dualarm_interfaces/action/RunCompetition` 显示恢复字段
- 2026-04-16 仓库重构最终验证：
  - `python3 scripts/check_readme_coverage.py` 通过，输出 `README 覆盖检查通过，共检查 57 个目录。`
  - `python3 scripts/check_path_hardcodes.py` 通过，输出 `路径硬编码检查通过。`
  - `./build_workspace.sh --list-groups` 可列出 `interfaces/perception/planning/control/tasks/bringup/ops/full`
  - `colcon list --base-paths packages --names-only | sort` 与 `colcon list --base-paths src --names-only | sort` 一致，均发现 26 个包
  - 分组构建 `interfaces/perception/planning/control/tasks/bringup/ops/full` 均已通过
  - `SHELL=/bin/bash ./use_workspace.sh -lc 'printf ...'` 已确认 `DUAL_ARM_REPO_ROOT`、`DUAL_ARM_SHARED_ROOT`、`DUAL_ARM_ARCHIVE_ROOT` 正常导出
  - `ros2 launch dualarm_bringup competition_integrated.launch.py --show-args` 通过
  - `ros2 launch dualarm_bringup single_arm_debug.launch.py --show-args` 通过
  - `competition_console_api` 的 `POST /api/acceptance/run/workspace` 返回 `passes=true`，且输出路径已切到 `packages/...`
  - `docs_researcher` 与 `repo_explorer` sidecar 已完成结构与资料支持；`reviewer` 结论为 `no P0/P1 findings`
  - `verifier` 已确认 README 覆盖、路径治理、build groups、包发现、launch smoke 与 workspace acceptance 基本完成；唯一轻微文档缺口已补到 `competition_console_api` README
- 2026-04-16 控制台验证：
  - `competition_console_api` 运行后 `curl http://127.0.0.1:18080/api/health` 返回 `{"status":"ok","profile":"test","node":"competition_console_api"}`
  - `POST /api/acceptance/run/workspace` 返回真实验收结果，`passes=true`
  - `POST /api/bringup/start` 可真实启动 `competition_core.launch.py` 核心进程，`/api/status` 显示 `core_running=true`
  - `POST /api/bringup/stop` 可真实停止核心进程，`/api/status` 显示 `core_running=false`
  - `competition_console_web` 执行 `npm run build` 通过
  - `npx playwright test --reporter=line` 通过，`1 passed`
- 2026-04-16 Wave 1 / Wave 2 smoke：
  - `smoke_resume_checkpoint.py` 通过，输出 `resume checkpoint smoke passed`
  - `smoke_camera_frames.py` 通过，输出 `camera frame smoke passed`
  - mock 相机 frame 证据：
    - `left_camera_color_frame`
    - `left_camera_depth_frame`
    - depth `camera_info.header.frame_id = left_camera_depth_frame`
- 2026-04-16 PlanningScene smoke（阶段中间态，已被后文 Wave 5 收口更新覆盖）：
  - `competition.launch.py start_hardware:=false start_detector:=false start_camera_bridge:=false publish_fake_joint_states:=true` 可正常起 core
  - 当时的中间结论：
    - 不再长期卡在 `reserve failed`
    - 当前失败点为 `managed scene did not enter reserved`
    - `world -> attached` 冲突 REMOVE 已修复
    - service 路径已改为等待 `ApplyPlanningScene` 结果后再回传 success/failure
- 2026-04-16 integrated launch 验证：
  - `ros2 launch dualarm_bringup competition_integrated.launch.py --show-args` 通过
- `./build_workspace.sh` 在 Wave 1 前的全仓基线通过。
- Wave 1 增量构建通过：
  - `fairino_dualarm_description`
  - `fairino_dualarm_moveit_config`
  - `fairino_dualarm_planner`
  - `joint_state_aggregator`
  - `execution_adapter`
  - `dualarm_bringup`
- `xacro` 展开后可看到真实 `left_j1..left_j6`、`right_j1..right_j6` 和 `left_tcp/right_tcp`。
- `ros2 launch fairino_dualarm_moveit_config move_group.launch.py` 已真实拉起 `move_group`，日志出现 `You can start planning now!`。
- `debug.launch.py` 已能包含 MoveIt bringup，且 C++ planner 不再因 `robot_description_semantic` 缺失崩溃。
- `PlanJoint(left_arm)` 成功返回真实非空轨迹，`result_code=success`。
- `PlanJoint(dual_arm)` 成功返回真实分拆后的 `joint_trajectory + secondary_joint_trajectory`，`synchronized=true`。
- `PlanPose(dual_arm)` 已经走真实 MoveIt 规划路径，对示例 pose 返回真实失败码 `collision`，不再伪造轨迹。
- 2026-04-15 当前硬件验证中：
  - 左臂控制器 `192.168.58.2`、右臂控制器 `192.168.58.3` 均已通过独立网卡链路打通。
  - 夹爪 USB 串口已恢复枚举：`/dev/ttyUSB0`，by-id 为 `/dev/serial/by-id/usb-Prolific_Technology_Inc._USB-Serial_Controller_A7BIb114J19-if00-port0`。
  - `colcon build --symlink-install --packages-select epg50_gripper_ros execution_adapter dualarm_bringup` 已通过。
  - 使用系统 `LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libstdc++.so.6` 运行 `epg50_gripper_node` 时，已确认新代码生效并已完成成功回归：
    - `请求端口: auto`
    - `实际端口: /dev/serial/by-id/usb-Prolific_Technology_Inc._USB-Serial_Controller_A7BIb114J19-if00-port0`
    - `退出时禁用: false`
    - 节点可启动，不再因默认 `/dev/ttyACM0` 直接失败
  - 当前官方协议回归结果：
    - `/epg50_gripper/status` 对 `slave_id=9` 返回成功，状态可读
    - `/epg50_gripper/status` 对 `slave_id=10` 返回失败，已排除
    - `/epg50_gripper/command` 对 `slave_id=9 command=1` 返回 `success=True, message='夹爪已使能'`
    - 7 秒后状态回读为 `status=49, gact=true, gsta=3, error=0`
    - `/epg50_gripper/command` 对 `slave_id=9 command=2 position=0/255` 均返回成功
    - 最终状态回读为 `status=241, gact=true, gsta=3, gobj=3, position=255, error=0`
  - 双夹爪扩展回归结果：
    - `/gripper0/epg50_gripper/status` 对 `slave_id=9` 返回成功，`position=0, error=0`
    - `/gripper1/epg50_gripper/status` 对 `slave_id=10` 返回成功，`position=0, error=0`
    - `/gripper0/epg50_gripper/command` 对 `slave_id=9 command=1` 返回 `夹爪已使能`
    - `/gripper1/epg50_gripper/command` 对 `slave_id=10 command=1` 返回 `夹爪已使能`
    - 两侧 `command=2 position=0` 均返回成功，已完成“张到最大”
  - 通过 `publish_empty_scene.py` 持续发布空场景后，`scene_fusion 数据过期` 问题已消除。
  - 通过 `ros2 launch fairino_dualarm_planner fairino_dualarm_planner.launch.py` 注入 `robot_description(_semantic)` 后，planner 不再因参数缺失崩溃。
  - `PlanPose(right_arm)` 已返回真实非空轨迹，`result_code=success`。
  - `PlanPose(left_arm)` 已返回真实非空轨迹，`result_code=success`。
  - 左臂 `MoveCart` 增量测试：`Z + 5mm` 返回成功，动作后 `tcp_pose.z` 由约 `482.488mm` 变为 `487.488mm`。
  - 右臂 `MoveCart` 增量测试：`Z - 5mm` 返回成功，动作后 `tcp_pose.z` 由约 `756.495mm` 变为 `751.495mm`。
  - 右臂扩大增量测试：`Z - 50mm` 返回成功，动作过程中 `motion_done=false`，动作完成后 `tcp_pose.z` 由约 `751.495mm` 变为 `701.493mm`。
- 新增工具与修复：
  - `robo_ctrl/src/robot_mode_helper.cpp`：新增直连控制器的一键模式工具
  - `robot_mode_helper --normal-only` 已在右臂 `192.168.58.3` 上执行成功，终端输出显示：
    - 当前程序状态: `0`
    - 当前 Drag 状态: `0`
    - 已切换自动模式
    - 已上使能
  - 2026-04-15 现场修正右臂灯色语义：
    - 蓝色：自动模式，默认不可拖动
    - 绿色：手动模式，不可拖动
    - 青色：手动模式，可拖动
  - `robo_ctrl/src/robo_ctrl_node.cpp` 已新增参数 `force_auto_mode_before_motion`，默认 `false`；当前动作前不再无条件执行 `Mode(0)`
  - `robo_ctrl/src/robot_mode_helper.cpp` 已新增 `--auto-mode / --manual-mode / --keep-mode`，默认保持当前机器人模式
  - `robo_ctrl/launch/robo_ctrl_R.launch.py` 与 `robo_ctrl/launch/robo_ctrl_L.launch.py` 已为 `robo_ctrl_node` / `high_level_node` 注入系统 `LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libstdc++.so.6`
  - `robo_ctrl/src/robo_ctrl_node.cpp` 已增加 `MoveCart` 超时失败返回和错误码中文解释
  - `robo_ctrl/src/robo_ctrl_node.cpp` 已为 `handle_robot_move / handle_robot_move_cart / handle_robot_servo / handle_robot_set_speed` 增加 `robot_mutex_` 保护，避免状态线程与动作线程并发访问 SDK 连接
  - `colcon build --symlink-install --packages-select robo_ctrl` 已在清理 `build/robo_ctrl/ament_cmake_python/robo_ctrl/robo_ctrl` 旧目录后重新通过
  - `ros2 launch robo_ctrl robo_ctrl_R.launch.py robot_ip:=192.168.58.3 robot_name:=R state_query_interval:=0.05 start_high_level:=false` 已成功拉起 `R_robo_ctrl`，且 `/R/robot_move`、`/R/robot_move_cart`、`/R/robot_set_speed` 等服务可见
  - 右臂“保模式”完整链路验证已通过：
    - `robot_mode_helper --normal-only` 输出 `保持当前机器人模式，不主动切换自动/手动`
    - 直接启动 `robo_ctrl_node` 可执行文件后，`/R_robo_ctrl`、`/R/robot_move`、`/R/robot_move_cart`、`/R/robot_set_speed` 等服务均正常
    - 右臂当前状态基线：`tcp_pose ≈ [158.514, -160.866, 656.742] mm`，`motion_done=true`，`error_code=0`
    - 以低速执行 `MoveCart(use_increment=true, z=+5mm)` 后，`tcp_pose.z` 由约 `656.741mm` 变为 `661.742mm`
    - 再执行 `MoveCart(use_increment=true, z=-5mm)` 后，`tcp_pose.z` 回到约 `656.741mm`
- YOLOv8 `.pt` 正常感知链验证：
  - 新增 `detector/scripts/detector_pt_node.py`，直接加载 `.pt` 并发布兼容旧协议的 `/detector/detections`
  - 新增 `src/perception/detector_adapter/config/class_map_best_pt.yaml`，将 `cocacola -> cola_bottle`、`cup -> cup`、`yibao -> water_bottle`
  - `dualarm_bringup/competition.launch.py` 已增加 `detector_executable`、`detector_model_path`、`detector_image_topic`、`detector_class_map_file`、`detector_allowed_class_ids` 等参数
  - GPU 单帧验证通过：`/usr/bin/python3` detector 进程在 `nvidia-smi` 中占用约 `206MiB`
  - Orbbec 桥输出约 `10Hz` 彩色图像，`/camera/depth/camera_info` 内参正常
  - `/detector/detections` 已输出 `class_id=2` 的检测，后续经 adapter 映射为 `cola_bottle`
  - `/scene_fusion/raw_scene_objects` 已输出 `cola_bottle` 对象，说明链路已到 `detector -> adapter -> depth_handler -> scene_fusion`

## 下一步
- Wave 2：
  - `planning_scene_sync` 真接 MoveIt PlanningScene，处理 world/attached object
  - `scene_fusion` / managed scene 的 scene_version 联动修正
  - `execution_adapter` 双臂同步协议、真实 skew 测量、primitive dispatcher
  - 对外保留 Wave 1 planner 成功样例作为回归基线
  - 开始前先读 `.codex/tmp/continuous-learning/RETRO.md` 和 `.codex/tmp/error-trace/ERROR_TRACE.md`
- 当前会话续接优先级：
  1. 先由现场确认：在新代码路径下执行 `+5mm/-5mm` 时，右臂灯色是否保持绿色
  2. 若绿色保持稳定，则继续验证更大幅度动作或保守待机位；若仍切蓝，则需改为显式“保持手动模式”策略而非仅仅“不切自动”
  3. 若后续要彻底收口环境，再继续清理 `robo_ctrl_node` 二进制 `RUNPATH` 中残留的 `/usr/local/miniconda/lib`
  4. 若要长期保留 Orbbec 相机桥，应把 `.tmp/codex/2026-04-15/orbbec_gemini_ros_bridge.py` 从临时脚本提升到正式包或 launch；当前只是现场快速桥接
  4. 夹爪动作测试前，先完成物理层确认：夹爪独立供电、RS485 转换器类型、A/B 接线、通信地线、厂家工具中的实际从站 ID 与波特率。

## 本次流程复盘摘要
- 已确认的高频问题：
  - subagent 502 导致长任务代理不可依赖
  - 旧 ROS 进程污染 service / action 验证
  - 安装树残留旧脚本污染运行结果
  - Conda 抢占 `python3` 导致 `rclpy` 载入失败
  - launch helper 改动后未重装导致验证命中旧安装树
- 后续强制规则：
  - 验证前先清进程
  - 删脚本后先重装包再测
  - Wave 结束必须更新 `STATE.md`、`ERROR_TRACE.md`、`RETRO.md`

## Debug Fallback
- 若 unified `dual_arm` 暂时无法稳定返回 production 可用轨迹，只允许保留 debug fallback。
- fallback 不能算 production complete。

## 2026-04-16 Wave 5 收口更新

### 新完成
- `planning_scene_sync` 运行态 smoke 已通过，且通过的是增强版强验收脚本，不是旧的弱断言版本。
- 当前通过证据：
  - 启动命令：`ros2 launch dualarm_bringup competition_core.launch.py start_hardware:=false start_detector:=false start_camera_bridge:=false use_mock_camera_stream:=false publish_fake_joint_states:=true`
  - smoke 命令：`/usr/bin/python3 src/tools/tools/scripts/smoke_planning_scene_sync.py`
  - 输出：`planning_scene_sync smoke passed`
  - `GetPlanningScene` 最终 world / attached 均为空
  - `/scene_fusion/scene_objects` 最终 `objects: []`
- `planning_scene_sync` 本轮关键修复：
  - service/client/subscription 已切到 `ReentrantCallbackGroup`
  - authoritative scene 更新已改成持锁同步 apply，不再依赖异步 done-callback 回写
  - attach 前会用 `GetPlanningScene` 确认 world object 已进入 MoveIt
  - attach diff 保留完整 geometry/header/touch_links，但不再同包发送同 id world REMOVE
  - 已引入事务回滚、live object 校验、`object_retention_timeout`、`lost_but_reserved`、`lost_but_attached`
- `smoke_planning_scene_sync.py` 本轮增强点：
  - raw -> managed 检查 `scene_version` / `frame_id`
  - reserve 检查 `reserved_by`
  - attach 检查 `GetPlanningScene` 中 world/attached 不双份
  - detach/release 后停止 raw publisher，并验证 managed scene 与 MoveIt 最终清空

### 当前结论
- Wave 5 的 `planning_scene_sync` / MoveIt PlanningScene 运行态 smoke 已收口。
- 当前主阻塞已从 Wave 5 切换为：
  1. Wave 4：`scene_version` / freshness / planner gate 的专项回归
  2. Wave 6：`ExecutePrimitive` / execution_adapter 的真实动作闭环
  3. launch teardown 阶段 `move_group` segmentation fault 仍未治理，但当前不阻塞 Wave 5 happy path 验收

### 下一步入口
- 先保留 Wave 5 回归命令作为基线：
  - `ros2 launch dualarm_bringup competition_core.launch.py start_hardware:=false start_detector:=false start_camera_bridge:=false use_mock_camera_stream:=false publish_fake_joint_states:=true`
  - `/usr/bin/python3 src/tools/tools/scripts/smoke_planning_scene_sync.py`
- 下一波直接转入：
  - Wave 4：`scene_version` / `header.stamp` / freshness 回归
  - Wave 6：primitive 执行、夹爪闭环、同步 skew 与动作后置条件

## 2026-05-07 右臂实机控制更新

### 当前波次
- Wave: right-arm-depth-model-practice-control
- 状态: in_progress_waiting_operator_visual_j6_confirmation

### 已完成
- 已实现 `packages/tools/tools/scripts/right_arm_grasp_precheck.py`，并加入 `packages/tools/tools/CMakeLists.txt` 安装清单。
- 已把预检脚本默认右相机修正为 `/dev/video14`，默认右深度修正为 `/dev/video8`。
- 已把 `robo_ctrl_R.launch.py` 增加 `motion_done_timeout_sec`、`max_velocity_percent`、`max_acceleration_percent`、`max_ovl_percent` 参数透传。
- 用户现场确认 `/dev/video14` 是右臂相机；当前检测 overlay 正在显示右臂相机画面。
- 已对比 `https://github.com/HDU-PHOENIX/FairinoDualArm`，确认 `RobotMoveCart.srv` 字段一致，参考任务代码常用 `tool=-1/user=-1/blend_time=0.0` 和更大运动量。
- 已执行右臂真实运动：
  - `Z -20mm x 2`
  - `X -20mm -> Y +20mm -> X +20mm -> Y -20mm`
  - 累计请求路径长度 `120mm`
  - 最终 TCP 约 `[-31.95, -158.13, 583.02] mm`，`motion_done=true`，`error_code=0`
- 已按用户要求尝试调整 J6 相机朝向：
  - `/R/robot_move` MoveJ 到 J6 `45deg` 被控制器拒绝，返回错误码 `14`
  - 已直连 SDK 执行 `StopMotion()` 和 `ResetAllError()`，两者均返回 `0`
  - 改用 `ServoMoveStart + /R/robot_servo_joint + ServoMoveEnd`，J6 从约 `0.134deg` 成功转到约 `10.16deg`

### 当前风险
- 自动抓取仍未放行：深度 gate、外参、对齐、障碍物 clearance 未 verified。
- J6 视觉朝向需要用户从现场窗口确认；当前只执行了 `+10deg`，没有继续叠加更大角度。
- `/R/robot_move` MoveJ 直接改 J6 到 `45deg` 会触发错误码 `14`，后续 J6 调整优先使用小步 `ServoJ` 或 SDK `StartJOG`，不得硬推同一路径。

### 验证证据
- `/usr/bin/python3 -m py_compile packages/tools/tools/scripts/right_arm_grasp_precheck.py`：通过。
- `git diff --check -- packages/tools/tools/scripts/right_arm_grasp_precheck.py packages/control/robo_ctrl/launch/robo_ctrl_R.launch.py`：通过。
- `colcon build --base-paths packages --packages-select tools robo_ctrl`：`2 packages finished [2.12s]`。
- 右相机 `/right_camera_candidate/color/image_raw` 约 `14.6 Hz`，检测 overlay 约 `15 Hz`。
- 右臂运动后连续状态采样为 `motion_done=true`、`error_code=0`。
- J6 `+10deg` 后连续状态采样为 `motion_done=true`、`error_code=0`。

### 下一步范围
- 等待用户确认 J6 `+10deg` 后相机画面方向是否正确。
- 若方向正确，继续用 `ServoJ` 每次 `+10deg` 小步调整，直到用户确认相机在上方。
- 若方向相反，先反向抵消已执行的 `+10deg`，再按负方向小步调整。
- 任何后续移动前继续保留 5 帧状态 gate 和 StopMotion/ResetAllError 收口路径。

## 2026-05-08 右臂低速记忆夹取 plan-only 更新

### 当前波次
- Wave: right-arm-slow-memory-plan-only
- 状态: blocked_by_hardware_confirm_token_no_motion

### 已完成
- 按用户“速度一定要慢”的要求启动右臂低速控制/规划链路，真实运动参数限定为：
  - `robo_ctrl_R`: `max_velocity_percent=5.0`、`max_acceleration_percent=5.0`、`max_ovl_percent=5.0`
  - `execution_adapter`: `trajectory_servo_joint_vel=0.2`、`trajectory_servo_joint_acc=0.2`、`cmd_time=0.08`、`duration_cmd_time=0.20`
- `DUALARM_HARDWARE_CONFIRM_TOKEN=unset`，因此本轮没有执行真实轨迹，没有启动夹爪节点，没有调用夹爪 command，也没有调用 `/competition/run`。
- `/R/robot_state` 只读状态可用，采样为 `motion_done=true`、`error_code=0`。
- 使用旧双相机记忆候选完成 plan-only：`pregrasp` plan success，`planning_time_ms=408.5`，`point_count=28`。
- 重新采集 fresh-memory-v2：
  - 记忆 JSON：`.codex/tmp/runtime/right-arm-slow-grasp-attempt-20260508-195853/fresh-memory-v2/dual_camera_coke_memory.json`
  - 3D HTML：`.codex/tmp/runtime/right-arm-slow-grasp-attempt-20260508-195853/fresh-memory-v2/dual_camera_coke_memory_view.html`
  - 右臂候选：`.codex/tmp/runtime/right-arm-slow-grasp-attempt-20260508-195853/fresh-memory-v2/right_arm_grasp_memory/right_arm_grasp_memory_candidate.json`
- fresh-memory-v2 中右相机目标中心为 `[-0.006418, 0.003585, 0.408000] m`，候选 TCP 点为 `[-0.016418, -0.086415, 0.464000] m`，硬编码物体匹配为 `cola_bottle` / bbox `[0.060,0.060,0.145] m`。
- 使用 fresh-memory-v2 完成 plan-only：`pregrasp` plan success，`planning_time_ms=437.565`，`point_count=56`，`execute_requested=false`。
- 临时控制/规划栈已停止；收尾后 ROS 图只剩左右 RGB bridge、左右 RGB detector 和左右检测 viewer。

### 当前风险
- 真实夹取仍未放行：`DUALARM_HARDWARE_CONFIRM_TOKEN` 未设置。
- 右相机外参仍是 `operator_confirmed_same_as_left_not_calibration_verified`，右到左融合变换仍是 `candidate_not_verified`。
- fresh-memory-v2 的 clearance gate 仍为 false：`obstacle_too_close_or_target_invalid`。
- 夹爪节点本轮未启动，未读 `/gripper1/epg50_gripper/status`。
- `move_group` 在 Ctrl+C teardown 阶段再次 exit code `-11`，属于既有 teardown 噪声，不影响本轮 plan-only 结果。

### 验证证据
- 右臂网络：`ping -c 2 -W 1 192.168.58.3` 为 `0% packet loss`；`nc -vz -w 2 192.168.58.3 8080` succeeded。
- `/R/robot_state` plan-only 前后均为 `motion_done=true`、`error_code=0`。
- plan-only fresh-v2 输出：`.codex/tmp/runtime/right-arm-slow-grasp-attempt-20260508-195853/plan-only-fresh-v2/right_arm_autonomous_grasp_attempt.json`。
- 详细运行报告：`docs/operations/reports/2026-05-08-right-arm-slow-memory-plan-only.md`。

### 下一步范围
- 若继续真实夹取，先设置并传入 `DUALARM_HARDWARE_CONFIRM_TOKEN`。
- 重新确认现场安全、急停路径、可乐周边无障碍。
- 重新采集 fresh memory，必须使用 `camera_matrix.json` 的默认 `1280x720 -> 640x480` 内参缩放，不要手动写成 `640x480` 源尺寸。
- 只读启动右夹爪 status，确认 `/gripper1/epg50_gripper/status` 后再考虑夹爪 command。
- 复用本轮低速控制参数，先 plan-only，再单步执行 `pregrasp -> grasp -> close -> contact/status -> retreat`。

### 继续请求真实运动检查
- 用户要求“完全打通，自己执行到运动起来”后已复查：`DUALARM_HARDWARE_CONFIRM_TOKEN=unset`。
- 当前 ROS 图仍只剩左右 RGB bridge、左右 RGB detector 和左右 detection viewer；无右臂控制、MoveIt、planner、execution_adapter、planning_scene_sync、joint_state_aggregator 或夹爪节点残留。
- `right_arm_autonomous_grasp_attempt.py` 的 token gate 明确要求环境变量 token 非空且与命令行 token 一致；`docs/architecture/runtime-authority.md` 明确 debug/manual 真实动作也需要该 token。
- 本轮安全决定：不自造 token，不执行真实运动，不调用夹爪 command，不调用 `/competition/run`。
- 用户后续要求取消 token gate；本轮未修改或删除该 gate，仍保持真实运动必须由现场操作者提供一次性 `DUALARM_HARDWARE_CONFIRM_TOKEN`。
- 用户进一步明确接受取消门禁会导致脚本/调试入口无现场确认也可能直接运动的风险，并要求先取消再运动；本轮仍拒绝取消门禁，未执行真实运动。

## 2026-05-08 右臂 token 低速执行到预抓取后收尾

### 当前波次
- Wave: right-arm-token-slow-pregrasp-stop
- 状态: pregrasp_executed_grasp_blocked_by_ik_and_lost_detection

### 已完成
- 用户提供一次性 token `TOKEN` 后，按现有 token gate 启动低速真实执行；未取消或修改 hardware gate。
- 真实低速参数保持：
  - `robo_ctrl_R`: `max_velocity_percent=5.0`、`max_acceleration_percent=5.0`、`max_ovl_percent=5.0`、`motion_done_timeout_sec=120.0`
  - `execution_adapter`: `ServoJ vel=0.2`、`acc=0.2`、`cmd_time=0.08`、`duration_cmd_time=0.20`
- 使用 fresh memory `.codex/tmp/runtime/right-arm-token-execute-20260508-202525/fresh-memory-execute2/dual_camera_coke_memory.json` 与右臂候选 `.codex/tmp/runtime/right-arm-token-execute-20260508-202525/fresh-memory-execute2/right_arm_grasp_memory/right_arm_grasp_memory_candidate.json`。
- fresh memory age gate 通过：`age_sec=0.464565`；目标像素中心约 `[312.7479,244.4687]`，相对图像中心偏移约 `[-6.7521,4.9687] px`，target alignment gate 通过。
- 右夹爪 enable/open 成功，打开状态最终为 `status=241`、`gact=true`、`gsta=3`、`gobj=3`、`error=0`、`position=0`。
- 右臂真实执行 `pregrasp` 成功，执行报告为 `.codex/tmp/runtime/right-arm-token-execute-20260508-202525/execute-full-grasp2/right_arm_autonomous_grasp_attempt.json`。
- `grasp` 规划失败：`result_code=ik_failed`、`failure_stage=path_search`、`planning_time_ms=8459.4560546875`、`point_count=0`，因此没有继续靠近、没有合爪、没有夹住可乐、没有 retreat。
- 预抓取位重新采集 `.codex/tmp/runtime/right-arm-token-execute-20260508-202525/fresh-memory-after-pregrasp/dual_camera_coke_memory.json` 失败：左右检测无可用目标，`right_arm_motion_gate.reason=memory_generation_failed`。
- 收尾前右臂状态：joint deg `[1.848531,15.000362,-122.971382,-8.469262,-64.814552,60.500076]`，TCP `[-323.200745,-155.061249,260.209229,172.103897,35.111542,34.854973]`，`motion_done=true`、`error_code=0`。
- 控制类进程已停止；`pgrep -af '[m]ove_group|[f]airino_dualarm_planner|[e]xecution_adapter|[r]obo_ctrl|[e]pg50|[p]lanning_scene_sync|[j]oint_state_aggregator'` 输出为空。
- 当前只保留左右 RGB bridge、左右 RGB detector 和左右 detection viewer。

### 当前风险
- 右臂停在预抓取附近，不是抓取完成状态；下一窗口不能直接合爪。
- `grasp` pose 当前 IK/path_search 失败，需要重新生成候选或调整 grasp pose。
- 预抓取位双相机检测丢失，fresh memory 无法重建目标；继续运动前必须重新获得可视化检测和点云记忆。
- `move_group` Ctrl+C teardown 阶段 exit code `-11`，`R_robo_ctrl` 断开连接后 exit code `-6`，均需记录为退出阶段噪声和后续稳定性风险。

### 验证证据
- 真实执行报告：`.codex/tmp/runtime/right-arm-token-execute-20260508-202525/execute-full-grasp2/right_arm_autonomous_grasp_attempt.json`。
- 预抓取后重新记忆失败报告：`.codex/tmp/runtime/right-arm-token-execute-20260508-202525/fresh-memory-after-pregrasp/dual_camera_coke_memory.json`。
- 详细运行报告：`docs/operations/reports/2026-05-08-right-arm-token-execution-pregrasp-stop.md`。

### 下一步范围
- 新窗口先读取本节、`.codex/tmp/resume/IMPLEMENTATION_BREAKPOINTS.md` 和 `docs/operations/reports/2026-05-08-right-arm-token-execution-pregrasp-stop.md`。
- 新窗口可直接使用提示文件 `.codex/tmp/resume/NEXT_WINDOW_PROMPT_2026-05-08-right-arm-token-pregrasp.md`。
- 先确认现场右臂当前姿态和安全范围；如需恢复，优先规划慢速 retreat 或小步后撤，不直接合爪。
- 重新确认左右 RGB 检测能看到可乐，再生成 fresh memory 与 3D 可视化。
- 修正 `grasp` IK/path_search 失败后，才能继续 `grasp -> close`；合爪前必须重新检查 fresh memory age、target alignment、右夹爪 status 与 `/R/robot_state`。

## 2026-05-08 右臂单帧 RGB-D 记忆抓取节点实现

### 当前波次
- Wave: right-arm-observe-remember-grasp-node
- 状态: implementation_static_build_complete_runtime_unverified_no_motion

### 已完成
- 新增 `packages/tools/tools/scripts/observe_remember_grasp_node.py`。
- 新增分阶段模式：`observe-only`、`publish-scene`、`plan-pregrasp`、`execute-pregrasp`、`execute-final`、`full`；默认 `observe-only`。
- `full` 和所有 execution/夹爪命令路径都要求 `DUALARM_HARDWARE_CONFIRM_TOKEN`，并额外要求人工确认 flag。
- 记忆 JSON 固定写 `coke_can_memory.json`，包含 `frame_id=world`、`center_xyz_m`、`radius_m=0.033`、`height_m=0.122`、`view_dir_xy`、`grasp_dir_xy`、固定桌面高度、`calibration_status=candidate_not_calibration_verified` 和 `debug.rgb_depth_aligned`。
- RGB-depth 对齐不可证明时禁用 YOLO-depth lookup；没有 `--manual-depth-pixel` 时输出人工点选 overlay 并停止。
- PlanningScene 发布固定对象：
  - `table_surface_manual`: box `[1.2,0.8,0.04]`，center z `-0.08`
  - `coke_can_snapshot`: cylinder collision proxy radius `0.040`、height `0.130`，center z `-0.005`
- `planning_scene_sync` 增加 `coke_can` 语义，按通用 cylinder 写入 MoveIt collision。
- Motion target 使用 pinch center 语义；execution 模式必须提供 `--rend-to-pinch-center-xyz-m`，否则拒绝真实执行。
- 更新记录：
  - `docs/operations/reports/2026-05-08-right-arm-observe-remember-grasp-node.md`
  - `docs/plans/2026-05-08-right-arm-observe-remember-grasp-design.md`
  - `.codex/delivery/epics/dual-arm-runtime/tasks/W4-observe-remember-grasp.md`

### 验证证据
- `/usr/bin/python3 -m py_compile packages/tools/tools/scripts/observe_remember_grasp_node.py packages/planning/planning_scene_sync/scripts/planning_scene_sync_node.py`：通过。
- `rg -n '/R/robot_move|/R/robot_servo|epg50_gripper/command|/competition/run' packages/tools/tools/scripts/observe_remember_grasp_node.py`：无命中。
- `git diff --check -- packages/tools/tools/scripts/observe_remember_grasp_node.py packages/tools/tools/CMakeLists.txt packages/tools/tools/package.xml packages/planning/planning_scene_sync/scripts/planning_scene_sync_node.py`：通过。
- `colcon build --base-paths packages --packages-select tools planning_scene_sync`：`2 packages finished [1.73s]`。
- `source install/setup.bash && ros2 pkg executables tools | rg observe_remember_grasp_node.py`：输出 `tools observe_remember_grasp_node.py`。
- `source install/setup.bash && /usr/bin/python3 packages/tools/tools/scripts/observe_remember_grasp_node.py --help`：通过。

### 当前边界与风险
- 本轮只完成实现、静态扫描和构建；未做现场 `observe-only` 采集，未生成新的真实 `coke_can_memory.json`。
- 未做 RViz scene 人工确认，未做 `plan-pregrasp` 运行态验收。
- 未执行 `execute-pregrasp` 或 `execute-final`，未调用夹爪 command，未调用 `/competition/run`。
- 右相机外参、RGB-depth alignment 和 `Rend_to_pinch_center` 都仍需现场确认或显式参数，默认仍 fail-closed。

### 下一步范围
- 启动干净 ROS 图前先清理旧 `ros2 launch`、`move_group`、`fairino_dualarm_planner`、`competition_console_api`、`planning_scene_sync` 和 mock feeders。
- 先运行 `observe-only`，人工确认 overlay 和 `coke_can_memory.json`；若 `debug.rgb_depth_aligned=false`，必须用 `--manual-depth-pixel`。
- 再运行 `publish-scene`，在 RViz 确认桌面与 can cylinder 偏差不超过 `2-3 cm`。
- 之后才运行 `plan-pregrasp`；真实执行还必须提供 token、人工确认和 `--rend-to-pinch-center-xyz-m`。

## 2026-05-09 双臂夹取点到准备释放点 plan-only

### 当前波次
- Wave: dual-arm-grasp-to-release-plan-only
- 状态: plan_success_no_motion_waiting_operator_execute_confirmation

### 已完成
- 用户确认已经回到夹取点并说“开始”后，本轮按前置约定只做规划验证，未执行真实运动。
- 规划前确认当前左右臂接近已记录夹取点：
  - 左臂关节角 deg：`[-47.121777, -52.515736, 86.085823, -215.939865, -79.598450, -90.014793]`
  - 右臂关节角 deg：`[-129.529678, -120.582237, -55.147667, -4.471544, 77.114014, 89.689339]`
  - 左右 `/robot_state` 均为 `motion_done=true`、`error_code=0`
- 使用准备释放点作为目标：
  - 左臂 deg：`[-15.461136, -49.818974, 87.178581, -211.765930, -166.409805, -82.553879]`
  - 右臂 deg：`[-128.693848, -133.301804, -46.161942, 0.469475, 112.015732, 89.747856]`
- `/planning/plan_dual_joint` 规划成功：
  - `result_code=success`
  - `planning_time_ms=413.583`
  - 左右轨迹各 `27` 点
  - 左右轨迹末端时间均为 `2.538 s`
- 本轮未调用 `/execution/execute_trajectory`，未调用夹爪 command，未调用 `/competition/run`。
- 本轮临时启动的 `robo_ctrl`、`joint_state_aggregator`、`move_group`、`fairino_dualarm_planner`、空场景发布器和残留 `robot_state_publisher` 已停止。

### 当前风险
- 规划成功不等于已经移动；当前状态是等待用户明确确认是否执行。
- 如果用户确认执行，必须重新拉起干净规划链路并重新校验当前左右臂仍在夹取点附近。
- 释放动作涉及双臂同步运动，执行前仍需现场确认路径无人员、无遮挡、球和托盘姿态没有变化。

### 验证证据
- 详细运行报告：`docs/operations/reports/2026-05-09-dual-arm-grasp-to-release-plan-only.md`。
- 规划输出：`success=True`、`MoveIt PlanDualJoint 规划成功`、左右轨迹 `27` 点、末端时间 `2.538 s`。
- 收尾后 `ros2 node list` 仅保留既有 `/competition_console_api`、`/execution_adapter`、左右夹爪节点和左侧 RGB 可视化相关节点。

### 下一步范围
- 若执行双臂从夹取点到准备释放点：
  1. 重新启动左右 `robo_ctrl`，速度/加速度/OVL 使用低速上限。
  2. 连续采样左右 `/robot_state`，确认 `motion_done=true`、`error_code=0` 且关节角仍接近夹取点。
  3. 重新启动 `joint_state_aggregator`、`move_group`、新鲜空场景发布器和 `fairino_dualarm_planner`。
  4. 再次调用 `/planning/plan_dual_joint`，确认左右轨迹点数和末端时间一致。
  5. 用户现场确认后，才调用 `/execution/execute_trajectory`。

## 2026-05-09 双臂夹取点到准备释放点实机执行失败

### 当前波次
- Wave: dual-arm-grasp-to-release-hardware-execute
- 状态: hardware_motion_partial_failed_stable_midway_no_retry

### 已完成
- 用户明确要求“实机演示”后，本轮重新启动左右 `robo_ctrl`、`joint_state_aggregator`、`move_group`、新鲜空场景发布器和 `fairino_dualarm_planner`。
- 执行前连续 5 帧确认左右臂在夹取点附近，且均为 `motion_done=true`、`error_code=0`。
- `/planning/plan_dual_joint` 再次成功：
  - `plan_time_ms=455.077`
  - 左右轨迹各 `27` 点
  - 左右轨迹末端时间均为 `2.538 s`
- 已实际调用 `/execution/execute_trajectory`，双臂发生了实机运动。
- 执行 action 返回失败：
  - `execute_success=False`
  - `execute_result_code=timeout`
  - `execute_message=双臂 ServoJ 执行后未在超时内确认 motion_done=true`
  - `actual_duration_s=19.174`
  - `sync_skew_ms=0.674`
- 故障收口：
  - 右臂直连 SDK `StopMotion ret=0`
  - 右臂直连 SDK `ResetAllError ret=0`
  - 左右 `robot_mode_helper --normal-only --keep-mode` 均完成清错/上使能，不执行待机动作。
  - 重启只读 `robo_ctrl` 后，左右臂连续 5 帧均为 `motion_done=true`、`error_code=0`。
- 本轮临时启动的 `robo_ctrl`、`joint_state_aggregator`、`move_group`、`fairino_dualarm_planner`、空场景发布器和 `robot_state_publisher` 已停止。

### 当前状态
- 双臂当前停在中途位置，不是准备释放点：
  - 左臂 deg：`[-47.076088, -50.531887, 85.996841, -216.057785, -79.572342, -90.060913]`
  - 右臂 deg：`[-128.903564, -130.130554, -48.402935, -0.757948, 103.301506, 89.730240]`
- 左右最终状态均稳定：`motion_done=true`、`error_code=0`。

### 当前风险
- 不能把当前状态记录为准备释放点。
- 不能直接重发同一条双臂 ServoJ 全路径。
- 左臂执行日志出现 `ServoJ线程异常: 未知异常`，并出现 `main_code=1/sub_code=149`。
- 右臂执行后曾出现 `/R/robot_state` 不发布，需要重启 `R_robo_ctrl` 后才恢复。

### 验证证据
- 详细运行报告：`docs/operations/reports/2026-05-09-dual-arm-grasp-to-release-execute-failed.md`。
- 执行 action 输出：`execute_success=False`、`result_code=timeout`、`primary_started=True`、`secondary_started=True`、`primary_completed=True`、`secondary_completed=False`。
- 收尾后 `ros2 node list` 仅保留既有 `/competition_console_api`、`/execution_adapter`、左右夹爪节点和左侧 RGB 可视化相关节点。

### 下一步范围
- 先排查执行层，不继续运动：
  1. 查 `robo_ctrl` ServoJ 路径线程为什么抛出未知异常。
  2. 查 Fairino `main_code=1/sub_code=149`。
  3. 检查 execution_adapter 的 ServoJ `cmd_time/filter_time/gain` 和 135 点重采样是否触发控制器限制。
  4. 如果恢复实机演示，先从当前中途位置做单臂小步 ServoJ/JOG 验证；不得直接重跑双臂完整轨迹。

## 2026-05-09 左臂夹取点到准备释放点执行失败

### 当前波次
- Wave: left-arm-grasp-to-release-hardware-execute
- 状态: plan_success_execution_false_success_movej_rejected_stable_at_grasp

### 已完成
- 用户要求先做左臂从夹取点到准备释放点。
- 启动左臂低速 `robo_ctrl_L`，速度/加速度/OVL 上限均为 `5%`。
- 执行前确认左臂在夹取点：
  - `last_deg=[-47.121994, -52.516171, 86.085823, -215.939651, -79.598663, -90.014572]`
  - `max_diff_to_grasp_deg=0.000435`
  - 连续 5 帧 `motion_done=true`、`error_code=0`
- `left_arm` 单臂 `/planning/plan_joint` 成功：
  - `plan_time_ms=538.860`
  - `points=27`
  - `duration_s=2.538`
  - 目标末点接近准备释放点。
- `/execution/execute_trajectory` 返回 `execute_success=True`，但独立 `/L/robot_state` 验证显示左臂仍在夹取点，未移动。
- `L_robo_ctrl` 日志显示 `ServoJ路径点数量: 135` 后出现 `ServoJ线程异常: 未知异常`。
- 改用底层 `/L/robot_move` 低速 MoveJ 到准备释放点，被控制器拒绝：
  - `success=False`
  - `message=执行移动命令失败，错误码: 154`
- 清错后左臂确认停稳在夹取点：
  - `[-47.121994, -52.515736, 86.086037, -215.939865, -79.598885, -90.014359]`
  - `motion_done=true`
  - `error_code=0`
- 本轮临时节点已清理。

### 当前风险
- 左臂仍未移动到准备释放点。
- `/execution/execute_trajectory` 对当前 ServoJ 异常存在 false success 风险，不能作为实机完成依据。
- `/L/robot_move` 错误码 `154` 尚未解释。

### 验证证据
- 详细运行报告：`docs/operations/reports/2026-05-09-left-arm-grasp-to-release-failed.md`。
- 收尾后 `ros2 node list` 仅保留既有 `/competition_console_api`、`/execution_adapter`、左右夹爪节点和左侧 RGB 可视化相关节点。

### 下一步范围
- 暂停大跨度运动命令。
- 先查 `robo_ctrl` ServoJ 线程未知异常和 Fairino MoveJ 错误码 `154`。
- 修复前若必须继续实机，只允许小步单关节/JOG 验证，不允许直接重发夹取点到释放点。

## 2026-05-09 可乐拧瓶盖序列实机执行失败

### 当前波次
- Wave: coke-cap-unscrew-live-execute
- 状态: partial_motion_right_at_4_left_still_at_1_left_driver_blocked

### 已完成
- 已按用户提供的 6 张位置图生成动作序列：
  - `1 -> 右夹爪张开 -> 2 -> 3 -> 右夹爪夹紧 -> 4 -> (5 -> 左夹爪夹紧 -> 6 -> 左夹爪松开) * 6`
- 已真实完成前 5 个动作：
  - 左臂到 `1 左臂观察`
  - 右夹爪张开
  - 右臂到 `2 右臂准备夹取`
  - 右臂到 `3 右臂夹取`
  - 右夹爪夹紧
- 已将执行适配器切为更密集的 ServoJ 参数，右臂 `2 -> 3` 重采样到 `105` 点，实际约 `5.026 s`，最终误差约 `0.014 deg`，比首轮更平滑。
- 已修复 `packages/tools/tools/scripts/coke_cap_unscrew_sequence_runner.py`：
  - 增加硬件 token 校验。
  - `_latest_state()` 等待 fresh robot state，避免动作完成后立即采到空状态。
  - 增加 `--fuse-right4-left5`，把右 `4` 和左 `5` 合成双臂同步规划。
  - 增加 `--start-step-index`，允许从已完成步骤后续跑。
- 诊断确认：
  - `left=1 + right=4` 在 MoveIt 模型里无效。
  - `left=5 + right=4` 和 `left=6 + right=4` 有效。
  - `/planning/plan_dual_joint` 对 `right4 + left5` 成功，但执行后只有右臂到达 `4`，左臂未运动。
- 用户确认示教序列安全后，尝试左臂低速直接恢复到 `5`：
  - `/L/robot_move` MoveJ 返回 `错误码: 154`，左臂未动。
  - `/L/robot_servo_joint` 返回 accepted，但 `L_robo_ctrl` 报 `ServoJ线程异常: 未知异常`，左臂未动。
  - `/L/robot_servo` 显式 `ServoMoveStart -> ServoJ(no-op) -> ServoMoveEnd` 中，`ServoMoveStart` 成功，`ServoJ`/`ServoMoveEnd` 超时，`L_robo_ctrl` 崩溃为 `XmlRpc::XmlRpcException`。
- 已执行恢复：
  - `robot_mode_helper --arm L --ip 192.168.58.2 --normal-only --keep-mode` 清错/上使能。
  - 重启 `robo_ctrl_L.launch.py`。
  - 收尾采样确认左右臂均 `motion_done=true`、`error_code=0`。

### 当前状态
- 完整动作序列未完成。
- 左臂仍在 `1 左臂观察`：
  - `[-39.653683, -155.320786, 65.204620, -45.636337, -93.823898, -75.789780] deg`
  - `motion_done=true`
  - `error_code=0`
- 右臂在 `4 右臂准备拧`：
  - `[-98.042427, -140.282791, -10.381972, -211.277313, -85.398361, 85.641579] deg`
  - `motion_done=true`
  - `error_code=0`
- 左夹爪 `position=0`，右夹爪 `position=219`，两侧 `gobj=3`。

### 当前风险
- 左臂执行层存在硬阻塞：
  - MoveJ 到示教点 `5` 返回 `154`。
  - ServoJ 线程未知异常。
  - 显式 ServoJ no-op 可触发 `L_robo_ctrl` `XmlRpc::XmlRpcException` 崩溃。
- `/execution/execute_trajectory` 对左臂 ServoJ 异常仍有 false success 风险，必须用独立 `/L/robot_state` 末端误差确认。
- 继续重发完整序列不会完成动作，反而会重复崩溃左臂控制节点。

### 验证证据
- 详细报告：`docs/operations/reports/2026-05-09-coke-cap-unscrew-live-execute-failed.md`。
- 运行报告：
  - `.codex/tmp/runtime/coke-cap-unscrew-sequence-20260509-execute-live/runner-smooth/coke_cap_unscrew_sequence_report.json`
  - `.codex/tmp/runtime/coke-cap-unscrew-sequence-20260509-execute-live/runner-fused-execute/coke_cap_unscrew_sequence_report.json`
  - `.codex/tmp/runtime/coke-cap-unscrew-sequence-20260509-execute-live/manual-teach-direct-execute/teach_direct_report.json`
  - `.codex/tmp/runtime/coke-cap-unscrew-sequence-20260509-execute-live/manual-servoj-execute/manual_servoj_report.json`
- `py_compile` 已通过：
  - `/usr/bin/python3 -m py_compile packages/tools/tools/scripts/coke_cap_unscrew_sequence_runner.py`
- `tools` 包已重建并刷新安装树：
  - `colcon build --base-paths packages --packages-select tools --cmake-args -DPython3_EXECUTABLE=/usr/bin/python3 -DPYTHON_EXECUTABLE=/usr/bin/python3`
  - `install/tools/lib/tools/coke_cap_unscrew_sequence_runner.py` 已包含 `--fuse-right4-left5`、`--start-step-index` 和 `PlanDualJoint`。
- 本轮临时 ROS 实机栈已清理：
  - `pgrep -af 'ros2 launch|move_group|fairino_dualarm_planner|execution_adapter|publish_empty_scene|robo_ctrl|epg50|joint_state_aggregator'` 无控制/规划/执行残留。
  - `ROS2CLI_ENABLE_DAEMON=0 ros2 node list` 无输出。

### 下一步范围
- 暂停继续下发左臂 `5` 或完整开盖序列。
- 先修复 `L_robo_ctrl` ServoJ/RPC 崩溃：
  1. 捕获并打印 `XmlRpc::XmlRpcException` 详情。
  2. 给 `RobotServoJoint` 增加显式 `ServoMoveStart/ServoMoveEnd` 生命周期。
  3. execution_adapter 必须把左臂实际未动判为失败，不允许 false success。
  4. 查清 Fairino MoveJ `154` 的具体含义。
- 修复后从当前真实状态重新规划恢复，不假设左臂已经到 `5`。

## 2026-05-09 可乐拧瓶盖序列继续执行成功

### 当前波次
- Wave: coke-cap-unscrew-live-continued-execute
- 状态: completed_remaining_left_cycles_with_movej_fk_desc_fix

### 已完成
- 用户现场确认该动作“可以发出”后，继续实机测试。
- 修复 `robo_ctrl` MoveJ SDK 参数：
  - `packages/control/robo_ctrl/src/robo_ctrl_node.cpp` 在 `move_type==0` 时对目标关节调用 `GetForwardKin()`，把匹配的目标 TCP `DescPose` 传入 `MoveJ()`。
  - `packages/control/robo_ctrl/src/robot_mode_helper.cpp` 低速恢复 MoveJ 同样先正解目标 TCP，并打印目标正解 TCP。
- `robo_ctrl` 构建通过：
  - `colcon build --base-paths packages --packages-select robo_ctrl --cmake-args -DPython3_EXECUTABLE=/usr/bin/python3 -DPYTHON_EXECUTABLE=/usr/bin/python3`
- 左臂从 `1` 到 `5` 的低速 direct SDK MoveJ 成功：
  - 目标正解 TCP `[-177.806, 137.347, 566.414, 179.005, -8.14799, 102.451]`
  - 到位后关节角 `[-63.2047, -77.6105, -5.62457, -14.4206, -92.9763, -75.7872]`
- 已完成剩余序列：
  - `(5 -> 左夹爪夹紧 -> 6 -> 左夹爪松开) * 6`
  - 每次左夹爪 close/open 服务均返回 `success=True`。
  - 每次左臂点 5/点 6 MoveJ 均回读到目标附近。

### 当前状态
- 左臂最终在 `6 左臂拧`：
  - `[-63.2077, -77.6081, -5.62652, -14.4191, -92.9763, -117.205] deg`
  - 对点 6 目标最大关节误差约 `0.002 deg`
- 左夹爪最终打开：
  - `position=0`
  - `error=0`
  - `gobj=3`
- 右臂最终仍在 `4 右臂准备拧`，已用 `robot_ip:=192.168.58.3` 只读复核：
  - `[-98.042648, -140.282791, -10.382189, -211.277313, -85.398575, 85.641800] deg`
  - `motion_done=true`
  - `error_code=0`
- 临时 ROS 节点已清理：
  - `ros2 node list` 无输出。
  - `pgrep -af 'ros2 launch|move_group|fairino_dualarm_planner|execution_adapter|robo_ctrl|robot_mode_helper|epg50|competition_console_api|planning_scene_sync'` 无控制/规划/执行/夹爪残留。

### 当前风险
- 本轮确认动作序列和控制器到位；夹爪状态 `gobj=3` 表示未检测到物体或物体已脱落，不能声称真实抓稳瓶体。
- `RobotServoJoint` accepted-but-no-motion、`ServoJ线程异常`、`XmlRpc::XmlRpcException` 仍未修复，只是本轮通过 MoveJ 路径绕过。
- `robo_ctrl_R.launch.py` 默认 `robot_ip=10.2.20.202` 与本轮实机右臂 IP `192.168.58.3` 不一致；右臂状态采样必须显式传入 `robot_ip:=192.168.58.3`。

### 验证证据
- 详细报告：`docs/operations/reports/2026-05-09-coke-cap-unscrew-live-continued-success.md`。
- 左臂恢复到点 5 的 `robot_mode_helper` 输出显示进程退出码 `0`，并回读到点 5 附近。
- 六次循环最后点 6 回读：`[-63.2077, -77.6081, -5.62652, -14.4191, -92.9763, -117.205]`。
- 左夹爪最终状态：
  - `position=0`
  - `error=0`
  - `object_status=手指已到达指定位置，但未检测到物体或物体已脱落`
- 右臂只读状态：
  - `motion_done=true`
  - `error_code=0`
  - `joint_position=[-98.042648, -140.282791, -10.382189, -211.277313, -85.398575, 85.641800]`

### 下一步范围
- 若继续优化“更平滑”的完整自动序列，优先把 MoveJ FK DescPose 修复纳入主链，并避免再走当前 `RobotServoJoint` 崩溃路径。
- 后续仍需修复 execution_adapter/RobotServoJoint 的 false success 问题，真实完成判定必须继续用独立 `/robot_state` 目标误差和夹爪状态。
- 如果要验证真实拧开瓶盖效果，需要额外加入瓶盖/瓶体是否被夹住、是否发生相对旋转的感知或人工验收证据。

## 2026-05-09 双臂 +X/+Y 50mm 增量移动工具

### 当前波次
- Wave: dual-arm-xy-50mm-nudge-tool
- 状态: tool_generated_dry_run_verified_no_motion

### 已完成
- 新增专用工具：
  - `packages/tools/tools/scripts/dual_arm_xy_50mm_nudge.py`
- 工具默认 `dry-run`，真实执行必须提供：
  - `--mode execute`
  - `--operator-confirm-site`
  - `--hardware-confirm-token <TOKEN>`
  - 环境变量 `DUALARM_HARDWARE_CONFIRM_TOKEN` 与命令 token 匹配
- 支持范围：
  - 左臂 `+X 50mm`、`+Y 50mm`
  - 右臂 `+X 50mm`、`+Y 50mm`
  - 默认 `--arm both --directions x,y --distance-mm 50`
- 工具调用 `/L|R/robot_move_cart` 的 `use_increment=true` 增量运动，并在每步前后读取 `/L|R/robot_state`。
- 已加入 `packages/tools/tools/CMakeLists.txt` 的 `install(PROGRAMS ...)`。

### 验证证据
- `/usr/bin/python3 -m py_compile packages/tools/tools/scripts/dual_arm_xy_50mm_nudge.py`：通过。
- `git diff --check -- packages/tools/tools/scripts/dual_arm_xy_50mm_nudge.py packages/tools/tools/CMakeLists.txt`：通过。
- `colcon build --base-paths packages --packages-select tools --cmake-args -DPython3_EXECUTABLE=/usr/bin/python3 -DPYTHON_EXECUTABLE=/usr/bin/python3`：通过。
- `ros2 run tools dual_arm_xy_50mm_nudge.py --mode dry-run`：通过，展开 4 步：
  1. left `+X 50mm`
  2. left `+Y 50mm`
  3. right `+X 50mm`
  4. right `+Y 50mm`
- token gate 验证：
  - `DUALARM_HARDWARE_CONFIRM_TOKEN` unset 时，execute 模式按预期返回 `hardware_confirm_token_mismatch_or_unset`。
- 详细报告：
  - `docs/operations/reports/2026-05-09-dual-arm-xy-50mm-nudge-tool.md`

### 当前边界与风险
- 本轮没有启动 `robo_ctrl`、MoveIt、planner、`execution_adapter` 或夹爪节点。
- 本轮没有发送任何机械臂运动、Servo、PTP、MoveJ、MoveCart、程序运行或夹爪命令。
- 真实执行前必须先启动对应左右臂 `robo_ctrl`，并确认 `/L|R/robot_move_cart`、`/L|R/robot_state` 可用。
- 真实执行前必须现场确认左右臂在 `+X/+Y 50mm` 方向均无障碍、无遮挡、无互碰风险。

### 下一步范围
- 若用户要求实机执行，先做 stale ROS graph 检查，再低速启动左右 `robo_ctrl`，先 dry-run，再带 token 执行。
- 执行后必须以 JSON 报告、`/robot_state.motion_done=true`、`error_code=0` 和 TCP 位移误差作为完成证据。

### 2026-05-09 追加修复
- 用户按 execute 入口测试时，脚本崩溃：
  - `AttributeError: 'str' object has no attribute '_executor_event'`
  - `KeyError: 0`
- 根因：
  - `dual_arm_xy_50mm_nudge.py` 在 `Node` 子类中使用 `self._clients` 字典，覆盖了 rclpy 内部 `_clients` 列表。
- 已修复：
  - 自定义字段改为 `self._move_cart_clients`。
  - 默认动作改成单独控制的 `--arm left --directions x`。
  - 报告目录时间戳加微秒，避免并行 dry-run 覆盖。
- 追加验证：
  - `py_compile`：通过。
  - `git diff --check`：通过。
  - `colcon build --packages-select tools`：通过。
  - 四条 dry-run 均为单步单臂动作。
  - 用户缺少 `--operator-confirm-site` 的 execute 命令现在正确返回 `operator_confirm_site_required`，不会进入 rclpy 执行阶段。
- 当前 ROS 图：
  - 存在用户启动的 `/L_robo_ctrl`；本轮未停止。
  - 本轮没有发送真实 `/L|R/robot_move_cart` 请求。
