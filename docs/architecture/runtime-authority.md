# Production Runtime Authority

创建时间：2026-05-08

## Authority Chain

唯一 production 运行链为：

```text
scene_fusion -> /planning/* -> /execution/* -> /competition/run
```

Production runtime 只能通过下列接口推进比赛任务：

- perception：`scene_fusion` 发布的权威场景对象。
- planning：`/planning/plan_pose`、`/planning/plan_joint`、`planning_scene_sync`。
- execution：`/execution/execute_trajectory`、`/execution/execute_primitive`、`/execution/set_gripper`。
- task：`/competition/run`。

## Raw Motion Boundary

- `robo_ctrl` 只作为 driver/raw service provider。
- `execution_adapter` 是唯一 production raw robot motion service caller。
- `packages/control/**` 不是整体豁免边界；除 `robo_ctrl` 和 `execution_adapter` 外，control 包不得直接调用 raw robot motion service。
- task、ops、quick、tools、compat 的 production 入口不得直接调用 `RobotMove`、`RobotMoveCart`、`RobotServoJoint`。
- `RobotState` 等只读状态订阅可用于 status/ops，但不能被包装成 motion service client。

## Debug And Manual Boundary

Debug/manual 入口可以保留真实动作能力：

- 默认允许 motion。
- 可与 production launch 合并。
- 不要求 `DUALARM_HARDWARE_CONFIRM_TOKEN`。

## Archive And Compat Boundary

- `archive/**` 不参与 active colcon base path。
- 归档根目录必须放置 `COLCON_IGNORE`。
- archived quick 仅可作为 reference，不作为 production package 安装。
- compat 包不能作为绕过 `/planning/*` 与 `/execution/*` 的 production motion 入口。

## Console API Boundary

Production console API 只允许：

- `/api/health`
- `/api/status`
- `/api/competition/run` 代理到 `/competition/run`
- `/api/planning/*` 代理到 `/planning/*`
- `/api/execution/*` 代理到 `/execution/*`
- `/api/gripper/*` 代理到 `/execution/set_gripper` 或只读 gripper status

Raw jog、pose preset direct send、action group direct send 必须在 debug console 模式中显式开启，production 参数默认关闭。

## Camera Fact Source

- Production profile 不得把 `/dev/video*` 写成长期 verified 事实源。
- Production camera profile 必须使用 serial、usb_port、`/dev/v4l/by-id` 或 `/dev/v4l/by-path`。
- Debug/manual 工具可以输出临时 `/dev/video*` 发现结果，但必须标记为 ephemeral，不能写回 verified profile。
- Camera profile 必须记录 `calibration_status`，未验证状态不能被解释为真机安全证据。

## Completion Boundary

本 runtime authority closure 只证明软件架构收口。右臂夹取恢复仍需重新采集：

- 相机外参
- 深度单位
- ROI
- clearance gate
- `motion_done`
- gripper status
