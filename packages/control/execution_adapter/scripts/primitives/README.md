# Primitive Modules

本目录用于承载与 `execution_adapter` 主实现解耦的 primitive 执行模块。

## 约束

- 行为窗口只允许在本目录下新增或修改 primitive 模块。
- 不允许直接修改 `execution_adapter_node.py` 主文件来抢写执行层。
- 模块命名建议：
  - `cap_pour_*`
  - `handover_*`

## 目标

- 让 Wave 6 与 Wave 7/8/9 立即并行。
- 由 execution-control 窗口后续维护主调度边界。
