cmake_minimum_required(VERSION 3.8)
project(competition_rviz_tools)

# 本包实际通过 ament_python 构建；保留 CMakeLists 便于仓库工具发现 ROS 包。
find_package(ament_cmake REQUIRED)

ament_package()
