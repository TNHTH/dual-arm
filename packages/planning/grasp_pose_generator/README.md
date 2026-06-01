# grasp_pose_generator

## 目录作用

基于场景对象生成任务级抓取目标。

## 包含内容

- `launch/grasp_pose_generator.launch.py`
- `scripts/grasp_pose_generator_node.py`

## 入口文件或常用命令

```bash
ros2 launch grasp_pose_generator grasp_pose_generator.launch.py
```

## 上下游依赖

- 上游：`scene_fusion` 的权威场景对象
- 下游：planner 和任务状态机

## 修改边界

- 这里只做抓取目标生成。
- 轨迹规划和动作执行留给其他层。

## 相关链接

- `README.md`
- `planning_scene_sync/README.md`
