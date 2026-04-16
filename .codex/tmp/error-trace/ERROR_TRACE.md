# Error Trace

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
