cmake_minimum_required(VERSION 3.8)
project(planning_scene_sync)

find_package(ament_cmake REQUIRED)

install(PROGRAMS
  scripts/planning_scene_sync_node.py
  DESTINATION lib/${PROJECT_NAME}
)

install(DIRECTORY
  launch
  DESTINATION share/${PROJECT_NAME}
)

ament_package()
