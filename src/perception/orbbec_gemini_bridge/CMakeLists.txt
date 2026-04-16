cmake_minimum_required(VERSION 3.8)
project(orbbec_gemini_bridge)

find_package(ament_cmake REQUIRED)

install(PROGRAMS
  scripts/orbbec_gemini_ros_bridge.py
  scripts/mock_camera_stream.py
  DESTINATION lib/${PROJECT_NAME}
)

install(DIRECTORY
  launch
  DESTINATION share/${PROJECT_NAME}
)

ament_package()
