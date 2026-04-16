# Run State Schema

更新时间: 2026-04-16

## latest.json

```json
{
  "run_id": "string",
  "checkpoint_id": "string",
  "checkpoint_schema_version": 2,
  "task_sequence": "string",
  "effective_requested_order": "string",
  "state_sequence_digest": "string",
  "behavior_contract_version": 1,
  "completed_states": ["string"],
  "next_state": "string",
  "next_state_owner": "orchestration | behavior:handover | behavior:cap_pour | terminal",
  "next_behavior_group": "string",
  "scene_version": 0,
  "assignments": {},
  "reserved_objects": [
    { "id": "string", "reserved_by": "string" }
  ],
  "attached_objects": [],
  "gripper_snapshot": {
    "captured": false,
    "reason": "string"
  },
  "robot_state_stamps": {
    "captured": false,
    "reason": "string"
  },
  "last_plan_digest": "string",
  "last_behavior_call": {
    "state": "string",
    "behavior_group": "string",
    "primitive_id": "string",
    "object_id": "string",
    "reference_object_id": "string",
    "arm_group": "string",
    "secondary_arm_group": "string",
    "primary_waypoint_count": 0,
    "secondary_waypoint_count": 0,
    "execution_profile": "string",
    "hold_duration_s": 0.0,
    "synchronized": false
  },
  "pending_transition": null,
  "resume_hint": ""
}
```

### 字段语义

- `effective_requested_order`
  - 归一化后的实际状态序列输入；当 `requested_order` 与 checkpoint 中的 `task_sequence` 冲突且 `allow_reconcile=true` 时，应记录最终采用的值。
- `state_sequence_digest`
  - 当前状态序列的稳定摘要；用于判断恢复点是否仍对应同一版 orchestration 边界。
- `behavior_contract_version`
  - orchestration 与行为调用边界的冻结版本号；当主文件只保留行为调用壳层并更新行为契约时递增。
- `next_state_owner`
  - 明确下一状态归 orchestration 还是行为模块所有，避免协调窗口只能靠状态名猜边界。
- `gripper_snapshot` / `robot_state_stamps`
  - 即使当前 task manager 没有订阅相关话题，也必须写出显式空值语义，不能再用无说明的空对象。
- `last_behavior_call`
  - 最近一次行为壳层调用的摘要，不记录 waypoint 内容本身，只记录可恢复/可审计的边界元数据。

## runs/<run_id>.jsonl

每行一个 JSON event，至少包含：

- `timestamp`
- `run_id`
- `event_type`
- `state`
- `detail`
- `scene_version`

## 冻结要求

- `checkpoint_schema_version=2` 起，`effective_requested_order`、`state_sequence_digest`、`behavior_contract_version`、`next_state_owner` 为固定必填字段。
- `behavior_module_boundary` 只有在主文件不再包含 task-specific primitive choreography，且 `latest.json` 能稳定表达 `next_state_owner` / `last_behavior_call` 后，才可由协调窗口从 `false` 改成 `true`。
- 老 checkpoint 若仍为 schema 1，只允许在 `allow_reconcile=true` 时继续恢复；否则应硬失败。
