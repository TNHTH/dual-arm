# W9 Handover

状态: [ ]
创建时间: 2026-04-16
更新时间: 2026-04-16

## Scope

- 接球行为模块
- 持稳 3 秒
- release_guard
- pre-contact detach
- 入筐行为模块

## Owned Paths

- `src/tasks/dualarm_task_manager/scripts/behaviors/handover_*`
- `src/control/execution_adapter/scripts/primitives/handover_*`
- `src/planning/grasp_pose_generator/scripts/handover_*`
- `docs/competition/handover*`

## Acceptance

- handover 行为模块可被单独 smoke
- release / detach / hold 路径有最小软件验收

## Coordination

- 不允许改 orchestration 主文件
- 不允许改 execution 主文件
- 当前窗口状态：dormant
- 当前共享状态版本：`coord_rev=7`
- 当前下一步：继续等待；在 `task-orchestration` 收窄父级写集或转入 maintenance/dormant 之前，不具备进场条件
