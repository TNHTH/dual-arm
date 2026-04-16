#!/usr/bin/env bash
set -euo pipefail

ROOT="/home/gwh/dashgo_rl_project/workspaces/dual-arm"
PARENT="/home/gwh/dashgo_rl_project/workspaces"

declare -A WORKTREES=(
  ["coord/plan-sync"]="${PARENT}/dual-arm-coord"
  ["task/scene-freshness"]="${PARENT}/dual-arm-scene"
  ["task/perception-camera"]="${PARENT}/dual-arm-perception"
  ["task/execution-control"]="${PARENT}/dual-arm-execution"
  ["task/task-orchestration"]="${PARENT}/dual-arm-tasking"
  ["task/behavior-cap-pour"]="${PARENT}/dual-arm-cap-pour"
  ["task/behavior-handover"]="${PARENT}/dual-arm-handover"
  ["task/ops-acceptance"]="${PARENT}/dual-arm-ops"
)

cd "${ROOT}"

for branch in "${!WORKTREES[@]}"; do
  path="${WORKTREES[$branch]}"
  if [ -d "${path}" ]; then
    echo "skip existing worktree: ${path}"
    continue
  fi
  git worktree add "${path}" -b "${branch}" test
done

echo "parallel software worktrees ready"
