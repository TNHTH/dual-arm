#!/usr/bin/python3

from __future__ import annotations

import re
import sys
from pathlib import Path
from types import SimpleNamespace

import yaml
from builtin_interfaces.msg import Time as TimeMsg
from sensor_msgs.msg import CameraInfo, Image

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))


def extend_dualarm_interfaces_pythonpath() -> None:
    script_path = Path(__file__).resolve()
    workspace_root = script_path.parents[4]
    install_roots = [
        workspace_root / "install",
        workspace_root.parent / "dual-arm" / "install",
    ]
    for install_root in install_roots:
        patterns = [
            "dualarm_interfaces/local/lib/python*/dist-packages",
            "dualarm_interfaces/local/lib/python*/site-packages",
        ]
        for pattern in patterns:
            for match in install_root.glob(pattern):
                match_str = str(match)
                if match_str not in sys.path:
                    sys.path.insert(0, match_str)


extend_dualarm_interfaces_pythonpath()

from ball_basket_pose_estimator_node import BallBasketPoseEstimatorNode
from dualarm_interfaces.msg import Detection2D, Detection2DArray


EXPECTED_CLASS_MAP = {
    0: "basket",
    1: "basketball",
    2: "cola_bottle",
    3: "cup",
    4: "soccer_ball",
    5: "water_bottle",
}
EXPECTED_DEPTH_TYPES = {"water_bottle", "cola_bottle", "cup"}
EXPECTED_BALL_TYPES = {"basket", "basketball", "soccer_ball"}


class CapturePublisher:
    def __init__(self) -> None:
        self.messages = []

    def publish(self, message) -> None:
        self.messages.append(message)


class FakeTime:
    def __init__(self, nanoseconds: int) -> None:
        self.nanoseconds = int(nanoseconds)

    def __sub__(self, other: "FakeTime"):
        return SimpleNamespace(nanoseconds=self.nanoseconds - other.nanoseconds)

    def to_msg(self) -> TimeMsg:
        msg = TimeMsg()
        msg.sec = self.nanoseconds // 1_000_000_000
        msg.nanosec = self.nanoseconds % 1_000_000_000
        return msg


class FakeClock:
    def __init__(self) -> None:
        self._nanoseconds = 0

    def now(self) -> FakeTime:
        self._nanoseconds += 50_000_000
        return FakeTime(self._nanoseconds)


class FakeLogger:
    def warn(self, *_args, **_kwargs) -> None:
        pass

    def info(self, *_args, **_kwargs) -> None:
        pass


class EstimatorHarness:
    _publish_estimates = BallBasketPoseEstimatorNode._publish_estimates
    _inputs_are_fresh = BallBasketPoseEstimatorNode._inputs_are_fresh
    _collect_detection_samples = BallBasketPoseEstimatorNode._collect_detection_samples
    _roi_specs = BallBasketPoseEstimatorNode._roi_specs
    _default_roi_spec = BallBasketPoseEstimatorNode._default_roi_spec
    _detection_to_roi = BallBasketPoseEstimatorNode._detection_to_roi
    _build_object = BallBasketPoseEstimatorNode._build_object
    _update_track = BallBasketPoseEstimatorNode._update_track
    _prune_tracks = BallBasketPoseEstimatorNode._prune_tracks
    _stable_track_sample = BallBasketPoseEstimatorNode._stable_track_sample
    _required_stable_frames = BallBasketPoseEstimatorNode._required_stable_frames
    _position_gate = BallBasketPoseEstimatorNode._position_gate
    _delta_sec = BallBasketPoseEstimatorNode._delta_sec
    _age_sec = BallBasketPoseEstimatorNode._age_sec
    _distance = BallBasketPoseEstimatorNode._distance
    _build_subframes = BallBasketPoseEstimatorNode._build_subframes

    def __init__(self) -> None:
        self._clock = FakeClock()
        self._logger = FakeLogger()
        self._parameters = {
            "basketball_roi": [220, 120, 120, 120],
            "soccer_ball_roi": [380, 120, 120, 120],
            "basket_roi": [280, 240, 160, 120],
            "basketball_diameter": 0.12,
            "soccer_ball_diameter": 0.12,
            "basket_size": [0.32, 0.22, 0.18],
        }
        self._world_frame = "world"
        self._use_roi_fallback = False
        self._require_depth_aligned_detections = True
        self._expected_detection_frame = ""
        self._require_camera_info_depth_frame = True
        self._max_depth_age_sec = 0.6
        self._max_detection_depth_delay_sec = 0.25
        self._max_camera_info_depth_delay_sec = 0.5
        self._track_timeout_sec = 0.8
        self._stable_frames_ball = 3
        self._stable_frames_basket = 3
        self._ball_position_gate = 0.04
        self._basket_position_gate = 0.06
        self._camera_info = None
        self._depth_image = None
        self._detections = None
        self._tracks = {}
        self._publisher = CapturePublisher()

    def get_clock(self) -> FakeClock:
        return self._clock

    def get_logger(self) -> FakeLogger:
        return self._logger

    def get_parameter(self, name: str):
        return SimpleNamespace(value=self._parameters[name])

    def _stamp_from_header(self, stamp) -> FakeTime:
        return FakeTime(int(stamp.sec) * 1_000_000_000 + int(stamp.nanosec))


def repo_root() -> Path:
    return Path(__file__).resolve().parents[4]


def load_class_map(root: Path) -> dict[int, str]:
    mapping_file = root / "src/perception/detector_adapter/config/class_map_best_pt.yaml"
    with mapping_file.open("r", encoding="utf-8") as handle:
        data = yaml.safe_load(handle) or {}
    return {int(key): str(value) for key, value in (data.get("class_map") or {}).items()}


def load_depth_whitelist(root: Path) -> set[str]:
    source_file = root / "src/perception/depth_handler/src/depth_processor_node.cpp"
    text = source_file.read_text(encoding="utf-8")
    match = re.search(
        r'declare_parameter\("allowed_semantic_types",\s*std::vector<std::string>\s*\{([^}]*)\}\);',
        text,
        re.S,
    )
    if not match:
        raise RuntimeError("cannot find depth_handler allowed_semantic_types")
    return set(re.findall(r'"([^"]+)"', match.group(1)))


def load_tf_contract(root: Path) -> dict[str, str]:
    tf_file = root / "src/transforms/tf_node/config/calibration_transforms.yaml"
    with tf_file.open("r", encoding="utf-8") as handle:
        data = yaml.safe_load(handle) or {}
    mapping = {}
    for item in data.get("transforms", []):
        mapping[str(item["child"])] = str(item["parent"])
    return mapping


def load_tf_metadata(root: Path) -> dict[str, dict]:
    tf_file = root / "src/transforms/tf_node/config/calibration_transforms.yaml"
    with tf_file.open("r", encoding="utf-8") as handle:
        data = yaml.safe_load(handle) or {}
    return {
        f"{item['parent']}->{item['child']}": item
        for item in data.get("transforms", [])
    }


def make_camera_info(stamp, frame_id: str = "left_camera_depth_frame") -> CameraInfo:
    msg = CameraInfo()
    msg.header.stamp = stamp
    msg.header.frame_id = frame_id
    msg.width = 640
    msg.height = 480
    msg.k = [525.0, 0.0, 320.0, 0.0, 525.0, 240.0, 0.0, 0.0, 1.0]
    msg.r = [1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0]
    msg.p = [525.0, 0.0, 320.0, 0.0, 0.0, 525.0, 240.0, 0.0, 0.0, 0.0, 1.0, 0.0]
    return msg


def make_depth_image(stamp) -> Image:
    msg = Image()
    msg.header.stamp = stamp
    msg.header.frame_id = "left_camera_depth_frame"
    msg.height = 480
    msg.width = 640
    msg.encoding = "16UC1"
    msg.step = 1280
    msg.data = b""
    return msg


def make_detection(semantic_type: str, x: float, y: float, width: float, height: float) -> Detection2D:
    msg = Detection2D()
    msg.semantic_type = semantic_type
    msg.source = "acceptance"
    msg.x = x
    msg.y = y
    msg.width = width
    msg.height = height
    msg.score = 0.95
    return msg


def set_inputs(
    node: EstimatorHarness,
    detections: list[Detection2D],
    detection_frame: str = "left_camera_depth_frame",
    camera_info_frame: str = "left_camera_depth_frame",
) -> None:
    stamp = node.get_clock().now().to_msg()
    node._camera_info = make_camera_info(stamp, camera_info_frame)
    node._depth_image = make_depth_image(stamp)
    message = Detection2DArray()
    message.header.stamp = stamp
    message.header.frame_id = detection_frame
    for detection in detections:
        detection.header = message.header
        message.detections.append(detection)
    node._detections = message


def run_stability_sequence(node: EstimatorHarness) -> None:
    node._publisher = CapturePublisher()
    node._use_roi_fallback = False
    node._transform_to_world = lambda position: position

    roi_positions = {
        (0, 0, 20, 20): (0.50, 0.00, 1.10),
        (20, 0, 20, 20): (0.10, 0.00, 1.00),
        (40, 0, 20, 20): (0.20, 0.00, 1.00),
        (60, 0, 20, 20): (0.30, 0.00, 1.00),
        (80, 0, 20, 20): (0.40, 0.00, 1.00),
        (100, 0, 20, 20): (0.60, 0.00, 1.00),
    }
    node._estimate_roi_center = lambda roi: roi_positions.get(tuple(int(value) for value in roi))

    detections = [
        make_detection("basket", 10.0, 10.0, 20.0, 20.0),
        make_detection("basketball", 30.0, 10.0, 20.0, 20.0),
        make_detection("cola_bottle", 50.0, 10.0, 20.0, 20.0),
        make_detection("cup", 70.0, 10.0, 20.0, 20.0),
        make_detection("soccer_ball", 90.0, 10.0, 20.0, 20.0),
        make_detection("water_bottle", 110.0, 10.0, 20.0, 20.0),
    ]

    node._tracks.clear()
    for cycle in range(3):
        set_inputs(node, detections)
        node._publish_estimates()
        latest = node._publisher.messages[-1]
        if cycle < 2 and latest.objects:
            raise RuntimeError("ball/basket objects should not publish before stable_frames threshold")

    latest = node._publisher.messages[-1]
    published_semantics = {item.semantic_type for item in latest.objects}
    if published_semantics != EXPECTED_BALL_TYPES:
        raise RuntimeError(f"unexpected stable semantics: {sorted(published_semantics)}")

    basket = next(item for item in latest.objects if item.semantic_type == "basket")
    subframes = {item.name: item.pose.pose.position.z for item in basket.subframes}
    if abs(basket.pose.pose.position.z - 1.10) > 1e-6:
        raise RuntimeError(f"basket main pose mutated by subframe construction: {basket.pose.pose.position.z}")
    if abs(subframes["basket_center"] - 1.10) > 1e-6:
        raise RuntimeError(f"basket_center z mismatch: {subframes['basket_center']}")
    if abs(subframes["basket_release_center"] - 1.19) > 1e-6:
        raise RuntimeError(f"basket_release_center z mismatch: {subframes['basket_release_center']}")


def run_jitter_rejection(node: EstimatorHarness) -> None:
    node._publisher = CapturePublisher()
    node._use_roi_fallback = False
    node._transform_to_world = lambda position: position

    basket_detection = [make_detection("basket", 10.0, 10.0, 20.0, 20.0)]
    basket_positions = [
        (0.40, 0.00, 1.00),
        (0.42, 0.00, 1.00),
        (0.58, 0.00, 1.00),
    ]

    node._tracks.clear()
    for position in basket_positions:
        node._estimate_roi_center = lambda _roi, value=position: value
        set_inputs(node, basket_detection)
        node._publish_estimates()

    latest = node._publisher.messages[-1]
    if latest.objects:
        raise RuntimeError("jittered basket track should be rejected by position gate")


def run_timeout_recycle(node: EstimatorHarness) -> None:
    node._tracks.clear()
    node._estimate_roi_center = lambda _roi: (0.40, 0.00, 1.00)
    node._transform_to_world = lambda position: position
    node._publisher = CapturePublisher()
    for _ in range(3):
        set_inputs(node, [make_detection("basket", 10.0, 10.0, 20.0, 20.0)])
        node._publish_estimates()
    now = node.get_clock().now()
    expired_stamp = FakeTime(now.nanoseconds - int((node._track_timeout_sec + 0.2) * 1_000_000_000))
    for track in node._tracks.values():
        track.last_update = expired_stamp
    node._prune_tracks(now)
    if node._tracks:
        raise RuntimeError("expired stable tracks should be pruned after track_timeout_sec")


def run_tf_failure_rejection(node: EstimatorHarness) -> None:
    node._tracks.clear()
    node._publisher = CapturePublisher()
    node._use_roi_fallback = False
    node._estimate_roi_center = lambda _roi: (0.40, 0.00, 1.00)
    node._transform_to_world = lambda _position: None
    for _ in range(3):
        set_inputs(node, [make_detection("basket", 10.0, 10.0, 20.0, 20.0)])
        node._publish_estimates()
    latest = node._publisher.messages[-1]
    if latest.objects:
        raise RuntimeError("TF failure should block world pose publication")


def run_detection_frame_rejection(node: EstimatorHarness) -> None:
    node._tracks.clear()
    node._publisher = CapturePublisher()
    node._estimate_roi_center = lambda _roi: (0.40, 0.00, 1.00)
    node._transform_to_world = lambda position: position
    for _ in range(3):
        set_inputs(
            node,
            [make_detection("basket", 10.0, 10.0, 20.0, 20.0)],
            detection_frame="left_camera_color_frame",
        )
        node._publish_estimates()
    latest = node._publisher.messages[-1]
    if latest.objects:
        raise RuntimeError("unaligned detection frame should be rejected")


def run_camera_info_frame_rejection(node: EstimatorHarness) -> None:
    node._tracks.clear()
    node._publisher = CapturePublisher()
    node._estimate_roi_center = lambda _roi: (0.40, 0.00, 1.00)
    node._transform_to_world = lambda position: position
    for _ in range(3):
        set_inputs(
            node,
            [make_detection("basket", 10.0, 10.0, 20.0, 20.0)],
            camera_info_frame="left_camera_color_frame",
        )
        node._publish_estimates()
    if not node._publisher.messages:
        return
    latest = node._publisher.messages[-1]
    if latest.objects:
        raise RuntimeError("camera_info/depth frame mismatch should be rejected")


def main() -> int:
    root = repo_root()
    class_map = load_class_map(root)
    if class_map != EXPECTED_CLASS_MAP:
        print(f"class map mismatch: {class_map}")
        return 1

    depth_types = load_depth_whitelist(root)
    if depth_types != EXPECTED_DEPTH_TYPES:
        print(f"depth whitelist mismatch: {sorted(depth_types)}")
        return 1

    tf_contract = load_tf_contract(root)
    expected_tf = {
        "left_camera": "left_tcp",
        "left_camera_color_frame": "left_camera",
        "left_camera_depth_frame": "left_camera",
    }
    if tf_contract != expected_tf:
        print(f"tf contract mismatch: {tf_contract}")
        return 1
    tf_metadata = load_tf_metadata(root)
    extrinsic = tf_metadata.get("left_tcp->left_camera", {})
    if extrinsic.get("requires_calibration") is not True or extrinsic.get("calibration_status") != "unverified":
        print(f"extrinsic metadata mismatch: {extrinsic}")
        return 1

    node = EstimatorHarness()
    try:
        run_stability_sequence(node)
        run_jitter_rejection(node)
        run_timeout_recycle(node)
        run_tf_failure_rejection(node)
        run_detection_frame_rejection(node)
        run_camera_info_frame_rejection(node)
    except Exception as exc:  # pylint: disable=broad-except
        print(f"wave23 perception acceptance failed: {exc}")
        return 1

    print("wave23 perception acceptance passed")
    print(f"normalized_semantics={sorted(class_map.values())}")
    print(f"depth_handler_semantics={sorted(depth_types)}")
    print(f"ball_basket_semantics={sorted(EXPECTED_BALL_TYPES)}")
    print("stable_frames=3 gate check passed")
    print("jitter rejection passed")
    print("track timeout recycle passed")
    print("tf failure rejection passed")
    print("unaligned detection frame rejection passed")
    print("camera_info/depth frame rejection passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
