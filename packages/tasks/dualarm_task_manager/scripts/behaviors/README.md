# Behavior Modules

本目录用于承载与 `dualarm_task_manager` 主状态机解耦的行为模块。

## 约束

- 行为窗口只允许在本目录下新增或修改行为模块。
- 不允许直接修改主状态机文件来抢占实现写集。
- 本目录下的模块应按任务语义拆分，例如：
  - `cap_pour_*`
  - `handover_*`

## 目标

- 让 Wave 7/8 与 Wave 9 能立即并行推进。
- 由 orchestration 窗口后续负责把行为模块接入主状态机边界。
