cmake_minimum_required(VERSION 3.8)
project(dualarm_interfaces)

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

find_package(ament_cmake REQUIRED)
find_package(rosidl_default_generators REQUIRED)
find_package(action_msgs REQUIRED)
find_package(builtin_interfaces REQUIRED)
find_package(geometry_msgs REQUIRED)
find_package(sensor_msgs REQUIRED)
find_package(std_msgs REQUIRED)
find_package(trajectory_msgs REQUIRED)

rosidl_generate_interfaces(${PROJECT_NAME}
  "msg/Detection2D.msg"
  "msg/Detection2DArray.msg"
  "msg/Subframe.msg"
  "msg/SceneObject.msg"
  "msg/SceneObjectArray.msg"
  "msg/GraspTarget.msg"
  "msg/TaskEvent.msg"
  "srv/ReserveObject.srv"
  "srv/ReleaseObject.srv"
  "srv/SetGripper.srv"
  "srv/AttachObject.srv"
  "srv/DetachObject.srv"
  "srv/PlanPose.srv"
  "srv/PlanCartesian.srv"
  "srv/PlanJoint.srv"
  "srv/PlanDualPose.srv"
  "srv/PlanDualJoint.srv"
  "action/ExecuteTrajectory.action"
  "action/ExecutePrimitive.action"
  "action/RunCompetition.action"
  DEPENDENCIES
    action_msgs
    builtin_interfaces
    geometry_msgs
    sensor_msgs
    std_msgs
    trajectory_msgs
)

ament_export_dependencies(rosidl_default_runtime)
ament_package()
