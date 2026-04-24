#!/usr/bin/python3

from __future__ import annotations

import sys
import time
from typing import Optional

import rclpy
from geometry_msgs.msg import PoseStamped, Vector3
from rclpy.node import Node

from dualarm_interfaces.msg import SceneObject, SceneObjectArray


class DualCameraSceneFusionSmoke(Node):
    def __init__(self) -> None:
        super().__init__("dual_camera_scene_fusion_smoke")
        self._scene: Optional[SceneObjectArray] = None
        self._left_pub = self.create_publisher(SceneObjectArray, "/perception/left/scene_objects", 10)
        self._right_pub = self.create_publisher(SceneObjectArray, "/perception/right/scene_objects", 10)
        self.create_subscription(SceneObjectArray, "/scene_fusion/raw_scene_objects", self._scene_cb, 10)

    def _scene_cb(self, message: SceneObjectArray) -> None:
        self._scene = message

    def _publish(self, source: str, x: float) -> None:
        stamp = self.get_clock().now().to_msg()
        message = SceneObjectArray()
        message.header.frame_id = "world"
        message.header.stamp = stamp
        message.scene_version = 1
        message.objects.append(self._object(source, x, stamp))
        if source == "left_camera":
            self._left_pub.publish(message)
        else:
            self._right_pub.publish(message)

    def _object(self, source: str, x: float, stamp) -> SceneObject:
        scene_object = SceneObject()
        scene_object.id = f"{source}_water"
        scene_object.semantic_type = "water_bottle"
        scene_object.pose = PoseStamped()
        scene_object.pose.header.frame_id = "world"
        scene_object.pose.header.stamp = stamp
        scene_object.pose.pose.position.x = x
        scene_object.pose.pose.position.y = 0.0
        scene_object.pose.pose.position.z = 0.20
        scene_object.pose.pose.orientation.w = 1.0
        scene_object.size = Vector3(x=0.06, y=0.06, z=0.16)
        scene_object.confidence = 0.9
        scene_object.graspable = True
        scene_object.movable = True
        scene_object.source = source
        scene_object.last_seen = stamp
        scene_object.scene_version = 1
        scene_object.lifecycle_state = "observed"
        scene_object.reserved_by = "none"
        scene_object.attached_link = ""
        scene_object.pose_covariance_diagonal = [0.0] * 6
        return scene_object

    def wait_for_condition(self, predicate, timeout_sec: float = 5.0) -> bool:
        deadline = time.monotonic() + timeout_sec
        while time.monotonic() < deadline:
            rclpy.spin_once(self, timeout_sec=0.1)
            if predicate():
                return True
        return False

    def water_objects(self):
        if self._scene is None:
            return []
        return [obj for obj in self._scene.objects if obj.semantic_type == "water_bottle"]


def main() -> int:
    rclpy.init()
    node = DualCameraSceneFusionSmoke()
    try:
        if not node.wait_for_condition(lambda: node._left_pub.get_subscription_count() > 0 and node._right_pub.get_subscription_count() > 0, 3.0):
            print("scene_fusion is not subscribed to left/right scene topics", file=sys.stderr)
            return 2

        for _ in range(3):
            node._publish("left_camera", 0.500)
            rclpy.spin_once(node, timeout_sec=0.1)

        if not node.wait_for_condition(lambda: len(node.water_objects()) == 1 and node._scene.scene_version > 0):
            print("left camera object did not enter fused scene", file=sys.stderr)
            return 3
        initial_version = node._scene.scene_version

        time.sleep(0.2)
        rclpy.spin_once(node, timeout_sec=0.1)
        if node._scene is None or node._scene.scene_version != initial_version:
            print("scene_version advanced without effective input change", file=sys.stderr)
            return 4

        for _ in range(3):
            node._publish("right_camera", 0.512)
            rclpy.spin_once(node, timeout_sec=0.1)

        def switched_ok() -> bool:
            water = node.water_objects()
            if len(water) != 1:
                return False
            x = water[0].pose.pose.position.x
            return 0.500 <= x <= 0.512 and node._scene.scene_version >= initial_version

        if not node.wait_for_condition(switched_ok):
            water = node.water_objects()
            print(f"right camera fusion unstable: count={len(water)}", file=sys.stderr)
            return 5

        print("dual camera scene fusion smoke passed")
        return 0
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    raise SystemExit(main())
