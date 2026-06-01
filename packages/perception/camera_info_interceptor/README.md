# camera_info_interceptor

## 目录作用

拦截并改写相机 `camera_info` 的 `frame_id`，让感知链使用统一 frame 约定。

## 包含内容

- `launch/camera_info_interceptor.launch.py`
- `src/camera_info_interceptor_node.cpp`

## 入口文件或常用命令

```bash
ros2 launch camera_info_interceptor camera_info_interceptor.launch.py
```

## 上下游依赖

- 上游：相机桥或相机驱动
- 下游：`depth_handler`、`ball_basket_pose_estimator`、后续 TF 消费方

## 修改边界

- 只处理 `camera_info` 协议和 frame 适配。
- 图像本体处理留给其他感知包。

## 相关链接

- `../README.md`
- `../orbbec_gemini_bridge/README.md`
