# 2026-05-01 Real Hardware / No-Motion Test Log

创建时间：2026-05-01 15:22 +0800
更新时间：2026-05-01 15:54 +0800
状态：no-motion 主链、只读实机状态、RViz 和控制台已拉起

## 结论

截至本记录更新时，当前项目已确认到“实机连接可达 + 软件主回归通过 + no-motion 主链启动通过 + 历史核心 smoke 通过 + 左右机械臂状态只读 ROS driver 通过 + 两只夹爪状态只读通过 + RViz/控制台已拉起”的阶段。

当前不能声明完整比赛任务链路已跑通实机动作。上一轮项目状态仍是软件-only v1 hardening；本次现场检测推进到低风险只读实机状态与 no-motion 运行态验证，未执行真实运动。

## 已读历史文件

- `AGENTS.md`
- `STATE.md`
- `/home/gwh/文档/Obsidian Vault/03_项目记录/DualArm项目上下文入口_2026-04-27_22-02.md`
- `README.md`
- `tests/README.md`
- `tests/hardware/README.md`
- `docs/operations/runbooks/safety.md`
- `docs/operations/runbooks/dual-arm-v1-hardware-interface-hardening.md`
- `.codex/tmp/resume/IMPLEMENTATION_BREAKPOINTS.md`
- `docs/architecture/runtime-architecture.md`
- `docs/reference/competition/dual-arm-competition-contract-2026-04-18.md`
- `.codex/tmp/error-trace/ERROR_TRACE.md`
- `.codex/tmp/continuous-learning/RETRO.md`

## 只读环境与硬件连接证据

- 当前工作目录：`/home/gwh/dual-arm`
- `install/setup.bash`：存在。
- stale process 检查：未发现正在运行的 `ros2 launch`、`move_group`、`fairino_dualarm_planner`、`competition_console_api`、`planning_scene_sync`、`scene_fusion`、`dualarm_task_manager`、`execution_adapter`、`robo_ctrl`、`epg50_gripper`、`rviz2`。
- 夹爪串口：
  - `/dev/serial/by-id/usb-Prolific_Technology_Inc._USB-Serial_Controller_A7BIb114J19-if00-port0 -> ../../ttyUSB0`
  - `/dev/serial/by-id/usb-Prolific_Technology_Inc._USB-Serial_Controller_A_COb114J19-if00-port0 -> ../../ttyUSB1`
- 相机设备：`/dev/video0` 到 `/dev/video17` 可见；本机缺少 `v4l2-ctl`，未做设备名枚举。
- 网络：
  - 主机有线网卡 `enp5s0`：`192.168.58.10/24`
  - 左臂 `192.168.58.2`：`ping` 成功，`8080/tcp` 可连接。
  - 右臂 `192.168.58.3`：`ping` 成功，`8080/tcp` 可连接。

## 软件回归证据

- `python3 scripts/check_path_hardcodes.py`：通过。
- `python3 scripts/check_readme_coverage.py`：通过，检查 59 个目录。
- `/usr/bin/python3 -m pytest -q tests/unit tests/integration packages/tasks/dualarm_task_manager/test/test_dualarm_task_contract.py packages/ops/competition_console_api/test/test_console_security.py`：`34 passed`。
- `ros2 interface show dualarm_interfaces/action/RunCompetition` 与 `dualarm_interfaces/action/ExecutePrimitive`：可显示，接口可见。
- `bash scripts/ci/software_check.sh`：通过。
  - 路径硬编码检查通过。
  - README 覆盖检查通过。
  - 顶层 pytest：`28 passed`。
  - colcon build：`5 packages finished`。
  - colcon test：`11 tests, 0 errors, 0 failures, 0 skipped`。
  - Vite 前端 build：通过。
  - Playwright smoke：`2 passed`。

## no-motion 运行态发现

尝试启动：

```bash
source /opt/ros/humble/setup.bash
source install/setup.bash
ros2 launch dualarm_bringup competition_core.launch.py \
  start_hardware:=false \
  start_detector:=false \
  start_camera_bridge:=false \
  use_mock_camera_stream:=false \
  publish_fake_joint_states:=true
```

结果：

- 首次失败于 launch 参数求值阶段，未进入实机控制节点。
- 报错：`Expected a non-empty sequence, with items of uniform type. Allowed sequence item types are bool, int, float, str.`
- `--debug` traceback 指向 `launch_ros.utilities.evaluate_parameters.evaluate_parameter_dict`。

分段定位：

- `fairino_dualarm_moveit_config move_group.launch.py publish_fake_joint_states:=true`：可启动到 `You can start planning now!`，短超时退出。
- `fairino_dualarm_planner fairino_dualarm_planner.launch.py`：可启动。
- `dualarm_task_manager dualarm_task_manager.launch.py`：可启动。
- `evidence_manager evidence_manager.launch.py`：可启动。
- `scene_fusion scene_fusion.launch.py`：初始失败。
- `execution_adapter execution_adapter.launch.py`：初始失败。

根因判断：

- ROS 2 Humble 对空列表参数推断不稳定；`DeclareLaunchArgument(default_value="[]")` 与节点 `declare_parameter(..., [])` 会在 launch/override 组合下触发空序列或 `BYTE_ARRAY` 类型冲突。

已做最小修复：

- `packages/perception/scene_fusion/launch/scene_fusion.launch.py`
- `packages/perception/scene_fusion/scripts/scene_fusion_node.py`
- `packages/control/execution_adapter/launch/execution_adapter.launch.py`
- `packages/control/execution_adapter/scripts/execution_adapter_node.py`
- `packages/bringup/dualarm_bringup/launch/competition.launch.py`
- `packages/bringup/dualarm_bringup/launch/competition_core.launch.py`
- `packages/bringup/dualarm_bringup/launch/competition_integrated.launch.py`

修复方式：

- 将空列表默认值从 `[]` / `"[]"` 改为空字符串 `""`。
- 保留节点已有 YAML/逗号解析逻辑，空字符串仍解析为空集合或空 topic 列表。
- 不改变 `allow_vendor_direct_cartesian=false` 默认语义。

已验证：

- `/usr/bin/python3 -m py_compile`：上述 launch / Python 节点通过。
- `colcon build --base-paths packages --packages-select dualarm_bringup scene_fusion execution_adapter`：通过。
- `ros2 launch scene_fusion scene_fusion.launch.py`：能启动到 `scene_fusion 已启动`。
- `ros2 launch execution_adapter execution_adapter.launch.py`：能启动到 `execution_adapter 已启动`。

后续补充修复：

- 完整 core 使用右侧 RGB-only topic 覆盖时，`scene_fusion` 仍因 `rgb_detection_topics` 从 `STRING` 变为 `STRING_ARRAY` 而失败。
- 已为 `scene_fusion` 的 `input_topics` / `rgb_detection_topics` 和 `execution_adapter` 的 `vendor_direct_cartesian_profiles` 增加动态类型参数声明。
- 已验证：
  - `scene_fusion` 带 `scene_fusion_rgb_detection_topics:="['/perception/right/detection_2d']"` 可启动。
  - `execution_adapter` 带 `vendor_direct_cartesian_profiles:="['debug']"` 可启动。

## no-motion 主链复测结果

完整 no-motion core 已启动成功：

```bash
source /opt/ros/humble/setup.bash
source install/setup.bash
ros2 launch dualarm_bringup competition_core.launch.py \
  start_hardware:=false \
  start_detector:=false \
  start_camera_bridge:=false \
  use_mock_camera_stream:=false \
  publish_fake_joint_states:=true
```

关键启动证据：

- `scene_fusion 已启动，输出: /scene_fusion/raw_scene_objects`
- `planning_scene_sync 已启动，输入: /scene_fusion/raw_scene_objects，输出: /scene_fusion/scene_objects`
- `execution_adapter 已启动`
- `dualarm_task_manager 已启动`
- `fairino_dualarm_planner C++ MoveIt 节点已启动`
- MoveIt 输出 `You can start planning now!`

ROS graph 证据：

- `/competition/run [dualarm_interfaces/action/RunCompetition]`
- `/execution/execute_primitive [dualarm_interfaces/action/ExecutePrimitive]`
- `/execution/execute_trajectory [dualarm_interfaces/action/ExecuteTrajectory]`
- `/move_action [moveit_msgs/action/MoveGroup]`
- `/move_group` 服务含 `/apply_planning_scene`、`/get_planning_scene`、`/plan_kinematic_path`、`/compute_ik`、`/execute_trajectory`。

## 历史 smoke 回归

- `smoke_resume_checkpoint.py`
  - 初始失败 1：旧脚本使用空 `task_sequence`，与当前任务合同冲突。
  - 初始失败 2：从 `SELF_CHECK` 恢复会继续执行到 `WAIT_START`，直接 action goal 被正确拒绝。
  - 修复：改成合法 `handover,pouring`，并用 `competition_done` 终态 checkpoint 只验证 checkpoint 加载/校验/action 返回，不绕过开赛 gate。
  - 结果：通过，输出 `resume checkpoint smoke passed`。
- `smoke_planning_scene_sync.py`
  - 结果：通过，输出 `planning_scene_sync smoke passed`。
- `smoke_scene_freshness.py`
  - 结果：通过，输出 `scene freshness smoke passed`。
- `smoke_camera_frames.py`
  - 当前 no-camera 配置下失败，输出 `camera topics missing`。
  - 解释：本轮 core 显式 `start_camera_bridge=false`，且该 smoke 仍检查旧 `/camera/*` topic，不代表本轮相机链路已验证失败；它表示本轮 no-motion 主链未覆盖相机桥接。

## 实机只读 ROS driver 证据

左右 `robo_ctrl` 均只启动状态节点，未调用运动服务。

左臂：

- 启动命令：`ros2 launch robo_ctrl robo_ctrl_L.launch.py robot_ip:=192.168.58.2 robot_port:=8080 state_query_interval:=0.2 start_high_level:=false start_gripper:=false`
- 日志：`成功连接到机器人`，`机器人状态监控线程已启动`
- `/L/robot_state`：
  - `joint_position`: `[141.3055, -65.3138, -65.3580, -127.4275, 82.4886, -99.3784]`
  - `tcp_pose`: `[-52.7244, 189.6678, 500.4628, 170.6456, -10.5222, 150.7632]`
  - `motion_done=true`
  - `error_code=0`

右臂：

- 启动命令：`ros2 launch robo_ctrl robo_ctrl_R.launch.py robot_ip:=192.168.58.3 robot_port:=8080 state_query_interval:=0.2 start_high_level:=false`
- 日志：`成功连接到机器人`，`机器人状态监控线程已启动`
- `/R/robot_state`：
  - `joint_position`: `[47.6145, -67.6790, -45.1736, -46.8794, -11.3301, 15.2127]`
  - `tcp_pose`: `[102.6655, -184.2709, 709.0603, -94.7671, 35.0236, -145.7707]`
  - `motion_done=true`
  - `error_code=0`

两侧服务类型可见：

- `/L/robot_move`: `robo_ctrl/srv/RobotMove`
- `/R/robot_move`: `robo_ctrl/srv/RobotMove`
- `/L/robot_move_cart`: `robo_ctrl/srv/RobotMoveCart`
- `/R/robot_move_cart`: `robo_ctrl/srv/RobotMoveCart`

未调用上述运动服务。

## 夹爪只读状态证据

只启动 EPG50 节点并调用 status service；未调用 enable/open/close/disable。

左夹爪：

- 端口：`/dev/serial/by-id/usb-Prolific_Technology_Inc._USB-Serial_Controller_A7BIb114J19-if00-port0`
- slave id：`9`
- 响应：`success=True`
- 状态：`gact=False`、`gsta=0`、`gobj=0`、`error=0`
- 位置/速度/力：`0/0/0`
- 电压/温度：`23V / 28C`
- `error_message='正常'`

右夹爪：

- 端口：`/dev/serial/by-id/usb-Prolific_Technology_Inc._USB-Serial_Controller_A_COb114J19-if00-port0`
- slave id：`10`
- 响应：`success=True`
- 状态：`gact=False`、`gsta=0`、`gobj=0`、`error=0`
- 位置/速度/力：`0/0/0`
- 电压/温度：`23V / 27C`
- `error_message='正常'`

## 可视化与控制台

RViz 使用安全入口启动：

```bash
ros2 launch competition_rviz_tools competition_rviz.launch.py \
  dry_run:=true \
  enable_action_bridge:=false \
  rviz:=true
```

证据：

- `RViz task bridge 已启动 ... enable_action_bridge=False, dry_run=True`
- `RViz interactive markers 已启动`
- `抓取 debug markers 已启动`
- `rviz2` 已启动，OpenGL `4.6`

控制台：

- API：`http://127.0.0.1:18080`
  - `/api/health` 返回 `{"status":"ok","profile":"test","node":"competition_console_api"}`
- Web：`http://127.0.0.1:18081/`
  - HTTP `200 OK`

注意：

- `/api/status` 中 `core_running=false` 是控制台 API 自身 process manager 没有启动 core 的状态，不代表手工启动的 ROS core 不在运行。
- 实际 ROS 进程已由 `pgrep` 确认，包括 `competition_core.launch.py`、`move_group`、`scene_fusion`、`planning_scene_sync`、`fairino_dualarm_planner`、`execution_adapter`、`dualarm_task_manager`、左右 `robo_ctrl`、RViz 工具和控制台服务。

## 当前任务链路阶段判断

当前已验证到：

1. 实机网络与串口存在性只读检查通过。
2. 软件-only 回归通过。
3. MoveIt / planner / task manager / evidence manager 子链可独立启动。
4. scene_fusion / execution_adapter 的 Humble 参数类型阻塞已定位并完成最小修复。
5. 完整 no-motion core 已启动成功。
6. checkpoint resume、PlanningScene sync、scene freshness 三条历史核心 smoke 已通过。
7. 左右机械臂 ROS driver 只读状态发布通过。
8. 两只夹爪只读 status 通过。
9. RViz dry-run 和本地控制台已拉起。

仍未验证：

- 相机桥接 / detector / depth 的真实相机链路。
- `start_hardware=true` 的整合 launch 一键启动。
- 任何真实机械臂运动、夹爪使能、夹爪开合、真实比赛任务动作。

## 安全边界

- 本次未发送机械臂运动命令。
- 本次未调用夹爪使能、开合或禁用命令。
- 真实动作前仍需现场确认：
  - 急停可达。
  - 人员离开机械臂运动空间。
  - 低速 profile。
  - 操作员明确允许从 no-motion 切到 hardware/action test。

## 下一步

1. 如需继续相机链路，单独启动相机桥接并更新本记录；不要把本次 no-camera smoke 解释成相机通过。
2. 如需执行真实运动，先另开安全确认记录，确认急停、人员、低速 profile 和任务范围。
3. 如需一键联调 `competition_core start_hardware=true`，先确认不会自动触发运动服务，再执行。

## 追加：真实相机桥接续测

### 严格比赛入口复现

追加尝试命令：

```bash
source /opt/ros/humble/setup.bash
source install/setup.bash
ros2 launch dualarm_bringup competition_core.launch.py \
  start_hardware:=false \
  start_detector:=false \
  start_camera_bridge:=true \
  start_table_surface_detector:=false \
  use_mock_camera_stream:=false \
  publish_fake_joint_states:=true
```

观测到：

- 左桥接启动，日志显示 `left_orbbec_gemini_bridge` 正常启动。
- 右桥接失败退出，报 `RuntimeError: 无法打开 Orbbec 彩色设备: /dev/video6`。
- `tf_frame_authority` 输出：
  - `left_tcp->left_camera(unverified)`
  - `right_tcp->right_camera(unverified)`
- 说明严格比赛入口下，世界系相机外参 TF 被 calibration gate 拦截，不是 bridge 自己静默丢失。

### 左相机单侧 no-motion 验证

为排除右相机设备冲突，并验证左相机真实链路，追加使用：

```bash
source /opt/ros/humble/setup.bash
source install/setup.bash
ros2 launch dualarm_bringup competition_core.launch.py \
  start_hardware:=false \
  start_detector:=false \
  start_camera_bridge:=true \
  start_table_surface_detector:=false \
  enable_right_camera:=false \
  allow_unverified_camera_extrinsics:=true \
  publish_fake_joint_states:=true
```

结果：

- `left_orbbec_gemini_bridge` 正常启动。
- `/left_camera/color/image_raw` 可读，`header.frame_id=left_camera_color_frame`。
- `/left_camera/depth/camera_info` 可读，`header.frame_id=left_camera_depth_frame`。
- TF 探针结果：
  - `world -> left_camera = true`
  - `left_camera -> left_camera_depth_frame = true`
  - `world -> left_camera_depth_frame = true`

结论：

- 左相机真实桥接链路在 no-motion 调试入口下已经拿到通过证据。
- 严格比赛入口下缺的是 `verified` 外参，而不是左相机 bridge 自身不可用。

### 设备身份补充

`/dev/v4l/by-id` 已确认两台 Orbbec 的稳定身份：

- `usb-Orbbec_R__Orbbec_Gemini_335_CP02653000G2-*`
- `usb-Orbbec_R__Orbbec_Gemini_335_CP1E5420007N-*`

这说明当前右相机失败不是“第二台相机不存在”，而是双相机 `auto` 设备选择尚未稳定区分左右设备。

### 工具与残余问题

- `smoke_camera_frames.py` 旧版仍检查历史 `/camera/*` topic；本次已将默认合同更新为 `/left_camera/*`，避免后续控制台继续误跑旧入口。
- 控制台 acceptance 入口已回归：
  - 启动 API：`ros2 run competition_console_api competition_console_api_node.py --ros-args -p host:=127.0.0.1 -p port:=18080 -p allow_hardware_bringup:=false -p api_token:=codex-camera-smoke`
  - 调用：`curl -X POST -H 'x-dual-arm-token: codex-camera-smoke' http://127.0.0.1:18080/api/acceptance/run/camera_frames`
  - 返回：`{"wave":"camera_frames","returncode":0,...,"passes":true}`
- 追加测试收尾时，`move_group` 与 `left_orbbec_gemini_bridge` 在 `Ctrl+C` teardown 阶段均出现 `exit code -11`；当前判定为退出阶段噪声，不影响左相机 through-path 结论，但已纳入后续环境稳定性关注项。
