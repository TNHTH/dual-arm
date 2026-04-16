# joint_state_aggregator

## 目录作用

汇总左右臂 `joint_states` 为统一 `/joint_states`，供 MoveIt 和其他消费方使用。

## 包含内容

- `launch/joint_state_aggregator.launch.py`
- `scripts/joint_state_aggregator_node.py`

## 入口文件或常用命令

```bash
ros2 launch joint_state_aggregator joint_state_aggregator.launch.py
```

## 上下游依赖

- 上游：左右臂控制节点发布的关节状态
- 下游：MoveIt、RViz 和任务/规划消费方

## 修改边界

- 只做聚合与统一命名。
- 不在这里加控制逻辑。

## 相关链接

- `../dualarm_bringup/README.md`
- `../../planning/README.md`
