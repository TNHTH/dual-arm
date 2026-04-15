#!/usr/bin/python3

from __future__ import annotations

from collections import defaultdict, deque
from copy import deepcopy
from dataclasses import dataclass
from typing import Deque, Dict, Tuple

import rclpy
from rclpy.node import Node
from rclpy.time import Time

from dualarm_interfaces.msg import SceneObject, SceneObjectArray


@dataclass
class Observation:
    stamp: Time
    scene_object: SceneObject


class SceneFusionNode(Node):
    def __init__(self) -> None:
        super().__init__("scene_fusion")
        self.declare_parameter(
            "input_topics",
            [
                "/perception/scene_objects",
                "/perception/ball_basket_scene_objects",
            ],
        )
        self.declare_parameter("output_topic", "/scene_fusion/scene_objects")
        self.declare_parameter("stability_count", 2)
        self.declare_parameter("observation_window", 1.5)

        self._output_topic = self.get_parameter("output_topic").value
        self._stability_count = int(self.get_parameter("stability_count").value)
        self._observation_window = float(self.get_parameter("observation_window").value)
        self._buffers: Dict[str, Deque[Observation]] = defaultdict(deque)

        self._publisher = self.create_publisher(SceneObjectArray, self._output_topic, 10)

        for topic in self.get_parameter("input_topics").value:
            self.create_subscription(SceneObjectArray, topic, self._handle_scene, 10)

        self.create_timer(0.2, self._publish_scene)
        self.get_logger().info(f"scene_fusion 已启动，输出: {self._output_topic}")

    def _make_key(self, scene_object: SceneObject) -> str:
        if scene_object.id:
            return scene_object.id
        return f"{scene_object.semantic_type}:{scene_object.source}"

    def _handle_scene(self, message: SceneObjectArray) -> None:
        now = self.get_clock().now()
        for scene_object in message.objects:
            key = self._make_key(scene_object)
            self._buffers[key].append(Observation(stamp=now, scene_object=deepcopy(scene_object)))
            self._trim_buffer(key, now)

    def _trim_buffer(self, key: str, now: Time) -> None:
        threshold_ns = int(self._observation_window * 1e9)
        buffer = self._buffers[key]
        while buffer and (now - buffer[0].stamp).nanoseconds > threshold_ns:
            buffer.popleft()

    def _publish_scene(self) -> None:
        now = self.get_clock().now()
        scene = SceneObjectArray()
        scene.header.frame_id = "world"
        scene.header.stamp = now.to_msg()

        semantic_counters: Dict[str, int] = defaultdict(int)

        for key, observations in list(self._buffers.items()):
            self._trim_buffer(key, now)
            if len(observations) < self._stability_count:
                continue

            latest = deepcopy(observations[-1].scene_object)
            semantic_counters[latest.semantic_type] += 1
            latest.id = f"{latest.semantic_type}_{semantic_counters[latest.semantic_type]}"
            scene.objects.append(latest)

        self._publisher.publish(scene)


def main() -> None:
    rclpy.init()
    node = SceneFusionNode()
    try:
        rclpy.spin(node)
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    main()
