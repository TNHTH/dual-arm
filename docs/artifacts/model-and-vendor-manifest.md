# Model And Vendor Manifest

创建时间：2026-04-26

本文记录当前仓库中模型、训练输出和厂商资产的治理边界。它不是资产校验清单的唯一来源；真实文件仍以 Git 和对应目录为准。

## Detector Model

- 默认 profile 字段：`config/profiles/competition_default.yaml -> perception.detector.model_path`。
- 默认环境覆盖：`DUALARM_DETECTOR_MODEL_PATH`。
- 当前 canonical 路径：`packages/perception/detector/models/yolov8/yolo_runs/final_dataset_v1/weights/best.pt`。
- 当前训练输出目录：`packages/perception/detector/models/yolov8/yolo_runs/final_dataset_v1/`。
- 当前类别来源：`config/competition/object_geometry.yaml` 与 detector class map。

治理规则：

- 新训练 run 不再直接落入主源码目录；默认落到 `.artifacts/model-runs/` 或外部 artifact store。
- 需要纳入仓库的模型必须补版本、数据集来源、训练命令、指标、类别映射和使用 profile。
- `last.pt`、中间 batch 图、临时导出文件默认不作为长期源码事实来源。

## Fairino SDK

- 当前运行期 SDK 目录：`vendor/fairino_sdk/`。
- 当前存在的厂商 web/control 软件：`vendor/fairino_sdk/software/`。
- 历史 backup：`vendor/fairino_sdk/software.backup_*/`。

治理规则：

- 厂商 SDK 更新必须记录版本、来源、替换范围和回滚方式。
- 新增 `software.backup_*` 默认由 `.gitignore` 阻止，确需保留时先登记 manifest。
- 不在业务节点中硬编码 vendor 内部路径；通过 CMake/launch/profile 管理。

## Runtime Artifacts

- `.artifacts/`：checkpoint、console security log、recording、运行验收证据。
- `build/`、`install/`、`log/`：colcon 生成物，不进入 Git。
- `packages/ops/competition_console_web/dist/`：前端构建产物，不进入 Git。

治理规则：

- 运行证据可以在 `.artifacts/` 中本地保留，但提交前只提交必要 manifest 或文档摘要。
- 敏感信息扫描至少覆盖常见 GitHub token、OpenAI key、密码赋值、API key 和 secret label。
