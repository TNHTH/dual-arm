#!/usr/bin/python3

from __future__ import annotations

import json
import time
from typing import Dict

import rclpy
from rclpy.node import Node
from std_msgs.msg import String

from .config import load_config


class SimPourStateManager(Node):
    def __init__(self) -> None:
        super().__init__("sim_pour_state_manager")
        self.declare_parameter("config_file", "")
        self.declare_parameter("pour_state_topic", "/competition/pour_state")
        self.declare_parameter("pour_event_topic", "/simulation/pour_event")
        self._config = load_config(str(self.get_parameter("config_file").value))
        sim_config = self._config.get("sim", {})
        self._min_hold_duration_s = float(sim_config.get("pour_min_hold_duration_s", 1.5))
        self._min_evidence_confidence = float(sim_config.get("pour_min_evidence_confidence", 0.65))
        self._nominal_mass_g = float(sim_config.get("pour_nominal_mass_g", 120.0))
        self._publisher = self.create_publisher(String, str(self.get_parameter("pour_state_topic").value), 10)
        self.create_subscription(String, str(self.get_parameter("pour_event_topic").value), self._handle_event, 10)
        self._last_state: Dict[str, object] = {
            "bottle": "",
            "cup": "",
            "tilt_started": False,
            "hold_duration_s": 0.0,
            "fill_target_reached": False,
            "spill_detected": False,
            "estimated_poured_mass_g": 0.0,
            "evidence_confidence": 0.0,
            "failure_reason": "no_pour_event",
            "stamp": 0.0,
        }
        self.create_timer(0.5, self._publish_last)
        self.get_logger().info("sim_pour_state_manager 已启动，发布 /competition/pour_state JSON")

    def _handle_event(self, message: String) -> None:
        try:
            event = json.loads(message.data)
        except json.JSONDecodeError:
            self.get_logger().warn(f"忽略非法 pour_event JSON: {message.data}")
            return
        hold_duration_s = float(event.get("hold_duration_s", 0.0))
        confidence = float(event.get("evidence_confidence", 0.0))
        waypoint_count = int(event.get("tilt_waypoint_count", 0))
        motion_success = bool(event.get("motion_success", True))
        spill_detected = bool(event.get("spill_detected", False))
        fill_target_reached = (
            motion_success
            and not spill_detected
            and hold_duration_s >= self._min_hold_duration_s
            and confidence >= self._min_evidence_confidence
            and waypoint_count > 0
        )
        failure_reason = ""
        if not fill_target_reached:
            if not motion_success:
                failure_reason = "motion_failed"
            elif spill_detected:
                failure_reason = "spill_detected"
            elif hold_duration_s < self._min_hold_duration_s:
                failure_reason = "hold_duration_too_short"
            elif confidence < self._min_evidence_confidence:
                failure_reason = "evidence_confidence_low"
            else:
                failure_reason = "missing_tilt_waypoints"
        estimated_mass = self._nominal_mass_g * min(hold_duration_s / self._min_hold_duration_s, 1.0) if fill_target_reached else 0.0
        self._last_state = {
            "bottle": str(event.get("bottle", event.get("object_id", ""))),
            "cup": str(event.get("cup", event.get("reference_object_id", ""))),
            "tilt_started": True,
            "hold_duration_s": hold_duration_s,
            "fill_target_reached": fill_target_reached,
            "spill_detected": spill_detected,
            "estimated_poured_mass_g": estimated_mass,
            "evidence_confidence": confidence,
            "failure_reason": failure_reason,
            "stamp": time.time(),
        }
        self._publish_last()

    def _publish_last(self) -> None:
        msg = String()
        msg.data = json.dumps(self._last_state, ensure_ascii=False)
        self._publisher.publish(msg)


def main() -> None:
    rclpy.init()
    node = SimPourStateManager()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    main()
