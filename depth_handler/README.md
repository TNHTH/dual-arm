# depth_handler

`depth_handler` 已从旧的“中心点 + 旧 `bbox3d`”模式升级为：

- 兼容发布旧 `depth_handler/msg/Bbox3dArray`
- 新增发布 `dualarm_interfaces/msg/SceneObjectArray`
- 内部统一以米为单位
- 修复 `16UC1` / `32FC1` 深度读取分支

## 输入

- `/perception/detection_2d` (`dualarm_interfaces/msg/Detection2DArray`)
- `/camera/depth/image_raw` (`sensor_msgs/msg/Image`)
- `/camera/depth/camera_info` (`sensor_msgs/msg/CameraInfo`)

## 输出

- `/depth_handler/bbox3d`
- `/perception/scene_objects`
- `/depth_handler/pointcloud`
- `/depth_handler/visualization`

## 任务级 subframe

- `object_center`
- `bottle_mouth`
- `cup_rim_center`
- `cup_fill_target`

## 启动

```bash
ros2 launch depth_handler depth_processor.launch.py
```
