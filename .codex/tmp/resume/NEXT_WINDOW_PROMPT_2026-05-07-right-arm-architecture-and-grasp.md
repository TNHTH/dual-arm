# 2026-05-07 下窗口接续提示词：先解决架构审查问题，再接续右臂夹取

请在 `/home/gwh/dual-arm` 继续。默认中文回复。先阅读：

1. `AGENTS.md`
2. `STATE.md`
3. `docs/operations/reports/2026-05-07-right-arm-practice-control-log.md`
4. `.codex/tmp/resume/IMPLEMENTATION_BREAKPOINTS.md`
5. `.codex/tmp/error-trace/ERROR_TRACE.md`
6. `.codex/tmp/continuous-learning/RETRO.md`
7. `.codex/tmp/prd-tracker/PRD.md`
8. `.codex/delivery/epics/dual-arm-runtime/tasks/W3-quick-competition-sidepath.md`

当前最新事实：

- 2026-05-07 本窗口已停止实机动作并清理 `ROS_DOMAIN_ID=0` 控制图；最后清理检查中没有有效 `robo_ctrl`、`move_group`、planner、execution_adapter、gripper 节点进程残留。
- 最后一次有效右臂状态在清理前为 `motion_done=true`、`error_code=0`，TCP 约 `[-226.135, -262.203, 236.498, -171.249, 38.941, 37.351] mm/deg`。
- 右夹爪清理前状态：`success=true`、`error=0`、`gact=true`、`gsta=3`、`gobj=3`、`position=0`，即夹爪打开，未检测到物体。
- 已执行右臂真实运动和规划靠近，但没有合爪抓取；没有调用 `/competition/run`，没有双臂协作。
- 最新视觉预检：`.codex/tmp/runtime/right-arm-grasp-precheck-after-visual-recover-20260507-162527/right_arm_grasp_precheck.json`
  - YOLO 仍检测到 `cocacola`，score 约 `0.908`。
  - depth ROI median 约 `0.210 m`。
  - bbox 贴到画面底边，`bbox_edge_margin_px=0.0`，target alignment 只是 advisory，不是默认硬门禁。
  - clearance gate 仍失败；右相机到右 TCP 外参仍是 `operator_confirmed_same_as_left_not_calibration_verified`，不是 verified。
- 用户已明确：目标居中/TCP 对齐不是严格硬门禁，可以作为参考；完成夹取任务是第一位。但如果目标贴边或深度 ROI 明显混入背景，要先恢复视野再尝试合爪。

本窗口已实现/修改：

- `packages/tools/tools/scripts/right_arm_grasp_precheck.py`
  - 右相机默认 `/dev/video14`，右深度默认 `/dev/video8`。
  - camera -> TCP 变换已按参考仓库 tf2 语义修正为 forward transform。
  - 180 度旋转画面已映射回原始相机射线再做几何。
  - 输出 `target_alignment`，同时包含 `camera_center` 和 `tcp_contact_projection` 两套候选，对齐默认可作为 advisory。
- `packages/tools/tools/scripts/right_arm_autonomous_grasp_attempt.py`
  - 通过 MoveIt `/planning/plan_pose` 和 `/execution/execute_trajectory` 做右臂脚本化接近。
  - 新增 target alignment advisory 模式；只有显式传 `--require-target-alignment-for-contact` 或 `--require-target-alignment-for-gripper` 才变成硬门禁。
  - 合爪后必须用 EPG50 `gobj in {1,2}` 才能声明抓取成功；若 `gobj=3` 需判定未夹到。
- `packages/control/execution_adapter/*`
  - 已加入 ServoJ 平滑/重采样相关参数，当前实机执行时运动更平滑。

下窗口首要任务不是直接继续实机夹取，而是先处理 external review 架构审查暴露的问题，然后再恢复夹取：

1. 先把 external review 审查中的 P0/P1 问题转成仓库内计划和可验证 Story：
   - Orbbec bridge 重复：`packages/perception/orbbec_gemini_bridge/scripts/` vs `packages/tools/tools/scripts/orbbec_gemini_ros_bridge.py`
   - camera_matrix 重复：感知包 config vs tools/scripts
   - Quick 路径与正式主链执行层分裂：`quick_motion_executor.py`、`legacy_fairino_bridge.py`、`quick_pouring_primitives.py` vs `execution_adapter_node.py`
   - launch 三层透传与 quick 薄包装脚本冗余
   - 配置 schema 分裂：competition profile、quick profile、safety limits、object geometry
   - 右臂实机脚本通过 JSON 文件串联，与 ROS topic/service 主链割裂
2. 实施时优先小步、可验证、低风险：
   - 第一波只做“重复源码收口与入口别名/兼容保留”，不要大范围重写实机控制。
   - 删除或归档前先 `rg` 引用并提供替代命令。
   - 不要在架构清理中触发真实硬件运动。
3. 架构清理验证完成后，再恢复右臂夹取：
   - 重新启动右臂控制图、planner、execution_adapter、右夹爪节点。
   - 重新采 `/R/robot_state` 和 gripper status，必须 fresh、`motion_done=true`、`error_code=0`、夹爪打开。
   - 重新运行 `right_arm_grasp_precheck.py`，不要复用旧 precheck JSON 直接运动。
   - 如果目标仍贴边，先做 `visual_center_step` 或小步退/侧移恢复视野；如果目标可见且深度可信，再 plan-only 检查 `grasp` 段。
   - 只有 plan 中实际出现 `grasp` 段且夹爪打开、现场安全时，才执行合爪；合爪后用 `gobj` 判断是否夹到。

禁止事项：

- 不要调用 `/competition/run`。
- 不要做双臂协作。
- 不要用旧 precheck JSON 直接合爪。
- 不要把右相机外参标成 verified；只能写 `operator_confirmed_same_as_left_not_calibration_verified`。
- 不要把 target alignment advisory 当默认硬门禁；但目标贴边、深度跳变、ROI 明显混背景时必须先恢复视野。
