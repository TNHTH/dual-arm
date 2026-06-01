# 2026-05-08 Production Runtime Authority Closure

## Scope

本轮完成 dual-arm production runtime authority 软件架构收口。全程未启动真实硬件、未调用 `/competition/run`、未设置 `start_hardware:=true`。

唯一 production chain 固定为：

```text
scene_fusion -> /planning/* -> /execution/* -> /competition/run
```

## Changes

- 新增 `docs/architecture/runtime-authority.md` 和 `docs/architecture/adr/ADR-0001-production-runtime-authority.md`。
- 新增 `scripts/check_runtime_authority.py` 并接入 `scripts/ci/software_check.sh` 与 GitHub Actions。
- `competition_integrated.launch.py` 增加 `start_console_api`，默认 `false`；production console 参数强制 `allow_raw_motion_debug=false`。
- `competition_console_api_node.py` 默认不创建 raw robot motion clients；raw jog/servo stop 仅在 debug 参数和 `DUALARM_HARDWARE_CONFIRM_TOKEN` 匹配时启用。
- `quick_competition`、quick config、quick scripts 和 quick tests 归档到 `archive/quick_competition_2026-05-08/`，archive root 放置 `COLCON_IGNORE`。
- 新增 active competition configs：`config/competition/camera_profiles.yaml`、`pouring.yaml`、`handover.yaml`。
- `right_arm_grasp_precheck.py` 改为 camera profile 优先；device override 只作为 debug ephemeral，永不标记 verified。
- `orbbec_gemini_bridge` 默认禁用 auto `/dev/video*` 扫描；debug launch 可显式开启并标记 ephemeral。
- Motion-capable tools 默认 no-motion；真实动作入口需要显式 hardware 参数和 token。
- `task_contract.py` 增加 pouring/handover primitive sequence 与 checkpoint evidence skeleton。

## Verification

```text
python3 scripts/check_path_hardcodes.py
-> 路径硬编码检查通过。

python3 scripts/check_readme_coverage.py
-> README 覆盖检查通过，共检查 61 个目录。

python3 scripts/check_runtime_authority.py
-> runtime authority check passed.

python3 scripts/check_runtime_authority.py --launch-contracts
-> runtime authority check passed.

git diff --check
-> passed

/usr/bin/python3 -m pytest -q tests/unit tests/integration packages/tasks/dualarm_task_manager/test/test_dualarm_task_contract.py
-> 60 passed in 7.16s

colcon build --base-paths packages --packages-select competition_console_api robo_ctrl dualarm_task_manager execution_adapter competition_start_gate dualarm_bringup dualarm_simulation tools
-> 8 packages finished

colcon build --base-paths packages --packages-select orbbec_gemini_bridge dualarm_bringup
-> 2 packages finished

PYTHON_BIN=/usr/bin/python3 bash scripts/ci/software_check.sh
-> path/readme/runtime checks passed; 60 pytest passed; 8 packages built; 15 colcon tests; web build passed; Playwright 2 passed

ros2 launch dualarm_bringup competition_integrated.launch.py --show-args
ros2 launch dualarm_bringup competition_core.launch.py --show-args
ros2 launch dualarm_bringup competition_gazebo_full.launch.py --show-args
-> all show-args completed
```

Mock/no-motion smoke:

```text
pgrep stale process check
-> only the pgrep command itself was listed

timeout 10s ros2 launch dualarm_bringup competition_integrated.launch.py start_hardware:=false use_mock_camera_stream:=true publish_fake_joint_states:=true start_console_api:=false start_camera_bridge:=false start_detector:=false
-> core nodes, MoveGroup, planner, execution_adapter and task_manager started; timeout exit code 124 expected; /competition/run was not called

post-smoke pgrep stale process check
-> only the pgrep command itself was listed
```

## Non-Claims

- 不证明真机安全。
- 不证明比赛任务成功。
- 不证明右臂夹取可恢复。
- 不复用旧 JSON 作为 verified hardware evidence。

## Required Next Hardware Work

恢复右臂夹取前必须重新采集并记录：

- camera profile by-id/by-path/serial/usb_port
- 外参
- 深度单位
- ROI
- clearance gate
- `motion_done`
- gripper status
