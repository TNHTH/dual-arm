# dual-arm STATE

更新时间：2026-04-15

## Current Wave
- Wave: 2
- 目标：PlanningScene 真同步 + execution_adapter 双臂同步/primitive 升级
- 状态：待开始

## 已完成
- 新增双臂描述骨架与双臂 MoveIt 配置文件：
  - `arm_planner/src/fairino_dualarm_description/urdf/fairino3_v6_macro.xacro`
  - `arm_planner/src/fairino_dualarm_description/urdf/fairino_dualarm.urdf.xacro`
  - `arm_planner/src/fairino_dualarm_moveit_config/config/fairino_dualarm.srdf`
  - `arm_planner/src/fairino_dualarm_moveit_config/config/{kinematics,joint_limits,ompl_planning,moveit_controllers,ros2_controllers,initial_positions}.yaml`
- `fairino_dualarm_moveit_config/launch/move_group.launch.py` 已从占位改成真实 bringup，可拉起 `robot_state_publisher`、`joint_state_publisher`、`move_group`。
- `fairino_dualarm_planner` 已从 Python 伪规划器切到 C++ `MoveGroupInterface` 服务节点，旧 Python planner 已从安装树移除。
- `dualarm_bringup` 已 include MoveIt bringup。
- 新增 `joint_state_aggregator` 包，用于 production `/joint_states` 汇总。
- `execution_adapter` 已完成 MoveIt 弧度到硬件度转换修复，并统一反馈 joint 名为 `left_j* / right_j*`。
- `PlanPose(dual_arm)` 已从硬拒绝升级为真实双末端目标规划尝试；`PlanJoint(dual_arm)` 已能返回分拆后的左右两条轨迹。

## 当前阻塞
- `planning_scene_sync` 仍只是 topic overlay，没有把 world/attached object 真同步进 MoveIt PlanningScene。
- `scene_version` 在当前 Wave 1 smoke 中仍为 `0`，说明 scene freshness 与 managed scene 版本联动还没有彻底收口。
- `PlanPose(dual_arm)` 已经进入真实 MoveIt 规划路径，但对示例 pose 返回 `collision`；Wave 2 需要结合场景与任务目标继续调优。
- production 路径虽已接入 `joint_state_aggregator`，但还没有完成与真实 `/L/joint_states`、`/R/joint_states` 的联调验证。
- MoveIt bringup 仍有 `No 3D sensor plugin(s) defined for octomap updates` 告警；当前不阻塞 P0 只规划验证。

## 已验证证据
- `./build_workspace.sh` 在 Wave 1 前的全仓基线通过。
- Wave 1 增量构建通过：
  - `fairino_dualarm_description`
  - `fairino_dualarm_moveit_config`
  - `fairino_dualarm_planner`
  - `joint_state_aggregator`
  - `execution_adapter`
  - `dualarm_bringup`
- `xacro` 展开后可看到真实 `left_j1..left_j6`、`right_j1..right_j6` 和 `left_tcp/right_tcp`。
- `ros2 launch fairino_dualarm_moveit_config move_group.launch.py` 已真实拉起 `move_group`，日志出现 `You can start planning now!`。
- `debug.launch.py` 已能包含 MoveIt bringup，且 C++ planner 不再因 `robot_description_semantic` 缺失崩溃。
- `PlanJoint(left_arm)` 成功返回真实非空轨迹，`result_code=success`。
- `PlanJoint(dual_arm)` 成功返回真实分拆后的 `joint_trajectory + secondary_joint_trajectory`，`synchronized=true`。
- `PlanPose(dual_arm)` 已经走真实 MoveIt 规划路径，对示例 pose 返回真实失败码 `collision`，不再伪造轨迹。

## 下一步
- Wave 2：
  - `planning_scene_sync` 真接 MoveIt PlanningScene，处理 world/attached object
  - `scene_fusion` / managed scene 的 scene_version 联动修正
  - `execution_adapter` 双臂同步协议、真实 skew 测量、primitive dispatcher
  - 对外保留 Wave 1 planner 成功样例作为回归基线

## Debug Fallback
- 若 unified `dual_arm` 暂时无法稳定返回 production 可用轨迹，只允许保留 debug fallback。
- fallback 不能算 production complete。
