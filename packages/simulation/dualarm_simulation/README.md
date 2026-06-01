# dualarm_simulation

`dualarm_simulation` 是正式比赛主链的 Gazebo/语义仿真辅助包。

## 节点

- `sim_truth_manager`：发布 `/perception/sim_scene_objects`，并接收 `/simulation/truth_command` 更新对象状态。
- `sim_robot_state_publisher`：发布 `/L/robot_state`、`/R/robot_state` 和左右 joint state，接收 sim joint setpoint。
- `sim_pour_state_manager`：接收 `/simulation/pour_event`，发布 `/competition/pour_state` JSON 证据。

## 配置

默认配置为 `config/competition_gazebo_full.yaml`，由 `dualarm_bringup` 的 `competition_gazebo_full.launch.py` 引用。

