# planning

## 目录作用

保存描述、MoveIt 配置、规划器、抓取目标和场景同步逻辑。

## 包含内容

- `descriptions/`
- `moveit/`
- `planners/`
- `planning_scene_sync`
- `grasp_pose_generator`
- `legacy/`

## 入口文件或常用命令

```bash
./build_workspace.sh --group planning
ros2 launch fairino_dualarm_moveit_config move_group.launch.py
ros2 launch fairino_dualarm_planner fairino_dualarm_planner.launch.py
```

## 上下游依赖

- 上游：`perception/scene_fusion`
- 下游：`control/execution_adapter`、`tasks/dualarm_task_manager`

## 修改边界

- 规划、描述和场景相关逻辑放这里。
- 真实动作执行不要落到 planning 目录。

## 相关链接

- `moveit/README.md`
- `planners/README.md`
