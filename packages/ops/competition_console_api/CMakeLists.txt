cmake_minimum_required(VERSION 3.8)
project(competition_console_api)

find_package(ament_cmake REQUIRED)

install(PROGRAMS
  scripts/competition_console_api_node.py
  scripts/competition_console_static_server.py
  DESTINATION lib/${PROJECT_NAME}
)

install(DIRECTORY
  launch
  DESTINATION share/${PROJECT_NAME}
)

ament_package()
