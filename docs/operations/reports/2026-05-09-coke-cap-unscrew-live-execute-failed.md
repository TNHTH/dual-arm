# 2026-05-09 可乐拧瓶盖序列实机执行失败记录

## 结论
- 本轮没有完整执行完用户要求的拧瓶盖序列。
- 已完成真实动作：
  1. 左臂到 `1 左臂观察`。
  2. 右夹爪张开。
  3. 右臂到 `2 右臂准备夹取`。
  4. 右臂到 `3 右臂夹取`。
  5. 右夹爪夹紧。
  6. 右臂最终到达 `4 右臂准备拧`。
- 未完成动作：
  - 左臂未到 `5 左臂准备拧`。
  - `5 -> 左夹紧 -> 6 -> 左松开` 的 6 次循环均未开始。
- 最终稳定状态：
  - 左臂仍在 `1 左臂观察` 附近：`[-39.653683, -155.320786, 65.204620, -45.636337, -93.823898, -75.789780] deg`，`motion_done=true`，`error_code=0`。
  - 右臂在 `4 右臂准备拧` 附近：`[-98.042427, -140.282791, -10.381972, -211.277313, -85.398361, 85.641579] deg`，`motion_done=true`，`error_code=0`。
  - 左夹爪 `position=0`，右夹爪 `position=219`，两侧 `gobj=3`。

## 用户目标
用户要求按 6 张示教图片动作顺序完整执行：

`1 -> 右夹爪张开 -> 2 -> 3 -> 右夹爪夹紧 -> 4 -> (5 -> 左夹爪夹紧 -> 6 -> 左夹爪松开) * 6`

用户后续明确要求：
- 连续完成动作，完整执行完动作序列。
- 运动不要一顿一顿，要平滑移动。
- 用户确认按照示教动作规划走是安全的。

## 平滑性调整
- 最初执行用较慢 ServoJ 参数时，右臂运动观感有停顿。
- 已将 `execution_adapter` 重启为更密集的 ServoJ 参数：
  - `trajectory_servo_joint_cmd_time=0.02`
  - `trajectory_servo_joint_duration_cmd_time=0.10`
  - `trajectory_servo_joint_filter_time=0.02`
  - `trajectory_servo_joint_vel=2.0`
  - `trajectory_servo_joint_acc=2.0`
- 证据：右臂 `2 -> 3` 规划 `points=21`，执行重采样后 `resampled_points=105`，实际运动约 `5.026 s`，最终误差约 `0.014 deg`，观感比前一轮更连续。

## 执行过程
### 1. 初始 execute 尝试
- 命令入口：`packages/tools/tools/scripts/coke_cap_unscrew_sequence_runner.py`
- 结果：第 3 步右臂到 `2 右臂准备夹取` 后，脚本因状态采样过早判定 final joint 为空而失败。
- 独立采样证明右臂实际已到 `2`。
- 已修复脚本 `_latest_state()`：等待 fresh `/L/robot_state` 或 `/R/robot_state` 后再做最终误差校验。

### 2. 平滑参数下完整序列尝试
- 已完成：
  - 左臂 `1`
  - 右夹爪张开
  - 右臂 `2`
  - 右臂 `3`
  - 右夹爪夹紧
- 在第 6 步 `4 右臂准备拧` 被 `/planning/plan_joint` 拒绝：
  - `result_code=collision`
  - `failure_stage=path_search`
  - `message=MoveIt PlanJoint 规划失败`
- 状态有效性诊断：
  - `left=1 + right=3` 有效。
  - `left=1 + right=4` 无效，contacts 包括 `left_forearm_link`、`left_wrist1_link` 与右腕部/右相机模型。
  - `left=5 + right=4` 有效。
  - `left=6 + right=4` 有效。

### 3. 右 4 与左 5 融合同步规划尝试
- 脚本新增 `--fuse-right4-left5` 和 `--start-step-index`，用于从已完成的前 5 步续跑，并把 `right 4 + left 5` 合成 `/planning/plan_dual_joint`。
- `/planning/plan_dual_joint` 成功：
  - `left_points=31`
  - `right_points=31`
  - `planning_time_ms=385.604`
- `/execution/execute_trajectory` 返回 success，右臂到达 `4`。
- 左臂没有离开 `1`，最终左臂误差 `77.711786 deg`。
- `L_robo_ctrl` 日志显示：`ServoJ线程异常: 未知异常`。

### 4. 用户人工确认安全后的左臂直接恢复尝试
用户明确确认按照示教动作规划走完全安全后，尝试低速恢复左臂到 `5`：

- `/L/robot_move` MoveJ：
  - 目标：`5 左臂准备拧`
  - 速度/加速度：`8%`
  - 结果：`执行移动命令失败，错误码: 154`
  - 左臂未移动。
- `robot_mode_helper --arm L --ip 192.168.58.2 --normal-only --keep-mode` 清错/上使能成功。
- `/L/robot_servo_joint` 手动密集 ServoJ：
  - `points=4375`
  - `cmd_time=0.0016`
  - service 返回 `ServoJ开始执行`
  - 左臂未移动，最终误差仍为 `77.711786 deg`
  - `L_robo_ctrl` 日志再次显示：`ServoJ线程异常: 未知异常`
- `/L/robot_servo` 显式 `ServoMoveStart -> ServoJ(no-op) -> ServoMoveEnd` 探针：
  - `ServoMoveStart` 成功。
  - `ServoJ(no-op)` 服务超时。
  - `ServoMoveEnd` 服务超时。
  - `L_robo_ctrl` 进程崩溃：`terminate called after throwing an instance of 'XmlRpc::XmlRpcException'`。

## 收尾恢复
- 对左臂执行 `robot_mode_helper --normal-only --keep-mode`，完成清错/上使能。
- 重新启动 `robo_ctrl_L.launch.py`。
- 最终状态复核：
  - 左臂 `/L/robot_state` 可读，`motion_done=true`，`error_code=0`。
  - 右臂 `/R/robot_state` 可读，`motion_done=true`，`error_code=0`。
  - 左夹爪状态正常，`position=0`。
  - 右夹爪状态正常，`position=219`，`force=87`，但 `gobj=3` 表示未检测到物体或物体已脱落。
- 代码验证：
  - `/usr/bin/python3 -m py_compile packages/tools/tools/scripts/coke_cap_unscrew_sequence_runner.py` 通过。
  - `colcon build --base-paths packages --packages-select tools --cmake-args -DPython3_EXECUTABLE=/usr/bin/python3 -DPYTHON_EXECUTABLE=/usr/bin/python3` 通过。
  - 安装树 `install/tools/lib/tools/coke_cap_unscrew_sequence_runner.py` 已包含 `--fuse-right4-left5`、`--start-step-index` 和 `PlanDualJoint`。
- 已清理本轮临时 ROS 实机栈：
  - `pgrep -af 'ros2 launch|move_group|fairino_dualarm_planner|execution_adapter|publish_empty_scene|robo_ctrl|epg50|joint_state_aggregator'` 无控制/规划/执行残留。
  - `ROS2CLI_ENABLE_DAEMON=0 ros2 node list` 无输出。

## 关键证据
- 平滑执行报告：
  - `.codex/tmp/runtime/coke-cap-unscrew-sequence-20260509-execute-live/runner-smooth/coke_cap_unscrew_sequence_report.json`
- 右 4 + 左 5 融合执行报告：
  - `.codex/tmp/runtime/coke-cap-unscrew-sequence-20260509-execute-live/runner-fused-execute/coke_cap_unscrew_sequence_report.json`
- 直接 MoveJ 报告：
  - `.codex/tmp/runtime/coke-cap-unscrew-sequence-20260509-execute-live/manual-teach-direct-execute/teach_direct_report.json`
- 手动 ServoJ 报告：
  - `.codex/tmp/runtime/coke-cap-unscrew-sequence-20260509-execute-live/manual-servoj-execute/manual_servoj_report.json`

## 当前判断
- 本轮未完成序列的直接原因不是用户示教目标顺序缺失，而是左臂执行层不可用：
  1. MoveIt 单臂右 `3 -> 4` 在 `left=1` 时因模型碰撞拒绝。
  2. 右 `4` + 左 `5` 双臂规划成功，但左臂 ServoJ 实际未运动。
  3. 左臂 MoveJ 到 `5` 被控制器拒绝，错误码 `154`。
  4. 左臂 ServoJ 会触发 `XmlRpc::XmlRpcException` 或线程未知异常。
- 在修复 `L_robo_ctrl` 的 ServoJ/RPC 崩溃和解释 MoveJ `154` 前，继续重发完整序列不会让动作完成，只会重复失败并增加控制节点崩溃风险。
- 清理临时栈时 `move_group` 在退出析构阶段出现一次 `Segmentation fault`，发生在动作停止和最终状态采样之后；当前 ROS 图已清空。

## 后续建议
1. 先修复 `robo_ctrl`：捕获并打印 `XmlRpc::XmlRpcException` 的 `getMessage()`、调用名、cmd_time、点数和首末关节角。
2. 给 `RobotServoJoint` 增加显式 `ServoMoveStart/ServoMoveEnd` 生命周期，且执行失败必须返回失败，不能让 `/execution/execute_trajectory` false success。
3. 查 Fairino MoveJ 错误码 `154`，并验证 `LEFT5` 在控制器当前工具/工件/构型下是否可接受。
4. 修复后先做左臂单关节小步或短轨迹验证，再恢复完整开盖序列。
