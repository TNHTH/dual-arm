# W6 Docs And Final Verify

> 状态：本地验证完成；最终 verifier 超时已关闭；等待提交和 push
> 日期：2026-04-26

## Scope

- 补齐新人可运行的 README 与运行文档。
- 说明安全边界、token、stop/cancel、mock/real 切换。
- 记录核心接口字段单位、范围和错误码。
- 记录模型、训练输出、vendor SDK 和 backup 治理。
- 更新仓库卫生规则并完成最终软件-only 验证。

## Changed

- `README.md`
- `docs/architecture/runtime-architecture.md`
- `docs/operations/runbooks/safety.md`
- `docs/api/interfaces.md`
- `docs/artifacts/model-and-vendor-manifest.md`
- `packages/control/robo_ctrl/README.md`
- `packages/control/epg50_gripper_ros/README.md`
- `packages/ops/competition_rviz_tools/README.md`
- `.gitignore`

## Verification

- `python3 scripts/check_readme_coverage.py`
- `python3 scripts/check_path_hardcodes.py`
- `/usr/bin/python3 -m pytest -q tests/unit tests/integration`
- `bash scripts/ci/software_check.sh`
- `colcon test-result --all`

## Result

- README coverage passed.
- Path hardcode check passed.
- Top-level pytest passed.
- Software check passed.
- `colcon test-result --all` reported 11 tests, 0 errors, 0 failures, 0 skipped.
- Staged diff sensitive scan passed with no matches.
- Final verifier subagent timed out after 180 seconds and was closed; local fallback verification passed.
