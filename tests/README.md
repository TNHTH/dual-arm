# tests

## 目录作用

预留统一测试分层目录，区分单元、集成、硬件和验收测试。

## 包含内容

- `unit/`
- `integration/`
- `hardware/`
- `acceptance/`

## 入口文件或常用命令

```bash
find tests -maxdepth 2 -type f | sort
python3 scripts/check_readme_coverage.py
```

## 上下游依赖

- 上游：各包测试脚本与 runbook
- 下游：人工验收、控制台 smoke、后续自动化测试

## 修改边界

- 目录分层在这里统一维护。
- 包内私有 smoke 可以保留在包目录，但跨包验收应优先落到这里。

## 相关链接

- `acceptance/README.md`
- `../docs/operations/README.md`
