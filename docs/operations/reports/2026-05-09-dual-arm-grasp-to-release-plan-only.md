# 2026-05-09 双臂夹取点到准备释放点 plan-only 记录

## 结论
- 用户确认双臂已回到夹取点并说“开始”后，本轮只做了双臂同步轨迹规划，没有执行真实运动。
- 从夹取点到准备释放点的 `/planning/plan_dual_joint` 规划成功。
- 左右轨迹各 `27` 个点，末端时间均为 `2.538 s`，满足同步执行前的计划一致性检查。
- 本轮结束时已关闭临时 `robo_ctrl`、`joint_state_aggregator`、`move_group`、`fairino_dualarm_planner`、空场景发布器和残留 `robot_state_publisher`。

## 输入点位

### 夹取点
- 记录名：`dual_grasp_pose_2026-05-09-0459`
- 左臂关节角 deg：`[-47.121994, -52.515736, 86.086037, -215.939865, -79.598450, -90.014793]`
- 右臂关节角 deg：`[-129.529678, -120.581802, -55.148106, -4.471327, 77.114014, 89.689338]`

### 准备释放点
- 记录名：`dual_release_pose_2026-05-09-0503`
- 左臂关节角 deg：`[-15.461136, -49.818974, 87.178581, -211.765930, -166.409805, -82.553879]`
- 右臂关节角 deg：`[-128.693848, -133.301804, -46.161942, 0.469475, 112.015732, 89.747856]`

## 现场状态确认
- 规划前采样 `/L/robot_state`：
  - 关节角 deg：`[-47.121777, -52.515736, 86.085823, -215.939865, -79.598450, -90.014793]`
  - `motion_done=true`
  - `error_code=0`
- 规划前采样 `/R/robot_state`：
  - 关节角 deg：`[-129.529678, -120.582237, -55.147667, -4.471544, 77.114014, 89.689339]`
  - `motion_done=true`
  - `error_code=0`

## 启动的临时规划链路
- `/L_robo_ctrl` 和 `/R_robo_ctrl`：只读状态与 joint state，速度/加速度/OVL 上限均为 `10%`。
- `joint_state_aggregator`：把 `/L/joint_states`、`/R/joint_states` 聚合为 MoveIt 使用的 `/joint_states`。
- `move_group`：`publish_fake_joint_states:=false`。
- `empty_scene_fresh_publisher`：以 `10 Hz` 发布新鲜空 `/scene_fusion/scene_objects`，避免 freshness gate 因无场景消息失败。
- `fairino_dualarm_planner`：
  - `scene_age_limit_ms:=1200`
  - `robot_state_age_limit_ms:=500`
  - `planning_time:=5.0`
  - `planning_attempts:=10`

## 规划结果
- 服务：`/planning/plan_dual_joint`
- planner_id：`RRTConnectkConfigDefault`
- coordination_mode：`dual_sync`
- primary_arm：`left`
- sync_policy：`time_aligned`
- 返回：
  - `success: True`
  - `message: MoveIt PlanDualJoint 规划成功`
  - `result_code: success`
  - `failure_stage: ""`
  - `planning_time_ms: 413.583`
  - `left_points: 27`
  - `right_points: 27`
- 左臂轨迹：
  - first deg：`[-47.122, -52.516, 86.086, -215.940, -79.598, -90.015]`
  - last deg：`[-15.461, -49.822, 87.176, -211.770, -166.406, -82.559]`
  - last duration：`2.538 s`
- 右臂轨迹：
  - first deg：`[-129.530, -120.582, -55.148, -4.471, 77.114, 89.689]`
  - last deg：`[-128.691, -133.306, -46.163, 0.464, 112.015, 89.747]`
  - last duration：`2.538 s`

## 未执行内容
- 没有调用 `/execution/execute_trajectory`。
- 没有调用 `/competition/run`。
- 没有发送夹爪 command。
- 没有使用 raw `/L/robot_move*` 或 `/R/robot_move*` 运动服务。

## 收尾
- 已停止本轮临时启动的：
  - `/L_robo_ctrl`
  - `/R_robo_ctrl`
  - `joint_state_aggregator`
  - `move_group`
  - `fairino_dualarm_planner`
  - `empty_scene_fresh_publisher`
  - 残留 `robot_state_publisher`
- 收尾后 `ros2 node list` 仅保留既有控制台、夹爪和左侧 RGB 可视化相关节点：
  - `/competition_console_api`
  - `/detector_left_rgb`
  - `/execution_adapter`
  - `/gripper0/epg50_gripper_node`
  - `/gripper1/epg50_gripper_node`
  - `/left_rgb_bridge`
  - `/left_rgb_detection_viewer`

## 下一步安全入口
- 若用户确认执行，下一轮应重新拉起干净规划链路，先复查：
  1. 左右臂仍在夹取点附近。
  2. `/L/robot_state` 和 `/R/robot_state` 都连续满足 `motion_done=true`、`error_code=0`。
  3. 现场释放路径无人员和障碍物。
  4. 规划服务再次返回左右轨迹等时长。
- 只有以上检查通过后，才允许调用 `/execution/execute_trajectory` 执行刚规划出的双臂同步轨迹。
