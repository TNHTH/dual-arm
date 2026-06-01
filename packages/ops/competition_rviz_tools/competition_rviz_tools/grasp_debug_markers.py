from __future__ import annotations

import math

import rclpy
from builtin_interfaces.msg import Duration
from geometry_msgs.msg import Point
from geometry_msgs.msg import PoseStamped
from rclpy.node import Node
from visualization_msgs.msg import Marker
from visualization_msgs.msg import MarkerArray

from dualarm_interfaces.msg import GraspTarget

from competition_rviz_tools import DEFAULT_GRASP_DEBUG_MARKER_TOPIC
from competition_rviz_tools import DEFAULT_GRASP_TARGET_TOPIC


class GraspDebugMarkers(Node):
    """把 GraspTarget 关键位姿转成 RViz MarkerArray，便于操作员调试。"""

    def __init__(self) -> None:
        super().__init__("grasp_debug_markers")
        self.declare_parameter("frame_id", "world")
        self.declare_parameter("grasp_target_topic", DEFAULT_GRASP_TARGET_TOPIC)
        self.declare_parameter("marker_topic", DEFAULT_GRASP_DEBUG_MARKER_TOPIC)
        self.declare_parameter("marker_lifetime_s", 1.5)
        self.declare_parameter("publish_idle_marker", True)

        self._frame_id = str(self.get_parameter("frame_id").value)
        self._grasp_target_topic = str(self.get_parameter("grasp_target_topic").value)
        self._marker_topic = str(self.get_parameter("marker_topic").value)
        self._marker_lifetime_s = float(self.get_parameter("marker_lifetime_s").value)
        self._publish_idle_marker = bool(self.get_parameter("publish_idle_marker").value)
        self._last_target: GraspTarget | None = None

        self._publisher = self.create_publisher(MarkerArray, self._marker_topic, 10)
        self.create_subscription(GraspTarget, self._grasp_target_topic, self._handle_grasp_target, 10)
        self.create_timer(1.0, self._publish_idle_state)
        self.get_logger().info(
            f"抓取 debug markers 已启动: grasp_target_topic={self._grasp_target_topic}, marker_topic={self._marker_topic}"
        )

    def _handle_grasp_target(self, target: GraspTarget) -> None:
        self._last_target = target
        markers = MarkerArray()
        markers.markers.append(self._delete_all_marker())

        marker_id = 1
        pose_specs = (
            ("pregrasp", target.pregrasp, (0.15, 0.35, 0.95, 0.95)),
            ("grasp", target.grasp, (0.95, 0.20, 0.10, 0.95)),
            ("operate", target.operate, (0.95, 0.75, 0.10, 0.95)),
            ("retreat", target.retreat, (0.10, 0.80, 0.35, 0.95)),
            ("place", target.place, (0.60, 0.35, 0.95, 0.95)),
            ("release", target.release, (0.85, 0.85, 0.85, 0.95)),
        )
        for name, pose, color in pose_specs:
            if not self._has_pose(pose):
                continue
            markers.markers.append(self._sphere_marker(marker_id, name, pose, color))
            marker_id += 1
            markers.markers.append(self._text_marker(marker_id, name, pose))
            marker_id += 1

        if self._has_pose(target.grasp):
            markers.markers.append(
                self._axis_marker(marker_id, "approach_axis", target.grasp, target.approach_axis, (0.95, 0.15, 0.15, 1.0))
            )
            marker_id += 1
            markers.markers.append(
                self._axis_marker(marker_id, "retreat_axis", target.grasp, target.retreat_axis, (0.10, 0.85, 0.35, 1.0))
            )
            marker_id += 1
            markers.markers.append(self._summary_marker(marker_id, target))

        self._publisher.publish(markers)

    def _publish_idle_state(self) -> None:
        if self._last_target is not None or not self._publish_idle_marker:
            return
        markers = MarkerArray()
        markers.markers.append(self._text_marker_from_xyz(900, "idle", "等待 /planning/grasp_targets", 0.0, 0.45, 0.55))
        self._publisher.publish(markers)

    def _delete_all_marker(self) -> Marker:
        marker = Marker()
        marker.action = Marker.DELETEALL
        return marker

    def _sphere_marker(self, marker_id: int, name: str, pose: PoseStamped, color: tuple[float, float, float, float]) -> Marker:
        marker = self._base_marker(marker_id, name, pose)
        marker.type = Marker.SPHERE
        marker.scale.x = 0.045
        marker.scale.y = 0.045
        marker.scale.z = 0.045
        marker.color.r = color[0]
        marker.color.g = color[1]
        marker.color.b = color[2]
        marker.color.a = color[3]
        return marker

    def _axis_marker(
        self,
        marker_id: int,
        name: str,
        pose: PoseStamped,
        axis,
        color: tuple[float, float, float, float],
    ) -> Marker:
        marker = self._base_marker(marker_id, name, pose)
        marker.type = Marker.ARROW
        marker.scale.x = 0.015
        marker.scale.y = 0.035
        marker.scale.z = 0.035
        marker.color.r = color[0]
        marker.color.g = color[1]
        marker.color.b = color[2]
        marker.color.a = color[3]

        start = Point()
        start.x = pose.pose.position.x
        start.y = pose.pose.position.y
        start.z = pose.pose.position.z
        end = Point()
        norm = math.sqrt(axis.x * axis.x + axis.y * axis.y + axis.z * axis.z) or 1.0
        end.x = start.x + 0.12 * axis.x / norm
        end.y = start.y + 0.12 * axis.y / norm
        end.z = start.z + 0.12 * axis.z / norm
        marker.points = [start, end]
        return marker

    def _text_marker(self, marker_id: int, name: str, pose: PoseStamped) -> Marker:
        return self._text_marker_from_xyz(
            marker_id,
            name + "_label",
            name,
            pose.pose.position.x,
            pose.pose.position.y,
            pose.pose.position.z + 0.055,
            frame_id=pose.header.frame_id or self._frame_id,
        )

    def _summary_marker(self, marker_id: int, target: GraspTarget) -> Marker:
        detail = f"{target.object_id} | {target.arm_mode} | {target.strategy_id}"
        return self._text_marker_from_xyz(
            marker_id,
            "grasp_summary",
            detail,
            target.grasp.pose.position.x,
            target.grasp.pose.position.y,
            target.grasp.pose.position.z + 0.12,
            frame_id=target.grasp.header.frame_id or self._frame_id,
        )

    def _text_marker_from_xyz(
        self,
        marker_id: int,
        name: str,
        text: str,
        x: float,
        y: float,
        z: float,
        *,
        frame_id: str | None = None,
    ) -> Marker:
        marker = Marker()
        marker.header.stamp = self.get_clock().now().to_msg()
        marker.header.frame_id = frame_id or self._frame_id
        marker.ns = "competition_grasp_debug"
        marker.id = marker_id
        marker.type = Marker.TEXT_VIEW_FACING
        marker.action = Marker.ADD
        marker.pose.position.x = x
        marker.pose.position.y = y
        marker.pose.position.z = z
        marker.pose.orientation.w = 1.0
        marker.scale.z = 0.045
        marker.color.r = 0.95
        marker.color.g = 0.95
        marker.color.b = 0.85
        marker.color.a = 1.0
        marker.text = text
        marker.lifetime = self._duration()
        return marker

    def _base_marker(self, marker_id: int, name: str, pose: PoseStamped) -> Marker:
        marker = Marker()
        marker.header.stamp = self.get_clock().now().to_msg()
        marker.header.frame_id = pose.header.frame_id or self._frame_id
        marker.ns = "competition_grasp_debug/" + name
        marker.id = marker_id
        marker.action = Marker.ADD
        marker.pose = pose.pose
        marker.lifetime = self._duration()
        return marker

    def _duration(self) -> Duration:
        duration = Duration()
        duration.sec = int(self._marker_lifetime_s)
        duration.nanosec = int((self._marker_lifetime_s - duration.sec) * 1_000_000_000)
        return duration

    @staticmethod
    def _has_pose(pose: PoseStamped) -> bool:
        position = pose.pose.position
        orientation = pose.pose.orientation
        return any(
            abs(value) > 1e-9
            for value in (
                position.x,
                position.y,
                position.z,
                orientation.x,
                orientation.y,
                orientation.z,
                orientation.w,
            )
        )


def main(args: list[str] | None = None) -> None:
    rclpy.init(args=args)
    node = GraspDebugMarkers()
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
