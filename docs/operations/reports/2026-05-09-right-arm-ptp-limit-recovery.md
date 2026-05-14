# 2026-05-09 右臂 PTP 关节指令超限恢复

## 结论

- 已对右臂控制器执行 `StopMotion()` 和 `ResetAllError()`，两次返回均为 `0`。
- 已执行 `robot_mode_helper --normal-only` 清错、退出拖动检查和上使能，不执行待机动作。
- 右臂状态可读，`error_code=0`，关节/TCP 连续采样稳定。
- `motion_done` 仍持续为 `false`，因此不能声明右臂运行闭环已完全恢复。
- 已停止 `/R_robo_ctrl`，刷新 ROS daemon 后 `/R/robot_move*` 服务不再暴露。
- 本轮没有发送 PTP、MoveJ、MoveL、MoveCart、轨迹执行或夹爪命令。

## 触发原因

用户报告右臂出现 `PTP 关节指令超限`。按历史规则，这类问题不得继续重发 PTP 或换大角度目标，优先停机、清错和只读确认。

## 执行动作

1. 只读检查 ROS 图：
   - 初始没有 `/R/robot_state` 新帧。
   - 未见活跃右臂 `robo_ctrl` 进程。
   - 夹爪、左 RGB 和 gripper web API 仍在线。
2. 网络检查：
   - `ping -c 2 -W 1 192.168.58.3`：`0% packet loss`。
   - `nc -vz -w 2 192.168.58.3 8080`：succeeded。
3. 执行直连 SDK helper：
   - `.codex/tmp/runtime/right_stop_and_reset_error_20260507`
   - `StopMotion ret=0`
   - `ResetAllError ret=0`
   - `CloseRPC ret=0`
4. 只读拉起右臂 driver：
   - `ros2 launch robo_ctrl robo_ctrl_R.launch.py robot_ip:=192.168.58.3 robot_port:=8080 state_query_interval:=0.2 start_high_level:=false`
5. 复查状态：
   - `/R/robot_state` 约 `5 Hz`。
   - 连续采样关节/TCP 稳定。
   - `error_code=0`。
   - `motion_done=false` 持续未恢复。
6. 执行只清理模式的 helper：
   - `robot_mode_helper --arm R --ip 192.168.58.3 --normal-only --keep-mode`
   - `robot_mode_helper --arm R --ip 192.168.58.3 --normal-only --auto-mode`
   - 均未执行待机动作。
7. 执行 stop 类 ROS 服务：
   - `/R/robot_servo_joint command_type=1`
   - 返回：`success=false, message='当前没有正在执行的ServoJ任务'`
8. 安全收尾：
   - 停止 `/R_robo_ctrl`。
   - 刷新 ROS daemon。
   - `/R/robot_move`、`/R/robot_move_cart`、`/R/robot_servo_joint` 不再出现在 service list。

## 最后可读右臂状态

连续采样的代表值：

- joint deg：
  - J1 `-122.0357` 附近
  - J2 `-126.6158` 附近
  - J3 `-91.7983` 附近
  - J4 `23.8993` 附近
  - J5 `80.5135` 附近
  - J6 `92.5443` 附近
- TCP：
  - x 约 `-352.99 mm`
  - y 约 `-340.75 mm`
  - z 约 `289.65 mm`
  - rx 约 `179.60 deg`
  - ry 约 `75.69 deg`
  - rz 约 `47.76 deg`
- `error_code=0`
- `motion_done=false`

## 当前判断

- PTP 超限导致的控制器错误已通过 `ResetAllError()` 清掉。
- 机械臂关节和 TCP 没有明显继续运动，采样抖动在传感/上报级别。
- 但 `motion_done=false` 仍未恢复，不能继续任何自动运动、PTP、MoveJ、MoveCart 或轨迹执行。

## 下一步安全入口

1. 现场确认机械臂物理停稳、示教器无持续任务、无报警。
2. 若示教器仍显示运动中或任务占用，优先在示教器停止/复位。
3. 再次只读拉起 `/R_robo_ctrl`，检查 `/R/robot_state` 是否变为 `motion_done=true`。
4. 只有 `motion_done=true` 且 `error_code=0` 连续至少 5 帧，才允许下一步小步恢复。
5. 后续恢复移动只能用小步 ServoJ/JOG；不要直接使用 PTP 大角度关节目标。

## 2026-05-09 03:34 追加查验

用户要求继续解决并检查后台占用，然后稍微移动右臂。本轮执行了占用确认、只读状态复查和停止/清错恢复，但没有发送运动命令。

### 后台占用

- `ps` 未发现 `R_robo_ctrl`、`robo_ctrl_R`、`move_group`、`fairino_dualarm_planner`、`planning_scene_sync`、右臂抓取脚本或 quick 运动脚本常驻。
- 仍在线的无关进程：
  - 左右 EPG50 夹爪节点。
  - `execution_adapter` 硬件夹爪适配。
  - 左 RGB bridge、detector、viewer。
  - `competition_console_api` gripper web profile，`allow_raw_motion_debug=false`。
- `ss -tnp` 初始未发现到 `192.168.58.3:8080` 的后台连接。
- `ros2 service list` 一度显示 `/R/robot_move*`，但隐藏节点列表没有 `/R_robo_ctrl`；非运动型 `/R/robot_servo_joint command_type=1` 调用超时等待服务，判断为 DDS/service discovery 残留，不是可用运动入口。

### 恢复动作

- 只读拉起 `/R_robo_ctrl` 连接 `192.168.58.3:8080`，确认控制器可连。
- `/R/robot_state` 代表帧：
  - joint deg 约 `[-122.036, -126.616, -91.798, 23.899, 80.513, 92.544]`。
  - TCP 约 `[-352.99, -340.75, 289.65, 179.60, 75.69, 47.76]`。
  - `error_code=0`。
  - `motion_done=false`。
- `robot_mode_helper --normal-only --keep-mode` 输出：
  - `当前程序状态: 0`
  - `当前 Drag 状态: 0`
  - 已清除错误、保持模式、已上使能。
- 再次执行直连 SDK helper：
  - `StopMotion ret=0`
  - `ResetAllError ret=0`
  - `CloseRPC ret=0`
- 之后连续 5 帧 `/R/robot_state` 仍为 `motion_done=false`、`error_code=0`。
- `robot_mode_helper --normal-only --auto-mode` 后继续采样 3 帧，仍为 `motion_done=false`、`error_code=0`。

### 安全结论

- 后台没有发现真实右臂运动进程占用；本轮临时拉起的 `/R_robo_ctrl` 已停止。
- 当前没有到 `192.168.58.3:8080` 的 TCP 连接。
- 右臂错误已清除，程序状态和拖动状态正常，但控制器 `motion_done=false` 未恢复。
- 因为状态门未通过，本轮没有执行“稍微移动右臂”。禁止用小运动去刷新 `motion_done`。
- 下一步需要在示教器/控制器侧检查是否存在未释放的运动完成标志、任务状态或安全模式提示；恢复条件仍是连续至少 5 帧 `motion_done=true` 且 `error_code=0`。

## 2026-05-09 03:49 深入诊断

用户反馈示教器/控制器侧仍持续显示 `PTP 关节指令超限`，并询问是否因为标记点不够。补充执行了只读 SDK 细诊断和停止栈恢复。

### 只读 SDK 状态

临时工具：`.codex/tmp/runtime/right_state_diag_20260509`。

关键结果：

- SDK：`SDK V2.1.1.0`。
- `GetSDKComState=0`：SDK 与控制器通信正常。
- `GetProgramState=1`：SDK 注释含义为 `program stop or no program running`。
- `IsInDragTeach=0`：不在拖动示教。
- `GetRobotEmergencyStopState=0`：急停未激活。
- `GetSafetyStopState`: `SI0=0`、`SI1=0`：安全停止信号无效。
- `GetRobotErrorCode`: `main_code=0`、`sub_code=0`。
- `GetRobotCurJointsConfig=5`。
- `GetRobotMotionDone` 连续采样仍为 `0`。

本次最新代表姿态已经不同于前一轮：

- joint deg 约 `[-123.405, -124.787, -43.862, -16.909, 100.274, 92.584]`。
- TCP 约 `[-347.114, -373.452, 509.189, 146.896, 83.469, 33.642]`。
- 关节速度和 TCP 速度接近 0，仅有上报级微小抖动。

### 停止栈恢复

按非运动停止/清错顺序执行：

- `ImmStopJOG ret=0`
- `StopJOG(1/3/5/9) ret=0`
- `ServoMoveEnd ret=0`
- `ProgramStop ret=0`
- `StopMotion ret=0`
- `ResetAllError ret=0`

执行后：

- `main_code=0`、`sub_code=0`。
- `program_state=1`。
- `motion_done` 仍连续为 `0`。

### 本机来源排查

- `competition_console_api` 当前 profile 为 `gripper_web`，`raw_motion_debug=False`，日志显示 raw motion debug clients disabled。
- `.artifacts/console_pose_presets.json` 和 `.artifacts/console_action_groups.json` 当前不存在；`GET /api/presets` 返回 `{"left_arm":[],"right_arm":[]}`，`GET /api/action-groups` 返回空列表。
- security log 只看到 `/api/control/gripper`，未看到 preset/action-group/arm motion API 被调用。
- 当前没有本机进程持有 `192.168.58.3:8080` 后台连接。

### 判断

- 这不是“本机后台进程一直占用右臂”。
- 也不是“当前关节位置本身已经越过 URDF/MoveIt 关节范围”；当前姿态在模型关节范围内。
- 更可能是某个 PTP/MoveJ 目标点或目标路径被控制器拒绝：目标点可能在关节限位附近、构型解绕行过大、工具/工件坐标不一致，或同一笛卡尔姿态对应到控制器内部的另一个关节解时越限。
- 如果错误来自示教器程序或手动回放的点，问题不是“标记点数量不够”，而是那个点需要重新示教/重新生成，并核对工具坐标、工件坐标、构型和当前起点。
