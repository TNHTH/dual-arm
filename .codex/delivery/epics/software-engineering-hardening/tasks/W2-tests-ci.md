# W2 Tests and CI

> 状态：完成
> 创建时间：2026-04-26

## 目标

建立可重复的软件-only 测试入口，避免仓库继续处于 `0 tests` 状态。

## 已完成修改

- 抽出 `competition_console_security.py`，让危险 API 鉴权、jog 限幅和 gripper clamp 可被纯单元测试覆盖。
- `competition_console_api` 增加包内 pytest，并接入 `colcon test`。
- 顶层 `tests/unit` 增加安全和配置契约测试。
- 顶层 `tests/integration` 增加静态软件契约测试。
- 新增 `scripts/ci/software_check.sh`，串联路径检查、README 覆盖、pytest、colcon build/test、前端 build 和 Playwright。
- 新增 `.github/workflows/software-check.yml`。
- Playwright smoke 改为自启动 Vite 并使用 mock API，不依赖人工启动后端。
- 补齐 `packages/ops/competition_rviz_tools/README.md`，README 覆盖检查已通过。

## 验证证据

- `/usr/bin/python3 -m pytest -q tests/unit tests/integration packages/ops/competition_console_api/test/test_console_security.py`：`14 passed`。
- `colcon test --base-paths packages --packages-select competition_console_api --event-handlers console_direct+`：`1/1 Test #1: test_console_security Passed`。
- `bash scripts/ci/software_check.sh`：通过，包含：
  - 路径硬编码检查通过。
  - README 覆盖检查通过，共检查 58 个目录。
  - 顶层 pytest `8 passed`。
  - `competition_console_api` colcon test `6 passed`。
  - 前端 `npm run build` 通过。
  - Playwright `2 passed`。

## Next Actions

- Wave 3 将运行参数收敛到 profile/YAML，并补配置测试 fixture。
