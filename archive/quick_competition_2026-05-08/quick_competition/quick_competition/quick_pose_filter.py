from __future__ import annotations

import argparse
import math
import statistics
import time
from collections import defaultdict, deque
from dataclasses import dataclass
from typing import Deque, Dict, Iterable, List, Optional, Tuple


@dataclass
class FilteredPose:
    name: str
    frame: str
    pose: List[float]
    confidence: float
    source: str
    stable: bool
    position_std_m: float
    sample_count: int


class QuickPoseFilter:
    def __init__(
        self,
        min_frames: int = 5,
        max_position_std_m: float = 0.02,
        max_age_sec: float = 1.0,
        table_height_m: float = 0.0,
    ) -> None:
        self.min_frames = min_frames
        self.max_position_std_m = max_position_std_m
        self.max_age_sec = max_age_sec
        self.table_height_m = table_height_m
        self._samples: Dict[str, Deque[Tuple[float, str, List[float], float, str]]] = defaultdict(lambda: deque(maxlen=20))

    def add_sample(
        self,
        name: str,
        frame: str,
        pose: Iterable[float],
        confidence: float = 1.0,
        source: str = "manual",
        stamp: Optional[float] = None,
    ) -> None:
        values = [float(item) for item in pose]
        if len(values) not in {6, 7}:
            raise ValueError("pose 必须是 [x,y,z,rx,ry,rz] 或 [x,y,z,qx,qy,qz,qw]")
        self._samples[name].append((stamp or time.time(), frame, values, float(confidence), source))

    def get(self, name: str) -> Optional[FilteredPose]:
        now = time.time()
        samples = [item for item in self._samples.get(name, []) if now - item[0] <= self.max_age_sec]
        if not samples:
            return None
        positions = list(zip(*[item[2][:3] for item in samples]))
        med = [statistics.median(axis) for axis in positions]
        std = max(_std(axis) for axis in positions)
        last_pose = samples[-1][2]
        pose = med + last_pose[3:]
        confidence = statistics.median([item[3] for item in samples])
        stable = len(samples) >= self.min_frames and std <= self.max_position_std_m
        return FilteredPose(name, samples[-1][1], pose, confidence, samples[-1][4], stable, std, len(samples))

    def require_stable(self, name: str) -> bool:
        result = self.get(name)
        return bool(result and result.stable)

    @staticmethod
    def table_object_base_pose(pose: List[float], table_height_m: float) -> List[float]:
        corrected = list(pose)
        corrected[2] = float(table_height_m)
        return corrected

    @staticmethod
    def grasp_z_from_base(base_z: float, object_height_m: float, ratio: float) -> float:
        return float(base_z) + max(0.0, float(object_height_m)) * float(ratio)


def _std(values: Iterable[float]) -> float:
    values = list(values)
    if len(values) < 2:
        return 0.0
    mean = sum(values) / len(values)
    return math.sqrt(sum((item - mean) ** 2 for item in values) / len(values))


def main() -> None:
    parser = argparse.ArgumentParser(description="quick pose filter helper")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        filt = QuickPoseFilter(min_frames=2)
        filt.add_sample("ball", "table_frame", [0, 0, 0.2, 0, 0, 0, 1])
        filt.add_sample("ball", "table_frame", [0.001, 0, 0.2, 0, 0, 0, 1])
        print(f"[OK] pose_filter stable={filt.require_stable('ball')}")
    else:
        print("quick_pose_filter 提供库能力；使用 --self-test 可做最小检查。")


if __name__ == "__main__":
    main()
