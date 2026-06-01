# DualArm 操作指令速查表

更新时间：2026-05-09

## 左右夹爪控制

结论：左右 EPG50 夹爪的 production 控制入口统一走 `/execution/set_gripper`；左夹爪是 `/gripper0`、slave `9`，右夹爪是 `/gripper1`、slave `10`。`position=0` 为最大打开，测试闭合常用 `position=220`；闭合后必须用 `gobj in {1,2}` 判断夹到物体，`gobj=3` 表示到位但未夹到。

### 先看这里：为什么在 `~` 下会失败

如果直接在 `~` 目录执行：

```bash
source install/setup.bash
```

Bash 会找 `~/install/setup.bash`，所以会报“没有那个文件或目录”。正确做法是二选一：

```bash
cd /home/gwh/dual-arm
source /opt/ros/humble/setup.bash
source install/setup.bash
export ROS_DOMAIN_ID=0
```

```bash
source /opt/ros/humble/setup.bash
source /home/gwh/dual-arm/install/setup.bash
export ROS_DOMAIN_ID=0
```

后面的所有夹爪命令都可以从 `~` 执行，但必须先 source 上面这两份环境。

### 最短可操作流程

要能控制夹爪，必须先让三个服务进程保持运行：

1. 终端 1：启动左夹爪节点 `/gripper0`。
2. 终端 2：启动右夹爪节点 `/gripper1`。
3. 终端 3：启动 `execution_adapter`，提供 `/execution/set_gripper`。
4. 终端 4：执行打开、闭合、查状态命令。

真正让夹爪开合的是 `/execution/set_gripper`：

- 左夹爪最大打开：执行 `left_arm + position: 0`。
- 右夹爪最大打开：执行 `right_arm + position: 0`。
- 左夹爪测试闭合：执行 `left_arm + position: 220`。
- 右夹爪测试闭合：执行 `right_arm + position: 220`。

### 设备映射

| 侧别 | namespace | slave_id | 稳定串口 |
| --- | --- | --- | --- |
| 左夹爪 | `/gripper0` | `9` | `/dev/serial/by-id/usb-Prolific_Technology_Inc._USB-Serial_Controller_A7BIb114J19-if00-port0` |
| 右夹爪 | `/gripper1` | `10` | `/dev/serial/by-id/usb-Prolific_Technology_Inc._USB-Serial_Controller_A_COb114J19-if00-port0` |

### 启动夹爪服务

以下三个进程会阻塞当前终端，实际操作时分别放到三个终端或 tmux pane 中运行。
下面这段环境命令要在终端 1、终端 2、终端 3、终端 4 都先执行一次；否则该终端里可能找不到 ROS 包或服务类型。

```bash
cd /home/gwh/dual-arm
source /opt/ros/humble/setup.bash
source /home/gwh/dual-arm/install/setup.bash
export ROS_DOMAIN_ID=0
```

终端 1 启动左夹爪节点；该命令会持续运行，不要关闭：

```bash
ROS_DOMAIN_ID=0 ros2 run epg50_gripper_ros epg50_gripper_node --ros-args \
  -r __ns:=/gripper0 \
  -p port:=/dev/serial/by-id/usb-Prolific_Technology_Inc._USB-Serial_Controller_A7BIb114J19-if00-port0 \
  -p default_slave_id:=9 \
  -p disable_on_shutdown:=false \
  -p debug:=false
```

终端 2 启动右夹爪节点；该命令会持续运行，不要关闭：

```bash
ROS_DOMAIN_ID=0 ros2 run epg50_gripper_ros epg50_gripper_node --ros-args \
  -r __ns:=/gripper1 \
  -p port:=/dev/serial/by-id/usb-Prolific_Technology_Inc._USB-Serial_Controller_A_COb114J19-if00-port0 \
  -p default_slave_id:=10 \
  -p disable_on_shutdown:=false \
  -p debug:=false
```

终端 3 启动执行适配层；该命令会持续运行，不要关闭：

```bash
ROS_DOMAIN_ID=0 ros2 launch execution_adapter execution_adapter.launch.py \
  execution_backend:=hardware \
  left_gripper_slave_id:=9 \
  right_gripper_slave_id:=10
```

启动完成后，在另一个终端确认服务都存在：

```bash
source /opt/ros/humble/setup.bash
source /home/gwh/dual-arm/install/setup.bash
export ROS_DOMAIN_ID=0
ros2 service list | grep -E '/execution/set_gripper|/gripper0/epg50_gripper/status|/gripper1/epg50_gripper/status'
```

必须能看到：

```text
/execution/set_gripper
/gripper0/epg50_gripper/status
/gripper1/epg50_gripper/status
```

### 读取状态

左夹爪：

```bash
ROS_DOMAIN_ID=0 ros2 service call /gripper0/epg50_gripper/status \
  epg50_gripper_ros/srv/GripperStatus \
  "{slave_id: 9}"
```

右夹爪：

```bash
ROS_DOMAIN_ID=0 ros2 service call /gripper1/epg50_gripper/status \
  epg50_gripper_ros/srv/GripperStatus \
  "{slave_id: 10}"
```

状态判定：

- `error=0`：夹爪驱动未报错。
- `position=0`：最大打开。
- `gobj=1` 或 `gobj=2`：检测到物体接触，可作为抓取成功证据。
- `gobj=3`：到达目标位置但未检测到物体，不能声明抓取成功。

### 最大打开

左夹爪最大打开：

```bash
ROS_DOMAIN_ID=0 ros2 service call /execution/set_gripper \
  dualarm_interfaces/srv/SetGripper \
  "{arm_name: left_arm, command: 2, slave_id: 9, position: 0, speed: 20, torque: 80, object_id: '', link_name: '', attach_on_success: false, detach_on_success: false}"
```

右夹爪最大打开：

```bash
ROS_DOMAIN_ID=0 ros2 service call /execution/set_gripper \
  dualarm_interfaces/srv/SetGripper \
  "{arm_name: right_arm, command: 2, slave_id: 10, position: 0, speed: 20, torque: 80, object_id: '', link_name: '', attach_on_success: false, detach_on_success: false}"
```

命令解释：

- `arm_name: left_arm/right_arm`：选择左夹爪或右夹爪。
- `command: 2`：设置位置、速度、力矩。
- `slave_id: 9/10`：左夹爪是 `9`，右夹爪是 `10`。
- `position: 0`：张到最大。
- `speed: 20`：低速动作。
- `torque: 80`：夹爪力矩参数。

### 测试闭合

只在现场确认夹爪内没有手、线缆和非目标物体后执行。`position=220` 是当前抓瓶/罐测试常用闭合位，不等于所有任务的 verified 抓取参数。

左夹爪测试闭合：

```bash
ROS_DOMAIN_ID=0 ros2 service call /execution/set_gripper \
  dualarm_interfaces/srv/SetGripper \
  "{arm_name: left_arm, command: 2, slave_id: 9, position: 220, speed: 20, torque: 80, object_id: '', link_name: '', attach_on_success: false, detach_on_success: false}"
```

右夹爪测试闭合：

```bash
ROS_DOMAIN_ID=0 ros2 service call /execution/set_gripper \
  dualarm_interfaces/srv/SetGripper \
  "{arm_name: right_arm, command: 2, slave_id: 10, position: 220, speed: 20, torque: 80, object_id: '', link_name: '', attach_on_success: false, detach_on_success: false}"
```

闭合后立刻读取对应夹爪状态；只有 `gobj in {1,2}` 才能作为夹到物体的证据。

### 收尾

停止本次临时启动的夹爪和执行适配层进程：

```bash
pkill -INT -f 'epg50_gripper_node|execution_adapter_node.py'
```

确认没有遗留夹爪控制节点：

```bash
ROS_DOMAIN_ID=0 ros2 node list | grep -E 'gripper|execution_adapter' || true
```

安全边界：这些命令会真实移动夹爪手指，但不会移动左右机械臂；不要把夹爪闭合成功等同于物体抓取成功，抓取成功必须以状态 `gobj in {1,2}` 和任务上下文共同确认。
