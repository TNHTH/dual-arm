# reference

## 目录作用

集中放人工可读的索引、映射和查找型文档。

## 包含内容

- `repo-map.md`：仓库地图
- `path-migration-map.md`：路径迁移与兼容映射

## 入口文件或常用命令

```bash
sed -n '1,200p' docs/reference/repo-map.md
sed -n '1,200p' docs/reference/path-migration-map.md
```

## 上下游依赖

- 上游：根 `README.md`
- 下游：协作者导航、迁移检查、故障排查

## 修改边界

- 只放稳定索引和映射信息。
- 变更仓库结构后要同步更新这里。

## 相关链接

- `repo-map.md`
- `path-migration-map.md`
