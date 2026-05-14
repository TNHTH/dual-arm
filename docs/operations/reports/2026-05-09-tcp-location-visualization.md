# 2026-05-09 TCP 位置可视化记录

## 结论

已生成 TCP 位置可视化：

- `.codex/tmp/runtime/tcp-location-20260509/tcp_location_visual.html`
- `.codex/tmp/runtime/tcp-location-20260509/tcp_location_visual.png`
- `.codex/tmp/runtime/tcp-location-20260509/right_arm_urdf_tcp_model.html`
- `.codex/tmp/runtime/tcp-location-20260509/right_arm_urdf_tcp_model.png`
- `.codex/tmp/runtime/tcp-location-20260509/right_arm_urdf_tcp_closeup.png`
- `.codex/tmp/runtime/tcp-location-20260509/right_arm_tcp_at_gripper_center_candidate.html`
- `.codex/tmp/runtime/tcp-location-20260509/right_arm_tcp_at_gripper_center_candidate.png`
- `.codex/tmp/runtime/tcp-location-20260509/right_arm_tcp_at_gripper_center_candidate_closeup.png`
- `.codex/tmp/runtime/tcp-location-20260509/right_arm_tcp_gripping_center_intuitive.html`
- `.codex/tmp/runtime/tcp-location-20260509/right_arm_tcp_gripping_center_intuitive.png`
- `.codex/tmp/runtime/tcp-location-20260509/right_arm_tcp_gripping_center_closeup_intuitive.png`
- `.codex/tmp/runtime/tcp-location-20260509/right_arm_tcp_gripping_center_clean_schematic.png`
- `.codex/tmp/runtime/tcp-location-20260509/right_arm_tcp_gripping_center_candidate.json`
- `.codex/tmp/runtime/tcp-location-20260509/right_arm_tcp_real_urdf_shape_with_grip_center.png`
- `.codex/tmp/runtime/tcp-location-20260509/right_arm_tcp_real_urdf_shape_closeup.png`
- `.codex/tmp/runtime/tcp-location-20260509/right_arm_tcp_real_urdf_shape_solid.png`
- `.codex/tmp/runtime/tcp-location-20260509/right_arm_tcp_real_urdf_shape_full_stl.png`
- `.codex/tmp/runtime/tcp-location-20260509/right_arm_tcp_real_urdf_shape_full_stl_tcp_visible.png`
- `.codex/tmp/runtime/tcp-location-20260509/right_arm_tcp_real_urdf_shape_plus_gripper_front_view.png`
- `.codex/tmp/runtime/tcp-location-20260509/right_arm_tcp_closed_gripper_center_full_shape.png`
- `.codex/tmp/runtime/tcp-location-20260509/right_arm_tcp_closed_gripper_center_closeup.png`
- `.codex/tmp/runtime/tcp-location-20260509/right_arm_tcp_closed_gripper_center_candidate.json`

图中红点是当前 active 模型和 planner 使用的 `left_tcp/right_tcp`。它位于 `wrist3_link/tool0` 前方本地 `+Z 100 mm`，不是夹爪指尖，也不是两指夹持中心。

2026-05-09 追加：按用户要求，已使用展开后的 active URDF 和 URDF 引用的 STL mesh 生成右臂三维模型；红色球放置在 `right_tcp` 的 URDF 世界坐标位置。该模型使用零关节位姿和默认 URDF 参数，不连接实机。

2026-05-09 追加 2：用户指出可将 TCP 放置到夹爪中心。已生成 candidate 可视化：黄色为 vendor gripper mesh，灰球为旧 active `right_tcp`，红球为按 vendor gripper mesh bbox 几何中心得到的候选 TCP。该候选中心在当前 `right_tcp` 坐标系下约为 `[-0.000069, -0.000177, 0.078505] m`，即相对旧 TCP 主要沿本地 `+Z` 再前移约 `78.5 mm`。此候选尚未写入 active URDF/MoveIt，也不是 verified pinch center。

2026-05-09 追加 3：用户要求不要只取整只夹爪中心，而是把 TCP 放到实际夹东西的部分中间。已基于 vendor `gripper1.stl` 三角面法向自动识别两片夹指的相对内侧夹持面：

- 正向夹持面筛选：`normal_y < -0.8`、`y > 0.02`、`0.09 <= z <= 0.155`
- 负向夹持面筛选：`normal_y > 0.8`、`y < -0.02`、`0.09 <= z <= 0.155`
- 用两侧夹持面的面积加权中心取中点，得到候选 pinch/TCP：
  - `candidate_grip_center_gripper_frame_m = [-0.000206, 0.000066, 0.124706]`
  - `candidate_tool0_to_tcp_xyz_m = [-0.000066, -0.000206, 0.231706]`
  - `old_right_tcp_to_candidate_xyz_m = [-0.000066, -0.000206, 0.131706]`
- 已生成更直观的机械臂可视化：
  - `right_arm_tcp_gripping_center_intuitive.png/html`：粗彩色连杆 + 夹爪局部 + 红球 TCP。
  - `right_arm_tcp_gripping_center_clean_schematic.png`：俯视图、侧视图、夹爪局部 Y-Z 剖面图；灰色为旧 active `right_tcp`，红色为候选夹持中心。

本次仍只生成候选模型和可视化，没有写入 active URDF、SRDF 或 MoveIt 配置。

2026-05-09 追加 4：用户反馈简化连杆图抛弃了机械臂样子。已重新生成基于完整 URDF/STL 外形的实体渲染：

- 推荐查看：`right_arm_tcp_real_urdf_shape_plus_gripper_front_view.png`
  - 左侧保留完整右臂 URDF/STL 机械臂外形。
  - 右侧使用真实 gripper STL 的正视投影，让红色候选 TCP 在两片夹持面之间清晰可见。
- 备用查看：`right_arm_tcp_real_urdf_shape_full_stl.png`
  - 完整 STL 实体渲染，机械臂外形最完整，但 TCP 在三维视角里可能被夹爪遮挡。
- 备用查看：`right_arm_tcp_real_urdf_shape_full_stl_tcp_visible.png`
  - 夹爪半透明，便于看到内部红球。

2026-05-09 追加 5：用户明确要求“闭合状态的机械臂夹爪的中心”。已重新生成闭合状态候选：

- 推荐查看：`right_arm_tcp_closed_gripper_center_full_shape.png`
  - 左侧保留完整右臂 URDF/STL 机械臂外形。
  - 右侧为闭合夹爪的 gripper local 正视图，红球强制放在闭合后的中心线 `Y=0`。
- 候选数值：
  - `closed_gripper_center_gripper_frame_m = [-0.000206, 0.000000, 0.124706]`
  - `candidate_tool0_to_tcp_xyz_m = [-0.000000, -0.000206, 0.231706]`
  - `candidate_old_right_tcp_to_closed_center_xyz_m = [-0.000000, -0.000206, 0.131706]`
- 说明：当前 active URDF 没有夹爪开合关节；闭合形态是将 STL 中识别出的两侧夹持面沿 gripper local `Y` 方向合到中心线后的可视化候选，不是已写入 URDF 的真实关节状态。

## 数值来源

- Active URDF：`packages/planning/descriptions/fairino_dualarm_description/urdf/fairino3_v6_macro.xacro`
  - `wrist3_link -> tool0 = [0, 0, 0]`
  - `tool0 -> tcp = [0, 0, 0.100] m`
- MoveIt SRDF：`packages/planning/moveit/fairino_dualarm_moveit_config/config/fairino_dualarm.srdf`
  - `left_arm` tip: `left_tcp`
  - `right_arm` tip: `right_tcp`
- 候选末端 TF：`packages/tools/tools/config/static_transforms.yaml`
  - `Rtcp -> Rend = [0.030650, -0.007066, 0.190848] m`
  - `Ltcp -> Lend = [-0.019899, -0.003972, 0.191327] m`
- Vendor gripper candidate：
  - gripper mesh：`vendor/fairino_sdk/software/robot_model/data/cobots/tool/gripper1.stl`
  - vendor gripper mount：`tool0 -> gripper_Link = [0, 0, 0.107] m`，`rpy=[0, 0, 1.570796]`
  - 当前候选夹持中心：`tool0 -> TCP = [-0.000066, -0.000206, 0.231706] m`

## 安全边界

- 本次只生成可视化，没有启动 ROS 控制链路。
- 没有发送机械臂运动命令。
- 没有发送夹爪命令。
- `Lend/Rend` 仍是历史候选末端偏移，不能作为 verified pinch center。
- 夹持面中点 TCP 是从 vendor mesh 推导出的 candidate，尚未通过实物量尺、夹爪开合状态、RViz TF 或实机接触验证。

## 后续

如果要继续实机抓取，下一步应标定 `TCP -> pinch center` 或 `TCP -> fingertip_contact`，并把该偏移作为执行门禁，而不是继续把 `left_tcp/right_tcp` 当夹爪中心。
