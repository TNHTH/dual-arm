# orbbec_gemini_bridge

## 目录作用

提供 Orbbec Gemini 335 相机桥和 mock 相机流入口。

## 包含内容

- `launch/orbbec_gemini_bridge.launch.py`
- `scripts/orbbec_gemini_ros_bridge.py`
- `scripts/mock_camera_stream.py`

## 入口文件或常用命令

```bash
ros2 launch orbbec_gemini_bridge orbbec_gemini_bridge.launch.py
```

## 上下游依赖

- 上游：真实 Orbbec 相机或 mock 流
- 下游：`camera_info_interceptor`、`detector`、`depth_handler`

## 修改边界

- 相机桥和模拟流逻辑放这里。
- 检测与深度处理不要写进桥接包。

## 相关链接

- `../camera_info_interceptor/README.md`
- `../README.md`
