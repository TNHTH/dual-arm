# Research Report

2026-04-26 software engineering hardening baseline:
- Current branch: `codex/software-engineering-hardening-20260426`.
- Scope is software-only: no real robot IP, no real serial devices, no hardware launch, no real motion.
- `python3 scripts/check_path_hardcodes.py` passed.
- `python3 scripts/check_readme_coverage.py` failed because `packages/ops/competition_rviz_tools/README.md` is missing.
- `pytest --collect-only tests` failed because the current shell has no `pytest` executable.
- `colcon list --base-paths packages --names-only | sort` found 27 ROS packages.
- The repair plan is execution-first: Wave 1 safety gates, Wave 2 tests/CI, Wave 3 configuration, Wave 4 task semantics, Wave 5 module split, Wave 6 docs/repo hygiene/final push.
- Wave 1 implementation evidence:
  - Console API default host is local-only and dangerous routes are guarded by token middleware.
  - Hardware bringup is blocked by default in software-only mode.
  - Jog commands have single-step, cumulative, duration, interval, velocity, and acceleration limits.
  - Jog stop/timeout requests a mockable servo stop path.
  - `robo_ctrl` validates motion percentages and requests `StopMotion` on motion-done timeout.
  - Affected packages `competition_console_api` and `robo_ctrl` build successfully.
- Wave 2 test/CI evidence:
  - Top-level pytest now has real tests under `tests/unit` and `tests/integration`.
  - `competition_console_api` has package-local pytest registered with `colcon test`.
  - `scripts/ci/software_check.sh` passed end-to-end, including frontend build and Playwright mock smoke.
  - README coverage passes after adding `competition_rviz_tools/README.md`.
- Wave 3 configuration evidence:
  - Added unified profile at `config/profiles/competition_default.yaml`.
  - `competition_core.launch.py --show-args` confirms profile defaults for detector path, base transforms, robot ports, and gripper ports.
  - Runtime code no longer uses `configs` compatibility alias for grasp workspace profile.
- Wave 4 task contract evidence:
  - Added a testable `task_contract.py` for allowed competition tasks and deterministic scene object ranking.
  - `dualarm_task_manager` rejects unknown/duplicate/empty task orders and records config/start gate/object selection evidence in checkpoints.
  - Direct `RunCompetition` goals no longer satisfy `WAIT_START`; `competition_start_gate` is the authorized path after external/mock/dev start conditions.
  - `execution_adapter` no longer treats missing objects as release/detach/hold success, and `pour_tilt` requires fill/spill evidence.
  - `scripts/ci/software_check.sh` now covers Wave 4 package build and task manager colcon pytest.
- Wave 5 module split evidence:
  - Extracted focused helpers for console process state, execution primitive evidence, robo_ctrl safety validation, and frontend API transport.
  - Preserved original node executable, launch, service, and action names.
  - Added helper tests and static integration assertions for split modules.
  - Full `scripts/ci/software_check.sh` passed after the split.
- Wave 6 documentation and hygiene evidence:
  - Root README now covers project goal, inputs, outputs, mock startup, config, tests, structure, and FAQ.
  - Added runtime architecture, safety runbook, API interface contract, and model/vendor manifest docs.
  - Updated control package README files to remove stale ROS/path/serial guidance.
  - `.gitignore` now blocks future model run, backup, and temporary artifact churn.
  - Final local `scripts/ci/software_check.sh` and `colcon test-result --all` passed.

2026-04-15 baseline:
- Current branch `test` is clean.
- `./build_workspace.sh` passed with 24 packages.
- P0 blockers confirmed by static inspection: placeholder dual-arm MoveIt, fake planner, placeholder task states, ROI ball/basket perception, topic-only planning_scene_sync.

2026-04-16 repo reorg findings:
- 当前唯一源码事实来源为隔离 worktree 中的 `packages/` 主根；`src` 和 `third_party` 只保留兼容符号链接。
- 官方约定已核对：根 README 负责导航、包 README 下沉接口说明、生成物与归档目录不作为源码事实来源。
- 旧仓审计来源确认位于 `/home/gwh/dualarms_ws/src/FairinoDualArm`，当前主仓所需活跃内容已映射到新结构，本轮不再整仓复制旧代码。
- 当前 clean 基线下未发现 `software.backup_*`，`vendor/fairino_sdk` 暂保留原样，并通过 manifest 记录后续迁出规则。
