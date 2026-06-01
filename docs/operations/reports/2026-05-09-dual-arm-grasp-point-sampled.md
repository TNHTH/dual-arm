# 2026-05-09 双臂夹取点关节采样

## 结论

2026-05-09 04:59:51 CST，用户确认已移动回夹取点并要求开始。本轮按安全门禁只读拉起左右 `robo_ctrl`，采样当前夹取点左右 6 轴关节角；没有发送任何运动、Servo、PTP、MoveJ、MoveCart、程序运行或夹爪命令。

当前夹取点可作为候选双臂关节目标 `dual_grasp_pose_2026-05-09-0459`。

## 当前夹取点采样

单位：关节角为 `deg`，TCP 为控制器返回的 `mm/deg`。

### 左臂

- joint: `[-47.121994, -52.515736, 86.086037, -215.939865, -79.598450, -90.014793]`
- tcp: `[-403.984528, 258.637146, 335.454742, 10.752776, -87.627716, -47.473518]`
- `motion_done=true`
- `error_code=0`

### 右臂

- joint: `[-129.529678, -120.581802, -55.148106, -4.471327, 77.114014, 89.689338]`
- tcp: `[-401.145508, -290.819794, 500.579987, -118.887619, 89.593933, 98.697250]`
- `motion_done=true`
- `error_code=0`

## 稳定性证据

- 左臂连续 5 次采样均为 `motion_done=true`、`error_code=0`。
- 右臂连续 5 次采样均为 `motion_done=true`、`error_code=0`。
- 右臂此前 `motion_done=false` 在本轮只读采样中未复现。

## 本轮操作

1. 检查旧进程：没有 `move_group`、`fairino_dualarm_planner`、`planning_scene_sync` 或左右 `robo_ctrl` 运行；已有 `competition_console_api`、`execution_adapter` 和夹爪节点。
2. 只读拉起：
   - `robo_ctrl_L.launch.py robot_ip:=192.168.58.2 ... start_high_level:=false start_gripper:=false max_velocity_percent:=10.0 max_acceleration_percent:=10.0 max_ovl_percent:=10.0`
   - `robo_ctrl_R.launch.py robot_ip:=192.168.58.3 ... start_high_level:=false max_velocity_percent:=10.0 max_acceleration_percent:=10.0 max_ovl_percent:=10.0`
3. 采样 `/L/robot_state` 和 `/R/robot_state`。
4. 停止本轮只读 `robo_ctrl` 进程，并刷新 ROS daemon。

## 当前阻塞

准备释放点此前只有 operator mark，没有保存数值化左右 6 轴关节角。因此现在还不能生成“夹取点 -> 准备释放点”的同步轨迹。

下一步必须让用户把机械臂移动到准备释放点，再同样只读采样：

- left release joint
- right release joint

之后才能执行 `/planning/plan_dual_joint` plan-only，并在用户确认后执行 `/execution/execute_trajectory synchronized=true`。
