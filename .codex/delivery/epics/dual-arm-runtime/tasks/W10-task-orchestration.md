# W10 Task Orchestration

状态: [~]
创建时间: 2026-04-16
更新时间: 2026-04-16

## Scope

- orchestration-only task manager
- 去占位成功
- checkpoint / resume 契约
- 恢复层
- 行为调用边界抽离

## Owned Paths

- `src/tasks/dualarm_task_manager`
- `src/interfaces/dualarm_interfaces/action/RunCompetition.action`
- `.codex/tmp/resume/RUN_STATE_SCHEMA.md`

## Acceptance

- 未定义状态硬失败
- checkpoint payload 与恢复路径闭环
- 行为与 orchestration 分层清晰
- `WAIT_*` / `VERIFY_*` 不再把感知缺失或中途占用当作成功
- orchestration 主文件不再内嵌 cap/pour waypoint 生成与 handover primitive choreography

## Progress

- 2026-04-16:
  - 已把 cap/pour 与 handover 的 primitive 调用边界抽离到 `scripts/behaviors/*.py`
  - `dualarm_task_manager_node.py` 现在只保留状态序列、checkpoint/resume、通用 plan/execute/primitive 壳层与 postcondition 校验
  - `start_immediately` / 显式 `RunCompetition` goal 已统一进入 `WAIT_START` gate，兼容现有 start gate / API / resume smoke 的 goal 入口
  - `allow_reconcile` 已进入 checkpoint 校验；schema 1 仅允许在 reconcile 模式下恢复，schema 2 开始强制关键边界字段
  - `latest.json` schema 已扩展 `effective_requested_order`、`state_sequence_digest`、`behavior_contract_version`、`next_state_owner`、`last_behavior_call`
  - `VERIFY_BALL_*_DROP` 不再把“对象从 scene 中消失”当成功，而是要求 managed scene 给出篮筐内稳定证据
  - `PLACE_*` 不再只看 detach/release 返回值，而是追加目标位姿附近的稳定放置校验
  - `GRASP_BALL_*` 的双臂夹持 choreography 已下沉到 `behaviors/handover_boundary.py`，不再留在 orchestration 主文件

## Verification

- `subagent reviewer`
  - 只读边界审查已完成；指出的 `deepcopy` 崩溃点、`WAIT_*` / `VERIFY_*` 假阳性、resume 契约空壳均已落到本轮修复范围。
- `py_compile`
  - `/usr/bin/python3 -m py_compile src/tasks/dualarm_task_manager/scripts/dualarm_task_manager_node.py src/tasks/dualarm_task_manager/scripts/behavior_contract.py src/tasks/dualarm_task_manager/scripts/behaviors/__init__.py src/tasks/dualarm_task_manager/scripts/behaviors/handover_boundary.py src/tasks/dualarm_task_manager/scripts/behaviors/cap_pour_boundary.py`
- `build`
  - `export PATH=/usr/bin:/bin:$PATH && source /opt/ros/humble/setup.bash && colcon build --packages-up-to dualarm_task_manager --symlink-install --cmake-clean-cache --cmake-args -DPython3_EXECUTABLE=/usr/bin/python3 -DPYTHON_EXECUTABLE=/usr/bin/python3`
  - 结果：`dualarm_interfaces` 与 `dualarm_task_manager` 通过。
- `final package build`
  - `export PATH=/usr/bin:/bin:$PATH && source /opt/ros/humble/setup.bash && colcon build --packages-select dualarm_task_manager --symlink-install --cmake-args -DPython3_EXECUTABLE=/usr/bin/python3`
  - 结果：`dualarm_task_manager` 单包重建通过。
- `install import`
  - `export PATH=/usr/bin:/bin:$PATH && source /opt/ros/humble/setup.bash && source install/setup.bash && /usr/bin/python3 -c '...'`
  - 结果：`behavior_contract`、`behaviors.cap_pour_boundary`、`behaviors.handover_boundary` 可从安装树导入。
- `targeted schema/start gate check`
  - `export PATH=/usr/bin:/bin:$PATH && source /opt/ros/humble/setup.bash && source install/setup.bash && /usr/bin/python3 - <<'PY' ... PY`
  - 结果：
    - `legacy_without_reconcile= legacy checkpoint schema_version=1 仅允许在 allow_reconcile=true 时恢复`
    - `schema2_missing_field= schema 2 checkpoint 缺少必填字段: ['effective_requested_order']`
    - `schema2_ok= None`
    - `wait_start_action_goal=(True, ...)`
    - `wait_start_auto=(True, ...)`
- `runtime smoke`
  - 最小运行态链路：
    - 后台启动 `/usr/bin/python3 install/dualarm_task_manager/lib/dualarm_task_manager/dualarm_task_manager_node.py`
    - 持续发布 `/scene_fusion/scene_objects` 空心跳：`frame_id=world`
    - 写入 schema 2 `latest.json`，使用 `task_sequence=noop`、`effective_requested_order=noop`、`next_state=LOAD_CALIBRATION`
    - 发送 `RunCompetition` 恢复 goal：`start_immediately=false`、`requested_order=noop`、`resume_from_checkpoint=true`、`allow_reconcile=false`
  - 结果：
    - `accepted True`
    - `success True`
    - `message 比赛状态机已完成一轮执行`
    - `final_checkpoint_id resume-smoke-v2-noop:DONE`
    - `resume_hint competition_done`
  - 补充：
    - 使用 `task_sequence=handover,pouring` 的 schema 2 恢复探针也已推进到 `SCAN_BASKET`，失败原因为故意未提供 `basket` 对象，说明恢复链已越过 `LOAD_CALIBRATION/HOME_ARMS/WAIT_START`。

## Coordination

- 行为窗口只写 `behaviors/*`
- orchestration 窗口负责主状态机和行为调用边界
- 当前活跃窗口：`task-orchestration`
- 当前共享状态版本：`coord_rev=7`
- 当前下一步：完成本地 build / review / handoff，然后把 freeze 条件回写给协调窗口

## Behavior Boundary Freeze Handoff

- 当前 `behavior_module_boundary` 仍应保持 `false`，直到以下条件全部成立：
  1. `dualarm_task_manager_node.py` 不再包含 task-specific geometry、waypoint 生成或 primitive choreography。
  2. `WAIT_*` / `VERIFY_*` 的成功语义已经固定为“有正向证据”，而不是“对象消失也算成功”。
  3. resume/checkpoint 契约已稳定写出 `effective_requested_order`、`state_sequence_digest`、`behavior_contract_version`、`next_state_owner`、`last_behavior_call`。
  4. 协调窗口已据此把 `task-orchestration` 的实际写集从父级 `src/tasks/dualarm_task_manager` 收窄到不再覆盖 `scripts/behaviors/*`。
  5. 行为窗口接手后，只需要修改 `scripts/behaviors/handover_*` 或 `scripts/behaviors/cap_pour_*`，不需要再回改 orchestration 主文件。

## Residual Risks

- `GRASP_*_(BOTTLE_BODY|CUP)` 与 `PLACE_*` 当前保留在 orchestration，是因为它们已经收敛为通用 `plan -> execute -> attach/detach -> verify` 壳层；若后续再被加入任务特定 choreography，就必须再次下沉。
- `RunCompetition.action` 本轮没有新增字段；当前是通过消化既有 `start_immediately` / `allow_reconcile` 和扩展 checkpoint schema 来补闭环，后续若网页/API 需要显式暴露边界归属，再由协调窗口决定是否升级 action 结果面。
- `competition_core.launch.py` 的完整集成烟测仍会被外部 `ball_basket_pose_estimator` 安装问题阻塞；该问题超出本窗口允许写集，但不影响已取得的 `RunCompetition` schema 2/runtime 证据。

## Retro Facts

- 这轮真正的 Wave 10 主风险不是行为实现缺失，而是 orchestration 主文件仍夹带 task-specific choreography、checkpoint 契约只写文档不硬执行、以及成功语义存在假阳性。
- `coord_rev` 在任务进行中从 5 连续推进到 6、7；如果不在每次新任务、开 subagent、写文件前重新同步，窗口很容易拿着旧冻结状态继续推进。
- `WAIT_START` 一旦从“直接成功”改成硬 gate，就必须立即回看所有现有 goal 入口；否则会把 `competition_start_gate`、控制台 API 和 resume smoke 一起回归。
- 先跑最小 runtime 链，再谈全集成，比一开始就追 `competition_core.launch.py` 更高效；`dualarm_task_manager + scene_fusion empty heartbeat + schema 2 checkpoint` 足以单独验证 Wave 10 的 resume 边界。
- 这轮 build/launch 反复出现的主要环境噪音是 worktree 安装树不完整、Conda 抢占 ROS Python，以及包已安装但 launch/执行权限仍有偏差。
- 完整 `competition_core` 烟测最后暴露的是 `ball_basket_pose_estimator` 的外部安装阻塞，而不是 Wave 10 自身逻辑；这类阻塞应尽早定性为“窗口外依赖”，避免在本窗口内反复兜圈。

## Reusable Rules

- `signal`: 共享状态里的 `coord_rev` 或 `coord_required_sync_rev` 变化。
  `action`: 先重读 14 个必读文件，再更新自己的窗口状态文件，然后才允许开新 subagent 或继续写文件。
  `why`: 多窗口并行里，最常见的浪费不是代码错误，而是拿旧协调版本继续推进。
- `signal`: 某个状态从占位成功改成真实 gate。
  `action`: 立刻全局搜索现有调用方、smoke 和 API 默认值，检查它们是否还满足新 gate。
  `why`: gate 改得对，但调用方没同步，会制造隐蔽回归。
- `signal`: 想验证某个边界，但全集成 launch 牵连太多上游包。
  `action`: 优先搭一个最小运行态链，只起当前边界所必需的节点/话题/输入。
  `why`: 先证明当前边界，能把“本窗口逻辑问题”和“外部安装问题”分开。
- `signal`: build 或 rosidl 生成报 Python 模块缺失、路径异常。
  `action`: 先强制 `PATH=/usr/bin:/bin:$PATH`，并在 build 时显式指定 `-DPython3_EXECUTABLE=/usr/bin/python3`。
  `why`: Conda 抢占是这个项目里高频环境噪音，不先切回系统 Python 很容易误判。
- `signal`: 运行态 smoke 被“包找不到 / 可执行找不到 / 权限不够”拦住。
  `action`: 先确认本 worktree 的 `install/` 是否覆盖最小依赖链，再区分是安装缺失、launch 索引失败，还是脚本执行权限问题。
  `why`: 这三类错误表面相似，但修复动作完全不同。
- `signal`: 主文件里还有看似“通用”的 helper。
  `action`: 不要机械地下沉全部 helper，先判断它是否仍包含 task-specific choreography；只有带具体角色、动作顺序、常量策略的分支才应继续下沉。
  `why`: 过度下沉会把通用壳层也拆碎，增加跨窗口耦合。
- `signal`: checkpoint schema 已写进文档，但 runtime 还没证据。
  `action`: 做一条 schema 级别的最小恢复探针，至少覆盖 legacy hard-fail、schema 2 缺字段 hard-fail、schema 2 success 三种结果。
  `why`: resume 契约最容易停留在“文档正确，运行态没证据”的半完成状态。
- `signal`: 集成 smoke 最终被窗口外依赖挡住。
  `action`: 明确记录“阻塞层级、超出写集的包、已证明的当前窗口证据”，然后停止在本窗口内继续绕路修外部依赖。
  `why`: 这样能保护窗口边界，也能给协调窗口一个可分派的外部 blocker。

## Window Handoff Notes

- 给 `scene-freshness`：
  - 改 freshness/gate 语义时，要像这轮 `WAIT_START` 一样同步搜索所有入口，不要只改 producer 或 checker 本身。
- 给 `execution-control`：
  - 判断 helper 是否要下沉时，先看是否还带 task-specific choreography，不要把通用执行壳层误拆成行为模块。
- 给 `ops-acceptance`：
  - 如果全集成 launch 被外部安装问题拦住，可以先用最小运行态链证明 API/action 契约，再把完整 launch 阻塞单列成外部依赖。
- 给协调窗口：
  - 当某窗口把问题收口到“只剩外部依赖阻塞”时，应尽快更新共享状态，把 blocker 标成窗口外问题，避免原窗口继续内耗。
- 给所有业务窗口：
  - subagent 最有价值的用法不是替代实现，而是快速确认“真正还剩什么风险”，帮助主线程把修改面收窄。

## Avoid List

- 不要把“文档里已经写了 schema / freeze 条件”当成运行态已经收口。
- 不要在 `coord_rev` 变化后继续沿用旧的窗口状态和旧的下一步描述。
- 不要一上来就追 `competition_core.launch.py`；先证明当前边界，再追全集成。
- 不要把外部安装/launch 阻塞误当成当前窗口逻辑错误反复修。
- 不要把所有 helper 都当成行为模块候选；真正要下沉的是带任务专用 choreography 的那部分。
