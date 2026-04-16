#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/scripts/lib/paths.sh"
dual_arm_export_paths "${SCRIPT_DIR}"

BUILD_GROUP_HELPER="${DUAL_ARM_REPO_ROOT}/scripts/lib/build_groups.py"
BUILD_GROUP_CONFIG="${DUAL_ARM_REPO_ROOT}/config/system/build_groups.yaml"

usage() {
  cat <<'EOF'
用法：
  ./build_workspace.sh [--group <name>] [--list-groups] [其他 colcon 参数]

示例：
  ./build_workspace.sh
  ./build_workspace.sh --list-groups
  ./build_workspace.sh --group perception
  ./build_workspace.sh --group interfaces,planning --symlink-install
EOF
}

set +u
source /opt/ros/humble/setup.bash
set -u

export Python3_EXECUTABLE=/usr/bin/python3
export PYTHON_EXECUTABLE=/usr/bin/python3

declare -a requested_groups=()
declare -a colcon_args=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --group)
      shift
      if [[ $# -eq 0 ]]; then
        echo "--group 需要一个分组名。" >&2
        exit 1
      fi
      IFS=',/' read -r -a split_groups <<< "$1"
      for group_name in "${split_groups[@]}"; do
        if [[ -n "${group_name}" ]]; then
          requested_groups+=("${group_name}")
        fi
      done
      ;;
    --list-groups)
      /usr/bin/python3 "${BUILD_GROUP_HELPER}" --config "${BUILD_GROUP_CONFIG}" --list
      exit 0
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      colcon_args+=("$1")
      ;;
  esac
  shift
done

declare -A seen_packages=()
declare -a target_packages=()
build_full_workspace=0

for group_name in "${requested_groups[@]}"; do
  if [[ "${group_name}" == "full" ]]; then
    build_full_workspace=1
    continue
  fi

  while IFS= read -r package_name; do
    [[ -n "${package_name}" ]] || continue
    if [[ -z "${seen_packages[${package_name}]:-}" ]]; then
      seen_packages["${package_name}"]=1
      target_packages+=("${package_name}")
    fi
  done < <(
    /usr/bin/python3 "${BUILD_GROUP_HELPER}" \
      --config "${BUILD_GROUP_CONFIG}" \
      --group "${group_name}"
  )
done

declare -a cmd=(
  colcon build
  --base-paths "${DUAL_ARM_PACKAGES_ROOT}"
  --cmake-args
  -DPython3_EXECUTABLE=/usr/bin/python3
  -DPYTHON_EXECUTABLE=/usr/bin/python3
)

if [[ "${build_full_workspace}" -eq 0 && "${#target_packages[@]}" -gt 0 ]]; then
  cmd+=(--packages-up-to "${target_packages[@]}")
fi

if [[ "${#colcon_args[@]}" -gt 0 ]]; then
  cmd+=("${colcon_args[@]}")
fi

echo "DUAL_ARM_REPO_ROOT=${DUAL_ARM_REPO_ROOT}"
if [[ "${build_full_workspace}" -eq 1 || "${#requested_groups[@]}" -eq 0 ]]; then
  echo "构建模式: full"
else
  echo "构建分组: ${requested_groups[*]}"
  echo "涉及包: ${target_packages[*]}"
fi

"${cmd[@]}"
