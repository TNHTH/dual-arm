#!/usr/bin/python3

from __future__ import annotations

from copy import deepcopy
from typing import Dict

import rclpy
from rclpy.node import Node

from dualarm_interfaces.msg import SceneObjectArray
from dualarm_interfaces.srv import AttachObject, DetachObject, ReleaseObject, ReserveObject


class PlanningSceneSyncNode(Node):
    def __init__(self) -> None:
        super().__init__("planning_scene_sync")
        self.declare_parameter("input_topic", "/scene_fusion/raw_scene_objects")
        self.declare_parameter("output_topic", "/scene_fusion/scene_objects")
        input_topic = self.get_parameter("input_topic").value
        output_topic = self.get_parameter("output_topic").value

        self._raw_scene = SceneObjectArray()
        self._reservations: Dict[str, str] = {}
        self._attached_links: Dict[str, str] = {}
        self._publisher = self.create_publisher(SceneObjectArray, output_topic, 10)
        self.create_subscription(SceneObjectArray, input_topic, self._handle_scene, 10)
        self.create_service(ReserveObject, "/scene/reserve_object", self._handle_reserve)
        self.create_service(ReleaseObject, "/scene/release_object", self._handle_release)
        self.create_service(AttachObject, "/scene/attach_object", self._handle_attach)
        self.create_service(DetachObject, "/scene/detach_object", self._handle_detach)
        self.get_logger().info(f"planning_scene_sync 已启动，输入: {input_topic}，输出: {output_topic}")

    def _handle_scene(self, message: SceneObjectArray) -> None:
        self._raw_scene = message
        managed = deepcopy(message)
        for scene_object in managed.objects:
            if scene_object.id in self._reservations:
                scene_object.reserved_by = self._reservations[scene_object.id]
                if scene_object.lifecycle_state in ("stable", "observed"):
                    scene_object.lifecycle_state = "reserved"
            if scene_object.id in self._attached_links:
                scene_object.attached_link = self._attached_links[scene_object.id]
                scene_object.lifecycle_state = "attached"
        self._publisher.publish(managed)

    def _handle_reserve(self, request: ReserveObject.Request, response: ReserveObject.Response):
        self._reservations[request.object_id] = request.reserved_by
        response.success = True
        response.message = f"{request.object_id} 已保留给 {request.reserved_by}"
        return response

    def _handle_release(self, request: ReleaseObject.Request, response: ReleaseObject.Response):
        self._reservations.pop(request.object_id, None)
        response.success = True
        response.message = f"{request.object_id} 已释放 reservation"
        return response

    def _handle_attach(self, request: AttachObject.Request, response: AttachObject.Response):
        self._attached_links[request.object_id] = request.link_name
        response.success = True
        response.message = f"{request.object_id} 已 attach 到 {request.link_name}"
        return response

    def _handle_detach(self, request: DetachObject.Request, response: DetachObject.Response):
        self._attached_links.pop(request.object_id, None)
        response.success = True
        response.message = f"{request.object_id} 已 detach"
        return response


def main() -> None:
    rclpy.init()
    node = PlanningSceneSyncNode()
    try:
        rclpy.spin(node)
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    main()
