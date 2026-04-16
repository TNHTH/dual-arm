# W0 Workspace Unification

状态: [x]
创建时间: 2026-04-16
更新时间: 2026-04-16

## Scope

- 将根目录包迁入 `src/`
- 将 `arm_planner/src/*` 迁入 `src/planning/*`
- 清理正式构建入口
- 更新路径文档与 launch 引用

## Acceptance

- `colcon list --base-paths src` 成为唯一正式包清单
- 无正式脚本依赖根目录包路径或 `arm_planner/src/*`
- 旧路径文档已更新或归档

## Evidence

- `./build_workspace.sh` 全量通过，`25 packages finished`
- `colcon list --base-paths src` 当前可列出正式包清单
- 迁移映射文档：
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm/docs/migration/2026-04-16-workspace-unification.md`
- 正式构建入口：
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm/build_workspace.sh`

## Coordination

- 归档状态：bootstrap complete
- 当前共享状态版本：`coord_rev=4`
