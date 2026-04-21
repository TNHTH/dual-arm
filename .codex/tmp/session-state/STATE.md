current_phase: "safe-closed / rviz-display-partial / dual-camera-contract-added"
story_id: "dual-arm-v4-rviz-scene-modeling"
updated_at: "2026-04-21"
coord_rev: 10
resolved:
  - "已新增 TaskCommand.srv 与 SetObjectInteraction.srv，并完成接口构建。"
  - "已新增 competition_rviz_tools 包和 dualarm_bringup/competition_rviz.launch.py。"
  - "RViz 中 RobotModel 与模型点云曾截图确认可见：/tmp/competition_rviz_latest.png。"
  - "scene_model_pointcloud 已改为对桌面支撑物体按 table surface 贴底显示。"
  - "fairino_dualarm.urdf.xacro 的 left/right base mount 已改成可配置 xacro 参数。"
  - "move_group / fairino_dualarm_planner / competition launch 已透传 left_base_xyz/right_base_xyz/right_base_rpy 等参数。"
  - "tf_node calibration_transforms.yaml 已新增 right_camera frame 链，状态为 unverified。"
  - "orbbec_gemini_bridge.launch.py 已支持 node_name/topic/frame 参数，便于左右相机分别启动。"
  - "安全收口后已确认无 ROS/RViz 业务进程残留。"
blocked_on:
  - "机械臂 RViz 姿态仍不准：需要实测 world_to_left_base/right_base 安装位姿。"
  - "模型点云空间位置仍不可信：left/right camera 外参都未 verified。"
  - "怡宝/可乐瓶尺寸仍需卡尺实测或可靠公开资料校准。"
  - "最新 table-surface 贴底模型点云改动只完成 build，尚未重新截图验收。"
  - "右臂相机已有 frame contract，但还没有正式桥接设备与标定。"
dead_ends:
  - "不要把默认 left_base=(0,0.35,0) / right_base=(0,-0.35,0,yaw=pi) 当现场事实。"
  - "不要把 RViz 进程存在当作 RViz 正常；必须截图确认。"
  - "不要把未 verified 外参下的 model pointcloud 当比赛级 world pose。"
next_action:
  - "启动 competition_rviz.launch.py，截图确认 RobotModel + scene_model_points + table/object pointcloud。"
  - "若机械臂姿态仍错，先测量并覆盖 left_base_xyz/right_base_xyz/right_base_rpy。"
  - "完成 left/right camera hand-eye 标定。"
  - "用实测尺寸更新 object_geometry.yaml，并重新打开 RViz 截图确认比例。"
last_evidence:
  - "/tmp/competition_rviz_latest.png"
  - "colcon build --packages-select fairino_dualarm_description fairino_dualarm_moveit_config fairino_dualarm_planner orbbec_gemini_bridge tf_node competition_rviz_tools dualarm_bringup: passed"
  - "xacro fairino_dualarm.urdf.xacro with base args: passed"
open_incidents:
  - "Incident 38"
