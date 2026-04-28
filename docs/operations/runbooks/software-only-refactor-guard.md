# Software-only Refactor Guard

创建时间：2026-04-26

## 目标

本护栏适用于 `codex/software-engineering-hardening-20260426` 分支的 Wave 0-6 工程化整改。整改范围只包含软件层面的代码、配置、测试、文档和仓库治理，不包含任何实机动作。

## 禁止事项

- 不连接真实机械臂 IP，例如 `192.168.58.2`、`192.168.58.3` 或现场控制器地址。
- 不打开真实串口、夹爪设备或 `/dev/serial/by-id/*`。
- 不运行 `mock_mode:=false`、`start_hardware:=true` 或等价真实硬件 launch。
- 不调用真实运动、Servo、MoveCart、MoveJ、夹爪 enable/open/close 服务。
- 不通过控制台 API 触发真实 bringup、recover、jog、gripper、recording delete 或 kill/restart 流程。

## 允许事项

- 静态检查：`rg`、`colcon list`、README 覆盖检查、路径硬编码检查。
- 纯软件测试：pytest、mock service、mock FastAPI、mock launch、Playwright mock。
- dry-run 或 show-args：只要不启动真实驱动、不连接设备。
- 文档、配置、测试、代码重构和 CI 脚本修改。

## 验证默认值

- ROS Python 脚本优先使用 `/usr/bin/python3`。
- 所有 launch 验证默认显式传入 `start_hardware:=false` 或 mock 等价参数。
- 控制台 API 默认只监听 `127.0.0.1`。
- 危险 HTTP API 必须通过鉴权测试后才能视为完成。

## 熔断条件

出现以下任一情况时停止当前 Wave，并记录到 `.codex/tmp/error-trace/ERROR_TRACE.md`：

- 命令尝试访问真实 IP、真实串口或真实硬件 launch。
- 测试需要人工上电、急停复位或真实机器人确认。
- 发现 staged diff 包含密钥、token 或现场私有凭据。
- 连续三次验证失败且根因不明。
