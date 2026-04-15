# AGENTS.md

## Scope
- This file applies to `/home/gwh/dashgo_rl_project/workspaces/dual-arm`.
- It overrides broader project guidance when there is a conflict.

## Continuation Rules
- Default to Chinese for responses and code comments.
- Before continuing any `dual-arm` implementation task, read `[STATE.md](/home/gwh/dashgo_rl_project/workspaces/dual-arm/STATE.md)` first.
- After finishing each implementation wave, update `STATE.md` in the repo root.
- `STATE.md` must record:
  - current wave and date
  - completed work
  - current blockers and risks
  - verification evidence
  - exact next wave scope
- When resuming in a new session, prefer `STATE.md` as the authoritative handoff summary before scanning the rest of the repo.

## Safety
- Do not delete or rewrite `STATE.md`; only append or refresh it with newer wave summaries.
- Keep debug-only fallbacks clearly marked in `STATE.md`.
