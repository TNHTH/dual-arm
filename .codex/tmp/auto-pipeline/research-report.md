# Research Report

2026-04-26 software engineering hardening baseline:
- Current branch: `codex/software-engineering-hardening-20260426`.
- Scope is software-only: no real robot IP, no real serial devices, no hardware launch, no real motion.
- `python3 scripts/check_path_hardcodes.py` passed.
- `python3 scripts/check_readme_coverage.py` failed because `packages/ops/competition_rviz_tools/README.md` is missing.
- `pytest --collect-only tests` failed because the current shell has no `pytest` executable.
- `colcon list --base-paths packages --names-only | sort` found 27 ROS packages.
- The repair plan is execution-first: Wave 1 safety gates, Wave 2 tests/CI, Wave 3 configuration, Wave 4 task semantics, Wave 5 module split, Wave 6 docs/repo hygiene/final push.

2026-04-15 baseline:
- Current branch `test` is clean.
- `./build_workspace.sh` passed with 24 packages.
- P0 blockers confirmed by static inspection: placeholder dual-arm MoveIt, fake planner, placeholder task states, ROI ball/basket perception, topic-only planning_scene_sync.

2026-04-16 repo reorg findings:
- 当前唯一源码事实来源为隔离 worktree 中的 `packages/` 主根；`src` 和 `third_party` 只保留兼容符号链接。
- 官方约定已核对：根 README 负责导航、包 README 下沉接口说明、生成物与归档目录不作为源码事实来源。
- 旧仓审计来源确认位于 `/home/gwh/dualarms_ws/src/FairinoDualArm`，当前主仓所需活跃内容已映射到新结构，本轮不再整仓复制旧代码。
- 当前 clean 基线下未发现 `software.backup_*`，`vendor/fairino_sdk` 暂保留原样，并通过 manifest 记录后续迁出规则。
