# dualarm

## 目录作用

历史双臂兼容包，保留旧控制入口和遗留调试逻辑。

## 包含内容

- `launch/robot_main.launch.py`
- `src/main.cpp`
- `src/main_refactored.cpp`
- `config/config.yaml`

## 入口文件或常用命令

```bash
ros2 launch dualarm robot_main.launch.py
ros2 run dualarm robot_main
```

## 上下游依赖

- 上游：历史控制流程和服务模板
- 下游：兼容期调试和旧脚本

## 修改边界

- 新功能尽量不要继续加在这个包里。
- 若必须修改，优先只做兼容层或回归保真。

## 相关链接

- `../README.md`
- `README_ServiceTemplate_Refactoring.md`
