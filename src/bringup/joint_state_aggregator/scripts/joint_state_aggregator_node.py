#!/usr/bin/python3

from __future__ import annotations

from copy import deepcopy
from typing import Optional

import rclpy
from rclpy.node import Node
from sensor_msgs.msg import JointState


class JointStateAggregatorNode(Node):
    def __init__(self) -> None:
        super().__init__("joint_state_aggregator")
        self._left: Optional[JointState] = None
        self._right: Optional[JointState] = None
        self._publisher = self.create_publisher(JointState, "/joint_states", 10)
        self.create_subscription(JointState, "/L/joint_states", self._left_cb, 10)
        self.create_subscription(JointState, "/R/joint_states", self._right_cb, 10)
        self.get_logger().info("joint_state_aggregator 已启动")

    def _left_cb(self, message: JointState) -> None:
        self._left = deepcopy(message)
        self._publish_if_ready()

    def _right_cb(self, message: JointState) -> None:
        self._right = deepcopy(message)
        self._publish_if_ready()

    def _publish_if_ready(self) -> None:
        if self._left is None or self._right is None:
            return
        combined = JointState()
        combined.header.stamp = self.get_clock().now().to_msg()
        combined.name = [f"left_{name}" for name in self._left.name] + [f"right_{name}" for name in self._right.name]
        combined.position = list(self._left.position) + list(self._right.position)
        combined.velocity = list(self._left.velocity) + list(self._right.velocity)
        combined.effort = list(self._left.effort) + list(self._right.effort)
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
