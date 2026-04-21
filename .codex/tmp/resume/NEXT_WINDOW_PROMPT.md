# 下一窗口提示词：dual-arm v4 RViz / 双相机 / 模型点云继续收口

继续 `/home/gwh/dashgo_rl_project/workspaces/dual-arm` 的双臂比赛主线 v4 收口任务。

## 必读文件
1. `/home/gwh/dashgo_rl_project/workspaces/dual-arm/AGENTS.md`
2. `/home/gwh/dashgo_rl_project/workspaces/dual-arm/STATE.md`
3. `/home/gwh/dashgo_rl_project/workspaces/dual-arm/.codex/tmp/error-trace/ERROR_TRACE.md`
4. `/home/gwh/dashgo_rl_project/workspaces/dual-arm/.codex/tmp/continuous-learning/RETRO.md`
5. `/home/gwh/dashgo_rl_project/workspaces/dual-arm/.codex/tmp/resume/IMPLEMENTATION_BREAKPOINTS.md`
6. `/home/gwh/dashgo_rl_project/workspaces/dual-arm/.codex/tmp/resume/SUBAGENT_REGISTRY.json`
7. `/home/gwh/dashgo_rl_project/workspaces/dual-arm/task_plan.md`
8. `/home/gwh/dashgo_rl_project/workspaces/dual-arm/progress.md`
9. `/home/gwh/dashgo_rl_project/workspaces/dual-arm/findings.md`
10. `/home/gwh/dashgo_rl_project/workspaces/dual-arm/docs/runbooks/engineering-process-standards.md`
11. `/home/gwh/dashgo_rl_project/workspaces/dual-arm-shared/coordination/SHARED_STATE.json`
12. `/home/gwh/dashgo_rl_project/workspaces/dual-arm-shared/coordination/DECISIONS.md`
13. `/home/gwh/dashgo_rl_project/workspaces/dual-arm/.codex/tmp/session-state/STATE.md`

## 当前状态
- 当前分支：`test`
- 当前阶段：`safe-closed / rviz-display-partial / dual-camera-contract-added`
- 安全收口后，当前应没有 ROS/RViz 业务进程残留。
- 已完成核心代码改动：
  - `TaskCommand.srv`
  - `SetObjectInteraction.srv`
  - `competition_rviz_tools`
  - `scene_model_pointcloud`
  - `planning_scene_sync` 的 `dual_contact/opened_split`
  - bottle body+cap collision
  - `right_camera` frame 链
  - 可配置 `left_base_xyz/right_base_xyz/right_base_rpy`
- 最新构建验证已通过：
  - `fairino_dualarm_description`
  - `fairino_dualarm_moveit_config`
  - `fairino_dualarm_planner`
  - `orbbec_gemini_bridge`
  - `tf_node`
  - `competition_rviz_tools`
  - `dualarm_bringup`
- 已知截图证据：
  - `/tmp/competition_rviz_latest.png`
  - 注意：该截图中 RobotModel 和点云可见，但对齐仍不准。

## 下窗口第一批命令
```bash
cd /home/gwh/dashgo_rl_project/workspaces/dual-arm
source /opt/ros/humble/setup.bash
source install/setup.bash
pgrep -af 'competition_rviz.launch.py|competition_core.launch.py|rviz2|move_group|robot_state_publisher|joint_state_aggregator|robo_ctrl_node|orbbec_gemini_ros_bridge|detector_pt_node|table_surface_detector|depth_processor_node|scene_model_pointcloud'
ros2 launch dualarm_bringup competition_rviz.launch.py \
  start_hardware:=true \
  start_detector:=true \
  start_camera_bridge:=true \
  start_table_surface_detector:=true \
  publish_fake_joint_states:=false \
  allow_unverified_camera_extrinsics:=true \
  require_verified_camera_extrinsics:=false \
  rviz:=true \
  dry_run:=false \
  enable_action_bridge:=true
```

## RViz 验收规则
每次打开 RViz 后必须先截图，不要直接告诉用户“打开了”。

截图流程：
```bash
xwininfo -root -tree | grep -iE 'competition_control|RViz'
xwd -id <RVIZ_WINDOW_ID> -out /tmp/competition_rviz_latest.xwd
# 将 xwd 转 png，可复用上一窗口的 Python+OpenCV 脚本
```

截图中必须检查：
- 双臂 RobotModel 是否可见
- `/competition/rviz/scene_model_points` 是否可见
- `/depth_handler/pointcloud` 是否可见
- `/perception/table_points` 是否可见
- 点云和机械臂/桌面是否大致对齐

## 当前首要问题
1. 机械臂 RViz 姿态仍不准。
   - 已排除首要关节单位问题：`robo_ctrl_node.cpp` 发布 joint_states 时已做 `deg -> rad`。
   - 下一步应测量并覆盖：
     - `left_base_xyz`
     - `left_base_rpy`
     - `right_base_xyz`
     - `right_base_rpy`
2. 模型点云高度仍需截图复验。
   - `scene_model_pointcloud` 已改为桌面支撑物体按 table surface 贴底显示。
   - 该改动已构建，但还没重新截图确认。
3. 双相机契约刚加入。
   - 左相机 frame：
     - `left_camera`
     - `left_camera_color_frame`
     - `left_camera_depth_frame`
   - 右相机 frame：
     - `right_camera`
     - `right_camera_color_frame`
     - `right_camera_depth_frame`
   - 右相机外参现在是 placeholder/unverified，不能直接用于比赛级 world pose。
4. 物体尺寸。
   - 用户提供：
     - 球直径约 `12cm`
     - 收纳筐 `L30*W20*H12cm`
     - 杯口 `7.5cm`
     - 杯底 `6cm`
     - 杯高 `11.5cm`
   - 怡宝 350ml / 可口可乐原味 300ml 建议下一窗口用卡尺实测或可靠资料校准 `object_geometry.yaml`。

## 不要做
- 不要把默认 `world_to_left_base/right_base` 当真实安装位姿。
- 不要把未 verified 的 left/right camera 外参结果当比赛级成功。
- 不要只看 RViz 进程存在；必须截图确认。
- 不要直接做真抓，除非左/右夹爪状态、外参、base mount 和 scene 显示都已验证。

## 推荐下一步
1. 用当前新 launch 启动 RViz。
2. 截图确认。
3. 读取 `/joint_states`、`/L/robot_state`、`/R/robot_state`，确认机械臂姿态。
4. 按现场测量值覆盖 base mount launch 参数。
5. 截图复验。
6. 分别启动/标定左相机和右相机，不混用 frame。
7. 用实测物体尺寸修正 `configs/competition/object_geometry.yaml`。
