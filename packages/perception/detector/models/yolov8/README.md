# YOLOv8 训练产物归档

创建时间：2026-04-15

本目录保存双臂项目当前接入的 YOLOv8 训练产物，来源为现场队友提供的 `/home/gwh/下载/yolo_runs.zip`。

## 当前版本

- 训练 run：`yolo_runs/final_dataset_v1`
- 基础模型：`yolov8s.pt`
- 训练轮数：`100`
- 输入尺寸：`640`
- 权重：
  - `yolo_runs/final_dataset_v1/weights/best.pt`
  - `yolo_runs/final_dataset_v1/weights/last.pt`

## 类别约定

`best.pt` 当前类别为：

| class_id | 原始类别 | 项目语义 |
|---:|---|---|
| 0 | `basket` | `basket` |
| 1 | `basketball` | `basketball` |
| 2 | `cocacola` | `cola_bottle` |
| 3 | `cup` | `cup` |
| 4 | `football` | `soccer_ball` |
| 5 | `yibao` | `water_bottle` |

项目语义映射文件：

- `src/perception/detector_adapter/config/class_map_best_pt.yaml`

## 当前接入方式

`.pt` 权重不走旧 C++ TensorRT detector，而是通过：

- `detector/scripts/detector_pt_node.py`

直接加载 Ultralytics YOLO，并输出兼容旧协议的：

- `/detector/detections`
- `/detector/detections/image`

正常链路为：

```text
Orbbec Gemini 335
-> /camera/color/image_raw
-> detector_pt_node.py
-> /detector/detections
-> detector_adapter
-> /perception/detection_2d
-> depth_handler
-> /perception/scene_objects
-> scene_fusion
```

## 运行备注

- 当前系统 Python 已切换为 CUDA 版 PyTorch：`torch=2.6.0+cu124`，`torchvision=0.21.0+cu124`。
- 为兼容 ROS Humble `cv_bridge`，`numpy` 应保持 `1.26.x`，不要自动升级到 NumPy 2.x。
- 现场临时 Orbbec 桥和 OpenCV 可视化脚本仍在 `.tmp/codex/2026-04-15/`，后续若长期使用，应提升为正式 ROS 包或 launch。
