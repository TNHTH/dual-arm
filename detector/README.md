# detector

`detector` 包在当前重构中视为冻结包：

- 不改模型权重
- 不改训练流程
- 不改 TensorRT 导出链
- 不把球/篮筐检测需求继续塞回这个包

## 当前角色

- 输入：`/camera/color/image_raw`
- 输出：`/detector/detections` (`detector/msg/Bbox2dArray`)
- 可选输出：`/detector/detections/image`

## 运行时说明

- 运行时的语义归一化已迁移到 `detector_adapter`
- 当 TensorRT 条件不足时，本包允许只保留消息接口，不强制提供可执行节点
- 生产链不再直接依赖本包消息，而是依赖 `dualarm_interfaces/msg/Detection2DArray`
