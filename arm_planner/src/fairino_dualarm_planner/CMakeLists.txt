cmake_minimum_required(VERSION 3.8)
project(fairino_dualarm_planner)

find_package(ament_cmake REQUIRED)

install(PROGRAMS
  scripts/fairino_dualarm_planner_node.py
  DESTINATION lib/${PROJECT_NAME}
)

install(DIRECTORY
  launch
  DESTINATION share/${PROJECT_NAME}
)

ament_package()
