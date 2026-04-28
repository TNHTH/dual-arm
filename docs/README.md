# docs

## 目录作用

仓库内长期文档中心，面向 GitHub 游客、协作者和后续接手者。

## 包含内容

- `architecture/`：系统架构与主链说明。
- `api/`：接口合同、字段单位和错误码。
- `artifacts/`：模型、训练输出、厂商 SDK 和运行证据治理。
- `operations/`：运行手册、流程规范和验收约束。
- `development/`：开发约定、README 风格与工程说明。
- `reference/`：仓库地图、路径迁移表和其他参考索引。
- `archive/`：历史会话、旧迁移记录和阶段性材料。
- `process/`：并行窗口与过程治理说明。

## 入口文件或常用命令

```bash
ls docs
sed -n '1,200p' docs/reference/repo-map.md
sed -n '1,200p' docs/architecture/runtime-architecture.md
```

## 上下游依赖

- 上游：根 `README.md`、`STATE.md`
- 下游：各目录 README、runbook、迁移清单与协作文档

## 修改边界

- 长期有效文档写入这里。
- 运行时生成物、临时日志和一次性输出不要混入 `docs/` 主叙事。

## 相关链接

- `reference/README.md`
- `operations/README.md`
