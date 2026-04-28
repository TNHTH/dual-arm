# evidence_manager

`evidence_manager` 是 DualArm v1 硬件接口闭环加固中的证据聚合器。

本包只消费当前已有 ROS 信号：

- managed scene
- 左右机械臂 robot state
- 左右 EPG50 gripper status
- task manager event

v1 不新增 load cell、音频、液位或 spill 传感器，因此本包不估计真实倒水量，也不声明真实 fill/spill 已验证。无真实 fill/spill 输入时，`pour_tilt` 必须继续返回 `unverified_evidence`。
