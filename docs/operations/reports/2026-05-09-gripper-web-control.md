# 2026-05-09 左右夹爪网页按钮控制

## 结论

- 已新增独立网页：`http://127.0.0.1:18081/gripper.html`。
- 页面按钮通过 `competition_console_api` 调用 ROS `/execution/set_gripper`，可控制左夹爪和右夹爪。
- 本轮没有启动 `robo_ctrl`、MoveIt、planner、`planning_scene_sync` 或 `/competition/run`。
- 本轮没有发送机械臂运动命令；只建立夹爪网页控制入口。

## 修改内容

- API：`packages/ops/competition_console_api/scripts/competition_console_api_node.py`
  - 新增 `GET /api/control/gripper/status`。
  - `GET /api/control/state` 追加 `left_gripper` / `right_gripper` 快照。
- 网页：`packages/ops/competition_console_web/public/gripper.html`
  - 构建后输出 `packages/ops/competition_console_web/dist/gripper.html`。
  - 页面包含左夹爪、右夹爪、双夹爪快捷按钮。
  - 页面要求输入 `ARM` 才启用动作按钮。
  - 页面支持 API token 输入。
- 测试：`packages/ops/competition_console_web/tests/smoke.spec.ts`

## 当前运行

- API：`http://127.0.0.1:18080/api/health`
- Web：`http://127.0.0.1:18081/gripper.html`
- profile：`gripper_web`
- `allow_raw_motion_debug=false`
- 日志目录：`.codex/tmp/runtime/gripper-web-20260509/`

## 验证

- `/usr/bin/python3 -m py_compile packages/ops/competition_console_api/scripts/competition_console_api_node.py`：通过。
- `npm run build`：通过，`dist/gripper.html` 已生成。
- `npx playwright test --reporter=line`：`3 passed`。
- `colcon build --base-paths packages --packages-select competition_console_api`：通过。
- `curl http://127.0.0.1:18080/api/health`：返回 `status=ok`。
- `curl http://127.0.0.1:18081/gripper.html`：返回 HTML。
- `curl http://127.0.0.1:18081/api/control/gripper/status`：左右夹爪状态可读。

## 当前夹爪状态

- 左夹爪 slave `9`：`success=true`、`error=0`、`position=219`、`gobj=3`。
- 右夹爪 slave `10`：`success=true`、`error=0`、`position=219`、`gobj=3`。

`gobj=3` 表示手指到达指定位置但未检测到物体，不能作为抓住物体的证据。

## 安全边界

- 网页按钮只调用 `/execution/set_gripper`，不调用机械臂运动接口。
- `competition_console_api` 当前 raw motion debug clients 关闭。
- `gobj in {1,2}` 才能作为夹到物体证据；`gobj=3` 只能说明未夹住或物体已脱落。
- 后续如果要长期保留无 token 本机网页操作，应只监听 `127.0.0.1`，不要开放外部 host。
