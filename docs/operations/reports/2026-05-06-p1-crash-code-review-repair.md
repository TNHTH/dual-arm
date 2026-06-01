# 2026-05-06 P1 崩溃风险代码审查修复记录

## 范围

- 本轮只处理 P1 崩溃风险、异常路径、资源生命周期、线程安全和未定义行为。
- 未执行真实机械臂运动、未调用夹爪动作、未调用 `/competition/run`。
- 未回滚已有 Gazebo/quick/perception/P0 脏变更；P1 结果受当前脏工作区影响，已在下方单独列出。

## Dirty Baseline

- `git status --short` 在本轮开始和结束均显示大量既有脏变更，主要来自：
  - Gazebo full sim + quick hybrid 半实现：`packages/simulation/**`、`competition_gazebo_full.launch.py`、quick computed 模块、sim/quick 配置。
  - 感知建模参数链路未验证改动：`object_geometry.yaml`、`depth_handler` launch/CMake/package、`depth_processor_node.*`。
  - P0 安全批次改动：`robo_ctrl` 急停 gate、quick `stop_all()`、compat fake-success 拒绝、键盘控制 mm->m。
- 本轮 P1 实际触达文件：
  - `packages/control/robo_ctrl/src/robo_ctrl_node.cpp`
  - `packages/perception/depth_handler/include/depth_handler/cluster.hpp`
  - `packages/planning/planners/fairino_dualarm_planner/src/fairino_dualarm_planner_node.cpp`
  - `packages/planning/planning_scene_sync/scripts/planning_scene_sync_node.py`
  - `packages/planning/legacy/fairino3_v6_planner/include/fairino3_v6_planner/pose_goal_planner.hpp`
  - `packages/planning/legacy/fairino3_v6_planner/src/pose_goal_planner.cpp`
  - `packages/perception/depth_handler/include/depth_handler/depth_processor_node.hpp`
  - `packages/perception/depth_handler/src/depth_processor_node.cpp`
  - `packages/perception/detector/include/detector/lw_detr.hpp`
  - `packages/perception/detector/src/lw_detr.cpp`
  - `packages/ops/competition_console_api/scripts/competition_console_api_node.py`
  - `tests/unit/test_p1_crash_contracts.py`
  - `tests/unit/test_p1_runtime_stress.py`

## 修复内容

- `robo_ctrl`：
  - `RobotServoLine` / `RobotServoJoint` 外层 `catch` 现在明确 `response->success=false`、`response->message=e.what()`。
  - ServoJ 线程调用 SDK 前复制 `JointPos mutable_target_pose`，删除 `const_cast<JointPos*>`。
- `depth_handler` KDTree：
  - OpenMP 并发路径删除 `std::vector<bool>`，改为 `std::vector<std::atomic<std::uint8_t>>` + `compare_exchange_strong` claim。
- `fairino_dualarm_planner`：
  - `latest_scene_`、`left_robot_state_`、`right_robot_state_` 读写加 `state_mutex_`。
  - 当前节点使用 `MultiThreadedExecutor`；本轮只在共享状态读写处加锁，MoveIt planning 仍在锁外执行。
- `planning_scene_sync`：
  - `_handle_scene()` 中 `_raw_scene`、`_object_cache`、`_object_last_seen_monotonic` 写入改到 `_sync_lock` 内，并对 raw scene 做 `deepcopy`。
  - `_has_live_object()` 读取 cache/last_seen 时加同一把锁。
- legacy `fairino3_v6_planner`：
  - `planToPose()` 改用局部 `planned_plan` 执行 MoveIt planning；成功后短锁复制到 `current_plan_`。
  - service response 使用本次局部 plan，`executePlan()` 锁内复制快照、锁外执行。
- `depth_processor_node`：
  - `camera_info_` 与 `table_scene_` 改为 `shared_ptr<const ...>`。
  - 回调写入时复制为不可变快照；同步处理入口锁内复制 shared_ptr，锁外执行图像/点云循环和桌面剔除。
- `LwDetr`：
  - CUDA/TensorRT/plugin 指针全部初始化为 `nullptr`。
  - 增加 CUDA API 返回值检查；保存 `dlopen` handle。
  - 析构顺序调整为：同步 stream、销毁 TRT context/engine/runtime、释放 device/host buffer、销毁 stream、释放 bindings、最后 `dlclose` plugin handle。
- `competition_console_api`：
  - 增加 `_core_process_lock`。
  - `_stop_core_process()` 锁内交换/清空 process/log handle，锁外执行 `killpg`/`wait`，处理 `ProcessLookupError`、`TimeoutExpired`、重复 stop 和进程已退出竞态。

## 状态分类

- #7 Servo 异常返回：已修改待验证。静态合同、P0/P1 pytest、核心构建通过；未做 service failure-injection runtime。
- #8 ServoJ `const_cast` UB：已修改待验证。源码合同确认 `const_cast` 删除且核心构建通过；未做 SDK runtime。
- #9-#11 KDTree 并发：已关闭。源码合同确认不再使用 `vector<bool>` 并使用 atomic claim；`test_kdtree_atomic_claim_runtime_stress` 在 OpenMP 8 线程下重复构建 120 轮聚类并通过，核心包构建通过。
- #12-#13 planner scene/robot state 并发：已修改待验证。源码合同和核心构建通过；未做 TSAN/stress。
- #14 PlanningSceneSync cache 并发：已关闭。源码合同、py_compile、核心构建通过；`test_planning_scene_sync_cache_runtime_stress` 使用 4 个 writer + 4 个 reader 重复压测 `_handle_scene()` / `_has_live_object()` 并通过。
- #15 legacy planner `current_plan_` 并发：环境阻塞。源码合同通过；该 legacy 包含 `COLCON_IGNORE`，`colcon` 无法发现 `fairino3_v6_planner`，未获得构建或 stress 证据。
- #16 depth_processor camera/table scene 并发：已修改待验证。源码合同和核心构建通过；未做 TSAN/stress。
- #17 LwDetr CUDA/TensorRT 生命周期：已修改待验证。detector 单独构建通过；构建警告本机未设置自定义 TensorRT plugin，未做 CUDA/TensorRT runtime inference。
- #18 competition_console_api stop 并发：已关闭。源码合同与 py_compile 通过；`test_competition_console_stop_runtime_stress` 使用 16 个并发 stopper 压测 `_stop_core_process()`，确认进程终止、状态清空且无异常。

## 验证证据

- `/usr/bin/python3 -m py_compile packages/planning/planning_scene_sync/scripts/planning_scene_sync_node.py packages/ops/competition_console_api/scripts/competition_console_api_node.py tests/unit/test_p1_crash_contracts.py`：通过。
- `/usr/bin/python3 -m pytest -q tests/unit/test_p0_safety_contracts.py tests/unit/test_p1_crash_contracts.py`：`13 passed in 0.03s`。
- `/usr/bin/python3 -m py_compile tests/unit/test_p1_runtime_stress.py`：通过。
- `/usr/bin/python3 -m pytest -q tests/unit/test_p1_runtime_stress.py`：`3 passed in 9.49s`。
- `/usr/bin/python3 -m py_compile packages/planning/planning_scene_sync/scripts/planning_scene_sync_node.py packages/ops/competition_console_api/scripts/competition_console_api_node.py tests/unit/test_p1_crash_contracts.py tests/unit/test_p1_runtime_stress.py`：通过。
- `/usr/bin/python3 -m pytest -q tests/unit/test_p0_safety_contracts.py tests/unit/test_p1_crash_contracts.py tests/unit/test_p1_runtime_stress.py`：`16 passed in 9.32s`。
- `git diff --check`：通过。
- `source /opt/ros/humble/setup.bash && colcon build --base-paths packages --packages-select robo_ctrl depth_handler fairino_dualarm_planner planning_scene_sync fairino3_v6_planner competition_console_api`：
  - `fairino3_v6_planner` 被报告为 unknown package。
  - `robo_ctrl depth_handler planning_scene_sync competition_console_api fairino_dualarm_planner` 构建通过，`5 packages finished [3.07s]`。
- `source /opt/ros/humble/setup.bash && colcon build --base-paths packages --packages-select robo_ctrl depth_handler fairino_dualarm_planner planning_scene_sync competition_console_api`：`5 packages finished [3.93s]`。
- `source /opt/ros/humble/setup.bash && colcon build --base-paths packages/planning/legacy/fairino3_v6_planner --packages-select fairino3_v6_planner`：`Summary: 0 packages finished`，原因是该目录存在 `COLCON_IGNORE`。
- `source /opt/ros/humble/setup.bash && colcon build --base-paths packages --packages-select detector`：通过，`1 package finished [2.28s]`；stderr 仅提示未检测到自定义 TensorRT plugin。
- 进程检查：`pgrep -af 'sleep 30|kdtree_stress'` 只匹配检查命令本身，runtime stress 自建进程无残留；`pgrep -af 'ros2 launch|move_group|fairino_dualarm_planner|planning_scene_sync|competition_console_api'` 发现既有 Gazebo/MoveIt/PlanningScene 相关进程，本轮未启动 launch、未依赖 ROS graph、未清理这些其他窗口/既有进程。

## 未覆盖

- 未运行 TSAN、sanitizer、valgrind。
- 未运行 planner scene/robot state、legacy planner、depth_processor 的可重复 stress test 或 TSAN；这些并发项仍不能标为已关闭。
- 未运行 LwDetr CUDA/TensorRT 推理 runtime。
- 未运行 Servo service failure injection 或 SDK runtime。
- 未执行实机急停、运动链路、执行器或夹爪验证。
