# Progress Log

创建时间：2026-04-15
更新时间：2026-04-15

## Session: 2026-04-15

### Current Status
- **Phase:** In Progress - 一轮完整实现
- **Started:** 2026-04-15

### Session: 2026-04-16

### Actions Taken
- 建立 `.codex/delivery` PRD / Epic / Task 工件骨架。
- 建立 `.codex/tmp/prd-tracker/PRD.md` 与 `.codex/tmp/resume/*` 接续文件。
- 将根目录包与 `arm_planner/src/*` 迁移到统一的 `src/` 正式包根。
- 将 `fairino3_v6_planner` 迁入 `src/planning/legacy/` 并加 `COLCON_IGNORE`。
- 将 `build_workspace.sh` 正式切换到 `colcon build --base-paths src`。
- 新增 `competition_integrated.launch.py` 作为正式总装入口骨架。
- 扩展 `dualarm_interfaces`：
  - `SceneObjectArray.scene_version`
  - `RunCompetition` 恢复字段
  - `ExecutePrimitive.action`
  - `PlanDualPose.srv`
  - `PlanDualJoint.srv`
- `scene_fusion` 已开始写数组级 `scene_version`。
- `planning_scene_sync` 已从 topic overlay 升级为带 `ApplyPlanningScene` client 的 authoritative scene 骨架。
- `fairino_dualarm_planner` 已新增 `PlanDualPose` / `PlanDualJoint` 服务骨架，并读取数组级 `scene_version`。
- `execution_adapter` 已重写为同时承载 `ExecuteTrajectory` 与 `ExecutePrimitive`，并接入 gripper status / managed scene 缓存。
- `dualarm_task_manager` 已接入 checkpoint 写入、primitive action client，并移除“未定义状态按占位成功处理”。
- `ball_basket_pose_estimator` 已切到 detection-driven + TF 转 world 的主模式，ROI 仅保留 fallback。
- `depth_handler` 已增加正式语义白名单，收口为瓶杯主链。
- 新增 `competition_console_api` 与 `competition_console_web` 骨架，以及最小 Playwright smoke。
- 完成第一轮增量构建，验证迁移后的关键包可重新构建。
- 发现目录迁移后的旧 CMake cache 污染扩大到多个包后，清理 `build/ install/ log/` 并完成全量重建。
- 将 `tools/scripts/orbbec_gemini_ros_bridge.py` 提升为正式包 `src/perception/orbbec_gemini_bridge`，并接入 `dualarm_bringup` 依赖与 integrated launch 参数。
- 使用旧 `static_transforms.yaml` 中现成值，将 `left_tcp -> left_camera` 候选外参更新为 `[-0.01, -0.09, 0.056]`。
- 收缩 `tf_node` 静态配置，只保留相机外参与 `left_camera -> left_camera_color_frame / left_camera_depth_frame`。
- 将旧 C++ detector 的 `detections.header.frame_id` 改为继承输入图像 frame，不再硬编码 `camera_color_frame`。
- 为 `competition_console_api` 新增：
  - `/api/tasks/last-run`
  - `/api/tasks/run`
  - `/api/tasks/resume-latest`
- 为 `competition_console_web` 将“整轮比赛”“从断点恢复”按钮接到真实 API，并重新通过 `npm run build` 与 Playwright smoke。
- 本机系统 Python 已补 `fastapi`，控制台 API 可真实启动并通过 `/api/health` smoke。
- `ros2 launch dualarm_bringup competition_integrated.launch.py --show-args` 已重新验证通过，显示 `start_camera_bridge`、`start_console_web`、`profile` 等集成参数。
- `competition_console_api` 已新增：
  - `POST /api/bringup/start`
  - `POST /api/bringup/stop`
  - `POST /api/acceptance/run/{wave}`
  - `GET /api/acceptance/results`
- `competition_console_api` 已实测：
  - `GET /api/health` 返回正常
  - `POST /api/acceptance/run/workspace` 返回真实验收结果
  - `POST /api/bringup/start` 已真实拉起 `competition_core.launch.py` 核心进程
  - `POST /api/bringup/stop` 已真实停止核心进程
- `competition_console_api` Ctrl+C 退出路径已收口为安静退出，不再打印 `rcl_shutdown` 或 `KeyboardInterrupt` traceback
- `competition_console_web` 已将“启动集成栈 / 停止集成栈 / 工作区验收 / PlanningScene smoke / 接续 smoke / 网页验收 / 整轮比赛 / 从断点恢复”接到真实 API。
- `competition_console_api` 现在要求 FastAPI/uvicorn 缺失时直接硬失败，不再静默降级。
- 新增 `competition_core.launch.py`，网页/API 启动 core 不再绕开正式入口直接拉 `competition.launch.py`。
- `smoke_resume_checkpoint.py` 已通过，Wave 1 的端点接续基座拿到第一条真实成功证据。
- `smoke_camera_frames.py` 已通过，Wave 2 的 mock 相机 frame 契约拿到第一条真实成功证据。
- `planning_scene_sync` 已继续收口：
  - 服务路径 success/failure 已与 `ApplyPlanningScene` 结果对齐
  - attached ADD 改为 attach 现有 world object 的最小语义
  - 当前最新阻塞缩小为 `managed scene did not enter reserved`
- 根据 reviewer/docs agent 反馈继续修复：
  - `planning_scene_sync` 已不再在 `ApplyPlanningScene` 未确认时向 service 调用方假成功
  - `planning_scene_sync` 已去掉 attach 时同 id world REMOVE 冲突
  - `planning_scene_sync` service 路径现在会等待 pending apply 完成，避免 raw scene 首次 ADD 未完成导致 reserve 立刻失败
  - `dualarm_task_manager` 与 `competition_console_api` 已去除 `Path.cwd()` 默认依赖
  - `competition_console_api` 启动 core 改为 `competition_core.launch.py`
  - `detector` 正式默认执行器改为 `detector_pt_node.py`
  - `ball_basket_pose_estimator` 默认关闭 ROI fallback
  - planning 失败时 task manager 会 release reservation
- 已将复盘成果落实为项目级长期规则：
  - `AGENTS.md` 新增项目流程标准、Wave Gate、证据规范、PlanningScene 规范、控制台规范、subagent 规范
  - `docs/runbooks/engineering-process-standards.md` 成为后续所有 Wave 的强制流程来源

### Incidents
- 目录迁移后 `fairino_dualarm_planner` 旧 build cache 指向已不存在的旧源路径，导致 CMake 失败。
  - 处理：仅清理受迁移影响的 8 个包 build 目录后重建。
  - 结果：增量构建恢复通过。

### Actions Taken
- 确认用户所说 `dualarms_ws` 在当前仓库中对应为 `/home/gwh/dashgo_rl_project/workspaces/dual-arm`。
- 阅读工作区规则文件 `AGENTS.md`。
- 阅读顶层状态与说明文件：`STATE.md`、`README.md`、`SETUP_2026-04-15.md`。
- 盘点 `src/`、`arm_planner/`、`robo_ctrl/`、`tools/` 的文件与包分布。
- 建立本轮走读的持久化记录文件。
- 阅读 `dualarm_interfaces` 的全部消息、服务与 action 定义。
- 阅读 perception / planning / control / tasks / transforms / bringup 的核心 launch 与主节点实现。
- 阅读 `fairino_dualarm_planner`、`fairino_dualarm_moveit_config`、`fairino3_v6_planner`、`robo_ctrl`、`tools`、`detector`、`depth_handler`、`epg50_gripper_ros`、`camera_info_interceptor` 的关键入口。
- 核对第三方 SDK 版本、工作区包清单和测试目录状态。
- 输出正式走读总结文档 `DUALARM_WORKSPACE_READTHROUGH_2026-04-15.md`。
- 执行机械臂/夹爪非运动连通性检查，包括串口枚举、网络路由、`robo_ctrl_node` 握手和 `epg50_gripper_node` 启动验证。
- 读取官方页面 `法奥机械臂网络配置-Ubuntu`，提取默认控制器 IP、PC 静态 IP 和半双工网卡配置要求。
- 使用 `nmcli` 将 `enp5s0` 按官方建议修改为 `192.168.58.10/24 + 100M Half Duplex`，并重新激活有线连接。
- 在官方默认地址 `192.168.58.2` 下再次执行 `ping`、`curl --noproxy '*'`、`nc` 和 `robo_ctrl_node` 非运动握手验证。
- 对 `192.168.58.0/24` 做轻量端口探测，发现实际可达控制器地址为 `192.168.58.3`。
- 使用 `192.168.58.3` 启动左臂驱动并完成状态话题与服务接口验证。
- 生成模块级测试路线文档 `MODULE_TEST_PLAN_2026-04-15.md`，按接口层、支撑层、感知层、规划层、执行层、总控层分层整理测试顺序与命令。
- 复查左右臂网络：确认右臂 `192.168.58.3` 经 `enp5s0=192.168.58.10` 可用；发现左臂线在新网卡 `enx00e04c36025f`，但该网卡无 IPv4。
- 修复左臂网络：将 `有线连接 2` 设置为 `192.168.58.11/24 + 100M Half Duplex`，并添加 `192.168.58.2/32` 路由。
- 修复后验证左臂 `192.168.58.2`：`ping`、Web、`8080`、`robo_ctrl_node`、`/L/robot_state` 和 `/L/*` 服务均正常。
- 修正规划测试流程：
  - 空场景改用 `publish_empty_scene.py` 持续发布
  - planner 改用 `fairino_dualarm_planner.launch.py` 启动
- 在双臂驱动 + 空场景 + MoveIt + launch 版 planner 的完整链路下，`PlanPose(right_arm)` 与 `PlanPose(left_arm)` 都已成功返回真实非空轨迹。
- 针对动作测试阶段新增修复：
  - 修改 `robo_ctrl/src/robo_ctrl_node.cpp`
  - `MoveCart` 超时不再默认返回成功
  - `MoveCart` 错误码返回值附带中文错误说明
  - 已完成 `robo_ctrl` 单包重编译
- 完整回路验证已完成到真机动作层：
  - 左臂 `robot_set_speed` 成功
  - 左臂 `MoveCart z=+5mm` 成功，状态回读确认位移
  - 右臂 `robot_set_speed` 成功
  - 右臂 `MoveCart z=-5mm` 成功，状态回读确认位移
- 追加动作验证：
  - 右臂 `robot_set_speed=5` 成功
  - 右臂 `MoveCart z=-50mm` 成功
  - 动作中 `motion_done=false`，动作完成后状态回读确认位移约 `-50mm`
- 新发现：
  - 用户现场未观察到对应物理动作
  - 浏览器自动化中 `192.168.58.3` 页面顶部状态显示 `Drag`
  - 当前需要把“控制器反馈成功”与“物理本体确实移动”分开验证
- 用户补充截图后，已确认网页 3D 视图在其浏览器中存在严重渲染异常（蓝色拉伸面），这解释了“看不到正常机械臂模型”的体验；已将控制器打开脚本改回优先 Chrome
- 继续推进的修改与验证：
  - 新增 `robot_mode_helper.cpp` 并编译进 `robo_ctrl`
  - 右臂执行 `robot_mode_helper --normal-only` 成功
  - 尝试 `robot_mode_helper` 直接回待机位：失败，错误码 `14`
  - 发现并修复 `robo_ctrl_node` 动作服务未加互斥锁的问题
  - 重新编译 `robo_ctrl`
  - 继续尝试用 `/R/robot_move` 走保守关节待机位，但当前仍缺用户现场确认，待新窗口继续
- 现场修正右臂灯色/模式解释：
  - 蓝色灯光：自动模式，自动模式下默认不可拖动
  - 绿色灯光：手动模式，不可拖动
  - 青色灯光：手动模式，可拖动
  - 后续不再把蓝灯视为异常；需要同时核对拖动状态与机器人模式。
- 新增“保模式”链路修复与验证：
  - 修改 `robo_ctrl/src/robo_ctrl_node.cpp`，增加 `force_auto_mode_before_motion` 参数，默认不再无条件 `Mode(0)`
  - 修改 `robo_ctrl/src/robot_mode_helper.cpp`，增加 `--auto-mode / --manual-mode / --keep-mode`，默认保持当前模式
  - `colcon build --symlink-install --packages-select robo_ctrl` 初次因 `build/robo_ctrl/ament_cmake_python/robo_ctrl/robo_ctrl` 旧目录阻塞失败；清理该构建产物后重编成功
  - `robot_mode_helper --normal-only` 现输出：`保持当前机器人模式，不主动切换自动/手动`
  - 初次验证时发现 `ros2 launch robo_ctrl ...` 会被 Miniconda `libstdc++.so.6` 污染，`robo_ctrl_node` 报缺少 `GLIBCXX_3.4.30`
  - 临时绕过：直接启动可执行文件并注入 `LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libstdc++.so.6` 后，右臂 driver 启动成功
  - 正式修复：在 `robo_ctrl_R.launch.py` / `robo_ctrl_L.launch.py` 为 `robo_ctrl_node` 与 `high_level_node` 注入系统 `LD_PRELOAD`
  - 修复后回归：`ros2 launch robo_ctrl robo_ctrl_R.launch.py robot_ip:=192.168.58.3 robot_name:=R state_query_interval:=0.05 start_high_level:=false` 成功拉起 `R_robo_ctrl`，`/R/*` 服务正常
  - 完成右臂最小保模式动作验证：
    - 动作前 `tcp_pose.z ≈ 656.741mm`
    - `MoveCart z=+5mm` 后 `tcp_pose.z ≈ 661.742mm`
    - 回撤 `MoveCart z=-5mm` 后 `tcp_pose.z ≈ 656.741mm`
- 新增 YOLOv8 `.pt` + Orbbec Gemini 335 感知链路尝试：
  - 确认 `/home/gwh/下载/best.pt` 可加载，类别为 `basket/basketball/cocacola/cup/football/yibao`
  - 将 ROS 系统 Python 的 `torch/torchvision` 切换为 CUDA 版：`torch=2.6.0+cu124`、`torchvision=0.21.0+cu124`
  - 安装 `ultralytics` 后曾因 `torchvision::nms` 不匹配失败，已通过安装 CPU 匹配版后再切 CUDA 版解决
  - CUDA 版 `torch` 安装时把 `numpy` 升到 `2.2.6`，导致 ROS Humble `cv_bridge` 报 `_ARRAY_API not found`；已将 `numpy` 回退为 `1.26.4`
  - 新增 `detector/scripts/detector_pt_node.py`，直接加载 `.pt`，输出兼容 `/detector/detections`
  - 新增 `class_map_best_pt.yaml`，将类别 `2/3/5` 映射为 `cola_bottle/cup/water_bottle`
  - 新增临时 Orbbec 桥 `.tmp/codex/2026-04-15/orbbec_gemini_ros_bridge.py`，发布 `/camera/color/image_raw`、`/camera/depth/image_raw`、`/camera/depth/camera_info`
  - 新增临时可视化窗口 `.tmp/codex/2026-04-15/ros_image_viewer.py`，显示 `/detector/detections/image`
  - 当前感知链路已运行到 `scene_fusion`，`/scene_fusion/raw_scene_objects` 已出现 `cola_bottle` 对象
- 收口阶段观察到 `move_group` 在 `Ctrl+C` 后出现一次 segmentation fault，属于退出阶段稳定性问题，已记录但不阻塞当前测试结论

### Key Intermediate Conclusions
- 当前工作区是面向比赛任务的双臂 ROS 2 系统，不只是规划 demo。
- 正式包根现已统一为 `src/`，`arm_planner/` 与根目录旧包只剩待清理/归档的旧路径痕迹。
- 当前最重要未收口问题集中在 PlanningScene 真同步、scene version freshness 与双臂执行同步。
- `dualarm_task_manager` 已具备完整流程骨架，但多处 task primitive 仍是占位逻辑。
- 控制台不再只是源码骨架，已经能启动 API、构建网页并通过最小 Playwright smoke。
- `tools`、`detector` 等历史包仍含旧路径与旧工作区假设，使用时要按当前工作区重新核对。
- 当前本机不具备稳定的机械臂控制条件：机械臂本体控制实际走 IP/RPC，夹爪串口未枚举，左臂 IP 虽可短暂握手但会话随即被控制器重置。

### Session: 2026-04-16 Five-Window Parallel Limit

### Actions Taken
- 将原先 8 窗口立即并行方案压缩为“5 个并发窗口，含协调窗口”。
- 保留全部 worktree，但只将以下 5 个标记为活跃：
  - `coord`
  - `scene-freshness`
  - `perception-camera`
  - `execution-control`
  - `task-orchestration`
- 将以下 3 个窗口标记为待命：
  - `behavior-cap-pour`
  - `behavior-handover`
  - `ops-acceptance`
- 更新了共享状态、轮换规则和窗口状态文件。
- 开始为每个窗口拆分独立提示词文件与 Ubuntu 辅助脚本。

### Hardware Check Summary
- `robo_ctrl_node --ros-args -p robot_ip:=10.2.20.201 -p robot_name:=L`：
  初始握手成功，但状态线程连续出现 `-2`、`Connection reset by peer`、`Broken pipe`，无法形成稳定控制会话。
- `epg50_gripper_node --ros-args -p port:=/dev/ttyACM0`：
  直接报 `Failed to open serial port`。
- `ls -l /dev/ttyACM* /dev/ttyUSB*`：
  无结果。
- `ip route get 10.2.20.201`：
  当前通过 `wlp4s0` 网关转发，不是本地直连网卡。
- 官方推荐网络参数已应用到 `enp5s0`，但 `192.168.58.2` 仍然 ARP 失败、`ping` 不通、HTTP/TCP 直连失败。
- `robo_ctrl_node --ros-args -p robot_ip:=192.168.58.2 -p robot_name:=L`：
  仍然只出现短暂“成功连接”，随后立即进入 `-2`、`Connection reset by peer`、`Broken pipe`、`No route to host` 的不稳定状态。
- 轻量扫描确认 `192.168.58.3` 的 `80`、`8080` 端口开放，控制器实际更像位于该地址。
- `ping 192.168.58.3` 0% 丢包，`robo_ctrl_node --ros-args -p robot_ip:=192.168.58.3 -p robot_name:=L` 可稳定连接。
- `/L/robot_state` 已成功读取一帧真实状态；左臂服务接口已成功列出。

### Next Steps
- 后续若进入实现或调试，应优先从 `dualarm_bringup -> fairino_dualarm_planner -> execution_adapter -> dualarm_task_manager` 这一主链继续。
- 若要收口 production，优先处理 `planning_scene_sync` 真同步、双臂 primitive 落地与真实硬件联调。
- 若要恢复硬件控制，优先确认机械臂本体的网络直连/同网段配置，以及夹爪串口设备是否真正枚举到 `/dev/ttyACM0` 或其他端口。

### Session: 2026-04-16 Parallel Software Windows

### Actions Taken
- 将“全软件立即并行”正式落为仓库内任务卡、窗口 owned_paths、提示词和协作规则。
- 明确将实时共享状态从 repo 内 tracked 文件切换为外部共享目录 `/home/gwh/dashgo_rl_project/workspaces/dual-arm-shared`。
- 为 Wave 4、Wave 2/3、Wave 6、Wave 7/8、Wave 9、Wave 10、Wave 11 新增模块任务卡。
- 为行为并行提前建立独立模块目录：
  - `src/tasks/dualarm_task_manager/scripts/behaviors/`
  - `src/control/execution_adapter/scripts/primitives/`
- 新增窗口提示词文档，供用户直接在不同窗口打开并复制使用。
- 准备创建并行 worktree：
  - `coord`
  - `scene-freshness`
  - `perception-camera`
  - `execution-control`
  - `task-orchestration`
  - `behavior-cap-pour`
  - `behavior-handover`
  - `ops-acceptance`

### Key Intermediate Conclusions
- 要让不同窗口“真的会反复读取正确进度”，实时共享状态必须脱离各自 branch 的 tracked 文件。
- 当前阶段不设置硬件测试窗口；所有并行窗口都只做软件层修改。

### Session: 2026-04-16 Wave 5 Runtime Closure

### Actions Taken
- 重新按大型项目流程从断点文件续接，仅围绕 `planning_scene_sync` / `smoke_planning_scene_sync.py` 做运行态收口。
- 使用滚动复用 subagent 做了：
  - Wave 5 smoke 契约梳理
  - `planning_scene_sync` MoveIt diff 语义审查
  - 只读 code-review 风险预审
- 运行态连续复现并修复了以下问题：
  - `pkill -f` 误伤当前 shell 的清理脚本问题
  - service callback 内等待 future 的 callback group / 竞态问题
  - attach diff 语义与 MoveIt Humble 实际行为不匹配
  - smoke 与 `scene_fusion` 双 publisher 导致的瞬时空场景抖动
  - `tools` 包的 `ament_cmake_python` 旧目录阻塞 symlink-install
- `planning_scene_sync` 当前关键实现：
  - authoritative scene 更新改为持锁同步 apply
  - attach 前先 `ApplyPlanningScene ADD`，再用 `GetPlanningScene` 确认 world object 可见
  - attach diff 采用完整 attached geometry，但不再同包发送同 id world REMOVE
  - 引入 `object_retention_timeout` 与 `lost_but_reserved/lost_but_attached`
  - 引入 live object 校验与事务回滚
- `smoke_planning_scene_sync.py` 已升级为强验收：
  - 检查 `scene_version` / `frame_id` / `reserved_by`
  - 使用 `GetPlanningScene` 检查 world / attached 双侧状态
  - detach / release 后停止 raw publisher，并验证最终清空
- 最终证据：
  - `planning_scene_sync smoke passed`
  - `GetPlanningScene` 最终 attached/world 为空
  - `/scene_fusion/scene_objects` 最终 `objects: []`

### Key Intermediate Conclusions
- Wave 5 当前不是“接口在”，而是 authoritative scene / MoveIt planning scene 的 happy path 运行态已真正通过。
- MoveIt Humble 在本仓库 attach 迁移上存在与表面文档不一致的运行态行为：
  - 同一 diff 中混入同 id world REMOVE 会冲突
  - 必须以本仓实际行为为准做实现约束
- 下一主阻塞已切换到 Wave 4 freshness 与 Wave 6 execution primitive。

### Session: 2026-04-16 Coordination Rev 3

### Actions Taken
- 按协调窗口规则重新读取 11 个必读共享文件后，更新外部共享状态到 `coord_rev=3`。
- 在 `SHARED_STATE.json` 中集中补齐 8 个窗口的 `branch`、`worktree`、`task_card`、`owned_paths`、`current_task` 与 `next_action`。
- 在 `DECISIONS.md` 中新增：
  - `D-008`：`coord_rev=3` 起由共享状态集中维护窗口 owned_paths 台账
  - `D-009`：本轮不轮换，继续维持 5 窗口纪律
  - `D-010`：补齐 Wave 5 独立任务卡作为回归基线
- 更新 `task_plan.md`，加入 `coord_rev=3`、当前轮换决策和 owned_paths ledger。
- 补建 `W5-planning-scene-sync.md`，将 PlanningScene smoke 通过证据固化为后续回归基线。

### Key Intermediate Conclusions
- 当前活跃窗口数仍为 5，符合并发上限。
- 目前没有业务窗口在共享窗口文件中声明 `maintenance-ready`，因此不应让待命窗口进场。
- 所有窗口的 `*.agents.json` 当前为空，未发现需要先关闭的遗留 subagent。

### Session: 2026-04-16 Coordination Rev 4

### Actions Taken
- 使用只读协调审查 subagent 核对 `coord_rev=3`，结论为无 P0/P1 阻塞。
- 已关闭本任务 subagent，避免留下跨任务常驻代理。
- 按审查发现将共享状态推进到 `coord_rev=4`：
  - 为 `scene-freshness` 增加 `baseline_task_cards`，显式绑定 `W5-planning-scene-sync.md`
  - 增加行为窗口轮换前必须释放或收窄父级 owned_paths 的门槛
  - 向所有业务窗口广播 `coord_required_sync_rev=4`
  - 将 W0 / W1 历史 bootstrap 任务卡标为 `[x]`
  - 将 `task_plan.md` 中 Wave 0 / Wave 1 / Wave 5 状态同步为已完成

### Key Intermediate Conclusions
- 当前仍不轮换窗口，5 窗口纪律保持不变。
- 业务窗口不能直接开新 subagent；必须先重读 11 个必读文件并同步到 `coord_rev=4`。
- 行为窗口仍然 dormant，后续进场前必须先处理与父级 owned_paths 的重叠。

### Session: 2026-04-16 Coordination Rev 5-6

### Actions Taken
- 按协议重读 11 个必读文件后，将共享状态先推进到 `coord_rev=5`，冻结本轮协调审计期间的进退场动作。
- 启动了只读协调审计 subagent；其状态出现 `not_found / pending_init` 异常后，按项目规则降级为本地只读审计，不让协调链路阻塞。
- 本地核对了全部 active/dormant 任务卡，重点审查：
  - 任务卡与共享状态的版本漂移
  - active/dormant 窗口的真实退出/进场门槛
  - 回归基线卡是否已经和主推进卡解耦
- 审计后将共享状态推进到 `coord_rev=6`，并明确：
  - `scene-freshness` 为第一退出候选
  - `ops-acceptance` 为第一安全候补
  - `behavior-cap-pour` / `behavior-handover` 继续被父级写集阻挡
- 同步更新了相关任务卡的 Coordination 段，统一到 `coord_rev=6`，并写明退出/候补顺序。
- 将本轮 subagent 平台异常与本地回退结果记录到 `SUBAGENT_REGISTRY.json`。

### Key Intermediate Conclusions
- 当前没有新增 P0/P1 协调阻塞，5 窗口纪律仍然成立。
- 真正可以释放的第一个活跃窗口是 `scene-freshness`，不是 `perception-camera`、`execution-control` 或 `task-orchestration`。
- 第一个安全待命进场窗口是 `ops-acceptance`；行为窗口虽然排在 phase B，但仍被父级 owned_paths 冲突阻塞，不能抢先进入。
- 本轮不直接执行轮换；必须先等 `scene-freshness` 交出 merge-ready 与 subagent-close 证据，再由协调窗口正式切槽。

### Session: 2026-04-16 Coordination Rev 7

### Actions Taken
- 在其他窗口继续修改期间，重新读取 11 个必读文件，并补读了共享窗口文件、agents 台账和各业务 worktree 的 `git status --short`。
- 现场确认：
  - `scene-freshness` 已写明 `maintenance-ready`
  - `scene-freshness.agents.json` 为空
  - `scene-freshness` worktree 只剩一个新增 smoke 脚本
  - `perception-camera` 与 `task-orchestration` 仍有真实代码改动且各自持有运行中的 subagent
  - `execution-control` 仍持有运行中的 subagent，虽然 worktree 目前无改动显示
- 新开了一轮只读协调 subagent 做动态轮换审计，并收到正式回包：无协调层 P0/P1。
- 根据该审计结果，将共享语义从 `queue-rotation` 收窄为：
  - `scene-freshness = ready-to-exit`
  - `ops-acceptance = admit-after-sync`

### Key Intermediate Conclusions
- `scene-freshness` 现在已经满足协调窗口正式发出退场指令的条件。
- `ops-acceptance` 还不能写成“只差 active slot 释放即可进场”；它是第一安全候补，但还差一次 `coord_rev=7` 重读同步和新 task subagent。
- 其他 3 个活跃业务窗口保持原位最稳妥；此时若再尝试第二个槽位轮换，会让活跃修改和父级写集判断一起变脏。

### Session: 2026-04-16 Test Integration

### Actions Taken
- 将 4 个有实际 payload 的 worktree 改动分别提交到对应分支：
  - `task/scene-freshness` -> `cf9a3f6`
  - `task/perception-camera` -> `c7db39f`
  - `task/execution-control` -> `c645669`
  - `task/task-orchestration` -> `ea6e8b9`
- 清理了 `test` 根工作树中的临时产物：
  - `.artifacts/`
  - `.tmp/`
  - `.codex/tmp/coordination/`
- 将长期有效的协调资产、任务卡、runbook 与脚本整理提交到 `test`：
  - `524ec6a chore: record coordination and runtime task assets`
- 按顺序将 4 个业务分支并入 `test`：
  - `5a956b8 merge: integrate scene freshness smoke`
  - `b1f69e1 merge: integrate perception frame contract hardening`
  - `f8ca810 merge: integrate execution primitive boundary`
  - `effc3cd merge: integrate orchestration behavior boundary`
- 使用干净 ROS shell 重新执行 `./build_workspace.sh`，规避了 Conda PATH guard 的预期拦截。

### Key Intermediate Conclusions
- `test` 现在已经包含本轮需要整合的 scene/perception/execution/tasking 业务改动。
- `test` 根工作树当前是干净的，适合作为下一步硬件联调基线。
- 全量构建已通过；`detector` 与 `tools` 仅保留 warning，没有阻塞构建。
- 旧辅助 worktree 现在只剩清理动作；删除它们不会再影响 `test` 基线。
