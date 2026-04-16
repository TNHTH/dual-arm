# process

## 目录作用

保存并行协作、窗口分工和过程治理相关资料。

## 包含内容

- `parallel-windows/`：并行窗口和共享状态迁移说明。

## 入口文件或常用命令

```bash
find docs/process -maxdepth 2 -type f | sort
```

## 上下游依赖

- 上游：`.codex/runtime/shared`
- 下游：并行开发与 handoff 过程

## 修改边界

- 只写过程说明和协作契约。
- 不把运行日志或一次性证据堆到这里。

## 相关链接

- `parallel-windows/README.md`
- `../operations/runbooks/engineering-process-standards.md`
