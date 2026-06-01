# Archived quick_competition Runbook

更新时间：2026-05-08

`quick_competition` 已归档到 `archive/quick_competition_2026-05-08/`，只作为 reference 保存。它不是 production runtime path，不参与 active colcon base path，不参与 production CI。

Production runtime authority 固定为：

```text
scene_fusion -> /planning/* -> /execution/* -> /competition/run
```

旧 quick 启动命令不再可用。`ros2 launch dualarm_bringup quick_competition.launch.py` 现在是 fail-closed deprecated wrapper，会输出归档说明并退出。

如需查阅旧 quick 源码、配置或测试，请阅读：

- `archive/quick_competition_2026-05-08/README.md`
- `archive/quick_competition_2026-05-08/MIGRATION.md`
