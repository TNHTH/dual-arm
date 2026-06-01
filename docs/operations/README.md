# operations

## 目录作用

运行、验收和工程流程文档入口。

## 包含内容

- `runbooks/`：安全边界、工程流程规范、代码审查和验收 runbook。

## 入口文件或常用命令

```bash
sed -n '1,200p' docs/operations/runbooks/engineering-process-standards.md
sed -n '1,200p' docs/operations/runbooks/safety.md
sed -n '1,200p' docs/operations/runbooks/wave-2-5-acceptance.md
```

## 上下游依赖

- 上游：根 `README.md`、仓库配置和运行证据
- 下游：人工验收、review 和控制台 smoke

## 修改边界

- 长期有效的操作规范放这里。
- 一次性会话记录不进入长期文档树。

## 相关链接

- `../archive/README.md`
- `../development/README.md`
