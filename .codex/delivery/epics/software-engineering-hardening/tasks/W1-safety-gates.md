# W1 Safety Gates

> 状态：进行中
> 创建时间：2026-04-26

## 目标

在软件-only 范围内收紧控制台暴露面、危险 API 鉴权、jog 限幅、stop/timeout 路径和 driver 参数校验。

## 已完成修改

- `competition_console_api` 默认 host 改为 `127.0.0.1`。
- 危险 HTTP API 增加 token 中间件，覆盖 bringup、control、tasks、acceptance run、presets、action groups、recordings。
- `start_hardware=true` 默认被软件-only 策略拦截，必须显式配置 `allow_hardware_bringup=true`。
- jog 增加单步、累计、持续时间、周期、速度、加速度限制。
- jog timeout 与 stop 会请求 mockable `RobotServoJoint(command_type=1)` stop 路径。
- 夹爪 speed/torque 默认上限收紧。
- `robo_ctrl` 增加运动速度、加速度、ovl、blend、SetSpeed 校验和运动完成 timeout；timeout 时请求 `StopMotion`。
- `robo_ctrl` 对 `robot_port` 兼容占位语义输出 WARN，避免误导。
- 高频状态 `std::cout` 已移除。
- 新增 `config/control/safety_limits.yaml`。

## 验证证据

- `/usr/bin/python3 -m py_compile packages/ops/competition_console_api/scripts/competition_console_api_node.py packages/ops/competition_console_api/scripts/competition_console_static_server.py`：通过。
- `colcon build --base-paths packages --packages-select competition_console_api robo_ctrl`：通过，`2 packages finished`。
- `rg -n "0\\.0\\.0\\.0|std::cout|print\\(" packages/ops/competition_console_api/scripts packages/control/robo_ctrl/src/robo_ctrl_node.cpp`：无匹配。

## 待关闭

- 等待 Wave 1 安全 reviewer subagent 复核。
- Wave 2 补 API auth、jog limit 和 driver safety 的测试。
