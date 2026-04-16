# parallel-windows

## 目录作用

记录旧仓外共享目录并入仓库后的并行窗口治理说明。

## 包含内容

- 静态窗口说明、协作边界和共享状态归属约定。

## 入口文件或常用命令

```bash
ls .codex/runtime/shared
```

## 上下游依赖

- 上游：`.codex/tmp/resume/SUBAGENT_REGISTRY.json`
- 下游：多窗口协作、handoff 和 reviewer/verifier 流程

## 修改边界

- 这里记录规则，不直接保存实时运行状态。
- 实时共享数据放 `.codex/runtime/shared/`。

## 相关链接

- `../../operations/runbooks/engineering-process-standards.md`
- `../../../README.md`
