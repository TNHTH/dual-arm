# legacy

## 目录作用

保存历史源码目录和兼容保留资产，避免继续污染主叙事目录。

## 包含内容

- `arm_planner/`：旧 monolithic 规划目录的归档副本。

## 入口文件或常用命令

```bash
find archive/legacy -maxdepth 2 | sort
```

## 上下游依赖

- 上游：早期仓库布局
- 下游：历史参考、路径映射和人工回溯

## 修改边界

- 默认不在这里继续开发新功能。
- 若 legacy 资产仍需被构建，必须显式说明并配置 `COLCON_IGNORE` 或兼容层。

## 相关链接

- `../legacy-import-manifest.md`
- `../../docs/reference/path-migration-map.md`
