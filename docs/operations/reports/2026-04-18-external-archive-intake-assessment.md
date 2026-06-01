# External Archive Intake Assessment

创建时间：2026-04-18
更新时间：2026-04-18

## 任务目标

评估下载目录中的三个外部压缩包，判断哪些内容对 `workspaces/dual-arm` 有直接参考价值，并把确认有帮助的部分迁入项目内的只读参考区。

## 输入归档

- `/home/gwh/下载/运动控制和视觉定位框架源代码.rar`
- `/home/gwh/下载/6轴机械臂正逆解算法.rar`
- `/home/gwh/下载/MATLAB六轴机械臂仿真程序.rar`

## 评估结论

### 1. 运动控制和视觉定位框架源代码

- 归档类型：
  - Windows `.NET Framework` / C# / HALCON / 海康相机 SDK / ZMotion 控制卡上位机工程
- 主要内容：
  - 二维标定数据组织与持久化
  - HALCON 形状模板创建/查找与参数保存
  - 工业相机、控制卡、INI 配置辅助层
- 对当前项目的价值：
  - 对 `dual-arm` 的相机标定、模板参数组织、离线视觉工具设计有参考价值
  - 对当前 ROS2 + Fairino 主运行链没有直接可执行价值
- 迁移决策：
  - 迁移“视觉标定与模板匹配参考源码切片”
  - 不迁移整个 Windows 工程、DLL、`bin/obj/.vs`、HALCON 运行库、ZMotion 控制卡层

### 2. 6轴机械臂正逆解算法

- 归档类型：
  - Inovance / CoDeSys / SoftMotion 工程导出产物
- 主要内容：
  - `.project` 与一批 `*.object/*.meta` 编译与工程资产
- 对当前项目的价值：
  - 与当前 `dual-arm` 的 ROS2 / Python / C++ / Fairino 技术栈不匹配
  - 不是通用源码包，也没有直接可读的 FK/IK 推导实现
- 迁移决策：
  - 不迁移

### 3. MATLAB 六轴机械臂仿真程序

- 归档类型：
  - MATLAB + Robotics Toolbox 教学样例
- 主要内容：
  - `myFkine.m`
  - `myIkine.m`
  - `puma560_arm.m`
- 对当前项目的价值：
  - 可作为 6 轴机械臂正逆解推导与验证样例
  - 几何参数是 `PUMA560`，不能直接替换 `FR3` 或当前 dual-arm 模型
- 迁移决策：
  - 迁移为 `kinematics` 参考样例
  - 保留只读参考属性，不接入运行链

## 已迁移内容

### 标定参考

目标目录：
- `/home/gwh/dual-arm/docs/calibration/external_refs/thinger_visiondemo/`

迁移文件：
- `README.md`
- `CalibrationHelper.cs`
- `ShapeModelHelper.cs`
- `CalibrationInfo.cs`
- `CalibrationData.cs`
- `PositionInfo.cs`
- `MatchParams.cs`
- `CircleParams.cs`

### 运动学参考

目标目录：
- `/home/gwh/dual-arm/docs/architecture/kinematics/external_refs/puma560_matlab/`

迁移文件：
- `README.md`
- `myFkine.m`
- `myIkine.m`
- `puma560_arm.m`

## 使用边界

- 这些迁移文件全部是“只读参考资产”，不应直接纳入当前构建或运行入口。
- 若后续要把参考逻辑产品化，必须重新按当前项目的接口、坐标系、机器人参数和依赖约束重写。
- 尤其是：
  - `PUMA560` 参数不能直接套到 `FR3`
  - HALCON 上位机逻辑不能直接当作 ROS2 节点接入
  - ZMotion / CoDeSys 资产不能直接接入 Fairino 控制链

## 推荐后续动作

1. 若要补强相机/抓取位标定，可优先阅读 `thinger_visiondemo` 里的 `CalibrationHelper.cs` 与 `ShapeModelHelper.cs`。
2. 若要写独立的 FK/IK 验证脚本，可先参考 `puma560_matlab` 的推导结构，再替换成 `FR3` 参数。
3. 若要继续评估未迁移的 Inovance 工程，建议单独在不污染当前仓库的前提下做 IDE 级打开与截图审查，而不是并入源码。

## 验证

- 已用 `bsdtar -tf` 和临时解压目录完成归档级检查。
- 已确认迁移的是文本源码与说明文件，不包含二进制运行时与构建缓存。
