# W6 Execution Control

状态: [~] software-boundary-ready
创建时间: 2026-04-16
更新时间: 2026-04-16

## Scope

- `ExecutePrimitive` 执行接口
- primitive dispatch
- step-level 双臂同步
- `sync_skew_ms`
- gripper status 闭环
- execution primitive 基础模块抽离

## Owned Paths

- `src/control/execution_adapter`
- `src/bringup/joint_state_aggregator`
- `src/interfaces/dualarm_interfaces/action/ExecutePrimitive.action`
- `src/interfaces/dualarm_interfaces/srv/SetGripper.srv`

## Acceptance

- 非零姿态请求真实下发
- primitive 执行能统计整段 skew
- skew 超阈值硬失败
- gripper status 能支撑持物/脱离判定

## 2026-04-16 Execution-Control 收口证据

- 已抽离 `execution_adapter/scripts/primitive_contract.py`，冻结 `execution_primitive.v1` 的 primitive id、result code 与必填矩阵。
- 已将 `execution_adapter_node.py` 的 `_execute_primitive` 收敛为 action 壳 + `_dispatch_primitive()`，基础执行 helper 与比赛语义映射分离。
- 已修复本轮 review 指出的 P1：
  - `cap_place_or_release` 不再无条件 `detach_verified=True`，detach service 失败会导致失败。
  - contact required primitive 不再允许 `success=True` 且 `contact_verified=False`。
  - 双臂 cartesian primitive 不再用 `min(len(...))` 静默截断 waypoint。
  - primitive cartesian skew 超阈值会映射到 `sync_violation`。
  - 双臂 cartesian dispatch 按 `arm_group/secondary_arm_group` 选择左右臂 client，不再硬编码 primary=left。
- Build Gate:
  - 首次构建被 Conda Python 3.8 污染阻塞，已用 `/usr/bin/python3` 与 `-DPython3_EXECUTABLE=/usr/bin/python3` 规避。
  - `colcon build --symlink-install --packages-select epg50_gripper_ros robo_ctrl execution_adapter --cmake-args -DPython3_EXECUTABLE=/usr/bin/python3` 通过。
  - `robo_ctrl` 仅保留既有 `unused-but-set-variable cleanup` warning。
- Interface Gate:
  - `ros2 interface show dualarm_interfaces/action/ExecutePrimitive` 通过，显示 `primitive_family`、`contract_version`、`primary_started`、`secondary_started`、`primary_completed`、`secondary_completed`。
- Runtime Gate:
  - 启动 `ros2 launch execution_adapter execution_adapter.launch.py` 成功。
  - `ros2 run execution_adapter smoke_execute_primitive.py` 通过，输出 `execute primitive smoke passed`。
- Review Gate:
  - 本轮 subagent review 无 P0 遗留。
  - 已知非本窗口风险：`dualarm_task_manager_node.py` 的 `cap_twist/pour_tilt` 路径使用 `deepcopy()` 但不在本窗口写集内，需 task-orchestration 窗口处理。

## Primitive 边界冻结条件

- 冻结版本：`execution_primitive.v1`。
- 冻结 primitive ids：
  - `cap_align_and_grasp`
  - `cap_twist_and_unthread`
  - `cap_place_or_release`
  - `pour_tilt`
  - `hold_verify`
  - `release_guard`
- 冻结 result codes：
  - `success`
  - `invalid_request`
  - `unknown_primitive`
  - `driver_failure`
  - `timeout`
  - `sync_violation`
  - `contact_failed`
  - `detach_failed`
  - `hold_failed`
  - `cancelled`
- 冻结前置条件：
  - `dualarm_interfaces`、`execution_adapter` 与所有 active primitive client 必须在同一 action IDL 后重建。
  - behavior 窗口只能新增 `src/control/execution_adapter/scripts/primitives/*`，不得修改 `execution_adapter_node.py`、`primitive_contract.py` 或 `ExecutePrimitive.action`。
  - 若 behavior 需要新增 primitive id，必须先回到协调窗口解除 `execution_primitive` freeze，再更新 contract、任务卡和最小 smoke。
  - `execution-control` 可把 owned path 从父级 `src/control/execution_adapter` 收窄到本次改动文件，释放 `scripts/primitives/*` 给 behavior-cap-pour / behavior-handover。

## Coordination

- 行为窗口只允许写 `primitives/*` 子模块，不改 execution 主文件
- 当前活跃窗口：`execution-control`
- 当前共享状态版本：`coord_rev=7`
- 当前下一步：等待协调窗口确认是否将 `interface_freeze.execution_primitive` 置为 true，并收窄 execution-control 父级 owned path。
