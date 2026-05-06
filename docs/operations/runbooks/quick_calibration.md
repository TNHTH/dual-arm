# quick_competition 标定与路点录制

## 桌面触碰标定

触碰点要求：

- 使用同一个 TCP 定义。
- 每次触碰保持同一末端姿态，推荐垂直向下。
- 四点尽量靠桌角，不要集中在桌面中间。

示例：

```bash
ros2 run quick_competition quick_calibration_manager --record left_arm front_left --tcp-pose 0,0,0,0,0,0
ros2 run quick_competition quick_calibration_manager --record left_arm front_right --tcp-pose 1.2,0,0,0,0,0
ros2 run quick_competition quick_calibration_manager --record left_arm back_left --tcp-pose 0,0.8,0,0,0,0
ros2 run quick_competition quick_calibration_manager --record left_arm back_right --tcp-pose 1.2,0.8,0,0,0,0
ros2 run quick_competition quick_calibration_manager --solve
```

RMSE 分级：

- `<0.002m`：PASS。
- `0.002-0.005m`：WARN，允许继续，但日志记录精度等级。
- `>0.005m`：CRITICAL，重新触碰或检查 TCP。

## Waypoint 录制

录制必须读取实际反馈关节角和 TCP，不允许用目标关节角代替。

```bash
ros2 run quick_competition quick_waypoint_recorder --arm left --name home
ros2 run quick_competition quick_waypoint_recorder --arm right --name home
```

录 `observe_table` 和 handover observe 路点时，两臂都实际移到观察位，现场确认互不遮挡、不会互相碰撞，再分别记录。

## Manual Offset

`manual_offset_xyz` 发布为 `table_frame -> table_frame_corrected`。原始 `quick_*_motion_base -> table_frame` 保持不变，便于回退和日志对比。hardware preflight 会对全部关键 waypoint 做静态 IK 检查；offset 非零时旧 `joint_deg` 缓存失效。
