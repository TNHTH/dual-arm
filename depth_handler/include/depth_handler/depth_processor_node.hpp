#pragma once

#include <memory>
#include <optional>
#include <string>
#include <vector>

#include <Eigen/Dense>
#include <cv_bridge/cv_bridge.h>
#include <geometry_msgs/msg/point_stamped.hpp>
#include <message_filters/subscriber.h>
#include <message_filters/sync_policies/approximate_time.h>
#include <message_filters/synchronizer.h>
#include <rcl_interfaces/msg/set_parameters_result.hpp>
#include <rclcpp/rclcpp.hpp>
#include <sensor_msgs/msg/camera_info.hpp>
#include <sensor_msgs/msg/image.hpp>
#include <sensor_msgs/msg/point_cloud2.hpp>
#include <tf2_eigen/tf2_eigen.hpp>
#include <tf2_ros/buffer.h>
#include <tf2_ros/transform_listener.h>
#include <visualization_msgs/msg/marker_array.hpp>

#include "depth_handler/msg/bbox3d.hpp"
#include "depth_handler/msg/bbox3d_array.hpp"
#include "dualarm_interfaces/msg/detection2_d_array.hpp"
#include "dualarm_interfaces/msg/scene_object_array.hpp"

namespace depth_handler {

class DepthProcessorNode: public rclcpp::Node {
public:
    explicit DepthProcessorNode(const rclcpp::NodeOptions& options = rclcpp::NodeOptions());
    ~DepthProcessorNode() override = default;

private:
    using DetectionArray = dualarm_interfaces::msg::Detection2DArray;
    using DepthImage = sensor_msgs::msg::Image;
    using SyncPolicy =
        message_filters::sync_policies::ApproximateTime<DetectionArray, DepthImage>;

    struct DetectionGeometry {
        std::string semantic_type;
        Eigen::Vector3f min_point;
        Eigen::Vector3f max_point;
        Eigen::Vector3f center;
        float confidence {0.0f};
    };

    void declareParameters();
    void loadParameters();
    rcl_interfaces::msg::SetParametersResult onParametersChanged(
        const std::vector<rclcpp::Parameter>& parameters);

    void cameraInfoCallback(const sensor_msgs::msg::CameraInfo::SharedPtr message);
    void synchronizedCallback(
        const DetectionArray::ConstSharedPtr& detections,
        const DepthImage::ConstSharedPtr& depth_image);

    std::optional<DetectionGeometry> buildGeometry(
        const dualarm_interfaces::msg::Detection2D& detection,
        const DepthImage::ConstSharedPtr& depth_image,
        const Eigen::Isometry3d& transform) const;
    std::vector<Eigen::Vector3f> extractRoiPoints(
        const DepthImage::ConstSharedPtr& depth_image,
        int x0,
        int y0,
        int x1,
        int y1) const;
    std::optional<float> readDepthMeters(
        const DepthImage::ConstSharedPtr& depth_image,
        int u,
        int v) const;
    std::optional<Eigen::Isometry3d> lookupTransform(
        const std::string& target_frame,
        const std::string& source_frame,
        const builtin_interfaces::msg::Time& stamp) const;

    depth_handler::msg::Bbox3d makeLegacyBbox(
        const DetectionGeometry& geometry,
        int class_id) const;
    dualarm_interfaces::msg::SceneObject makeSceneObject(
        const DetectionGeometry& geometry,
        int index,
        const std_msgs::msg::Header& header) const;

    sensor_msgs::msg::PointCloud2 makePointCloudMessage(
        const std::vector<Eigen::Vector3f>& points,
        const std_msgs::msg::Header& header) const;
    visualization_msgs::msg::MarkerArray makeMarkers(
        const std::vector<DetectionGeometry>& geometries,
        const std_msgs::msg::Header& header) const;

    std::string camera_info_topic_;
    std::string depth_topic_;
    std::string detection_topic_;
    std::string bbox3d_topic_;
    std::string scene_objects_topic_;
    std::string pointcloud_topic_;
    std::string visualization_topic_;
    std::string target_frame_;
    bool enable_visualization_ {true};
    bool enable_pointcloud_ {true};
    int min_points_ {50};
    double fill_target_offset_ {0.03};
    double roi_margin_ratio_ {0.1};

    sensor_msgs::msg::CameraInfo::SharedPtr camera_info_;
    rclcpp::Subscription<sensor_msgs::msg::CameraInfo>::SharedPtr camera_info_sub_;
    std::shared_ptr<tf2_ros::Buffer> tf_buffer_;
    std::shared_ptr<tf2_ros::TransformListener> tf_listener_;
    rclcpp::node_interfaces::OnSetParametersCallbackHandle::SharedPtr parameters_callback_handle_;

    message_filters::Subscriber<DetectionArray> detection_sub_;
    message_filters::Subscriber<DepthImage> depth_sub_;
    std::shared_ptr<message_filters::Synchronizer<SyncPolicy>> synchronizer_;

    rclcpp::Publisher<depth_handler::msg::Bbox3dArray>::SharedPtr bbox3d_publisher_;
    rclcpp::Publisher<dualarm_interfaces::msg::SceneObjectArray>::SharedPtr scene_objects_publisher_;
    rclcpp::Publisher<sensor_msgs::msg::PointCloud2>::SharedPtr pointcloud_publisher_;
    rclcpp::Publisher<visualization_msgs::msg::MarkerArray>::SharedPtr marker_publisher_;
};

}  // namespace depth_handler
