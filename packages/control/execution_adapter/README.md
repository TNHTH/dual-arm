# execution_adapter

## 目录作用

把规划输出、primitive 和夹爪动作统一适配到执行层。

## 包含内容

- `launch/execution_adapter.launch.py`
- `scripts/execution_adapter_node.py`

## 入口文件或常用命令

```bash
ros2 launch execution_adapter execution_adapter.launch.py
```

## 上下游依赖

- 上游：`fairino_dualarm_planner`、`dualarm_task_manager`
- 下游：`robo_ctrl`、`epg50_gripper_ros`

## 修改边界

- 负责执行适配，不负责生成轨迹或定义比赛任务。
- 新 primitive 应先评估是否属于控制层还是任务层。

## 相关链接

- `../README.md`
- `../../planning/planners/fairino_dualarm_planner/README.md`
