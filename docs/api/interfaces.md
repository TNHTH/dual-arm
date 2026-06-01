# Interfaces

创建时间：2026-04-26

本文记录当前软件-only 基线必须稳定遵守的核心接口合同。源码事实来源仍是 `packages/interfaces/dualarm_interfaces`、`packages/control/robo_ctrl/srv` 和各节点 README。

## 通用单位

- 位置：米用于 `PoseStamped` 中的 ROS 标准位姿；毫米用于 `robo_ctrl` 硬件服务的 TCP/笛卡尔字段。
- 角度：`robo_ctrl` 服务使用度；MoveIt/轨迹消息遵循 ROS/MoveIt 约定。
- 速度、加速度、`ovl`：控制器百分比，默认范围由 `config/control/safety_limits.yaml` 管理。
- `scene_version`：单调递增场景版本，用于对象选择、规划 freshness、checkpoint 和恢复校验。

## Action

### `RunCompetition`

Goal:

- `start_immediately`：只允许由 `competition_start_gate` 在外部信号或显式 mock/dev 条件满足后置 `true`。直接 action goal 不应绕过 `WAIT_START`。
- `requested_order`：逗号分隔任务序列，目前只允许 `handover,pouring`，未知、重复、空任务必须失败。
- `resume_from_checkpoint` / `checkpoint_id` / `allow_reconcile`：用于 checkpoint 恢复。

Result:

- `success`：整轮状态机是否完成。
- `message`：失败状态与原因。
- `final_checkpoint_id`：最后提交 checkpoint。
- `resume_hint`：可恢复入口或人工处理提示。

Feedback:

- `state`：当前状态。
- `detail`：状态执行细节。

### `ExecutePrimitive`

Goal:

- `primitive_id`：当前支持 `cap_align_and_grasp`、`cap_twist_and_unthread`、`cap_place_or_release`、`pour_tilt`、`hold_verify`、`release_guard`。
- `arm_group` / `secondary_arm_group`：执行臂组。
- `object_id` / `reference_object_id`：操作对象与参考对象。
- `primary_cartesian_waypoints` / `secondary_cartesian_waypoints`：笛卡尔路径。
- `stop_condition_id`：证据 gate。`pour_tilt` 当前只有 `simulated_fill_spill_verified` 可判成功。
- `hold_duration_s`：持有验证时长；人机交接持球默认 3 秒。
- `synchronized`：双臂同步执行标志。

Result:

- `result_code`：`success`、`invalid_request`、`unknown_primitive`、`driver_failure`、`timeout`、`sync_violation`、`contact_failed`、`detach_failed`、`hold_failed`、`unverified_evidence`、`cancelled`。
- `contact_verified` / `detach_verified` / `spill_detected`：成功判定证据字段；缺证据不能默认为成功。
- `sync_skew_ms`：双臂实际偏差。

### `ExecuteTrajectory`

- `joint_trajectory` / `secondary_joint_trajectory`：主/副臂轨迹。
- `cartesian_waypoints`：笛卡尔执行路径。
- `synchronized`：双臂同步执行。
- `use_cartesian_execution`：是否走笛卡尔执行。
- `result_code`：执行结果，不得仅凭 action 接收判成功。

## Message

### `SceneObjectArray`

- `header.frame_id`：场景参考系；比赛运行链要求 `world` 或明确可转换到 `world`。
- `scene_version`：数组级权威版本。
- `objects`：场景对象列表。

### `SceneObject`

- `id`：全局唯一对象 ID。
- `semantic_type`：比赛语义，如 `water_bottle`、`cola_bottle`、`cup`、`basketball`、`soccer_ball`、`basket`。
- `confidence`：感知置信度；对象选择策略优先稳定对象，再按置信度、scene_version、id 排序。
- `lifecycle_state`：`stable`、`reserved`、`attached`、`held_dual_contact`、`opened_split_active`、`opened_split` 等。
- `reserved_by` / `attached_link`：规划与执行的资源占用证据。

## Service

### `PlanPose`

- Request `arm_group`：`left_arm`、`right_arm` 或受支持的双臂组。
- Request `target_pose`：ROS `PoseStamped`。
- Response `scene_version`、`start_state_stamp`、`result_code`、`failure_stage`：必须被上层消费，不能只看 `success`。

### `SetGripper`

- Request `arm_name`：`left_arm` 或 `right_arm`。
- Request `position` / `speed` / `torque`：0-255，控制台路径默认会按 `safety_limits.yaml` 收敛速度和力矩。
- Request `attach_on_success` / `detach_on_success`：执行层与 scene 同步使用。

### `robo_ctrl`

- `RobotMove`：关节/笛卡尔移动，速度和加速度必须是有限正百分比。
- `RobotMoveCart`：TCP 位姿单位毫米和度，`blend_time` 范围 `[-1, 500]`。
- `RobotSetSpeed`：速度百分比必须有限且在安全上限内。
- `RobotServoJoint(command_type=1)`：软件 stop/cancel 路径使用的停止入口。

## HTTP Console API

- 默认 host：`127.0.0.1`。
- 危险 POST/PUT/PATCH/DELETE API 默认需要 `X-Dual-Arm-Token` 或 `Authorization: Bearer <token>`。
- `start_hardware=true` 默认被拒绝，除非显式设置 `allow_hardware_bringup=true`。
