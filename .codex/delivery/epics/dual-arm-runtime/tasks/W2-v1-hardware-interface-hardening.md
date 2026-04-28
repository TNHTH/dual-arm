# W2 v1 Hardware-Interface Hardening

状态：completed
更新时间：2026-04-28

## Scope

Approved for v1 hardware-interface hardening scope.

本任务只关闭当前硬件接口和执行链路中的主要假成功/误触风险，不宣称解决长期感知、人体安全、真实倒水证据、dense occupancy 或硬实时双臂控制。

## Completed

- 扩展 `Detection2D`、`SceneObject`、`ExecutePrimitive.Result`。
- `competition.launch.py` 增加 `active_depth_camera` fail-fast，左右 depth 互斥。
- 右 detector 与 `dual_camera_mode` 解耦。
- depth alignment 默认 true。
- 感知链路写入 quality/source/shape/estimated covariance。
- `scene_fusion` 增加右 RGB-only 非权威观测通路。
- `planning_scene_sync` 写 MoveIt subframes，并转换到 object-local pose。
- planner freshness 默认 `scene_age_limit_ms=800`。
- `execution_adapter` Cartesian 默认 planner-first，vendor direct 双门控。
- 新增 `guarded_grasp`，contact false 不 attach。
- `dualarm_task_manager._direct_grasp()` 改发 `guarded_grasp`，失败 release。
- pouring 关键状态要求 `table_surface stable`。
- 新增 `evidence_manager` 聚合器骨架。

## Evidence

- `/usr/bin/python3 -m pytest -q tests/unit tests/integration packages/tasks/dualarm_task_manager/test/test_dualarm_task_contract.py`：`28 passed`
- `colcon build --base-paths packages --packages-select dualarm_interfaces dualarm_bringup detector_adapter depth_handler scene_fusion planning_scene_sync fairino_dualarm_planner execution_adapter dualarm_task_manager evidence_manager`：`10 packages finished`
- `ros2 interface show dualarm_interfaces/msg/Detection2D`、`SceneObject`、`ExecutePrimitive`：新字段可见
- `ros2 launch dualarm_bringup competition_core.launch.py --show-args`：通过
- 非法 depth 组合 fail-fast：`active_depth_camera=right 时 right_camera_enable_depth 必须为 true`
- `bash scripts/ci/software_check.sh`：通过

## Residual Risk

- `smoke_depth_handler_future_tf.py` 本轮未正常退出，未计为通过证据。
- v1 不关闭精确 6D pose、人体动态避障、真实 fill/spill、dense occupancy、硬实时双臂同步和完整标定验收。
