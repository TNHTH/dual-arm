# 2026-05-09 双臂夹取点到准备释放点实机执行失败记录

## 结论
- 用户要求实机演示后，本轮确实调用了 `/execution/execute_trajectory`，双臂发生了实机运动。
- 本轮没有完整到达准备释放点，执行 action 返回失败：
  - `execute_success=False`
  - `execute_result_code=timeout`
  - `execute_message=双臂 ServoJ 执行后未在超时内确认 motion_done=true`
- 执行后已进入故障收口，右臂直连 SDK `StopMotion()` 和 `ResetAllError()` 均返回 `0`。
- 重新启动只读 `robo_ctrl` 后，左右臂连续 5 帧均为 `motion_done=true`、`error_code=0`，但当前位置是中途停留位置，不是释放点。
- 本轮结束时已停止临时 `robo_ctrl`、`joint_state_aggregator`、`move_group`、`fairino_dualarm_planner`、空场景发布器和 `robot_state_publisher`。

## 执行前门禁
- 左右臂均在夹取点附近，连续 5 帧状态门禁通过。
- 门禁输出：
  - `left_samples: 5 left_ok: True left_reason: ok`
  - `right_samples: 5 right_ok: True right_reason: ok`
  - 左最后一帧：`[-47.121994, -52.515736, 86.085602, -215.939651, -79.598450, -90.014793]`，`motion_done=True`，`error_code=0`
  - 右最后一帧：`[-129.529678, -120.581802, -55.147888, -4.471327, 77.114014, 89.689774]`，`motion_done=True`，`error_code=0`

## 规划结果
- `/planning/plan_dual_joint` 成功。
- 返回：
  - `plan_success=True`
  - `plan_result_code=success`
  - `plan_time_ms=455.077`
  - `left_points=27`
  - `right_points=27`
  - `left_duration_s=2.538`
  - `right_duration_s=2.538`

## 执行结果
- 调用 action：`/execution/execute_trajectory`
- goal：
  - `arm_group=dual_arm`
  - `secondary_arm_group=right_arm`
  - `synchronized=True`
  - `execution_profile=low_speed_demo`
- action 返回：
  - `goal_accepted=True`
  - `execute_status=6`
  - `execute_success=False`
  - `execute_result_code=timeout`
  - `actual_duration_s=19.174`
  - `sync_skew_ms=0.674`
  - `primary_started=True`
  - `secondary_started=True`
  - `primary_completed=True`
  - `secondary_completed=False`
- action result 中的 final joint：
  - 左臂 deg：`[-47.121777, -52.351486, 86.085602, -215.939865, -79.599098, -90.014793]`
  - 右臂 deg：`[-128.986450, -128.734314, -49.236370, -1.227641, 99.764565, 89.733063]`

## 运行期异常
- 左臂 `robo_ctrl` 日志：
  - `ServoJ路径点数量: 135`
  - `ServoJ线程异常: 未知异常`
  - 随后多次出现 `机器人报告错误，主错误码: 1，子错误码: 149`
- 左臂 `/L/robot_servo` 的 `ServoMoveEnd` 返回：
  - `success=False`
  - `message=执行ServoMoveEnd命令失败，错误码: 14`
- 右臂 `/R/robot_servo_joint` stop 请求超时，且执行后一度无法从 `/R/robot_state` 采样；重启 `R_robo_ctrl` 后恢复。

## 故障收口
- 右臂直连 SDK stop helper：
  - `RPC ret=0`
  - `StopMotion ret=0`
  - `ResetAllError ret=0`
  - `CloseRPC ret=0`
- 左右 `robot_mode_helper --normal-only --keep-mode` 均完成：
  - 程序状态 `0`
  - Drag 状态 `0`
  - 已清除机器人错误
  - 已上使能
  - 不执行待机动作
- 重新启动只读 `robo_ctrl` 后，最终连续 5 帧稳定：
  - 左臂最后关节 deg：`[-47.076088, -50.531887, 85.996841, -216.057785, -79.572342, -90.060913]`
  - 左臂 `motion_done=True`，`error_code=0`
  - 右臂最后关节 deg：`[-128.903564, -130.130554, -48.402935, -0.757948, 103.301506, 89.730240]`
  - 右臂 `motion_done=True`，`error_code=0`

## 当前停留状态
- 左臂没有到准备释放点，主要只在 `j2` 方向移动了一小段。
- 右臂移动到接近中途位置，也没有到准备释放点。
- 当前不能把现场状态记录为“准备释放点”。

## 当前判断
- 根因不是 planner：规划本身成功，左右轨迹等时长。
- 直接故障发生在执行层：
  - 左臂 `robo_ctrl` 的 ServoJ 路径执行线程抛出未知异常。
  - 控制器侧报告 `main_code=1/sub_code=149`。
  - 右臂执行后状态链路一度丢失，导致 action 不能确认 `motion_done=true`。
- 不能继续重发同一条双臂 ServoJ 轨迹；下一步应先定位 `robo_ctrl` ServoJ 执行异常和 `sub_code=149` 的含义。

## 下一步安全入口
- 不要直接再次执行完整 `grasp -> release` 轨迹。
- 先做 no-motion 源码检查：
  1. 检查 `robo_ctrl` ServoJ 路径线程的异常捕获和日志，补出具体异常。
  2. 检查 `RobotServoJoint` 的 `cmd_time`、`filter_time`、`gain` 与 SDK 推荐范围是否匹配。
  3. 检查 execution_adapter 把 27 点重采样为 135 点后是否触发驱动/控制器限制。
  4. 查 `main_code=1/sub_code=149` 在 Fairino 控制器中的具体含义。
- 如果要继续实机，只允许从当前停留位置做单臂小步 ServoJ/JOG 验证，每次前后都采样 5 帧，不允许直接重跑双臂全路径。
