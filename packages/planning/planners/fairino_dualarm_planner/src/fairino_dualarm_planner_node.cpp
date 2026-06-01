#include <chrono>
#include <optional>
#include <map>
#include <memory>
#include <string>
#include <vector>

#include <dualarm_interfaces/msg/scene_object_array.hpp>
#include <dualarm_interfaces/srv/plan_cartesian.hpp>
#include <dualarm_interfaces/srv/plan_dual_joint.hpp>
#include <dualarm_interfaces/srv/plan_dual_pose.hpp>
#include <dualarm_interfaces/srv/plan_joint.hpp>
#include <dualarm_interfaces/srv/plan_pose.hpp>
#include <moveit/move_group_interface/move_group_interface.h>
#include <moveit_msgs/msg/robot_trajectory.hpp>
#include <robo_ctrl/msg/robot_state.hpp>
#include <rclcpp/executors/multi_threaded_executor.hpp>
#include <rclcpp/rclcpp.hpp>

namespace {

using PlanPose = dualarm_interfaces::srv::PlanPose;
using PlanCartesian = dualarm_interfaces::srv::PlanCartesian;
using PlanJoint = dualarm_interfaces::srv::PlanJoint;
using PlanDualPose = dualarm_interfaces::srv::PlanDualPose;
using PlanDualJoint = dualarm_interfaces::srv::PlanDualJoint;
using MoveGroupInterface = moveit::planning_interface::MoveGroupInterface;

template <typename ResponseT>
void fill_common_failure(
    const std::shared_ptr<ResponseT>& response,
    const std::string& code,
    const std::string& stage,
    const std::string& message)
{
  response->success = false;
  response->result_code = code;
  response->failure_stage = stage;
  response->message = message;
}

template <typename ResponseT>
void fill_common_success(
    const std::shared_ptr<ResponseT>& response,
    const std::string& message)
{
  response->success = true;
  response->result_code = "success";
  response->failure_stage = "";
  response->message = message;
}

}  // namespace

class FairinoDualArmPlannerNode : public rclcpp::Node
{
public:
  FairinoDualArmPlannerNode()
  : Node("fairino_dualarm_planner")
  {
    declare_parameter("scene_topic", "/scene_fusion/scene_objects");
    declare_parameter("planning_time", 5.0);
    declare_parameter("planning_attempts", 10);
    declare_parameter("scene_age_limit_ms", 200);
    declare_parameter("robot_state_age_limit_ms", 100);
    declare_parameter("dual_arm_half_span", 0.08);

    planner_service_group_ = create_callback_group(rclcpp::CallbackGroupType::Reentrant);

    scene_sub_ = create_subscription<dualarm_interfaces::msg::SceneObjectArray>(
      get_parameter("scene_topic").as_string(),
      10,
      [this](dualarm_interfaces::msg::SceneObjectArray::SharedPtr msg) {
        latest_scene_ = *msg;
      });
    left_state_sub_ = create_subscription<robo_ctrl::msg::RobotState>(
      "/L/robot_state", 10, [this](robo_ctrl::msg::RobotState::SharedPtr msg) { left_robot_state_ = *msg; });
    right_state_sub_ = create_subscription<robo_ctrl::msg::RobotState>(
      "/R/robot_state", 10, [this](robo_ctrl::msg::RobotState::SharedPtr msg) { right_robot_state_ = *msg; });

    plan_pose_srv_ = create_service<PlanPose>(
      "/planning/plan_pose",
      std::bind(&FairinoDualArmPlannerNode::handle_plan_pose, this, std::placeholders::_1, std::placeholders::_2),
      rmw_qos_profile_services_default,
      planner_service_group_);
    plan_cartesian_srv_ = create_service<PlanCartesian>(
      "/planning/plan_cartesian",
      std::bind(&FairinoDualArmPlannerNode::handle_plan_cartesian, this, std::placeholders::_1, std::placeholders::_2),
      rmw_qos_profile_services_default,
      planner_service_group_);
    plan_joint_srv_ = create_service<PlanJoint>(
      "/planning/plan_joint",
      std::bind(&FairinoDualArmPlannerNode::handle_plan_joint, this, std::placeholders::_1, std::placeholders::_2),
      rmw_qos_profile_services_default,
      planner_service_group_);
    plan_dual_pose_srv_ = create_service<PlanDualPose>(
      "/planning/plan_dual_pose",
      std::bind(&FairinoDualArmPlannerNode::handle_plan_dual_pose, this, std::placeholders::_1, std::placeholders::_2),
      rmw_qos_profile_services_default,
      planner_service_group_);
    plan_dual_joint_srv_ = create_service<PlanDualJoint>(
      "/planning/plan_dual_joint",
      std::bind(&FairinoDualArmPlannerNode::handle_plan_dual_joint, this, std::placeholders::_1, std::placeholders::_2),
      rmw_qos_profile_services_default,
      planner_service_group_);

    RCLCPP_INFO(get_logger(), "fairino_dualarm_planner C++ MoveIt 节点已启动");
  }

private:
  template <typename ResponseT>
  void fill_response_metadata(const std::string& arm_group, const std::shared_ptr<ResponseT>& response)
  {
    response->scene_version = latest_scene_.scene_version == 0 ? max_scene_version() : latest_scene_.scene_version;
    const auto current_time = current_robot_state_stamp(arm_group);
    response->start_state_stamp.sec = static_cast<int32_t>(current_time.nanoseconds() / 1000000000LL);
    response->start_state_stamp.nanosec = static_cast<uint32_t>(current_time.nanoseconds() % 1000000000LL);
    response->primary_arm_group = arm_group == "dual_arm" ? "left_arm" : arm_group;
    response->secondary_arm_group = arm_group == "dual_arm" ? "right_arm" : "";
    response->synchronized = arm_group == "dual_arm";
    response->planning_time_ms = 0.0F;
  }

  template <typename ResponseT>
  void fill_dual_response_metadata(const std::shared_ptr<ResponseT>& response)
  {
    response->scene_version = latest_scene_.scene_version == 0 ? max_scene_version() : latest_scene_.scene_version;
    const auto current_time = current_robot_state_stamp("dual_arm");
    response->start_state_stamp.sec = static_cast<int32_t>(current_time.nanoseconds() / 1000000000LL);
    response->start_state_stamp.nanosec = static_cast<uint32_t>(current_time.nanoseconds() % 1000000000LL);
    response->planning_time_ms = 0.0F;
  }

  std::shared_ptr<MoveGroupInterface> make_group(const std::string& arm_group)
  {
    auto group = std::make_shared<MoveGroupInterface>(shared_from_this(), arm_group);
    group->setPlanningTime(get_parameter("planning_time").as_double());
    group->setNumPlanningAttempts(get_parameter("planning_attempts").as_int());
    group->setMaxVelocityScalingFactor(0.3);
    group->setMaxAccelerationScalingFactor(0.3);
    return group;
  }

  void handle_plan_pose(
    const std::shared_ptr<PlanPose::Request> request,
    std::shared_ptr<PlanPose::Response> response)
  {
    fill_response_metadata(request->arm_group, response);
    const auto start = std::chrono::steady_clock::now();

    if (!scene_is_fresh()) {
      fill_common_failure(response, "scene_stale", "scene", "scene_fusion 数据过期");
      return;
    }
    if (!robot_state_is_fresh(request->arm_group)) {
      fill_common_failure(response, "scene_stale", "validation", "robot_state 数据过期");
      return;
    }

    if (request->arm_group == "dual_arm") {
      try {
        auto group = make_group(request->arm_group);
        if (!request->planner_id.empty()) {
          group->setPlannerId(request->planner_id);
        }
        geometry_msgs::msg::PoseStamped left_pose = request->target_pose;
        geometry_msgs::msg::PoseStamped right_pose = request->target_pose;
        const double half_span = get_parameter("dual_arm_half_span").as_double();
        left_pose.pose.position.y += half_span;
        right_pose.pose.position.y -= half_span;
        group->setPoseTarget(left_pose, "left_tcp");
        group->setPoseTarget(right_pose, "right_tcp");
        MoveGroupInterface::Plan plan;
        auto result = group->plan(plan);
        response->planning_time_ms = elapsed_ms(start);
        if (result != moveit::core::MoveItErrorCode::SUCCESS) {
          fill_common_failure(response, "collision", "path_search", "MoveIt dual_arm PlanPose 规划失败");
          return;
        }
        split_combined_trajectory(plan.trajectory_.joint_trajectory, response->joint_trajectory, response->secondary_joint_trajectory);
        response->cartesian_waypoints = {left_pose, right_pose};
        fill_common_success(response, "MoveIt dual_arm PlanPose 规划成功");
        return;
      } catch (const std::exception& error) {
        response->planning_time_ms = elapsed_ms(start);
        fill_common_failure(response, "timeout", "validation", error.what());
        return;
      }
    }

    try {
      auto group = make_group(request->arm_group);
      if (!request->planner_id.empty()) {
        group->setPlannerId(request->planner_id);
      }
      group->setPoseTarget(request->target_pose);
      MoveGroupInterface::Plan plan;
      auto result = group->plan(plan);
      response->planning_time_ms = elapsed_ms(start);
      if (result != moveit::core::MoveItErrorCode::SUCCESS) {
        fill_common_failure(response, "ik_failed", "path_search", "MoveIt PlanPose 规划失败");
        return;
      }
      fill_common_success(response, "MoveIt PlanPose 规划成功");
      response->joint_trajectory = plan.trajectory_.joint_trajectory;
      response->cartesian_waypoints = {request->target_pose};
    } catch (const std::exception& error) {
      response->planning_time_ms = elapsed_ms(start);
      fill_common_failure(response, "timeout", "validation", error.what());
    }
  }

  void handle_plan_cartesian(
    const std::shared_ptr<PlanCartesian::Request> request,
    std::shared_ptr<PlanCartesian::Response> response)
  {
    fill_response_metadata(request->arm_group, response);
    const auto start = std::chrono::steady_clock::now();
    if (!scene_is_fresh()) {
      fill_common_failure(response, "scene_stale", "scene", "scene_fusion 数据过期");
      return;
    }
    if (!robot_state_is_fresh(request->arm_group)) {
      fill_common_failure(response, "scene_stale", "validation", "robot_state 数据过期");
      return;
    }
    if (request->arm_group == "dual_arm") {
      fill_common_failure(response, "constraint_violation", "validation", "PlanCartesian 暂不支持 dual_arm 单接口");
      return;
    }
    if (request->waypoints.empty()) {
      fill_common_failure(response, "partial", "path_search", "waypoints 为空");
      return;
    }

    try {
      auto group = make_group(request->arm_group);
      std::vector<geometry_msgs::msg::Pose> waypoints;
      waypoints.reserve(request->waypoints.size());
      for (const auto& waypoint : request->waypoints) {
        waypoints.push_back(waypoint.pose);
      }
      moveit_msgs::msg::RobotTrajectory trajectory;
      const double fraction = group->computeCartesianPath(waypoints, 0.01, 0.0, trajectory);
      response->planning_time_ms = elapsed_ms(start);
      if (fraction < 0.95) {
        fill_common_failure(response, "partial", "path_search", "Cartesian path fraction < 0.95");
        response->joint_trajectory = trajectory.joint_trajectory;
        return;
      }
      fill_common_success(response, "MoveIt Cartesian path 规划成功");
      response->joint_trajectory = trajectory.joint_trajectory;
    } catch (const std::exception& error) {
      response->planning_time_ms = elapsed_ms(start);
      fill_common_failure(response, "timeout", "validation", error.what());
    }
  }

  void handle_plan_joint(
    const std::shared_ptr<PlanJoint::Request> request,
    std::shared_ptr<PlanJoint::Response> response)
  {
    fill_response_metadata(request->arm_group, response);
    const auto start = std::chrono::steady_clock::now();
    if (!scene_is_fresh()) {
      fill_common_failure(response, "scene_stale", "scene", "scene_fusion 数据过期");
      return;
    }
    if (!robot_state_is_fresh(request->arm_group)) {
      fill_common_failure(response, "scene_stale", "validation", "robot_state 数据过期");
      return;
    }

    try {
      auto group = make_group(request->arm_group);
      if (!request->planner_id.empty()) {
        group->setPlannerId(request->planner_id);
      }
      if (request->target_joints.name.empty() || request->target_joints.position.empty()) {
        fill_common_failure(response, "constraint_violation", "validation", "target_joints 为空");
        return;
      }
      std::map<std::string, double> joint_targets;
      for (size_t index = 0; index < request->target_joints.name.size() && index < request->target_joints.position.size(); ++index) {
        joint_targets[request->target_joints.name[index]] = request->target_joints.position[index];
      }
      group->setJointValueTarget(joint_targets);
      MoveGroupInterface::Plan plan;
      auto result = group->plan(plan);
      response->planning_time_ms = elapsed_ms(start);
      if (result != moveit::core::MoveItErrorCode::SUCCESS) {
        fill_common_failure(response, "collision", "path_search", "MoveIt PlanJoint 规划失败");
        return;
      }
      fill_common_success(response, "MoveIt PlanJoint 规划成功");
      if (request->arm_group == "dual_arm") {
        split_combined_trajectory(plan.trajectory_.joint_trajectory, response->joint_trajectory, response->secondary_joint_trajectory);
      } else {
        response->joint_trajectory = plan.trajectory_.joint_trajectory;
      }
    } catch (const std::exception& error) {
      response->planning_time_ms = elapsed_ms(start);
      fill_common_failure(response, "timeout", "validation", error.what());
    }
  }

  void handle_plan_dual_pose(
    const std::shared_ptr<PlanDualPose::Request> request,
    std::shared_ptr<PlanDualPose::Response> response)
  {
    fill_dual_response_metadata(response);
    const auto start = std::chrono::steady_clock::now();
    if (!scene_is_fresh()) {
      fill_common_failure(response, "scene_stale", "scene", "scene_fusion 数据过期");
      return;
    }
    if (!robot_state_is_fresh("dual_arm")) {
      fill_common_failure(response, "scene_stale", "validation", "robot_state 数据过期");
      return;
    }

    try {
      auto group = make_group("dual_arm");
      if (!request->planner_id.empty()) {
        group->setPlannerId(request->planner_id);
      }
      group->setPoseTarget(request->left_target_pose, "left_tcp");
      group->setPoseTarget(request->right_target_pose, "right_tcp");
      MoveGroupInterface::Plan plan;
      auto result = group->plan(plan);
      response->planning_time_ms = elapsed_ms(start);
      if (result != moveit::core::MoveItErrorCode::SUCCESS) {
        fill_common_failure(response, "collision", "path_search", "MoveIt PlanDualPose 规划失败");
        return;
      }
      split_combined_trajectory(plan.trajectory_.joint_trajectory, response->left_joint_trajectory, response->right_joint_trajectory);
      fill_common_success(response, "MoveIt PlanDualPose 规划成功");
    } catch (const std::exception& error) {
      response->planning_time_ms = elapsed_ms(start);
      fill_common_failure(response, "timeout", "validation", error.what());
    }
  }

  void handle_plan_dual_joint(
    const std::shared_ptr<PlanDualJoint::Request> request,
    std::shared_ptr<PlanDualJoint::Response> response)
  {
    fill_dual_response_metadata(response);
    const auto start = std::chrono::steady_clock::now();
    if (!scene_is_fresh()) {
      fill_common_failure(response, "scene_stale", "scene", "scene_fusion 数据过期");
      return;
    }
    if (!robot_state_is_fresh("dual_arm")) {
      fill_common_failure(response, "scene_stale", "validation", "robot_state 数据过期");
      return;
    }

    try {
      auto group = make_group("dual_arm");
      if (!request->planner_id.empty()) {
        group->setPlannerId(request->planner_id);
      }
      std::map<std::string, double> joint_targets;
      for (size_t index = 0; index < request->left_target_joints.name.size() && index < request->left_target_joints.position.size(); ++index) {
        joint_targets[request->left_target_joints.name[index]] = request->left_target_joints.position[index];
      }
      for (size_t index = 0; index < request->right_target_joints.name.size() && index < request->right_target_joints.position.size(); ++index) {
        joint_targets[request->right_target_joints.name[index]] = request->right_target_joints.position[index];
      }
      if (joint_targets.empty()) {
        fill_common_failure(response, "constraint_violation", "validation", "dual target joints 为空");
        return;
      }
      group->setJointValueTarget(joint_targets);
      MoveGroupInterface::Plan plan;
      auto result = group->plan(plan);
      response->planning_time_ms = elapsed_ms(start);
      if (result != moveit::core::MoveItErrorCode::SUCCESS) {
        fill_common_failure(response, "collision", "path_search", "MoveIt PlanDualJoint 规划失败");
        return;
      }
      split_combined_trajectory(plan.trajectory_.joint_trajectory, response->left_joint_trajectory, response->right_joint_trajectory);
      fill_common_success(response, "MoveIt PlanDualJoint 规划成功");
    } catch (const std::exception& error) {
      response->planning_time_ms = elapsed_ms(start);
      fill_common_failure(response, "timeout", "validation", error.what());
    }
  }

  float elapsed_ms(const std::chrono::steady_clock::time_point& start) const
  {
    const auto elapsed = std::chrono::steady_clock::now() - start;
    return static_cast<float>(std::chrono::duration_cast<std::chrono::microseconds>(elapsed).count()) / 1000.0F;
  }

  uint32_t max_scene_version() const
  {
    uint32_t version = latest_scene_.scene_version;
    for (const auto& object : latest_scene_.objects) {
      version = std::max(version, object.scene_version);
    }
    return version;
  }

  rclcpp::Time current_robot_state_stamp(const std::string& arm_group) const
  {
    if (arm_group == "left_arm" && left_robot_state_.has_value()) {
      return rclcpp::Time(left_robot_state_->header.stamp);
    }
    if (arm_group == "right_arm" && right_robot_state_.has_value()) {
      return rclcpp::Time(right_robot_state_->header.stamp);
    }
    if (arm_group == "dual_arm" && left_robot_state_.has_value() && right_robot_state_.has_value()) {
      const auto left_stamp = rclcpp::Time(left_robot_state_->header.stamp);
      const auto right_stamp = rclcpp::Time(right_robot_state_->header.stamp);
      return left_stamp > right_stamp ? left_stamp : right_stamp;
    }
    return now();
  }

  bool scene_is_fresh() const
  {
    if (latest_scene_.header.stamp.sec == 0 && latest_scene_.header.stamp.nanosec == 0) {
      return false;
    }
    const auto age_limit_ns = static_cast<int64_t>(get_parameter("scene_age_limit_ms").as_int()) * 1000000LL;
    return (now() - rclcpp::Time(latest_scene_.header.stamp)).nanoseconds() <= age_limit_ns;
  }

  bool robot_state_is_fresh(const std::string& arm_group) const
  {
    const auto age_limit_ns = static_cast<int64_t>(get_parameter("robot_state_age_limit_ms").as_int()) * 1000000LL;
    const auto now_time = now();
    if (arm_group == "left_arm") {
      return left_robot_state_.has_value() && (now_time - rclcpp::Time(left_robot_state_->header.stamp)).nanoseconds() <= age_limit_ns;
    }
    if (arm_group == "right_arm") {
      return right_robot_state_.has_value() && (now_time - rclcpp::Time(right_robot_state_->header.stamp)).nanoseconds() <= age_limit_ns;
    }
    return left_robot_state_.has_value() &&
           right_robot_state_.has_value() &&
           (now_time - rclcpp::Time(left_robot_state_->header.stamp)).nanoseconds() <= age_limit_ns &&
           (now_time - rclcpp::Time(right_robot_state_->header.stamp)).nanoseconds() <= age_limit_ns;
  }

  void split_combined_trajectory(
    const trajectory_msgs::msg::JointTrajectory& combined,
    trajectory_msgs::msg::JointTrajectory& left,
    trajectory_msgs::msg::JointTrajectory& right) const
  {
    std::vector<size_t> left_indices;
    std::vector<size_t> right_indices;
    for (size_t index = 0; index < combined.joint_names.size(); ++index) {
      const auto& name = combined.joint_names[index];
      if (name.rfind("left_", 0) == 0) {
        left_indices.push_back(index);
        left.joint_names.push_back(name);
      } else if (name.rfind("right_", 0) == 0) {
        right_indices.push_back(index);
        right.joint_names.push_back(name);
      }
    }

    for (const auto& point : combined.points) {
      trajectory_msgs::msg::JointTrajectoryPoint left_point;
      trajectory_msgs::msg::JointTrajectoryPoint right_point;
      left_point.time_from_start = point.time_from_start;
      right_point.time_from_start = point.time_from_start;
      for (const auto index : left_indices) {
        left_point.positions.push_back(point.positions[index]);
      }
      for (const auto index : right_indices) {
        right_point.positions.push_back(point.positions[index]);
      }
      left.points.push_back(left_point);
      right.points.push_back(right_point);
    }
  }

  dualarm_interfaces::msg::SceneObjectArray latest_scene_;
  std::optional<robo_ctrl::msg::RobotState> left_robot_state_;
  std::optional<robo_ctrl::msg::RobotState> right_robot_state_;
  rclcpp::Subscription<dualarm_interfaces::msg::SceneObjectArray>::SharedPtr scene_sub_;
  rclcpp::Subscription<robo_ctrl::msg::RobotState>::SharedPtr left_state_sub_;
  rclcpp::Subscription<robo_ctrl::msg::RobotState>::SharedPtr right_state_sub_;
  rclcpp::CallbackGroup::SharedPtr planner_service_group_;
  rclcpp::Service<PlanPose>::SharedPtr plan_pose_srv_;
  rclcpp::Service<PlanCartesian>::SharedPtr plan_cartesian_srv_;
  rclcpp::Service<PlanJoint>::SharedPtr plan_joint_srv_;
  rclcpp::Service<PlanDualPose>::SharedPtr plan_dual_pose_srv_;
  rclcpp::Service<PlanDualJoint>::SharedPtr plan_dual_joint_srv_;
};

int main(int argc, char** argv)
{
  rclcpp::init(argc, argv);
  auto node = std::make_shared<FairinoDualArmPlannerNode>();
  rclcpp::executors::MultiThreadedExecutor executor;
  executor.add_node(node);
  executor.spin();
  rclcpp::shutdown();
  return 0;
}
