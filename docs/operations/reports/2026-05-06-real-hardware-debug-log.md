# 2026-05-06 Real Hardware Debug Log

创建时间：2026-05-06 15:28 +0800
状态：实机只读链路已复测；后续补充一次右臂低速 `Z +3.0 mm` 增量测试并已用 `StopMotion()` 停稳；未执行夹爪 enable/open/close 或 `/competition/run`

## 结论

本轮在 `ROS_DOMAIN_ID=0` 上完成了左右机械臂网络连通、左右 `robo_ctrl` 只读状态、左右 EPG50 夹爪 status service、以及 `quick_hardware_smoke_test.sh` 的 no-motion 检查。左右 `/robot_state` 均有 5 Hz 当前状态证据，左右夹爪 status service 均返回 `success=True`、`error=0`。2026-05-07 补充：后续曾执行一次右臂低速 `Z +3.0 mm` 增量测试，服务返回成功但 `motion_done=false` 持续数秒；已通过直连 SDK `StopMotion()` 返回 `ret=0` 停稳，停止后连续 5 帧 `/R/robot_state` 为 `motion_done=true`、`error_code=0`。

不能声明实机比赛链路跑通。除 2026-05-07 记录的一次右臂低速 `Z +3.0 mm` 增量测试外，本报告其余硬件采样均为 no-motion/read-only；没有调用夹爪控制命令，没有启动 `/competition/run`。用户现场确认右夹爪已经抵在桌子相邻边夹角的桌角处；随后左臂移到同一物理点，右臂又移到新的非桌角点。这些姿态都只记录为接触点标定候选，不作为安全可动状态。用户补充确认：此前所有触桌接触都是夹爪指尖触桌，不是机器人控制器 TCP 直接触桌。

## 约束

- 工作目录：`/home/gwh/dual-arm`
- 实机窗口显式使用 `ROS_DOMAIN_ID=0`。
- 另一个窗口的 Gazebo/MoveIt 仿真进程保留，不清理、不 kill。
- 当前右夹爪接触桌角；后续只允许读取状态或人工拖动后读取新静态点，禁止自动贴近、禁止夹爪控制、禁止运动命令。
- 接触几何前提：现场所有标定接触均为夹爪指尖触桌；`/L/robot_state` 和 `/R/robot_state` 中的 `tcp_pose` 是控制器 TCP，不等同于指尖接触点。

## 旧进程检查

宿主机旧进程检查发现另一个窗口的仿真/RViz 进程，已记录但未清理：

- `ros2 launch dualarm_bringup competition_gazebo_full.launch.py gui:=false`
- `planning_scene_sync_node.py`
- `move_group`
- `fairino_dualarm_planner_node`
- `competition_rviz.launch.py`
- `rviz2`

`ROS_DOMAIN_ID=0` 初始 `ros2 node list` 为空，未进入仿真窗口 ROS graph。

## 网络与串口

网络：

- 宿主机 `enp5s0`: `192.168.58.10/24`
- 左臂 `192.168.58.2`: `ping -c 2` 0% packet loss，`nc -vz 192.168.58.2 8080` succeeded
- 右臂 `192.168.58.3`: `ping -c 2` 0% packet loss，`nc -vz 192.168.58.3 8080` succeeded

串口 by-id：

- `/dev/serial/by-id/usb-Prolific_Technology_Inc._USB-Serial_Controller_A7BIb114J19-if00-port0 -> ../../ttyUSB1`
- `/dev/serial/by-id/usb-Prolific_Technology_Inc._USB-Serial_Controller_A_COb114J19-if00-port0 -> ../../ttyUSB0`

注意：裸 `/dev/ttyUSB*` 映射与 2026-05-01 记录不同，后续只使用 by-id。

## 左右机械臂只读状态

左臂只读启动：

```bash
export ROS_DOMAIN_ID=0
source /opt/ros/humble/setup.bash
source /home/gwh/dual-arm/install/setup.bash
ros2 launch robo_ctrl robo_ctrl_L.launch.py \
  robot_ip:=192.168.58.2 \
  robot_port:=8080 \
  state_query_interval:=0.2 \
  start_high_level:=false \
  start_gripper:=false
```

左臂 `/L/robot_state` 证据：

- `joint_position`: `[-39.2421, -41.5281, -2.9304, -66.4042, -90.8508, -74.2319]`
- `tcp_pose`: `[-459.9956, 245.9422, 436.6226, -174.8978, -20.2733, 123.9204]`
- `motion_done=true`
- `error_code=0`

右臂只读启动：

```bash
export ROS_DOMAIN_ID=0
source /opt/ros/humble/setup.bash
source /home/gwh/dual-arm/install/setup.bash
ros2 launch robo_ctrl robo_ctrl_R.launch.py \
  robot_ip:=192.168.58.3 \
  robot_port:=8080 \
  state_query_interval:=0.2 \
  start_high_level:=false
```

右臂 `/R/robot_state` 证据：

- `joint_position`: `[81.9813, -58.7075, 74.8243, -108.8417, -95.1971, 0.1695]`
- `tcp_pose`: `[24.7092, -490.8670, 218.0168, -177.2486, -5.1831, 171.5636]`
- `motion_done=true`
- `error_code=0`
- 现场语义：上一轮右夹爪桌角姿态记录为 `P_corner_R_candidate`；本轮右臂已转到新的非桌角点，当前只记为 `P2_R_candidate`。

`ros2 topic hz /L/robot_state` 与 `/R/robot_state` 均约 `4.996 Hz`。期间 `ros2 topic echo --once /L/robot_state` 偶发出现 `topic ... does not appear to be published yet`，显式指定消息类型后可读取，判断为 ROS CLI/DDS 发现短暂不一致，非当前硬件断链证据。

## 夹爪只读状态

左夹爪：

```bash
export ROS_DOMAIN_ID=0
export LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libstdc++.so.6
source /opt/ros/humble/setup.bash
source /home/gwh/dual-arm/install/setup.bash
ros2 run epg50_gripper_ros epg50_gripper_node --ros-args \
  -r __ns:=/gripper0 \
  -p port:=/dev/serial/by-id/usb-Prolific_Technology_Inc._USB-Serial_Controller_A7BIb114J19-if00-port0 \
  -p default_slave_id:=9 \
  -p disable_on_shutdown:=false \
  -p debug:=false
```

`/gripper0/epg50_gripper/status` with `{slave_id: 9}`:

- `success=True`
- `gact=False`, `gsta=0`, `gobj=0`
- `error=0`
- `position=0`, `speed=0`, `force=0`
- `voltage=23`, `temperature=32`
- `error_message='正常'`

右夹爪：

```bash
export ROS_DOMAIN_ID=0
export LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libstdc++.so.6
source /opt/ros/humble/setup.bash
source /home/gwh/dual-arm/install/setup.bash
ros2 run epg50_gripper_ros epg50_gripper_node --ros-args \
  -r __ns:=/gripper1 \
  -p port:=/dev/serial/by-id/usb-Prolific_Technology_Inc._USB-Serial_Controller_A_COb114J19-if00-port0 \
  -p default_slave_id:=10 \
  -p disable_on_shutdown:=false \
  -p debug:=false
```

`/gripper1/epg50_gripper/status` with `{slave_id: 10}`:

- `success=True`
- `gact=False`, `gsta=0`, `gobj=0`
- `error=0`
- `position=0`, `speed=0`, `force=0`
- `voltage=23`, `temperature=31`
- `error_message='正常'`

未调用 `/gripper*/epg50_gripper/command`。

## quick no-motion smoke

执行：

```bash
export ROS_DOMAIN_ID=0
source /opt/ros/humble/setup.bash
source /home/gwh/dual-arm/install/setup.bash
bash scripts/quick/quick_hardware_smoke_test.sh
```

结果：

- `/L/joint_states`, `/L/robot_state`, `/R/joint_states`, `/R/robot_state` 存在。
- `/L/robot_state` 和 `/R/robot_state` 频率约 `4.996 Hz`。
- 脚本读取左右 `robot_state` 成功，均为 `motion_done=true`, `error_code=0`。
- quick depth/frame 自检输出：
  - `primary_camera: left`
  - `scene_source_override: manual`
  - `left depth topic: /left_camera/depth/image_raw`
  - `left camera_info: /left_camera/depth/camera_info`
  - `depth frame: left_camera_depth_frame`
  - `manual 模式不使用 depth 生成最终 3D pose`
  - `right depth disabled: verified=false`
  - `quick_left_motion_base -> table_frame`
  - `quick_right_motion_base -> table_frame`
  - `table_frame -> table_frame_corrected`
  - `execution_frame: table_frame_corrected`
  - final: `[OK] hardware smoke no-motion checks completed`

## 15:41 接触点补充采样

本轮补充采样形成了两组候选点：

- `P_corner_L_candidate`：左臂移动到上一轮右臂所在的桌角物理点。
- `P2_R_candidate`：右臂移动到新的非桌角物理点。

对应当前只读状态：

- 左臂 `/L/robot_state`：
  - `joint_position`: `[-105.9123, -71.0008, 102.4520, -124.5858, -89.8616, -74.2343]`
  - `tcp_pose`: `[12.2232, 415.7925, 185.2491, -179.0144, -2.9791, 58.3001]`
  - `motion_done=true`
  - `error_code=0`
- 右臂 `/R/robot_state`：
  - `joint_position`: `[35.6114, -43.2043, 46.7722, -93.7395, -95.2449, 0.1658]`
  - `tcp_pose`: `[-389.7625, -393.3788, 217.4781, -179.8124, -5.2444, 125.4291]`
  - `motion_done=true`
  - `error_code=0`

`ros2 topic hz /L/robot_state` 与 `/R/robot_state` 仍约 `4.995 Hz`。

## 15:51 接触点补充采样

用户说明：右臂已放到新的物理点，左臂继续放在刚刚的点。根据当前只读状态，本轮记录：

- `P_left_current_1551_candidate`：左臂当前点，用户描述为保持上一点；因 TCP 与 15:41 的 `P_corner_L_candidate` 相差约 390.6 mm，暂不自动合并为同一 TCP 点，需结合夹爪实际接触点和工具偏移确认。
- `P3_R_candidate`：右臂新的物理点。

对应当前只读状态：

- 左臂 `/L/robot_state`：
  - `joint_position`: `[-58.4238, -41.5364, 52.5727, -103.2043, -87.9698, -74.2349]`
  - `tcp_pose`: `[-378.3639, 414.0353, 183.7158, -177.4574, -1.5350, 105.8155]`
  - `motion_done=true`
  - `error_code=0`
- 右臂 `/R/robot_state`：
  - `joint_position`: `[37.4086, -94.0771, 119.5093, -114.3470, -85.4432, 0.1482]`
  - `tcp_pose`: `[-169.0668, -267.7144, 214.6276, 178.8996, 4.5532, 127.1735]`
  - `motion_done=true`
  - `error_code=0`

`ros2 topic hz /L/robot_state` 与 `/R/robot_state` 仍约 `4.996 Hz`。

## 接触几何说明

用户确认所有历史接触都是夹爪指尖触到桌面/桌角。因此当前记录的 `tcp_pose` 只能作为“TCP 位姿”，不能直接当成物理接触点坐标使用。

模型检查：

- `packages/planning/descriptions/fairino_dualarm_description/urdf/fairino_dualarm.urdf.xacro` 当前主 MoveIt URDF 只包含双臂、`left_tcp`/`right_tcp` 和右相机碰撞体；未发现正式 gripper/fingertip link。
- `packages/planning/descriptions/fairino_dualarm_description/urdf/fairino3_v6_macro.xacro` 中 `tool0_to_tcp` 是固定 `xyz="0 0 0.10"`。
- `packages/tools/tools/config/static_transforms.yaml` 记录了历史末端 TF：
  - `Ltcp -> Lend`: `[-0.019899, -0.003972, 0.191327] m`
  - `Rtcp -> Rend`: `[0.030650, -0.007066, 0.190848] m`
- `tools` README 提到 `tcp_to_gripper_tf_config.yaml`，但当前 `packages/tools/tools/config/` 中未找到该文件；实际可用的是 `static_transforms.yaml`。

2026-05-06 补充模型交叉验证：

- 已用 `xacro fairino_dualarm.urdf.xacro` 生成当前 active 双臂 robot description 并搜索：只包含 `left_tool0/left_tcp/right_tool0/right_tcp` 和右相机碰撞体，没有 `gripper_Link`、`finger` 或 `fingertip` link；`fairino_dualarm.srdf` 的 MoveIt tip 也是 `left_tcp` / `right_tcp`。
- vendor SDK 模型 `vendor/fairino_sdk/software/robot_model/data/cobots/urdf/fr3v6.urdf` 确实包含 gripper 安装关系：`j6_Link -> gripper_Link` 为 `xyz="0 0 0.107"`、`rpy="0 0 1.570796"`；但 `gripper_Link` link 本体在该 URDF 片段中处于注释块内，当前项目 active URDF 也没有接入这个 link。
- 若近似认为 `j6_Link` 等同当前 `wrist3_link`，而当前 TCP 是 `wrist3_link -> tcp = [0, 0, 0.100] m`，则 vendor `gripper_Link` 原点相对当前 TCP 为 `[0, 0, 0.007] m`，并带 `Rz(90deg)` 旋转。
- vendor `gripper.dae` 与 `gripper1.stl` bbox 一致：mesh 坐标范围约 `x=[-37.5, 37.5] mm`、`y=[-76.7, 76.7] mm`、`z=[-10.9, 154.0] mm`。换到当前 TCP 坐标后，整体外形范围约 `x=[-76.7, 76.7] mm`、`y=[-37.5, 37.5] mm`、`z=[-3.9, 161.0] mm`。
- 若把 vendor mesh 的两侧远端指尖极值 `y=+/-76.7 mm, z=88.0 mm` 当作触桌点，则候选 TCP 偏移约为 `[+/-76.7, +/-9.0, 95.0] mm`，具体符号取决于触碰的是哪一侧夹指和哪个指尖角。
- 与已采集触桌数据交叉验证：`Lend/Rend` 候选偏移使左臂三个触桌候选点的 base-z 落在约 `[-7.7, -3.8] mm`，右臂四个触桌候选点落在约 `[19.0, 31.3] mm`；vendor mesh 远端指尖候选会把触桌 base-z 推到约 `L=86-95 mm`、`R=111-130 mm`。考虑当前 TCP 姿态接近向下、桌面应接近机械臂安装基准平面，本轮继续把 `Lend/Rend` 作为更符合现场数据的指尖候选偏移，但仍不得标为 `verified`。

后续标定应使用：

```text
finger_contact_point_in_base = tcp_pose * tcp_to_fingertip_offset
```

其中 `tcp_to_fingertip_offset` 需要按左右夹爪实际指尖、夹爪开口状态、接触侧和工具安装方向确定。当前可先把 `Lend/Rend` 当作候选指尖偏移，但必须现场确认它们是否等同真实触桌指尖。若左右臂接触的是同一个物理点，但 TCP 数值差异很大，这可能是正常的工具偏移/姿态差异，不应自动判定为点位错误；但在未求出工具偏移前，也不能把该点标为 `verified`。

使用 `Lend/Rend` 候选偏移按 RPY 旋转换算出的指尖候选点：

- `P_corner_R_candidate`: `[-24.869, -499.910, 31.275] mm`
- `P_corner_L_candidate`: `[0.824, 411.157, -6.757] mm`
- `P2_R_candidate`: `[-423.834, -358.755, 30.255] mm`
- `P_left_current_1551_candidate`: `[-386.321, 396.424, -7.711] mm`
- `P3_R_candidate`: `[-181.078, -257.502, 21.849] mm`

这些点仍分别处在各自机械臂 base 坐标系内，不能直接互相比大小；它们用于后续求左右 base/桌面之间的变换。

## 16:04 接触点补充采样

用户说明：左臂已放到右臂上一轮 `P3_R_candidate` 对应的物理点；右臂放到桌子的另一个边角点。当前记录：

- `P3_L_candidate`：左臂对应上一轮右臂 `P3_R_candidate` 的同物理点候选。
- `P_corner2_R_candidate`：右臂新的桌子另一边角候选点。

对应当前只读状态：

- 左臂 `/L/robot_state`：
  - `joint_position`: `[-82.7784, -36.7159, 43.8646, -101.3072, -83.2057, -74.2356]`
  - `tcp_pose`: `[-184.7715, 552.6743, 185.8906, -172.3366, -2.1623, 81.5593]`
  - `motion_done=true`
  - `error_code=0`
  - 使用 `Ltcp -> Lend` 候选偏移换算指尖点：`[-215.775, 544.385, -3.814] mm`
- 右臂 `/R/robot_state`：
  - `joint_position`: `[-38.2104, -81.8290, 108.0376, -116.3017, -85.3392, 0.1318]`
  - `tcp_pose`: `[-348.8521, 134.4679, 211.6604, -179.9173, 4.6610, 51.6649]`
  - `motion_done=true`
  - `error_code=0`
  - 使用 `Rtcp -> Rend` 候选偏移换算指尖点：`[-345.281, 150.820, 18.963] mm`

`ros2 topic hz /L/robot_state` 与 `/R/robot_state` 仍约 `4.995 Hz`。本窗口启动的左右 `robo_ctrl` 节点随后已停止。

## 16:22 第三点左臂采样

用户说明：左臂当前已摆到第三个标定点，右臂暂未放到该点，后续再补右臂同物理点采样。当前记录：

- `P_calib3_L_candidate`：左臂第三点候选。

对应当前只读状态：

- 左臂 `/L/robot_state`：
  - `joint_position`: `[-63.6187, -20.9434, 13.0011, -89.7977, -83.1891, -74.2480]`
  - `tcp_pose`: `[-374.6696, 499.1434, 188.5948, -171.3510, -5.6079, 100.6662]`
  - `motion_done=true`
  - `error_code=0`
  - 使用 `Ltcp -> Lend` 候选偏移换算指尖点：`[-406.548, 491.737, -1.001] mm`

`ros2 topic hz /L/robot_state` 仍约 `4.995 Hz`。本窗口启动的左臂 `robo_ctrl` 节点随后已停止。

## 16:31 第三点右臂采样

用户说明：右臂已放到与 `P_calib3_L_candidate` 相同的物理点；左臂已移动到一个相机可见桌面位姿，不再作为该点配对读数。当前记录：

- `P_calib3_R_candidate`：右臂第三点候选。

对应当前只读状态：

- 右臂 `/R/robot_state`：
  - `joint_position`: `[22.1878, -64.3512, 83.8661, -111.7260, -88.2629, 0.1329]`
  - `tcp_pose`: `[-379.9695, -268.3993, 216.2925, -177.7920, 1.7410, 112.1220]`
  - `motion_done=true`
  - `error_code=0`
  - 使用 `Rtcp -> Rend` 候选偏移换算指尖点：`[-402.680, -250.806, 25.015] mm`

`ros2 topic hz /R/robot_state` 仍约 `4.995 Hz`。本窗口启动的右臂 `robo_ctrl` 节点随后已停止。

## 16:38 第四点右臂采样

用户说明：右臂已摆到第四个参考点，左臂尚未放到该同物理点。当前记录：

- `P_calib4_R_candidate`：右臂第四点候选。

对应当前只读状态：

- 右臂 `/R/robot_state`：
  - `joint_position`: `[51.7265, -13.9903, -12.3123, -66.8193, -88.6275, 0.1325]`
  - `tcp_pose`: `[-286.0629, -531.1006, 219.7707, -176.8804, 1.3777, 141.6689]`
  - `motion_done=true`
  - `error_code=0`
  - 使用 `Rtcp -> Rend` 候选偏移换算指尖点：`[-317.329, -528.615, 28.908] mm`

`ros2 topic hz /R/robot_state` 约 `4.996 Hz`。本窗口启动的右臂 `robo_ctrl` 节点随后已停止。该点当前只有右臂读数，必须补左臂同物理点后才能作为第四点残差验证。

## 16:44 第四点左臂采样

用户说明：左臂已放到与 `P_calib4_R_candidate` 相同的物理点。当前记录：

- `P_calib4_L_candidate`：左臂第四点候选。

对应当前只读状态：

- 左臂 `/L/robot_state`：
  - `joint_position`: `[-62.0316, -81.2179, 121.3071, -138.9751, -92.4246, -74.2476]`
  - `tcp_pose`: `[-247.0098, 256.7064, 179.2065, -179.9009, -9.2076, 102.0195]`
  - `motion_done=true`
  - `error_code=0`
  - 使用 `Ltcp -> Lend` 候选偏移换算指尖点：`[-253.503, 266.541, -12.832] mm`

`ros2 topic hz /L/robot_state` 约 `4.995 Hz`。本窗口启动的左臂 `robo_ctrl` 节点随后已停止。至此四组左右同物理点候选点对已齐。

## 四点候选外参残差

以下计算只使用 `Lend/Rend` 候选指尖点，坐标含义为 `right_base` 下的右指尖点到 `left_base` 下的左指尖点的候选刚体变换；尚未写入配置，不能标为 `verified`。

用前三组点对拟合、第四组点对独立验证：

- 候选变换 `right_base -> left_base`：
  - `translation`: `[-147.292, 871.190, -11.580] mm`
  - `rpy`: `[3.051746, -0.111474, 22.295896] deg`
- 第四点 `P_calib4` 独立验证残差：`14.626 mm`
- 前三点拟合残差仍在厘米级：`P_corner=22.834 mm`、`P3=19.141 mm`、`P_calib3=18.893 mm`

四点整体最小二乘候选：

- 候选变换 `right_base -> left_base`：
  - `translation`: `[-143.040, 871.374, -9.201] mm`
  - `rpy`: `[3.358771, -0.273581, 21.311430] deg`
- 四点 RMS 残差：`18.459 mm`
- 四点最大残差：`21.547 mm`

平面 XY 约束下的四点候选：

- `translation_xy`: `[-142.753, 870.527] mm`
- `yaw`: `21.314798 deg`
- XY RMS 残差：`18.429 mm`
- XY 最大残差：`21.465 mm`

结论：四点数据足以生成初始候选外参，但当前残差在 `14-22 mm` 量级，不能作为 `verified` 标定。后续应优先复核 `Lend/Rend` 是否等同真实触桌指尖、接触点是否均为同一指尖角、桌面触碰是否存在压缩/滑动，再决定是否重采或进入标定配置候选。

## 标定建议

当前右臂上一轮桌角接触点仍可记录为 `P_corner_R_candidate`。后续建议：

1. 已有 `P_corner_R_candidate` 与 `P_corner_L_candidate` 这一组桌角点对，可先作为桌面原点候选。
2. 现在也有 `P3_R_candidate` 与 `P3_L_candidate` 第二组候选点对。
3. 现在已有第三点完整点对 `P_calib3_L_candidate` / `P_calib3_R_candidate`，可以计入三点标定候选。
4. `P2_R_candidate` 和 `P_corner2_R_candidate` 还没有左臂同物理点对应读数，不能计为有效点对。
5. 同一物理接触点下 TCP 差异很大时，优先按“夹爪指尖接触 + TCP 到指尖固定偏移”解释，并把左右夹爪指尖偏移纳入标定模型。
6. 现在已有第四点完整点对 `P_calib4_R_candidate` / `P_calib4_L_candidate`，已完成一次候选外参和残差计算。
7. 每个点必须记录：物理点名称、人工确认说明、左右 TCP、候选指尖点、是否轻触、是否有挤压风险、时间戳。
8. 用三点求刚体变换或桌面坐标系时，保留第四个独立点做误差验证；误差未记录前不得把标定标为 `verified`。
9. 接触点标定阶段禁止自动运动到目标点，禁止夹爪 enable/open/close。

## 清理

本窗口启动的只读 `robo_ctrl` 与 EPG50 节点已用 `Ctrl-C` 停止：

- 左右 `robo_ctrl` 均输出 `已断开机器人连接`，进程 clean exit。
- 左右 EPG50 节点均输出 `状态更新线程已终止`，`disable_on_shutdown=false`。
- 本窗口采样用 `robo_ctrl` 已停止，未遗留 `/L/robot_state` 或 `/R/robot_state` 硬件状态节点。
- 16:46 后续收口检查发现 `ROS_DOMAIN_ID=0` 中出现另一个命令启动的 software-only `competition_core` 图，包括 `move_group`、`planning_scene_sync`、`fairino_dualarm_planner`、`execution_adapter`、`dualarm_task_manager`、左相机/检测相关节点等；对应进程命令包含 `start_hardware:=false`、`publish_fake_joint_states:=true`。这些不是本窗口的 `robo_ctrl` 只读采样节点，本轮未清理或 kill。
- 同时还发现另一个窗口的 Gazebo/MoveIt/RViz 仿真进程使用 `ROS_DOMAIN_ID=162`，本轮未清理。
- 后续任何实机只读采样前必须重新检查并处理 `ROS_DOMAIN_ID=0` graph 污染；若继续使用本窗口做实机采样，应先获得用户授权后停止或隔离这些 software-only core 节点，否则不得把 `ROS_DOMAIN_ID=0 ros2 node list` 当作干净实机证据。

## 下一步

- 若继续接触点标定，先复启左右 `robo_ctrl` 只读状态节点，人工确认右夹爪仍只是轻触桌角。
- 现在四组完整候选点对分别为 `P_corner_R_candidate/P_corner_L_candidate`、`P3_R_candidate/P3_L_candidate`、`P_calib3_R_candidate/P_calib3_L_candidate`、`P_calib4_R_candidate/P_calib4_L_candidate`；已能生成候选外参初值，但残差仍为厘米级，不能标为 `verified`。
- 进入任何真实 motion 前，必须先确认急停、人员离开、低速 profile、机械臂空间安全、夹爪状态，并由操作员显式授权。

## 17:05 ROS_DOMAIN_ID=0 污染处理与深度相机检测可视化

用户要求处理 `ROS_DOMAIN_ID=0` 污染并拉起深度相机检测可视化。本轮继续保持实机 no-motion 边界：

- 未启动 `robo_ctrl`。
- 未启动 EPG50 夹爪节点。
- 未调用真实运动 service/action。
- 未调用夹爪 enable/open/close。
- 未调用 `/competition/run`。
- 未清理另一个窗口的 `ROS_DOMAIN_ID=162` Gazebo/MoveIt/RViz 仿真进程。

旧进程检查：

- `ROS_DOMAIN_ID=0` 中存在两套 software-only `competition_core` 派生节点和两个临时 `/tmp/depth_detection_viewer.py`：
  - 第一套核心节点 PID：`50657,50661,50663,50665,50667,50669,50671,50673,50675,50677,50679,50683,50686,50690,50695,50700,50712`
  - 第二套核心节点 PID：`55257,55259,55261,55263,55265,55267,55269,55271,55273,55275,55277,55279,55281,55283,55285,55287,55289,55309`
  - 临时 viewer PID：`52638,52661,56398,56421`
- 上述进程 `ROS_DOMAIN_ID` 均为 unset，即默认域 `0`；对应命令为 `start_hardware:=false`、`publish_fake_joint_states:=true` 的 software-only core，不是本窗口的真实 `robo_ctrl` 采样节点。
- 同时存在另一个窗口仿真进程，明确使用 `ROS_DOMAIN_ID=162`，本轮未处理。

污染处理：

- 对默认域上述 core/viewer PID 发送 `SIGTERM`。
- 清理后复查 `ROS_DOMAIN_ID=0 ROS2CLI_ENABLE_DAEMON=0 ros2 node list`：无输出，默认域清空。
- `pgrep` 仍可见 `ROS_DOMAIN_ID=162` 的仿真节点，例如 `competition_gazebo_full.launch.py`、`move_group`、`planning_scene_sync`、`fairino_dualarm_planner` 和 RViz；这些按用户要求保留。

只读硬件/设备检查：

- `ip -br addr`：`enp5s0 UP 192.168.58.10/24`。
- `ping -c 1 192.168.58.2` 与 `ping -c 1 192.168.58.3` 成功。
- `nc -vz -w 2 192.168.58.2 8080` 与 `nc -vz -w 2 192.168.58.3 8080` 成功。
- `/dev/serial/by-id/`：
  - `A7BIb114J19 -> ../../ttyUSB1`
  - `A_COb114J19 -> ../../ttyUSB0`
- `/dev/v4l/by-id/` 和 `/dev/v4l/by-path/` 显示两台 Orbbec Gemini 335：
  - `CP02653000G2`
  - `CP1E5420007N`
- 通过 V4L2 format 枚举确认：
  - `/dev/video0`: `Z16`，Orbbec `CP02653000G2`
  - `/dev/video6`: `YUYV,MJPG`，Orbbec `CP02653000G2`
  - `/dev/video10`: `Z16`，Orbbec `CP1E5420007N`
  - `/dev/video16`: `YUYV,MJPG`，Orbbec `CP1E5420007N`
  - `/dev/video8`: `MJPG,YUYV`，但设备是 `Integrated Camera`，不是 Orbbec。

第一次感知 core 启动尝试：

```bash
ROS_DOMAIN_ID=0 ROS2CLI_ENABLE_DAEMON=0 ros2 launch dualarm_bringup competition_core.launch.py \
  start_hardware:=false \
  start_camera_bridge:=true \
  start_detector:=true \
  start_left_detector:=true \
  start_right_detector:=false \
  start_table_surface_detector:=true \
  active_depth_camera:=left \
  enable_left_camera:=true \
  enable_right_camera:=false \
  left_camera_enable_depth:=true \
  right_camera_enable_depth:=false \
  use_mock_camera_stream:=false \
  publish_fake_joint_states:=true \
  allow_unverified_camera_extrinsics:=true \
  require_verified_camera_extrinsics:=true \
  detector_confidence_threshold:=0.35 \
  detector_device:=cuda:0
```

结果：

- `left_orbbec_gemini_bridge` 默认进入 `obsensor:0` 共享模式。
- 日志持续出现 `读取深度图失败`，该模式下 `_tick()` 在深度失败后不发布彩色图，不能作为检测可视化链路。
- 该失败尝试未执行硬件动作。

第二次感知 core 启动使用明确 V4L2 设备：

```bash
ROS_DOMAIN_ID=0 ROS2CLI_ENABLE_DAEMON=0 DISPLAY=:1 ros2 launch dualarm_bringup competition_core.launch.py \
  start_hardware:=false \
  start_camera_bridge:=true \
  start_detector:=true \
  start_left_detector:=true \
  start_right_detector:=false \
  start_table_surface_detector:=true \
  active_depth_camera:=left \
  enable_left_camera:=true \
  enable_right_camera:=false \
  left_camera_enable_depth:=true \
  right_camera_enable_depth:=false \
  left_camera_color_device:=/dev/video6 \
  left_camera_depth_device:=/dev/video0 \
  left_camera_depth_backend:=v4l2 \
  use_mock_camera_stream:=false \
  publish_fake_joint_states:=true \
  allow_unverified_camera_extrinsics:=true \
  require_verified_camera_extrinsics:=true \
  left_camera_fps:=5.0 \
  detector_confidence_threshold:=0.35 \
  detector_device:=cuda:0
```

运行日志目录：

- `/home/gwh/dual-arm/.codex/tmp/runtime/real-camera-detection-viz-domain0-20260506-172023`

当前运行进程：

- core launch PID：`69100`
- RViz launch PID：`70273`
- detector overlay viewer PID：`70274`
- table/depth overlay viewer PID：`70275`

可视化入口：

- RViz：
  - `competition_rviz_tools competition_rviz.launch.py`
  - `dry_run:=true`
  - `enable_action_bridge:=false`
  - `scene_topic:=/scene_fusion/scene_objects`
- OpenCV 图像窗口：
  - `left_detector_overlay_viewer` 订阅 `/detector/left/detections/image`
  - `table_depth_overlay_viewer` 订阅 `/perception/pick_assist/rgb_overlay`

运行证据：

- `ROS_DOMAIN_ID=0 ros2 node list` 当前包含：
  - `/left_orbbec_gemini_bridge`
  - `/detector_left`
  - `/detector_adapter_left`
  - `/depth_handler_left`
  - `/ball_basket_pose_estimator_left`
  - `/table_surface_detector`
  - `/scene_fusion`
  - `/planning_scene_sync`
  - `/competition_operator_rviz`
  - `/left_detector_overlay_viewer`
  - `/table_depth_overlay_viewer`
- 当前不再有重复 `/ros_image_viewer` 节点名。
- `ros2 topic list -t` 可见：
  - `/left_camera/color/image_raw [sensor_msgs/msg/Image]`
  - `/left_camera/depth/image_raw [sensor_msgs/msg/Image]`
  - `/left_camera/depth/camera_info [sensor_msgs/msg/CameraInfo]`
  - `/detector/left/detections [detector/msg/Bbox2dArray]`
  - `/detector/left/detections/image [sensor_msgs/msg/Image]`
  - `/perception/left/detection_2d [dualarm_interfaces/msg/Detection2DArray]`
  - `/depth_handler/left/pointcloud [sensor_msgs/msg/PointCloud2]`
  - `/depth_handler/left/visualization [visualization_msgs/msg/MarkerArray]`
  - `/scene_fusion/scene_objects [dualarm_interfaces/msg/SceneObjectArray]`
  - `/competition/rviz/scene_model_points [sensor_msgs/msg/PointCloud2]`
- `ros2 topic hz /left_camera/color/image_raw`：约 `13.1 Hz`。
- `ros2 topic hz /left_camera/depth/image_raw`：约 `13.4 Hz`。
- `ros2 topic hz /detector/left/detections/image`：约 `11.2 Hz`。
- `/scene_fusion/scene_objects` 一帧包含：
  - `table_surface_11`，`semantic_type=table_surface`，`source=table_surface_detector`，`confidence=0.9987`
  - `water_bottle_5`，`semantic_type=water_bottle`，`source=left_camera`，`confidence=0.7136`，`pose_source=depth_roi_primitive_fit`，`quality_score=0.8425`
- `planning_scene_sync` 日志持续出现 `apply_planning_scene diff: world_add=[...]`，包括 `table_surface_*` 与 `water_bottle_*`。

边界说明：

- 当前只证明 `ROS_DOMAIN_ID=0` no-motion 左相机深度/检测/场景可视化链路有真实 topic 和 scene evidence。
- 当前不证明任何实机运动安全。
- 当前不证明 `/competition/run` 可用。
- 当前相机外参仍以 `allow_unverified_camera_extrinsics:=true` 允许调试，不能标为 `verified`。

## 2026-05-06 右机械臂候选相机彩色可视化

本轮继续保持 no-motion 边界：

- 未启动 `robo_ctrl`。
- 未启动 EPG50 夹爪节点。
- 未调用真实运动 service/action。
- 未调用夹爪 enable/open/close。
- 未调用 `/competition/run`。

现场纠正：

- 初始按历史记录把 `CP1E5420007N` 的 `/dev/video16` 当作右相机彩色口启动，但用户现场指出当前画面实际是左机械臂相机。
- 已停止该路被误命名为 `right_camera` 的进程，避免右/左命名污染。
- 本轮随后将另一台 Orbbec `CP02653000G2` 的 `/dev/video6` 作为右机械臂候选彩色口重新启动；请以现场画面继续确认该候选是否确为右机械臂相机。

设备与限制：

- 当前运行彩色口：`/dev/video6`，udev serial 为 `CP02653000G2`，USB interface `04`。
- 候选深度口：`/dev/video0`，同 serial `CP02653000G2`，USB interface `00`。
- 当前仅启动彩色-only。右侧深度/table overlay 未通过：最小复现显示同一台 Orbbec 同时打开彩色和 Z16 深度时，彩色可读但深度读帧失败；单独深度可读。因此本轮不声明右深度链路或桌面 overlay 成功。

当前运行日志目录：

- `/home/gwh/dual-arm/.codex/tmp/runtime/right-arm-candidate-cp026-color-viz-domain0-20260506-215108`

当前运行节点：

- `/right_orbbec_gemini_bridge`
- `/detector_right`
- `/detector_adapter_right`
- `/right_camera_color_viewer`
- `/right_detector_overlay_viewer`

当前可视化窗口：

- `right_camera_color`：订阅 `/right_camera/color/image_raw`
- `right_detector_overlay`：订阅 `/detector/right/detections/image`

运行证据：

- `/right_camera/color/image_raw`：约 `13.9 Hz` 到 `15.0 Hz`。
- `/detector/right/detections/image`：约 `15.0 Hz`。
- `/detector/right/detections` 一帧检测包含 class id `2/0/4/3`，最高置信度约 `0.85`，header frame 为 `right_camera_color_frame`。
- `detector_right` 使用 CPU 启动，避免 CUDA 侧崩溃影响现场可视化；这只作为 no-motion 观察链路，不代表最终性能配置。

坐标系与协作动作结论：

- 当前双臂坐标系不能标为 `verified`。此前四点候选外参仍是 candidate：整体最小二乘 RMS 残差约 `18.459 mm`、最大残差约 `21.547 mm`，并且依赖 `Lend/Rend` 指尖偏移候选。
- 当前 active MoveIt 双臂 URDF/SRDF 未接入正式 gripper/fingertip link，规划 tip 仍是 `left_tcp/right_tcp`，不能把夹爪指尖接触点直接当作 TCP 点。
- 因此当前不能进行协作动作，也不能保证双臂“不打架”。进入任何协作运动前，至少需要：左右 base 外参 verified、夹爪/指尖工具模型 verified、MoveIt 自碰/互碰场景 smoke、低速 no-motion/mock 规划验证、急停和现场安全确认。

## 2026-05-06 右相机现场确认与右臂只读控制状态接入

本轮继续保持 no-motion 边界：

- 未调用 `/R/robot_move`、`/R/robot_move_cart`、`/R/robot_servo*` 或 `/R/robot_set_speed`。
- 未启动 EPG50 夹爪节点。
- 未调用夹爪 enable/open/close。
- 未调用 `/competition/run`。
- 未执行双臂协作动作。

现场确认：

- 用户确认当前打开的 `/dev/video6` / `CP02653000G2` 彩色可视化画面是右侧相机。
- 记录状态从“右机械臂候选相机”更新为“右侧相机现场确认”；右深度/table overlay 仍未验证。

ROS graph 与网络前置检查：

- `ROS_DOMAIN_ID=0 ros2 node list` 初始只包含右相机/检测可视化节点：
  - `/right_orbbec_gemini_bridge`
  - `/detector_right`
  - `/detector_adapter_right`
  - `/right_camera_color_viewer`
  - `/right_detector_overlay_viewer`
- `enp5s0` 仍为 `192.168.58.10/24`。
- `192.168.58.2:8080` 与 `192.168.58.3:8080` TCP 均可达。
- 另有 Gazebo/MoveIt 相关进程运行在 `ROS_DOMAIN_ID=162`，本轮未触碰，且未作为实机控制证据。

右臂只读状态接入：

- 后台启动方式不稳定：直接后台和 `nohup` 后台尝试均未形成可用 `/R/robot_state` 证据，其中 `nohup` 日志停在 `正在连接机器人，IP: 192.168.58.3` 后进程退出。
- 改用受控前台会话直接运行安装树可执行文件后成功：

```bash
export ROS_DOMAIN_ID=0
export ROS2CLI_ENABLE_DAEMON=0
export LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libstdc++.so.6
source /opt/ros/humble/setup.bash
source /home/gwh/dual-arm/install/setup.bash
/home/gwh/dual-arm/install/robo_ctrl/lib/robo_ctrl/robo_ctrl_node --ros-args \
  -r __node:=right_robo_ctrl \
  -p robot_ip:=192.168.58.3 \
  -p robot_port:=8080 \
  -p robot_name:=R \
  -p state_query_interval:=0.2
```

运行证据：

- `/right_robo_ctrl` 启动日志显示：
  - `正在连接机器人，IP: 192.168.58.3`
  - `成功连接到机器人`
  - `机器人状态监控线程已启动，查询间隔: 0.20秒`
- `/R/robot_state`：约 `4.995 Hz`。
- `/R/robot_state` 单帧：
  - `joint_position`: `[52.3965, -83.5825, -12.4235, -30.0943, -107.9497, 0.1314]`
  - `tcp_pose`: `[-31.8716, -158.0354, 640.1603, -142.5021, -14.3388, 131.4828]`
  - `motion_done=true`
  - `error_code=0`
- `/right_robo_ctrl` 暴露 `/R/robot_move`、`/R/robot_move_cart`、`/R/robot_servo`、`/R/robot_servo_line`、`/R/robot_servo_joint`、`/R/robot_set_speed` 服务，但本轮没有调用这些服务。

清理：

- 受控前台会话已终止，`/right_robo_ctrl` 已从 `ROS_DOMAIN_ID=0` 图中消失。
- 当前域 0 保留右相机/检测可视化节点。

下一步运动门控：

- 若要继续做真实运动，只允许先做单臂、低速、小增量 jog；不得做双臂协作。
- 发送任何运动前需要现场明确确认：目标手臂、方向/坐标系、距离、速度/override、工作区无人、手在急停、当前末端和桌面/相机/另一臂距离足够。

## 2026-05-06 右臂单臂夹取链路预检查

本轮目标是尝试用右臂自身状态、右侧深度相机和既有检测模型形成单臂夹取链路。实际执行结果为：完成 no-motion 感知/状态闭环，夹取动作被安全门控拒绝。

边界：

- 未调用 `/R/robot_move`、`/R/robot_move_cart`、`/R/robot_servo*` 或 `/R/robot_set_speed`。
- 未启动 EPG50 夹爪节点，未调用夹爪 enable/open/close。
- 未调用 `/competition/run`。
- 未执行真实抓取、靠近、合爪或双臂协作动作。

前置状态：

- 用户确认现场无人，并说明右臂相机视野内有障碍物。
- 为释放右相机深度设备，本轮停止了右侧 color-only 可视化/检测链路；停止后 `ROS_DOMAIN_ID=0` 一度只剩 `/parameter_events` 和 `/rosout`。
- `192.168.58.3:8080` 可达，右夹爪串口 by-id 仍可见。

右臂自身状态：

- 受控前台会话启动 `/right_robo_ctrl` 成功。
- `/R/robot_state` 约 `4.995 Hz`。
- 采样帧：
  - `joint_position`: `[52.3965, -83.5822, -12.4239, -30.0945, -107.9499, 0.1314]`
  - `tcp_pose`: `[-31.8720, -158.0354, 640.1613, -142.5017, -14.3389, 131.4825]`
  - `motion_done=true`
  - `error_code=0`
- `/R/robot_move`、`/R/robot_move_cart`、`/R/robot_servo`、`/R/robot_servo_line`、`/R/robot_servo_joint`、`/R/robot_set_speed` 服务可见，但未调用。

右相机深度与目标识别：

- OpenCV V4L2 路径无法直接按 `/dev/video0` 打开右侧 Z16；OBSENSOR 后端能打开但返回深度全 0。
- 使用原生 V4L2 ioctl/mmap 能从 `/dev/video0` 读取 Z16 帧，格式为 `640x480 Z16`。
- 同步采样结果保存到 `.codex/tmp/runtime/right-grasp-precheck-20260506/`：
  - `right_color_snapshot.jpg`
  - `right_color_detection.jpg`
  - `right_depth_raw_vis.jpg`
- YOLOv8 `.pt` 在右彩色快照中检测到：
  - `cocacola`
  - class id `2`
  - confidence `0.894`
  - bbox center `(358.8, 277.4)`
  - bbox `xyxy=(306.9, 243.7, 410.8, 311.0)`
- 近似把彩色 bbox 归一化映射到深度 ROI `(300, 237, 416, 316)` 后：
  - raw depth ROI valid pixels: `8901`
  - raw depth min: `550`
  - raw depth p05: `555`
  - raw depth median: `676`
- 按仓内默认 `v4l2_depth_unit_to_mm_scale=0.125` 解释：
  - target p05: `69.4 mm`
  - target median: `84.5 mm`
- 按原始值直接解释为 mm：
  - target p05: `555 mm`
  - target median: `676 mm`

安全门控结论：

- 夹取动作被拒绝，原因如下：
  1. 右侧深度单位存在 `0.125x` 与 `1.0x` 的冲突，当前不能作为真实安全距离。
  2. 当前只有 `Ltcp -> camera_link` 历史静态 TF，没有可信的 `Rtcp -> right_camera_color/depth` 外参。
  3. `/tf` 只确认运行时存在 `world -> Rrobot_base`；没有右相机到右 TCP/基座的完整 verified 变换。
  4. color/depth 当前是交替快照，未完成正式像素对齐；bbox-to-depth ROI 只能作为调试估计。
  5. 右相机视野内有障碍物，且没有 verified 三维避障/碰撞模型。

清理：

- `/right_robo_ctrl` 已终止，右臂控制器连接已断开。
- 本轮没有保留运动服务节点作为后台进程。

下一步要进入真实单臂夹取前，至少需要：

1. 校准或确认 `/dev/video0` Z16 单位比例，确定 raw depth 是否应乘 `0.125`。
2. 建立并验证 `Rtcp/right_tcp -> right_camera_depth_frame` 外参。
3. 建立右相机 color/depth 对齐或使用同一深度坐标系下的检测 ROI。
4. 用 no-motion 方式把 `cocacola` 转成右臂基座下的候选抓取位姿，并做 workspace/障碍物距离检查。
5. 首次动作只允许右臂单步小增量或预抓取空走验证，不允许直接合爪夹取。
