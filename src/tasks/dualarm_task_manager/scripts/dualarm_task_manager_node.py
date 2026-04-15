#!/usr/bin/python3

from __future__ import annotations

from typing import List

import rclpy
from rclpy.action import ActionServer, CancelResponse, GoalResponse
from rclpy.executors import MultiThreadedExecutor
from rclpy.node import Node

from dualarm_interfaces.action import RunCompetition
from dualarm_interfaces.msg import GraspTarget, SceneObjectArray, TaskEvent


class DualArmTaskManagerNode(Node):
    def __init__(self) -> None:
        super().__init__("dualarm_task_manager")
        self._scene_cache = SceneObjectArray()
        self._grasp_targets: List[GraspTarget] = []

        self._event_publisher = self.create_publisher(TaskEvent, "/task_manager/events", 10)
        self.create_subscription(SceneObjectArray, "/scene_fusion/scene_objects", self._handle_scene, 10)
        self.create_subscription(GraspTarget, "/planning/grasp_targets", self._handle_grasp_target, 10)

        self._action_server = ActionServer(
            self,
            RunCompetition,
            "/competition/run",
            execute_callback=self._execute_competition,
            goal_callback=self._goal_callback,
            cancel_callback=self._cancel_callback,
        )
        self.get_logger().info("dualarm_task_manager 已启动")

    def _goal_callback(self, _goal_request: RunCompetition.Goal) -> GoalResponse:
        return GoalResponse.ACCEPT

    def _cancel_callback(self, _goal_handle) -> CancelResponse:
        return CancelResponse.ACCEPT

    def _handle_scene(self, message: SceneObjectArray) -> None:
        self._scene_cache = message

    def _handle_grasp_target(self, message: GraspTarget) -> None:
        self._grasp_targets = [target for target in self._grasp_targets if target.object_id != message.object_id]
        self._grasp_targets.append(message)

    def _execute_competition(self, goal_handle):
        states = [
            "BOOT",
            "SELF_CHECK",
            "LOAD_CALIBRATION",
            "HOME_ARMS",
            "WAIT_START",
            "SCAN_BASKET",
            "WAIT_BALL_1_STABLE",
            "PLAN_BIMANUAL_BALL_1_PREGRASP",
            "GRASP_BALL_1",
            "HOLD_BALL_1_3S",
            "PLAN_TO_BASKET_1",
            "RELEASE_BALL_1",
            "VERIFY_BALL_1_DROP",
            "WAIT_BALL_2_STABLE",
            "PLAN_BIMANUAL_BALL_2_PREGRASP",
            "GRASP_BALL_2",
            "HOLD_BALL_2_3S",
            "PLAN_TO_BASKET_2",
            "RELEASE_BALL_2",
            "VERIFY_BALL_2_DROP",
            "SCAN_TABLE_OBJECTS",
            "ASSIGN_BOTTLES_AND_CUPS",
            "GRASP_WATER_BOTTLE_BODY",
            "GRASP_WATER_CAP",
            "OPEN_WATER_CAP",
            "PLACE_WATER_CAP",
            "GRASP_WATER_CUP",
            "PLAN_WATER_PREPOUR",
            "EXECUTE_WATER_POUR",
            "PLACE_WATER_BOTTLE",
            "PLACE_WATER_CUP",
            "GRASP_COLA_BOTTLE_BODY",
            "GRASP_COLA_CAP",
            "OPEN_COLA_CAP",
            "PLACE_COLA_CAP",
            "GRASP_COLA_CUP",
            "PLAN_COLA_PREPOUR",
            "EXECUTE_COLA_POUR",
            "PLACE_COLA_BOTTLE",
            "PLACE_COLA_CUP",
            "PARK",
            "DONE",
        ]

        result = RunCompetition.Result()
        feedback = RunCompetition.Feedback()

        total = len(states)
        for index, state in enumerate(states, start=1):
            if goal_handle.is_cancel_requested:
                goal_handle.canceled()
                result.success = False
                result.message = f"任务在 {state} 被取消"
                return result

            feedback.state = state
            feedback.detail = (
                f"scene_objects={len(self._scene_cache.objects)}, "
                f"grasp_targets={len(self._grasp_targets)}, step={index}/{total}"
            )
            goal_handle.publish_feedback(feedback)
            self._publish_event(state, "enter", "info", feedback.detail)

        goal_handle.succeed()
        result.success = True
        result.message = "比赛状态机骨架已完整执行"
        return result

    def _publish_event(self, state: str, event: str, level: str, detail: str) -> None:
        message = TaskEvent()
        message.header.stamp = self.get_clock().now().to_msg()
        message.header.frame_id = "world"
        message.state = state
        message.event = event
        message.level = level
        message.detail = detail
        self._event_publisher.publish(message)


def main() -> None:
    rclpy.init()
    node = DualArmTaskManagerNode()
    executor = MultiThreadedExecutor()
    executor.add_node(node)
    try:
        executor.spin()
    finally:
        executor.shutdown()
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    main()
