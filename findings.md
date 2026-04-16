# Findings: dual-arm 工作区走读

创建时间：2026-04-15
更新时间：2026-04-15

## 顶层定位
- `workspaces/dual-arm` 是一个独立 Git 工作区，目标是双臂比赛/任务执行系统，而不是单纯 MoveIt demo。
- 当前主生产链位于 `src/`，旧规划与旧控制资产分别保留在 `arm_planner/` 与 `robo_ctrl/`。
- `STATE.md` 显示当前工程已完成双臂 MoveIt 基础贯通，但 production 仍卡在 `planning_scene_sync` 真同步和 `execution_adapter` 双臂同步收口。

## 目录分层
- `src/interfaces/dualarm_interfaces`：统一消息、服务、action 协议层。
- `src/perception/*`：2D 检测适配、球/篮筐估计、场景融合。
- `src/planning/*`：抓取目标生成、PlanningScene 同步。
- `src/control/execution_adapter`：规划轨迹到真实执行的桥接层。
- `src/tasks/dualarm_task_manager`：比赛状态机与总控。
- `src/transforms/tf_node`：TF 转换支撑。
- `src/bringup/*`：生产启动与聚合支撑。
- `arm_planner/`：Fairino 单臂/双臂描述、MoveIt 配置、规划服务节点。
- `robo_ctrl/`：Fairino SDK 封装与真实机械臂 ROS 接口。
- `tools/`：标定、键控、TF 采集与查询等调试工具。

## 当前已确认事实
- 顶层 `README.md` 中描述的生产链与 `STATE.md` 中记录的 Wave 进展基本一致。
- 顶层文档已明确将 `detector` 视为冻结包，不计划在本工作区内继续修改模型与训练。
- `SETUP_2026-04-15.md` 说明这套架构重构已在 `2026-04-15` 前后形成当前状态。

## 主生产链
- `detector` 输出旧 `detector/msg/Bbox2dArray`，但当前生产链希望通过 `detector_adapter` 归一化后再使用。
- `depth_handler` 和 `ball_basket_pose_estimator` 共同产出 `SceneObjectArray`；前者负责瓶子/杯子等 2D+深度转 3D，后者负责球/篮筐 ROI 深度估计。
- `scene_fusion` 做 track、稳定性门控、ID 归一化与场景版本递增，输出权威原始场景。
- `planning_scene_sync` 当前只做 reservation / attach overlay 和 managed scene 重发，还没有真正把 world / attached object 写入 MoveIt PlanningScene。
- `grasp_pose_generator` 按语义类型规则生成 `GraspTarget`，双球默认走 `dual_arm`，瓶子和杯子走单臂模板。
- `fairino_dualarm_planner` 是 MoveIt 服务适配器，提供 `PlanPose / PlanJoint / PlanCartesian`，会检查 scene 和 robot state freshness。
- `execution_adapter` 将 MoveIt 轨迹转成 `robo_ctrl` 与 `epg50_gripper_ros` 服务调用，并维护 attach / detach 同步。
- `dualarm_task_manager` 是总控状态机，通过 `/competition/run` action 驱动一整轮比赛骨架流程。
- `competition_start_gate` 负责外部开赛信号或自动触发。

## 规划与执行耦合
- 双臂 MoveIt 组名固定为 `left_arm / right_arm / dual_arm`，末端为 `left_tcp / right_tcp`。
- 双臂 `PlanPose` 当前通过对同一目标 pose 在 `y` 方向加减 `dual_arm_half_span` 来构造左右目标，因此更像“对称双手接近”而不是基于对象几何的双臂抓取求解。
- `PlanCartesian` 目前明确不支持 `dual_arm` 单接口。
- `execution_adapter` 单臂轨迹会把弧度转换成度后调用 `/L|R/robot_servo_joint`；双臂执行会分别异步发送左右轨迹，并以发送时刻差作为 `sync_skew_ms`。
- `joint_state_aggregator` 将 `/L/joint_states` 和 `/R/joint_states` 拼成 MoveIt 使用的统一 `/joint_states`。

## 历史与兼容资产
- `dualarm/` 已经退化为兼容壳层，`robot_main.launch.py` 只转发到 `dualarm_task_manager`。
- `fairino3_v6_planner` 是旧单臂 MoveIt 规划器，仍保留 `target_pose` 订阅和 `get_trajectory_poses / get_joint_states` 服务，用于单臂历史链路。
- `robo_ctrl/high_level.cpp` 是更老的高层轨迹生成与调试执行层，会自己做线性/圆弧插值后调用 Servo 服务，不是当前生产主链核心。
- `tools/` 是标定与调试工具箱，不参与生产闭环。

## 顶层包角色
- `detector`：冻结的 2D 检测器，仍带 TensorRT 默认路径与旧消息接口。
- `depth_handler`：2D 检测 + 深度图到 3D 场景对象的关键桥接层，同时保留旧 `bbox3d` 输出。
- `camera_info_interceptor`：重发并改写 `camera_info` 的轻量组件。
- `epg50_gripper_ros`：串口 Modbus 夹爪驱动，提供命令、状态与 rename 服务。

## 当前风险与空洞
- `planning_scene_sync` 还不是“真” PlanningScene 同步，和 `STATE.md` 记录一致，是当前 production 最明显未收口点。
- `scene_version` 在 `scene_fusion` 会递增，但 `ball_basket_pose_estimator` / `depth_handler` 初始对象仍写入 `scene_version=0`，场景 freshness 与 managed scene 版本之间仍有断层。
- `dualarm_task_manager` 的状态机很完整，但很多状态仍是占位成功，例如开盖、倒水、倒可乐等 primitive 仍未落到具体动作。
- `detector`、`tools` 和部分旧包里保留了多个旧工作区路径，如 `/home/phoenix/roboarm/FairinoDualArm/...`，这些默认值不能直接当当前环境事实。
- `tests/competition`、`tests/hardware`、`tests/integration`、`tests/unit` 目录目前为空，系统主要依赖手工构建和 smoke 验证。
- `robo_ctrl` 代码中混有较多调试输出、旧 TF 命名和历史容错逻辑，后续做生产收口时需要谨慎处理。

## 已核对证据
- `colcon list --names-only` 当前可见 25 个包。
- `third_party/fairino_sdk/software/README_CTL.txt` 记录版本为 `v3.7.5.1`，日期为 `2025-09-05`。
- `tests/` 目前只有目录，没有测试文件。

## 2026-04-16 并行窗口协作新增发现
- Git worktree 之间共享对象库，但 repo 内被跟踪的文件并不是“实时共享文件”；如果把窗口状态和共享协调文件继续放在各自 worktree 里的 repo 路径，会出现“每个窗口只看到自己分支上的版本”。
- 因此，并行窗口的实时共享状态必须放到工作区外部的共享目录，而不是放在各自 branch 的 repo checkout 中。
- 继续保留在 repo 内的文件应只承担：
  - 只读规范
  - 只读任务卡
  - 最终沉淀记录
- 行为开发如果立即并行，必须从第一天就把代码写到独立行为模块目录，不能等 orchestration/execution 主文件先拆完，否则会形成串行依赖。
- 2026-04-16 `coord_rev=3` 新增判断：共享窗口文件中尚无活跃业务窗口声明 `maintenance-ready`，因此当前不满足轮换门槛；待命窗口继续 dormant 更安全。
- 2026-04-16 `coord_rev=3` 新增判断：Wave 5 已有运行态 smoke 证据，但原任务卡缺独立 W5 卡片，容易让后续 Wave 4 修改时误伤回归基线；已补建独立 `W5-planning-scene-sync.md` 作为固定基线。
- 2026-04-16 `coord_rev=4` 新增判断：行为窗口的子目录写集与 `execution-control` / `task-orchestration` 的父级写集存在潜在轮换冲突；当前 dormant 不冲突，但进场前必须释放或收窄父级写集。
- 2026-04-16 `coord_rev=4` 新增判断：业务窗口的 `last_shared_sync_rev` 仍停留在 2，协调窗口不能替它们声明已读；应通过 `coord_required_sync_rev=4` 强制它们在新任务或新 subagent 前自行重读并更新状态。
- 2026-04-16 `coord_rev=6` 新增判断：任务卡与共享状态存在版本漂移，多个任务卡仍写着 `coord_rev=4`；协调窗口必须在发起下一轮任务前统一刷新到当前版本，避免业务窗口拿旧卡开工。
- 2026-04-16 `coord_rev=6` 新增判断：`scene-freshness` 已经具备最清晰的 maintenance-ready 证据，是第一退出候选；其退出不会破坏 W5 基线，因为 `W5-planning-scene-sync.md` 已独立冻结。
- 2026-04-16 `coord_rev=6` 新增判断：首个空出的活跃槽位不应分配给行为窗口；`behavior-cap-pour` 与 `behavior-handover` 仍分别被 `execution-control` / `task-orchestration` 的父级写集阻塞。
- 2026-04-16 `coord_rev=6` 新增判断：若 `scene-freshness` 释放槽位，`ops-acceptance` 是第一安全候补，因为它当前不存在同级父子写集冲突，且软件 smoke 基线已足够支撑验收入口收口。
- 2026-04-16 subagent 平台补充：本轮协调审计 subagent 出现 `not_found / pending_init` 异常，已按项目规则本地降级；这不构成业务阻塞，但必须留痕到注册表，避免后续误判为“未使用 subagent”。
- 2026-04-16 `coord_rev=7` 新增判断：共享窗口文件已经满足 `scene-freshness` 的退场前置条件，不必再等待额外口头确认；协调窗口现在可以直接发出单槽位交换指令。
- 2026-04-16 `coord_rev=7` 新增判断：`execution-control` 虽然 worktree 仍是干净的，但其 `agents.json` 里仍有运行中的 subagent，因此不能被误判为“可优先退场”。
- 2026-04-16 `coord_rev=7` 新增判断：`perception-camera` 与 `task-orchestration` 都处于“业务改动 + 运行中 subagent”双活状态，本轮只适合保持原位，不适合并发再做第二个槽位调整。
- 2026-04-16 `coord_rev=7` 新增判断：第一轮轮换应严格限制为 `scene-freshness -> ops-acceptance` 单槽位交换；行为窗口继续等待后续父级写集释放。
- 2026-04-16 `coord_rev=7` 新增判断：`ops-acceptance` 更准确的状态是 `admit-after-sync`，不是 `ready-to-admit`；因为其共享窗口文件仍停在旧同步版本，进场前必须先重读 11 个文件并新开 task subagent。
- 2026-04-16 最终整合判断：真正需要并入 `test` 的只有 `scene-freshness`、`perception-camera`、`execution-control`、`task-orchestration` 四个 worktree；其余业务分支相对 `test` 没有 payload。
- 2026-04-16 最终整合判断：`test` 根工作树在合并前的最大风险不是 git 冲突，而是本地临时产物污染；清理 `.artifacts/`、`.tmp/`、`.codex/tmp/coordination/` 后即可得到干净集成基线。
- 2026-04-16 最终整合判断：全量构建在干净 ROS shell 下通过，说明 merged `test` 已至少满足软件侧 Build Gate，可进入下一步硬件联调。

## 2026-04-15 硬件连通性补充
- `robo_ctrl/include/libfairino/robot.h` 明确显示法奥 SDK 通过 `RPC(const char *ip)` 与控制器通信，本体控制链路是基于控制器 IP，而不是串口。
- `robo_ctrl/launch/robo_ctrl_L.launch.py` 默认左臂 IP 为 `10.2.20.201:8080`，`robo_ctrl_R.launch.py` 默认右臂 IP 为 `10.2.20.202:8080`。
- `epg50_gripper_ros/launch/launch.py` 默认串口是 `/dev/ttyACM0`，说明串口控制主要对应夹爪而非机械臂本体。
- 官方页面 `法奥机械臂网络配置-Ubuntu` 说明：
  机械臂外接应走 PC 的有线网卡直连，控制器默认 IP 为 `192.168.58.2`，PC 端建议固定为 `192.168.58.10`，并把有线网卡设为 `100Mb/s + Half Duplex + autoneg off`。
- 当前系统未发现 `/dev/ttyACM*` 或 `/dev/ttyUSB*` 设备，因此本机当前看不到可用串口设备。
- 非运动实测中，`epg50_gripper_node` 启动即报 `Failed to open serial port`，说明夹爪串口链路当前不可用。
- 非运动实测中，`robo_ctrl_node` 连接 `10.2.20.201` 时先显示成功连接，但随后状态线程反复出现 `-2`、`Connection reset by peer` 和 `Broken pipe`，说明控制器会话不稳定，当前不适合直接发运动控制命令。
- `ip route get 10.2.20.201` 与 `10.2.20.202` 显示当前路由经 `wlp4s0` 的网关转发，不是本地直连有线网卡。
- 已按官方页将 `enp5s0` 修改为 `192.168.58.10/24`、`100Mb/s`、`half duplex`、`autoneg off`。
- 修改后 `192.168.58.2` 仍然 `ping` 不通，ARP 状态为 `FAILED`，`curl --noproxy '*'` 和 `nc` 都显示 `No route to host`。
- 在官方默认 IP `192.168.58.2` 下，`robo_ctrl_node` 仍会先显示连接成功，随后立刻进入 `-2 / Connection reset by peer / Broken pipe` 的循环，说明当前仍不具备稳定控制条件。
- 进一步在 `192.168.58.0/24` 中做轻量探测，发现 `192.168.58.3` 的 `80` 和 `8080` 端口开放。
- `ping 192.168.58.3` 0% 丢包，`curl --noproxy '*' -I http://192.168.58.3` 返回 `302 -> /index.html`，符合控制器 Web APP 特征。
- 使用 `robot_ip:=192.168.58.3` 启动 `robo_ctrl_node` 后，左臂状态链路稳定建立；`/L/robot_state` 可读到真实关节角、TCP 位姿、`motion_done: true`、`error_code: 0`。
- `ros2 service list` 已确认左臂服务接口存在：`/L/robot_move`、`/L/robot_move_cart`、`/L/robot_servo`、`/L/robot_servo_joint`、`/L/robot_servo_line`、`/L/robot_set_speed`。
- 当前最准确的判断是：左臂本体已可控，夹爪不可控，右臂未验证。
- 2026-04-15 后续修正：右臂 `192.168.58.3` 通过 `enp5s0=192.168.58.10` 验证可控；左臂 `192.168.58.2` 实际接在新出现的 USB 有线网卡 `enx00e04c36025f` 上。
- 左臂不通的根因是 `enx00e04c36025f` 没有 IPv4 地址且在等待 DHCP，而法奥控制器不会给 PC 分配 DHCP；本机到 `.2` 的流量错误地走了 `enp5s0`。
- 已修复：`有线连接 2` 配置为 `192.168.58.11/24 + 100Mb/s + Half Duplex + autoneg off`，并添加 `192.168.58.2/32` 主机路由。
- 修复后路由为：`.2 -> enx00e04c36025f src 192.168.58.11`，`.3 -> enp5s0 src 192.168.58.10`。
- 修复后左臂 `ping`、Web、`8080`、`robo_ctrl_node`、`/L/robot_state`、`/L/*` 服务均验证通过。
- 当前规划测试的关键结论：
  - `fairino_dualarm_planner` 必须通过 `fairino_dualarm_planner.launch.py` 启动，不能直接 `ros2 run`，否则会缺少 `robot_description_semantic`。
  - 无摄像头测试时，使用 `tools/scripts/publish_empty_scene.py` 比 `ros2 topic pub ... -r 10` 更稳定，能够持续满足 planner 的 scene freshness 检查。
  - 在左右臂 `robo_ctrl_node`、`move_group`、`empty_scene_publisher`、`fairino_dualarm_planner` 同时运行时：
    - `PlanPose(right_arm)` 成功
    - `PlanPose(left_arm)` 成功
- `robo_ctrl` 的 `MoveCart` 旧逻辑存在一个误导性行为：
  - 等待运动完成超时后仍返回成功
  - 这会造成“服务 success=True，但肉眼没明显看到动作”的假阳性判断
- 已修复：
  - `MoveCart` 超时现在返回失败
  - `错误码 112` 现在会直接附带中文解释“目标位姿不可达”
- 真机动作验证结果：
  - 左臂在低速下执行 `MoveCart(use_increment=true, z=+5mm)`，服务成功且状态回读确认 TCP `z` 增加约 `5mm`
  - 右臂在低速下执行 `MoveCart(use_increment=true, z=-5mm)`，服务成功且状态回读确认 TCP `z` 减少约 `5mm`
  - 说明当前双臂至少具备“低速、小幅、笛卡尔增量控制”能力
- 进一步测试中，右臂在低速下执行 `MoveCart(use_increment=true, z=-50mm)`，服务成功且状态回读确认 TCP `z` 减少约 `50mm`
- 说明右臂当前已具备“低速、中等幅度、笛卡尔 Z 向下增量控制”能力
- 但用户现场观察“没有看到机械臂实际移动”，因此这条结论当前只能算“控制器状态/SDK反馈成功”，不能单独当作“物理本体已确认运动”。
- 浏览器自动化登录 `192.168.58.3` 后，页面顶部状态显示为 `Drag`，这是一个重要线索：
  - 可能当前右臂处于拖动/手动模式
  - 也可能当前观察到的物理机械臂与 `.3` 控制器并非同一台
- 后续真实动作验证前，需要先确认：
  - `.2/.3` 与左右物理机械臂的实际映射
  - 目标机械臂不处于 `Drag` 手动拖动模式
  - 机械臂已处于可接受远程运动的模式与使能状态
- 观察到一个残余问题：
  - `move_group` 在 `Ctrl+C` 收口时出现一次 shutdown segfault
  - 该问题发生在规划已成功完成、进程退出阶段，不影响当前运行态测试结论
  - 后续若要做长期稳定运行，需要单独排查 MoveIt 收口时的对象释放顺序
- 新增前端显示问题定位：
  - 用户浏览器中法奥控制台 3D 视图出现“蓝色拉伸面/只剩一个点”的异常
  - 同一控制器页面左侧 Joint/TCP 数值仍然正常更新，说明后端通信和状态获取没坏
  - 该症状属于浏览器侧 WebGL / Three.js / URDF mesh 渲染异常，不是机械臂控制链路本身的问题
  - 结合此前 Firefox 渲染异常与图形栈信息，当前结论是：法奥控制台页面应优先使用 Chrome 打开
- 新增控制器模式与待机位结论：
  - 网页顶部状态曾显示 `Drag`，需要和“机器人模式”分开判断，不能只靠灯色推断模式。
  - 2026-04-15 现场修正灯色语义：
    - 蓝色：自动模式，且自动模式下默认不可拖动
    - 绿色：手动模式，不可拖动
    - 青色：手动模式，可拖动
  - 因此，蓝灯不是异常证据，也不是非自动状态证据；后续要同时确认拖动状态与机器人模式。
  - 已新增 `robot_mode_helper`，用于直连控制器执行：
    - 查询程序状态
    - 查询/退出 Drag
    - 切换自动模式 `Mode(0)`
    - 上使能 `RobotEnable(1)`
  - `robot_mode_helper --normal-only` 在右臂上返回成功；预期现场表现可以是蓝灯，因为蓝灯对应自动模式。
  - 直接将右臂送到全零 `home` 位失败，错误码 `14（命令执行失败）`
  - 这说明当前项目中的 `home=[0,0,0,0,0,0]` 不能直接当成真实右臂的待机位
  - 后续暂以 `robo_ctrl/README.md` 中那组关节角作为候选保守待机姿态，但其真实物理结果仍需现场确认
- 新增右臂“保模式控制”结论：
  - 当前代码已修正：`robo_ctrl_node` 动作前默认不再无条件执行 `Mode(0)`；仅在显式参数要求时才切自动模式。
  - `robot_mode_helper` 默认也改为“保持当前机器人模式”，只负责退出拖动与上使能；可通过 `--auto-mode` 或 `--manual-mode` 显式切换。
  - 本轮完整链路验证使用的是“直接启动 `robo_ctrl_node` 可执行文件 + `LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libstdc++.so.6`”，因为 `ros2 launch` 当前会被 Miniconda 的 `libstdc++` 污染。
  - 在新代码路径下，右臂 `MoveCart(use_increment=true, z=+5mm)` 与 `z=-5mm` 都已成功，状态回读分别显示 `tcp_pose.z` 约 `656.741 -> 661.742 -> 656.741 mm`。
  - 目前还缺最后一个现场闭环：确认在这条“保模式”链路下，右臂灯色是否保持绿色。
- 新增驱动稳定性结论：
  - `robo_ctrl_node` 原先动作服务与状态线程并发访问 `FRRobot` 连接，容易导致 `-2 / reset by peer / broken pipe`
  - 已加锁修复，后续所有真实动作测试都应基于新编译后的 `robo_ctrl`
