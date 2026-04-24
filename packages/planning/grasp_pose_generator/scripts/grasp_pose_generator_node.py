#!/usr/bin/python3

from copy import deepcopy
from pathlib import Path
from typing import Dict

from geometry_msgs.msg import PoseStamped
import rclpy
from ament_index_python.packages import get_package_prefix
from rclpy.node import Node
import yaml

from dualarm_interfaces.msg import GraspTarget, SceneObjectArray


class GraspPoseGeneratorNode(Node):
    def __init__(self) -> None:
        super().__init__("grasp_pose_generator")
        self.declare_parameter("input_topic", "/scene_fusion/scene_objects")
        self.declare_parameter("output_topic", "/planning/grasp_targets")
        self.declare_parameter("world_frame", "world")
        self.declare_parameter("require_world_objects", True)
        repo_root = Path(get_package_prefix("grasp_pose_generator")).parent.parent
        self.declare_parameter("workspace_profiles_file", str(repo_root / "configs" / "competition" / "workspace_profiles.yaml"))
        self.declare_parameter("pregrasp_offset", 0.10)
        self.declare_parameter("retreat_offset", 0.15)
        self.declare_parameter("release_offset", 0.04)
        self.declare_parameter("water_bottle_body_strategy_id", "yibao_350ml_body_grasp")
        self.declare_parameter("water_bottle_cap_strategy_id", "yibao_350ml_cap_grasp")
        self.declare_parameter("water_bottle_gripper_profile", "yibao_350ml_hold")
        self.declare_parameter("water_bottle_execution_profile", "yibao_350ml_transport")
        self.declare_parameter("cola_bottle_body_strategy_id", "cocacola_300ml_body_grasp")
        self.declare_parameter("cola_bottle_cap_strategy_id", "cocacola_300ml_cap_grasp")
        self.declare_parameter("cola_bottle_gripper_profile", "cocacola_300ml_hold")
        self.declare_parameter("cola_bottle_execution_profile", "cocacola_300ml_transport")
        self.declare_parameter("cup_strategy_id", "dark_cup_side_grasp")
        self.declare_parameter("cup_gripper_profile", "dark_cup_hold")
        self.declare_parameter("cup_execution_profile", "dark_cup_transport")
        self.declare_parameter("water_bottle_body_grasp_z_offset", 0.0)
        self.declare_parameter("water_bottle_cap_center_z_offset", 0.0)
        self.declare_parameter("water_bottle_cap_pregrasp_z_offset", 0.0)
        self.declare_parameter("water_bottle_pour_pivot_z_offset", 0.0)
        self.declare_parameter("cola_bottle_body_grasp_z_offset", 0.0)
        self.declare_parameter("cola_bottle_cap_center_z_offset", 0.0)
        self.declare_parameter("cola_bottle_cap_pregrasp_z_offset", 0.0)
        self.declare_parameter("cola_bottle_pour_pivot_z_offset", 0.0)
        self.declare_parameter("cup_side_grasp_z_offset", 0.0)
        self.declare_parameter("cup_fill_target_z_offset", 0.0)

        input_topic = self.get_parameter("input_topic").value
        output_topic = self.get_parameter("output_topic").value
        workspace_profiles_file = Path(str(self.get_parameter("workspace_profiles_file").value)).expanduser().resolve()
        workspace_profiles = yaml.safe_load(workspace_profiles_file.read_text(encoding="utf-8"))
        active_profile_name = str(workspace_profiles.get("active_profile", "competition_default"))
        active_profile = workspace_profiles.get("profiles", {}).get(active_profile_name, {})
        self._role_policy = active_profile.get("arm_policy", {}).get("pouring", {}).get("default_pairings", {})
        self._pregrasp_offset = float(self.get_parameter("pregrasp_offset").value)
        self._retreat_offset = float(self.get_parameter("retreat_offset").value)
        self._release_offset = float(self.get_parameter("release_offset").value)
        self._world_frame = str(self.get_parameter("world_frame").value)
        self._require_world_objects = bool(self.get_parameter("require_world_objects").value)
        self._strategy_defaults = {
            "water_bottle": {
                "body_strategy_id": str(self.get_parameter("water_bottle_body_strategy_id").value),
                "cap_strategy_id": str(self.get_parameter("water_bottle_cap_strategy_id").value),
                "gripper_profile": str(self.get_parameter("water_bottle_gripper_profile").value),
                "execution_profile": str(self.get_parameter("water_bottle_execution_profile").value),
            },
            "cola_bottle": {
                "body_strategy_id": str(self.get_parameter("cola_bottle_body_strategy_id").value),
                "cap_strategy_id": str(self.get_parameter("cola_bottle_cap_strategy_id").value),
                "gripper_profile": str(self.get_parameter("cola_bottle_gripper_profile").value),
                "execution_profile": str(self.get_parameter("cola_bottle_execution_profile").value),
            },
            "cup": {
                "body_strategy_id": str(self.get_parameter("cup_strategy_id").value),
                "cap_strategy_id": "",
                "gripper_profile": str(self.get_parameter("cup_gripper_profile").value),
                "execution_profile": str(self.get_parameter("cup_execution_profile").value),
            },
        }
        self._subframe_z_offsets: Dict[str, Dict[str, float]] = {
            "water_bottle": {
                "bottle_body_grasp": float(self.get_parameter("water_bottle_body_grasp_z_offset").value),
                "bottle_cap_center": float(self.get_parameter("water_bottle_cap_center_z_offset").value),
                "bottle_cap_pregrasp": float(self.get_parameter("water_bottle_cap_pregrasp_z_offset").value),
                "bottle_pour_pivot": float(self.get_parameter("water_bottle_pour_pivot_z_offset").value),
            },
            "cola_bottle": {
                "bottle_body_grasp": float(self.get_parameter("cola_bottle_body_grasp_z_offset").value),
                "bottle_cap_center": float(self.get_parameter("cola_bottle_cap_center_z_offset").value),
                "bottle_cap_pregrasp": float(self.get_parameter("cola_bottle_cap_pregrasp_z_offset").value),
                "bottle_pour_pivot": float(self.get_parameter("cola_bottle_pour_pivot_z_offset").value),
            },
            "cup": {
                "cup_side_grasp": float(self.get_parameter("cup_side_grasp_z_offset").value),
                "cup_fill_target": float(self.get_parameter("cup_fill_target_z_offset").value),
            },
        }

        self._publisher = self.create_publisher(GraspTarget, output_topic, 10)
        self.create_subscription(SceneObjectArray, input_topic, self._handle_scene, 10)
        self.get_logger().info(f"grasp_pose_generator 已启动，输入: {input_topic}，输出: {output_topic}")

    def _handle_scene(self, message: SceneObjectArray) -> None:
        for scene_object in message.objects:
            if self._require_world_objects and scene_object.pose.header.frame_id != self._world_frame:
                self.get_logger().warn(
                    f"{scene_object.id} 不是 {self._world_frame} pose，跳过 grasp target 生成",
                    throttle_duration_sec=2.0,
                )
                continue
            self._publisher.publish(self._build_target(scene_object))

    def _build_target(self, scene_object) -> GraspTarget:
        target = GraspTarget()
        target.object_id = scene_object.id
        target.arm_mode = self._select_arm_mode(scene_object.semantic_type)
        target.partner_arm_mode = self._partner_arm_mode(scene_object.semantic_type, target.arm_mode)
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
                target.grasp = self._pose_with_semantic_offset(scene_object.semantic_type, subframe.name, subframe.pose)
            if scene_object.semantic_type.endswith("bottle") and subframe.name == "bottle_cap_pregrasp":
                target.pregrasp = self._pose_with_semantic_offset(scene_object.semantic_type, subframe.name, subframe.pose)
                target.target_type = "cap_pregrasp"
                target.strategy_id = self._cap_strategy_id_for(scene_object.semantic_type)
            if scene_object.semantic_type.endswith("bottle") and subframe.name == "bottle_cap_center":
                target.operate = self._pose_with_semantic_offset(scene_object.semantic_type, subframe.name, subframe.pose)
                target.target_type = "cap_operate"
                target.strategy_id = self._cap_strategy_id_for(scene_object.semantic_type)
                target.guarded_motion = True
            if scene_object.semantic_type.endswith("bottle") and subframe.name == "bottle_mouth":
                target.operate = self._pose_with_semantic_offset(scene_object.semantic_type, "bottle_cap_center", subframe.pose)
                target.target_type = "operate"
                target.guarded_motion = True
            if scene_object.semantic_type.endswith("bottle") and subframe.name == "bottle_pour_pivot":
                target.place = self._pose_with_semantic_offset(scene_object.semantic_type, subframe.name, subframe.pose)
            if scene_object.semantic_type.startswith("cup") and subframe.name == "cup_fill_target":
                target.operate = self._pose_with_semantic_offset("cup", subframe.name, subframe.pose)
                target.target_type = "prepour"
            if scene_object.semantic_type.startswith("cup") and subframe.name == "cup_side_grasp":
                target.grasp = self._pose_with_semantic_offset("cup", subframe.name, subframe.pose)
                target.strategy_id = self._strategy_defaults["cup"]["body_strategy_id"]
            if scene_object.semantic_type == "basket" and subframe.name == "basket_release_center":
                target.release = deepcopy(subframe.pose)
                target.target_type = "release"
                target.guarded_motion = True

        return target

    def _select_arm_mode(self, semantic_type: str) -> str:
        if semantic_type in ("basketball", "soccer_ball"):
            return "dual_arm"
        if semantic_type == "water_bottle":
            return str(self._role_policy.get("water_bottle", {}).get("bottle_arm", "right_arm"))
        if semantic_type == "cola_bottle":
            return str(self._role_policy.get("cola_bottle", {}).get("bottle_arm", "right_arm"))
        if semantic_type.startswith("cup"):
            return str(self._role_policy.get("water_bottle", {}).get("cup_arm", "left_arm"))
        return "left_arm"

    def _partner_arm_mode(self, semantic_type: str, arm_mode: str) -> str:
        if arm_mode == "dual_arm":
            return "right_arm"
        if semantic_type == "water_bottle":
            return str(self._role_policy.get("water_bottle", {}).get("cup_arm", "left_arm" if arm_mode == "right_arm" else "right_arm"))
        if semantic_type == "cola_bottle":
            return str(self._role_policy.get("cola_bottle", {}).get("cup_arm", "left_arm" if arm_mode == "right_arm" else "right_arm"))
        return "right_arm" if arm_mode == "left_arm" else "left_arm"

    def _strategy_id_for(self, semantic_type: str) -> str:
        if semantic_type in ("basketball", "soccer_ball"):
            return "ball_dual_contact_pair"
        if semantic_type == "basket":
            return "basket_release"
        if semantic_type == "water_bottle":
            return self._strategy_defaults["water_bottle"]["body_strategy_id"]
        if semantic_type == "cola_bottle":
            return self._strategy_defaults["cola_bottle"]["body_strategy_id"]
        if semantic_type.startswith("cup"):
            return self._strategy_defaults["cup"]["body_strategy_id"]
        return "default_grasp"

    def _gripper_profile_for(self, semantic_type: str) -> str:
        if semantic_type in ("basketball", "soccer_ball"):
            return "ball_dual_hold"
        if semantic_type == "water_bottle":
            return self._strategy_defaults["water_bottle"]["gripper_profile"]
        if semantic_type == "cola_bottle":
            return self._strategy_defaults["cola_bottle"]["gripper_profile"]
        if semantic_type.startswith("cup"):
            return self._strategy_defaults["cup"]["gripper_profile"]
        return "default_hold"

    def _cap_strategy_id_for(self, semantic_type: str) -> str:
        if semantic_type == "water_bottle":
            return self._strategy_defaults["water_bottle"]["cap_strategy_id"]
        if semantic_type == "cola_bottle":
            return self._strategy_defaults["cola_bottle"]["cap_strategy_id"]
        return "bottle_cap_grasp"

    def _execution_profile_for(self, semantic_type: str) -> str:
        if semantic_type in ("basketball", "soccer_ball"):
            return "dual_arm_transport"
        if semantic_type == "basket":
            return "basket_release_lift_and_open"
        if semantic_type == "water_bottle":
            return self._strategy_defaults["water_bottle"]["execution_profile"]
        if semantic_type == "cola_bottle":
            return self._strategy_defaults["cola_bottle"]["execution_profile"]
        if semantic_type.startswith("cup"):
            return self._strategy_defaults["cup"]["execution_profile"]
        return "default_transport"

    def _pose_with_semantic_offset(self, semantic_type: str, subframe_name: str, pose: PoseStamped) -> PoseStamped:
        adjusted = deepcopy(pose)
        if semantic_type.startswith("cup"):
            offsets = self._subframe_z_offsets["cup"]
        else:
            offsets = self._subframe_z_offsets.get(semantic_type, {})
        adjusted.pose.position.z += offsets.get(subframe_name, 0.0)
        return adjusted


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
