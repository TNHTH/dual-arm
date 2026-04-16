#!/usr/bin/env python3

import rclpy
from rclpy.node import Node

from dualarm_interfaces.msg import SceneObjectArray


class EmptyScenePublisher(Node):
    def __init__(self):
        super().__init__("empty_scene_publisher")
        self.publisher = self.create_publisher(SceneObjectArray, "/scene_fusion/scene_objects", 10)
        self.timer = self.create_timer(0.1, self.publish_scene)
        self.get_logger().info("发布空场景到 /scene_fusion/scene_objects，频率 10Hz")

    def publish_scene(self):
        msg = SceneObjectArray()
        msg.header.stamp = self.get_clock().now().to_msg()
        msg.header.frame_id = "world"
        self.publisher.publish(msg)


def main():
    rclpy.init()
    node = EmptyScenePublisher()
    try:
        rclpy.spin(node)
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    main()
