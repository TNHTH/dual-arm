# 2026-05-06 Gazebo 正式主链仿真闭环 + quick hybrid 进度记录

## 结论

当前任务处于半实现断点。正式 Gazebo 主链和 quick hybrid computed-template 都已有代码落点，但还没有完成 quick 接线、测试、构建或运行态验证。后续窗口应从补齐 quick hybrid preflight/executor 接线开始，再进入 py_compile、pytest、colcon build 和 Gazebo full-chain smoke。

## 已确认的工作区状态

- 仓库：`/home/gwh/dual-arm`
- 日期：`2026-05-06`
- 当前检查：`git status --short` 显示本轮新增/修改大量文件，未提交。
- 保存前进程检查：未发现真实 `ros2 launch`、`move_group`、planner、console、planning_scene_sync 或 sim manager 长进程；只匹配到当前 sandbox/pgrep 命令本身。

## 已新增或修改的主要文件

新增：
- `packages/simulation/dualarm_simulation/**`
- `packages/bringup/dualarm_bringup/launch/competition_gazebo_full.launch.py`
- `config/quick_competition/quick_grasp_templates.yaml`
- `packages/quick_competition/quick_competition/quick_grasp_template_library.py`
- `packages/quick_competition/quick_competition/quick_task_pose_generator.py`
- `packages/quick_competition/quick_competition/quick_ik_planner.py`
- `packages/quick_competition/quick_competition/quick_collision_scene_builder.py`

已修改：
- `config/system/build_groups.yaml`
- `packages/bringup/dualarm_bringup/package.xml`
- `packages/bringup/dualarm_bringup/launch/competition.launch.py`
- `packages/bringup/dualarm_bringup/launch/competition_core.launch.py`
- `packages/control/execution_adapter/launch/execution_adapter.launch.py`
- `packages/control/execution_adapter/scripts/execution_adapter_node.py`
- `packages/tasks/dualarm_task_manager/launch/dualarm_task_manager.launch.py`
- `packages/tasks/dualarm_task_manager/scripts/dualarm_task_manager_node.py`
- `config/quick_competition/quick_profile.yaml`
- `config/quick_competition/quick_waypoints.yaml`
- `packages/quick_competition/quick_competition/quick_types.py`

已有脏变更，后续不能盲目回滚：
- `packages/quick_competition/quick_competition/legacy_fairino_bridge.py`
- `packages/quick_competition/quick_competition/quick_ball_cage_primitives.py`
- `packages/quick_competition/quick_competition/quick_motion_executor.py`
- `packages/quick_competition/quick_competition/quick_pouring_primitives.py`
- `packages/quick_competition/quick_competition/quick_types.py`

## 当前实现内容

### Gazebo / formal sim

- 新增 `dualarm_simulation` ament Python 包。
- `sim_truth_manager` 负责发布 `/perception/sim_scene_objects`，接收 `/simulation/truth_command`。
- `sim_robot_state_publisher` 负责发布 `/joint_states`、`/L/robot_state`、`/R/robot_state`，接收左右 joint setpoint。
- `sim_pour_state_manager` 负责发布 `/competition/pour_state`，消息暂用 `std_msgs/String` JSON。
- `competition_gazebo_full.launch.py` 目标是将正式 competition 栈以 `execution_backend=sim` 启动，且不改变 `competition_integrated.launch.py` 默认行为。
- `execution_adapter` 已开始区分 sim backend 和 hardware backend，sim backend 不应调用 Fairino 或 EPG50。
- `dualarm_task_manager` 已开始支持 sim mode 下 `start_immediately=true`，硬件模式仍必须走硬件 token 与 start gate。

### quick hybrid

- quick 默认配置已开始转向 `motion_generation_mode: hybrid`。
- `safe_stow` 被保留为必需安全锚点；`observe_table` 在 manual 场景下可选，在 depth/scene_fusion 场景下仍应作为观察锚点。
- 新增 grasp template、task pose generator、IK planner、collision scene builder 的第一版骨架。
- quick 默认不应运行正式 `planning_scene_sync`，避免 `quick_collision_scene_builder` 与正式 scene sync 同时写 PlanningScene。

## 未完成项

1. 创建并接入 `quick_computed_motion_executor.py`。
2. 更新 `packages/quick_competition/setup.py`，加入 quick computed 模块 console entry points。
3. 改造 `QuickPreflightCheck`：
   - 读取 `motion_generation_mode` 和 `quick_grasp_templates.yaml`。
   - manual 模式沿用原 waypoint 检查。
   - computed_templates 模式要求 home/safe_stow 锚点、对象 pose、模板、静态 collision scene、computed IK/collision 预检通过。
   - hybrid 模式对每个关键步骤执行 computed OR fallback waypoint 接受条件；两者都失败才标记 `SKIPPED_BY_PREFLIGHT`。
   - runtime 不允许首次 IK。
4. 将 quick computed/hybrid 的已验证解提供给 motion executor/primitives，至少先完成 dry-run 和 preflight evidence。
5. 增加测试：
   - sim config contract
   - competition_gazebo_full launch contract
   - execution_backend 参数合同
   - task_manager sim start gate
   - quick computed pose generation
   - quick collision scene builder
   - quick hybrid preflight acceptance
6. 增加 runbook：`docs/operations/runbooks/competition_gazebo_full.md`。
7. 更新 `scripts/ci/software_check.sh`，把 `dualarm_simulation` 纳入相关构建检查。
8. 运行验证命令。

## 建议的下一组命令

```bash
git status --short
/usr/bin/python3 -m py_compile packages/simulation/dualarm_simulation/dualarm_simulation/*.py packages/control/execution_adapter/scripts/execution_adapter_node.py packages/tasks/dualarm_task_manager/scripts/dualarm_task_manager_node.py packages/quick_competition/quick_competition/quick_*.py
/usr/bin/python3 -m pytest -q tests/unit tests/integration packages/tasks/dualarm_task_manager/test/test_dualarm_task_contract.py
./build_workspace.sh --group simulation,bringup,control,tasks,quick
source install/setup.bash
ros2 launch dualarm_bringup competition_gazebo_full.launch.py --show-args
```

运行态 smoke 前必须先做旧进程检查：

```bash
pgrep -af 'ros2 launch|move_group|fairino_dualarm_planner|competition_console_api|planning_scene_sync|sim_truth_manager|sim_robot_state_publisher|sim_pour_state_manager'
```

MoveIt service/action 名称不能使用文档推断值，必须现场发现：

```bash
ros2 service list | grep planning
ros2 action list | grep planning
```

## 不得声明的完成状态

- 不能声明 Gazebo full-chain 已跑通。
- 不能声明 `/competition/run` 返回 success。
- 不能声明 quick hybrid 已接入 runtime。
- 不能声明 sim backend 不会调用硬件，直到测试或代码审查覆盖。
- 不能声明 `competition_integrated.launch.py` 未破坏，直到 launch/contract 测试覆盖。
