# W4 Task Contracts

> 状态：完成
> 日期：2026-04-26

## Scope

- 任务序列只允许双臂比赛合同内的 `handover,pouring`。
- start gate 与直接 action goal 分离，直接 goal 不再默认通过 `WAIT_START`。
- 对象选择从列表顺序改为确定性排序。
- checkpoint 写入 scene/config/start gate/selected object 证据。
- 缺少 fill/spill/release/detach/hold evidence 时不能默认判成功。

## Changed

- 新增 `packages/tasks/dualarm_task_manager/scripts/task_contract.py`。
- 更新 `dualarm_task_manager_node.py`、`competition_start_gate_node.py`、`execution_adapter_node.py`。
- `dualarm_task_manager` 包内 pytest 接入 `colcon test`。
- 顶层 software-only CI 纳入 Wave 4 相关包 build 与 task manager 包内测试。

## Verification

- `/usr/bin/python3 -m py_compile packages/tasks/dualarm_task_manager/scripts/dualarm_task_manager_node.py packages/tasks/dualarm_task_manager/scripts/task_contract.py packages/control/execution_adapter/scripts/execution_adapter_node.py packages/bringup/competition_start_gate/scripts/competition_start_gate_node.py`
- `/usr/bin/python3 -m pytest -q tests/unit tests/integration packages/tasks/dualarm_task_manager/test/test_dualarm_task_contract.py`
- `colcon build --base-paths packages --packages-select dualarm_task_manager execution_adapter competition_start_gate`
- `colcon test --base-paths packages --packages-select dualarm_task_manager --event-handlers console_direct+`
- `bash scripts/ci/software_check.sh`
