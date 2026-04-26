# W5 Module Split

> 状态：完成
> 日期：2026-04-26

## Scope

- 做第一轮低风险模块职责拆分。
- 保持原 node executable、launch、service/action 名称兼容。
- 拆分后补测试，禁止只搬代码不验证。

## Changed

- `competition_console_api/scripts/process_manager.py`：core process 状态/pid helper。
- `execution_adapter/scripts/primitive_evidence.py`：倒水证据 gate 与 `unverified_evidence` 结果码。
- `robo_ctrl/include/robo_ctrl/safety_limits.hpp`：速度、加速度、ovl、blend 校验 helper。
- `competition_console_web/src/apiClient.ts`：前端 JSON API transport helper。

## Verification

- `/usr/bin/python3 -m py_compile packages/ops/competition_console_api/scripts/competition_console_api_node.py packages/ops/competition_console_api/scripts/process_manager.py packages/control/execution_adapter/scripts/execution_adapter_node.py packages/control/execution_adapter/scripts/primitive_evidence.py`
- `/usr/bin/python3 -m pytest -q tests/unit tests/integration packages/tasks/dualarm_task_manager/test/test_dualarm_task_contract.py packages/ops/competition_console_api/test/test_console_security.py`
- `npm run build` in `packages/ops/competition_console_web`
- `colcon build --base-paths packages --packages-select competition_console_api execution_adapter robo_ctrl`
- `bash scripts/ci/software_check.sh`

## Subagent

- Wave 5 reviewer `019dc803-c68d-74b1-97b1-c345c8bf088b` timed out after 120 seconds and was closed.
- Local fallback verification passed.
