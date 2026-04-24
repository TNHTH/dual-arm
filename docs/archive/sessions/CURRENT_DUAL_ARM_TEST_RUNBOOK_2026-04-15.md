# 当前双臂测试 Runbook

创建时间：2026-04-15
更新时间：2026-04-15

## 当前硬件拓扑

- 左臂：`192.168.58.2`
- 左臂网卡：`enx00e04c36025f`
- 左臂本机地址：`192.168.58.11/24`
- 左臂路由：`192.168.58.2/32 dev enx00e04c36025f`
- 右臂：`192.168.58.3`
- 右臂网卡：`enp5s0`
- 右臂本机地址：`192.168.58.10/24`
- 右臂路由：`192.168.58.3 dev enp5s0`
- 夹爪：当前未确认串口可用，不纳入动作测试

## 安全边界

- 左臂环境受限，只做只读、规划、极小幅动作。
- 右臂允许一定程度移动，但仍从 `5mm` 增量开始。
- 每次只测试一个方向、一个关节或一个服务。
- 真机动作前必须确认急停可用、人员离开机械臂工作空间。
- 本 runbook 不包含 `RunCompetition` 总控闭环测试。
- 右臂灯色解释以 2026-04-15 现场反馈为准：蓝色表示自动模式且默认不可拖动；绿色表示手动模式且不可拖动；青色表示手动模式且可拖动。
- 后续安全判断不能把蓝灯当异常；应同时核对拖动状态、机器人模式、SDK/ROS 状态回读和现场观察。

## 通用环境命令

每个新终端都先执行：

```bash
cd /home/gwh/dual-arm
source /opt/ros/humble/setup.bash
source install/setup.bash
```

## T0 网络验证

```bash
ip route get 192.168.58.2
ip route get 192.168.58.3
ping -c 3 -W 1 192.168.58.2
ping -c 3 -W 1 192.168.58.3
curl --noproxy '*' -I --max-time 5 http://192.168.58.2
curl --noproxy '*' -I --max-time 5 http://192.168.58.3
nc -vz 192.168.58.2 8080
nc -vz 192.168.58.3 8080
```

预期反馈：

- `.2` 路由走 `enx00e04c36025f src 192.168.58.11`
- `.3` 路由走 `enp5s0 src 192.168.58.10`
- 两个 `ping` 都是 `0% packet loss`
- 两个 Web 请求都返回 `302 Redirect`
- 两个 `8080` 都连接成功

## T1 左右臂只读驱动验证

终端 L：

```bash
ros2 run robo_ctrl robo_ctrl_node --ros-args -p robot_ip:=192.168.58.2 -p robot_name:=L
```

终端 R：

```bash
ros2 run robo_ctrl robo_ctrl_node --ros-args -p robot_ip:=192.168.58.3 -p robot_name:=R
```

终端 Check：

```bash
ros2 topic echo /L/robot_state --once
ros2 topic echo /R/robot_state --once
ros2 service list | grep '^/L/'
ros2 service list | grep '^/R/'
```

预期反馈：

- 两边都有 `robot state connect success`
- 两边 `robot_state` 都有 `motion_done: true`
- 两边 `error_code: 0`
- 两边都有：
  - `robot_move`
  - `robot_move_cart`
  - `robot_servo`
  - `robot_servo_joint`
  - `robot_servo_line`
  - `robot_set_speed`

## T2 无摄像头场景与基础模块

终端 Scene：

```bash
/usr/bin/python3 /home/gwh/dual-arm/tools/scripts/publish_empty_scene.py
```

终端 TF：

```bash
ros2 run tf_node static_frame_authority.py
```

可选验证：

```bash
ros2 topic echo /tf_static --once
ros2 topic echo /scene_fusion/scene_objects --once
```

预期反馈：

- `/tf_static` 有 world/table/left_base/right_base 等静态 TF
- `/scene_fusion/scene_objects` 持续发布空场景

说明：

- 不建议这里继续用 `ros2 topic pub ... -r 10`
- 当前测试里更稳的是使用 `publish_empty_scene.py`
- 该脚本按普通 QoS 持续刷新场景时间戳，能避免 `scene_fusion 数据过期`

## T3 MoveIt 与 Planner 规划测试

终端 MoveIt：

```bash
ros2 launch fairino_dualarm_moveit_config move_group.launch.py publish_fake_joint_states:=false
```

终端 Planner：

```bash
ros2 launch fairino_dualarm_planner fairino_dualarm_planner.launch.py
```

注意：

- 不要直接使用 `ros2 run fairino_dualarm_planner fairino_dualarm_planner_node`
- 直接 `ros2 run` 时，这个节点拿不到 `robot_description` / `robot_description_semantic`
- 会报 `Could not find parameter robot_description_semantic`
- 正确方式必须走它自带的 launch 文件

验证服务：

```bash
ros2 service list | grep /planning
```

预期反馈：

- MoveIt 输出 `You can start planning now!`
- 有 `/planning/plan_pose`
- 有 `/planning/plan_joint`
- 有 `/planning/plan_cartesian`

## T4 左臂规划测试

左臂环境受限，先只规划，不执行：

```bash
ros2 service call /planning/plan_pose dualarm_interfaces/srv/PlanPose "{
  arm_group: 'left_arm',
  target_pose: {
    header: {frame_id: 'world'},
    pose: {
      position: {x: 0.30, y: 0.15, z: 0.30},
      orientation: {x: 0.0, y: 0.0, z: 0.0, w: 1.0}
    }
  },
  planner_id: '',
  cartesian: false
}"
```

预期反馈：

- 理想：`success=True`
- 可接受：`collision` 或 `ik_failed`，说明规划器实际运行了，只是目标不合适
- 不应再出现：`robot_state 数据过期`

## T5 右臂规划测试

```bash
ros2 service call /planning/plan_pose dualarm_interfaces/srv/PlanPose "{
  arm_group: 'right_arm',
  target_pose: {
    header: {frame_id: 'world'},
    pose: {
      position: {x: 0.35, y: -0.20, z: 0.35},
      orientation: {x: 0.0, y: 0.0, z: 0.0, w: 1.0}
    }
  },
  planner_id: '',
  cartesian: false
}"
```

预期反馈：

- 理想：`success=True`
- 可接受：`collision` 或 `ik_failed`
- 不应再出现：`robot_state 数据过期`

## T6 左臂极小幅真机动作

仅当现场确认安全后执行。左臂环境受限，只允许极小幅。

设置低速：

```bash
ros2 service call /L/robot_set_speed robo_ctrl/srv/RobotSetSpeed "{speed: 5.0}"
```

测试 `Z + 2mm`：

```bash
ros2 service call /L/robot_move_cart robo_ctrl/srv/RobotMoveCart "{
  tcp_pose: {x: 0.0, y: 0.0, z: 2.0, rx: 0.0, ry: 0.0, rz: 0.0},
  velocity: 3.0,
  acceleration: 3.0,
  ovl: 100.0,
  blend_time: -1.0,
  tool: 0,
  user: 0,
  config: -1,
  use_increment: true
}"
```

预期反馈：

- 服务返回 `success: true`
- 肉眼确认只做极小幅上移
- `/L/robot_state` 的 TCP `z` 有约 `+2mm` 变化

## T7 右臂小幅真机动作

右臂允许一定移动，但仍从小幅开始。

设置低速：

```bash
ros2 service call /R/robot_set_speed robo_ctrl/srv/RobotSetSpeed "{speed: 10.0}"
```

测试 `Z + 5mm`：

```bash
ros2 service call /R/robot_move_cart robo_ctrl/srv/RobotMoveCart "{
  tcp_pose: {x: 0.0, y: 0.0, z: 5.0, rx: 0.0, ry: 0.0, rz: 0.0},
  velocity: 5.0,
  acceleration: 5.0,
  ovl: 100.0,
  blend_time: -1.0,
  tool: 0,
  user: 0,
  config: -1,
  use_increment: true
}"
```

若正常，再逐项测试：

```bash
# X + 5mm
ros2 service call /R/robot_move_cart robo_ctrl/srv/RobotMoveCart "{
  tcp_pose: {x: 5.0, y: 0.0, z: 0.0, rx: 0.0, ry: 0.0, rz: 0.0},
  velocity: 5.0, acceleration: 5.0, ovl: 100.0, blend_time: -1.0,
  tool: 0, user: 0, config: -1, use_increment: true
}"
```

```bash
# Y + 5mm
ros2 service call /R/robot_move_cart robo_ctrl/srv/RobotMoveCart "{
  tcp_pose: {x: 0.0, y: 5.0, z: 0.0, rx: 0.0, ry: 0.0, rz: 0.0},
  velocity: 5.0, acceleration: 5.0, ovl: 100.0, blend_time: -1.0,
  tool: 0, user: 0, config: -1, use_increment: true
}"
```

预期反馈：

- 每次只移动一个方向
- 服务返回 `success: true`
- `/R/robot_state` TCP 对应轴变化约 `5mm`
- 若右臂处于蓝灯，不能单独据此判定异常；蓝灯应理解为自动模式。若出现青色或网页显示可拖动/`Drag`，应先退出拖动并重新确认模式。

## T8 暂不做

当前暂不建议：

- `RunCompetition`
- 双臂同步执行
- 夹爪抓取
- 大幅左臂动作
- 视觉感知闭环

原因：

- 夹爪串口未恢复
- 左臂环境受限
- 视觉链路不在当前测试目标内
- 总控状态机包含多个占位 primitive
