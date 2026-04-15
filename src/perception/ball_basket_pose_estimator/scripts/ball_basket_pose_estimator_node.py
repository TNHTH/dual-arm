#!/usr/bin/python3

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, List, Optional, Sequence, Tuple

import numpy as np
import rclpy
from rclpy.node import Node

from dualarm_interfaces.msg import SceneObject, SceneObjectArray, Subframe
from geometry_msgs.msg import PoseStamped, Vector3
from sensor_msgs.msg import CameraInfo, Image


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
        self.declare_parameter("depth_topic", "/camera/depth/image_raw")
        self.declare_parameter("camera_info_topic", "/camera/depth/camera_info")
        self.declare_parameter("basketball_roi", [220, 120, 120, 120])
        self.declare_parameter("soccer_ball_roi", [380, 120, 120, 120])
        self.declare_parameter("basket_roi", [280, 240, 160, 120])
        self.declare_parameter("basketball_diameter", 0.12)
        self.declare_parameter("soccer_ball_diameter", 0.12)
        self.declare_parameter("basket_size", [0.32, 0.22, 0.18])

        self._output_topic = self.get_parameter("output_topic").value
        self._world_frame = self.get_parameter("world_frame").value

        self._camera_info: Optional[CameraInfo] = None
        self._depth_image: Optional[Image] = None

        self._publisher = self.create_publisher(SceneObjectArray, self._output_topic, 10)
        self.create_subscription(CameraInfo, self.get_parameter("camera_info_topic").value, self._camera_cb, 10)
        self.create_subscription(Image, self.get_parameter("depth_topic").value, self._depth_cb, 10)
        self.create_timer(0.2, self._publish_estimates)

        self.get_logger().info(f"ball_basket_pose_estimator 已启动，输出: {self._output_topic}")

    def _camera_cb(self, message: CameraInfo) -> None:
        self._camera_info = message

    def _depth_cb(self, message: Image) -> None:
        self._depth_image = message

    def _publish_estimates(self) -> None:
        if self._camera_info is None or self._depth_image is None:
            return

        roi_specs = [
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

        scene = SceneObjectArray()
        scene.header = self._depth_image.header

        for index, spec in enumerate(roi_specs):
            position = self._estimate_roi_center(spec.roi)
            if position is None:
                continue
            scene.objects.append(self._build_object(index, spec, position))

        self._publisher.publish(scene)

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

        x_world = (u - cx) * z / fx
        y_world = (v - cy) * z / fy
        return x_world, y_world, z

    def _build_object(self, index: int, spec: RoiSpec, position: Tuple[float, float, float]) -> SceneObject:
        object_msg = SceneObject()
        object_msg.id = f"{spec.semantic_type}_{index}"
        object_msg.semantic_type = spec.semantic_type
        object_msg.pose = PoseStamped()
        object_msg.pose.header.frame_id = self._world_frame or self._depth_image.header.frame_id
        object_msg.pose.header.stamp = self._depth_image.header.stamp
        object_msg.pose.pose.position.x = position[0]
        object_msg.pose.pose.position.y = position[1]
        object_msg.pose.pose.position.z = position[2]
        object_msg.pose.pose.orientation.w = 1.0

        object_msg.size = Vector3(x=spec.size[0], y=spec.size[1], z=spec.size[2])
        object_msg.confidence = spec.confidence
        object_msg.graspable = spec.semantic_type != "basket"
        object_msg.movable = spec.semantic_type != "basket"
        object_msg.source = "ball_basket_pose_estimator"

        if spec.semantic_type == "basket":
            object_msg.subframes.extend(
                self._build_subframes(
                    object_msg.pose,
                    [
                        ("basket_center", 0.0),
                        ("basket_release_center", spec.size[2] / 2.0),
                    ],
                )
            )
        else:
            object_msg.subframes.extend(
                self._build_subframes(
                    object_msg.pose,
                    [
                        ("ball_center", 0.0),
                    ],
                )
            )

        return object_msg

    def _build_subframes(
        self, base_pose: PoseStamped, offsets: Iterable[Tuple[str, float]]
    ) -> List[Subframe]:
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
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    main()
