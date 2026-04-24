# dual-arm 模块测试方案

创建时间：2026-04-15
更新时间：2026-04-15

## 结论

当前最合理的测试策略是：

1. 先做无运动、低风险的接口与链路测试
2. 再做单模块 smoke test
3. 再做不接真机执行的集成测试
4. 最后才做左臂硬件在环测试
5. 在右臂和夹爪未恢复前，不建议跑完整 `RunCompetition`

当前已知硬件条件：

- 左臂本体网络链路可用，控制器地址为 `192.168.58.3`
- 右臂未验证
- 夹爪串口未恢复

## 测试分层

### T0 构建与环境

目标：

- 确保工作区能构建
- ROS 环境和包索引正常

命令：

```bash
cd /home/gwh/dual-arm
./build_workspace.sh
source /opt/ros/humble/setup.bash
source install/setup.bash
colcon list --names-only
```

通过标准：

- 构建成功
- 包列表完整

### T1 接口层测试

目标：

- 验证 `dualarm_interfaces` 合同层没问题

命令：

```bash
source /opt/ros/humble/setup.bash
source /home/gwh/dual-arm/install/setup.bash

ros2 interface show dualarm_interfaces/msg/SceneObject
ros2 interface show dualarm_interfaces/msg/GraspTarget
ros2 interface show dualarm_interfaces/srv/PlanPose
ros2 interface show dualarm_interfaces/action/ExecuteTrajectory
ros2 interface show dualarm_interfaces/action/RunCompetition
```

通过标准：

- 所有接口可正常显示

### T2 基础支撑模块

#### 1. `tf_node`

目标：

- 验证静态 TF 是否正确发布

命令：

```bash
ros2 launch tf_node frame_authority.launch.py
```

另开一个终端：

```bash
source /opt/ros/humble/setup.bash
source /home/gwh/dual-arm/install/setup.bash
ros2 topic echo /tf_static --once
```

预期：

- 能看到 `world -> table`
- 能看到 `world -> left_base`
- 能看到 `world -> right_base`

#### 2. `detector_adapter`

目标：

- 验证旧 2D 检测消息到新统一消息的转换

启动：

```bash
ros2 run detector_adapter detector_adapter_node.py
```

发布测试输入：

```bash
ros2 topic pub /detector/detections detector/msg/Bbox2dArray "{
  header: {frame_id: 'camera_color_frame'},
  results: [
    {x: 320.0, y: 240.0, width: 100.0, height: 160.0, class_id: 0, score: 0.95}
  ]
}" --once
```

查看输出：

```bash
ros2 topic echo /perception/detection_2d --once
```

预期：

- 输出 `semantic_type: water_bottle`
- 坐标和分数正确映射

#### 3. `scene_fusion`

目标：

- 验证多源 `SceneObjectArray` 融合、稳定化和 scene version 递增

启动：

```bash
ros2 run scene_fusion scene_fusion_node.py
```

发布一条简化场景：

```bash
ros2 topic pub /perception/scene_objects dualarm_interfaces/msg/SceneObjectArray "{
  header: {frame_id: 'world'},
  objects: [
    {
      id: 'raw_1',
      semantic_type: 'water_bottle',
      pose: {header: {frame_id: 'world'}, pose: {position: {x: 0.4, y: 0.1, z: 0.2}, orientation: {w: 1.0}}},
      size: {x: 0.06, y: 0.06, z: 0.22},
      confidence: 0.9,
      graspable: true,
      movable: true,
      source: 'test',
      lifecycle_state: 'observed',
      reserved_by: '',
      attached_link: '',
      pose_covariance_diagonal: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
    }
  ]
}" --rate 10
```

查看输出：

```bash
ros2 topic echo /scene_fusion/raw_scene_objects
```

预期：

- `id` 被归一化为 `water_bottle_1`
- `scene_version` 增长
- 若持续发布足够长，`lifecycle_state` 从 `observed` 进入 `stable`

#### 4. `planning_scene_sync`

目标：

- 验证场景 reservation / attach overlay

启动：

```bash
ros2 run planning_scene_sync planning_scene_sync_node.py
```

服务测试：

```bash
ros2 service call /scene/reserve_object dualarm_interfaces/srv/ReserveObject "{object_id: 'water_bottle_1', reserved_by: 'test_case', arm_mode: 'left_arm'}"
ros2 service call /scene/attach_object dualarm_interfaces/srv/AttachObject "{object_id: 'water_bottle_1', link_name: 'left_tcp'}"
ros2 service call /scene/detach_object dualarm_interfaces/srv/DetachObject "{object_id: 'water_bottle_1'}"
ros2 service call /scene/release_object dualarm_interfaces/srv/ReleaseObject "{object_id: 'water_bottle_1'}"
```

预期：

- 服务返回成功
- `/scene_fusion/scene_objects` 中对象状态发生变化

#### 5. `grasp_pose_generator`

目标：

- 验证从 `SceneObject` 到 `GraspTarget` 的模板生成

启动：

```bash
ros2 run grasp_pose_generator grasp_pose_generator_node.py
```

发布输入：

```bash
ros2 topic pub /scene_fusion/scene_objects dualarm_interfaces/msg/SceneObjectArray "{
  header: {frame_id: 'world'},
  objects: [
    {
      id: 'basketball_1',
      semantic_type: 'basketball',
      pose: {header: {frame_id: 'world'}, pose: {position: {x: 0.5, y: 0.0, z: 0.2}, orientation: {w: 1.0}}},
      size: {x: 0.12, y: 0.12, z: 0.12},
      confidence: 0.9,
      graspable: true,
      movable: true,
      source: 'test',
      lifecycle_state: 'stable',
      reserved_by: '',
      attached_link: '',
      pose_covariance_diagonal: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
    }
  ]
}" --once
```

查看输出：

```bash
ros2 topic echo /planning/grasp_targets --once
```

预期：

- `arm_mode: dual_arm`
- `requires_bimanual_sync: true`

### T3 依赖相机的感知模块

这些模块建议在“相机实际在线”或“回放 bag”时测试：

- `depth_handler`
- `ball_basket_pose_estimator`
- `camera_info_interceptor`

#### `depth_handler`

启动：

```bash
ros2 launch depth_handler depth_processor.launch.py
```

需要输入：

- `/perception/detection_2d`
- `/camera/depth/image_raw`
- `/camera/depth/camera_info`

查看输出：

```bash
ros2 topic echo /perception/scene_objects
ros2 topic echo /depth_handler/bbox3d
```

#### `ball_basket_pose_estimator`

启动：

```bash
ros2 launch ball_basket_pose_estimator ball_basket_pose_estimator.launch.py
```

查看输出：

```bash
ros2 topic echo /perception/ball_basket_scene_objects
```

### T4 规划层测试

#### 1. 不接真机执行的规划测试

这是最推荐先跑的一层。

启动 debug 集成链：

```bash
ros2 launch dualarm_bringup debug.launch.py
```

查看服务：

```bash
ros2 service list | grep '/planning/'
```

典型测试：

```bash
ros2 service call /planning/plan_pose dualarm_interfaces/srv/PlanPose "{
  arm_group: 'left_arm',
  target_pose: {
    header: {frame_id: 'world'},
    pose: {
      position: {x: 0.4, y: 0.2, z: 0.3},
      orientation: {x: 0.0, y: 0.0, z: 0.0, w: 1.0}
    }
  },
  planner_id: '',
  cartesian: false
}"
```

预期：

- 返回 `success`
- `result_code: success`
- `joint_trajectory` 非空

#### 2. 真机关联但只做规划

当前左臂已连通，可以在只启动左臂驱动的前提下跑规划，不执行轨迹。

终端 1：

```bash
ros2 run robo_ctrl robo_ctrl_node --ros-args -p robot_ip:=192.168.58.3 -p robot_name:=L
```

终端 2：

```bash
ros2 launch fairino_dualarm_moveit_config move_group.launch.py publish_fake_joint_states:=false
```

终端 3：

```bash
ros2 run fairino_dualarm_planner fairino_dualarm_planner_node
```

再调用 `/planning/plan_pose` 或 `/planning/plan_joint`。

注意：

- 这一步只规划，不执行。
- 这是当前阶段最安全的 MoveIt 真机联调方式。

### T5 执行层测试

#### 1. 左臂驱动只读测试

```bash
ros2 run robo_ctrl robo_ctrl_node --ros-args -p robot_ip:=192.168.58.3 -p robot_name:=L
ros2 topic echo /L/robot_state
ros2 service list | grep '^/L/'
```

当前这一步已经验证通过。

#### 2. `joint_state_aggregator`

如果左右臂都在线：

```bash
ros2 run joint_state_aggregator joint_state_aggregator_node.py
ros2 topic echo /joint_states
```

当前右臂未验证，因此这一步先不作为阻塞项。

#### 3. `execution_adapter`

当前建议只做“服务和 action 是否正常挂起”的检查，不建议立即执行真机轨迹。

启动：

```bash
ros2 run execution_adapter execution_adapter_node.py
```

查看：

```bash
ros2 service list | grep '/execution/'
ros2 action list | grep '/execution/'
```

### T6 总控层测试

#### `dualarm_task_manager`

当前不建议直接跑：

```bash
ros2 action send_goal /competition/run dualarm_interfaces/action/RunCompetition "{start_immediately: true, requested_order: 'handover,pouring'}"
```

原因：

- 右臂未验证
- 夹爪未恢复
- perception 可能还未完整联调
- 状态机中多个 primitive 仍是占位实现

更稳的顺序是先完成：

- T0 ~ T5

再考虑总控层。

## 当前最推荐的测试顺序

如果你现在就要开始测，我建议按这个顺序：

1. `T0 构建与环境`
2. `T1 接口层`
3. `T2 tf_node / detector_adapter / scene_fusion / planning_scene_sync / grasp_pose_generator`
4. `T4.1 debug.launch 下的纯规划测试`
5. `T5.1 左臂只读驱动`
6. `T4.2 左臂真机关联但只规划`
7. 在人工确认安全后，再讨论左臂最小动作测试

## 当前不建议做的事

- 现在就跑完整 `competition.launch.py` 并启用全部硬件
- 现在就跑 `RunCompetition`
- 在右臂未验证、夹爪未接通前做双臂同步执行

## 备注

当前左臂控制器可用地址：

- `192.168.58.3`

当前有线网卡配置：

- `enp5s0 = 192.168.58.10/24`
- `100Mb/s`
- `Half Duplex`
- `autoneg off`
