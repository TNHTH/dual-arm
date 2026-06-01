# System Overview

创建时间：2026-04-15

## 目标

当前 `test` 工作区采用“冻结 2D detector、补全 3D 理解、规划、执行、状态机”的双臂重构路线。

## 主链

```text
detector
  -> detector_adapter
  -> depth_handler
  -> ball_basket_pose_estimator
  -> scene_fusion
  -> grasp_pose_generator
  -> fairino_dualarm_planner
  -> execution_adapter
  -> dualarm_task_manager
```

## 旧链兼容

- `dualarm/launch/robot_main.launch.py` 保留，但只转发到 `dualarm_task_manager`
- `high_level_node` 保留用于调试，不默认进入生产链
- `robo_ctrl_node` 保持 SDK 桥接角色
