#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/scripts/lib/paths.sh"
dual_arm_export_paths "${SCRIPT_DIR}"

set +u
source /opt/ros/humble/setup.bash
set -u

export PATH="/usr/bin:/bin:${DUAL_ARM_REPO_ROOT}/install/tools/bin:${DUAL_ARM_REPO_ROOT}/install/dualarm/bin:${PATH}"
export Python3_EXECUTABLE=/usr/bin/python3
export PYTHON_EXECUTABLE=/usr/bin/python3

if [[ -f "${DUAL_ARM_REPO_ROOT}/install/setup.bash" ]]; then
  set +u
  source "${DUAL_ARM_REPO_ROOT}/install/setup.bash"
  set -u
fi

echo "DUAL_ARM_REPO_ROOT=${DUAL_ARM_REPO_ROOT}"
echo "DUAL_ARM_SHARED_ROOT=${DUAL_ARM_SHARED_ROOT}"
echo "DUAL_ARM_ARCHIVE_ROOT=${DUAL_ARM_ARCHIVE_ROOT}"

exec "${SHELL:-/bin/bash}" "$@"
