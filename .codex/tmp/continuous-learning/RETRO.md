# dual-arm 任务复盘

更新时间：2026-04-26

## 2026-04-26 Software-only Hardening 复盘入口

### Worked
- 先建立软件-only 护栏再做安全和控制相关修改，可以避免 review 后的修复误触实机。
- Wave 0 基线把 README 覆盖和 pytest 缺失直接转成后续可执行任务，避免只停留在报告。
- Wave 1 先从 HTTP 暴露面和 mockable stop 入口入手，能在不碰实机的前提下先降低最直接的软件风险。
- Wave 2 把安全逻辑抽成无 ROS 依赖 helper 后，测试能同时服务普通 pytest 和 colcon test，避免 ROS graph 成为单元测试前提。
- Playwright 使用 route mock API 后，前端 smoke 不再依赖手工启动 API。

### Waste
- 当前系统缺少 `pytest` 命令，说明测试入口不能假设全局工具已安装；Wave 2 需要提供明确依赖说明或脚本降级提示。
- Playwright 第一次失败来自文本断言命中多个元素；API-backed UI 测试应优先断言 mock 调用计数或 role 精确选择器。

### Trigger Redesign
- signal：用户要求 review 后直接修复/重构，并要求提交推送。
- route：进入 auto-pipeline 多 Wave 执行，按 Wave 提交。
- guard：先写软件-only 护栏，所有验证默认 mock/dry-run。
- signal：控制台 API 暴露 motion、gripper、recover、delete 或 process control。
- route：默认本机监听 + token 鉴权 + 审计日志。
- guard：无 token 时危险 API 默认拒绝，而不是依赖网络隔离。

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
