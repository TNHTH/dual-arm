cmake_minimum_required(VERSION 3.8)
project(competition_console_api)

find_package(ament_cmake REQUIRED)

install(PROGRAMS
  scripts/competition_console_api_node.py
  scripts/competition_console_static_server.py
  DESTINATION lib/${PROJECT_NAME}
)

install(FILES
  scripts/competition_console_security.py
  DESTINATION lib/${PROJECT_NAME}
)

install(DIRECTORY
  launch
  DESTINATION share/${PROJECT_NAME}
)

if(BUILD_TESTING)
  find_package(ament_cmake_pytest REQUIRED)
  ament_add_pytest_test(test_console_security test/test_console_security.py)
endif()

ament_package()
