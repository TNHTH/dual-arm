# dualarm_bringup

## 目录作用

双臂比赛运行时的核心启动包，负责主链 launch 编排。

## 包含内容

- `launch/competition.launch.py`
- `launch/competition_core.launch.py`
- `launch/competition_integrated.launch.py`
- `launch/debug.launch.py`
- `launch/single_arm_debug.launch.py`

## 入口文件或常用命令

```bash
ros2 launch dualarm_bringup competition_integrated.launch.py
ros2 launch dualarm_bringup competition_core.launch.py
ros2 launch dualarm_bringup debug.launch.py
ros2 launch dualarm_bringup single_arm_debug.launch.py
```

## 上下游依赖

- 上游：各领域包、配置和 MoveIt 启动链
- 下游：根 `launch/competition.launch.py` 和控制台 API

## 修改边界

- 只做启动编排和参数转发。
- 新节点实现不要直接塞到 bringup 包里。

## 相关链接

- `../README.md`
- `../../ops/competition_console_api/README.md`
