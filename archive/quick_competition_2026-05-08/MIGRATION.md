# Quick Competition Migration

日期：2026-05-08

## Moved Into Archive

- `packages/quick_competition/` -> `archive/quick_competition_2026-05-08/quick_competition/`
- `config/quick_competition/` -> `archive/quick_competition_2026-05-08/config/quick_competition/`
- `scripts/quick/` -> `archive/quick_competition_2026-05-08/scripts/quick/`
- `tests/unit/test_quick_*.py` -> `archive/quick_competition_2026-05-08/reference_tests/unit/`
- `tests/integration/test_quick_*.py` -> `archive/quick_competition_2026-05-08/reference_tests/integration/`

## Active Replacements

- Object geometry: `config/competition/object_geometry.yaml`
- Pouring thresholds: `config/competition/pouring.yaml`
- Handover thresholds: `config/competition/handover.yaml`
- Camera facts: `config/competition/camera_profiles.yaml`
- Active profile: `config/profiles/competition_default.yaml`
- Runtime authority checker: `scripts/check_runtime_authority.py`

## Safety Notes

- Archived quick code may contain real hardware motion paths and legacy dry-run defaults.
- Archive root contains `COLCON_IGNORE`; do not remove it unless a new ADR explicitly reactivates the package.
- No old quick JSON hardware result is promoted to verified production evidence.
