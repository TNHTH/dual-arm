# competition_gazebo_full 正式主链仿真手册

更新时间：2026-05-06

## 结论

`competition_gazebo_full.launch.py` 是 Gazebo 同接口 backend。验收必须以该 launch 加 `/competition/run` 为准；archived quick 不属于 production path，也不能替代正式主链证据。

## 边界

- 默认 `execution_backend=sim`，不得连接 Fairino 真机或 EPG50 真夹爪。
- `sim_truth_manager` 发布 `/perception/sim_scene_objects`，经正式 `scene_fusion`、`planning_scene_sync`、MoveIt、planner、`execution_adapter` 和 `dualarm_task_manager` 流转。
- `/competition/run` 成功只能在运行态 smoke 实际返回成功后记录；`--show-args`、构建通过或节点启动不等于比赛闭环通过。

## 静态验证

```bash
/usr/bin/python3 -m py_compile packages/simulation/dualarm_simulation/dualarm_simulation/*.py packages/control/execution_adapter/scripts/execution_adapter_node.py packages/tasks/dualarm_task_manager/scripts/dualarm_task_manager_node.py
/usr/bin/python3 -m pytest -q tests/unit tests/integration packages/tasks/dualarm_task_manager/test/test_dualarm_task_contract.py
./build_workspace.sh --group simulation,bringup,control,tasks
python3 scripts/check_runtime_authority.py --launch-contracts
source install/setup.bash
ros2 launch dualarm_bringup competition_gazebo_full.launch.py --show-args
```

## 运行态 smoke 前置检查

```bash
pgrep -af 'ros2 launch|move_group|fairino_dualarm_planner|competition_console_api|planning_scene_sync|sim_truth_manager|sim_robot_state_publisher|sim_pour_state_manager'
```

若发现旧进程，先清理旧 ROS graph，再启动 clean session。不要在旧 `move_group`、旧 planner 或旧 sim manager 存活时记录验收证据。

## 运行态 smoke 顺序

```bash
source install/setup.bash
ros2 launch dualarm_bringup competition_gazebo_full.launch.py gui:=false
```

另开终端：

```bash
source install/setup.bash
ros2 action list | grep /competition/run
ros2 topic list | grep -E '/perception/sim_scene_objects|/scene_fusion/scene_objects|/competition/pour_state|/L/robot_state|/R/robot_state'
```

正式触发 `/competition/run` 前，必须确认 managed scene 中能看到 bottle、cup、ball 和 basket，且 `/L/robot_state`、`/R/robot_state` stamp 新鲜。

## 成功证据

记录到 `docs/operations/reports/YYYY-MM-DD-*.md` 和 `STATE.md`：

- `ros2 launch ... --show-args` 输出摘要。
- 构建和 pytest 命令输出。
- 运行态旧进程检查输出。
- `/competition/run` action goal 的最终 result。
- task manager 中 handover/pouring 每个 acceptance 日志。

## 失败处理

- `execution_adapter` 报 `sim robot_state 过期或缺失`：先查 `sim_robot_state_publisher` 是否启动、`/L/robot_state` 和 `/R/robot_state` 是否持续发布。
- `scene_fusion` 缺对象：查 `/perception/sim_scene_objects` 与 `scene_fusion_input_topics`。
- PlanningScene 或 planner 失败：先按 `planning_scene_sync` 最小 MoveIt diff 流程定位，不要用 archived quick 掩盖正式主链问题。
- 任何可复用失败模式必须更新 `.codex/tmp/error-trace/ERROR_TRACE.md`。
