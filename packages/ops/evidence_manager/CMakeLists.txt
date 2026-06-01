cmake_minimum_required(VERSION 3.8)
project(evidence_manager)

if(EXISTS "/usr/bin/python3")
  set(Python3_EXECUTABLE "/usr/bin/python3" CACHE FILEPATH "ROS Humble system Python" FORCE)
endif()

find_package(ament_cmake REQUIRED)

install(PROGRAMS
  scripts/evidence_manager_node.py
  DESTINATION lib/${PROJECT_NAME}
)

install(DIRECTORY
  launch
  DESTINATION share/${PROJECT_NAME}
)

install(FILES
  README.md
  DESTINATION share/${PROJECT_NAME}
)

ament_package()
