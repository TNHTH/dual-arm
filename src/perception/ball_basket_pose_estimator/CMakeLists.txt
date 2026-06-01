cmake_minimum_required(VERSION 3.8)
project(ball_basket_pose_estimator)

find_package(ament_cmake REQUIRED)

install(PROGRAMS
  scripts/ball_basket_pose_estimator_node.py
  DESTINATION lib/${PROJECT_NAME}
)

install(DIRECTORY
  config
  launch
  DESTINATION share/${PROJECT_NAME}
)

ament_package()
