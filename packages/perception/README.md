# perception

## 目录作用

保存相机桥、检测、深度处理和场景融合相关包。

## 包含内容

- `camera_info_interceptor`
- `orbbec_gemini_bridge`
- `detector` / `detector_adapter`
- `depth_handler`
- `ball_basket_pose_estimator`
- `scene_fusion`

## 入口文件或常用命令

```bash
./build_workspace.sh --group perception
ros2 launch detector_adapter detector_adapter.launch.py
```

## 上下游依赖

- 上游：相机与检测模型
- 下游：`planning/`、`tasks/` 和控制台验收

## 修改边界

- 这里负责感知结果，不负责规划与执行。
- 旧模型路径不要再写死绝对路径。

## 相关链接

- `detector/README.md`
- `scene_fusion/README.md`
