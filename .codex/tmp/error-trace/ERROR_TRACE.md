# Error Trace

## Maintenance Note 2026-05-08 Dual Arm Camera Alignment
- Scope: 双臂 no-motion 连接检测与双相机瓶盖单点深度采样。
- Status: no new runtime incident.
- Evidence:
  - 左右机械臂网络和 `8080` TCP 均可达。
  - 左右 `robo_ctrl` 只读状态发布约 `4.996 Hz`，均 `motion_done=true`、`error_code=0`。
  - 左 Orbbec `/dev/video6` RGB + `/dev/video0` Z16 采样成功；右 Orbbec `/dev/video14` RGB + `/dev/video8` Z16 采样成功。
  - `cap_p1` 左右瓶盖像素、ROI 深度和相机点已写入 JSON。
  - `cap_p2` 左右瓶盖像素、ROI 深度和相机点已写入 JSON。
  - `cap_p3` 左右瓶盖像素、ROI 深度和相机点已写入 JSON。
  - `cap_p4` 左右瓶盖像素、ROI 深度和相机点已写入 JSON。
  - `cap_p1..cap_p4` 候选刚体变换 RMSE `0.013744 m`，最大误差 `0.020159 m`。
  - `cap_p5` 独立验证误差 `0.083752 m`，状态 `candidate_validation_failed_high_error`。
  - 已重标记：`cap_p5` 为 rejected validation outlier，`cap_p1..cap_p4` 仅保留为 candidate fit。
- Remaining:
  - 当前候选变换未通过独立验证；不能标记 verified。
  - `cap_p5` 附近有浅色长条物体，存在混合深度风险，建议重采无干扰验证点。
  - 瓶盖高度只应在换算桌面接触点时处理；当前相机到相机拟合按瓶盖顶部中心点处理。
  - `depth_scale_mm_per_raw=1.0` 仍是 operator-selected，不是全局 verified。

## Incident 50
- Time: 2026-05-07
- Scope: right-arm scripted approach / vision reacquisition / grasp stop decision
- Symptom: 右臂完成两段脚本化 `pregrasp` 靠近后，YOLO 仍能检测 `cocacola`，但目标 bbox 贴到画面右下角/底边；第二段靠近后的 depth ROI median 跳到约 `0.802 m`，与上一帧约 `0.220 m` 明显不一致，说明 ROI 已混入背景。若继续按该 JSON 生成 grasp 或直接合爪，可能丢失目标或夹空。
- Root cause: eye-in-hand 靠近过程中目标在图像中快速移到边缘；当前 color/depth 仍是脚本快照建模，右相机外参不是 calibration verified，目标贴边时 bbox-to-depth ROI 容易包含背景深度。alignment 虽已按用户要求改为 advisory，但 bbox edge margin 和 depth consistency 仍是必须观察的风险信号。
- Handling:
  1. 未执行合爪，未声明抓取成功。
  2. 执行一段 `visual_center_step` 视野恢复，TCP 从约 `[-258.5, -256.2, 259.2] mm` 回到约 `[-226.1, -262.2, 236.5] mm`，`motion_done=true`、`error_code=0`。
  3. 重采视觉：目标仍检测到，score 约 `0.908`，depth median 约 `0.210 m`，但 bbox 仍贴底边，`bbox_edge_margin_px=0.0`，因此继续停止，不合爪。
  4. 停止 `robo_ctrl`、MoveIt、planner、`planning_scene_sync`、`execution_adapter` 和右夹爪节点；`ros2 daemon stop` 后默认域无有效控制节点残留。
- Evidence:
  - 第二段靠近后异常视觉：`.codex/tmp/runtime/right-arm-grasp-precheck-after-second-advisory-pregrasp-20260507-162338/right_arm_grasp_precheck.json`。
  - 视野恢复执行：`.codex/tmp/runtime/right-arm-visual-recover-execute-edge-20260507-162508/right_arm_autonomous_grasp_attempt.json`。
  - 最终预检：`.codex/tmp/runtime/right-arm-grasp-precheck-after-visual-recover-20260507-162527/right_arm_grasp_precheck.json`。
  - 最终夹爪状态：`success=true`、`gact=true`、`gsta=3`、`gobj=3`、`error=0`、`position=0`。
- Prevention:
  - 自动夹取每段运动后必须重采视觉和深度；目标贴边、depth median 大跳变、ROI 混背景时必须停止或恢复视野。
  - 用户允许 alignment advisory 不等于允许忽略目标可见性和深度一致性。
  - 合爪前必须确认 plan 中有实际 `grasp` 段，夹爪打开，且最新 precheck 不是贴边/背景混入状态。
- Remaining:
  - 自动夹取未完成；下窗口需先按用户要求处理 ClaudeCode 架构审查问题，再重新 bringup 硬件并重新采集 precheck。

## Incident 49
- Time: 2026-05-07
- Scope: one-off retreat planner script / PlanningScene freshness
- Symptom: 为回到上一稳定可见位姿编写一次性退回脚本时，`/planning/plan_pose` 返回 `success=false`、`result_code=scene_stale`、message 为 `scene_fusion 数据过期`，机械臂未动。
- Root cause: 自写一次性退回脚本只调用 planner，没有像 `right_arm_autonomous_grasp_attempt.py` 那样持续发布 fresh `/scene_fusion/scene_objects`，触发 planner freshness gate。
- Handling:
  1. 未执行该退回轨迹。
  2. 改用已有 `right_arm_autonomous_grasp_attempt.py --motion-mode visual_center_step`，该脚本会发布 fresh scene，再做 plan-only 和 execute。
- Evidence:
  - `.codex/tmp/runtime/right-arm-retreat-to-visible-pose-20260507-162435/right_arm_retreat_to_visible_pose.json`。
  - 后续 plan-only/execute 均通过：`.codex/tmp/runtime/right-arm-visual-recover-planonly-edge-20260507-162452/` 与 `.codex/tmp/runtime/right-arm-visual-recover-execute-edge-20260507-162508/`。
- Prevention:
  - 任何调用 `fairino_dualarm_planner` 的临时脚本都必须满足 fresh scene 合同；不要绕过当前标准发布路径。
  - 临时脚本失败后优先回到已验证入口，不继续扩大一次性脚本。
- Remaining: none for the failed retreat command; it did not move the arm.

## Incident 48
- Time: 2026-05-07
- Scope: rotated right-camera geometry in `right_arm_grasp_precheck.py`
- Symptom: 右相机画面为了操作可读性旋转 180 度后，YOLO bbox 坐标被直接用于相机射线投影，导致 camera-frame x/y 方向错误，视觉居中修正方向不稳定。
- Root cause: 检测/显示图像坐标与原始相机内参坐标系混用；旋转后的像素必须先映射回原始相机 ray，再套用 intrinsics。
- Handling:
  1. `points_from_mask()` 和 `pixel_to_camera_point()` 增加 `rotate_180` 几何反映射。
  2. JSON 的 `intrinsics.pixel_coordinate_note` 明确记录旋转图像如何参与几何。
  3. 增加小型回归：旋转像素映射测试通过。
- Evidence:
  - 回归命令输出 `rotated_pixel_point [0.29, 0.29, 1.0]`。
  - 最新预检 JSON 均包含 `rotate_180=true` 和 pixel coordinate note。
- Prevention:
  - 图像显示旋转与相机几何必须分层；所有脚本输出要标明坐标语义。
- Remaining: 右相机外参仍不是 calibration verified。

## Incident 47
- Time: 2026-05-07
- Scope: camera-frame to TCP-frame transform semantics
- Symptom: 对照 HDU-PHOENIX/FairinoDualArm 后发现，早期 candidate TCP 点计算把 `Ltcp -> camera_link` 当作需要反解的外参使用，和参考仓库 tf2 `transform(point_in, target_frame)` 的语义不一致。
- Root cause: `static_transforms.yaml` 中 `parent=Ltcp, child=camera_link` 表示 tf2 parent->child 静态变换；把 camera point 转到 TCP frame 应按参考仓库的 frame transform 语义使用 forward transform `p_tcp = R_tcp_camera @ p_camera + t_tcp_camera`。旧实现使用 inverse 方向会让候选 TCP 点偏差。
- Handling:
  1. 修正 `Transform.camera_point_to_tcp()` 为 forward transform。
  2. `candidate_extrinsic.semantics` 写入 JSON，明确 `camera point to TCP uses p_tcp = R_tcp_camera @ p_camera + t_tcp_camera`。
  3. 右相机到右 TCP 仍记录为 `operator_confirmed_same_as_left_not_calibration_verified`，不标为 verified。
- Evidence:
  - `right_arm_grasp_precheck.py` py_compile 通过。
  - 运行时 JSON 中 `candidate_extrinsic.semantics` 已更新。
- Prevention:
  - 所有外参候选必须记录 parent/child、source 和 transform semantics；不能只记录数字。
- Remaining:
  - 需要后续标定或独立验证右相机到右 TCP 后才能改为 verified。

## Incident 45
- Time: 2026-05-07
- Scope: right camera color capture in `right_arm_grasp_precheck.py`
- Symptom: 第二次 no-motion 预检以 `--right-extrinsic-assumption operator_confirmed_same_as_left` 运行时，OpenCV V4L2 彩色读取在 MJPG 解码空 buffer 上抛出 `(-215:Assertion failed) !buf.empty() in function 'imdecode_'`，脚本 fail-closed 输出 JSON 后退出。
- Root cause: `/dev/video6` 的 OpenCV MJPG 读取偶发返回空压缩 buffer；这与几何逻辑无关，是彩色采集 backend/format 的鲁棒性问题。
- Handling:
  1. 保留 fail-closed JSON：`.codex/tmp/runtime/right-arm-grasp-precheck-20260507-143841/right_arm_grasp_precheck.json`。
  2. 将彩色采集改为多模式 fallback：V4L2 MJPG、V4L2 YUYV、V4L2 默认、OpenCV 默认 backend。
  3. 每个读取异常记录到 `fallback_errors`，但不让单个 backend 直接终止脚本。
- Evidence:
  - 错误 JSON 中 `error.message` 包含 OpenCV `imdecode_` assertion。
- Prevention:
  - 实机相机脚本不能只依赖单一 OpenCV fourcc；应使用多 backend/fourcc fallback 或原生 V4L2。
- Remaining:
  - 需要重跑 no-motion 预检，确认 fallback 后能继续输出深度建模 JSON。

## Incident 44
- Time: 2026-05-07
- Scope: right-arm no-motion depth precheck / obstacle gate / practice control handoff
- Symptom: `right_arm_grasp_precheck.py` 成功检测 `cocacola` 并生成目标 3D bbox，但输出 `safety_gate.passes=false`、`auto_grasp_allowed=false`；障碍物 clearance gate 失败，且右相机到右 TCP 外参仍为 `candidate/reference_left_extrinsic`。
- Root cause: 这是预期的 fail-closed 结果，不是脚本崩溃。当前右深度图像中目标附近存在障碍物候选点，`obstacle_min_distance_m=0.0`；同时右相机外参没有 verified，只能借用左臂 `Ltcp -> camera_link` 作为 candidate。
- Handling:
  1. 不进入自动靠近、预抓取或自动合爪抓取。
  2. 继续允许执行与目标无关的安全方向小步 jog，但必须先完成现场安全确认和 `/R/robot_state` 闭环。
  3. 将 no-motion JSON、图像和 gate 结论写入 `docs/operations/reports/2026-05-07-right-arm-practice-control-log.md`。
- Evidence:
  - JSON：`.codex/tmp/runtime/right-arm-grasp-precheck-20260507-143327/right_arm_grasp_precheck.json`。
  - `target_3d_bbox_camera_m.valid=true`。
  - `obstacle_model.clearance_gate.passes=false`。
  - `candidate_extrinsic.status=candidate/reference_left_extrinsic`。
  - `safety_gate.passes=false`，`auto_grasp_allowed=false`。
- Prevention:
  - 深度图像可以用于障碍物建模和 gate，但未 verified 外参和 clearance 前，不得把它升级成自动抓取许可。
  - 实践控制与目标抓取分层：先做安全方向小步 jog 证明右臂可控，再单独关闭视觉/外参/避障项。
- Remaining:
  - 等待现场确认后执行右臂低速 `Z +2.0 mm` jog。
  - 后续若要自动抓取，需要重新建立 verified 右相机外参、正式 color/depth 对齐和避障阈值。

## Incident 43
- Time: 2026-05-07
- Scope: right-arm low-speed MoveCart jog / stop path / scripted geometry handoff
- Symptom: 右臂 `/R/robot_move_cart` 低速 `Z +3.0 mm` 增量命令返回 `success=true` 后，`/R/robot_state` 多次显示 `motion_done=false`、`error_code=0`，TCP `z` 只缓慢接近目标。若继续下发运动或进入夹取，会在运动状态未闭环时叠加新风险。
- Root cause: 未完全定位。当前可确认 `RobotMoveCart` 服务成功返回不等同于后续状态已经停稳；现场小步增量后仍需以 `/R/robot_state.motion_done` 和 TCP 稳定采样作为闭环证据。底层服务等待/超时语义和 SDK 运动完成状态需要后续单独复核。
- Handling:
  1. 立即停止继续下发运动命令。
  2. 编译并执行直连 Fairino SDK helper，调用 `RPC(192.168.58.3)` 后执行 `StopMotion()`。
  3. `StopMotion()` 返回 `ret=0`，`CloseRPC` 返回 `ret=0`。
  4. 停止后连续 5 帧 `/R/robot_state` 均为 `motion_done=true`、`error_code=0`，TCP `z` 稳定在约 `643.086 mm`。
  5. 停止 `/right_robo_ctrl`，确认 `ROS_DOMAIN_ID=0 ros2 node list` 为空。
- Evidence:
  - 增量命令参数：右臂，`use_increment=true`，`tcp_pose.z=+3.0 mm`，`velocity=5.0`、`acceleration=5.0`、`ovl=5.0`。
  - 风险采样：`tcp_pose.z≈642.919 mm`，`motion_done=false`，`error_code=0`。
  - stop helper 输出：`RPC(192.168.58.3) ret=0`、`StopMotion ret=0`、`CloseRPC ret=0`。
  - 停止后采样：连续 5 帧 `/R/robot_state` `motion_done=true`、`error_code=0`。
  - 详细记录：`docs/operations/reports/2026-05-07-right-arm-motion-stop-and-scripted-geometry-handoff.md`。
- Prevention:
  - `RobotMoveCart` 返回成功后，不得直接进入下一步运动；必须再用 `/R/robot_state` 验证 `motion_done=true` 和 TCP 稳定。
  - 任何运动命令异常或状态未闭环时，优先 stop 和状态确认，不继续做视觉/几何/抓取动作。
  - 后续几何计算必须脚本化并输出 JSON；聊天中不得手算点云/外参/距离结果。
  - 右相机外参、depth unit、color/depth 对齐和障碍物 gate 未 verified 前，不允许自动夹取或合爪。

## Maintenance Note 2026-05-06 P0 Safety Repair
- Scope: hardware code review P0 safety repair.
- Status: no new runtime incident.
- Evidence:
  - `git diff --check` passed.
  - `/usr/bin/python3 -m pytest -q tests/unit/test_p0_safety_contracts.py` -> `5 passed in 0.01s`.
  - `colcon build --base-paths packages --packages-select tools robo_ctrl quick_competition dualarm` -> `4 packages finished [1min 1s]`.
- Remaining:
  - 急停、stop_all 和执行器停止能力只完成软件/mock/no-motion 验证；未做实机急停或运动链路验证。
  - `quick` hardware `stop_all()` 缺通用 `StopMotion/abort` 服务，按设计 fail-closed 返回失败。

## Incident 38
- Time: 2026-05-06
- Scope: real-hardware default ROS domain cleanup and camera detection visualization
- Symptom:
  1. `ROS_DOMAIN_ID=0` 中残留两套 software-only `competition_core` 派生节点和两个临时 `/tmp/depth_detection_viewer.py`，`ros2 node list` 出现重复节点名警告。
  2. 默认相机 bridge 使用 `obsensor:0` 共享模式时，`left_orbbec_gemini_bridge` 持续输出 `读取深度图失败`，导致彩色/深度/检测可视化链路不可用。
- Root cause:
  1. 默认域被前序 no-motion software-only core 和临时 viewer 污染；这些进程为 unset domain，即默认 `ROS_DOMAIN_ID=0`，与实机窗口共享 ROS graph。
  2. 当前两台 Orbbec Gemini 335 的 V4L2 设备需要显式区分彩色与深度口；`auto/obsensor` 在本轮现场没有稳定读出深度。V4L2 枚举显示 `CP02653000G2` 的深度和彩色分别是 `/dev/video0=Z16`、`/dev/video6=YUYV,MJPG`。
  3. `/dev/video8` 虽然有 `MJPG/YUYV`，但实际是笔记本 `Integrated Camera`，不能作为 Orbbec 彩色口。
- Handling:
  1. 只停止默认域污染 PID 和临时 viewer，保留另一个窗口 `ROS_DOMAIN_ID=162` 的 Gazebo/MoveIt/RViz 仿真进程。
  2. 清理后确认 `ROS_DOMAIN_ID=0 ros2 node list` 为空。
  3. 先按 no-motion 条件做网络、串口、V4L2/by-path/by-id 设备检查。
  4. 使用明确 V4L2 参数重启左相机感知 core：`left_camera_color_device:=/dev/video6`、`left_camera_depth_device:=/dev/video0`、`left_camera_depth_backend:=v4l2`、`start_hardware:=false`、`enable_right_camera:=false`、`publish_fake_joint_states:=true`。
  5. 启动 RViz dry-run 可视化和两个图像窗口，并将两个 viewer remap 为不同 ROS 节点名，消除 `/ros_image_viewer` 重名警告。
- Evidence:
  - 清理目标 PID：
    - 第一套 core：`50657,50661,50663,50665,50667,50669,50671,50673,50675,50677,50679,50683,50686,50690,50695,50700,50712`
    - 第二套 core：`55257,55259,55261,55263,55265,55267,55269,55271,55273,55275,55277,55279,55281,55283,55285,55287,55289,55309`
    - 临时 viewer：`52638,52661,56398,56421`
  - `ROS_DOMAIN_ID=162` 仿真进程仍保留，含 `competition_gazebo_full.launch.py`、`move_group`、`planning_scene_sync`、`fairino_dualarm_planner`、RViz。
  - V4L2 format：`/dev/video0 Z16`、`/dev/video6 YUYV,MJPG`、`/dev/video10 Z16`、`/dev/video16 YUYV,MJPG`。
  - 当前成功日志目录：`.codex/tmp/runtime/real-camera-detection-viz-domain0-20260506-172023`。
  - 当前运行 PID：core `69100`、RViz `70273`、detector overlay viewer `70274`、table/depth overlay viewer `70275`。
  - Topic rates：`/left_camera/color/image_raw` 约 `13.1 Hz`，`/left_camera/depth/image_raw` 约 `13.4 Hz`，`/detector/left/detections/image` 约 `11.2 Hz`。
  - `/scene_fusion/scene_objects` 一帧包含 `table_surface_*` 和 `water_bottle_*`；`water_bottle` 为 `source=left_camera`、`pose_source=depth_roi_primitive_fit`。
- Prevention:
  - 实机窗口清默认域污染时，必须同时核对目标 PID 的 `ROS_DOMAIN_ID`，不得清理 `ROS_DOMAIN_ID=62/162` 等仿真窗口进程。
  - 真实 Orbbec 可视化优先使用 `/dev/v4l/by-path`/`udevadm`/V4L2 format 明确彩色与深度口，不依赖双相机 `auto` 或不稳定的 `obsensor` 默认路径。
  - `ros_image_viewer.py` 同时启动多个实例时必须 remap `__node`，否则会产生重复节点名警告。
  - `start_hardware=false` 的 perception/MoveIt 可视化图仍会占用 `ROS_DOMAIN_ID=0`；后续硬件只读采样前必须先说明是否保留该图。
- Remaining:
  - 当前只证明 no-motion 左相机深度/检测/场景可视化链路可用，不证明实机运动链路或 `/competition/run`。
  - 相机外参仍为 `allow_unverified_camera_extrinsics:=true` 调试路径，不能标为 `verified`。
  - 双相机同时 no-motion 桥接和右相机 explicit mapping 仍未本轮验证。

## Incident 37
- Time: 2026-05-06
- Scope: real-hardware read-only contact calibration candidate
- Symptom:
  1. 用户现场确认右夹爪已经抵在两条相邻桌边夹角的桌角顶点上；这类接触点有标定价值，但也容易被误判为可以自动运动或可直接进入 quick hardware。
  2. `/L/robot_state` 在 `ros2 topic list -t` 和 `ros2 node info` 中可见，但 `ros2 topic echo --once /L/robot_state` 偶发返回 `topic ... does not appear to be published yet`。
- Root cause:
  1. 当前处于人工接触点标定准备阶段，右夹爪与桌面发生物理接触，不能按普通 no-load 姿态处理。
  2. ROS 2 CLI/DDS 发现存在短暂不一致；显式指定消息类型后可读取，`topic hz` 约 5 Hz，未证明硬件状态链路中断。
  3. 用户确认所有标定接触都是夹爪指尖触桌；`robot_state.tcp_pose` 是控制器 TCP 位姿，不是指尖接触点，因此必须引入 `tcp_to_fingertip_offset`。
- Handling:
  1. 将右夹爪桌角接触姿态记录为 `P_corner_R_candidate`，只作为后续世界坐标/桌面标定候选点。
  2. 未调用任何运动服务、夹爪 command、夹爪 enable/open/close 或 `/competition/run`。
  3. 执行 `quick_hardware_smoke_test.sh`，仅采集 no-motion 话题、频率、echo 和 quick frame 配置证据。
  4. 本窗口启动的左右 `robo_ctrl` 与左右 EPG50 节点已停止，避免遗留 `/robot_move` 和夹爪 command service 暴露在 `ROS_DOMAIN_ID=0`。
- Evidence:
  - `/R/robot_state` 当前右桌角接触候选点：TCP `[24.7092, -490.8670, 218.0168, -177.2486, -5.1831, 171.5636]`，`motion_done=true`，`error_code=0`。
  - `/L/robot_state` 当前帧：TCP `[-459.9956, 245.9422, 436.6226, -174.8978, -20.2733, 123.9204]`，`motion_done=true`，`error_code=0`。
  - 15:41 补充采样按实际 topic 命令顺序校正后：`P_corner_L_candidate` 读取到 TCP `[12.2232, 415.7925, 185.2491, -179.0144, -2.9791, 58.3001]`，`P2_R_candidate` 读取到 TCP `[-389.7625, -393.3788, 217.4781, -179.8124, -5.2444, 125.4291]`。
  - 15:51 补充采样：`P_left_current_1551_candidate` 读取到 TCP `[-378.3639, 414.0353, 183.7158, -177.4574, -1.5350, 105.8155]`，`P3_R_candidate` 读取到 TCP `[-169.0668, -267.7144, 214.6276, 178.8996, 4.5532, 127.1735]`。
  - 模型检查：当前主 MoveIt URDF 未发现正式 gripper/fingertip link；`packages/tools/tools/config/static_transforms.yaml` 中有候选末端偏移 `Ltcp -> Lend = [-0.019899, -0.003972, 0.191327] m`、`Rtcp -> Rend = [0.030650, -0.007066, 0.190848] m`。
  - 16:04 补充采样：`P3_L_candidate` 读取到 TCP `[-184.7715, 552.6743, 185.8906, -172.3366, -2.1623, 81.5593]`，用 `Lend` 候选偏移换算指尖点 `[-215.775, 544.385, -3.814] mm`；`P_corner2_R_candidate` 读取到 TCP `[-348.8521, 134.4679, 211.6604, -179.9173, 4.6610, 51.6649]`，用 `Rend` 候选偏移换算指尖点 `[-345.281, 150.820, 18.963] mm`。
  - 16:22 补充采样：`P_calib3_L_candidate` 读取到 TCP `[-374.6696, 499.1434, 188.5948, -171.3510, -5.6079, 100.6662]`，用 `Lend` 候选偏移换算指尖点 `[-406.548, 491.737, -1.001] mm`；右臂尚未到该同物理点，仍待补右点。
  - 16:31 补充采样：`P_calib3_R_candidate` 读取到 TCP `[-379.9695, -268.3993, 216.2925, -177.7920, 1.7410, 112.1220]`，用 `Rend` 候选偏移换算指尖点 `[-402.680, -250.806, 25.015] mm`；与 `P_calib3_L_candidate` 组成第三组完整候选点对。
  - 16:38 补充采样：`P_calib4_R_candidate` 读取到 TCP `[-286.0629, -531.1006, 219.7707, -176.8804, 1.3777, 141.6689]`，用 `Rend` 候选偏移换算指尖点 `[-317.329, -528.615, 28.908] mm`；左臂同物理点尚未采集。
  - 16:44 补充采样：`P_calib4_L_candidate` 读取到 TCP `[-247.0098, 256.7064, 179.2065, -179.9009, -9.2076, 102.0195]`，用 `Lend` 候选偏移换算指尖点 `[-253.503, 266.541, -12.832] mm`；与 `P_calib4_R_candidate` 组成第四组完整候选点对。
  - 候选外参残差：前三点拟合、第四点独立验证残差约 `14.626 mm`；四点整体最小二乘 RMS 残差约 `18.459 mm`，最大残差约 `21.547 mm`。
  - 16:46 收口检查：本窗口 `robo_ctrl` 已停止，但 `ROS_DOMAIN_ID=0` 中出现另一个命令启动的 software-only `competition_core` 图，命令含 `start_hardware:=false`、`publish_fake_joint_states:=true`；本轮未清理或 kill。
  - `/L/robot_state` 与 `/R/robot_state` `topic hz` 均约 `4.996 Hz`。
  - 左右夹爪 status service 均 `success=True`、`error=0`，未调用 command service。
  - `bash scripts/quick/quick_hardware_smoke_test.sh` 输出 `[OK] hardware smoke no-motion checks completed`。
  - 最终 `ROS_DOMAIN_ID=0 ros2 node list` 为空；最终 `pgrep` 仅剩另一个窗口的 Gazebo/MoveIt/RViz 仿真进程。
- Prevention:
  - 接触点标定阶段，任何 TCP 点只能标记为 `candidate`，直到完成三点非共线标定、独立点误差验证和人工确认后才能标为 `verified`。
  - 多点采样时必须先绑定“物理点名”再读 `robot_state`，否则容易把左/右臂的不同点对写反。
  - 如果用户描述“未移动/同一点”，但 TCP 位置差异超过工具偏移可解释范围，必须标记为待确认，不得自动覆盖旧点。
  - 若接触部位是夹爪指尖，所有外参求解必须使用 `finger_contact_point = tcp_pose * tcp_to_fingertip_offset`，不能直接把 TCP 位置当桌面接触点。
  - 若主 URDF 没有 gripper/fingertip link，不得声称 URDF 已完整覆盖指尖；应明确使用 `tools/static_transforms.yaml` 的 `Lend/Rend` 作为候选并等待现场确认。
  - 右夹爪或左夹爪抵住桌面/桌角时，禁止自动运动到该点，禁止用 motion executor 贴近，禁止夹爪控制。
  - 读取 `robo_ctrl/msg/RobotState` 时若 CLI 发现不稳定，优先使用显式类型：`ros2 topic echo --once /L/robot_state robo_ctrl/msg/RobotState`。
- Remaining:
  - 当前已有四组完整候选点对，且已完成候选外参和残差计算。
  - 当前优先候选左右夹爪 `tcp_to_fingertip_offset` 为 `Lend/Rend`，但残差仍为厘米级；需要复核真实触点/工具偏移/接触滑动或压缩，不能标为 `verified`。
  - `ROS_DOMAIN_ID=0` 当前不是干净实机图；后续实机采样前必须由用户授权停止/隔离 software-only core 节点，或明确记录 graph 污染边界。

## Incident 35
- Time: 2026-05-06
- Scope: quick_competition implementation and launch smoke
- Symptom:
  1. Claude Code read-only scout did not return useful evidence: first invocation failed with prompt/print argument handling, second invocation exceeded the 0.50 USD budget.
  2. First `ros2 launch dualarm_bringup quick_competition.launch.py dry_run:=true` smoke started quick nodes, but all Python entrypoints exited with `unrecognized arguments: --ros-args -r __node:=...`.
- Root cause:
  1. Sidecar prompt/tool budget was still too broad for the local Claude Code model/router, so it consumed budget before returning a concise scout report.
  2. quick console scripts used `argparse.parse_args()`, while `launch_ros.actions.Node` appends ROS arguments to Python executables.
- Handling:
  1. Stopped relying on the sidecar for completion evidence and used local interface scans, py_compile, pytest, colcon build, launch smoke, and software_check.
  2. Changed launchable quick entrypoints to `parse_known_args()` so ROS launch arguments are ignored by the local CLI parser.
  3. Rebuilt `quick_competition` and `dualarm_bringup`, reran launch smoke successfully.
- Evidence:
  - Failing launch log showed `unrecognized arguments: --ros-args -r __node:=quick_motion_executor` and similar for all quick nodes.
  - Fix validation:
    - `/usr/bin/python3 -m py_compile packages/quick_competition/quick_competition/*.py`
    - `./build_workspace.sh --group quick,bringup` -> `25 packages finished`
    - `timeout 5s ros2 launch dualarm_bringup quick_competition.launch.py dry_run:=true` -> all quick nodes started; timeout exit `124` treated as expected long-running launch smoke.
    - `bash scripts/ci/software_check.sh` -> `45 passed`, 7 packages built, Playwright `2 passed`.
- Prevention:
  - Any ROS 2 Python console script used as a `Node` executable should use `parse_known_args()` or remove ROS args before parsing custom CLI flags.
  - Claude Code sidecars remain bounded best-effort inputs only; when they fail or exceed budget, continue with local evidence and record the lifecycle.
- Remaining: none for quick software smoke. Real hardware remains untested by design.

## Incident 34
- Time: 2026-05-01
- Scope: real-camera no-motion continuation
- Symptom: 在 `competition_core.launch.py start_hardware:=false start_camera_bridge:=true ...` 下，左相机桥接可启动，但右相机桥接进程退出，报 `RuntimeError: 无法打开 Orbbec 彩色设备: /dev/video6`；同时严格比赛入口默认不发布 `world -> left_camera` 与 `world -> right_camera`，导致相机世界系 TF 缺失。
- Root cause:
  1. `packages/perception/orbbec_gemini_bridge/scripts/orbbec_gemini_ros_bridge.py` 的 `auto` 设备选择逻辑会按 V4L2 格式在 `/dev/video0..9` 中挑设备，但当前不能稳定区分左右两台 Orbbec，相机双路启动时右侧会命中与左侧冲突的彩色设备；
  2. `packages/transforms/tf_node/config/calibration_transforms.yaml` 中 `left_tcp -> left_camera` 和 `right_tcp -> right_camera` 仍为 `calibration_status: unverified`，而 `competition_core.launch.py` 默认要求 `required_camera_calibration_status=verified`，因此 `tf_frame_authority` 会跳过这两条外参 TF。
- Handling:
  1. 先在严格入口下复现实机相机链问题，确认左侧 topic 已注册、右侧桥接失败、世界系相机 TF 被 gate 拦截；
  2. 再用 `enable_right_camera:=false allow_unverified_camera_extrinsics:=true` 做左相机单侧 no-motion 验证；
  3. 验证左侧 `/left_camera/color/image_raw`、`/left_camera/depth/camera_info` 可读，且 `world -> left_camera -> left_camera_depth_frame` TF 链成立；
  4. 检查 `/dev/v4l/by-id`，确认两台 Orbbec 的稳定设备身份分别为 `CP02653000G2` 与 `CP1E5420007N`；
  5. 更新 `smoke_camera_frames.py` 默认 topic/TF 合同，从旧 `/camera/*` 切到当前 `/left_camera/*`。
- Evidence:
  - 严格入口日志：`UNVERIFIED EXTRINSIC: left_tcp->left_camera status=unverified`、`UNVERIFIED EXTRINSIC: right_tcp->right_camera status=unverified`
  - 右桥接失败日志：`RuntimeError: 无法打开 Orbbec 彩色设备: /dev/video6`
  - 左桥接通过证据：`/left_camera/color/image_raw` 与 `/left_camera/depth/camera_info` 均可 `ros2 topic echo --once`
  - TF 探针结果：`{'world->left_camera': 1, 'left_camera->left_camera_depth_frame': 1, 'world->left_camera_depth_frame': 1}`
  - 设备身份：`/dev/v4l/by-id/usb-Orbbec_R__Orbbec_Gemini_335_CP02653000G2-*` 与 `...CP1E5420007N-*`
- Prevention:
  - 真实相机链路 smoke 必须与当前 `/left_camera/*` / `/right_camera/*` topic 合同一致，不能继续依赖历史 `/camera/*` 入口；
  - 双相机 auto bringup 前先检查 `/dev/v4l/by-id` 或显式设备配置，不要默认假设 auto 选择能稳定区分左右 Orbbec；
  - 在严格比赛入口验证相机世界系 TF 时，先确认相机外参校准状态满足 `verified`，否则应明确切换到允许 `unverified` 的调试入口，而不是把 gate 失败误判成桥接故障。
- Remaining:
  - 右相机 `auto` 设备映射尚未修复；
  - 双相机同时 no-motion 实机桥接还没有拿到通过证据；
  - 严格比赛入口下的 `verified` 外参链路仍待真实标定验收。

## Incident 33
- Time: 2026-05-01
- Scope: real-hardware/no-motion runtime retest
- Symptom: `ros2 launch dualarm_bringup competition_core.launch.py start_hardware:=false ...` 在 launch 参数求值阶段失败，报 `Expected a non-empty sequence, with items of uniform type. Allowed sequence item types are bool, int, float, str.`
- Root cause: ROS 2 Humble 对空列表参数推断不稳定；`scene_fusion` 的 `rgb_detection_topics` 和 `execution_adapter` 的 `vendor_direct_cartesian_profiles` 使用 `[]` / `"[]"` 作为默认值时，会在 launch 参数 override 组合下触发空序列或 `BYTE_ARRAY` 类型冲突。
- Handling:
  1. 分段启动定位到 `scene_fusion.launch.py` 与 `execution_adapter.launch.py`。
  2. 将空列表默认值改为空字符串，保留节点已有 YAML/逗号解析逻辑。
  3. 重建 `dualarm_bringup`、`scene_fusion`、`execution_adapter`。
  4. 已验证两个子 launch 可启动。
  5. 完整 core 继续暴露 `rgb_detection_topics` override 从 `STRING` 变成 `STRING_ARRAY` 的声明冲突；已为相关可空/可列表参数增加动态类型声明。
  6. 更新 `smoke_resume_checkpoint.py`，使其使用合法 `task_sequence`，并以 `competition_done` checkpoint 验证恢复机制，不绕过 start gate。
- Evidence:
  - `scene_fusion` 子 launch 输出 `scene_fusion 已启动`。
  - `execution_adapter` 子 launch 输出 `execution_adapter 已启动`。
  - 完整 no-motion core 启动到 MoveIt `You can start planning now!`。
  - `smoke_resume_checkpoint.py` 输出 `resume checkpoint smoke passed`。
  - `smoke_planning_scene_sync.py` 输出 `planning_scene_sync smoke passed`。
  - `smoke_scene_freshness.py` 输出 `scene freshness smoke passed`。
  - 详细记录见 `docs/operations/reports/2026-05-01-real-hardware-no-motion-test-log.md`。
- Prevention: 对可为空的 ROS 2 参数，避免在 launch 默认值和 `declare_parameter` 默认值中使用裸空列表；优先用空字符串并在节点内显式解析为空集合。
- Remaining: 相机桥接 smoke 仍需单独按当前 `/left_camera/*` / `/right_camera/*` topic 合同更新或重跑；本次 no-camera core 下旧 `smoke_camera_frames.py` 返回 `camera topics missing`。

## Incident 30
- Time: 2026-04-26
- Scope: Wave 0 software-only baseline
- Symptom: `pytest --collect-only tests` failed with `/bin/bash: pytest: 未找到命令`.
- Root cause: 当前 shell 环境没有可执行的 `pytest` 命令；测试入口依赖没有被仓库脚本显式治理。
- Handling: 将该问题记录为 Wave 2 必修项，后续通过 `scripts/ci/software_check.sh` 给出明确依赖检查和降级提示，并补真实软件-only 测试。
- Evidence: Wave 0 基线命令返回 exit code 127。
- Prevention: 不再把全局 `pytest` 视为隐含前提；CI 脚本必须先检查依赖并输出可操作错误。
- Remaining: Wave 2 完成前，仓库测试体系仍不能证明核心功能回归。

## Incident 31
- Time: 2026-04-26
- Scope: Wave 4 task manager test registration
- Symptom: 同时收集 `tests/unit/test_task_contract.py` 和 `packages/tasks/dualarm_task_manager/test/test_task_contract.py` 时，pytest 报 `ImportMismatchError`。
- Root cause: 两个测试文件 basename 相同，pytest 模块缓存把包内测试解析到顶层测试路径。
- Handling: 将包内测试重命名为 `test_dualarm_task_contract.py`，并同步更新 `dualarm_task_manager/CMakeLists.txt`。
- Evidence: 重跑 `/usr/bin/python3 -m pytest -q tests/unit tests/integration packages/tasks/dualarm_task_manager/test/test_dualarm_task_contract.py` 通过，`17 passed`。
- Prevention: 后续跨顶层和包内测试目录新增测试时，文件 basename 保持唯一，避免 pytest import mismatch。
- Remaining: 无。

## Incident 32
- Time: 2026-04-26
- Scope: software-only hardening subagent orchestration
- Symptom: Wave 1 security reviewer、Wave 5 reviewer、Wave 6 final verifier 均在 120-180 秒内未返回有效结果，需要关闭后本地 fallback。
- Root cause: subagent prompt 粒度偏宽，且把 reviewer/verifier 用作接近最终全量判断的 sidecar；这种任务对上下文、文件扫描和结论综合要求过高，容易超过等待预算。
- Handling:
  1. 已关闭所有超时 subagent；
  2. 已在 `SUBAGENT_REGISTRY.json` 记录生命周期；
  3. 主线程用 py_compile、pytest、colcon build/test、software_check、git diff --check、敏感信息扫描等本地证据完成 fallback；
  4. 已新增 `docs/operations/runbooks/subagent-timeout-policy.md`；
  5. 已更新 `AGENTS.md`、`engineering-process-standards.md`、`auto-pipeline` skill 和 `wave-executor` skill。
- Evidence: 当前分支已有 Wave 0-6 提交并推送；subagent registry 中 3 个软件 hardening reviewer/verifier 均为 `timed_out_closed_local_fallback`。
- Prevention: subagent 只做非阻塞、窄范围、短答 sidecar；reviewer/verifier 只等待一次；同一任务两次超时后停用非必要 subagent。
- Remaining: 平台级 subagent 超时无法在仓库内彻底消除，只能通过任务粒度、等待预算和本地 fallback 降低影响。

## Incident 1
- Time: 2026-04-15
- Scope: Wave 1 MoveIt bringup
- Symptom: `move_group` 启动时报 `No controller_names specified.`
- Root cause: `moveit_controllers.yaml` 未被 `move_group` 正确消费。
- Handling: 补充 `moveit_controllers` 参数传入，当前已降为非阻塞告警。
- Evidence: `move_group` 启动日志后续已出现 `Added FollowJointTrajectory controller`。

## Incident 2
- Time: 2026-04-15
- Scope: subagent orchestration
- Symptom: 长任务实现 subagent 连续返回 `502 Bad Gateway`。
- Root cause: 上游平台故障，不是代码问题。
- Handling: 改为主线程实现 + 小粒度 reviewer/verifier subagent，关闭失败 agent。
- Prevention: 后续 wave 中若 2 次 502，立即降级，不再等待。

## Incident 3
- Time: 2026-04-15
- Scope: ROS Python runtime
- Symptom: `ModuleNotFoundError: rclpy._rclpy_pybind11`。
- Root cause: shell 默认 `python3` 指向 Conda，与 ROS Humble Python ABI 不一致。
- Handling: 改用 `/usr/bin/python3` 运行 ROS Python 脚本。
- Prevention: 仓库规则固定 ROS Python 使用系统解释器。

## Incident 4
- Time: 2026-04-15
- Scope: launch verification
- Symptom: `debug.launch.py` 报 `_include() got an unexpected keyword argument 'launch_arguments'`。
- Root cause: helper 函数签名更新后未同步重装包，且源码一度缺参数。
- Handling: 修正 helper，重建 `dualarm_bringup`。
- Prevention: 修改 launch helper 后必须重装对应包再做运行验证。

## Incident 5
- Time: 2026-04-15
- Scope: planner verification
- Symptom: `/planning/plan_*` 返回旧“骨架规划成功”响应，与当前源码不符。
- Root cause: 旧 Python planner 进程和安装树残留污染 ROS graph。
- Handling: 清理旧进程、删除安装树残留、重新 build，并在干净会话重测。
- Prevention: 验证 planner 前先执行进程清理与 install tree 检查。

## Incident 6
- Time: 2026-04-15
- Scope: freshness gate smoke test
- Symptom: `robot_state 数据过期`。
- Root cause: mock scene / robot_state 时间戳过旧，且 managed scene 与 raw scene 混用。
- Handling: 使用当前时间戳持续发布 mock 数据；区分 raw scene 和 managed scene。
- Prevention: 所有 freshness 验证必须用持续 feeder，不用一次性旧时间戳消息。

## Incident 7
- Time: 2026-04-15
- Scope: 右臂现场模式判断
- Symptom: 曾把右臂蓝/青灯都作为“非正常自动状态”的可疑证据，导致模式判断依据不准确。
- Root cause: 灯色、拖动状态、机器人模式三个概念被混在一起解释；未区分“自动/手动模式”和“可拖动/不可拖动状态”。
- Handling: 现场已修正灯色语义：蓝色=自动模式且默认不可拖动；绿色=手动模式且不可拖动；青色=手动模式且可拖动。已同步更新 `STATE.md`、`findings.md`、`progress.md` 和当前 runbook。
- Prevention: 后续不得只凭灯色判断是否异常；必须同时核对拖动状态、机器人模式、`robot_mode_helper` 输出和 `/R/robot_state`。

## Incident 8
- Time: 2026-04-15
- Scope: 右臂 driver 运行环境
- Symptom: `ros2 launch robo_ctrl robo_ctrl_R.launch.py` 启动 `robo_ctrl_node` 时，报 `/usr/local/miniconda/lib/libstdc++.so.6: version 'GLIBCXX_3.4.30' not found`。
- Root cause: 本机 `ros2 launch` 路径命中了 Miniconda 的 `libstdc++.so.6`，覆盖了 ROS Humble / 系统 C++ 运行时。
- Handling:
  1. 先用直接启动 `install/robo_ctrl/lib/robo_ctrl/robo_ctrl_node` + `LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libstdc++.so.6` 完成临时绕过；
  2. 再在 `robo_ctrl_R.launch.py` / `robo_ctrl_L.launch.py` 的 `robo_ctrl_node` 与 `high_level_node` 上显式注入系统 `LD_PRELOAD`；
  3. 回归验证 `ros2 launch robo_ctrl ...` 成功，不再报 `GLIBCXX_3.4.30`。
- Prevention: 现场 ROS 2 真机验证优先使用系统 Python 和干净的系统 C++ 运行时；对受 Miniconda 污染的 C++ launch 节点，在 launch 层优先显式固定系统 `libstdc++.so.6`，并把二进制 `RUNPATH` 彻底清理列为后续环境治理项。

## Incident 9A
- Time: 2026-04-15
- Scope: YOLOv8 `.pt` GPU 接入
- Symptom: 初始系统 Python 里 `torch=2.6.0+cpu`，`torch.cuda.is_available()` 为 `False`，无法让 `best.pt` 走 GPU。
- Root cause: ROS 系统 Python 之前安装的是 CPU 版 PyTorch，不是 CUDA wheel。
- Handling: 使用 PyTorch cu124 wheel 将系统 Python 用户环境切换为 `torch=2.6.0+cu124`、`torchvision=0.21.0+cu124`，并验证 RTX 4060 GPU 可见。
- Prevention: 后续 `.pt` 现场推理前先检查 `torch.__version__` 和 `torch.cuda.is_available()`，不要只看 `nvidia-smi`。

## Incident 10A
- Time: 2026-04-15
- Scope: ROS Python ABI
- Symptom: 安装 CUDA 版 PyTorch 依赖后，`cv_bridge` 导入时报 `_ARRAY_API not found`，提示 NumPy 1.x/2.x ABI 不兼容。
- Root cause: pip 将 `numpy` 升级到 `2.2.6`，但 ROS Humble 的 `cv_bridge` 二进制是基于 NumPy 1.x ABI 构建的。
- Handling: 将系统 Python 用户环境中的 `numpy` 回退到 `1.26.4`，随后 `cv_bridge`、`cv2`、`torch.cuda`、`ultralytics` 同时验证通过。
- Prevention: ROS Humble + `cv_bridge` 环境下，不要让感知依赖链自动升级到 NumPy 2.x；安装 ML 包后必须复查 `cv_bridge`。

## Incident 9
- Time: 2026-04-15
- Scope: EPG50 夹爪串口联调
- Symptom: 插上夹爪后系统已出现 `/dev/ttyUSB0`，但 `epg50_gripper_node` 读状态持续 `响应超时`，只读 Modbus 探针扫描 ID `1..16` 与波特率 `115200/57600/38400/19200/9600` 均无响应。
- Root cause: 尚未闭环；当前更像物理层或设备参数层问题，而不是 ROS 包缺失。高概率方向包括夹爪未独立供电、RS485 A/B 接线问题、USB 转串口类型不匹配、通信地线问题、实际从站 ID/波特率不在默认范围。
- Handling:
  1. 确认 `/dev/ttyUSB0` 和 by-id 路径已存在，权限为 `root:dialout`；
  2. 确认 `epg50_gripper_ros` 包和 `epg50_gripper_node` 可执行文件存在；
  3. 用 by-id 路径短时启动节点验证端口可打开；
  4. 改用只读 Modbus 探针排除默认 ID 和常见波特率问题，避免节点退出时自动 `disable()` 干扰判断。
- Prevention: 夹爪动作命令前必须先通过只读状态帧验证通信；若无响应，不进入 `/epg50_gripper/command` 使能/开合测试，优先回到供电、RS485 转换器、A/B 接线、通信地线和厂家工具参数确认。

## Incident 10
- Time: 2026-04-15
- Scope: EPG50 新夹爪快速收口
- Symptom: 软件侧修复并重建后，`ros2 run epg50_gripper_ros epg50_gripper_node` 首次验证仍命中 Miniconda `libstdc++.so.6`，报 `GLIBCXX_3.4.30 not found`。
- Root cause: 与 `robo_ctrl` 相同，本机 `ros2 run` 路径仍可能被 Miniconda C++ 运行时污染。
- Handling:
  1. 保留代码修复并完成最小重建；
  2. 使用 `LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libstdc++.so.6` 运行 `epg50_gripper_node`；
  3. 确认自动端口解析、`disable_on_shutdown=false` 和初始化路径已生效；
  4. 继续只读验证，未进入控制命令阶段。
- Prevention: 现场运行 `epg50_gripper_node` 也需要沿用系统 `libstdc++.so.6` 兜底，直到运行时污染被统一清理。

## Incident 11
- Time: 2026-04-15
- Scope: EPG50 新夹爪最小控制尝试
- Symptom: 对从站 `9`、`10` 发送 `enable` 命令时，ROS service 能返回，但结果为 `夹爪使能失败`；节点日志显示 `Response size is less than 8 bytes.`。
- Root cause: 尚未闭环；这比“纯超时”更像链路上存在无效短帧或噪声回包，高概率方向包括 RS485 A/B、收发方向控制、通信地线、波特率/校验位不匹配、或转换器不适配。
- Handling:
  1. 保持 `disable_on_shutdown=false`，避免退出时引入额外控制动作；
  2. 仅做 `enable` 最小控制尝试，不继续做开合；
  3. 记录“短帧而非纯超时”这一新证据，供硬件排查排序。
- Prevention: 当驱动报 `Response size is less than 8 bytes.` 时，优先按“物理层有回传但协议不完整”处理，而不是继续盲试从站 ID。

## Incident 12
- Time: 2026-04-15
- Scope: EPG50 A/B 反接后复测
- Symptom: A/B 反接后，`/epg50_gripper/status` 对 `0/9/10` 仍均失败；`enable` 对 `9/10` 依旧报 `Response size is less than 8 bytes.`。
- Root cause: A/B 极性并非唯一问题；当前更可能是转换器类型、通信地线、收发方向控制、夹爪供电或协议参数不匹配。
- Handling: 已完成“原接法”和“反接 A/B”两种极性验证，结果均未形成有效 Modbus 帧；当前建议停止继续软件穷举，转查硬件。

## Incident 13
- Time: 2026-04-15
- Scope: EPG50-060 官方协议修正后回归
- Symptom: 官方手册确认蓝灯快闪对应“控制指令错误”，与当时现象一致；现有驱动与官方协议存在偏差。
- Root cause:
  1. 状态读取原先使用 `FC03`，而官方示例对 `0x07D0` 使用 `FC04`
  2. 使能流程缺少“先清使能再使能，再等待激活完成”的完整过程
  3. 动态力/速度寄存器字节顺序与官方手册不一致
- Handling:
  1. 将状态读取改为 `FC04`
  2. 使能改为清使能 -> 置使能 -> 轮询激活完成
  3. 修正动态力/速度字节顺序
  4. 重新 build `epg50_gripper_ros`
  5. 回归验证：`slave_id=9` 可读状态、可使能、可全开全关
- Prevention: 后续遇到 JODELL 蓝灯快闪，优先核对“功能码/寄存器/命令帧”是否与官方手册一致，不要只按通用 Modbus 经验猜测。

## Incident 14
- Time: 2026-04-16
- Scope: subagent orchestration
- Symptom: 两个实现 subagent 返回 `502 Bad Gateway`，分别负责网页控制台和文档骨架。
- Root cause: 上游平台错误，不是代码问题。
- Handling: 立即降级为主线程本地实现，已补 `competition_console_api`、`competition_console_web` 和迁移/控制面文档骨架。
- Evidence: 全量构建通过；网页 `npm run build` 和 Playwright smoke 通过。
- Prevention: 后续 wave 中若 subagent 写任务 502，直接转本地主线程或更小只读 reviewer，不等待同类 agent。

## Incident 15
- Time: 2026-04-16
- Scope: workspace migration build cache
- Symptom: 包迁移到 `src/` 后，CMake 报旧源路径不匹配，例如 `fairino_dualarm_planner`、`robo_ctrl`、`epg50_gripper_ros`。
- Root cause: 旧 `build/*/CMakeCache.txt` 仍指向迁移前路径。
- Handling: 先清受影响包 build cache；确认影响面扩大后，清理 `build/ install/ log/` 全部生成缓存并全量重建。
- Evidence: `./build_workspace.sh` 后续通过，`25 packages finished`。
- Prevention: 目录迁移后必须清构建缓存，不得直接信任增量 build。

## Incident 16
- Time: 2026-04-16
- Scope: competition_console_api shutdown
- Symptom: 手动 `Ctrl+C` 退出 API node 时出现 `rcl_shutdown already called`。
- Root cause: rclpy 上下文已被 shutdown 后又进入 finally 内再次 shutdown。
- Handling: 在 `competition_console_api_node.py` 中捕获 shutdown 异常，避免收口时报错。
- Evidence: 后续 API health smoke 正常返回。
- Prevention: 所有长期节点的手动停止路径要覆盖 Ctrl+C 收口。

## Incident 17
- Time: 2026-04-16
- Scope: web console Playwright test
- Symptom: 首次 `npx playwright test` 报 Chromium executable missing。
- Root cause: 本机新安装 Playwright 依赖后缺浏览器缓存。
- Handling: 先确认系统有 `google-chrome`，并将 Playwright config 指向 `channel: chrome`；随后 Playwright 依赖下载完成，网页 smoke 通过。
- Evidence: `npx playwright test --reporter=line` 输出 `1 passed`。
- Prevention: 网页测试优先使用现场实际 Chrome；必要时再安装 Playwright 浏览器缓存。

## Incident 18
- Time: 2026-04-16
- Scope: competition_console_api shutdown UX
- Symptom: 修复二次 shutdown 后，Ctrl+C 退出仍打印 `KeyboardInterrupt` traceback，污染验收日志。
- Root cause: `rclpy.spin()` 被中断时未显式吞掉 `KeyboardInterrupt`。
- Handling: 在 `main()` 中显式捕获 `KeyboardInterrupt`，保持安静退出。
- Evidence: 代码已更新到 `competition_console_api_node.py`。
- Prevention: 控制平面与长期运行节点的手动退出路径都要做“安静退出”处理。

## Incident 19
- Time: 2026-04-16
- Scope: PlanningScene runtime smoke
- Symptom: 在 `competition.launch.py + publish_fake_joint_states:=true` 下，`smoke_planning_scene_sync.py` 仍失败，表现为 `reserve failed`；同时 `planning_scene_sync` 日志持续提示 `apply_planning_scene 调用失败`。
- Root cause: 尚未闭环。已排除“旧进程未更新”和“left_camera TF tree 不连通”的旧问题；当前主嫌疑收缩为 `planning_scene_sync` 组装的 `PlanningScene diff` 仍与 MoveIt 服务语义不兼容。
- Handling:
  1. 已修复 `lost_but_reserved` 语义
  2. 已把 `planning_scene_sync` 改成只发真正 diff
  3. 已把 `ApplyPlanningScene` 调用从阻塞式改成异步 done-callback
  4. 已在无硬件模式下启用 `publish_fake_joint_states`，消除了相机 frame 到 world 的 TF 树断裂
- Evidence:
  - `competition.launch.py ... publish_fake_joint_states:=true` 运行日志
  - `smoke_planning_scene_sync.py` 输出 `reserve failed`
  - `planning_scene_sync` 持续输出 `apply_planning_scene 调用失败`
- Prevention: Wave 4 后续必须用最小 `PlanningScene diff` 请求与 `GetPlanningScene`/`monitored_planning_scene` 对照，逐步缩小到具体字段，而不是继续靠猜。

## Incident 20
- Time: 2026-04-16
- Scope: Wave 5 PlanningScene sync review
- Symptom: reviewer 指出 `planning_scene_sync` 在 `ApplyPlanningScene` 结果未确认前对 reserve/attach/release/detach 返回成功，且 attach diff 与 world REMOVE 存在冲突。
- Root cause:
  1. service path 与 subscription path 共用异步 apply 逻辑，未区分“可后台推送”和“必须同步确认”的场景
  2. world -> attached 迁移时，本地 diff 仍可能发送同 id world REMOVE
  3. 网页/API 和 checkpoint 还存在 cwd 依赖
- Handling:
  1. service path 改为等待 `ApplyPlanningScene` 结果再返回
  2. attached ADD 改为最小 id/link 语义，去掉冲突 REMOVE
  3. pending apply 会等待完成，避免 reserve 被前一轮 ADD 卡死
  4. checkpoint 与 console API 路径改为基于安装前缀推导仓根
  5. detector 默认路线改为 `detector_pt_node.py`
  6. ROI fallback 默认关闭
- Evidence:
  - 相关包增量构建通过
  - Wave 1 `smoke_resume_checkpoint.py` 通过
  - Wave 2 `smoke_camera_frames.py` 通过
- Remaining:
  - Wave 5 `smoke_planning_scene_sync.py` 尚未最终通过，下一窗口继续定位 pending apply / MoveIt diff 返回失败细节。

## Incident 21
- Time: 2026-04-16
- Scope: Wave 5 runtime cleanup
- Symptom: 验证前使用多条 `pkill -f` 清理旧 ROS 进程时，清理命令本身提前退出，命令返回 `code -1`。
- Root cause: 尚未完全闭环；高概率是 `pkill -f` 的匹配串命中了当前 shell 命令行自身，导致清理脚本进程被误杀。
- Handling:
  1. 停止继续使用宽泛 `pkill -f` 直接清理；
  2. 改用 `pgrep -af` 列候选，再排除当前 shell / exec 命令后用 `kill` 清理；
  3. 后续进程清理命令必须先打印候选，避免误伤当前验证命令。
- Evidence:
  - 首次清理命令输出为空，返回 `code -1`。
- Prevention: Wave 5 及后续 runtime smoke 前的清理脚本应使用候选列表 + PID 过滤，不再直接写多条宽泛 `pkill -f`。

## Incident 22
- Time: 2026-04-16
- Scope: Wave 5 PlanningScene runtime smoke
- Symptom: 清理旧进程后重新启动 `competition_core.launch.py` 并运行 `smoke_planning_scene_sync.py`，本次不再失败于 reserve，可进入 attach 阶段，但最终输出 `attach failed`；`planning_scene_sync` 日志显示 `同步等待 apply_planning_scene 结果超时`。
- Root cause: 尚未完全闭环；当前主嫌疑为两项叠加：
  1. `planning_scene_sync` 在 service callback 内同步等待同节点的 `ApplyPlanningScene` client future，但 client 与 service 都在默认 callback group，可能导致 rclpy future 回调饥饿或超时；
  2. attach diff 只发送 `AttachedCollisionObject` 的 `link_name + object.id + ADD`，未携带几何、header、touch_links，也未按 MoveIt 官方教程显式发送同 id world REMOVE。
- Handling:
  1. 计划给 scene services 和 apply client 使用 `ReentrantCallbackGroup`；
  2. 当时计划将 attach diff 改为完整 `AttachedCollisionObject ADD`，并尝试在 world->attached 转换时同步发送 world `CollisionObject REMOVE`；该路径后续已在 Incident 26 中被确认不应作为当前仓库的正式做法；
  3. 计划为 detach 保留 `AttachedCollisionObject REMOVE + world CollisionObject ADD` 的反向迁移语义；
  4. 补充 diff 摘要日志，避免后续只看到笼统超时。
- Evidence:
  - `smoke_planning_scene_sync.py` 输出：`attach failed`
  - `planning_scene_sync` 日志：`同步等待 apply_planning_scene 结果超时`
- Prevention: PlanningScene service 路径不得依赖默认互斥 callback group 内的同步等待；当前仓库的 MoveIt attached/world 迁移以 Incident 26 的最终结论为准，不在同一 diff 中混发同 id world REMOVE 与 attached ADD。

## Incident 23
- Time: 2026-04-16
- Scope: MoveIt shutdown during Wave 5 smoke
- Symptom: `Ctrl+C` 停止 `competition_core.launch.py` 时，`move_group` 在析构阶段再次出现 segmentation fault，日志包含 `Attempting to unload library while objects created by this loader exist`。
- Root cause: 尚未闭环；该现象与此前记录的 MoveIt 退出阶段稳定性问题一致，发生在验证收尾阶段，不是本次 `planning_scene_sync` attach 失败的直接原因。
- Handling:
  1. 记录为运行态噪声与后续环境治理项；
  2. 本轮 Wave 5 smoke 继续以启动后功能链路和脚本返回码为主要验收依据；
  3. 若后续 acceptance 需要干净退出日志，再单独治理 MoveIt shutdown。
- Evidence:
  - `move_group-11` 退出码 `-11`
  - 日志含 `Segmentation fault` 与 class_loader unload 警告。
- Prevention: 不把退出阶段 MoveIt segfault 误判为 PlanningScene diff 失败；若它影响自动化验收，再把 launch teardown 单独拆为环境 incident。

## Incident 24
- Time: 2026-04-16
- Scope: Wave 5 planning_scene_sync concurrency
- Symptom: 加入 `ReentrantCallbackGroup` 和完整 attach diff 后，`smoke_planning_scene_sync.py` 仍输出 `attach failed`，随后 `planning_scene_sync_node.py` 崩溃，traceback 指向 `_pending_apply_future.done()`，异常为 `AttributeError: 'NoneType' object has no attribute 'done'`。
- Root cause: 已定位。`ApplyPlanningScene` done-callback 会把 `self._pending_apply_future` 置空，而 service callback 同时在等待上一轮 pending apply 并反复访问同一个成员变量，形成竞态；同时 smoke 与 `scene_fusion` 对 `/scene_fusion/raw_scene_objects` 的双 publisher 会放大 ADD/REMOVE 抖动。
- Handling:
  1. 为 `_publish_and_sync` / service transaction 增加同步锁，避免 raw scene 更新和 service 状态迁移交错；
  2. 等待上一轮 pending apply 时改用本地 future 快照，避免成员变量被 done-callback 清空后再次访问；
  3. service 状态变更改成事务模式，失败时回滚 `_reservations/_attached_links` 并发布 rollback managed scene；
  4. 对不存在对象的 reserve/attach/release/detach 改为硬失败，避免空操作成功。
- Evidence:
  - traceback: `AttributeError: 'NoneType' object has no attribute 'done'`
  - 日志显示多个 `world_add/world_remove/attached_add` diff 在极短时间内交错。
- Prevention: rclpy service 内同步等待外部 service future 时，必须避免共享 future 成员被回调并发清空；authoritative scene 状态迁移必须串行化。

## Incident 25
- Time: 2026-04-16
- Scope: Wave 5 raw scene authority and smoke stability
- Symptom: 修复并发竞态后，`smoke_planning_scene_sync.py` 仍失败于 `attach failed`；日志显示 attach 前出现 `world_remove=['smoke_bottle']`，MoveIt 报 `Tried to remove world object 'smoke_bottle', but it does not exist in this scene.`。
- Root cause: 已定位。正式 core 中 `scene_fusion` 会持续向 `/scene_fusion/raw_scene_objects` 发布空 raw scene；smoke 脚本也向同一 topic 发布 `smoke_bottle`。两个 publisher 交错时，`planning_scene_sync` 会把一帧空 raw scene 当成权威空场景，立即发送 world REMOVE，导致后续 attach diff 试图移除已经不存在的 world object。
- Handling:
  1. 在 `planning_scene_sync` 增加 `object_retention_timeout`，默认保留短时 fresh cached object，避免一帧空 raw scene 立刻删除刚观测到的对象；
  2. 对超出 retention 但仍被 reservation/attachment 引用的对象，输出 `lost_but_reserved` / `lost_but_attached` 语义；
  3. 保持空场景可发布和 scene_version 递增，但将 world REMOVE 延后到对象超过 retention 且不再被任务层引用后。
- Evidence:
  - `planning_scene_sync` diff 日志：`world_remove=['smoke_bottle']` 紧跟 `attached_add=['smoke_bottle']`
  - MoveIt 日志：`Tried to remove world object 'smoke_bottle', but it does not exist in this scene.`
- Prevention: authoritative scene manager 不应把单帧空输入等同于立即删除世界对象；需要 retention / lost-but-* 状态承接感知短时丢失。

## Incident 26
- Time: 2026-04-16
- Scope: Wave 5 MoveIt attach diff semantics
- Symptom: attach 前已经通过 `ApplyPlanningScene ADD` 和 `GetPlanningScene` 确认 `smoke_bottle` world object 可见，但随后同一 diff 中发送 `world REMOVE(smoke_bottle) + attached ADD(smoke_bottle)` 时，MoveIt 仍返回失败，并打印 `Tried to remove world object 'smoke_bottle', but it does not exist in this scene.`。
- Root cause: 已定位为 MoveIt Humble 运行态语义与表面文档组合存在差异：`AttachedCollisionObject ADD` 对同 id world object 的处理会让同 diff 内显式 `CollisionObject REMOVE` 变成冲突操作。本项目此前“attached ADD + same id world REMOVE 冲突”的历史判断在运行态被再次确认。
- Handling:
  1. 保留 attach 前 `ApplyPlanningScene ADD + GetPlanningScene` 前置确认；
  2. 保留 attached ADD 的完整 geometry/header/touch_links；
  3. attach diff 不再同包发送同 id world REMOVE，避免 MoveIt 把同一对象迁移与移除判成失败；
  4. 后续用 smoke / GetPlanningScene 检查是否残留 world+attached 双份对象，必要时再做分步清理。
- Evidence:
  - `planning_scene_sync` 日志：`world_add=['smoke_bottle']` 后紧接 `world_remove=['smoke_bottle'], attached_add=['smoke_bottle']`
  - MoveIt 日志：`Tried to remove world object 'smoke_bottle', but it does not exist in this scene.`
- Prevention: 本仓库 MoveIt Humble attach 迁移优先采用“前置 world 可见确认 + attached ADD”，不在同一 diff 中混入同 id world REMOVE。

## Incident 27
- Time: 2026-04-16
- Scope: Wave 5 tools package rebuild
- Symptom: 增强 `smoke_planning_scene_sync.py` 后重建 `tools` 包失败，报 `failed to create symbolic link ... build/tools/ament_cmake_python/tools/tools because existing path cannot be removed: Is a directory`。
- Root cause: 已定位为 `ament_cmake_python` 旧构建产物目录阻塞 symlink-install，与此前 `robo_ctrl` 构建缓存污染问题同类，不是源码语法错误。
- Handling:
  1. 候选清理项限定为生成缓存：`/home/gwh/dashgo_rl_project/workspaces/dual-arm/build/tools/ament_cmake_python/tools/tools`；
  2. 删除该构建产物目录后重建 `tools`；
  3. 保留 Miniconda `libcurl` RPATH 警告为环境噪声，不作为本次失败根因。
- Evidence:
  - `/usr/bin/python3 -m py_compile src/tools/tools/scripts/smoke_planning_scene_sync.py` 通过；
  - `colcon build --packages-select tools` 失败于 symlink-install 旧目录。
- Prevention: 修改混合 CMake/Python 包后，如遇 symlink-install 目录阻塞，优先清理对应 `build/<pkg>/ament_cmake_python/...` 生成目录，而不是改源码绕过。

## Incident 28
- Time: 2026-04-16
- Scope: launch teardown noise
- Symptom: Wave 5 最后一轮停栈时，`ball_basket_pose_estimator_node.py` 在 shutdown 路径抛出 `RuntimeError: Unable to convert call argument to Python object`；同时 `move_group` teardown segfault 仍旧存在。
- Root cause: 尚未闭环。两者都发生在 `Ctrl+C` / launch teardown 阶段，不影响本轮 `planning_scene_sync smoke passed` 的 happy path 结论，但会污染总装退出日志。
- Handling:
  1. 记录为 teardown 噪声，不与 Wave 5 authoritative scene 结果混淆；
  2. 后续如果要做 clean-exit acceptance，需要把 `ball_basket_pose_estimator` 和 `move_group` 的退出稳定性单独立项治理。
- Evidence:
  - `ball_basket_pose_estimator_node.py` traceback：`Unable to convert call argument to Python object`
  - `move_group` 退出码 `-11`
- Prevention: 总装停栈阶段若出现节点析构异常，应记录为独立 teardown incident，避免反向污染功能烟测结论。

## Incident 29
- Time: 2026-04-16
- Scope: repo reorg closeout / subagent registry hygiene
- Symptom: 仓库重构已完成本地验证后，reviewer / verifier 的结果已返回，但对应只读 sidecar 仍保持开启状态，`STATE.md` 与 `SUBAGENT_REGISTRY.json` 一度仍显示“待复核”，容易让后续窗口误判为仍需继续等待。
- Root cause: 长链路任务在 closeout 阶段先完成了代码与验证，没有同步完成 subagent 关闭和过程资产回填，导致状态记录滞后于真实进展。
- Handling:
  1. 关闭 reviewer / verifier sidecar，确认最终结果已收集；
  2. 将 reviewer 结论 `no P0/P1 findings` 与 verifier 验证摘要回填到 `STATE.md`；
  3. 更新 `SUBAGENT_REGISTRY.json`、`RETRO.md` 和 `FINAL_SUMMARY.md`，使 closeout 状态与真实任务进展一致。
- Evidence:
  - reviewer 最终结论：`no P0/P1 findings`
  - verifier 最终结论：README 覆盖、路径治理、build groups、包发现、launch smoke、workspace acceptance 均通过，包 README 轻微缺口已补
  - 已执行 closeout：`close_agent(019d970b-e8ec-7392-a635-66234093e43f)`、`close_agent(019d970b-e939-7cf0-9148-536c6d653ca5)`
- Prevention: 长链路多 subagent 任务在进入最终提交前，必须先做一次“sidecar 关闭 + registry 回填 + state 回填”的收口动作，避免完成态仍显示为进行中。

## Incident 30
- Time: 2026-04-28
- Scope: v1 hardware-interface hardening verification
- Symptom: `colcon build --base-paths packages --packages-select ... evidence_manager` 首次构建新包时失败，`ament_package_xml.cmake` 调用 `/usr/local/miniconda/bin/python3` 后报 `ModuleNotFoundError: No module named 'catkin_pkg'`。
- Root cause: 当前 shell 默认 Python 被 Conda 抢占；新 CMake 包首次配置时 CMake 发现了 Conda Python，而 ROS Humble 的 `catkin_pkg` 安装在 `/usr/lib/python3/dist-packages`。
- Handling:
  1. 在 `packages/ops/evidence_manager/CMakeLists.txt` 中明确优先使用 `/usr/bin/python3` 作为 `Python3_EXECUTABLE`；
  2. 重新执行相关包构建，`10 packages finished`。
- Evidence:
  - 失败日志：`execute_process(/usr/local/miniconda/bin/python3 ... package_xml_2_cmake.py ...) returned error code 1`
  - 验证命令：`colcon build --base-paths packages --packages-select dualarm_interfaces dualarm_bringup detector_adapter depth_handler scene_fusion planning_scene_sync fairino_dualarm_planner execution_adapter dualarm_task_manager evidence_manager`
  - 最终输出：`Summary: 10 packages finished`
- Prevention: 新增 ament CMake 包时，若当前环境可能被 Conda 抢占，应按项目规则固定 ROS Humble system Python 或用 `/usr/bin/python3 -m colcon`/系统环境执行构建。

## Incident 31
- Time: 2026-04-28
- Scope: frame-alignment smoke attempt
- Symptom: `bash -lc 'source install/setup.bash && /usr/bin/python3 packages/tools/tools/scripts/smoke_depth_handler_future_tf.py'` 本轮没有在预期时间内退出，遗留 `smoke_depth_handler_future_tf.py` 与 `depth_handler_future_tf_test` 进程。
- Root cause: 未闭环。该旧 smoke 脚本当前测试的是 future TF fallback，参数仍使用 `require_depth_aligned_detections:=false`，与本轮 v1 默认 frame-alignment gate 验收目标不完全一致；本轮未继续扩展该脚本。
- Handling:
  1. 终止遗留 PID `28893` 与 `29009`；
  2. 再次检查无 `ros2 launch|move_group|fairino_dualarm_planner|competition_console_api|planning_scene_sync|depth_processor_node|mock` 残留；
  3. 本轮不把该 smoke 记为通过证据，改以新增 v1 静态合同测试、launch 默认值、接口展示和非法 depth fail-fast 作为可审计证据。
- Evidence:
  - 残留进程检查曾显示：
    - `/usr/bin/python3 packages/tools/tools/scripts/smoke_depth_handler_future_tf.py`
    - `depth_processor_node --ros-args -r __node:=depth_handler_future_tf_test ...`
  - 清理后进程检查只剩当前 `pgrep` 命令本身。
- Prevention: 后续若要验收 frame alignment，应新增专用 smoke：`require_depth_aligned_detections=true` 时错 frame 必须拒绝，正确 aligned frame 必须发布 scene object；不要复用 future TF fallback smoke 作为 alignment gate。

## Incident 36
- Time: 2026-05-06
- Scope: Gazebo full sim + quick hybrid implementation handoff
- Symptom: 用户两次中断当前长实现回合，要求“继续”并保存当前进度、生成新窗口接续提示词；当前仓库已有大量半实现改动，但尚未完成 quick hybrid 接线、构建或 runtime smoke。
- Root cause: 本轮范围同时覆盖正式 Gazebo 主链、`execution_adapter(sim)`、`dualarm_task_manager`、`dualarm_simulation`、quick hybrid computed-template，多模块半成品如果只保存在聊天中，新窗口会误判为已完成或重复实现。
- Handling:
  1. 已把当前断点写入 `STATE.md`。
  2. 已新增详细进度报告：`docs/operations/reports/2026-05-06-gazebo-full-sim-quick-hybrid-progress.md`。
  3. 本 incident 明确标记当前状态为半实现，禁止声明 Gazebo full-chain、`/competition/run`、quick hybrid runtime 已验收。
  4. 保存前执行旧进程检查，未发现需要接管的真实 ROS/Gazebo 长进程，只匹配当前 sandbox/pgrep 命令本身。
- Evidence:
  - `git status --short` 显示本轮新增/修改：`packages/simulation/dualarm_simulation/**`、`competition_gazebo_full.launch.py`、`execution_adapter_node.py`、`dualarm_task_manager_node.py`、quick computed 模块与 quick 配置。
  - `STATE.md` 已新增 `2026-05-06 Gazebo 正式主链仿真闭环 + quick hybrid 接续断点`。
  - `docs/operations/reports/2026-05-06-gazebo-full-sim-quick-hybrid-progress.md` 已记录未完成清单和下一步命令。
- Prevention:
  - 新窗口必须先读 `STATE.md`、本 incident、进度报告和 `IMPLEMENTATION_BREAKPOINTS.md`。
  - 继续实现时先补 quick hybrid preflight/executor 接线，再跑 py_compile/pytest/build；不要直接启动 Gazebo full-chain。
  - 当前任务不再开启非必要 subagent；按本地 checklist 验证。

## Incident 38
- Time: 2026-05-06
- Scope: real hardware contact calibration / URDF gripper offset interpretation
- Symptom: 现场确认所有桌角/桌面接触都是夹爪指尖触桌后，用户指出完整模型 URDF 可用于计算指尖到 TCP 距离；若直接把当前 MoveIt `left_tcp/right_tcp` 当作触桌点，或直接把 vendor gripper mesh 当作 active URDF link，都会导致标定点解释错误。
- Root cause: 当前 active 双臂 robot description 只接到 `left_tcp/right_tcp`，没有正式 `gripper_Link`/`fingertip` link；vendor SDK `fr3v6.urdf` 中有 `j6_Link -> gripper_Link` 和 gripper mesh，但没有接入本项目 active MoveIt URDF/SRDF。历史 `Lend/Rend` 静态 TF 更符合已采集触桌点的 base-z 一致性，但仍只是候选。
- Handling:
  1. 用 `xacro fairino_dualarm.urdf.xacro` 搜索 active robot description，确认无 gripper/fingertip link；
  2. 读取 vendor `fr3v6.urdf`，确认 `j6_Link -> gripper_Link = [0,0,0.107] m + Rz(90deg)`；
  3. 解析 vendor `gripper.dae` 与 `gripper1.stl` bbox，确认 mesh 范围约 `x=[-37.5,37.5] mm`、`y=[-76.7,76.7] mm`、`z=[-10.9,154.0] mm`；
  4. 将 vendor mesh 指尖候选与 `Lend/Rend` 历史 TF 对已采样触桌点做 base-z 交叉验证，本轮保留 `Lend/Rend` 为优先候选指尖偏移，不标为 verified。
- Evidence:
  - active xacro 生成结果只含 `left_tool0/left_tcp/right_tool0/right_tcp`，无 `gripper_Link` / `finger` / `fingertip`；
  - `fairino_dualarm.srdf` 中 `left_arm/right_arm` tip_link 为 `left_tcp/right_tcp`；
  - vendor mesh bbox 与历史触桌数据对比已写入 `docs/operations/reports/2026-05-06-real-hardware-debug-log.md`。
- Prevention:
  - 实机接触标定不得把 controller TCP 直接当作指尖接触点。
  - 不得把 vendor SDK gripper mesh 自动视为当前 active MoveIt 工具模型；必须先确认它已接入 robot description 或明确标为离线几何候选。
  - `Lend/Rend` 在三点/四点残差验收前只能叫 candidate，不能叫 verified。

## Incident 39
- Time: 2026-05-06
- Scope: P1 crash-risk repair verification limits
- Symptom: P1 修复要求构建 `fairino3_v6_planner`，但 `colcon build --base-paths packages --packages-select ... fairino3_v6_planner ...` 输出 `ignoring unknown package 'fairino3_v6_planner'`；直接指定 `--base-paths packages/planning/legacy/fairino3_v6_planner` 仍是 `Summary: 0 packages finished`。
- Root cause: 已定位。`packages/planning/legacy/fairino3_v6_planner/COLCON_IGNORE` 使 legacy planner 不被当前 colcon 工作区发现；这是当前仓库基线状态，不是本轮 C++ 语法错误的直接证据。
- Handling:
  1. 未删除或绕过 `COLCON_IGNORE`，避免把 legacy 包重新激活为结构性变更。
  2. 对 legacy planner 只保留源码合同验证：`current_plan_` 改为局部 plan + mutex 快照。
  3. P1 报告将 #15 标记为“环境阻塞/已修改待验证”，不声明关闭。
  4. 其他活跃核心包和 detector 已分段构建，避免 legacy blocker 掩盖核心结果。
- Evidence:
  - `colcon build --base-paths packages --packages-select robo_ctrl depth_handler fairino_dualarm_planner planning_scene_sync fairino3_v6_planner competition_console_api`：活跃 5 包构建通过，stderr 含 unknown package warning。
  - `find packages/planning/legacy/fairino3_v6_planner -maxdepth 3 -type f -name COLCON_IGNORE -print`：命中 `packages/planning/legacy/fairino3_v6_planner/COLCON_IGNORE`。
  - `/usr/bin/python3 -m pytest -q tests/unit/test_p0_safety_contracts.py tests/unit/test_p1_crash_contracts.py`：`13 passed in 0.03s`。
- Prevention:
  - 对 `legacy/**` 下带 `COLCON_IGNORE` 的包，代码审查修复计划必须先判定它是活跃运行包、待复活包还是归档包。
  - 不能把源码合同测试或 `colcon` unknown warning 当作 legacy 包构建通过。
  - 并发项没有 TSAN/stress 证据时，只能标为“已修改待验证”。

## 2026-05-06 P1 runtime stress evidence note
- Scope: P1 crash-risk repair evidence update
- Summary: 本次继续执行没有新增失败 incident；补充了 KDTree atomic claim、PlanningSceneSync cache、competition_console stop 三项可重复 stress pytest，并重新运行 py_compile、P0/P1 pytest、`git diff --check`、核心 P1 包构建和 detector 单独构建。
- Evidence:
  - `/usr/bin/python3 -m pytest -q tests/unit/test_p1_runtime_stress.py`：`3 passed in 9.49s`。
  - `/usr/bin/python3 -m pytest -q tests/unit/test_p0_safety_contracts.py tests/unit/test_p1_crash_contracts.py tests/unit/test_p1_runtime_stress.py`：`16 passed in 9.32s`。
  - `colcon build --base-paths packages --packages-select robo_ctrl depth_handler fairino_dualarm_planner planning_scene_sync competition_console_api`：`5 packages finished [3.93s]`。
- Remaining: planner scene/robot state、legacy planner、depth_processor、Servo failure injection 和 LwDetr CUDA/TensorRT runtime 仍缺对应运行证据，不能标为已关闭。

## Incident 40
- Time: 2026-05-06
- Scope: right-arm camera visualization / camera identity
- Symptom: 按历史记录把 `CP1E5420007N` `/dev/video16` 作为右相机启动后，用户现场指出当前打开的是左机械臂相机；同一路 `/dev/video10` 深度在完整 bridge 启动时多次报 `VIDIOC_QBUF` / `无法通过 V4L2 打开 Z16 深度设备`。
- Root cause: 当前相机物理归属不能只依赖历史 serial/path 映射，必须以现场画面确认；同时 Orbbec Gemini 335 在当前 V4L2/OpenCV 路径下存在彩色+Z16 深度双流冲突，最小复现显示彩色和深度同时打开时彩色可读但深度读帧失败，单独深度可读。
- Handling:
  1. 停止误命名为 `right_camera` 的 `/dev/video16` 链路，避免右/左命名污染。
  2. 将另一台 Orbbec `CP02653000G2` 的 `/dev/video6` 作为右机械臂候选彩色口启动。
  3. 当前只保留彩色-only + detector overlay，暂不声明右深度/table overlay 成功。
  4. 坐标系和双臂协作只给出安全边界，不声明 verified 或可运动。
- Evidence:
  - `/right_camera/color/image_raw`：约 `13.9 Hz` 到 `15.0 Hz`。
  - `/detector/right/detections/image`：约 `15.0 Hz`。
  - `/detector/right/detections` 一帧包含 class id `2/0/4/3`，最高置信度约 `0.85`。
  - 运行日志目录：`.codex/tmp/runtime/right-arm-candidate-cp026-color-viz-domain0-20260506-215108`。
- Prevention:
  - 后续相机调试必须把“设备 serial/path 映射”和“现场画面归属”分开记录；现场画面优先。
  - 未经现场确认，不把 `/dev/video*` 直接命名为 left/right verified。
  - Orbbec 双流问题未修复前，右相机可视化优先走 color-only；深度链路单独验证并记录。

## Incident 41
- Time: 2026-05-06
- Scope: right arm readonly robo_ctrl bringup / process supervision
- Symptom: 为尝试机械臂控制前置检查，后台启动左右或右臂 `robo_ctrl_node` 时未形成可用 `/R/robot_state` 证据；直接后台方式进程消失且日志为空，`nohup` 后台方式日志停在 `正在连接机器人，IP: 192.168.58.3` 后退出。受控前台会话同一命令可成功连接右臂并发布 `/R/robot_state`。
- Root cause: 未完全定位。当前可确认后台方式不是可用证据入口；SDK 连接/进程监护与非交互后台运行存在差异，不能把后台启动命令返回 PID 当作节点可用。
- Handling:
  1. 停止未发布状态的后台 `robo_ctrl_node` 进程。
  2. 改用受控前台会话直接运行安装树 `robo_ctrl_node`。
  3. 验证 `/right_robo_ctrl` 成功连接 `192.168.58.3`，`/R/robot_state` 约 `4.995 Hz`，单帧 `motion_done=true`、`error_code=0`。
  4. 终止受控前台会话，确认 `/right_robo_ctrl` 从 `ROS_DOMAIN_ID=0` 消失。
- Evidence:
  - 成功命令使用 `/home/gwh/dual-arm/install/robo_ctrl/lib/robo_ctrl/robo_ctrl_node --ros-args -r __node:=right_robo_ctrl -p robot_ip:=192.168.58.3 -p robot_name:=R -p state_query_interval:=0.2`。
  - `/R/robot_state` 单帧 `tcp_pose=[-31.8716, -158.0354, 640.1603, -142.5021, -14.3388, 131.4828]`，`motion_done=true`，`error_code=0`。
  - 详细记录见 `docs/operations/reports/2026-05-06-real-hardware-debug-log.md`。
- Prevention:
  - 实机控制前置状态接入不能只看后台 PID；必须验证 ROS node、topic hz 和至少一帧状态。
  - 若后台 launch/run 没有明确日志和 topic 证据，改用受控前台会话或正式 launch 并保留日志。
  - 任何运动命令前仍需重新确认状态 fresh、error_code 为 0、现场安全和操作者授权。

## Incident 42
- Time: 2026-05-06
- Scope: right-arm single-arm grasp precheck / depth and extrinsics safety gate
- Symptom: 用户要求基于右臂深度相机和既有内容尝试单臂夹取，且确认现场无人、右相机视野有障碍物。no-motion 预检查能检测到 `cocacola` 并读取右侧 Z16 原始深度，但无法生成可信抓取位姿或安全距离，真实夹取被拒绝。
- Root cause:
  1. `/dev/video0` Z16 深度单位存在冲突：仓内默认 `v4l2_depth_unit_to_mm_scale=0.125` 会把目标 ROI median 解释为约 `84.5 mm`，而 raw=mm 解释为约 `676 mm`。
  2. 当前缺可信 `Rtcp/right_tcp -> right_camera_depth_frame` 外参，历史静态 TF 只有 `Ltcp -> camera_link`。
  3. color/depth 是交替快照且未正式对齐，bbox-to-depth ROI 只能作为调试估计。
  4. 右相机视野有障碍物，但没有 verified 三维避障/碰撞模型。
- Handling:
  1. 停止右侧 color-only 可视化/检测链路以释放深度设备。
  2. 右臂 `robo_ctrl_node` 只读接入成功，采到 `/R/robot_state`，未调用任何运动服务。
  3. 用原生 V4L2 ioctl/mmap 读取 `/dev/video0` Z16 帧，绕过 OpenCV V4L2 打不开和 OBSENSOR 全 0 的问题。
  4. 用 YOLOv8 `.pt` 在右彩色快照检测到 `cocacola`，confidence `0.894`。
  5. 因深度单位、外参和对齐均未 verified，按 fail-closed 拒绝真实夹取/靠近/合爪。
- Evidence:
  - `/R/robot_state`：约 `4.995 Hz`，`motion_done=true`，`error_code=0`。
  - 检测目标：`cocacola`，class id `2`，confidence `0.894`，bbox center `(358.8, 277.4)`。
  - 深度 ROI raw p05 `555`、median `676`。
  - 调试输出目录：`.codex/tmp/runtime/right-grasp-precheck-20260506/`。
- Prevention:
  - 真实夹取前必须先校准右 Z16 单位比例，并固定到运行配置。
  - 右臂 eye-in-hand 夹取必须先建立 `right_tcp/Rtcp -> right_camera_depth_frame` verified 外参。
  - 未完成 color/depth 对齐前，不能把彩色 bbox 直接当成抓取点。
  - 有障碍物时，不能仅凭“现场无人”绕过深度/外参/避障门控。

## Incident 46
- Time: 2026-05-07
- Scope: right-arm J6 camera orientation adjustment
- Symptom: 用户指出 J6 方向不正、相机不在上方；尝试 `/R/robot_move` MoveJ 保持 J1-J5 不变、将 J6 从约 `0.134deg` 改到 `45deg`，服务返回 `success=false`，message 为 `执行移动命令失败，错误码: 14`，随后 `/R/robot_state` 短时进入 `motion_done=false`、`error_code=1`。
- Root cause: 未完全定位。可确认直接 MoveJ 到该 J6 目标不是当前安全可用控制路径；该错误可能与当前构型、逆解、关节目标约束或 SDK MoveJ 参数组合有关，不能继续硬推同一路径。
- Handling:
  1. 立即停止继续发送关节 MoveJ。
  2. 编译并运行直连 SDK helper，执行 `StopMotion()` 与 `ResetAllError()`。
  3. `RPC ret=0`、`StopMotion ret=0`、`ResetAllError ret=0`、`CloseRPC ret=0`。
  4. 恢复后连续 5 帧 `/R/robot_state` 均为 `motion_done=true`、`error_code=0`。
  5. 改用 `ServoMoveStart + /R/robot_servo_joint + ServoMoveEnd` 小步增量 J6 `+10deg`，J6 到约 `10.16deg`，末尾状态正常。
- Evidence:
  - 失败服务返回：`执行移动命令失败，错误码: 14`。
  - Stop/reset helper：`StopMotion ret=0`、`ResetAllError ret=0`。
  - J6 servo 成功：`ServoMoveStart命令执行成功`、`ServoJ开始执行`、`ServoMoveEnd命令执行成功`。
- Prevention:
  - 后续调整腕部相机朝向优先使用小步 `ServoJ` 或 SDK `StartJOG`，并由现场视觉确认方向后再叠加。
  - 直接关节 MoveJ 失败后必须先 StopMotion/ResetAllError 并采样 5 帧，不得马上换另一个大角度重试。
  - J6 方向未知时每步不超过 `10deg`，先判断方向，再继续。

## Incident 47
- Time: 2026-05-08
- Scope: production runtime authority closure / Quick and console bypass
- Symptom: 架构审查发现生产入口与 active workspace 仍可能绕过唯一生产链：`competition_integrated.launch.py` 默认启动 `competition_console_api_node.py`，console API 能创建 `/L|R/robot_move*`、`/L|R/robot_servo_joint` raw motion clients；`quick_competition` 仍位于 `packages/` 且 build group 中包含 quick/full 路径，可能被 active colcon/CI 带回。
- Root cause: raw motion 权限边界之前按目录粗放豁免，Quick 被当作 launch 或 docs 问题处理，未把 active package、CI、console API constructor、debug/manual tools 和 camera fact source 统一纳入运行权威边界。
- Handling:
  1. 固定唯一生产链为 `scene_fusion -> /planning/* -> /execution/* -> /competition/run`。
  2. 将 `robo_ctrl` 限定为 driver/provider，将 `execution_adapter` 限定为唯一 production raw robot motion service caller。
  3. `competition_integrated.launch.py` 新增 `start_console_api` 且默认 `false`；console production 模式不初始化 raw motion clients，raw jog 只允许 debug token gate。
  4. 将 `quick_competition`、quick config、quick scripts 和旧 quick tests 归档到 `archive/quick_competition_2026-05-08/`，归档根放置 `COLCON_IGNORE`。
  5. 新增 `scripts/check_runtime_authority.py` 并接入 software CI，覆盖 raw motion、IK、launch、Quick archive、motion CLI 和 camera facts。
  6. 相机 production profile 改为 stable profile source，`/dev/video*` 仅允许 debug ephemeral override。
- Evidence:
  - `PYTHON_BIN=/usr/bin/python3 bash scripts/ci/software_check.sh`：path/readme/runtime authority checks passed，`60 passed`，8 packages built，15 colcon tests，web build 与 Playwright passed。
  - `python3 scripts/check_runtime_authority.py --launch-contracts`：passed。
  - production `--show-args` 显示 `start_console_api` 默认 `false`，camera auto scan 默认 `false`。
  - mock/no-motion smoke 使用 `start_hardware:=false` 且未调用 `/competition/run`。
- Prevention:
  - 以后新增 motion-capable 入口时，必须先进入 runtime authority checker 分类，不允许靠 README 约定防旁路。
  - active `packages/` 内不得保留 legacy hardware bypass package；归档包必须在归档根有 `COLCON_IGNORE`。
  - production camera profile 不得把 `/dev/video*` 写成 verified fact，只能使用 serial、usb_port、by-id 或 by-path 及校准状态。
