# 2026-05-07 右臂深度建模与实机控制日志

## 结论

进行中但实机控制目标已达成。右臂 no-motion 深度建模预检脚本已实现并运行；右臂相机已由用户现场确认改为 `/dev/video14`，同组 Z16 深度为 `/dev/video8`。本轮已完成右臂真实受控运动：先完成 `Z -20mm x 2`，再按坐标系内组合路径 `X -20mm -> Y +20mm -> X +20mm -> Y -20mm`，累计请求路径长度 `120mm`，最终 `/R/robot_state` 为 `motion_done=true`、`error_code=0`。随后按用户要求调整 J6：直接 MoveJ 到 `45deg` 被控制器拒绝并返回错误码 `14`，已用直连 SDK `StopMotion()` 与 `ResetAllError()` 收口；改用 `ServoMoveStart + RobotServoJoint` 小步增量后，J6 从约 `0.134deg` 成功转到约 `10.16deg`，右臂停稳。

## 本轮边界

- 右深度本轮按 `raw=mm` 解释，脚本参数为 `depth_scale_mm_per_raw=1.0`。
- 右相机到右 TCP 只能使用 `Ltcp -> camera_link` 作为 `candidate/reference_left_extrinsic`，不得标为 verified。
- 用户 2026-05-07 补充确认：右相机到右 TCP 变换可按左臂相机到 TCP 相同处理；本轮脚本将记录为 `operator_confirmed_same_as_left_not_calibration_verified`，用于候选几何计算，但仍不冒充标定验收 verified。
- `right_arm_grasp_precheck.py` 第一版只做 no-motion 视觉、深度和几何计算，不调用 `/R/robot_move*`、`/R/robot_servo*`、夹爪 command 或 `/competition/run`。
- 自动抓取只作为 stretch goal；深度 gate、状态闭环、夹爪状态和现场安全任一不满足时，不做自动靠近或合爪抓取。

## 执行记录

### 预检脚本实现

- `packages/tools/tools/scripts/right_arm_grasp_precheck.py` 已新增并加入 `packages/tools/tools/CMakeLists.txt` 安装清单。
- `/usr/bin/python3 -m py_compile packages/tools/tools/scripts/right_arm_grasp_precheck.py`：通过。
- `rg -n "/R/robot_move|/R/robot_servo|epg50_gripper/command|/competition/run" packages/tools/tools/scripts/right_arm_grasp_precheck.py`：无命中，退出码 `1` 为 ripgrep 无匹配的预期结果。
- `git diff --check`：通过。
- `colcon build --base-paths packages --packages-select tools`：通过，`1 package finished [1.82s]`。
- 运行前旧进程检查：未发现真实旧进程，`pgrep` 只匹配检查命令本身。
- `ROS_DOMAIN_ID=0 ROS2CLI_ENABLE_DAEMON=0 ros2 node list`：空。
- no-motion 脚本输出目录：`.codex/tmp/runtime/right-arm-grasp-precheck-20260507-143327/`。
- 输出文件：
  - `right_arm_grasp_precheck.json`
  - `right_color_snapshot.jpg`
  - `right_depth_raw_vis.jpg`
  - `right_color_depth_precheck_overlay.jpg`

脚本 JSON 关键结论：

- 彩色采集：`/dev/video6`，`640x480`，OpenCV V4L2，`frames_read=5`。
- 深度采集：`/dev/video0`，`640x480`，native V4L2 mmap，`pixelformat=Z16`，`frames_read=5`；OpenCV V4L2 fallback reason 为无法打开设备。
- 检测：`cocacola`，`score=0.6461290121078491`，bbox `xyxy=[280.52685546875, 248.94998168945312, 360.1160888671875, 355.2261657714844]`。
- 深度解释：`depth_scale_mm_per_raw=1.0`，状态为 `operator_selected_not_global_verified`。
- depth ROI：`xyxy=[280, 248, 361, 356]`，valid pixels `6500`，raw median `1427.0`，depth median `1.4270000457763672 m`。
- target 3D bbox：`valid=true`，point_count `6500`。
- candidate TCP point 已输出，但外参状态为 `candidate/reference_left_extrinsic`，来源为 `static_transforms.yaml` 的 `Ltcp->camera_link`。
- obstacle model：valid obstacle pixels `3597`，`obstacle_min_distance_m=0.0`，clearance gate `passes=false`。
- safety gate：`passes=false`，`auto_grasp_allowed=false`，reasons 为 `obstacle_too_close_or_target_invalid` 和 `right_camera_to_right_tcp_extrinsic_not_verified`。

### 右臂视觉可视化修正

- 用户指出早先拉起的是左臂相机；已停止误标链路。
- 设备枚举结果：
  - `/dev/video6`：Orbbec `CP1E5420007N`，现场判断为左臂相机。
  - `/dev/video14`：Orbbec `CP02653000G2`，用户现场确认这是右臂相机。
  - `/dev/video16`：Integrated Camera，排除。
- 已拉起右臂彩色-only 检测可视化：
  - bridge：`/dev/video14 -> /right_camera_candidate/color/image_raw`
  - detector：`/detector/right_candidate/detections`
  - viewer：`/detector/right_candidate/detections/image`
- 验证：
  - `/right_camera_candidate/color/image_raw` 约 `14.6 Hz`
  - `/detector/right_candidate/detections/image` 约 `15 Hz`
  - 一帧检测包含 `class_id=2(cocacola)`，score 约 `0.436`
- 代码修正：
  - `right_arm_grasp_precheck.py` 默认 `--color-device=/dev/video14`
  - `right_arm_grasp_precheck.py` 默认 `--depth-device=/dev/video8`

### 右臂小步 jog

- 已完成：`ROS_DOMAIN_ID=0` graph 与旧进程检查，当前为空/无旧进程污染。
- 已完成：宿主机 `enp5s0=192.168.58.10/24`。
- 已完成：`ping -c 2 -W 1 192.168.58.3`，`2 received`，`0% packet loss`。
- 已完成：`nc -vz -w 2 192.168.58.3 8080`，TCP 连接成功。
- 已完成：运动前补充旧进程检查，未发现有效残留，`pgrep` 只匹配检查命令本身。
- 已完成：运动前补充 `ROS_DOMAIN_ID=0 ROS2CLI_ENABLE_DAEMON=0 ros2 node list`，为空。
- 已请求现场确认：工作区无人、手在急停、右臂末端沿 `Z +2.0 mm` 安全方向无遮挡，并允许发送一次低速增量 jog。
- 待执行：启动右臂 `robo_ctrl_R.launch.py`。
- 待执行：运动前 5 帧 `/R/robot_state`。
- 用户 2026-05-07 补充确认：机械臂周围 `30cm` 半径内无障碍物，要求移动幅度和速度都比默认值变大。
- 本轮右臂实践 jog 参数更新为：`Z +20.0 mm`，`velocity=15.0`、`acceleration=15.0`、`ovl=15.0`、`blend_time=-1.0`、`config=-1`、`use_increment=true`。
- 已执行并完成：按 HDU-PHOENIX/FairinoDualArm 参考格式优化请求参数，主要差异为 `tool=-1`、`user=-1`、`blend_time=0.0`，并使用更明显的 `velocity=30.0`、`acceleration=100.0`、`ovl=100.0`。
- 对比结论：
  - 两仓 `RobotMoveCart.srv` 字段一致。
  - 参考仓库真实任务代码存在增量退出示例：`[-50,0,30]mm`、`[-80,0,30]mm`，`velocity=30`、`acceleration=100`、`blend_time=0.0`、`tool=-1`、`user=-1`、`ovl=0`。
  - 本轮实机采用 `ovl=100`，避免本仓 `validate_positive_percent_value()` 拒绝 `ovl=0`。
- 运动前 5 帧 `/R/robot_state`：
  - 均为 `motion_done=true`、`error_code=0`
  - TCP 约 `[-31.93, -158.12, 623.03] mm`
- 已完成实机运动：
  - `Z -20mm` 第 1 步成功，TCP z 从约 `623.03mm` 到 `603.03mm`
  - `Z -20mm` 第 2 步成功，TCP z 到约 `583.03mm`
  - 用户要求不必只沿单轴移动后，执行组合路径：
    - `X -20mm`
    - `Y +20mm`
    - `X +20mm`
    - `Y -20mm`
  - 组合路径后 TCP 约 `[-31.95, -158.13, 583.02] mm`，基本回到组合路径起点 X/Y，`motion_done=true`、`error_code=0`
- 累计请求路径长度：
  - `Z` 两步：`40mm`
  - `XY` 矩形：`80mm`
  - 合计：`120mm`

### J6 相机朝向调整

- 用户指出 J6 方向不正、相机不在上方，要求转动 J6。
- 当前 J6 初始约 `0.134deg`。
- 尝试 `/R/robot_move` MoveJ 保持 J1-J5 不变、J6 到 `45deg`：
  - service completed: true
  - success: false
  - message: `执行移动命令失败，错误码: 14`
  - 随后 `/R/robot_state` 短时 `motion_done=false`、`error_code=1`
- 收口：
  - 直连 SDK helper 输出 `RPC ret=0`
  - `StopMotion ret=0`
  - `ResetAllError ret=0`
  - `CloseRPC ret=0`
  - 恢复后 5 帧 `/R/robot_state` 均为 `motion_done=true`、`error_code=0`
- 改用 servo 小步增量：
  - `/R/robot_servo` `command_type=0` 返回 `ServoMoveStart命令执行成功`
  - `/R/robot_servo_joint` `use_incremental=true`，40 点，每点 J6 `+0.25deg`，总计 `+10deg`，返回 `ServoJ开始执行`
  - `/R/robot_servo` `command_type=1` 返回 `ServoMoveEnd命令执行成功`
  - J6 从约 `0.134deg` 到约 `10.16deg`
  - 末尾状态样本为 `motion_done=true`、`error_code=0`

### 右夹爪原地控制

- 待执行：右夹爪 status。
- 待执行：enable。
- 待执行：open/close/open。
- 待执行：每步 status 回读。

## 验收证据

- `/usr/bin/python3 -m py_compile packages/tools/tools/scripts/right_arm_grasp_precheck.py`：通过。
- `git diff --check -- packages/tools/tools/scripts/right_arm_grasp_precheck.py packages/control/robo_ctrl/launch/robo_ctrl_R.launch.py`：通过。
- `colcon build --base-paths packages --packages-select tools robo_ctrl`：`2 packages finished [2.12s]`。
- 右臂视觉：`/dev/video14` 用户现场确认是右臂相机，检测 overlay 约 `15 Hz`。
- 右臂实机运动：累计请求路径长度 `120mm`，最后 5 帧闭环为 `motion_done=true`、`error_code=0`。
- J6 姿态：`ServoJ` 增量 `+10deg` 成功，J6 到约 `10.16deg`，最后状态为 `motion_done=true`、`error_code=0`。
- 未调用 `/competition/run`，未执行双臂协作或自动抓取。

## 2026-05-07 16:19-16:28 脚本化靠近、视野恢复与收口

### 结论

本窗口已按用户要求停止继续实机动作并收口。右臂通过 MoveIt/`execution_adapter` 完成两段脚本化 `pregrasp` 靠近和一段视野恢复动作，均返回执行成功并闭环到 `motion_done=true`、`error_code=0`。未执行合爪抓取，因为靠近后目标持续贴到画面底边，深度 ROI 出现背景混入风险；当前夹爪保持打开，`position=0`、`error=0`、`gobj=3`。清理后 `ROS_DOMAIN_ID=0` 无有效控制节点残留。

### 代码与策略更新

- `right_arm_grasp_precheck.py`：
  - 按 HDU-PHOENIX/FairinoDualArm 的 tf2 使用方式，修正 camera point 到 TCP 的变换方向为 `p_tcp = R_tcp_camera @ p_camera + t_tcp_camera`。
  - 修正 180 度旋转画面的几何：检测/显示使用旋转图，像素投射回相机点时映射回原始相机射线。
  - 输出 `target_alignment.alignment_candidates`，同时包含 `camera_center` 和 `tcp_contact_projection`。
- `right_arm_autonomous_grasp_attempt.py`：
  - 目标居中/TCP 对齐从默认硬门禁改为 `advisory_reference_only`。
  - 只有显式传 `--require-target-alignment-for-contact` 或 `--require-target-alignment-for-gripper` 时才阻断。
  - 若真正合爪，仍必须用 `gobj in {1,2}` 才能声明抓到；`gobj=3` 表示未检测到物体或物体脱落。
- 验证：
  - `/usr/bin/python3 -m py_compile packages/tools/tools/scripts/right_arm_grasp_precheck.py packages/tools/tools/scripts/right_arm_autonomous_grasp_attempt.py`：通过。
  - `rg -n "/R/robot_move|/R/robot_servo|epg50_gripper/command|/competition/run" packages/tools/tools/scripts/right_arm_grasp_precheck.py`：无命中。
  - `git diff --check -- packages/tools/tools/scripts/right_arm_grasp_precheck.py packages/tools/tools/scripts/right_arm_autonomous_grasp_attempt.py`：通过。
  - `colcon build --base-paths packages --packages-select tools`：通过。

### 关键运行证据

- 最新 advisory 预检：
  - `.codex/tmp/runtime/right-arm-grasp-precheck-alignment-either-20260507-161943/right_arm_grasp_precheck.json`
  - 目标 `cocacola` score 约 `0.829`，depth median 约 `0.348 m`。
  - `camera_center` xy norm 约 `0.081 m`，`tcp_contact_projection` xy norm 约 `0.152 m`，均未通过对齐阈值，但按用户要求作为参考，不再默认阻断。
- plan-only advisory：
  - `.codex/tmp/runtime/right-arm-contact-approach-planonly-advisory-20260507-162115/right_arm_autonomous_grasp_attempt.json`
  - `precheck_gate.passes=true`，`target_alignment_gate.enforcement=advisory_reference_only`。
  - MoveIt 规划 `pregrasp` 成功，距离约 `0.08 m`，`point_count=14`。
- 第一段 `pregrasp` 执行：
  - `.codex/tmp/runtime/right-arm-contact-approach-execute-pregrasp-advisory-20260507-162142/right_arm_autonomous_grasp_attempt.json`
  - TCP 从约 `[-139.8, -311.8, 285.6] mm` 到约 `[-204.5, -281.0, 250.2] mm`。
  - execution message：`ServoJ开始执行; 已等待 ServoJ 执行窗口并确认 motion_done=true`。
  - 右夹爪 enable/open 成功，最终打开到 `position=0`。
- 第一段靠近后预检：
  - `.codex/tmp/runtime/right-arm-grasp-precheck-after-advisory-pregrasp-20260507-162221/right_arm_grasp_precheck.json`
  - 目标 score 约 `0.907`，depth median 约 `0.220 m`。
  - bbox 已贴到画面底边，`bbox_edge_margin_px=0.0`。
- 第二段 `pregrasp` 执行：
  - `.codex/tmp/runtime/right-arm-contact-approach-execute-second-pregrasp-advisory-20260507-162307/right_arm_autonomous_grasp_attempt.json`
  - TCP 到约 `[-258.5, -256.2, 259.2] mm`，状态闭环正常。
- 第二段靠近后预检：
  - `.codex/tmp/runtime/right-arm-grasp-precheck-after-second-advisory-pregrasp-20260507-162338/right_arm_grasp_precheck.json`
  - 目标仍识别，但 bbox 在右下角，`bbox_edge_margin_px≈0.18 px`。
  - depth median 跳到约 `0.802 m`，说明 ROI 已明显混入背景；本窗口据此停止合爪。
- 视野恢复：
  - plan-only：`.codex/tmp/runtime/right-arm-visual-recover-planonly-edge-20260507-162452/right_arm_autonomous_grasp_attempt.json`
  - execute：`.codex/tmp/runtime/right-arm-visual-recover-execute-edge-20260507-162508/right_arm_autonomous_grasp_attempt.json`
  - 恢复动作距离约 `0.04 m`，TCP 到约 `[-226.1, -262.2, 236.5] mm`，状态闭环正常。
- 收口前最后预检：
  - `.codex/tmp/runtime/right-arm-grasp-precheck-after-visual-recover-20260507-162527/right_arm_grasp_precheck.json`
  - 目标 score 约 `0.908`，depth median 约 `0.210 m`。
  - bbox 仍贴底边，`bbox_edge_margin_px=0.0`，clearance gate 失败，外参仍不是 verified。

### 最终现场状态

- 最后一次清理前 `/R/robot_state`：
  - `joint_position≈[-104.699, -116.295, -71.107, -235.327, -59.868, -56.423] deg`
  - `tcp_pose≈[-226.135, -262.203, 236.498, -171.249, 38.941, 37.351] mm/deg`
  - `motion_done=true`，`error_code=0`
- 最后一次夹爪 status：
  - `success=true`，`gact=true`，`gsta=3`，`gobj=3`，`error=0`，`position=0`
  - 解释：夹爪打开，未检测到物体或物体脱落。
- 已停止控制图：
  - 已对 `robo_ctrl`、MoveIt、planner、`planning_scene_sync`、`execution_adapter`、右夹爪节点做清理。
  - `ros2 daemon stop` 后复查，没有有效 `ROS_DOMAIN_ID=0` 控制节点或关键进程残留。

### external review 架构审查接续

用户提供了 external review 全项目审查结论：当前项目存在正式主链、Quick 实机旁路和 Gazebo 仿真链三套执行路径，且 Orbbec bridge、camera matrix、任务编排、运动执行、pouring primitive、夹爪控制、launch、配置和右臂实机脚本均有重复或分裂。下个窗口要求先解决这些建议中体现的问题，再接续右臂夹取。

下窗口提示词已写入：

- `.codex/tmp/resume/NEXT_WINDOW_PROMPT_2026-05-07-right-arm-architecture-and-grasp.md`

下一窗口建议顺序：

1. 先把 external review 架构审查拆成 PRD Story 和小波次，不直接删文件。
2. 优先处理 P0/P1：重复 Orbbec bridge、重复 camera matrix、Quick 执行路径和 `execution_adapter` 分裂。
3. 架构清理不触发真实硬件运动。
4. 架构清理验证后，重新启动右臂控制图，重新采集 precheck，不复用旧 JSON 直接夹取。
5. 若目标仍贴边或深度 ROI 混背景，先恢复视野；若 plan 中出现实际 `grasp` 段并且夹爪打开，才执行合爪并用 `gobj` 判断是否成功。
