#!/usr/bin/python3

from __future__ import annotations

from collections import defaultdict, deque
from copy import deepcopy
from dataclasses import dataclass, field
from typing import Deque, Dict, Iterable, List, Optional, Tuple

import math
import rclpy
import yaml
from geometry_msgs.msg import PoseStamped
from rclpy.node import Node
from rclpy.time import Time

from dualarm_interfaces.msg import Detection2DArray, SceneObject, SceneObjectArray


@dataclass
class Track:
    track_id: str
    semantic_type: str
    observations: Deque[SceneObject] = field(default_factory=deque)
    last_update: Optional[Time] = None
    stable: bool = False
    source_views: set[str] = field(default_factory=set)
    rgb_only_observations: Dict[str, Time] = field(default_factory=dict)


class SceneFusionNode(Node):
    def __init__(self) -> None:
        super().__init__("scene_fusion")
        self.declare_parameter(
            "input_topics",
            [
                "/perception/scene_objects",
                "/perception/ball_basket_scene_objects",
                "/perception/table_scene_objects",
            ],
        )
        self.declare_parameter("rgb_detection_topics", [])
        self.declare_parameter("output_topic", "/scene_fusion/raw_scene_objects")
        self.declare_parameter("stability_count", 5)
        self.declare_parameter("observation_window", 1.5)
        self.declare_parameter("stable_window", 0.3)
        self.declare_parameter("bottle_position_gate", 0.04)
        self.declare_parameter("cup_position_gate", 0.035)
        self.declare_parameter("ball_position_gate", 0.04)
        self.declare_parameter("basket_position_gate", 0.06)
        self.declare_parameter("stale_timeout", 0.4)
        self.declare_parameter("lost_timeout", 1.0)

        self._output_topic = self.get_parameter("output_topic").value
        self._stability_count = int(self.get_parameter("stability_count").value)
        self._observation_window = float(self.get_parameter("observation_window").value)
        self._stable_window = float(self.get_parameter("stable_window").value)
        self._stale_timeout = float(self.get_parameter("stale_timeout").value)
        self._lost_timeout = float(self.get_parameter("lost_timeout").value)
        self._position_gates = {
            "bottle": float(self.get_parameter("bottle_position_gate").value),
            "cup": float(self.get_parameter("cup_position_gate").value),
            "ball": float(self.get_parameter("ball_position_gate").value),
            "basket": float(self.get_parameter("basket_position_gate").value),
        }

        self._scene_version = 0
        self._last_scene_signature = None
        self._track_counter: Dict[str, int] = defaultdict(int)
        self._tracks: Dict[str, Track] = {}
        self._publisher = self.create_publisher(SceneObjectArray, self._output_topic, 10)

        for topic in self._topics_from_parameter("input_topics"):
            self.create_subscription(SceneObjectArray, topic, self._handle_scene, 10)
        for topic in self._topics_from_parameter("rgb_detection_topics"):
            self.create_subscription(Detection2DArray, topic, self._handle_rgb_detections, 10)

        self.create_timer(0.1, self._publish_scene)
        self.get_logger().info(f"scene_fusion 已启动，输出: {self._output_topic}")

    def _handle_scene(self, message: SceneObjectArray) -> None:
        now = self.get_clock().now()
        for scene_object in message.objects:
            matched = self._find_matching_track(scene_object)
            if matched is None:
                matched = self._create_track(scene_object)

            track = self._tracks[matched]
            track.last_update = now
            observation = deepcopy(scene_object)
            observation.id = track.track_id
            if not observation.source:
                observation.source = "unknown"
            if not observation.source_views:
                observation.source_views = [observation.source]
            observation.source_views = sorted({str(view) for view in observation.source_views if str(view)} | {observation.source})
            if not observation.shape_type:
                observation.shape_type = self._shape_type_for(observation.semantic_type)
            if not observation.pose_source:
                observation.pose_source = "scene_object"
            if observation.quality_score <= 0.0:
                observation.quality_score = float(max(0.0, min(1.0, observation.confidence)))
            observation.last_seen = now.to_msg()
            observation.lifecycle_state = "observed"
            observation.reserved_by = "none"
            observation.attached_link = ""
            observation.scene_version = self._scene_version
            if any(value < 0.0 for value in observation.pose_covariance_diagonal):
                observation.pose_covariance_diagonal = self._default_estimated_covariance(observation.semantic_type)
            track.source_views.update(observation.source_views)
            track.observations.append(observation)
            self._trim_track(track, now)
            track.stable = self._is_track_stable(track, now)

    def _handle_rgb_detections(self, message: Detection2DArray) -> None:
        now = self.get_clock().now()
        for detection in message.detections:
            view_id = detection.view_id or detection.source or message.header.frame_id or "rgb_view"
            matched = self._find_matching_track_for_detection(detection.semantic_type)
            if matched is None:
                continue
            track = self._tracks[matched]
            track.source_views.add(view_id)
            track.rgb_only_observations[view_id] = now
            if track.observations:
                latest = track.observations[-1]
                latest.source_views = sorted(set(latest.source_views) | track.source_views)
                latest.confidence = max(float(latest.confidence), float(detection.score))
                latest.quality_score = max(float(latest.quality_score), float(detection.bbox_quality or detection.score))

    def _create_track(self, scene_object: SceneObject) -> str:
        prefix = scene_object.semantic_type
        self._track_counter[prefix] += 1
        track_id = f"{prefix}_{self._track_counter[prefix]}"
        self._tracks[track_id] = Track(track_id=track_id, semantic_type=scene_object.semantic_type)
        return track_id

    def _find_matching_track(self, scene_object: SceneObject) -> Optional[str]:
        best_track = None
        best_distance = float("inf")
        gate = self._position_gate_for(scene_object.semantic_type)

        for track_id, track in self._tracks.items():
            if track.semantic_type != scene_object.semantic_type or not track.observations:
                continue
            latest = track.observations[-1]
            distance = self._distance(latest.pose, scene_object.pose)
            if distance < gate and distance < best_distance:
                best_track = track_id
                best_distance = distance

        return best_track

    def _topics_from_parameter(self, parameter_name: str) -> List[str]:
        value = self.get_parameter(parameter_name).value
        if isinstance(value, str):
            try:
                parsed = yaml.safe_load(value)
            except Exception:  # pylint: disable=broad-except
                parsed = None
            if isinstance(parsed, list):
                return [str(item) for item in parsed]
            return [item.strip() for item in value.split(",") if item.strip()]
        return [str(item) for item in value]

    def _find_matching_track_for_detection(self, semantic_type: str) -> Optional[str]:
        best_track = None
        best_update_ns: Optional[int] = None
        for track_id, track in self._tracks.items():
            if track.semantic_type != semantic_type or not track.observations or track.last_update is None:
                continue
            update_ns = track.last_update.nanoseconds
            if best_update_ns is None or update_ns > best_update_ns:
                best_track = track_id
                best_update_ns = update_ns
        return best_track

    def _position_gate_for(self, semantic_type: str) -> float:
        if "bottle" in semantic_type:
            return self._position_gates["bottle"]
        if "cup" in semantic_type:
            return self._position_gates["cup"]
        if "ball" in semantic_type:
            return self._position_gates["ball"]
        if semantic_type == "table_surface":
            return 0.08
        return self._position_gates["basket"]

    def _distance(self, left: PoseStamped, right: PoseStamped) -> float:
        dx = left.pose.position.x - right.pose.position.x
        dy = left.pose.position.y - right.pose.position.y
        dz = left.pose.position.z - right.pose.position.z
        return math.sqrt(dx * dx + dy * dy + dz * dz)

    def _trim_track(self, track: Track, now: Time) -> None:
        max_age_ns = int(self._observation_window * 1e9)
        while track.observations:
            stamp = Time.from_msg(track.observations[0].last_seen)
            if (now - stamp).nanoseconds <= max_age_ns:
                break
            track.observations.popleft()

    def _is_track_stable(self, track: Track, now: Time) -> bool:
        if len(track.observations) < self._stability_count:
            return False
        oldest = Time.from_msg(track.observations[0].last_seen)
        newest = Time.from_msg(track.observations[-1].last_seen)
        if (newest - oldest).nanoseconds < int(self._stable_window * 1e9):
            return False
        latest = track.observations[-1]
        gate = self._position_gate_for(latest.semantic_type)
        for observation in track.observations:
            if self._distance(observation.pose, latest.pose) > gate:
                return False
            if observation.confidence < self._confidence_threshold(latest.semantic_type):
                return False
        return True

    def _confidence_threshold(self, semantic_type: str) -> float:
        if "ball" in semantic_type or semantic_type == "basket":
            return 0.55
        if semantic_type == "table_surface":
            return 0.50
        return 0.60

    def _fused_observation(self, track: Track) -> SceneObject:
        latest = deepcopy(track.observations[-1])
        recent = list(track.observations)
        if len(recent) < 2:
            return latest

        latest.pose.pose.position.x = self._median([item.pose.pose.position.x for item in recent])
        latest.pose.pose.position.y = self._median([item.pose.pose.position.y for item in recent])
        latest.pose.pose.position.z = self._median([item.pose.pose.position.z for item in recent])
        latest.size.x = self._median([item.size.x for item in recent])
        latest.size.y = self._median([item.size.y for item in recent])
        latest.size.z = self._median([item.size.z for item in recent])
        latest.confidence = max(item.confidence for item in recent)
        latest.quality_score = max(float(item.quality_score) for item in recent)
        latest.source_views = sorted(set(latest.source_views) | track.source_views)
        return latest

    def _median(self, values: Iterable[float]) -> float:
        ordered = sorted(float(value) for value in values)
        if not ordered:
            return 0.0
        middle = len(ordered) // 2
        if len(ordered) % 2:
            return ordered[middle]
        return (ordered[middle - 1] + ordered[middle]) / 2.0

    def _scene_signature(self, objects: List[SceneObject]):
        signature = []
        for scene_object in objects:
            position = scene_object.pose.pose.position
            signature.append(
                (
                    scene_object.id,
                    scene_object.semantic_type,
                    scene_object.lifecycle_state,
                    scene_object.source,
                    tuple(scene_object.source_views),
                    round(float(position.x), 3),
                    round(float(position.y), 3),
                    round(float(position.z), 3),
                    round(float(scene_object.confidence), 3),
                    round(float(scene_object.quality_score), 3),
                )
            )
        return tuple(sorted(signature))

    def _shape_type_for(self, semantic_type: str) -> str:
        if semantic_type in {"water_bottle", "cola_bottle"} or semantic_type.startswith("cup"):
            return "cylinder"
        if semantic_type in {"basketball", "soccer_ball"}:
            return "sphere"
        if semantic_type == "table_surface":
            return "plane"
        if semantic_type == "basket":
            return "box"
        return "unknown"

    def _default_estimated_covariance(self, semantic_type: str) -> List[float]:
        orientation_variance = 3.14 if semantic_type in {"basketball", "soccer_ball"} else 1.0
        return [0.0025, 0.0025, 0.0025, orientation_variance, orientation_variance, orientation_variance]

    def _publish_scene(self) -> None:
        now = self.get_clock().now()

        stale_ns = int(self._stale_timeout * 1e9)
        lost_ns = int(self._lost_timeout * 1e9)
        expired: List[str] = []
        objects: List[SceneObject] = []

        for track_id, track in self._tracks.items():
            if not track.observations or track.last_update is None:
                expired.append(track_id)
                continue

            age_ns = (now - track.last_update).nanoseconds
            latest = self._fused_observation(track)
            latest.last_seen = track.last_update.to_msg()
            if age_ns > lost_ns:
                latest.lifecycle_state = "lost"
            elif age_ns > stale_ns:
                latest.lifecycle_state = "stale"
            elif track.stable:
                latest.lifecycle_state = "stable"
            else:
                latest.lifecycle_state = "observed"
            if age_ns <= lost_ns:
                objects.append(latest)
            else:
                expired.append(track_id)

        for track_id in expired:
            self._tracks.pop(track_id, None)

        signature = self._scene_signature(objects)
        if signature != self._last_scene_signature:
            self._scene_version += 1
            self._last_scene_signature = signature

        scene = SceneObjectArray()
        scene.header.frame_id = "world"
        scene.header.stamp = now.to_msg()
        scene.scene_version = self._scene_version
        for scene_object in objects:
            scene_object.scene_version = self._scene_version
            scene.objects.append(scene_object)

        self._publisher.publish(scene)


def main() -> None:
    rclpy.init()
    node = SceneFusionNode()
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
