cmake_minimum_required(VERSION 3.8)
project(fairino_dualarm_planner)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

find_package(ament_cmake REQUIRED)
find_package(dualarm_interfaces REQUIRED)
find_package(geometry_msgs REQUIRED)
find_package(moveit_msgs REQUIRED)
find_package(moveit_ros_planning_interface REQUIRED)
find_package(robo_ctrl REQUIRED)
find_package(rclcpp REQUIRED)
find_package(sensor_msgs REQUIRED)
find_package(tf2_geometry_msgs REQUIRED)
find_package(trajectory_msgs REQUIRED)

add_executable(fairino_dualarm_planner_node
  src/fairino_dualarm_planner_node.cpp
)

ament_target_dependencies(fairino_dualarm_planner_node
  dualarm_interfaces
  geometry_msgs
  moveit_msgs
  moveit_ros_planning_interface
  robo_ctrl
  rclcpp
  sensor_msgs
  tf2_geometry_msgs
  trajectory_msgs
)

install(TARGETS
  fairino_dualarm_planner_node
  DESTINATION lib/${PROJECT_NAME}
)

install(DIRECTORY
  launch
  DESTINATION share/${PROJECT_NAME}
)

ament_package()
