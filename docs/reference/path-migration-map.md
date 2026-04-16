# 路径迁移映射表

创建时间：2026-04-16

## 仓库主根

| 旧路径/旧约定 | 新路径/新约定 | 状态 | 说明 |
| --- | --- | --- | --- |
| `src/` | `packages/` | 兼容中 | `src -> packages` 为兼容别名，正式构建使用 `packages/` |
| `third_party/fairino_sdk` | `vendor/fairino_sdk` | 兼容中 | `third_party -> vendor` 兼容别名保留 |
| `docs/runbooks` | `docs/operations/runbooks` | 兼容中 | 旧目录通过符号链接兼容 |
| `docs/migration` | `docs/archive/migration` | 兼容中 | 旧目录通过符号链接兼容 |
| `arm_planner/` | `archive/legacy/arm_planner` | 兼容中 | 根目录保留兼容别名 |

## 领域迁移

| 旧目录 | 新目录 |
| --- | --- |
| `src/bringup/*` | `packages/bringup/*` |
| `src/compat/*` | `packages/compat/*` |
| `src/control/*` | `packages/control/*` |
| `src/interfaces/*` | `packages/interfaces/*` |
| `src/ops/*` | `packages/ops/*` |
| `src/perception/*` | `packages/perception/*` |
| `src/planning/*` | `packages/planning/*` |
| `src/tasks/*` | `packages/tasks/*` |
| `src/tools/*` | `packages/tools/*` |
| `src/transforms/*` | `packages/transforms/*` |

## 外部历史路径

| 历史路径 | 当前策略 | 说明 |
| --- | --- | --- |
| `/home/gwh/dualarms_ws/src/FairinoDualArm` | 仅作 legacy 审计来源 | 旧仓内容已按清单映射，不再作为主事实来源 |
| `/home/gwh/dashgo_rl_project/workspaces/dual-arm-shared` | 并入 `docs/process/parallel-windows/` 与 `.codex/runtime/shared/` | clean 基线中未纳入主仓，后续只保留兼容说明 |
| `/home/gwh/dashgo_rl_project/workspaces/dual-arm` | 阶段二兼容入口 | 最终主目录目标为 `/home/gwh/dual-arm` |

## 构建与命令

- 正式构建：`colcon build --base-paths packages`
- 兼容期旧认知：`src` 仍可被旧脚本感知，但不再写进主文档
- 路径解析层：
  - Shell：`scripts/lib/paths.sh`
  - Python：`packages/tools/tools/scripts/dual_arm_paths.py`

## 相关链接

- `repo-map.md`
- `../../archive/legacy-import-manifest.md`
