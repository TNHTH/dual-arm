# fairino3_v6_planner

## 目录作用

legacy 单臂规划器参考实现，当前主要用于回溯旧行为和比对。

## 包含内容

- `launch/pose_goal_planner.launch.py`
- `scripts/*.py`
- `src/pose_goal_planner.cpp`
- `COLCON_IGNORE`

## 入口文件或常用命令

```bash
find packages/planning/legacy/fairino3_v6_planner -maxdepth 2 | sort
```

## 上下游依赖

- 上游：旧单臂规划链
- 下游：人工参考和回归比对

## 修改边界

- 默认不参与正式构建。
- 若取消 `COLCON_IGNORE`，必须先明确兼容边界和验证范围。

## 相关链接

- `../README.md`
- `../../planners/fairino_dualarm_planner/README.md`
