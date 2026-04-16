# dual-arm 工作区完整走读

创建时间：2026-04-15
更新时间：2026-04-15

## 结论

`/home/gwh/dashgo_rl_project/workspaces/dual-arm` 是一个独立的 ROS 2 Humble 双臂工作区，目标不是“做一个 MoveIt demo”，而是围绕 Fairino 双臂、夹爪、RGB-D 感知和比赛状态机，搭建一条可运行的双臂比赛执行链。

如果把用户提到的 `dualarms_ws` 映射到当前仓库，最合理的对应就是这个 `dual-arm` 工作区。

当前代码和文档共同指向一个清晰事实：

- 双臂 MoveIt 基础已经打通。
- 生产链的模块边界已经成型。
- 但生产闭环还没有完全收口，尤其卡在 `planning_scene_sync` 真同步、`scene_version` freshness 以及任务状态机中大量 primitive 仍是占位实现。

## 工作区组成

当前 `colcon list --names-only` 可见 25 个包：

- `ball_basket_pose_estimator`
- `camera_info_interceptor`
- `competition_start_gate`
- `depth_handler`
- `detector`
- `detector_adapter`
- `dualarm`
- `dualarm_bringup`
- `dualarm_interfaces`
- `dualarm_task_manager`
- `epg50_gripper_ros`
- `execution_adapter`
- `fairino3_v6_moveit2_config`
- `fairino3_v6_planner`
- `fairino_description`
- `fairino_dualarm_description`
- `fairino_dualarm_moveit_config`
- `fairino_dualarm_planner`
- `grasp_pose_generator`
- `joint_state_aggregator`
- `planning_scene_sync`
- `robo_ctrl`
- `scene_fusion`
- `tf_node`
- `tools`

可以按四层理解：

1. 新生产链
- `dualarm_interfaces`
- `detector_adapter`
- `depth_handler`
- `ball_basket_pose_estimator`
- `scene_fusion`
- `planning_scene_sync`
- `grasp_pose_generator`
- `execution_adapter`
- `dualarm_task_manager`
- `dualarm_bringup`
- `competition_start_gate`
- `joint_state_aggregator`
- `tf_node`

2. 规划资产
- `fairino_dualarm_description`
- `fairino_dualarm_moveit_config`
- `fairino_dualarm_planner`
- `fairino3_v6_moveit2_config`
- `fairino3_v6_planner`
- `fairino_description`

3. 硬件资产
- `robo_ctrl`
- `epg50_gripper_ros`
- `camera_info_interceptor`

4. 历史/兼容/调试资产
- `dualarm`
- `detector`
- `tools`
- `third_party/fairino_sdk`

## 主生产链

当前生产链可以概括为：

1. `detector` 从相机图像输出旧 `Bbox2dArray`
2. `detector_adapter` 把旧类别映射成统一 `Detection2DArray`
3. `depth_handler` 结合深度图生成瓶子/杯子类 `SceneObjectArray`
4. `ball_basket_pose_estimator` 用 ROI 深度中值法生成球和篮筐的 `SceneObjectArray`
5. `scene_fusion` 做 track、稳定性门控、ID 归一化和场景重发
6. `planning_scene_sync` 给场景对象叠加 reservation / attach 状态，生成 managed scene
7. `grasp_pose_generator` 把 `SceneObject` 转成 `GraspTarget`
8. `fairino_dualarm_planner` 调用 MoveIt 提供 `PlanPose / PlanJoint / PlanCartesian`
9. `execution_adapter` 把规划结果转成真实双臂和夹爪服务调用
10. `dualarm_task_manager` 通过 `RunCompetition` action 驱动比赛状态机
11. `competition_start_gate` 决定何时发起整轮比赛

其中真正的生产编排入口是：

- `src/bringup/dualarm_bringup/launch/competition.launch.py`

调试入口是：

- `src/bringup/dualarm_bringup/launch/debug.launch.py`

它们的区别是：

- `competition.launch.py` 可以按参数选择是否启动真实 detector、真实硬件、camera info interceptor。
- `debug.launch.py` 默认走 fake joint states，不接硬件，适合做规划和链路联调。

## 协议层

`dualarm_interfaces` 是整个新架构的中心合同层。

它定义了：

- 感知语义：`Detection2D`、`SceneObject`、`SceneObjectArray`
- 任务目标：`GraspTarget`
- 总控事件：`TaskEvent`
- 规划服务：`PlanPose`、`PlanJoint`、`PlanCartesian`
- 场景管理服务：`ReserveObject`、`ReleaseObject`、`AttachObject`、`DetachObject`
- 执行接口：`ExecuteTrajectory` action、`SetGripper` service
- 总控入口：`RunCompetition` action

这意味着新工作区已经从“节点间各传各的 topic”收敛为“围绕统一消息合同组装流水线”。

## 感知层

### detector

`detector` 是被冻结的旧 2D 检测器。

当前策略很明确：

- 不改模型权重
- 不改训练流程
- 不改 TensorRT 导出链
- 不再把球和篮筐需求塞回这个包

它仍然输出：

- `/detector/detections`

但生产链已经通过 `detector_adapter` 与它解耦。

### detector_adapter

`detector_adapter` 很轻量，只做一件事：

- 把旧 `class_id` 用 `class_map.yaml` 转成稳定语义类型

默认映射可读出：

- `0 -> water_bottle`
- `1 -> cola_bottle`
- `2 -> cup`

### depth_handler

`depth_handler` 是生产链里很关键的一段桥接层。

它的作用是：

- 输入 `Detection2DArray + depth image + camera_info`
- 读取 ROI 内深度
- 反投影到 3D
- 发布旧 `bbox3d`
- 同时发布新 `SceneObjectArray`

它已经做了几件重要兼容工作：

- 同时兼容 `16UC1` 和 `32FC1`
- 内部统一用米
- 同时保留旧消息接口和新消息接口
- 为对象补充任务级 subframe，如 `bottle_mouth`、`cup_fill_target`

因此它是旧检测结果进入新任务链的真正桥梁。

### ball_basket_pose_estimator

这个包专门服务于球和篮筐。

当前实现不是复杂几何拟合，而是一个骨架版几何估计器：

- 通过预设 ROI
- 在 ROI 内取有效深度中值
- 反投影出球/篮筐中心
- 输出 `SceneObjectArray`

它说明项目策略是：

- 球和篮筐暂时不再依赖旧 detector
- 先用规则几何方法把流程补齐

### scene_fusion

`scene_fusion` 负责把多源 `SceneObjectArray` 融合成一份“权威场景”。

它当前做的事情是：

- 按语义类型和空间距离做 track matching
- 累积 observations
- 根据稳定窗口与置信度判断 `stable`
- 维护 `observed / stable / lost` 生命周期
- 为 track 重新编号，例如 `water_bottle_1`
- 发布递增的 `scene_version`

但它还不是完整的物体跟踪器，也没有与 MoveIt PlanningScene 真同步。

## 规划层

### planning_scene_sync

这是当前 production 最大的未收口点。

它目前做的是：

- 接收 `scene_fusion/raw_scene_objects`
- 维护 reservation 映射
- 维护 attached_link 映射
- 通过服务更新这些 overlay 状态
- 再把 managed scene 发布到 `/scene_fusion/scene_objects`

它目前没有做的是：

- 没有把 collision object 写进 MoveIt PlanningScene
- 没有把 attached object 真 attach 给 MoveIt

所以它现在更像“场景状态管理器”，还不是“PlanningScene 真同步器”。

### grasp_pose_generator

这是一个规则模板生成器，而不是学习型抓取规划器。

它会根据 `SceneObject.semantic_type`：

- 选 `left_arm / right_arm / dual_arm`
- 生成 `pregrasp / grasp / operate / retreat / place / release`
- 根据 subframe 改写某些目标位姿
- 为不同语义选择 `strategy_id / gripper_profile / execution_profile`

典型规则包括：

- 篮球、足球走 `dual_arm`
- `cola_bottle` 偏右臂
- 其他对象默认左臂

### fairino_dualarm_moveit_config

这是当前双臂 MoveIt 配置的核心。

关键事实：

- 组名是 `left_arm / right_arm / dual_arm`
- TCP 是 `left_tcp / right_tcp`
- 双臂组是由左右两个单臂 group 组成
- OMPL 使用 `RRTConnect`

### fairino_dualarm_planner

这个包是新生产链里的真正规划服务节点。

它不是自己做 IK，而是 MoveIt 适配器：

- 提供 `/planning/plan_pose`
- 提供 `/planning/plan_joint`
- 提供 `/planning/plan_cartesian`

它做的关键保护：

- 规划前检查 `scene_fusion` 数据是否过期
- 规划前检查 `/L/robot_state`、`/R/robot_state` 是否过期
- 双臂规划时拆分联合轨迹为左右两条

当前双臂 `PlanPose` 的实现方式值得注意：

- 不是从两个 TCP 独立输入目标
- 而是拿同一个目标 pose
- 再在 `y` 方向加减 `dual_arm_half_span`

所以它更像“围绕中心点构造一个对称双臂目标”，适合骨架联调，但还不是成熟的双臂抓取几何求解。

另外：

- `PlanCartesian` 明确还不支持 `dual_arm`

### fairino3_v6_planner

这是旧单臂规划器，仍然保留：

- `target_pose` 话题订阅
- `get_trajectory_poses`
- `get_joint_states`

它对理解历史链路有用，但不是当前双臂生产主链核心。

## 执行层

### robo_ctrl

`robo_ctrl` 是真实 Fairino 机械臂 ROS 接口层。

它完成的事情包括：

- 用 Fairino SDK 建立 RPC 连接
- 暴露 `robot_move / robot_move_cart / robot_servo / robot_servo_line / robot_servo_joint / robot_set_speed`
- 持续发布 `/L|R/robot_state`
- 持续发布 `/L|R/joint_states`
- 发布各自局部 TF

它内部带有：

- 状态线程
- 通信断开自动重连
- MoveCart 错误恢复尝试
- TF 发布
- 大量历史调试输出和兼容逻辑

因此它是生产中最“老”和最“重”的包之一。

### execution_adapter

`execution_adapter` 是新架构里规划到硬件的桥接层。

它负责：

- 把 MoveIt 的 rad 轨迹转为 `robo_ctrl` 需要的 degree
- 调用 `/L|R/robot_servo_joint`
- 调用 `/L|R/robot_move_cart`
- 调用 `/epg50_gripper/command`
- 根据成功结果触发 `attach_object / detach_object`

双臂执行时它会：

- 左右臂分别发服务请求
- 记录两次发送时刻差，形成 `sync_skew_ms`
- 若偏差超过阈值则返回 `sync_violation`

说明这层已经开始考虑双臂同步约束。

### epg50_gripper_ros

这是夹爪串口驱动，基于 Modbus RTU。

它提供：

- `epg50_gripper/command`
- `epg50_gripper/status`
- `epg50_gripper/rename`
- `epg50_gripper/status_stream`

`execution_adapter` 的 `SetGripper` 就是通过这里落到真实夹爪。

## 任务层

### dualarm_task_manager

这是整个系统的业务总控中心。

它通过 `/competition/run` action 跑一个很长的状态机，覆盖：

- 开机、自检、加载标定、归位、等待开始
- 球交接/放球流程
- 倒水、倒可乐流程
- 收尾和结束

它已经具备完整的：

- 状态枚举
- 事件发布
- 调规划服务
- 调执行 action
- 调 reservation / release
- 调 gripper

但大量步骤仍然是骨架，例如：

- `OPEN_WATER_CAP`
- `OPEN_COLA_CAP`
- `EXECUTE_WATER_POUR`
- `EXECUTE_COLA_POUR`

这些步骤现在只是占位成功，不代表动作已经完成。

### competition_start_gate

它是一个简单但实用的入口：

- 可以等外部 `Bool` 信号
- 也可以自动定时发起
- 一旦触发，就往 `/competition/run` 发送 `RunCompetition` goal

## TF 与聚合层

### tf_node

`tf_node` 只做一件事：

- 从 `calibration_transforms.yaml` 读取静态变换并广播

当前默认配置定义了：

- `world -> table`
- `world -> left_base`
- `world -> right_base`
- `left_tcp -> left_camera`

它相当于当前系统的静态坐标权威源。

### joint_state_aggregator

这个包的作用很明确：

- 订阅 `/L/joint_states`
- 订阅 `/R/joint_states`
- 拼成统一 `/joint_states`

MoveIt 双臂配置正是依赖这个统一 joint state。

## bringup 层

当前实际生产入口是 `dualarm_bringup`。

`competition.launch.py` 会按顺序 include：

- `tf_node`
- `detector_adapter`
- `depth_handler`
- `ball_basket_pose_estimator`
- `scene_fusion`
- `planning_scene_sync`
- `grasp_pose_generator`
- `joint_state_aggregator`
- `fairino_dualarm_moveit_config`
- `fairino_dualarm_planner`
- `execution_adapter`
- `dualarm_task_manager`
- `competition_start_gate`

可选再启：

- `detector`
- `camera_info_interceptor`
- `epg50_gripper_ros`
- 左右 `robo_ctrl`

所以这个 bringup 文件就是系统装配图。

## 历史与调试资产

### dualarm

`dualarm` 包现在更像兼容壳层。

它还保留一些老的 Kalman / 主控资产，但当前真正的 `robot_main.launch.py` 已经只转发到 `dualarm_task_manager`。

### robo_ctrl/high_level.cpp

这是一套更旧的高层接口：

- 自己做线性/圆弧轨迹插值
- 再调用 `robot_servo_line` / `robot_servo_joint`
- 带大量 TF 调试逻辑

它有调试和历史价值，但不是当前生产主线。

### tools

`tools` 是一个独立工具箱，主要覆盖：

- 双臂末端 TF 数据采集
- 手眼标定数据采集
- 静态 TF 发布
- fake gripper TF
- TF 点查询
- 键盘控制 TCP
- 标定脚本与 ArUco 生成

它不参与生产比赛闭环，但对标定、联调、人工操作非常重要。

## 第三方资产

`third_party/fairino_sdk` 已被纳入工作区。

已核对到：

- 版本：`v3.7.5.1`
- 记录日期：`2025-09-05`

这个目录包含控制器程序、库文件和脚本，不属于本仓库自研逻辑，但直接支撑 `robo_ctrl` 的运行。

## 当前状态判断

结合代码和 `STATE.md`，当前工程状态可以概括为：

已经完成：

- 双臂 URDF / SRDF / MoveIt 配置
- 双臂规划服务基础
- 轨迹到执行的桥接层
- 统一接口层
- 双臂比赛状态机骨架
- 主 bringup 装配

尚未完全完成：

- `planning_scene_sync` 真正写入 MoveIt PlanningScene
- 双臂抓取几何的更真实建模
- 状态机中多个比赛 primitive 的真实动作落地
- 与真实 `/L/joint_states`、`/R/joint_states` 的完整 production 联调
- 稳定测试资产与自动化回归

## 风险点

当前最需要带着警惕理解的点有六个：

1. `planning_scene_sync` 名字很像“场景同步已做完”，但实际上只是 overlay，不是真同步。
2. `dualarm_task_manager` 看起来流程完整，但许多关键动作仍是占位。
3. `detector`、`tools`、部分旧包里仍有旧工作区默认路径，不能直接照抄。
4. `robo_ctrl` 代码体量大、历史逻辑重，动它时需要极高谨慎。
5. `tests/` 目前只有目录，没有实测文件，说明系统主要靠手工 smoke 验证。
6. 当前双臂 `PlanPose` 还不是“物体感知驱动的双臂 grasp solver”，只是一个过渡实现。

## 推荐阅读顺序

如果下次继续，不必再从头扫整个工作区。推荐顺序是：

1. `README.md`
2. `STATE.md`
3. `src/bringup/dualarm_bringup/launch/competition.launch.py`
4. `src/interfaces/dualarm_interfaces/*`
5. `src/perception/*`
6. `src/planning/*`
7. `arm_planner/src/fairino_dualarm_*`
8. `src/control/execution_adapter`
9. `src/tasks/dualarm_task_manager`
10. `robo_ctrl`

如果目标是后续修 production，优先顺序建议改成：

1. `planning_scene_sync`
2. `fairino_dualarm_planner`
3. `execution_adapter`
4. `dualarm_task_manager`
5. `robo_ctrl`

## 本次走读产出

本次已经同步更新：

- `task_plan.md`
- `findings.md`
- `progress.md`

这些文件可以作为后续跨会话继续的工作记忆。
