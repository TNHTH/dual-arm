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

## Incident 9
- Time: 2026-04-15
- Scope: YOLOv8 `.pt` GPU 接入
- Symptom: 初始系统 Python 里 `torch=2.6.0+cpu`，`torch.cuda.is_available()` 为 `False`，无法让 `best.pt` 走 GPU。
- Root cause: ROS 系统 Python 之前安装的是 CPU 版 PyTorch，不是 CUDA wheel。
- Handling: 使用 PyTorch cu124 wheel 将系统 Python 用户环境切换为 `torch=2.6.0+cu124`、`torchvision=0.21.0+cu124`，并验证 RTX 4060 GPU 可见。
- Prevention: 后续 `.pt` 现场推理前先检查 `torch.__version__` 和 `torch.cuda.is_available()`，不要只看 `nvidia-smi`。

## Incident 10
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
  2. 计划将 attach diff 改为完整 `AttachedCollisionObject ADD`，并在 world->attached 转换时同步发送 world `CollisionObject REMOVE`；
  3. 计划为 detach 保留 `AttachedCollisionObject REMOVE + world CollisionObject ADD` 的反向迁移语义；
  4. 补充 diff 摘要日志，避免后续只看到笼统超时。
- Evidence:
  - `smoke_planning_scene_sync.py` 输出：`attach failed`
  - `planning_scene_sync` 日志：`同步等待 apply_planning_scene 结果超时`
- Prevention: PlanningScene service 路径不得依赖默认互斥 callback group 内的同步等待；MoveIt attached/world 迁移必须按官方 diff 语义显式构造。

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
- Time: 2026-04-19
- Scope: 控制台 API 与网页静态代理
- Symptom: 控制台页面能打开，但右上角显示 `API UNKNOWN`，页面动作区显示 `null`；`curl http://127.0.0.1:18081/api/health` 返回 `Empty reply from server`。
- Root cause: `competition_console_static_server.py` 仍在 `18081` 提供静态页面，但 `competition_console_api_node.py` 的 `18080` 后端未运行；静态代理遇到 API 连接失败时未返回明确 JSON，导致浏览器只看到空响应。
- Handling:
  1. 重新启动 `competition_console_api_node.py`
  2. 在 `competition_console_static_server.py` 中为 `/api/*` 反向代理增加异常处理
  3. API 不可用时返回 `502` 与 `{"error":"competition_console_api_unavailable"}` JSON
- Evidence:
  - 修复后 `curl http://127.0.0.1:18080/api/health` 正常
  - 修复后 `curl http://127.0.0.1:18081/api/health` 正常
- Prevention: 网页入口以后必须同时检查 `18081` 静态页面和 `18080` API；静态代理不得对后端失败返回空响应。

## Incident 30
- Time: 2026-04-19
- Scope: 自定义姿态切换
- Symptom: 用户保存多个姿态后，点击“切换”机械臂看起来不动或失败。
- Root cause:
  1. 早期实现直接调用 `/L|R/robot_move`，未经过规划和执行器
  2. 后续改为 `PlanJoint -> ExecuteTrajectory` 后发现姿态库保存的是角度 `deg`，而 `PlanJoint.target_joints.position` 需要弧度 `rad`
  3. 错误单位导致 MoveIt 把目标压到 joint bounds，并产生假碰撞
- Handling:
  1. `/api/presets/move` 改为先调用 `/planning/plan_joint`
  2. 再发送 `/execution/execute_trajectory`
  3. `_build_joint_state_target()` 中对姿态库角度执行 `math.radians(...)`
  4. 返回 payload 增加 `stage`、`result_code`、`planning_time_ms`、`current_joint_positions`、`target_joint_positions`、`max_joint_delta_deg`
- Evidence:
  - 单位修复后不再复现原先的假碰撞日志
  - 右臂姿态 `抓瓶子` 通过 `/api/presets/move` 返回 `success=true`
- Prevention: 所有跨 ROS message 的角度字段都必须明确单位；控制器侧姿态库保持 `deg`，MoveIt/JointTrajectory 接口使用 `rad`。

## Incident 31
- Time: 2026-04-19
- Scope: stale ROS graph / duplicate execution adapters
- Symptom: 右夹爪出现反复合上/展开，姿态切换时 `competition_console_api` 日志提示 `/execution/execute_trajectory` 有多个 action server；`ros2 node list` 可见多个同名 `/execution_adapter`、多个 gripper、多个 `robo_ctrl`。
- Root cause: 多次从网页/API 和命令行启动 `competition_core`，旧进程未完全清理，导致多个 action server 和多个硬件驱动同时存在，串口和控制器连接互相抢占。
- Handling:
  1. 手动强制清理旧 `competition_core`、`move_group`、planner、execution、gripper、`robo_ctrl_node`
  2. 在 `competition_console_api` `_start_core_process()` 前增加 `_cleanup_stale_core_processes()`
  3. 清理后确认 `/execution/execute_trajectory` 只有 1 个 server
- Evidence:
  - 清理前 `/execution/execute_trajectory` 曾出现 7 个 action server
  - 清理后只有 `/execution_adapter` 1 个 server
  - 清理后右臂姿态 `抓瓶子` 可执行
- Prevention: 每次真机 bringup 前必须先查 action server 数量；若 `/execution/execute_trajectory` server > 1，禁止继续发运动/夹爪命令。

## Incident 32
- Time: 2026-04-19
- Scope: `robo_ctrl` ServoJ execution
- Symptom: 姿态切换规划通过后，左臂执行阶段 `left_robo_ctrl` 崩溃，日志出现 `terminate called after throwing an instance of 'XmlRpc::XmlRpcException'`。
- Root cause: `robo_ctrl_node.cpp` 的 ServoJ 执行线程直接访问 `FRRobot`，没有和状态轮询共享 `robot_mutex_`，也没有捕获线程异常；SDK/RPC 异常会直接导致进程 abort。
- Handling:
  1. ServoJ 增量基准读取加 `robot_mutex_`
  2. ServoJ 线程内 `robot_->ServoJ()` 和 `WaitMs()` 加 `robot_mutex_`
  3. 线程体增加 `try/catch`，异常时记录日志并清 `is_servo_running_`
  4. 重建 `robo_ctrl`
- Evidence:
  - 修改前日志出现 `XmlRpc::XmlRpcException` 并进程 exit code `-6`
  - 修改后右臂姿态切换可通过 `ExecuteTrajectory` 成功执行
- Prevention: 所有后台线程访问 `FRRobot` 必须统一走 `robot_mutex_` 并兜底异常，不能让 SDK 异常跨线程逃逸。

## Incident 33
- Time: 2026-04-19
- Scope: 右臂控制器自带 Web 页面
- Symptom: `http://192.168.58.3` 在浏览器中显示 `ERR_EMPTY_RESPONSE`；用户认为“右臂网页打不开”。
- Root cause: 控制器 TCP/IP 可达，`/` 和 `/index.html` 可返回 `302`，`curl /login.html` 可取 HTML，但 Chromium 跟随页面加载时仍会空响应；问题在控制器 Web 服务/浏览器请求链路，不等同于 ROS 控制链断开。
- Handling:
  1. 用 Playwright 打开 `http://192.168.58.3` 与 `/login.html` 复现 `ERR_EMPTY_RESPONSE`
  2. 用 `curl` 验证 `/index.html -> /login.html` 的 `302` 和 `/login.html` 的 HTML 内容
  3. 将该问题从 ROS 控制链中拆出，避免误判为右臂不可控
- Evidence:
  - `ping 192.168.58.3` 正常
  - `curl -I http://192.168.58.3` 返回 `302`
  - `curl http://192.168.58.3/login.html` 返回 HTML
  - Chromium 仍显示 `ERR_EMPTY_RESPONSE`
- Prevention: 控制器自带网页异常时，优先区分“HTTP/Web 服务异常”和“SDK/ROS 控制链异常”；不要用网页打不开直接否定 `/R/robot_state` 和 `/R/robot_move_cart`。

## Incident 34
- Time: 2026-04-20
- Scope: 桌面深度建模第一版
- Symptom: 第一版桌面拟合 overlay 把中后部大平面与背景一起识别为桌面，而前景木桌大面积没有被覆盖；与肉眼看到的桌面不一致。
- Root cause: 纯深度 RANSAC 默认选择“有效深度点最多的平面”，当前前景木桌存在明显深度缺失，导致中后部更完整的平面在统计上占优。
- Handling:
  1. 保留深度平面拟合作为约束；
  2. 增加“彩色木桌区域先验”做候选筛选；
  3. 输出两层 overlay：
     - `table_color_guided_overlay.png`：更接近肉眼桌面
     - `table_depth_confirmed_overlay.png`：深度真实确认区域
  4. 将结论写入 `table_depth_analysis_adjusted.json`
- Evidence:
  - `.artifacts/camera_debug/table_depth_analysis_adjusted.json`
  - `.artifacts/camera_debug/color_latest_adjusted.png`
  - `.artifacts/camera_debug/table_color_guided_overlay.png`
  - `.artifacts/camera_debug/table_depth_confirmed_overlay.png`
- Prevention: 后续桌面建模不要只凭“最大深度平面”判桌面；必须把 RGB 视觉一致性作为主验收标准，深度平面作为几何确认。

## Incident 35
- Time: 2026-04-20
- Scope: 桌面建模工具接入被中断
- Symptom: `table_surface_detector.py` 已写入，`depth_handler` 和 `tools` 包也已开始接桌面约束，但中途被用户打断；当前工作树处于“脚本存在、运行态未验证、构建未闭环”的中间状态。
- Root cause: 本轮实现跨 `tools` / `depth_handler` / launch 多处写集，尚未走完完整 build 和 runtime 验证。
- Handling:
  1. 停止继续扩写；
  2. 把当前中间状态、证据和下一步入口写回 `STATE.md`、`RETRO.md`、`IMPLEMENTATION_BREAKPOINTS.md`；
  3. 保留已启动的 Orbbec bridge 和 RGB viewer，作为下一窗口的 live 基线。
- Evidence:
  - `git status --short` 显示 `src/tools/tools/scripts/table_surface_detector.py`、`src/perception/depth_handler/*`、`src/perception/scene_fusion/scripts/scene_fusion_node.py` 等仍有未收口改动
  - live 进程仍有：
    - `competition_core.launch.py`
    - `orbbec_gemini_ros_bridge.py`
    - `ros_image_viewer.py`
- Prevention: 下个窗口接续前先检查现有 live 进程和未提交改动，不要重复恢复相机；直接从构建与 integration 收口继续。

## Incident 36
- Time: 2026-04-20
- Scope: `table_surface_detector` world 桌面发布
- Symptom:
  1. 当 `world` TF 接通后，`table_surface_detector.py` 运行时在 `do_transform_pose(...)` 处崩溃；
  2. 多次静态采样评估时，桌面法向出现接近 `180 deg` 的跳变，导致桌面标定评估假失败。
- Root cause:
  1. ROS Humble 下 `tf2_geometry_msgs.do_transform_pose()` 这里被错误地喂入了 `PoseStamped`，而不是 `Pose`；
  2. 平面法向存在符号二义性，运行态和评估脚本都没有做统一，导致同一平面被当成相反法向。
- Handling:
  1. `table_surface_detector.py` 改为先查原时间戳 TF，失败再回退到最新 TF；
  2. `PoseStamped -> Pose` 转换后再做 TF，重新封装为 `PoseStamped`；
  3. 失败时继续发布空 `SceneObjectArray` heartbeat；
  4. 运行态按 `world` 法向方向重算桌面姿态，评估脚本按无符号法向比较；
  5. 新增桌面采样与评估脚本，并实际采集 `live_smoke_v2` 三个样本。
- Evidence:
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm/.artifacts/calibration/left_camera/live_smoke_v2/summary.json`
  - 结果：
    - `world_height_range_m=0.000682`
    - `normal_drift_deg_max=2.5226`
    - `median_residual_mm_max=4.7870`
    - `passes=true`
- Prevention:
  - 以后凡是平面或法向稳定性评估，都要先统一法向半球或按 `abs(dot)` 比较；
  - ROS Python 下的 TF/Pose API 必须先做最小运行态验证，不能只凭记忆套接口。

## Incident 37
- Time: 2026-04-20
- Scope: 左夹爪 live reconnect
- Symptom:
  1. 当前 live ROS 图中仅有 `/gripper1/gripper_node_right` 存活，未见 `/gripper0/gripper_node_left`
  2. `/execution/set_gripper` 对默认 `left_arm` 返回 `success=False`
  3. 当前系统只剩 1 个已枚举 USB-485 口：`/dev/serial/by-id/usb-Prolific_Technology_Inc._USB-Serial_Controller_A_COb114J19-if00-port0`
- Root cause:
  - 当前尚未闭环到单一硬件根因，但软件证据已收缩到“现场没有一条能稳定触达左夹爪从站的物理串口链路”。
  - 当前唯一在线串口上，`slave_id=10` 可稳定读状态和执行命令，`slave_id=9` 不可读且扫描超时。
  - `execution_adapter` 上层路由未坏：当显式指定 `slave_id=10` 时，`arm_name=left_arm` 的 `SetGripper` 也能成功。
- Handling:
  1. 复查当前 live ROS 图、串口枚举和右夹爪参数
  2. 验证 `/gripper1/epg50_gripper/status`：
     - `slave_id=10 -> success=True`
     - `slave_id=9 -> success=False`
  3. 扫描当前在线串口 `slave_id=1..16`，仅 `10` 返回 `OK`
  4. 临时启动 `left_probe.left_gripper_probe`，将当前唯一串口绑定到 `default_slave_id:=9`，结果持续 `获取夹爪状态失败`
  5. 通过 `/execution/set_gripper` 验证：
     - `left_arm + slave_id=0 -> success=False`
     - `left_arm + slave_id=10 -> success=True`
- Evidence:
  - `ls -l /dev/serial/by-id /dev/ttyUSB* /dev/ttyACM*`
  - `ros2 node list | sort`
  - `ros2 param get /gripper1/gripper_node_right port`
  - `ros2 service call /gripper1/epg50_gripper/status ... "{slave_id: 10}"`
  - `ros2 service call /gripper1/epg50_gripper/status ... "{slave_id: 9}"`
  - `ros2 service call /execution/set_gripper ... "{arm_name: left_arm, command: 2, slave_id: 0, ...}"`
  - `ros2 service call /execution/set_gripper ... "{arm_name: left_arm, command: 2, slave_id: 10, ...}"`
- Prevention:
  - 以后排查夹爪前，先确认三件事：
    1. `/dev/serial/by-id` 当前实际有哪些设备
    2. 每条在线串口上哪些 `slave_id` 真正有响应
    3. 左右 `SetGripper` 失败是否来自上层路由，还是来自底层无 server / 无响应
- Remaining:
  - 需现场恢复左 USB-485 转换器枚举，或确认左夹爪电源、A/B、通信地线和实际从站 ID。
  - 左夹爪 `status` 可读之前，不继续做左夹爪 `enable/open/close` 真动作验收。

### Closure Update
- Time: 2026-04-20
- Corrective action:
  1. 用户重新连接左夹爪接口后，左 USB-485 转换器重新枚举为 `A7BIb114J19 -> /dev/ttyUSB1`
  2. 由于原 live 栈中的 `/gripper0/gripper_node_left` 未存活，手动补起左夹爪节点并绑定左侧 by-id 串口
  3. 先只读查询 `slave_id=9` 状态，确认 `success=True, error=0`
  4. 再通过正式 `/execution/set_gripper` 对 `left_arm` 下发最大张开命令 `position=0`
- Verification evidence:
  - `/gripper0/epg50_gripper/status` with `slave_id=9` 返回 `success=True, gact=True, gsta=3, error=0, position=255`
  - `/execution/set_gripper` with `arm_name=left_arm, slave_id=0, command=2, position=0` 返回 `success=True`
  - 控制后状态回读返回 `success=True, error=0, position=0`
- Remaining:
  - 左夹爪已恢复状态读取与最大张开控制；闭合夹持尚未测试。
  - 当前左夹爪节点为手动补起；重启整套 launch 后仍需确认 `/gripper0` 能自动拉起。

## Incident 38
- Time: 2026-04-21
- Scope: RViz competition display / model pointcloud / robot pose
- Symptom:
  1. 用户反馈 RViz 里看不到有效内容，后续截图显示 RobotModel 可见但点云/机械臂/桌面比例和现实不一致。
  2. 生成的模型点云高度不对，桌面/水瓶/可乐/球/筐模型展示不理想。
  3. 右臂新增视觉相机后，原有系统仍大量默认使用 `left_camera_*` 或 `/camera/*`，存在左右相机混淆风险。
- Root cause:
  1. RViz 空白的一次直接原因是底层 ROS 图已经退出；不能只看 RViz 进程，要同时确认 core topic/node。
  2. 机械臂姿态不准不是关节单位问题；`robo_ctrl_node.cpp` 已将 SDK 角度制关节转换为 ROS/MoveIt 期望的弧度。更高概率是 URDF 中 `world_to_left_base/right_base` 硬编码安装位姿与现场实际不一致。
  3. 模型点云高度不准来自 `scene_model_pointcloud` 直接使用 `SceneObject.pose` 作为几何中心；当外参/桌面估计未 verified 时，显示高度会漂。
  4. 当前 `left_tcp -> left_camera` 和新增 `right_tcp -> right_camera` 都未 verified，不能把 world object pose 当比赛级最终结果。
- Handling:
  1. 新增 `competition_rviz_tools`，提供 RViz task bridge、interactive marker、grasp marker 和 scene model pointcloud。
  2. 新增 `/competition/rviz/scene_model_points`，把 managed scene 中的桌面、瓶、杯、球、筐采样成模型点云。
  3. 修正 `scene_model_pointcloud`：桌面按平面高度显示；瓶/杯/筐等桌面支撑物体按 table surface 贴底显示。
  4. 将 `fairino_dualarm.urdf.xacro` 的左右基座安装位姿改为 xacro 参数，并通过 MoveIt/planner/bringup launch 透传。
  5. 在 `tf_node` 配置中新增右臂相机 frame，防止左右相机混淆。
  6. 将 `orbbec_gemini_bridge.launch.py` 改为可传 node name、topic 和 frame id，为左右双相机启动做准备。
- Evidence:
  - 增量构建通过：
    - `fairino_dualarm_description`
    - `fairino_dualarm_moveit_config`
    - `fairino_dualarm_planner`
    - `orbbec_gemini_bridge`
    - `tf_node`
    - `competition_rviz_tools`
    - `dualarm_bringup`
  - `xacro ... fairino_dualarm.urdf.xacro left_base_xyz:=... right_base_xyz:=...` 生成通过。
  - RViz 截图：`/tmp/competition_rviz_latest.png` 可见 RobotModel 与点云，但空间对齐仍不准确。
  - 安全收口后 `ps` 查询未见 ROS/RViz 业务进程残留。
- Prevention:
  - 以后每次声称 RViz 正常前，必须先截图并人工检查是否可见 RobotModel、点云、scene markers。
  - 不再把硬编码 `0 ±0.35 0` 的双臂基座安装位姿当现场事实；必须用 launch 参数或配置覆盖。
  - 新增右臂相机后，所有相机 topic/frame 必须带 left/right 前缀或明确 alias，不允许继续扩大 `/camera/*` 语义。
- Remaining:
  - 需要现场实测左右机器人基座位置/yaw。
  - 需要分别完成 `left_tcp -> left_camera` 和 `right_tcp -> right_camera` hand-eye 标定。
  - 怡宝/可乐瓶尺寸仍需卡尺实测或可靠资料校准；当前只是工程代理值。

## Incident 39
- Time: 2026-04-22
- Scope: right depth camera P0 software implementation / build and runtime smoke
- Symptom:
  1. 首次 `./build_workspace.sh` 被 `detector` CMake guard 拒绝，提示 `Conda path detected in PATH`。
  2. 使用干净 PATH 后，`detector` 构建命中旧生成目录：`build/detector/ament_cmake_python/detector/detector` 已是目录，无法创建 symlink。
  3. 首次启动 `competition_core.launch.py` 时，`xacro` 把 `right_base_xyz=0 -0.35 0` 中的 `-0.35` 当成命令行选项。
  4. core 启动后发现 `scene_fusion` 的通用 `output_topic` launch 参数被其他 include 的 `output_topic` 污染，错误输出到 `/perception/left/ball_basket_scene_objects`。
  5. 停止 core 时 `move_group` 仍可能在析构路径段错误。
- Root cause:
  1. 当前 shell 仍带 Miniconda 路径，触发已有防护。
  2. 旧 CMake/ament Python build cache 残留目录污染。
  3. MoveIt/planner launch 的 xacro 参数未对包含负数和空格的 xyz/rpy 值加引号。
  4. 多个 include launch 文件复用了 `output_topic` 等通用参数名，ROS launch 参数作用域导致串参。
  5. `move_group` 退出段错误属于既有 MoveIt shutdown 风险，本轮未定位底层析构问题。
- Handling:
  1. 使用干净系统 PATH 和清空 Python/CMake 相关环境变量重跑构建，不放宽 CMake guard。
  2. 只清理生成缓存 `build/detector` 与 `install/detector` 后重建。
  3. 给 `fairino_dualarm_moveit_config` 与 `fairino_dualarm_planner` 的 xacro 参数加引号。
  4. 将 `scene_fusion.launch.py` 参数改为 `scene_fusion_input_topics/scene_fusion_output_topic/scene_fusion_*_timeout`，避免 include 串参。
  5. 停止后复查进程，确认无 ROS 业务进程残留；将 `move_group` 退出段错误记录为剩余风险。
- Evidence:
  - 干净环境全量构建最终通过：`Summary: 27 packages finished`
  - `competition_core.launch.py --show-args` 显示 `dual_camera_mode` 与 `reobserve_once_*`
  - `scene_fusion.launch.py --show-args` 显示专用 `scene_fusion_*` 参数
  - `smoke_dual_camera_scene_dedup.py` 输出 `dual camera scene dedup smoke passed`
  - `smoke_dual_camera_scene_fusion.py` 输出 `dual camera scene fusion smoke passed`
  - `smoke_planning_scene_sync.py` 输出 `planning_scene_sync smoke passed`
- Prevention:
  - ROS 构建默认使用干净 PATH，不用带 Conda 的交互 shell 直接构建。
  - CMake/ament symlink 报 existing directory 时，优先清理对应包生成缓存，不改源码规避。
  - xacro launch 参数只要包含空格或负数，必须显式加引号。
  - 可复用 launch 文件中的通用参数名要加包/节点前缀，避免多 include 场景串参。
- Remaining:
  - `move_group` Ctrl+C 退出段错误仍需后续单独治理；当前运行态 smoke 已通过且退出后无残留进程。
  - 真实右相机与真实机械臂/夹爪实机链尚未在本轮触发。

## Incident 40
- Time: 2026-04-22
- Scope: single Orbbec live runtime verification for right camera bringup
- Symptom:
  1. 之前断点里沿用的 `color=/dev/video8`、`depth=/dev/video2` 在当前机器上不再成立。
  2. 当前系统同时存在 Orbbec 与笔记本集成摄像头，`/dev/video8`、`/dev/video9` 已被集成摄像头占用。
  3. `orbbec_gemini_ros_bridge.py` 的 `auto` 彩色设备策略按“最高索引的 YUYV/MJPG 节点”选设备，当前环境下有误选集成摄像头的风险。
  4. 中断单独 bridge 或 core 时，仍会看到 `VIDIOC_QBUF: Bad file descriptor` 与 `move_group` 析构段错误。
- Root cause:
  1. `/dev/videoX` 是运行时枚举结果，不是稳定契约；历史记录不能跨会话直接复用。
  2. 当前 bridge 的 `auto` 逻辑没有限定 USB vendor/model，只基于格式和索引做选择。
  3. `move_group` 和 V4L2 bridge 的停止噪声属于既有退出路径问题，本轮未修改实现。
- Handling:
  1. 用 sysfs 名称、udev 属性和 V4L2 格式重新探测当前节点：
     - `/dev/video0` = `Z16`
     - `/dev/video6` = `YUYV/MJPG`
     - `/dev/video8` = Integrated Camera
  2. 使用显式设备号启动右相机 bridge：
     - `color_device:=/dev/video6`
     - `depth_device:=/dev/video0`
     - `depth_backend:=v4l2`
  3. 再用同一组显式设备号启动 `competition_core.launch.py` 的
     `reobserve_only + enable_left_camera:=false + enable_right_camera:=true`
     进行集成验证。
- Evidence:
  - `lsusb` 可见 `2bc5:0800 Orbbec Gemini 335`
  - `/sys/class/video4linux/*/name` 显示 `video0..7` 属于 Orbbec，`video8..9` 属于 Integrated Camera
  - V4L2 枚举结果：
    - `/dev/video0: ['Z16']`
    - `/dev/video6: ['YUYV', 'MJPG']`
    - `/dev/video8: ['MJPG', 'YUYV']`
  - 直起 bridge 日志确认：
    - `color=/dev/video6`
    - `depth_backend=v4l2_z16`
    - `depth_device=/dev/video0`
  - 运行期 ROS 证据：
    - `/right_camera/color/image_raw` 约 `15Hz`
    - `/right_camera/depth/image_raw` 约 `15Hz`
    - `frame_id=right_camera_color_frame`
    - `frame_id=right_camera_depth_frame`
  - `competition_core.launch.py` 集成拉起时，`scene_fusion`、`planning_scene_sync`、`execution_adapter`、`dualarm_task_manager`、`move_group`、`fairino_dualarm_planner` 均正常启动
- Prevention:
  - 真机相机验证前必须重新探测当前会话的 `/dev/videoX`，不能信任历史编号。
  - 当前桥接层在双摄现场默认使用显式设备号；未收紧 `auto` 逻辑前，不要把 `auto` 当成比赛现场默认。
  - 若机器同时存在 Orbbec 与集成摄像头，必须把“USB 设备身份”和“V4L2 像素格式”一起纳入相机选择依据。
- Remaining:
  - 当前仅有 1 台 Orbbec 在线，真正的双相机真机验证仍受硬件数量阻塞。
  - `move_group` 析构段错误与 `VIDIOC_QBUF` 退出噪声仍待单独治理。

## Incident 41
- Time: 2026-04-22
- Scope: real hardware posture alignment + left camera live chain
- Symptom:
  1. 用户反馈“两个夹爪朝向是朝前”，而 RViz 中右臂默认仍表现为背向。
  2. 右侧 `depth_handler` 在真机链里反复报：
     `Lookup would require extrapolation into the future`
     并按 fail-close 丢弃 `world` scene_objects。
  3. RViz 点云显示源仍指向旧 `/depth_handler/pointcloud`，不是左右真实点云 topic。
  4. 用户要求左右协同，但系统实时仍只枚举到 1 台 Orbbec。
- Root cause:
  1. `right_base_rpy` 默认值仍是历史上的 `pi`，与现场“夹爪朝前”的真实安装方向不符。
  2. `depth_handler` 使用图像时间戳做精确 TF 查询，真机链里相机时间会轻微领先于可用 TF，触发 future extrapolation。
  3. RViz 配置还残留旧点云 topic。
  4. 第二台 Orbbec 没有出现在 USB/V4L2 枚举中，当前无法进入真正的双相机硬件协同。
- Handling:
  1. 将默认 `right_base_rpy` 统一改为 `0 0 0`。
  2. 将 `depth_handler` 的 TF 查询改为：
     - 先查精确时间
     - 若报 future extrapolation，则回退到最新可用变换
  3. 将 RViz 点云源改为：
     - `/depth_handler/left/pointcloud`
     - `/depth_handler/right/pointcloud`
  4. 在真机条件下分别完成：
     - 真实双臂关节状态接入
     - 左链真机 detector/depth/world object/pointcloud 验证
- Evidence:
  - `/R/robot_state.tcp_pose` 与 `tf2_echo world right_tcp` 的 `rx/ry/rz` 已对齐
  - `/L/joint_states`、`/R/joint_states`、`/joint_states` 均为真实 publisher
  - `/perception/left/scene_objects` 已输出 `frame_id=world`
  - `/depth_handler/left/pointcloud` 已输出 `PointCloud2`
  - `left_detector_view` 与 RViz 窗口均存在
  - `lsusb` 仍只见 1 台 `2bc5:0800 Orbbec Gemini 335`
- Prevention:
  - 现场姿态争议先用 `/robot_state.tcp_pose` 对照 `tf2_echo world <arm>_tcp`，不要只凭 RobotModel 肉眼判断。
  - 真机 depth 链默认允许“future extrapolation -> latest available transform”回退，避免整帧 world object 被时间戳轻微超前击穿。
  - RViz 验收前必须核对它订阅的是 live 点云 topic，而不是旧兼容 topic。
  - 在宣称“双相机协同”前，先确认 USB 上有两个独立相机序列号。

## Incident 42
- Time: 2026-04-22
- Scope: second Orbbec enumeration / true dual-camera hardware bringup
- Symptom:
  1. 用户表示两台相机都已接上，但系统始终只枚举到 1 台 Orbbec。
  2. `lsusb` 始终只有 1 个 `2bc5:0800 Orbbec Gemini 335`。
  3. `/dev/v4l/by-id` 也只有 1 个 Orbbec 序列号：`CP02653000G2`。
  4. 内核日志持续报：
     - `usb 4-2-port1: Cannot enable. Maybe the USB cable is bad?`
     - `usb 4-2-port1: config error`
- Root cause:
  - 当前第二台相机并没有进入可用的 USB 枚举态；问题已收敛到 `Bus 04 -> hub 4-2 -> port1` 这条 USB3 链路的物理层/供电/线缆/端口问题，而不是 ROS、udev 或 launch 配置问题。
- Handling:
  1. 已核对 USB 拓扑：
     - 当前在线的唯一 Orbbec 在 `3-2.1.4`
     - 故障链路在 `4-2-port1`
  2. 已尝试对问题 hub `4-2` 做软件级 reset / re-authorize。
  3. reset 后 `lsusb`、`/dev/v4l/by-id`、视频节点数量均无变化，且内核错误持续。
- Evidence:
  - `lsusb -t` 显示：
    - 正常 Orbbec 在 `3-2.1.4`
    - USB3 hub 在 `4-2`
  - `/dev/v4l/by-id` 仅有：
    - `usb-Orbbec_R__Orbbec_Gemini_335_CP02653000G2-*`
  - `journalctl -k` 多次出现：
    - `usb 4-2-port1: Cannot enable. Maybe the USB cable is bad?`
    - `usb 4-2-port1: config error`
  - 对 `4-2` 执行 re-authorize 后问题仍复现。
- Prevention:
  - 以后判断“双相机是否已接好”必须看三项同时成立：
    1. `lsusb` 有两个相机设备
    2. `/dev/v4l/by-id` 有两个独立序列号
    3. `/sys/class/video4linux` 对应到两组独立 `ID_SERIAL_SHORT`
  - 当内核已经报 `Cannot enable` 时，不再继续在 ROS/launch 层浪费时间。
- Remaining:
  - 需要物理层处理：
    - 更换第二台相机的数据线
    - 更换 `4-2-port1` 所在 USB 口或避开该 hub
    - 必要时改用独立供电 USB3 hub

## Incident 43
- Time: 2026-04-22
- Scope: dual-camera full runtime after second Orbbec recovery
- Symptom:
  1. 两台 Orbbec 都已重新枚举，但 full 双机栈下右侧桥接层持续报：
     - `读取彩色图失败`
     - `ioctl(VIDIOC_DQBUF): No such device`
  2. 左链仍稳定进入 `world` 并推送到 `scene_fusion` / `planning_scene_sync`。
  3. 双机统一场景当前主要只剩左侧对象贡献。
- Root cause:
  - 当前更像是右相机 `CP02653000G2` 的 UVC 彩色流在运行期失稳，而不是 detector、scene_fusion 或 planner 的逻辑问题。
  - 双机问题已从“第二台未枚举”转成“右侧相机桥不稳定”。
- Handling:
  1. 已重新确认双机 serial / device 映射：
     - 左 `CP1E5420007N`
     - 右 `CP02653000G2`
  2. 已在 full 栈中重新拉起左右 detector/depth/scene_fusion。
  3. 已尝试对右桥单独做低帧率 `5fps` 手工起桥，但故障仍复现。
- Evidence:
  - `lsusb` 同时有两个 `2bc5:0800`
  - `/dev/v4l/by-id` 同时有两个 Orbbec serial
  - 左链 live 仍正常：
    - `/perception/left/scene_objects`
    - `/competition/rviz/scene_model_points`
  - 右桥日志持续出现：
    - `读取彩色图失败`
    - `VIDIOC_DQBUF: No such device`
- Prevention:
  - 双机恢复后必须把“枚举恢复”和“流稳定”分开验收。
  - 当某一侧桥接层已进入 `No such device`，优先按该相机/UVC 路径故障处理，不再先怀疑 fusion。

## Incident 44
- Time: 2026-04-22
- Scope: right camera single-bridge isolation
- Symptom:
  - 在双机 full 栈中，右桥持续报：
    - `读取彩色图失败`
    - `VIDIOC_DQBUF: No such device`
  - 需要判断这是右相机本体问题，还是双机并发问题。
- Root cause:
  - 当前更接近“双机并发/整栈条件下的右桥失稳”，而不是右相机单独工作就失败。
- Handling:
  1. 清空整套 ROS 栈，仅保留右桥单独运行。
  2. 用当前稳定映射：
     - `color=/dev/video6`
     - `depth=/dev/video0`
     - `fps=5.0`
  3. 观测原始彩色话题与单帧抓图结果。
- Evidence:
  - 单独右桥启动日志正常：
    - `color=/dev/video6`
    - `depth=/dev/video0`
    - `fps=5.0`
  - `/right_camera/color/image_raw` 单独运行时约 `5Hz`
  - 已成功抓到原始彩色图：
    - `right_raw_single_probe.png`
    - `shape=(480,640,3)`
    - `flat_rows=0`
- Conclusion:
  - 右相机本体并非“单独运行就坏”。
  - 当前主问题是：进入双机 full 栈后，右桥在并发/总线/UVC 条件下失稳。

## Incident 45
- Time: 2026-04-22
- Scope: dual-camera bare-bridge concurrency isolation
- Symptom:
  - 需要进一步判断右桥失稳，是“双桥并发本身”导致，还是“双深度并发”导致。
- Root cause:
  - 当前证据表明：问题已进一步收敛到“双深度并发”，而不是“双彩色并发”。
- Handling:
  1. 仅起左右两个桥接节点，不启 detector / depth_handler / fusion。
  2. 再将两桥都改为：
     - `enable_depth=false`
     - 只发彩色
     - `fps=5.0`
  3. 分别观测 `/left_camera/color/image_raw` 与 `/right_camera/color/image_raw`。
- Evidence:
  - 双桥只开彩色时，左右彩色话题都能稳定在约 `5Hz`。
  - 这说明“双桥并发本身”不是主因。
  - 与此前“右桥一旦带深度进入双机栈就失稳”的现象合并后，可判定主冲突点在“双 Z16 并发”。
- Conclusion:
  - 最小修复方向应切向：
    - 左右彩色常开
    - 单侧深度常开
    - 另一侧深度按需启用

## Incident 46
- Time: 2026-04-22
- Scope: launch-level mitigation for dual-camera runtime
- Symptom:
  - 用户需要“测试修复”，而当前 full 双深度常开模式在右桥处持续失稳。
- Root cause:
  - 主冲突点已经收敛为双 Z16 深度并发，因此需要运行策略层面的降载，而不是继续把所有链路都默认常开。
- Handling:
  1. 为 `orbbec_gemini_bridge` 新增 `enable_depth`。
  2. 为 bringup 新增每侧深度和 fps 控制：
     - `left_camera_enable_depth`
     - `right_camera_enable_depth`
     - `left_camera_fps`
     - `right_camera_fps`
  3. 将依赖深度的链条与这些开关绑定：
     - `depth_handler`
     - `ball_basket_pose_estimator`
     - `table_surface_detector`
  4. 验证“左深度开、右深度关、左右彩色都开”的正式 launch 模式。
- Evidence:
  - `orbbec_gemini_bridge` 已支持 `enable_depth`
  - `dualarm_bringup` 已支持 per-camera depth/fps 参数
  - 稳定模式下：
    - `/detector/left/detections` 有 publisher
    - `/detector/right/detections` 有 publisher
    - `/perception/left/scene_objects` 有 `world` 对象
    - `/scene_fusion/scene_objects` 有 unified scene
    - `/competition/rviz/scene_model_points` 有 `PointCloud2`
- Conclusion:
  - 当前软件侧最小修复已经落地。
  - 可交付模式更新为：
    - 双彩色常开
    - 单侧深度常开
    - 另一侧深度按需启用
