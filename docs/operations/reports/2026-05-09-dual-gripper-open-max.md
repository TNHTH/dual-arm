# 2026-05-09 左右夹爪最大打开记录

## 结论
- 已按用户要求将左右夹爪打开到最大。
- 本次只启动左右 EPG50 夹爪节点和 `execution_adapter` 的 `/execution/set_gripper` 服务。
- 未启动 `robo_ctrl`、MoveIt、planner、`planning_scene_sync`、相机或 detector。
- 未发送任何 `/L|R/robot_move*` 或 `/L|R/robot_servo*` 机械臂运动命令。

## 命令路径
- 左夹爪：
  - namespace: `/gripper0`
  - port: `/dev/serial/by-id/usb-Prolific_Technology_Inc._USB-Serial_Controller_A7BIb114J19-if00-port0`
  - slave_id: `9`
  - command: `/execution/set_gripper`
  - target position: `0`
- 右夹爪：
  - namespace: `/gripper1`
  - port: `/dev/serial/by-id/usb-Prolific_Technology_Inc._USB-Serial_Controller_A_COb114J19-if00-port0`
  - slave_id: `10`
  - command: `/execution/set_gripper`
  - target position: `0`

## 结果
- `/execution/set_gripper` left response: `success=True`, message `夹爪命令完成`。
- `/execution/set_gripper` right response: `success=True`, message `夹爪命令完成`。
- 左夹爪最终 status:
  - `success=True`
  - `position=0`
  - `gobj=3`
  - `error=0`
  - `object_status=手指已到达指定位置，但未检测到物体或物体已脱落`
- 右夹爪最终 status:
  - `success=True`
  - `position=0`
  - `gobj=3`
  - `error=0`
  - `object_status=手指已到达指定位置，但未检测到物体或物体已脱落`

## 收尾
- 操作完成后停止临时 `gripper0`、`gripper1` 和 `execution_adapter` 会话。
- `disable_on_shutdown=false`，停止节点不会发送禁用夹爪命令。
