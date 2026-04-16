# competition_start_gate

## 目录作用

比赛启动前的门控节点，负责把启动条件检查显式化。

## 包含内容

- `launch/competition_start_gate.launch.py`
- `scripts/competition_start_gate_node.py`

## 入口文件或常用命令

```bash
ros2 launch competition_start_gate competition_start_gate.launch.py
```

## 上下游依赖

- 上游：控制台或人工启动动作
- 下游：`dualarm_bringup` 与任务状态机

## 修改边界

- 这里只做启动门控。
- 不直接承载完整比赛流程。

## 相关链接

- `../README.md`
- `../dualarm_bringup/README.md`
