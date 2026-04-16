#!/usr/bin/env bash

dual_arm_find_repo_root() {
  local start_dir
  start_dir="${1:-$(pwd)}"
  start_dir="$(cd "${start_dir}" && pwd)"

  while [[ "${start_dir}" != "/" ]]; do
    if [[ -f "${start_dir}/STATE.md" && -d "${start_dir}/packages" ]]; then
      printf '%s\n' "${start_dir}"
      return 0
    fi
    start_dir="$(dirname "${start_dir}")"
  done

  return 1
}

dual_arm_export_paths() {
  local start_dir
  local repo_root

  start_dir="${1:-$(pwd)}"
  repo_root="$(dual_arm_find_repo_root "${start_dir}")" || {
    echo "未找到 dual-arm 仓库根目录，请确认当前路径位于仓库内。" >&2
    return 1
  }

  export DUAL_ARM_REPO_ROOT="${repo_root}"
  export DUAL_ARM_PACKAGES_ROOT="${DUAL_ARM_REPO_ROOT}/packages"
  export DUAL_ARM_COMPAT_SRC_ROOT="${DUAL_ARM_REPO_ROOT}/src"
  export DUAL_ARM_SHARED_ROOT="${DUAL_ARM_SHARED_ROOT:-${DUAL_ARM_REPO_ROOT}/.codex/runtime/shared}"
  export DUAL_ARM_ARCHIVE_ROOT="${DUAL_ARM_ARCHIVE_ROOT:-${HOME}/.cleanup-archive/dual-arm}"

  mkdir -p "${DUAL_ARM_SHARED_ROOT}"
  mkdir -p "${DUAL_ARM_ARCHIVE_ROOT}"
}
