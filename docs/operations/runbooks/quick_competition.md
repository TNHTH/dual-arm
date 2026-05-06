# quick_competition 快速实机运行手册

## 目标

`quick_competition` 是粗糙完整流程旁路：manual pose 优先、预设路点、低速动作、失败跳过得分项、fatal 立即熔断。它不做真实水位检测、洒漏检测、右相机修复、复杂 MoveIt 智能规划或自主开瓶盖。

## 冷启动顺序

```bash
ros2 launch dualarm_bringup quick_competition.launch.py dry_run:=true
ros2 run quick_competition quick_calibration_manager --solve
ros2 run quick_competition quick_competition_orchestrator --dry-run --full
```

`table_frame_corrected` 依赖 `table_frame`，所以 orchestrator 前必须先完成 calibration solve。若 preflight 报 TF 链缺失，先回到 `quick_calibration_manager --solve`。

## 真实运行

```bash
ros2 launch dualarm_bringup quick_competition.launch.py dry_run:=false hardware_confirm_token:=I_UNDERSTAND
ros2 run quick_competition quick_competition_orchestrator --hardware --task pouring --hardware-confirm-token I_UNDERSTAND
ros2 run quick_competition quick_competition_orchestrator --hardware --task handover --hardware-confirm-token I_UNDERSTAND
ros2 run quick_competition quick_competition_orchestrator --hardware --full --hardware-confirm-token I_UNDERSTAND
```

## 关键规则

- TF 固定为 `quick_left_motion_base -> table_frame`、`quick_right_motion_base -> table_frame`、`table_frame -> table_frame_corrected`。
- `manual_offset_xyz` 只发布 corrected frame，不改原始 calibration。
- manual 模式禁止用 depth 偷偷生成最终 3D pose。
- 倒水放回默认 `place_sequence: bottle_first`，现场可改为 `cup_first`。
- handover 子任务开头单独 observe，提示队员举球，球稳定后才 cage。
- fatal 后不自动回 home，不禁用夹爪，保持扭矩等待人工救援。
