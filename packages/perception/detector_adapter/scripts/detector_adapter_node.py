#!/usr/bin/python3

import pathlib
from typing import Dict

import rclpy
import yaml
from rclpy.node import Node

from detector.msg import Bbox2dArray
from dualarm_interfaces.msg import Detection2D, Detection2DArray


class DetectorAdapterNode(Node):
    def __init__(self) -> None:
        super().__init__("detector_adapter")
        self.declare_parameter("input_topic", "/detector/detections")
        self.declare_parameter("output_topic", "/perception/detection_2d")
        self.declare_parameter("class_map_file", "")

        self._class_map = self._load_class_map(
            self.get_parameter("class_map_file").get_parameter_value().string_value
        )

        input_topic = self.get_parameter("input_topic").get_parameter_value().string_value
        output_topic = self.get_parameter("output_topic").get_parameter_value().string_value

        self._publisher = self.create_publisher(Detection2DArray, output_topic, 10)
        self.create_subscription(Bbox2dArray, input_topic, self._handle_detections, 10)

        self.get_logger().info(
            f"detector_adapter 已启动，输入: {input_topic}，输出: {output_topic}，类别映射: {self._class_map}"
        )

    def _load_class_map(self, mapping_file: str) -> Dict[int, str]:
        default_map = {0: "water_bottle", 1: "cola_bottle", 2: "cup"}
        if not mapping_file:
            return default_map

        path = pathlib.Path(mapping_file)
        if not path.is_file():
            self.get_logger().warn(f"类别映射文件不存在，使用默认映射: {mapping_file}")
            return default_map

        try:
            with path.open("r", encoding="utf-8") as handle:
                data = yaml.safe_load(handle) or {}
            raw_map = data.get("class_map", {})
            return {int(key): str(value) for key, value in raw_map.items()} or default_map
        except Exception as exc:  # pylint: disable=broad-except
            self.get_logger().warn(f"读取类别映射失败，使用默认映射: {exc}")
            return default_map

    def _handle_detections(self, message: Bbox2dArray) -> None:
        normalized = Detection2DArray()
        normalized.header = message.header

        for item in message.results:
            detection = Detection2D()
            detection.header = message.header
            detection.semantic_type = self._class_map.get(item.class_id, f"class_{item.class_id}")
            detection.source = "detector"
            detection.x = item.x
            detection.y = item.y
            detection.width = item.width
            detection.height = item.height
            detection.score = item.score
            normalized.detections.append(detection)

        self._publisher.publish(normalized)


def main() -> None:
    rclpy.init()
    node = DetectorAdapterNode()
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
