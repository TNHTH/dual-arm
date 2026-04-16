cmake_minimum_required(VERSION 3.8)
project(competition_start_gate)

find_package(ament_cmake REQUIRED)

install(PROGRAMS
  scripts/competition_start_gate_node.py
  DESTINATION lib/${PROJECT_NAME}
)

install(DIRECTORY
  launch
  DESTINATION share/${PROJECT_NAME}
)

ament_package()
