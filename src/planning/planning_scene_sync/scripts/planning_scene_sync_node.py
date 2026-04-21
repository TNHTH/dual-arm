#!/usr/bin/python3

from __future__ import annotations

from copy import deepcopy
from dataclasses import dataclass
import threading
import time
from typing import Dict, Iterable, List, Optional, Tuple

import rclpy
from geometry_msgs.msg import Pose
from moveit_msgs.msg import AttachedCollisionObject, CollisionObject, PlanningScene, PlanningSceneComponents
from moveit_msgs.srv import ApplyPlanningScene, GetPlanningScene
from rclpy.callback_groups import ReentrantCallbackGroup
from rclpy.executors import MultiThreadedExecutor
from rclpy.node import Node
from shape_msgs.msg import SolidPrimitive

from dualarm_interfaces.msg import SceneObject, SceneObjectArray
from dualarm_interfaces.srv import AttachObject, DetachObject, ReleaseObject, ReserveObject, SetObjectInteraction


@dataclass(frozen=True)
class CollisionEntry:
    collision_id: str
    primitives: Tuple[SolidPrimitive, ...]
    poses: Tuple[Pose, ...]
    frame_id: str
    attached_link: str = ""
    touch_links: Tuple[str, ...] = ()


@dataclass
class InteractionState:
    mode: str = "free"
    owner: str = ""
    primary_link: str = ""
    secondary_link: str = ""
    enabled: bool = False


class PlanningSceneSyncNode(Node):
    def __init__(self) -> None:
        super().__init__("planning_scene_sync")
        self.declare_parameter("input_topic", "/scene_fusion/raw_scene_objects")
        self.declare_parameter("output_topic", "/scene_fusion/scene_objects")
        self.declare_parameter("world_frame", "world")
        self.declare_parameter("object_retention_timeout", 1.0)
        input_topic = self.get_parameter("input_topic").value
        output_topic = self.get_parameter("output_topic").value
        self._world_frame = str(self.get_parameter("world_frame").value)
        self._object_retention_timeout = float(self.get_parameter("object_retention_timeout").value)

        self._raw_scene = SceneObjectArray()
        self._managed_scene_version = 0
        self._reservations: Dict[str, str] = {}
        self._attached_links: Dict[str, str] = {}
        self._interaction_states: Dict[str, InteractionState] = {}
        self._opened_objects: set[str] = set()
        self._object_cache: Dict[str, SceneObject] = {}
        self._object_last_seen_monotonic: Dict[str, float] = {}
        self._last_world_ids: set[str] = set()
        self._last_attached_ids: set[str] = set()
        self._world_snapshots: Dict[str, Tuple] = {}
        self._attached_snapshots: Dict[str, Tuple] = {}
        self._pending_apply_future = None
        self._reconcile_needed = False
        self._scene_callback_group = ReentrantCallbackGroup()
        self._sync_lock = threading.RLock()

        self._publisher = self.create_publisher(SceneObjectArray, output_topic, 10)
        self._apply_scene_client = self.create_client(
            ApplyPlanningScene,
            "/apply_planning_scene",
            callback_group=self._scene_callback_group,
        )
        self._get_scene_client = self.create_client(
            GetPlanningScene,
            "/get_planning_scene",
            callback_group=self._scene_callback_group,
        )
        self.create_subscription(
            SceneObjectArray,
            input_topic,
            self._handle_scene,
            10,
            callback_group=self._scene_callback_group,
        )
        self.create_service(
            ReserveObject,
            "/scene/reserve_object",
            self._handle_reserve,
            callback_group=self._scene_callback_group,
        )
        self.create_service(
            ReleaseObject,
            "/scene/release_object",
            self._handle_release,
            callback_group=self._scene_callback_group,
        )
        self.create_service(
            AttachObject,
            "/scene/attach_object",
            self._handle_attach,
            callback_group=self._scene_callback_group,
        )
        self.create_service(
            DetachObject,
            "/scene/detach_object",
            self._handle_detach,
            callback_group=self._scene_callback_group,
        )
        self.create_service(
            SetObjectInteraction,
            "/scene/set_object_interaction",
            self._handle_set_interaction,
            callback_group=self._scene_callback_group,
        )
        self.get_logger().info(f"planning_scene_sync 已启动，输入: {input_topic}，输出: {output_topic}")

    def _handle_scene(self, message: SceneObjectArray) -> None:
        self._raw_scene = message
        now_monotonic = time.monotonic()
        for scene_object in message.objects:
            self._object_cache[scene_object.id] = deepcopy(scene_object)
            self._object_last_seen_monotonic[scene_object.id] = now_monotonic
        self._publish_and_sync(wait_for_result=False)

    def _handle_reserve(self, request: ReserveObject.Request, response: ReserveObject.Response):
        if not self._has_live_object(request.object_id):
            response.success = False
            response.message = f"{request.object_id} 尚未进入 managed scene，不能 reservation"
            return response
        apply_ok = self._run_transaction(
            lambda: self._reservations.__setitem__(request.object_id, request.reserved_by)
        )
        response.success = bool(apply_ok)
        response.message = f"{request.object_id} 已保留给 {request.reserved_by}" if response.success else f"{request.object_id} reservation 同步 MoveIt 失败"
        return response

    def _handle_release(self, request: ReleaseObject.Request, response: ReleaseObject.Response):
        if request.object_id not in self._reservations:
            response.success = False
            response.message = f"{request.object_id} 不存在 reservation，不能 release"
            return response
        apply_ok = self._run_transaction(
            lambda: self._reservations.pop(request.object_id, None)
        )
        response.success = bool(apply_ok)
        response.message = f"{request.object_id} 已释放 reservation" if response.success else f"{request.object_id} release 同步 MoveIt 失败"
        return response

    def _handle_attach(self, request: AttachObject.Request, response: AttachObject.Response):
        if not self._has_live_object(request.object_id):
            response.success = False
            response.message = f"{request.object_id} 尚未进入 managed scene，不能 attach"
            return response
        if not self._ensure_world_object(request.object_id):
            response.success = False
            response.message = f"{request.object_id} attach 前置 world object 同步失败"
            return response
        apply_ok = self._run_transaction(
            lambda: self._attached_links.__setitem__(request.object_id, request.link_name)
        )
        response.success = bool(apply_ok)
        response.message = f"{request.object_id} 已 attach 到 {request.link_name}" if response.success else f"{request.object_id} attach 同步 MoveIt 失败"
        return response

    def _handle_detach(self, request: DetachObject.Request, response: DetachObject.Response):
        if request.object_id not in self._attached_links:
            response.success = False
            response.message = f"{request.object_id} 不存在 attached 状态，不能 detach"
            return response
        apply_ok = self._run_transaction(
            lambda: self._attached_links.pop(request.object_id, None)
        )
        response.success = bool(apply_ok)
        response.message = f"{request.object_id} 已 detach" if response.success else f"{request.object_id} detach 同步 MoveIt 失败"
        return response

    def _handle_set_interaction(self, request: SetObjectInteraction.Request, response: SetObjectInteraction.Response):
        object_id = request.object_id.strip()
        mode = request.interaction_mode.strip()
        if not object_id:
            response.success = False
            response.message = "object_id 不能为空"
            return response
        if mode not in ("free", "attached_single", "dual_contact", "opened_split"):
            response.success = False
            response.message = f"未知 interaction_mode={mode}"
            return response
        if not self._has_live_object(object_id):
            response.success = False
            response.message = f"{object_id} 尚未进入 managed scene，不能设置 interaction"
            return response

        def mutator():
            if mode == "free":
                self._interaction_states.pop(object_id, None)
                self._attached_links.pop(object_id, None)
                return

            current = self._interaction_states.get(object_id, InteractionState())
            next_state = InteractionState(
                mode=mode,
                owner=request.owner.strip(),
                primary_link=request.primary_link.strip(),
                secondary_link=request.secondary_link.strip(),
                enabled=bool(request.enable),
            )
            if mode == "attached_single":
                if request.enable and next_state.primary_link:
                    self._attached_links[object_id] = next_state.primary_link
                else:
                    self._attached_links.pop(object_id, None)
            else:
                self._attached_links.pop(object_id, None)

            if mode == "opened_split" and request.enable:
                self._opened_objects.add(object_id)
            if mode == "opened_split" and not request.enable:
                self._opened_objects.add(object_id)

            self._interaction_states[object_id] = next_state
            if current.mode == "opened_split" and mode != "opened_split":
                self._opened_objects.add(object_id)

        apply_ok = self._run_transaction(mutator)
        response.success = bool(apply_ok)
        response.message = (
            f"{object_id} interaction 已切到 {mode}"
            if response.success
            else f"{object_id} interaction={mode} 同步 MoveIt 失败"
        )
        return response

    def _publish_and_sync(self, wait_for_result: bool) -> bool:
        with self._sync_lock:
            managed = self._build_managed_scene()
            sync_ok = self._sync_planning_scene(managed, wait_for_result)
            if sync_ok or wait_for_result:
                self._publisher.publish(managed)
            return sync_ok

    def _has_live_object(self, object_id: str) -> bool:
        if object_id not in self._object_cache:
            return False
        last_seen = self._object_last_seen_monotonic.get(object_id)
        if last_seen is None:
            return False
        return (time.monotonic() - last_seen) <= self._object_retention_timeout

    def _run_transaction(self, mutator) -> bool:
        with self._sync_lock:
            previous_reservations = dict(self._reservations)
            previous_attached_links = dict(self._attached_links)
            mutator()
            managed = self._build_managed_scene()
            sync_ok = self._sync_planning_scene(managed, wait_for_result=True)
            if sync_ok:
                self._publisher.publish(managed)
                return True
            self._reservations = previous_reservations
            self._attached_links = previous_attached_links
            rollback = self._build_managed_scene()
            self._publisher.publish(rollback)
            return False

    def _build_managed_scene(self) -> SceneObjectArray:
        self._managed_scene_version += 1

        managed = SceneObjectArray()
        managed.header = deepcopy(self._raw_scene.header)
        if not managed.header.frame_id:
            managed.header.frame_id = self._world_frame
        managed.header.stamp = self.get_clock().now().to_msg()
        managed.scene_version = self._managed_scene_version

        raw_ids = {scene_object.id for scene_object in self._raw_scene.objects}
        now_monotonic = time.monotonic()
        fresh_cached_ids = {
            object_id
            for object_id, last_seen in self._object_last_seen_monotonic.items()
            if now_monotonic - last_seen <= self._object_retention_timeout
        }
        include_ids = (
            set(raw_ids)
            | fresh_cached_ids
            | set(self._attached_links.keys())
            | set(self._reservations.keys())
            | set(self._interaction_states.keys())
        )

        for object_id in sorted(include_ids):
            cached = self._object_cache.get(object_id)
            if cached is None:
                continue
            scene_object = deepcopy(cached)
            recently_seen = object_id in raw_ids or object_id in fresh_cached_ids
            scene_object.scene_version = self._managed_scene_version
            if object_id in self._reservations:
                scene_object.reserved_by = self._reservations[object_id]
                if not recently_seen:
                    scene_object.lifecycle_state = "lost_but_reserved"
                elif scene_object.lifecycle_state in ("stable", "observed"):
                    scene_object.lifecycle_state = "reserved"
            else:
                scene_object.reserved_by = "none"
            interaction = self._interaction_states.get(object_id)
            if interaction and interaction.mode == "dual_contact" and interaction.enabled:
                scene_object.attached_link = ""
                scene_object.lifecycle_state = "held_dual_contact"
                if interaction.owner:
                    scene_object.reserved_by = interaction.owner
            elif interaction and interaction.mode == "opened_split":
                scene_object.attached_link = interaction.primary_link
                scene_object.lifecycle_state = "opened_split_active" if interaction.enabled else "opened_split"
                if interaction.owner:
                    scene_object.reserved_by = interaction.owner
            elif object_id in self._attached_links:
                scene_object.attached_link = self._attached_links[object_id]
                scene_object.lifecycle_state = "attached" if recently_seen else "lost_but_attached"
            else:
                scene_object.attached_link = ""
            managed.objects.append(scene_object)

        return managed

    def _sync_planning_scene(self, managed: SceneObjectArray, wait_for_result: bool) -> bool:
        if not self._wait_for_pending_apply(timeout=5.0):
            return False

        desired_world: Dict[str, CollisionEntry] = {}
        desired_attached: Dict[str, CollisionEntry] = {}
        for scene_object in managed.objects:
            if not self._is_collision_managed_object(scene_object):
                continue
            world_entries, attached_entries = self._collision_entries_for_object(scene_object)
            desired_world.update({entry.collision_id: entry for entry in world_entries})
            desired_attached.update({entry.collision_id: entry for entry in attached_entries})

        request = ApplyPlanningScene.Request()
        request.scene = PlanningScene()
        request.scene.is_diff = True
        request.scene.robot_state.is_diff = True

        world_frame = managed.header.frame_id or self._world_frame

        removing_world_ids = self._last_world_ids - set(desired_world.keys())
        for object_id in sorted(removing_world_ids):
            request.scene.world.collision_objects.append(self._make_remove_collision_object(object_id, world_frame))

        new_world_snapshots: Dict[str, Tuple] = {}
        new_attached_snapshots: Dict[str, Tuple] = {}

        for object_id, collision_entry in desired_world.items():
            snapshot = self._collision_snapshot(collision_entry)
            new_world_snapshots[object_id] = snapshot
            if self._world_snapshots.get(object_id) != snapshot or object_id not in self._last_world_ids:
                request.scene.world.collision_objects.append(self._make_add_collision_object(collision_entry))

        for object_id in sorted(self._last_attached_ids - set(desired_attached.keys())):
            request.scene.robot_state.attached_collision_objects.append(
                self._make_remove_attached_object(object_id)
            )

        for object_id, collision_entry in desired_attached.items():
            snapshot = self._collision_snapshot(collision_entry)
            new_attached_snapshots[object_id] = snapshot
            if self._attached_snapshots.get(object_id) != snapshot or object_id not in self._last_attached_ids:
                request.scene.robot_state.attached_collision_objects.append(
                    self._make_add_attached_object(collision_entry)
                )

        if not request.scene.world.collision_objects and not request.scene.robot_state.attached_collision_objects:
            self._last_world_ids = set(desired_world.keys())
            self._last_attached_ids = set(desired_attached.keys())
            self._world_snapshots = new_world_snapshots
            self._attached_snapshots = new_attached_snapshots
            return True

        service_wait = 3.0 if wait_for_result else 0.2
        if not self._apply_scene_client.wait_for_service(timeout_sec=service_wait):
            self.get_logger().warn("apply_planning_scene 服务不可用，暂不推送 MoveIt world model")
            return False

        self._log_diff_summary(request.scene)
        if not self._call_apply_scene_blocking(request, timeout=5.0 if wait_for_result else 0.5):
            return False

        self._last_world_ids = set(desired_world.keys())
        self._last_attached_ids = set(desired_attached.keys())
        self._world_snapshots = new_world_snapshots
        self._attached_snapshots = new_attached_snapshots
        return True

    def _ensure_world_object(self, object_id: str) -> bool:
        with self._sync_lock:
            scene_object = self._object_cache.get(object_id)
            if scene_object is None:
                return False
            world_entries, attached_entries = self._collision_entries_for_object(scene_object)
            if attached_entries:
                self.get_logger().warn(f"{object_id} 当前不是 free world object，不能用于 _ensure_world_object")
                return False
            if not world_entries:
                return False
            if not self._wait_for_pending_apply(timeout=5.0):
                return False

            request = ApplyPlanningScene.Request()
            request.scene = PlanningScene()
            request.scene.is_diff = True
            for entry in world_entries:
                request.scene.world.collision_objects.append(self._make_add_collision_object(entry))
            self._log_diff_summary(request.scene)
            if not self._call_apply_scene_blocking(request, timeout=5.0):
                return False
            if not self._wait_for_world_object(object_id, timeout=1.0):
                self.get_logger().warn(f"{object_id} 已 apply ADD，但 GetPlanningScene 暂未确认 world object 可见")
                return False

            for entry in world_entries:
                self._last_world_ids.add(entry.collision_id)
                self._world_snapshots[entry.collision_id] = self._collision_snapshot(entry)
            return True

    def _wait_for_world_object(self, object_id: str, timeout: float) -> bool:
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            if self._query_world_object_exists(object_id, timeout=0.2):
                return True
            time.sleep(0.05)
        return False

    def _query_world_object_exists(self, object_id: str, timeout: float) -> bool:
        if not self._get_scene_client.wait_for_service(timeout_sec=timeout):
            return False
        request = GetPlanningScene.Request()
        request.components.components = (
            PlanningSceneComponents.WORLD_OBJECT_NAMES
            | PlanningSceneComponents.WORLD_OBJECT_GEOMETRY
        )
        future = self._get_scene_client.call_async(request)
        query_event = threading.Event()
        future.add_done_callback(lambda _: query_event.set())
        query_event.wait(timeout=timeout)
        if not future.done():
            return False
        try:
            result = future.result()
        except Exception:  # pylint: disable=broad-except
            return False
        return any(obj.id == object_id for obj in result.scene.world.collision_objects)

    def _wait_for_pending_apply(self, timeout: float) -> bool:
        pending = self._pending_apply_future
        if pending is None:
            return True
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline and not pending.done():
            time.sleep(0.02)
        if not pending.done():
            self.get_logger().warn("等待上一轮 apply_planning_scene 完成超时")
            return False
        self._pending_apply_future = None
        if self._reconcile_needed:
            self._reconcile_from_moveit()
            self._reconcile_needed = False
        return True

    def _call_apply_scene_blocking(self, request: ApplyPlanningScene.Request, timeout: float) -> bool:
        if not self._apply_scene_client.wait_for_service(timeout_sec=timeout):
            self.get_logger().warn("apply_planning_scene 服务不可用，暂不推送 MoveIt world model")
            return False
        future = self._apply_scene_client.call_async(request)
        self._pending_apply_future = future
        apply_event = threading.Event()
        future.add_done_callback(lambda _: apply_event.set())
        apply_event.wait(timeout=timeout)
        if not future.done():
            self.get_logger().warn("同步等待 apply_planning_scene 结果超时")
            self._reconcile_needed = True
            return False
        self._pending_apply_future = None
        try:
            result = future.result()
        except Exception as exc:  # pylint: disable=broad-except
            self.get_logger().warn(f"同步等待 apply_planning_scene 结果时发生异常: {exc}")
            return False
        if result is None or not result.success:
            self.get_logger().warn("apply_planning_scene 调用失败，本轮 world model 未确认写入")
            return False
        return True

    def _reconcile_from_moveit(self) -> None:
        if not self._get_scene_client.wait_for_service(timeout_sec=0.5):
            return
        request = GetPlanningScene.Request()
        request.components.components = (
            PlanningSceneComponents.WORLD_OBJECT_NAMES
            | PlanningSceneComponents.WORLD_OBJECT_GEOMETRY
            | PlanningSceneComponents.ROBOT_STATE_ATTACHED_OBJECTS
        )
        future = self._get_scene_client.call_async(request)
        event = threading.Event()
        future.add_done_callback(lambda _: event.set())
        event.wait(timeout=0.5)
        if not future.done():
            return
        try:
            result = future.result()
        except Exception:  # pylint: disable=broad-except
            return
        world_ids = {obj.id for obj in result.scene.world.collision_objects}
        attached_ids = {obj.object.id for obj in result.scene.robot_state.attached_collision_objects}
        self._last_world_ids = world_ids
        self._last_attached_ids = attached_ids
        self._world_snapshots = {
            object_id: self._scene_snapshot(self._object_cache[object_id])
            for object_id in world_ids
            if object_id in self._object_cache
        }
        self._attached_snapshots = {
            object_id: self._scene_snapshot(self._object_cache[object_id])
            for object_id in attached_ids
            if object_id in self._object_cache
        }

    def _make_add_attached_object(self, collision_entry: CollisionEntry) -> AttachedCollisionObject:
        attached = AttachedCollisionObject()
        attached.link_name = collision_entry.attached_link
        attached.object = self._make_add_collision_object(collision_entry)
        attached.object.operation = CollisionObject.ADD
        if collision_entry.touch_links:
            attached.touch_links = list(collision_entry.touch_links)
        elif collision_entry.attached_link:
            attached.touch_links = [collision_entry.attached_link]
        return attached

    def _make_remove_attached_object(self, object_id: str) -> AttachedCollisionObject:
        attached = AttachedCollisionObject()
        attached.object.id = object_id
        attached.object.operation = CollisionObject.REMOVE
        return attached

    def _make_add_collision_object(self, collision_entry: CollisionEntry) -> CollisionObject:
        collision_object = CollisionObject()
        collision_object.id = collision_entry.collision_id
        collision_object.header.frame_id = collision_entry.frame_id
        collision_object.primitives.extend(collision_entry.primitives)
        collision_object.primitive_poses.extend(collision_entry.poses)
        collision_object.operation = CollisionObject.ADD
        return collision_object

    def _make_remove_collision_object(self, object_id: str, frame_id: str) -> CollisionObject:
        collision_object = CollisionObject()
        collision_object.id = object_id
        collision_object.header.frame_id = frame_id
        collision_object.operation = CollisionObject.REMOVE
        return collision_object

    def _is_collision_managed_object(self, scene_object: SceneObject) -> bool:
        if not scene_object.semantic_type:
            return False
        return scene_object.semantic_type in {
            "table_surface",
            "water_bottle",
            "cola_bottle",
            "cup",
            "basketball",
            "soccer_ball",
            "basket",
        }

    def _log_diff_summary(self, scene: PlanningScene) -> None:
        world_add = [obj.id for obj in scene.world.collision_objects if obj.operation == CollisionObject.ADD]
        world_remove = [obj.id for obj in scene.world.collision_objects if obj.operation == CollisionObject.REMOVE]
        attached_add = [
            attached.object.id
            for attached in scene.robot_state.attached_collision_objects
            if attached.object.operation == CollisionObject.ADD
        ]
        attached_remove = [
            attached.object.id
            for attached in scene.robot_state.attached_collision_objects
            if attached.object.operation == CollisionObject.REMOVE
        ]
        self.get_logger().info(
            "apply_planning_scene diff: "
            f"world_add={world_add}, world_remove={world_remove}, "
            f"attached_add={attached_add}, attached_remove={attached_remove}"
        )

    def _scene_object_to_collision(self, scene_object: SceneObject, include_cap: bool = True) -> Tuple[Tuple[SolidPrimitive, ...], Tuple[Pose, ...]]:
        if scene_object.semantic_type in ("water_bottle", "cola_bottle"):
            return self._make_bottle_collision(scene_object, include_cap=include_cap)

        primitive = SolidPrimitive()
        pose = Pose()
        pose.position = scene_object.pose.pose.position
        pose.orientation = scene_object.pose.pose.orientation

        size_x = max(float(scene_object.size.x), 0.01)
        size_y = max(float(scene_object.size.y), 0.01)
        size_z = max(float(scene_object.size.z), 0.01)
        radius = max(size_x, size_y) / 2.0

        if scene_object.semantic_type == "table_surface":
            primitive.type = SolidPrimitive.BOX
            primitive.dimensions = [size_x, size_y, size_z]
        elif scene_object.semantic_type in ("basketball", "soccer_ball"):
            primitive.type = SolidPrimitive.SPHERE
            primitive.dimensions = [max(size_x, size_y, size_z) / 2.0]
        elif scene_object.semantic_type == "basket":
            primitive.type = SolidPrimitive.BOX
            primitive.dimensions = [size_x, size_y, size_z]
        else:
            primitive.type = SolidPrimitive.CYLINDER
            primitive.dimensions = [size_z, radius]

        return (primitive,), (pose,)

    def _collision_entries_for_object(self, scene_object: SceneObject) -> Tuple[List[CollisionEntry], List[CollisionEntry]]:
        interaction = self._interaction_states.get(scene_object.id)
        world_entries: List[CollisionEntry] = []
        attached_entries: List[CollisionEntry] = []
        frame_id = scene_object.pose.header.frame_id or self._world_frame

        if interaction and interaction.mode == "dual_contact" and interaction.enabled:
            return world_entries, attached_entries

        if interaction and interaction.mode == "opened_split":
            body_entry, cap_entry = self._make_split_entries(scene_object, interaction, frame_id)
            if interaction.primary_link:
                attached_entries.append(body_entry)
            else:
                world_entries.append(body_entry)
            if interaction.enabled and interaction.secondary_link:
                attached_entries.append(cap_entry)
            return world_entries, attached_entries

        if scene_object.attached_link:
            primitives, poses = self._scene_object_to_collision(
                scene_object,
                include_cap=scene_object.id not in self._opened_objects,
            )
            attached_entries.append(
                CollisionEntry(
                    collision_id=scene_object.id,
                    primitives=primitives,
                    poses=poses,
                    frame_id=frame_id,
                    attached_link=scene_object.attached_link,
                    touch_links=(scene_object.attached_link,),
                )
            )
            return world_entries, attached_entries

        primitives, poses = self._scene_object_to_collision(
            scene_object,
            include_cap=scene_object.id not in self._opened_objects,
        )
        world_entries.append(
            CollisionEntry(
                collision_id=scene_object.id,
                primitives=primitives,
                poses=poses,
                frame_id=frame_id,
            )
        )
        return world_entries, attached_entries

    def _make_split_entries(
        self,
        scene_object: SceneObject,
        interaction: InteractionState,
        frame_id: str,
    ) -> Tuple[CollisionEntry, CollisionEntry]:
        body_radius = max(float(scene_object.size.x), float(scene_object.size.y)) * 0.5
        body_height = max(float(scene_object.size.z), 0.01)
        cap_radius = max(body_radius * 0.55, 0.01)
        cap_height = max(body_height * 0.12, 0.01)

        cap_center_pose = self._lookup_subframe_pose(scene_object, "bottle_cap_center")
        if cap_center_pose is None:
            cap_center_pose = deepcopy(scene_object.pose.pose)
            cap_center_pose.position.z += max(body_height * 0.5 - cap_height * 0.5, 0.0)

        body_pose = deepcopy(scene_object.pose.pose)
        body_primitive = SolidPrimitive()
        body_primitive.type = SolidPrimitive.CYLINDER
        body_primitive.dimensions = [body_height, body_radius]

        cap_primitive = SolidPrimitive()
        cap_primitive.type = SolidPrimitive.CYLINDER
        cap_primitive.dimensions = [cap_height, cap_radius]

        body_entry = CollisionEntry(
            collision_id=f"{scene_object.id}::body",
            primitives=(body_primitive,),
            poses=(body_pose,),
            frame_id=frame_id,
            attached_link=interaction.primary_link,
            touch_links=((interaction.primary_link,) if interaction.primary_link else ()),
        )
        cap_entry = CollisionEntry(
            collision_id=f"{scene_object.id}::cap",
            primitives=(cap_primitive,),
            poses=(cap_center_pose,),
            frame_id=frame_id,
            attached_link=interaction.secondary_link,
            touch_links=((interaction.secondary_link,) if interaction.secondary_link else ()),
        )
        return body_entry, cap_entry

    def _make_bottle_collision(
        self,
        scene_object: SceneObject,
        include_cap: bool,
    ) -> Tuple[Tuple[SolidPrimitive, ...], Tuple[Pose, ...]]:
        body_radius = max(float(scene_object.size.x), float(scene_object.size.y)) * 0.5
        full_height = max(float(scene_object.size.z), 0.01)
        cap_radius = max(body_radius * 0.55, 0.01)
        cap_height = max(full_height * 0.12, 0.01)
        body_height = max(full_height - cap_height, 0.01)

        body_primitive = SolidPrimitive()
        body_primitive.type = SolidPrimitive.CYLINDER
        body_primitive.dimensions = [body_height, body_radius]

        body_pose = deepcopy(scene_object.pose.pose)
        body_pose.position.z -= max((full_height - body_height) * 0.5, 0.0)

        primitives: List[SolidPrimitive] = [body_primitive]
        poses: List[Pose] = [body_pose]

        if include_cap:
            cap_pose = self._lookup_subframe_pose(scene_object, "bottle_cap_center")
            if cap_pose is None:
                cap_pose = deepcopy(scene_object.pose.pose)
                cap_pose.position.z += max(full_height * 0.5 - cap_height * 0.5, 0.0)

            cap_primitive = SolidPrimitive()
            cap_primitive.type = SolidPrimitive.CYLINDER
            cap_primitive.dimensions = [cap_height, cap_radius]
            primitives.append(cap_primitive)
            poses.append(cap_pose)

        return tuple(primitives), tuple(poses)

    def _lookup_subframe_pose(self, scene_object: SceneObject, subframe_name: str) -> Optional[Pose]:
        for subframe in scene_object.subframes:
            if subframe.name == subframe_name:
                return deepcopy(subframe.pose.pose)
        return None

    def _scene_snapshot(self, scene_object: SceneObject) -> Tuple:
        pose = scene_object.pose.pose
        return (
            scene_object.semantic_type,
            round(float(pose.position.x), 4),
            round(float(pose.position.y), 4),
            round(float(pose.position.z), 4),
            round(float(pose.orientation.x), 4),
            round(float(pose.orientation.y), 4),
            round(float(pose.orientation.z), 4),
            round(float(pose.orientation.w), 4),
            round(float(scene_object.size.x), 4),
            round(float(scene_object.size.y), 4),
            round(float(scene_object.size.z), 4),
            scene_object.attached_link,
        )

    def _collision_snapshot(self, collision_entry: CollisionEntry) -> Tuple:
        pose = collision_entry.poses[0]
        dims = tuple(
            tuple(round(float(value), 4) for value in primitive.dimensions)
            for primitive in collision_entry.primitives
        )
        return (
            collision_entry.collision_id,
            tuple(primitive.type for primitive in collision_entry.primitives),
            round(float(pose.position.x), 4),
            round(float(pose.position.y), 4),
            round(float(pose.position.z), 4),
            round(float(pose.orientation.x), 4),
            round(float(pose.orientation.y), 4),
            round(float(pose.orientation.z), 4),
            round(float(pose.orientation.w), 4),
            dims,
            collision_entry.attached_link,
            collision_entry.touch_links,
        )

def main() -> None:
    rclpy.init()
    node = PlanningSceneSyncNode()
    executor = MultiThreadedExecutor()
    executor.add_node(node)
    try:
        executor.spin()
    except KeyboardInterrupt:
        pass
    finally:
        executor.shutdown()
        node.destroy_node()
        try:
            rclpy.shutdown()
        except Exception:  # pylint: disable=broad-except
            pass


if __name__ == "__main__":
    main()
