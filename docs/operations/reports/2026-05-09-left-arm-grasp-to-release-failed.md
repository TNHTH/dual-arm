# 2026-05-09 左臂夹取点到准备释放点执行失败记录

## 结论
- 用户要求先做左臂从夹取点到准备释放点的单臂移动。
- 本轮确认左臂确实在夹取点，连续 5 帧 `motion_done=true`、`error_code=0`。
- `/planning/plan_joint` 对 `left_arm` 规划成功，但 `/execution/execute_trajectory` 通过 ServoJ 路径执行时返回 success 后，独立 `/L/robot_state` 采样确认左臂没有移动。
- 随后改用底层 `/L/robot_move` 低速 MoveJ 到同一准备释放关节目标，控制器直接拒绝，返回错误码 `154`。
- 已清错并确认左臂仍在夹取点附近、停稳、`motion_done=true`、`error_code=0`。
- 本轮结束时已停止临时 `L_robo_ctrl`、`joint_state_aggregator`、`move_group`、`fairino_dualarm_planner`、空场景发布器和 `robot_state_publisher`。

## 起点门禁
- 左臂目标夹取点 deg：`[-47.121994, -52.515736, 86.086037, -215.939865, -79.598450, -90.014793]`
- 采样结果：
  - `samples=5`
  - `last_deg=[-47.121994, -52.516171, 86.085823, -215.939651, -79.598663, -90.014572]`
  - `motion_done=True`
  - `error_code=0`
  - `max_diff_to_grasp_deg=0.000435`
  - `all5_motion_done_error0=True`

## 规划结果
- 使用 `joint_state_aggregator active_arms:=left`，左臂真实 `/L/joint_states`，右臂默认占位。
- `/planning/plan_joint` 返回：
  - `plan_success=True`
  - `plan_message=MoveIt PlanJoint 规划成功`
  - `plan_result_code=success`
  - `plan_time_ms=538.860`
  - `points=27`
  - `duration_s=2.538`
  - first deg：`[-47.122, -52.516, 86.086, -215.940, -79.599, -90.014]`
  - last deg：`[-15.457, -49.817, 87.184, -211.761, -166.409, -82.552]`

## 执行尝试 1：/execution/execute_trajectory
- action goal：
  - `arm_group=left_arm`
  - `synchronized=False`
  - `execution_profile=left_arm_grasp_to_release_demo`
- action 返回：
  - `goal_accepted=True`
  - `execute_success=True`
  - `execute_message=ServoJ开始执行; 已等待 ServoJ 执行窗口并确认 motion_done=true`
  - `execute_result_code=success`
  - `actual_duration_s=3.684`
  - `primary_started=True`
  - `primary_completed=True`
- 但独立 `/L/robot_state` 验证：
  - `last_deg=[-47.121777, -52.515953, 86.086037, -215.939438, -79.598663, -90.014359]`
  - `motion_done=True`
  - `error_code=0`
  - `max_diff_to_release_deg=86.811142`
  - `max_diff_to_grasp_deg=0.000434`
- 结论：action success 不可信，实机没有移动。
- `L_robo_ctrl` 日志显示：
  - `ServoJ路径点数量: 135`
  - `ServoJ线程异常: 未知异常`

## 执行尝试 2：/L/robot_move
- 请求：
  - `move_type=0`
  - `joint_positions=[-15.461136, -49.818974, 87.178581, -211.765930, -166.409805, -82.553879]`
  - `velocity=5.0`
  - `acceleration=5.0`
- 返回：
  - `success=False`
  - `message=执行移动命令失败，错误码: 154`
- 随后 `L_robo_ctrl` 曾报告：
  - `main_code=1`
  - `sub_code=1`

## 收口状态
- 执行 `robot_mode_helper --arm L --ip 192.168.58.2 --normal-only --keep-mode`：
  - 程序状态 `0`
  - Drag 状态 `0`
  - 已清除机器人错误
  - 已上使能
  - 不执行待机动作
- 收口后 `/L/robot_state`：
  - `joint_position=[-47.121994, -52.515736, 86.086037, -215.939865, -79.598885, -90.014359]`
  - `motion_done=True`
  - `error_code=0`
- 当前左臂仍在夹取点附近。

## 当前判断
- 根因不是规划失败：MoveIt 单臂规划成功。
- ServoJ 执行路径存在明确缺陷：`robo_ctrl` 线程抛出未知异常，但 action 仍报告成功。
- MoveJ 直接执行被控制器拒绝，错误码 `154` 需要查 Fairino 控制器含义。
- 不能继续盲目重发左臂到释放点。

## 下一步安全入口
- 先修 `robo_ctrl` ServoJ 异常日志：必须把未知异常变成可定位的错误码或 SDK 返回值。
- 查 Fairino `MoveJ` 错误码 `154` 的含义。
- 在修复前，若继续实机，只允许做极小单关节/小步 JOG 验证，不允许再发大跨度夹取点到释放点命令。
