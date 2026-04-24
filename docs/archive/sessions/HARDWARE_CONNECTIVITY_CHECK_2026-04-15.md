# dual-arm 硬件连通性检查

创建时间：2026-04-15
更新时间：2026-04-15

## 结论

左右机械臂的网络控制链路都已经被成功打通，但夹爪串口链路仍未打通。

- 机械臂本体控制在本工程中走的是控制器 IP + SDK RPC，不是串口。
- 串口路径当前更像夹爪链路，但系统里仍然没有看到可用的 `/dev/ttyACM*` / `/dev/ttyUSB*`。
- 右臂控制器为 `192.168.58.3`，通过 `enp5s0=192.168.58.10/24` 访问。
- 左臂控制器为 `192.168.58.2`，通过 USB 有线网卡 `enx00e04c36025f=192.168.58.11/24` 访问，并使用 `192.168.58.2/32` 专用主机路由。
- 左右臂 `robo_ctrl_node` 都已验证能稳定连接，并能发布各自 `robot_state`。

因此：

- 左右臂现在都具备进入“谨慎运动控制”的前提条件。
- 夹爪还不具备控制条件。

## 本地证据

### 代码层

- [robot.h](/home/gwh/dual-arm/robo_ctrl/include/libfairino/robot.h)
  `FRRobot::RPC(const char *ip)` 明确说明 SDK 使用控制器 IP 建立通信。
- [robo_ctrl_L.launch.py](/home/gwh/dual-arm/robo_ctrl/launch/robo_ctrl_L.launch.py)
  左臂默认 IP：`10.2.20.201`
- [robo_ctrl_R.launch.py](/home/gwh/dual-arm/robo_ctrl/launch/robo_ctrl_R.launch.py)
  右臂默认 IP：`10.2.20.202`
- [launch.py](/home/gwh/dual-arm/epg50_gripper_ros/launch/launch.py)
  夹爪默认串口：`/dev/ttyACM0`

### 运行时检查

- `ls -l /dev/ttyACM* /dev/ttyUSB*`
  无可用串口设备。
- `ip route get 10.2.20.201`
  当前经 `wlp4s0` 的网关转发，不是本地有线直连。
- `ip addr show enp5s0`
  当前已变更为 `192.168.58.10/24`。
- `nmcli connection show '有线连接 1'`
  当前已确认：
  `ipv4.method=manual`
  `ipv4.addresses=192.168.58.10/24`
  `802-3-ethernet.speed=100`
  `802-3-ethernet.duplex=half`
  `802-3-ethernet.auto-negotiate=否`
- `ping 192.168.58.2`
  3 次全部失败。
- `ip neigh show dev enp5s0`
  `192.168.58.2 FAILED`
- `curl --noproxy '*' -I http://192.168.58.2`
  `Failed to connect ... No route to host`
- `nc -vz 192.168.58.2 8080`
  `No route to host`
- 轻量端口探测发现：
  `192.168.58.3:80 open`
  `192.168.58.3:8080 open`
- `ping 192.168.58.3`
  3 发 3 收，`0% packet loss`
- `curl --noproxy '*' -I http://192.168.58.3`
  返回 `302 Redirect` 到 `/index.html`
- 启动 `robo_ctrl_node` 并设置 `robot_ip:=192.168.58.3`
  可稳定建立连接，不再出现前述 `-2 / reset / broken pipe` 循环。
- `ros2 topic echo /L/robot_state --once`
  成功收到一帧左臂状态，包含关节角、TCP 位姿、`motion_done: true`、`error_code: 0`
- `ros2 service list | grep '^/L/'`
  成功看到：
  `/L/robot_move`
  `/L/robot_move_cart`
  `/L/robot_servo`
  `/L/robot_servo_joint`
  `/L/robot_servo_line`
  `/L/robot_set_speed`
- 新增 USB 有线网卡 `enx00e04c36025f` 后，最初状态为 `连接中（正在获取 IP 配置）`，没有 IPv4 地址。
- 已将 `有线连接 2` 配置为：
  `ipv4.addresses=192.168.58.11/24`
  `ipv4.method=manual`
  `802-3-ethernet.speed=100`
  `802-3-ethernet.duplex=half`
  `802-3-ethernet.auto-negotiate=否`
  `ipv4.routes=192.168.58.2/32`
- 当前路由：
  `192.168.58.2 dev enx00e04c36025f src 192.168.58.11`
  `192.168.58.3 dev enp5s0 src 192.168.58.10`
- `ping 192.168.58.2`
  3 发 3 收，`0% packet loss`
- `curl --noproxy '*' -I http://192.168.58.2`
  返回 `302 Redirect` 到 `/index.html`
- `nc -vz 192.168.58.2 8080`
  成功
- `robo_ctrl_node --ros-args -p robot_ip:=192.168.58.2 -p robot_name:=L`
  成功建立命令/状态连接。
- `ros2 topic echo /L/robot_state --once`
  成功收到真实左臂状态，`motion_done: true`，`error_code: 0`
- `ros2 service list | grep '^/L/'`
  成功看到 `/L/robot_move`、`/L/robot_move_cart`、`/L/robot_servo`、`/L/robot_servo_joint`、`/L/robot_servo_line`、`/L/robot_set_speed`
- 启动 `robo_ctrl_node`
  初始显示“成功连接到机器人”，随后很快出现：
  `-2`
  `Connection reset by peer`
  `Broken pipe`
- 启动 `epg50_gripper_node`
  直接报：
  `Failed to open serial port`

## 含义

### 机械臂本体

之前左臂不通的直接原因是：左臂网线接在新出现的 USB 有线网卡 `enx00e04c36025f` 上，而这块网卡没有 IPv4 地址，还在等待 DHCP；法奥控制器不会给 PC 分配 DHCP，因此本机发往 `192.168.58.2` 的流量仍走 `enp5s0`，自然无法到达左臂。

修复后：

- `.2` 专门走 `enx00e04c36025f`
- `.3` 继续走 `enp5s0`
- 两条机械臂链路互不抢路由

可能原因包括：

- 控制器真实 IP 已被改成 `192.168.58.3`
- 本机原先错误使用了 `192.168.58.2`，与官方默认控制器地址冲突
- 原 `10.2.20.201` 也不是当前这条直连链路上的实际地址
- 新接入左臂后出现第二块网卡，但它没有静态 IPv4 配置

### 夹爪

当前系统没有枚举出实际串口设备，夹爪链路未建立。

## 建议恢复步骤

1. 右臂继续使用：
   `enp5s0 = 192.168.58.10/24`
   `robot_ip:=192.168.58.3`
   `robot_name:=R`
2. 左臂继续使用：
   `enx00e04c36025f = 192.168.58.11/24`
   `robot_ip:=192.168.58.2`
   `robot_name:=L`
3. 夹爪如要接通，需要重新检查 USB/串口连接，并确认实际设备名。
4. 在进入真实运动前，先保持只读验证：
   `/L/robot_state`
   `/R/robot_state`
   `/L/robot_move*`
   `/R/robot_move*`
   是否稳定。

## 推荐的安全验证顺序

1. 启动只读驱动：

```bash
cd /home/gwh/dual-arm
source /opt/ros/humble/setup.bash
source install/setup.bash
ros2 run robo_ctrl robo_ctrl_node --ros-args -p robot_ip:=192.168.58.2 -p robot_name:=L
```

2. 另开一个终端只看状态：

```bash
cd /home/gwh/dual-arm
source /opt/ros/humble/setup.bash
source install/setup.bash
ros2 topic echo /L/robot_state
```

3. 当前左臂这一步已经验证通过。右臂同理使用 `robot_ip:=192.168.58.3 -p robot_name:=R`。

## 当前不建议做的事

- 不建议立即测试双臂同步执行
- 不建议在夹爪串口没恢复前测试依赖夹爪的抓取链路

原因是虽然左右臂本体网络链路已经打通，但夹爪未接通，且现场运动安全条件尚未由人工确认。
