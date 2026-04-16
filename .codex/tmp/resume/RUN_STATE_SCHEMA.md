# Run State Schema

更新时间: 2026-04-16

## latest.json

```json
{
  "run_id": "string",
  "checkpoint_id": "string",
  "checkpoint_schema_version": 1,
  "task_sequence": "string",
  "completed_states": ["string"],
  "next_state": "string",
  "scene_version": 0,
  "assignments": {},
  "reserved_objects": [],
  "attached_objects": [],
  "gripper_snapshot": {},
  "robot_state_stamps": {},
  "last_plan_digest": "",
  "pending_transition": null,
  "resume_hint": ""
}
```

## runs/<run_id>.jsonl

每行一个 JSON event，至少包含：

- `timestamp`
- `run_id`
- `event_type`
- `state`
- `detail`
- `scene_version`
