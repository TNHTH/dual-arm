cmake_minimum_required(VERSION 3.8)
project(ball_basket_pose_estimator)

option(ROS_BUILD_ALLOW_CONDA_ENV "Allow Conda-contaminated ROS build environment" OFF)

if(NOT DEFINED Python3_EXECUTABLE AND EXISTS "/usr/bin/python3")
  set(Python3_EXECUTABLE "/usr/bin/python3" CACHE FILEPATH "ROS Humble system Python")
endif()
set(PYTHON_EXECUTABLE "${Python3_EXECUTABLE}" CACHE FILEPATH "Legacy Python executable" FORCE)

find_package(Python3 REQUIRED COMPONENTS Interpreter)

if(NOT ROS_BUILD_ALLOW_CONDA_ENV)
  if(NOT Python3_EXECUTABLE STREQUAL "/usr/bin/python3")
    message(FATAL_ERROR "ROS build must use /usr/bin/python3; got ${Python3_EXECUTABLE}")
  endif()
  foreach(_env_var PATH PYTHONPATH LD_LIBRARY_PATH LIBRARY_PATH CMAKE_PREFIX_PATH)
    if("$ENV{${_env_var}}" MATCHES "conda|Conda|miniconda|anaconda")
      message(FATAL_ERROR
        "Conda path detected in ${_env_var}; build from a clean ROS shell or pass ROS_BUILD_ALLOW_CONDA_ENV=ON only for explicit debug.")
    endif()
  endforeach()
endif()

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
