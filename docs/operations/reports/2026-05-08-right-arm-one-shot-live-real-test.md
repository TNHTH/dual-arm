# 2026-05-08 右臂 one-shot-live 实机测试记录

## 结论
- 已进行实机测试，不只是软件验证。
- `one-shot-live` 实机链路完成了：右 RGB-D 感知、depth 桌面平面 runtime correction、depth-only 可乐凸起分割、memory 生成、scene 发布、pregrasp 规划与真实执行。
- 后续恢复执行中完成了真实 `grasp` 规划、真实机械臂靠近和真实夹爪闭合。
- 夹爪最终 `gobj=3`，position `219`，判定夹空；脚本按安全门禁停止，未 attach，未抬起。
- 收尾时已通过 `/execution/set_gripper` 打开夹爪到 position `0`；右臂最后读数 `motion_done=true`、`error_code=0`；ROS 控制图已清空。

## 关键实现变更
- `observe_remember_grasp_node.py` 增加 `one-shot-live` 路径。
- 增加 runtime table plane correction、depth-only tabletop segmentation、optical frame candidate resolver。
- 增加恢复执行参数：
  - `--execute-final-start-stage`
  - `--plan-stage`
  - `--post-execute-settle-sec`
- `execute-final` 内部发布 scene 改为使用 `--scene-publish-duration-sec`，避免移除 coke collision 后 scene 未刷新就进入 planner。
- 执行目标仍通过 `/planning/plan_pose` 和 `/execution/execute_trajectory`；夹爪通过 `/execution/set_gripper`；未调用 raw `/R/robot_move*`、`/R/robot_servo*` 或 `/competition/run`。

## 实机流程摘要
1. 拉起右臂低速硬件图、MoveIt、planner、planning_scene_sync、execution_adapter、右夹爪、右 RGB-D bridge 和 detector。
2. 修正两个现场阻塞：
   - 右 Orbbec V4L2 Z16 depth scale 使用 `v4l2_depth_unit_to_mm_scale:=1.0`。
   - MoveIt/planner `right_base_rpy` 使用弧度 `3.141592653589793`，不是 `180`。
3. `one-shot-live` 成功生成 memory：
   - memory: `.codex/tmp/runtime/one-shot-live-real-20260508-r9/coke_can_memory.json`
   - `calibration_status=runtime_table_corrected_candidate_not_verified`
   - `center_xyz_m` 约 `[-0.24755, -0.38688, -0.009]`
4. `one-shot-live` 真实执行到 `pregrasp_high`，随后因自动二次观测 detector confidence 不足停止，无合爪、无抬起。
5. 从已有 memory 恢复执行 `execute-final`：
   - `pregrasp_high` 和 `pregrasp_low` 均真实执行成功。
   - 原姿态 `target-rpy-deg 180,0,30` 在 `grasp` 目标 IK 不可达。
6. plan-only 扫描找到可达姿态：
   - `180,0,0`
   - `180,-10,30`
   - `190,-10,30`
7. 使用 `190,-10,30` 真实执行 `grasp`：
   - plan success，`point_count=61`
   - execute success，ServoJ 重采样 `603` 点，等待窗口约 `53.56s`
   - close gripper success
   - final gripper status: `gobj=3`、position `219`、error `0`
   - 因 `gobj not in {1,2}`，未 lift。
8. 安全恢复：
   - 通过 `/execution/set_gripper` 打开右夹爪到 position `0`
   - 最后状态读数：TCP `[281.737, 103.031, 178.614, -170.077, -9.989, -149.967]` mm/deg，`motion_done=true`，`error_code=0`
   - 夹爪：position `0`、`gobj=3`、error `0`
   - `pgrep` 无控制类进程；`ROS_DOMAIN_ID=0 ros2 node list` 为空。
   - MoveIt `move_group` 在 Ctrl-C shutdown 时出现 exit code `-11`，但已无残留进程；这不是抓取失败的触发点。

## 主要失败点
- 最终失败阶段：`grasp_contact_not_verified_no_lift`
- 直接原因：夹爪闭合后 `gobj=3`，未检测到物体。
- 重要风险：
  - 本轮运行用 `--rend-to-pinch-center-xyz-m 0,0,0`，只是满足参数门禁，不是 verified pinch center 标定。
  - runtime table correction 和 depth-only segmentation 只解决高度/外参 z 的阻塞，不等于完成夹爪-物体接触几何标定。
  - `190,-10,30` 的 grasp 轨迹为长路径，不能作为稳定抓取策略继续盲重试。

## 关键报告
- `one-shot-live` pregrasp 成功后 reobserve 停止：
  - `.codex/tmp/runtime/one-shot-live-real-20260508-r9/report.json`
- stale/scene/IK 调试：
  - `.codex/tmp/runtime/one-shot-live-real-20260508-r9-execute-final3/report.json`
  - `.codex/tmp/runtime/one-shot-live-real-20260508-r9-execute-final5/report.json`
  - `.codex/tmp/runtime/one-shot-live-real-20260508-r9-execute-final6-grasp-recovery/report.json`
- 最终真实靠近与合爪、未抬起：
  - `.codex/tmp/runtime/one-shot-live-real-20260508-r9-execute-final8-grasp-rpy190--10-30/report.json`

## 验证
- `/usr/bin/python3 -m py_compile packages/tools/tools/scripts/observe_remember_grasp_node.py tests/unit/test_observe_remember_grasp_one_shot_math.py`：通过。
- `source install/setup.bash && /usr/bin/python3 -m pytest -q tests/unit/test_observe_remember_grasp_one_shot_math.py`：`5 passed`。
- `rg -n '/R/robot_move|/R/robot_servo|epg50_gripper/command|/competition/run' packages/tools/tools/scripts/observe_remember_grasp_node.py`：无命中。
- `git diff --check -- packages/tools/tools/scripts/observe_remember_grasp_node.py tests/unit/test_observe_remember_grasp_one_shot_math.py`：通过。
- `colcon build --base-paths packages --packages-select tools`：通过。

## 下一步
- 不建议继续盲重试 `190,-10,30`。
- 下一轮必须先提供或标定真实 `Rend_to_pinch_center`，并用短路径 plan-only 约束 grasp 轨迹长度。
- 建议在 `one-shot-live` 中加入目标 TCP 距离/关节距离上限，禁止从低位预抓到 grasp 产生 600 点以上的大绕行轨迹。
- 重新二次观测时应从实际 grasp 前相机位获取目标，而不是继续使用 r9 的旧 memory。

## 追加观察：左相机确认手动夹住可乐
- 时间：2026-05-08
- 用户手动移动右臂并夹住可乐后，只启动左 RGB-D bridge 和左 detector，未启动机械臂控制链路，未发送运动或夹爪命令。
- 左相机检测到 `class_id=2 cocacola`，score 约 `0.831`，bbox 约 `[308,166,373,276]` px。
- Overlay：`.codex/tmp/runtime/left-camera-held-coke-20260508/left_cocacola_overlay.jpg`
- 结论：可乐确实在左臂视野中，且上一轮右相机 runtime world 坐标方向/目标方向估计与现场观察相反，不能继续使用旧 r9 memory 指挥运动。
