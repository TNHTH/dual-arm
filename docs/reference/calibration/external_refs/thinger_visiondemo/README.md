# thinger VisionDemo Reference

创建时间：2026-04-18
更新时间：2026-04-18

## 来源

- 源归档：
  - `/home/gwh/下载/运动控制和视觉定位框架源代码.rar`
- 原工程类型：
  - Windows / C# / .NET Framework / HALCON / 海康相机 / ZMotion

## 为什么迁移

这个参考集对当前 `dual-arm` 项目最有价值的不是上位机 UI，而是以下三类模式：

- 九点标定数据如何组织、持久化和读回
- 模板匹配参数与 ROI 如何持久化
- 视觉测量参数如何拆成独立数据结构

## 为什么只迁这几份

- 没有迁移：
  - `bin/obj/.vs`
  - `dll`
  - HALCON 运行库
  - ZMotion 控制卡接口实现
  - Windows 窗体 UI
- 原因：
  - 这些内容无法直接服务当前 ROS2 / Ubuntu / Fairino 技术栈
  - 会污染仓库，且没有直接复用价值

## 对当前项目的建议映射

- `CalibrationHelper.cs`
  - 参考九点标定数据结构、`HomMat2D` 存取方式
- `ShapeModelHelper.cs`
  - 参考模板参数和 ROI 的持久化格式
- `CalibrationData.cs` / `PositionInfo.cs`
  - 参考标定输入与工位偏移的字段组织
- `MatchParams.cs` / `CircleParams.cs`
  - 参考模板匹配和圆检测参数拆分

## 使用边界

- 本目录仅为“外部参考源码切片”，不是可直接编译模块。
- 当前项目如果吸收其中思路，应按 ROS2 + Python/C++ + 本项目坐标系重写，而不是直接搬运 C# + HALCON 实现。
