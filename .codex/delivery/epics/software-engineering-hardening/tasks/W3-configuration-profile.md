# W3 Configuration Profile

> 状态：完成
> 创建时间：2026-04-26

## 目标

建立统一运行 profile，减少运行链路对硬编码路径、兼容 symlink 和散落默认值的依赖。

## 已完成修改

- 新增 `config/profiles/competition_default.yaml`。
- 新增 `config/profiles/README.md`。
- `competition_core.launch.py` 从 profile 读取 detector、机器人 IP/端口、base transform、gripper 端口等默认值。
- `competition_core.launch.py` 的 detector 模型默认路径改为 canonical `packages/...`，保留安装包 fallback。
- 右臂 base yaw 默认与 `workspace_profiles.yaml` 对齐为 `180.0`。
- 左右夹爪端口默认改为 `auto`，避免软件-only 默认含真实 by-id 设备路径。
- `grasp_pose_generator` 的 workspace profile 路径从 `configs` 兼容别名改为 canonical `config`。
- `config/README.md` 补充 profile、competition、control 目录说明。
- 顶层测试补充 profile 默认值和 canonical path 契约。

## 验证证据

- `/usr/bin/python3 -m py_compile packages/bringup/dualarm_bringup/launch/competition_core.launch.py packages/planning/grasp_pose_generator/scripts/grasp_pose_generator_node.py`：通过。
- `/usr/bin/python3 -m pytest -q tests/unit tests/integration`：`10 passed`。
- `colcon build --base-paths packages --packages-select dualarm_bringup grasp_pose_generator`：通过。
- `ros2 launch dualarm_bringup competition_core.launch.py --show-args`：通过；显示 `right_base_rpy` 默认 `0.0 0.0 180.0`，左右 gripper port 默认 `auto`。
- `bash scripts/ci/software_check.sh`：通过。

## Next Actions

- Wave 4 修复任务语义和接口契约：任务顺序校验、start gate、对象选择、evidence 和 checkpoint。
