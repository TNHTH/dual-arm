#!/usr/bin/python3

from __future__ import annotations

import json
import math
import time
from pathlib import Path
from typing import Optional

import cv2
import numpy as np
import rclpy
from cv_bridge import CvBridge
from geometry_msgs.msg import PoseStamped
from rclpy.duration import Duration
from rclpy.node import Node
from rclpy.time import Time
from sensor_msgs.msg import CameraInfo, Image
from tf2_geometry_msgs import do_transform_pose
from tf2_ros import Buffer, TransformException, TransformListener

from dualarm_interfaces.msg import Detection2DArray, SceneObject, SceneObjectArray, Subframe


def _quaternion_from_z_axis(normal: np.ndarray) -> tuple[float, float, float, float]:
    source = np.array([0.0, 0.0, 1.0], dtype=np.float64)
    target = normal.astype(np.float64)
    target_norm = np.linalg.norm(target)
    if target_norm < 1e-9:
        return 0.0, 0.0, 0.0, 1.0
    target = target / target_norm
    dot = float(np.clip(np.dot(source, target), -1.0, 1.0))
    if dot > 0.999999:
        return 0.0, 0.0, 0.0, 1.0
    if dot < -0.999999:
        return 1.0, 0.0, 0.0, 0.0
    axis = np.cross(source, target)
    axis = axis / np.linalg.norm(axis)
    angle = math.acos(dot)
    sin_half = math.sin(angle / 2.0)
    return (
        float(axis[0] * sin_half),
        float(axis[1] * sin_half),
        float(axis[2] * sin_half),
        float(math.cos(angle / 2.0)),
    )


def _rotate_vector_by_quaternion(vector: np.ndarray, quaternion: tuple[float, float, float, float]) -> np.ndarray:
    qx, qy, qz, qw = quaternion
    xx = qx * qx
    yy = qy * qy
    zz = qz * qz
    xy = qx * qy
    xz = qx * qz
    yz = qy * qz
    wx = qw * qx
    wy = qw * qy
    wz = qw * qz
    matrix = np.array(
        [
            [1.0 - 2.0 * (yy + zz), 2.0 * (xy - wz), 2.0 * (xz + wy)],
            [2.0 * (xy + wz), 1.0 - 2.0 * (xx + zz), 2.0 * (yz - wx)],
            [2.0 * (xz - wy), 2.0 * (yz + wx), 1.0 - 2.0 * (xx + yy)],
        ],
        dtype=np.float64,
    )
    return matrix @ vector.astype(np.float64)


class TableSurfaceDetector(Node):
    def __init__(self) -> None:
        super().__init__("table_surface_detector")
        self.declare_parameter("color_topic", "/camera/color/image_raw")
        self.declare_parameter("depth_topic", "/camera/depth/image_raw")
        self.declare_parameter("camera_info_topic", "/camera/depth/camera_info")
        self.declare_parameter("scene_topic", "/perception/table_scene_objects")
        self.declare_parameter("depth_confirmed_overlay_topic", "/perception/table_surface/depth_confirmed_overlay")
        self.declare_parameter("color_guided_overlay_topic", "/perception/table_surface/color_guided_overlay")
        self.declare_parameter("mask_topic", "/perception/table_surface/mask")
        self.declare_parameter("detections_topic", "/perception/detection_2d")
        self.declare_parameter("rgb_overlay_topic", "/perception/pick_assist/rgb_overlay")
        self.declare_parameter("target_frame", "world")
        self.declare_parameter("require_world_tf", True)
        self.declare_parameter("timer_hz", 2.0)
        self.declare_parameter("min_depth_mm", 60.0)
        self.declare_parameter("max_depth_mm", 3000.0)
        self.declare_parameter("plane_threshold_mm", 22.0)
        self.declare_parameter("color_distance_threshold", 34.0)
        self.declare_parameter("min_inlier_ratio", 0.45)
        self.declare_parameter("min_inliers", 500)
        self.declare_parameter("publish_empty_scene_on_failure", True)
        self.declare_parameter("save_debug_artifacts", True)
        self.declare_parameter("debug_dir", ".artifacts/camera_debug/table_surface_detector")

        self._bridge = CvBridge()
        self._color: Optional[Image] = None
        self._depth: Optional[Image] = None
        self._camera_info: Optional[CameraInfo] = None
        self._detections: Optional[Detection2DArray] = None
        self._scene_version = 0
        self._tf_buffer = Buffer()
        self._tf_listener = TransformListener(self._tf_buffer, self)

        self._color_sub = self.create_subscription(Image, str(self.get_parameter("color_topic").value), self._color_cb, 10)
        self._depth_sub = self.create_subscription(Image, str(self.get_parameter("depth_topic").value), self._depth_cb, 10)
        self._info_sub = self.create_subscription(
            CameraInfo, str(self.get_parameter("camera_info_topic").value), self._info_cb, 10
        )
        self._detections_sub = self.create_subscription(
            Detection2DArray, str(self.get_parameter("detections_topic").value), self._detections_cb, 10
        )
        self._scene_pub = self.create_publisher(SceneObjectArray, str(self.get_parameter("scene_topic").value), 10)
        self._depth_overlay_pub = self.create_publisher(
            Image, str(self.get_parameter("depth_confirmed_overlay_topic").value), 10
        )
        self._color_overlay_pub = self.create_publisher(
            Image, str(self.get_parameter("color_guided_overlay_topic").value), 10
        )
        self._rgb_overlay_pub = self.create_publisher(Image, str(self.get_parameter("rgb_overlay_topic").value), 10)
        self._mask_pub = self.create_publisher(Image, str(self.get_parameter("mask_topic").value), 10)

        hz = max(float(self.get_parameter("timer_hz").value), 0.2)
        self.create_timer(1.0 / hz, self._tick)
        self.get_logger().info(
            "table_surface_detector 已启动：以彩色木桌区域为主，深度平面为约束，输出桌面候选与可视化。"
        )

    def _color_cb(self, message: Image) -> None:
        self._color = message

    def _depth_cb(self, message: Image) -> None:
        self._depth = message

    def _info_cb(self, message: CameraInfo) -> None:
        self._camera_info = message

    def _detections_cb(self, message: Detection2DArray) -> None:
        self._detections = message

    def _tick(self) -> None:
        if self._color is None or self._depth is None or self._camera_info is None:
            return
        try:
            result = self._detect_table()
        except Exception as exc:  # pylint: disable=broad-except
            self.get_logger().warn(f"桌面识别失败: {exc}", throttle_duration_sec=2.0)
            self._publish_empty_scene(self._depth.header.stamp, str(self.get_parameter("target_frame").value))
            return
        if result is None:
            self._publish_empty_scene(self._depth.header.stamp, str(self.get_parameter("target_frame").value))
            return
        self._publish_result(result)

    def _detect_table(self) -> Optional[dict]:
        color = self._bridge.imgmsg_to_cv2(self._color, desired_encoding="bgr8")
        depth = self._bridge.imgmsg_to_cv2(self._depth, desired_encoding="passthrough")
        if depth.ndim == 3:
            depth = depth[:, :, 0]
        depth = depth.astype(np.float32)

        height, width = depth.shape[:2]
        if color.shape[:2] != (height, width):
            color = cv2.resize(color, (width, height), interpolation=cv2.INTER_LINEAR)

        min_depth = float(self.get_parameter("min_depth_mm").value)
        max_depth = float(self.get_parameter("max_depth_mm").value)
        valid = np.isfinite(depth) & (depth > min_depth) & (depth < max_depth)
        wood_mask = self._segment_visual_table(color, valid)
        candidate_mask = valid & wood_mask
        xs, ys, points = self._backproject(depth, self._camera_info, candidate_mask)
        if len(points) < 300:
            return None

        plane = self._fit_plane(points, float(self.get_parameter("plane_threshold_mm").value))
        if plane is None:
            return None
        normal, d, inliers, distances = plane
        all_mask = self._depth_plane_mask(depth, self._camera_info, valid, normal, d)
        depth_confirmed = all_mask & wood_mask
        visual_table = wood_mask.copy()
        visual_table[: int(height * 0.28), :] = False

        inlier_count = int(np.count_nonzero(inliers))
        inlier_ratio = float(inlier_count / max(len(points), 1))
        depth_confirmed_ratio = float(np.count_nonzero(depth_confirmed) / max(np.count_nonzero(wood_mask), 1))
        confidence = float(min(1.0, 0.55 * inlier_ratio + 0.45 * min(1.0, depth_confirmed_ratio / 0.55)))

        center_m, size_m = self._table_geometry(depth, self._camera_info, depth_confirmed, normal, d)
        color_guided_overlay = self._overlay_mask(color, visual_table, (0, 255, 0), 0.36)
        depth_overlay = self._overlay_mask(color, depth_confirmed, (255, 0, 0), 0.45)
        rgb_overlay = self._draw_detections(color_guided_overlay.copy())
        mask_image = (visual_table.astype(np.uint8) * 255)

        return {
            "stamp": self._depth.header.stamp,
            "frame_id": self._depth.header.frame_id or self._camera_info.header.frame_id,
            "color": color,
            "depth": depth,
            "color_guided_overlay": color_guided_overlay,
            "depth_confirmed_overlay": depth_overlay,
            "rgb_overlay": rgb_overlay,
            "mask_image": mask_image,
            "normal": normal,
            "plane_d_mm": float(d),
            "center_m": center_m,
            "size_m": size_m,
            "inlier_ratio": inlier_ratio,
            "inlier_count": inlier_count,
            "candidate_count": int(len(points)),
            "median_residual_mm": float(np.median(distances[inliers])) if inlier_count else None,
            "depth_confirmed_ratio": depth_confirmed_ratio,
            "confidence": confidence,
            "valid": bool(
                inlier_ratio >= float(self.get_parameter("min_inlier_ratio").value)
                and inlier_count >= int(self.get_parameter("min_inliers").value)
            ),
        }

    def _segment_visual_table(self, color: np.ndarray, valid: np.ndarray) -> np.ndarray:
        height, width = color.shape[:2]
        seed_roi = color[int(height * 0.62) : int(height * 0.92), int(width * 0.25) : int(width * 0.78)]
        lab = cv2.cvtColor(color, cv2.COLOR_BGR2LAB).astype(np.float32)
        seed_lab = cv2.cvtColor(seed_roi, cv2.COLOR_BGR2LAB).reshape(-1, 3).astype(np.float32)
        seed_median = np.median(seed_lab, axis=0)
        distance = np.linalg.norm(lab - seed_median, axis=2)
        threshold = float(self.get_parameter("color_distance_threshold").value)
        lower_prior = np.zeros((height, width), dtype=bool)
        lower_prior[int(height * 0.22) :, int(width * 0.02) : int(width * 0.98)] = True
        wood_prior = (distance < threshold) & lower_prior
        component = self._largest_foreground_component(wood_prior, height)
        kernel_close = np.ones((17, 17), np.uint8)
        kernel_open = np.ones((7, 7), np.uint8)
        component = cv2.morphologyEx(component.astype(np.uint8) * 255, cv2.MORPH_CLOSE, kernel_close) > 0
        component = cv2.morphologyEx(component.astype(np.uint8) * 255, cv2.MORPH_OPEN, kernel_open) > 0
        # Depth holes are expected on the foreground table, so do not intersect the final visual mask with valid depth.
        _ = valid
        return component

    def _largest_foreground_component(self, mask: np.ndarray, height: int) -> np.ndarray:
        count, labels, stats, _ = cv2.connectedComponentsWithStats(mask.astype(np.uint8), 8)
        if count <= 1:
            return mask
        best_label = 1
        best_score = -1
        for label in range(1, count):
            area = int(stats[label, cv2.CC_STAT_AREA])
            top = int(stats[label, cv2.CC_STAT_TOP])
            comp_height = int(stats[label, cv2.CC_STAT_HEIGHT])
            bottom = top + comp_height
            score = area + (50000 if bottom > int(height * 0.80) else 0)
            if score > best_score:
                best_score = score
                best_label = label
        return labels == best_label

    def _backproject(self, depth: np.ndarray, info: CameraInfo, mask: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
        ys, xs = np.where(mask)
        if len(xs) > 20000:
            selected = np.random.default_rng(5).choice(len(xs), size=20000, replace=False)
            xs = xs[selected]
            ys = ys[selected]
        fx = float(info.k[0]) or 1.0
        fy = float(info.k[4]) or 1.0
        cx = float(info.k[2])
        cy = float(info.k[5])
        z = depth[ys, xs]
        x = (xs.astype(np.float32) - cx) * z / fx
        y = (ys.astype(np.float32) - cy) * z / fy
        return xs, ys, np.stack([x, y, z], axis=1)

    def _fit_plane(self, points: np.ndarray, threshold_mm: float) -> Optional[tuple[np.ndarray, float, np.ndarray, np.ndarray]]:
        if len(points) < 300:
            return None
        rng = np.random.default_rng(11)
        best: Optional[tuple[np.ndarray, float, np.ndarray, np.ndarray]] = None
        best_count = -1
        for _ in range(900):
            sample = points[rng.choice(len(points), size=3, replace=False)]
            normal = np.cross(sample[1] - sample[0], sample[2] - sample[0])
            norm = np.linalg.norm(normal)
            if norm < 1e-6:
                continue
            normal = normal / norm
            d = -float(np.dot(normal, sample[0]))
            distances = np.abs(points @ normal + d)
            inliers = distances < threshold_mm
            count = int(np.count_nonzero(inliers))
            if count > best_count:
                best_count = count
                best = (normal, d, inliers, distances)
        return best

    def _depth_plane_mask(
        self, depth: np.ndarray, info: CameraInfo, valid: np.ndarray, normal: np.ndarray, d: float
    ) -> np.ndarray:
        ys, xs = np.where(valid)
        if len(xs) == 0:
            return np.zeros_like(valid, dtype=bool)
        fx = float(info.k[0]) or 1.0
        fy = float(info.k[4]) or 1.0
        cx = float(info.k[2])
        cy = float(info.k[5])
        z = depth[ys, xs]
        x = (xs.astype(np.float32) - cx) * z / fx
        y = (ys.astype(np.float32) - cy) * z / fy
        pts = np.stack([x, y, z], axis=1)
        distances = np.abs(pts @ normal + d)
        mask = np.zeros_like(valid, dtype=bool)
        mask[ys, xs] = distances < float(self.get_parameter("plane_threshold_mm").value)
        return mask

    def _table_geometry(
        self, depth: np.ndarray, info: CameraInfo, mask: np.ndarray, normal: np.ndarray, d: float
    ) -> tuple[list[float], list[float]]:
        _, _, points = self._backproject(depth, info, mask)
        if len(points) == 0:
            return [0.0, 0.0, 0.0], [0.0, 0.0, 0.0]
        center_mm = np.median(points, axis=0)
        low = np.percentile(points, 5, axis=0)
        high = np.percentile(points, 95, axis=0)
        size_mm = np.maximum(high - low, 1.0)
        _ = normal, d
        return [float(v / 1000.0) for v in center_mm], [float(v / 1000.0) for v in size_mm]

    def _overlay_mask(self, color: np.ndarray, mask: np.ndarray, bgr: tuple[int, int, int], alpha: float) -> np.ndarray:
        overlay = color.copy()
        tint = np.zeros_like(color)
        tint[:, :] = bgr
        alpha_map = (mask.astype(np.float32) * alpha)[:, :, None]
        return (overlay * (1.0 - alpha_map) + tint * alpha_map).astype(np.uint8)

    def _draw_detections(self, image: np.ndarray) -> np.ndarray:
        if self._detections is None:
            cv2.putText(image, "table surface", (16, 28), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
            return image
        for detection in self._detections.detections:
            x0 = int(max(0, detection.x - detection.width / 2.0))
            y0 = int(max(0, detection.y - detection.height / 2.0))
            x1 = int(min(image.shape[1] - 1, detection.x + detection.width / 2.0))
            y1 = int(min(image.shape[0] - 1, detection.y + detection.height / 2.0))
            color = (0, 220, 255)
            if detection.semantic_type == "water_bottle":
                color = (255, 160, 0)
            elif detection.semantic_type == "cola_bottle":
                color = (0, 0, 255)
            elif "ball" in detection.semantic_type:
                color = (255, 0, 255)
            cv2.rectangle(image, (x0, y0), (x1, y1), color, 2)
            label = f"{detection.semantic_type} {detection.score:.2f}"
            cv2.putText(image, label, (x0, max(18, y0 - 6)), cv2.FONT_HERSHEY_SIMPLEX, 0.48, color, 1, cv2.LINE_AA)
            cv2.circle(image, (int(detection.x), int(detection.y)), 4, color, -1)
        cv2.putText(image, "green=table, boxes=RGB detections", (16, 28), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (0, 255, 0), 2)
        return image

    def _publish_result(self, result: dict) -> None:
        stamp = result["stamp"]
        source_frame = str(result["frame_id"])
        target_frame = str(self.get_parameter("target_frame").value)
        require_world_tf = bool(self.get_parameter("require_world_tf").value)
        self._scene_version += 1

        scene = SceneObjectArray()
        scene.header.stamp = stamp
        scene.header.frame_id = target_frame if target_frame else source_frame
        scene.scene_version = self._scene_version

        if result["valid"]:
            source_pose = PoseStamped()
            source_pose.header.stamp = stamp
            source_pose.header.frame_id = source_frame
            source_pose.pose.position.x = result["center_m"][0]
            source_pose.pose.position.y = result["center_m"][1]
            source_pose.pose.position.z = result["center_m"][2]
            qx, qy, qz, qw = _quaternion_from_z_axis(result["normal"])
            source_pose.pose.orientation.x = qx
            source_pose.pose.orientation.y = qy
            source_pose.pose.orientation.z = qz
            source_pose.pose.orientation.w = qw
            world_pose = self._transform_pose(source_pose, target_frame)
            if world_pose is not None:
                world_normal = _rotate_vector_by_quaternion(
                    np.array([0.0, 0.0, 1.0], dtype=np.float64),
                    (
                        world_pose.pose.orientation.x,
                        world_pose.pose.orientation.y,
                        world_pose.pose.orientation.z,
                        world_pose.pose.orientation.w,
                    ),
                )
                if world_normal[2] < 0.0:
                    qx, qy, qz, qw = _quaternion_from_z_axis(-result["normal"])
                    source_pose.pose.orientation.x = qx
                    source_pose.pose.orientation.y = qy
                    source_pose.pose.orientation.z = qz
                    source_pose.pose.orientation.w = qw
                    world_pose = self._transform_pose(source_pose, target_frame)
            if world_pose is None:
                if require_world_tf:
                    self.get_logger().warn(
                        f"桌面已识别，但缺少 {source_frame}->{target_frame} TF；只发布 RGB overlay，不发布 table_surface。",
                        throttle_duration_sec=2.0,
                    )
                    self._scene_pub.publish(scene)
                    self._publish_visuals(result, stamp, source_frame)
                    self._save_debug_artifacts(result, published_frame=source_frame, world_pose=None)
                    return
                world_pose = source_pose

            table_object = SceneObject()
            table_object.id = "table_surface_0"
            table_object.semantic_type = "table_surface"
            table_object.pose = world_pose
            table_object.size.x = result["size_m"][0]
            table_object.size.y = result["size_m"][1]
            table_object.size.z = 0.01
            table_object.confidence = float(result["confidence"])
            table_object.graspable = False
            table_object.movable = False
            table_object.source = "table_surface_detector"
            table_object.last_seen = stamp
            table_object.scene_version = self._scene_version
            table_object.lifecycle_state = "stable"
            table_object.reserved_by = "none"
            table_object.attached_link = ""
            table_object.pose_covariance_diagonal = [
                float(result["median_residual_mm"] or 999.0) / 1_000_000.0,
                float(result["median_residual_mm"] or 999.0) / 1_000_000.0,
                float(result["median_residual_mm"] or 999.0) / 1_000_000.0,
                -1.0,
                -1.0,
                -1.0,
            ]
            normal_pose = PoseStamped()
            normal_pose.header = table_object.pose.header
            normal_pose.pose = table_object.pose.pose
            table_object.subframes.append(Subframe(name="plane_normal", pose=normal_pose))
            scene.objects.append(table_object)

        self._scene_pub.publish(scene)
        self._publish_visuals(result, stamp, source_frame)
        if bool(self.get_parameter("save_debug_artifacts").value):
            self._save_debug_artifacts(result, published_frame=scene.header.frame_id, world_pose=scene.objects[0].pose if scene.objects else None)

    def _publish_empty_scene(self, stamp, frame_id: str) -> None:
        if not bool(self.get_parameter("publish_empty_scene_on_failure").value):
            return
        self._scene_version += 1
        scene = SceneObjectArray()
        scene.header.stamp = stamp
        scene.header.frame_id = frame_id or str(self.get_parameter("target_frame").value)
        scene.scene_version = self._scene_version
        self._scene_pub.publish(scene)

    def _transform_pose(self, pose: PoseStamped, target_frame: str) -> Optional[PoseStamped]:
        if not target_frame or target_frame == pose.header.frame_id:
            return pose
        try:
            transform = self._tf_buffer.lookup_transform(
                target_frame,
                pose.header.frame_id,
                Time.from_msg(pose.header.stamp),
                timeout=Duration(seconds=0.15),
            )
        except TransformException:
            try:
                transform = self._tf_buffer.lookup_transform(
                    target_frame,
                    pose.header.frame_id,
                    Time(),
                    timeout=Duration(seconds=0.15),
                )
            except TransformException as exc:
                self.get_logger().warn(f"桌面 pose TF 转换失败: {exc}", throttle_duration_sec=2.0)
                return None
        result = PoseStamped()
        result.header.stamp = pose.header.stamp
        result.header.frame_id = target_frame
        try:
            result.pose = do_transform_pose(pose.pose, transform)
            return result
        except TransformException as exc:
            self.get_logger().warn(f"桌面 pose TF 转换失败: {exc}", throttle_duration_sec=2.0)
            return None

    def _publish_visuals(self, result: dict, stamp, frame_id: str) -> None:
        self._publish_image(self._depth_overlay_pub, result["depth_confirmed_overlay"], stamp, frame_id, "bgr8")
        self._publish_image(self._color_overlay_pub, result["color_guided_overlay"], stamp, frame_id, "bgr8")
        self._publish_image(self._rgb_overlay_pub, result["rgb_overlay"], stamp, frame_id, "bgr8")
        self._publish_image(self._mask_pub, result["mask_image"], stamp, frame_id, "mono8")

    def _publish_image(self, publisher, image: np.ndarray, stamp, frame_id: str, encoding: str) -> None:
        msg = self._bridge.cv2_to_imgmsg(image, encoding=encoding)
        msg.header.stamp = stamp
        msg.header.frame_id = frame_id
        publisher.publish(msg)

    def _save_debug_artifacts(self, result: dict, published_frame: str, world_pose: Optional[PoseStamped]) -> None:
        debug_dir = Path(str(self.get_parameter("debug_dir").value))
        debug_dir.mkdir(parents=True, exist_ok=True)
        cv2.imwrite(str(debug_dir / "color_latest.png"), result["color"])
        cv2.imwrite(str(debug_dir / "depth_confirmed_overlay.png"), result["depth_confirmed_overlay"])
        cv2.imwrite(str(debug_dir / "color_guided_overlay.png"), result["color_guided_overlay"])
        cv2.imwrite(str(debug_dir / "rgb_overlay.png"), result["rgb_overlay"])
        cv2.imwrite(str(debug_dir / "table_mask.png"), result["mask_image"])
        payload = {
            "can_detect_table_plane": bool(result["valid"]),
            "scene_version": self._scene_version,
            "source_frame_id": result["frame_id"],
            "published_frame_id": published_frame,
            "center_m": result["center_m"],
            "size_m": result["size_m"],
            "confidence": result["confidence"],
            "candidate_count": result["candidate_count"],
            "plane_inliers": result["inlier_count"],
            "plane_inlier_ratio": result["inlier_ratio"],
            "depth_confirmed_area_ratio_vs_color_table": result["depth_confirmed_ratio"],
            "median_residual_mm": result["median_residual_mm"],
            "plane_normal_camera_frame": [float(v) for v in result["normal"]],
            "world_pose": None if world_pose is None else {
                "frame_id": world_pose.header.frame_id,
                "position": {
                    "x": world_pose.pose.position.x,
                    "y": world_pose.pose.position.y,
                    "z": world_pose.pose.position.z,
                },
                "orientation": {
                    "x": world_pose.pose.orientation.x,
                    "y": world_pose.pose.orientation.y,
                    "z": world_pose.pose.orientation.z,
                    "w": world_pose.pose.orientation.w,
                },
            },
            "note": "color_guided_overlay 更接近肉眼桌面，depth_confirmed_overlay 是深度真实确认区域。",
        }
        (debug_dir / "latest_result.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> None:
    rclpy.init()
    node = TableSurfaceDetector()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    main()
