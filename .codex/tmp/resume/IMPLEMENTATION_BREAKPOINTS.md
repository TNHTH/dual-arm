# Implementation Breakpoints

更新时间: 2026-04-26

## 2026-04-26 Software Engineering Hardening
- 当前分支：`codex/software-engineering-hardening-20260426`
- 当前波次：Wave 0-6 软件-only 工程化整改
- 软件-only 护栏：`docs/operations/runbooks/software-only-refactor-guard.md`
- 当前基线：
  - 路径硬编码检查通过。
  - README 覆盖检查缺 `packages/ops/competition_rviz_tools/README.md`。
  - `pytest --collect-only tests` 在当前 shell 中失败，原因是 `pytest` 命令不存在。
  - `colcon list --base-paths packages --names-only | sort` 发现 27 个包。
- 下一步入口：
  1. 等待并关闭 Wave 1 安全 reviewer subagent。
  2. Wave 1 无 P0/P1 后提交 `fix: harden software-only safety gates`。
  3. Wave 2 建立软件-only pytest/CI 入口，避免测试继续空跑。
- Wave 1 当前证据：
  - py_compile 通过。
  - `colcon build --base-paths packages --packages-select competition_console_api robo_ctrl` 通过。
  - console API / static server / robo_ctrl_node.cpp 中已无 `0.0.0.0`、`std::cout`、`print(` 匹配。

## 当前波次
- Wave: 0-5
- 状态: in_progress

## 当前目标
- 收口 Wave 5：PlanningScene 真同步运行态 smoke

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

## 2026-04-16 Repo Reorg 断点
- 当前结构重构已经落到隔离 worktree：
  - 正式源码主根：`packages/`
  - 兼容别名：`src -> packages`
  - vendor 收口：`third_party -> vendor`
  - legacy 收口：`arm_planner -> archive/legacy/arm_planner`
- 已新增路径层：
  - Shell：`scripts/lib/paths.sh`
  - Python：`packages/tools/tools/scripts/dual_arm_paths.py`
- 已新增结构治理脚本：
  - `scripts/check_readme_coverage.py`
  - `scripts/check_path_hardcodes.py`
- 已完成验证：
  - README 覆盖通过
  - 路径硬编码检查通过
  - `build_workspace.sh --group full` 通过
  - `competition_integrated.launch.py --show-args` 通过
  - `single_arm_debug.launch.py --show-args` 通过
  - `competition_console_api` 的 workspace acceptance 已切到 `packages/...`
- 如果下次从这里恢复：
  1. 先读 `STATE.md`
  2. 再读 `docs/reference/path-migration-map.md`
  3. 复核 reviewer / verifier 结果
  4. 推送到远程 `test`
  5. 执行阶段二部署到 `/home/gwh/dual-arm`
