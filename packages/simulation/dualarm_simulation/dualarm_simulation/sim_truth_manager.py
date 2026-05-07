#!/usr/bin/python3

from __future__ import annotations

from copy import deepcopy
import json
from typing import Dict, Optional

from gazebo_msgs.msg import ModelStates
from geometry_msgs.msg import PoseStamped
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

from dualarm_interfaces.msg import SceneObject, SceneObjectArray, Subframe

from .config import load_config


class SimTruthManager(Node):
    def __init__(self) -> None:
        super().__init__("sim_truth_manager")
        self.declare_parameter("config_file", "")
        self.declare_parameter("output_topic", "/perception/sim_scene_objects")
        self.declare_parameter("managed_scene_topic", "/scene_fusion/scene_objects")
        self.declare_parameter("truth_command_topic", "/simulation/truth_command")
        self.declare_parameter("use_gazebo_model_states", True)
        self.declare_parameter("gazebo_model_states_topic", "/gazebo/model_states")
        self.declare_parameter("publish_rate_hz", 10.0)
        self._config = load_config(str(self.get_parameter("config_file").value))
        sim_config = self._config.get("sim", {})
        self._frame_id = str(self._config.get("frame_id", "world"))
        self._objects: Dict[str, SceneObject] = {}
        self._gazebo_model_to_object: Dict[str, str] = {}
        self._scene_version = 0
        self._load_objects()
        self._publisher = self.create_publisher(SceneObjectArray, str(self.get_parameter("output_topic").value), 10)
        self.create_subscription(
            SceneObjectArray,
            str(self.get_parameter("managed_scene_topic").value),
            self._handle_managed_scene,
            10,
        )
        self.create_subscription(String, str(self.get_parameter("truth_command_topic").value), self._handle_truth_command, 10)
        use_gazebo_model_states = self._as_bool(
            self.get_parameter("use_gazebo_model_states").value,
        ) and bool(sim_config.get("use_gazebo_model_states", True))
        if use_gazebo_model_states:
            self.create_subscription(
                ModelStates,
                str(self.get_parameter("gazebo_model_states_topic").value or sim_config.get("gazebo_model_states_topic", "/gazebo/model_states")),
                self._handle_gazebo_model_states,
                10,
            )
        rate = float(self.get_parameter("publish_rate_hz").value)
        self.create_timer(1.0 / max(rate, 1.0), self._publish_scene)
        self.get_logger().info(f"sim_truth_manager 已启动，对象数={len(self._objects)}")

    def _load_objects(self) -> None:
        for object_id, spec in (self._config.get("objects") or {}).items():
            scene_object = SceneObject()
            scene_object.id = str(object_id)
            scene_object.semantic_type = str(spec.get("semantic_type", object_id))
            scene_object.pose = self._pose_from_list(spec.get("pose", [0, 0, 0, 0, 0, 0, 1]))
            size = spec.get("size_m", [0.05, 0.05, 0.05])
            scene_object.size.x = float(size[0])
            scene_object.size.y = float(size[1])
            scene_object.size.z = float(size[2])
            scene_object.confidence = float(spec.get("confidence", 0.9))
            scene_object.graspable = scene_object.semantic_type != "table_surface"
            scene_object.movable = scene_object.semantic_type not in {"table_surface", "basket"}
            scene_object.source = "sim_truth"
            scene_object.source_views = ["sim_truth"]
            scene_object.shape_type = str(spec.get("shape_type", self._shape_for(scene_object.semantic_type)))
            scene_object.pose_source = "sim_truth"
            scene_object.quality_score = scene_object.confidence
            scene_object.lifecycle_state = "observed"
            scene_object.reserved_by = "none"
            scene_object.attached_link = ""
            scene_object.pose_covariance_diagonal = [0.0001, 0.0001, 0.0001, 0.01, 0.01, 0.01]
            scene_object.subframes = self._subframes_for(scene_object)
            self._objects[scene_object.id] = scene_object
            self._gazebo_model_to_object[str(spec.get("gazebo_model_name", object_id))] = scene_object.id

    def _shape_for(self, semantic_type: str) -> str:
        if semantic_type in {"water_bottle", "cola_bottle", "cup"}:
            return "cylinder"
        if semantic_type in {"basketball", "soccer_ball"}:
            return "sphere"
        return "box"

    def _pose_from_list(self, values) -> PoseStamped:
        pose = PoseStamped()
        pose.header.frame_id = self._frame_id
        pose.pose.position.x = float(values[0])
        pose.pose.position.y = float(values[1])
        pose.pose.position.z = float(values[2])
        pose.pose.orientation.x = float(values[3])
        pose.pose.orientation.y = float(values[4])
        pose.pose.orientation.z = float(values[5])
        pose.pose.orientation.w = float(values[6])
        return pose

    def _subframes_for(self, scene_object: SceneObject):
        subframes = []
        if scene_object.semantic_type in {"water_bottle", "cola_bottle"}:
            subframes.extend(
                [
                    self._subframe(scene_object, "bottle_body_grasp", 0.0, 0.0, scene_object.size.z * 0.45 - scene_object.pose.pose.position.z),
                    self._subframe(scene_object, "bottle_cap_pregrasp", 0.0, 0.0, scene_object.size.z * 0.65),
                    self._subframe(scene_object, "bottle_cap_center", 0.0, 0.0, scene_object.size.z * 0.50),
                    self._subframe(scene_object, "bottle_mouth", 0.0, 0.0, scene_object.size.z * 0.55),
                    self._subframe(scene_object, "bottle_pour_pivot", 0.0, 0.0, scene_object.size.z * 0.50),
                ]
            )
        elif scene_object.semantic_type == "cup":
            subframes.extend(
                [
                    self._subframe(scene_object, "cup_side_grasp", 0.0, 0.0, scene_object.size.z * 0.05),
                    self._subframe(scene_object, "cup_fill_target", 0.0, 0.0, scene_object.size.z * 0.50),
                ]
            )
        elif scene_object.semantic_type == "basket":
            subframes.append(self._subframe(scene_object, "basket_release_center", 0.0, 0.0, scene_object.size.z * 0.5))
        return subframes

    def _subframe(self, scene_object: SceneObject, name: str, dx: float, dy: float, dz: float) -> Subframe:
        sub = Subframe()
        sub.name = name
        sub.pose = deepcopy(scene_object.pose)
        sub.pose.pose.position.x += float(dx)
        sub.pose.pose.position.y += float(dy)
        sub.pose.pose.position.z += float(dz)
        return sub

    def _handle_managed_scene(self, message: SceneObjectArray) -> None:
        for managed in message.objects:
            internal = self._resolve_internal_object(managed.id, managed.semantic_type)
            if internal is None:
                continue
            if managed.lifecycle_state in {"attached", "held_dual_contact", "opened_split_active"}:
                internal.lifecycle_state = managed.lifecycle_state
                internal.attached_link = managed.attached_link
                internal.reserved_by = managed.reserved_by
            elif managed.lifecycle_state == "stable":
                internal.lifecycle_state = "observed"
                internal.attached_link = ""
                internal.reserved_by = "none"

    def _handle_truth_command(self, message: String) -> None:
        try:
            command = json.loads(message.data)
        except json.JSONDecodeError:
            self.get_logger().warn(f"忽略非法 truth command: {message.data}")
            return
        object_id = str(command.get("object_id", ""))
        internal = self._resolve_internal_object(object_id, str(command.get("semantic_type", "")))
        if internal is None:
            self.get_logger().warn(f"truth command 找不到对象: {object_id}")
            return
        pose = command.get("pose")
        if isinstance(pose, list) and len(pose) >= 7:
            internal.pose = self._pose_from_list(pose[:7])
        internal.lifecycle_state = str(command.get("lifecycle_state", "observed"))
        internal.attached_link = str(command.get("attached_link", ""))
        internal.reserved_by = str(command.get("reserved_by", "none"))
        internal.subframes = self._subframes_for(internal)

    def _handle_gazebo_model_states(self, message: ModelStates) -> None:
        for index, model_name in enumerate(message.name):
            object_id = self._gazebo_model_to_object.get(str(model_name))
            if object_id is None or index >= len(message.pose):
                continue
            internal = self._objects.get(object_id)
            if internal is None:
                continue
            internal.pose = PoseStamped()
            internal.pose.header.frame_id = self._frame_id
            internal.pose.header.stamp = self.get_clock().now().to_msg()
            internal.pose.pose = deepcopy(message.pose[index])
            internal.source = "gazebo_model_states"
            internal.source_views = ["gazebo_model_states"]
            internal.pose_source = "gazebo_model_states"
            internal.last_seen = internal.pose.header.stamp
            internal.subframes = self._subframes_for(internal)

    def _resolve_internal_object(self, object_id: str, semantic_type: str = "") -> Optional[SceneObject]:
        if object_id in self._objects:
            return self._objects[object_id]
        for internal_id, scene_object in self._objects.items():
            if object_id.startswith(internal_id) or (semantic_type and scene_object.semantic_type == semantic_type):
                return scene_object
        return None

    def _publish_scene(self) -> None:
        self._scene_version += 1
        scene = SceneObjectArray()
        scene.header.frame_id = self._frame_id
        scene.header.stamp = self.get_clock().now().to_msg()
        scene.scene_version = self._scene_version
        for scene_object in self._objects.values():
            item = deepcopy(scene_object)
            item.pose.header.stamp = scene.header.stamp
            item.last_seen = scene.header.stamp
            item.scene_version = self._scene_version
            item.lifecycle_state = "observed" if item.lifecycle_state in {"", "stable"} else item.lifecycle_state
            scene.objects.append(item)
        self._publisher.publish(scene)

    @staticmethod
    def _as_bool(value) -> bool:
        if isinstance(value, bool):
            return value
        return str(value).strip().lower() in {"1", "true", "yes", "on"}


def main() -> None:
    rclpy.init()
    node = SimTruthManager()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    main()
