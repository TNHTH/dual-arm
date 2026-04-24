from __future__ import annotations

import json
from typing import Any

import rclpy
from rclpy.action import ActionClient
from rclpy.node import Node
from std_msgs.msg import String

from dualarm_interfaces.action import RunCompetition
from dualarm_interfaces.msg import TaskEvent
from dualarm_interfaces.srv import TaskCommand

from competition_rviz_tools import COMMAND_CLEAR_SELECTION
from competition_rviz_tools import COMMAND_PAUSE_COMPETITION
from competition_rviz_tools import COMMAND_REFRESH_SCENE
from competition_rviz_tools import COMMAND_RUN_COMPETITION
from competition_rviz_tools import COMMAND_SELECT_GRASP_TARGET
from competition_rviz_tools import COMMAND_STOP_COMPETITION
from competition_rviz_tools import DEFAULT_COMMAND_TOPIC
from competition_rviz_tools import DEFAULT_RUN_ACTION
from competition_rviz_tools import DEFAULT_TASK_EVENT_TOPIC
from competition_rviz_tools import OPERATOR_COMMANDS


class RvizTaskBridge(Node):
    """把 RViz 菜单命令转成任务层事件，并预留 RunCompetition action 接入点。"""

    def __init__(self) -> None:
        super().__init__("rviz_task_bridge")
        self.declare_parameter("command_topic", DEFAULT_COMMAND_TOPIC)
        self.declare_parameter("task_event_topic", DEFAULT_TASK_EVENT_TOPIC)
        self.declare_parameter("run_action_name", DEFAULT_RUN_ACTION)
        self.declare_parameter("default_requested_order", "handover,pouring")
        self.declare_parameter("enable_action_bridge", False)
        self.declare_parameter("action_wait_timeout_s", 0.5)
        self.declare_parameter("dry_run", True)

        self._command_topic = str(self.get_parameter("command_topic").value)
        self._task_event_topic = str(self.get_parameter("task_event_topic").value)
        self._run_action_name = str(self.get_parameter("run_action_name").value)
        self._default_requested_order = str(self.get_parameter("default_requested_order").value)
        self._enable_action_bridge = bool(self.get_parameter("enable_action_bridge").value)
        self._action_wait_timeout_s = float(self.get_parameter("action_wait_timeout_s").value)
        self._dry_run = bool(self.get_parameter("dry_run").value)

        self._task_event_pub = self.create_publisher(TaskEvent, self._task_event_topic, 10)
        self._command_echo_pub = self.create_publisher(String, self._command_topic + "/echo", 10)
        self._run_client = ActionClient(self, RunCompetition, self._run_action_name)
        self._task_command_client = self.create_client(TaskCommand, "/task/command")
        self.create_subscription(String, self._command_topic, self._handle_command, 10)

        self.get_logger().info(
            "RViz task bridge 已启动: "
            f"command_topic={self._command_topic}, "
            f"task_event_topic={self._task_event_topic}, "
            f"enable_action_bridge={self._enable_action_bridge}, dry_run={self._dry_run}"
        )

    def _handle_command(self, message: String) -> None:
        payload = self._decode_command_payload(message.data)
        command = str(payload.get("command", "")).strip()
        if command not in OPERATOR_COMMANDS:
            self._publish_task_event("operator_command_rejected", "warn", f"未知 RViz 命令: {message.data}")
            return

        self._command_echo_pub.publish(String(data=json.dumps(payload, ensure_ascii=False, sort_keys=True)))
        self._publish_task_event("operator_command_received", "info", json.dumps(payload, ensure_ascii=False))

        if command == COMMAND_RUN_COMPETITION:
            self._handle_run_competition(payload)
        elif command in (COMMAND_PAUSE_COMPETITION, COMMAND_STOP_COMPETITION):
            self._publish_task_event(command, "warn", "当前骨架仅发布事件，停止/暂停执行接口待 v4 控制面接入")
        elif command in (COMMAND_REFRESH_SCENE, COMMAND_SELECT_GRASP_TARGET, COMMAND_CLEAR_SELECTION):
            self._publish_task_event(command, "info", "当前骨架仅发布事件，场景选择接口待后续控制面接入")
        else:
            self._handle_task_command(payload)

    def _handle_run_competition(self, payload: dict[str, Any]) -> None:
        if self._dry_run or not self._enable_action_bridge:
            self._publish_task_event(
                COMMAND_RUN_COMPETITION,
                "info",
                "dry_run 或 enable_action_bridge=false，未发送 RunCompetition goal",
            )
            return

        if not self._run_client.wait_for_server(timeout_sec=self._action_wait_timeout_s):
            self._publish_task_event(COMMAND_RUN_COMPETITION, "error", f"RunCompetition action 不可用: {self._run_action_name}")
            return

        goal = RunCompetition.Goal()
        goal.start_immediately = True
        goal.requested_order = str(payload.get("requested_order", self._default_requested_order))
        goal.resume_from_checkpoint = bool(payload.get("resume_from_checkpoint", False))
        goal.checkpoint_id = str(payload.get("checkpoint_id", ""))
        goal.allow_reconcile = bool(payload.get("allow_reconcile", True))

        send_future = self._run_client.send_goal_async(goal, feedback_callback=self._handle_run_feedback)
        send_future.add_done_callback(self._handle_run_goal_response)
        self._publish_task_event(COMMAND_RUN_COMPETITION, "info", f"已发送 RunCompetition goal: {goal.requested_order}")

    def _handle_run_goal_response(self, future) -> None:
        try:
            goal_handle = future.result()
        except Exception as exc:  # pylint: disable=broad-except
            self._publish_task_event(COMMAND_RUN_COMPETITION, "error", f"RunCompetition goal 发送异常: {exc}")
            return

        if not goal_handle.accepted:
            self._publish_task_event(COMMAND_RUN_COMPETITION, "error", "RunCompetition goal 被拒绝")
            return

        self._publish_task_event(COMMAND_RUN_COMPETITION, "info", "RunCompetition goal 已接受")
        result_future = goal_handle.get_result_async()
        result_future.add_done_callback(self._handle_run_result)

    def _handle_run_result(self, future) -> None:
        try:
            result = future.result().result
        except Exception as exc:  # pylint: disable=broad-except
            self._publish_task_event(COMMAND_RUN_COMPETITION, "error", f"RunCompetition result 获取异常: {exc}")
            return

        level = "info" if result.success else "error"
        detail = (
            f"success={result.success}, message={result.message}, "
            f"final_checkpoint_id={result.final_checkpoint_id}, resume_hint={result.resume_hint}"
        )
        self._publish_task_event(COMMAND_RUN_COMPETITION, level, detail)

    def _handle_run_feedback(self, feedback_message) -> None:
        feedback = feedback_message.feedback
        self._publish_task_event(feedback.state, "info", feedback.detail)

    def _publish_task_event(self, event: str, level: str, detail: str) -> None:
        task_event = TaskEvent()
        task_event.header.stamp = self.get_clock().now().to_msg()
        task_event.header.frame_id = "rviz_operator"
        task_event.state = "operator"
        task_event.event = event
        task_event.level = level
        task_event.detail = detail
        self._task_event_pub.publish(task_event)

    def _handle_task_command(self, payload: dict[str, Any]) -> None:
        command = str(payload.get("command", "")).strip()
        if self._dry_run or not self._enable_action_bridge:
            self._publish_task_event(command, "info", "dry_run 或 enable_action_bridge=false，未发送 TaskCommand")
            return
        if not self._task_command_client.wait_for_service(timeout_sec=self._action_wait_timeout_s):
            self._publish_task_event(command, "error", "TaskCommand service 不可用")
            return
        request = TaskCommand.Request()
        request.command_id = command
        request.object_id = str(payload.get("object_id", ""))
        request.arm_group = str(payload.get("arm_group", ""))
        request.target_profile = str(payload.get("target_profile", ""))
        request.dry_run = False
        future = self._task_command_client.call_async(request)
        future.add_done_callback(lambda f: self._handle_task_command_result(command, f))

    def _handle_task_command_result(self, command: str, future) -> None:
        try:
            response = future.result()
        except Exception as exc:  # pylint: disable=broad-except
            self._publish_task_event(command, "error", f"TaskCommand 调用异常: {exc}")
            return
        level = "info" if response.success else "error"
        detail = f"success={response.success}, active_state={response.active_state}, message={response.message}"
        self._publish_task_event(command, level, detail)

    @staticmethod
    def _decode_command_payload(raw: str) -> dict[str, Any]:
        stripped = raw.strip()
        if not stripped:
            return {"command": ""}
        if stripped.startswith("{"):
            try:
                payload = json.loads(stripped)
            except json.JSONDecodeError:
                return {"command": stripped}
            if isinstance(payload, dict):
                payload["command"] = str(payload.get("command", "")).strip()
                return payload
        return {"command": stripped}


def main(args: list[str] | None = None) -> None:
    rclpy.init(args=args)
    node = RvizTaskBridge()
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
