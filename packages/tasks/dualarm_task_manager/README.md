# dualarm_task_manager

## 目录作用

比赛任务管理器与层级状态机，负责 `RunCompetition` action 和 checkpoint 恢复。

## 包含内容

- `launch/dualarm_task_manager.launch.py`
- `scripts/dualarm_task_manager_node.py`

## 入口文件或常用命令

```bash
ros2 launch dualarm_task_manager dualarm_task_manager.launch.py
ros2 action info /competition/run
```

## 上下游依赖

- 上游：`planning/`、`control/`、`dualarm_interfaces`
- 下游：控制台 API、checkpoint 与比赛执行链

## 修改边界

- 这里只做任务编排和恢复。
- 具体轨迹生成与硬件执行留给下游包。

## 相关链接

- `../README.md`
- `../../ops/competition_console_api/README.md`
