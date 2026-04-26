# competition_rviz_tools

## 目录作用

`competition_rviz_tools` 提供比赛调试用 RViz 辅助工具，包括场景对象可视化、抓取调试 marker、任务桥接 marker 和点云模型显示。

## 包含内容

- `competition_rviz_tools/grasp_debug_markers.py`：抓取候选和调试 marker。
- `competition_rviz_tools/rviz_task_bridge.py`：任务状态到 RViz 可视化的桥接。
- `competition_rviz_tools/scene_interactive_markers.py`：场景对象交互 marker。
- `competition_rviz_tools/scene_model_pointcloud.py`：对象模型点云可视化。
- `launch/competition_rviz.launch.py`：RViz 调试入口。
- `config/competition_control.rviz`：默认 RViz 配置。

## 常用命令

```bash
ros2 launch competition_rviz_tools competition_rviz.launch.py
```

## 上下游依赖

- 上游：`scene_fusion`、`planning_scene_sync`、任务状态和 TF。
- 下游：人工调试、软件-only 可视化检查和比赛前演示。

## 修改边界

- 本包只负责可视化和调试，不负责规划、执行、控制或任务判定。
- 软件-only 整改期间不得在本包内加入真实硬件动作入口。
