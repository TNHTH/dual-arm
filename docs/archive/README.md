# archive

## 目录作用

保存历史会话、旧迁移文档和阶段性材料，供回溯参考。

## 包含内容

- `sessions/`：历史会话记录与阶段性文档
- `migration/`：旧迁移说明

## 入口文件或常用命令

```bash
find docs/archive -maxdepth 2 -type f | sort
```

## 上下游依赖

- 上游：旧会话、历史 runbook
- 下游：问题回溯和背景补证

## 修改边界

- 归档文档不作为正式构建入口。
- 新的长期有效说明应放回 `docs/operations`、`docs/reference` 或 `docs/development`。

## 相关链接

- `../../archive/README.md`
- `../operations/README.md`
