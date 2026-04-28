#!/usr/bin/python3

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, Iterable, List, Optional, Sequence, Tuple

import numpy as np
import rclpy
import tf2_ros
from geometry_msgs.msg import PoseStamped, Vector3
from rclpy.node import Node
from rclpy.time import Time
from sensor_msgs.msg import CameraInfo, Image

from dualarm_interfaces.msg import Detection2DArray, SceneObject, SceneObjectArray, Subframe


@dataclass
class RoiSpec:
    semantic_type: str
    roi: Tuple[int, int, int, int]
    size: Tuple[float, float, float]
    confidence: float


@dataclass
class EstimateSample:
    stamp: Time
    position: Tuple[float, float, float]
    confidence: float
    size: Tuple[float, float, float]


@dataclass
class StableTrack:
    semantic_type: str
    samples: List[EstimateSample] = field(default_factory=list)
    last_update: Optional[Time] = None


class BallBasketPoseEstimatorNode(Node):
    def __init__(self) -> None:
        super().__init__("ball_basket_pose_estimator")

        self.declare_parameter("world_frame", "world")
        self.declare_parameter("output_topic", "/perception/ball_basket_scene_objects")
        self.declare_parameter("detections_topic", "/perception/detection_2d")
        self.declare_parameter("depth_topic", "/camera/depth/image_raw")
        self.declare_parameter("camera_info_topic", "/camera/depth/camera_info")
        self.declare_parameter("source_name", "ball_basket_pose_estimator")
        self.declare_parameter("require_depth_aligned_detections", True)
        self.declare_parameter("expected_detection_frame", "")
        self.declare_parameter("require_camera_info_depth_frame", True)
        self.declare_parameter("use_roi_fallback", False)
        self.declare_parameter("basketball_roi", [220, 120, 120, 120])
        self.declare_parameter("soccer_ball_roi", [380, 120, 120, 120])
        self.declare_parameter("basket_roi", [280, 240, 160, 120])
        self.declare_parameter("basketball_diameter", 0.12)
        self.declare_parameter("soccer_ball_diameter", 0.12)
        self.declare_parameter("basket_size", [0.32, 0.22, 0.18])
        self.declare_parameter("max_depth_age_sec", 0.6)
        self.declare_parameter("max_detection_depth_delay_sec", 0.25)
        self.declare_parameter("max_camera_info_depth_delay_sec", 0.5)
        self.declare_parameter("track_timeout_sec", 0.8)
        self.declare_parameter("stable_frames_ball", 3)
        self.declare_parameter("stable_frames_basket", 3)
        self.declare_parameter("ball_position_gate", 0.04)
        self.declare_parameter("basket_position_gate", 0.06)

        self._output_topic = self.get_parameter("output_topic").value
        self._world_frame = self.get_parameter("world_frame").value
        self._source_name = str(self.get_parameter("source_name").value)
        self._use_roi_fallback = bool(self.get_parameter("use_roi_fallback").value)
        self._require_depth_aligned_detections = bool(self.get_parameter("require_depth_aligned_detections").value)
        self._expected_detection_frame = str(self.get_parameter("expected_detection_frame").value)
        self._require_camera_info_depth_frame = bool(self.get_parameter("require_camera_info_depth_frame").value)
        self._max_depth_age_sec = float(self.get_parameter("max_depth_age_sec").value)
        self._max_detection_depth_delay_sec = float(
            self.get_parameter("max_detection_depth_delay_sec").value
        )
        self._max_camera_info_depth_delay_sec = float(
            self.get_parameter("max_camera_info_depth_delay_sec").value
        )
        self._track_timeout_sec = float(self.get_parameter("track_timeout_sec").value)
        self._stable_frames_ball = max(1, int(self.get_parameter("stable_frames_ball").value))
        self._stable_frames_basket = max(1, int(self.get_parameter("stable_frames_basket").value))
        self._ball_position_gate = float(self.get_parameter("ball_position_gate").value)
        self._basket_position_gate = float(self.get_parameter("basket_position_gate").value)

        self._camera_info: Optional[CameraInfo] = None
        self._depth_image: Optional[Image] = None
        self._detections: Optional[Detection2DArray] = None
        self._tracks: Dict[str, StableTrack] = {}
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
        if not self._inputs_are_fresh():
            return

        scene = SceneObjectArray()
        scene.header.frame_id = self._world_frame
        scene.header.stamp = self._depth_image.header.stamp
        scene.scene_version = 0

        fresh_detections = self._collect_detection_samples()
        for semantic_type, sample in fresh_detections:
            self._update_track(semantic_type, sample)

        now = self.get_clock().now()
        self._prune_tracks(now)

        emitted = 0
        for index, semantic_type in enumerate(("basketball", "soccer_ball", "basket")):
            track = self._tracks.get(semantic_type)
            stable_sample = self._stable_track_sample(track)
            if stable_sample is None:
                continue
            scene.objects.append(
                self._build_object(
                    index,
                    semantic_type,
                    stable_sample.position,
                    self._default_roi_spec(semantic_type),
                    stable_sample.confidence,
                )
            )
            emitted += 1

        if emitted == 0 and self._use_roi_fallback:
            for index, spec in enumerate(self._roi_specs()):
                position = self._estimate_roi_center(spec.roi)
                if position is None:
                    continue
                world_position = self._transform_to_world(position)
                if world_position is None:
                    continue
                scene.objects.append(self._build_object(index, spec.semantic_type, world_position, spec, spec.confidence))

        self._publisher.publish(scene)

    def _inputs_are_fresh(self) -> bool:
        assert self._camera_info is not None
        assert self._depth_image is not None

        now = self.get_clock().now()
        depth_stamp = self._stamp_from_header(self._depth_image.header.stamp)
        if self._age_sec(now, depth_stamp) > self._max_depth_age_sec:
            self.get_logger().warn("深度图已过期，跳过球筐估计", throttle_duration_sec=2.0)
            return False

        camera_info_stamp = self._stamp_from_header(self._camera_info.header.stamp)
        if self._delta_sec(camera_info_stamp, depth_stamp) > self._max_camera_info_depth_delay_sec:
            self.get_logger().warn("camera_info 与 depth 时间戳不一致，跳过球筐估计", throttle_duration_sec=2.0)
            return False
        if self._require_camera_info_depth_frame and self._camera_info.header.frame_id != self._depth_image.header.frame_id:
            self.get_logger().warn("camera_info frame 与 depth frame 不一致，跳过球筐估计", throttle_duration_sec=2.0)
            return False
        return True

    def _collect_detection_samples(self) -> List[Tuple[str, EstimateSample]]:
        if self._detections is None or not self._detections.detections:
            return []

        detections_stamp = self._stamp_from_header(self._detections.header.stamp)
        depth_stamp = self._stamp_from_header(self._depth_image.header.stamp)
        if self._delta_sec(detections_stamp, depth_stamp) > self._max_detection_depth_delay_sec:
            self.get_logger().warn("detections 与 depth 时间戳不一致，丢弃本轮球筐估计", throttle_duration_sec=2.0)
            return []
        detection_frame = self._detections.header.frame_id
        expected_detection_frame = self._expected_detection_frame or self._depth_image.header.frame_id
        if self._require_depth_aligned_detections and detection_frame != expected_detection_frame:
            self.get_logger().warn(
                f"detections frame 与 depth 对齐合同不一致，期望 {expected_detection_frame}，实际 {detection_frame}",
                throttle_duration_sec=2.0,
            )
            return []

        samples: List[Tuple[str, EstimateSample]] = []
        for detection in self._detections.detections:
            if detection.semantic_type not in {"basketball", "soccer_ball", "basket"}:
                continue

            roi = self._detection_to_roi(detection)
            position = self._estimate_roi_center(roi)
            if position is None:
                continue
            world_position = self._transform_to_world(position)
            if world_position is None:
                continue

            spec = self._default_roi_spec(detection.semantic_type)
            samples.append(
                (
                    detection.semantic_type,
                    EstimateSample(
                        stamp=depth_stamp,
                        position=world_position,
                        confidence=max(float(detection.score), spec.confidence),
                        size=spec.size,
                    ),
                )
            )
        return samples

    def _roi_specs(self) -> List[RoiSpec]:
        return [
            self._default_roi_spec("basketball"),
            self._default_roi_spec("soccer_ball"),
            self._default_roi_spec("basket"),
        ]

    def _default_roi_spec(self, semantic_type: str) -> RoiSpec:
        if semantic_type == "basketball":
            return RoiSpec(
                "basketball",
                tuple(int(v) for v in self.get_parameter("basketball_roi").value),
                (float(self.get_parameter("basketball_diameter").value),) * 3,
                0.55,
            )
        if semantic_type == "basket":
            return RoiSpec(
                "basket",
                tuple(int(v) for v in self.get_parameter("basket_roi").value),
                tuple(float(v) for v in self.get_parameter("basket_size").value),
                0.5,
            )
        return RoiSpec(
            "soccer_ball",
            tuple(int(v) for v in self.get_parameter("soccer_ball_roi").value),
            (float(self.get_parameter("soccer_ball_diameter").value),) * 3,
            0.55,
        )

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
        confidence: Optional[float] = None,
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

        used_prior_fallback = roi_spec is None
        if roi_spec is None:
            roi_spec = self._default_roi_spec(semantic_type)

        object_msg.size = Vector3(x=roi_spec.size[0], y=roi_spec.size[1], z=roi_spec.size[2])
        object_msg.confidence = float(confidence if confidence is not None else roi_spec.confidence)
        object_msg.graspable = semantic_type != "basket"
        object_msg.movable = semantic_type != "basket"
        object_msg.source = self._source_name
        object_msg.source_views = [self._source_name]
        object_msg.shape_type = "sphere" if semantic_type in {"basketball", "soccer_ball"} else "box"
        object_msg.pose_source = "depth_roi_prior_fallback" if used_prior_fallback else "depth_roi_primitive_fit"
        object_msg.quality_score = float(max(0.0, min(1.0, object_msg.confidence)))
        object_msg.last_seen = self._depth_image.header.stamp
        object_msg.scene_version = 0
        object_msg.lifecycle_state = "observed"
        object_msg.reserved_by = "none"
        object_msg.attached_link = ""
        position_variance = 0.0025 if used_prior_fallback else 0.0004
        orientation_variance = 3.14 if object_msg.shape_type == "sphere" else 0.35
        object_msg.pose_covariance_diagonal = [
            position_variance,
            position_variance,
            position_variance,
            orientation_variance,
            orientation_variance,
            orientation_variance,
        ]

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

    def _update_track(self, semantic_type: str, sample: EstimateSample) -> None:
        track = self._tracks.setdefault(semantic_type, StableTrack(semantic_type=semantic_type))
        track.samples.append(sample)
        track.last_update = sample.stamp
        max_samples = max(self._required_stable_frames(semantic_type) * 2, 6)
        if len(track.samples) > max_samples:
            track.samples = track.samples[-max_samples:]

    def _prune_tracks(self, now: Time) -> None:
        expired = []
        for semantic_type, track in self._tracks.items():
            if track.last_update is None:
                expired.append(semantic_type)
                continue
            if self._age_sec(now, track.last_update) > self._track_timeout_sec:
                expired.append(semantic_type)
        for semantic_type in expired:
            self._tracks.pop(semantic_type, None)

    def _stable_track_sample(self, track: Optional[StableTrack]) -> Optional[EstimateSample]:
        if track is None or not track.samples:
            return None

        required_frames = self._required_stable_frames(track.semantic_type)
        if len(track.samples) < required_frames:
            return None

        window = track.samples[-required_frames:]
        positions = np.array([sample.position for sample in window], dtype=np.float32)
        anchor = tuple(float(value) for value in np.median(positions, axis=0))
        gate = self._position_gate(track.semantic_type)

        for sample in window:
            if self._distance(anchor, sample.position) > gate:
                return None

        confidences = [sample.confidence for sample in window]
        sizes = np.array([sample.size for sample in window], dtype=np.float32)
        return EstimateSample(
            stamp=window[-1].stamp,
            position=tuple(float(value) for value in np.mean(positions, axis=0)),
            confidence=float(min(confidences)),
            size=tuple(float(value) for value in np.mean(sizes, axis=0)),
        )

    def _required_stable_frames(self, semantic_type: str) -> int:
        if semantic_type == "basket":
            return self._stable_frames_basket
        return self._stable_frames_ball

    def _position_gate(self, semantic_type: str) -> float:
        if semantic_type == "basket":
            return self._basket_position_gate
        return self._ball_position_gate

    def _stamp_from_header(self, stamp) -> Time:
        return Time.from_msg(stamp)

    def _delta_sec(self, left: Time, right: Time) -> float:
        return abs((left - right).nanoseconds) / 1e9

    def _age_sec(self, now: Time, then: Time) -> float:
        return max(0.0, (now - then).nanoseconds / 1e9)

    def _distance(
        self,
        left: Tuple[float, float, float],
        right: Tuple[float, float, float],
    ) -> float:
        dx = left[0] - right[0]
        dy = left[1] - right[1]
        dz = left[2] - right[2]
        return float(np.sqrt(dx * dx + dy * dy + dz * dz))

    def _build_subframes(self, base_pose: PoseStamped, offsets: Iterable[Tuple[str, float]]) -> List[Subframe]:
        result: List[Subframe] = []
        for name, z_offset in offsets:
            subframe = Subframe()
            subframe.name = name
            subframe.pose = PoseStamped()
            subframe.pose.header = base_pose.header
            subframe.pose.pose.position.x = base_pose.pose.position.x
            subframe.pose.pose.position.y = base_pose.pose.position.y
            subframe.pose.pose.position.z = base_pose.pose.position.z
            subframe.pose.pose.orientation.x = base_pose.pose.orientation.x
            subframe.pose.pose.orientation.y = base_pose.pose.orientation.y
            subframe.pose.pose.orientation.z = base_pose.pose.orientation.z
            subframe.pose.pose.orientation.w = base_pose.pose.orientation.w
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
