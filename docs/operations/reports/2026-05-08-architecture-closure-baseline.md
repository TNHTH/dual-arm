# 2026-05-08 Architecture Closure Baseline

## Scope

本报告记录 production runtime authority closure 开始前的软件基线。它只证明当时软件检查通过，不证明真机安全、真机可用或比赛任务成功。

## Working Tree Note

开始前仓库已有未提交改动，主要涉及：

- `STATE.md`
- `.codex/tmp/resume/IMPLEMENTATION_BREAKPOINTS.md`
- `.codex/tmp/resume/SUBAGENT_REGISTRY.json`
- `.codex/tmp/error-trace/ERROR_TRACE.md`
- `.codex/tmp/continuous-learning/RETRO.md`
- `packages/perception/depth_handler/**`
- `packages/perception/orbbec_gemini_bridge/scripts/orbbec_gemini_ros_bridge.py`
- `packages/tools/tools/CMakeLists.txt`
- `packages/tools/tools/scripts/cap_depth_alignment_probe.py`
- `docs/operations/reports/2026-05-08-dual-arm-hardware-camera-alignment-log.md`

这些改动按既有现场状态保留，本轮不回滚。

## Commands

```bash
/usr/bin/python3 -m pytest -q tests/unit tests/integration
```

Result:

```text
74 passed in 8.97s
```

```bash
PYTHON_BIN=/usr/bin/python3 bash scripts/ci/software_check.sh
```

Result:

```text
路径硬编码检查通过。
README 覆盖检查通过，共检查 62 个目录。
80 passed in 8.95s
Summary: 8 packages finished [1.36s]
Summary: 2 packages finished [0.63s]
Summary: 14 tests, 0 errors, 0 failures, 0 skipped
vite build passed
Playwright: 2 passed
```

## Baseline Interpretation

- 该基线说明迁移前 active workspace 能通过既有软件检查。
- 该基线也暴露了 closure 前风险：`software_check` 仍构建 `quick_competition`，production launch 仍默认启动 raw-capable console API。
- 本报告不能作为硬件动作、安全距离、深度单位、相机外参、`motion_done` 或 gripper status 的现场证据。
