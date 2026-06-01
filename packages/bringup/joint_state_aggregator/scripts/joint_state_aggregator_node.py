#!/usr/bin/python3

from __future__ import annotations

from copy import deepcopy
from typing import List, Optional

import rclpy
from rclpy.node import Node
from sensor_msgs.msg import JointState


class JointStateAggregatorNode(Node):
    def __init__(self) -> None:
        super().__init__("joint_state_aggregator")
        self.declare_parameter("active_arms", "dual")
        self.declare_parameter("left_joint_names", [f"left_j{index}" for index in range(1, 7)])
        self.declare_parameter("right_joint_names", [f"right_j{index}" for index in range(1, 7)])
        self.declare_parameter("left_default_positions", [0.0] * 6)
        self.declare_parameter("right_default_positions", [0.0] * 6)

        self._active_arms = self._normalize_active_arms(str(self.get_parameter("active_arms").value))
        self._left_joint_names = list(self.get_parameter("left_joint_names").value)
        self._right_joint_names = list(self.get_parameter("right_joint_names").value)
        self._left_default_positions = [float(value) for value in self.get_parameter("left_default_positions").value]
        self._right_default_positions = [float(value) for value in self.get_parameter("right_default_positions").value]
        self._left: Optional[JointState] = None
        self._right: Optional[JointState] = None
        self._publisher = self.create_publisher(JointState, "/joint_states", 10)
        self.create_subscription(JointState, "/L/joint_states", self._left_cb, 10)
        self.create_subscription(JointState, "/R/joint_states", self._right_cb, 10)
        self.get_logger().info(f"joint_state_aggregator 已启动，active_arms={self._active_arms}")

    def _left_cb(self, message: JointState) -> None:
        self._left = deepcopy(message)
        self._publish_if_ready()

    def _right_cb(self, message: JointState) -> None:
        self._right = deepcopy(message)
        self._publish_if_ready()

    def _normalize_active_arms(self, value: str) -> str:
        normalized = value.strip().lower()
        if normalized in ("dual", "left", "right"):
            return normalized
        self.get_logger().warn(f"未知 active_arms={value}，回退到 dual")
        return "dual"

    def _build_named_state(self, message: JointState, side: str) -> Optional[JointState]:
        expected_names = self._left_joint_names if side == "left" else self._right_joint_names
        if len(message.position) < len(expected_names):
            self.get_logger().warn(
                f"{side} joint state 关节数量不足，expected={len(expected_names)}, actual={len(message.position)}",
                throttle_duration_sec=2.0,
            )
            return None

        normalized = JointState()
        normalized.header = message.header
        normalized.name = list(expected_names)
        normalized.position = list(message.position[: len(expected_names)])
        normalized.velocity = self._pad_values(message.velocity, len(expected_names))
        normalized.effort = self._pad_values(message.effort, len(expected_names))
        return normalized

    def _build_default_state(self, side: str, stamp) -> JointState:
        joint_names = self._left_joint_names if side == "left" else self._right_joint_names
        default_positions = self._left_default_positions if side == "left" else self._right_default_positions
        state = JointState()
        state.header.stamp = stamp
        state.name = list(joint_names)
        state.position = self._pad_values(default_positions, len(joint_names))
        state.velocity = [0.0] * len(joint_names)
        state.effort = [0.0] * len(joint_names)
        return state

    def _pad_values(self, values: List[float], expected_len: int) -> List[float]:
        padded = [float(value) for value in list(values[:expected_len])]
        if len(padded) < expected_len:
            padded.extend([0.0] * (expected_len - len(padded)))
        return padded

    def _publish_if_ready(self) -> None:
        left_state: Optional[JointState]
        right_state: Optional[JointState]

        if self._active_arms == "dual":
            if self._left is None or self._right is None:
                return
            left_state = self._build_named_state(self._left, "left")
            right_state = self._build_named_state(self._right, "right")
        elif self._active_arms == "left":
            if self._left is None:
                return
            left_state = self._build_named_state(self._left, "left")
            right_state = self._build_default_state("right", self._left.header.stamp)
        else:
            if self._right is None:
                return
            left_state = self._build_default_state("left", self._right.header.stamp)
            right_state = self._build_named_state(self._right, "right")

        if left_state is None or right_state is None:
            return

        combined = JointState()
        combined.header.stamp = self.get_clock().now().to_msg()
        combined.name = list(left_state.name) + list(right_state.name)
        combined.position = list(left_state.position) + list(right_state.position)
        combined.velocity = list(left_state.velocity) + list(right_state.velocity)
        combined.effort = list(left_state.effort) + list(right_state.effort)
        self._publisher.publish(combined)


def main() -> None:
    rclpy.init()
    node = JointStateAggregatorNode()
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
