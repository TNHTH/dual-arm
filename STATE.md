# dual-arm STATE

更新时间：2026-05-08

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
