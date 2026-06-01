#!/usr/bin/python3

from __future__ import annotations

import math
from typing import Dict, List, Optional

from moveit_msgs.srv import GetPositionFK
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import JointState

from robo_ctrl.msg import RobotState

from .config import load_config


LEFT_NAMES = [f"left_j{index}" for index in range(1, 7)]
RIGHT_NAMES = [f"right_j{index}" for index in range(1, 7)]


class SimRobotStatePublisher(Node):
    def __init__(self) -> None:
        super().__init__("sim_robot_state_publisher")
        self.declare_parameter("config_file", "")
        self.declare_parameter("publish_rate_hz", 0.0)
        self.declare_parameter("use_moveit_fk_service", True)
        self.declare_parameter("fk_service_name", "/compute_fk")
        self.declare_parameter("fk_frame_id", "world")
        self.declare_parameter("fk_service_wait_timeout_s", 0.02)
        self.declare_parameter("fk_call_timeout_s", 0.25)
        self.declare_parameter("fk_request_period_s", 0.10)
        config = load_config(str(self.get_parameter("config_file").value))
        sim_config = config.get("sim", {})
        publish_rate = float(self.get_parameter("publish_rate_hz").value) or float(sim_config.get("publish_rate_hz", 20.0))
        self._use_moveit_fk_service = self._param_bool(
            self.get_parameter("use_moveit_fk_service").value,
            bool(sim_config.get("use_moveit_fk_service", True)),
        )
        self._fk_frame_id = str(self.get_parameter("fk_frame_id").value or sim_config.get("fk_frame_id", "world"))
        self._fk_call_timeout_s = float(self.get_parameter("fk_call_timeout_s").value)
        self._fk_request_period_s = float(self.get_parameter("fk_request_period_s").value)

        self._joint_positions: Dict[str, List[float]] = {
            "left_arm": [0.0] * 6,
            "right_arm": [0.0] * 6,
        }
        self._tcp_xyz_m: Dict[str, List[float]] = {
            "left_arm": [0.35, 0.22, 0.35],
            "right_arm": [0.35, -0.22, 0.35],
        }
        self._tcp_rpy_deg: Dict[str, List[float]] = {
            "left_arm": [180.0, 0.0, -90.0],
            "right_arm": [180.0, 0.0, 90.0],
        }
        self._fk_future = None
        self._last_fk_request_ns = 0
        self._fk_service_available: Optional[bool] = None

        self._left_joint_pub = self.create_publisher(JointState, "/L/joint_states", 10)
        self._right_joint_pub = self.create_publisher(JointState, "/R/joint_states", 10)
        self._left_state_pub = self.create_publisher(RobotState, "/L/robot_state", 10)
        self._right_state_pub = self.create_publisher(RobotState, "/R/robot_state", 10)
        self._fk_client = self.create_client(GetPositionFK, str(self.get_parameter("fk_service_name").value))
        self.create_subscription(JointState, "/simulation/left_joint_state_setpoint", lambda msg: self._set_joint("left_arm", msg), 10)
        self.create_subscription(JointState, "/simulation/right_joint_state_setpoint", lambda msg: self._set_joint("right_arm", msg), 10)
        self.create_timer(1.0 / max(publish_rate, 1.0), self._publish)
        self.get_logger().info(
            f"sim_robot_state_publisher 已启动，publish_rate_hz={publish_rate:.1f}, "
            f"use_moveit_fk_service={self._use_moveit_fk_service}"
        )

    def _set_joint(self, arm: str, message: JointState) -> None:
        if len(message.position) >= 6:
            self._joint_positions[arm] = [float(value) for value in message.position[:6]]
        # 这里不是物理 FK，只给 sim truth 一个随轨迹变化的 TCP 近似值；正式碰撞/IK 仍由 MoveIt 负责。
        side_y = 0.22 if arm == "left_arm" else -0.22
        shoulder = self._joint_positions[arm][0] if self._joint_positions[arm] else 0.0
        elbow = self._joint_positions[arm][2] if len(self._joint_positions[arm]) > 2 else 0.0
        self._tcp_xyz_m[arm] = [
            0.45 + 0.05 * math.cos(shoulder),
            side_y + 0.05 * math.sin(shoulder),
            0.35 + 0.04 * math.sin(elbow),
        ]

    def _publish(self) -> None:
        self._maybe_update_fk_from_moveit()
        stamp = self.get_clock().now().to_msg()
        self._left_joint_pub.publish(self._joint_state("left_arm", LEFT_NAMES, stamp))
        self._right_joint_pub.publish(self._joint_state("right_arm", RIGHT_NAMES, stamp))
        self._left_state_pub.publish(self._robot_state("left_arm", stamp))
        self._right_state_pub.publish(self._robot_state("right_arm", stamp))

    def _joint_state(self, arm: str, names: List[str], stamp) -> JointState:
        msg = JointState()
        msg.header.stamp = stamp
        msg.name = list(names)
        msg.position = list(self._joint_positions[arm])
        msg.velocity = [0.0] * 6
        msg.effort = [0.0] * 6
        return msg

    def _robot_state(self, arm: str, stamp) -> RobotState:
        msg = RobotState()
        msg.header.stamp = stamp
        joints = self._joint_positions[arm]
        msg.joint_position.j1 = math.degrees(joints[0])
        msg.joint_position.j2 = math.degrees(joints[1])
        msg.joint_position.j3 = math.degrees(joints[2])
        msg.joint_position.j4 = math.degrees(joints[3])
        msg.joint_position.j5 = math.degrees(joints[4])
        msg.joint_position.j6 = math.degrees(joints[5])
        xyz = self._tcp_xyz_m[arm]
        rpy = self._tcp_rpy_deg[arm]
        msg.tcp_pose.x = xyz[0] * 1000.0
        msg.tcp_pose.y = xyz[1] * 1000.0
        msg.tcp_pose.z = xyz[2] * 1000.0
        msg.tcp_pose.rx = rpy[0]
        msg.tcp_pose.ry = rpy[1]
        msg.tcp_pose.rz = rpy[2]
        msg.motion_done = True
        msg.error_code = 0
        return msg

    def _maybe_update_fk_from_moveit(self) -> None:
        if not self._use_moveit_fk_service:
            return
        now_ns = self.get_clock().now().nanoseconds
        if self._fk_future is not None:
            if self._fk_future.done():
                response = self._fk_future.result()
                self._fk_future = None
                if response is not None and int(response.error_code.val) == 1:
                    self._apply_fk_response(response)
            elif now_ns - self._last_fk_request_ns > int(self._fk_call_timeout_s * 1_000_000_000):
                self._fk_future = None
            return
        if now_ns - self._last_fk_request_ns < int(self._fk_request_period_s * 1_000_000_000):
            return
        wait_timeout = float(self.get_parameter("fk_service_wait_timeout_s").value)
        if not self._fk_client.wait_for_service(timeout_sec=wait_timeout):
            if self._fk_service_available is not False:
                self.get_logger().warn("/compute_fk 不可用，sim TCP 暂用近似值直到 MoveIt FK service 就绪")
            self._fk_service_available = False
            self._last_fk_request_ns = now_ns
            return
        self._fk_service_available = True
        request = GetPositionFK.Request()
        request.header.frame_id = self._fk_frame_id
        request.header.stamp = self.get_clock().now().to_msg()
        request.fk_link_names = ["left_tcp", "right_tcp"]
        request.robot_state.is_diff = True
        request.robot_state.joint_state.header = request.header
        request.robot_state.joint_state.name = LEFT_NAMES + RIGHT_NAMES
        request.robot_state.joint_state.position = self._joint_positions["left_arm"] + self._joint_positions["right_arm"]
        self._fk_future = self._fk_client.call_async(request)
        self._last_fk_request_ns = now_ns

    def _apply_fk_response(self, response) -> None:
        for link_name, pose_stamped in zip(response.fk_link_names, response.pose_stamped):
            arm = "left_arm" if link_name == "left_tcp" else "right_arm" if link_name == "right_tcp" else ""
            if not arm:
                continue
            pose = pose_stamped.pose
            self._tcp_xyz_m[arm] = [
                float(pose.position.x),
                float(pose.position.y),
                float(pose.position.z),
            ]
            self._tcp_rpy_deg[arm] = list(self._quaternion_to_rpy_degrees(
                float(pose.orientation.x),
                float(pose.orientation.y),
                float(pose.orientation.z),
                float(pose.orientation.w),
            ))

    @staticmethod
    def _quaternion_to_rpy_degrees(x: float, y: float, z: float, w: float) -> tuple[float, float, float]:
        sinr_cosp = 2.0 * (w * x + y * z)
        cosr_cosp = 1.0 - 2.0 * (x * x + y * y)
        roll = math.atan2(sinr_cosp, cosr_cosp)
        sinp = 2.0 * (w * y - z * x)
        if abs(sinp) >= 1.0:
            pitch = math.copysign(math.pi / 2.0, sinp)
        else:
            pitch = math.asin(sinp)
        siny_cosp = 2.0 * (w * z + x * y)
        cosy_cosp = 1.0 - 2.0 * (y * y + z * z)
        yaw = math.atan2(siny_cosp, cosy_cosp)
        return math.degrees(roll), math.degrees(pitch), math.degrees(yaw)

    @staticmethod
    def _param_bool(value, default: bool) -> bool:
        if value is None:
            return default
        if isinstance(value, bool):
            return value
        return str(value).strip().lower() in {"1", "true", "yes", "on"}


def main() -> None:
    rclpy.init()
    node = SimRobotStatePublisher()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    main()
