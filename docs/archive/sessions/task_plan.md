# Task Plan: dual-arm 一轮完整实现

创建时间：2026-04-16
更新时间：2026-04-16

## Goal
在 `/home/gwh/dual-arm` 内完成严格项目制的一轮完整实现，覆盖单工作区统一、断点接续、PlanningScene 真同步、primitive 执行层、纯软件开盖/倒水/人机协作、统一控制网页与正式验收资产。

## Current Phase
Wave 0 - in_progress

## Waves

### Wave 0: 工作区统一与迁移基线
- [~] 建立项目制工件和接续台账
- [ ] 将根目录包迁入 `src/`
- [ ] 将 `arm_planner/src/*` 迁入 `src/planning/*`
- [ ] 清理正式构建入口与路径引用
- **Gate:** `colcon list --base-paths src`

### Wave 1: 断点记录、端点接续、项目工件初始化
- [~] 建立 `latest.json` / `runs/<run_id>.jsonl` schema
- [ ] 扩展 `RunCompetition` 恢复字段
- [ ] 实现 dummy 端点恢复 smoke
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
- [ ] 数组级 `scene_version`
- [ ] authoritative scene
- [ ] lost-but-attached 支持
- **Gate:** planner freshness 合同通过

### Wave 5: PlanningScene 真同步与 octomap/碰撞路径收口
- [ ] `ApplyPlanningScene`
- [ ] world/attached cache
- [ ] collision object / REMOVE 路径
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
