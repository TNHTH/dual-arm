# dual-arm STATE

更新时间：2026-04-16

## Current Wave
- Wave: Wave 4 / Wave 6 主推进，Wave 2/3/7/8/9/10/11 软件窗口已并行初始化
- 目标：以多窗口并行方式继续推进 scene freshness、execution primitive、行为模块和软件验收入口
- 状态：进行中

## 已完成
- 2026-04-16 一轮完整实现启动与基座落地：
  - 已建立 `.codex/delivery/prds/dual-arm-competition-runtime.md`
  - 已建立 `.codex/delivery/epics/dual-arm-runtime/*`
  - 已建立 `.codex/tmp/prd-tracker/PRD.md`
  - 已建立 `.codex/tmp/resume/IMPLEMENTATION_BREAKPOINTS.md`
  - 已建立 `.codex/tmp/resume/SUBAGENT_REGISTRY.json`
  - 已建立 `.codex/tmp/resume/RUN_STATE_SCHEMA.md`
  - 已将本轮复盘规范写入 `AGENTS.md`
  - 已新增 `docs/runbooks/engineering-process-standards.md` 作为项目级强制流程规范
- 2026-04-16 单工作区迁移：
  - 正式包根已统一为 `src/`
  - 根目录包已迁入 `src/perception`、`src/control`、`src/compat`、`src/tools`
  - `arm_planner/src/*` 已迁入 `src/planning/*`
  - `fairino3_v6_planner` 已迁入 `src/planning/legacy/fairino3_v6_planner` 并加 `COLCON_IGNORE`
  - `build_workspace.sh` 已改为 `colcon build --base-paths src`
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
- `planning_scene_sync` 已具备 `ApplyPlanningScene` 写入骨架，但还缺真实运行态 service smoke 与 MoveIt world/attached 可视化证据。
- 2026-04-16 运行态 smoke 新阻塞：
  - 在 `competition.launch.py + publish_fake_joint_states:=true` 下，`smoke_planning_scene_sync.py` 仍卡在 `reserve failed`
  - 当前 `planning_scene_sync` 已修复 `lost_but_reserved` 与同步 diff 高频重发问题，也已改成异步 `ApplyPlanningScene`
  - 但 `ApplyPlanningScene` 在运行态仍持续返回失败，Wave 4 需要继续定位请求内容与 MoveIt service 语义
- `scene_version` 接口和 scene_fusion 已收口第一步，但仍需让所有上游/下游严格使用数组级版本并完成 freshness 回归。
- `PlanDualPose/PlanDualJoint` 已建立接口和服务骨架，但还未完成真实双臂任务样例验收。
- `ExecutePrimitive` 已建立 action server 骨架，但 `cap_twist/pour_tilt/hold_verify/release_guard` 仍需继续从骨架升级到比赛级可靠动作。
- `dualarm_task_manager` 已删除未知状态成功并接入 primitive/checkpoint，但倒水、开盖、入筐的最终判定仍需继续深化。
- 统一控制网页已能 build 和 smoke，但按钮尚未全部接真实 ROS action/service。
- production 路径虽已接入 `joint_state_aggregator`，但还没有完成与真实 `/L/joint_states`、`/R/joint_states` 的联调验证。
- MoveIt bringup 仍有 `No 3D sensor plugin(s) defined for octomap updates` 告警；当前不阻塞 P0 只规划验证。
- 当前仓库外的 `.codex/tmp` 追踪文件尚未提交；新窗口继续前必须先读 `STATE.md`、`AGENTS.md` 和 `.codex/tmp/*` 记录，不能只看 git log。
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
  - `./build_workspace.sh` 通过，`25 packages finished`
  - 构建入口为 `colcon build --base-paths src`
- 2026-04-16 接口验证：
  - `ros2 interface show dualarm_interfaces/action/ExecutePrimitive` 通过
  - `ros2 interface show dualarm_interfaces/srv/PlanDualPose` 通过
  - `ros2 interface show dualarm_interfaces/action/RunCompetition` 显示恢复字段
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
- 2026-04-16 PlanningScene smoke：
  - `competition.launch.py start_hardware:=false start_detector:=false start_camera_bridge:=false publish_fake_joint_states:=true` 可正常起 core
  - 当前已推进到更细粒度阻塞：
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

## 2026-04-20 相机与桌面建模续接

### 新完成
- Orbbec 设备枚举已恢复为 `2bc5:0800 Orbbec Gemini 335`，当前系统存在 `/dev/video2..9` 的 Orbbec 视频节点。
- 已单独启动 `orbbec_gemini_ros_bridge.py`，当前运行态解析为：
  - color=`/dev/video8`
  - depth_backend=`v4l2_z16`
  - depth_device=`/dev/video2`
- 当前相机话题已真实发布：
  - `/camera/color/image_raw`
  - `/camera/depth/image_raw`
  - `/camera/depth/camera_info`
- 已启动实时 RGB 可视化窗口：
  - `ros_image_viewer.py --ros-args -p image_topic:=/camera/color/image_raw -p window_name:=orbbec_color_view`
- 已完成两轮桌面建模分析：
  - 第一轮纯深度 RANSAC 会把中后部背景平面误吃进桌面，不符合肉眼木桌区域
  - 第二轮改为“彩色木桌区域先验 + 深度平面拟合”后，overlay 已与肉眼桌面基本一致
- 已新增但尚未完成全链验证的脚本：
  - `src/tools/tools/scripts/table_surface_detector.py`
  - 目标：持续输出 `table_surface`、RGB overlay、深度确认 overlay、mask 和调试 JSON

### 已验证证据
- `lsusb` 可见：`Bus 004 Device 003: ID 2bc5:0800 Orbbec Gemini 335`
- `ros2 topic info` 证据：
  - `/camera/color/image_raw` publisher count = 1
  - `/camera/depth/image_raw` publisher count = 1
  - `/camera/depth/camera_info` publisher count = 1
- 话题频率证据：
  - 彩色约 `7-8 Hz`
  - 深度约 `8 Hz`
- 已保存调试产物目录：
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm/.artifacts/camera_debug/`
- 当前桌面分析结论文件：
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm/.artifacts/camera_debug/table_depth_analysis_adjusted.json`
  - 关键字段：
    - `can_detect_table_plane=true`
    - `method=color_guided_depth_plane_fit`
    - `plane_inlier_ratio_in_color_table_candidates=0.9992`
    - `median_residual_mm=2.8903`
    - `depth_confirmed_area_ratio_vs_color_table=0.5124`
- 当前桌面对比图：
  - `color_latest_adjusted.png`
  - `table_depth_confirmed_overlay.png`
  - `table_color_guided_overlay.png`

### 当前阻塞
- `table_surface_detector.py` 已写入但未完成 build / install / 运行态验证，当前不在 ROS graph 中。
- `depth_handler` 已开始接桌面平面接口改造，但本轮在中途被打断，尚未重新 build；不能宣称已把桌面约束真正接进瓶杯 3D 建模。
- `competition.launch.py` / `competition_core.launch.py` 还未完成：
  - 默认 detector 模型切换到 `/home/gwh/下载/best.3.pt`
  - 自动拉起 `table_surface_detector`
  - RGB 检测效果 overlay 统一输出
- 当前仍存在重复控制台进程痕迹：
  - `ros2 run competition_console_api ...` wrapper 进程
  - 安装后的 `competition_console_api_node.py` / `competition_console_static_server.py` 进程
  - 下一窗口应先清理，避免误判 live 状态

### 当前结论
- 相机链路已经重新打通，且可以实时可视化 RGB。
- 深度信息可以识别桌面平面，但完整桌面区域需要“彩色先验 + 深度确认”的联合建模，不能只靠纯深度。
- 目前距离“可用于辅助机械臂自动夹取”只差把桌面平面正式写入 ROS 运行链，并把物体 3D 建模改成桌面约束版。

### 下一步
- 下一窗口继续时，不要重复做设备恢复；从当前 live 相机桥和现有调试产物继续。
- 优先顺序：
  1. 完成 `table_surface_detector.py` 的 world 输出、RGB overlay 发布与 `tools` 包 build
  2. 完成 `depth_handler` 的桌面约束和底部落桌修正
  3. 把 `best.3.pt` 设为 detector 默认模型并接入 launch
  4. 再开始自动夹取入口 `pick_assist_auto_grasp.py`

## 2026-04-16 单臂调试接口补充

### 新完成
- 已新增单臂调试总装入口：`src/bringup/dualarm_bringup/launch/single_arm_debug.launch.py`
  - 目标：保留双臂主链不动，额外挂出 `debug_arm=left|right` 的单臂调试接口
  - 默认调试策略：
    - 左臂：可直接接入当前左相机 + 左夹爪 + 左臂驱动
    - 右臂：先保留驱动 / MoveIt / 执行链单臂入口，视觉抓取后续再补
- `joint_state_aggregator` 已新增 `active_arms=dual|left|right`
  - 在 `left` 或 `right` 模式下，会给未接入侧补默认 joint state，避免单臂现场时 `/joint_states` 断流
- 已新增单臂抓取最小闭环工具：`src/tools/tools/scripts/single_arm_pick_debug.py`
  - 当前流程：目标锁定 -> 张爪 -> `pregrasp` -> `grasp` -> 合爪并 attach -> `hold_verify` -> `retreat`
  - 该工具不依赖 `RunCompetition` 总状态机，避免把单臂调试与比赛流程强耦合
- 已新增 runbook：`docs/runbooks/2026-04-16-single-arm-debug-runbook.md`

### 已验证证据
- `python3 -m py_compile` 已通过：
  - `single_arm_debug.launch.py`
  - `joint_state_aggregator_node.py`
  - `joint_state_aggregator.launch.py`
  - `single_arm_pick_debug.py`
- `colcon build --symlink-install --packages-select joint_state_aggregator dualarm_bringup tools` 已通过
- `ros2 launch dualarm_bringup single_arm_debug.launch.py --show-args` 已通过
- `ros2 launch joint_state_aggregator joint_state_aggregator.launch.py --show-args` 已通过
- `ros2 pkg executables tools` 已出现 `single_arm_pick_debug.py`

### 当前限制
- 当前相机 TF 配置仍只有 `left_tcp -> left_camera`，且状态仍是 `unverified`
- 因此当前“视觉抓取完整闭环”是左臂优先路径；右臂单臂入口已预留，但若右臂也要挂相机，还需补：
  - `right_tcp -> right_camera` 外参
  - 对应 color/depth frame 合同
  - 右臂视觉抓取验收

## 2026-04-16 单臂硬件链路回归

### 新完成
- `orbbec_gemini_bridge` 已从不稳定的 `CAP_OBSENSOR index=0` 读取路径切换为：
  - 彩色：自动选择 `YUYV/MJPG` 设备，当前实机落到 `/dev/video8`
  - 深度：自动选择 `Z16` 设备，当前实机落到 `/dev/video0`
- `orbbec_gemini_bridge` 已支持 `camera_matrix_file`，当前可稳定发布：
  - `/camera/color/image_raw`
  - `/camera/depth/image_raw`
  - `/camera/color/camera_info`
  - `/camera/depth/camera_info`
- 针对当前 Orbbec `Z16` 节点的实测缩放，已在桥接层加入 `v4l2_depth_unit_to_mm_scale=0.125`，避免下游把原始深度直接当毫米使用。
- `single_arm_debug.launch.py` 已去掉对 `robo_ctrl_L.launch.py` 的嵌套依赖，改为直接拉 `robo_ctrl_node`，避免旧 launch 隐式起第二个夹爪节点。
- `single_arm_debug.launch.py` 现已能在同一入口内稳定拉起：
  - 左臂控制器节点
  - 单左夹爪节点
  - detector
  - detector_adapter
  - depth_handler
  - scene_fusion
  - grasp_pose_generator
  - MoveIt / planner / execution_adapter
- 已将 Fairino 软件包迁移到项目第三方目录：
  - 新目录：`third_party/fairino_sdk/software`
  - 旧目录备份：`third_party/fairino_sdk/software.backup_2026-04-16_204536`
- `single_arm_pick_debug.py` 已改为在规划前优先使用当前机械臂 TCP 姿态，避免调试脚本直接使用单位四元数导致抓取前 `ik_failed`。

### 已验证证据
- 设备枚举验证：
  - `/dev/video0` 支持 `Z16 16-bit Depth`
  - `/dev/video8` 支持 `YUYV/MJPG`
- 原始设备读流验证：
  - `/dev/video0` 可直接读出 `uint16 (480x640)` 深度帧
  - `/dev/video8` 可直接读出 `uint8 (480x640x3)` 彩色帧
- `ros2 run orbbec_gemini_bridge orbbec_gemini_ros_bridge.py` 运行态验证：
  - `depth_backend=v4l2_z16`
  - `depth_device=/dev/video0`
  - `color=/dev/video8`
- 单臂总装运行态验证：
  - `/camera/color/image_raw` 约 `15Hz`
  - `/camera/depth/image_raw` 约 `15Hz`
  - `/camera/depth/camera_info` 已发布真实加载的 `camera_matrix.json`
  - `/detector/detections` 已输出 `class_id=5`
  - `/perception/detection_2d` 已输出 `semantic_type=water_bottle`
  - `/scene_fusion/raw_scene_objects` 已输出稳定 `water_bottle_*`
  - `/planning/grasp_targets` 已输出左臂 `water_bottle` 抓取目标
- 左臂控制器通讯验证：
  - `/L/robot_state` 回读成功，`motion_done=true`，`error_code=0`
- 夹爪通讯验证：
  - `/epg50_gripper/command` 对 `slave_id=9 command=1` 返回 `夹爪已使能`
  - `/epg50_gripper/status` 回读 `success=true, gact=true, gsta=3, error=0`

### 当前限制
- `planning_scene_sync` 仍会因 detector 每帧生成新 `water_bottle_*` id 而产生高频 world add/remove；这不阻塞单臂调试入口的感知与抓取目标验证，但会污染 MoveIt scene 日志。
- `ball_basket_pose_estimator` 仍会因 `detections frame=left_camera_color_frame` 与其默认期望不一致而打印 warning；当前不影响瓶子链路。
- `move_group` 在 `Ctrl+C` / launch teardown 阶段仍可能 segmentation fault；当前属于退出阶段噪声，不影响已验证的 happy path。
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

## 2026-04-16 并行软件窗口初始化

### 新完成
- 已按“全软件立即并行”方案初始化 worktree 与分支：
  - `coord/plan-sync` -> `/home/gwh/dashgo_rl_project/workspaces/dual-arm-coord`
  - `task/scene-freshness` -> `/home/gwh/dashgo_rl_project/workspaces/dual-arm-scene`
  - `task/perception-camera` -> `/home/gwh/dashgo_rl_project/workspaces/dual-arm-perception`
  - `task/execution-control` -> `/home/gwh/dashgo_rl_project/workspaces/dual-arm-execution`
  - `task/task-orchestration` -> `/home/gwh/dashgo_rl_project/workspaces/dual-arm-tasking`
  - `task/behavior-cap-pour` -> `/home/gwh/dashgo_rl_project/workspaces/dual-arm-cap-pour`
  - `task/behavior-handover` -> `/home/gwh/dashgo_rl_project/workspaces/dual-arm-handover`
  - `task/ops-acceptance` -> `/home/gwh/dashgo_rl_project/workspaces/dual-arm-ops`
- 当前并发上限已压缩为 5，且包含协调窗口。
- 当前 5 个活跃窗口：
  - `coord`
  - `scene-freshness`
  - `perception-camera`
  - `execution-control`
  - `task-orchestration`
- 当前 3 个待命窗口：
  - `behavior-cap-pour`
  - `behavior-handover`
  - `ops-acceptance`
- 已落地只读任务卡：
  - `W2-3-perception-camera.md`
  - `W4-scene-version-freshness.md`
  - `W6-execution-control.md`
  - `W7-8-cap-pour.md`
  - `W9-handover.md`
  - `W10-task-orchestration.md`
  - `W11-ops-acceptance.md`
- 已建立实时共享状态目录：
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm-shared/coordination`
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm-shared/windows`
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm-shared/prompts`
- 已建立窗口提示词文档：
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm/docs/runbooks/software-parallel-window-prompts.md`
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm-shared/prompts/software-parallel-window-prompts.md`
- 已建立行为并行占位目录：
  - `src/tasks/dualarm_task_manager/scripts/behaviors/`
  - `src/control/execution_adapter/scripts/primitives/`

### 当前结论
- 当前已经从“单窗口推进”切换到“全软件多窗口立即并行”。
- 实时共享状态不再依赖各自 worktree 中的 tracked 文件，而是统一读取外部共享目录，避免不同分支看到不同版本的状态文件。
- 硬件联调不在当前并行体系内，完全交给队友；当前所有窗口都只做软件层修改。
- `scene-freshness` 已具备 maintenance-ready 证据，是当前第一退出候选。
- 若协调窗口执行单槽位交换，首个释放的活跃槽位优先给 `ops-acceptance`。
- `behavior-cap-pour` / `behavior-handover` 继续 dormant，直到 `execution-control` / `task-orchestration` 收窄父级 owned_paths 或转入 maintenance/dormant。
- 所有窗口下一轮任务前必须先同步到 `coord_rev=7`。
- 根据共享窗口文件的最新证据，`scene-freshness` 已经满足正式退场条件；当前可以直接执行 `scene-freshness -> ops-acceptance` 的单槽位交换。
- `perception-camera`、`execution-control`、`task-orchestration` 仍在修改或仍持有运行中的 subagent，本轮不做第二个业务槽位调整。
- `ops-acceptance` 目前是 `admit-after-sync`，不是立即进场；其进场前必须先同步到 `coord_rev=7` 并开启新的 task subagent。
- 所有窗口下一轮任务前必须先同步到 `coord_rev=7`。

## 2026-04-16 test 分支整合完成

### 新完成
- 已将以下 4 个业务分支的实际 payload 合入 `test`：
  - `task/scene-freshness`
  - `task/perception-camera`
  - `task/execution-control`
  - `task/task-orchestration`
- 已将长期有效的协调资产、任务卡、runbook 与脚本整理提交到 `test`。
- 已清理 `test` 根工作树中的临时产物：
  - `.artifacts/`
  - `.tmp/`
  - `.codex/tmp/coordination/`
- 已在干净 ROS shell 下重新执行 `./build_workspace.sh`，结果：
  - `Summary: 26 packages finished [19.3s]`
  - `detector`、`tools` 只有 warning，无构建失败

### 当前结论
- 当前 `test` 分支已经是完成的、干净的、整合过的软件基线。
- 可以直接以当前 `test` 作为下一步硬件连接与真机测试分支。
- 剩余辅助 worktree 只需要做删除收尾，不再承载未整合 payload。

## 2026-04-19 真机控制台与双臂通信接续

### 新完成
- 控制台网页已可通过 `http://127.0.0.1:18081` 访问，静态服务会同源代理 `/api/*` 到 `competition_console_api` 的 `18080`。
- `competition_console_api` 已扩展：
  - `/api/bringup/start|restart|stop`
  - `/api/control/state`
  - `/api/control/arm/jog`
  - `/api/control/arm/mode`
  - `/api/control/gripper`
  - `/api/presets`
  - `/api/presets/current`
  - `/api/presets/move`
  - `/api/presets/{arm}/{preset_id}` 删除
- 网页已扩展为真机控制台：
  - Bringup 模式切换
  - 左右臂点动控制
  - 左右臂 `j1..j6` 与 TCP 位姿显示
  - 左右夹爪控制
  - 左右臂模式按钮：`切手动`、`退出拖动`
  - 自定义姿态保存与切换
- 自定义姿态保存位置：
  - `.artifacts/console_pose_presets.json`
  - 当前已有左臂 `抓住`、`拧开`，右臂 `抓瓶子`
- 姿态切换链路已从直接调用 `/L|R/robot_move` 改为：
  1. `/planning/plan_joint`
  2. `/execution/execute_trajectory`
  3. `execution_adapter`
  4. `/L|R/robot_servo_joint`
- 修复 `PlanJoint` 姿态单位错误：
  - 姿态库保存的是控制器角度 `deg`
  - `PlanJoint` 目标需要 `rad`
  - `competition_console_api` 已在 `_build_joint_state_target()` 中转换为 `math.radians(...)`
- 修复 `fairino_dualarm_planner` service callback 长时等待问题：
  - `Plan*` services 放入 `ReentrantCallbackGroup`
- 修复 `fairino_dualarm_planner` 与 `robo_ctrl` 在总装入口下的 Miniconda `libstdc++` 污染：
  - `fairino_dualarm_planner.launch.py` 注入系统 `LD_PRELOAD`
  - `dualarm_bringup/competition.launch.py` 对左右 `robo_ctrl_node` 注入系统 `LD_PRELOAD`
- `robo_ctrl` `ServoJ` 路径已加互斥与异常兜底，避免 `XmlRpc::XmlRpcException` 直接 abort 进程。
- `competition_console_api` 启动 core 前已加入 `_cleanup_stale_core_processes()`，用于清理旧 `competition_core` / `move_group` / planner / execution / gripper / `robo_ctrl_node` 残留。
- 右臂通信已在干净单栈下打通：
  - `/R/robot_state` 可读，`error_code=0`
  - `/R/robot_move_cart` `z=-5mm` 增量返回成功
  - 右臂姿态 `抓瓶子` 通过 `/api/presets/move` 返回 `success=true`
  - 切换后右臂 `j2/j3/j4/j6` 明显移动到目标附近

### 当前 live 状态快照
- 记录时间：2026-04-19 17:50:47 +0800
- 当前 `competition_console_api` 与静态网页服务仍在运行。
- `core_running=true`
- `core_pid=130977`
- 当前 `execution` action server 数量已恢复为 1：
  - `/execution_adapter`
- 当前关键节点：
  - `/execution_adapter`
  - `/fairino_dualarm_planner`
  - `/gripper0/gripper_node_left`
  - `/gripper1/gripper_node_right`
  - `/left_robo_ctrl`
  - `/right_robo_ctrl`
  - `/move_group`
  - `/planning_scene_sync`
  - `/dualarm_task_manager`
- 当前机器人状态：
  - 左臂：`error_code=0`，但当时 `motion_done=false`，继续前必须重新读 `/L/robot_state`
  - 右臂：`error_code=0`，`motion_done=true`，接近姿态库 `抓瓶子`

### 当前阻塞与风险
- 不要再同时启动多套 `competition_core`；旧栈残留会导致多个 `/execution_adapter` action server、串口被旧 gripper 节点占用、姿态切换和夹爪动作不稳定。
- 右夹爪曾出现“反复合上/展开”现象，根因怀疑是多套旧 `execution_adapter` / gripper 节点和网页连续触发混在一起；当前已通过强制清栈和单 action server 验证降低风险。
- 右臂控制器自带网页 `http://192.168.58.3`：
  - `/` 和 `/index.html` 能返回 `302`
  - `/login.html` `curl` 可取回 HTML
  - 但 Chromium 仍可能显示 `ERR_EMPTY_RESPONSE`
  - 该问题属于控制器 Web 服务/浏览器链路异常，不等同于 ROS 控制链不可用
- 相机仍未恢复到 Orbbec 正常枚举：
  - 当前看到 `349c:0418` Mass Storage / recovery-like 模式
  - `usb_modeswitch -K -R` 后未恢复到 `2bc5:0800`
  - 下一步应直连 USB3 或走 Orbbec 官方 firmware/recovery 流程
- 左臂姿态切换仍需继续收口：
  - 规划链路已改为 `PlanJoint -> ExecuteTrajectory`
  - 单位错误已修复
  - 但左臂执行链仍需在干净单栈下验证

### 已验证证据
- `python3 -m py_compile` 通过：
  - `competition_console_api_node.py`
  - `competition_console_static_server.py`
  - `dualarm_bringup` 相关 launch 文件
- `colcon build --packages-select competition_console_api` 通过
- `colcon build --packages-select execution_adapter` 通过
- `colcon build --packages-select fairino_dualarm_planner` 通过
- `colcon build --packages-select fairino_dualarm_moveit_config` 通过
- `colcon build --packages-select robo_ctrl` 通过
- `competition_console_web` `npm run build` 通过
- Playwright smoke 通过：`1 passed`
- `/api/health`、`/api/status`、`/api/control/state`、`/api/presets` 可通过 `18081` 同源代理访问
- 右臂 `/R/robot_move_cart z=-5mm` 返回成功并有 TCP Z 变化
- 右臂 `/api/presets/move` 到 `抓瓶子` 返回 `success=true`

### 下一步建议
- 新窗口第一步不要写代码；先执行 live 清点：
  1. `pgrep -af 'competition_core.launch.py|execution_adapter_node.py|robo_ctrl_node|epg50_gripper_node|move_group'`
  2. `ros2 action info /execution/execute_trajectory`
  3. `curl -s http://127.0.0.1:18080/api/status`
  4. `curl -s http://127.0.0.1:18080/api/control/state`
- 若 action server 超过 1 个，先清旧栈，禁止测试姿态/夹爪。
- 若只剩单栈，优先继续验证：
  1. 左臂姿态 `抓住 -> 拧开`
  2. 按住 jog 的持续控制语义
  3. 姿态库保存夹爪状态
  4. 动作组按左右臂姿态顺序回放

## 2026-04-20 比赛级自动夹取 / 桌面标定收口更新

### 新完成
- `competition.launch.py` / `competition_core.launch.py` / `competition_integrated.launch.py` 已补比赛级 perception 调参入口：
  - `allow_unverified_camera_extrinsics`
  - `camera_v4l2_depth_unit_to_mm_scale`
  - `depth_require_depth_aligned_detections`
  - `ball_require_depth_aligned_detections`
  - `table_*` 桌面阈值参数
  - detector 默认模型固定为 `/home/gwh/下载/best.3.pt`
- `table_surface_detector.py` 已收口到：
  - 安装树可执行
  - TF 失败时发布空 `SceneObjectArray` heartbeat
  - `world` 可查时发布 `table_surface`
  - 当前已实际拿到 `world` 桌面对象和 RGB/depth overlay 证据
- `planning_scene_sync` 已收口为：
  - 外部 world collision 只保留 `table_surface`
  - `table_surface` 使用 `BOX`
  - 非桌面对象仍允许 attach/detach，不再被 world-only 过滤误伤
- `depth_handler` 已收口为：
  - 重新只处理 `water_bottle/cola_bottle/cup`
  - 使用 `/perception/table_scene_objects` 里的桌面平面剔除 ROI 近桌面点
  - 编译通过
- world-frame 门禁已前推：
  - `grasp_pose_generator` 默认只对 `world` pose 对象发布 `GraspTarget`
  - `execution_adapter` 拒绝执行非 `world` 的 cartesian waypoint
  - `single_arm_pick_debug` / `pick_assist_auto_grasp.py` 已检查：
    - 目标 object/target 必须是 `world`
    - 右臂不允许 `require_world_tf=false`
    - `/execution/execute_trajectory` action server 数量必须为 1
    - 桌面对象必须存在且有效
  - `dualarm_task_manager` `SELF_CHECK` 已增加 `/execution/execute_trajectory` 唯一 server 门禁
- 已新增桌面标定闭环工具：
  - `src/tools/tools/scripts/capture_table_calibration_sample.py`
  - `src/tools/tools/scripts/evaluate_table_calibration_run.py`
  - `src/transforms/tf_node/scripts/promote_calibration_transform.py`
  - `eye_hand_calibration_data_collector.launch.py` 已暴露 `tcp_only_mode`
- `wave23_perception_acceptance.py` 已改为支持通过参数检查 `expected-calibration-status`

### 当前 live 调试状态
- 保留中的 live / debug 进程：
  - `competition_core.launch.py`
  - `orbbec_gemini_ros_bridge.py`
  - `ros_image_viewer.py`
  - `detector_pt_node.py`
  - `table_surface_detector.py`
  - 调试静态 TF：`left_tcp -> left_camera`
- 已退掉：
  - `depth_processor_debug`

### 本轮关键证据
- `pick_assist_auto_grasp.py` 安装树可执行：
  - `ros2 pkg executables tools | rg 'pick_assist_auto_grasp'`
- `tf_node` 晋级脚本 dry-run 已通过：
  - `promote_calibration_transform.py --dry-run`
- 桌面标定采样脚本已实际落盘 3 份样本：
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm/.artifacts/calibration/left_camera/live_smoke_v2/pose_static_01`
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm/.artifacts/calibration/left_camera/live_smoke_v2/pose_static_02`
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm/.artifacts/calibration/left_camera/live_smoke_v2/pose_static_03`
- 多样本评估脚本输出：
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm/.artifacts/calibration/left_camera/live_smoke_v2/summary.json`
  - 当前结果：
    - `sample_count=3`
    - `world_height_range_m=0.000682`
    - `normal_drift_deg_max=2.5226`
    - `median_residual_mm_max=4.7870`
    - `color_depth_overlap_ratio_min=0.9487`
    - `passes=true`
- 自动夹取入口负例 smoke：
  - `pick_assist_auto_grasp.py` 在 `right_arm + require_world_tf=false` 下会在运动前拒绝执行
  - 这是当前最小比赛级安全入口证据

### 当前阻塞
- 正式 `verified` 的 `left_tcp -> left_camera` 外参尚未生成并回写到 `calibration_transforms.yaml`；当前仍依赖调试静态 TF 做桌面/抓取验证。
- 还没有完成“15~30 组图像+TCP”的真实手眼采样与 `eye_in_hand_calibration.py` 计算结果导入。
- `dual_arm_assist` 仍只是最小等待/门禁模式，不等于比赛级双臂协作动作完成。
- 还没有拿到 `water_bottle` / `cola_bottle` / `cup` 的正式真机抓取成功证据。
- spill / 半杯液位 / 双臂接球 3 秒 / 入筐前 release guard 这些官方评分项仍未收口为完整 acceptance。

### 下一步唯一优先级
1. 用真实标定板或 ArUco 完成 `left_tcp -> left_camera` 的图像+TCP 采样。
2. 运行 `eye_in_hand_calibration.py` 生成 `camera_to_gripper` 结果。
3. 用 `promote_calibration_transform.py` dry-run -> 正式回写 `verified` 外参。
4. 在 `allow_unverified_camera_extrinsics=false` 下重起 perception 热切链，确认：
   - `left_camera_depth_frame -> world` 可查
   - `table_surface_detector` 仍能稳定输出 `world` 桌面
5. 再做真机单臂抓取：
   - 左臂 `water_bottle`
   - 右臂 `cola_bottle`

## 2026-04-20 新窗口接续前状态更新

### Git / Remote
- 本轮关键改动已提交并推送到远程分支：
  - `codex/competition-pick-assist-calibration`
- 远程 PR 入口：
  - `https://github.com/TNHTH/dual-arm/pull/new/codex/competition-pick-assist-calibration`
- 提交：
  - `4186a75 Implement competition pick assist calibration gates`
  - `bbe89f6 Fix detector launch parameter typing`
- 未直接推送 `origin/test` 的原因：
  - 本地 `test` 与 `origin/test` 分叉：本地领先 12、远端领先 1。
  - `git pull --rebase origin test` 在旧提交 `524ec6a` 处出现目录重命名、文件/目录类型冲突和状态文件冲突。
  - 为避免强推或误合并，已改为推送新分支。

### 当前 Live 状态
- 当前核心链已经在断电后重新拉起：
  - `competition_core.launch.py` PID `13206`
  - `orbbec_gemini_ros_bridge.py` PID `13238`
  - `depth_processor_node` PID `13242`
  - `move_group` PID `13256`
  - `table_surface_detector.py` PID `13268`
  - 左夹爪节点 PID `13270`
  - 右夹爪节点 PID `13274`
  - 左臂 `robo_ctrl_node` PID `13276`
  - 右臂 `robo_ctrl_node` PID `13281`
  - 手动补起的 `detector_pt_node.py` PID `14348/14395`
  - OpenCV 检测窗口 PID `14597`
  - OpenCV pick-assist overlay 窗口 PID `14606`
- 当前启动方式：
  - `start_hardware:=true`
  - `start_camera_bridge:=true`
  - `start_table_surface_detector:=true`
  - `detector_model_path:=/home/gwh/下载/best.3.pt`
  - `allow_unverified_camera_extrinsics:=true`
  - `depth_require_depth_aligned_detections:=false`
  - `ball_require_depth_aligned_detections:=false`
- 注意：
  - launch 内的 detector 曾因 `allowed_class_ids` 参数类型崩溃，已修复代码并重建 `dualarm_bringup`。
  - 当前 detector 是手动补起的，使用 `/home/gwh/下载/best.3.pt`，正常跑在 `cuda:0`。

### 当前 ROS 图证据
- `/execution/execute_trajectory` 当前只有 1 个 server：
  - `/execution_adapter`
- 左右臂本体状态正常：
  - `/L/robot_state`: `motion_done=true`, `error_code=0`
  - `/R/robot_state`: `motion_done=true`, `error_code=0`
- 右夹爪状态正常：
  - `/gripper1/epg50_gripper/status` with `slave_id=10` 返回 `success=True`
- 左夹爪状态异常：
  - `/gripper0/epg50_gripper/status` with `slave_id=9` 返回 `success=False`
  - `/gripper0/epg50_gripper/status` with `slave_id=10` 也返回 `success=False`
  - 当前更像左夹爪电源/接线/通信地线/USB-485 链路问题，而不是单纯从站 ID 互换。

### 当前感知效果
- `/perception/detection_2d` 已实际识别到：
  - `cup`
  - `basket`
  - `water_bottle`
  - `cola_bottle`
  - `soccer_ball`
- 已保存识别效果图：
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm/.artifacts/camera_debug/best3_detector_latest.png`
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm/.artifacts/camera_debug/pick_assist_overlay_latest.png`
- `/perception/table_scene_objects` 已发布 `world` 下的 `table_surface`。
- `/scene_fusion/scene_objects` 已出现：
  - `basket`
  - `soccer_ball`
  - `cup`
  - `water_bottle`
  - `cola_bottle`
- `/planning/grasp_targets` 已生成 `world` target：
  - `water_bottle -> left_arm`
  - `cup -> left_arm`
  - `cola_bottle -> right_arm`
  - `soccer_ball -> dual_arm`

### 临时调试状态 / 不可当作验收
- 当前为了快速验证 RGB+depth 到 `world` 对象链路，已临时设置：
  - `ros2 param set /depth_processor_node use_table_plane false`
- 这证明了未注册色深链下的 3D 主链可以输出瓶/杯对象，但不能作为比赛级抓取验收输入。
- 当 `use_table_plane=true` 时，当前 `depth_handler` 会大量提示：
  - `ROI 点经桌面平面剔除后不足`
- 说明当前色深未注册 + 桌面剔除阈值下，瓶/杯 ROI 深度基本落在桌面平面上；下一步需要修 color-depth 对齐或桌面剔除策略，而不是直接抓取。

### 下一窗口第一批命令
```bash
cd /home/gwh/dashgo_rl_project/workspaces/dual-arm
source /opt/ros/humble/setup.bash
source install/setup.bash
pgrep -af 'competition_core.launch.py|orbbec_gemini_ros_bridge|detector_pt_node|ros_image_viewer|table_surface_detector|depth_processor_node|epg50_gripper_node|robo_ctrl_node|move_group'
ros2 action info /execution/execute_trajectory
ros2 topic echo --once /perception/detection_2d
ros2 topic echo --once /scene_fusion/scene_objects
ros2 topic echo --once /planning/grasp_targets
ros2 service call /gripper0/epg50_gripper/status epg50_gripper_ros/srv/GripperStatus "{slave_id: 9}"
ros2 service call /gripper1/epg50_gripper/status epg50_gripper_ros/srv/GripperStatus "{slave_id: 10}"
```

### 下一步优先级
1. 先修左夹爪通信；左夹爪不通前，不要执行左臂真抓。
2. 修 `depth_handler` 在 `use_table_plane=true` 下的瓶/杯 3D 保留问题。
3. 完成 `left_tcp -> left_camera` verified 标定；当前仍是 unverified 调试外参。
4. 只在以上三项通过后，才做真机自动夹取：
   - 左臂 `water_bottle`
   - 右臂 `cola_bottle`

## 2026-04-20 左夹爪连接续测

### 本次结论
- 当前 `competition_core.launch.py` live 栈里，右夹爪节点仍在运行，但左夹爪节点没有存活到当前 ROS 图中：
  - 存活节点：`/gripper1/gripper_node_right`
  - 未见存活节点：`/gripper0/gripper_node_left`
- 当前系统只枚举到 1 个 USB-485 串口：
  - `/dev/serial/by-id/usb-Prolific_Technology_Inc._USB-Serial_Controller_A_COb114J19-if00-port0 -> /dev/ttyUSB0`
- 当前这根实际在线串口只对 `slave_id=10` 有稳定响应；对 `slave_id=9` 不通。
- `execution_adapter`、`/execution/set_gripper` 和上层路由逻辑本身没有卡死；当显式把 `slave_id` 指到 `10` 时，即使 `arm_name=left_arm` 也能成功下发命令。
- 因此，当前左夹爪未打通的主因不是上层控制接口，而是现场没有一条能稳定触达 `slave_id=9` 的物理串口链路。

### 本次证据
- 当前 ROS 图：
  - `ros2 node list | sort`
  - 仅见 `/gripper1/gripper_node_right`
- 当前右夹爪参数：
  - `ros2 param get /gripper1/gripper_node_right port`
    - `/dev/serial/by-id/usb-Prolific_Technology_Inc._USB-Serial_Controller_A_COb114J19-if00-port0`
  - `ros2 param get /gripper1/gripper_node_right default_slave_id`
    - `10`
- 当前在线从站验证：
  - `ros2 service call /gripper1/epg50_gripper/status epg50_gripper_ros/srv/GripperStatus "{slave_id: 10}"`
    - `success=True`
  - `ros2 service call /gripper1/epg50_gripper/status epg50_gripper_ros/srv/GripperStatus "{slave_id: 9}"`
    - `success=False`
- 当前上层路由验证：
  - `ros2 service call /execution/set_gripper dualarm_interfaces/srv/SetGripper "{arm_name: right_arm, command: 2, slave_id: 0, position: 0, speed: 80, torque: 40, object_id: '', link_name: '', attach_on_success: false, detach_on_success: false}"`
    - `success=True`
  - `ros2 service call /execution/set_gripper dualarm_interfaces/srv/SetGripper "{arm_name: left_arm, command: 2, slave_id: 0, position: 0, speed: 80, torque: 40, object_id: '', link_name: '', attach_on_success: false, detach_on_success: false}"`
    - `success=False`
  - `ros2 service call /execution/set_gripper dualarm_interfaces/srv/SetGripper "{arm_name: left_arm, command: 2, slave_id: 10, position: 0, speed: 80, torque: 40, object_id: '', link_name: '', attach_on_success: false, detach_on_success: false}"`
    - `success=True`
- 当前单口从站扫描结果：
  - 在 `/gripper1/epg50_gripper/status` 上扫描 `slave_id=1..16`
  - 仅 `slave_id=10` 返回 `OK`
  - `slave_id=9` 为 `TIMEOUT`
- 当前最小旁路探针：
  - 临时启动 `left_probe.left_gripper_probe`
  - 绑定当前唯一串口 `/dev/serial/by-id/usb-Prolific_Technology_Inc._USB-Serial_Controller_A_COb114J19-if00-port0`
  - `default_slave_id:=9`
  - 结果：状态线程持续 `获取夹爪状态失败`

### 当前判断
- 左夹爪问题已经收缩到物理层或设备侧参数层：
  - 左 USB-485 转换器当前未枚举或已掉线
  - 左夹爪独立供电异常
  - RS485 A/B 或通信地线异常
  - 左夹爪实际从站 ID 已变化，但当前在线串口上未扫描到
- 当前不支持把“左夹爪未通”解释成 `execution_adapter` 或网页控制接口故障。

### 下一步
1. 先恢复或确认左 USB-485 转换器重新枚举，再核对 `/dev/serial/by-id` 是否重新出现左侧 by-id。
2. 左侧串口恢复后，优先只做 `status` 扫描，确认能稳定读到 `slave_id=9` 或新的实际从站 ID。
3. 只有在左侧 `status` 可读后，才继续 `enable` 和最小开合命令。
4. 在左夹爪重新打通前，不执行任何依赖左夹爪的左臂真抓动作。

## 2026-04-20 左夹爪重连控制成功

### 本次结论
- 用户重新连接左夹爪接口后，左 USB-485 转换器重新枚举成功：
  - `/dev/serial/by-id/usb-Prolific_Technology_Inc._USB-Serial_Controller_A7BIb114J19-if00-port0 -> /dev/ttyUSB1`
  - `/dev/serial/by-id/usb-Prolific_Technology_Inc._USB-Serial_Controller_A_COb114J19-if00-port0 -> /dev/ttyUSB0`
- 原 live 栈中左夹爪节点未存活，因此已手动补起：
  - node: `/gripper0/gripper_node_left`
  - port: `/dev/serial/by-id/usb-Prolific_Technology_Inc._USB-Serial_Controller_A7BIb114J19-if00-port0`
  - default slave: `9`
  - `disable_on_shutdown:=false`
- 左夹爪 `slave_id=9` 状态可读，并通过正式上层接口 `/execution/set_gripper` 控制成功。

### 验证证据
- 串口枚举：
  - `A7BIb114J19 -> /dev/ttyUSB1`
  - `A_COb114J19 -> /dev/ttyUSB0`
- 左夹爪节点启动日志：
  - `初始化EPG50夹爪 ... 默认从站ID: 0x09`
  - `EPG50夹爪节点已启动`
- 状态读取：
  - `ros2 service call /gripper0/epg50_gripper/status epg50_gripper_ros/srv/GripperStatus "{slave_id: 9}"`
  - 返回：`success=True, gact=True, gsta=3, error=0, position=255`
- 正式上层控制：
  - `ros2 service call /execution/set_gripper dualarm_interfaces/srv/SetGripper "{arm_name: left_arm, command: 2, slave_id: 0, position: 0, speed: 80, torque: 40, object_id: '', link_name: '', attach_on_success: false, detach_on_success: false}"`
  - 返回：`success=True, message='夹爪命令完成'`
- 控制后状态回读：
  - `success=True, status=241, gact=True, gsta=3, gobj=3, error=0, position=0, voltage=23, temperature=36`

### 当前状态
- 左夹爪已恢复到最大张开 `position=0`。
- 右夹爪节点仍存活在 `/gripper1/gripper_node_right`。
- 左夹爪节点当前是手动补起的，不是 `competition_core.launch.py` 自动重启出来的；若重启整套 live 栈，需要确认 launch 是否能同时拉起 `/gripper0` 与 `/gripper1`。

### 剩余风险
- 本次只验证了左夹爪状态读取与最大张开命令，没有做闭合夹持测试。
- 若要进入左臂真抓，仍需先确认现场夹爪开合空间安全，再做小力度闭合或目标物夹持测试。

## 2026-04-21 RViz 展示、双相机契约与模型点云收口

### 本次结论
- 已按 v4 路线继续推进，但本轮在用户要求下先安全收口，未继续做真机动作。
- 新增 RViz Operator 层已经落地，能够通过 `competition_rviz.launch.py` 一键拉起 core + RViz + interactive marker / debug marker / scene model point cloud。
- RViz 曾出现空白，根因不是 RViz 配置单点问题，而是底层 ROS 图已退出；后续必须先启动、再截图确认，不再只凭进程判断。
- RViz 截图确认过一次可见：
  - 双臂 RobotModel 可见
  - scene/model 点云可见
  - 但模型点云与机械臂/桌面仍存在明显位姿偏差
- 机械臂姿态不准的首要嫌疑已收缩：
  - `/L|R/joint_states` 发布逻辑在 `robo_ctrl_node.cpp` 中已做 `deg -> rad`，不是关节单位错误
  - 当前 URDF 中 `world_to_left_base/right_base` 原先是硬编码估计值，已改为 xacro/launch 可配置参数
  - 后续需要现场实测左右底座在 `world` 下的位置和 yaw，不能继续用默认 `0 ±0.35 0` 当真实安装
- 模型点云高度不对的首要嫌疑已收缩：
  - `scene_model_pointcloud` 原先直接按 `SceneObject.pose` 作为几何中心采样
  - 已改为对桌面支撑物体按 table surface 贴底显示，避免瓶/杯/筐模型云上下漂
  - 最新“贴底显示”改动已构建通过，但在安全收口前未再次完成 RViz 截图验收
- 右臂现在也有视觉相机，已开始建立左右相机命名隔离：
  - 新增 `right_tcp -> right_camera -> right_camera_color_frame/right_camera_depth_frame` TF 配置项，状态仍为 `unverified`
  - `orbbec_gemini_bridge.launch.py` 已支持传入 node name、topic 和 frame id，便于后续启动左右两套相机 bridge
  - 当前正式感知主链仍需明确采用左相机还是右相机输入，不能再把 `/camera/*` 当成唯一相机事实

### 已完成代码与配置
- 新增统一配置：
  - `configs/competition/object_geometry.yaml`
  - `configs/competition/workspace_profiles.yaml`
  - `configs/competition/task_thresholds.yaml`
- 已记录或修正的固定参数：
  - 小号篮球/足球：直径约 `0.12m`
  - 收纳筐：`0.30 x 0.20 x 0.12m`
  - 水杯：口径 `0.075m`、底径 `0.060m`、高度 `0.115m`
  - 怡宝 350ml / 可口可乐 300ml 当前仍为工程代理尺寸；下一轮需用卡尺或可靠公开资料最终校准
- 新增接口：
  - `dualarm_interfaces/srv/TaskCommand.srv`
  - `dualarm_interfaces/srv/SetObjectInteraction.srv`
- `planning_scene_sync` 已支持：
  - `free`
  - `attached_single`
  - `dual_contact`
  - `opened_split`
  - bottle 的 body + cap 复合 collision
- `execution_adapter` 已接入 `SetObjectInteraction`，用于：
  - 开盖后 `opened_split`
  - 球类 `dual_contact` 释放
- `dualarm_task_manager` 已新增 `/task/command`，RViz 命令不再绕过任务层。
- `depth_handler` 已新增瓶盖相关 subframe：
  - `bottle_cap_grasp`
  - `bottle_twist_axis`
- `table_surface_detector` 已新增 detection-seeded table component 选择，降低把旁边木色家具/底座误选成桌面的风险。
- `scene_model_pointcloud` 已新增模型点云：
  - `/competition/rviz/scene_model_points`
  - 由 `scene_fusion` 的桌面/水瓶/可乐/杯子/球/筐生成几何采样点云

### 验证证据
- 增量构建已通过：
  - `dualarm_interfaces`
  - `planning_scene_sync`
  - `grasp_pose_generator`
  - `execution_adapter`
  - `dualarm_task_manager`
  - `depth_handler`
  - `tools`
  - `competition_rviz_tools`
  - `dualarm_bringup`
  - `fairino_dualarm_description`
  - `fairino_dualarm_moveit_config`
  - `fairino_dualarm_planner`
  - `orbbec_gemini_bridge`
  - `tf_node`
- `xacro fairino_dualarm.urdf.xacro left_base_xyz:=... right_base_xyz:=...` 生成通过。
- RViz 截图证据：
  - `/tmp/competition_rviz_latest.png`
  - 截图中 RobotModel 与点云可见，但空间对齐仍不准确。
- 安全收口后已确认没有残留 ROS/RViz 业务进程。

### 当前阻塞
- 真实 `left_tcp -> left_camera` 仍未 verified，桌面/物体 world pose 不能作为比赛级最终结果。
- `right_tcp -> right_camera` 只是 placeholder，右臂相机必须单独标定。
- 双臂基座安装位姿仍是工程默认值，必须现场测量后通过 launch 参数覆盖。
- 当前模型点云参数已有统一 YAML，但怡宝/可乐瓶最终尺寸仍需实测或可靠资料确认。
- 当前“贴桌面显示”的模型点云高度修复只完成 build，尚未重新截图确认。

### 下一步
1. 先在新窗口启动 `competition_rviz.launch.py`，并按新规则截图确认，不可直接声称 RViz 正常。
2. 现场量取并设置：
   - `left_base_xyz`
   - `left_base_rpy`
   - `right_base_xyz`
   - `right_base_rpy`
3. 使用 `right_camera_*` frame/topic 接右臂相机，不允许复用左相机 frame。
4. 对 `left_tcp -> left_camera` 和 `right_tcp -> right_camera` 分别做 hand-eye 标定。
5. 用 RViz 同时检查：
   - RobotModel 实机姿态
   - `/competition/rviz/scene_model_points`
   - `/depth_handler/pointcloud`
   - `/perception/table_points`
   - MoveIt PlanningScene collision

## 2026-04-22 右臂深度相机 P0 软件主链落地

### 新完成
- 按“比赛保底版”实施 P0 软件侧主链，核心接口保持不变：
  - 未修改 `SceneObject/GraspTarget/PlanPose/PlanDualPose` 等 msg/srv/action。
  - `detector` 模型、类别和训练链继续冻结。
- 双相机命名隔离已进入 bringup：
  - 新增 `dual_camera_mode:=reobserve_only|full`，默认 `reobserve_only`。
  - 新增左右相机 topic/frame/device 参数，默认 topic 为 `/left_camera/*` 与 `/right_camera/*`。
  - `dual_camera_mode:=full` 时启动右侧 detector/adapter/depth/ball 链；默认 `reobserve_only` 只启左侧常规感知链，保留右相机 bridge 入口。
- 右相机碰撞模型已加入双臂 robot model：
  - `right_camera_mount`
  - `right_camera_body`
  - `right_tcp_to_camera_mount`
  - `right_camera_mount_to_body`
- 感知 provenance 已参数化：
  - `detector_adapter` / `depth_handler` / `ball_basket_pose_estimator` 均新增 `source_name`
  - 左右实例分别写入 `left_camera/right_camera`
- `scene_fusion` 已升级为 P0 最小融合：
  - 支持 launch 参数化 `scene_fusion_input_topics`
  - 同语义近距离 track 去重
  - world pose 使用短窗口中值融合，降低左右 source 切换跳变
  - `scene_version` 只在 scene signature 有效变化时推进，不再定时无条件自增
- `planning_scene_sync` 已收紧 MoveIt diff：
  - attached ADD 迁移现有 world object 时，不再在同一个 diff 中写入同 id `world REMOVE`
  - `smoke_planning_scene_sync.py` 已改成 `water_bottle_gold` 单水瓶 world/attached 金样例
- `dualarm_task_manager` 已增加 P0 单次重观测最小入口：
  - 新增 `reobserve_once_enabled/reobserve_once_timeout_sec/reobserve_once_interval_sec`
  - 新增 `/task/command` 的 `command_id=reobserve_once`
  - `_require_object`、`_plan_for_object`、`_direct_grasp` 在对象或 target 缺失时只等待一次 managed scene version 前进，再重试一次
  - 查找对象时要求 pose 在 `world` 且 `source` 非空，避免无来源/非 world 证据继续推进

### 验证证据
- 全量构建通过：
  - 命令：`env -u PYTHONPATH -u LD_LIBRARY_PATH -u LIBRARY_PATH -u CMAKE_PREFIX_PATH PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin ./build_workspace.sh`
  - 输出：`Summary: 27 packages finished`
- Python 语法检查通过：
  - `detector_adapter_node.py`
  - `scene_fusion_node.py`
  - `ball_basket_pose_estimator_node.py`
  - `planning_scene_sync_node.py`
  - `dualarm_task_manager_node.py`
  - `smoke_dual_camera_scene_dedup.py`
  - `smoke_dual_camera_scene_fusion.py`
  - `smoke_planning_scene_sync.py`
- launch/xacro 证据：
  - `ros2 launch scene_fusion scene_fusion.launch.py --show-args` 显示 `scene_fusion_input_topics/scene_fusion_output_topic/scene_fusion_*_timeout`
  - `ros2 launch dualarm_bringup competition_core.launch.py --show-args` 显示 `dual_camera_mode`、左右相机 topic、左右 detector topic、`reobserve_once_*`
  - `xacro ... fairino_dualarm.urdf.xacro` 可展开 `right_camera_mount/right_camera_body`
- 双相机 fusion smoke 通过：
  - 启动：`ros2 launch scene_fusion scene_fusion.launch.py scene_fusion_input_topics:="['/perception/left/scene_objects','/perception/right/scene_objects']" scene_fusion_stale_timeout:=5.0 scene_fusion_lost_timeout:=6.0`
  - `/usr/bin/python3 src/tools/tools/scripts/smoke_dual_camera_scene_dedup.py` 输出 `dual camera scene dedup smoke passed`
  - `/usr/bin/python3 src/tools/tools/scripts/smoke_dual_camera_scene_fusion.py` 输出 `dual camera scene fusion smoke passed`
- PlanningScene 单水瓶金样例通过：
  - 启动：`ros2 launch dualarm_bringup competition_core.launch.py start_hardware:=false start_detector:=false start_camera_bridge:=false start_table_surface_detector:=false use_mock_camera_stream:=false publish_fake_joint_states:=true`
  - `/usr/bin/python3 src/tools/tools/scripts/smoke_planning_scene_sync.py` 输出 `planning_scene_sync smoke passed`
  - 日志确认 attach diff 为 `world_remove=[]`、`attached_add=['water_bottle_gold']`

### 当前阻塞与风险
- 尚未完成真实右相机设备启动、真实右相机 hand-eye 标定和左右相机同物体 `world` 中心差 `<1-2cm` 的实机证据。
- `dual_camera_mode:=full` 软件链已接入，但现场建议先用默认 `reobserve_only` 降风险。
- `reobserve_once` 当前是最小版本：只等待 managed scene version 前进并重试一次，不主动移动右臂相机。
- core 停止时 `move_group` 仍可能在析构路径段错误；本次 smoke 已通过且停止后无残留业务进程，但退出路径需要后续单独治理。
- `tf_node` 默认仍拒绝 `left_tcp/right_tcp -> *_camera` unverified 外参，这是正确安全门禁；如果要 debug，需要显式 `allow_unverified_camera_extrinsics:=true`。

### 下一步
1. 现场用显式 `/dev/videoX` 启动左右 Orbbec，不要双实例都依赖 `auto`。
2. 完成 `right_tcp -> right_camera` hand-eye 标定，把 `calibration_status` 从 `unverified` 晋级为 `verified` 后再进比赛级抓取。
3. 在真实相机下跑右相机单链路：`/perception/right/detection_2d`、`/perception/right/scene_objects`、`source=right_camera`。
4. 在 `reobserve_only` 模式下验证遮挡左相机、右相机可见时能触发单次重观测并安全退出或继续。

## 2026-04-22 单 Orbbec 显式设备号运行时补充验证

### 新完成
- 已重新核对当前机器的 live 相机条件：
  - 仅检测到 1 台 Orbbec Gemini 335：`2bc5:0800`
  - 同时存在笔记本集成摄像头，当前位于 `/dev/video8`、`/dev/video9`
- 已重新探测当前 Orbbec 的 V4L2 映射，确认旧记录 `color=/dev/video8`、`depth=/dev/video2` 已失效：
  - `/dev/video0`：`Z16`
  - `/dev/video6`：`YUYV`、`MJPG`
  - `/dev/video8`：集成摄像头，不可再作为 Orbbec 彩色节点默认值
- 已用显式设备号完成右相机最小运行时验证：
  - 直起 bridge：`color=/dev/video6`、`depth=/dev/video0`
  - 集成起 core：`dual_camera_mode:=reobserve_only`、`enable_left_camera:=false`、`enable_right_camera:=true`
  - 允许未 verified 外参仅用于调试：`allow_unverified_camera_extrinsics:=true`、`require_verified_camera_extrinsics:=false`

### 验证证据
- 当前系统设备枚举：
  - `lsusb` 可见 `Orbbec Gemini 335`
  - `/sys/class/video4linux/*/name` 显示 `video0..7` 属于 Orbbec，`video8..9` 属于 Integrated Camera
- V4L2 格式探测：
  - `/dev/video0: ['Z16']`
  - `/dev/video6: ['YUYV', 'MJPG']`
  - `/dev/video8: ['MJPG', 'YUYV']`
- 右相机 bridge 直起验证：
  - `ros2 run orbbec_gemini_bridge orbbec_gemini_ros_bridge.py ... color_device:=/dev/video6 depth_device:=/dev/video0 depth_backend:=v4l2 ...`
  - 日志确认：`color=/dev/video6`、`depth_backend=v4l2_z16`、`depth_device=/dev/video0`
  - `/right_camera/color/image_raw` 约 `15Hz`
  - `/right_camera/depth/image_raw` 约 `15Hz`
  - header 验证：
    - `frame_id=right_camera_color_frame`
    - `frame_id=right_camera_depth_frame`
- `competition_core.launch.py` 集成验证：
  - 在 `reobserve_only + 仅右相机 + 显式设备号` 下，`right_orbbec_gemini_bridge` 正常启动
  - `/right_camera/color/image_raw`
  - `/right_camera/depth/image_raw`
  - `/right_camera/depth/camera_info`
  - `scene_fusion`、`planning_scene_sync`、`execution_adapter`、`dualarm_task_manager`、`move_group`、`fairino_dualarm_planner` 均正常拉起

### 当前阻塞与风险
- 当前现场只有 1 台 Orbbec，双相机真机联调暂时不具备物理前提。
- `orbbec_gemini_ros_bridge.py` 的 `auto` 彩色设备选择仍按“最高索引的 YUYV/MJPG 节点”决策；在当前机器上会误选到集成摄像头，因此现场必须使用显式 `/dev/videoX`。
- `competition_core.launch.py` 停止时，`move_group` 仍复现析构段错误；业务进程能退出，但退出路径仍不干净。
- 中断 camera bridge 时，V4L2 路径会出现 `VIDIOC_QBUF: Bad file descriptor`，当前表现为退出期噪声，不影响运行期数据发布。

### 下一步
1. 现场补齐第 2 台 Orbbec 后，分别重新探测左右彩色/深度节点，不允许直接复用历史 `/dev/videoX`。
2. 在双设备到位前，继续把当前单台 Orbbec 用作右相机单链路基线：
   - `/right_camera/*`
   - 后续再推进 `/perception/right/*`
3. 完成 `right_tcp -> right_camera` hand-eye 标定后，再关闭 `allow_unverified_camera_extrinsics` 回到比赛默认门禁。

## 2026-04-22 真机姿态校正与左链 live 验证补充

### 新完成
- 已把右臂默认基座 yaw 从“背向”修正为“前向”：
  - `right_base_rpy` 默认值从 `0 0 pi` 改为 `0 0 0`
  - 变更已同步到 URDF、MoveIt、planner 和 bringup 系列 launch
- 已完成真实双臂状态接入验证：
  - `start_hardware:=true`
  - `publish_fake_joint_states:=false`
  - `/L/joint_states`、`/R/joint_states` 各有 1 个真实 publisher
  - `/joint_states` 由 aggregator 汇总为 1 个 publisher
- 已完成左相机真机链 live 验证：
  - `enable_left_camera:=true`
  - `enable_right_camera:=false`
  - `start_detector:=true`
  - `left_camera_color_device:=/dev/video6`
  - `left_camera_depth_device:=/dev/video0`
  - `left_camera_rotate_180:=false`
- 已修复 `depth_handler` 因 future extrapolation 丢弃 `world` 对象的问题：
  - 精确时间查 TF 失败且报 future extrapolation 时，改用最新可用变换
  - 修复后左链可稳定产出 `frame_id=world` 的对象与点云
- 已修正 RViz 点云显示源：
  - 旧 `/depth_handler/pointcloud`
  - 改为 `/depth_handler/left/pointcloud` 与 `/depth_handler/right/pointcloud`

### 验证证据
- 真实姿态对齐：
  - `/R/robot_state.tcp_pose`:
    - `rx≈163.939`
    - `ry≈32.687`
    - `rz≈23.018`
  - `tf2_echo world right_tcp`:
    - `RPY≈[163.939, 32.687, 23.018]`
  - 说明右臂“夹爪朝前”的 yaw 方向已与实机对齐
- 真实关节状态：
  - `/L/joint_states` publisher count = `1`
  - `/R/joint_states` publisher count = `1`
  - `/joint_states` publisher count = `1`
- 左相机检测与 world 对象：
  - `/detector/left/detections` 有 publisher，且可见 `cup / water_bottle / cola_bottle`
  - `/perception/left/scene_objects` 已返回 `frame_id=world`
  - 对象示例包含：
    - `water_bottle_1`
    - `cola_bottle_2`
    - `cup_3`
  - 对象 `source=left_camera`
- 左点云：
  - `/depth_handler/left/pointcloud` 有 publisher
  - `ros2 topic echo --once /depth_handler/left/pointcloud` 已拿到 `PointCloud2`
  - `ros2 topic hz /depth_handler/left/pointcloud` 约 `14~15Hz`
- 可视化：
  - `left_detector_view` 窗口存在
  - RViz 窗口存在，配置文件为 `competition_control.rviz`

### 当前阻塞与风险
- 用户要求的“真正双相机协同”当前仍未达成，因为系统实时枚举里仍只有 1 台 Orbbec：
  - `lsusb` 仅见 1 个 `2bc5:0800 Orbbec Gemini 335`
  - `/dev/video0..7` 全部对应同一个 `ID_SERIAL_SHORT=CP02653000G2`
- 当前可以分别验证左链或右链，但无法同时做“左右双相机融合”的真机 USB 级联调。
- RViz 姿态还未完全达到“正式双臂安装位姿”：
  - 右臂朝向已对齐
  - 但 `world_to_left_base/right_base` 的实际平移/yaw 还没有现场实测值
  - 目前仍不能把整机在 world 下的位置当成正式赛场摆位
- `move_group` 停止时依旧段错误；`ros_image_viewer.py` Ctrl+C 退出时仍有二次 shutdown 异常；均为已知退出路径问题。

### 下一步
1. 先解决第二台 Orbbec 未枚举问题，拿到第二个独立 `ID_SERIAL_SHORT` 后再进入真正双相机协同。
2. 第二台相机到位后，分别重新探测左右的：
   - `color_device`
   - `depth_device`
   - `ID_SERIAL_SHORT`
3. 用同一批杯/瓶/球目标再跑：
   - `/perception/left/*`
   - `/perception/right/*`
   - `/scene_fusion/scene_objects`
   - `/competition/rviz/scene_model_points`
4. 现场实测左右基座安装位姿，覆盖 `left_base_xyz/right_base_xyz/right_base_rpy`，再做最终 RViz 姿态验收。

## 2026-04-22 双机枚举恢复但右桥失稳补充

### 新完成
- 第二台 Orbbec 已重新枚举恢复，当前双机身份明确：
  - 左：`CP1E5420007N`
  - 右：`CP02653000G2`
- 当前稳定映射已重新识别：
  - 左：
    - color=`/dev/video16`
    - depth=`/dev/video10`
  - 右：
    - color=`/dev/video6`
    - depth=`/dev/video0`
- 已再次拉起 true full 双机栈：
  - `dual_camera_mode:=full`
  - 左右 detector/depth/ball/scene_fusion 同时启动
  - `left_detector_view`
  - `right_detector_view`
  - RViz

### 验证证据
- `lsusb` 当前已同时出现两台 `2bc5:0800`
- `/dev/v4l/by-id` 中已出现两个独立序列号：
  - `CP1E5420007N`
  - `CP02653000G2`
- 左链在 full 模式下仍稳定：
  - `/perception/left/scene_objects` 持续输出 `frame_id=world`
  - `/scene_fusion/scene_objects` 当前可读到 `source=left_camera` 的对象
  - `/competition/rviz/scene_model_points` 已输出 `PointCloud2`

### 当前阻塞与风险
- 右桥当前仍未恢复稳定输入：
  - `right_orbbec_gemini_bridge` 持续报：
    - `读取彩色图失败`
    - `ioctl(VIDIOC_DQBUF): No such device`
- 即使把右桥单独降到 `5fps` 并手工起桥，问题仍复现。
- 因此当前“双相机协同”已经从“第二台没接好”收敛为：
  - 双机已枚举
  - 但右侧 UVC 输入层仍失稳
- 当前 unified scene 仍主要依赖左侧对象，右侧尚未形成稳定贡献。

### 下一步
1. 继续只针对右相机 `CP02653000G2` 排查：
   - 是否会在运行期重新枚举
   - 是否存在线缆/接口接触问题
2. 在右桥恢复稳定后，再做最终双机统一验收：
   - `/perception/left/scene_objects`
   - `/perception/right/scene_objects`
   - `/scene_fusion/scene_objects`
   - `/competition/rviz/scene_model_points`

## 2026-04-22 双彩色常开 + 单侧深度稳定模式

### 新完成
- 已把 `orbbec_gemini_bridge` 升级为支持 `enable_depth` 参数。
- 已把 bringup 正式接线改成可控的每侧深度开关与每侧 fps：
  - `left_camera_enable_depth`
  - `right_camera_enable_depth`
  - `left_camera_fps`
  - `right_camera_fps`
- 当前稳定模式已验证可跑：
  - 左右彩色常开
  - 左深度常开
  - 右深度关闭
  - 两侧 detector 仍可同时运行
- 当前这台机器上，双机身份与映射已重新稳定：
  - 左 `CP1E5420007N`
    - color=`/dev/video16`
    - depth=`/dev/video10`
  - 右 `CP02653000G2`
    - color=`/dev/video6`
    - depth=`/dev/video0`

### 验证证据
- 双桥只开彩色隔离测试：
  - 左彩色约 `5Hz`
  - 右彩色约 `5Hz`
  - 说明双桥并发本身稳定
- 稳定模式正式 launch：
  - `right_camera_enable_depth:=false`
  - `left_camera_enable_depth:=true`
  - `left_camera_fps:=5.0`
  - `right_camera_fps:=5.0`
- 稳定模式下：
  - `/detector/left/detections` 有 publisher
  - `/detector/right/detections` 有 publisher
  - `/perception/left/scene_objects` 持续输出 `world` 对象
  - `/scene_fusion/scene_objects` 可持续输出 unified scene
  - `/competition/rviz/scene_model_points` 可输出 `PointCloud2`

### 当前阻塞与风险
- 双机 `full + 双深度常开` 仍未恢复；右桥在双深度并发时仍会掉到：
  - `读取彩色图失败`
  - `VIDIOC_DQBUF: No such device`
- 因此当前可交付口径应从“全量双深度常开”下调为：
  - “双彩色协同 + 单侧深度常开 + 另一侧深度按需启用”
- 右侧 `world` 3D 建模仍需在“右深度按需启用”模式下单独验收。

### 下一步
1. 先把当前稳定模式作为默认调试/演示入口。
2. 下一轮专门验证：
   - `right_camera_enable_depth:=true`
   - `left_camera_enable_depth:=false`
   的右侧 3D 建模链
3. 若仍要挑战双深度常开，需要把问题继续下探到 UVC/总线层。
