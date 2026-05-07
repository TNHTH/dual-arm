# 2026-05-07 右臂脚本化靠近收口与架构审查 Handoff

完成时间：2026-05-07

## 任务目标
- 收口 2026-05-07 右臂实机脚本化靠近任务，停止继续运动，更新记录，并为下窗口准备“先处理 ClaudeCode 架构审查问题，再接续右臂夹取”的提示词。

## 完成项
- 已完成右臂两段 MoveIt/`execution_adapter` 脚本化 `pregrasp` 靠近和一段视野恢复，均闭环到 `motion_done=true`、`error_code=0`。
- 未执行合爪；右夹爪保持打开，最后 status 为 `position=0`、`gobj=3`、`error=0`。
- 已清理 `ROS_DOMAIN_ID=0` 控制图；`ros2 daemon stop` 后无有效控制节点或关键进程残留。
- 已将 target alignment 默认改成 advisory，并保留显式 hard-gate 参数。
- 已把 ClaudeCode 架构审查写入 `STATE.md`、断点、delivery task 和下窗口提示词。

## 未完成项
- 自动夹取未完成；目标靠近后仍贴图像底边，最新 `bbox_edge_margin_px=0.0`。
- 右相机到右 TCP 外参仍不是 calibration verified。
- ClaudeCode 架构审查指出的主链/Quick/sim 执行路径分裂仍待下窗口处理。

## 证据位置
- 详细报告：`docs/operations/reports/2026-05-07-right-arm-practice-control-log.md`
- 下窗口提示词：`.codex/tmp/resume/NEXT_WINDOW_PROMPT_2026-05-07-right-arm-architecture-and-grasp.md`
- 状态：`STATE.md`
- 错误记录：`.codex/tmp/error-trace/ERROR_TRACE.md` Incident 47-50
- 复盘：`.codex/tmp/continuous-learning/RETRO.md`
- PRD：`.codex/tmp/prd-tracker/PRD.md` S-007 到 S-011

## 关键验证摘要
- `/usr/bin/python3 -m py_compile packages/tools/tools/scripts/right_arm_grasp_precheck.py packages/tools/tools/scripts/right_arm_autonomous_grasp_attempt.py` 通过。
- `git diff --check` 通过。
- `colcon build --base-paths packages --packages-select tools` 通过。
- 最新右臂有效 TCP 约 `[-226.135, -262.203, 236.498, -171.249, 38.941, 37.351] mm/deg`，`motion_done=true`、`error_code=0`。
- 最新预检 artifact：`.codex/tmp/runtime/right-arm-grasp-precheck-after-visual-recover-20260507-162527/right_arm_grasp_precheck.json`。

---

# P1 崩溃风险修复 FINAL SUMMARY

完成时间：2026-05-06

## 任务目标
- 按 P1 批次修复崩溃风险、异常路径、资源生命周期、线程安全和未定义行为；保持 software/mock/no-motion 验证，不做实机运动、夹爪动作或 `/competition/run`。

## 完成项
- `robo_ctrl` Servo catch 返回失败并删除 ServoJ `const_cast`。
- `depth_handler` KDTree 改 atomic byte claim，`depth_processor_node` 改 camera/table immutable snapshot。
- `fairino_dualarm_planner`、`planning_scene_sync`、legacy planner 增加共享状态锁和局部快照。
- `LwDetr` 初始化并检查 CUDA/TensorRT/plugin 资源，按明确顺序释放。
- `competition_console_api` stop 流程锁内交换状态，锁外 wait。
- 新增 `tests/unit/test_p1_crash_contracts.py`。
- 新增 `tests/unit/test_p1_runtime_stress.py`，KDTree、PlanningSceneSync cache、competition_console stop 三项 runtime stress 通过。

## 未完成项
- 未做 TSAN、sanitizer、valgrind；planner scene/robot state、legacy planner、depth_processor 仍缺 stress/TSAN 证据，只能标为“已修改待验证”或“环境阻塞”。
- legacy `fairino3_v6_planner` 因 `COLCON_IGNORE` 未构建。
- 未做 LwDetr CUDA/TensorRT runtime inference、service failure injection、真实硬件验证。

## 证据位置
- 状态总览：`STATE.md`
- 详细报告：`docs/operations/reports/2026-05-06-p1-crash-code-review-repair.md`
- 错误记录：`.codex/tmp/error-trace/ERROR_TRACE.md` Incident 39
- 复盘：`.codex/tmp/continuous-learning/RETRO.md`
- 断点：`.codex/tmp/resume/IMPLEMENTATION_BREAKPOINTS.md`

## 关键验证摘要
- `/usr/bin/python3 -m pytest -q tests/unit/test_p0_safety_contracts.py tests/unit/test_p1_crash_contracts.py`：`13 passed in 0.03s`。
- `/usr/bin/python3 -m pytest -q tests/unit/test_p1_runtime_stress.py`：`3 passed in 9.49s`。
- `/usr/bin/python3 -m pytest -q tests/unit/test_p0_safety_contracts.py tests/unit/test_p1_crash_contracts.py tests/unit/test_p1_runtime_stress.py`：`16 passed in 9.32s`。
- `git diff --check`：通过。
- 核心 P1 活跃包构建通过；legacy planner 因 `COLCON_IGNORE` 未被发现。
- detector 单独构建通过，仅有自定义 TensorRT plugin warning。

---

# quick_competition 快速实机旁路 FINAL SUMMARY

完成时间：2026-05-06

## 任务目标
- 在不破坏正式比赛架构的前提下，新增 `quick_competition` 快速实机旁路，让现场能先按 manual waypoint / 粗标定 / dry-run / 低速硬件检查跑完整粗糙流程。

## 完成项
- 新增 `packages/quick_competition` 包、`config/quick_competition/*.yaml`、quick launch、quick scripts、quick runbooks 和 quick tests。
- 默认 `dry_run=true`、manual scene、left primary depth、`table_frame -> table_frame_corrected` corrected frame。
- 实现 dry-run full sequence、preflight、MoveCart 距离封锁、z ceiling 双检查、payload-aware release、scoreboard、日志导出和 topic/frame 自检入口。
- `competition_integrated.launch.py` 未被改动。

## 未完成项
- 未执行真实硬件运动、夹爪动作或硬件 stop。
- 真实 hardware 模式前仍需现场录制 verified waypoint，并人工确认 `/L/robot_state` / `/R/robot_state` 数值真实。

## 证据位置
- 状态总览：`STATE.md`
- 错误记录：`.codex/tmp/error-trace/ERROR_TRACE.md` Incident 35
- 复盘：`.codex/tmp/continuous-learning/RETRO.md`
- 断点：`.codex/tmp/resume/IMPLEMENTATION_BREAKPOINTS.md`
- Delivery evidence：`.codex/delivery/epics/dual-arm-runtime/tasks/W3-quick-competition-sidepath.md`

## 关键验证摘要
- `/usr/bin/python3 scripts/quick/validate_quick_config.py` 通过。
- `PYTHONPATH=packages/quick_competition /usr/bin/python3 -m pytest -q tests/unit tests/integration`：`42 passed`。
- `./build_workspace.sh --group quick,bringup`：`25 packages finished`。
- `source install/setup.bash && ros2 run quick_competition quick_competition_orchestrator --dry-run --full` 通过。
- `bash scripts/ci/software_check.sh`：`45 passed`，构建、colcon test、前端和 Playwright 均通过。

---

# dual-arm 仓库重构 FINAL SUMMARY

完成时间：2026-04-16

## 任务目标
- 以隔离 worktree 为唯一实现现场，完成 `dual-arm` 仓库主根升级、README 体系化、路径治理、模块化构建、兼容入口保留和归档清单补齐。

## 完成项
- 已将正式源码主根升级为 `packages/`，并保留 `src -> packages` 兼容入口。
- 已将 `third_party/` 收口为 `vendor/`，并补齐 `archive/vendor-archive-manifest.md`。
- 已完成根目录、一级目录、领域目录、关键非包目录和 ROS 包 README 补齐。
- 已新增路径治理与构建治理资产：
  - `scripts/lib/paths.sh`
  - `packages/tools/tools/scripts/dual_arm_paths.py`
  - `config/system/build_groups.yaml`
  - `scripts/lib/build_groups.py`
  - `scripts/check_readme_coverage.py`
  - `scripts/check_path_hardcodes.py`
- 已保留并验证兼容入口：
  - `build_workspace.sh`
  - `use_workspace.sh`
  - `ros2 launch dualarm_bringup competition_integrated.launch.py`
  - `ros2 launch dualarm_bringup single_arm_debug.launch.py`
- 已补齐仓库地图、路径迁移映射、README 维护规范、旧仓导入清单和 vendor 归档清单。
- 已完成 reviewer / verifier 收口，并回填 `STATE.md`、`ERROR_TRACE.md`、`RETRO.md` 和 `SUBAGENT_REGISTRY.json`。

## 未完成项
- 阶段二部署到 `/home/gwh/dual-arm` 需要在推送后执行，并在新位置重新构建 install 树。
- 双臂真实任务样例、`ExecutePrimitive` 实动作闭环、`scene_version` 全链路 freshness 回归仍属于后续功能 wave，不属于本次仓库重构 closeout 范围。

## 证据位置
- 状态总览：`STATE.md`
- 路径治理：`scripts/check_path_hardcodes.py`
- README 覆盖：`scripts/check_readme_coverage.py`
- 目录与路径文档：
  - `docs/reference/repo-map.md`
  - `docs/reference/path-migration-map.md`
  - `docs/development/readme-style-guide.md`
  - `archive/legacy-import-manifest.md`
  - `archive/vendor-archive-manifest.md`

## 关键验证摘要
- `python3 scripts/check_readme_coverage.py` 通过，覆盖 57 个目录。
- `python3 scripts/check_path_hardcodes.py` 通过。
- `colcon list --base-paths packages` 与 `colcon list --base-paths src` 一致，均发现 26 个包。
- `./build_workspace.sh --group interfaces/perception/planning/control/tasks/bringup/ops/full` 均通过。
- `ros2 launch dualarm_bringup competition_integrated.launch.py --show-args` 通过。
- `ros2 launch dualarm_bringup single_arm_debug.launch.py --show-args` 通过。
- `competition_console_api` 的 `/api/acceptance/run/workspace` 返回 `passes=true`。
- reviewer 结论：`no P0/P1 findings`
- verifier 结论：README 覆盖、路径治理、build groups、包发现、launch smoke、workspace acceptance 均通过。

## 相关 Incident
- Incident 14：subagent 502 fallback
- Incident 15：workspace migration build cache
- Incident 16 / 18：competition_console_api shutdown 收口
- Incident 24 / 25 / 26 / 27 / 28：Wave 5 运行态与 build / teardown 收口
- Incident 29：repo reorg closeout / subagent registry hygiene
