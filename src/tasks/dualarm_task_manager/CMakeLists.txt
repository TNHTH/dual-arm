cmake_minimum_required(VERSION 3.8)
project(dualarm_task_manager)

find_package(ament_cmake REQUIRED)

install(PROGRAMS
  scripts/dualarm_task_manager_node.py
  DESTINATION lib/${PROJECT_NAME}
)

install(DIRECTORY
  launch
  DESTINATION share/${PROJECT_NAME}
)

ament_package()
