# 2026-05-09 双臂速度上限配置同步

## 结论

已把左臂 `robo_ctrl_L.launch.py` 补齐为与右臂相同的速度上限参数接口。后续同时启动左右臂时，可以用同一组 `max_velocity_percent`、`max_acceleration_percent` 和 `max_ovl_percent` 参数，避免左臂默认 `100%`、右臂单独限速造成速度不一致。

本次没有启动左右 `robo_ctrl`，没有发送机械臂运动、Servo、PTP、MoveJ、MoveCart 或夹爪命令。

## 修改

- `packages/control/robo_ctrl/launch/robo_ctrl_L.launch.py`
  - 新增 `motion_done_timeout_sec`
  - 新增 `max_velocity_percent`
  - 新增 `max_acceleration_percent`
  - 新增 `max_ovl_percent`
  - 将以上参数传入 `robo_ctrl_node`

右臂 `packages/control/robo_ctrl/launch/robo_ctrl_R.launch.py` 原本已具备这些参数，本次未改。

## 当前运行核验

- 当前 ROS 节点只有：
  - `/competition_console_api`
  - `/execution_adapter`
- 当前没有 `/L_robo_ctrl` 或 `/R_robo_ctrl` 节点。
- 当前 `execution_adapter` 参数：
  - `trajectory_servo_joint_vel = 2.0`
  - `trajectory_servo_joint_acc = 2.0`

## 验证

```bash
/usr/bin/python3 -m py_compile packages/control/robo_ctrl/launch/robo_ctrl_L.launch.py packages/control/robo_ctrl/launch/robo_ctrl_R.launch.py
colcon build --base-paths packages --packages-select robo_ctrl
rg -n "max_velocity_percent|max_acceleration_percent|max_ovl_percent|motion_done_timeout_sec" install/robo_ctrl/share/robo_ctrl/launch/robo_ctrl_L.launch.py install/robo_ctrl/share/robo_ctrl/launch/robo_ctrl_R.launch.py
git diff --check -- packages/control/robo_ctrl/launch/robo_ctrl_L.launch.py
```

结果：

- `py_compile` 通过。
- `robo_ctrl` 构建通过。
- 安装目录中左右 launch 均包含同一组速度上限参数。
- `git diff --check` 通过。

## 后续启动示例

低速一致启动建议使用同一组参数：

```bash
ros2 launch robo_ctrl robo_ctrl_L.launch.py \
  robot_ip:=192.168.58.2 \
  robot_port:=8080 \
  start_high_level:=false \
  start_gripper:=false \
  max_velocity_percent:=5.0 \
  max_acceleration_percent:=5.0 \
  max_ovl_percent:=5.0
```

```bash
ros2 launch robo_ctrl robo_ctrl_R.launch.py \
  robot_ip:=192.168.58.3 \
  robot_port:=8080 \
  start_high_level:=false \
  max_velocity_percent:=5.0 \
  max_acceleration_percent:=5.0 \
  max_ovl_percent:=5.0
```

右臂当前 `motion_done=false` 问题暂不处理；在该状态恢复前不要用右臂做运动测试。
