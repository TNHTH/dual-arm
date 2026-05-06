# quick_competition

`quick_competition` 是双臂比赛的快速实机旁路。它保留正式架构，单独提供
dry-run、粗标定、manual pose、预设路点、低速执行和日志导出能力。

冷启动顺序：

```bash
ros2 launch dualarm_bringup quick_competition.launch.py dry_run:=true
ros2 run quick_competition quick_calibration_manager --solve
ros2 run quick_competition quick_competition_orchestrator --dry-run --full
```

真实运动必须显式确认：

```bash
ros2 launch dualarm_bringup quick_competition.launch.py dry_run:=false hardware_confirm_token:=I_UNDERSTAND
ros2 run quick_competition quick_competition_orchestrator --hardware --full --hardware-confirm-token I_UNDERSTAND
```
