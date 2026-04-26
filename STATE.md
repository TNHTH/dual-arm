# dual-arm STATE

更新时间：2026-04-26

## Current Wave
- Wave: software-engineering-hardening / Wave 0-6
- 分支：`codex/software-engineering-hardening-20260426`
- 目标：在软件-only 边界内完成工程化整改，包括安全入口、测试体系、配置收敛、任务语义、模块拆分、文档与仓库卫生；不连接实机、不打开真实串口、不运行真实硬件 launch。
- 状态：Wave 0 进行中；已完成分支创建和基线检查，正在把 review 发现转成可执行整改与后续验证入口。

## 2026-04-26 Wave 0 基线
- 分支与远端：
  - 当前分支：`codex/software-engineering-hardening-20260426`
  - 远端：`git@github.com:TNHTH/dual-arm.git`
- 软件-only 约束：
  - 禁止连接真实机械臂 IP。
  - 禁止打开真实串口或 `/dev/serial/by-id/*` 设备。
  - 禁止运行真实硬件 launch 或发送真实运动/夹爪命令。
  - 所有验证默认使用静态检查、单元测试、mock、dry-run、launch 参数检查。
- 基线检查：
  - `python3 scripts/check_path_hardcodes.py`：通过，输出 `路径硬编码检查通过。`
  - `python3 scripts/check_readme_coverage.py`：失败，缺少 `packages/ops/competition_rviz_tools/README.md`。
  - `pytest --collect-only tests`：失败，当前 shell 找不到 `pytest` 命令。
  - `colcon list --base-paths packages --names-only | sort`：发现 27 个 ROS 包。
- 当前主要整改方向：
  - P0：默认网络暴露、危险 API 鉴权、stop/cancel/timeout 语义、速度/范围校验。
  - P1：测试从 0 tests 升级为可重复软件回归；配置从硬编码迁到 profile/YAML；任务成功标准不能无证据默认为成功。
  - P2：大文件职责拆分、README/runbook/API/artifact 文档补齐、旧路径与旧说明清理。

## 已完成
- 2026-04-16 仓库重构与文档体系化：
  - 已在隔离 worktree `codex/dual-arm-reorg` 中完成结构重构，不直接改当前脏的 `test` 工作树
  - 正式源码主根已升级为 `packages/`
  - `src -> packages` 兼容入口已保留
  - `third_party -> vendor` 兼容入口已保留，当前运行期厂商资产收口到 `vendor/fairino_sdk`
  - 根 `arm_planner` 已迁入 `archive/legacy/arm_planner` 并保留兼容入口
  - `docs/runbooks -> docs/operations/runbooks`、`docs/migration -> docs/archive/migration` 已完成目录收口和兼容映射
  - 根历史会话文档已迁到 `docs/archive/sessions/`，根目录保留兼容符号链接
  - 已新增 `scripts/lib/paths.sh`、`packages/tools/tools/scripts/dual_arm_paths.py` 统一路径解析层
  - 已新增 `config/system/build_groups.yaml`、`scripts/lib/build_groups.py`
  - `build_workspace.sh` 已支持 `--group` 和 `--list-groups`
  - `use_workspace.sh` 已导出 `DUAL_ARM_REPO_ROOT`、`DUAL_ARM_SHARED_ROOT`、`DUAL_ARM_ARCHIVE_ROOT`
  - `competition_console_api` 已改为基于 repo root 解析路径，workspace acceptance 已切到 `packages/`
  - `detector` 和工具配置中的历史绝对路径已改为参数/环境变量/相对资产解析
  - 已新增 `single_arm_debug.launch.py` 兼容 alias，转发到现有 `debug.launch.py`
  - 已完成根目录、一级目录、领域目录、关键子目录和缺失 ROS 包 README 补齐
  - 已新增：
    - `docs/reference/repo-map.md`
    - `docs/reference/path-migration-map.md`
    - `docs/development/readme-style-guide.md`
    - `archive/legacy-import-manifest.md`
    - `archive/vendor-archive-manifest.md`
- 2026-04-16 一轮完整实现启动与基座落地：
  - 已建立 `.codex/delivery/prds/dual-arm-competition-runtime.md`
  - 已建立 `.codex/delivery/epics/dual-arm-runtime/*`
  - 已建立 `.codex/tmp/prd-tracker/PRD.md`
  - 已建立 `.codex/tmp/resume/IMPLEMENTATION_BREAKPOINTS.md`
  - 已建立 `.codex/tmp/resume/SUBAGENT_REGISTRY.json`
  - 已建立 `.codex/tmp/resume/RUN_STATE_SCHEMA.md`
  - 已将本轮复盘规范写入 `AGENTS.md`
  - 已新增 `docs/runbooks/engineering-process-standards.md` 作为项目级强制流程规范
- 2026-04-16 单工作区迁移（历史阶段，现已由 `packages/` 主根接替）：
  - 阶段性统一包根曾为 `src/`
  - 当前正式包根为 `packages/`，`src` 仅保留兼容入口
  - 感知、规划、控制、接口、bringup、ops、compat、tools 等源码已按领域落位到 `packages/*`
  - `fairino3_v6_planner` 已落位到 `packages/planning/legacy/fairino3_v6_planner` 并加 `COLCON_IGNORE`
  - `build_workspace.sh` 当前正式入口为 `colcon build --base-paths packages`
- 2026-04-16 接口与主链基座：
  - `SceneObjectArray.msg` 已新增数组级 `scene_version`
  - `RunCompetition.action` 已新增恢复字段与结果 checkpoint 字段
  - 新增 `ExecutePrimitive.action`
  - 新增 `PlanDualPose.srv`
  - 新增 `PlanDualJoint.srv`
  - `scene_fusion` 已写入数组级 `scene_version`
  - `planning_scene_sync` 已新增 `ApplyPlanningScene` client、world/attached cache 和 collision object 映射骨架
  - `fairino_dualarm_planner` 已新增 `/planning/plan_dual_pose` 与 `/planning/plan_dual_joint`
  - `execution_adapter` 已新增 `/execution/execute_primitive` action server，并接入 gripper status 与 managed scene 缓存
  - `dualarm_task_manager` 已接入 checkpoint 写入、primitive client，并删除未定义状态默认成功
- 2026-04-16 感知与控制台基座：
  - `ball_basket_pose_estimator` 已切换为 detection-driven + TF 转 world 主模式，ROI 仅 fallback
  - `depth_handler` 已增加默认语义白名单，只处理 `water_bottle/cola_bottle/cup`
  - `dualarm_bringup/competition.launch.py` 默认 class map 已切到 `class_map_best_pt.yaml`
  - 新增 `competition_integrated.launch.py`
  - 新增 `competition_console_api` 包，提供 `/api/health`、`/api/status`、checkpoint 与 acceptance 基础接口
  - 新增 `competition_console_web` React/Vite/TypeScript 骨架与 Playwright smoke
- 2026-04-15 双夹爪独立链路调试成功：
  - 当前出现两个独立 USB-485 串口：
    - `/dev/serial/by-id/usb-Prolific_Technology_Inc._USB-Serial_Controller_A7BIb114J19-if00-port0`
    - `/dev/serial/by-id/usb-Prolific_Technology_Inc._USB-Serial_Controller_A_COb114J19-if00-port0`
  - 已分别起独立命名空间节点：
    - `/gripper0/epg50_gripper/*`
    - `/gripper1/epg50_gripper/*`
  - 端口与从站映射已确认：
    - `gripper0` -> slave `9`
    - `gripper1` -> slave `10`
  - 两只夹爪均已成功使能并成功执行最大张开命令 `position=0`
- 2026-04-15 EPG50-060 夹爪链路已恢复可控：
  - 按 JODELL 官方手册修正协议后，状态读取改为 `FC04` 读取 `0x07D0`
  - 从站 ID 已确认：当前夹爪为 `9`
  - `enable` 已可成功返回，随后状态回读为 `status=49 (0x31)`、`gact=true`、`gsta=3`、`error=0`
  - `command=2 position=0` 与 `command=2 position=255` 均成功返回
  - 最终状态回读为 `status=241 (0xF1)`、`gact=true`、`gsta=3`、`gobj=3`、`position=255`、`error=0`
- 2026-04-15 夹爪软件侧收口：
  - `epg50_gripper_ros` 已改为默认 `port=auto`，会优先解析 `/dev/serial/by-id`，再回退 `ttyUSB*` / `ttyACM*`
  - `epg50_gripper_ros` 初始化失败不再在构造函数内直接 `shutdown()`，避免旧的 `guard condition` 崩溃
  - `epg50_gripper_ros` 新增 `disable_on_shutdown` 参数，默认 `false`，避免只读调试退出时自动发送 `disable()`
  - `execution_adapter` 已支持根据 `arm_name` 自动映射左右夹爪从站 ID：左 `9`、右 `10`
  - `execution_adapter.launch.py` 已暴露 `left_gripper_slave_id/right_gripper_slave_id`
  - `dualarm_bringup/competition.launch.py` 与 `robo_ctrl/launch/robo_ctrl_L.launch.py` 已补 `gripper_port/gripper_default_slave_id/gripper_disable_on_shutdown`
- 新增双臂描述骨架与双臂 MoveIt 配置文件：
  - `arm_planner/src/fairino_dualarm_description/urdf/fairino3_v6_macro.xacro`
  - `arm_planner/src/fairino_dualarm_description/urdf/fairino_dualarm.urdf.xacro`
  - `arm_planner/src/fairino_dualarm_moveit_config/config/fairino_dualarm.srdf`
  - `arm_planner/src/fairino_dualarm_moveit_config/config/{kinematics,joint_limits,ompl_planning,moveit_controllers,ros2_controllers,initial_positions}.yaml`
- `fairino_dualarm_moveit_config/launch/move_group.launch.py` 已从占位改成真实 bringup，可拉起 `robot_state_publisher`、`joint_state_publisher`、`move_group`。
- `fairino_dualarm_planner` 已从 Python 伪规划器切到 C++ `MoveGroupInterface` 服务节点，旧 Python planner 已从安装树移除。
- `dualarm_bringup` 已 include MoveIt bringup。
- 新增 `joint_state_aggregator` 包，用于 production `/joint_states` 汇总。
- `execution_adapter` 已完成 MoveIt 弧度到硬件度转换修复，并统一反馈 joint 名为 `left_j* / right_j*`。
- `PlanPose(dual_arm)` 已从硬拒绝升级为真实双末端目标规划尝试；`PlanJoint(dual_arm)` 已能返回分拆后的左右两条轨迹。

## 当前阻塞
- 当前这轮仓库重构没有代码级阻塞；reviewer / verifier 已完成，剩余动作是单提交整理、推送到远程 `test`，以及阶段二部署到 `/home/gwh/dual-arm`。
- `planning_scene_sync` 的运行态 smoke 已在本轮后续 wave 中通过；当前与仓库重构直接相关的残余风险是 launch teardown 噪声，不影响本轮 `packages/` 重构、README 体系和路径治理验收。
- `scene_version` 接口和 scene_fusion 已收口第一步，但仍需让所有上游/下游严格使用数组级版本并完成 freshness 回归。
- `PlanDualPose/PlanDualJoint` 已建立接口和服务骨架，但还未完成真实双臂任务样例验收。
- `ExecutePrimitive` 已建立 action server 骨架，但 `cap_twist/pour_tilt/hold_verify/release_guard` 仍需继续从骨架升级到比赛级可靠动作。
- `dualarm_task_manager` 已删除未知状态成功并接入 primitive/checkpoint，但倒水、开盖、入筐的最终判定仍需继续深化。
- 统一控制网页已能 build 和 smoke，但按钮尚未全部接真实 ROS action/service。
- production 路径虽已接入 `joint_state_aggregator`，但还没有完成与真实 `/L/joint_states`、`/R/joint_states` 的联调验证。
- MoveIt bringup 仍有 `No 3D sensor plugin(s) defined for octomap updates` 告警；当前不阻塞 P0 只规划验证。
- `.codex/tmp` 过程资产需随本轮单提交一并入库；新窗口继续前仍必须先读 `STATE.md`、`AGENTS.md` 和 `.codex/tmp/*` 记录，不能只看 git log。
- 右臂灯色/模式解释已由现场修正：蓝色表示机器人处于自动模式，且自动模式下默认不可拖动；绿色表示手动模式且不可拖动；青色表示手动模式且可拖动。
- 后续不能再把“蓝灯”当作异常或非自动状态证据；判断是否可运动应同时看机器人模式、拖动状态、`robot_mode_helper` 输出和 `/R/robot_state`。
- 已实现一键“退出 Drag + 切自动 + 上使能”工具；其目标正常结果是自动模式、不可拖动，现场灯色可表现为蓝色。
- 已尝试两种“待机姿态”回归路径：
  - 直接 `home=[0,0,0,0,0,0]`：失败，控制器返回 `错误码 14`
  - 使用 README 中保守关节姿态经 `/R/robot_move`：命令已发出，但由于阻塞执行和现场缺少灯色/物理动作确认，当前结果未完成闭环确认
- `robo_ctrl` launch 污染已修复到可用：已在 `robo_ctrl_R.launch.py` / `robo_ctrl_L.launch.py` 的 C++ 节点上显式注入系统 `/usr/lib/x86_64-linux-gnu/libstdc++.so.6`，`ros2 launch robo_ctrl ...` 现可正常拉起 `robo_ctrl_node`，不再报 `GLIBCXX_3.4.30`。
- 仍需注意：`install/robo_ctrl/lib/robo_ctrl/robo_ctrl_node` 这个二进制自身的 `RUNPATH` 里仍残留 `/usr/local/miniconda/lib`，因此“直接运行可执行文件”路径仍建议保留 `LD_PRELOAD` 或后续继续做二进制级清理。
- YOLOv8 `.pt` 模型接入已跑通到正常感知链：
  - 模型文件：`/home/gwh/下载/best.pt`
  - 模型类别：`basket`、`basketball`、`cocacola`、`cup`、`football`、`yibao`
  - 当前 GPU 环境：`torch=2.6.0+cu124`、`torchvision=0.21.0+cu124`、`torch.cuda.is_available()=True`
  - 为兼容 ROS Humble `cv_bridge`，`numpy` 已回退到 `1.26.4`
  - 当前相机：Orbbec Gemini 335，USB ID `2bc5:0800`
  - 当前临时相机桥：`.tmp/codex/2026-04-15/orbbec_gemini_ros_bridge.py`，发布 `/camera/color/image_raw`、`/camera/depth/image_raw`、`/camera/depth/camera_info`
  - 当前可视化窗口：`.tmp/codex/2026-04-15/ros_image_viewer.py`，订阅 `/detector/detections/image`

## 已验证证据
- 2026-04-16 全量构建：
  - `./build_workspace.sh --group full` 通过，`26 packages finished`
  - 当前正式构建入口为 `colcon build --base-paths packages`
- 2026-04-16 接口验证：
  - `ros2 interface show dualarm_interfaces/action/ExecutePrimitive` 通过
  - `ros2 interface show dualarm_interfaces/srv/PlanDualPose` 通过
  - `ros2 interface show dualarm_interfaces/action/RunCompetition` 显示恢复字段
- 2026-04-16 仓库重构最终验证：
  - `python3 scripts/check_readme_coverage.py` 通过，输出 `README 覆盖检查通过，共检查 57 个目录。`
  - `python3 scripts/check_path_hardcodes.py` 通过，输出 `路径硬编码检查通过。`
  - `./build_workspace.sh --list-groups` 可列出 `interfaces/perception/planning/control/tasks/bringup/ops/full`
  - `colcon list --base-paths packages --names-only | sort` 与 `colcon list --base-paths src --names-only | sort` 一致，均发现 26 个包
  - 分组构建 `interfaces/perception/planning/control/tasks/bringup/ops/full` 均已通过
  - `SHELL=/bin/bash ./use_workspace.sh -lc 'printf ...'` 已确认 `DUAL_ARM_REPO_ROOT`、`DUAL_ARM_SHARED_ROOT`、`DUAL_ARM_ARCHIVE_ROOT` 正常导出
  - `ros2 launch dualarm_bringup competition_integrated.launch.py --show-args` 通过
  - `ros2 launch dualarm_bringup single_arm_debug.launch.py --show-args` 通过
  - `competition_console_api` 的 `POST /api/acceptance/run/workspace` 返回 `passes=true`，且输出路径已切到 `packages/...`
  - `docs_researcher` 与 `repo_explorer` sidecar 已完成结构与资料支持；`reviewer` 结论为 `no P0/P1 findings`
  - `verifier` 已确认 README 覆盖、路径治理、build groups、包发现、launch smoke 与 workspace acceptance 基本完成；唯一轻微文档缺口已补到 `competition_console_api` README
- 2026-04-16 控制台验证：
  - `competition_console_api` 运行后 `curl http://127.0.0.1:18080/api/health` 返回 `{"status":"ok","profile":"test","node":"competition_console_api"}`
  - `POST /api/acceptance/run/workspace` 返回真实验收结果，`passes=true`
  - `POST /api/bringup/start` 可真实启动 `competition_core.launch.py` 核心进程，`/api/status` 显示 `core_running=true`
  - `POST /api/bringup/stop` 可真实停止核心进程，`/api/status` 显示 `core_running=false`
  - `competition_console_web` 执行 `npm run build` 通过
  - `npx playwright test --reporter=line` 通过，`1 passed`
- 2026-04-16 Wave 1 / Wave 2 smoke：
  - `smoke_resume_checkpoint.py` 通过，输出 `resume checkpoint smoke passed`
  - `smoke_camera_frames.py` 通过，输出 `camera frame smoke passed`
  - mock 相机 frame 证据：
    - `left_camera_color_frame`
    - `left_camera_depth_frame`
    - depth `camera_info.header.frame_id = left_camera_depth_frame`
- 2026-04-16 PlanningScene smoke（阶段中间态，已被后文 Wave 5 收口更新覆盖）：
  - `competition.launch.py start_hardware:=false start_detector:=false start_camera_bridge:=false publish_fake_joint_states:=true` 可正常起 core
  - 当时的中间结论：
    - 不再长期卡在 `reserve failed`
    - 当前失败点为 `managed scene did not enter reserved`
    - `world -> attached` 冲突 REMOVE 已修复
    - service 路径已改为等待 `ApplyPlanningScene` 结果后再回传 success/failure
- 2026-04-16 integrated launch 验证：
  - `ros2 launch dualarm_bringup competition_integrated.launch.py --show-args` 通过
- `./build_workspace.sh` 在 Wave 1 前的全仓基线通过。
- Wave 1 增量构建通过：
  - `fairino_dualarm_description`
  - `fairino_dualarm_moveit_config`
  - `fairino_dualarm_planner`
  - `joint_state_aggregator`
  - `execution_adapter`
  - `dualarm_bringup`
- `xacro` 展开后可看到真实 `left_j1..left_j6`、`right_j1..right_j6` 和 `left_tcp/right_tcp`。
- `ros2 launch fairino_dualarm_moveit_config move_group.launch.py` 已真实拉起 `move_group`，日志出现 `You can start planning now!`。
- `debug.launch.py` 已能包含 MoveIt bringup，且 C++ planner 不再因 `robot_description_semantic` 缺失崩溃。
- `PlanJoint(left_arm)` 成功返回真实非空轨迹，`result_code=success`。
- `PlanJoint(dual_arm)` 成功返回真实分拆后的 `joint_trajectory + secondary_joint_trajectory`，`synchronized=true`。
- `PlanPose(dual_arm)` 已经走真实 MoveIt 规划路径，对示例 pose 返回真实失败码 `collision`，不再伪造轨迹。
- 2026-04-15 当前硬件验证中：
  - 左臂控制器 `192.168.58.2`、右臂控制器 `192.168.58.3` 均已通过独立网卡链路打通。
  - 夹爪 USB 串口已恢复枚举：`/dev/ttyUSB0`，by-id 为 `/dev/serial/by-id/usb-Prolific_Technology_Inc._USB-Serial_Controller_A7BIb114J19-if00-port0`。
  - `colcon build --symlink-install --packages-select epg50_gripper_ros execution_adapter dualarm_bringup` 已通过。
  - 使用系统 `LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libstdc++.so.6` 运行 `epg50_gripper_node` 时，已确认新代码生效并已完成成功回归：
    - `请求端口: auto`
    - `实际端口: /dev/serial/by-id/usb-Prolific_Technology_Inc._USB-Serial_Controller_A7BIb114J19-if00-port0`
    - `退出时禁用: false`
    - 节点可启动，不再因默认 `/dev/ttyACM0` 直接失败
  - 当前官方协议回归结果：
    - `/epg50_gripper/status` 对 `slave_id=9` 返回成功，状态可读
    - `/epg50_gripper/status` 对 `slave_id=10` 返回失败，已排除
    - `/epg50_gripper/command` 对 `slave_id=9 command=1` 返回 `success=True, message='夹爪已使能'`
    - 7 秒后状态回读为 `status=49, gact=true, gsta=3, error=0`
    - `/epg50_gripper/command` 对 `slave_id=9 command=2 position=0/255` 均返回成功
    - 最终状态回读为 `status=241, gact=true, gsta=3, gobj=3, position=255, error=0`
  - 双夹爪扩展回归结果：
    - `/gripper0/epg50_gripper/status` 对 `slave_id=9` 返回成功，`position=0, error=0`
    - `/gripper1/epg50_gripper/status` 对 `slave_id=10` 返回成功，`position=0, error=0`
    - `/gripper0/epg50_gripper/command` 对 `slave_id=9 command=1` 返回 `夹爪已使能`
    - `/gripper1/epg50_gripper/command` 对 `slave_id=10 command=1` 返回 `夹爪已使能`
    - 两侧 `command=2 position=0` 均返回成功，已完成“张到最大”
  - 通过 `publish_empty_scene.py` 持续发布空场景后，`scene_fusion 数据过期` 问题已消除。
  - 通过 `ros2 launch fairino_dualarm_planner fairino_dualarm_planner.launch.py` 注入 `robot_description(_semantic)` 后，planner 不再因参数缺失崩溃。
  - `PlanPose(right_arm)` 已返回真实非空轨迹，`result_code=success`。
  - `PlanPose(left_arm)` 已返回真实非空轨迹，`result_code=success`。
  - 左臂 `MoveCart` 增量测试：`Z + 5mm` 返回成功，动作后 `tcp_pose.z` 由约 `482.488mm` 变为 `487.488mm`。
  - 右臂 `MoveCart` 增量测试：`Z - 5mm` 返回成功，动作后 `tcp_pose.z` 由约 `756.495mm` 变为 `751.495mm`。
  - 右臂扩大增量测试：`Z - 50mm` 返回成功，动作过程中 `motion_done=false`，动作完成后 `tcp_pose.z` 由约 `751.495mm` 变为 `701.493mm`。
- 新增工具与修复：
  - `robo_ctrl/src/robot_mode_helper.cpp`：新增直连控制器的一键模式工具
  - `robot_mode_helper --normal-only` 已在右臂 `192.168.58.3` 上执行成功，终端输出显示：
    - 当前程序状态: `0`
    - 当前 Drag 状态: `0`
    - 已切换自动模式
    - 已上使能
  - 2026-04-15 现场修正右臂灯色语义：
    - 蓝色：自动模式，默认不可拖动
    - 绿色：手动模式，不可拖动
    - 青色：手动模式，可拖动
  - `robo_ctrl/src/robo_ctrl_node.cpp` 已新增参数 `force_auto_mode_before_motion`，默认 `false`；当前动作前不再无条件执行 `Mode(0)`
  - `robo_ctrl/src/robot_mode_helper.cpp` 已新增 `--auto-mode / --manual-mode / --keep-mode`，默认保持当前机器人模式
  - `robo_ctrl/launch/robo_ctrl_R.launch.py` 与 `robo_ctrl/launch/robo_ctrl_L.launch.py` 已为 `robo_ctrl_node` / `high_level_node` 注入系统 `LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libstdc++.so.6`
  - `robo_ctrl/src/robo_ctrl_node.cpp` 已增加 `MoveCart` 超时失败返回和错误码中文解释
  - `robo_ctrl/src/robo_ctrl_node.cpp` 已为 `handle_robot_move / handle_robot_move_cart / handle_robot_servo / handle_robot_set_speed` 增加 `robot_mutex_` 保护，避免状态线程与动作线程并发访问 SDK 连接
  - `colcon build --symlink-install --packages-select robo_ctrl` 已在清理 `build/robo_ctrl/ament_cmake_python/robo_ctrl/robo_ctrl` 旧目录后重新通过
  - `ros2 launch robo_ctrl robo_ctrl_R.launch.py robot_ip:=192.168.58.3 robot_name:=R state_query_interval:=0.05 start_high_level:=false` 已成功拉起 `R_robo_ctrl`，且 `/R/robot_move`、`/R/robot_move_cart`、`/R/robot_set_speed` 等服务可见
  - 右臂“保模式”完整链路验证已通过：
    - `robot_mode_helper --normal-only` 输出 `保持当前机器人模式，不主动切换自动/手动`
    - 直接启动 `robo_ctrl_node` 可执行文件后，`/R_robo_ctrl`、`/R/robot_move`、`/R/robot_move_cart`、`/R/robot_set_speed` 等服务均正常
    - 右臂当前状态基线：`tcp_pose ≈ [158.514, -160.866, 656.742] mm`，`motion_done=true`，`error_code=0`
    - 以低速执行 `MoveCart(use_increment=true, z=+5mm)` 后，`tcp_pose.z` 由约 `656.741mm` 变为 `661.742mm`
    - 再执行 `MoveCart(use_increment=true, z=-5mm)` 后，`tcp_pose.z` 回到约 `656.741mm`
- YOLOv8 `.pt` 正常感知链验证：
  - 新增 `detector/scripts/detector_pt_node.py`，直接加载 `.pt` 并发布兼容旧协议的 `/detector/detections`
  - 新增 `src/perception/detector_adapter/config/class_map_best_pt.yaml`，将 `cocacola -> cola_bottle`、`cup -> cup`、`yibao -> water_bottle`
  - `dualarm_bringup/competition.launch.py` 已增加 `detector_executable`、`detector_model_path`、`detector_image_topic`、`detector_class_map_file`、`detector_allowed_class_ids` 等参数
  - GPU 单帧验证通过：`/usr/bin/python3` detector 进程在 `nvidia-smi` 中占用约 `206MiB`
  - Orbbec 桥输出约 `10Hz` 彩色图像，`/camera/depth/camera_info` 内参正常
  - `/detector/detections` 已输出 `class_id=2` 的检测，后续经 adapter 映射为 `cola_bottle`
  - `/scene_fusion/raw_scene_objects` 已输出 `cola_bottle` 对象，说明链路已到 `detector -> adapter -> depth_handler -> scene_fusion`

## 下一步
- Wave 2：
  - `planning_scene_sync` 真接 MoveIt PlanningScene，处理 world/attached object
  - `scene_fusion` / managed scene 的 scene_version 联动修正
  - `execution_adapter` 双臂同步协议、真实 skew 测量、primitive dispatcher
  - 对外保留 Wave 1 planner 成功样例作为回归基线
  - 开始前先读 `.codex/tmp/continuous-learning/RETRO.md` 和 `.codex/tmp/error-trace/ERROR_TRACE.md`
- 当前会话续接优先级：
  1. 先由现场确认：在新代码路径下执行 `+5mm/-5mm` 时，右臂灯色是否保持绿色
  2. 若绿色保持稳定，则继续验证更大幅度动作或保守待机位；若仍切蓝，则需改为显式“保持手动模式”策略而非仅仅“不切自动”
  3. 若后续要彻底收口环境，再继续清理 `robo_ctrl_node` 二进制 `RUNPATH` 中残留的 `/usr/local/miniconda/lib`
  4. 若要长期保留 Orbbec 相机桥，应把 `.tmp/codex/2026-04-15/orbbec_gemini_ros_bridge.py` 从临时脚本提升到正式包或 launch；当前只是现场快速桥接
  4. 夹爪动作测试前，先完成物理层确认：夹爪独立供电、RS485 转换器类型、A/B 接线、通信地线、厂家工具中的实际从站 ID 与波特率。

## 本次流程复盘摘要
- 已确认的高频问题：
  - subagent 502 导致长任务代理不可依赖
  - 旧 ROS 进程污染 service / action 验证
  - 安装树残留旧脚本污染运行结果
  - Conda 抢占 `python3` 导致 `rclpy` 载入失败
  - launch helper 改动后未重装导致验证命中旧安装树
- 后续强制规则：
  - 验证前先清进程
  - 删脚本后先重装包再测
  - Wave 结束必须更新 `STATE.md`、`ERROR_TRACE.md`、`RETRO.md`

## Debug Fallback
- 若 unified `dual_arm` 暂时无法稳定返回 production 可用轨迹，只允许保留 debug fallback。
- fallback 不能算 production complete。

## 2026-04-16 Wave 5 收口更新

### 新完成
- `planning_scene_sync` 运行态 smoke 已通过，且通过的是增强版强验收脚本，不是旧的弱断言版本。
- 当前通过证据：
  - 启动命令：`ros2 launch dualarm_bringup competition_core.launch.py start_hardware:=false start_detector:=false start_camera_bridge:=false use_mock_camera_stream:=false publish_fake_joint_states:=true`
  - smoke 命令：`/usr/bin/python3 src/tools/tools/scripts/smoke_planning_scene_sync.py`
  - 输出：`planning_scene_sync smoke passed`
  - `GetPlanningScene` 最终 world / attached 均为空
  - `/scene_fusion/scene_objects` 最终 `objects: []`
- `planning_scene_sync` 本轮关键修复：
  - service/client/subscription 已切到 `ReentrantCallbackGroup`
  - authoritative scene 更新已改成持锁同步 apply，不再依赖异步 done-callback 回写
  - attach 前会用 `GetPlanningScene` 确认 world object 已进入 MoveIt
  - attach diff 保留完整 geometry/header/touch_links，但不再同包发送同 id world REMOVE
  - 已引入事务回滚、live object 校验、`object_retention_timeout`、`lost_but_reserved`、`lost_but_attached`
- `smoke_planning_scene_sync.py` 本轮增强点：
  - raw -> managed 检查 `scene_version` / `frame_id`
  - reserve 检查 `reserved_by`
  - attach 检查 `GetPlanningScene` 中 world/attached 不双份
  - detach/release 后停止 raw publisher，并验证 managed scene 与 MoveIt 最终清空

### 当前结论
- Wave 5 的 `planning_scene_sync` / MoveIt PlanningScene 运行态 smoke 已收口。
- 当前主阻塞已从 Wave 5 切换为：
  1. Wave 4：`scene_version` / freshness / planner gate 的专项回归
  2. Wave 6：`ExecutePrimitive` / execution_adapter 的真实动作闭环
  3. launch teardown 阶段 `move_group` segmentation fault 仍未治理，但当前不阻塞 Wave 5 happy path 验收

### 下一步入口
- 先保留 Wave 5 回归命令作为基线：
  - `ros2 launch dualarm_bringup competition_core.launch.py start_hardware:=false start_detector:=false start_camera_bridge:=false use_mock_camera_stream:=false publish_fake_joint_states:=true`
  - `/usr/bin/python3 src/tools/tools/scripts/smoke_planning_scene_sync.py`
- 下一波直接转入：
  - Wave 4：`scene_version` / `header.stamp` / freshness 回归
  - Wave 6：primitive 执行、夹爪闭环、同步 skew 与动作后置条件
