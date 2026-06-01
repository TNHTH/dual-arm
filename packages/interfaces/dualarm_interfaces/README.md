# dualarm_interfaces

## 目录作用

定义双臂系统公共消息、服务和动作接口。

## 包含内容

- `action/`：`RunCompetition`、`ExecuteTrajectory`、`ExecutePrimitive`
- `srv/`：规划、夹爪、场景管理等服务
- `msg/`：检测、场景对象、任务事件等消息

## 入口文件或常用命令

```bash
ros2 interface show dualarm_interfaces/action/RunCompetition
ros2 interface show dualarm_interfaces/srv/PlanDualPose
```

## 上下游依赖

- 上游：无
- 下游：全仓主要运行包

## 修改边界

- 只改接口定义，不写运行逻辑。
- 变更接口后必须同步构建和回归上下游包。

## 相关链接

- `../README.md`
- `../../../docs/reference/repo-map.md`
