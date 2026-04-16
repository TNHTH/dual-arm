cmake_minimum_required(VERSION 3.8)
project(joint_state_aggregator)

find_package(ament_cmake REQUIRED)

install(PROGRAMS
  scripts/joint_state_aggregator_node.py
  DESTINATION lib/${PROJECT_NAME}
)

install(DIRECTORY
  launch
  DESTINATION share/${PROJECT_NAME}
)

ament_package()
