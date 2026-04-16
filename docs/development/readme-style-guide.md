# README 维护规范

创建时间：2026-04-16

## 目标

为仓库根目录、一级目录、领域目录、ROS 包和关键非包目录提供统一的 README 模板，确保 GitHub 游客和协作者都能快速找到入口。

## 根 README 规则

- 只承担仓库级导航。
- 必须包含：项目定位、快速开始、目录导航、常用命令、文档索引、硬件/仿真边界。
- 不把每个包的所有参数和调试细节堆到首页。

## 包级 README 最小章节

每个目录 README 默认包含：

1. 目录作用
2. 包含内容
3. 入口文件或常用命令
4. 上下游依赖
5. 修改边界
6. 相关链接

## 目录叙事约定

- 正式源码根统一写 `packages/`。
- `src`、`third_party`、根 `launch`、根 `arm_planner` 等旧入口只作为兼容层说明。
- `build/`、`install/`、`log/`、`.artifacts/` 被描述为生成物或证据，不作为源码事实来源。
- `archive/`、`docs/archive/` 只描述为历史参考和迁移记录。

## 校验规则

- 新增目录后同步补 README。
- 提交前至少执行：

```bash
python3 scripts/check_readme_coverage.py
python3 scripts/check_path_hardcodes.py
```

## 参考

- GitHub README 说明：<https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes>
- colcon package discovery：<https://colcon.readthedocs.io/en/released/reference/discovery-arguments.html>
- ROS 2 Developer Guide 文档约定：<https://docs.ros.org/en/ros2_documentation/kilted/The-ROS2-Project/Contributing/Developer-Guide.html#documentation>
