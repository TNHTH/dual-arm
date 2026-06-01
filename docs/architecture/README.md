# architecture

## 目录作用

记录仓库的系统分层、控制面设计和主运行链结构。

## 包含内容

- `system_overview.md`
- `control-plane.md`

## 入口文件或常用命令

```bash
sed -n '1,200p' docs/architecture/system_overview.md
```

## 上下游依赖

- 上游：根 `README.md`
- 下游：`operations/`、`reference/` 与各包 README

## 修改边界

- 只写稳定的架构关系与长期设计。
- 会话排障与临时实验不要放到这里。

## 相关链接

- `../reference/repo-map.md`
- `../operations/runbooks/engineering-process-standards.md`
