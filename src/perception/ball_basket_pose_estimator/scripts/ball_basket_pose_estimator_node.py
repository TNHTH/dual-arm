#!/usr/bin/python3

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, List, Optional, Sequence, Tuple

import numpy as np
import rclpy
import tf2_ros
from geometry_msgs.msg import PoseStamped, Vector3
from rclpy.node import Node
from sensor_msgs.msg import CameraInfo, Image

from dualarm_interfaces.msg import Detection2DArray, SceneObject, SceneObjectArray, Subframe


@dataclass
class RoiSpec:
    semantic_type: str
    roi: Tuple[int, int, int, int]
    size: Tuple[float, float, float]
    confidence: float


class BallBasketPoseEstimatorNode(Node):
    def __init__(self) -> None:
        super().__init__("ball_basket_pose_estimator")

        self.declare_parameter("world_frame", "world")
        self.declare_parameter("output_topic", "/perception/ball_basket_scene_objects")
        self.declare_parameter("detections_topic", "/perception/detection_2d")
        self.declare_parameter("depth_topic", "/camera/depth/image_raw")
        self.declare_parameter("camera_info_topic", "/camera/depth/camera_info")
        self.declare_parameter("use_roi_fallback", False)
        self.declare_parameter("basketball_roi", [220, 120, 120, 120])
        self.declare_parameter("soccer_ball_roi", [380, 120, 120, 120])
        self.declare_parameter("basket_roi", [280, 240, 160, 120])
        self.declare_parameter("basketball_diameter", 0.12)
        self.declare_parameter("soccer_ball_diameter", 0.12)
        self.declare_parameter("basket_size", [0.32, 0.22, 0.18])

        self._output_topic = self.get_parameter("output_topic").value
        self._world_frame = self.get_parameter("world_frame").value
        self._use_roi_fallback = bool(self.get_parameter("use_roi_fallback").value)

        self._camera_info: Optional[CameraInfo] = None
        self._depth_image: Optional[Image] = None
        self._detections: Optional[Detection2DArray] = None
        self._tf_buffer = tf2_ros.Buffer()
        self._tf_listener = tf2_ros.TransformListener(self._tf_buffer, self)

        self._publisher = self.create_publisher(SceneObjectArray, self._output_topic, 10)
        self.create_subscription(CameraInfo, self.get_parameter("camera_info_topic").value, self._camera_cb, 10)
        self.create_subscription(Image, self.get_parameter("depth_topic").value, self._depth_cb, 10)
        self.create_subscription(Detection2DArray, self.get_parameter("detections_topic").value, self._detections_cb, 10)
        self.create_timer(0.2, self._publish_estimates)

        self.get_logger().info(f"ball_basket_pose_estimator 已启动，输出: {self._output_topic}")

    def _camera_cb(self, message: CameraInfo) -> None:
        self._camera_info = message

    def _depth_cb(self, message: Image) -> None:
        self._depth_image = message

    def _detections_cb(self, message: Detection2DArray) -> None:
        self._detections = message

    def _publish_estimates(self) -> None:
        if self._camera_info is None or self._depth_image is None:
            return

        scene = SceneObjectArray()
        scene.header.frame_id = self._world_frame
        scene.header.stamp = self._depth_image.header.stamp
        scene.scene_version = 0

        emitted = 0
        if self._detections and self._detections.detections:
            for index, detection in enumerate(self._detections.detections):
                if detection.semantic_type not in {"basketball", "soccer_ball", "basket"}:
                    continue
                roi = self._detection_to_roi(detection)
                position = self._estimate_roi_center(roi)
                if position is None:
                    continue
                world_position = self._transform_to_world(position)
                if world_position is None:
                    continue
                scene.objects.append(self._build_object(index, detection.semantic_type, world_position))
                emitted += 1

        if emitted == 0 and self._use_roi_fallback:
            for index, spec in enumerate(self._roi_specs()):
                position = self._estimate_roi_center(spec.roi)
                if position is None:
                    continue
                world_position = self._transform_to_world(position)
                if world_position is None:
                    continue
                scene.objects.append(self._build_object(index, spec.semantic_type, world_position, spec))

        self._publisher.publish(scene)

    def _roi_specs(self) -> List[RoiSpec]:
        return [
            RoiSpec(
                "basketball",
                tuple(int(v) for v in self.get_parameter("basketball_roi").value),
                (self.get_parameter("basketball_diameter").value,) * 3,
                0.55,
            ),
            RoiSpec(
                "soccer_ball",
                tuple(int(v) for v in self.get_parameter("soccer_ball_roi").value),
                (self.get_parameter("soccer_ball_diameter").value,) * 3,
                0.55,
            ),
            RoiSpec(
                "basket",
                tuple(int(v) for v in self.get_parameter("basket_roi").value),
                tuple(float(v) for v in self.get_parameter("basket_size").value),
                0.5,
            ),
        ]

    def _detection_to_roi(self, detection) -> Tuple[int, int, int, int]:
        x0 = int(detection.x - detection.width / 2.0)
        y0 = int(detection.y - detection.height / 2.0)
        return x0, y0, int(detection.width), int(detection.height)

    def _estimate_roi_center(self, roi: Sequence[int]) -> Optional[Tuple[float, float, float]]:
        if self._camera_info is None or self._depth_image is None:
            return None

        image = self._depth_image
        x, y, w, h = roi
        width = int(image.width)
        height = int(image.height)

        x0 = max(0, min(width - 1, x))
        y0 = max(0, min(height - 1, y))
        x1 = max(x0 + 1, min(width, x + w))
        y1 = max(y0 + 1, min(height, y + h))

        if image.encoding == "16UC1":
            depth = np.frombuffer(image.data, dtype=np.uint16).reshape((height, width)).astype(np.float32) / 1000.0
        elif image.encoding == "32FC1":
            depth = np.frombuffer(image.data, dtype=np.float32).reshape((height, width))
        else:
            self.get_logger().warn(f"不支持的深度编码: {image.encoding}")
            return None

        roi_depth = depth[y0:y1, x0:x1]
        valid = roi_depth[np.isfinite(roi_depth) & (roi_depth > 0.05)]
        if valid.size == 0:
            return None

        z = float(np.median(valid))
        u = float(x0 + (x1 - x0) / 2.0)
        v = float(y0 + (y1 - y0) / 2.0)

        fx = self._camera_info.k[0]
        fy = self._camera_info.k[4]
        cx = self._camera_info.k[2]
        cy = self._camera_info.k[5]

        x_camera = (u - cx) * z / fx
        y_camera = (v - cy) * z / fy
        return x_camera, y_camera, z

    def _transform_to_world(self, position: Tuple[float, float, float]) -> Optional[Tuple[float, float, float]]:
        source_frame = self._depth_image.header.frame_id or self._camera_info.header.frame_id
        if not source_frame:
            return None
        if source_frame == self._world_frame:
            return position
        try:
            transform = self._tf_buffer.lookup_transform(
                self._world_frame,
                source_frame,
                rclpy.time.Time.from_msg(self._depth_image.header.stamp),
            )
        except Exception as exc:  # pylint: disable=broad-except
            self.get_logger().warn(f"TF 查询失败，无法转换球筐目标到 world: {exc}")
            return None

        px, py, pz = position
        qx = transform.transform.rotation.x
        qy = transform.transform.rotation.y
        qz = transform.transform.rotation.z
        qw = transform.transform.rotation.w

        vx, vy, vz = self._rotate_vector(px, py, pz, qx, qy, qz, qw)
        tx = transform.transform.translation.x
        ty = transform.transform.translation.y
        tz = transform.transform.translation.z
        return vx + tx, vy + ty, vz + tz

    def _rotate_vector(
        self, x: float, y: float, z: float, qx: float, qy: float, qz: float, qw: float
    ) -> Tuple[float, float, float]:
        ix = qw * x + qy * z - qz * y
        iy = qw * y + qz * x - qx * z
        iz = qw * z + qx * y - qy * x
        iw = -qx * x - qy * y - qz * z
        rx = ix * qw + iw * -qx + iy * -qz - iz * -qy
        ry = iy * qw + iw * -qy + iz * -qx - ix * -qz
        rz = iz * qw + iw * -qz + ix * -qy - iy * -qx
        return rx, ry, rz

    def _build_object(
        self,
        index: int,
        semantic_type: str,
        position: Tuple[float, float, float],
        roi_spec: Optional[RoiSpec] = None,
    ) -> SceneObject:
        object_msg = SceneObject()
        object_msg.id = f"{semantic_type}_{index}"
        object_msg.semantic_type = semantic_type
        object_msg.pose = PoseStamped()
        object_msg.pose.header.frame_id = self._world_frame
        object_msg.pose.header.stamp = self._depth_image.header.stamp
        object_msg.pose.pose.position.x = position[0]
        object_msg.pose.pose.position.y = position[1]
        object_msg.pose.pose.position.z = position[2]
        object_msg.pose.pose.orientation.w = 1.0

        if roi_spec is None:
            if semantic_type == "basket":
                roi_spec = RoiSpec("basket", (0, 0, 0, 0), tuple(float(v) for v in self.get_parameter("basket_size").value), 0.6)
            elif semantic_type == "basketball":
                roi_spec = RoiSpec("basketball", (0, 0, 0, 0), (self.get_parameter("basketball_diameter").value,) * 3, 0.6)
            else:
                roi_spec = RoiSpec("soccer_ball", (0, 0, 0, 0), (self.get_parameter("soccer_ball_diameter").value,) * 3, 0.6)

        object_msg.size = Vector3(x=roi_spec.size[0], y=roi_spec.size[1], z=roi_spec.size[2])
        object_msg.confidence = roi_spec.confidence
        object_msg.graspable = semantic_type != "basket"
        object_msg.movable = semantic_type != "basket"
        object_msg.source = "ball_basket_pose_estimator"
        object_msg.last_seen = self._depth_image.header.stamp
        object_msg.scene_version = 0
        object_msg.lifecycle_state = "observed"
        object_msg.reserved_by = "none"
        object_msg.attached_link = ""
        object_msg.pose_covariance_diagonal = [-1.0] * 6

        if semantic_type == "basket":
            object_msg.subframes.extend(
                self._build_subframes(
                    object_msg.pose,
                    [
                        ("basket_center", 0.0),
                        ("basket_release_center", roi_spec.size[2] / 2.0),
                    ],
                )
            )
        else:
            object_msg.subframes.extend(
                self._build_subframes(
                    object_msg.pose,
                    [("ball_center", 0.0)],
                )
            )

        return object_msg

    def _build_subframes(self, base_pose: PoseStamped, offsets: Iterable[Tuple[str, float]]) -> List[Subframe]:
        result: List[Subframe] = []
        for name, z_offset in offsets:
            subframe = Subframe()
            subframe.name = name
            subframe.pose = PoseStamped()
            subframe.pose.header = base_pose.header
            subframe.pose.pose = base_pose.pose
            subframe.pose.pose.position.z += z_offset
            result.append(subframe)
        return result


def main() -> None:
    rclpy.init()
    node = BallBasketPoseEstimatorNode()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        try:
            rclpy.shutdown()
        except Exception:  # pylint: disable=broad-except
            pass


if __name__ == "__main__":
    main()
