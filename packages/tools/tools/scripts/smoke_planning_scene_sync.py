#!/usr/bin/python3

from __future__ import annotations

import sys
import time
from typing import Optional

import rclpy
from geometry_msgs.msg import PoseStamped, Vector3
from moveit_msgs.msg import PlanningScene, PlanningSceneComponents
from moveit_msgs.srv import GetPlanningScene
from rclpy.node import Node

from dualarm_interfaces.msg import SceneObject, SceneObjectArray
from dualarm_interfaces.srv import AttachObject, DetachObject, ReleaseObject, ReserveObject


class PlanningSceneSyncSmoke(Node):
    def __init__(self) -> None:
        super().__init__("planning_scene_sync_smoke")
        self._managed_scene: Optional[SceneObjectArray] = None
        self._planning_scene: Optional[PlanningScene] = None
        self._raw_scene_message = self._build_raw_scene_message()
        self._publish_timer = None

        self._raw_pub = self.create_publisher(SceneObjectArray, "/scene_fusion/raw_scene_objects", 10)
        self.create_subscription(SceneObjectArray, "/scene_fusion/scene_objects", self._managed_cb, 10)
        self.create_subscription(PlanningScene, "/monitored_planning_scene", self._planning_scene_cb, 10)

        self._reserve = self.create_client(ReserveObject, "/scene/reserve_object")
        self._release = self.create_client(ReleaseObject, "/scene/release_object")
        self._attach = self.create_client(AttachObject, "/scene/attach_object")
        self._detach = self.create_client(DetachObject, "/scene/detach_object")
        self._get_planning_scene = self.create_client(GetPlanningScene, "/get_planning_scene")

    def _managed_cb(self, message: SceneObjectArray) -> None:
        self._managed_scene = message

    def _planning_scene_cb(self, message: PlanningScene) -> None:
        self._planning_scene = message

    def wait_for_clients(self) -> bool:
        return all(
            client.wait_for_service(timeout_sec=2.0)
            for client in (self._reserve, self._release, self._attach, self._detach, self._get_planning_scene)
        )

    def wait_for_subscribers(self, timeout: float = 3.0) -> bool:
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            if self._raw_pub.get_subscription_count() > 0:
                return True
            rclpy.spin_once(self, timeout_sec=0.1)
        return self._raw_pub.get_subscription_count() > 0

    def publish_raw_scene(self) -> None:
        for _ in range(20):
            self._publish_raw_scene_once()
            rclpy.spin_once(self, timeout_sec=0.1)

    def start_publishing_raw_scene(self) -> None:
        if self._publish_timer is None:
            self._publish_timer = self.create_timer(0.1, self._publish_raw_scene_once)

    def stop_publishing_raw_scene(self) -> None:
        if self._publish_timer is not None:
            self.destroy_timer(self._publish_timer)
            self._publish_timer = None

    def _publish_raw_scene_once(self) -> None:
        self._raw_scene_message.header.stamp = self.get_clock().now().to_msg()
        self._raw_scene_message.objects[0].pose.header.stamp = self._raw_scene_message.header.stamp
        self._raw_scene_message.objects[0].last_seen = self._raw_scene_message.header.stamp
        self._raw_pub.publish(self._raw_scene_message)

    def _build_raw_scene_message(self) -> SceneObjectArray:
        message = SceneObjectArray()
        message.header.frame_id = "world"
        message.scene_version = 1
        obj = SceneObject()
        obj.id = "water_bottle_gold"
        obj.semantic_type = "water_bottle"
        obj.pose = PoseStamped()
        obj.pose.header.frame_id = "world"
        obj.pose.pose.position.x = 0.40
        obj.pose.pose.position.y = 0.10
        obj.pose.pose.position.z = 0.22
        obj.pose.pose.orientation.w = 1.0
        obj.size = Vector3(x=0.07, y=0.07, z=0.24)
        obj.confidence = 0.9
        obj.graspable = True
        obj.movable = True
        obj.source = "smoke"
        obj.scene_version = 1
        obj.lifecycle_state = "stable"
        obj.reserved_by = "none"
        obj.attached_link = ""
        obj.pose_covariance_diagonal = [0.0] * 6
        message.objects.append(obj)
        return message

    def call(self, client, request) -> bool:
        future = client.call_async(request)
        deadline = time.monotonic() + 3.0
        while time.monotonic() < deadline:
            rclpy.spin_once(self, timeout_sec=0.1)
            if future.done():
                return future.result() is not None and bool(future.result().success)
        return False

    def wait_for_condition(self, predicate, timeout: float = 5.0) -> bool:
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            rclpy.spin_once(self, timeout_sec=0.1)
            if predicate():
                return True
        return False

    def planning_scene_ids(self) -> tuple[set[str], set[str]]:
        request = GetPlanningScene.Request()
        request.components.components = (
            PlanningSceneComponents.WORLD_OBJECT_NAMES
            | PlanningSceneComponents.WORLD_OBJECT_GEOMETRY
            | PlanningSceneComponents.ROBOT_STATE_ATTACHED_OBJECTS
        )
        future = self._get_planning_scene.call_async(request)
        deadline = time.monotonic() + 1.0
        while time.monotonic() < deadline:
            rclpy.spin_once(self, timeout_sec=0.05)
            if future.done():
                result = future.result()
                if result is None:
                    return set(), set()
                world_ids = {obj.id for obj in result.scene.world.collision_objects}
                attached_ids = {obj.object.id for obj in result.scene.robot_state.attached_collision_objects}
                return world_ids, attached_ids
        return set(), set()


def main() -> int:
    rclpy.init()
    node = PlanningSceneSyncSmoke()
    try:
        if not node.wait_for_clients():
            print("service unavailable", file=sys.stderr)
            return 2
        if not node.wait_for_subscribers():
            print("raw scene publisher has no subscribers", file=sys.stderr)
            return 10

        node.start_publishing_raw_scene()
        node.publish_raw_scene()

        object_id = "water_bottle_gold"

        if not node.wait_for_condition(
            lambda: node._managed_scene is not None
            and node._managed_scene.scene_version > 0
            and node._managed_scene.header.frame_id == "world"
            and any(
                obj.id == object_id
                and obj.scene_version == node._managed_scene.scene_version
                and obj.pose.header.frame_id == "world"
                for obj in node._managed_scene.objects
            )
        ):
            print(f"managed scene missing {object_id}", file=sys.stderr)
            return 3

        if not node.wait_for_condition(lambda: object_id in node.planning_scene_ids()[0]):
            world_ids, attached_ids = node.planning_scene_ids()
            print(
                f"planning scene world ADD mismatch world={sorted(world_ids)} attached={sorted(attached_ids)}",
                file=sys.stderr,
            )
            return 3

        pre_reserve_version = node._managed_scene.scene_version if node._managed_scene else 0
        reserve_req = ReserveObject.Request()
        reserve_req.object_id = object_id
        reserve_req.reserved_by = "smoke"
        reserve_req.arm_mode = "left_arm"
        if not node.call(node._reserve, reserve_req):
            print("reserve failed", file=sys.stderr)
            return 4

        if not node.wait_for_condition(
            lambda: any(
                obj.id == object_id
                and obj.lifecycle_state == "reserved"
                and obj.reserved_by == "smoke"
                and obj.attached_link == ""
                and (node._managed_scene is not None and node._managed_scene.scene_version > pre_reserve_version)
                for obj in (node._managed_scene.objects if node._managed_scene else [])
            )
        ):
            print("managed scene did not enter reserved", file=sys.stderr)
            if node._managed_scene is not None:
                for obj in node._managed_scene.objects:
                    print(f"managed:{obj.id}:{obj.lifecycle_state}:{obj.reserved_by}:{obj.attached_link}", file=sys.stderr)
            return 5

        attach_req = AttachObject.Request()
        attach_req.object_id = object_id
        attach_req.link_name = "left_tcp"
        if not node.call(node._attach, attach_req):
            print("attach failed", file=sys.stderr)
            return 6

        if not node.wait_for_condition(
            lambda: any(
                obj.id == object_id
                and obj.lifecycle_state == "attached"
                and obj.attached_link == "left_tcp"
                for obj in (node._managed_scene.objects if node._managed_scene else [])
            )
        ):
            print("managed scene did not enter attached", file=sys.stderr)
            return 11

        if not node.wait_for_condition(
            lambda: object_id not in node.planning_scene_ids()[0]
            and object_id in node.planning_scene_ids()[1]
        ):
            world_ids, attached_ids = node.planning_scene_ids()
            print(
                f"planning scene attach mismatch world={sorted(world_ids)} attached={sorted(attached_ids)}",
                file=sys.stderr,
            )
            return 7

        detach_req = DetachObject.Request()
        detach_req.object_id = object_id
        if not node.call(node._detach, detach_req):
            print("detach failed", file=sys.stderr)
            return 8
        if not node.wait_for_condition(lambda: object_id not in node.planning_scene_ids()[1] and object_id in node.planning_scene_ids()[0]):
            print(f"planning scene did not detach {object_id} back to world", file=sys.stderr)
            return 13

        release_req = ReleaseObject.Request()
        release_req.object_id = object_id
        if not node.call(node._release, release_req):
            print("release failed", file=sys.stderr)
            return 9
        if not node.wait_for_condition(
            lambda: all(
                obj.id != object_id or (obj.reserved_by == "none" and obj.attached_link == "")
                for obj in (node._managed_scene.objects if node._managed_scene else [])
            )
        ):
            print(f"managed scene did not release {object_id}", file=sys.stderr)
            return 14

        node.stop_publishing_raw_scene()
        if not node.wait_for_condition(
            lambda: node._managed_scene is not None
            and all(obj.id != object_id for obj in node._managed_scene.objects),
            timeout=3.0,
        ):
            print(f"managed scene did not clear {object_id}", file=sys.stderr)
            return 15
        if not node.wait_for_condition(
            lambda: object_id not in node.planning_scene_ids()[0]
            and object_id not in node.planning_scene_ids()[1],
            timeout=3.0,
        ):
            world_ids, attached_ids = node.planning_scene_ids()
            print(
                f"planning scene did not clear {object_id} world={sorted(world_ids)} attached={sorted(attached_ids)}",
                file=sys.stderr,
            )
            return 16

        print("planning_scene_sync smoke passed")
        return 0
    finally:
        node.stop_publishing_raw_scene()
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    raise SystemExit(main())
