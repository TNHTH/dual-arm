# Engineering Process Standards

创建时间：2026-04-16
更新时间：2026-04-26

## 适用范围

本规范适用于 `workspaces/dual-arm` 后续所有 Wave 实现、调试、验收、代码审查和跨窗口接续。

## 1. Wave Gate 规范

每个 Wave 必须通过以下 Gate，不能跳过：

1. `Spec Gate`：本波目标、接口、写集、非目标明确。
2. `Design Gate`：至少一轮专项审查，必要时用 subagent。
3. `Build Gate`：相关包构建通过。
4. `Runtime Gate`：关键运行态 smoke 通过，而不是只看接口存在。
5. `Review Gate`：代码审查无未关闭 P0/P1。
6. `Acceptance Gate`：验收脚本或网页验收按钮有证据。
7. `Checkpoint Gate`：状态文件、错误记录、复盘和断点文件已更新。

## 2. 验收证据规范

任何 `passes: true` 必须至少包含一种证据：

- 命令输出
- 日志片段
- 网页截图或 Playwright 输出
- checkpoint 文件内容
- service/action 返回值

禁止只用“已实现”“接口已添加”“构建已过”证明运行态功能完成。

## 3. ROS 运行态验证规范

运行态 smoke 前必须执行：

```bash
pgrep -af 'ros2 launch|move_group|fairino_dualarm_planner|competition_console_api|planning_scene_sync'
```

若发现旧进程，先清理旧 ROS graph，再启动干净会话。

涉及 ROS Python 的临时脚本必须使用：

```bash
/usr/bin/python3
```

禁止使用 shell 默认 `python3`，避免 Conda 抢占 `rclpy` ABI。

## 4. MoveIt PlanningScene 规范

`planning_scene_sync` 相关变更必须先通过最小 diff smoke：

1. world ADD
2. world MOVE
3. world REMOVE
4. attach existing world object
5. detach attached object

`/scene/*` service 不能在 MoveIt 写入未确认时返回成功。

`AttachedCollisionObject` 不能与同 id `world REMOVE` 放在同一个冲突 diff 中。

`scene.is_diff=true` 与 `scene.robot_state.is_diff=true` 是实时更新默认值。

## 5. 控制台规范

`competition_console_api` 必须：

- 不依赖 `Path.cwd()` 推断仓根
- 缺少 FastAPI/uvicorn 时硬失败
- 启动 core 时只启动 `competition_core.launch.py`
- 不递归启动 `competition_integrated.launch.py`
- start/stop 必须有运行态 smoke 证据

`competition_console_web` 必须：

- 每个新增关键按钮都有 API handler
- Playwright 至少覆盖按钮可见性和一个真实 API 动作
- 生产 build 必须通过

## 6. Subagent 规范

允许并鼓励使用 subagent，但必须遵守：

- 同类问题复用同一角色 agent
- 写任务 502 时立即降级主线程，不阻塞 Wave
- subagent 只读审查结果必须回写到 `SUBAGENT_REGISTRY.json`
- 不允许用 subagent 的“建议”替代实际验收
- subagent 只能承担非阻塞 sidecar；不要把整仓最终审查或最终验收交给一个宽泛 subagent
- reviewer/verifier subagent 默认只等待一次，预算 120-180 秒；窄范围检查预算 60-90 秒
- subagent 超时后必须立即关闭，并记录 agent id、角色、scope、timeout、关闭结果和本地 fallback 证据
- 同一 Wave 同一角色超时后，不再重复开启同类宽泛 subagent
- 同一任务出现两次 subagent 超时后，后续非必要 subagent 全部停用，改走本地主线程 review/verify checklist

详细策略见 `docs/operations/runbooks/subagent-timeout-policy.md`。

## 7. 目录迁移规范

大规模目录迁移后默认执行：

```bash
rm -rf build install log
./build_workspace.sh
```

否则旧 CMake cache 会持续污染构建结果。

## 8. 失败记录规范

每次真实失败必须进入 `.codex/tmp/error-trace/ERROR_TRACE.md`，至少包含：

- Symptom
- Root cause 或当前嫌疑
- Handling
- Evidence
- Prevention
- Remaining

不要只在聊天里记录失败。
