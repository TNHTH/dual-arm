# fairino_dualarm_planner

## 目录作用

双臂规划运行时服务包，面向 `PlanPose`、`PlanJoint`、`PlanCartesian` 和双臂规划接口。

## 包含内容

- `launch/fairino_dualarm_planner.launch.py`
- `src/fairino_dualarm_planner_node.cpp`

## 入口文件或常用命令

```bash
ros2 launch fairino_dualarm_planner fairino_dualarm_planner.launch.py
```

## 上下游依赖

- 上游：MoveIt 配置、`planning_scene_sync`、权威场景对象
- 下游：`execution_adapter`、`dualarm_task_manager`

## 修改边界

- 这里只放规划服务。
- 任务判定和具体硬件执行不要写进 planner。

## 相关链接

- `../README.md`
- `../../planning_scene_sync/README.md`
