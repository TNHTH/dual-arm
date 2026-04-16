#!/usr/bin/python3

from __future__ import annotations

import ast
from pathlib import Path
from typing import Dict, List

import cv2
import rclpy
from ament_index_python.packages import get_package_share_directory
from cv_bridge import CvBridge
from rclpy.node import Node
from sensor_msgs.msg import Image

from detector.msg import Bbox2d, Bbox2dArray


class DetectorPtNode(Node):
    def __init__(self) -> None:
        super().__init__("detector_pt_node")

        self.declare_parameter("model_path", self._default_model_path())
        self.declare_parameter("confidence_threshold", 0.5)
        self.declare_parameter("image_topic", "/camera/color/image_raw")
        self.declare_parameter("detections_topic", "/detector/detections")
        self.declare_parameter("device", "")
        self.declare_parameter("publish_detection_image", True)
        self.declare_parameter("allowed_class_ids", "")
        self.declare_parameter("stable_frames", 3)
        self.declare_parameter("track_iou_threshold", 0.35)

        self._model_path = self.get_parameter("model_path").get_parameter_value().string_value
        self._confidence_threshold = (
            self.get_parameter("confidence_threshold").get_parameter_value().double_value
        )
        self._image_topic = self.get_parameter("image_topic").get_parameter_value().string_value
        self._detections_topic = self.get_parameter("detections_topic").get_parameter_value().string_value
        self._device = self.get_parameter("device").get_parameter_value().string_value
        self._publish_detection_image = (
            self.get_parameter("publish_detection_image").get_parameter_value().bool_value
        )
        allowed_class_ids_raw = self.get_parameter("allowed_class_ids").get_parameter_value().string_value
        self._allowed_class_ids = self._parse_allowed_class_ids(allowed_class_ids_raw)
        self._stable_frames = max(1, int(self.get_parameter("stable_frames").value))
        self._track_iou_threshold = float(self.get_parameter("track_iou_threshold").value)
        self._tracks: List[dict] = []

        model_file = Path(self._model_path)
        if not model_file.is_file():
            raise FileNotFoundError(f"模型文件不存在: {self._model_path}")

        try:
            import torch
            from ultralytics import YOLO
        except Exception as exc:  # pylint: disable=broad-except
            raise RuntimeError(
                "detector_pt_node 缺少运行依赖，请确保 ROS Python 环境已安装 torch 与 ultralytics"
            ) from exc

        if not self._device:
            self._device = "cuda:0" if torch.cuda.is_available() else "cpu"

        self._bridge = CvBridge()
        self._model = YOLO(self._model_path)
        self._class_names: Dict[int, str] = {
            int(index): str(name) for index, name in self._model.names.items()
        }

        self._detections_publisher = self.create_publisher(Bbox2dArray, self._detections_topic, 10)
        self._image_publisher = self.create_publisher(
            Image, f"{self._detections_topic}/image", 10
        )
        self.create_subscription(Image, self._image_topic, self._handle_image, 10)

        self.get_logger().info(
            f"detector_pt_node 已启动，模型: {self._model_path}，device: {self._device}，"
            f"图像输入: {self._image_topic}，检测输出: {self._detections_topic}，"
            f"类别: {self._class_names}，允许类别: "
            f"{sorted(self._allowed_class_ids) if self._allowed_class_ids else 'ALL'}，"
            f"稳定帧数: {self._stable_frames}"
        )

    def _parse_allowed_class_ids(self, raw_value: str) -> set[int]:
        if not raw_value.strip():
            return set()
        try:
            parsed = ast.literal_eval(raw_value)
        except Exception:  # pylint: disable=broad-except
            parsed = [part.strip() for part in raw_value.split(",") if part.strip()]

        if isinstance(parsed, (list, tuple, set)):
            return {int(value) for value in parsed}
        return {int(parsed)}

    def _default_model_path(self) -> str:
        try:
            detector_share = Path(get_package_share_directory("detector"))
            return str(detector_share / "models" / "yolov8" / "yolo_runs" / "final_dataset_v1" / "weights" / "best.pt")
        except Exception:  # pylint: disable=broad-except
            return str(
                Path(__file__).resolve().parents[1]
                / "models"
                / "yolov8"
                / "yolo_runs"
                / "final_dataset_v1"
                / "weights"
                / "best.pt"
            )

    def _handle_image(self, message: Image) -> None:
        try:
            frame = self._bridge.imgmsg_to_cv2(message, desired_encoding="bgr8")
        except Exception as exc:  # pylint: disable=broad-except
            self.get_logger().error(f"图像转换失败: {exc}")
            return

        try:
            results = self._model.predict(
                source=frame,
                conf=self._confidence_threshold,
                device=self._device,
                verbose=False,
            )
        except Exception as exc:  # pylint: disable=broad-except
            self.get_logger().error(f"YOLOv8 推理失败: {exc}")
            return

        detections = Bbox2dArray()
        detections.header = message.header

        annotated = frame.copy()
        candidates: List[dict] = []
        if results:
            result = results[0]
            boxes = result.boxes
            if boxes is not None:
                xyxy = boxes.xyxy.detach().cpu().numpy()
                confs = boxes.conf.detach().cpu().numpy()
                clss = boxes.cls.detach().cpu().numpy()

                for idx in range(len(xyxy)):
                    xmin, ymin, xmax, ymax = [float(value) for value in xyxy[idx]]
                    score = float(confs[idx])
                    class_id = int(clss[idx])
                    if self._allowed_class_ids and class_id not in self._allowed_class_ids:
                        continue

                    candidates.append(
                        {
                            "class_id": class_id,
                            "score": score,
                            "xyxy": (xmin, ymin, xmax, ymax),
                        }
                    )

        stable_candidates = self._update_tracks(candidates)

        for candidate in stable_candidates:
            xmin, ymin, xmax, ymax = candidate["xyxy"]
            score = candidate["score"]
            class_id = candidate["class_id"]

            item = Bbox2d()
            item.x = (xmin + xmax) / 2.0
            item.y = (ymin + ymax) / 2.0
            item.width = xmax - xmin
            item.height = ymax - ymin
            item.class_id = class_id
            item.score = score
            detections.results.append(item)

            label = f"{self._class_names.get(class_id, str(class_id))} {score:.2f}"
            cv2.rectangle(
                annotated,
                (int(xmin), int(ymin)),
                (int(xmax), int(ymax)),
                (0, 255, 0),
                2,
            )
            cv2.putText(
                annotated,
                label,
                (int(xmin), max(20, int(ymin) - 8)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (0, 255, 0),
                1,
                cv2.LINE_AA,
            )

        for candidate in candidates:
            if candidate in stable_candidates:
                continue
            xmin, ymin, xmax, ymax = candidate["xyxy"]
            class_id = candidate["class_id"]
            score = candidate["score"]
            label = f"pending {self._class_names.get(class_id, str(class_id))} {score:.2f}"
            cv2.rectangle(
                annotated,
                (int(xmin), int(ymin)),
                (int(xmax), int(ymax)),
                (0, 180, 255),
                1,
            )
            cv2.putText(
                annotated,
                label,
                (int(xmin), max(20, int(ymax) + 18)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.45,
                (0, 180, 255),
                1,
                cv2.LINE_AA,
            )

        self._detections_publisher.publish(detections)

        if self._publish_detection_image and self._image_publisher.get_subscription_count() > 0:
            output = self._bridge.cv2_to_imgmsg(annotated, encoding="bgr8")
            output.header = message.header
            self._image_publisher.publish(output)

    def _update_tracks(self, candidates: List[dict]) -> List[dict]:
        for track in self._tracks:
            track["matched"] = False

        stable: List[dict] = []
        for candidate in candidates:
            best_track = None
            best_iou = 0.0
            for track in self._tracks:
                if track["class_id"] != candidate["class_id"]:
                    continue
                iou = self._iou(track["xyxy"], candidate["xyxy"])
                if iou > best_iou:
                    best_iou = iou
                    best_track = track

            if best_track is None or best_iou < self._track_iou_threshold:
                best_track = {
                    "class_id": candidate["class_id"],
                    "score": candidate["score"],
                    "xyxy": candidate["xyxy"],
                    "age": 0,
                    "misses": 0,
                    "matched": True,
                }
                self._tracks.append(best_track)
            else:
                best_track["score"] = candidate["score"]
                best_track["xyxy"] = candidate["xyxy"]
                best_track["age"] += 1
                best_track["misses"] = 0
                best_track["matched"] = True

            if best_track["age"] + 1 >= self._stable_frames:
                stable.append(candidate)

        remaining = []
        for track in self._tracks:
            if not track["matched"]:
                track["misses"] += 1
            if track["misses"] <= 5:
                remaining.append(track)
        self._tracks = remaining
        return stable

    def _iou(self, first, second) -> float:
        ax1, ay1, ax2, ay2 = first
        bx1, by1, bx2, by2 = second
        inter_x1 = max(ax1, bx1)
        inter_y1 = max(ay1, by1)
        inter_x2 = min(ax2, bx2)
        inter_y2 = min(ay2, by2)
        inter_w = max(0.0, inter_x2 - inter_x1)
        inter_h = max(0.0, inter_y2 - inter_y1)
        inter_area = inter_w * inter_h
        first_area = max(0.0, ax2 - ax1) * max(0.0, ay2 - ay1)
        second_area = max(0.0, bx2 - bx1) * max(0.0, by2 - by1)
        union = first_area + second_area - inter_area
        if union <= 0.0:
            return 0.0
        return inter_area / union


def main() -> None:
    rclpy.init()
    node = DetectorPtNode()
    try:
        rclpy.spin(node)
    finally:
        node.destroy_node()
        if rclpy.ok():
            rclpy.shutdown()


if __name__ == "__main__":
    main()
