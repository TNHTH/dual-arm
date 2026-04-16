# vendor

## 目录作用

保存当前仍参与运行链的第三方依赖和厂商资产。

## 包含内容

- `fairino_sdk/`：当前保留的 Fairino 运行期资产。

## 入口文件或常用命令

```bash
find vendor -maxdepth 2 -type d | sort
```

## 上下游依赖

- 上游：厂商 SDK 与随附资源
- 下游：`robo_ctrl`、运行时文档和厂商侧参考

## 修改边界

- 只保留当前运行必需依赖。
- 备份包和历史安装包应迁到 `${HOME}/.cleanup-archive/dual-arm/` 并登记清单。

## 相关链接

- `fairino_sdk/README.md`
- `../archive/vendor-archive-manifest.md`
