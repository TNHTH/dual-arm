# Vendor Archive Manifest

更新时间：2026-04-16

## 当前保留项

| 路径 | 状态 | 说明 |
| --- | --- | --- |
| `vendor/fairino_sdk` | 保留 | 当前运行链仍需的厂商资产 |
| `third_party -> vendor` | 兼容中 | 旧目录名兼容别名 |

## 本轮归档结果

- 在当前 clean 基线中，未发现 `software.backup_*` 或其他需要立即迁出的备份目录。
- 预留归档目标：`${HOME}/.cleanup-archive/dual-arm/2026-04-16/`

## 后续处理规则

当 `vendor/fairino_sdk` 中出现以下内容时，优先迁出并登记：

- `software.backup_*`
- 临时安装包
- 厂商历史镜像
- 与当前运行链无关的整套重复软件目录

## 相关链接

- `../vendor/README.md`
- `legacy-import-manifest.md`
