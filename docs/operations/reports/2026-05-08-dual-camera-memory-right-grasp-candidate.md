# 2026-05-08 双相机点云记忆与右臂夹取候选

## 结论

已完成 no-motion 的双相机点云记忆、3D 浏览器可视化、以及“YOLO 类别 -> `object_geometry.yaml` 硬编码规格 -> 右臂夹取候选”的匹配链路。当前候选已经能被 `right_arm_autonomous_grasp_attempt.py` 消费，但真实右臂运动仍未放行：`DUALARM_HARDWARE_CONFIRM_TOKEN` 未设置，右相机外参和双相机融合变换未 verified，且当前点云 clearance gate 仍失败。

本轮未启动 `robo_ctrl`，未调用真实运动、夹爪 command 或 `/competition/run`。

## 运行产物

- 双相机点云记忆 JSON：`.codex/tmp/runtime/dual-camera-coke-memory-20260508-ros-topic/dual_camera_coke_memory.json`
- 融合点云 PLY：`.codex/tmp/runtime/dual-camera-coke-memory-20260508-ros-topic/dual_camera_coke_memory_candidate_left_camera.ply`
- 融合点云 NPZ：`.codex/tmp/runtime/dual-camera-coke-memory-20260508-ros-topic/dual_camera_coke_memory_points.npz`
- 3D 浏览器可视化：`.codex/tmp/runtime/dual-camera-coke-memory-20260508-ros-topic/dual_camera_coke_memory_view.html`
- 右臂夹取候选：`.codex/tmp/runtime/dual-camera-coke-memory-20260508-ros-topic/right_arm_grasp_memory/right_arm_grasp_memory_candidate.json`

## 点云记忆结果

双相机记忆状态：`completed_memory_candidate_no_motion`。

左相机：

- 检测：`cocacola 0.8529`
- depth median：`0.433 m`
- camera center：`[0.060962, -0.034332, 0.433000] m`
- 点数：`14362`
- 原始 bbox size：`[0.126270, 0.150387, 0.124000] m`

右相机：

- 检测：`cocacola 0.9323`
- depth median：`0.412 m`
- camera center：`[-0.008869, -0.002203, 0.412000] m`
- 点数：`11026`
- 原始 bbox size：`[0.160385, 0.178633, 0.387000] m`

融合：

- 融合点数：`25388`
- 融合中心：`[0.031742, -0.022727, 0.417349] m`
- 融合 bbox size：`[0.303803, 0.338453, 0.178712] m`
- 右到左变换状态：`candidate_not_verified`

## 硬编码物体规格匹配

`config/competition/object_geometry.yaml` 中的 alias 将 `cocacola` 映射为 `cola_bottle`。

匹配后的可乐瓶规格：

- semantic：`cola_bottle`
- label：`可口可乐原味 300ml`
- proxy：圆柱，半径 `0.030 m`，高度 `0.145 m`
- 硬编码 bbox：`[0.060, 0.060, 0.145] m`
- 抓取区：`body_mid`
- 抓取区 z range：`[0.050, 0.095] m`
- 推荐夹爪宽度：`0.066 m`
- 当前夹爪控制位置：`close_position=220`，仍需用 `gobj` 接触状态确认，不等同于已标定宽度。

点云 bbox 与硬编码尺寸的匹配分数：

- 左点云 bbox：`0.6319`
- 右点云 bbox：`0.1135`
- 融合点云 bbox：`0.1146`

因此当前策略是不直接用膨胀的点云外包围盒作为碰撞/夹取尺寸，而是用点云中心做记忆，用 `object_geometry.yaml` 作为碰撞和夹爪模型。

右臂候选中的关键几何：

- 右相机目标中心：`[-0.008869, -0.002203, 0.412000] m`
- 候选 TCP 点：`[-0.018869, -0.092203, 0.468000] m`
- 右臂候选 bbox：`[0.060, 0.060, 0.145] m`

## 可视化

已生成并打开本地 HTML：

```bash
xdg-open .codex/tmp/runtime/dual-camera-coke-memory-20260508-ros-topic/dual_camera_coke_memory_view.html
```

颜色语义：

- 蓝色：左相机点云
- 橙色：右相机点云变换到左相机候选坐标系
- 黄色：融合候选包围盒和融合中心

## 右臂夹取状态

候选文件已经包含可执行命令：

```bash
source /opt/ros/humble/setup.bash && source install/setup.bash && /usr/bin/python3 packages/tools/tools/scripts/right_arm_autonomous_grasp_attempt.py --precheck-json .codex/tmp/runtime/dual-camera-coke-memory-20260508-ros-topic/right_arm_grasp_memory/right_arm_grasp_memory_candidate.json --object-id right_cocacola_memory_candidate --semantic-type cola_bottle --scene-object-size-m 0.060,0.060,0.145 --gripper-close-position 220 --allow-extrinsic-candidate --allow-clearance-fail --target-alignment-mode either --hardware --hardware-confirm-token "$DUALARM_HARDWARE_CONFIRM_TOKEN" --execute
```

当前不自动执行，原因：

- `DUALARM_HARDWARE_CONFIRM_TOKEN=unset`
- `/planning/plan_pose` 不存在
- `/execution/execute_trajectory` 不存在
- `/R/robot_state` 不存在
- `/gripper1/epg50_gripper/status` 不存在
- `clearance_gate.passes=false`
- `right_camera_to_right_tcp_extrinsic_not_verified`
- `fused_camera_transform_not_verified`

## 验证

- `/usr/bin/python3 -m py_compile packages/tools/tools/scripts/visualize_dual_camera_coke_memory.py packages/tools/tools/scripts/build_right_arm_grasp_from_memory.py packages/tools/tools/scripts/dual_camera_coke_memory.py`：通过。
- `git diff --check -- packages/tools/tools/scripts/visualize_dual_camera_coke_memory.py packages/tools/tools/scripts/build_right_arm_grasp_from_memory.py packages/tools/tools/scripts/dual_camera_coke_memory.py packages/tools/tools/CMakeLists.txt`：通过。
- `colcon build --base-paths packages --packages-select tools`：`1 package finished`。
- `ros2 pkg executables tools` 已列出：
  - `tools build_right_arm_grasp_from_memory.py`
  - `tools dual_camera_coke_memory.py`
  - `tools visualize_dual_camera_coke_memory.py`
  - `tools cap_depth_alignment_probe.py`

## 下一步

要真正右臂夹取，下一步必须先进入受控硬件 bringup：

1. 保留当前左右 RGB 可视化或由操作者同意关闭后，启动核心控制栈。
2. 只读确认 `/R/robot_state` fresh、`motion_done=true`、`error_code=0`。
3. 只读确认右夹爪 status 服务可用。
4. 重新采一份新鲜 `right_arm_grasp_memory_candidate.json`，避免 precheck age 超时。
5. 设置 `DUALARM_HARDWARE_CONFIRM_TOKEN`，现场确认无人、可乐周边无障碍、stop 路径可用。
6. 先跑 plan-only，再进入单步 `pregrasp -> grasp -> close -> gobj contact -> retreat`。
