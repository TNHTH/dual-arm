#!/usr/bin/python3

from __future__ import annotations

from typing import Dict, Optional

import rclpy
from epg50_gripper_ros.msg import GripperStatus
from rclpy.node import Node

from dualarm_interfaces.msg import SceneObjectArray, TaskEvent
from robo_ctrl.msg import RobotState


class EvidenceManagerNode(Node):
    def __init__(self) -> None:
        super().__init__("evidence_manager")
        self.declare_parameter("scene_topic", "/scene_fusion/scene_objects")
        self.declare_parameter("task_event_topic", "/task_manager/events")
        self.declare_parameter("evidence_event_topic", "/evidence/events")
        self.declare_parameter("left_robot_state_topic", "/L/robot_state")
        self.declare_parameter("right_robot_state_topic", "/R/robot_state")
        self.declare_parameter("left_gripper_status_topic", "/gripper0/epg50_gripper/status_stream")
        self.declare_parameter("right_gripper_status_topic", "/gripper1/epg50_gripper/status_stream")

        self._scene = SceneObjectArray()
        self._robot_states: Dict[str, RobotState] = {}
        self._gripper_status: Dict[int, GripperStatus] = {}
        self._last_task_event: Optional[TaskEvent] = None

        self._event_pub = self.create_publisher(
            TaskEvent,
            str(self.get_parameter("evidence_event_topic").value),
            10,
        )
        self.create_subscription(
            SceneObjectArray,
            str(self.get_parameter("scene_topic").value),
            self._handle_scene,
            10,
        )
        self.create_subscription(
            TaskEvent,
            str(self.get_parameter("task_event_topic").value),
            self._handle_task_event,
            10,
        )
        self.create_subscription(
            RobotState,
            str(self.get_parameter("left_robot_state_topic").value),
            lambda msg: self._handle_robot_state("left_arm", msg),
            10,
        )
        self.create_subscription(
            RobotState,
            str(self.get_parameter("right_robot_state_topic").value),
            lambda msg: self._handle_robot_state("right_arm", msg),
            10,
        )
        self.create_subscription(
            GripperStatus,
            str(self.get_parameter("left_gripper_status_topic").value),
            self._handle_gripper_status,
            10,
        )
        self.create_subscription(
            GripperStatus,
            str(self.get_parameter("right_gripper_status_topic").value),
            self._handle_gripper_status,
            10,
        )
        self.create_timer(1.0, self._publish_summary_event)
        self.get_logger().info("evidence_manager 已启动：v1 仅聚合现有信号，不推断真实 fill/spill")

    def _handle_scene(self, message: SceneObjectArray) -> None:
        self._scene = message

    def _handle_task_event(self, message: TaskEvent) -> None:
        self._last_task_event = message

    def _handle_robot_state(self, arm_name: str, message: RobotState) -> None:
        self._robot_states[arm_name] = message

    def _handle_gripper_status(self, message: GripperStatus) -> None:
        self._gripper_status[int(message.slave_id)] = message

    def _publish_summary_event(self) -> None:
        event = TaskEvent()
        event.header.stamp = self.get_clock().now().to_msg()
        event.header.frame_id = self._scene.header.frame_id or "world"
        event.state = "evidence_manager"
        event.event = "summary"
        event.level = "info"
        event.detail = (
            f"scene_version={self._scene.scene_version}, "
            f"objects={len(self._scene.objects)}, "
            f"robot_states={sorted(self._robot_states.keys())}, "
            f"grippers={sorted(self._gripper_status.keys())}, "
            "fill_spill_verified=false"
        )
        self._event_pub.publish(event)


def main() -> None:
    rclpy.init()
    node = EvidenceManagerNode()
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
