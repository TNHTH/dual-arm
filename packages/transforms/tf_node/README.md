# tf_node

## 目录作用

基于标定配置发布双臂系统的权威 TF。

## 包含内容

- `config/calibration_transforms.yaml`
- `launch/frame_authority.launch.py`
- `scripts/static_frame_authority.py`

## 入口文件或常用命令

```bash
ros2 launch tf_node frame_authority.launch.py
```

## 上下游依赖

- 上游：标定参数和静态变换配置
- 下游：相机链、规划链、工具链

## 修改边界

- 只处理 TF 发布和标定变换。
- 不要在这里加入业务状态机逻辑。

## 相关链接

- `../README.md`
- `../../tools/tools/README_dual_end_tf_collector.md`
