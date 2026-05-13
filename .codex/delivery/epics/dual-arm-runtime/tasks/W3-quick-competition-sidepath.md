# W3 quick_competition 快速实机旁路

状态：completed_software_only
更新时间：2026-05-06

## Scope

新增 quick_competition 旁路，用于明天现场粗糙完整跑通流程。该任务不声明完成真实水位检测、洒漏检测、右相机修复、复杂 MoveIt 智能规划或自主开瓶盖。

## Completed

- 新增 `packages/quick_competition` ament_python 包。
- 新增 `config/quick_competition/*.yaml`。
- 新增 `dualarm_bringup/launch/quick_competition.launch.py`。
- 新增 `scripts/quick/*` 与 quick runbook。
- quick motion safety 覆盖 MoveCart 距离封锁、z ceiling、payload-aware release、manual offset corrected frame、hardware waypoint preflight。
- quick dry-run full sequence 可从 install 环境运行。

## Evidence

- `/usr/bin/python3 scripts/quick/validate_quick_config.py`：8 个 quick config loaded。
- `PYTHONPATH=packages/quick_competition /usr/bin/python3 -m pytest -q tests/unit tests/integration`：`42 passed`。
- `./build_workspace.sh --group quick,bringup`：`25 packages finished`。
- `source install/setup.bash && ros2 launch dualarm_bringup quick_competition.launch.py --show-args`：通过。
- `source install/setup.bash && timeout 5s ros2 launch dualarm_bringup quick_competition.launch.py dry_run:=true`：基础节点启动，timeout 为预期。
- `source install/setup.bash && ros2 run quick_competition quick_competition_orchestrator --dry-run --full`：preflight、pouring、ball cage、log exported。
- `bash scripts/ci/software_check.sh`：`45 passed`、7 包构建、2 包 colcon test、前端 build、Playwright `2 passed`。
- 2026-05-06 P0 追加：`stop_all()` hardware 缺通用 `StopMotion/abort` 路径时 fail-closed 返回失败并拒绝后续软件运动/夹爪动作；`/usr/bin/python3 -m pytest -q tests/unit/test_p0_safety_contracts.py` -> `5 passed in 0.01s`。

## Residual Risk

- 未执行真实机械臂运动或夹爪动作。
- hardware 模式必须先现场录制 verified waypoint，并人工确认 `/L/robot_state`、`/R/robot_state` 数值真实。
- quick v1 的 IK preflight 是静态合同和 workspace 检查，不替代完整规划器。
- `stop_all()` 当前仍缺通用 `StopMotion/abort` 服务能力；hardware 路径按设计 fail-closed，不声明实机停止链路通过。

## 2026-05-07 Architecture Review Update

external review 完整项目审查指出 Quick Sidepath 已从“临时保底旁路”演变成与正式主链并列的第二套执行路径，造成以下交付风险：

- `quick_motion_executor.py` 与 `execution_adapter_node.py` 分裂，运动安全、平滑和错误闭环无法统一复用。
- `legacy_fairino_bridge.py` 直连硬件路径与正式 `robo_ctrl`/EPG50 service 路径分裂，stop/error 语义不一致。
- `quick_pouring_primitives.py` 与 `execution_adapter` 内 primitive 分裂。
- `config/quick_competition/*` 与 `config/profiles`、`config/control`、`config/competition` 配置 schema 分裂。
- `scripts/quick/*.py` 只是 thin wrapper，应逐步被 `ros2 run quick_competition <entry_point>` 或 console_scripts 取代。

下一波处理原则：

- 不再扩大 Quick 的独立 hardware 逻辑。
- 先把 Quick 降级为 profile/entry point，逐步复用 `execution_adapter` backend。
- 删除或归档 thin wrapper 前必须先 `rg` 引用并保留替代命令。
- 架构清理阶段不得触发真实机械臂运动；硬件夹取需等清理验证后重新 bringup。

## 2026-05-08 Closure Update

状态：archived_reference_only

Quick sidepath 已退出 active workspace：

- `packages/quick_competition/` -> `archive/quick_competition_2026-05-08/quick_competition/`
- `config/quick_competition/` -> `archive/quick_competition_2026-05-08/config/quick_competition/`
- `scripts/quick/` -> `archive/quick_competition_2026-05-08/scripts/quick/`
- quick unit/integration tests -> `archive/quick_competition_2026-05-08/reference_tests/`
- `archive/quick_competition_2026-05-08/COLCON_IGNORE` prevents active colcon discovery.

New production authority is `scene_fusion -> /planning/* -> /execution/* -> /competition/run`; Quick is reference-only.

Evidence:

- `python3 scripts/check_runtime_authority.py` -> passed before final verification wave.
- `config/system/build_groups.yaml` no longer lists `quick_competition`.
- `scripts/ci/software_check.sh` no longer builds `quick_competition`.
