# Epic: dual-arm-runtime

状态: 进行中
创建时间: 2026-04-16
更新时间: 2026-05-06

## 目标

将当前混合包根的 `dual-arm` 工作区重构为严格项目制管理的正式比赛运行时。

## 波次

1. Wave 0: 工作区统一与迁移基线
2. Wave 1: 断点记录、端点接续、项目工件初始化
3. Wave 2: 左臂相机 frame 契约与正式接入
4. Wave 3: 感知栈重构与任务对象接受层
5. Wave 4: `scene_version` 合同与 authoritative scene
6. Wave 5: PlanningScene 真同步与 octomap/碰撞路径收口
7. Wave 6: 双臂规划接口升级
8. Wave 7: 执行层 primitive 化与同步升级
9. Wave 8: 纯软件开盖任务做真
10. Wave 9: 纯软件倒水任务做真
11. Wave 10: 人机协作任务做真
12. Wave 11: 统一控制网页与测试/验收入口做真
13. Wave 12: 状态机瘦身、恢复场景、验收资产总收口
14. Quick Sidepath: `quick_competition` 快速实机旁路

## Gate

- Spec Gate
- Design Gate
- Build Gate
- Review Gate
- Acceptance Gate
- Checkpoint Gate

## 2026-05-07 Architecture Review Checkpoint

external review 完整项目审查指出当前 runtime 需要新增一个架构收口波次，优先解决正式主链、Quick 实机旁路和 Gazebo 仿真链三套路径分裂问题。下一窗口应先把该审查拆成可验证 Story，再接续右臂硬件夹取。

优先范围：

- 感知重复：Orbbec bridge、camera matrix。
- 执行重复：Quick motion executor、legacy bridge、pouring primitive、gripper control 与 `execution_adapter` 分裂。
- 配置重复：competition profile、quick profile、safety limits、object geometry。
- launch 重复：三层 competition launch 透传和 quick thin wrapper。
- 实机脚本收口：`right_arm_grasp_precheck.py` / `right_arm_autonomous_grasp_attempt.py` 后续应逐步复用 ROS 感知与执行主链，而不是继续扩大 JSON 串联工具路径。
