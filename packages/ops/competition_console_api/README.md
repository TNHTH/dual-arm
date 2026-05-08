# competition_console_api

## 目录作用

统一控制台 API、验收入口和运行证据汇总层。Production launch 默认不启动该节点；单独启动时 raw motion debug clients 默认关闭。

## 包含内容

- `launch/competition_console_api.launch.py`
- `scripts/competition_console_api_node.py`
- `scripts/competition_console_static_server.py`

## 入口文件或常用命令

```bash
ros2 launch competition_console_api competition_console_api.launch.py
ros2 launch competition_console_api competition_console_api_debug.launch.py allow_raw_motion_debug:=false
curl http://127.0.0.1:18080/api/health
curl -X POST http://127.0.0.1:18080/api/acceptance/run/workspace
```

## 上下游依赖

- 上游：`dualarm_task_manager`、`dualarm_bringup`、`packages/tools/tools/scripts/smoke_*.py`
- 下游：`competition_console_web`、人工验收和 checkpoint 查看

## 修改边界

- API 层不能依赖 `Path.cwd()` 猜仓库根。
- 不要把前端逻辑直接混到这个包里。
- Production 模式只允许 status/planning/execution/competition 代理；raw jog/direct robot clients 必须保持 debug gated。
- 启用 `allow_raw_motion_debug:=true` 时还必须提供匹配 `DUALARM_HARDWARE_CONFIRM_TOKEN` 的 `hardware_confirm_token`。

## 相关链接

- `../competition_console_web/README.md`
- `../../../docs/operations/runbooks/engineering-process-standards.md`
