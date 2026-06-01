# ops

## 目录作用

保存控制台、运维和人工验收相关入口。

## 包含内容

- `competition_console_api`
- `competition_console_web`

## 入口文件或常用命令

```bash
ros2 launch competition_console_api competition_console_api.launch.py
cd packages/ops/competition_console_web && npm run build
```

## 上下游依赖

- 上游：`tasks/`、`bringup/`、`tools/` smoke 脚本
- 下游：浏览器控制台、人工验收和运行证据汇总

## 修改边界

- 控制面代码放这里。
- 不要把底层 ROS 运行逻辑直接写进前端或 API 兼容脚本中。

## 相关链接

- `competition_console_api/README.md`
- `competition_console_web/README.md`
