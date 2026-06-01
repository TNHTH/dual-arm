# detector_adapter

`detector_adapter` 冻结现有 `detector` 包，只对其输出做语义归一化。

## 输入

- `/detector/detections` (`detector/msg/Bbox2dArray`)

## 输出

- `/perception/detection_2d` (`dualarm_interfaces/msg/Detection2DArray`)

## 说明

- 通过 `class_map.yaml` 将旧 detector 的数值类别映射为稳定语义。
- 不修改 TensorRT、模型权重、训练流程或旧消息定义。
