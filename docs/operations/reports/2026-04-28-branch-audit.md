# DualArm 分支审计报告

创建时间：2026-04-28

## 结论

当前仓库分支命名和职责确实不够清晰。主要问题是：

- `origin/HEAD` 当前指向 `origin/test`，但仓库仍保留 `main`，主线语义不直观。
- `test` 现在是最新工程集成分支，包含 `v1 hardware-interface hardening` 提交。
- 多个 `task/*`、`coord/*`、`home/*`、`codex/*`、`backup/*` 分支混在远端，命名来源不统一。
- 部分远端分支已被 `test` 包含，可以归档或删除；部分未被 `test` 包含，但属于旧布局或旧任务线，不能未审查直接删除。

## 当前主线状态

| 分支 | 当前提交 | 状态判断 |
| --- | --- | --- |
| `test` / `origin/test` | `49f423e feat: harden dual-arm v1 hardware interface` | 当前最新集成分支，远端默认分支指向这里 |
| `main` / `origin/main` | `658d731 docs: codify subagent timeout fallback policy` | 落后 `test`，但仍可作为稳定主线候选 |
| `codex/test-publish-v1` | `49f423e` | 本次发布临时分支，已等同 `test` |
| `codex/v1-hardening-current` | `2d7cfc2` | 本次当前代码快照提交，已作为 `49f423e` 第二父提交保留 |
| `backup/local-test-before-v1-20260428` | `fb56eaf` | 本次推送前的本地 `test` 备份 |

## 已被 `test` 包含的远端分支

这些分支从提交图上已经是 `test` 的祖先或等价历史，原则上可以在确认不再需要作为公开引用后归档或删除：

- `origin/codex/dual-arm-reorg`
- `origin/codex/software-engineering-hardening-20260426`
- `origin/coord/plan-sync`
- `origin/feature/integrate-rviz-scene-modeling`
- `origin/home/test-sync`
- `origin/review-test`
- `origin/task/behavior-cap-pour`
- `origin/task/behavior-handover`
- `origin/task/ops-acceptance`

## 未被 `test` 包含的远端分支

这些分支仍有 `test` 未包含的提交，不能直接删除。需要先判断是否已经被新版代码替代，或是否仍有可移植内容：

- `origin/backup/local-529ee00`
- `origin/codex/competition-pick-assist-calibration`
- `origin/codex/dual-camera-runtime-mode-20260422`
- `origin/task/execution-control`
- `origin/task/perception-camera`
- `origin/task/scene-freshness`
- `origin/task/task-orchestration`

这些分支大多来自旧任务线或旧布局，和当前 `packages/` 布局差异很大；后续清理前应按分支生成 diff 摘要，而不是按名称删除。

## 建议分支规范

建议把分支职责收敛为：

- `main`：长期稳定主线，保护分支，只接收已验证集成结果。
- `test`：硬件联调/比赛集成分支，允许比 `main` 更快，但必须可启动、可回滚。
- `feature/<scope>-<date>`：短期功能分支，例如 `feature/v1-evidence-manager-20260428`。
- `fix/<scope>-<date>`：缺陷修复分支。
- `archive/<date>/<name>`：历史保留分支，替代 `backup/*`、`home/*`、含义不明的旧分支。
- `codex/<scope>-<date>`：仅用于代理临时工作分支，合入后应删除或归档。

## 推荐清理顺序

1. 先决定默认主线：继续让远端默认指向 `test`，或把 `main` 更新到 `test` 并设为默认分支。
2. 给当前交付点打标签，例如 `v1-hardware-interface-hardening-20260428`。
3. 删除本地临时分支：`codex/test-publish-v1`、`codex/v1-hardening-current`，保留或打标签后删除本地备份分支。
4. 对已被 `test` 包含的远端分支，确认没有外部 PR/文档引用后删除或迁到 `archive/`。
5. 对未被 `test` 包含的远端分支逐个生成 diff 摘要，决定 cherry-pick、归档或删除。

## 当前不建议做的事

- 不建议直接删除所有 `task/*`，因为其中部分提交未被 `test` 包含。
- 不建议强推 `test` 或 `main`，当前 `test` 已经可以通过 fast-forward 保持远端历史。
- 不建议继续把长期工程主线放在含义泛化的 `test` 上，而不说明它是硬件联调分支还是默认主线。
