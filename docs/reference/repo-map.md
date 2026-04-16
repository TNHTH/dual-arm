# 仓库地图

创建时间：2026-04-16

## 顶层骨架

- `README.md`：GitHub 首页与快速开始。
- `AGENTS.md`：仓库级代理规则。
- `STATE.md`：当前 handoff 和执行状态。
- `packages/`：正式源码主根。
- `config/`：仓库级配置。
- `docs/`：长期文档中心。
- `scripts/`：根级治理脚本。
- `tests/`：统一测试分层。
- `vendor/`：运行期第三方依赖。
- `archive/`：legacy 目录与迁移清单。
- `launch/`：根级兼容 launch。

## 领域目录

- `packages/bringup`：比赛启动链、joint state 汇总与启动门控。
- `packages/perception`：相机桥、检测、深度处理、场景融合。
- `packages/planning`：描述、MoveIt 配置、规划器、抓取目标和场景同步。
- `packages/control`：机器人控制、夹爪驱动与执行适配。
- `packages/tasks`：任务状态机与比赛流程。
- `packages/ops`：控制台 API 与 Web 前端。
- `packages/interfaces`：统一 msg/srv/action。
- `packages/transforms`：TF 权威发布与标定变换。
- `packages/compat`：兼容包与遗留接口。
- `packages/tools`：校准、TF 工具和 smoke 脚本。

## 重要入口

- 构建：`build_workspace.sh`
- 环境：`use_workspace.sh`
- 主 bringup：`packages/bringup/dualarm_bringup/launch/competition_integrated.launch.py`
- 控制台 API：`packages/ops/competition_console_api/scripts/competition_console_api_node.py`
- README 覆盖检查：`scripts/check_readme_coverage.py`
- 路径硬编码检查：`scripts/check_path_hardcodes.py`

## 非源码事实来源

- `build/`、`install/`、`log/`：可重建生成物
- `.artifacts/`：运行证据、日志和 checkpoint
- `docs/archive/`、`archive/`：历史资料与迁移记录

## 相关链接

- `path-migration-map.md`
- `../development/readme-style-guide.md`
