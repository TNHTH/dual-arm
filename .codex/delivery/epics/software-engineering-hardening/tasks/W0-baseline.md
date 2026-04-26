# W0 Baseline

> 状态：进行中
> 创建时间：2026-04-26

## 目标

建立软件-only 工程化整改基线，记录当前失败项，并把 review 发现转为后续 Wave 的可执行入口。

## 完成项

- 已创建分支 `codex/software-engineering-hardening-20260426`。
- 已确认远端 `git@github.com:TNHTH/dual-arm.git`。
- 已运行基线检查。
- 已新增软件-only 护栏文档。

## 证据

- `python3 scripts/check_path_hardcodes.py`：通过。
- `python3 scripts/check_readme_coverage.py`：失败，缺少 `packages/ops/competition_rviz_tools/README.md`。
- `pytest --collect-only tests`：失败，当前 shell 缺少 `pytest` 命令。
- `colcon list --base-paths packages --names-only | sort`：发现 27 个包。

## Next Actions

- Wave 1 修复安全入口、危险 API 鉴权、停止语义和限幅。
- Wave 2 建立不依赖全局 `pytest` 命令的可重复测试入口。
