# artifacts

创建时间：2026-04-26

## 目录作用

记录模型、训练输出、厂商 SDK、备份包和运行证据的治理策略。

## 当前文档

- `model-and-vendor-manifest.md`：模型权重、YOLO runs、Fairino SDK 和 backup 的来源与治理边界。

## 修改边界

- 不在 `docs/artifacts/` 存放大模型、训练输出或厂商二进制。
- 新增大文件前必须先更新 manifest，并明确是否应进入 Git、Git LFS、外部 artifact store 或 `.artifacts/`。
