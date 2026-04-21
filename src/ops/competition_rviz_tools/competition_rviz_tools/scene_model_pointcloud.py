from __future__ import annotations

import math
from typing import Iterable

import numpy as np
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import PointCloud2, PointField

from dualarm_interfaces.msg import SceneObjectArray


class SceneModelPointCloud(Node):
    """把 managed scene 中的对象采样为几何点云，供 RViz 完整展示。"""

    def __init__(self) -> None:
        super().__init__("scene_model_pointcloud")
        self.declare_parameter("scene_topic", "/scene_fusion/scene_objects")
        self.declare_parameter("pointcloud_topic", "/competition/rviz/scene_model_points")
        self.declare_parameter("frame_id", "world")
        self.declare_parameter("samples_per_axis", 10)
        self._frame_id = str(self.get_parameter("frame_id").value)
        self._samples = max(6, int(self.get_parameter("samples_per_axis").value))
        self._publisher = self.create_publisher(
            PointCloud2, str(self.get_parameter("pointcloud_topic").value), 10
        )
        self.create_subscription(
            SceneObjectArray,
            str(self.get_parameter("scene_topic").value),
            self._handle_scene,
            10,
        )

    def _handle_scene(self, message: SceneObjectArray) -> None:
        points: list[np.ndarray] = []
        frame_id = message.header.frame_id or self._frame_id
        table_z = self._table_surface_z(message)
        for scene_object in message.objects:
            points.extend(self._sample_scene_object(scene_object, table_z))
        cloud = self._make_cloud(points, message.header.stamp, frame_id)
        self._publisher.publish(cloud)

    def _sample_scene_object(self, scene_object, table_z: float | None) -> Iterable[np.ndarray]:
        semantic = scene_object.semantic_type
        center = np.array(
            [
                float(scene_object.pose.pose.position.x),
                float(scene_object.pose.pose.position.y),
                float(scene_object.pose.pose.position.z),
            ],
            dtype=np.float32,
        )
        size_x = max(float(scene_object.size.x), 0.01)
        size_y = max(float(scene_object.size.y), 0.01)
        size_z = max(float(scene_object.size.z), 0.01)

        if semantic == "table_surface":
            return self._sample_table_surface(center, size_x, size_y)
        if semantic == "basket":
            center = self._table_supported_center(center, size_z, table_z)
            return self._sample_box_top(center, size_x, size_y, size_z)
        if semantic in ("basketball", "soccer_ball"):
            if table_z is not None and center[2] < table_z + size_z:
                center = self._table_supported_center(center, size_z, table_z)
            return self._sample_sphere(center, max(size_x, size_y, size_z) * 0.5)
        if semantic in ("water_bottle", "cola_bottle", "cup"):
            center = self._table_supported_center(center, size_z, table_z)
            return self._sample_cylinder(center, max(size_x, size_y) * 0.5, size_z)
        return self._sample_box_top(center, size_x, size_y, size_z)

    def _table_supported_center(self, center: np.ndarray, height: float, table_z: float | None) -> np.ndarray:
        if table_z is None:
            return center
        adjusted = np.array(center, dtype=np.float32)
        adjusted[2] = float(table_z + height * 0.5)
        return adjusted

    def _table_surface_z(self, scene: SceneObjectArray) -> float | None:
        for scene_object in scene.objects:
            if scene_object.semantic_type == "table_surface":
                return float(scene_object.pose.pose.position.z)
        return None

    def _sample_table_surface(self, center: np.ndarray, sx: float, sy: float) -> Iterable[np.ndarray]:
        nx = self._samples
        ny = self._samples
        xs = np.linspace(center[0] - sx * 0.5, center[0] + sx * 0.5, nx, dtype=np.float32)
        ys = np.linspace(center[1] - sy * 0.5, center[1] + sy * 0.5, ny, dtype=np.float32)
        return [np.array([x, y, center[2]], dtype=np.float32) for x in xs for y in ys]

    def _sample_box_top(self, center: np.ndarray, sx: float, sy: float, sz: float) -> Iterable[np.ndarray]:
        nx = self._samples
        ny = self._samples
        top_z = center[2] + sz * 0.5
        xs = np.linspace(center[0] - sx * 0.5, center[0] + sx * 0.5, nx, dtype=np.float32)
        ys = np.linspace(center[1] - sy * 0.5, center[1] + sy * 0.5, ny, dtype=np.float32)
        return [np.array([x, y, top_z], dtype=np.float32) for x in xs for y in ys]

    def _sample_cylinder(self, center: np.ndarray, radius: float, height: float) -> Iterable[np.ndarray]:
        samples: list[np.ndarray] = []
        z_values = np.linspace(center[2] - height * 0.5, center[2] + height * 0.5, self._samples, dtype=np.float32)
        theta_values = np.linspace(0.0, 2.0 * math.pi, self._samples * 3, endpoint=False, dtype=np.float32)
        for z in z_values:
            for theta in theta_values:
                samples.append(
                    np.array(
                        [center[0] + radius * math.cos(theta), center[1] + radius * math.sin(theta), z],
                        dtype=np.float32,
                    )
                )
        return samples

    def _sample_sphere(self, center: np.ndarray, radius: float) -> Iterable[np.ndarray]:
        samples: list[np.ndarray] = []
        theta_values = np.linspace(0.0, 2.0 * math.pi, self._samples * 3, endpoint=False, dtype=np.float32)
        phi_values = np.linspace(0.15, math.pi - 0.15, self._samples * 2, dtype=np.float32)
        for phi in phi_values:
            sin_phi = math.sin(phi)
            cos_phi = math.cos(phi)
            for theta in theta_values:
                samples.append(
                    np.array(
                        [
                            center[0] + radius * sin_phi * math.cos(theta),
                            center[1] + radius * sin_phi * math.sin(theta),
                            center[2] + radius * cos_phi,
                        ],
                        dtype=np.float32,
                    )
                )
        return samples

    def _make_cloud(self, points: list[np.ndarray], stamp, frame_id: str) -> PointCloud2:
        cloud = PointCloud2()
        cloud.header.stamp = stamp
        cloud.header.frame_id = frame_id
        cloud.height = 1
        cloud.width = len(points)
        cloud.is_dense = False
        cloud.is_bigendian = False
        cloud.point_step = 12
        cloud.row_step = cloud.point_step * cloud.width
        cloud.fields = [
            PointField(name="x", offset=0, datatype=PointField.FLOAT32, count=1),
            PointField(name="y", offset=4, datatype=PointField.FLOAT32, count=1),
            PointField(name="z", offset=8, datatype=PointField.FLOAT32, count=1),
        ]
        if points:
            cloud.data = np.asarray(points, dtype=np.float32).reshape(-1, 3).tobytes()
        else:
            cloud.data = b""
        return cloud


def main(args: list[str] | None = None) -> None:
    rclpy.init(args=args)
    node = SceneModelPointCloud()
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
