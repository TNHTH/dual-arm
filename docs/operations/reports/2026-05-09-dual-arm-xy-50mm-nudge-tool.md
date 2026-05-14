# 2026-05-09 双臂 +X/+Y 50mm 增量移动工具生成记录

## 结论
- 已生成专用工具文件：`packages/tools/tools/scripts/dual_arm_xy_50mm_nudge.py`。
- 该工具默认 `dry-run`，真实执行必须同时满足：
  - `--mode execute`
  - `--operator-confirm-site`
  - `--hardware-confirm-token <TOKEN>`
  - 环境变量 `DUALARM_HARDWARE_CONFIRM_TOKEN` 与命令 token 匹配
- 工具支持左臂、右臂或双臂执行：
  - `+X 50 mm`
  - `+Y 50 mm`
- 本轮只做文件生成、语法检查、构建和 dry-run；没有启动 `robo_ctrl`，没有发送任何实机运动。

## 文件变更
- 新增：
  - `packages/tools/tools/scripts/dual_arm_xy_50mm_nudge.py`
- 修改：
  - `packages/tools/tools/CMakeLists.txt`
  - 已把脚本加入 `install(PROGRAMS ...)`，可通过 `ros2 run tools dual_arm_xy_50mm_nudge.py` 调用。

## 执行方式

默认 dry-run：

```bash
cd /home/gwh/dual-arm
source /opt/ros/humble/setup.bash
source install/setup.bash
export ROS_DOMAIN_ID=0

ros2 run tools dual_arm_xy_50mm_nudge.py --mode dry-run
```

真实执行双臂 `+X 50mm`、`+Y 50mm`：

```bash
cd /home/gwh/dual-arm
source /opt/ros/humble/setup.bash
source install/setup.bash
export ROS_DOMAIN_ID=0
export DUALARM_HARDWARE_CONFIRM_TOKEN='TOKEN'

ros2 run tools dual_arm_xy_50mm_nudge.py \
  --mode execute \
  --arm both \
  --directions x,y \
  --distance-mm 50 \
  --velocity 5 \
  --acceleration 5 \
  --ovl 5 \
  --operator-confirm-site \
  --hardware-confirm-token TOKEN
```

只测左臂：

```bash
ros2 run tools dual_arm_xy_50mm_nudge.py \
  --mode execute \
  --arm left \
  --directions x,y \
  --distance-mm 50 \
  --operator-confirm-site \
  --hardware-confirm-token TOKEN
```

只测右臂：

```bash
ros2 run tools dual_arm_xy_50mm_nudge.py \
  --mode execute \
  --arm right \
  --directions x,y \
  --distance-mm 50 \
  --operator-confirm-site \
  --hardware-confirm-token TOKEN
```

## 依赖的运行节点
- 左臂需要：
  - `/L/robot_move_cart`
  - `/L/robot_state`
- 右臂需要：
  - `/R/robot_move_cart`
  - `/R/robot_state`
- 工具不负责启动 `robo_ctrl`；执行前必须按低速参数先启动对应机械臂控制节点。

## 工具行为
- 每步执行前读取对应 `/L|R/robot_state`：
  - 必须 `motion_done=true`
  - 必须 `error_code=0`
- 每步调用对应 `/L|R/robot_move_cart`：
  - `use_increment=true`
  - `+X`: `[50, 0, 0, 0, 0, 0]`
  - `+Y`: `[0, 50, 0, 0, 0, 0]`
  - 单位为 mm / deg
- 每步执行后再次读取 `/L|R/robot_state`：
  - 计算 TCP 平移误差
  - 默认 `max_final_error_mm=5.0`
  - 若任一步失败，立即停止后续步骤
- 每次运行写出 JSON 报告：
  - `.codex/tmp/runtime/dual-arm-xy-50mm-nudge-*/dual_arm_xy_50mm_nudge_report.json`

## 验证证据
- 语法检查通过：

```bash
/usr/bin/python3 -m py_compile packages/tools/tools/scripts/dual_arm_xy_50mm_nudge.py
```

- diff 空白检查通过：

```bash
git diff --check -- packages/tools/tools/scripts/dual_arm_xy_50mm_nudge.py packages/tools/tools/CMakeLists.txt
```

- `tools` 包构建通过：

```bash
source /opt/ros/humble/setup.bash
colcon build --base-paths packages --packages-select tools \
  --cmake-args -DPython3_EXECUTABLE=/usr/bin/python3 -DPYTHON_EXECUTABLE=/usr/bin/python3
```

- 安装入口 dry-run 通过，展开 4 步：
  1. left `+X 50mm`
  2. left `+Y 50mm`
  3. right `+X 50mm`
  4. right `+Y 50mm`
- execute token 门禁验证通过：
  - `DUALARM_HARDWARE_CONFIRM_TOKEN` unset 时，`--mode execute --operator-confirm-site --hardware-confirm-token TEST` 返回 `hardware_confirm_token_mismatch_or_unset`。

## 当前边界
- 本轮没有启动 ROS 实机控制节点。
- 本轮没有发送 `/L|R/robot_move_cart` 请求。
- 本轮没有执行任何机械臂运动、Servo、MoveJ、MoveCart、程序运行或夹爪命令。
- 后续真实执行前必须清理旧 ROS 图，并确认左右臂周围 `+X/+Y 50mm` 空间安全。

## 2026-05-09 追加修复：rclpy client 字段冲突

### 触发
- 用户执行：

```bash
ros2 run tools dual_arm_xy_50mm_nudge.py \
  --mode execute \
  --hardware-confirm-token TOKEN
```

- 当时脚本进入左臂 `+X` 步骤后崩溃：
  - `AttributeError: 'str' object has no attribute '_executor_event'`
  - `KeyError: 0`

### 根因
- `CartesianNudgeRunner(Node)` 中使用了 `self._clients` 保存自定义 service client 字典。
- `rclpy.node.Node` 内部也使用 `_clients` 管理 client 列表。
- 自定义字段覆盖了 rclpy 内部结构，导致 executor 遍历 client 时拿到字符串 key，进而崩溃。

### 修复
- 将脚本中的自定义字段从 `self._clients` 改为 `self._move_cart_clients`。
- 将默认动作改为单独控制：
  - `--arm` 默认 `left`
  - `--directions` 默认 `x`
- 报告目录时间戳增加微秒，避免并行 dry-run 在同一秒覆盖报告。

### 追加验证
- `/usr/bin/python3 -m py_compile packages/tools/tools/scripts/dual_arm_xy_50mm_nudge.py`：通过。
- `git diff --check -- packages/tools/tools/scripts/dual_arm_xy_50mm_nudge.py`：通过。
- `colcon build --base-paths packages --packages-select tools --cmake-args -DPython3_EXECUTABLE=/usr/bin/python3 -DPYTHON_EXECUTABLE=/usr/bin/python3`：通过。
- 四条单独 dry-run 均通过：
  - `--arm left --directions x`
  - `--arm left --directions y`
  - `--arm right --directions x`
  - `--arm right --directions y`
- 用户原命令形态现在被正确门禁阻断：
  - 环境 token 匹配但缺 `--operator-confirm-site` 时返回 `operator_confirm_site_required`。
  - token unset 且带 `--operator-confirm-site` 时返回 `hardware_confirm_token_mismatch_or_unset`。

### 当前现场状态
- 检查时 ROS 图中存在用户已启动的 `/L_robo_ctrl`：
  - `ros2 launch robo_ctrl robo_ctrl_L.launch.py robot_ip:=192.168.58.2 ...`
- 本轮没有停止用户启动的 `/L_robo_ctrl`。
- 本轮追加验证没有发送真实 `/L|R/robot_move_cart` 请求。

## 2026-05-09 追加实测：当前姿态未跑通，工具回退到 fail-closed

### 结论
- 用户要求“先跑通”后，已在左臂实机上做最小实测。
- 当前左臂姿态下，`+X 50mm` 和 `+Y 50mm` 的 MoveCart 增量命令均未跑通，控制器返回 `112（目标位姿不可达）`。
- 临时验证过 Fairino `StartJOG` 路径，但该路径不能作为 50mm 精确单轴位移工具：
  - service success 不等于实际到达 50mm；
  - 实测中 TCP 发生 X/Z/Rx/Ry/Rz 伴随漂移；
  - 一次 `+Y` JOG 在约 `19.74mm` 进度后反向；
  - 一次 `+X` JOG 后 `StopJOG` 返回 `-1`。
- 因此已经撤回临时 JOG 服务和工具脚本中的 JOG 分支，当前工具只保留 `/L|R/robot_move_cart`，失败即停止。
- 当前不能把 Obsidian 中的 50mm execute 命令视为“已跑通可用”。它们只能代表接口形态，真实执行仍会在当前姿态附近失败或被门禁阻断。

### 关键实测结果
- 左臂初始代表 TCP：
  - `[-174.1445, 17.9621, 648.7233, -84.8372, -2.4995, 50.9761]`
  - `motion_done=true`
  - `error_code=0`
- 左臂 `+X 50mm` MoveCart：
  - report: `.codex/tmp/runtime/dual-arm-xy-50mm-nudge-20260509-163613-225185/dual_arm_xy_50mm_nudge_report.json`
  - 结果：`robot_move_cart_failed`
  - 错误：`执行MoveCart命令失败，错误码: 112（目标位姿不可达）`
- 左臂 `+Y 50mm` MoveCart：
  - report: `.codex/tmp/runtime/dual-arm-xy-50mm-nudge-20260509-163517-878277/dual_arm_xy_50mm_nudge_report.json`
  - 结果：`robot_move_cart_failed`
  - 错误：`执行MoveCart命令失败，错误码: 112（目标位姿不可达）`
- 左臂 `+X 5mm` MoveCart 尝试：
  - report: `.codex/tmp/runtime/dual-arm-xy-50mm-nudge-20260509-163904-217727/dual_arm_xy_50mm_nudge_report.json`
  - 结果：脚本等待超时，但实机约移动到 TCP `[-169.3244, 18.3297, 648.7629, ...]`，说明小步 MoveCart 与脚本完成语义仍需重新设计。
- 临时 JOG `+Y 50mm`：
  - report: `.codex/tmp/runtime/dual-arm-xy-50mm-nudge-20260509-164733-203387/dual_arm_xy_50mm_nudge_report.json`
  - 结果：`jog_progress_reversed`
  - 后续左臂出现 `error_code=1`，已用 `robot_mode_helper --normal-only --keep-mode` 清错并恢复 `error_code=0`。
- 临时 JOG `+X 5mm`：
  - report: `.codex/tmp/runtime/dual-arm-xy-50mm-nudge-20260509-165001-471910/dual_arm_xy_50mm_nudge_report.json`
  - 结果：`robot_jog_failed`
  - 错误：`JOG运动完成但StopJOG失败，错误码: -1`
  - 代表最终 TCP：`[-151.9719, 131.1456, 660.6482, -81.5161, -1.5220, 42.7854]`

### 已回退/修复
- 删除临时新增的 `RobotJog.srv`。
- `robo_ctrl` 不再创建 `/L|R/robot_jog` 服务。
- `dual_arm_xy_50mm_nudge.py` 不再导入 `RobotJog`，不再提供 `--method jog`。
- 撤回临时的 MoveCart `112 -> IK MoveJ` fallback，MoveCart 不可达时按失败返回。
- 清理 `build/robo_ctrl install/robo_ctrl` 后重建，避免已删除接口残留在 install tree。

### 当前验证证据
- `/usr/bin/python3 -m py_compile packages/tools/tools/scripts/dual_arm_xy_50mm_nudge.py`：通过。
- `git diff --check -- packages/control/robo_ctrl/CMakeLists.txt packages/control/robo_ctrl/include/robo_ctrl/robo_ctrl_node.hpp packages/control/robo_ctrl/src/robo_ctrl_node.cpp packages/tools/tools/scripts/dual_arm_xy_50mm_nudge.py`：通过。
- `rm -rf build/robo_ctrl install/robo_ctrl && colcon build --base-paths packages --packages-select robo_ctrl tools ...`：通过。
  - `tools` 仍有既有 Miniconda/libcurl RPATH warning。
- 安装树检查：
  - `ros2 interface list | rg 'robo_ctrl/srv/RobotJog|robo_ctrl/srv/RobotMoveCart'` 只显示 `robo_ctrl/srv/RobotMoveCart`。
  - `install/robo_ctrl` 中 `RobotJog` 残留已清除；仅 `install/robo_ctrl/include/libfairino/robot.h` 保留 SDK 原生 `StartJOG/StopJOG` 声明。
- dry-run 验证：
  - `ros2 run tools dual_arm_xy_50mm_nudge.py --mode dry-run --arm both --directions x,y` 成功展开 4 步。
- execute gate 验证：
  - token unset 时，`--mode execute --operator-confirm-site --hardware-confirm-token TEST` 返回 `hardware_confirm_token_mismatch_or_unset`。
- 收尾 ROS 图：
  - `ros2 node list` 无节点输出。
  - `ps -eo pid,args | rg 'ros2 launch|move_group|fairino_dualarm_planner|execution_adapter|robo_ctrl|robot_mode_helper|epg50|competition_console_api|planning_scene_sync' | rg -v 'rg '` 无输出。

### 当前边界与下一步
- 本工具当前没有跑通真实 `+X/+Y 50mm`。
- 后续若仍要实现“左右臂、+X/+Y 单独 50mm”，不能直接复用 JOG；建议改为：
  1. 先用当前位置做离线/SDK IK 可达性预检查；
  2. 将 50mm 拆成更小 MoveCart 增量；
  3. 每小步等待真实 `/robot_state` 稳定，并用 TCP 误差和正交漂移收口；
  4. 任何 `112`、`error_code != 0`、漂移超限或 timeout 立即停止；
  5. 只在当前姿态的四个方向分别通过实机微步验证后，才恢复 Obsidian execute 指令为可用状态。
