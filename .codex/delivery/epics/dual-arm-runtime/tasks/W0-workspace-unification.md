# W0 Workspace Unification

状态: [~]
创建时间: 2026-04-16

## Scope

- 将正式源码主根升级为 `packages/`
- 保留 `src` 兼容入口
- 将 `arm_planner` 收口到 `archive/legacy/arm_planner`
- 清理正式构建入口、路径文档和 README 导航

## Acceptance

- `colcon list --base-paths packages` 成为正式包清单
- `colcon list --base-paths packages` 与兼容 `src` 结果一致
- 无正式脚本依赖旧工作区绝对路径或旧单层源码布局
- README 与路径迁移文档已更新

## Evidence

- `./build_workspace.sh --group full` 通过，`26 packages finished`
- `colcon list --base-paths packages` 当前可列出正式包清单
- `colcon list --base-paths packages` 与 `src` 结果一致
- `python3 scripts/check_readme_coverage.py` 通过
- `python3 scripts/check_path_hardcodes.py` 通过
- 迁移映射文档：
  - `docs/reference/path-migration-map.md`
- 正式构建入口：
  - `build_workspace.sh`
