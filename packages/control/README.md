# control

## 目录作用

保存机械臂控制、夹爪驱动和执行适配层。

## 包含内容

- `robo_ctrl`
- `epg50_gripper_ros`
- `execution_adapter`

## 入口文件或常用命令

```bash
./build_workspace.sh --group control
ros2 launch execution_adapter execution_adapter.launch.py
```

## 上下游依赖

- 上游：`planning/` 输出的轨迹和 primitive 请求
- 下游：真机控制器、夹爪与任务状态机

## 修改边界

- 与真机动作直接相关的代码放这里。
- 不在这里写场景融合或任务编排逻辑。

## 相关链接

- `execution_adapter/README.md`
- `../tasks/README.md`
