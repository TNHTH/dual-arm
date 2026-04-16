#!/usr/bin/env bash
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "usage: $0 <window-name>" >&2
  exit 2
fi

WINDOW="$1"
SHARED_ROOT="/home/gwh/dashgo_rl_project/workspaces/dual-arm-shared"
STATE_FILE="${SHARED_ROOT}/windows/${WINDOW}.md"
COORD_FILE="${SHARED_ROOT}/coordination/SHARED_STATE.json"

if [ ! -f "${STATE_FILE}" ]; then
  echo "missing window state: ${STATE_FILE}" >&2
  exit 3
fi

if [ ! -f "${COORD_FILE}" ]; then
  echo "missing coordination state: ${COORD_FILE}" >&2
  exit 4
fi

coord_rev="$(python3 - <<'PY' "${COORD_FILE}"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    print(json.load(f)["coord_rev"])
PY
)"

window_rev="$(grep -E '^- last_shared_sync_rev:' "${STATE_FILE}" | awk '{print $3}')"
status="$(grep -E '^- status:' "${STATE_FILE}" | awk '{print $3}')"

echo "window=${WINDOW}"
echo "status=${status}"
echo "window_rev=${window_rev}"
echo "coord_rev=${coord_rev}"

if [ "${window_rev}" != "${coord_rev}" ]; then
  echo "OUT_OF_SYNC"
  exit 1
fi

echo "IN_SYNC"
