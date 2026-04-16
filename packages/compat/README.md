# compat

## 目录作用

兼容历史控制逻辑、旧接口和遗留调试入口。

## 包含内容

- `dualarm`

## 入口文件或常用命令

```bash
ros2 launch dualarm robot_main.launch.py
```

## 上下游依赖

- 上游：历史单臂/双臂控制流程
- 下游：兼容期调试和遗留行为保真

## 修改边界

- 这里主要做兼容，不作为新功能优先落点。
- 新接口优先放 `control/`、`tasks/` 或 `ops/`。

## 相关链接

- `dualarm/README.md`
- `../README.md`
