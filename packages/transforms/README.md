# transforms

## 目录作用

保存 TF 权威发布、静态变换和标定发布相关包。

## 包含内容

- `tf_node`

## 入口文件或常用命令

```bash
ros2 launch tf_node frame_authority.launch.py
```

## 上下游依赖

- 上游：标定配置
- 下游：感知、规划、控制和工具链

## 修改边界

- 仅处理坐标变换发布与管理。
- 感知或规划业务逻辑不要混入这里。

## 相关链接

- `tf_node/README.md`
- `../tools/README.md`
