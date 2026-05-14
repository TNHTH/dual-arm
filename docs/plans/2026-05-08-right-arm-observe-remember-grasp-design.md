# 2026-05-08 右臂单帧 RGB-D 记忆抓取设计

## Scope
- 新增 `packages/tools/tools/scripts/observe_remember_grasp_node.py`，实现右臂单帧 RGB-D 记忆、固定桌面/可乐 collision 发布、pregrasp plan-only 和受 token 保护的分阶段执行入口。
- 只使用 `world` frame；桌面固定为 `TABLE_TOP_REAL_Z=-0.07`、`TABLE_TOP_COLLISION_Z=-0.06`。
- 不做连续识别、建图或桌面识别。

## Design Decisions
- 默认模式为 `observe-only`；`full` 必须额外提供 `--full-confirm-token`，execution/gripper 命令必须匹配 `DUALARM_HARDWARE_CONFIRM_TOKEN`。
- RGB-depth 未能证明 aligned 时禁用 YOLO bbox depth lookup；没有 `--manual-depth-pixel` 时只输出人工点选 overlay 并停止。
- 记忆点写入 `coke_can_memory.json`，包含固定 can geometry、`view_dir_xy`、`grasp_dir_xy`、桌面高度和 `candidate_not_calibration_verified` 状态。
- PlanningScene 通过 `SceneObjectArray` 发布 `table_surface_manual` 与 `coke_can_snapshot`；`planning_scene_sync` 增加 `coke_can` 语义并按通用 cylinder 生成 MoveIt collision。
- grasp/pregrasp/lift 均以 pinch center 语义建模；真实 execution 必须提供 `--rend-to-pinch-center-xyz-m`，plan debug 缺失时只使用 identity 并标记 debug-only。
- MoveIt tip 仍是 `right_tcp`，所以目标换算链为 `target_Rend = target_pinch * inverse(T_Rend_pinch)`，`target_right_tcp = target_Rend * inverse(T_right_tcp_Rend)`。

## Safety
- execution 模式前检查 `/R/robot_state.motion_done=true`、`error_code=0`、`/planning/plan_pose`、唯一 `/execution/execute_trajectory` action、右夹爪 status 和 token。
- `execute-pregrasp` 只执行 `pregrasp_high`，不发送夹爪命令。
- `execute-final` 按 `high -> low -> allow coke collision -> grasp -> close -> gobj check -> attach/remove fallback -> lift` 执行；`gobj not in {1,2}` 不抬起。

## Verification
- `/usr/bin/python3 -m py_compile packages/tools/tools/scripts/observe_remember_grasp_node.py packages/planning/planning_scene_sync/scripts/planning_scene_sync_node.py`
- 静态扫描确认新增节点无 raw `/R/robot_move*`、`/R/robot_servo*`、直接夹爪 command、`/competition/run` 字符串命中。
- `colcon build --base-paths packages --packages-select tools planning_scene_sync`
- `source install/setup.bash && ros2 pkg executables tools | rg observe_remember_grasp_node.py`
- `source install/setup.bash && /usr/bin/python3 packages/tools/tools/scripts/observe_remember_grasp_node.py --help`
