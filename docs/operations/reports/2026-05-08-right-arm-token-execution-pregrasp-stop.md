# 2026-05-08 右臂 token 低速执行到预抓取后停止记录

## 结论

本轮在用户提供一次性 token `TOKEN` 且确认右臂周围安全后，已让右臂以低速真实运动到预抓取位；没有完成夹取，没有合爪夹住可乐，没有调用 `/competition/run`。

停止原因是：`pregrasp` 轨迹执行成功后，后续 `grasp` 目标规划失败，结果为 `ik_failed` / `path_search`；随后在预抓取位重新采集双相机记忆时，左右 RGB 检测均未检测到可乐，记忆生成失败，因此继续靠近和合爪被停止。

## 运行边界

- 一次性硬件确认：环境变量 `DUALARM_HARDWARE_CONFIRM_TOKEN=TOKEN`，命令行 `--hardware-confirm-token TOKEN`。
- 未取消硬件 token gate，未修改 `right_arm_autonomous_grasp_attempt.py` 的门禁逻辑。
- 右臂速度参数：
  - `robo_ctrl_R`: `max_velocity_percent=5.0`、`max_acceleration_percent=5.0`、`max_ovl_percent=5.0`、`motion_done_timeout_sec=120.0`
  - `execution_adapter`: `ServoJ vel=0.2`、`acc=0.2`、`cmd_time=0.08`、`duration_cmd_time=0.20`、`motion_done_timeout_s=60`
- 右夹爪启动后使用 `/gripper1` status 与 command；本轮只执行 enable/open，没有对目标合爪。

## 输入记忆和候选

- 运行目录：`.codex/tmp/runtime/right-arm-token-execute-20260508-202525/`
- 真实执行使用的 fresh memory：
  - `.codex/tmp/runtime/right-arm-token-execute-20260508-202525/fresh-memory-execute2/dual_camera_coke_memory.json`
  - `.codex/tmp/runtime/right-arm-token-execute-20260508-202525/fresh-memory-execute2/right_arm_grasp_memory/right_arm_grasp_memory_candidate.json`
- 关键检查：
  - fresh memory age gate：`age_sec=0.464565`，阈值 `180.0s`
  - target center px：`[312.7479, 244.4687]`
  - target pixel offset：`[-6.7521, 4.9687]`
  - target alignment gate：`passes=true`
  - precheck gate：`passes=true`

## 执行结果

执行报告：

- `.codex/tmp/runtime/right-arm-token-execute-20260508-202525/execute-full-grasp2/right_arm_autonomous_grasp_attempt.json`

结果摘要：

- `execute_requested=true`
- `status=grasp_plan_failed`
- `pregrasp` plan success：
  - `planning_time_ms=428.7439880371094`
  - `point_count=58`
- 夹爪预处理：
  - `enable_before_approach` success
  - `open_before_approach` success
  - 最终打开状态：`status=241`、`gact=true`、`gsta=3`、`gobj=3`、`error=0`、`position=0`
- `pregrasp` 执行：
  - accepted true
  - success true
  - message：`ServoJ开始执行; 已等待 ServoJ 执行窗口并确认 motion_done=true`
- `grasp` plan：
  - `success=false`
  - `result_code=ik_failed`
  - `failure_stage=path_search`
  - message：`MoveIt PlanPose 规划失败`
  - `planning_time_ms=8459.4560546875`
  - `point_count=0`

预抓取执行后的右臂状态：

- joint deg：`[1.848314, 15.000145, -122.971817, -8.469045, -64.814552, 60.499859]`
- TCP mm/deg：`[-323.199280, -155.059952, 260.210388, 172.104340, 35.111935, 34.855186]`
- `motion_done=true`
- `error_code=0`

收尾前再次采样：

- joint deg：`[1.848531, 15.000362, -122.971382, -8.469262, -64.814552, 60.500076]`
- TCP mm/deg：`[-323.200745, -155.061249, 260.209229, 172.103897, 35.111542, 34.854973]`
- `motion_done=true`
- `error_code=0`

## 预抓取位重新记忆

预抓取后尝试重新采集双相机记忆：

- `.codex/tmp/runtime/right-arm-token-execute-20260508-202525/fresh-memory-after-pregrasp/dual_camera_coke_memory.json`

结果：

- `status=failed`
- 左右检测均未形成可用 detections
- `right_arm_motion_gate.passes=false`
- `right_arm_motion_gate.reason=memory_generation_failed`
- 只保留了左右 color/depth snapshot，没有生成新的右臂候选

因此本轮没有继续执行 `grasp`，没有合爪，也没有 retreat。

## 收尾

已关闭本轮临时控制图：

- `execution_adapter`
- `planning_scene_sync`
- `fairino_dualarm_planner`
- `move_group`
- `joint_state_aggregator`
- `R_robo_ctrl`
- `/gripper1` 右夹爪节点

控制类进程清理命令：

```bash
pgrep -af '[m]ove_group|[f]airino_dualarm_planner|[e]xecution_adapter|[r]obo_ctrl|[e]pg50|[p]lanning_scene_sync|[j]oint_state_aggregator' || true
```

输出为空。

当前仍保留左右 RGB 检测/可视化节点：

- `/left_rgb_bridge`
- `/right_rgb_bridge`
- `/detector_left_rgb`
- `/detector_right_rgb`
- `/left_rgb_detection_viewer`
- `/right_rgb_detection_viewer`

退出噪声：

- `move_group` 在 Ctrl+C teardown 阶段 exit code `-11`。
- `R_robo_ctrl` 在断开机器人连接后 exit code `-6`。
- 两者均发生在停止控制图阶段；收尾前右臂状态已记录为 `motion_done=true`、`error_code=0`。

## 下一窗口接续建议

下一窗口不要直接合爪。先处理以下事项：

1. 现场确认右臂当前停在预抓取附近，且工作区安全。
2. 若要恢复到更安全观察位，先只规划并慢速执行 retreat 或小步后撤。
3. 重新拉起左右 RGB 检测，确认可乐仍在画面中；若检测不到，先调整视野或物体位置，不进入合爪。
4. 重新生成 fresh memory 和 3D 可视化，必须看到目标检测与右臂候选。
5. 先解决 `grasp` pose 的 IK/path_search 失败，再允许 `grasp -> close`。
6. 合爪前必须再次满足 fresh memory age gate、target alignment、右夹爪 status、`/R/robot_state motion_done=true/error_code=0`。
