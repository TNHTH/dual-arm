# bringup

## 目录作用

保存双臂比赛运行时的启动链、启动门控和 joint state 汇总节点。

## 包含内容

- `competition_start_gate`
- `dualarm_bringup`
- `joint_state_aggregator`

## 入口文件或常用命令

```bash
ros2 launch dualarm_bringup competition_integrated.launch.py
ros2 launch dualarm_bringup competition_core.launch.py
```

## 上下游依赖

- 上游：`control/`、`planning/`、`perception/`
- 下游：根 `launch/` 兼容入口、控制台 API、任务运行链

## 修改边界

- 启动编排和聚合逻辑放这里。
- 具体业务节点实现不要写进 bringup 包。

## 相关链接

- `../README.md`
- `dualarm_bringup/README.md`
