# ADR-0001: Production Runtime Authority

日期：2026-05-08

## Status

Accepted

## Context

仓库中曾同时存在 production task chain、console raw jog/API、quick hardware bypass、compat/manual tools 和多个相机设备事实源。只靠 README 或单个 launch 调整无法保证 production runtime 不绕过 planning/execution 层。

## Decision

Production runtime authority 固定为：

```text
scene_fusion -> /planning/* -> /execution/* -> /competition/run
```

`robo_ctrl` 只提供 driver/raw service。`execution_adapter` 是唯一 production raw robot service caller。`quick_competition` 移出 active colcon base path 并归档到 `archive/quick_competition_2026-05-08/`。Production launch 默认不启动 raw-capable console API。

## Consequences

- `packages/control/**` 不再被整体豁免；raw motion 权限精确到 `robo_ctrl` 和 `execution_adapter`。
- Quick 不再由 production CI 构建，也不再作为 active package 安装。
- Debug/manual 工具必须默认 no-motion/dry-run，并使用显式硬件确认。
- Production camera profile 不再接受 `/dev/video*` 作为 verified 事实源。
- Runtime authority 由 `scripts/check_runtime_authority.py` 持续守门。

## Non-Goals

- 本 ADR 不证明真机安全。
- 本 ADR 不证明比赛任务成功。
- 本 ADR 不替代右臂夹取恢复所需的现场 precheck 和标定证据。
