# development

## 目录作用

记录开发约定、文档风格、迁移实施规则和协作约束。

## 包含内容

- `readme-style-guide.md`：README 结构与维护规范。

## 入口文件或常用命令

```bash
sed -n '1,200p' docs/development/readme-style-guide.md
python3 scripts/check_readme_coverage.py
```

## 上下游依赖

- 上游：根 `README.md`、`AGENTS.md`
- 下游：各目录 README、校验脚本、协作流程

## 修改边界

- 放开发规范，不放运行时证据。
- 风格更新后要同步检查 README 覆盖脚本和实际目录文档。

## 相关链接

- `../reference/path-migration-map.md`
- `../../scripts/README.md`
