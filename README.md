# dual-arm

当前 `test` 工作区已进入单工作区收口阶段，正式包根统一为 `src/`，并围绕“感知 -> authoritative scene -> MoveIt / primitive -> task manager -> console”重构为双臂比赛运行时。

## 当前目录结构

```text
dual-arm/
├── src/
│   ├── perception/
│   ├── planning/
│   ├── control/
│   ├── tasks/
│   ├── ops/
│   ├── transforms/
│   ├── compat/
│   └── tools/
├── config/
├── docs/
├── .artifacts/checkpoints/competition/
├── .codex/tmp/resume/
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
7. `fairino_dualarm_planner` 暴露 `PlanPose/PlanJoint/PlanCartesian/PlanDual*`
8. `execution_adapter` 暴露 `ExecuteTrajectory`、`ExecutePrimitive` 与 `SetGripper`
9. `dualarm_task_manager` 以 `RunCompetition` action 驱动状态机并写入 checkpoint
10. `competition_console_api` 提供统一测试、验收与断点恢复 API
11. `competition_console_web` 提供统一浏览器控制入口

## 启动方式

### 生产 bringup

```bash
cd /home/gwh/dashgo_rl_project/workspaces/dual-arm
source /opt/ros/humble/setup.bash
source install/setup.bash
ros2 launch dualarm_bringup competition_integrated.launch.py
```

顶层兼容入口也保留：

```bash
ros2 launch dualarm_bringup competition.launch.py
ros2 launch dualarm_bringup competition.launch.py
# legacy/debug only:
ros2 launch dualarm_bringup debug.launch.py
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

- `detector` 仍视为冻结包，不改模型、训练、导出和类别定义。
- 正式相机为左臂固连深度相机，`left_camera` 为安装基准 frame。
- 球和篮筐的正式主链改为 detection-driven 3D，ROI 只保留为 debug fallback。
- `high_level_node` 仍保留用于调试，但默认不进入生产链。
- 正式构建入口为 `colcon build --base-paths src`。

## 验证

```bash
colcon list --names-only
ros2 interface show dualarm_interfaces/msg/SceneObjectArray
ros2 interface show dualarm_interfaces/action/RunCompetition
ros2 pkg executables competition_console_api
ros2 pkg executables fairino_dualarm_planner
ros2 pkg executables execution_adapter
ros2 pkg executables dualarm_task_manager
```
