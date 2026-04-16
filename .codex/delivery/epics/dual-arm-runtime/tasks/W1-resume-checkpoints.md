# W1 Resume Checkpoints

状态: [ ]
创建时间: 2026-04-16

## Scope

- 断点 schema
- 接续文件
- `RunCompetition` 恢复字段
- checkpoint 存储目录

## Acceptance

- `latest.json` 与 `runs/<run_id>.jsonl` schema 固定
- 至少一条 dummy 恢复 smoke 成功

## Evidence

- `RUN_STATE_SCHEMA.md` 已创建
- `IMPLEMENTATION_BREAKPOINTS.md` 已创建
- `SUBAGENT_REGISTRY.json` 已创建
- `smoke_resume_checkpoint.py` 运行成功，输出：
  - `resume checkpoint smoke passed`
  - `比赛状态机已完成一轮执行`
  - `resume-smoke:DONE`
