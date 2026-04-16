# Implementation Breakpoints

更新时间: 2026-04-16

## 当前波次
- Wave: 4-11 software parallel
- 状态: in_progress

## 当前目标
- 维持 Wave 5 回归基线，同时并行推进 Wave 4 / 6 / 7-11 的软件窗口

## 当前断点
- 单工作区迁移已完成，正式包根为 `src/`
- 接口基座已完成：`ExecutePrimitive`、`PlanDualPose`、`PlanDualJoint`、`SceneObjectArray.scene_version`、`RunCompetition` 恢复字段
- 控制台骨架已完成：`competition_console_api`、`competition_console_web`
- 控制台 API 已接入：
  - bringup start/stop
  - acceptance run
  - RunCompetition start
  - latest checkpoint resume
- 控制台前端已将：
  - 启动集成栈
  - 停止集成栈
  - 工作区验收
  - PlanningScene smoke
  - 接续 smoke
  - 网页验收
  - 整轮比赛
  - 从断点恢复
  绑定到真实 API
- 全量构建已通过
- 网页 build 与 Playwright smoke 已通过
- Wave 1 恢复 smoke 已通过：`smoke_resume_checkpoint.py`
- Wave 2 相机 frame smoke 已通过：`smoke_camera_frames.py`
- Wave 3 默认已关闭 ROI fallback，detector 默认已切 `detector_pt_node.py`
- Wave 5 当前阻塞：
  - `smoke_planning_scene_sync.py` 仍未最终通过
  - reviewer 和资料 agent 指出 MoveIt diff 语义问题
  - 已修复：
    - service 假成功
    - attached ADD + world REMOVE 冲突
    - cwd 依赖
    - detector 默认错配
    - ROI fallback 默认开启
    - planning 失败 reservation 泄漏
  - 最新补丁：
    - `planning_scene_sync` 在 service 路径等待 pending apply 完成
    - `planning_scene_sync` 已增加 pending wait 超时日志
- 下一步唯一入口：
  - 启动 core：`ros2 launch dualarm_bringup competition_core.launch.py start_hardware:=false start_detector:=false start_camera_bridge:=false use_mock_camera_stream:=false publish_fake_joint_states:=true`
  - 跑：`/usr/bin/python3 src/tools/tools/scripts/smoke_planning_scene_sync.py 2>&1`
  - 观察 `planning_scene_sync` 日志，优先定位 pending apply 超时还是 MoveIt success=false
- 新增流程规范：
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm/docs/runbooks/engineering-process-standards.md`

## 风险
- 当前还有大量旧文档引用旧路径，需要继续清理或归档
- Wave 5 还没有通过最终验收，不能声明 PlanningScene 收口完成
- primitive / task manager 仍是基座实现，不能作为比赛完成证据
- 网页按钮已接入部分真实 API，但倒水/人机验收和证据包导出仍需继续

## Resume Hint
- 恢复时先读本文件、`SUBAGENT_REGISTRY.json`、`ERROR_TRACE.md` 的 Incident 19，再继续 Wave 5 smoke

## 2026-04-16 最新接续
- Wave 5 已通过：
  - `smoke_planning_scene_sync.py` 当前增强版已通过
  - `GetPlanningScene` 最终 world / attached 均为空
  - `/scene_fusion/scene_objects` 最终 `objects: []`
- 当前最优先目标已切换：
  1. Wave 4：`scene_version` / freshness / authoritative state 保持测试
  2. Wave 6：`ExecutePrimitive` 与 execution_adapter 的真实闭环
- 下一步标准入口：
  - 起 core：`ros2 launch dualarm_bringup competition_core.launch.py start_hardware:=false start_detector:=false start_camera_bridge:=false use_mock_camera_stream:=false publish_fake_joint_states:=true`
  - 回归 Wave 5：`/usr/bin/python3 src/tools/tools/scripts/smoke_planning_scene_sync.py`
  - 然后开始 Wave 4 freshness 专项检查

## 2026-04-16 并行软件窗口初始化
- 当前阶段不做硬件测试窗口，所有并行窗口都只做软件层修改。
- 实时共享状态目录固定为：
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm-shared`
- 已创建的 worktree：
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm-coord`
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm-scene`
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm-perception`
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm-execution`
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm-tasking`
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm-cap-pour`
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm-handover`
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm-ops`
- 已创建的分支：
  - `coord/plan-sync`
  - `task/scene-freshness`
  - `task/perception-camera`
  - `task/execution-control`
  - `task/task-orchestration`
  - `task/behavior-cap-pour`
  - `task/behavior-handover`
  - `task/ops-acceptance`
- 当前活跃窗口仅 5 个：
  - `coord`
  - `scene-freshness`
  - `perception-camera`
  - `execution-control`
  - `task-orchestration`
- 当前待命窗口：
  - `behavior-cap-pour`
  - `behavior-handover`
  - `ops-acceptance`
- 新的必读入口：
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm/docs/runbooks/software-parallel-window-prompts.md`
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm-shared/prompts/software-parallel-window-prompts.md`
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm-shared/coordination/SHARED_STATE.json`
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm-shared/coordination/DECISIONS.md`
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm-shared/windows/*.md`

## 2026-04-16 Coordination Rev 6
- 本轮协调审计已闭环：
  - 共享状态已推进到 `coord_rev=6`
  - 任务卡与共享状态版本漂移已识别并回写
  - 审计 subagent 出现平台态异常，已本地降级并留痕到注册表
- 当前轮换判断：
  1. 第一退出候选：`scene-freshness`
  2. 第一安全候补：`ops-acceptance`
  3. `behavior-cap-pour` / `behavior-handover` 继续 blocked，原因是父级 owned_paths 仍被 active 窗口占用
- 下一步唯一协调入口：
  - 等 `scene-freshness` 交出 merge-ready 与 subagent-close 证据
  - 然后由协调窗口正式执行一次 5 窗口切槽

## 2026-04-16 Coordination Rev 7
- 共享窗口文件动态核对后，`scene-freshness` 的退场前置条件已被证据满足：
  - `status: maintenance-ready`
  - `scene-freshness.agents.json` 为空
  - worktree 仅有最小新增 smoke 脚本
- 当前最稳妥轮换动作已从“排队”提升为“可执行”：
  1. 退出：`scene-freshness`
  2. 进入：`ops-acceptance`
  3. 保持原位：`perception-camera`、`execution-control`、`task-orchestration`
- `ops-acceptance` 当前不是 `ready-to-admit`，而是 `admit-after-sync`。

## 2026-04-16 Final Integration To test
- 已提交并合入 `test` 的业务分支：
  - `task/scene-freshness` (`cf9a3f6`)
  - `task/perception-camera` (`c7db39f`)
  - `task/execution-control` (`c645669`)
  - `task/task-orchestration` (`ea6e8b9`)
- `test` 上的整理与 merge 提交：
  - `524ec6a chore: record coordination and runtime task assets`
  - `5a956b8 merge: integrate scene freshness smoke`
  - `b1f69e1 merge: integrate perception frame contract hardening`
  - `f8ca810 merge: integrate execution primitive boundary`
  - `effc3cd merge: integrate orchestration behavior boundary`
- 最终 Build Gate：
  - 在 clean ROS shell 下 `./build_workspace.sh` 通过
- 当前状态：
  - `test` 可直接进入硬件联调
  - 仅剩辅助 worktree 删除收尾
