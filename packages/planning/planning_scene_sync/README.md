# planning_scene_sync

## 目录作用

维护权威场景到 MoveIt PlanningScene 的覆盖层，并处理 reservation/attach/detach 语义。

## 包含内容

- `launch/planning_scene_sync.launch.py`
- `scripts/planning_scene_sync_node.py`

## 入口文件或常用命令

```bash
ros2 launch planning_scene_sync planning_scene_sync.launch.py
/usr/bin/python3 packages/tools/tools/scripts/smoke_planning_scene_sync.py
```

## 上下游依赖

- 上游：`scene_fusion`、`dualarm_interfaces/SceneObjectArray`
- 下游：MoveIt、planner 和任务执行链

## 修改边界

- 只处理场景同步和 reservation 语义。
- 不要把感知融合或轨迹执行逻辑混入这里。

## 相关链接

- `../README.md`
- `../planners/fairino_dualarm_planner/README.md`
