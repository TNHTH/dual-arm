# dual-arm 任务复盘

更新时间：2026-05-08

## 2026-05-08 双臂连接与双相机瓶盖采样复盘

### Facts
- `enp5s0` 已恢复到 `192.168.58.10/24`，左右机械臂 `192.168.58.2/.3:8080` 可达。
- 左右 `robo_ctrl` 只读状态均约 `4.996 Hz`，`motion_done=true`、`error_code=0`。
- 左相机 `/dev/video6` + `/dev/video0`、右相机 `/dev/video14` + `/dev/video8` 均完成 RGB/Z16 采样。
- `cap_p1`、`cap_p2`、`cap_p3`、`cap_p4` 左右深度 ROI 均有效，四点可计算候选刚体变换，但点集几乎共面，仍不能标记 verified。
- `cap_p5` 独立验证误差约 `83.8 mm`，候选变换未通过验证；该点附近有浅色长条物体，存在混合深度风险。
- 重审后将目标语义明确为瓶盖顶部中心 `cap_top_center`；瓶盖高度不影响相机到相机的同点刚体拟合，只影响后续桌面接触点换算。

### Worked
- 把相机采样拆成 `capture` 和 `analyze` 两步，先固化 raw depth，再基于同一份采样选择像素，避免重拍导致瓶盖位置变化。
- 采样脚本只读设备文件，不依赖 ROS graph，不暴露运动或夹爪 command 入口。
- 红色阈值辅助定位瓶盖中心，再人工查看 overlay 验证标点落在瓶盖上。

### New Rules
- 双相机共同点标定不能用单点或两点直接求 6DoF；至少采 4 个非共线点，并额外保留 1 个独立验证点。
- 桌面瓶盖点天然容易近似共面；即使 4 点可拟合，也必须看点集奇异值和独立验证误差，不能只看 RMSE。
- 独立验证点周围不要贴近其他物体或边缘；ROI 有效像素明显偏少、raw min 离群时应记录为混合深度风险并重采。
- 不要因为用户提醒“瓶盖有高度”就盲目扣高度；先判断当前拟合点是 cap top、cap side、还是 table contact。只有 table contact 才需要桌面法向和瓶盖高度。
- 每个共同点必须保存 RGB、depth raw、depth visualization、capture JSON、pixel overlay 和 analysis JSON。
- 深度单位和内参来源必须跟随每个 JSON 记录；`raw=mm` 在正式校准前只能是 operator-selected。

## 2026-05-07 右臂脚本化靠近收口与架构审查复盘

### Facts
- 右臂通过 MoveIt/`execution_adapter` 完成两段脚本化 `pregrasp` 靠近和一段视野恢复，执行均闭环到 `motion_done=true`、`error_code=0`。
- 用户明确目标居中/TCP 对齐不应作为默认硬门禁，可以作为参考；完成夹取任务优先。
- 靠近后目标持续贴到画面边缘，depth ROI 一度从约 `0.220 m` 跳到约 `0.802 m`，说明 bbox-to-depth ROI 混入背景。最终未合爪，夹爪保持打开。
- external review 架构审查指出项目存在正式主链、Quick 实机旁路、Gazebo 仿真链三套执行路径，以及感知、配置、launch、执行层和实机脚本重复。

### Worked
- 把 alignment 从默认硬阻断改成 advisory，符合用户“夹取任务第一位”的策略，同时保留 JSON 风险输出。
- 每段运动后重采视觉和深度，及时发现目标贴边和深度异常，没有继续合爪。
- 一次性退回脚本因 `scene_stale` 失败后，改回标准脚本发布 fresh scene，没有继续扩大临时脚本。
- 收口时停止 ROS 控制图并写入下窗口提示词，降低下个窗口误触运动服务的风险。

### Waste / Risk
- 右臂实机脚本目前通过 JSON 文件串联，与正式 ROS 感知/执行主链割裂，容易重复实现 camera/depth/YOLO/geometry 逻辑。
- 在目标贴边时继续使用 bbox 中心深度会很脆弱，可能把背景深度当目标深度。
- 自写一次性 planner 脚本如果不发布 fresh scene，会触发 planner freshness gate，不能直接替代标准入口。

### New Rules
- alignment 可是 advisory，但目标可见性不是 advisory：bbox 贴边、深度 median 大跳变、ROI 混背景时不合爪，先恢复视野或重新检测。
- 每次实机接近后必须重新采集 precheck；禁止用旧 JSON 直接继续合爪。
- 合爪成功只能由夹爪状态证明：EPG50 `gobj in {1,2}` 才能声明抓到，`gobj=3` 不能算成功。
- 右臂实机脚本后续应收口到主链：优先复用 `orbbec_gemini_bridge`、detector、depth_handler 和 `execution_adapter`，不要继续扩大 tools 下的裸 ioctl/JSON 串联路径。
- 下个窗口先处理 external review 架构审查中的重复/分裂问题，再恢复硬件夹取；架构清理阶段不触发真实运动。

## 2026-05-07 右臂深度建模预检与实践控制复盘

### Facts
- `right_arm_grasp_precheck.py` 已能读取右彩色和右 Z16 深度，运行本地 YOLO，并输出目标 3D bbox、障碍物 bbox、candidate TCP point 和 gate JSON。
- 本次 no-motion 预检中 `target_3d_bbox_camera_m.valid=true`，但 `obstacle_model.clearance_gate.passes=false`，右相机外参仍是 candidate。
- 当前只允许继续做与目标无关的安全方向小步 jog，不能自动靠近或自动抓取。

### Worked
- 把“深度图像可以用于建模和避障”的要求落成脚本输出，而不是聊天手算。
- 静态扫描脚本源码，确保 no-motion 预检入口没有动作、servo、夹爪 command 或比赛 action 调用。
- 在真实运动前先把视觉 gate 和现场安全确认拆开，避免把用户“今天要动起来”误解成“忽略 gate 自动抓取”。

### New Rules
- 深度 gate 通过和机械臂 jog 许可是两个不同结论：深度 gate 失败时仍可做安全方向 jog，但不得朝目标运动。
- 右相机外参只要还是 candidate，`auto_grasp_allowed` 必须 fail-closed。
- 实机实践任务可以设置“最低运动验收”和“自动抓取 stretch goal”，不能把 stretch goal 当硬目标硬推。

## 2026-05-07 右臂小步运动停稳与脚本化几何复盘

### Facts
- 右臂曾执行一次低速 `Z +3.0 mm` 增量测试，`/R/robot_move_cart` 返回 `success=true`。
- 服务返回后 `/R/robot_state` 多次显示 `motion_done=false`、`error_code=0`，TCP `z` 慢速接近目标。
- 直连 SDK `StopMotion()` 返回 `ret=0` 后，连续 5 帧 `/R/robot_state` 为 `motion_done=true`、`error_code=0`，TCP `z` 稳定在约 `643.086 mm`。
- 用户明确要求后续几何计算全部由脚本计算，不能由助手手算；右深度本轮按 `raw=mm` 使用。

### Worked
- 在 `motion_done=false` 时停止继续下发运动命令，先收口停止路径和状态证据。
- 用直连 SDK `StopMotion()` 作为明确 stop 能力验证，比尝试继续等待或叠加新运动更稳。
- 把本次真实 motion 和 stop 结果写入 `STATE.md`、报告、断点和错误记录，避免后续窗口误读为仍是纯 no-motion 任务。

### Waste / Risk
- `RobotMoveCart` 服务成功返回容易被误读成运动完成；实际必须以 `/R/robot_state.motion_done` 和 TCP 稳定采样闭环。
- 视觉目标和深度 ROI 已有结果，但没有脚本化外参/内参/坐标转换前，人工手算会扩大误差和责任边界。
- 右相机到右 TCP 外参仍只是候选，参考左臂参数不能升级为 verified。

### New Rules
- 实机运动服务返回成功后，必须再采样 `robot_state`，确认 `motion_done=true`、`error_code=0` 和 TCP 稳定，才允许进入下一阶段。
- 凡是用户要求“脚本计算”的几何链路，聊天中只引用脚本 JSON 输出，不做手工坐标、距离或外参推导。
- `raw=mm` 这类现场单位约定应作为脚本参数和输出 metadata 记录；未经标定不能提升为全局 canonical 深度单位。
- 右臂 eye-in-hand 夹取前，脚本必须同时输出候选结果和 gate 结论；gate 未通过时不允许自动靠近或合爪。

## 2026-05-06 P0 安全代码审查修复

### Worked
- 先限定 P0 写集，避免把已有 Gazebo/quick/perception 脏变更卷入本轮。
- `stop_all()` 没有通用停止服务时选择 fail-closed 并返回失败，比零速运动或假成功更符合安全边界。
- 急停 gate 默认状态未知即拒绝 motion/start 类服务，同时允许 ServoEnd/stop 类命令通过，避免把停止路径也挡掉。
- P0 单测使用静态合同和 monkeypatch mock，不依赖 ROS graph 或真实硬件。

### Waste
- `legacy_fairino_bridge.py` 原有 `stop_all()` 记录 `dual_arm` 会触发 arm normalize 异常；这类安全路径需要单测覆盖，即使平时很少走。
- `dualarm` 包构建仍有既有 warning，虽不阻塞 P0，但后续 P1/P2 不应把 warning 当作已关闭问题。

### Trigger Redesign
- signal：安全 stop 路径没有明确 `StopMotion/abort/servo-stop` 能力。
- route：先 fail-closed，拒绝后续软件运动/执行器动作并向调用方返回失败。
- guard：不能用零速运动或 fake success 冒充停止；未授权前不做实机运动验证。
- action：用 mock/no-motion 测试证明 fail-closed 行为，再单独登记缺失的真实停止服务 blocker。

## 2026-05-06 默认域污染处理与左深度相机检测可视化

### Worked
- 清理前先按 `ROS_DOMAIN_ID` 核对 PID，避免误杀另一个窗口 `ROS_DOMAIN_ID=162` 的 Gazebo/MoveIt/RViz 仿真进程。
- 把默认域 `ROS_DOMAIN_ID=0` 的旧 software-only core 和临时 `/tmp/depth_detection_viewer.py` 清空后，再启动新的 no-motion 感知图，节点来源更清楚。
- 第一次 `obsensor:0` 深度失败后没有继续猜测，而是枚举 V4L2 format 和 `udevadm`，确认 `/dev/video0` 是 Orbbec Z16 深度、`/dev/video6` 是同一台 Orbbec 彩色口。
- 显式使用 `left_camera_color_device:=/dev/video6`、`left_camera_depth_device:=/dev/video0`、`left_camera_depth_backend:=v4l2` 后，左相机彩色、深度、detector overlay 和 managed scene 都拿到运行证据。
- 两个 OpenCV viewer 初次同名后及时 remap `__node`，避免留下新的重复节点污染。

### Waste
- 直接用 `auto/obsensor` 启动感知 core 会在当前现场持续 `读取深度图失败`，而且桥接代码在深度失败时不发布彩色图，导致 detector 也没有输入。
- 只看 `/dev/video*` 的格式会误把 `/dev/video8` 当可用彩色设备；必须结合 `udevadm`，否则会拿到笔记本 Integrated Camera。
- 用普通后台 shell 启动长生命周期 `ros2 launch`，shell 退出后 launch 会被收走；需要 `setsid + nohup` 或明确终端会话管理。

### Trigger Redesign
- signal：要在实机窗口启动真实相机、depth、detector 或 RViz。
- route：先清 `ROS_DOMAIN_ID=0` 旧图，再只启 no-motion 感知图。
- guard：不清理非 0 domain 的仿真窗口；不启动 `robo_ctrl`、夹爪节点或 `/competition/run`。
- action：
  1. `pgrep -af` 后读取目标 PID 的 `ROS_DOMAIN_ID`。
  2. `ROS_DOMAIN_ID=0 ROS2CLI_ENABLE_DAEMON=0 ros2 node list` 确认默认域边界。
  3. 用 `udevadm info` 和 V4L2 format 同时确认 Orbbec 彩色/深度设备。
  4. 左单相机优先用 explicit V4L2：`/dev/video6` color + `/dev/video0` depth，右相机另行验证。
  5. 多个 viewer 必须 remap 不同 `__node`。
  6. 长生命周期 launch 用 `setsid + nohup` 并写入 `.codex/tmp/runtime/...` 日志目录。
  7. 记录 topic hz、scene object echo 和日志 PID；不能只说“窗口打开了”。

## 2026-05-06 实机只读接触点标定候选

### Worked
- 在用户说明右夹爪已抵住桌角后，立即把本轮边界从“继续 quick 实机”降级为“只读接触点候选采集”，避免把接触姿态误当作安全可动姿态。
- `ROS_DOMAIN_ID=0` 与另一个窗口的 Gazebo `ROS_DOMAIN_ID=62` 分开验证，能同时保留仿真窗口进程和实机只读链路。
- `quick_hardware_smoke_test.sh` 在 no-motion 条件下给出了左右 `robot_state` 频率、当前帧和 quick frame 配置证据，适合作为实机进入标定前的最低限度 smoke。
- 停止本窗口启动的 `robo_ctrl` 和 EPG50 节点后再收口，避免遗留真实运动 service 和夹爪 command service。
- 第二次采样时先按 topic 命令顺序核对左/右帧，再写入文档；多点标定中必须把“物理点名”和“机器人侧 TCP”绑定清楚，不能只看坐标值猜左右。
- 第三次采样暴露出“用户说保持同一点，但 TCP 位置明显变化”的情况；用户随后确认所有接触都是夹爪指尖触桌，因此主要应按 TCP 到指尖工具偏移和接触姿态变化处理，而不是直接把 TCP 差异当物理点误认。
- 模型复核发现主 MoveIt URDF 没有正式 gripper/fingertip link，只有 tools 静态 TF 中的 `Lend/Rend` 候选末端偏移；后续不能把“URDF 有模型”泛化成“指尖 link 已在主 URDF 中验证”。

### Waste
- `ros2 topic echo --once /L/robot_state` 偶发因 CLI/DDS 发现不一致失败；后续应直接用显式消息类型或先跑 `topic info -v`，不要把这类瞬时 CLI 问题误判为硬件断链。
- 夹爪状态线程偶发 `获取夹爪状态失败`，但手工 status service 可成功；后续要记录 service 响应和线程 warning 的区别，避免只看后台 warning 下错误结论。

### Trigger Redesign
- signal：用户描述夹爪、TCP、末端或工具已经抵住桌面、桌角、工装或其他物理参照物。
- route：切到接触点标定候选流程，只读采集 `robot_state`，不进入 quick hardware motion。
- guard：该点只能标记为 `candidate`，不能标记为 `verified`，直到完成三点非共线点对、独立点误差验证和人工确认。
- action：
  1. 先记录现场物理语义和风险：轻触还是挤压、点名、桌面/桌角位置。
  2. 读取左右 `robot_state` 时显式使用 `ROS_DOMAIN_ID=0` 和消息类型。
  3. 禁止自动运动到接触点，禁止夹爪 enable/open/close。
  4. 每次采样先写物理点名，例如 `P_corner`、`P2`，再绑定 `L`/`R` TCP；没有左右同物理点的两条 TCP 时，不计为有效点对。
  5. 若接触部位是夹爪指尖，先建立 `tcp_to_fingertip_offset`；外参求解使用指尖接触点，不直接使用 TCP 点。
  6. 若使用模型偏移，先说明来源是主 URDF、SRDF、还是 tools 静态 TF；来源不是主 URDF 时标记为 candidate。
  7. 若声称同一点但 TCP 差异显著，记录为 `*_current_*_candidate` 或 `pending_physical_confirmation`，不要覆盖旧点。
  8. 采集后停止本窗口硬件节点，避免运动 service 长时间暴露。

## 2026-05-06 quick_competition 快速实机旁路复盘

### Worked
- 先把专家建议压成可测试合同，再实现最小 dry-run 闭环，避免把真实水位、右相机修复、复杂 MoveIt 等长期项混入 quick v1。
- `table_frame -> table_frame_corrected` 让 manual offset 和原始标定分层，日志回溯更清楚。
- payload-aware release 把球和液体容器分开，避免“安全释放”误变成自动松开水杯。
- launch smoke 很早暴露了 `--ros-args` / argparse 兼容问题，修复后所有基础节点可用。

### Waste
- TNHTH scout 两次没有返回可用证据：第一次 CLI 参数模式失败，第二次超过 0.50 USD 预算。对这种接口核对，本地 `rg`/`sed` 更快。
- quick v1 的 hardware IK preflight 仍是静态合同和 workspace 检查，不能被误报成完整运动学规划成功。
- 默认 waypoint 仍为空，hardware 模式必须现场录 verified waypoint 后才能动。

### Trigger Redesign
- signal：新增 ROS 2 Python console script 并可能由 launch_ros `Node` 启动。
- route：默认使用 `parse_known_args()` 或移除 ROS args，再处理自定义 CLI flag。
- guard：dry-run acceptance 与 hardware readiness 分开记录；dry-run 通过不等于真实动作安全。
- action：
  1. 先跑纯 Python tests 和 py_compile。
  2. 构建安装后必须跑 `ros2 launch ... --show-args` 与短 timeout launch smoke。
  3. 若 sidecar 超预算或无证据，立即记录 error trace 并切回本地主验证。

## 2026-05-01 真实相机桥接续测

### Worked
- 先保持 `start_hardware=false`，只做相机桥接 / TF / topic 层验证，避免把“相机问题”和“真实动作问题”混到一起。
- 先在严格比赛入口复现，再切到 `enable_right_camera=false allow_unverified_camera_extrinsics=true` 的左侧单相机调试入口，能快速区分“桥接起不来”和“外参 gate 拦截”两类问题。
- `/dev/v4l/by-id` 能直接给出两台 Orbbec 的稳定身份，比只看 `/dev/video*` 更适合做真实设备判别。

### Waste
- `smoke_camera_frames.py` 还停留在旧 `/camera/*` 合同，导致本轮一开始只能得到 `camera topics missing`，不够贴近当前真实入口。
- 双相机 `auto` 设备选择没有先核对稳定设备身份，就直接拿来做真机桥接，导致右相机失败时不容易第一时间判断是“没设备”还是“选错设备”。

### Trigger Redesign
- signal：要验证真实相机桥接、depth、detector 或相机世界系 TF。
- route：先看 `/dev/v4l/by-id`，再做 no-motion 左侧单相机 bringup，确认 topic/TF 合同后再扩到双相机。
- guard：默认保持 `start_hardware=false`，不把真实动作和相机桥接放在同一轮里混测。
- action：
  1. 先跑 stale process 检查。
  2. 记录 `/dev/v4l/by-id` 和 `/dev/v4l/by-path`。
  3. 先用左相机单侧入口验证 `/left_camera/*` 和 `world -> left_camera -> left_camera_depth_frame`。
  4. 再扩到双相机，若失败优先怀疑 `auto` 设备映射。

## 2026-05-01 实机连接只读检测与记录规则

### Worked
- 先读 `STATE.md`、runbook、比赛合同、`ERROR_TRACE.md` 和 `RETRO.md`，能快速确认当前真实边界：上一轮只完成软件-only v1 hardening，不能直接宣称实机动作链路已完成。
- 先做网络、串口、进程、接口、软件回归，再启动 no-motion core，避免一开始触发真实动作。
- 分段启动子 launch 可以快速把 `competition_core` 阻塞缩小到 `scene_fusion` 和 `execution_adapter` 参数类型问题。
- 把本次检测写入 `docs/operations/reports/2026-05-01-real-hardware-no-motion-test-log.md`，比只更新聊天上下文更适合跨会话接续。

### Waste
- 以前的 `software_check.sh` 没覆盖 `scene_fusion` 和 `execution_adapter` 空列表参数的 launch runtime 路径，导致主链问题直到现场 no-motion launch 才暴露。
- 记录要求需要更早固化到 `AGENTS.md`，否则实机联调时容易出现“测试做了，但下个窗口读不到完整历史”的断层。

### Trigger Redesign
- signal：用户要求测试实机连接、链路进度、可视化或历史操作可追溯。
- route：必须同步写入 `docs/operations/reports/YYYY-MM-DD-*.md`，并在 `STATE.md` 摘要当前阶段。
- guard：不能只把命令结果留在聊天；失败尝试和未验证项也必须记录。
- action：
  1. 先读历史操作文件。
  2. 每完成一批检测就追加记录。
  3. 发现可复用故障写入 `ERROR_TRACE.md`。
  4. 改变未来操作习惯写入 `RETRO.md`。

## 2026-04-26 Software-only Hardening 复盘入口

### Worked
- 先建立软件-only 护栏再做安全和控制相关修改，可以避免 review 后的修复误触实机。
- Wave 0 基线把 README 覆盖和 pytest 缺失直接转成后续可执行任务，避免只停留在报告。
- Wave 1 先从 HTTP 暴露面和 mockable stop 入口入手，能在不碰实机的前提下先降低最直接的软件风险。
- Wave 2 把安全逻辑抽成无 ROS 依赖 helper 后，测试能同时服务普通 pytest 和 colcon test，避免 ROS graph 成为单元测试前提。
- Playwright 使用 route mock API 后，前端 smoke 不再依赖手工启动 API。
- Wave 3 用 profile 先收拢 launch 默认值，比直接重写所有节点读取配置风险更低；show-args 是适合软件-only 的验证证据。
- Wave 4 把比赛任务序列和对象排序抽成纯 Python helper 后，可以不用启动 ROS graph 就验证关键比赛契约。
- 在 evidence 不完整时显式失败，比继续返回 motion success 更适合比赛任务链；否则上层会把“动作执行了”误判成“任务成功了”。
- Wave 5 拆大文件时先抽纯 helper、保留入口兼容，是在时间有限且需要按 Wave 提交时的低风险路径。
- 发现 subagent 多次超时后，及时关闭并转本地主线程验证，避免最终提交被外部 sidecar 卡死。

### Waste
- 当前系统缺少 `pytest` 命令，说明测试入口不能假设全局工具已安装；Wave 2 需要提供明确依赖说明或脚本降级提示。
- Playwright 第一次失败来自文本断言命中多个元素；API-backed UI 测试应优先断言 mock 调用计数或 role 精确选择器。
- 包内测试文件名与顶层测试同名会触发 pytest import mismatch；跨目录测试必须用唯一 basename。
- reviewer subagent 第二次超时说明长只读审查也可能不稳定；必须有本地主线程验证 fallback，不把提交节奏依赖在 subagent 返回上。
- Wave 1、Wave 5、Wave 6 的 reviewer/verifier prompt 仍偏宽，导致 subagent 难以在短时间内完成；以后不能把“最终全量判断”直接委派给单个 subagent。

### Trigger Redesign
- signal：用户要求 review 后直接修复/重构，并要求提交推送。
- route：进入 auto-pipeline 多 Wave 执行，按 Wave 提交。
- guard：先写软件-only 护栏，所有验证默认 mock/dry-run。
- signal：控制台 API 暴露 motion、gripper、recover、delete 或 process control。
- route：默认本机监听 + token 鉴权 + 审计日志。
- guard：无 token 时危险 API 默认拒绝，而不是依赖网络隔离。
- signal：同一轮 pytest 同时收集顶层 tests 和包内 test 目录。
- route：测试文件 basename 唯一化。
- guard：避免 pytest 将同名模块缓存到错误路径。
- signal：subagent 任务描述包含“完整 review / 最终 verifier / 检查全部 diff”。
- route：先拆成本地 checklist，再只把单一风险点委派给 subagent。
- guard：若下一步提交/推送依赖该结论，主线程必须先有本地 fallback 验证路径。
- signal：同一任务已有两个 subagent 超时。
- route：停用非必要 subagent，切本地主线程 review/verify。
- guard：只有更窄且非阻塞的问题才允许再开新 subagent。

## 结论
本次对话把 `dual-arm` 从“架构骨架式重构”推进到了“Wave 1 真 MoveIt 双臂规划基线”，方向是对的，但过程里暴露出多类可规避问题：subagent 不稳定、旧 ROS 进程污染验证、安装树残留、Conda 抢 Python、以及验证步骤顺序不严格。不能保证以后绝对不再犯，但这些问题已经被转成仓库规则和执行检查点。

## Facts
- 已完成：
  - 双臂 URDF/Xacro、双臂 MoveIt config、C++ planner、joint_state_aggregator。
  - `move_group` 真实启动，`PlanJoint(left_arm)` 和 `PlanJoint(dual_arm)` 已返回真实非空轨迹。
- 已识别的真实问题：
  1. 最初的 `fairino_dualarm_planner` 仍是 Python 伪规划器。
  2. `debug.launch`/`competition.launch` 一度被旧安装树和旧 ROS 进程污染。
  3. 两个长任务 subagent 连续 502，无法稳定承担主实现工作。
  4. 系统默认 `python3` 指向 Conda，导致 `rclpy._rclpy_pybind11` 导入失败。
  5. 删除旧 Python planner 脚本后，如果不重装包，运行态仍会命中旧安装残留。
  6. 验证时直接向 managed scene / service 发请求，容易被 stale timestamp 和 overlay 契约混淆。
  7. 右臂灯色解释曾被误读：蓝色是自动模式且默认不可拖动，不是异常；绿色是手动模式不可拖动，青色是手动模式可拖动。
  8. 当前 `robo_ctrl` 默认强制 `Mode(0)` 的设计和现场“绿色手动模式调试”流程冲突，属于控制策略问题，不是控制器自己乱切模式。
  9. `ros2 launch` 在这台机器上还会被 Miniconda `libstdc++.so.6` 污染，导致 C++ ROS 节点运行失败。
  10. 2026-04-15 夹爪串口已枚举为 `/dev/ttyUSB0`，但 Modbus 状态读取无响应；后续不能再把“无串口设备”作为当前结论，应改成“串口存在但物理层/设备参数层未通”。

## Worked
- 先把复杂任务切成 wave，再在每个 wave 内做“实现 + 审查 + 验证”是有效的。
- 在 planner 和 launch 验证前，使用真实命令读取当前运行态而不是只看源码，能快速定位污染来源。
- 对 MoveIt/Planner 这类高风险模块，先做最小 smoke：`build -> xacro -> move_group -> service call`，比直接上完整任务链高效。
- 把接续信息写入 `STATE.md` 后，新窗口接续成本明显下降。
- 现场把灯色、模式、拖动状态拆开解释后，右臂状态判断更清晰：灯色只能作为辅助，不能替代 SDK/网页字段和 ROS 状态回读。
- 把“切自动模式”从默认动作前准备里移除后，现场链路验证更贴近真实工作流；说明硬件联调里“默认做太多”比“默认少做”更容易踩坑。
- 在 `ros2 launch` 不可靠时，直接启动目标可执行文件并显式固定系统运行时，是现场验证 C++ 节点的高效降级方案。
- 对已经定位清楚的系统库污染，先在 launch 层做最小隔离修复，再决定是否继续做二进制级治理，能更快恢复现场可用性。
- 夹爪联调时先用只读 Modbus 状态帧扫 ID/波特率，比直接启动完整节点或调用 `/epg50_gripper/command` 更安全；同时能避免节点析构时自动发送 `disable()` 对判断造成干扰。
- 夹爪节点默认值应优先服务“能安全联调”：`port=auto`、初始化失败不崩、退出默认不发控制命令，比继续保留历史 `/dev/ttyACM0` 和析构 `disable()` 更符合现场调试需求。
- 当 `enable` 命令返回 `Response size is less than 8 bytes.` 时，应把它归为“物理层有回传但协议帧不完整”，优先排查 RS485 A/B、收发方向、GND、波特率和校验位，而不是继续扩大从站 ID 穷举。
- 如果交换 A/B 后现象完全不变，说明 A/B 极性不是唯一主因；此时应立即把排查重点转到 GND、RS485 转换器类型、自动收发方向控制和夹爪供电，而不是继续在软件层反复重试。
- 当用户明确确认是“蓝灯快闪”时，要立即把问题重心从“通讯中断”切换到“控制指令错误”，再去对照官方手册核查功能码、寄存器地址和激活流程；这次就是因此快速收口的。

## Waste
- 在未清理旧 ROS 进程前就调用 `/planning/plan_*`，导致收到旧 Python planner 返回，浪费多轮判断时间。
- 删除旧脚本后未立即重装对应包，导致 launch / executable 继续命中旧安装树，浪费一轮验证。
- 使用 shell 默认 `python3` 跑 ROS 脚本，触发 Conda/ROS Python ABI 冲突，浪费一轮排查。
- 在 subagent 连续 502 后仍试图等待结果，而不是立即降级到本地主线程实现 + 小粒度 reviewer/verifier，浪费节奏。
- 把蓝灯误当成异常自动状态线索，导致一段时间内过度怀疑右臂模式；应先确认厂商灯色语义再做因果判断。
- 一开始没有把“代码主动切模式”当成第一嫌疑人，导致模式问题和现场灯色问题混在一起看，增加了判断成本。
- `ros2 launch` 的 C++ 运行时污染直到重新验证 driver 才暴露出来，说明“helper 能跑”不等于“launch 的 C++ 节点也能跑”。
- 一开始试图只靠 CMake/RPATH 修复污染，但在 `--symlink-install` 下恢复速度不如 launch 层显式注入系统运行时；现场优先级应先保 launch 可用。
- 夹爪串口出现后，如果只改 ROS 参数为 `/dev/ttyUSB0` 就继续动作测试，会跳过关键的物理层确认；无响应时应立即停止在 ROS 层重试，转查供电、RS485 A/B、转换器类型和厂家参数。
- 双臂上层如果只把 `slave_id=0` 透传给夹爪驱动，右夹爪路径会天然落到默认从站；`execution_adapter` 应基于 `arm_name` 补默认左右夹爪 ID 映射。

## Missed Triggers
- 看到 `ros2 launch`、`service call` 返回明显不符合源码时，应立即触发“旧进程污染检查”。
- 删除/替换 installed script 时，应立即触发“重装包 + 检查 install tree”流程。
- 涉及 ROS Python 节点时，应立即触发“系统 Python 固定化”流程，而不是事后修 shebang。
- subagent 失败 2 次后，应立即触发“降级主线程实现 + reviewer/verifier 子代理”流程。

## Trigger Redesign
### Rule 1
- signal：`service` / `action` 返回内容与当前源码明显不符
- examples：仍返回“骨架规划成功”；仍出现旧 joint naming
- route：进程污染排查
- guard：仅在已经确认源码已更新但运行结果像旧版本时触发
- action：
  1. `pgrep -af` 查旧进程
  2. 清理所有 `ros2 launch` / node 残留
  3. 重启单一干净会话再测

### Rule 2
- signal：删除或替换包内 executable/script/launch helper
- examples：删掉 `fairino_dualarm_planner_node.py`；修改 `debug.launch.py`
- route：安装树一致性检查
- guard：仅限 repo 中安装到 `install/` 的工件
- action：
  1. 重建受影响包
  2. 检查 `install/<pkg>/lib/<pkg>` 是否仍有旧工件
  3. 再做运行态验证

### Rule 3
- signal：任何 ROS Python 脚本需要手工执行或临时验证
- examples：mock publisher、launch 进程、单节点脚本
- route：Python 环境固定
- guard：本机存在 Conda/多 Python 时强制触发
- action：
  1. `source /opt/ros/humble/setup.bash`
  2. `source install/setup.bash`
  3. 强制 `/usr/bin/python3`

### Rule 4
- signal：subagent 返回 502 或 2 次超时
- examples：worker/reviewer 失败
- route：subagent 降级策略
- guard：当该角色是必需角色时触发
- action：
  1. close 失败 agent
  2. 主线程接管实现或审查
  3. 仅保留小粒度 reviewer/verifier 子代理

### Rule 5
- signal：Wave 结束
- examples：Wave 1 planner 完成；Wave 2 scene/execution 完成
- route：持久化接续
- guard：无
- action：
  1. 更新 `STATE.md`
  2. 更新 `ERROR_TRACE.md`
  3. 更新 `RETRO.md`

### Rule 6
- signal：机械臂灯色、网页模式、拖动状态任一出现异常或被现场重新解释
- examples：蓝灯、绿灯、青灯、`Drag`、可拖动/不可拖动、自动/手动模式
- route：现场状态语义确认
- guard：仅在真实硬件调试时触发
- action：
  1. 先区分机器人模式和拖动状态，不用灯色单独下结论
  2. 用 `robot_mode_helper` 或网页字段确认模式/拖动状态
  3. 再结合 `/R/robot_state` 和现场观察决定是否允许动作

### Rule 7
- signal：`ros2 launch` 能启动 Python/launch 流程，但 C++ 节点一落地就报系统库版本错误
- examples：`GLIBCXX_3.4.30 not found`、命中 Miniconda `libstdc++.so.6`
- route：运行时污染降级处理
- guard：现场验证优先，不等待完整环境治理
- action：
  1. 先记录具体命中的错误库路径
  2. 改用直接启动目标可执行文件验证业务逻辑
  3. 必要时显式注入系统 `libstdc++.so.6`
  4. 将 launch 环境修复保留为后续单独收口项

### Rule 8
- signal：夹爪串口已枚举但 Modbus 状态读取无响应
- examples：`/dev/ttyUSB0` 存在；`epg50_gripper_node` 可打开端口但 `响应超时`；ID/波特率扫描无返回
- route：夹爪物理层与设备参数排查
- guard：仅限真实夹爪硬件调试，不用于仿真或 mock
- action：
  1. 不调用 `/epg50_gripper/command` 使能、打开或闭合
  2. 用 by-id 路径固定串口设备
  3. 用只读 Modbus 状态帧确认 ID/波特率
  4. 无响应则转查夹爪独立供电、RS485 转换器类型、A/B 接线、通信地线和厂家工具参数

## Next Actions
- 下一窗口直接从 Wave 2 开始：
  - `planning_scene_sync` 真接 MoveIt PlanningScene
  - `scene_version` 与 managed scene 联动收口
  - `execution_adapter` 双臂同步协议、真实 skew、primitive dispatcher
- Wave 2 开始前必须先执行：
  1. 读 `AGENTS.md`
  2. 读 `STATE.md`
  3. 清理旧 ROS 进程
  4. 确认 install tree 无旧 planner 残留

## 2026-04-16 追加复盘

注：本节记录的是包根阶段性统一到 `src/` 时的窗口快照；当前正式主根已升级为 `packages/`，以本文后面的“2026-04-16 仓库重构与 README 体系化收口复盘”为当前事实。

### Worked
- 先统一包根再继续实现是正确顺序；该阶段迁移后 `colcon build --base-paths src` 曾作为阶段性入口，后续已升级为 `colcon build --base-paths packages` 正式入口。
- 对 subagent 502 立即降级到主线程实现，避免网页和文档写集被阻塞。
- 清理 `build/install/log` 后全量重建，快速消除了路径迁移导致的旧 CMake cache 污染。
- 网页控制台不只写源码，还跑了 `npm run build` 与 Playwright smoke，符合“网页也要验收”的要求。

### Waste / Risk
- 迁移后若只清单包 build cache，会反复遇到旧路径 CMake cache；大范围迁移应直接计划一次全量缓存清理。
- `ExecutePrimitive`、`PlanDual*`、PlanningScene sync 目前仍是基座级实现，后续必须继续做真实动作和场景验收，不能把“有接口”误认为“比赛完成”。
- `competition_console_api` 需要继续扩展真实 ROS action/service 控制按钮，当前网页按钮仍是前端壳层。

### New Rules
- 大规模目录迁移后，默认清理 `build/ install/ log/` 并全量重建。
- 网页类交付必须至少通过：依赖安装、生产 build、静态服务可达、Playwright smoke。
- subagent 写任务失败时，主线程接管实现，同时把失败记录到 `ERROR_TRACE.md`。

## 2026-04-16 窗口收口复盘与流程优化

注：本节保留当时窗口的阶段性判断；其中“单工作区迁移到 `src/`”和“Wave 5 没有完全收口”都已被后续实现覆盖，当前事实分别见下文 “2026-04-16 Wave 5 Runtime 收口复盘” 与 “2026-04-16 仓库重构与 README 体系化收口复盘”。

### Facts
- 用户要求按完整计划推进到 Wave 5 收口，并要求严格大型项目流程、每个 Wave 有验收、包含代码审查、统一控制网页、断点接续、subagent 滚动使用。
- 本窗口完成了大量基座工作：
  - 单工作区阶段性迁移到 `src/`，后续已再次升级为 `packages/` 正式主根
  - 新增 `ExecutePrimitive`、`PlanDualPose`、`PlanDualJoint`
  - 新增 `competition_console_api`、`competition_console_web`
  - 新增 `competition_integrated.launch.py` / `competition_core.launch.py`
  - 新增 `smoke_resume_checkpoint.py`、`smoke_camera_frames.py`、`smoke_planning_scene_sync.py`
  - Wave 1 恢复 smoke 通过
  - Wave 2 mock 相机 frame smoke 通过
- 当时 Wave 5 还没有完全收口：
  - `smoke_planning_scene_sync.py` 仍未稳定通过
  - 当前阻塞集中在 authoritative scene / `ApplyPlanningScene` / managed scene reserved 状态传播
- reviewer subagent 明确指出多项严重问题：
  - service 假成功
  - attached object diff 语义不对
  - checkpoint 恢复只是骨架
  - `cwd` 依赖
  - 控制台绕开正式入口
  - detector 默认错配
  - ROI fallback 默认开启
  - planning 失败 reservation 泄漏
  - 网页验收链还不完整

### Worked
- subagent reviewer / verifier 的只读审查非常有效，指出了主线程容易忽视的结构性问题。
- 将网页验收从“页面能显示”推进到 `npm run build`、Playwright smoke、API health、API acceptance action，是正确方向。
- 对 `ApplyPlanningScene` 问题使用最小 diff / service log / smoke 脚本逐步收敛，比泛泛查代码更有效。
- 将 `competition_console_api` 改为 `competition_core.launch.py`，修复了“网页启动第二套 core stack”的架构问题。
- 把 `Path.cwd()` 改成安装前缀推导仓根，是长期稳定运行的必要修复。

### Waste
- 一开始推进了太多 Wave 的实现骨架，导致“接口已存在”和“功能已验收”容易混淆。
- Wave 0-5 的证据链补得偏晚，导致 verifier 发现 PRD 仍大面积 `passes=false/evidence=null`。
- `planning_scene_sync` 的运行态问题经历了多轮试错，原因是没有一开始就建立最小 world ADD / attach / detach 的单元 smoke。
- 控制台 API 最初仍从自身启动 `competition.launch.py`，没有先把 `core` 和 `integrated` 拆清楚。
- 多次受到旧 ROS graph / 旧进程 / 旧 install tree 干扰，说明每次 smoke 前的清理规程还不够硬。

### Missed Triggers
- 看到用户要求“严格大型项目流程”时，应立即先建立 Wave evidence matrix，再开始写大量代码。
- 看到 `ApplyPlanningScene success=false` 时，应立即触发 MoveIt 最小 diff smoke，而不是先在完整 scene 流里调。
- 看到网页按钮需求时，应立即把“网页按钮 -> API -> ROS action/service -> evidence”作为验收链，而不是先做 UI 壳。
- 看到 subagent 502 时已降级，但应同步更新 `SUBAGENT_REGISTRY.json` 更早，避免后续误以为 agent 仍可用。

### Trigger Redesign

#### Rule A
- signal：用户要求“每个 Wave 都有验收”“严格项目流程”“不能质量差”
- examples：`按照计划完整推进，不要停下来`、`每个wave最好都有验收`
- route：`issue-driven-pm + prd-tracker + planning-with-files`
- guard：仅当任务跨多个模块或多个 Wave 时触发
- action：
  1. 先建 Wave evidence matrix
  2. 每个 Wave 写 `Acceptance` 和 `Evidence`
  3. 再进入代码实现

#### Rule B
- signal：MoveIt `ApplyPlanningScene` 返回 `success=false`
- examples：`reserve failed`、`apply_planning_scene 调用失败`
- route：`debug + ros2-engineering-skills`
- guard：仅限 MoveIt scene/world/attached 问题
- action：
  1. 先跑 world ADD 最小 diff
  2. 再跑 attach existing object
  3. 再接 scene_fusion 完整流
  4. 不在完整流里盲猜

#### Rule C
- signal：新增网页按钮或控制台 API
- examples：`做统一控制网页`、`一键按钮`
- route：`frontend-design + webapp-testing`
- guard：仅限 UI/控制面任务
- action：
  1. 每个按钮必须绑定真实 API 或明确标记 disabled
  2. Playwright 覆盖至少一个真实 API 动作
  3. 结果要写入 evidence

#### Rule D
- signal：大规模移动 ROS 包目录
- examples：`迁移整理好`、`统一工作区`
- route：`auto-pipeline + planning-with-files`
- guard：仅限包根迁移或大规模路径调整
- action：
  1. 先列迁移映射
  2. 移动后清 `build/install/log`
  3. 全量 build
  4. 扫旧路径引用

### Next Actions
- 新窗口必须先处理 Wave 5：

## 2026-04-16 Wave 5 Runtime 收口复盘

### Facts
- `planning_scene_sync` 的运行态主阻塞已经从 `reserve failed` 收口到增强版 smoke 通过。
- 最终有效证据不是单一 topic，而是三段组合：
  1. `smoke_planning_scene_sync.py` 输出 `planning_scene_sync smoke passed`
  2. `GetPlanningScene` 最终 world / attached 为空
  3. `/scene_fusion/scene_objects` 最终 `objects: []`
- 运行态确认了两个关键实现约束：
  1. attach 前必须确认 world object 真正进入 MoveIt
  2. 本仓 MoveIt Humble attach diff 不能同包发送同 id world REMOVE

### Worked
- 先把 `planning_scene_sync` 的问题拆成“callback group / future ownership / diff 语义 / smoke 输入竞争”四类，再逐个消灭，比继续在整条 competition 栈里猜测有效得多。
- 用 `GetPlanningScene` 做同步证据，比依赖 `/monitored_planning_scene` 的异步发布更适合做硬门禁。
- 把 service 更新改成事务模式、把 authoritative scene sync 改成持锁同步 apply，明显降低了分叉状态和假成功风险。
- 在 smoke 脚本里把“停止 raw publisher 后最终清空”也纳入验收，能防止 happy path 通过但尾部残留。

### Waste
- 一开始过度依赖 `/monitored_planning_scene` 作为 attach 成功证据，导致增强 smoke 出现假失败。
- 对 MoveIt 文档语义过于乐观，直到运行态最小复现才确认“同 id world REMOVE + attached ADD”在本仓环境里会冲突。
- 对 `tools` 这类混合包的 symlink-install 旧目录问题，没有在第一次 build 失败时立刻按生成目录清理套路处理。

### New Rules
- Wave 5 及后续 PlanningScene 验收优先使用 `GetPlanningScene` 作为同步证据，`/monitored_planning_scene` 仅作辅助观察。
- authoritative scene manager 中，只要上层要求“成功/失败”语义，就不要把状态提交建立在异步 done-callback 上。
- attach 前如果 world object 来自 perception/raw scene，必须先做一次 MoveIt 可见性确认，再进入 attached 迁移。
- 对混合 CMake/Python 包，出现 `ament_cmake_python` symlink-install 目录阻塞时，优先清对应生成目录，而不是继续改源码。
  - 以最小 MoveIt diff smoke 为准，不直接从完整 scene_fusion 流里猜
  - 打通 `smoke_planning_scene_sync.py`
  - 成功后回填 `STATE.md`、`PRD.md`、Wave 2-5 acceptance 与 code review
- 然后再继续 primitive 真实动作深化。

### Project-Level Rule Landing
- 已将复盘规则落实到项目级 `AGENTS.md`，确保后续新窗口自动继承。
- 已新增 `docs/runbooks/engineering-process-standards.md`，作为 Wave Gate、验收证据、运行态 smoke、MoveIt PlanningScene、控制台、subagent、目录迁移和失败记录的统一规范。
- 后续窗口不应只读聊天上下文，应优先读取：
  1. `AGENTS.md`
  2. `STATE.md`
  3. `docs/runbooks/engineering-process-standards.md`
  4. `.codex/tmp/resume/IMPLEMENTATION_BREAKPOINTS.md`
  5. `.codex/tmp/resume/SUBAGENT_REGISTRY.json`

## 2026-04-16 仓库重构与 README 体系化收口复盘

### Facts
- 本轮 `dual-arm` 仓库主根已从历史 `src/` 叙事升级为 `packages/`，并保留 `src -> packages` 兼容入口。
- README 体系和目录骨架已完成重构，`python3 scripts/check_readme_coverage.py` 输出 `README 覆盖检查通过，共检查 57 个目录。`
- 路径治理已收口，`python3 scripts/check_path_hardcodes.py` 输出 `路径硬编码检查通过。`
- 模块化构建已落地：`build_workspace.sh --list-groups` 正常列出 `interfaces/perception/planning/control/tasks/bringup/ops/full`，`--group full` 与各分组构建均通过。
- 包发现兼容层已验证：`colcon list --base-paths packages` 与 `colcon list --base-paths src` 均发现 26 个包。
- launch smoke 与控制台 workspace acceptance 已通过，且 reviewer / verifier 两个只读 sidecar 已完成最终收口。

### Worked
- 先在隔离 worktree 中完成 repo 级重构，再回头处理 `/home/gwh/dual-arm` 阶段二部署，避免污染当前脏的 `test` 工作树，这个顺序是正确的。
- `packages/` 主根 + `src` 兼容 alias 的组合兼顾了结构清晰与历史脚本兼容，是这次仓库治理的关键稳定器。
- 路径统一抽到 `scripts/lib/paths.sh` 和 `dual_arm_paths.py` 后，路径硬编码审计终于可以脚本化，而不是靠人工扫 README 与脚本。
- `docs_researcher` / `repo_explorer` / `reviewer` / `verifier` 这种“研究、盘点、审查、验收”分工有效，既没有让 sidecar 改主代码，又提高了 closeout 质量。

### Waste / Risk
- `STATE.md` 曾长期保留“正式包根是 src”这类阶段性叙述，哪怕兼容层仍在，也会给后续协作者造成误导；结构升级完成后，状态文档必须当天同步改口。
- reviewer / verifier 结果已经返回后，如果不及时关闭 sidecar 并回填 `SUBAGENT_REGISTRY.json`，会造成“任务其实已完成，但状态文件还写着待复核”的虚假阻塞。
- 阶段二部署到 `/home/gwh/dual-arm` 后，如果不在新位置重新 `rm -rf build install log && ./build_workspace.sh --group full`，install 树里的默认路径仍会指向隔离 worktree，这是部署阶段最值得警惕的风险。

### New Rules
- 发生 repo 级目录重构后，`STATE.md` 中所有“正式主根/正式构建入口”叙述必须在同一天更新到最终术语，历史阶段只能标注为历史，不得继续冒充当前事实。
- 长链路多 subagent 任务进入提交前，必须执行一次 `close_agent -> registry 回填 -> state 回填 -> final summary` 的固定收口序列。
- 任何“从隔离 worktree 部署到最终落点目录”的任务，最终目录必须重建 install 树后再做 launch smoke，不能直接相信源 worktree 的构建产物。

## 2026-04-28 v1 hardware-interface hardening 复盘

### Facts
- 本轮按 `Approved for v1 hardware-interface hardening scope` 执行，没有新增硬件，也没有连接真实机械臂或夹爪。
- 已实现双 RGB/单 Depth 静态门控、右 detector 解耦、frame alignment 默认 true、table gate、planner-first Cartesian、vendor direct 双门控、`guarded_grasp` 和 pour evidence 不假成功。
- 新增 `evidence_manager` 只作为现有信号聚合器，不替代真实 fill/spill 传感器。
- 验证主证据为 `28 passed`、相关 10 包 colcon build、接口 show、launch show-args、非法 depth fail-fast 和 `software_check.sh` 通过。
- `smoke_depth_handler_future_tf.py` 本轮未正常退出，已记录为未闭环 incident，未作为通过证据。

### Worked
- 先扩接口，再更新所有构造方，能快速暴露 `scene_fusion` 继续写 `[-1]` covariance 这类合同破口。
- 用 `OpaqueFunction` 做启动期 depth 校验，比在节点 condition 里隐式不启动更清晰，非法组合可以直接 fail fast。
- Cartesian 默认拉回 planner service 后再 `_execute_joint()`，能在不改底层 `robo_ctrl` 硬件接口的前提下关闭默认裸 `MoveCart` 风险。
- `guarded_grasp` 让 contact false 到 attach 之间出现明确断点，任务层也能在失败时 release reservation。
- 把 residual risks 写入 runbook，有助于防止 v1 被误报成完整人体安全、真实倒水证据或 dense world model。

### Waste / Risk
- 新增 ament CMake 包时首次被 Conda Python 抢占，说明本地 shell 环境仍然可能绕过 ROS Humble system Python。
- 旧 `smoke_depth_handler_future_tf.py` 语义与本轮 frame alignment gate 不一致，直接复用会浪费时间并产生残留进程。
- `planning_scene_sync` 本轮同时修正 object pose、primitive local pose 和 subframe local pose，后续最好补一个最小 MoveIt diff runtime smoke 专门覆盖 subframe frame 语义。

### New Rules
- 新增 v1/v2 范围型方案时，最终文档必须同时列 `Closed In v1` 和 `Residual Risks / Out Of Scope`，避免“没假成功”被误写成“已真实验证成功”。
- frame alignment 验收应有专用 smoke：错 frame 拒绝、aligned frame 通过；future TF fallback smoke 不能替代 alignment gate。
- 新增 ROS CMake 包时，若工作站存在 Conda，优先在包或构建命令中固定 `/usr/bin/python3`，并把首次构建失败记录到 error trace。

## 2026-05-06 Gazebo full sim + quick hybrid 中断接续复盘

### Facts
- 本轮任务范围同时包含正式 Gazebo 主链闭环和 quick hybrid computed-template 升级。
- 当前已创建 `dualarm_simulation` 包、`competition_gazebo_full.launch.py`、sim backend 参数透传、`execution_adapter(sim)` 初版逻辑、`dualarm_task_manager` sim acceptance 初版逻辑，以及 quick computed 四个模块。
- 当前尚未完成 quick hybrid preflight/executor 接线，也未运行 py_compile、pytest、colcon build、launch show-args 或 `/competition/run` runtime smoke。
- 用户明确要求保存进度并给出新窗口接续提示词。

### Worked
- 先把半实现边界写入 `STATE.md` 和 `docs/operations/reports/2026-05-06-gazebo-full-sim-quick-hybrid-progress.md`，避免新窗口把已有代码误判为已验收。
- 把“不能声明完成”的状态写清楚，比只列新增文件更重要：当前不能声称 Gazebo full-chain、`/competition/run`、quick hybrid runtime 或 `competition_integrated.launch.py` 兼容性已经通过。
- 进程检查先做事实记录，避免新窗口接续时误以为有遗留 Gazebo/ROS 进程需要接管。

### Waste / Risk
- 同时推进正式主链和 quick hybrid 会扩大验证矩阵；如果先跑 quick fallback，可能掩盖正式 MoveIt/planning service 的问题。
- `.codex/tmp/session-state` 目录在当前 sandbox 普通 shell 中显示只读，不能依赖创建新 session-state 文件作为唯一快照；必须同步更新 repo 内 `STATE.md` 和报告文件。
- quick computed 模块已经存在，但未接入 preflight/executor；这类“文件存在但链路未接通”最容易被后续误报为完成。

### New Rules
- 以后遇到跨多模块半实现中断，先写“已实现/未实现/禁止声明完成/下一步唯一入口”四段式断点，再继续编码。
- 对 Gazebo 主链 + quick fallback 并行任务，测试顺序必须先独立验证正式 MoveIt/planning service，再验证 quick IK/preflight，避免 fallback 掩盖主链缺陷。
- 在当前任务剩余阶段，不开启非必要 subagent；两次 Claude/sidecar 无证据后走本地主线程审查与验证。

## 2026-05-06 实机指尖接触模型复盘

### Facts
- 现场接触点是夹爪指尖触桌，不是 controller TCP 触桌。
- 当前 active MoveIt 双臂 URDF/SRDF 没有正式 gripper/fingertip link，规划 tip 仍是 `left_tcp/right_tcp`。
- vendor SDK FR3 模型有 gripper 安装关系和 gripper mesh；按 mesh 可推导离线几何候选，但它没有接入当前 active robot description。
- 已采样触桌点用历史 `Lend/Rend` 静态 TF 换算后，base-z 更符合桌面接近安装基准平面的现场假设，因此本轮保留 `Lend/Rend` 为优先候选，但仍不是 verified。

### New Rules
- 实机三点/四点接触标定必须明确“触碰的是 TCP、夹爪中心、左指尖、右指尖还是指尖角”，否则不能把 TCP pose 直接用于外参求解。
- 使用 URDF/mesh 计算工具偏移前，先确认该模型是 active robot description 的一部分；vendor 离线模型只能作为候选几何来源。
- 对同桌面接触点，先用 base-z 一致性做快速 sanity check，再进入左右臂/world 刚体变换求解。
- 同一物理点可以由左右臂错时采样，只要物理点名、时间戳和左右 TCP 记录完整；不要把“同一时刻同构型”误当成配对必要条件。
- 第四点残差验证必须是左右同物理点的完整点对；单臂第四点只能叫候选，不能作为 verified 验收证据。
- 四点残差达到厘米级时，应先怀疑触点侧别、指尖角、工具偏移候选或接触滑动/压缩，不应把数学最小二乘结果直接写成 verified 外参。
- 实机窗口的 `ROS_DOMAIN_ID=0` 若被 software-only core/MoveIt/camera 图占用，即使 `start_hardware=false`，也不能当作干净实机图；后续采样前必须先重新检查并由用户授权停止或隔离。

## 2026-05-06 P1 崩溃风险修复复盘

### Facts
- 本轮完成 P1 代码修改、P0/P1 静态合同测试、py_compile、`git diff --check`、核心 P1 包构建和 detector 单独构建。
- 后续补充了 `tests/unit/test_p1_runtime_stress.py`，KDTree atomic claim、PlanningSceneSync cache、competition_console stop 三项 runtime stress 通过，可从“已修改待验证”提升为“已关闭”。
- 当前仓库已有大量 Gazebo/quick/perception/P0 脏变更；P1 报告已把 dirty baseline 与本轮触达文件分开记录。
- `fairino3_v6_planner` 实际位于 legacy 目录且带 `COLCON_IGNORE`，当前 `colcon` 工作区无法构建它。
- planner scene/robot state、legacy planner plan、depth_processor 仍没有 TSAN/stress 运行证据，不能标为已关闭。

### Worked
- 先跑 P1 源码合同测试，再分段构建核心包和 detector，能把 detector plugin warning 与核心构建结果隔离开。
- 把 runtime stress 做成 pytest 内可重复命令，比手工一次性脚本更适合作为后续回归证据。
- 对 shared state 采用“锁内复制快照，锁外慢操作”的方向，避免把 MoveIt planning、图像循环和进程 wait 放进新加锁路径。
- 对 LwDetr 明确释放顺序后，资源生命周期的审查点可以被源码合同测试固定住。
- 把 legacy `COLCON_IGNORE` 记录成 incident，比临时删除忽略文件更稳，不会把归档包意外重新拉回活跃工作区。

### Waste / Risk
- P1 计划把 legacy planner 当成可直接构建包，但没有先检查 `COLCON_IGNORE`，导致构建命令只能给出 unknown package 证据。
- 只做源码合同测试容易被误读成并发已关闭；后续必须补可重复 stress 或 TSAN 后再改状态。
- 当前多个 P1 文件本身已有前序脏变更，`git diff --stat` 不能直接代表本轮净改动。

### New Rules
- 对代码审查清单中的 legacy 路径，执行前先检查是否被 `COLCON_IGNORE`、`AMENT_IGNORE` 或归档策略排除；被排除时先要求状态判定，不直接声明构建覆盖。
- 并发修复状态必须按证据分层：源码合同防回归、构建防编译错误、stress/TSAN 才能关闭竞态 finding。
- 手工 stress 原型通过后，要立即固化为 `pytest` 或等价可重复入口，并把命令和耗时写入报告。
- 分段构建要保留“核心包”和“可选 GPU/plugin 包”两类证据，避免环境 warning 掩盖核心结果。

## 2026-05-06 右相机物理归属与双流问题复盘

### Facts
- 历史记录中的 Orbbec serial/path 映射不足以证明 left/right 物理归属；用户现场确认 `/dev/video16` 当前画面实际是左机械臂相机。
- 切到另一台 Orbbec `CP02653000G2` 的 `/dev/video6` 后，彩色-only 可视化和 CPU detector overlay 正常发布。
- 当前 Orbbec V4L2/OpenCV 路径存在彩色+Z16 深度双流冲突：单独深度可读，同时打开彩色和深度时深度读帧失败。
- 双臂外参仍是 candidate，不能把相机可视化成功扩展成协作运动安全。

### New Rules
- 相机 left/right 命名必须由“设备枚举 + 现场画面确认”共同决定；现场观察优先于历史 serial/path。
- 对相机调试，先建立 color-only 可视化，再单独验证 depth-only，最后再尝试 color+depth；不要在完整 competition launch 中盲试。
- 只要相机外参、base 外参或夹爪指尖模型仍是 candidate，就不能声明双臂协作动作可执行或互碰安全已保证。

## 2026-05-06 右臂只读控制接入复盘

### Facts
- 用户现场确认当前 `/dev/video6` / `CP02653000G2` 画面是右侧相机。
- `ROS_DOMAIN_ID=0` 中右相机/检测可视化保持运行，另一个 Gazebo/MoveIt 图在 `ROS_DOMAIN_ID=162`，本轮未触碰。
- 后台方式启动 `robo_ctrl_node` 未形成可用状态证据；受控前台会话可成功连接右臂并发布 `/R/robot_state`。
- 本轮只读状态接入成功，没有调用运动、夹爪或 `/competition/run`。

### New Rules
- 实机 `robo_ctrl` 状态接入必须以 node list、topic hz 和一次显式消息类型 echo 为证据；后台 PID 或首行日志不能算成功。
- 后台启动方式异常时，优先用受控前台会话拿证据，并在结束时明确终止节点，避免留下运动服务。
- 右臂相机确认不等于右臂运动安全确认；任何真实 jog 前仍需单独确认方向、距离、速度、急停、工作区无人和周边安全距离。
- 双臂外参和指尖工具模型未 verified 前，只允许单臂小增量验证，不允许协作动作或“不打架”声明。

## 2026-05-06 右臂夹取预检查复盘

### Facts
- 右臂状态读取正常，`/R/robot_state` 约 5 Hz，`motion_done=true`、`error_code=0`。
- 右彩色快照中 YOLOv8 检测到 `cocacola`，confidence `0.894`。
- 原生 V4L2 ioctl/mmap 可读取 `/dev/video0` Z16；OpenCV V4L2 打不开，OBSENSOR 返回全 0。
- 同一目标 ROI 的 raw depth median 为 `676`，按仓内默认 0.125 比例是 `84.5 mm`，按 raw=mm 是 `676 mm`。
- 当前没有可信 `Rtcp/right_tcp -> right_camera_depth_frame` 外参，不能把右相机像素点转成右臂抓取位姿。

### New Rules
- 右臂 eye-in-hand 夹取前，深度单位和右相机外参必须独立 verified；任何一个不确定都不得进入自动靠近或合爪。
- 彩色检测和深度交替快照只能作为 no-motion scout，不得作为运动级闭环。
- 遇到深度单位存在 0.125x 与 1.0x 冲突时，按 fail-closed 处理；不能选择更乐观的距离解释来允许运动。
- “现场无人”只解除人员风险，不解除设备碰撞、障碍物、标定和深度质量门控。

## 2026-05-07 右臂实机控制与 J6 调整复盘

### Facts
- 用户现场确认 `/dev/video14` 是右臂相机；早先误用 `/dev/video6` 的问题已修正，预检脚本默认右相机改为 `/dev/video14`，默认右深度改为 `/dev/video8`。
- HDU-PHOENIX/FairinoDualArm 的 `RobotMoveCart.srv` 与本仓一致；参考任务代码更常用 `tool=-1/user=-1/blend_time=0.0` 和更明显的位移/速度。
- 本轮右臂真实完成 `Z -20mm x 2` 和 `X/Y` 矩形组合路径，累计请求路径 `120mm`，最终状态为 `motion_done=true`、`error_code=0`。
- 直接 `/R/robot_move` MoveJ 把 J6 从约 `0.134deg` 改到 `45deg` 被控制器拒绝，错误码 `14`；StopMotion/ResetAllError 后恢复。
- `ServoMoveStart + /R/robot_servo_joint + ServoMoveEnd` 小步增量 J6 `+10deg` 成功，J6 到约 `10.16deg`。

### Worked
- 先把用户指出的相机错误当作硬事实处理，停止误标链路，再用现场确认建立右相机运行标识。
- 运动请求按参考仓库格式调整后，`tool=-1/user=-1/blend_time=0.0` 的 MoveCart 增量路径稳定完成。
- 直接关节 MoveJ 失败后立即 StopMotion/ResetAllError，没有继续叠加危险请求。
- 对 J6 改用小步 ServoJ，比一次性大角度 MoveJ 更适合作为现场视觉校正。

### New Rules
- 右/左相机命名以现场画面确认为准；历史 serial/path 只能作为候选。
- 已经运行的可视化话题若是候选命名，不必为改名立即重启；但文档必须明确用户现场确认结果。
- 实机大于 10cm 的“明显运动”可以分段完成，但每段必须有停稳采样或等效闭环。
- 直接关节 MoveJ 出现错误码后，不再换大角度重试；先 StopMotion/ResetAllError，再改用小步 ServoJ/JOG。
- J6 相机朝向调试必须由现场画面判断方向；方向未确认前每次只加 `10deg` 级别的小步。

## 2026-05-08 Production Runtime Authority Closure 复盘

### Facts
- 本轮是 software-only 架构收口，未启动真实硬件，未调用 `/competition/run`，未声明真机安全或比赛成功。
- production runtime authority 被固定为 `scene_fusion -> /planning/* -> /execution/* -> /competition/run`。
- `robo_ctrl` 只作为 raw service provider/driver；`execution_adapter` 是唯一 production raw motion service caller。
- `quick_competition`、quick config、quick scripts 和旧 quick tests 已退出 active `packages/` 并归档到 `archive/quick_competition_2026-05-08/`。
- console API production 构造路径不再创建 raw robot motion clients，raw jog/direct send 只在 debug token gate 下可用。
- 相机事实源改为 profile-first；`/dev/video*` 只能作为 debug ephemeral override。

### Worked
- 先做 baseline evidence，再修改运行边界，能把“软件检查已通过”和“架构收口后的新证据”分开。
- 静态 checker 把 raw service、IK、launch、Quick archive、CLI token gate 和 camera profile 放到一个可重复入口，比人工 `rg` 更适合作为 CI 守门。
- 将 Quick 移出 active colcon base path，比只改 launch/build group 更彻底，避免 `full: *` 或手工 colcon 路径重新安装旧旁路。
- console API 用 production/debug 构造分层，而不是只隐藏前端按钮，能防止后端 raw client 被 production launch 带起。

### New Rules
- raw motion 豁免必须精确到实现层：`packages/control/robo_ctrl/**` 是 provider，`packages/control/execution_adapter/**` 是 production adapter；不能按 `packages/control/**` 整体放行。
- motion-capable tool 默认必须 no-motion/dry-run；真实硬件必须同时有显式 hardware flag 和环境变量 token。
- 生产 launch 合同要检查实际拉起节点和构造参数；不能只看源码中有没有某个 import。
- 右臂夹取恢复必须重新采集 precheck，重新验证外参、深度单位、ROI、clearance gate、`motion_done` 和 gripper status。
