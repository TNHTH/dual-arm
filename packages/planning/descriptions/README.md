# descriptions

## 目录作用

集中管理单臂和双臂的 URDF/Xacro 描述包。

## 包含内容

- `fairino_description`
- `fairino_dualarm_description`

## 入口文件或常用命令

```bash
find packages/planning/descriptions -maxdepth 3 -name '*.xacro' | sort
```

## 上下游依赖

- 上游：机械结构与标定约定
- 下游：MoveIt 配置、planner 和 RViz 可视化

## 修改边界

- 只放机器人描述。
- 控制器、MoveIt 参数和规划服务不要写到这里。

## 相关链接

- `fairino_description/README.md`
- `fairino_dualarm_description/README.md`
