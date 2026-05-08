# Archived Quick Competition

归档日期：2026-05-08

`quick_competition` 是 legacy quick hardware bypass。它已从 active `packages/`、active `config/`、active `scripts/` 和默认 pytest 收集范围移出。

本目录只作为参考资料保留，不参与 production runtime、production CI 或 active colcon package install。

## Runtime Authority

新的 production authority 固定为：

```text
scene_fusion -> /planning/* -> /execution/* -> /competition/run
```

如需恢复或对照 quick 行为，必须先在新分支中重新评审 hardware token、dry-run 默认值、camera profile 和 raw motion authority，不得直接把本目录重新加入 active workspace。
