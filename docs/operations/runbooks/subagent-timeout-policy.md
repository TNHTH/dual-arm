# Subagent Timeout Policy

创建时间：2026-04-26

## 结论

Subagent 在 `dual-arm` 中只能作为非阻塞 sidecar。它不能成为 Wave 完成、提交或推送的唯一 gate；任何 reviewer/verifier subagent 都必须有本地主线程 fallback checklist。

## 触发背景

2026-04-26 软件-only hardening 期间，subagent 多次超时：

- Wave 1 security reviewer：120 秒未返回，已关闭，本地 fallback。
- Wave 5 reviewer：120 秒未返回，已关闭，本地 fallback。
- Wave 6 final verifier：180 秒未返回，已关闭，本地 fallback。

这些超时没有造成未关闭 agent，但浪费了等待时间，也说明宽泛的“最终 review / 最终 verifier”不适合直接交给一个 subagent。

## 使用条件

允许使用 subagent 的条件：

- 用户显式授权 subagent。
- 任务是非阻塞 sidecar，不在当前关键路径上。
- scope 能在一个短答中闭环。
- 读写范围明确，不会和主线程或其他 subagent 冲突。

不应使用 subagent 的条件：

- 下一步必须立即依赖 subagent 结论。
- 问题是“完整读全仓并最终判断能否交付”。
- 同一 wave 同一角色刚刚超时。
- 本任务已经出现两次 subagent 超时，除非后续问题更窄且不阻塞。

## 任务粒度

错误示例：

- “检查最终 diff 是否完全没问题。”
- “完整 review 当前项目。”
- “验证软件-only 边界、测试证据、文档完整性、敏感信息和所有风险。”

推荐示例：

- “只检查 staged diff 中 `.github/workflows/software-check.yml` 是否会触发实机。”
- “只检查 `robo_ctrl` 本次 diff 是否改变 service 名称。”
- “只检查 `competition_console_api` 新增 middleware 是否覆盖危险 POST/DELETE route。”

## 等待预算

- 窄文件检查：60-90 秒。
- reviewer/verifier：120-180 秒。
- 同一 delegated task 只等一次。
- 超时后立即关闭，不重复 wait。

## 超时处理

超时后必须按顺序执行：

1. `close_agent`。
2. 更新 `.codex/tmp/resume/SUBAGENT_REGISTRY.json`。
3. 在 `STATE.md` 或当前 Wave evidence 中记录本地 fallback。
4. 执行本地主线程 checklist。
5. 同一 wave 不再开启同类宽泛 subagent。

## 本地 Reviewer Fallback Checklist

```bash
git diff --stat
git diff --check
git diff -- <changed-files>
```

再按改动类型补：

- Python：`/usr/bin/python3 -m py_compile ...`
- ROS 包：`colcon build --base-paths packages --packages-select <pkg>`
- 测试：`/usr/bin/python3 -m pytest -q tests/unit tests/integration`
- 前端：`npm run build` 和 Playwright smoke
- 接口兼容：`rg` 静态搜索 node executable、launch、service/action 名称

## 本地 Verifier Fallback Checklist

```bash
python3 scripts/check_path_hardcodes.py
python3 scripts/check_readme_coverage.py
bash scripts/ci/software_check.sh
colcon test-result --all
git diff --cached --check
git diff --cached | rg -n '<sensitive-token-patterns>'
```

敏感信息扫描在命令中使用实际 token pattern；文档中避免写入真实 token 示例。

## Registry 字段

`SUBAGENT_REGISTRY.json` 中每个 subagent 至少记录：

- `id`
- `role`
- `agent_type`
- `scope`
- `status`
- `timeout_ms`
- `closed`
- `fallback_evidence`
- `summary`

## 完成判定

subagent 超时不自动阻塞 Wave，但必须满足：

- subagent 已关闭。
- 超时已记录。
- 本地 fallback checklist 通过。
- 若本地 fallback 发现 P0/P1 问题，必须修复或明确降级。
