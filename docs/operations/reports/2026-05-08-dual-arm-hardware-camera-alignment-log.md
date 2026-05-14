# 2026-05-08 双臂连接检测与双相机瓶盖标定记录

## 结论

本轮完成双臂 no-motion 连接检测和双相机瓶盖单点深度采样。左右机械臂网络、`8080` TCP 端口、`robo_ctrl` 只读状态发布均通过；左右 `/robot_state` 约 `4.996 Hz`，两臂均为 `motion_done=true`、`error_code=0`。左右 Orbbec 已轮流采集 RGB 与 Z16 深度，瓶盖像素点、ROI 深度统计、相机坐标点和截图均已写入 `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-*`。

本轮未发送任何 `/L/robot_move*`、`/R/robot_move*`、`/L/robot_servo*`、`/R/robot_servo*`、夹爪 command 或 `/competition/run`。单个瓶盖点只证明双相机像素到深度点链路可用，不能标定完整双臂统一坐标系；后续仍需至少 4 个非共线点并做残差验证。

## 边界

- 工作目录：`/home/gwh/dual-arm`
- ROS 域：`ROS_DOMAIN_ID=0`
- 运行类型：no-motion/read-only + 相机采样
- 深度解释：`depth_scale_mm_per_raw=1.0`，状态为 `operator_selected_not_global_verified`
- RGB/depth 图像均按原始方向保存，`rotate_180=false`
- 本轮只记录单个瓶盖点 `cap_p1`

## 基线检查

旧进程检查只匹配检查命令本身，未发现有效残留：

```bash
pgrep -af 'ros2 launch|move_group|fairino_dualarm_planner|competition_console_api|planning_scene_sync|robo_ctrl|mock|feeder'
```

`ROS_DOMAIN_ID=0 ROS2CLI_ENABLE_DAEMON=0 ros2 node list` 为空。

网卡：

```text
enp5s0 UP 192.168.58.10/24 fe80::e705:1c:d8b9:3d86/64
```

左右机械臂网络：

- `ping -c 2 -W 1 192.168.58.2`：`2 received`，`0% packet loss`
- `ping -c 2 -W 1 192.168.58.3`：`2 received`，`0% packet loss`
- `nc -vz -w 2 192.168.58.2 8080`：succeeded
- `nc -vz -w 2 192.168.58.3 8080`：succeeded

夹爪串口 by-id：

```text
usb-Prolific_Technology_Inc._USB-Serial_Controller_A7BIb114J19-if00-port0 -> ../../ttyUSB1
usb-Prolific_Technology_Inc._USB-Serial_Controller_A_COb114J19-if00-port0 -> ../../ttyUSB0
```

Orbbec by-id：

```text
usb-Orbbec_R__Orbbec_Gemini_335_CP1E5420007N-video-index0 -> ../../video0
usb-Orbbec_R__Orbbec_Gemini_335_CP1E5420007N-video-index1 -> ../../video7
usb-Orbbec_R__Orbbec_Gemini_335_CP1E5420007N-video-index2 -> ../../video2
usb-Orbbec_R__Orbbec_Gemini_335_CP1E5420007N-video-index3 -> ../../video3
usb-Orbbec_R__Orbbec_Gemini_335_CP1E5420007N-video-index4 -> ../../video4
usb-Orbbec_R__Orbbec_Gemini_335_CP1E5420007N-video-index5 -> ../../video5
usb-Orbbec_R__Orbbec_Gemini_335_CP02653000G2-video-index0 -> ../../video8
usb-Orbbec_R__Orbbec_Gemini_335_CP02653000G2-video-index1 -> ../../video9
usb-Orbbec_R__Orbbec_Gemini_335_CP02653000G2-video-index2 -> ../../video10
usb-Orbbec_R__Orbbec_Gemini_335_CP02653000G2-video-index3 -> ../../video11
usb-Orbbec_R__Orbbec_Gemini_335_CP02653000G2-video-index4 -> ../../video12
usb-Orbbec_R__Orbbec_Gemini_335_CP02653000G2-video-index5 -> ../../video13
usb-SunplusIT_Inc_Integrated_Camera_01.00.00-video-index0 -> ../../video16
usb-SunplusIT_Inc_Integrated_Camera_01.00.00-video-index1 -> ../../video17
```

## 双臂只读状态

只读启动命令：

```bash
source /opt/ros/humble/setup.bash
source /home/gwh/dual-arm/install/setup.bash
export ROS_DOMAIN_ID=0
export ROS2CLI_ENABLE_DAEMON=0
ros2 launch robo_ctrl robo_ctrl_L.launch.py robot_ip:=192.168.58.2 robot_port:=8080 state_query_interval:=0.2 start_high_level:=false start_gripper:=false
ros2 launch robo_ctrl robo_ctrl_R.launch.py robot_ip:=192.168.58.3 robot_port:=8080 state_query_interval:=0.2 start_high_level:=false
```

运行节点：

```text
/L_robo_ctrl
/R_robo_ctrl
```

左臂 `/L/robot_state`：

```yaml
joint_position:
  j1: -54.75346755981445
  j2: -120.78412628173828
  j3: 113.828369140625
  j4: -118.202880859375
  j5: -89.7972412109375
  j6: -90.71922302246094
tcp_pose:
  x: -219.7288055419922
  y: 133.58868408203125
  z: 386.5935363769531
  rx: 179.69618225097656
  ry: -35.15800857543945
  rz: 126.12625122070312
motion_done: true
error_code: 0
```

右臂 `/R/robot_state`：

```yaml
joint_position:
  j1: -104.69970703125
  j2: -81.35017395019531
  j3: -71.13701629638672
  j4: -264.6947937011719
  j5: -74.61979675292969
  j6: -56.568931579589844
tcp_pose:
  x: -159.15162658691406
  y: -100.17669677734375
  z: 391.3714294433594
  rx: 172.0904541015625
  ry: 35.106746673583984
  rz: 34.80940246582031
motion_done: true
error_code: 0
```

频率：

- `/L/robot_state`：约 `4.996 Hz`
- `/R/robot_state`：约 `4.996 Hz`

启动日志关键行：

- 左臂：`成功连接到机器人`，`机器人状态监控线程已启动，查询间隔: 0.20秒`
- 右臂：`成功连接到机器人`，`机器人状态监控线程已启动，查询间隔: 0.20秒`

清理后复查：`ROS_DOMAIN_ID=0` node list 为空；关键进程检查只匹配检查命令本身。

## 采样工具

新增 no-motion 工具：

- `packages/tools/tools/scripts/cap_depth_alignment_probe.py`

功能：

- `capture`：采 RGB、Z16 raw、深度可视化、相机内参和 metadata。
- `analyze`：在同一份 raw depth 上用人工/视觉确认的 RGB 像素点计算 ROI 深度和相机坐标。

验证：

- `/usr/bin/python3 -m py_compile packages/tools/tools/scripts/cap_depth_alignment_probe.py`：通过
- 动作端点扫描：`/L|R/robot_move`、`/L|R/robot_servo`、`epg50_gripper/command`、`/competition/run` 无命中
- `git diff --check -- packages/tools/tools/scripts/cap_depth_alignment_probe.py packages/tools/tools/CMakeLists.txt`：通过
- `colcon build --base-paths packages --packages-select tools`：`1 package finished`

## 双相机瓶盖采样

左相机采样命令：

```bash
/usr/bin/python3 packages/tools/tools/scripts/cap_depth_alignment_probe.py capture \
  --label cap_p1 \
  --side left \
  --color-device /dev/video6 \
  --depth-device /dev/video0 \
  --output-dir .codex/tmp/runtime/dual-arm-cap-alignment-20260508-left \
  --depth-scale-mm-per-raw 1.0
```

左相机 capture：

- RGB：`/dev/video6`，`opencv_v4l2_mjpg`，`640x480`，`frames_read=5`
- Depth：`/dev/video0`，`native_v4l2_mmap`，`640x480`，`pixelformat=Z16`，`bytesused=614400`
- Artifacts：
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-left/cap_p1_left_color.jpg`
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-left/cap_p1_left_depth_raw.npy`
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-left/cap_p1_left_depth_raw_vis.jpg`
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-left/cap_p1_left_capture.json`

右相机采样命令：

```bash
/usr/bin/python3 packages/tools/tools/scripts/cap_depth_alignment_probe.py capture \
  --label cap_p1 \
  --side right \
  --color-device /dev/video14 \
  --depth-device /dev/video8 \
  --output-dir .codex/tmp/runtime/dual-arm-cap-alignment-20260508-right \
  --depth-scale-mm-per-raw 1.0
```

右相机 capture：

- RGB：`/dev/video14`，`opencv_v4l2_mjpg`，`640x480`，`frames_read=5`
- Depth：`/dev/video8`，`native_v4l2_mmap`，`640x480`，`pixelformat=Z16`，`bytesused=614400`
- Artifacts：
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-right/cap_p1_right_color.jpg`
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-right/cap_p1_right_depth_raw.npy`
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-right/cap_p1_right_depth_raw_vis.jpg`
  - `.codex/tmp/runtime/dual-arm-cap-alignment-20260508-right/cap_p1_right_capture.json`

两侧内参均使用 `packages/tools/tools/scripts/camera_matrix.json` 从 `1280x720` 缩放到 `640x480`：

```json
{"fx": 345.0026550292969, "fy": 459.8217366536458, "cx": 318.4267578125, "cy": 239.95914713541666}
```

## 瓶盖像素与深度结果

左相机瓶盖像素点：

- 红色阈值辅助质心：`(377.7036, 226.8881)`
- 使用像素：`(377.70, 226.89)`
- ROI：`[370, 219, 387, 236]`，半径 `8 px`
- 有效深度像素：`289`
- raw median：`440.0`
- depth median：`0.440 m`
- camera point：`[0.07559427784776125, -0.012505769695517375, 0.44] m`
- Overlay：`.codex/tmp/runtime/dual-arm-cap-alignment-20260508-left/cap_p1_left_cap_pixel_overlay.jpg`
- JSON：`.codex/tmp/runtime/dual-arm-cap-alignment-20260508-left/cap_p1_left_cap_depth_analysis.json`

右相机瓶盖像素点：

- 红色阈值辅助质心：`(357.9588, 219.7494)`
- 使用像素：`(357.96, 219.75)`
- ROI：`[350, 212, 367, 229]`，半径 `8 px`
- 有效深度像素：`289`
- raw median：`459.0`
- depth median：`0.459 m`
- camera point：`[0.05259599571058835, -0.02017303184199676, 0.459] m`
- Overlay：`.codex/tmp/runtime/dual-arm-cap-alignment-20260508-right/cap_p1_right_cap_pixel_overlay.jpg`
- JSON：`.codex/tmp/runtime/dual-arm-cap-alignment-20260508-right/cap_p1_right_cap_depth_analysis.json`

## 当前判断

- 双臂控制器连接和只读状态链路通过。
- 左右 Orbbec RGB/Z16 单独采样均通过。
- 单点瓶盖 RGB 像素到深度 ROI 和相机坐标反投影均通过。
- 当前只有 `cap_p1` 一个共同物理点，不能求完整 6DoF 双相机/双臂坐标变换。
- 后续需要采 `cap_p2`、`cap_p3`、`cap_p4`，并尽量让 4 个点非共线、分布在桌面不同区域；建议额外采 `cap_p5` 作为独立验证点。

## 收口检查

- `ROS_DOMAIN_ID=0 ROS2CLI_ENABLE_DAEMON=0 ros2 node list`：空
- 关键进程检查只匹配检查命令本身，无 `robo_ctrl`、MoveIt、planner、相机采样脚本残留
- 未执行真实运动、未控制夹爪、未调用 `/competition/run`

## 2026-05-08 cap_p2 追加采样

用户移动瓶盖后继续采样 `cap_p2`。采样前检查：

- 关键进程检查只匹配检查命令本身，无有效残留。
- `ROS_DOMAIN_ID=0 ROS2CLI_ENABLE_DAEMON=0 ros2 node list` 为空。
- `enp5s0` 仍为 `UP 192.168.58.10/24`。
- Orbbec by-id 设备映射仍存在。

左相机采样命令：

```bash
/usr/bin/python3 packages/tools/tools/scripts/cap_depth_alignment_probe.py capture \
  --label cap_p2 \
  --side left \
  --color-device /dev/video6 \
  --depth-device /dev/video0 \
  --output-dir .codex/tmp/runtime/dual-arm-cap-alignment-20260508-left-p2 \
  --depth-scale-mm-per-raw 1.0
```

右相机采样命令：

```bash
/usr/bin/python3 packages/tools/tools/scripts/cap_depth_alignment_probe.py capture \
  --label cap_p2 \
  --side right \
  --color-device /dev/video14 \
  --depth-device /dev/video8 \
  --output-dir .codex/tmp/runtime/dual-arm-cap-alignment-20260508-right-p2 \
  --depth-scale-mm-per-raw 1.0
```

采样结果：

- 左 RGB：`.codex/tmp/runtime/dual-arm-cap-alignment-20260508-left-p2/cap_p2_left_color.jpg`
- 左 depth raw：`.codex/tmp/runtime/dual-arm-cap-alignment-20260508-left-p2/cap_p2_left_depth_raw.npy`
- 左 depth 可视化：`.codex/tmp/runtime/dual-arm-cap-alignment-20260508-left-p2/cap_p2_left_depth_raw_vis.jpg`
- 左 capture JSON：`.codex/tmp/runtime/dual-arm-cap-alignment-20260508-left-p2/cap_p2_left_capture.json`
- 右 RGB：`.codex/tmp/runtime/dual-arm-cap-alignment-20260508-right-p2/cap_p2_right_color.jpg`
- 右 depth raw：`.codex/tmp/runtime/dual-arm-cap-alignment-20260508-right-p2/cap_p2_right_depth_raw.npy`
- 右 depth 可视化：`.codex/tmp/runtime/dual-arm-cap-alignment-20260508-right-p2/cap_p2_right_depth_raw_vis.jpg`
- 右 capture JSON：`.codex/tmp/runtime/dual-arm-cap-alignment-20260508-right-p2/cap_p2_right_capture.json`

瓶盖像素与深度结果：

- 左相机红色阈值辅助质心：`(243.4229, 174.5898)`
- 左使用像素：`(243.42, 174.59)`
- 左 ROI：`[235, 167, 252, 184]`，半径 `8 px`
- 左有效深度像素：`289`
- 左 raw median：`410.0`
- 左 depth median：`0.410 m`
- 左 camera point：`[-0.08913777982524089, -0.05828639272377104, 0.41] m`
- 左 overlay：`.codex/tmp/runtime/dual-arm-cap-alignment-20260508-left-p2/cap_p2_left_cap_pixel_overlay.jpg`
- 左 analysis JSON：`.codex/tmp/runtime/dual-arm-cap-alignment-20260508-left-p2/cap_p2_left_cap_depth_analysis.json`

- 右相机红色阈值辅助质心：`(257.5771, 308.3511)`
- 右使用像素：`(257.58, 308.35)`
- 右 ROI：`[250, 300, 267, 317]`，半径 `8 px`
- 右有效深度像素：`289`
- 右 raw median：`412.0`
- 右 depth median：`0.412 m`
- 右 camera point：`[-0.07266281535317812, 0.06127816311004952, 0.412] m`
- 右 overlay：`.codex/tmp/runtime/dual-arm-cap-alignment-20260508-right-p2/cap_p2_right_cap_pixel_overlay.jpg`
- 右 analysis JSON：`.codex/tmp/runtime/dual-arm-cap-alignment-20260508-right-p2/cap_p2_right_cap_depth_analysis.json`

当前共同点累计：

- `cap_p1`
- `cap_p2`

仍不足以求完整 6DoF 坐标变换；还需要至少 `cap_p3`、`cap_p4` 两个非共线位置，建议再采 `cap_p5` 做独立验证。

## 2026-05-08 cap_p3 追加采样

用户再次移动瓶盖后继续采样 `cap_p3`。采样前检查：

- 关键进程检查只匹配检查命令本身，无有效残留。
- `ROS_DOMAIN_ID=0 ROS2CLI_ENABLE_DAEMON=0 ros2 node list` 为空。
- `enp5s0` 仍为 `UP 192.168.58.10/24`。
- Orbbec by-id 设备映射仍存在。

左相机采样命令：

```bash
/usr/bin/python3 packages/tools/tools/scripts/cap_depth_alignment_probe.py capture \
  --label cap_p3 \
  --side left \
  --color-device /dev/video6 \
  --depth-device /dev/video0 \
  --output-dir .codex/tmp/runtime/dual-arm-cap-alignment-20260508-left-p3 \
  --depth-scale-mm-per-raw 1.0
```

右相机采样命令：

```bash
/usr/bin/python3 packages/tools/tools/scripts/cap_depth_alignment_probe.py capture \
  --label cap_p3 \
  --side right \
  --color-device /dev/video14 \
  --depth-device /dev/video8 \
  --output-dir .codex/tmp/runtime/dual-arm-cap-alignment-20260508-right-p3 \
  --depth-scale-mm-per-raw 1.0
```

瓶盖像素与深度结果：

- 左相机红色阈值辅助质心：`(354.0732, 234.1864)`
- 左使用像素：`(354.07, 234.19)`
- 左 ROI：`[346, 226, 363, 243]`，半径 `8 px`
- 左有效深度像素：`289`
- 左 raw median：`443.0`
- 左 depth median：`0.443 m`
- 左 camera point：`[0.045767637027957504, -0.005558093446362343, 0.443] m`
- 左 overlay：`.codex/tmp/runtime/dual-arm-cap-alignment-20260508-left-p3/cap_p3_left_cap_pixel_overlay.jpg`
- 左 analysis JSON：`.codex/tmp/runtime/dual-arm-cap-alignment-20260508-left-p3/cap_p3_left_cap_depth_analysis.json`

- 右相机红色阈值辅助质心：`(358.9236, 238.3029)`
- 右使用像素：`(358.92, 238.30)`
- 右 ROI：`[351, 230, 368, 247]`，半径 `8 px`
- 右有效深度像素：`287`
- 右 raw median：`443.0`
- 右 depth median：`0.443 m`
- 右 camera point：`[0.05199527026114975, -0.001598450274096555, 0.443] m`
- 右 overlay：`.codex/tmp/runtime/dual-arm-cap-alignment-20260508-right-p3/cap_p3_right_cap_pixel_overlay.jpg`
- 右 analysis JSON：`.codex/tmp/runtime/dual-arm-cap-alignment-20260508-right-p3/cap_p3_right_cap_depth_analysis.json`

当前共同点累计：

- `cap_p1`
- `cap_p2`
- `cap_p3`

仍不足以求完整 6DoF 坐标变换；还需要至少 `cap_p4` 一个非共线位置，建议再采 `cap_p5` 做独立验证。

## 2026-05-08 cap_p4 追加采样与候选变换

用户再次移动瓶盖后继续采样 `cap_p4`。采样前检查：

- 关键进程检查只匹配检查命令本身，无有效残留。
- `ROS_DOMAIN_ID=0 ROS2CLI_ENABLE_DAEMON=0 ros2 node list` 为空。
- `enp5s0` 仍为 `UP 192.168.58.10/24`。
- Orbbec by-id 设备映射仍存在。

左相机采样命令：

```bash
/usr/bin/python3 packages/tools/tools/scripts/cap_depth_alignment_probe.py capture \
  --label cap_p4 \
  --side left \
  --color-device /dev/video6 \
  --depth-device /dev/video0 \
  --output-dir .codex/tmp/runtime/dual-arm-cap-alignment-20260508-left-p4 \
  --depth-scale-mm-per-raw 1.0
```

右相机采样命令：

```bash
/usr/bin/python3 packages/tools/tools/scripts/cap_depth_alignment_probe.py capture \
  --label cap_p4 \
  --side right \
  --color-device /dev/video14 \
  --depth-device /dev/video8 \
  --output-dir .codex/tmp/runtime/dual-arm-cap-alignment-20260508-right-p4 \
  --depth-scale-mm-per-raw 1.0
```

瓶盖像素与深度结果：

- 左相机红色阈值辅助质心：`(327.3650, 149.7700)`
- 左使用像素：`(327.36, 149.77)`
- 左 ROI：`[319, 142, 336, 159]`，半径 `8 px`
- 左有效深度像素：`289`
- 左 raw median：`394.0`
- 左 depth median：`0.394 m`
- 左 camera point：`[0.010201943001210006, -0.07727891297605192, 0.394] m`
- 左 overlay：`.codex/tmp/runtime/dual-arm-cap-alignment-20260508-left-p4/cap_p4_left_cap_pixel_overlay.jpg`
- 左 analysis JSON：`.codex/tmp/runtime/dual-arm-cap-alignment-20260508-left-p4/cap_p4_left_cap_depth_analysis.json`

- 右相机红色阈值辅助质心：`(267.7581, 241.5379)`
- 右使用像素：`(267.76, 241.54)`
- 右 ROI：`[260, 234, 277, 251]`，半径 `8 px`
- 右有效深度像素：`289`
- 右 raw median：`464.0`
- 右 depth median：`0.464 m`
- 右 camera point：`[-0.06814259334614002, 0.0015952176043369122, 0.464] m`
- 右 overlay：`.codex/tmp/runtime/dual-arm-cap-alignment-20260508-right-p4/cap_p4_right_cap_pixel_overlay.jpg`
- 右 analysis JSON：`.codex/tmp/runtime/dual-arm-cap-alignment-20260508-right-p4/cap_p4_right_cap_depth_analysis.json`

### 四点候选刚体变换

使用 `cap_p1` 到 `cap_p4` 计算右相机坐标到左相机坐标的候选刚体变换。输出：

- JSON：`.codex/tmp/runtime/dual-arm-cap-alignment-20260508-transform-candidate.json`
- 状态：`candidate_not_verified`
- 旋转矩阵：

```text
[[0.534029206559551, -0.6739172721427452, 0.5105372825260235],
 [0.6015590520899972, -0.12144107221183456, -0.7895433951523019],
 [0.5940871260934375, 0.7287575565904759, 0.34054795598023957]]
```

- 平移：`[-0.20456763024732214, 0.319238847936566, 0.26826669276259446] m`
- RMSE：`0.013743641801937052 m`
- 最大误差：`0.020158936494991057 m`
- 各点误差：
  - `cap_p1`: `0.005496623553764354 m`
  - `cap_p2`: `0.014850533373018015 m`
  - `cap_p3`: `0.00992052555844724 m`
  - `cap_p4`: `0.020158936494991057 m`
- 左侧点集奇异值：`[0.13423929769570433, 0.05230009601046076, 0.0014842602759392298] m`

判断：这 4 个点几乎共面，第三奇异值只有约 `1.48 mm`；候选变换可作为诊断结果，但不能标记 `verified`。建议再采 `cap_p5` 作为独立验证点，并尽量放到与前 4 点分布不同的位置。

## 2026-05-08 cap_p5 独立验证采样

用户再次移动瓶盖后继续采样 `cap_p5`，本点用于验证 `cap_p1..cap_p4` 的候选变换。采样前检查：

- 关键进程检查只匹配检查命令本身，无有效残留。
- `ROS_DOMAIN_ID=0 ROS2CLI_ENABLE_DAEMON=0 ros2 node list` 为空。
- `enp5s0` 仍为 `UP 192.168.58.10/24`。
- Orbbec by-id 设备映射仍存在。

现场图像观察：`cap_p5` 瓶盖旁有一条浅色长条参照物，可能影响局部深度 ROI。

左相机采样命令：

```bash
/usr/bin/python3 packages/tools/tools/scripts/cap_depth_alignment_probe.py capture \
  --label cap_p5 \
  --side left \
  --color-device /dev/video6 \
  --depth-device /dev/video0 \
  --output-dir .codex/tmp/runtime/dual-arm-cap-alignment-20260508-left-p5 \
  --depth-scale-mm-per-raw 1.0
```

右相机采样命令：

```bash
/usr/bin/python3 packages/tools/tools/scripts/cap_depth_alignment_probe.py capture \
  --label cap_p5 \
  --side right \
  --color-device /dev/video14 \
  --depth-device /dev/video8 \
  --output-dir .codex/tmp/runtime/dual-arm-cap-alignment-20260508-right-p5 \
  --depth-scale-mm-per-raw 1.0
```

瓶盖像素与深度结果：

- 左相机红色阈值辅助质心：`(265.6490, 226.2365)`
- 左使用像素：`(265.65, 226.24)`
- 左 ROI：`[258, 218, 275, 235]`，半径 `8 px`
- 左有效深度像素：`143`
- 左 raw median：`372.0`
- 左 depth median：`0.372 m`
- 左 camera point：`[-0.05690667483293084, -0.011098915791836845, 0.372] m`
- 左 overlay：`.codex/tmp/runtime/dual-arm-cap-alignment-20260508-left-p5/cap_p5_left_cap_pixel_overlay.jpg`
- 左 analysis JSON：`.codex/tmp/runtime/dual-arm-cap-alignment-20260508-left-p5/cap_p5_left_cap_depth_analysis.json`

- 右相机红色阈值辅助质心：`(269.0914, 255.8325)`
- 右使用像素：`(269.09, 255.83)`
- 右 ROI：`[261, 248, 278, 265]`，半径 `8 px`
- 右有效深度像素：`185`
- 右 raw median：`455.0`
- 右 depth median：`0.455 m`
- 右 camera point：`[-0.06506681753733536, 0.015704429516399138, 0.455] m`
- 右 overlay：`.codex/tmp/runtime/dual-arm-cap-alignment-20260508-right-p5/cap_p5_right_cap_pixel_overlay.jpg`
- 右 analysis JSON：`.codex/tmp/runtime/dual-arm-cap-alignment-20260508-right-p5/cap_p5_right_cap_depth_analysis.json`

### cap_p5 独立验证

使用 `cap_p1..cap_p4` 的候选右相机到左相机变换，预测 `cap_p5` 的左相机点：

- 验证 JSON：`.codex/tmp/runtime/dual-arm-cap-alignment-20260508-cap-p5-validation.json`
- 状态：`candidate_validation_failed_high_error`
- 左相机实测点：`[-0.05690667483293084, -0.011098915791836845, 0.372] m`
- 右相机实测点：`[-0.06506681753733536, 0.015704429516399138, 0.455] m`
- 由右点预测的左相机点：`[-0.01760423394104943, -0.08105209269695035, 0.3960053757808202] m`
- 误差向量：`[0.03930244089188141, -0.0699531769051135, 0.024005375780820182] m`
- 误差范数：`0.08375193660779627 m`

判断：独立验证误差约 `83.8 mm`，候选变换不能通过验证，不能标记 `verified`。同时 `cap_p5` 左 ROI 有效像素少于前序样本，且 raw min 存在离群值，结合图像中浅色长条参照物，存在局部混合深度风险。建议后续重新采一个没有贴近其他物体的 `cap_p5_repeat`，或继续采更多无干扰点后再拟合。

## 2026-05-08 重标记与重拟合结论

用户提醒瓶盖存在高度后，对 `cap_p1..cap_p5` 重新审查、重标记并重算。输出：

- JSON：`.codex/tmp/runtime/dual-arm-cap-alignment-20260508-refit-with-labels.json`

### 目标点解释

当前图像/深度标的是瓶盖顶部中心 `cap_top_center`，而不是桌面接触点。对相机到相机的刚体变换，瓶盖高度不需要额外扣除：同一个物理“瓶盖顶部中心”在左右相机坐标系之间仍应满足刚体变换。

瓶盖高度只在后续要把点换算成“桌面接触点/桌面平面坐标”时才需要处理；那一步必须知道桌面法向和瓶盖实测高度，当前数据不足以可靠扣除。

### 重标记

- `cap_p1`: `fit_inlier_cap_top_center`
- `cap_p2`: `fit_inlier_cap_top_center`
- `cap_p3`: `fit_inlier_cap_top_center`
- `cap_p4`: `weak_fit_inlier_highest_residual_depth_disagreement`
- `cap_p5`: `rejected_validation_outlier_possible_mixed_depth_near_light_strip`

重标记依据：

- `cap_p5` 左 ROI 有效像素只有 `143`，低于前序样本，且 `raw_min=187`、`raw_median=372`，存在明显混合深度风险。
- `cap_p4` 与 `cap_p5` 在右相机坐标中的距离约 `17 mm`，但在左相机坐标中约 `96.8 mm`，两者差约 `79.8 mm`；刚体变换不可能解释这种距离不一致，说明至少一个观测不是同一个物理点的稳定对应。

### 重拟合结果

选择 `cap_p1..cap_p4` 作为候选拟合，排除 `cap_p5`：

- 状态：`candidate_not_verified`
- RMSE：`0.013743641801937052 m`
- 最大误差：`0.020158936494991057 m`
- 平均误差：`0.012606654745055165 m`
- 各点误差：
  - `cap_p1`: `0.005496623553764354 m`
  - `cap_p2`: `0.014850533373018015 m`
  - `cap_p3`: `0.00992052555844724 m`
  - `cap_p4`: `0.020158936494991057 m`
- 左点集奇异值：`[0.13423929769570433, 0.05230009601046076, 0.0014842602759392298] m`

候选右相机到左相机变换与前一版一致：

```text
R =
[[0.534029206559551, -0.6739172721427452, 0.5105372825260235],
 [0.6015590520899972, -0.12144107221183456, -0.7895433951523019],
 [0.5940871260934375, 0.7287575565904759, 0.34054795598023957]]

t = [-0.20456763024732214, 0.319238847936566, 0.26826669276259446] m
```

把 5 个点全部纳入拟合会变差：

- 全 5 点 RMSE：`0.032323621425543944 m`
- 全 5 点最大误差：`0.052388501853189814 m`
- 全 5 点中 `cap_p5` 误差：`0.052388501853189814 m`

结论：当前最合理的结果是保留 `cap_p1..cap_p4` 的候选变换，明确排除 `cap_p5`，并保持 `candidate_not_verified`。要获得更可靠结果，需要重新采一个无干扰的 `cap_p5_repeat` 或采更多分布更好的点；在独立验证通过前，不得用于双臂协作或声明坐标系 verified。

## 2026-05-08 camera+TCP 推导双臂变换并对比指尖接触候选

用户要求使用 camera 和 TCP 的坐标变换推导两个机械臂坐标变换，并与此前夹爪点桌子的候选变换对比。输出：

- JSON：`.codex/tmp/runtime/dual-arm-camera-tcp-vs-contact-transform-compare-20260508.json`

### 计算链路

已知候选相机变换：

```text
p_left_camera = R_lcam_rcam * p_right_camera + t_lcam_rcam
```

使用 `cap_p1..cap_p4` 重拟合结果，排除 `cap_p5`。

使用 `packages/tools/tools/config/static_transforms.yaml` 中的 `Ltcp -> camera_link`，并按此前用户确认临时复用到右臂：

```text
T_tcp_camera: translation = [-0.01, -0.09, 0.056] m, rotation = I
```

先求当前 TCP 间候选变换：

```text
T_left_tcp_right_tcp =
  T_left_tcp_left_camera *
  T_left_camera_right_camera *
  inverse(T_right_tcp_right_camera)
```

得到：

```text
right_tcp -> left_tcp translation =
[-298.46998049603104, 268.53917208692974, 376.7250585817782] mm

right_tcp -> left_tcp rpy =
[64.95334481958047, -36.44758271443989, 48.40319116736956] deg
```

若进一步推到 base 坐标，需要采样时两臂 `base -> TCP`。本轮使用 2026-05-08 只读连接检测采到的 TCP 位姿作为候选：

- 左 TCP：`[-219.7288055419922, 133.58868408203125, 386.5935363769531, 179.69618225097656, -35.15800857543945, 126.12625122070312] mm/deg`
- 右 TCP：`[-159.15162658691406, -100.17669677734375, 391.3714294433594, 172.0904541015625, 35.106746673583984, 34.80940246582031] mm/deg`

注意：这些 robot_state 不是每个 cap 采样瞬间同步记录，只能用于诊断候选。

推导得到 camera+TCP 路径的候选：

```text
right_base -> left_base translation =
[-184.04035091766494, 653.8467548325326, -135.69123552424594] mm

right_base -> left_base rpy =
[91.68586945167928, 48.00613019627576, 53.48133175750341] deg
```

### 历史夹爪点桌子候选

历史 4 点 `Lend/Rend` 指尖接触候选来自 `docs/operations/reports/2026-05-06-real-hardware-debug-log.md`：

```text
right_base -> left_base translation =
[-143.040, 871.374, -9.201] mm

right_base -> left_base rpy =
[3.358771, -0.273581, 21.311430] deg

RMS residual = 18.459 mm
max residual = 21.547 mm
```

### 对比

camera+TCP 候选减去指尖接触候选：

```text
translation delta =
[-41.00035091766493, -217.52724516746736, -126.49023552424593] mm

translation delta norm =
254.94883966886044 mm

rotation delta angle =
90.0018314603906 deg
```

### 结论

两套候选结果差异远超各自内部残差，不能互相验证，也不能合并成 verified 结果。主要原因：

1. camera+TCP 路径依赖未同步的 `base->TCP` 状态；采 cap 点时没有同步记录左右 `/robot_state`。
2. camera+TCP 路径复用了 `Ltcp -> camera_link` 到右臂，仍是 operator-confirmed candidate，不是 hand-eye verified。
3. cap 点深度和内参仍有 `raw=mm`、RGB/depth 对齐、共面点集和 `cap_p5` 混深度风险。
4. 指尖接触路径依赖 `Lend/Rend` 候选指尖偏移，且历史接触点可能存在指尖角、滑动、压缩和同物理点确认误差。

当前可保留两个候选：

- camera+TCP 候选：适合作为相机链路诊断。
- 指尖接触候选：适合作为桌面接触/基座关系初值。

二者都不能标记 `verified`，也不能用于双臂协作安全保证。
