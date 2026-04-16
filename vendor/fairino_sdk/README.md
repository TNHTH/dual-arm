# fairino_sdk

## 目录作用

当前保留的 Fairino 厂商运行期资产目录，用于支撑双臂控制链的底层依赖和参考资料。

## 包含内容

- `software/`：厂商随附软件与资源。

## 入口文件或常用命令

```bash
find vendor/fairino_sdk -maxdepth 2 | sort
```

## 上下游依赖

- 上游：厂商发布包
- 下游：`packages/control/robo_ctrl` 和相关硬件接入说明

## 修改边界

- 仅保留运行所需 vendor 内容。
- 若出现 `software.backup_*` 等历史备份，迁到 `${HOME}/.cleanup-archive/dual-arm/YYYY-MM-DD/` 并更新 manifest。

## 相关链接

- `../../archive/vendor-archive-manifest.md`
- `../../packages/control/README.md`
