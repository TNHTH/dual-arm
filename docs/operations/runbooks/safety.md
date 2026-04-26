# Safety Runbook

创建时间：2026-04-26

## 默认边界

- 默认软件-only：不连接真实机械臂 IP，不打开真实串口，不运行真实硬件 launch，不发送真实运动。
- 控制台 API 默认监听 `127.0.0.1`。
- 外部监听必须显式开启 `allow_external_host=true`。
- `start_hardware=true` 默认被拒绝，除非显式设置 `allow_hardware_bringup=true`。

## API Token

危险 API 包括 bringup、点动、夹爪、mode recover、delete、acceptance run 等 POST/PUT/PATCH/DELETE 路由。

调用方式：

```bash
curl -H "X-Dual-Arm-Token: $DUAL_ARM_CONSOLE_API_TOKEN" \
  -X POST http://127.0.0.1:18080/api/bringup/start
```

或：

```bash
curl -H "Authorization: Bearer $DUAL_ARM_CONSOLE_API_TOKEN" \
  -X POST http://127.0.0.1:18080/api/control/arm/jog/stop
```

## Stop / Cancel

- jog 松开、超时、切臂都会请求 `/api/control/arm/jog/stop`。
- 后端 stop 路径通过 `RobotServoJoint(command_type=1)` 形成可 mock 的停止适配。
- `robo_ctrl` 的 Move/MoveCart 等待运动完成时有 `motion_done_timeout_sec`，超时请求 `StopMotion`。
- action cancel 和 timeout 不应只改 UI 状态，必须走 stop/cancel adapter。

## 限幅

默认限制在 `config/control/safety_limits.yaml`：

- jog 单步、累计、持续时间、最小周期。
- jog 速度和加速度百分比。
- gripper speed/torque clamp。
- motion velocity/acceleration/ovl/blend/timeouts。
- workspace 和 joint 范围。

## Mock / Real 切换

软件-only 推荐：

```bash
source /opt/ros/humble/setup.bash
source install/setup.bash
ros2 launch dualarm_bringup competition_core.launch.py \
  start_hardware:=false \
  start_detector:=false \
  start_camera_bridge:=false \
  use_mock_camera_stream:=false \
  publish_fake_joint_states:=true
```

真机路径必须人工确认：

- 网络、IP、模式、拖动状态和急停状态。
- 夹爪串口 by-id、slave id、供电、RS485 接线。
- 控制台 token、host 暴露范围和 runbook 已就绪。

## 失败处理

- 文件缺失：先停在配置/启动阶段，不进入硬件动作。
- 模型加载失败：禁用 detector 或切 mock，不让任务状态机默认为成功。
- 规划失败：释放 reservation，记录 `failure_stage`。
- release/detach/hold 对象丢失：默认失败，不把目标丢失判成功。
- pour 缺 fill/spill evidence：返回 `unverified_evidence`。
