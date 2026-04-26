# operations

## 目录作用

运行、验收、交接和工程流程文档入口。

## 包含内容

- `runbooks/`：安全边界、subagent 超时治理、工程流程规范、代码审查和验收 runbook。

## 入口文件或常用命令

```bash
sed -n '1,200p' docs/operations/runbooks/engineering-process-standards.md
sed -n '1,200p' docs/operations/runbooks/safety.md
sed -n '1,200p' docs/operations/runbooks/subagent-timeout-policy.md
sed -n '1,200p' docs/operations/runbooks/wave-2-5-acceptance.md
```

## 上下游依赖

- 上游：`STATE.md`、`.codex/tmp/resume/*`
- 下游：人工验收、review、handoff 和控制台 smoke

## 修改边界

- 长期有效的操作规范放这里。
- 临时会话记录迁入 `docs/archive/sessions/`。

## 相关链接

- `../archive/README.md`
- `../development/README.md`
