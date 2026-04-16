# PRD: dual-arm-runtime
generated: 2026-04-16

## Stories

### S-001
description: 仓库主根重构为 `packages/`，并保留 `src` 兼容入口
acceptanceCriteria:
  - `colcon list --base-paths packages` 可枚举所有正式包
  - `colcon list --base-paths packages` 与兼容模式 `src` 结果一致
  - 正式 launch 与脚本不再依赖旧工作区绝对路径或旧单层源码布局
passes: true
evidence: "`colcon list --base-paths packages --names-only` 与 `src` 结果一致；`build_workspace.sh --group full` 通过；路径硬编码检查通过"
incidentRefs: []

### S-008
description: README 体系化、路径治理和兼容入口补齐
acceptanceCriteria:
  - 根目录、一级目录、领域目录、缺失 ROS 包和关键非包目录均有 README
  - `scripts/check_readme_coverage.py` 通过
  - `scripts/check_path_hardcodes.py` 通过
  - `build_workspace.sh`、`use_workspace.sh`、`competition_console_api` 已切到 repo-root/path-layer 解析
passes: true
evidence: "README 覆盖检查通过；路径硬编码检查通过；workspace acceptance API 输出包路径均为 packages/...；single_arm_debug launch alias 已补齐"
incidentRefs:
  - 21

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
