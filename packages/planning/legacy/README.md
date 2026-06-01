# legacy

## 目录作用

保存规划域中的 legacy 包和仅参考实现。

## 包含内容

- `fairino3_v6_planner`

## 入口文件或常用命令

```bash
find packages/planning/legacy -maxdepth 2 | sort
```

## 上下游依赖

- 上游：旧单臂规划实现
- 下游：人工参考和回归比对

## 修改边界

- 默认不作为主链继续演进。
- 若需要保持不可构建状态，请保留 `COLCON_IGNORE`。

## 相关链接

- `fairino3_v6_planner/README.md`
- `../../../archive/legacy/README.md`
