# DualArm v1 Hardware-Interface Hardening

创建时间：2026-04-28

## Approval Scope

Approved for v1 hardware-interface hardening scope.

本 v1 关闭当前硬件接口和任务执行链路中的主要假成功/误触风险；不宣称解决全部长期感知、人体安全、真实倒水证据、dense occupancy 和硬实时双臂控制问题。

## Closed In v1

- 双 RGB / 单 Depth 静态门控。
- 右 RGB detector 与 `dual_camera_mode` 解耦。
- RGB/Depth frame alignment 默认强制。
- pouring 状态机增加 `table_surface` stable 门控。
- `_direct_grasp()` 改为 `guarded_grasp`，contact 未验证不 attach。
- Cartesian primitive 默认走 planner service 后执行 joint trajectory。
- vendor direct Cartesian 增加 global flag + profile 白名单双门控。
- 无真实 fill/spill evidence 时，`pour_tilt` 返回 `unverified_evidence`。
- MoveIt subframes 写入前转换到 object-local pose。

## Residual Risks / Out Of Scope For v1

This v1 closes the main hardware-interface and execution-chain false-success risks using the current repository interfaces and existing hardware only.

The following issues are intentionally not fully solved in v1:

- precise object-level 6D pose estimation
- RGB-only 3D triangulation or active depth handoff between cameras
- dense occupancy mapping for unknown obstacles
- human hand/body dynamic obstacle modeling for handover
- real fill-level or spill sensing for pouring
- hard real-time coordinated dual-arm control
- full calibration acceptance pipeline
- long-term multi-object re-identification under occlusion

These must not be reported as closed by v1.

## Handover Real-Motion Safety Note

Because v1 does not add human pose estimation or body/hand obstacle modeling, handover real-motion must remain gated by conservative safety confirmation.

Until a human-aware safety model is added, handover real-motion requires:

- explicit operator confirmation that the human is stationary
- low-speed execution profile
- clear emergency stop access
- no automatic claim that human-aware avoidance is implemented
