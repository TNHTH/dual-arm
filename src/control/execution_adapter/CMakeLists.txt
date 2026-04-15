cmake_minimum_required(VERSION 3.8)
project(execution_adapter)

find_package(ament_cmake REQUIRED)

install(PROGRAMS
  scripts/execution_adapter_node.py
  DESTINATION lib/${PROJECT_NAME}
)

install(DIRECTORY
  launch
  DESTINATION share/${PROJECT_NAME}
)

ament_package()
