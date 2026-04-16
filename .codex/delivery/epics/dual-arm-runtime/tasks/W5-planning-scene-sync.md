# W5 PlanningScene Sync

状态: [x]
创建时间: 2026-04-16
更新时间: 2026-04-16

## Scope

- `ApplyPlanningScene` 真同步
- world / attached cache
- collision object ADD / MOVE / REMOVE
- attach existing world object
- detach attached object
- MoveIt PlanningScene 与 managed scene 最终一致性

## Owned Paths

- `src/planning/planning_scene_sync`
- `src/perception/scene_fusion`
- `src/tools/tools/scripts/smoke_planning_scene_sync.py`

## Acceptance

- `smoke_planning_scene_sync.py` 通过
- `GetPlanningScene` 最终 world / attached 均为空
- `/scene_fusion/scene_objects` 最终 `objects: []`
- `/scene/*` service 不在 MoveIt 写入未确认时返回成功

## Evidence

- 启动命令：
  - `ros2 launch dualarm_bringup competition_core.launch.py start_hardware:=false start_detector:=false start_camera_bridge:=false use_mock_camera_stream:=false publish_fake_joint_states:=true`
- Smoke 命令：
  - `/usr/bin/python3 src/tools/tools/scripts/smoke_planning_scene_sync.py`
- 通过输出：
  - `planning_scene_sync smoke passed`
- 状态证据：
  - `GetPlanningScene` 最终 world / attached 均为空
  - `/scene_fusion/scene_objects` 最终 `objects: []`

## Coordination

- 本卡片作为 Wave 4 freshness 与 Wave 6 execution primitive 的回归基线。
- `scene-freshness` 窗口继续修改相关路径前，必须保留并回归本 smoke。
- 若后续修改破坏本 smoke，不能声明 Wave 4 或 Wave 6 完成。
- 当前共享状态版本：`coord_rev=7`
