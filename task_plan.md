# Task Plan: dual-arm 一轮完整实现

创建时间：2026-04-16
更新时间：2026-04-16

## Goal
在 `/home/gwh/dashgo_rl_project/workspaces/dual-arm` 内完成严格项目制的一轮完整实现，覆盖单工作区统一、断点接续、PlanningScene 真同步、primitive 执行层、纯软件开盖/倒水/人机协作、统一控制网页与正式验收资产。

## Current Phase
Software Parallel Batch A - in_progress

## Parallel Coordination

- 实时共享状态目录固定为 `/home/gwh/dashgo_rl_project/workspaces/dual-arm-shared`
- 并发上限固定为 5，且包含协调窗口
- 只有协调窗口可以写：
  - `task_plan.md`
  - `progress.md`
  - `findings.md`
  - `STATE.md`
  - `.codex/tmp/resume/IMPLEMENTATION_BREAKPOINTS.md`
  - `.codex/tmp/resume/SUBAGENT_REGISTRY.json`
- 各模块窗口只允许修改自己的 `owned_paths` 和自己的窗口状态文件
- 所有窗口都必须反复重读共享文件，不能“只读一次”
- 所有窗口的每个任务都必须滚动使用 subagent，任务完成后关闭，再为下一个任务新开

## Active Windows Now

| Window | Branch | Worktree | Focus |
|------|--------|----------|-------|
| coord | `coord/plan-sync` | `/home/gwh/dashgo_rl_project/workspaces/dual-arm-coord` | 计划、进度、共享状态 |
| scene-freshness | `task/scene-freshness` | `/home/gwh/dashgo_rl_project/workspaces/dual-arm-scene` | Wave 4 + Wave 5 回归 |
| perception-camera | `task/perception-camera` | `/home/gwh/dashgo_rl_project/workspaces/dual-arm-perception` | Wave 2/3 残余 |
| execution-control | `task/execution-control` | `/home/gwh/dashgo_rl_project/workspaces/dual-arm-execution` | Wave 6 |
| task-orchestration | `task/task-orchestration` | `/home/gwh/dashgo_rl_project/workspaces/dual-arm-tasking` | Wave 10 |

## Dormant Windows Now

| Window | Branch | Worktree | Focus |
|------|--------|----------|-------|
| behavior-cap-pour | `task/behavior-cap-pour` | `/home/gwh/dashgo_rl_project/workspaces/dual-arm-cap-pour` | Wave 7/8 |
| behavior-handover | `task/behavior-handover` | `/home/gwh/dashgo_rl_project/workspaces/dual-arm-handover` | Wave 9 |
| ops-acceptance | `task/ops-acceptance` | `/home/gwh/dashgo_rl_project/workspaces/dual-arm-ops` | Wave 11 |

## Rotation Rules

- `coord` 永远占用 1 个并发名额
- 当前 4 个业务活跃窗口固定为：
  - `scene-freshness`
  - `perception-camera`
  - `execution-control`
  - `task-orchestration`
- 待命窗口按以下顺序轮换进入：
  1. `behavior-cap-pour`
  2. `behavior-handover`
  3. `ops-acceptance`
- 只有协调窗口可以决定轮换，并负责同步更新共享状态文件
- 当前共享状态版本：`coord_rev=7`
- 当前轮换决策：已进入可执行状态；协调窗口可在需要时直接执行 `scene-freshness -> ops-acceptance` 的单槽位交换，但 `ops-acceptance` 仍需先补 `coord_rev=7` 同步和新 subagent，再正式进场
- 行为窗口进场门槛：必须先释放或收窄与 `execution-control` / `task-orchestration` 的父子 owned_paths 重叠

## Owned Paths Ledger

| Window | Status | Task Card | Owned Paths |
|------|--------|-----------|-------------|
| coord | active | coordination | `task_plan.md`, `progress.md`, `findings.md`, `STATE.md`, `.codex/tmp/resume/*`, shared coordination files, runtime task cards |
| scene-freshness | active | `W4-scene-version-freshness.md`, `W5-planning-scene-sync.md` | `src/perception/scene_fusion`, `src/planning/planning_scene_sync`, `src/planning/planners/fairino_dualarm_planner`, `src/tools/tools/scripts/smoke_*scene*` |
| perception-camera | active | `W2-3-perception-camera.md` | `src/perception/orbbec_gemini_bridge`, `src/transforms/tf_node`, `src/perception/depth_handler`, `src/perception/ball_basket_pose_estimator`, `src/perception/detector_adapter`, `src/perception/detector` |
| execution-control | active | `W6-execution-control.md` | `src/control/execution_adapter`, `src/bringup/joint_state_aggregator`, `src/interfaces/dualarm_interfaces/action/ExecutePrimitive.action`, `src/interfaces/dualarm_interfaces/srv/SetGripper.srv` |
| task-orchestration | active | `W10-task-orchestration.md` | `src/tasks/dualarm_task_manager`, `src/interfaces/dualarm_interfaces/action/RunCompetition.action`, `.codex/tmp/resume/RUN_STATE_SCHEMA.md` |
| behavior-cap-pour | dormant | `W7-8-cap-pour.md` | `src/tasks/dualarm_task_manager/scripts/behaviors/cap_pour_*`, `src/control/execution_adapter/scripts/primitives/cap_pour_*`, `src/planning/grasp_pose_generator/scripts/cap_pour_*`, `docs/competition/cap-pour*` |
| behavior-handover | dormant | `W9-handover.md` | `src/tasks/dualarm_task_manager/scripts/behaviors/handover_*`, `src/control/execution_adapter/scripts/primitives/handover_*`, `src/planning/grasp_pose_generator/scripts/handover_*`, `docs/competition/handover*` |
| ops-acceptance | dormant | `W11-ops-acceptance.md` | `src/ops/competition_console_api`, `src/ops/competition_console_web`, `docs/runbooks`, `docs/architecture`, `src/tools/tools/scripts/acceptance_*` |

## Waves

### Wave 0: 工作区统一与迁移基线
- [x] 建立项目制工件和接续台账
- [x] 将根目录包迁入 `src/`
- [x] 将 `arm_planner/src/*` 迁入 `src/planning/*`
- [x] 清理正式构建入口与路径引用
- **Gate:** `colcon list --base-paths src`

### Wave 1: 断点记录、端点接续、项目工件初始化
- [x] 建立 `latest.json` / `runs/<run_id>.jsonl` schema
- [x] 扩展 `RunCompetition` 恢复字段
- [x] 实现 dummy 端点恢复 smoke
- **Gate:** 至少一条恢复 smoke 通过

### Wave 2: 左臂相机 frame 契约与正式接入
- [ ] 真实 `left_tcp -> left_camera` 外参
- [ ] 正式 sensor frame 契约
- [ ] Orbbec 桥包化与主链接入
- **Gate:** perception frame 一致性通过

### Wave 3: 感知栈重构与任务对象接受层
- [ ] 6 类检测映射正式启用
- [ ] `depth_handler` / `ball_basket_pose_estimator` 职责拆分
- [ ] detection-driven 球筐 3D
- [ ] 任务对象接受层
- **Gate:** 感知 acceptance 通过

### Wave 4: `scene_version` 合同与 authoritative scene
- [x] 数组级 `scene_version`
- [x] authoritative scene
- [x] lost-but-attached 支持
- **Gate:** planner freshness 合同通过

### Wave 5: PlanningScene 真同步与 octomap/碰撞路径收口
- [x] `ApplyPlanningScene`
- [x] world/attached cache
- [x] collision object / REMOVE 路径
- **Gate:** MoveIt world/attached 一致性通过

### Wave 6: 双臂规划接口升级
- [ ] `PlanDualPose`
- [ ] `PlanDualJoint`
- [ ] 轨迹拆分增强
- **Gate:** 双臂 planning acceptance 通过

### Wave 7: 执行层 primitive 化与同步升级
- [ ] `ExecutePrimitive`
- [ ] 姿态保真
- [ ] step-level dispatch
- [ ] gripper status 闭环
- **Gate:** execution acceptance 通过

### Wave 8: 纯软件开盖任务做真
- [ ] 水瓶真实开盖
- [ ] 可乐瓶真实开盖
- [ ] 失败恢复
- **Gate:** 开盖 acceptance 通过

### Wave 9: 纯软件倒水任务做真
- [ ] 水倒入过半且无 spill
- [ ] 可乐倒入过半且无 spill
- [ ] top-up 和放回
- **Gate:** 倒水 acceptance 通过

### Wave 10: 人机协作任务做真
- [ ] 篮球接球、持稳 3 秒、入筐
- [ ] 足球接球、持稳 3 秒、入筐
- [ ] pre-contact detach
- **Gate:** handover acceptance 通过

### Wave 11: 统一控制网页与测试/验收入口做真
- [ ] console API
- [ ] React 控制网页
- [ ] Playwright E2E
- **Gate:** 网页 acceptance 通过

### Wave 12: 状态机瘦身、恢复场景、验收资产总收口
- [ ] orchestration-only task manager
- [ ] 独立 acceptance runbook
- [ ] 证据导出与复盘
- **Gate:** 全局 acceptance 通过

## Risks
| Risk | Mitigation |
|------|------------|
| 目录迁移打断现有构建与 launch | 先迁移工件与台账，再按波次逐步调整路径；每波有 build gate |
| 当前工作树已有改动，迁移时易冲突 | 坚持最小写集与显式路径迁移，不覆盖无关改动 |
| 纯软件开盖与倒水难度高 | 将 planner / primitive / 验收边界严格拆开，先做基础合同再做动作 |
| 网页控制台容易沦为摆设 | 将网页纳入正式 acceptance 入口，并为网页本身建立测试 |
| 多 worktree 间只读一次共享文件，导致状态漂移 | 强制用外部共享状态目录和 `coord_rev`，每个窗口定期重读 |
| 行为窗口与 orchestration / execution 主文件冲突 | 先建立独立行为模块目录与 owned_paths，行为窗口不碰主文件 |
