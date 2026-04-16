#!/usr/bin/env bash
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "usage: $0 <window-name>" >&2
  exit 2
fi

WINDOW="$1"
PROMPT_FILE="/home/gwh/dashgo_rl_project/workspaces/dual-arm-shared/prompts/${WINDOW}.prompt.md"

if [ ! -f "${PROMPT_FILE}" ]; then
  echo "missing prompt file: ${PROMPT_FILE}" >&2
  exit 3
fi

echo "${PROMPT_FILE}"
