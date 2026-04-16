# acceptance

## 目录作用

预留端到端验收测试与比赛级 smoke 的统一目录。

## 包含内容

- 当前阶段主要验收脚本仍位于 `packages/tools/tools/scripts/` 和控制台 API 触发入口中，后续会逐步收拢到此目录。

## 入口文件或常用命令

```bash
find tests/acceptance -maxdepth 2 -type f | sort
ros2 run competition_console_api competition_console_api_node.py
```

## 上下游依赖

- 上游：`competition_console_api`、`packages/tools/tools/scripts/smoke_*.py`
- 下游：Wave 验收、handoff 和最终发布前 smoke

## 修改边界

- 验收逻辑可以逐步迁入这里。
- 历史 `tests/competition` 已被这一层取代。

## 相关链接

- `../../packages/ops/competition_console_api/README.md`
- `../../docs/operations/runbooks/wave-2-5-acceptance.md`
