#!/usr/bin/python3

from __future__ import annotations

import sys

import rclpy
from rclpy.action import ActionClient
from rclpy.node import Node

from dualarm_interfaces.action import ExecutePrimitive


class ExecutePrimitiveSmoke(Node):
    def __init__(self) -> None:
        super().__init__("smoke_execute_primitive")
        self._client = ActionClient(self, ExecutePrimitive, "/execution/execute_primitive")

    def run(self) -> int:
        if not self._client.wait_for_server(timeout_sec=5.0):
            self.get_logger().error("/execution/execute_primitive action server not available")
            return 2

        goal = ExecutePrimitive.Goal()
        goal.primitive_id = "hold_verify"
        goal.arm_group = "left_arm"
        goal.object_id = "smoke_missing_object"
        goal.hold_duration_s = 0.1

        send_future = self._client.send_goal_async(goal)
        rclpy.spin_until_future_complete(self, send_future, timeout_sec=3.0)
        goal_handle = send_future.result()
        if goal_handle is None or not goal_handle.accepted:
            self.get_logger().error("execute primitive smoke goal rejected")
            return 3

        result_future = goal_handle.get_result_async()
        rclpy.spin_until_future_complete(self, result_future, timeout_sec=5.0)
        if result_future.result() is None:
            self.get_logger().error("execute primitive smoke result timeout")
            return 4

        result = result_future.result().result
        required_contract_ok = (
            result.contract_version == "execution_primitive.v1"
            and result.primitive_family == "verify"
            and result.result_code == "hold_failed"
            and not result.success
            and result.primary_started
            and not result.primary_completed
            and not result.contact_verified
            and not result.detach_verified
            and not result.spill_detected
        )
        if not required_contract_ok:
            self.get_logger().error(
                "unexpected smoke result: "
                f"success={result.success}, result_code={result.result_code}, "
                f"family={result.primitive_family}, contract={result.contract_version}, "
                f"primary_started={result.primary_started}, primary_completed={result.primary_completed}, "
                f"contact_verified={result.contact_verified}, detach_verified={result.detach_verified}, "
                f"spill_detected={result.spill_detected}"
            )
            return 5

        self.get_logger().info("execute primitive smoke passed")
        return 0


def main() -> None:
    rclpy.init()
    node = ExecutePrimitiveSmoke()
    try:
        exit_code = node.run()
    finally:
        node.destroy_node()
        rclpy.shutdown()
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
