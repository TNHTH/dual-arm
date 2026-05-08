#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
cd "${REPO_ROOT}"

echo "[STEP] 检查 /L /R 分臂接口是否存在"
ros2 topic list | grep -E "^/L|^/R"

echo "[STEP] 检查 robot_state 频率；这只能证明有消息，不能证明数值正确"
timeout 5s ros2 topic hz /L/robot_state || true
timeout 5s ros2 topic hz /R/robot_state || true

echo "[STEP] 读取一次 robot_state。请人工确认关节角和 TCP 与目测姿态一致。"
ros2 topic echo /L/robot_state --once
ros2 topic echo /R/robot_state --once

echo "[STEP] quick depth/frame 自检"
ros2 run quick_competition quick_depth_source_manager --check
ros2 run quick_competition quick_preflight_check --print-frames

echo "[OK] hardware smoke no-motion checks completed"
