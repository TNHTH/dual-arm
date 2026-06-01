#!/usr/bin/python3

from __future__ import annotations

import rclpy
from rclpy.action import ActionClient
from rclpy.node import Node
from std_msgs.msg import Bool

from dualarm_interfaces.action import RunCompetition


class CompetitionStartGateNode(Node):
    def __init__(self) -> None:
        super().__init__("competition_start_gate")
        self.declare_parameter("start_mode", "external_gate")
        self.declare_parameter("start_signal_topic", "/competition/start_signal")
        self.declare_parameter("task_sequence", "handover,pouring")

        self._start_mode = self.get_parameter("start_mode").value
        self._task_sequence = self.get_parameter("task_sequence").value
        self._goal_sent = False
        self._action_client = ActionClient(self, RunCompetition, "/competition/run")

        if self._start_mode == "external_gate":
            self.create_subscription(Bool, self.get_parameter("start_signal_topic").value, self._handle_start, 10)
        else:
            self.create_timer(0.5, self._auto_start_once)

        self.get_logger().info(f"competition_start_gate 已启动，模式: {self._start_mode}")

    def _handle_start(self, message: Bool) -> None:
        if message.data:
            self._send_goal_once()

    def _auto_start_once(self) -> None:
        self._send_goal_once()

    def _send_goal_once(self) -> None:
        if self._goal_sent:
            return
        if not self._action_client.wait_for_server(timeout_sec=0.5):
            self.get_logger().warn("RunCompetition action 尚未就绪")
            return
        goal = RunCompetition.Goal()
        # start gate 只在外部信号或显式 auto/dev 模式满足后发送 goal。
        goal.start_immediately = True
        goal.requested_order = self._task_sequence
        goal.resume_from_checkpoint = False
        goal.checkpoint_id = ""
        goal.allow_reconcile = True
        self._action_client.send_goal_async(goal)
        self._goal_sent = True
        self.get_logger().info("已发送 RunCompetition goal")


def main() -> None:
    rclpy.init()
    node = CompetitionStartGateNode()
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
