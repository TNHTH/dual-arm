# Control Plane

创建时间：2026-04-16
更新时间：2026-04-16

## 目标

统一测试、验收、任务执行、断点恢复和证据导出入口。

## 组件

- `competition_integrated.launch.py`
- `competition_console_api`
- `competition_console_web`
- `RunCompetition` / `ExecuteTrajectory` / `ExecutePrimitive`
- `.artifacts/checkpoints/competition/*`

## 正式入口

1. `competition_integrated.launch.py` 拉起主链与控制平面
2. `competition_console_api` 暴露控制与查询接口
3. `competition_console_web` 提供浏览器按钮与结果面板

## 最低要求

- 浏览器可一键启动/停止
- 浏览器可一键执行 smoke / acceptance / checkpoint restore
- 浏览器结果可追溯到日志与证据文件
