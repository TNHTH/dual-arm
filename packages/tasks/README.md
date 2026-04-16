# tasks

## 目录作用

保存比赛任务管理和状态机编排逻辑。

## 包含内容

- `dualarm_task_manager`

## 入口文件或常用命令

```bash
ros2 launch dualarm_task_manager dualarm_task_manager.launch.py
```

## 上下游依赖

- 上游：`planning/`、`control/`、`interfaces/`
- 下游：控制台 API 与比赛运行链

## 修改边界

- 任务编排和恢复逻辑放这里。
- 不要在这里复制具体检测或动作驱动实现。

## 相关链接

- `dualarm_task_manager/README.md`
- `../ops/README.md`
