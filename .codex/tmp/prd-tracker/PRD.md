# PRD: dual-arm-runtime
generated: 2026-04-16

## Stories

### S-001
description: 单工作区统一，正式包根只保留 `src`
acceptanceCriteria:
  - `colcon list --base-paths src` 可枚举所有正式包
  - 正式 launch 与脚本不再依赖根目录包路径或 `arm_planner/src/*`
passes: true
evidence: "build_workspace.sh 全量通过；W0-workspace-unification.md 已回填证据；迁移文档已建立"
incidentRefs: []

### S-002
description: 建立断点记录与端点接续能力
acceptanceCriteria:
  - 运行态可写入 `latest.json` 与 `runs/<run_id>.jsonl`
  - 支持从已提交端点恢复，不恢复到轨迹中点
passes: true
evidence: "RUN_STATE_SCHEMA/IMPLEMENTATION_BREAKPOINTS/SUBAGENT_REGISTRY 已建立；smoke_resume_checkpoint.py 输出 resume checkpoint smoke passed"
incidentRefs: []

### S-003
description: 左臂固连深度相机成为正式主链
acceptanceCriteria:
  - `world -> left_camera` 与 depth/color frame 连续可查
  - perception 输出 pose 数值与 frame 一致
passes: false
evidence: null
incidentRefs: []

### S-004
description: authoritative scene 与 MoveIt PlanningScene 真同步
acceptanceCriteria:
  - reserve/attach/detach/release/lost 同时影响 managed topic 与 MoveIt 世界模型
  - `scene_version` 合同闭合
passes: false
evidence: null
incidentRefs: []

### S-005
description: primitive 执行层替代关键占位状态
acceptanceCriteria:
  - 执行层支持 `ExecutePrimitive`
  - gripper status 能支撑接触/持物/脱离判断
passes: false
evidence: null
incidentRefs: []

### S-006
description: 纯软件开盖、倒水、人机协作任务闭环
acceptanceCriteria:
  - 水瓶与可乐瓶真实开盖
  - 两类倒水任务过半且无 spill
  - 篮球与足球接球后持稳 3 秒并先脱离再入筐
passes: false
evidence: null
incidentRefs: []

### S-007
description: 统一控制网页成为正式测试与验收入口
acceptanceCriteria:
  - 浏览器可一键启动/停止主链
  - 浏览器可一键运行 smoke、acceptance、整轮任务和断点恢复
  - 网页具备 Playwright E2E
passes: false
evidence: null
incidentRefs: []
