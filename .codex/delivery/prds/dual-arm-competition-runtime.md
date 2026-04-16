# PRD: dual-arm-competition-runtime

generated: 2026-04-16

## Summary

将 `workspaces/dual-arm` 收口为单工作区、单主链、单正式入口的双臂比赛交付版，覆盖：

- 工作区统一迁移
- 左臂固连深度相机正式主链
- authoritative scene 与 MoveIt PlanningScene 真同步
- 双臂 primitive 执行层
- 纯软件开盖、倒水、人机接球与入筐
- 断点记录与端点接续
- 统一控制网页与验收入口

## Goals

- 只有 `src/` 作为正式包根
- 只有 `competition_integrated.launch.py` 作为正式总装入口
- 比赛关键状态全部为真实动作或真实判定
- 每个 wave 都有构建、审查、验收、断点更新

## Non-Goals

- 不在本轮引入新硬件
- 不依赖固定开盖工装或固定倒水工位作为主方案
- 不把旧单臂规划链继续当成正式主路径

## Delivery Definition

以下全部满足才算本轮完成：

1. 单工作区统一完成
2. 断点接续可用
3. 感知主链稳定
4. PlanningScene 真同步可用
5. primitive 执行层可用
6. 开盖、倒水、接球、入筐任务闭环可验收
7. 网页控制台可执行测试与验收
8. 文档、日志、证据链完整
