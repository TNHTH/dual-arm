# hardware

## 目录作用

预留真机、夹爪、控制器和相机相关硬件测试目录。

## 包含内容

- 当前阶段暂无统一硬件测试脚本，后续新增时放在这里。

## 入口文件或常用命令

```bash
find tests/hardware -maxdepth 2 -type f | sort
```

## 上下游依赖

- 上游：`robo_ctrl`、`epg50_gripper_ros`、相机桥接和网络环境
- 下游：现场验收和 runbook

## 修改边界

- 只放明确依赖真机的测试。
- 不要把 mock smoke 塞到这里。

## 相关链接

- `../acceptance/README.md`
- `../../docs/operations/runbooks/engineering-process-standards.md`
