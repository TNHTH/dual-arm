#!/usr/bin/python3

from __future__ import annotations

import json
import shutil
from pathlib import Path
from typing import Optional

import cv2
import numpy as np
import rclpy
from cv_bridge import CvBridge
from geometry_msgs.msg import TransformStamped
from rclpy.duration import Duration
from rclpy.node import Node
from rclpy.time import Time
from sensor_msgs.msg import Image
from tf2_ros import Buffer, TransformException, TransformListener

from dualarm_interfaces.msg import SceneObjectArray
from robo_ctrl.msg import RobotState


class TableCalibrationCaptureNode(Node):
    def __init__(self) -> None:
        super().__init__("capture_table_calibration_sample")
        self.declare_parameter("output_dir", ".artifacts/calibration/left_camera")
        self.declare_parameter("sample_label", "")
        self.declare_parameter("timeout_sec", 8.0)
        self.declare_parameter("world_frame", "world")
        self.declare_parameter("left_tcp_frame", "left_tcp")
        self.declare_parameter("left_camera_depth_frame", "left_camera_depth_frame")
        self.declare_parameter("color_topic", "/camera/color/image_raw")
        self.declare_parameter("depth_topic", "/camera/depth/image_raw")
        self.declare_parameter("rgb_overlay_topic", "/perception/pick_assist/rgb_overlay")
        self.declare_parameter("color_guided_overlay_topic", "/perception/table_surface/color_guided_overlay")
        self.declare_parameter("depth_confirmed_overlay_topic", "/perception/table_surface/depth_confirmed_overlay")
        self.declare_parameter("table_scene_topic", "/perception/table_scene_objects")
        self.declare_parameter("robot_state_topic", "/L/robot_state")
        self.declare_parameter(
            "debug_result_json",
            ".artifacts/camera_debug/table_surface_detector/latest_result.json",
        )

        self._bridge = CvBridge()
        self._tf_buffer = Buffer()
        self._tf_listener = TransformListener(self._tf_buffer, self)

        self._color: Optional[Image] = None
        self._depth: Optional[Image] = None
        self._rgb_overlay: Optional[Image] = None
        self._color_guided_overlay: Optional[Image] = None
        self._depth_confirmed_overlay: Optional[Image] = None
        self._table_scene: Optional[SceneObjectArray] = None
        self._robot_state: Optional[RobotState] = None

        self.create_subscription(Image, str(self.get_parameter("color_topic").value), self._color_cb, 10)
        self.create_subscription(Image, str(self.get_parameter("depth_topic").value), self._depth_cb, 10)
        self.create_subscription(Image, str(self.get_parameter("rgb_overlay_topic").value), self._rgb_overlay_cb, 10)
        self.create_subscription(
            Image,
            str(self.get_parameter("color_guided_overlay_topic").value),
            self._color_guided_overlay_cb,
            10,
        )
        self.create_subscription(
            Image,
            str(self.get_parameter("depth_confirmed_overlay_topic").value),
            self._depth_confirmed_overlay_cb,
            10,
        )
        self.create_subscription(
            SceneObjectArray,
            str(self.get_parameter("table_scene_topic").value),
            self._table_scene_cb,
            10,
        )
        self.create_subscription(
            RobotState,
            str(self.get_parameter("robot_state_topic").value),
            self._robot_state_cb,
            10,
        )

    def _color_cb(self, message: Image) -> None:
        self._color = message

    def _depth_cb(self, message: Image) -> None:
        self._depth = message

    def _rgb_overlay_cb(self, message: Image) -> None:
        self._rgb_overlay = message

    def _color_guided_overlay_cb(self, message: Image) -> None:
        self._color_guided_overlay = message

    def _depth_confirmed_overlay_cb(self, message: Image) -> None:
        self._depth_confirmed_overlay = message

    def _table_scene_cb(self, message: SceneObjectArray) -> None:
        self._table_scene = message

    def _robot_state_cb(self, message: RobotState) -> None:
        self._robot_state = message

    def capture(self) -> int:
        timeout_sec = float(self.get_parameter("timeout_sec").value)
        deadline = self.get_clock().now() + Duration(seconds=timeout_sec)
        while self.get_clock().now() < deadline:
            rclpy.spin_once(self, timeout_sec=0.1)
            if self._ready():
                return self._write_sample()
        self.get_logger().error("等待桌面标定采样输入超时")
        return 2

    def _ready(self) -> bool:
        if any(
            item is None
            for item in (
                self._color,
                self._depth,
                self._rgb_overlay,
                self._color_guided_overlay,
                self._depth_confirmed_overlay,
                self._table_scene,
                self._robot_state,
            )
        ):
            return False
        return self._latest_table_object() is not None

    def _latest_table_object(self):
        if self._table_scene is None:
            return None
        for scene_object in self._table_scene.objects:
            if scene_object.semantic_type == "table_surface":
                return scene_object
        return None

    def _write_sample(self) -> int:
        sample_label = str(self.get_parameter("sample_label").value).strip()
        if not sample_label:
            sample_label = self.get_clock().now().to_msg().sec.__format__("d")
            sample_label = f"sample_{sample_label}_{self.get_clock().now().nanoseconds % 1_000_000_000:09d}"
        output_dir = Path(str(self.get_parameter("output_dir").value)).expanduser().resolve()
        sample_dir = output_dir / sample_label
        sample_dir.mkdir(parents=True, exist_ok=True)

        color = self._bridge.imgmsg_to_cv2(self._color, desired_encoding="bgr8")
        depth = self._bridge.imgmsg_to_cv2(self._depth, desired_encoding="passthrough")
        rgb_overlay = self._bridge.imgmsg_to_cv2(self._rgb_overlay, desired_encoding="bgr8")
        color_guided = self._bridge.imgmsg_to_cv2(self._color_guided_overlay, desired_encoding="bgr8")
        depth_confirmed = self._bridge.imgmsg_to_cv2(self._depth_confirmed_overlay, desired_encoding="bgr8")

        cv2.imwrite(str(sample_dir / "color.png"), color)
        cv2.imwrite(str(sample_dir / "rgb_overlay.png"), rgb_overlay)
        cv2.imwrite(str(sample_dir / "color_guided_overlay.png"), color_guided)
        cv2.imwrite(str(sample_dir / "depth_confirmed_overlay.png"), depth_confirmed)
        np.save(sample_dir / "depth.npy", np.array(depth))
        if isinstance(depth, np.ndarray) and depth.dtype == np.uint16:
            cv2.imwrite(str(sample_dir / "depth_u16.png"), depth)

        debug_json_path = Path(str(self.get_parameter("debug_result_json").value))
        debug_payload = {}
        if debug_json_path.is_file():
            debug_payload = json.loads(debug_json_path.read_text(encoding="utf-8"))
            shutil.copy2(debug_json_path, sample_dir / "table_surface_latest_result.json")

        table_object = self._latest_table_object()
        world_frame = str(self.get_parameter("world_frame").value)
        left_tcp_frame = str(self.get_parameter("left_tcp_frame").value)
        left_camera_depth_frame = str(self.get_parameter("left_camera_depth_frame").value)

        payload = {
            "sample_label": sample_label,
            "captured_at": self.get_clock().now().to_msg().sec,
            "world_frame": world_frame,
            "left_tcp_frame": left_tcp_frame,
            "left_camera_depth_frame": left_camera_depth_frame,
            "table_object": self._scene_object_dict(table_object),
            "debug_result": debug_payload,
            "robot_state": self._robot_state_dict(self._robot_state),
            "transforms": {
                "world_to_left_tcp": self._transform_dict(world_frame, left_tcp_frame),
                "world_to_left_camera_depth_frame": self._transform_dict(world_frame, left_camera_depth_frame),
                "left_tcp_to_left_camera_depth_frame": self._transform_dict(left_tcp_frame, left_camera_depth_frame),
            },
            "artifacts": {
                "color": "color.png",
                "depth_npy": "depth.npy",
                "rgb_overlay": "rgb_overlay.png",
                "color_guided_overlay": "color_guided_overlay.png",
                "depth_confirmed_overlay": "depth_confirmed_overlay.png",
            },
        }
        (sample_dir / "sample.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        self.get_logger().info(f"已保存桌面标定采样: {sample_dir}")
        return 0

    def _transform_dict(self, target_frame: str, source_frame: str):
        try:
            transform = self._tf_buffer.lookup_transform(
                target_frame,
                source_frame,
                Time(),
                timeout=Duration(seconds=0.3),
            )
            return self._serialize_transform(transform)
        except TransformException as exc:
            return {"error": str(exc)}

    def _serialize_transform(self, transform: TransformStamped) -> dict:
        return {
            "header": {
                "frame_id": transform.header.frame_id,
                "stamp": {
                    "sec": transform.header.stamp.sec,
                    "nanosec": transform.header.stamp.nanosec,
                },
            },
            "child_frame_id": transform.child_frame_id,
            "translation": {
                "x": transform.transform.translation.x,
                "y": transform.transform.translation.y,
                "z": transform.transform.translation.z,
            },
            "rotation": {
                "x": transform.transform.rotation.x,
                "y": transform.transform.rotation.y,
                "z": transform.transform.rotation.z,
                "w": transform.transform.rotation.w,
            },
        }

    def _scene_object_dict(self, scene_object) -> dict:
        if scene_object is None:
            return {}
        return {
            "id": scene_object.id,
            "semantic_type": scene_object.semantic_type,
            "frame_id": scene_object.pose.header.frame_id,
            "position": {
                "x": scene_object.pose.pose.position.x,
                "y": scene_object.pose.pose.position.y,
                "z": scene_object.pose.pose.position.z,
            },
            "orientation": {
                "x": scene_object.pose.pose.orientation.x,
                "y": scene_object.pose.pose.orientation.y,
                "z": scene_object.pose.pose.orientation.z,
                "w": scene_object.pose.pose.orientation.w,
            },
            "size": {
                "x": scene_object.size.x,
                "y": scene_object.size.y,
                "z": scene_object.size.z,
            },
            "confidence": float(scene_object.confidence),
            "lifecycle_state": scene_object.lifecycle_state,
            "subframes": [
                {
                    "name": item.name,
                    "frame_id": item.pose.header.frame_id,
                    "position": {
                        "x": item.pose.pose.position.x,
                        "y": item.pose.pose.position.y,
                        "z": item.pose.pose.position.z,
                    },
                    "orientation": {
                        "x": item.pose.pose.orientation.x,
                        "y": item.pose.pose.orientation.y,
                        "z": item.pose.pose.orientation.z,
                        "w": item.pose.pose.orientation.w,
                    },
                }
                for item in scene_object.subframes
            ],
        }

    def _robot_state_dict(self, state: Optional[RobotState]) -> dict:
        if state is None:
            return {}
        return {
            "frame_id": state.header.frame_id,
            "motion_done": bool(state.motion_done),
            "error_code": int(state.error_code),
            "joint_position": {
                "j1": state.joint_position.j1,
                "j2": state.joint_position.j2,
                "j3": state.joint_position.j3,
                "j4": state.joint_position.j4,
                "j5": state.joint_position.j5,
                "j6": state.joint_position.j6,
            },
            "tcp_pose": {
                "x": state.tcp_pose.x,
                "y": state.tcp_pose.y,
                "z": state.tcp_pose.z,
                "rx": state.tcp_pose.rx,
                "ry": state.tcp_pose.ry,
                "rz": state.tcp_pose.rz,
            },
        }


def main() -> None:
    rclpy.init()
    node = TableCalibrationCaptureNode()
    try:
        raise SystemExit(node.capture())
    finally:
        node.destroy_node()
        try:
            rclpy.shutdown()
        except Exception:  # pylint: disable=broad-except
            pass


if __name__ == "__main__":
    main()
