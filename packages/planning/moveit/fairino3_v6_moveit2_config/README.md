# fairino3_v6_moveit2_config

## 目录作用

单臂 Fairino V6 的 MoveIt 运行时配置包，主要用于兼容和参考。

## 包含内容

- `config/*.yaml`
- `config/*.xacro`
- `launch/*.launch.py`

## 入口文件或常用命令

```bash
ros2 launch fairino3_v6_moveit2_config move_group.launch.py
```

## 上下游依赖

- 上游：`fairino_description`
- 下游：legacy 单臂规划与比对流程

## 修改边界

- 单臂 MoveIt 配置放这里。
- 双臂配置请改 `fairino_dualarm_moveit_config`。

## 相关链接

- `../README.md`
- `../../descriptions/fairino_description/README.md`
