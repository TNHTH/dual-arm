# fairino_dualarm_moveit_config

## 目录作用

双臂 Fairino 的 MoveIt 运行时配置包，是双臂规划和 bringup 的关键配置入口。

## 包含内容

- `config/fairino_dualarm.srdf`
- `config/*.yaml`
- `launch/move_group.launch.py`

## 入口文件或常用命令

```bash
ros2 launch fairino_dualarm_moveit_config move_group.launch.py
```

## 上下游依赖

- 上游：`fairino_dualarm_description`
- 下游：`fairino_dualarm_planner`、`dualarm_bringup`

## 修改边界

- 只改双臂 MoveIt 配置和 launch。
- 规划服务实现不要写进这个包。

## 相关链接

- `../README.md`
- `../../descriptions/fairino_dualarm_description/README.md`
