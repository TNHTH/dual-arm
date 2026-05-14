# 2026-05-09 左夹爪打开命令记录

## 结论
- 已按用户要求打开左夹爪。
- 本轮只操作左夹爪，没有发送任何机械臂运动、MoveJ、MoveCart、Servo、planner 或 execution 命令。
- 最终连续 3 次状态回读：
  - `slave_id=9`
  - `position=0`
  - `error=0`
  - `gobj=3`
  - `object_status=手指已到达指定位置，但未检测到物体或物体已脱落`

## 执行过程
- 初次检查 `/gripper0/epg50_gripper/command` 未出现在 ROS service list。
- 发现既有左夹爪节点进程 `207543/207544` 处于 `T/Tl` 暂停状态，且未注册 ROS node/service。
- `SIGCONT` 后进程变为运行态，但仍没有暴露 `/gripper0` service。
- 清理该不可用进程后，临时拉起左夹爪节点：

```bash
ros2 run epg50_gripper_ros epg50_gripper_node --ros-args \
  -r __ns:=/gripper0 \
  -p port:=/dev/serial/by-id/usb-Prolific_Technology_Inc._USB-Serial_Controller_A7BIb114J19-if00-port0 \
  -p default_slave_id:=9 \
  -p disable_on_shutdown:=false \
  -p debug:=false
```

- 发送打开命令：

```bash
ros2 service call /gripper0/epg50_gripper/command epg50_gripper_ros/srv/GripperCommand \
  "{slave_id: 9, command: 2, position: 0, speed: 20, torque: 80}"
```

## 证据
- service response：

```text
success=True
message='设置参数成功 [位置=0, 速度=20, 力矩=80]'
```

- 初次状态：

```text
position: 123
error: 0
object_status: 手指正向指定位置移动
```

- 最终 3 次状态均为：

```text
position: 0
speed: 0
force: 0
error: 0
gobj: 3
object_status: 手指已到达指定位置，但未检测到物体或物体已脱落
```

- 运行日志：
  - `.codex/tmp/runtime/left-gripper-open-20260509-224936/left_gripper_node.log`
  - `.codex/tmp/runtime/left-gripper-status-after-open-20260509-224957/left_gripper_node.log`

## 收尾
- 临时左夹爪节点已停止。
- 刷新 ROS daemon 后，ROS 图中只剩用户已拉起的视觉节点：
  - `/detector_left_rgb`
  - `/left_rgb_bridge`
