# 双相机稳定模式接续计划

- 创建时间：2026-04-22 17:20 CST
- 适用目录：`/home/gwh/dashgo_rl_project/workspaces/dual-arm`
- 当前目标：在不再让右桥掉线的前提下，继续完成双相机比赛版统一建模与 RViz 可视化。

## 当前结论

- 双 Orbbec 已恢复枚举：
  - 左：`CP1E5420007N`
  - 右：`CP02653000G2`
- 右相机单独运行可稳定出图。
- 双桥只开彩色时，左右彩色都能稳定出图。
- 当前真正冲突点是“双深度并发”：
  - 左右两路 `Z16` 同时常开时，右桥会掉到：
    - `读取彩色图失败`
    - `VIDIOC_DQBUF: No such device`
- 因此当前软件侧稳定模式已经确定：
  - 左右彩色常开
  - 单侧深度常开
  - 另一侧深度按需启用

## 当前稳定模式

- 建议默认参数：
  - `dual_camera_mode:=full`
  - `left_camera_enable_depth:=true`
  - `right_camera_enable_depth:=false`
  - `left_camera_fps:=5.0`
  - `right_camera_fps:=5.0`
- 当前已落地的正式参数：
  - `left_camera_enable_depth`
  - `right_camera_enable_depth`
  - `left_camera_fps`
  - `right_camera_fps`
  - `enable_depth`（bridge 层）

## 当前设备映射

- 左相机 `CP1E5420007N`
  - color=`/dev/video16`
  - depth=`/dev/video10`
- 右相机 `CP02653000G2`
  - color=`/dev/video6`
  - depth=`/dev/video0`

说明：
- `/dev/videoX` 仍可能漂移，接续时必须重新核对：
  - `lsusb`
  - `/dev/v4l/by-id`
  - `/sys/class/video4linux/*/name`

## 当前已验证证据

- 真实双臂姿态：
  - `right_base_rpy` 已修正为前向默认值
  - `/R/robot_state.tcp_pose` 与 `tf2_echo world right_tcp` 已对齐
- 左链真机 3D：
  - `/perception/left/scene_objects` 已输出 `frame_id=world`
  - `source=left_camera`
  - `cup / water_bottle / cola_bottle` 已进入 scene
  - `/depth_handler/left/pointcloud` 已输出 `PointCloud2`
  - `/competition/rviz/scene_model_points` 已输出 `PointCloud2`
- 双桥彩色并发：
  - 左右 raw color 在 `5fps` 下稳定

## 接续顺序

1. 读取以下文件：
   - `STATE.md`
   - `.codex/tmp/error-trace/ERROR_TRACE.md`
   - `.codex/tmp/continuous-learning/RETRO.md`
   - `.codex/tmp/resume/IMPLEMENTATION_BREAKPOINTS.md`
   - 本文件
2. 重新核对当前双机映射，不信任历史 `/dev/videoX`。
3. 先起“稳定模式”：
   - 左右彩色常开
   - 左深度开
   - 右深度关
4. 验证：
   - `/detector/left/detections`
   - `/detector/right/detections`
   - `/perception/left/scene_objects`
   - `/scene_fusion/scene_objects`
   - `/competition/rviz/scene_model_points`
5. 再切换到“右深度按需启用”模式：
   - `left_camera_enable_depth:=false`
   - `right_camera_enable_depth:=true`
6. 验证右侧：
   - `/perception/right/scene_objects`
   - `/depth_handler/right/pointcloud`
7. 若右侧按需模式也稳定，再研究是否需要真正的“双深度常开”。

## 暂不做

- 不把“双深度常开”继续当默认模式。
- 不在右桥仍报 `VIDIOC_DQBUF: No such device` 时继续怀疑 scene_fusion。
- 不把整机在 world 下的位置当成正式赛场摆位，直到基座实测值写回：
  - `left_base_xyz`
  - `right_base_xyz`
  - `right_base_rpy`

## 失败判据

- 任一相机桥在运行期报：
  - `读取彩色图失败`
  - `VIDIOC_DQBUF: No such device`
  则判为输入层失败，先停在桥接层排查，不继续往 detector/fusion 推。

- 任一侧 `SceneObjectArray` 不是 `world` frame，则判为 3D 侧未收口。

- `scene_model_points` 无 `PointCloud2`，则判为 RViz 建模验收未通过。
