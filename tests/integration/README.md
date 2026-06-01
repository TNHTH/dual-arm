# integration

## 目录作用

预留多包集成测试与接口联调测试目录。

## 包含内容

- 当前阶段暂无统一集成测试文件，后续新增时放在这里。

## 入口文件或常用命令

```bash
find tests/integration -maxdepth 2 -type f | sort
```

## 上下游依赖

- 上游：感知、规划、执行、任务管理多包联调
- 下游：验收脚本和回归测试

## 修改边界

- 只放跨包联调测试。
- 真机依赖强的测试应放 `tests/hardware`。

## 相关链接

- `../hardware/README.md`
- `../acceptance/README.md`
