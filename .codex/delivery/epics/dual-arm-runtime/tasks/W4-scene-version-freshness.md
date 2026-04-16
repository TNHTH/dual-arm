# W4 Scene Version Freshness

状态: [x]
创建时间: 2026-04-16
更新时间: 2026-04-16

## Scope

- `scene_version` 单调递增
- 空场景不回零
- `header.stamp` 与 freshness gate 一致
- planner / task manager 对 freshness 的消费闭环
- `lost_but_reserved` / `lost_but_attached` smoke

## Owned Paths

- `src/perception/scene_fusion`
- `src/planning/planning_scene_sync`
- `src/planning/planners/fairino_dualarm_planner`
- `src/tools/tools/scripts/smoke_*scene*`

## Acceptance

- 空场景和有物场景都单调递增
- planner 对新鲜 scene 不误报 `scene_stale`
- stale scene 能稳定报 `scene_stale`
- lost-but-* 路径有 smoke 证据

## Coordination

- 保留 `smoke_planning_scene_sync.py` 为 Wave 5 基线回归
- 每个 smoke/检查完成后都要回写窗口状态文件
- 当前活跃窗口：`scene-freshness`
- 当前共享状态版本：`coord_rev=7`
- 当前下一步：已进入 maintenance-ready；W5 基线已复验，当前任务 subagent 已关闭，等待协调窗口安排 merge/退出

## Evidence

- Build Gate:
  - `./build_workspace.sh`
  - 结果：`Summary: 26 packages finished [44.1s]`
- Runtime Gate / Wave 5 baseline:
  - `source /opt/ros/humble/setup.bash && source install/setup.bash && /usr/bin/python3 src/tools/tools/scripts/smoke_planning_scene_sync.py`
  - 结果：`planning_scene_sync smoke passed`
- Runtime Gate / Wave 4 freshness:
  - `source /opt/ros/humble/setup.bash && source install/setup.bash && /usr/bin/python3 src/tools/tools/scripts/smoke_scene_freshness.py`
  - 结果：`scene freshness smoke passed`
- Runtime Gate / `coord_rev=6` final review:
  - `source /opt/ros/humble/setup.bash && source install/setup.bash && /usr/bin/python3 src/tools/tools/scripts/smoke_scene_freshness.py`
  - 结果：`scene freshness smoke passed`
  - `source /opt/ros/humble/setup.bash && source install/setup.bash && /usr/bin/python3 src/tools/tools/scripts/smoke_planning_scene_sync.py`
  - 结果：`planning_scene_sync smoke passed`
- Review Gate:
  - `freshness_final_review_retry` subagent 结论：未发现生产节点 P0。
  - subagent 提出的两个 P1 交接问题已处理：post-patch smoke 已闭环，`src/tools/tools/scripts/smoke_scene_freshness.py` 已列入 merge handoff 变更路径。
- Merge Handoff:
  - 必须随本窗口一起纳入的新增 smoke：`src/tools/tools/scripts/smoke_scene_freshness.py`
  - 已执行 `git add -N src/tools/tools/scripts/smoke_scene_freshness.py`，该新增 smoke 在 `git status` 中以 intent-to-add 形式进入交接视图。

## Frozen Boundary

- `scene_fusion` 空场景心跳是 authoritative raw 边界：
  - `/scene_fusion/raw_scene_objects` 在空场景下持续发布，`scene_version` 单调递增且不回零。
- `planning_scene_sync` 的 managed 边界以自身版本和当前时间戳为准：
  - `/scene_fusion/scene_objects` 会重写 `header.stamp` 和数组/对象级 `scene_version`。
  - 运行 smoke 前必须先清理残留 `freshness_bottle` 之类 retained object，否则“空 managed 场景”判断会被历史状态污染。
- freshness gate 冻结为 planner 消费 managed scene 的 `header.stamp`：
  - stale override 时返回 `result_code=scene_stale` 且 `failure_stage=scene`
  - fresh override 时不再落入 `failure_stage=scene`
- `lost_but_reserved` / `lost_but_attached` 是支持边界的一部分：
  - 停止对象输入但持续发送空 raw 心跳后，这两个 lifecycle_state 都必须可复现。
