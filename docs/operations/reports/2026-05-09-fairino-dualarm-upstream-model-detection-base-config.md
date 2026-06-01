# 2026-05-09 FairinoDualArm 上游项目接入当前模型与基座配置

## 结论

已把 `https://github.com/HDU-PHOENIX/FairinoDualArm.git` 浅克隆到 `/home/gwh/FairinoDualArm`，并以该仓库作为后续主项目代码。当前已接入 `dual-arm` 里的 YOLOv8 PT 模型检测链路，并把 `robo_ctrl` 中硬编码的双臂基座 TF 改为 launch 参数。基座默认值全部是未标定占位 `0`，不沿用 `/home/gwh/dual-arm` 的历史坐标，等待现场测量后填入。

## 已改动的 FairinoDualArm 路径

- `/home/gwh/FairinoDualArm/detector/`：新增 PT 推理节点、PT launch、`best.pt/last.pt` 权重；旧 C++ TensorRT runtime 改为显式开启。
- `/home/gwh/FairinoDualArm/depth_handler/`：补齐 `depth_processor.launch.py`，增加 `target_frame`、`source_frame` 参数。
- `/home/gwh/FairinoDualArm/robo_ctrl/`：`world/reference_frame -> {L,R}robot_base` 改成参数；移除左臂 launch import 时自动 `sudo chmod /dev/ttyACM0` 的副作用。
- `/home/gwh/FairinoDualArm/tools/`：`src/opencv_test.cpp` 不存在时跳过 `opencv_test` 测试程序，避免 `tools` 构建失败。
- `/home/gwh/FairinoDualArm/docs/base-frame-config.md`：新增现场测量填参说明。

## 模型与类别

- 当前模型：`/home/gwh/FairinoDualArm/detector/models/yolov8/yolo_runs/final_dataset_v1/weights/best.pt`
- `best.pt` SHA256：`2f29b1441d4e9c0da4132b5d3fa2a2ef3d31d9cdcf5ad73da616f0b825d20666`
- 模型类别：`0 basket`、`1 basketball`、`2 cocacola`、`3 cup`、`4 football`、`5 yibao`

## 基座配置入口

```bash
ros2 launch robo_ctrl robo_ctrl_L.launch.py \
  base_x_m:=<measured_x> base_y_m:=<measured_y> base_z_m:=<measured_z> \
  base_roll_deg:=<measured_roll> base_pitch_deg:=<measured_pitch> base_yaw_deg:=<measured_yaw>

ros2 launch robo_ctrl robo_ctrl_R.launch.py \
  base_x_m:=<measured_x> base_y_m:=<measured_y> base_z_m:=<measured_z> \
  base_roll_deg:=<measured_roll> base_pitch_deg:=<measured_pitch> base_yaw_deg:=<measured_yaw>
```

## 验证证据

- `/usr/bin/python3 -m py_compile` 覆盖 detector/depth_handler/robo_ctrl 相关 Python launch 和 PT 节点：通过。
- `env -i ... colcon build --packages-select detector depth_handler robo_ctrl --cmake-args -DPython3_EXECUTABLE=/usr/bin/python3`：通过；`robo_ctrl` 仅有既有 `cleanup` 未使用 warning。
- `env -i ... colcon build --packages-select tools --cmake-args -DPython3_EXECUTABLE=/usr/bin/python3`：通过。
- `ros2 launch detector detector_pt.launch.py --show-args`：显示默认模型、输入图像和输出检测话题参数。
- `ros2 launch depth_handler depth_processor.launch.py --show-args`：显示 `bbox2d_topic=/detector/detections`、`target_frame`、`source_frame` 等参数。
- `ros2 launch robo_ctrl robo_ctrl_L.launch.py --show-args` 与 `robo_ctrl_R.launch.py --show-args`：显示 6 个基座测量参数，默认均为 `0.0`。
- no-motion detector smoke：`timeout -s INT 10s ros2 launch detector detector_pt.launch.py image_topic:=/smoke/no_camera detections_topic:=/detector/smoke_detections device:=cpu publish_detection_image:=false`；节点成功加载 `best.pt` 并打印 6 类类别，SIGINT 后进程 clean exit。
- no-motion depth smoke：`timeout -s INT 6s ros2 launch depth_handler depth_processor.launch.py target_frame:=Lrobot_base source_frame:=camera_depth_frame enable_pointcloud:=false`；节点初始化并 clean exit。

## 本轮失败与处理

- 完整 `git clone` 首次失败：`GnuTLS recv error` / `fetch-pack` EOF；处理为浅克隆 `--depth 1 --single-branch`，成功到 commit `f1c2c1e`。
- 初次构建被 Conda 路径门禁拦截；处理为 `env -i` 非登录干净 shell + `/usr/bin/python3`。
- detector 首次构建触发本机 TensorRT 新旧 API 不兼容；处理为默认关闭旧 C++ TensorRT runtime，只保留 PT 检测链路。
- tools 首次构建因缺少 `src/opencv_test.cpp` 失败；处理为文件存在才构建该测试程序。

## 边界

- 本轮没有发送机械臂运动、Servo、PTP、MoveJ、MoveCart、程序运行或夹爪命令。
- 本轮 detector/depth smoke 使用隔离 `ROS_DOMAIN_ID=77/78`，没有接入真实相机或硬件。
- 后置进程检查发现 `/home/gwh/dual-arm` 有既存 `robo_ctrl`、MoveIt、planner、execution_adapter 等进程运行；这些不是本轮启动，未被本轮停止。后续涉及 planner 或硬件验证前必须先确认是否需要清理。
