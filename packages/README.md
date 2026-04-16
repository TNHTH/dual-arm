# packages

## 目录作用

仓库正式源码主根。所有 ROS 2 包都按领域收口在这里，`src -> packages` 仅保留为兼容期别名。

## 包含内容

- `bringup/`：启动链与汇总节点。
- `perception/`、`planning/`、`control/`：主运行链核心域。
- `interfaces/`、`tasks/`、`ops/`、`transforms/`、`compat/`、`tools/`：接口、任务、运维、兼容和工具域。

## 入口文件或常用命令

```bash
colcon list --base-paths packages --names-only
./build_workspace.sh --list-groups
./build_workspace.sh --group planning
```

## 上下游依赖

- 上游：`config/system/build_groups.yaml`
- 下游：`build_workspace.sh`、`use_workspace.sh`、根 `launch/` 兼容入口

## 修改边界

- 新增或迁移源码时，优先放入对应领域目录。
- 不要把新的 ROS 包重新散落到仓库根目录或旧单层布局。

## 相关链接

- `../README.md`
- `../docs/reference/repo-map.md`
