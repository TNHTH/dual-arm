# Wave 0-1 Code Review

创建时间：2026-04-16

## 范围

- 单工作区迁移
- 接口扩展
- `scene_version` 基座
- `planning_scene_sync` MoveIt 写入骨架
- `execution_adapter` primitive 骨架
- `dualarm_task_manager` checkpoint / primitive 接入
- `competition_console_api`
- `competition_console_web`

## 结论

Wave 0-1 基座允许进入下一阶段，但不允许被误判为比赛功能完成。

## 已修复问题

1. `competition_console_api` Ctrl+C 时重复 shutdown。
   - 修复：捕获 `rclpy.shutdown()` 的重复关闭异常。
2. 目录迁移后旧 CMake cache 指向旧路径。
   - 修复：清理 `build/ install/ log/` 后全量重建。
3. `dualarm_task_manager` checkpoint 的 `next_state` 曾错误指向当前完成状态。
   - 修复：提交 checkpoint 时写入下一待执行状态。
4. `depth_handler` launch 使用旧参数名 `bbox2d_topic`。
   - 修复：改为节点真实参数 `detection_topic`。

## 仍需后续波次关闭的高风险

1. `ExecutePrimitive` 当前是可运行骨架，真实 cap/pour/hold/release 动作还需继续深化。
2. `planning_scene_sync` 已有 `ApplyPlanningScene` client，但还缺真实 MoveIt world/attached smoke 证据。
3. `PlanDualPose/PlanDualJoint` 已接入服务，但还缺真实双臂样例验收。
4. 控制网页按钮当前仍是 UI 壳层，下一波必须绑定 API 和 ROS action/service。
5. 旧文档中仍有部分旧路径引用，需要继续归档或更新。

## Gate

- Build Gate: 通过
- Interface Gate: 通过
- Web Build Gate: 通过
- Web Smoke Gate: 通过
- Runtime API Smoke Gate: 通过
- Acceptance Gate: Wave 0-1 基座通过；比赛动作不在本 Gate 宣称完成
