# Workspace Unification

创建时间：2026-04-16
更新时间：2026-04-16

## 结论

当前 `dual-arm` 已从“根目录包 + src + arm_planner/src”混合包根迁移为“仅 `src/` 为正式包根”的结构。

## 迁移映射

- `camera_info_interceptor` -> `src/perception/camera_info_interceptor`
- `depth_handler` -> `src/perception/depth_handler`
- `detector` -> `src/perception/detector`
- `robo_ctrl` -> `src/control/robo_ctrl`
- `epg50_gripper_ros` -> `src/control/epg50_gripper_ros`
- `tools` -> `src/tools/tools`
- `dualarm` -> `src/compat/dualarm`
- `fairino_description` -> `src/planning/descriptions/fairino_description`
- `fairino_dualarm_description` -> `src/planning/descriptions/fairino_dualarm_description`
- `fairino3_v6_moveit2_config` -> `src/planning/moveit/fairino3_v6_moveit2_config`
- `fairino_dualarm_moveit_config` -> `src/planning/moveit/fairino_dualarm_moveit_config`
- `fairino_dualarm_planner` -> `src/planning/planners/fairino_dualarm_planner`
- `fairino3_v6_planner` -> `src/planning/legacy/fairino3_v6_planner`

## 正式规则

- 正式构建入口：`colcon build --base-paths src`
- 正式总装入口：`competition_integrated.launch.py`
- `fairino3_v6_planner` 仅保留历史参考，不参与正式构建

## 后续需要继续清理的内容

- README、STATE、runbook 和历史分析文档中的旧路径引用
- `build/` 与 `install/` 中残留的旧路径缓存
- legacy 文档的归档与失效标记
