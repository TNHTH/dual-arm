# dual-arm

当前 `test` 工作区已按 `/home/gwh/现存问题.md` 与 `/home/gwh/修改方案.md` 开始重构为“冻结 2D detector、补全 3D/规划/执行/任务管理器”的双臂比赛架构。

## 当前目录结构

```text
dual-arm/
├── arm_planner/src/                  # 旧单臂规划资产 + 新 dual-arm planner 骨架
├── depth_handler/                    # 兼容保留的 3D 估计包，现已输出 SceneObjectArray
├── detector/                         # 冻结，不改模型/训练/TensorRT 导出
├── dualarm/                          # 兼容 launch 壳层，转发到 dualarm_task_manager
├── launch/competition.launch.py      # 顶层兼容启动入口
├── src/interfaces/dualarm_interfaces
├── src/perception/
│   ├── detector_adapter
│   ├── ball_basket_pose_estimator
│   └── scene_fusion
├── src/planning/
│   └── grasp_pose_generator
├── src/control/
│   └── execution_adapter
├── src/tasks/
│   └── dualarm_task_manager
├── src/transforms/
│   └── tf_node
├── src/bringup/
│   └── dualarm_bringup
└── third_party/fairino_sdk/          # 迁入的新第三方 Fairino 资产目录
```

## 生产链

生产链现在按下面的顺序组织：

1. `detector` 输出旧的 `detector/msg/Bbox2dArray`
2. `detector_adapter` 归一化为 `dualarm_interfaces/msg/Detection2DArray`
3. `depth_handler` 生成瓶子/杯子的 `SceneObjectArray`
4. `ball_basket_pose_estimator` 生成球和篮筐的 `SceneObjectArray`
5. `scene_fusion` 输出权威场景状态
6. `grasp_pose_generator` 生成 `GraspTarget`
7. `fairino_dualarm_planner` 暴露 `PlanPose/PlanCartesian/PlanJoint`
8. `execution_adapter` 暴露 `ExecuteTrajectory` action 与 `SetGripper` 服务
9. `dualarm_task_manager` 以 `RunCompetition` action 驱动状态机

## 启动方式

### 生产 bringup

```bash
cd /home/gwh/dashgo_rl_project/workspaces/dual-arm
source /opt/ros/humble/setup.bash
source install/setup.bash
ros2 launch dualarm_bringup competition.launch.py
```

顶层兼容入口也保留：

```bash
ros2 launch dualarm_bringup competition.launch.py
# 或
ros2 launch dualarm_bringup debug.launch.py
# 或
ros2 launch dualarm robot_main.launch.py
```

### 构建

```bash
cd /home/gwh/dashgo_rl_project/workspaces/dual-arm
./build_workspace.sh
```

### 进入环境

```bash
cd /home/gwh/dashgo_rl_project/workspaces/dual-arm
./use_workspace.sh
```

## 当前约束

- `detector` 视为冻结包，不改模型、训练、导出和类别定义。
- 球和篮筐的能力由 `ball_basket_pose_estimator` 提供几何 RGB-D 骨架。
- `high_level_node` 仍保留用于调试，但默认不进入生产链。
- `robo_ctrl_L.launch.py` / `robo_ctrl_R.launch.py` 已移除 `sudo chmod 777 /dev/ttyACM0`。

## 验证

```bash
colcon list --names-only
ros2 interface show dualarm_interfaces/msg/SceneObjectArray
ros2 interface show dualarm_interfaces/action/RunCompetition
ros2 pkg executables detector_adapter
ros2 pkg executables fairino_dualarm_planner
ros2 pkg executables execution_adapter
ros2 pkg executables dualarm_task_manager
```
