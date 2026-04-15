#!/usr/bin/python3

from copy import deepcopy

import rclpy
from rclpy.node import Node

from dualarm_interfaces.msg import GraspTarget, SceneObjectArray


class GraspPoseGeneratorNode(Node):
    def __init__(self) -> None:
        super().__init__("grasp_pose_generator")
        self.declare_parameter("input_topic", "/scene_fusion/scene_objects")
        self.declare_parameter("output_topic", "/planning/grasp_targets")
        self.declare_parameter("pregrasp_offset", 0.10)
        self.declare_parameter("retreat_offset", 0.15)
        self.declare_parameter("release_offset", 0.04)

        input_topic = self.get_parameter("input_topic").value
        output_topic = self.get_parameter("output_topic").value
        self._pregrasp_offset = float(self.get_parameter("pregrasp_offset").value)
        self._retreat_offset = float(self.get_parameter("retreat_offset").value)
        self._release_offset = float(self.get_parameter("release_offset").value)

        self._publisher = self.create_publisher(GraspTarget, output_topic, 10)
        self.create_subscription(SceneObjectArray, input_topic, self._handle_scene, 10)
        self.get_logger().info(f"grasp_pose_generator 已启动，输入: {input_topic}，输出: {output_topic}")

    def _handle_scene(self, message: SceneObjectArray) -> None:
        for scene_object in message.objects:
            self._publisher.publish(self._build_target(scene_object))

    def _build_target(self, scene_object) -> GraspTarget:
        target = GraspTarget()
        target.object_id = scene_object.id
        target.arm_mode = self._select_arm_mode(scene_object.semantic_type)

        target.grasp = deepcopy(scene_object.pose)
        target.operate = deepcopy(scene_object.pose)
        target.pregrasp = deepcopy(scene_object.pose)
        target.pregrasp.pose.position.z += self._pregrasp_offset
        target.retreat = deepcopy(scene_object.pose)
        target.retreat.pose.position.z += self._retreat_offset
        target.place = deepcopy(scene_object.pose)
        target.release = deepcopy(target.place)
        target.release.pose.position.z += self._release_offset

        for subframe in scene_object.subframes:
            if scene_object.semantic_type.endswith("bottle") and subframe.name == "bottle_mouth":
                target.operate = deepcopy(subframe.pose)
            if scene_object.semantic_type.startswith("cup") and subframe.name == "cup_fill_target":
                target.operate = deepcopy(subframe.pose)
            if scene_object.semantic_type == "basket" and subframe.name == "basket_release_center":
                target.release = deepcopy(subframe.pose)

        return target

    def _select_arm_mode(self, semantic_type: str) -> str:
        if semantic_type in ("basketball", "soccer_ball"):
            return "dual_arm"
        if semantic_type == "cola_bottle":
            return "right_arm"
        return "left_arm"


def main() -> None:
    rclpy.init()
    node = GraspPoseGeneratorNode()
    try:
        rclpy.spin(node)
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    main()
