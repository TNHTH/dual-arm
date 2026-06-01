cmake_minimum_required(VERSION 3.8)
project(dualarm_task_manager)

find_package(ament_cmake REQUIRED)

install(PROGRAMS
  scripts/dualarm_task_manager_node.py
  DESTINATION lib/${PROJECT_NAME}
)

install(FILES
  scripts/behavior_contract.py
  scripts/task_contract.py
  DESTINATION lib/${PROJECT_NAME}
)

install(DIRECTORY
  scripts/behaviors
  DESTINATION lib/${PROJECT_NAME}
)

install(DIRECTORY
  launch
  DESTINATION share/${PROJECT_NAME}
)

if(BUILD_TESTING)
  find_package(ament_cmake_pytest REQUIRED)
  ament_add_pytest_test(test_dualarm_task_contract test/test_dualarm_task_contract.py)
endif()

ament_package()
