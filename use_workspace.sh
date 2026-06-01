#!/usr/bin/env bash
set -eo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

set +u
source /opt/ros/humble/setup.bash
set -u

# 让系统 Python 和新工作区优先生效，减少 Conda 对 ROS 工具链的干扰。
export PATH="/usr/bin:/bin:${REPO_ROOT}/install/tools/bin:${REPO_ROOT}/install/dualarm/bin:${PATH}"
export Python3_EXECUTABLE=/usr/bin/python3
export PYTHON_EXECUTABLE=/usr/bin/python3

if [[ -f "${REPO_ROOT}/install/setup.bash" ]]; then
  set +u
  source "${REPO_ROOT}/install/setup.bash"
  set -u
fi

exec "${SHELL:-/bin/bash}"
