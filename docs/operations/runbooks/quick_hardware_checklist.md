# quick_competition 硬件检查清单

## No-Motion Smoke

```bash
bash scripts/quick/quick_hardware_smoke_test.sh
```

该脚本会检查：

- `/L`、`/R` 话题存在。
- `/L/robot_state`、`/R/robot_state` 有消息频率。
- 各 echo 一次 robot_state。

`topic hz` 只能证明消息频率，不能证明数值正确。操作者必须手动把机械臂移到明显姿态，读取 `/L/robot_state`、`/R/robot_state`，人工确认关节角和 TCP 与目测一致；若状态值异常，禁止进入 hardware 运动。

## 进入真实动作前

- 急停可达。
- 人员离开运动范围。
- `dry_run=false` 与 `hardware_confirm_token=I_UNDERSTAND` 显式设置。
- preflight 通过。
- 所有关键 waypoint `verified=true`。
- 倒水任务的液体负载失败策略为保持夹爪扭矩并人工接管，不自动松夹爪。
