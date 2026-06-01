cmake_minimum_required(VERSION 3.8)
project(grasp_pose_generator)

find_package(ament_cmake REQUIRED)

install(PROGRAMS
  scripts/grasp_pose_generator_node.py
  DESTINATION lib/${PROJECT_NAME}
)

install(DIRECTORY
  launch
  DESTINATION share/${PROJECT_NAME}
)

ament_package()
