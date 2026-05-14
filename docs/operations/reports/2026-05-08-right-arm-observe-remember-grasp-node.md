# 2026-05-08 右臂单帧 RGB-D 记忆抓取节点实现记录

## Summary
- 已实现 `observe_remember_grasp_node.py` 的分阶段入口：`observe-only`、`publish-scene`、`plan-pregrasp`、`execute-pregrasp`、`execute-final`、`full`。
- 默认只观察；真实 execution 和夹爪命令仍受 `DUALARM_HARDWARE_CONFIRM_TOKEN`、人工确认 flag、pinch offset 和运行态状态门禁保护。
- 本轮未启动真实硬件、未执行轨迹、未调用夹爪 command、未调用 `/competition/run`。

## Implementation
- 新增 `packages/tools/tools/scripts/observe_remember_grasp_node.py`。
- 更新 `packages/tools/tools/CMakeLists.txt`，安装新脚本。
- 更新 `packages/tools/tools/package.xml`，声明 `detector` 与 `epg50_gripper_ros` 运行依赖。
- 更新 `packages/planning/planning_scene_sync/scripts/planning_scene_sync_node.py`，允许 `coke_can` 语义进入 collision 管理，并按通用 cylinder 处理。

## Behavior
- `observe-only` 输出 `coke_can_memory.json`，字段包括 `frame_id=world`、`center_xyz_m`、`radius_m=0.033`、`height_m=0.122`、`view_dir_xy`、`grasp_dir_xy`、固定桌面高度、`calibration_status=candidate_not_calibration_verified` 和 `debug.rgb_depth_aligned`。
- RGB-depth 对齐无法证明时不使用 YOLO bbox 查深度；需要 `--manual-depth-pixel u,v`，否则输出人工点选 overlay 后停止。
- ROI 使用 bbox 中央 `50%` 宽、`70%` 高，并过滤 world z `-0.055 < z < 0.090`。
- 可乐中心 z 固定为 `-0.009 m`，不从深度估计。
- PlanningScene 发布：
  - `table_surface_manual`: box `[1.2,0.8,0.04]`，center z `-0.08`
  - `coke_can_snapshot`: cylinder collision proxy radius `0.040`、height `0.130`，center z `-0.005`
- Motion target 使用 pinch center 语义，execution 模式缺少 `Rend_to_pinch_center` 时拒绝执行。

## Verification Evidence
- `/usr/bin/python3 -m py_compile packages/tools/tools/scripts/observe_remember_grasp_node.py packages/planning/planning_scene_sync/scripts/planning_scene_sync_node.py`：通过。
- `rg -n '/R/robot_move|/R/robot_servo|epg50_gripper/command|/competition/run' packages/tools/tools/scripts/observe_remember_grasp_node.py`：无命中。
- `git diff --check -- packages/tools/tools/scripts/observe_remember_grasp_node.py packages/tools/tools/CMakeLists.txt packages/tools/tools/package.xml packages/planning/planning_scene_sync/scripts/planning_scene_sync_node.py`：通过。
- `colcon build --base-paths packages --packages-select tools planning_scene_sync`：`2 packages finished [1.73s]`。
- `source install/setup.bash && ros2 pkg executables tools | rg observe_remember_grasp_node.py`：输出 `tools observe_remember_grasp_node.py`。
- `source install/setup.bash && /usr/bin/python3 packages/tools/tools/scripts/observe_remember_grasp_node.py --help`：正常显示全部模式和参数。

## Current Boundaries
- 未做现场 `observe-only` 采集，未生成新的真实 `coke_can_memory.json`。
- 未做 RViz scene 人工确认，未做 `plan-pregrasp` 运行态验收。
- 未执行 `execute-pregrasp` 或 `execute-final`。
- 右相机外参与 depth alignment 仍是 candidate；报告必须继续标记 `candidate_not_calibration_verified`。

## Reproducible Smoke
```bash
/usr/bin/python3 -m py_compile packages/tools/tools/scripts/observe_remember_grasp_node.py packages/planning/planning_scene_sync/scripts/planning_scene_sync_node.py
rg -n '/R/robot_move|/R/robot_servo|epg50_gripper/command|/competition/run' packages/tools/tools/scripts/observe_remember_grasp_node.py
colcon build --base-paths packages --packages-select tools planning_scene_sync
source install/setup.bash && ros2 pkg executables tools | rg observe_remember_grasp_node.py
```
