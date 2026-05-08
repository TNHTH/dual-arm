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
