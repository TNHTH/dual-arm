#!/usr/bin/python3

import math
import pathlib
from typing import Dict, List

import rclpy
import yaml
from geometry_msgs.msg import TransformStamped
from rclpy.node import Node
from tf2_ros.static_transform_broadcaster import StaticTransformBroadcaster


def quaternion_from_rpy(roll: float, pitch: float, yaw: float):
    cy = math.cos(yaw * 0.5)
    sy = math.sin(yaw * 0.5)
    cp = math.cos(pitch * 0.5)
    sp = math.sin(pitch * 0.5)
    cr = math.cos(roll * 0.5)
    sr = math.sin(roll * 0.5)
    return (
        sr * cp * cy - cr * sp * sy,
        cr * sp * cy + sr * cp * sy,
        cr * cp * sy - sr * sp * cy,
        cr * cp * cy + sr * sp * sy,
    )


class StaticFrameAuthorityNode(Node):
    def __init__(self) -> None:
        super().__init__("tf_frame_authority")
        self.declare_parameter("config_file", "")
        self._broadcaster = StaticTransformBroadcaster(self)
        self._publish_static_transforms()

    def _publish_static_transforms(self) -> None:
        config_file = self.get_parameter("config_file").value
        transforms = self._load_config(config_file)
        messages: List[TransformStamped] = []
        now = self.get_clock().now().to_msg()

        for item in transforms:
            message = TransformStamped()
            message.header.stamp = now
            message.header.frame_id = item["parent"]
            message.child_frame_id = item["child"]
            tx, ty, tz = item.get("translation", [0.0, 0.0, 0.0])
            rr, rp, ry = item.get("rotation_rpy", [0.0, 0.0, 0.0])
            qx, qy, qz, qw = quaternion_from_rpy(rr, rp, ry)

            message.transform.translation.x = float(tx)
            message.transform.translation.y = float(ty)
            message.transform.translation.z = float(tz)
            message.transform.rotation.x = qx
            message.transform.rotation.y = qy
            message.transform.rotation.z = qz
            message.transform.rotation.w = qw
            messages.append(message)

        self._broadcaster.sendTransform(messages)
        self.get_logger().info(f"已发布 {len(messages)} 条静态 TF")

    def _load_config(self, config_file: str) -> List[Dict]:
        if not config_file:
            return []
        path = pathlib.Path(config_file)
        if not path.is_file():
            self.get_logger().warn(f"TF 配置文件不存在: {config_file}")
            return []
        with path.open("r", encoding="utf-8") as handle:
            data = yaml.safe_load(handle) or {}
        return data.get("transforms", [])


def main() -> None:
    rclpy.init()
    node = StaticFrameAuthorityNode()
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
