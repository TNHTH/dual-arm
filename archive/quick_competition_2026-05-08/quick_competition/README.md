# quick_competition (Archived)

归档日期：2026-05-08。

`quick_competition` 是 legacy 快速实机旁路，现在只作为 reference 保存。它不参与 active colcon base path、production CI 或 production runtime。

Production runtime authority 已固定为：

```text
scene_fusion -> /planning/* -> /execution/* -> /competition/run
```

以下旧命令只用于理解历史上下文，不应直接执行。

旧 cold start：

冷启动顺序：

```bash
ros2 launch dualarm_bringup quick_competition.launch.py dry_run:=true
ros2 run quick_competition quick_calibration_manager --solve
ros2 run quick_competition quick_competition_orchestrator --dry-run --full
```

旧真实运动命令已废弃：

```bash
ros2 launch dualarm_bringup quick_competition.launch.py dry_run:=false hardware_confirm_token:=I_UNDERSTAND
ros2 run quick_competition quick_competition_orchestrator --hardware --full --hardware-confirm-token I_UNDERSTAND
```
