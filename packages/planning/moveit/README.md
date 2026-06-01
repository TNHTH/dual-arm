# moveit

## 目录作用

集中管理单臂和双臂 MoveIt 运行时配置。

## 包含内容

- `fairino3_v6_moveit2_config`
- `fairino_dualarm_moveit_config`

## 入口文件或常用命令

```bash
ros2 launch fairino3_v6_moveit2_config move_group.launch.py
ros2 launch fairino_dualarm_moveit_config move_group.launch.py
```

## 上下游依赖

- 上游：`descriptions/`
- 下游：`planners/`、`bringup/dualarm_bringup`

## 修改边界

- MoveIt 配置和 launch 放这里。
- 规划服务实现不要写到配置包里。

## 相关链接

- `fairino3_v6_moveit2_config/README.md`
- `fairino_dualarm_moveit_config/README.md`
