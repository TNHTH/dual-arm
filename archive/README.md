# archive

## 目录作用

存放仓库内的 legacy 资产、迁移清单和归档说明。

## 包含内容

- `legacy/`：旧目录实体与兼容保留内容
- `legacy-import-manifest.md`
- `vendor-archive-manifest.md`

## 入口文件或常用命令

```bash
find archive -maxdepth 2 | sort
```

## 上下游依赖

- 上游：历史目录、旧仓抽取记录
- 下游：路径迁移说明、回溯排查和兼容入口

## 修改边界

- 归档区不参与正式构建。
- 任何迁入或移出的历史资产都要先登记清单。

## 相关链接

- `legacy/README.md`
- `../docs/archive/README.md`
