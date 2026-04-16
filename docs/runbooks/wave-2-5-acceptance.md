# Wave 2-5 Acceptance

创建时间：2026-04-16
更新时间：2026-04-16

## Wave 2

### 已通过
- 左臂相机正式包化：
  - `orbbec_gemini_bridge` 已进入正式包清单
- frame 契约 smoke：
  - `smoke_camera_frames.py` 通过
  - 输出：
    - `camera frame smoke passed`
    - `left_camera_color_frame`
    - `left_camera_depth_frame`
    - `left_camera_depth_frame`

### 未收口
- 真实硬件相机链仍需再做一轮非 mock 证据

## Wave 3

### 已落地
- `depth_handler` 默认语义白名单只处理瓶杯
- `ball_basket_pose_estimator` 默认 `use_roi_fallback=false`
- `detector` 默认 class map 已切到 6 类版本

### 未收口
- 还缺一条明确的职责拆分 acceptance：证明瓶杯和球筐分别进入正确 topic

## Wave 4

### 已落地
- `SceneObjectArray.scene_version` 已增加
- `scene_fusion` 已写数组级 `scene_version`
- authoritative scene / world cache / attached cache 已落骨架

### 未收口
- 仍缺 `scene_version` freshness 回归和 authoritative state 保持测试

## Wave 5

### 当前阻塞
- `planning_scene_sync` 当前已比初始阻塞更前进一步：
  - `reserve failed` 不再是稳定主阻塞
  - 当前失败点缩小为 `managed scene did not enter reserved`
- 仍需继续收口 authoritative scene 的稳定发布与 attached object 在 monitored planning scene 中的可见性

## Review Gate

- Wave 0-1 已有正式代码审查文档：
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm/docs/runbooks/wave-0-1-code-review.md`
- Wave 2-5 当前仍需补正式代码审查文档与 findings 关闭状态

## 2026-04-16 追加验收结果

### Wave 5
- 当前状态：通过
- 通过命令：
  - `ros2 launch dualarm_bringup competition_core.launch.py start_hardware:=false start_detector:=false start_camera_bridge:=false use_mock_camera_stream:=false publish_fake_joint_states:=true`
  - `/usr/bin/python3 src/tools/tools/scripts/smoke_planning_scene_sync.py`
- 通过输出：
  - `planning_scene_sync smoke passed`
- 当前覆盖的通过条件：
  - raw scene 进入 managed scene
  - reserve 后 managed scene 进入 `reserved` 且 `reserved_by=smoke`
  - attach 后 managed scene 进入 `attached`
  - `GetPlanningScene` 中 attached 存在且 world 不残留同 id
  - detach / release 后 managed scene 清理
  - 停止 raw publisher 后 `GetPlanningScene` world / attached 最终为空
  - 停止 raw publisher 后 `/scene_fusion/scene_objects` 最终 `objects: []`
- 当前残余风险：
  - `move_group` teardown 时仍可能 segmentation fault，当前不阻塞 Wave 5 happy path 功能验收
