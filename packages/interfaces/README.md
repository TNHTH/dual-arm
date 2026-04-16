# interfaces

## 目录作用

集中管理双臂系统统一的 msg、srv 和 action 协议。

## 包含内容

- `dualarm_interfaces`

## 入口文件或常用命令

```bash
ros2 interface list | grep dualarm_interfaces
ros2 interface show dualarm_interfaces/action/RunCompetition
```

## 上下游依赖

- 上游：无
- 下游：`perception/`、`planning/`、`control/`、`tasks/`、`ops/`

## 修改边界

- 只定义公共接口。
- 业务逻辑和节点实现不要放到这里。

## 相关链接

- `dualarm_interfaces/README.md`
- `../README.md`
