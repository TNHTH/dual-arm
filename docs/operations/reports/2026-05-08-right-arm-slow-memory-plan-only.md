# 2026-05-08 右臂低速记忆夹取 plan-only

## 结论

本轮已按“速度一定要慢”的要求拉起右臂低速控制/规划链路，并完成双相机点云记忆刷新与右臂夹取候选 plan-only 验证。没有执行真实轨迹，没有启动夹爪节点，没有调用夹爪 command，也没有调用 `/competition/run`。

真实夹取未放行：`DUALARM_HARDWARE_CONFIRM_TOKEN=unset`。此外，右相机外参和右到左融合变换仍是 candidate，fresh-memory-v2 的 clearance gate 仍为 false。

## 现场和门禁

- 用户确认右臂周围安全，并要求运动速度必须很慢。
- 本机门禁：`DUALARM_HARDWARE_CONFIRM_TOKEN=unset`。
- 右臂网络：
  - `enp5s0=192.168.58.10/24`
  - `ping -c 2 -W 1 192.168.58.3`：`0% packet loss`
  - `nc -vz -w 2 192.168.58.3 8080`：succeeded
- 初始 ROS 图只保留左右 RGB bridge、左右 RGB detector 和左右检测 viewer。

## 低速控制栈

先尝试 `nohup` 后台启动 `robo_ctrl_R.launch.py`，日志显示连接成功后进程很快退出，未形成 `/R/robot_state` 证据；这与既有 Incident 41 一致。随后改用受控 PTY 会话启动。

右臂 driver 启动参数：

```bash
ros2 launch robo_ctrl robo_ctrl_R.launch.py \
  robot_ip:=192.168.58.3 \
  robot_port:=8080 \
  robot_name:=R \
  state_query_interval:=0.05 \
  motion_done_timeout_sec:=120.0 \
  max_velocity_percent:=5.0 \
  max_acceleration_percent:=5.0 \
  max_ovl_percent:=5.0 \
  start_high_level:=false
```

低速执行适配器参数：

```bash
ros2 launch execution_adapter execution_adapter.launch.py \
  execution_backend:=hardware \
  trajectory_servo_joint_acc:=0.2 \
  trajectory_servo_joint_vel:=0.2 \
  trajectory_servo_joint_cmd_time:=0.08 \
  trajectory_servo_joint_duration_cmd_time:=0.20 \
  trajectory_servo_joint_motion_done_timeout_s:=60.0 \
  right_gripper_slave_id:=10
```

只读状态证据：

- `/R/robot_state` 可读
- `motion_done=true`
- `error_code=0`
- 当前 TCP 约 `[-159.151, -100.176, 391.372] mm`

已启动用于 plan-only 的节点：

- `/R_robo_ctrl`
- `/joint_state_aggregator`
- `/move_group`
- `/fairino_dualarm_planner`
- `/planning_scene_sync`
- `/execution_adapter`

夹爪节点未启动。

## 旧记忆 plan-only

输入：

- `.codex/tmp/runtime/dual-camera-coke-memory-20260508-ros-topic/right_arm_grasp_memory/right_arm_grasp_memory_candidate.json`

结果：

- 输出：`.codex/tmp/runtime/right-arm-slow-grasp-attempt-20260508-195853/plan-only/right_arm_autonomous_grasp_attempt.json`
- `execute_requested=false`
- `/planning/plan_pose=true`
- `/execution/execute_trajectory=true`
- `pregrasp` plan success
- planning time `408.5 ms`
- trajectory point count `28`
- 执行前后 `/R/robot_state` 均为 `motion_done=true`、`error_code=0`

## 新记忆采集

fresh-memory 第一版被废弃：采集命令误把 `camera_matrix_source_width/height` 手动写为 `640x480`，而项目内参文件源尺寸应是 `1280x720`。该错误会让图像中心附近目标被算成约 `0.20 m` 的横向相机偏移。

fresh-memory-v2 使用正确的 `1280x720 -> 640x480` 内参缩放，生成：

- 记忆 JSON：`.codex/tmp/runtime/right-arm-slow-grasp-attempt-20260508-195853/fresh-memory-v2/dual_camera_coke_memory.json`
- 融合点云 PLY：`.codex/tmp/runtime/right-arm-slow-grasp-attempt-20260508-195853/fresh-memory-v2/dual_camera_coke_memory_candidate_left_camera.ply`
- 3D HTML：`.codex/tmp/runtime/right-arm-slow-grasp-attempt-20260508-195853/fresh-memory-v2/dual_camera_coke_memory_view.html`
- 右臂候选：`.codex/tmp/runtime/right-arm-slow-grasp-attempt-20260508-195853/fresh-memory-v2/right_arm_grasp_memory/right_arm_grasp_memory_candidate.json`

fresh-memory-v2 关键结果：

- 左相机检测 `cocacola` score `0.8853`
- 右相机检测 `cocacola` score `0.9258`
- 右相机目标中心 `[-0.006418, 0.003585, 0.408000] m`
- 候选 TCP 点 `[-0.016418, -0.086415, 0.464000] m`
- 融合点数 `25859`
- 融合中心 `[0.033345, -0.022088, 0.418505] m`
- 融合 bbox size `[0.290952, 0.376100, 0.207391] m`
- object match：`cola_bottle` / `可口可乐原味 300ml` / bbox `[0.060, 0.060, 0.145] m`
- target alignment passes：true
- clearance gate：false，reason `obstacle_too_close_or_target_invalid`
- fusion transform status：`candidate_not_verified`

## 新记忆 plan-only

输入：

- `.codex/tmp/runtime/right-arm-slow-grasp-attempt-20260508-195853/fresh-memory-v2/right_arm_grasp_memory/right_arm_grasp_memory_candidate.json`

结果：

- 输出：`.codex/tmp/runtime/right-arm-slow-grasp-attempt-20260508-195853/plan-only-fresh-v2/right_arm_autonomous_grasp_attempt.json`
- `execute_requested=false`
- status `completed`
- `pregrasp` plan success
- planning time `437.565 ms`
- trajectory point count `56`
- current TCP world `[-0.159151, -0.450177, 0.391372] m`
- pregrasp goal `[-0.323038, -0.504475, 0.259753] m`
- plan distance `0.217096 m`
- 执行前后 `/R/robot_state` 均为 `motion_done=true`、`error_code=0`

## 收尾

已停止临时控制/规划栈：

- `execution_adapter`
- `planning_scene_sync`
- `fairino_dualarm_planner`
- `move_group`
- `joint_state_aggregator`
- `R_robo_ctrl`

收尾后 ROS 图只剩：

- `/left_rgb_bridge`
- `/right_rgb_bridge`
- `/detector_left_rgb`
- `/detector_right_rgb`
- `/left_rgb_detection_viewer`
- `/right_rgb_detection_viewer`

`move_group` 在 Ctrl+C teardown 阶段再次出现已知 exit code `-11`，属于既有 teardown 噪声，不影响本轮 no-motion plan-only 结论。

## 下一步

若继续真实夹取，必须重新进入受控执行波次：

1. 设置并传入 `DUALARM_HARDWARE_CONFIRM_TOKEN`。
2. 重新确认现场安全、急停路径、可乐周边无障碍。
3. 重新采集 fresh memory，继续使用 `1280x720 -> 640x480` 内参缩放。
4. 先启动右夹爪 status 节点，只读确认 `/gripper1/epg50_gripper/status`。
5. 再按本轮低速参数启动右臂控制栈。
6. 先跑 plan-only，再单步进入 `pregrasp -> grasp -> close -> contact/status -> retreat`，每步后采样 `/R/robot_state`。

## 2026-05-08 继续请求真实运动但 token 未满足

用户后续要求“完全打通，自己执行到运动起来”。本轮复查：

- `DUALARM_HARDWARE_CONFIRM_TOKEN=unset`
- 当前 ROS 图仍只剩左右 RGB bridge、左右 detector 和左右 detection viewer
- 无 `/R_robo_ctrl`、`move_group`、`fairino_dualarm_planner`、`execution_adapter`、`planning_scene_sync`、`joint_state_aggregator`、夹爪节点残留
- `scripts/check_runtime_authority.py --launch-contracts`：通过
- `right_arm_autonomous_grasp_attempt.py` 的 `hardware_token_matches()` 明确要求环境变量 `DUALARM_HARDWARE_CONFIRM_TOKEN` 非空，且命令行 token 与环境变量相等
- `docs/architecture/runtime-authority.md` 明确 debug/manual 真实动作需要 `DUALARM_HARDWARE_CONFIRM_TOKEN`，且不允许长期固定口令

安全决定：

- 不自造 token，不绕过 hardware gate。
- 不启动真实运动执行，不调用夹爪 command，不调用 `/competition/run`。
- 下一次只有在环境中存在非空 `DUALARM_HARDWARE_CONFIRM_TOKEN` 后，才允许重新启动低速控制栈并进入单步执行。

## 2026-05-08 用户要求取消 token

用户表示“不用 TOKEN，正常就可以发指令”。本轮安全决定：

- 不修改或删除 `DUALARM_HARDWARE_CONFIRM_TOKEN` gate。
- 不绕过 `right_arm_autonomous_grasp_attempt.py` 的 `hardware_token_matches()`。
- 不发送真实运动、夹爪 command 或 `/competition/run`。
- token 不是固定密码，可以由现场操作者临时给出一次性字符串；真实执行仍必须使用该字符串作为环境变量和命令行确认 token。

## 2026-05-08 用户明确接受取消门禁风险

用户进一步表示允许取消后出现“任何脚本/调试入口都可能在没有现场确认的情况下直接运动右臂和夹爪”，并要求先取消门禁再让机械臂运动。

本轮安全决定保持不变：

- 不取消 `DUALARM_HARDWARE_CONFIRM_TOKEN` gate。
- 不修改脚本以绕过 hardware token。
- 不启动右臂真实运动，不调用夹爪 command，不调用 `/competition/run`。
- 真实执行仍必须由现场操作者提供一次性 token，并以低速、单步、可停止方式运行。

## 后续 token 执行记录

用户随后提供一次性 token `TOKEN`。后续真实低速执行没有取消 token gate，右臂已执行到 `pregrasp` 并停下；`grasp` plan 因 `ik_failed/path_search` 失败，未合爪、未夹住可乐。

后续记录见：

- `docs/operations/reports/2026-05-08-right-arm-token-execution-pregrasp-stop.md`
