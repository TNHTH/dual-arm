# dual-arm

`dual-arm` 是一个面向 Fairino 双臂比赛运行时的 ROS 2 Humble 工作区，当前正式源码根为 `packages/`。仓库围绕“感知 -> 场景融合 -> 规划/执行 -> 任务管理 -> 控制台”的主链组织；`src -> packages` 仅作为兼容期别名保留。

## 项目定位

- 面向真实双臂、夹爪、RGB-D 感知和比赛状态机的统一运行时仓库。
- 对外接口保持稳定：ROS 包名、消息、服务、 Action、核心 launch 名称、`build_workspace.sh`、`use_workspace.sh` 继续可用。
- GitHub 首页只提供仓库级导航；包内 API、参数和调试说明下沉到各自目录 README 与 `docs/`。

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

兼容入口仍保留：

```bash
ros2 launch dualarm_bringup competition.launch.py
ros2 launch dualarm_bringup debug.launch.py
ros2 launch dualarm robot_main.launch.py
```

## 当前运行链

1. `detector` 输出基础 2D 检测框。
2. `detector_adapter` 统一成 `dualarm_interfaces` 检测协议。
3. `depth_handler`、`ball_basket_pose_estimator` 生成 3D 场景对象。
4. `scene_fusion` 维护权威场景状态与 `scene_version`。
5. `grasp_pose_generator`、`planning_scene_sync`、`fairino_dualarm_planner` 提供规划与场景覆盖层。
6. `execution_adapter`、`robo_ctrl`、`epg50_gripper_ros` 负责执行层与硬件适配。
7. `dualarm_task_manager` 通过 `RunCompetition` action 驱动任务状态机。
8. `competition_console_api` 与 `competition_console_web` 提供控制台、验收和断点恢复入口。

## 目录导航

```text
dual-arm/
├── packages/                # 正式源码主根
├── src -> packages          # 兼容期别名
├── config/                  # 构建、系统与标定配置
├── docs/                    # 架构、运维、开发和参考文档
├── scripts/                 # 根级脚本与治理检查
├── tests/                   # unit / integration / hardware / acceptance
├── vendor/                  # 当前保留的运行期第三方依赖
├── archive/                 # 迁移记录与 legacy 资产
├── launch/                  # 根级兼容 launch 入口
├── .artifacts/              # 运行证据、checkpoint 与日志
└── .codex/                  # 过程资产、handoff 与复盘
```

## 常用命令

```bash
colcon list --base-paths packages --names-only
python3 scripts/check_readme_coverage.py
python3 scripts/check_path_hardcodes.py
ros2 interface show dualarm_interfaces/action/RunCompetition
ros2 pkg executables competition_console_api
```

## 文档索引

- 仓库地图：`docs/reference/repo-map.md`
- 路径迁移表：`docs/reference/path-migration-map.md`
- README 维护规范：`docs/development/readme-style-guide.md`
- 工程流程规范：`docs/operations/runbooks/engineering-process-standards.md`
- 当前交接状态：`STATE.md`

## 硬件与仿真边界

- 默认生产链面向真机双臂和夹爪；`debug.launch.py`、mock 相机与 fake joint state 主要用于开发验证。
- `build/`、`install/`、`log/`、`.artifacts/` 是生成物或运行证据，不是源码事实来源。
- `archive/` 与 `docs/archive/` 只保存历史会话、迁移记录和 legacy 参考，不参与正式构建。
