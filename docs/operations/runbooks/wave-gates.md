# Wave Gates

创建时间：2026-04-16
更新时间：2026-04-16

每个 wave 进入下一波之前，必须同时通过：

1. `Spec Gate`
2. `Design Gate`
3. `Build Gate`
4. `Review Gate`
5. `Acceptance Gate`
6. `Checkpoint Gate`

## Checkpoint Gate

必须更新：

- `STATE.md`
- `.codex/tmp/error-trace/ERROR_TRACE.md`
- `.codex/tmp/continuous-learning/RETRO.md`
- `.codex/tmp/resume/IMPLEMENTATION_BREAKPOINTS.md`
- `.codex/tmp/resume/SUBAGENT_REGISTRY.json`

## Review Gate

必须包含：

- 结构审查
- 风险审查
- 未决 P0/P1 问题列表

未关闭的 P0/P1 finding 不允许进入下一波。
