# W2-3 Perception Camera

状态: [~]
创建时间: 2026-04-16
更新时间: 2026-04-16

## Scope

- 左臂相机正式主链
- `left_camera` / depth / color frame 契约
- 瓶杯与球筐职责拆分
- detection-driven 球筐稳定性
- depth_handler 任务级几何处理升级

## Owned Paths

- `src/perception/orbbec_gemini_bridge`
- `src/transforms/tf_node`
- `src/perception/depth_handler`
- `src/perception/ball_basket_pose_estimator`
- `src/perception/detector_adapter`
- `src/perception/detector`

## Acceptance

- 相机主链 frame 契约通过
- 瓶杯与球筐分别进入正确 topic
- 球筐不再依赖固定 ROI 主链
- perception pose 数值与 frame 一致

## This Pass

- `ball_basket_pose_estimator` 已增加 detection/depth/camera_info 新鲜度门控。
- `ball_basket_pose_estimator` 已增加球/筐稳定帧窗口、位置门限与轨迹超时回收。
- `detector_adapter.launch.py` 默认 class map 已切到 `class_map_best_pt.yaml`，6 类映射在本模块默认 launch 下正式生效。
- `ball_basket_pose_estimator` 已修复 basket subframe 反写主 pose 的共享对象问题。
- `depth_handler` 在 `target_frame=world` 的 TF 失败场景已默认 fail-close，不再向同一 `/perception/scene_objects` topic 混发相机系对象。
- `detector_adapter` 的 node-level fallback 已同步切到 6 类映射，避免 `ros2 run` / 配置缺失时退回旧 3 类职责。
- `depth_handler` 与 `ball_basket_pose_estimator` 已新增 `require_depth_aligned_detections` / `require_camera_info_depth_frame` 合同，默认不再接受 color-frame 检测框直接做 3D。
- `tf_node` 已把 `left_tcp -> left_camera` 改成显式 `unverified extrinsic` 门槛：默认不发布，只有 debug-only opt-in 才允许放行。
- 5 个 owned packages 与 `detector` 已加入 CMake build guard，默认拒绝被 Conda 污染的 ROS 构建环境。
- 已新增：
  - `src/transforms/tf_node/scripts/frame_contract_smoke.py`
  - `src/perception/ball_basket_pose_estimator/scripts/wave23_perception_acceptance.py`

## Evidence

- 2026-04-16 frame smoke 通过：
  - 命令：`/usr/bin/python3 src/tools/tools/scripts/smoke_camera_frames.py`
  - 输出：`camera frame smoke passed`
  - 观测到：`left_camera_color_frame`、`left_camera_depth_frame`、`left_camera_depth_frame`
- 2026-04-16 强化 frame contract smoke 通过：
  - 命令：`/usr/bin/python3 src/transforms/tf_node/scripts/frame_contract_smoke.py`
  - 运行前提：
    - `ros2 launch tf_node frame_authority.launch.py`
    - `/usr/bin/python3 src/perception/orbbec_gemini_bridge/scripts/mock_camera_stream.py`
  - 输出：
    - `frame contract smoke passed`
    - `color_frame=left_camera_color_frame`
    - `depth_frame=left_camera_depth_frame`
    - `depth_camera_info_frame=left_camera_depth_frame`
    - `tf_chain=left_tcp->left_camera->left_camera_color_frame,left_camera_depth_frame`
- 2026-04-16 role-split smoke 通过：
  - 归一化语义：`basket basketball cola_bottle cup soccer_ball water_bottle`
  - `depth_handler` 输出语义：`cola_bottle cup water_bottle`
  - `ball_basket_pose_estimator` 输出语义：`basket basketball soccer_ball`
  - 说明：这条证据现在只代表“语义职责拆分”，不再代表当前默认 3D 合同；当前默认 3D 已改为 fail-close，要求 detection frame 显式对齐到 depth frame。
- 2026-04-16 Python 语法检查通过：
  - 命令：`/usr/bin/python3 -m py_compile ...`
  - 覆盖：`ball_basket_pose_estimator_node.py`、`detector_adapter_node.py`、`orbbec_gemini_ros_bridge.py`、`detector_pt_node.py`、`static_frame_authority.py`
- 2026-04-16 detection-driven 球筐稳定性软件验收通过：
  - 命令：`/usr/bin/python3 src/perception/ball_basket_pose_estimator/scripts/wave23_perception_acceptance.py`
  - 输出：
    - `wave23 perception acceptance passed`
    - `stable_frames=3 gate check passed`
    - `jitter rejection passed`
    - `track timeout recycle passed`
    - `tf failure rejection passed`
    - `unaligned detection frame rejection passed`
    - `camera_info/depth frame rejection passed`
- 2026-04-16 最小写集构建通过：
  - 命令：`colcon build --packages-select depth_handler tf_node detector_adapter ball_basket_pose_estimator orbbec_gemini_bridge --symlink-install --event-handlers console_direct+ --cmake-args -DPython3_EXECUTABLE=/usr/bin/python3 -DPYTHON_EXECUTABLE=/usr/bin/python3`
  - 前提：
    - 非 login shell
    - `source /opt/ros/humble/setup.bash`
    - `source /home/gwh/dashgo_rl_project/workspaces/dual-arm/install/setup.bash`
    - `source install/setup.bash`
    - `PATH` 置前 `/usr/bin`
  - 结果：`5 packages finished`
- 2026-04-16 build guard 负例通过：
  - 命令：在 `PATH` 前置 `/usr/local/miniconda/bin` 后执行 `colcon build --packages-select tf_node --cmake-force-configure`
  - 输出：`Conda path detected in PATH; build from a clean ROS shell or pass ROS_BUILD_ALLOW_CONDA_ENV=ON only for explicit debug.`
- 2026-04-16 unverified extrinsic gate 负例通过：
  - 命令：
    - `ros2 launch tf_node frame_authority.launch.py`
    - `/usr/bin/python3 src/perception/orbbec_gemini_bridge/scripts/mock_camera_stream.py`
    - `/usr/bin/python3 src/transforms/tf_node/scripts/frame_contract_smoke.py`
  - 输出：
    - `以下 TF 因 calibration status 未满足要求而未发布: left_tcp->left_camera(unverified)`
    - `frame contract smoke failed: tf lookup failed: left_tcp->left_camera`
- 2026-04-16 unverified extrinsic debug-only opt-in 正例通过：
  - 命令：
    - `ros2 launch tf_node frame_authority.launch.py allow_unverified_extrinsics:=true`
    - `/usr/bin/python3 src/perception/orbbec_gemini_bridge/scripts/mock_camera_stream.py`
    - `/usr/bin/python3 src/transforms/tf_node/scripts/frame_contract_smoke.py`
  - 输出：
    - `UNVERIFIED EXTRINSIC: left_tcp->left_camera status=unverified`
    - `frame contract smoke passed`

## Boundaries

- 当前 smoke 为纯软件链路；`left_tcp -> left_camera` 已从“静默候选值”改成“默认拒绝、显式 opt-in 才允许”的 provisional 外参。
- 当前收口范围是“frame/topic 契约显式化 + detection-driven 球筐稳定性软件验收 + build guard 收口”，不包含真实 `left_tcp -> left_camera` 外参复核。
- 当前默认 3D 合同不再接受 color-frame 检测框直接切 depth ROI；若后续要恢复 3D，必须先提供 depth-aligned detections 或显式注册链路。

## Remaining Risks

- 当前真实链路若继续使用 `/camera/color/image_raw` 的 color-frame detections，3D 会被默认 fail-close；要恢复功能，必须先交付 depth-aligned detections 或显式注册节点。
- `left_tcp -> left_camera` 仍缺真机标定证据；当前只是被安全地降级为 debug-only opt-in，不再是假装 verified。
- build guard 已能挡住 Conda 污染，但当前 overlay 仍建议配合 `dual-arm` underlay；若后续要独立 worktree 全自举，还需补齐 underlay 依赖策略。

## Coordination Handoff

- 本窗口的软件侧 W2/W3 证据已足够作为 `maintenance-ready` 候选；剩余问题已经被改成显式门槛，而不是静默错误。
- 若要求 Wave 2 真正闭环，应单列后续任务：
  - 真实 `left_tcp -> left_camera` 外参校准与证据
  - depth-aligned detections 或显式 color-depth 注册链路
  - 真机链路下的 color/depth 对齐验证与 3D 偏差量化

## Coordination

- 每次任务开始、改代码前、开新 subagent 前、每个 smoke 后都要重读共享文件
- 本任务每个子任务都必须滚动使用 subagent
- 当前活跃窗口：`perception-camera`
- 当前共享状态版本：`coord_rev=7`
- 当前下一步：等待协调窗口决定是否把本窗口标为 `maintenance-ready`；若继续留在 active，则下一轮只建议做真机标定/色深对齐专项
