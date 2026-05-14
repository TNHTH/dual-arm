# 2026-05-08 右相机曝光检查与可乐 no-motion 预检

## 结论

右相机曝光问题已确认并临时修正。`CP02653000G2` 的彩色口 `/dev/video14` 初始自动曝光状态输出严重偏暗画面，灰度均值约 `18.7`，近黑像素约 `80.3%`，导致 `right_arm_grasp_precheck.py` 未检测到 `cocacola`。切到手动曝光后，`exposure_absolute=300`、`gain=32` 可让 no-motion 预检恢复检测；live RGB detector 继续测试自动曝光后，当前保留 `auto_exposure=0`、`exposure_dynamic_framerate=1`、`gain=16`，左右窗口均稳定显示可乐检测。

本轮未启动 `robo_ctrl`、未发送任何 `/R/robot_move*`、`/R/robot_servo*`、夹爪 command 或 `/competition/run`。当前 `DUALARM_HARDWARE_CONFIRM_TOKEN` 未设置，真实运动仍不可执行。

## 边界

- 工作目录：`/home/gwh/dual-arm`
- ROS 域：`ROS_DOMAIN_ID=0`
- 相机：右 Orbbec Gemini 335，serial `CP02653000G2`
- 彩色口：`/dev/v4l/by-path/pci-0000:06:00.4-usb-0:2.2:1.4-video-index0`，实际 `/dev/video14`
- 深度口：`/dev/v4l/by-id/usb-Orbbec_R__Orbbec_Gemini_335_CP02653000G2-video-index0`，实际 `/dev/video8`
- 运行类型：no-motion 相机曝光检查 + 右臂可乐预检
- 深度解释：`depth_scale_mm_per_raw=1.0`，仍为 `operator_selected_not_global_verified`
- 右相机外参：`operator_confirmed_same_as_left_not_calibration_verified`

## 前置检查

- 关键进程检查：无 `ros2 launch`、`move_group`、`fairino_dualarm_planner`、`competition_console_api`、`planning_scene_sync`、`robo_ctrl`、mock feeder、`epg50`、右臂预检脚本残留。
- `ROS_DOMAIN_ID=0 ROS2CLI_ENABLE_DAEMON=0 ros2 node list`：空。
- 右臂网络：
  - `enp5s0=192.168.58.10/24`
  - `ping -c 2 -W 1 192.168.58.3`：`2 received`，`0% packet loss`
  - `nc -vz -w 2 192.168.58.3 8080`：succeeded
- `DUALARM_HARDWARE_CONFIRM_TOKEN=unset`

## 曝光问题复现

自动曝光状态下，右相机 `/dev/video14` 画面过暗：

- Artifact：`.codex/tmp/runtime/right-arm-coke-depth-memory-20260508-capture/coke_depth_memory_seed_right_color.jpg`
- 灰度均值：`18.696`
- 灰度 p50：`16.0`
- 灰度 p95：`27.0`
- 近黑像素比例：`80.267%`
- YOLO 结果：`detections=[]`
- 预检 JSON：`.codex/tmp/runtime/right-arm-coke-precheck-20260508-0001/right_arm_grasp_precheck.json`

左相机同场景对比：

- Artifact：`.codex/tmp/runtime/right-camera-exposure-check-20260508-left-compare/left_exposure_compare_left_color.jpg`
- 灰度均值：`100.231`
- 灰度 p50：`103.0`
- 近黑像素比例：`1.860%`

## UVC 控制项

右彩色口 `/dev/video14` 当前可见关键控制项：

- `Brightness`: min `-64`，max `64`，default `0`
- `Gain`: min `0`，max `128`，default `16`
- `Auto Exposure`: min `0`，max `3`，default `0`
- `Exposure Time, Absolute`: min `1`，max `1665`，default `156`

初始值：

```json
{
  "brightness": 0,
  "gain": 16,
  "auto_exposure": 0,
  "exposure_absolute": 156,
  "exposure_dynamic_framerate": 0
}
```

临时试验一：

- 设置：`auto_exposure=1`、`exposure_absolute=600`、`gain=64`
- 结果：画面恢复但偏亮，灰度均值约 `210.410`
- Artifact：`.codex/tmp/runtime/right-camera-exposure-check-20260508-manual-exp600-gain64/right_manual_exp600_gain64_right_color.jpg`

临时试验二，no-motion 预检使用：

- 设置：`auto_exposure=1`、`exposure_absolute=300`、`gain=32`
- 结果：目标清晰可见，过曝比例约 `0.012%`
- 该参数下的控制值：

```json
{
  "brightness": 0,
  "gain": 32,
  "auto_exposure": 1,
  "exposure_absolute": 300,
  "exposure_dynamic_framerate": 0,
  "white_balance_auto": 1,
  "white_balance_temperature": 4600
}
```

Artifact：`.codex/tmp/runtime/right-camera-exposure-check-20260508-manual-exp300-gain32/right_manual_exp300_gain32_right_color.jpg`

live RGB 检测窗口曾用手动 `200/16` 修正过曝误分类：

```json
{
  "auto_exposure": 1,
  "exposure_absolute": 200,
  "gain": 16
}
```

说明：`300/32` 在 live bridge 中偏亮，右侧 detector 一度把可乐误标为 `yibao 0.90`；下调到 `200/16` 后右侧恢复 `cocacola 0.93`。

继续按用户要求测试自动曝光后，当前最终保留：

```json
{
  "auto_exposure": 0,
  "exposure_absolute": 200,
  "exposure_dynamic_framerate": 1,
  "gain": 16,
  "backlight_compensation": 0
}
```

当前自动曝光快照灰度均值约 `110.0`、近黑像素约 `5.09%`、过曝像素约 `0.99%`，右侧检测 `cocacola 0.9328`。

2026-05-08 19:39 复核：

- `/detector/right_rgb/detections` 当前输出 `class_id=2(cocacola)`、`score=0.9349241852760315`。
- `/right_camera_rgb/color/image_raw` 当前图像统计：灰度均值 `111.6969`、P50 `114`、P95 `152`、近黑像素 `4.1641%`、过曝像素 `0.9863%`。
- 复核时 `right_rgb_bridge`、`detector_right_rgb`、`right_rgb_detection_viewer` 仍在运行，右侧 overlay 图像话题约 `15Hz`。

## 右相机设备扫描

同 serial `CP02653000G2` 设备扫描结果：

- `/dev/video8`：OpenCV default 可打开但未读到帧；Z16 由原生 V4L2 mmap 读取。
- `/dev/video10`、`/dev/video12`：可读亮帧，但为 640x400 噪声/辅助流，不适合作为 YOLO 彩色输入。
- `/dev/video14`：640x480 彩色口，曝光修正后可用。

Artifacts：

- `.codex/tmp/runtime/right-camera-exposure-check-20260508-device-scan/scan.json`
- `.codex/tmp/runtime/right-camera-exposure-check-20260508-device-scan/contact_sheet.jpg`

## 可乐 no-motion 预检

使用手动曝光 `exposure_absolute=300`、`gain=32` 后重新运行：

```bash
/usr/bin/python3 packages/tools/tools/scripts/right_arm_grasp_precheck.py \
  --color-device-override /dev/v4l/by-path/pci-0000:06:00.4-usb-0:2.2:1.4-video-index0 \
  --depth-device-override /dev/v4l/by-id/usb-Orbbec_R__Orbbec_Gemini_335_CP02653000G2-video-index0 \
  --no-rotate-180 \
  --right-extrinsic-assumption operator_confirmed_same_as_left \
  --target-class-name cocacola \
  --target-class-id 2 \
  --confidence-threshold 0.30 \
  --depth-scale-mm-per-raw 1.0 \
  --output-dir .codex/tmp/runtime/right-arm-coke-precheck-20260508-exp300-gain32
```

关键输出：

- YOLO：`cocacola`，score `0.9229347109794617`
- bbox：`[261.0777, 152.3768, 357.0197, 332.3746]`
- bbox edge margin：`147.625 px`
- depth ROI median：`0.408 m`
- target center camera：`[-0.010557, 0.002254, 0.408000] m`
- candidate TCP point：`[-0.020557, -0.087746, 0.464000] m`
- `target_alignment.camera_center.passes=true`
- `target_3d_bbox_camera_m.valid=true`

Safety gate：

- `depth_model_gate.passes=true`
- `clearance_gate.passes=false`
- `extrinsic_gate.passes=false`
- `auto_grasp_allowed=false`
- reasons：
  - `obstacle_too_close_or_target_invalid`
  - `right_camera_to_right_tcp_extrinsic_not_verified`

Artifacts：

- `.codex/tmp/runtime/right-arm-coke-precheck-20260508-exp300-gain32/right_arm_grasp_precheck.json`
- `.codex/tmp/runtime/right-arm-coke-precheck-20260508-exp300-gain32/right_color_snapshot.jpg`
- `.codex/tmp/runtime/right-arm-coke-precheck-20260508-exp300-gain32/right_depth_raw_vis.jpg`
- `.codex/tmp/runtime/right-arm-coke-precheck-20260508-exp300-gain32/right_color_depth_precheck_overlay.jpg`

## 左右 RGB 检测可视化

按用户要求启动左右 RGB 检测窗口；仍为 no-motion，不启动 `robo_ctrl`、MoveIt、夹爪或 `/competition/run`。

运行目录：

- `.codex/tmp/runtime/dual-rgb-detection-view-20260508/`

启动的节点：

- `/left_rgb_bridge`
- `/right_rgb_bridge`
- `/detector_left_rgb`
- `/detector_right_rgb`
- `/left_rgb_detection_viewer`
- `/right_rgb_detection_viewer`

话题与频率：

- `/left_camera_rgb/color/image_raw`：约 `15 Hz`
- `/right_camera_rgb/color/image_raw`：约 `15 Hz`
- `/detector/left_rgb/detections/image`：约 `15 Hz`
- `/detector/right_rgb/detections/image`：约 `15 Hz`

检测确认：

- 左侧 `/detector/left_rgb/detections`：`class_id=2(cocacola)`，score `0.9281`。
- 右侧 `/detector/right_rgb/detections`：下调曝光后 `class_id=2(cocacola)`，score `0.9313`。

快照：

- `.codex/tmp/runtime/dual-rgb-detection-view-20260508/left_overlay_snapshot.jpg`
- `.codex/tmp/runtime/dual-rgb-detection-view-20260508/right_overlay_snapshot_exp200_gain16.jpg`
- `.codex/tmp/runtime/dual-rgb-detection-view-20260508/auto-exposure-probe/right_auto0_dyn1_final_overlay.jpg`

自动曝光探针：

- `.codex/tmp/runtime/dual-rgb-detection-view-20260508/auto-exposure-probe/auto_exposure_probe.json`

当前 viewer 窗口：

- `left_rgb_detection`
- `right_rgb_detection`

## 当前判断

- 右相机曝光异常是本轮 YOLO 失败的直接原因。
- 当前 live 自动曝光参数 `auto_exposure=0`、`exposure_dynamic_framerate=1`、`gain=16` 可让右相机恢复可用，已保留在设备上用于后续测试。
- 当前可乐检测和基础深度建模已恢复，但不能直接自动夹取：
  - 右相机外参不是 calibration verified。
  - 当前 clearance gate 被附近桌面/线缆/目标周边点云触发为失败。
  - 真实运动 token 未设置。

## 下一步

1. 继续保持单右臂路线。
2. 在当前 live 自动曝光下重新做更干净的点云建模：移开瓶体附近线缆或调整 ROI/障碍分割，目标 bbox 和障碍 clearance 必须稳定。
3. 只读确认 `/R/robot_state` fresh、`motion_done=true`、`error_code=0`，并只读确认右夹爪 status。
4. 若要真实动作，必须设置 `DUALARM_HARDWARE_CONFIRM_TOKEN`，并现场确认工作区、急停和单步距离；否则只允许 no-motion/plan-only。

## 收口

- 当前按用户要求保留左右 RGB bridge、detector 和 viewer 运行。
- 未执行真实运动、未控制夹爪、未调用 `/competition/run`。
