# W7-8 Cap Pour

状态: [ ]
创建时间: 2026-04-16
更新时间: 2026-04-16

## Scope

- 水瓶 / 可乐瓶真实开盖行为模块
- 倒水行为模块
- top-up / spill / 双杯约束
- 只实现行为模块与相关文档，不直接改 orchestration 主文件

## Owned Paths

- `src/tasks/dualarm_task_manager/scripts/behaviors/cap_pour_*`
- `src/control/execution_adapter/scripts/primitives/cap_pour_*`
- `src/planning/grasp_pose_generator/scripts/cap_pour_*`
- `docs/competition/cap-pour*`

## Acceptance

- 开盖行为模块可被单独 smoke
- 倒水行为模块可被单独 smoke
- 行为模块接口和输入输出有文档

## Coordination

- 不允许改 `dualarm_task_manager` 主文件
- 不允许改 `execution_adapter` 主文件
- 当前窗口状态：dormant
- 当前共享状态版本：`coord_rev=7`
- 当前下一步：继续等待；在 `execution-control` 收窄父级写集或转入 maintenance/dormant 之前，不具备进场条件
