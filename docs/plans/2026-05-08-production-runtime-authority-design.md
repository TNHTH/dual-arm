# Production Runtime Authority Design

日期：2026-05-08

## Design Summary

Close production runtime authority around:

```text
scene_fusion -> /planning/* -> /execution/* -> /competition/run
```

## Implementation Slices

1. Add runtime authority documentation, ADR and static checker.
2. Gate console API in production launch and disable raw motion clients by default.
3. Archive quick source/config/scripts/tests outside active colcon base path.
4. Replace quick configs with production competition/profile configs.
5. Replace camera `/dev/video*` production facts with profile-based device identities.
6. Update task primitive/checkpoint skeleton tests and project handoff files.

## Verification

- `python3 scripts/check_runtime_authority.py`
- `python3 scripts/check_runtime_authority.py --launch-contracts`
- `/usr/bin/python3 -m pytest -q tests/unit tests/integration packages/tasks/dualarm_task_manager/test/test_dualarm_task_contract.py`
- `colcon build --base-paths packages --packages-select competition_console_api robo_ctrl dualarm_task_manager execution_adapter competition_start_gate dualarm_bringup dualarm_simulation tools`
- `ros2 launch ... --show-args` for production launch contracts.
