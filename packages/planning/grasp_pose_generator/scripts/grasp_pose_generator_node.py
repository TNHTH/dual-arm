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
        target.partner_arm_mode = "right_arm" if target.arm_mode == "left_arm" else "left_arm"
        target.source_scene_id = scene_object.scene_version
        target.position_tolerance = 0.01
        target.orientation_tolerance_deg = 10.0
        target.guarded_motion = False
        target.requires_bimanual_sync = scene_object.semantic_type in ("basketball", "soccer_ball")
        target.requires_attached_object = False

        target.grasp = deepcopy(scene_object.pose)
        target.operate = deepcopy(scene_object.pose)
        target.pregrasp = deepcopy(scene_object.pose)
        target.pregrasp.pose.position.z += self._pregrasp_offset
        target.retreat = deepcopy(scene_object.pose)
        target.retreat.pose.position.z += self._retreat_offset
        target.place = deepcopy(scene_object.pose)
        target.release = deepcopy(target.place)
        target.release.pose.position.z += self._release_offset
        target.approach_axis.z = -1.0
        target.retreat_axis.z = 1.0
        target.target_type = "grasp"
        target.strategy_id = self._strategy_id_for(scene_object.semantic_type)
        target.gripper_profile = self._gripper_profile_for(scene_object.semantic_type)
        target.execution_profile = self._execution_profile_for(scene_object.semantic_type)

        for subframe in scene_object.subframes:
            if scene_object.semantic_type.endswith("bottle") and subframe.name == "bottle_body_grasp":
                target.grasp = deepcopy(subframe.pose)
            if scene_object.semantic_type.endswith("bottle") and subframe.name == "bottle_cap_pregrasp":
                target.pregrasp = deepcopy(subframe.pose)
                target.target_type = "cap_pregrasp"
                target.strategy_id = "bottle_cap_grasp"
            if scene_object.semantic_type.endswith("bottle") and subframe.name == "bottle_cap_center":
                target.operate = deepcopy(subframe.pose)
                target.target_type = "cap_operate"
                target.strategy_id = "bottle_cap_grasp"
                target.guarded_motion = True
            if scene_object.semantic_type.endswith("bottle") and subframe.name == "bottle_mouth":
                target.operate = deepcopy(subframe.pose)
                target.target_type = "operate"
                target.guarded_motion = True
            if scene_object.semantic_type.endswith("bottle") and subframe.name == "bottle_pour_pivot":
                target.place = deepcopy(subframe.pose)
            if scene_object.semantic_type.startswith("cup") and subframe.name == "cup_fill_target":
                target.operate = deepcopy(subframe.pose)
                target.target_type = "prepour"
            if scene_object.semantic_type.startswith("cup") and subframe.name == "cup_side_grasp":
                target.grasp = deepcopy(subframe.pose)
                target.strategy_id = "cup_side_grasp"
            if scene_object.semantic_type == "basket" and subframe.name == "basket_release_center":
                target.release = deepcopy(subframe.pose)
                target.target_type = "release"
                target.guarded_motion = True

        return target

    def _select_arm_mode(self, semantic_type: str) -> str:
        if semantic_type in ("basketball", "soccer_ball"):
            return "dual_arm"
        if semantic_type == "cola_bottle":
            return "right_arm"
        return "left_arm"

    def _strategy_id_for(self, semantic_type: str) -> str:
        if semantic_type in ("basketball", "soccer_ball"):
            return "ball_bimanual_handover"
        if semantic_type == "basket":
            return "basket_release"
        if semantic_type.endswith("bottle"):
            return "bottle_body_grasp"
        return "cup_side_grasp"

    def _gripper_profile_for(self, semantic_type: str) -> str:
        if semantic_type in ("basketball", "soccer_ball"):
            return "ball_dual_hold"
        if semantic_type.endswith("bottle"):
            return "bottle_hold"
        if semantic_type.startswith("cup"):
            return "cup_hold"
        return "default_hold"

    def _execution_profile_for(self, semantic_type: str) -> str:
        if semantic_type in ("basketball", "soccer_ball"):
            return "dual_arm_transport"
        if semantic_type == "basket":
            return "basket_release_lift_and_open"
        if semantic_type.endswith("bottle"):
            return "bottle_transport"
        return "cup_transport"


def main() -> None:
    rclpy.init()
    node = GraspPoseGeneratorNode()
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
