# fairino_dualarm_description

## 目录作用

提供双臂 Fairino 机器人描述骨架，是双臂 MoveIt 配置和规划链的描述基座。

## 包含内容

- `urdf/fairino3_v6_macro.xacro`
- `urdf/fairino_dualarm.urdf.xacro`

## 入口文件或常用命令

```bash
find packages/planning/descriptions/fairino_dualarm_description/urdf -maxdepth 2 | sort
```

## 上下游依赖

- 上游：单臂宏和双臂拓扑定义
- 下游：`fairino_dualarm_moveit_config`、`fairino_dualarm_planner`

## 修改边界

- 只处理双臂描述。
- 控制器和 planner 参数不要混到描述包。

## 相关链接

- `../README.md`
- `../../moveit/fairino_dualarm_moveit_config/README.md`
