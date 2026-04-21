#include "depth_handler/depth_processor_node.hpp"

#include <algorithm>
#include <array>
#include <cmath>
#include <cstring>

#include <geometry_msgs/msg/quaternion.hpp>
#include <tf2/LinearMath/Matrix3x3.h>
#include <sensor_msgs/msg/point_field.hpp>
#include <tf2/LinearMath/Quaternion.h>

#include "dualarm_interfaces/msg/scene_object.hpp"
#include "dualarm_interfaces/msg/subframe.hpp"

namespace depth_handler {

namespace {

struct SemanticPrior {
    std::array<float, 3> size;
    float cap_clearance;
    float cap_pregrasp_offset;
    float pour_pivot_offset;
    float cup_side_grasp_inset;
    float cup_fill_offset;
};

constexpr SemanticPrior kYibao350Prior {
    {0.060f, 0.060f, 0.175f},
    0.012f,
    0.040f,
    0.015f,
    0.0f,
    0.0f,
};
constexpr SemanticPrior kCocaCola300Prior {
    {0.060f, 0.060f, 0.145f},
    0.015f,
    0.040f,
    0.020f,
    0.0f,
    0.0f,
};
constexpr SemanticPrior kCupPrior {
    {0.075f, 0.075f, 0.115f},
    0.0f,
    0.0f,
    0.0f,
    0.0125f,
    0.020f,
};

const SemanticPrior* priorForSemantic(const std::string& semantic_type) {
    if (semantic_type == "water_bottle") {
        return &kYibao350Prior;
    }
    if (semantic_type == "cola_bottle") {
        return &kCocaCola300Prior;
    }
    if (semantic_type.find("cup") != std::string::npos) {
        return &kCupPrior;
    }
    return nullptr;
}

std::array<float, 3> guessSize(const std::string& semantic_type, const Eigen::Vector3f& observed_size) {
    if (const auto* prior = priorForSemantic(semantic_type)) {
        return prior->size;
    }
    return {observed_size.x(), observed_size.y(), observed_size.z()};
}

}  // namespace

DepthProcessorNode::DepthProcessorNode(const rclcpp::NodeOptions& options)
    : Node("depth_processor_node", options) {
    declareParameters();
    loadParameters();

    tf_buffer_ = std::make_shared<tf2_ros::Buffer>(get_clock());
    tf_listener_ = std::make_shared<tf2_ros::TransformListener>(*tf_buffer_);

    bbox3d_publisher_ = create_publisher<depth_handler::msg::Bbox3dArray>(bbox3d_topic_, 10);
    scene_objects_publisher_ =
        create_publisher<dualarm_interfaces::msg::SceneObjectArray>(scene_objects_topic_, 10);
    pointcloud_publisher_ = create_publisher<sensor_msgs::msg::PointCloud2>(pointcloud_topic_, 10);
    marker_publisher_ =
        create_publisher<visualization_msgs::msg::MarkerArray>(visualization_topic_, 10);

    camera_info_sub_ = create_subscription<sensor_msgs::msg::CameraInfo>(
        camera_info_topic_,
        rclcpp::QoS(rclcpp::KeepLast(10)),
        std::bind(&DepthProcessorNode::cameraInfoCallback, this, std::placeholders::_1));
    table_scene_sub_ = create_subscription<dualarm_interfaces::msg::SceneObjectArray>(
        table_scene_topic_,
        rclcpp::QoS(rclcpp::KeepLast(10)),
        std::bind(&DepthProcessorNode::tableSceneCallback, this, std::placeholders::_1));

    auto qos_profile = rclcpp::QoS(rclcpp::KeepLast(10)).get_rmw_qos_profile();
    detection_sub_.subscribe(this, detection_topic_, qos_profile);
    depth_sub_.subscribe(this, depth_topic_, qos_profile);
    synchronizer_ = std::make_shared<message_filters::Synchronizer<SyncPolicy>>(
        SyncPolicy(10), detection_sub_, depth_sub_);
    synchronizer_->registerCallback(
        std::bind(&DepthProcessorNode::synchronizedCallback, this, std::placeholders::_1, std::placeholders::_2));

    parameters_callback_handle_ = add_on_set_parameters_callback(
        std::bind(&DepthProcessorNode::onParametersChanged, this, std::placeholders::_1));

    RCLCPP_INFO(
        get_logger(),
        "depth_handler 已启动，检测输入: %s，深度输入: %s，场景输出: %s",
        detection_topic_.c_str(),
        depth_topic_.c_str(),
        scene_objects_topic_.c_str());
}

void DepthProcessorNode::declareParameters() {
    declare_parameter("camera_info_topic", "/camera/depth/camera_info");
    declare_parameter("depth_topic", "/camera/depth/image_raw");
    declare_parameter("detection_topic", "/perception/detection_2d");
    declare_parameter("bbox3d_topic", "/depth_handler/bbox3d");
    declare_parameter("scene_objects_topic", "/perception/scene_objects");
    declare_parameter("pointcloud_topic", "/depth_handler/pointcloud");
    declare_parameter("visualization_topic", "/depth_handler/visualization");
    declare_parameter("table_scene_topic", "/perception/table_scene_objects");
    declare_parameter("target_frame", "world");
    declare_parameter("enable_visualization", true);
    declare_parameter("enable_pointcloud", true);
    declare_parameter("allow_source_frame_fallback", false);
    declare_parameter("require_depth_aligned_detections", true);
    declare_parameter("require_camera_info_depth_frame", true);
    declare_parameter("expected_detection_frame", "");
    declare_parameter("min_points", 50);
    declare_parameter("fill_target_offset", 0.03);
    declare_parameter("roi_margin_ratio", 0.1);
    declare_parameter("table_reject_distance", 0.018);
    declare_parameter("use_table_plane", true);
    declare_parameter(
        "allowed_semantic_types",
        std::vector<std::string> {
            "cola_bottle",
            "cup",
            "water_bottle",
        });
}

void DepthProcessorNode::loadParameters() {
    camera_info_topic_ = get_parameter("camera_info_topic").as_string();
    depth_topic_ = get_parameter("depth_topic").as_string();
    detection_topic_ = get_parameter("detection_topic").as_string();
    bbox3d_topic_ = get_parameter("bbox3d_topic").as_string();
    scene_objects_topic_ = get_parameter("scene_objects_topic").as_string();
    pointcloud_topic_ = get_parameter("pointcloud_topic").as_string();
    visualization_topic_ = get_parameter("visualization_topic").as_string();
    table_scene_topic_ = get_parameter("table_scene_topic").as_string();
    target_frame_ = get_parameter("target_frame").as_string();
    enable_visualization_ = get_parameter("enable_visualization").as_bool();
    enable_pointcloud_ = get_parameter("enable_pointcloud").as_bool();
    allow_source_frame_fallback_ = get_parameter("allow_source_frame_fallback").as_bool();
    require_depth_aligned_detections_ = get_parameter("require_depth_aligned_detections").as_bool();
    require_camera_info_depth_frame_ = get_parameter("require_camera_info_depth_frame").as_bool();
    expected_detection_frame_ = get_parameter("expected_detection_frame").as_string();
    min_points_ = get_parameter("min_points").as_int();
    fill_target_offset_ = get_parameter("fill_target_offset").as_double();
    roi_margin_ratio_ = get_parameter("roi_margin_ratio").as_double();
    table_reject_distance_ = get_parameter("table_reject_distance").as_double();
    use_table_plane_ = get_parameter("use_table_plane").as_bool();
    allowed_semantic_types_ = get_parameter("allowed_semantic_types").as_string_array();
}

rcl_interfaces::msg::SetParametersResult DepthProcessorNode::onParametersChanged(
    const std::vector<rclcpp::Parameter>&) {
    loadParameters();
    rcl_interfaces::msg::SetParametersResult result;
    result.successful = true;
    return result;
}

void DepthProcessorNode::cameraInfoCallback(const sensor_msgs::msg::CameraInfo::SharedPtr message) {
    camera_info_ = message;
}

void DepthProcessorNode::tableSceneCallback(const dualarm_interfaces::msg::SceneObjectArray::SharedPtr message) {
    table_scene_ = message;
}

void DepthProcessorNode::synchronizedCallback(
    const DetectionArray::ConstSharedPtr& detections,
    const DepthImage::ConstSharedPtr& depth_image) {
    if (!camera_info_) {
        RCLCPP_WARN_THROTTLE(get_logger(), *get_clock(), 2000, "尚未收到 camera_info，跳过本帧");
        return;
    }

    const auto source_frame =
        depth_image->header.frame_id.empty() ? camera_info_->header.frame_id : depth_image->header.frame_id;
    if (require_camera_info_depth_frame_ && camera_info_->header.frame_id != source_frame) {
        RCLCPP_WARN_THROTTLE(
            get_logger(),
            *get_clock(),
            2000,
            "camera_info frame 与 depth frame 不一致，拒绝继续做 3D");
        return;
    }
    const auto expected_detection_frame =
        expected_detection_frame_.empty() ? source_frame : expected_detection_frame_;
    if (require_depth_aligned_detections_ && detections->header.frame_id != expected_detection_frame) {
        RCLCPP_WARN_THROTTLE(
            get_logger(),
            *get_clock(),
            2000,
            "detections frame 未显式对齐到 depth frame，拒绝继续做 3D");
        return;
    }
    const auto transform = lookupTransform(target_frame_, source_frame, depth_image->header.stamp);

    Eigen::Isometry3d transform_matrix = Eigen::Isometry3d::Identity();
    std::string output_frame = source_frame;
    if (transform) {
        transform_matrix = *transform;
        output_frame = target_frame_.empty() ? source_frame : target_frame_;
    } else if (!target_frame_.empty() && target_frame_ != source_frame) {
        if (!allow_source_frame_fallback_) {
            RCLCPP_WARN_THROTTLE(
                get_logger(),
                *get_clock(),
                2000,
                "TF 查询失败且已禁用 source frame fallback，丢弃本帧 scene_objects 发布");
            return;
        }
        RCLCPP_WARN_THROTTLE(
            get_logger(),
            *get_clock(),
            2000,
            "TF 查询失败，按 allow_source_frame_fallback=true 回退到源坐标系发布");
    }

    std::vector<DetectionGeometry> geometries;
    std::vector<Eigen::Vector3f> all_points;
    depth_handler::msg::Bbox3dArray bbox_array;
    dualarm_interfaces::msg::SceneObjectArray scene_array;
    bbox_array.header = depth_image->header;
    bbox_array.header.frame_id = output_frame;
    scene_array.header = depth_image->header;
    scene_array.header.frame_id = output_frame;

    for (size_t index = 0; index < detections->detections.size(); ++index) {
        const auto& detection = detections->detections[index];
        if (!allowed_semantic_types_.empty() &&
            std::find(allowed_semantic_types_.begin(), allowed_semantic_types_.end(), detection.semantic_type) ==
                allowed_semantic_types_.end()) {
            continue;
        }
        const auto geometry = buildGeometry(detection, depth_image, transform_matrix, output_frame);
        if (!geometry) {
            continue;
        }

        geometries.push_back(*geometry);
        const int legacy_class_id = static_cast<int>(index);
        bbox_array.results.push_back(makeLegacyBbox(*geometry, legacy_class_id));
        scene_array.objects.push_back(makeSceneObject(*geometry, static_cast<int>(index), scene_array.header));
        all_points.insert(all_points.end(), geometry->support_points.begin(), geometry->support_points.end());
    }

    bbox3d_publisher_->publish(bbox_array);
    scene_objects_publisher_->publish(scene_array);

    if (enable_pointcloud_ && !all_points.empty()) {
        pointcloud_publisher_->publish(makePointCloudMessage(all_points, scene_array.header));
    }
    if (enable_visualization_ && !geometries.empty()) {
        marker_publisher_->publish(makeMarkers(geometries, scene_array.header));
    }
}

std::optional<DepthProcessorNode::DetectionGeometry> DepthProcessorNode::buildGeometry(
    const dualarm_interfaces::msg::Detection2D& detection,
    const DepthImage::ConstSharedPtr& depth_image,
    const Eigen::Isometry3d& transform,
    const std::string& output_frame) const {
    if (!camera_info_) {
        return std::nullopt;
    }

    const int image_width = static_cast<int>(depth_image->width);
    const int image_height = static_cast<int>(depth_image->height);
    const int margin_x = static_cast<int>(detection.width * roi_margin_ratio_);
    const int margin_y = static_cast<int>(detection.height * roi_margin_ratio_);

    const int x0 = std::max(0, static_cast<int>(detection.x - detection.width / 2.0f) + margin_x);
    const int y0 = std::max(0, static_cast<int>(detection.y - detection.height / 2.0f) + margin_y);
    const int x1 = std::min(image_width, static_cast<int>(detection.x + detection.width / 2.0f) - margin_x);
    const int y1 = std::min(image_height, static_cast<int>(detection.y + detection.height / 2.0f) - margin_y);

    if (x1 <= x0 || y1 <= y0) {
        return std::nullopt;
    }

    const auto source_frame =
        depth_image->header.frame_id.empty() ? camera_info_->header.frame_id : depth_image->header.frame_id;
    auto points = extractRoiPoints(depth_image, x0, y0, x1, y1);
    if (static_cast<int>(points.size()) < min_points_) {
        return std::nullopt;
    }

    const auto table_object = latestTableObject(output_frame);
    std::optional<Eigen::Vector3f> table_point_source_frame;
    std::optional<Eigen::Vector3f> table_normal_source_frame;
    std::optional<Eigen::Vector3f> table_point_output_frame;
    std::optional<Eigen::Vector3f> table_normal_output_frame;
    if (table_object) {
        const auto& table_position = table_object->pose.pose.position;
        table_point_output_frame = Eigen::Vector3f(
            static_cast<float>(table_position.x),
            static_cast<float>(table_position.y),
            static_cast<float>(table_position.z));
        table_normal_output_frame = tableNormal(*table_object);
        if (output_frame.empty() || output_frame == source_frame) {
            table_point_source_frame = *table_point_output_frame;
            table_normal_source_frame = *table_normal_output_frame;
        } else {
            const Eigen::Isometry3f output_to_source = transform.inverse().cast<float>();
            table_point_source_frame = output_to_source * *table_point_output_frame;
            Eigen::Vector3f normal_source_frame = output_to_source.linear() * *table_normal_output_frame;
            const float normal_norm = normal_source_frame.norm();
            if (normal_norm > 1e-6f) {
                table_normal_source_frame = normal_source_frame / normal_norm;
            }
        }
    }

    std::vector<Eigen::Vector3f> transformed_points;
    transformed_points.reserve(points.size());
    int table_rejected = 0;
    for (const auto& point : points) {
        if (table_point_source_frame && table_normal_source_frame) {
            const float distance =
                table_normal_source_frame->dot(point - *table_point_source_frame);
            if (std::abs(distance) <= static_cast<float>(table_reject_distance_)) {
                ++table_rejected;
                continue;
            }
        }
        const Eigen::Vector3f transformed = (transform * point.cast<double>()).cast<float>();
        transformed_points.push_back(transformed);
    }

    if (static_cast<int>(transformed_points.size()) < min_points_) {
        if (table_point_source_frame && table_normal_source_frame && table_point_output_frame && table_normal_output_frame) {
            if (const auto* prior = priorForSemantic(detection.semantic_type)) {
                Eigen::Vector3f support_normal_source = *table_normal_source_frame;
                if (support_normal_source.dot(*table_point_source_frame) > 0.0f) {
                    support_normal_source = -support_normal_source;
                }

                const float fx = static_cast<float>(camera_info_->k[0]);
                const float fy = static_cast<float>(camera_info_->k[4]);
                const float cx = static_cast<float>(camera_info_->k[2]);
                const float cy = static_cast<float>(camera_info_->k[5]);
                if (std::abs(fx) > 1e-6f && std::abs(fy) > 1e-6f) {
                    const float support_u = 0.5f * static_cast<float>(x0 + x1);
                    const float support_v = static_cast<float>(std::max(y0, y1 - 1));
                    Eigen::Vector3f support_ray(
                        (support_u - cx) / fx,
                        (support_v - cy) / fy,
                        1.0f);
                    const float denominator = support_normal_source.dot(support_ray);
                    if (std::abs(denominator) > 1e-6f) {
                        const float distance_along_ray =
                            support_normal_source.dot(*table_point_source_frame) / denominator;
                        if (distance_along_ray > 0.0f) {
                            const Eigen::Vector3f contact_point_source = support_ray * distance_along_ray;
                            const Eigen::Vector3f center_source =
                                contact_point_source + support_normal_source * (prior->size[2] * 0.5f);
                            const Eigen::Vector3f center_output =
                                (transform * center_source.cast<double>()).cast<float>();

                            DetectionGeometry geometry;
                            geometry.semantic_type = detection.semantic_type;
                            geometry.confidence = detection.score;
                            geometry.center = center_output;
                            geometry.support_points = {center_output};
                            geometry.min_point =
                                center_output - Eigen::Vector3f(prior->size[0], prior->size[1], prior->size[2]) * 0.5f;
                            geometry.max_point =
                                center_output + Eigen::Vector3f(prior->size[0], prior->size[1], prior->size[2]) * 0.5f;

                            RCLCPP_WARN(
                                get_logger(),
                                "%s ROI 点经桌面平面剔除后不足，回退到桌面交点+语义先验，raw=%zu filtered=%zu rejected=%d",
                                detection.semantic_type.c_str(),
                                points.size(),
                                transformed_points.size(),
                                table_rejected);
                            return geometry;
                        }
                    }
                }
            }
        }

        RCLCPP_WARN(
            get_logger(),
            "%s ROI 点经桌面平面剔除后不足，raw=%zu filtered=%zu rejected=%d",
            detection.semantic_type.c_str(),
            points.size(),
            transformed_points.size(),
            table_rejected);
        return std::nullopt;
    }

    DetectionGeometry geometry;
    geometry.semantic_type = detection.semantic_type;
    geometry.confidence = detection.score;

    geometry.min_point = transformed_points.front();
    geometry.max_point = geometry.min_point;

    for (const auto& point : transformed_points) {
        geometry.min_point = geometry.min_point.cwiseMin(point);
        geometry.max_point = geometry.max_point.cwiseMax(point);
    }

    geometry.center = (geometry.min_point + geometry.max_point) / 2.0f;
    geometry.support_points = transformed_points;
    return geometry;
}

std::vector<Eigen::Vector3f> DepthProcessorNode::extractRoiPoints(
    const DepthImage::ConstSharedPtr& depth_image,
    int x0,
    int y0,
    int x1,
    int y1) const {
    std::vector<Eigen::Vector3f> points;
    if (!camera_info_) {
        return points;
    }

    const double fx = camera_info_->k[0];
    const double fy = camera_info_->k[4];
    const double cx = camera_info_->k[2];
    const double cy = camera_info_->k[5];

    for (int v = y0; v < y1; ++v) {
        for (int u = x0; u < x1; ++u) {
            const auto depth = readDepthMeters(depth_image, u, v);
            if (!depth) {
                continue;
            }

            const float x = static_cast<float>((u - cx) * *depth / fx);
            const float y = static_cast<float>((v - cy) * *depth / fy);
            points.emplace_back(x, y, static_cast<float>(*depth));
        }
    }

    return points;
}

std::optional<float> DepthProcessorNode::readDepthMeters(
    const DepthImage::ConstSharedPtr& depth_image,
    int u,
    int v) const {
    const size_t index = static_cast<size_t>(v) * depth_image->width + static_cast<size_t>(u);
    if (depth_image->encoding == "16UC1") {
        const auto* raw = reinterpret_cast<const uint16_t*>(depth_image->data.data());
        const uint16_t depth_mm = raw[index];
        if (depth_mm == 0) {
            return std::nullopt;
        }
        return static_cast<float>(depth_mm) / 1000.0f;
    }
    if (depth_image->encoding == "32FC1") {
        const auto* raw = reinterpret_cast<const float*>(depth_image->data.data());
        const float depth_m = raw[index];
        if (!std::isfinite(depth_m) || depth_m <= 0.0f) {
            return std::nullopt;
        }
        return depth_m;
    }
    return std::nullopt;
}

std::optional<dualarm_interfaces::msg::SceneObject> DepthProcessorNode::latestTableObject(
    const std::string& output_frame) const {
    if (!use_table_plane_ || !table_scene_) {
        return std::nullopt;
    }
    for (const auto& object : table_scene_->objects) {
        if (object.semantic_type != "table_surface") {
            continue;
        }
        const auto frame_id = object.pose.header.frame_id.empty()
            ? table_scene_->header.frame_id
            : object.pose.header.frame_id;
        if (!output_frame.empty() && frame_id != output_frame) {
            RCLCPP_WARN(
                get_logger(),
                "桌面 frame=%s 与 depth_handler 输出 frame=%s 不一致，本帧不做桌面剔除",
                frame_id.c_str(),
                output_frame.c_str());
            continue;
        }
        if (object.confidence <= 0.0f) {
            continue;
        }
        return object;
    }
    return std::nullopt;
}

float DepthProcessorNode::signedDistanceToTable(
    const Eigen::Vector3f& point,
    const dualarm_interfaces::msg::SceneObject& table_object) const {
    const auto& position = table_object.pose.pose.position;
    const Eigen::Vector3f table_point(
        static_cast<float>(position.x),
        static_cast<float>(position.y),
        static_cast<float>(position.z));
    return tableNormal(table_object).dot(point - table_point);
}

Eigen::Vector3f DepthProcessorNode::tableNormal(
    const dualarm_interfaces::msg::SceneObject& table_object) const {
    const auto& orientation = table_object.pose.pose.orientation;
    tf2::Quaternion quaternion(orientation.x, orientation.y, orientation.z, orientation.w);
    if (quaternion.length2() < 1e-9) {
        return Eigen::Vector3f::UnitZ();
    }
    quaternion.normalize();
    const tf2::Vector3 z_axis = tf2::Matrix3x3(quaternion) * tf2::Vector3(0.0, 0.0, 1.0);
    Eigen::Vector3f normal(
        static_cast<float>(z_axis.x()),
        static_cast<float>(z_axis.y()),
        static_cast<float>(z_axis.z()));
    const float norm = normal.norm();
    if (norm < 1e-6f) {
        return Eigen::Vector3f::UnitZ();
    }
    return normal / norm;
}

std::optional<Eigen::Isometry3d> DepthProcessorNode::lookupTransform(
    const std::string& target_frame,
    const std::string& source_frame,
    const builtin_interfaces::msg::Time& stamp) const {
    if (target_frame.empty() || target_frame == source_frame) {
        return Eigen::Isometry3d::Identity();
    }

    try {
        const auto transform = tf_buffer_->lookupTransform(
            target_frame, source_frame, rclcpp::Time(stamp), tf2::durationFromSec(0.1));
        return tf2::transformToEigen(transform);
    } catch (const tf2::TransformException& exception) {
        RCLCPP_WARN(get_logger(), "TF 查询失败，退回源坐标系: %s", exception.what());
        return std::nullopt;
    }
}

depth_handler::msg::Bbox3d DepthProcessorNode::makeLegacyBbox(
    const DetectionGeometry& geometry,
    int class_id) const {
    depth_handler::msg::Bbox3d bbox;
    bbox.x = geometry.min_point.x();
    bbox.y = geometry.min_point.y();
    bbox.z = geometry.min_point.z();
    bbox.width = geometry.max_point.x() - geometry.min_point.x();
    bbox.height = geometry.max_point.y() - geometry.min_point.y();
    bbox.depth = geometry.max_point.z() - geometry.min_point.z();
    bbox.class_id = class_id;
    bbox.orientation.w = 1.0;
    return bbox;
}

dualarm_interfaces::msg::SceneObject DepthProcessorNode::makeSceneObject(
    const DetectionGeometry& geometry,
    int index,
    const std_msgs::msg::Header& header) const {
    dualarm_interfaces::msg::SceneObject object;
    object.id = geometry.semantic_type + "_" + std::to_string(index + 1);
    object.semantic_type = geometry.semantic_type;
    object.pose.header = header;
    object.pose.pose.position.x = geometry.center.x();
    object.pose.pose.position.y = geometry.center.y();
    object.pose.pose.position.z = geometry.center.z();
    object.pose.pose.orientation.w = 1.0;

    const auto observed_size = geometry.max_point - geometry.min_point;
    const auto size = guessSize(geometry.semantic_type, observed_size);
    object.size.x = size[0];
    object.size.y = size[1];
    object.size.z = size[2];
    object.confidence = geometry.confidence;
    object.graspable = true;
    object.movable = true;
    object.source = "depth_handler";
    object.last_seen = header.stamp;
    object.scene_version = 0;
    object.lifecycle_state = "observed";
    object.reserved_by = "none";
    object.attached_link = "";
    object.pose_covariance_diagonal = {-1.0f, -1.0f, -1.0f, -1.0f, -1.0f, -1.0f};

    auto add_subframe = [&](const std::string& name, const Eigen::Vector3f& position) {
        dualarm_interfaces::msg::Subframe subframe;
        subframe.name = name;
        subframe.pose.header = header;
        subframe.pose.pose.position.x = position.x();
        subframe.pose.pose.position.y = position.y();
        subframe.pose.pose.position.z = position.z();
        subframe.pose.pose.orientation.w = 1.0;
        object.subframes.push_back(subframe);
    };

    add_subframe("object_center", geometry.center);
    const auto* prior = priorForSemantic(geometry.semantic_type);
    if (geometry.semantic_type.find("bottle") != std::string::npos && prior != nullptr) {
        const float half_height = size[2] * 0.5f;
        const float cap_center_z = geometry.center.z() + half_height - prior->cap_clearance;
        add_subframe(
            "bottle_body_grasp",
            Eigen::Vector3f(geometry.center.x(), geometry.center.y(), geometry.center.z()));
        add_subframe(
            "bottle_cap_center",
            Eigen::Vector3f(geometry.center.x(), geometry.center.y(), cap_center_z));
        add_subframe(
            "bottle_cap_grasp",
            Eigen::Vector3f(geometry.center.x(), geometry.center.y(), cap_center_z));
        add_subframe(
            "bottle_cap_pregrasp",
            Eigen::Vector3f(geometry.center.x(), geometry.center.y(), cap_center_z + prior->cap_pregrasp_offset));
        add_subframe(
            "bottle_mouth",
            Eigen::Vector3f(geometry.center.x(), geometry.center.y(), cap_center_z));
        add_subframe(
            "bottle_twist_axis",
            Eigen::Vector3f(geometry.center.x(), geometry.center.y(), cap_center_z));
        add_subframe(
            "bottle_pour_pivot",
            Eigen::Vector3f(geometry.center.x(), geometry.center.y(), geometry.center.z() + prior->pour_pivot_offset));
    }
    if (geometry.semantic_type.find("cup") != std::string::npos && prior != nullptr) {
        const float half_height = size[2] * 0.5f;
        add_subframe(
            "cup_side_grasp",
            Eigen::Vector3f(geometry.center.x() + size[0] * 0.5f - prior->cup_side_grasp_inset, geometry.center.y(), geometry.center.z()));
        add_subframe(
            "cup_rim_center",
            Eigen::Vector3f(geometry.center.x(), geometry.center.y(), geometry.center.z() + half_height));
        add_subframe(
            "cup_fill_target",
            Eigen::Vector3f(
                geometry.center.x(), geometry.center.y(), geometry.center.z() + half_height - prior->cup_fill_offset));
    }

    return object;
}

sensor_msgs::msg::PointCloud2 DepthProcessorNode::makePointCloudMessage(
    const std::vector<Eigen::Vector3f>& points,
    const std_msgs::msg::Header& header) const {
    sensor_msgs::msg::PointCloud2 cloud;
    cloud.header = header;
    cloud.height = 1;
    cloud.width = static_cast<uint32_t>(points.size());
    cloud.is_dense = false;
    cloud.is_bigendian = false;
    cloud.point_step = 12;
    cloud.row_step = cloud.point_step * cloud.width;
    cloud.fields.resize(3);

    cloud.fields[0].name = "x";
    cloud.fields[0].offset = 0;
    cloud.fields[0].datatype = sensor_msgs::msg::PointField::FLOAT32;
    cloud.fields[0].count = 1;
    cloud.fields[1].name = "y";
    cloud.fields[1].offset = 4;
    cloud.fields[1].datatype = sensor_msgs::msg::PointField::FLOAT32;
    cloud.fields[1].count = 1;
    cloud.fields[2].name = "z";
    cloud.fields[2].offset = 8;
    cloud.fields[2].datatype = sensor_msgs::msg::PointField::FLOAT32;
    cloud.fields[2].count = 1;

    cloud.data.resize(cloud.row_step);
    auto* cursor = cloud.data.data();
    for (const auto& point : points) {
        std::memcpy(cursor, point.data(), 12);
        cursor += 12;
    }
    return cloud;
}

visualization_msgs::msg::MarkerArray DepthProcessorNode::makeMarkers(
    const std::vector<DetectionGeometry>& geometries,
    const std_msgs::msg::Header& header) const {
    visualization_msgs::msg::MarkerArray markers;
    for (size_t index = 0; index < geometries.size(); ++index) {
        const auto& geometry = geometries[index];
        visualization_msgs::msg::Marker marker;
        marker.header = header;
        marker.ns = "scene_objects";
        marker.id = static_cast<int>(index);
        marker.type = visualization_msgs::msg::Marker::CUBE;
        marker.action = visualization_msgs::msg::Marker::ADD;
        marker.pose.position.x = geometry.center.x();
        marker.pose.position.y = geometry.center.y();
        marker.pose.position.z = geometry.center.z();
        marker.pose.orientation.w = 1.0;
        marker.scale.x = std::max(0.01f, geometry.max_point.x() - geometry.min_point.x());
        marker.scale.y = std::max(0.01f, geometry.max_point.y() - geometry.min_point.y());
        marker.scale.z = std::max(0.01f, geometry.max_point.z() - geometry.min_point.z());
        marker.color.r = geometry.semantic_type.find("bottle") != std::string::npos ? 0.2f : 0.8f;
        marker.color.g = geometry.semantic_type.find("cup") != std::string::npos ? 0.8f : 0.2f;
        marker.color.b = 0.3f;
        marker.color.a = 0.8f;
        markers.markers.push_back(marker);
    }
    return markers;
}

}  // namespace depth_handler

int main(int argc, char** argv) {
    rclcpp::init(argc, argv);
    rclcpp::spin(std::make_shared<depth_handler::DepthProcessorNode>());
    rclcpp::shutdown();
    return 0;
}
