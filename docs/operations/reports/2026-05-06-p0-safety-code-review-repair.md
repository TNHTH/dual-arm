# 2026-05-06 P0 安全代码审查修复记录

## Scope

本轮执行实机代码审查修复计划的 P0 安全批次。边界为软件、mock、no-motion 验证；未执行真实机械臂运动，未调用夹爪 enable/open/close，未调用 `/competition/run`，未声明急停或执行器实机通过。

## Changes

- `packages/tools/tools/src/keyboard_tcp_controller.cpp`
  - 键盘 TCP 增量 `x/y/z` 从 mm 转为 ROS `Pose` 的 m。
- `packages/control/robo_ctrl/include/robo_ctrl/robo_ctrl_node.hpp`
- `packages/control/robo_ctrl/src/robo_ctrl_node.cpp`
  - 增加 `e_stop_active_` 与 `e_stop_state_known_` fail-closed gate。
  - 状态线程轮询 `GetRobotEmergencyStopState()`。
  - 急停状态未知或激活时拒绝 `RobotMove`、`RobotMoveCart`、motion/start 类 `RobotServo*` 和 `RobotSetSpeed`。
  - ServoEnd/stop 类 `command_type=1` 不被急停 gate 拦截。
- `packages/quick_competition/quick_competition/legacy_fairino_bridge.py`
  - `stop_all()` hardware 路径进入 fail-closed：拒绝后续软件运动/夹爪动作并返回失败。
  - 在缺少通用 `StopMotion/abort` 服务时，不用零速运动或假成功冒充停止；只做 best-effort ServoEnd。
  - rclpy 只在本函数实际初始化时 shutdown。
- `packages/quick_competition/quick_competition/quick_waypoint_recorder.py`
  - rclpy 只在本函数实际初始化时 shutdown。
- `packages/compat/dualarm/src/main.cpp`
  - 修复 `MultiThreadedExecutor executor()` most-vexing-parse。
- `packages/compat/dualarm/src/main_refactored.cpp`
  - 5 个未验证转发链路的 fake-success handler 改为 `success=false`。
- `tests/unit/test_p0_safety_contracts.py`
  - 增加 P0 静态合同和 `stop_all()` fail-closed mock 测试。

## Verification

- `/usr/bin/python3 -m py_compile packages/quick_competition/quick_competition/legacy_fairino_bridge.py packages/quick_competition/quick_competition/quick_waypoint_recorder.py tests/unit/test_p0_safety_contracts.py`
  - 通过，无输出。
- `/usr/bin/python3 -m pytest -q tests/unit/test_p0_safety_contracts.py`
  - `5 passed in 0.01s`。
- `git diff --check`
  - 通过，无输出。
- `git diff --check -- packages/tools/tools/src/keyboard_tcp_controller.cpp packages/control/robo_ctrl/include/robo_ctrl/robo_ctrl_node.hpp packages/control/robo_ctrl/src/robo_ctrl_node.cpp packages/compat/dualarm/src/main.cpp packages/compat/dualarm/src/main_refactored.cpp packages/quick_competition/quick_competition/legacy_fairino_bridge.py packages/quick_competition/quick_competition/quick_waypoint_recorder.py tests/unit/test_p0_safety_contracts.py`
  - 通过，无输出。
- `colcon build --base-paths packages --packages-select tools robo_ctrl quick_competition dualarm`
  - 通过：`Summary: 4 packages finished [1min 1s]`。
  - `dualarm` 仍输出既有 deprecated future conversion 和 ignored `std::async` return warning；本轮未按 P0 修改这些 warning。

## Residual Risk

- 急停 fail-closed 逻辑只做静态/构建验证，未做实机急停触发验证。
- `quick` hardware `stop_all()` 没有通用 `StopMotion/abort` 服务可验证，因此按设计返回失败并要求人工物理急停接管；best-effort ServoEnd 不等于完整停止能力。
- P1 并发、异常返回、资源生命周期和未定义行为尚未处理。
- P2 正确性/鲁棒性尚未处理，P0/P1 期间不得顺手混改。

## Next

进入 P1 崩溃风险批次。KDTree、planner scene/robot state、PlanningSceneSync cache、legacy planner plan、depth_processor 五处并发修复必须有 TSAN 或可重复 stress test 证据才能标记关闭；无证据只能标为“已修改待验证”。
