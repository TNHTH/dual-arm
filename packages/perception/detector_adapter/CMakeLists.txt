cmake_minimum_required(VERSION 3.8)
project(detector_adapter)

find_package(ament_cmake REQUIRED)

install(PROGRAMS
  scripts/detector_adapter_node.py
  DESTINATION lib/${PROJECT_NAME}
)

install(DIRECTORY
  config
  launch
  DESTINATION share/${PROJECT_NAME}
)

ament_package()
