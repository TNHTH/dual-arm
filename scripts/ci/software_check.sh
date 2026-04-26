#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

PYTHON_BIN="${PYTHON_BIN:-/usr/bin/python3}"

if ! "$PYTHON_BIN" -m pytest --version >/dev/null 2>&1; then
  echo "pytest is required. Install python3-pytest or provide PYTHON_BIN with pytest available." >&2
  exit 127
fi

python3 scripts/check_path_hardcodes.py
python3 scripts/check_readme_coverage.py

"$PYTHON_BIN" -m pytest -q tests/unit tests/integration

colcon build --base-paths packages --packages-select competition_console_api robo_ctrl
colcon test --base-paths packages --packages-select competition_console_api
colcon test-result --all --verbose

if command -v npm >/dev/null 2>&1 && [ -f packages/ops/competition_console_web/package-lock.json ]; then
  (
    cd packages/ops/competition_console_web
    if [ ! -d node_modules ]; then
      npm ci
    fi
    npm run build
    npx playwright test --reporter=line
  )
else
  echo "npm not available; skipping frontend build and Playwright smoke." >&2
fi
