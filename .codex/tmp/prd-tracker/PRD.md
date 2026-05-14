# PRD Tracker

## 2026-05-08 Production Runtime Authority Closure

### Objective

Production runtime must not bypass `scene_fusion -> /planning/* -> /execution/* -> /competition/run`.

### Acceptance

- Quick is archived outside active `packages/`.
- Production launch does not start raw-capable console API by default.
- Console API does not create raw robot motion clients unless debug mode is explicitly enabled.
- Static checker is part of software CI.
- Camera production profile does not use `/dev/video*` as verified facts.
- Verification evidence is recorded in `STATE.md` and operations reports.

### Evidence

- `docs/operations/reports/2026-05-08-architecture-closure-baseline.md` records the pre-change software baseline and its non-hardware-safety limitation.
- `docs/operations/reports/2026-05-08-production-runtime-authority-closure.md` records closure evidence and explicit non-claims.
- `python3 scripts/check_runtime_authority.py` and `python3 scripts/check_runtime_authority.py --launch-contracts` passed.
- `PYTHON_BIN=/usr/bin/python3 bash scripts/ci/software_check.sh` passed with path/readme/runtime checks, `60 passed`, 8 packages built, 15 colcon tests, web build, and Playwright smoke.

---

## 2026-05-08 Right Arm Observe Remember Grasp Node

### Objective

Implement a staged right-arm single-frame RGB-D memory grasp node that defaults to no-motion observation and only allows execution under explicit safety gates.

### Acceptance

- `observe-only` is the default mode.
- `publish-scene`, `plan-pregrasp`, `execute-pregrasp`, `execute-final`, and dangerous `full` mode exist.
- `full` mode requires an explicit token.
- `coke_can_memory.json` uses `world` frame and includes the required can/table/calibration/debug fields.
- RGB-depth lookup is disabled unless alignment can be proven or explicitly assumed; otherwise manual depth pixel is required.
- PlanningScene publishes fixed table and coke can collision objects.
- Execution requires `DUALARM_HARDWARE_CONFIRM_TOKEN`, operator confirmations, robot ready state, planner/action/gripper status availability, and explicit `Rend_to_pinch_center`.
- Static scan shows no raw right-arm motion endpoints, direct gripper command endpoint, or competition run action in the new node.
- Affected packages build.

### Evidence

- `docs/operations/reports/2026-05-08-right-arm-observe-remember-grasp-node.md`
- `docs/plans/2026-05-08-right-arm-observe-remember-grasp-design.md`
- `/usr/bin/python3 -m py_compile packages/tools/tools/scripts/observe_remember_grasp_node.py packages/planning/planning_scene_sync/scripts/planning_scene_sync_node.py`
- `rg -n '/R/robot_move|/R/robot_servo|epg50_gripper/command|/competition/run' packages/tools/tools/scripts/observe_remember_grasp_node.py` produced no matches.
- `colcon build --base-paths packages --packages-select tools planning_scene_sync` finished 2 packages.

### Live Hardware Evidence 2026-05-08

- `one-shot-live` was executed on real right-arm hardware with token `TOKEN`.
- It completed runtime table-corrected perception, depth-only segmentation, memory generation, scene publication, and real pregrasp execution.
- Recovery execution completed real `grasp` trajectory and real gripper close.
- Acceptance remains failed for final grasp success: final `gobj=3`, `lift_executed=false`.
- Evidence:
  - `docs/operations/reports/2026-05-08-right-arm-one-shot-live-real-test.md`
  - `.codex/tmp/runtime/one-shot-live-real-20260508-r9/report.json`
  - `.codex/tmp/runtime/one-shot-live-real-20260508-r9-execute-final8-grasp-rpy190--10-30/report.json`
