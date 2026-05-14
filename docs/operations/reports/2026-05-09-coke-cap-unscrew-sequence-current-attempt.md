# 2026-05-09 可乐拧瓶盖完整序列当前执行尝试

## 结论

已按当前项目规则读取 DualArm 项目状态、工程规范、历史门禁、Obsidian 项目入口和 `/home/gwh/下载/位置` 下 6 张控制器截图。6 个截图位姿与已落盘 JSON 对齐，完整序列已通过 runner 展开为 30 步。

本轮没有执行真实机械臂运动，没有执行夹爪开合，没有启动 `robo_ctrl`、MoveIt、planner、`execution_adapter` 或夹爪节点。真实执行被硬件 token 门禁阻断：当前环境 `DUALARM_HARDWARE_CONFIRM_TOKEN=unset`。

## 序列解释

用户要求序列：

`1 -> 右夹爪张开 -> 2 -> 3 -> 右夹爪夹紧 -> 4 -> (5 -> 左夹爪夹紧 -> 6 -> 左夹爪松开) * 6`

runner 展开为 30 步：

- 关节目标动作共 15 步。
- 夹爪动作共 15 步。
- 右夹爪张开：`right_arm`、slave `10`、`position=0`。
- 右夹爪夹紧：`right_arm`、slave `10`、`position=220`。
- 左夹爪夹紧循环 6 次：`left_arm`、slave `9`、`position=220`。
- 左夹爪松开循环 6 次：`left_arm`、slave `9`、`position=0`。

## 本轮修复

检查现有 `packages/tools/tools/scripts/coke_cap_unscrew_sequence_runner.py` 时发现 runner 存在门禁实现缺陷：

- `main()` 调用 `hardware_token_matches()` 写入报告。
- 源文件中缺少该函数定义。
- `validate_execute_gates()` 当时只检查 `--operator-confirm-site`，没有把 token mismatch 纳入 blocker。

已修复：

- 补回 `hardware_token_matches()`。
- `execute` 模式下重新要求 `DUALARM_HARDWARE_CONFIRM_TOKEN` 非空且与 `--hardware-confirm-token` 匹配。
- 默认报告目录加入 `mode` 和毫秒，避免同一秒 dry-run 与 execute gate 覆盖同一份报告。

## 验证证据

- `DUALARM_HARDWARE_CONFIRM_TOKEN=unset`。
- stale process 检查未发现关键 ROS/MoveIt/robo_ctrl/夹爪运行残留；输出只包含本次 `pgrep` 命令自身。
- `/usr/bin/python3 -m py_compile packages/tools/tools/scripts/coke_cap_unscrew_sequence_runner.py`：通过。
- 源码入口 execute gate：
  - 命令：`/usr/bin/python3 packages/tools/tools/scripts/coke_cap_unscrew_sequence_runner.py --mode execute --repeat-left-twist 6 --operator-confirm-site --hardware-confirm-token TEST`
  - 结果：`blocked: hardware_confirm_token_mismatch_or_unset`
  - 报告：`.codex/tmp/runtime/coke-cap-unscrew-sequence-20260509-source-execute-gate-after-fix/coke_cap_unscrew_sequence_report.json`
- 安装树刷新：
  - 先删除生成产物 `build/tools`、`install/tools`。
  - 第一次重建失败，因为 CMake 选中 `/usr/local/miniconda/bin/python3`，ROS `rosidl_adapter` 缺少 `em`。
  - 使用 `/usr/bin/python3` 强制重建：`colcon build --base-paths packages --packages-select tools --cmake-args -DPython3_EXECUTABLE=/usr/bin/python3 -DPYTHON_EXECUTABLE=/usr/bin/python3`。
  - 结果：`1 package finished`；仅有 Conda `libcurl` runtime search path 警告。
- 安装入口 dry-run：
  - 命令：`ros2 run tools coke_cap_unscrew_sequence_runner.py --mode dry-run --repeat-left-twist 6`
  - 结果：`dry-run ok: 30 steps`
  - 报告：`.codex/tmp/runtime/coke-cap-unscrew-sequence-20260509-installed-dry-run-after-fix/coke_cap_unscrew_sequence_report.json`
- 安装入口 execute gate：
  - 命令：`ros2 run tools coke_cap_unscrew_sequence_runner.py --mode execute --repeat-left-twist 6 --operator-confirm-site --hardware-confirm-token TEST`
  - 结果：`blocked: hardware_confirm_token_mismatch_or_unset`
  - 报告：`.codex/tmp/runtime/coke-cap-unscrew-sequence-20260509-installed-execute-gate-after-fix/coke_cap_unscrew_sequence_report.json`
- 安装树确认包含：
  - `hardware_token_matches`
  - `hardware_confirm_token_mismatch_or_unset`
  - `coke-cap-unscrew-sequence-{args.mode}-{timestamp}-{millis:03d}`

## 当前阻断

1. 当前环境没有设置 `DUALARM_HARDWARE_CONFIRM_TOKEN`。
2. 本轮没有现场安全确认运动范围内无人、无线缆、无非目标物。
3. `1..6` 点虽然已从图片读取并记录，但仍是 `screenshot_candidate`；真实执行仍必须依赖 runner 的逐段规划、执行后关节误差校验和当前 `/robot_state` gate。
4. 同日历史中仍存在 ServoJ timeout、左臂 ServoJ 未知异常和左臂 MoveJ 错误码 `154` 风险记录；本轮没有实机复测关闭这些风险。

## 下一步入口

若要真正执行完整序列，现场必须先设置非空 `DUALARM_HARDWARE_CONFIRM_TOKEN`，并只在确认运动范围安全后运行安装入口的 `execute` 模式。执行入口必须保留逐段 plan、逐段 execute、最终关节误差校验；不得绕过 token gate。
