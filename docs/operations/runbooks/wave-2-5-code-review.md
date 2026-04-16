# Wave 2-5 Code Review

创建时间：2026-04-16
更新时间：2026-04-16

## 结论
- Wave 5 当前已通过运行态强验收 smoke。
- 代码审查关注的主要风险点已被本轮修复到可接受范围，当前无新的阻塞级 findings 卡住 Wave 5 happy path。
- 当前仍保留一个非阻塞残余风险：`move_group` 在 launch teardown 阶段 segmentation fault，会污染退出日志，但不影响 Wave 5 运行态功能闭环。

## 审查范围
- `src/planning/planning_scene_sync/scripts/planning_scene_sync_node.py`
- `src/tools/tools/scripts/smoke_planning_scene_sync.py`
- `.codex/tmp/error-trace/ERROR_TRACE.md`

## 已关闭的主要问题
- service 假成功：已改为事务模式，失败会回滚 managed state。
- callback group / future 竞态：已改为持锁同步 apply，不再依赖异步 done-callback 提交状态。
- attach diff 语义：已改为 attach 前 world 可见性确认，attach diff 不再同包混入同 id world REMOVE。
- raw scene 短时空帧抖动：已加入 `object_retention_timeout` 与 `lost_but_*` 语义。
- smoke 过弱：已补强 managed / MoveIt 双侧断言，并验证最终清空。

## 残余风险
- `move_group` teardown segfault 仍在。
- Wave 4 freshness 与 Wave 6 primitive 真闭环还未收口，不在本次审查通过范围内。
