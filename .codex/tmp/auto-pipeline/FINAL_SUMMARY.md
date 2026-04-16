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
