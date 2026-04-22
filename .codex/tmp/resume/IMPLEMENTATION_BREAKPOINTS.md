# Implementation Breakpoints

更新时间: 2026-04-16

## 当前波次
- Wave: 4-11 software parallel
- 状态: in_progress

## 当前目标
- 维持 Wave 5 回归基线，同时并行推进 Wave 4 / 6 / 7-11 的软件窗口

## 当前断点
- 单工作区迁移已完成，正式包根为 `src/`
- 接口基座已完成：`ExecutePrimitive`、`PlanDualPose`、`PlanDualJoint`、`SceneObjectArray.scene_version`、`RunCompetition` 恢复字段
- 控制台骨架已完成：`competition_console_api`、`competition_console_web`
- 控制台 API 已接入：
  - bringup start/stop
  - acceptance run
  - RunCompetition start
  - latest checkpoint resume
- 控制台前端已将：
  - 启动集成栈
  - 停止集成栈
  - 工作区验收
  - PlanningScene smoke
  - 接续 smoke
  - 网页验收
  - 整轮比赛
  - 从断点恢复
  绑定到真实 API
- 全量构建已通过
- 网页 build 与 Playwright smoke 已通过
- Wave 1 恢复 smoke 已通过：`smoke_resume_checkpoint.py`
- Wave 2 相机 frame smoke 已通过：`smoke_camera_frames.py`
- Wave 3 默认已关闭 ROI fallback，detector 默认已切 `detector_pt_node.py`
- Wave 5 当前阻塞：
  - `smoke_planning_scene_sync.py` 仍未最终通过
  - reviewer 和资料 agent 指出 MoveIt diff 语义问题
  - 已修复：
    - service 假成功
    - attached ADD + world REMOVE 冲突
    - cwd 依赖
    - detector 默认错配
    - ROI fallback 默认开启
    - planning 失败 reservation 泄漏
  - 最新补丁：
    - `planning_scene_sync` 在 service 路径等待 pending apply 完成
    - `planning_scene_sync` 已增加 pending wait 超时日志
- 下一步唯一入口：
  - 启动 core：`ros2 launch dualarm_bringup competition_core.launch.py start_hardware:=false start_detector:=false start_camera_bridge:=false use_mock_camera_stream:=false publish_fake_joint_states:=true`
  - 跑：`/usr/bin/python3 src/tools/tools/scripts/smoke_planning_scene_sync.py 2>&1`
  - 观察 `planning_scene_sync` 日志，优先定位 pending apply 超时还是 MoveIt success=false
- 新增流程规范：
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm/docs/runbooks/engineering-process-standards.md`

## 风险
- 当前还有大量旧文档引用旧路径，需要继续清理或归档
- Wave 5 还没有通过最终验收，不能声明 PlanningScene 收口完成
- primitive / task manager 仍是基座实现，不能作为比赛完成证据
- 网页按钮已接入部分真实 API，但倒水/人机验收和证据包导出仍需继续

## Resume Hint
- 恢复时先读本文件、`SUBAGENT_REGISTRY.json`、`ERROR_TRACE.md` 的 Incident 19，再继续 Wave 5 smoke

## 2026-04-16 最新接续
- Wave 5 已通过：
  - `smoke_planning_scene_sync.py` 当前增强版已通过
  - `GetPlanningScene` 最终 world / attached 均为空
  - `/scene_fusion/scene_objects` 最终 `objects: []`
- 当前最优先目标已切换：
  1. Wave 4：`scene_version` / freshness / authoritative state 保持测试
  2. Wave 6：`ExecutePrimitive` 与 execution_adapter 的真实闭环
- 下一步标准入口：
  - 起 core：`ros2 launch dualarm_bringup competition_core.launch.py start_hardware:=false start_detector:=false start_camera_bridge:=false use_mock_camera_stream:=false publish_fake_joint_states:=true`
  - 回归 Wave 5：`/usr/bin/python3 src/tools/tools/scripts/smoke_planning_scene_sync.py`
  - 然后开始 Wave 4 freshness 专项检查

## 2026-04-16 并行软件窗口初始化
- 当前阶段不做硬件测试窗口，所有并行窗口都只做软件层修改。
- 实时共享状态目录固定为：
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm-shared`
- 已创建的 worktree：
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm-coord`
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm-scene`
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm-perception`
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm-execution`
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm-tasking`
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm-cap-pour`
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm-handover`
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm-ops`
- 已创建的分支：
  - `coord/plan-sync`
  - `task/scene-freshness`
  - `task/perception-camera`
  - `task/execution-control`
  - `task/task-orchestration`
  - `task/behavior-cap-pour`
  - `task/behavior-handover`
  - `task/ops-acceptance`
- 当前活跃窗口仅 5 个：
  - `coord`
  - `scene-freshness`
  - `perception-camera`
  - `execution-control`
  - `task-orchestration`
- 当前待命窗口：
  - `behavior-cap-pour`
  - `behavior-handover`
  - `ops-acceptance`
- 新的必读入口：
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm/docs/runbooks/software-parallel-window-prompts.md`
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm-shared/prompts/software-parallel-window-prompts.md`
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm-shared/coordination/SHARED_STATE.json`
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm-shared/coordination/DECISIONS.md`
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm-shared/windows/*.md`

## 2026-04-16 Coordination Rev 6
- 本轮协调审计已闭环：
  - 共享状态已推进到 `coord_rev=6`
  - 任务卡与共享状态版本漂移已识别并回写
  - 审计 subagent 出现平台态异常，已本地降级并留痕到注册表
- 当前轮换判断：
  1. 第一退出候选：`scene-freshness`
  2. 第一安全候补：`ops-acceptance`
  3. `behavior-cap-pour` / `behavior-handover` 继续 blocked，原因是父级 owned_paths 仍被 active 窗口占用
- 下一步唯一协调入口：
  - 等 `scene-freshness` 交出 merge-ready 与 subagent-close 证据
  - 然后由协调窗口正式执行一次 5 窗口切槽

## 2026-04-16 Coordination Rev 7
- 共享窗口文件动态核对后，`scene-freshness` 的退场前置条件已被证据满足：
  - `status: maintenance-ready`
  - `scene-freshness.agents.json` 为空
  - worktree 仅有最小新增 smoke 脚本
- 当前最稳妥轮换动作已从“排队”提升为“可执行”：
  1. 退出：`scene-freshness`
  2. 进入：`ops-acceptance`
  3. 保持原位：`perception-camera`、`execution-control`、`task-orchestration`
- `ops-acceptance` 当前不是 `ready-to-admit`，而是 `admit-after-sync`。

## 2026-04-16 Final Integration To test
- 已提交并合入 `test` 的业务分支：
  - `task/scene-freshness` (`cf9a3f6`)
  - `task/perception-camera` (`c7db39f`)
  - `task/execution-control` (`c645669`)
  - `task/task-orchestration` (`ea6e8b9`)
- `test` 上的整理与 merge 提交：
  - `524ec6a chore: record coordination and runtime task assets`
  - `5a956b8 merge: integrate scene freshness smoke`
  - `b1f69e1 merge: integrate perception frame contract hardening`
  - `f8ca810 merge: integrate execution primitive boundary`
  - `effc3cd merge: integrate orchestration behavior boundary`
- 最终 Build Gate：
  - 在 clean ROS shell 下 `./build_workspace.sh` 通过
- 当前状态：
  - `test` 可直接进入硬件联调
  - 仅剩辅助 worktree 删除收尾

## 2026-04-19 真机控制台接续断点

### 当前目标
- 继续收口真机控制台与姿态库：
  1. 按住 jog，松开停止
  2. 姿态保存包含夹爪状态
  3. 姿态可编排为动作组
  4. 左右臂动作组可按先后顺序切换

### 当前已完成
- 控制台网页地址：`http://127.0.0.1:18081`
- API 地址：`http://127.0.0.1:18080`
- 同源 `/api/*` 代理已接通。
- `competition_console_api` 已支持：
  - bringup start/restart/stop
  - control state
  - arm jog
  - arm mode
  - gripper
  - presets list/save/move/delete
- 姿态库切换链路已改为 `PlanJoint -> ExecuteTrajectory`。
- 姿态库角度已在发送 `PlanJoint` 前从 `deg` 转为 `rad`。
- `robo_ctrl` ServoJ 线程已加互斥和异常兜底。
- `competition.launch.py` 已对左右 `robo_ctrl_node` 注入系统 `LD_PRELOAD`，避免 Miniconda `libstdc++` 污染。
- `fairino_dualarm_planner.launch.py` 已对 planner 注入系统 `LD_PRELOAD`。
- 右臂通信和姿态回放已验证：
  - `/R/robot_state` 可读
  - `/R/robot_move_cart z=-5mm` 成功
  - `/api/presets/move` 到右臂 `抓瓶子` 返回 `success=true`

### 当前 live 快照
- 记录时间：2026-04-19 17:50:47 +0800。
- 当时 `core_running=true`，`core_pid=130977`。
- 当时 `/execution/execute_trajectory` 只有 1 个 server：`/execution_adapter`。
- 当前网页/API 可能仍在运行；新窗口必须先重新核对 live 进程，不要假设本文件状态仍然实时。

### 必做前置检查
```bash
cd /home/gwh/dashgo_rl_project/workspaces/dual-arm
source /opt/ros/humble/setup.bash
source install/setup.bash
pgrep -af 'competition_core.launch.py|execution_adapter_node.py|robo_ctrl_node|epg50_gripper_node|move_group'
ros2 action info /execution/execute_trajectory
ros2 node list | rg 'execution_adapter|left_robo_ctrl|right_robo_ctrl|gripper0|gripper1'
curl -s http://127.0.0.1:18080/api/status
curl -s http://127.0.0.1:18080/api/control/state
```

### Hard Stop Rules
- 如果 `/execution/execute_trajectory` action server 数量不是 1，先清旧栈，不要发运动命令。
- 如果存在多个 `/execution_adapter`、多个 gripper 节点或多个 `robo_ctrl_node`，先清旧栈。
- 如果 `core_running=false`，网页上的 arm/gripper/preset 操作不会生效，先通过 API 或网页启动真机无视觉模式。
- 如果右臂控制器自带网页打不开，不要直接判定 ROS 控制链失败；先查 `/R/robot_state` 和 `/R/robot_move_cart`。

### 下一步建议
- 先实现动作组和按住 jog 的后端数据结构，不要直接在前端做定时循环乱发命令。
- 按住 jog 建议后端新增 start/stop 或低频 repeat guard，避免浏览器重复事件打爆 `/robot_move_cart`。
- 姿态保存夹爪状态建议读：
  - `/gripper0/epg50_gripper/status` slave 9
  - `/gripper1/epg50_gripper/status` slave 10
- 动作组建议持久化到 `.artifacts/console_action_groups.json`，每步包含：
  - `arm`
  - `preset_id`
  - `include_gripper`
  - `delay_ms`
  - `stop_on_failure`

## 2026-04-20 相机 / 桌面建模接续断点

### 当前目标
- 继续把左臂唯一深度相机接到自动夹取链：
  1. `best.3.pt` 接入 detector 默认模型
  2. `table_surface_detector.py` 正式发布桌面 world 结果与 RGB overlay
  3. `depth_handler` 使用桌面平面修正瓶杯 3D
  4. 后续再接自动夹取入口

### 当前 live 状态
- 当前还在运行的关键进程：
  - `competition_core.launch.py`，PID 约 `16834`
  - `orbbec_gemini_ros_bridge.py`，PID 约 `52463`
  - `ros_image_viewer.py`，PID 约 `63615`
- 当前相机桥真实输出：
  - color=`/dev/video8`
  - depth=`/dev/video2`
  - depth_backend=`v4l2_z16`
- 当前 ROS 话题：
  - `/camera/color/image_raw`
  - `/camera/depth/image_raw`
  - `/camera/depth/camera_info`
- 当前相机相关说明：
  - `start_camera_bridge=false` 的 core 没有自动托管相机桥；相机桥是额外单独起的
  - 不要先停掉现有相机桥，除非你明确要切回 launch 托管模式

### 当前代码状态
- 已新增：
  - `src/tools/tools/scripts/table_surface_detector.py`
- 已修改但未完成 build/runtime 验证：
  - `src/tools/tools/CMakeLists.txt`
  - `src/tools/tools/package.xml`
  - `src/perception/scene_fusion/scripts/scene_fusion_node.py`
  - `src/perception/depth_handler/include/depth_handler/depth_processor_node.hpp`
  - `src/perception/depth_handler/src/depth_processor_node.cpp`
- 尚未改到位：
  - `src/bringup/dualarm_bringup/launch/competition.launch.py`
  - detector 默认 `best.3.pt`
  - RGB 识别效果统一输出 topic

### 当前证据
- 桌面调试产物目录：
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm/.artifacts/camera_debug/`
- 当前更可信的桌面结论：
  - 文件：`.artifacts/camera_debug/table_depth_analysis_adjusted.json`
  - `can_detect_table_plane=true`
  - `method=color_guided_depth_plane_fit`
  - `plane_inlier_ratio_in_color_table_candidates=0.9992`
  - `median_residual_mm=2.8903`
  - `depth_confirmed_area_ratio_vs_color_table=0.5124`
- 对比图：
  - `color_latest_adjusted.png`
  - `table_depth_confirmed_overlay.png`
  - `table_color_guided_overlay.png`

### 下一步唯一入口
- 先不要重新做相机设备恢复；直接用当前 live 相机桥和 RGB viewer 继续。
- 下一窗口第一批命令：
  1. `pgrep -af 'competition_core.launch.py|orbbec_gemini_ros_bridge|ros_image_viewer|table_surface_detector'`
  2. `ros2 topic info /camera/color/image_raw`
  3. `ros2 topic info /camera/depth/image_raw`
  4. `ros2 topic hz /camera/color/image_raw`
  5. `ros2 topic hz /camera/depth/image_raw`
- 然后按这个顺序继续：
  1. `python3 -m py_compile src/tools/tools/scripts/table_surface_detector.py`
  2. `colcon build --packages-select tools`
  3. 运行 `ros2 run tools table_surface_detector.py`
  4. 检查 `ros2 topic list | rg 'table_surface|pick_assist'`
  5. 再收口 `depth_handler`

## 2026-04-20 比赛级自动夹取 / 桌面标定最新断点

### 当前已完成
- 比赛级 perception / launch 基座已补齐：
  - `competition.launch.py`
  - `competition_core.launch.py`
  - `competition_integrated.launch.py`
  已支持：
  - verified/unverified 相机外参开关
  - `camera_v4l2_depth_unit_to_mm_scale`
  - bottle/cup 与 ball 的受控 color-depth 放宽开关
  - `table_*` 桌面建模参数
  - detector 默认模型 `/home/gwh/下载/best.3.pt`
- `table_surface_detector.py` 已支持：
  - 空 `SceneObjectArray` heartbeat
  - 原时间戳 TF 失败时回退最新 TF
  - `world` 桌面输出
  - RGB/depth overlay 持久化
  - 法向统一后桌面评估不再出现 `180deg` 假漂移
- `planning_scene_sync` 已变为：
  - world collision 只保留 `table_surface`
  - `table_surface` 用 `BOX`
  - 非桌面对象仍允许 attach/detach
- `depth_handler` 已真正消费 `/perception/table_scene_objects`，用桌面平面剔除 ROI 点，且默认重新只处理 `water_bottle/cola_bottle/cup`
- `grasp_pose_generator` 只对 `world` pose 对象发布 target
- `execution_adapter` 拒绝非 `world` 的 cartesian waypoint
- `dualarm_task_manager` `SELF_CHECK` 已加入 `/execution/execute_trajectory` 唯一 server 检查
- `pick_assist_auto_grasp.py` 已从 alias 升级为正式入口：
  - 默认 `require_world_tf=true`
  - 默认关闭 `allow_raw_scene_fallback`
  - 默认关闭 `allow_cartesian_fallback`

### 当前新增工具
- `src/tools/tools/scripts/capture_table_calibration_sample.py`
- `src/tools/tools/scripts/evaluate_table_calibration_run.py`
- `src/transforms/tf_node/scripts/promote_calibration_transform.py`
- `src/tools/tools/launch/eye_hand_calibration_data_collector.launch.py` 已暴露 `tcp_only_mode`
- `wave23_perception_acceptance.py` 已支持通过参数检查 `expected-calibration-status`

### 当前 live / debug 状态
- 当前仍在运行：
  - `competition_core.launch.py`
  - `orbbec_gemini_ros_bridge.py`
  - `ros_image_viewer.py`
  - `detector_pt_node.py`
  - `table_surface_detector.py`
  - `left_camera_unverified_static_tf`
- 当前已停止：
  - `depth_processor_debug`

### 当前关键证据
- 桌面标定采样样本：
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm/.artifacts/calibration/left_camera/live_smoke_v2/pose_static_01`
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm/.artifacts/calibration/left_camera/live_smoke_v2/pose_static_02`
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm/.artifacts/calibration/left_camera/live_smoke_v2/pose_static_03`
- 采样评估结果：
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm/.artifacts/calibration/left_camera/live_smoke_v2/summary.json`
  - 当前输出：
    - `sample_count=3`
    - `world_height_range_m=0.000682`
    - `normal_drift_deg_max=2.5226`
    - `median_residual_mm_max=4.7870`
    - `color_depth_overlap_ratio_min=0.9487`
    - `passes=true`
- 自动夹取入口负例 smoke：
  - `pick_assist_auto_grasp.py` 在 `right_arm + require_world_tf=false` 下会直接拒绝执行

### 当前未收口
- `left_tcp -> left_camera` 还没有从真实图像+TCP hand-eye 结果回写为 `verified`
- `dual_arm_assist` 仍未发展成比赛级双臂协作动作
- 尚未拿到：
  - 左臂 `water_bottle` 真机抓取成功
  - 右臂 `cola_bottle` 真机抓取成功
  - spill / 半杯 / 持球 3 秒 / 入筐前 release guard 的正式验收

### 下一步唯一入口
1. 保持当前 live core / 相机桥不动，先用真实标定板完成图像+TCP 采样。
2. 运行：
   - `eye_in_hand_calibration.py`
   - `promote_calibration_transform.py --dry-run`
3. verified 外参 ready 后，按 strict 模式热切：
   - `allow_unverified_camera_extrinsics:=false`
4. 热切后先验证：
   - `ros2 topic echo --once /perception/table_scene_objects`
   - `tf2_echo world left_camera_depth_frame`
   - `pick_assist_auto_grasp.py` 门禁负例/正例
5. 再进入真机单臂抓取：
   - 左臂 `water_bottle`
   - 右臂 `cola_bottle`

## 2026-04-20 断电后重拉起接续断点

### 当前已完成
- 远程安全上传已完成：
  - 分支：`codex/competition-pick-assist-calibration`
  - 提交：
    - `4186a75 Implement competition pick assist calibration gates`
    - `bbe89f6 Fix detector launch parameter typing`
- 断电后已重新拉起单套核心链：
  - `competition_core.launch.py`
  - `orbbec_gemini_ros_bridge.py`
  - `depth_processor_node`
  - `move_group`
  - `execution_adapter`
  - `dualarm_task_manager`
  - 左右 `robo_ctrl_node`
  - 左右 `epg50_gripper_node`
  - `table_surface_detector.py`
- detector 因 launch 参数类型崩过一次，已修复 `competition.launch.py` 中 `allowed_class_ids` 的传参类型，并重建 `dualarm_bringup`。
- 当前 detector 已手动补起：
  - `detector_pt_node.py`
  - 模型：`/home/gwh/下载/best.3.pt`
  - `device=cuda:0`
- 可视化窗口已打开：
  - `/detector/detections/image`
  - `/perception/pick_assist/rgb_overlay`

### 当前 live 状态
- 当前关键 PID：
  - `competition_core.launch.py` -> `13206`
  - `orbbec_gemini_ros_bridge.py` -> `13238`
  - `depth_processor_node` -> `13242`
  - `move_group` -> `13256`
  - `table_surface_detector.py` -> `13268`
  - `left_robo_ctrl` -> `13276`
  - `right_robo_ctrl` -> `13281`
  - 手动 detector -> `14348/14395`
  - 检测窗口 -> `14597`
  - pick-assist overlay 窗口 -> `14606`
- 当前 `/execution/execute_trajectory`：
  - `Action servers: 1`
  - `Action clients: 1`
- 当前 `/L/robot_state` 与 `/R/robot_state`：
  - 都是 `motion_done=true`
  - 都是 `error_code=0`

### 当前 perception 结果
- `/perception/detection_2d` 已识别：
  - `cup`
  - `basket`
  - `water_bottle`
  - `cola_bottle`
  - `soccer_ball`
- `/perception/table_scene_objects` 已有 `world` 下桌面对象。
- `/scene_fusion/scene_objects` 已有：
  - `basket`
  - `soccer_ball`
  - `cup`
  - `water_bottle`
  - `cola_bottle`
- `/planning/grasp_targets` 已有：
  - `water_bottle -> left_arm`
  - `cup -> left_arm`
  - `cola_bottle -> right_arm`
  - `soccer_ball -> dual_arm`

### 当前阻塞
- 左夹爪阻塞：
  - `/gripper0/epg50_gripper/status` 对 `slave_id=9` 返回失败
  - `/gripper0/epg50_gripper/status` 对 `slave_id=10` 也返回失败
  - 右夹爪 `slave_id=10` 正常
- `depth_handler` 阻塞：
  - 当前 `use_table_plane=true` 时瓶/杯几乎全部被桌面剔除
  - 为验证主链，已临时设置 `use_table_plane=false`
  - 所以当前瓶/杯 `world` 对象是 debug 级结果，不能直接算比赛级抓取输入
- 正式 `verified` 外参仍未收口

### 当前关键证据
- 识别效果图：
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm/.artifacts/camera_debug/best3_detector_latest.png`
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm/.artifacts/camera_debug/pick_assist_overlay_latest.png`
- 最新桌面结果：
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm/.artifacts/camera_debug/table_surface_detector/latest_result.json`
- 当前桌面标定 smoke：
  - `/home/gwh/dashgo_rl_project/workspaces/dual-arm/.artifacts/calibration/left_camera/live_smoke_v2/summary.json`

### 下一步唯一入口
1. 不要先重启 core；保持当前 live 图继续。
2. 先排查左夹爪通信：
   - 电源
   - A/B
   - GND
   - `/dev/serial/by-id/...A7BI...`
3. 再收口 `depth_handler`：
   - 在 `use_table_plane=true` 下保留瓶/杯有效点
   - 不接受继续长期依赖 `use_table_plane=false`
4. 之后才推进 verified 标定与真机抓取。

## 2026-04-22 右臂深度相机 P0 软件主链断点

### 当前完成
- 已实现比赛保底版 P0 软件主链，不改核心 msg/srv/action：
  - `dual_camera_mode:=reobserve_only|full`
  - 左右相机 topic/frame/device 参数
  - 左右 detector/adapter/depth/ball topic 命名隔离
  - `source_name=left_camera/right_camera`
  - 右相机 `right_camera_mount/right_camera_body` 碰撞体
  - `scene_fusion` 去重、中值融合和有效更新 `scene_version`
  - `planning_scene_sync` 同 id world/attached diff 冲突规避
  - `dualarm_task_manager` 单次 `reobserve_once`
- 已新增 smoke：
  - `src/tools/tools/scripts/smoke_dual_camera_scene_dedup.py`
  - `src/tools/tools/scripts/smoke_dual_camera_scene_fusion.py`
  - `smoke_planning_scene_sync.py` 已升级为 `water_bottle_gold` 金样例

### 验证证据
- 全量构建：`Summary: 27 packages finished`
- 双相机去重：`dual camera scene dedup smoke passed`
- 双相机稳定融合：`dual camera scene fusion smoke passed`
- PlanningScene 金样例：`planning_scene_sync smoke passed`
- xacro 展开可见：
  - `right_camera_mount`
  - `right_camera_body`
  - `right_tcp_to_camera_mount`
  - `right_camera_mount_to_body`

### 当前风险
- `move_group` Ctrl+C 停止时仍可能段错误；运行态 smoke 已通过，但退出路径不干净。
- 右相机真实设备、真实外参和同物体左右误差尚未验证。
- 默认应先用 `dual_camera_mode:=reobserve_only`，不要直接把 full 双 detector 当现场默认。

### 下一步入口
1. 现场明确左右 Orbbec 的 `/dev/videoX` 映射，使用显式设备号启动。
2. 启动：
   `ros2 launch dualarm_bringup competition_core.launch.py start_camera_bridge:=true dual_camera_mode:=reobserve_only ...`
3. 验证：
   - `/right_camera/color/image_raw`
   - `/right_camera/depth/image_raw`
   - `/right_camera/depth/camera_info`
   - `right_camera_color_frame/right_camera_depth_frame`
4. 完成 `right_tcp -> right_camera` 标定并更新 `calibration_transforms.yaml` 为 `verified`。

## 2026-04-22 单 Orbbec 显式设备号补充断点

### 当前完成
- 已确认当前会话的 live 相机条件不是“双 Orbbec”：
  - 只有 1 台 `Orbbec Gemini 335`
  - `video8/9` 是集成摄像头
- 已确认当前 Orbbec 的显式设备号基线：
  - `color=/dev/video6`
  - `depth=/dev/video0`
  - `depth_backend=v4l2`
- 已完成右相机最小运行时验证：
  - 直起 bridge 发布 `/right_camera/*`
  - `competition_core.launch.py` 在 `reobserve_only + 仅右相机 + 显式设备号` 下正常拉起

### 验证证据
- V4L2 格式：
  - `/dev/video0: ['Z16']`
  - `/dev/video6: ['YUYV', 'MJPG']`
  - `/dev/video8: ['MJPG', 'YUYV']`
- bridge 证据：
  - `frame_id=right_camera_color_frame`
  - `frame_id=right_camera_depth_frame`
  - color/depth 均约 `15Hz`
- core 证据：
  - `right_orbbec_gemini_bridge` 正常启动
  - `/right_camera/color/image_raw`
  - `/right_camera/depth/image_raw`
  - `/right_camera/depth/camera_info`

### 当前风险
- 只有 1 台 Orbbec，双相机真机补观测还不能做。
- bridge `auto` 逻辑当前会误命中集成摄像头，现场不能直接用。
- `move_group` 停止段错误与 `VIDIOC_QBUF` 退出噪声仍存在。

### 下一步入口
1. 补齐第 2 台 Orbbec 后，重新枚举左右相机的 `color/depth` 节点。
2. 在当前单相机条件下，继续推进右相机单链路：
   - `/right_camera/*`
   - `/perception/right/*`
3. 完成 `right_tcp -> right_camera` 标定并恢复 verified 门禁。

## 2026-04-22 真机姿态与左链补充断点

### 当前完成
- 默认 `right_base_rpy` 已从 `pi` 改成 `0`，右臂前向问题已修正。
- 真实双臂关节状态已验证接入：
  - `/L/joint_states`
  - `/R/joint_states`
  - `/joint_states`
- `depth_handler` 已补 future extrapolation 回退。
- 左链真机已打通到：
  - `/detector/left/detections`
  - `/perception/left/detection_2d`
  - `/perception/left/scene_objects`
  - `/depth_handler/left/pointcloud`
- RViz 点云配置已切换到左右真实 pointcloud topic。

### 验证证据
- `/R/robot_state.tcp_pose` 与 `tf2_echo world right_tcp` 姿态角一致。
- `/perception/left/scene_objects` 已输出 `frame_id=world` 且 `source=left_camera`。
- 当前对象样例：
  - `cup`
  - `water_bottle`
  - `cola_bottle`
- `/depth_handler/left/pointcloud` 已输出 `PointCloud2`，频率约 `14~15Hz`。
- `left_detector_view` 与 RViz 窗口均存在。

### 当前阻塞
- 当前系统仍只枚举到 1 台 Orbbec，真正的左右双相机协同仍 blocked。
- 左右基座的 `xyz/yaw` 仍未用现场实测值覆盖，整机位置在 RViz 里还不是正式摆位。
- `move_group` 与 `ros_image_viewer.py` 的退出路径问题仍在。

### 下一步入口
1. 先解决第二台 Orbbec 未枚举问题。
2. 双设备到位后重新探测左右：
   - `ID_SERIAL_SHORT`
   - `color_device`
   - `depth_device`
3. 在同一批杯/瓶/球目标下同时跑：
   - `/perception/left/*`
   - `/perception/right/*`
   - `/scene_fusion/scene_objects`
   - `/competition/rviz/scene_model_points`
4. 现场实测基座安装位姿，覆盖 `left_base_xyz/right_base_xyz/right_base_rpy`。

## 2026-04-22 双机恢复后的最新断点

### 当前完成
- 两台 Orbbec 已重新枚举：
  - 左：`CP1E5420007N`
  - 右：`CP02653000G2`
- full 双机栈已再次拉起：
  - 左右 detector
  - 左右 depth_handler
  - 左右 ball_basket_pose_estimator
  - `scene_fusion`
  - `planning_scene_sync`
- 左链继续稳定产出 `world` 对象与 unified scene。

### 当前阻塞
- 右侧桥接层仍不稳定：
  - `读取彩色图失败`
  - `VIDIOC_DQBUF: No such device`
- 当前真正卡住 unified 双机验收的，不是 `scene_fusion`，而是右相机输入流。

### 下一步入口
1. 继续只排右相机 `CP02653000G2` 的 UVC 输入问题。
2. 右桥恢复后，立即补验：
   - `/perception/right/scene_objects`
   - `/scene_fusion/scene_objects`
   - `/competition/rviz/scene_model_points`

## 2026-04-22 右桥隔离结论

### 当前完成
- 已完成“右桥单独运行”隔离实验。
- 右桥单独运行时：
  - `color=/dev/video6`
  - `depth=/dev/video0`
  - `fps=5.0`
  - 原始彩色流稳定，约 `5Hz`

### 结论
- 右相机本体不是“单独运行就坏”。
- 当前真正的问题是：右桥只在“双机 full 栈”条件下失稳。

### 下一步入口
1. 后续优先排查双桥并发条件，不再把重点放在右相机单体故障上。
2. 先尝试：
   - 两桥都降帧
   - 只保留双桥，不启动 detector/depth/fusion，验证是否仍掉流
   - 再逐层加回 detector、depth_handler、scene_fusion

## 2026-04-22 双桥并发隔离结论

### 当前完成
- 已完成“双桥只开彩色”的并发隔离测试。
- 当前结论：
  - 双彩色并发稳定
  - 双深度并发才会触发右桥失稳

### 下一步入口
1. 把双机运行策略改成：
   - 左右彩色常开
   - 单侧深度常开
   - 另一侧深度按需启用
2. 再回到 detector/depth/fusion 全链路验证。

## 2026-04-22 稳定模式断点

### 当前完成
- `orbbec_gemini_bridge` 已支持 `enable_depth`
- bringup 已支持：
  - `left_camera_enable_depth/right_camera_enable_depth`
  - `left_camera_fps/right_camera_fps`
- 当前稳定模式已经验证：
  - 左右彩色常开
  - 左深度开
  - 右深度关
  - 左右 detector 同开
  - unified scene 与 RViz 点云可工作

### 下一步入口
1. 下一轮先测试“右深度按需启用”：
   - `left_camera_enable_depth:=false`
   - `right_camera_enable_depth:=true`
2. 若右侧 3D 也能独立跑通，再继续研究如何安全切换左右深度所有权。
