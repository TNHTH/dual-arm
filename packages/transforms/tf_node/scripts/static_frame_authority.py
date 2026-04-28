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
        self.declare_parameter("require_verified_calibration", True)
        self.declare_parameter("allow_unverified_extrinsics", False)
        self.declare_parameter("required_calibration_status", "verified")
        self._broadcaster = StaticTransformBroadcaster(self)
        self._publish_static_transforms()

    def _publish_static_transforms(self) -> None:
        config_file = self.get_parameter("config_file").value
        transforms = self._load_config(config_file)
        require_verified = bool(self.get_parameter("require_verified_calibration").value)
        allow_unverified = bool(self.get_parameter("allow_unverified_extrinsics").value)
        required_status = str(self.get_parameter("required_calibration_status").value)
        messages: List[TransformStamped] = []
        now = self.get_clock().now().to_msg()
        skipped: List[str] = []

        for item in transforms:
            requires_calibration = bool(item.get("requires_calibration", False))
            calibration_status = str(item.get("calibration_status", "structural"))
            relation = f"{item['parent']}->{item['child']}"
            if requires_calibration and require_verified and calibration_status != required_status:
                if not allow_unverified:
                    skipped.append(f"{relation}({calibration_status})")
                    continue
                self.get_logger().warn(f"UNVERIFIED EXTRINSIC: {relation} status={calibration_status}")
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
        if skipped:
            self.get_logger().warn(
                "以下 TF 因 calibration status 未满足要求而未发布: " + ", ".join(skipped)
            )

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
