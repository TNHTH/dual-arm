cmake_minimum_required(VERSION 3.8)
project(detector)

# 设置 C++ 标准
if(NOT CMAKE_CXX_STANDARD)
  set(CMAKE_CXX_STANDARD 14)
endif()

# 编译选项
if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  # add_compile_options(-Wall -Wextra -Wpedantic)
endif()

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

add_compile_options(-O2)

# 查找必要的包
find_package(ament_cmake REQUIRED)
find_package(ament_index_cpp REQUIRED)
find_package(rclcpp REQUIRED)
find_package(rclcpp_components REQUIRED)
find_package(sensor_msgs REQUIRED)
find_package(cv_bridge REQUIRED)
find_package(OpenCV REQUIRED)
find_package(CUDA QUIET)
find_package(rosidl_default_generators REQUIRED)

# 允许在缺少 TensorRT 时只构建消息接口，保证整个工作区可编译。
set(DETECTOR_TENSORRT_ROOT "" CACHE PATH "TensorRT 安装根目录")
set(DETECTOR_PLUGIN_LIB "" CACHE FILEPATH "YOLOv8 TensorRT 插件库路径")

# 添加消息定义 - 将消息生成目标改为${PROJECT_NAME}，与代码中使用的命名空间一致
rosidl_generate_interfaces(${PROJECT_NAME}
  "msg/Bbox2d.msg"
  "msg/Bbox2dArray.msg"
  DEPENDENCIES
  sensor_msgs
  std_msgs
)

# 设置源文件
set(DETECTOR_SOURCES 
  src/detector_node.cpp
  src/lw_detr.cpp
)

# 生成接口
rosidl_get_typesupport_target(cpp_typesupport_target "${PROJECT_NAME}" "rosidl_typesupport_cpp")

find_path(TENSORRT_INCLUDE_DIR
  NAMES NvInfer.h
  HINTS
    ${DETECTOR_TENSORRT_ROOT}
    ${DETECTOR_TENSORRT_ROOT}/include
    /usr
    /usr/local
  PATH_SUFFIXES include include/x86_64-linux-gnu
)
find_library(TENSORRT_NVINFER_LIB NAMES nvinfer HINTS ${DETECTOR_TENSORRT_ROOT} /usr /usr/local PATH_SUFFIXES lib lib64 lib/x86_64-linux-gnu)
find_library(TENSORRT_NVINFER_PLUGIN_LIB NAMES nvinfer_plugin HINTS ${DETECTOR_TENSORRT_ROOT} /usr /usr/local PATH_SUFFIXES lib lib64 lib/x86_64-linux-gnu)
find_library(TENSORRT_NVONNXPARSER_LIB NAMES nvonnxparser HINTS ${DETECTOR_TENSORRT_ROOT} /usr /usr/local PATH_SUFFIXES lib lib64 lib/x86_64-linux-gnu)

set(DETECTOR_RUNTIME_ENABLED OFF)
if(CUDA_FOUND
   AND TENSORRT_INCLUDE_DIR
   AND TENSORRT_NVINFER_LIB
   AND TENSORRT_NVINFER_PLUGIN_LIB
   AND TENSORRT_NVONNXPARSER_LIB)
  set(DETECTOR_RUNTIME_ENABLED ON)
endif()

if(DETECTOR_RUNTIME_ENABLED)
  message(STATUS "TensorRT 环境已就绪，构建 detector 运行时节点")

  # 创建组件库 - 使用独立的库名称
  add_library(detector_lib SHARED ${DETECTOR_SOURCES})

  # 包含目录
  target_include_directories(detector_lib PUBLIC
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
    $<INSTALL_INTERFACE:include>
    ${CUDA_INCLUDE_DIRS}
    ${TENSORRT_INCLUDE_DIR}
  )

  # 设置依赖项
  ament_target_dependencies(detector_lib
    ament_index_cpp
    rclcpp
    rclcpp_components
    sensor_msgs
    cv_bridge
    OpenCV
    rosidl_default_runtime
  )

  # 链接外部库和消息接口
  target_link_libraries(detector_lib
    ${OpenCV_LIBS}
    ${CUDA_LIBRARIES}
    ${TENSORRT_NVINFER_LIB}
    ${TENSORRT_NVINFER_PLUGIN_LIB}
    ${TENSORRT_NVONNXPARSER_LIB}
    "${cpp_typesupport_target}"
  )
  if(EXISTS "${DETECTOR_PLUGIN_LIB}")
    target_link_libraries(detector_lib ${DETECTOR_PLUGIN_LIB})
    message(STATUS "检测到自定义 TensorRT 插件库: ${DETECTOR_PLUGIN_LIB}")
  else()
    message(WARNING
      "未检测到自定义 TensorRT 插件库，detector 仅能用于不依赖外部插件的模型分支。"
      " 如果需要 YOLOv8 自定义插件，请设置 DETECTOR_PLUGIN_LIB。")
  endif()

  # 注册组件
  rclcpp_components_register_node(detector_lib
    PLUGIN "detector::detector_node"
    EXECUTABLE detector_node_exe
  )

  # 重命名库以保持向后兼容
  set_target_properties(detector_lib
    PROPERTIES OUTPUT_NAME detector
  )

  # 安装规则
  install(TARGETS detector_lib
    ARCHIVE DESTINATION lib
    LIBRARY DESTINATION lib
    RUNTIME DESTINATION bin
  )

  install(DIRECTORY include/
    DESTINATION include
  )

  install(FILES plugin_description.xml
    DESTINATION share/${PROJECT_NAME}
  )

  ament_export_include_directories(include)
  ament_export_libraries(detector_lib)
else()
  message(WARNING
    "未检测到完整 TensorRT 运行时，detector 将只构建消息接口。"
    " 如需启用 detector_node，请提供 NvInfer 头文件和 nvinfer 系列库。")
endif()

install(
  PROGRAMS
    scripts/detector_pt_node.py
  DESTINATION lib/${PROJECT_NAME}
)

install(
  DIRECTORY models/
  DESTINATION share/${PROJECT_NAME}/models
  OPTIONAL
)

# 导出依赖项
ament_export_dependencies(
  rclcpp
  ament_index_cpp
  rclcpp_components
  sensor_msgs
  cv_bridge
  OpenCV
  rosidl_default_runtime
)

ament_package()
