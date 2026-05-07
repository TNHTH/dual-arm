# PRD: dual-arm-runtime
generated: 2026-04-16

## Stories

### S-001
description: 仓库主根重构为 `packages/`，并保留 `src` 兼容入口
acceptanceCriteria:
  - `colcon list --base-paths packages` 可枚举所有正式包
  - `colcon list --base-paths packages` 与兼容模式 `src` 结果一致
  - 正式 launch 与脚本不再依赖旧工作区绝对路径或旧单层源码布局
passes: true
evidence: "`colcon list --base-paths packages --names-only` 与 `src` 结果一致；`build_workspace.sh --group full` 通过；路径硬编码检查通过"
incidentRefs: []

### S-008
description: README 体系化、路径治理和兼容入口补齐
acceptanceCriteria:
  - 根目录、一级目录、领域目录、缺失 ROS 包和关键非包目录均有 README
  - `scripts/check_readme_coverage.py` 通过
  - `scripts/check_path_hardcodes.py` 通过
  - `build_workspace.sh`、`use_workspace.sh`、`competition_console_api` 已切到 repo-root/path-layer 解析
passes: true
evidence: "README 覆盖检查通过；路径硬编码检查通过；workspace acceptance API 输出包路径均为 packages/...；single_arm_debug launch alias 已补齐"
incidentRefs:
  - 21

### S-002
description: 建立断点记录与端点接续能力
acceptanceCriteria:
  - 运行态可写入 `latest.json` 与 `runs/<run_id>.jsonl`
  - 支持从已提交端点恢复，不恢复到轨迹中点
passes: true
evidence: "RUN_STATE_SCHEMA/IMPLEMENTATION_BREAKPOINTS/SUBAGENT_REGISTRY 已建立；smoke_resume_checkpoint.py 输出 resume checkpoint smoke passed"
incidentRefs: []

### S-003
description: 左臂固连深度相机成为正式主链
acceptanceCriteria:
  - `world -> left_camera` 与 depth/color frame 连续可查
  - perception 输出 pose 数值与 frame 一致
passes: false
evidence: null
incidentRefs: []

### S-004
description: authoritative scene 与 MoveIt PlanningScene 真同步
acceptanceCriteria:
  - reserve/attach/detach/release/lost 同时影响 managed topic 与 MoveIt 世界模型
  - `scene_version` 合同闭合
passes: false
evidence: null
incidentRefs: []

### S-005
description: primitive 执行层替代关键占位状态
acceptanceCriteria:
  - 执行层支持 `ExecutePrimitive`
  - gripper status 能支撑接触/持物/脱离判断
passes: false
evidence: null
incidentRefs: []

### S-006
description: 纯软件开盖、倒水、人机协作任务闭环
acceptanceCriteria:
  - 水瓶与可乐瓶真实开盖
  - 两类倒水任务过半且无 spill
  - 篮球与足球接球后持稳 3 秒并先脱离再入筐
passes: false
evidence: null
incidentRefs: []

### S-007
description: 统一控制网页成为正式测试与验收入口
acceptanceCriteria:
  - 浏览器可一键启动/停止主链
  - 浏览器可一键运行 smoke、acceptance、整轮任务和断点恢复
  - 网页具备 Playwright E2E
passes: false
evidence: null
incidentRefs: []
# PRD: 2026-05-07 right arm depth precheck and practice control
generated: 2026-05-07

## Stories

### S-001
description: Implement no-motion right arm depth grasp precheck script.
acceptanceCriteria:
  - `packages/tools/tools/scripts/right_arm_grasp_precheck.py` reads right color and Z16 depth devices.
  - The script emits JSON with YOLO bbox, depth ROI stats, target 3D bbox, obstacle bbox, clearance gate, candidate TCP point, and safety gate.
  - Static scan confirms the script does not call motion, servo, gripper command, or `/competition/run`.
passes: true
evidence: "`/usr/bin/python3 -m py_compile packages/tools/tools/scripts/right_arm_grasp_precheck.py` passed; forbidden endpoint `rg` returned no matches; `colcon build --base-paths packages --packages-select tools` finished successfully."
incidentRefs: []

### S-002
description: Execute no-motion depth precheck and archive artifacts.
acceptanceCriteria:
  - The script writes a JSON artifact and annotated images under `.codex/tmp/runtime/`.
  - The JSON records `depth_scale_mm_per_raw=1.0` and marks right camera extrinsic as candidate only.
passes: true
evidence: "`.codex/tmp/runtime/right-arm-grasp-precheck-20260507-143327/right_arm_grasp_precheck.json` plus three images were written; JSON records `depth_scale_mm_per_raw=1.0`, `candidate/reference_left_extrinsic`, `safety_gate.passes=false`."
incidentRefs: []

### S-003
description: Perform right arm practice motion and verify stop closure.
acceptanceCriteria:
  - Pre-motion `/R/robot_state` has fresh samples with `motion_done=true` and `error_code=0`.
  - At least one controlled right-arm real motion is sent only after safety confirmation.
  - The total requested motion path is at least `100mm`, either as one move or segmented moves.
  - Post-motion samples confirm `motion_done=true`, `error_code=0`, and stable TCP.
passes: true
evidence: "Right arm executed `Z -20mm x 2` plus `X -20mm -> Y +20mm -> X +20mm -> Y -20mm`, total requested path `120mm`; post-motion samples show `motion_done=true`, `error_code=0`, final TCP around `[-31.95, -158.13, 583.02] mm`."
incidentRefs: []

### S-004
description: Perform right gripper local status/enable/open-close-open after arm is stable.
acceptanceCriteria:
  - Right gripper status returns `success=true` and `error=0` before command.
  - Enable and open/close/open command responses plus status readbacks are recorded.
passes: false
evidence: null
incidentRefs: []

### S-005
description: Bring up right-arm camera visualization and correct camera identity.
acceptanceCriteria:
  - The visualization uses the user-confirmed right-arm camera, not the left camera or laptop camera.
  - Detector overlay is visible and publishes at runtime.
passes: true
evidence: "User confirmed `/dev/video14` is the right-arm camera. `/right_camera_candidate/color/image_raw` ran at about `14.6 Hz`; `/detector/right_candidate/detections/image` ran at about `15 Hz`; one detection sample contained `class_id=2(cocacola)`."
incidentRefs: []

### S-006
description: Adjust right wrist J6 orientation for camera view using bounded small steps.
acceptanceCriteria:
  - J6 adjustment does not use a failed large MoveJ path after an error.
  - Any controller error is stopped/reset before retrying.
  - A successful bounded J6 step is recorded with final state closure.
passes: true
evidence: "Direct `/R/robot_move` J6 target `45deg` failed with error code `14`; direct SDK `StopMotion()` and `ResetAllError()` both returned `0`; bounded `ServoJ` J6 `+10deg` succeeded, J6 reached about `10.16deg`, and final samples reported `motion_done=true`, `error_code=0`."
incidentRefs: [46]

### S-007
description: Correct reference transform semantics and rotated-image geometry for right-arm scripted precheck.
acceptanceCriteria:
  - Camera-frame to TCP-frame point conversion follows the reference repository tf2 semantics.
  - 180-degree rotated detection/display images are mapped back to original camera rays for intrinsics projection.
  - The JSON records transform semantics and pixel coordinate notes.
passes: true
evidence: "`right_arm_grasp_precheck.py` now reports `candidate_extrinsic.semantics`; rotated pixel regression printed `rotated_pixel_point [0.29, 0.29, 1.0]`; `/usr/bin/python3 -m py_compile packages/tools/tools/scripts/right_arm_grasp_precheck.py packages/tools/tools/scripts/right_arm_autonomous_grasp_attempt.py` passed."
incidentRefs: [47, 48]

### S-008
description: Make target center/TCP alignment advisory by default while preserving explicit hard-gate flags.
acceptanceCriteria:
  - Alignment JSON includes camera-center and TCP-contact projection candidates.
  - Off-center target can still pass contact approach precheck unless explicit `--require-target-alignment-*` flags are used.
  - The report records whether alignment is advisory or enforced.
passes: true
evidence: "`.codex/tmp/runtime/right-arm-contact-approach-planonly-advisory-20260507-162115/right_arm_autonomous_grasp_attempt.json` has `precheck_gate.passes=true` and `target_alignment_gate.enforcement=advisory_reference_only` despite `target_alignment_gate.passes=false`."
incidentRefs: []

### S-009
description: Execute scripted planned right-arm approach and verify stop closure after each stage.
acceptanceCriteria:
  - Planned approach uses MoveIt `/planning/plan_pose` and `/execution/execute_trajectory`, not direct `/R/robot_move*`.
  - Every executed stage ends with `motion_done=true` and `error_code=0`.
  - Visual/depth precheck is reacquired after approach.
passes: true
evidence: "Executed `.codex/tmp/runtime/right-arm-contact-approach-execute-pregrasp-advisory-20260507-162142/`, `.codex/tmp/runtime/right-arm-contact-approach-execute-second-pregrasp-advisory-20260507-162307/`, and `.codex/tmp/runtime/right-arm-visual-recover-execute-edge-20260507-162508/`; each execution returned success and post-motion samples show `motion_done=true`, `error_code=0`."
incidentRefs: []

### S-010
description: Complete automatic grasp attempt with verified gripper contact.
acceptanceCriteria:
  - A plan contains an actual `grasp` stage, not only `pregrasp`.
  - The right gripper is open before approach and closes only after latest visual/depth reacquisition.
  - Grasp success is reported only when EPG50 `gobj in {1,2}` confirms object contact.
passes: false
evidence: "No grasp was executed. After approach, target bbox stayed on the image edge (`bbox_edge_margin_px=0.0`) and one depth ROI median jumped to about `0.802 m`; final gripper status remained open with `position=0`, `gobj=3`. See `.codex/tmp/runtime/right-arm-grasp-precheck-after-visual-recover-20260507-162527/right_arm_grasp_precheck.json`."
incidentRefs: [50]

### S-011
description: Convert ClaudeCode architecture review into the next implementation wave before further hardware grasp attempts.
acceptanceCriteria:
  - The review findings are recorded in project state and a next-window prompt.
  - Next window must address duplicated bridges/config/execution paths before resuming right-arm grasp.
passes: true
evidence: "State and handoff updated; next prompt written to `.codex/tmp/resume/NEXT_WINDOW_PROMPT_2026-05-07-right-arm-architecture-and-grasp.md`."
incidentRefs: []
