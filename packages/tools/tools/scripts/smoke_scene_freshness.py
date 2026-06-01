#!/usr/bin/python3

from __future__ import annotations

import sys
import time
from typing import Callable, Optional

import rclpy
from builtin_interfaces.msg import Time as TimeMsg
from geometry_msgs.msg import PoseStamped, Vector3
from rclpy.node import Node
from rclpy.time import Time
from sensor_msgs.msg import JointState

from dualarm_interfaces.msg import SceneObject, SceneObjectArray
from dualarm_interfaces.srv import AttachObject, DetachObject, PlanJoint, ReleaseObject, ReserveObject
from robo_ctrl.msg import RobotState


class SceneFreshnessSmoke(Node):
    def __init__(self) -> None:
        super().__init__("scene_freshness_smoke")
        self._raw_messages: list[SceneObjectArray] = []
        self._managed_messages: list[SceneObjectArray] = []
        self._managed_scene: Optional[SceneObjectArray] = None
        self._object_timer = None
        self._planner_scene_timer = None
        self._robot_state_timer = None
        self._raw_object_version = 1000
        self._raw_empty_version = 5000
        self._planner_scene_version = 9000
        self._planner_override_stale = False

        self._raw_pub = self.create_publisher(SceneObjectArray, "/scene_fusion/raw_scene_objects", 10)
        self._managed_pub = self.create_publisher(SceneObjectArray, "/scene_fusion/scene_objects", 10)
        self._left_state_pub = self.create_publisher(RobotState, "/L/robot_state", 10)
        self.create_subscription(SceneObjectArray, "/scene_fusion/raw_scene_objects", self._raw_cb, 10)
        self.create_subscription(SceneObjectArray, "/scene_fusion/scene_objects", self._managed_cb, 10)

        self._reserve = self.create_client(ReserveObject, "/scene/reserve_object")
        self._release = self.create_client(ReleaseObject, "/scene/release_object")
        self._attach = self.create_client(AttachObject, "/scene/attach_object")
        self._detach = self.create_client(DetachObject, "/scene/detach_object")
        self._plan_joint = self.create_client(PlanJoint, "/planning/plan_joint")

    def _raw_cb(self, message: SceneObjectArray) -> None:
        self._raw_messages.append(message)
        self._raw_messages = self._raw_messages[-80:]

    def _managed_cb(self, message: SceneObjectArray) -> None:
        self._managed_scene = message
        self._managed_messages.append(message)
        self._managed_messages = self._managed_messages[-80:]

    def wait_for_clients(self) -> bool:
        return all(
            client.wait_for_service(timeout_sec=3.0)
            for client in (self._reserve, self._release, self._attach, self._detach, self._plan_joint)
        )

    def wait_for_raw_subscriber(self, timeout: float = 3.0) -> bool:
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            if self._raw_pub.get_subscription_count() > 0:
                return True
            rclpy.spin_once(self, timeout_sec=0.1)
        return self._raw_pub.get_subscription_count() > 0

    def wait_for_managed_subscriber(self, timeout: float = 3.0) -> bool:
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            if self._managed_pub.get_subscription_count() > 0:
                return True
            rclpy.spin_once(self, timeout_sec=0.1)
        return self._managed_pub.get_subscription_count() > 0

    def wait_for_condition(
        self,
        predicate: Callable[[], bool],
        timeout: float = 5.0,
        pump: Optional[Callable[[], None]] = None,
    ) -> bool:
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            if pump is not None:
                pump()
            rclpy.spin_once(self, timeout_sec=0.05)
            if predicate():
                return True
        return False

    def spin_for(self, duration: float, pump: Optional[Callable[[], None]] = None) -> None:
        deadline = time.monotonic() + duration
        while time.monotonic() < deadline:
            if pump is not None:
                pump()
            rclpy.spin_once(self, timeout_sec=0.05)

    def assert_initial_empty_versions(self) -> bool:
        def enough_empty_versions(messages: list[SceneObjectArray]) -> bool:
            empty = [msg for msg in messages if not msg.objects and self._fresh_stamp(msg.header.stamp)]
            if len(empty) < 3:
                return False
            versions = [msg.scene_version for msg in empty[-3:]]
            return all(version > 0 for version in versions) and all(
                later > earlier for earlier, later in zip(versions, versions[1:])
            )

        raw_ok = self.wait_for_condition(lambda: enough_empty_versions(self._raw_messages), timeout=5.0)
        managed_ok = self.wait_for_condition(lambda: enough_empty_versions(self._managed_messages), timeout=5.0)
        if not raw_ok:
            print("raw empty scene versions did not increase", file=sys.stderr)
        if not managed_ok:
            print("managed empty scene versions did not increase", file=sys.stderr)
        return raw_ok and managed_ok

    def cleanup_freshness_object(self, timeout: float = 4.0) -> bool:
        detach_req = DetachObject.Request()
        detach_req.object_id = "freshness_bottle"
        release_req = ReleaseObject.Request()
        release_req.object_id = "freshness_bottle"

        self.call_scene_service(self._detach, detach_req, timeout=1.0)
        self.call_scene_service(self._release, release_req, timeout=1.0)

        return self.wait_for_condition(
            lambda: self._managed_scene is not None
            and all(obj.id != "freshness_bottle" for obj in self._managed_scene.objects),
            timeout=timeout,
            pump=self.publish_empty_raw_once,
        )

    def start_object_feed(self) -> None:
        if self._object_timer is None:
            self._object_timer = self.create_timer(0.05, self._publish_object_raw_once)

    def stop_object_feed(self) -> None:
        if self._object_timer is not None:
            self.destroy_timer(self._object_timer)
            self._object_timer = None

    def _publish_object_raw_once(self) -> None:
        self._raw_object_version += 1
        stamp = self.get_clock().now().to_msg()
        message = SceneObjectArray()
        message.header.frame_id = "world"
        message.header.stamp = stamp
        message.scene_version = self._raw_object_version

        obj = SceneObject()
        obj.id = "freshness_bottle"
        obj.semantic_type = "water_bottle"
        obj.pose = PoseStamped()
        obj.pose.header.frame_id = "world"
        obj.pose.header.stamp = stamp
        obj.pose.pose.position.x = 0.42
        obj.pose.pose.position.y = 0.08
        obj.pose.pose.position.z = 0.22
        obj.pose.pose.orientation.w = 1.0
        obj.size = Vector3(x=0.07, y=0.07, z=0.24)
        obj.confidence = 0.92
        obj.graspable = True
        obj.movable = True
        obj.source = "freshness_smoke"
        obj.source_views = ["freshness_smoke"]
        obj.shape_type = "cylinder"
        obj.pose_source = "smoke_fixture"
        obj.quality_score = 0.92
        obj.last_seen = stamp
        obj.scene_version = message.scene_version
        obj.lifecycle_state = "stable"
        obj.reserved_by = "none"
        obj.attached_link = ""
        obj.pose_covariance_diagonal = [0.0] * 6
        message.objects.append(obj)
        self._raw_pub.publish(message)

    def publish_empty_raw_once(self) -> None:
        self._raw_empty_version += 1
        message = SceneObjectArray()
        message.header.frame_id = "world"
        message.header.stamp = self.get_clock().now().to_msg()
        message.scene_version = self._raw_empty_version
        self._raw_pub.publish(message)

    def wait_for_managed_object(
        self,
        predicate: Callable[[SceneObject, SceneObjectArray], bool],
        timeout: float = 5.0,
        pump: Optional[Callable[[], None]] = None,
    ) -> bool:
        return self.wait_for_condition(
            lambda: self._managed_scene is not None
            and any(predicate(obj, self._managed_scene) for obj in self._managed_scene.objects),
            timeout=timeout,
            pump=pump,
        )

    def call_scene_service(self, client, request, timeout: float = 5.0) -> bool:
        future = client.call_async(request)
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            rclpy.spin_once(self, timeout_sec=0.05)
            if future.done():
                result = future.result()
                return result is not None and bool(result.success)
        return False

    def exercise_lost_lifecycle(self) -> bool:
        if not self.wait_for_raw_subscriber():
            print("raw scene publisher has no subscribers", file=sys.stderr)
            return False

        self.start_object_feed()
        if not self.wait_for_managed_object(
            lambda obj, scene: obj.id == "freshness_bottle"
            and obj.scene_version == scene.scene_version
            and obj.lifecycle_state in ("stable", "observed"),
            timeout=5.0,
        ):
            print("managed scene missing freshness_bottle", file=sys.stderr)
            return False

        reserve_req = ReserveObject.Request()
        reserve_req.object_id = "freshness_bottle"
        reserve_req.reserved_by = "freshness_smoke"
        reserve_req.arm_mode = "left_arm"
        if not self.call_scene_service(self._reserve, reserve_req):
            print("reserve failed", file=sys.stderr)
            return False

        if not self.wait_for_managed_object(
            lambda obj, _scene: obj.id == "freshness_bottle"
            and obj.lifecycle_state == "reserved"
            and obj.reserved_by == "freshness_smoke",
            timeout=5.0,
        ):
            print("managed scene did not enter reserved", file=sys.stderr)
            return False

        self.stop_object_feed()
        if not self.wait_for_managed_object(
            lambda obj, _scene: obj.id == "freshness_bottle"
            and obj.lifecycle_state == "lost_but_reserved"
            and obj.reserved_by == "freshness_smoke",
            timeout=4.0,
            pump=self.publish_empty_raw_once,
        ):
            print("managed scene did not enter lost_but_reserved", file=sys.stderr)
            return False

        self.start_object_feed()
        if not self.wait_for_managed_object(
            lambda obj, _scene: obj.id == "freshness_bottle" and obj.lifecycle_state == "reserved",
            timeout=5.0,
        ):
            print("managed scene did not recover reserved after raw feed resumed", file=sys.stderr)
            return False

        attach_req = AttachObject.Request()
        attach_req.object_id = "freshness_bottle"
        attach_req.link_name = "left_tcp"
        if not self.call_scene_service(self._attach, attach_req):
            print("attach failed", file=sys.stderr)
            return False

        if not self.wait_for_managed_object(
            lambda obj, _scene: obj.id == "freshness_bottle"
            and obj.lifecycle_state == "attached"
            and obj.attached_link == "left_tcp",
            timeout=5.0,
        ):
            print("managed scene did not enter attached", file=sys.stderr)
            return False

        self.stop_object_feed()
        if not self.wait_for_managed_object(
            lambda obj, _scene: obj.id == "freshness_bottle"
            and obj.lifecycle_state == "lost_but_attached"
            and obj.attached_link == "left_tcp",
            timeout=4.0,
            pump=self.publish_empty_raw_once,
        ):
            print("managed scene did not enter lost_but_attached", file=sys.stderr)
            return False

        detach_req = DetachObject.Request()
        detach_req.object_id = "freshness_bottle"
        if not self.call_scene_service(self._detach, detach_req):
            print("detach failed", file=sys.stderr)
            return False

        release_req = ReleaseObject.Request()
        release_req.object_id = "freshness_bottle"
        if not self.call_scene_service(self._release, release_req):
            print("release failed", file=sys.stderr)
            return False

        if not self.wait_for_condition(
            lambda: self._managed_scene is not None
            and all(obj.id != "freshness_bottle" for obj in self._managed_scene.objects),
            timeout=4.0,
            pump=self.publish_empty_raw_once,
        ):
            print("managed scene did not clear freshness_bottle", file=sys.stderr)
            return False
        return True

    def start_robot_state_feed(self) -> None:
        if self._robot_state_timer is None:
            self._robot_state_timer = self.create_timer(0.02, self._publish_left_robot_state_once)

    def stop_robot_state_feed(self) -> None:
        if self._robot_state_timer is not None:
            self.destroy_timer(self._robot_state_timer)
            self._robot_state_timer = None

    def _publish_left_robot_state_once(self) -> None:
        state = RobotState()
        state.header.stamp = self.get_clock().now().to_msg()
        state.header.frame_id = "world"
        state.motion_done = True
        state.error_code = 0
        self._left_state_pub.publish(state)

    def start_planner_scene_override(self, stale: bool) -> None:
        self._planner_override_stale = stale
        if self._planner_scene_timer is None:
            self._planner_scene_timer = self.create_timer(0.02, self._publish_planner_scene_once)

    def stop_planner_scene_override(self) -> None:
        if self._planner_scene_timer is not None:
            self.destroy_timer(self._planner_scene_timer)
            self._planner_scene_timer = None

    def _publish_planner_scene_once(self) -> None:
        self._planner_scene_version += 1
        message = SceneObjectArray()
        message.header.frame_id = "world"
        message.header.stamp = self._stamp_seconds_ago(5 if self._planner_override_stale else 0)
        message.scene_version = self._planner_scene_version
        self._managed_pub.publish(message)

    def call_plan_joint(self, timeout: float = 5.0):
        request = PlanJoint.Request()
        request.arm_group = "left_arm"
        request.target_joints = JointState()
        future = self._plan_joint.call_async(request)
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            rclpy.spin_once(self, timeout_sec=0.05)
            if future.done():
                return future.result()
        return None

    def call_plan_joint_until(self, predicate: Callable[[object], bool], timeout: float = 4.0):
        deadline = time.monotonic() + timeout
        last_response = None
        while time.monotonic() < deadline:
            last_response = self.call_plan_joint(timeout=1.0)
            if last_response is not None and predicate(last_response):
                return last_response
        return last_response

    def exercise_planner_freshness_gate(self) -> bool:
        if not self.wait_for_managed_subscriber():
            print("managed scene override publisher has no subscribers", file=sys.stderr)
            return False

        self.start_robot_state_feed()
        self.spin_for(0.3)

        self.start_planner_scene_override(stale=True)
        self.spin_for(0.8)
        stale_response = self.call_plan_joint_until(
            lambda response: response.result_code == "scene_stale" and response.failure_stage == "scene",
            timeout=4.0,
        )
        self.stop_planner_scene_override()
        if stale_response is None:
            print("PlanJoint stale call timed out", file=sys.stderr)
            return False
        if stale_response.result_code != "scene_stale" or stale_response.failure_stage != "scene":
            print(
                f"PlanJoint stale scene mismatch result={stale_response.result_code} stage={stale_response.failure_stage}",
                file=sys.stderr,
            )
            return False

        self.start_planner_scene_override(stale=False)
        self.spin_for(0.8)
        fresh_response = self.call_plan_joint()
        self.stop_planner_scene_override()
        self.stop_robot_state_feed()
        if fresh_response is None:
            print("PlanJoint fresh call timed out", file=sys.stderr)
            return False
        if fresh_response.result_code == "scene_stale" or fresh_response.failure_stage == "scene":
            print(
                f"PlanJoint fresh scene incorrectly failed result={fresh_response.result_code} stage={fresh_response.failure_stage}",
                file=sys.stderr,
            )
            return False
        return True

    def _fresh_stamp(self, stamp: TimeMsg, max_age_sec: float = 0.8) -> bool:
        if stamp.sec == 0 and stamp.nanosec == 0:
            return False
        age_ns = (self.get_clock().now() - Time.from_msg(stamp)).nanoseconds
        return -100_000_000 <= age_ns <= int(max_age_sec * 1e9)

    def _stamp_seconds_ago(self, seconds: int) -> TimeMsg:
        now = self.get_clock().now().to_msg()
        stamp = TimeMsg()
        stamp.sec = max(0, now.sec - seconds)
        stamp.nanosec = now.nanosec
        return stamp


def main() -> int:
    rclpy.init()
    node = SceneFreshnessSmoke()
    try:
        if not node.wait_for_clients():
            print("service unavailable", file=sys.stderr)
            return 2
        if not node.cleanup_freshness_object():
            print("failed to clean previous freshness_bottle state", file=sys.stderr)
            return 6
        if not node.assert_initial_empty_versions():
            return 3
        if not node.exercise_lost_lifecycle():
            return 4
        if not node.exercise_planner_freshness_gate():
            return 5
        print("scene freshness smoke passed")
        return 0
    finally:
        node.stop_object_feed()
        node.stop_planner_scene_override()
        node.stop_robot_state_feed()
        try:
            node.cleanup_freshness_object(timeout=1.5)
        except Exception:  # pylint: disable=broad-except
            pass
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    raise SystemExit(main())
