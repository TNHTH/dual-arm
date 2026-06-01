# profiles

## 目录作用

存放跨包运行 profile。profile 是 launch、控制台、感知、控制和任务默认值的统一入口；包内私有参数仍可保留在包目录，但比赛运行链路优先从这里读取默认值。

## 包含内容

- `competition_default.yaml`：软件-only 和比赛链路共用的默认 profile。

## 使用原则

- 命令行 launch 参数可以覆盖 profile 默认值。
- 真机 IP、串口、模型路径等高风险参数必须在 profile 中有说明，不能只散落在代码里。
- 软件-only 验证默认不连接真实设备。
