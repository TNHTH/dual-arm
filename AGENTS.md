# AGENTS.md

## Scope
- This file applies to `/home/gwh/dashgo_rl_project/workspaces/dual-arm`.
- It overrides broader project guidance when there is a conflict.

## Continuation Rules
- Default to Chinese for responses and code comments.
- Before continuing any `dual-arm` implementation task, read `[STATE.md](/home/gwh/dashgo_rl_project/workspaces/dual-arm/STATE.md)` first.
- Before continuing any multi-wave implementation, also read `[engineering-process-standards.md](/home/gwh/dashgo_rl_project/workspaces/dual-arm/docs/runbooks/engineering-process-standards.md)` and `[IMPLEMENTATION_BREAKPOINTS.md](/home/gwh/dashgo_rl_project/workspaces/dual-arm/.codex/tmp/resume/IMPLEMENTATION_BREAKPOINTS.md)`.
- After finishing each implementation wave, update `STATE.md` in the repo root.
- For this `dual-arm` project, new generated project documents, explanations, notes, runbooks, and long-term records must default to `/home/gwh/文档/Obsidian Vault/03_项目记录/FairinoDualArm/` unless the user explicitly chooses a different destination.
- Do not place newly generated `dual-arm` project files under unrelated project folders such as `DashGo`.
- `STATE.md` must record:
  - current wave and date
  - completed work
  - current blockers and risks
  - verification evidence
  - exact next wave scope
- When resuming in a new session, prefer `STATE.md` as the authoritative handoff summary before scanning the rest of the repo.
- When resuming Wave-based work, use `.codex/tmp/resume/SUBAGENT_REGISTRY.json` to preserve the subagent role model; do not restart broad read-through work unless the registry or checkpoint is missing.

## Project Process Standards
- Treat `[engineering-process-standards.md](/home/gwh/dashgo_rl_project/workspaces/dual-arm/docs/runbooks/engineering-process-standards.md)` as the mandatory process contract for this project.
- Every wave must pass these gates before it can be considered complete:
  1. `Spec Gate`
  2. `Design Gate`
  3. `Build Gate`
  4. `Runtime Gate`
  5. `Review Gate`
  6. `Acceptance Gate`
  7. `Checkpoint Gate`
- A feature or wave is not complete just because interfaces exist or code compiles. Completion requires runtime evidence, acceptance output, and review status.
- `passes: true` in PRD/task tracking must include concrete evidence such as command output, log excerpts, screenshots, checkpoint content, or service/action results.
- P0/P1 findings from code review or subagent review block wave completion until closed or explicitly downgraded with evidence.
- New web-console buttons must call a real API or be explicitly disabled; Playwright coverage must include at least one real API-backed user action.
- Subagent recommendations are review inputs, not completion evidence. Completion still requires local verification.

## Safety
- Do not delete or rewrite `STATE.md`; only append or refresh it with newer wave summaries.
- Keep debug-only fallbacks clearly marked in `STATE.md`.

## Anti-Regression Rules
- Before validating planner or launch behavior, kill all existing `ros2 launch`, `move_group`, `fairino_dualarm_planner`, and mock feeder processes to avoid stale graph pollution.
- Before any runtime smoke, run a process check for stale `ros2 launch`, `move_group`, `fairino_dualarm_planner`, `competition_console_api`, `planning_scene_sync`, and mock feeders.
- After removing or replacing an installed executable or script, rebuild the affected package and verify the install tree no longer contains the old artifact before trusting runtime tests.
- For ROS Python nodes and helper scripts, prefer `/usr/bin/python3` or an equivalent environment that is known to match ROS Humble; do not trust the shell-default `python3` when Conda may be active.
- Treat `raw` scene topics and `managed` scene topics as different contracts; planner/task validation must use the managed scene path, not the raw scene publisher directly.
- When a subagent fails with platform/tooling errors such as `502`, immediately fall back to a smaller-scope subagent or local review; do not silently skip the missing review/verification role.
- Before trusting any planner verification result, confirm there is only one live `/fairino_dualarm_planner` node and that the install tree does not still contain removed planner scripts.
- Use a continuous mock feeder with current timestamps for freshness-gated planner tests; do not rely on one-shot stale topic publications.
- After changing launch helper functions or include signatures, rebuild the affected package before any launch-based verification.
- After large package directory migrations, clear generated caches with `rm -rf build install log` and run `./build_workspace.sh`; incremental builds are not trustworthy after path moves.
- For `planning_scene_sync` changes, start with minimal MoveIt diffs before full scene flow: world ADD, world MOVE, world REMOVE, attach existing world object, and detach attached object.
- `/scene/*` services must not report success unless the corresponding MoveIt PlanningScene update is confirmed or explicitly documented as a non-MoveIt fallback.
- Do not put conflicting same-id `world REMOVE` and `attached ADD` in the same PlanningScene diff for an existing world object.
- `scene.is_diff=true` and `scene.robot_state.is_diff=true` are the default for live PlanningScene updates.
- Every wave must end with three artifacts updated in this order:
  1. `STATE.md`
  2. `.codex/tmp/error-trace/ERROR_TRACE.md`
  3. `.codex/tmp/continuous-learning/RETRO.md`
- For multi-wave work, every wave must additionally update:
  1. `.codex/tmp/resume/IMPLEMENTATION_BREAKPOINTS.md`
  2. `.codex/tmp/resume/SUBAGENT_REGISTRY.json`
  3. relevant `.codex/delivery/epics/**/tasks/*.md` evidence fields
- Every wave must preserve at least one reproducible smoke test command that proves the wave’s main goal in a clean session.
