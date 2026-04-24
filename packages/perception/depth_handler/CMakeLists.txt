cmake_minimum_required(VERSION 3.8)
project(depth_handler)

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

# 默认使用 C++14
if(NOT CMAKE_CXX_STANDARD)
  set(CMAKE_CXX_STANDARD 14)
endif()

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

add_compile_options(-O3)

# 查找依赖包
find_package(ament_cmake REQUIRED)
find_package(dualarm_interfaces REQUIRED)
find_package(rclcpp REQUIRED)
find_package(std_msgs REQUIRED)
find_package(sensor_msgs REQUIRED)
find_package(geometry_msgs REQUIRED) # 添加 geometry_msgs 依赖
find_package(cv_bridge REQUIRED)
find_package(OpenCV REQUIRED)
find_package(message_filters REQUIRED)
find_package(rosidl_default_generators REQUIRED) # 确保在此处添加
find_package(OpenMP QUIET) # OpenMP 可选
find_package(visualization_msgs REQUIRED) # 添加 visualization_msgs 依赖

# 添加TF2相关依赖
find_package(tf2 REQUIRED)
find_package(tf2_ros REQUIRED)
find_package(tf2_eigen REQUIRED)
find_package(tf2_geometry_msgs REQUIRED)

# 消息生成
set(msg_files
  "msg/Bbox3d.msg"
  "msg/Bbox3dArray.msg"
)
rosidl_generate_interfaces(${PROJECT_NAME}
  ${msg_files}
  DEPENDENCIES std_msgs geometry_msgs
)

# 添加包含目录
include_directories(
  include
)

# 定义你的可执行文件
add_executable(depth_processor_node src/depth_processor_node.cpp)

# 消息接口依赖链接 - 使用新的推荐方法替换已弃用的 rosidl_target_interfaces
rosidl_get_typesupport_target(cpp_typesupport_target ${PROJECT_NAME} "rosidl_typesupport_cpp")
target_link_libraries(depth_processor_node ${cpp_typesupport_target})

# 设置依赖
ament_target_dependencies(depth_processor_node
  rclcpp
  dualarm_interfaces
  std_msgs
  sensor_msgs
  geometry_msgs
  message_filters
  cv_bridge
  OpenCV
  visualization_msgs
  # 添加TF2相关依赖
  tf2
  tf2_ros
  tf2_eigen
  tf2_geometry_msgs
)

# 添加编译选项以启用OpenMP
if(OpenMP_CXX_FOUND)
  target_compile_options(depth_processor_node PUBLIC ${OpenMP_CXX_FLAGS})
  set_target_properties(depth_processor_node PROPERTIES LINK_FLAGS "${OpenMP_CXX_FLAGS}")
endif()

# 安装可执行文件
install(TARGETS
  depth_processor_node
  DESTINATION lib/${PROJECT_NAME}
)

# 安装启动文件
install(DIRECTORY
  launch
  DESTINATION share/${PROJECT_NAME}/
)

# 安装头文件
install(DIRECTORY
  include/
  DESTINATION include/
)

# 导出依赖
ament_export_include_directories(include)
ament_export_dependencies(
  rclcpp
  dualarm_interfaces
  std_msgs
  sensor_msgs
  geometry_msgs
  message_filters
  rosidl_default_runtime
  # 添加导出TF2相关依赖
  tf2
  tf2_ros
  tf2_eigen
  tf2_geometry_msgs
)

# 需要添加的其他导出
ament_package()
