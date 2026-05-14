# 2026-05-09 左右 RGB 检测可视化记录

## 结论
- 已打开左右相机 RGB 检测可视化。
- 当前只运行 RGB bridge、detector 和 overlay viewer。
- 未启动 `robo_ctrl`、MoveIt、planner、`planning_scene_sync` 或 `execution_adapter`。
- 未发送任何机械臂运动命令或夹爪命令。

## 运行节点
- `/left_rgb_bridge`
- `/right_rgb_bridge`
- `/detector_left_rgb`
- `/detector_right_rgb`
- `/left_rgb_detection_viewer`
- `/right_rgb_detection_viewer`

## 话题
- 左 RGB：`/left_camera/color/image_raw`
- 右 RGB：`/right_camera/color/image_raw`
- 左检测：`/detector/left_rgb/detections`
- 右检测：`/detector/right_rgb/detections`
- 左 overlay：`/detector/left_rgb/detections/image`
- 右 overlay：`/detector/right_rgb/detections/image`

## 验证
- 左 RGB 频率约 `15 Hz`。
- 右 RGB 频率约 `15 Hz`。
- 左 overlay 频率约 `15 Hz`。
- 右 overlay 频率约 `15 Hz`。
- 左检测当前看到 `cocacola`：
  - `class_id=2`
  - score 约 `0.828`
  - bbox center 约 `[339.70, 219.96]`
  - bbox size 约 `[67.00, 107.53]`
- 右检测当前为空：`results=[]`。

## 日志目录
- `.codex/tmp/runtime/dual-rgb-detection-view-20260509/`

## 追加变更：右相机拆除
- 用户说明右相机已拆除。
- 已停止右侧 pipeline：
  - `/right_rgb_bridge`
  - `/detector_right_rgb`
  - `/right_rgb_detection_viewer`
- ROS 图刷新后仅保留左侧视觉：
  - `/left_rgb_bridge`
  - `/detector_left_rgb`
  - `/left_rgb_detection_viewer`
- 左 RGB 仍约 `15 Hz`。
- 左检测当前仍看到 `cocacola`，score 约 `0.862`。
- 后续不得把 `/right_camera/*` 或 `/detector/right_rgb/*` 作为可用现场输入，除非右相机重新安装并完成连通性检查。

## 2026-05-09 重新拉起左 RGB 检测可视化

- 用户要求重新拉起 RGB 检测可视化脚本。
- 现场仍按右相机已拆除处理；本次只重启左侧 RGB 检测可视化，不启动右侧 pipeline。
- 发现旧左侧 bridge 仍指向 `/dev/video6`，但当前 Orbbec 设备枚举已漂移；`/dev/video6` 不存在。
- 用 `/usr/bin/python3` + OpenCV 只读探测当前可用视频口，确认 `/dev/video7` 可读 `640x480` 彩色帧。
- 已停止旧左侧视觉进程：
  - `/left_rgb_bridge`
  - `/detector_left_rgb`
  - `/left_rgb_detection_viewer`
- 已重新启动左侧 pipeline：
  - `/left_rgb_bridge`：`color_device=/dev/video7`，`/left_camera/color/image_raw`
  - `/detector_left_rgb`：输入 `/left_camera/color/image_raw`，输出 `/detector/left_rgb/detections`
  - `/left_rgb_detection_viewer`：显示 `/detector/left_rgb/detections/image`
- 验证：
  - `ROS_DOMAIN_ID=0 ros2 node list` 可见 `/left_rgb_bridge`、`/detector_left_rgb`、`/left_rgb_detection_viewer`。
  - `/left_camera/color/image_raw` 约 `15 Hz`。
  - `/detector/left_rgb/detections/image` 约 `15 Hz`。
  - `/detector/left_rgb/detections` 当前可读，但本次采样 `results=[]`，说明当前画面里暂时没有稳定检测到目标。
- 日志目录：
  - `.codex/tmp/runtime/left-rgb-detection-restart-20260509/`
- 安全边界：
  - 本次未启动 `robo_ctrl`、MoveIt、planner 或 `planning_scene_sync`。
  - 本次未发送机械臂运动命令或夹爪命令。
  - `/dev/video7` 是本轮现场可读设备口；长期脚本仍应优先用 by-id/by-path/serial，避免下次设备号漂移。

## 2026-05-09 左 RGB 画面倒置修正

- 用户反馈重新拉起后的 RGB 检测可视化画面是倒置的。
- 确认当时 `/left_rgb_bridge` 启动参数为 `rotate_180:=false`。
- 已只重启左侧视觉 pipeline，并将 `/left_rgb_bridge` 改为：
  - `color_device=/dev/video7`
  - `rotate_180:=true`
  - `color_topic=/left_camera/color/image_raw`
- 已重新启动：
  - `/left_rgb_bridge`
  - `/detector_left_rgb`
  - `/left_rgb_detection_viewer`
- 验证：
  - `ROS_DOMAIN_ID=0 ros2 node list` 可见 `/left_rgb_bridge`、`/detector_left_rgb`、`/left_rgb_detection_viewer`。
  - `/detector/left_rgb/detections/image` 约 `15 Hz`。
  - 进程列表确认 `/left_rgb_bridge` 当前参数包含 `-p rotate_180:=true`。
- 日志目录：
  - `.codex/tmp/runtime/left-rgb-detection-rotate180-20260509/`
- 安全边界：
  - 本次只改图像方向和重启左侧视觉链路。
  - 未启动右相机 pipeline。
  - 未启动 `robo_ctrl`、MoveIt、planner、`planning_scene_sync`，没有发送机械臂运动或夹爪命令。

## 2026-05-09 22:29 左 RGB 识别窗口命令修正

- 用户按 Obsidian 终端 D 命令启动 RGB 识别窗口时，`left_rgb_bridge` 报错：
  - `RuntimeError: 无法打开 Orbbec 彩色设备: /dev/video7`
- 根因：
  - 当前 `/dev/video7` 存在，但 `ID_V4L_CAPABILITIES` 为空，不是可采集口。
  - 当前可采集的 Orbbec 彩色口是 `/dev/video6`。
  - shell 中 bridge 以后台进程启动，后台进程失败不会触发 `set -e` 停止后续命令，因此 detector 和 viewer 继续启动但没有输入图像，表现为“没有显示彩色窗口”。
- 现场只读探测：
  - `/dev/video6 opened=True read=True shape=(480, 640, 3) fourcc='YUYV'`
  - `/dev/video7 opened=False read=False`
- 无窗口 smoke 验证：
  - 目录：`.codex/tmp/runtime/left-rgb-detection-video6-smoke-20260509-222943/`
  - `/left_camera/color/image_raw`：约 `15 Hz`
  - `/detector/left_rgb/detections/image`：约 `15 Hz`
  - bridge 日志确认：`color=/dev/video6`、`rotate_180=True`、`depth_backend=disabled`
- 已更新 Obsidian：
  - `/home/gwh/文档/Obsidian Vault/03_项目记录/FairinoDualArm/DualArm_可乐拧瓶盖完整实机流程指令_2026-05-09.md`
  - 终端 D 改为默认 `COLOR_DEVICE=/dev/video6`
  - 增加 `/left_camera/color/image_raw` 和 `/detector/left_rgb/detections/image` 到达检查；bridge 没起来时不再继续启动 detector/viewer。
- 安全边界：
  - 本次只做 RGB bridge/detector/topic smoke。
  - 未启动右相机 pipeline。
  - 未启动 `robo_ctrl`、MoveIt、planner、`planning_scene_sync`，没有发送机械臂运动或夹爪命令。
