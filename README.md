# dual-arm

`dual-arm` 是面向 Fairino 双臂比赛任务的 ROS 2 Humble 工作区。仓库把感知、场景融合、规划、执行、任务状态机和控制台放在同一套可构建的工程结构中，正式源码根为 `packages/`。

## 项目定位

- 面向真实双臂、夹爪、RGB-D 感知和比赛状态机的一体化运行时。
- 保持稳定的 ROS 包名、消息、服务、action、核心 launch、构建脚本和环境脚本。
- 根 README 只提供仓库级导航；包内参数、接口和调试细节放在各目录 README 与 `docs/` 中。

## 系统链路

```text
RGB-D / detector
  -> detector_adapter
  -> depth_handler / ball_basket_pose_estimator
  -> scene_fusion
  -> grasp_pose_generator / planning_scene_sync / fairino_dualarm_planner
  -> execution_adapter / robo_ctrl / epg50_gripper_ros
  -> dualarm_task_manager
  -> competition_console_api / competition_console_web
```

关键输出：

- `/scene_fusion/scene_objects`：权威场景对象和 `scene_version`。
- `/planning/*`：规划结果与 PlanningScene 同步。
- `/execution/*`：轨迹或 primitive 执行结果和 evidence 字段。
- `/competition/run`：比赛任务状态、checkpoint、resume hint 和最终结果。
- 控制台 API/Web：启动、验收、录制和安全审计入口。

## 环境要求

- Ubuntu 22.04。
- ROS 2 Humble。
- Python 3 与 `pytest`、`pyyaml`。
- 需要构建完整工作区时安装 `colcon`。
- 真机运行前必须确认双臂 IP、夹爪串口、控制台 token、stop/cancel 和急停状态。

## 快速开始

### 构建

```bash
./build_workspace.sh
./build_workspace.sh --list-groups
./build_workspace.sh --group perception
```

### 进入环境

```bash
./use_workspace.sh
```

### 启动主链

```bash
source /opt/ros/humble/setup.bash
source install/setup.bash
ros2 launch dualarm_bringup competition_integrated.launch.py
```

### 软件-only mock 启动

该模式不连接真实机械臂 IP，也不打开真实夹爪串口：

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

兼容入口仍保留：

```bash
ros2 launch dualarm_bringup competition.launch.py
ros2 launch dualarm_bringup debug.launch.py
ros2 launch dualarm robot_main.launch.py
```

## 配置

- 运行 profile：`config/profiles/competition_default.yaml`。
- 安全限幅：`config/control/safety_limits.yaml`。
- 比赛对象几何：`config/competition/object_geometry.yaml`。
- 任务阈值和证据：`config/competition/task_thresholds.yaml`。
- detector 模型覆盖：`DUALARM_DETECTOR_MODEL_PATH`。
- 控制台 API 默认地址：`127.0.0.1:18080`。
- 运行期共享目录默认：`.workspace/runtime/shared`，可通过 `DUAL_ARM_SHARED_ROOT` 覆盖。

## 目录导航

```text
dual-arm/
├── packages/        # 正式源码主根
├── src -> packages  # 兼容期别名
├── config/          # 构建、系统、比赛和安全配置
├── docs/            # 架构、运维、开发和参考文档
├── scripts/         # 根级脚本与治理检查
├── tests/           # unit / integration / hardware / acceptance
├── vendor/          # 当前保留的运行期第三方依赖
├── archive/         # legacy 资产与迁移记录
└── launch/          # 根级兼容 launch 入口
```

生成物和本地运行资料不属于源码事实来源：

- `build/`、`install/`、`log/`
- `.artifacts/`
- `.workspace/`
- `packages/ops/competition_console_web/dist/`

## 常用命令

```bash
colcon list --base-paths packages --names-only
python3 scripts/check_readme_coverage.py
python3 scripts/check_path_hardcodes.py
/usr/bin/python3 -m pytest -q tests/unit tests/integration
bash scripts/ci/software_check.sh
colcon test-result --all --verbose
ros2 interface show dualarm_interfaces/action/RunCompetition
ros2 pkg executables competition_console_api
```

## 文档索引

- 仓库地图：`docs/reference/repo-map.md`
- 路径迁移表：`docs/reference/path-migration-map.md`
- 运行架构：`docs/architecture/runtime-architecture.md`
- 接口合同：`docs/api/interfaces.md`
- 安全 runbook：`docs/operations/runbooks/safety.md`
- Wave gate：`docs/operations/runbooks/wave-gates.md`
- README 维护规范：`docs/development/readme-style-guide.md`
- 模型和厂商资产治理：`docs/artifacts/model-and-vendor-manifest.md`

## 硬件与仿真边界

- 默认生产链面向真机双臂和夹爪；`debug.launch.py`、mock 相机和 fake joint state 主要用于开发验证。
- 真机运行前必须先阅读 `docs/operations/runbooks/safety.md`。
- 未取得 start gate、缺少 evidence、对象丢失、规划失败、stop/cancel 失败时，不得默认为任务成功。
- `archive/` 与 `docs/archive/` 只保存 legacy 资产和迁移记录，不参与正式构建。

## 常见问题

- `pytest` 命令不存在：使用 `/usr/bin/python3 -m pytest` 或运行 `bash scripts/ci/software_check.sh`。
- README 覆盖失败：新增源码或文档目录时同步补该目录 `README.md`。
- 看到 `configs/`：这是 `config/` 的兼容别名，运行时代码应优先使用 canonical `config/`。
- 需要真机：先确认 token、stop/cancel、IP、串口、模式和急停状态。
