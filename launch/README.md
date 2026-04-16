# launch

## 目录作用

保存仓库根级兼容 launch 入口，避免旧命令在迁移期立刻失效。

## 包含内容

- `competition.launch.py`：转发到 `dualarm_bringup` 的薄包装。

## 入口文件或常用命令

```bash
ros2 launch dualarm_bringup competition.launch.py
```

## 上下游依赖

- 上游：旧文档和旧调用命令
- 下游：`packages/bringup/dualarm_bringup/launch/*.launch.py`

## 修改边界

- 这里只保留兼容包装，不再扩展成新的源码事实来源。
- 新 launch 实现请放回对应包目录。

## 相关链接

- `../packages/bringup/README.md`
- `../docs/reference/path-migration-map.md`
