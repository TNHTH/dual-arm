cmake_minimum_required(VERSION 3.8)
project(fairino_dualarm_description)

find_package(ament_cmake REQUIRED)

install(DIRECTORY
  urdf
  DESTINATION share/${PROJECT_NAME}
)

ament_package()
