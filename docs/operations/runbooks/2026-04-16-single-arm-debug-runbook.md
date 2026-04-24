# 单臂调试接口 Runbook

创建时间：2026-04-16
更新时间：2026-04-16

## 目标

- 在不破坏现有双臂主链的前提下，为左臂或右臂提供独立单臂调试入口。
- 让单臂调试保持模块化：组装层、兼容层、动作层分开，避免把大量 `left/right` 条件直接塞进现有双臂主流程。
- 优先覆盖当前现场需求：左臂 + 深度相机 + 夹爪 + 矿泉水瓶抓取最小闭环。

## 模块边界

- `src/bringup/dualarm_bringup/launch/single_arm_debug.launch.py`
  - 单臂调试总装入口。
  - 负责选择 `debug_arm=left|right`。
  - 只拉起选中的机械臂驱动，不污染双臂比赛主入口。
- `src/bringup/joint_state_aggregator/scripts/joint_state_aggregator_node.py`
  - 兼容层。
  - 在 `active_arms=left|right` 时，给未接入的另一侧补默认关节状态，保证 `/joint_states` 仍可供 MoveIt 使用。
- `src/tools/tools/scripts/single_arm_pick_debug.py`
  - 单臂抓取最小闭环工具。
  - 只做：锁定目标 -> 张爪 -> pregrasp -> grasp -> 合爪并 attach -> hold verify -> retreat。
  - 不依赖 `RunCompetition` 总状态机，不把行为层逻辑和单臂调试耦在一起。

## 当前实现结论

- 双臂主入口 `competition.launch.py` 保持原样，不强行塞入单臂特判。
- 单臂调试通过新入口单独挂载，后续左/右臂现场调试只改 launch 参数，不需要改主链代码。
- `joint_state_aggregator` 已支持：
  - `active_arms=dual`
  - `active_arms=left`
  - `active_arms=right`
- `single_arm_pick_debug.py` 已安装为 ROS 可执行项：`tools single_arm_pick_debug.py`

## 当前限制

- 当前视觉抓取链仍以左臂相机链为正式优先路径。
- `tf_node/config/calibration_transforms.yaml` 目前只有 `left_tcp -> left_camera`，且状态仍是 `unverified`。
- 因此：
  - 左臂单臂视觉抓取：当前可走调试链，但 launch 会显式允许 `unverified extrinsics`。
  - 右臂单臂视觉抓取：接口已预留，但若未来右臂也挂相机，仍需补 `right_tcp -> right_camera` 标定配置与 frame 合同。

## 左臂抓矿泉水瓶建议命令

每个新终端先执行：

```bash
cd /home/gwh/dual-arm
source /opt/ros/humble/setup.bash
source install/setup.bash
```

启动左臂单臂调试栈：

```bash
ros2 launch dualarm_bringup single_arm_debug.launch.py \
  debug_arm:=left \
  left_robot_ip:=192.168.58.2 \
  start_perception:=true \
  start_camera_bridge:=true \
  start_detector:=true \
  start_gripper:=true \
  gripper_port:=auto \
  allow_unverified_camera_extrinsics:=true
```

基础确认：

```bash
ros2 topic echo /scene_fusion/scene_objects --once
ros2 topic echo /planning/grasp_targets --once
ros2 topic echo /joint_states --once
ros2 service list | grep -E '/planning/plan_pose|/execution/set_gripper|/scene/reserve_object'
```

执行左臂抓矿泉水瓶最小闭环：

```bash
ros2 run tools single_arm_pick_debug.py --ros-args \
  -p semantic_type:=water_bottle \
  -p arm_name:=left_arm \
  -p gripper_close_position:=200 \
  -p execute_retreat:=true
```

## 右臂单臂调试建议命令

右臂如只做驱动 / MoveIt / 执行链调试，可先关闭感知：

```bash
ros2 launch dualarm_bringup single_arm_debug.launch.py \
  debug_arm:=right \
  right_robot_ip:=192.168.58.3 \
  start_perception:=false \
  start_detector:=false \
  start_camera_bridge:=false \
  start_gripper:=false
```

说明：

- 这条命令验证的是“右臂单臂调试接口已预留”，不是“右臂视觉抓取已完整收口”。
- 若后续右臂也要做视觉抓取，需要单独补右臂相机外参与 frame 契约。
