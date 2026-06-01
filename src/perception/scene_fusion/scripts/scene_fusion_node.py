#!/usr/bin/python3

from __future__ import annotations

from collections import defaultdict, deque
from copy import deepcopy
from dataclasses import dataclass, field
from typing import Deque, Dict, Iterable, List, Optional

import math
import rclpy
from geometry_msgs.msg import PoseStamped
from rclpy.node import Node
from rclpy.time import Time

from dualarm_interfaces.msg import SceneObject, SceneObjectArray


@dataclass
class Track:
    track_id: str
    semantic_type: str
    observations: Deque[SceneObject] = field(default_factory=deque)
    last_update: Optional[Time] = None
    stable: bool = False


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
        self.declare_parameter("output_topic", "/scene_fusion/raw_scene_objects")
        self.declare_parameter("stability_count", 5)
        self.declare_parameter("observation_window", 1.5)
        self.declare_parameter("stable_window", 0.3)
        self.declare_parameter("bottle_position_gate", 0.015)
        self.declare_parameter("cup_position_gate", 0.015)
        self.declare_parameter("ball_position_gate", 0.025)
        self.declare_parameter("basket_position_gate", 0.03)
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
        self._track_counter: Dict[str, int] = defaultdict(int)
        self._tracks: Dict[str, Track] = {}
        self._publisher = self.create_publisher(SceneObjectArray, self._output_topic, 10)

        for topic in self.get_parameter("input_topics").value:
            self.create_subscription(SceneObjectArray, topic, self._handle_scene, 10)

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
            observation.last_seen = now.to_msg()
            observation.lifecycle_state = "observed"
            observation.reserved_by = "none"
            observation.attached_link = ""
            observation.scene_version = self._scene_version
            observation.pose_covariance_diagonal = [-1.0] * 6
            track.observations.append(observation)
            self._trim_track(track, now)
            track.stable = self._is_track_stable(track, now)

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

    def _publish_scene(self) -> None:
        now = self.get_clock().now()
        self._scene_version += 1

        scene = SceneObjectArray()
        scene.header.frame_id = "world"
        scene.header.stamp = now.to_msg()
        scene.scene_version = self._scene_version

        stale_ns = int(self._stale_timeout * 1e9)
        lost_ns = int(self._lost_timeout * 1e9)
        expired: List[str] = []

        for track_id, track in self._tracks.items():
            if not track.observations or track.last_update is None:
                expired.append(track_id)
                continue

            age_ns = (now - track.last_update).nanoseconds
            latest = deepcopy(track.observations[-1])
            latest.scene_version = self._scene_version
            latest.last_seen = track.last_update.to_msg()
            if age_ns > lost_ns:
                latest.lifecycle_state = "lost"
            elif track.stable:
                latest.lifecycle_state = "stable"
            else:
                latest.lifecycle_state = "observed"
            if age_ns <= lost_ns:
                scene.objects.append(latest)
            else:
                expired.append(track_id)

        for track_id in expired:
            self._tracks.pop(track_id, None)

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
