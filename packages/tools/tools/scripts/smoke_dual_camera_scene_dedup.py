#!/usr/bin/python3

from __future__ import annotations

import sys
import time
from typing import Optional

import rclpy
from geometry_msgs.msg import PoseStamped, Vector3
from rclpy.node import Node

from dualarm_interfaces.msg import SceneObject, SceneObjectArray


class DualCameraSceneDedupSmoke(Node):
    def __init__(self) -> None:
        super().__init__("dual_camera_scene_dedup_smoke")
        self._scene: Optional[SceneObjectArray] = None
        self._left_pub = self.create_publisher(SceneObjectArray, "/perception/left/scene_objects", 10)
        self._right_pub = self.create_publisher(SceneObjectArray, "/perception/right/scene_objects", 10)
        self.create_subscription(SceneObjectArray, "/scene_fusion/raw_scene_objects", self._scene_cb, 10)

    def _scene_cb(self, message: SceneObjectArray) -> None:
        self._scene = message

    def wait_for_subscribers(self, timeout_sec: float = 3.0) -> bool:
        deadline = time.monotonic() + timeout_sec
        while time.monotonic() < deadline:
            rclpy.spin_once(self, timeout_sec=0.1)
            if self._left_pub.get_subscription_count() > 0 and self._right_pub.get_subscription_count() > 0:
                return True
        return False

    def publish_pair(self) -> None:
        stamp = self.get_clock().now().to_msg()
        left = SceneObjectArray()
        left.header.frame_id = "world"
        left.header.stamp = stamp
        left.scene_version = 1
        left.objects.append(self._object("left_water", "water_bottle", "left_camera", 0.50, 0.00, 0.20, stamp))
        left.objects.append(self._object("left_cup", "cup", "left_camera", 0.45, 0.22, 0.12, stamp))

        right = SceneObjectArray()
        right.header.frame_id = "world"
        right.header.stamp = stamp
        right.scene_version = 1
        right.objects.append(self._object("right_water", "water_bottle", "right_camera", 0.515, 0.005, 0.20, stamp))
        right.objects.append(self._object("right_cup", "cup", "right_camera", 0.45, -0.22, 0.12, stamp))
        self._left_pub.publish(left)
        self._right_pub.publish(right)

    def _object(self, object_id: str, semantic_type: str, source: str, x: float, y: float, z: float, stamp) -> SceneObject:
        scene_object = SceneObject()
        scene_object.id = object_id
        scene_object.semantic_type = semantic_type
        scene_object.pose = PoseStamped()
        scene_object.pose.header.frame_id = "world"
        scene_object.pose.header.stamp = stamp
        scene_object.pose.pose.position.x = x
        scene_object.pose.pose.position.y = y
        scene_object.pose.pose.position.z = z
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
            self.publish_pair()
            rclpy.spin_once(self, timeout_sec=0.1)
            if predicate():
                return True
        return False


def main() -> int:
    rclpy.init()
    node = DualCameraSceneDedupSmoke()
    try:
        if not node.wait_for_subscribers():
            print("scene_fusion is not subscribed to both left/right scene topics", file=sys.stderr)
            return 2

        def dedup_ok() -> bool:
            if node._scene is None:
                return False
            water = [obj for obj in node._scene.objects if obj.semantic_type == "water_bottle"]
            cups = [obj for obj in node._scene.objects if obj.semantic_type == "cup"]
            return len(water) == 1 and len(cups) == 2 and node._scene.scene_version > 0

        if not node.wait_for_condition(dedup_ok):
            scene = node._scene
            summary = [] if scene is None else [(obj.id, obj.semantic_type, obj.source) for obj in scene.objects]
            print(f"dual camera dedup failed: {summary}", file=sys.stderr)
            return 3

        print("dual camera scene dedup smoke passed")
        return 0
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    raise SystemExit(main())
