# Legacy Import Manifest

更新时间：2026-04-16

## 审计来源

- 旧仓路径：`/home/gwh/dualarms_ws/src/FairinoDualArm`
- 当前主仓：当前 `dual-arm` 仓库根目录

## 仍在当前运行链中使用

这些旧仓内容已经以新结构映射到主仓中，当前继续生效：

| 旧位置 | 当前位置 | 说明 |
| --- | --- | --- |
| `camera_info_interceptor` | `packages/perception/camera_info_interceptor` | 相机 `camera_info` frame 适配 |
| `depth_handler` | `packages/perception/depth_handler` | 深度处理链 |
| `detector` | `packages/perception/detector` | 检测节点与模型目录 |
| `dualarm` | `packages/compat/dualarm` | 兼容与遗留控制逻辑 |
| `epg50_gripper_ros` | `packages/control/epg50_gripper_ros` | 夹爪驱动 |
| `robo_ctrl` | `packages/control/robo_ctrl` | 机器人控制节点 |
| `tools` | `packages/tools/tools` | 标定、TF 和 smoke 工具 |
| `arm_planner/src/fairino_description` | `packages/planning/descriptions/fairino_description` | 机器人描述 |
| `arm_planner/src/fairino3_v6_moveit2_config` | `packages/planning/moveit/fairino3_v6_moveit2_config` | 单臂 MoveIt 配置 |
| `arm_planner/src/fairino3_v6_planner` | `packages/planning/legacy/fairino3_v6_planner` | legacy 规划器，已标记为 legacy |

## 仅可参考

| 旧位置 | 当前处理 |
| --- | --- |
| `README.md` | 仅作旧仓背景参考，不再作为主入口 |
| `arm_planner/README.md` | 作为 legacy 说明保留在 `archive/legacy/arm_planner/` |
| `tf_node` | 当前主仓已使用 `packages/transforms/tf_node` 作为正式位置 |
| `tools/README_*` | 已吸收为当前主仓工具说明和 README 体系补充材料 |

## 已过时或可归档

| 旧位置 | 当前处理 |
| --- | --- |
| 旧 monolithic `arm_planner/` 目录形态 | 已拆分到 `packages/planning/*`，根目录只保留 legacy 归档 |
| 旧工作区扁平包布局 | 已重构为 `packages/<domain>/<package>` |

## 本轮迁移结果

- 本轮没有整仓并入旧仓代码。
- 当前主仓所需的活跃内容，已在历史工作中完成迁移并在本轮结构重构中重新落位。
- 本轮主要新增的是“路径映射、README 体系和 legacy 清单”，而不是继续复制旧仓代码。

## 相关链接

- `vendor-archive-manifest.md`
- `../docs/reference/path-migration-map.md`
