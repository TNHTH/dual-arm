# planners

## 目录作用

保存运行时规划服务包。

## 包含内容

- `fairino_dualarm_planner`

## 入口文件或常用命令

```bash
ros2 launch fairino_dualarm_planner fairino_dualarm_planner.launch.py
```

## 上下游依赖

- 上游：MoveIt 配置、场景同步和场景对象
- 下游：`execution_adapter`、`dualarm_task_manager`

## 修改边界

- 只放规划服务实现。
- 与具体硬件执行强耦合的逻辑留给 `control/`。

## 相关链接

- `fairino_dualarm_planner/README.md`
- `../planning_scene_sync/README.md`
