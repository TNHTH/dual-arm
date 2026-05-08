# unit

## 目录作用

单元测试放置位置。

## 包含内容

- runtime authority、safety、simulation 和配置合同测试。

## 入口文件或常用命令

```bash
find tests/unit -maxdepth 2 -type f | sort
/usr/bin/python3 -m pytest -q tests/unit
```

## 上下游依赖

- 上游：各包模块级实现
- 下游：CI 和本地快速回归

## 修改边界

- 只放纯单元级测试。
- 需要 ROS graph 的测试应移到 `tests/integration` 或 `tests/acceptance`。

## 相关链接

- `../integration/README.md`
- `../README.md`
