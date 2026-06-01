# 2026-05-07 右臂运动停稳与脚本化几何接续

## 结论

上次右臂低速 `Z +3.0 mm` 增量测试已经收口：`/R/robot_move_cart` 服务曾返回成功，但后续 `/R/robot_state` 长时间为 `motion_done=false`；已通过直连 Fairino SDK `StopMotion()` 返回 `ret=0` 停稳。停止后连续 5 帧 `/R/robot_state` 均为 `motion_done=true`、`error_code=0`，随后 `/right_robo_ctrl` 已停止，`ROS_DOMAIN_ID=0` node list 为空。

本次没有执行夹爪 enable/open/close，没有调用 `/competition/run`，没有做双臂协作。后续几何、深度和坐标转换必须全部由脚本计算并输出 JSON，不再由聊天手算。

## 已发生的右臂增量测试

- 手臂：右臂。
- 服务：`/R/robot_move_cart`。
- 模式：`use_increment=true`。
- 增量：`tcp_pose.z=+3.0 mm`。
- 速度参数：`velocity=5.0`、`acceleration=5.0`、`ovl=5.0`。
- 服务响应：`success=true`。
- 风险表现：服务返回后 `/R/robot_state` 多次显示 `motion_done=false`，`error_code=0`，TCP `z` 从约 `640.160 mm` 慢速变化到约 `642.919 mm`。

## 停止与最终状态

直连 SDK helper：

```bash
/tmp/dual_arm_stop_motion 192.168.58.3
```

关键输出：

```text
RPC(192.168.58.3) ret=0
StopMotion ret=0
CloseRPC ret=0
```

停止后状态采样：

- `/R/robot_state` 约 `4.995 Hz`。
- 连续 5 帧均为 `motion_done=true`、`error_code=0`。
- TCP `z` 稳定在约 `643.086 mm`。
- `/right_robo_ctrl` 已停止。
- `ROS_DOMAIN_ID=0 ros2 node list` 为空。

## 右相机/深度/目标上下文

- 用户现场确认 `/dev/video6` / `CP02653000G2` 彩色画面为右侧相机。
- 右深度口为同 serial 的 `/dev/video0`，Z16。
- 原生 V4L2 ioctl/mmap 可读取 `/dev/video0` Z16。
- OpenCV V4L2 打不开 `/dev/video0`；OBSENSOR 返回全 0。
- YOLOv8 右彩色快照检测到 `cocacola`，confidence `0.894`。
- 目标 ROI 原始深度统计：p05 `555`，median `676`。
- 用户明确本轮按 `raw=mm` 使用：`676 raw = 676 mm = 0.676 m`。

## 新硬规则

1. 几何计算必须脚本化：像素 ROI、深度统计、相机内参缩放、相机坐标点、TCP/基座候选点、障碍物距离和 gate 结论全部由脚本输出。
2. 聊天中不得手算几何结果；只引用脚本输出。
3. 右相机到右 TCP 外参可暂时参考左臂 `Ltcp -> camera_link` 参数，但只能标为 candidate，不能标为 verified。
4. 没有 verified 外参、color/depth 对齐和三维避障前，不进入自动夹取或合爪。
5. 后续真实 motion 前必须重新确认 `/R/robot_state` fresh、`motion_done=true`、`error_code=0`，并明确单步距离、方向、速度和现场安全条件。

## 下一步建议

新增脚本入口：

```text
packages/tools/tools/scripts/right_arm_grasp_precheck.py
```

脚本职责：

- 读取右彩色 `/dev/video6` 快照。
- 读取右 Z16 `/dev/video0` 深度帧，按参数 `depth_scale_mm_per_raw=1.0` 计算。
- 运行 YOLOv8 `.pt` 或接收已有检测结果。
- 根据完整 key 输出目标 bbox、ROI 深度统计、相机内参缩放结果。
- 用候选 `right_tcp_to_camera` 外参计算候选 TCP-frame 点，但标记为 candidate。
- 输出 JSON：detections、depth_roi、camera_point_m、candidate_tcp_point_m、obstacle_min_distance_m、safety_gate。
- 保存彩色标注图和深度可视化图。

验收边界：

- 第一版只做 no-motion 计算和 fail-closed gate。
- 不调用 `/R/robot_move*`、`/R/robot_servo*`、夹爪命令或 `/competition/run`。
- 若未来要小步 motion，必须先通过脚本 gate，并由用户明确授权具体一步。
