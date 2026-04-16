# W11 Ops Acceptance

状态: [ ]
创建时间: 2026-04-16
更新时间: 2026-04-16

## Scope

- console API
- console Web
- Playwright
- 软件层 acceptance matrix
- runbook 和架构文档

## Owned Paths

- `src/ops/competition_console_api`
- `src/ops/competition_console_web`
- `docs/runbooks`
- `docs/architecture`
- `src/tools/tools/scripts/acceptance_*`

## Acceptance

- API / Web / Playwright smoke 通过
- 软件层 acceptance matrix 完整
- 不依赖硬件窗口

## Coordination

- 只写验收和运维入口，不写业务逻辑
- 当前窗口状态：dormant
- 当前共享状态版本：`coord_rev=7`
- 当前下一步：当前是 `admit-after-sync`；若 `scene-freshness` 释放首个活跃槽位，则作为第一安全候补进场，但进场前先同步到 `coord_rev=7` 并开启新任务 subagent
