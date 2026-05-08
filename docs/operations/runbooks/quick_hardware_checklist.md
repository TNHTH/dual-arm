# Archived quick Hardware Checklist

更新时间：2026-05-08

旧 quick hardware checklist 已归档，不再用于 production 操作。Production hardware 恢复必须从 runtime authority 链路和当前 safety runbook 重新建立证据。

当前入口：

- `docs/architecture/runtime-authority.md`
- `docs/operations/runbooks/safety.md`
- `docs/operations/runbooks/competition_gazebo_full.md`

任何 manual/debug 工具真实动作都必须默认 no-motion，并显式提供 `DUALARM_HARDWARE_CONFIRM_TOKEN` 匹配的硬件确认 token。
