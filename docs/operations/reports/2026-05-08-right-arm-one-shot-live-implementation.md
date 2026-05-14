# 2026-05-08 右臂 one-shot-live 单命令实现记录

## 结论
- 已实现 `observe_remember_grasp_node.py --mode one-shot-live`，把感知、runtime table correction、scene、规划、执行、合爪和抬起串成一次运行的 fail-closed 流程。
- 本轮只做代码、离线单元测试、静态检查、构建和 no-motion gate smoke；没有启动实机控制图，没有执行真实轨迹，没有发送夹爪 command。

## 实现内容
- CLI 增加 `--mode one-shot-live`，并兼容 `--arm right`、`--frame`、`--object-class`、table/coke/collision 几何参数、`--effective-gripper-opening-m`、`--gripper-open-position`、depth/table correction 开关、`--auto-reobserve-at-pregrasp`、`--speed-scale` 和 `--cartesian-speed-scale`。
- `one-shot-live` 自动启用 `depth_frame_auto`、`runtime_table_plane_correction`、`depth_only_fallback_when_unaligned` 和 `single_object_tabletop`，禁止 manual depth pixel fallback。
- 新增 depth 全图反投影、RANSAC 桌面平面拟合、optical frame candidate 选择、`T_world_cam_runtime` runtime 桌面修正、YOLO ROI + table-height 分割、RGB-depth 未对齐时 depth-only 单凸起物分割。
- 记忆 JSON 写入 `calibration_status=runtime_table_corrected_candidate_not_verified`，`center_z` 固定为 `table_top_real_z + coke_height/2`。
- 执行流复用现有 production authority：只调用 `/planning/plan_pose`、`/execution/execute_trajectory`、`/execution/set_gripper`、`/scene/*`，不在该节点直接调用 raw `/R/robot_move*` 或 `/R/robot_servo*`。
- `report.json` 顶层增加 `result`、`failure_stage`、`robot_motion_executed`、`gripper_command_sent`、`gripper_closed`、`lift_executed`、`pregrasp_plan_success`、`executed_pregrasp_high` 和 `executed_final_approach`。

## 验证证据
- `/usr/bin/python3 -m py_compile packages/tools/tools/scripts/observe_remember_grasp_node.py tests/unit/test_observe_remember_grasp_one_shot_math.py`：通过。
- `source install/setup.bash && /usr/bin/python3 -m pytest -q tests/unit/test_observe_remember_grasp_one_shot_math.py`：`5 passed`。
- `source install/setup.bash && /usr/bin/python3 packages/tools/tools/scripts/observe_remember_grasp_node.py --help`：包含 `one-shot-live`、`--runtime-table-plane-correction`、`--single-object-tabletop`、`--auto-reobserve-at-pregrasp`。
- `rg -n '/R/robot_move|/R/robot_servo|epg50_gripper/command|/competition/run' packages/tools/tools/scripts/observe_remember_grasp_node.py`：无命中。
- `git diff --check -- packages/tools/tools/scripts/observe_remember_grasp_node.py tests/unit/test_observe_remember_grasp_one_shot_math.py`：通过。
- `colcon build --base-paths packages --packages-select tools`：`1 package finished`。
- no-motion gate smoke：
  - 命令设置 `DUALARM_HARDWARE_CONFIRM_TOKEN=TOKEN`，运行 `--mode one-shot-live --hardware-confirm-token TOKEN --effective-gripper-opening-m 0.070 --rend-to-pinch-center-xyz-m 0,0,0 --state-timeout-sec 0.2`。
  - 退出码 `8`，状态 `robot_state_unavailable`。
  - 报告：`.codex/tmp/runtime/one-shot-live-no-motion-smoke-20260508/report.json`。
  - 报告字段确认：`robot_motion_executed=false`、`gripper_command_sent=false`、`gripper_closed=false`、`lift_executed=false`。

## 边界与风险
- 本轮未验证真实 RGB-D 当前画面、真实 TF candidate、RViz scene 或 MoveIt plan/execution 成功率。
- `Rend_to_pinch_center` 仍必须由现场参数提供；代码不会猜测该偏置。
- `effective_gripper_opening_m` 默认 `0.0`，未显式传入 `>=0.070` 时 `one-shot-live` 会 fail-closed。
- `speed-scale` 和 `cartesian-speed-scale` 已被 CLI 接受并写入报告；底层 `ExecuteTrajectory` 当前没有对应字段，实际低速仍依赖 `execution_profile` 与 execution adapter 配置。
