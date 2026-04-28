# Runtime Architecture

创建时间：2026-04-26

## 目标

`dual-arm` 的运行时目标是把比赛任务拆成可观测、可恢复、可替换的软件链路：感知生成场景对象，规划生成轨迹，执行层桥接机器人和夹爪，任务管理器按比赛合同推进状态机，控制台提供软件-only 验收和人工入口。

## 数据流

```text
camera / mock stream
  -> detector / detector_adapter
  -> depth_handler / ball_basket_pose_estimator
  -> scene_fusion
  -> grasp_pose_generator / planning_scene_sync / fairino_dualarm_planner
  -> execution_adapter
  -> robo_ctrl / epg50_gripper_ros
  -> scene_fusion interaction update / task checkpoint
```

## 模块职责

- `perception/*`：只负责检测、深度恢复、对象语义和位姿估计，不直接做任务判定。
- `scene_fusion`：维护权威 `SceneObjectArray` 和 `scene_version`。
- `planning/*`：负责抓取目标、MoveIt 规划和 PlanningScene 同步。
- `execution_adapter`：把 `ExecuteTrajectory` / `ExecutePrimitive` 翻译成机器人和夹爪命令，并负责 stop/cancel/evidence。
- `robo_ctrl`：Fairino SDK 适配层，暴露 ROS service，不承担比赛语义。
- `epg50_gripper_ros`：EPG50 Modbus RTU 适配层。
- `dualarm_task_manager`：比赛状态机、checkpoint、任务顺序、对象选择和恢复。
- `competition_start_gate`：外部开赛信号到 `RunCompetition` action 的唯一默认授权路径。
- `competition_console_api`：本地控制台 API、软件验收、bringup 进程管理和安全鉴权。
- `competition_console_web`：前端控制台，不直接访问 ROS graph。
- `competition_rviz_tools`：可视化和人工调试，不发真实动作。

## 配置流

- 统一 profile：`config/profiles/competition_default.yaml`。
- 安全限制：`config/control/safety_limits.yaml`。
- 比赛对象几何：`config/competition/object_geometry.yaml`。
- 任务阈值与证据要求：`config/competition/task_thresholds.yaml`。
- 环境覆盖：模型路径使用 `DUALARM_DETECTOR_MODEL_PATH`，控制台 host/port/token 使用 `DUAL_ARM_CONSOLE_*`。

## 关键接口

- `/scene_fusion/scene_objects`：权威场景对象。
- `/planning/plan_pose`：单/双臂目标规划。
- `/execution/execute_trajectory`：轨迹执行 action。
- `/execution/execute_primitive`：开盖、倒水、持球、释放等 primitive action。
- `/competition/run`：比赛任务状态机 action。
- `/competition/start_signal`：外部开赛 gate。
- `/api/*`：控制台 HTTP API，默认仅监听本机。

## 扩展方式

- 更换检测模型：改 profile/env 与 class map，不改任务状态机。
- 更换机器人/夹爪驱动：保持 `execution_adapter` 消费的 service/action 合同。
- 增加任务：先更新比赛合同、`task_contract.py`、状态机、checkpoint schema 和接口测试。
- 增加可视化：放在 `competition_rviz_tools`，不得直接发硬件动作。
