#!/usr/bin/python3

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
from typing import Iterable

import numpy as np


def _quat_to_matrix(qx: float, qy: float, qz: float, qw: float) -> np.ndarray:
    xx = qx * qx
    yy = qy * qy
    zz = qz * qz
    xy = qx * qy
    xz = qx * qz
    yz = qy * qz
    wx = qw * qx
    wy = qw * qy
    wz = qw * qz
    return np.array([
        [1.0 - 2.0 * (yy + zz), 2.0 * (xy - wz), 2.0 * (xz + wy)],
        [2.0 * (xy + wz), 1.0 - 2.0 * (xx + zz), 2.0 * (yz - wx)],
        [2.0 * (xz - wy), 2.0 * (yz + wx), 1.0 - 2.0 * (xx + yy)],
    ])


def _pose_z_axis(orientation: dict) -> np.ndarray:
    matrix = _quat_to_matrix(
        float(orientation["x"]),
        float(orientation["y"]),
        float(orientation["z"]),
        float(orientation["w"]),
    )
    axis = matrix @ np.array([0.0, 0.0, 1.0])
    norm = np.linalg.norm(axis)
    if norm < 1e-9:
        return np.array([0.0, 0.0, 1.0])
    return axis / norm


def _angle_deg(left: np.ndarray, right: np.ndarray) -> float:
    dot = float(np.clip(abs(np.dot(left, right)), -1.0, 1.0))
    return math.degrees(math.acos(dot))


def load_samples(run_dir: Path) -> list[dict]:
    samples = []
    for sample_file in sorted(run_dir.glob("*/sample.json")):
        samples.append(json.loads(sample_file.read_text(encoding="utf-8")))
    return samples


def summarize(samples: Iterable[dict]) -> dict:
    heights = []
    normals = []
    residuals_mm = []
    overlap_ratios = []
    inlier_ratios = []

    for sample in samples:
        table = sample.get("table_object") or {}
        debug = sample.get("debug_result") or {}
        position = table.get("position") or {}
        orientation = table.get("orientation") or {}
        if position and orientation:
            heights.append(float(position.get("z", 0.0)))
            normals.append(_pose_z_axis(orientation))
        if debug.get("median_residual_mm") is not None:
            residuals_mm.append(float(debug["median_residual_mm"]))
        if debug.get("depth_confirmed_area_ratio_vs_color_table") is not None:
            overlap_ratios.append(float(debug["depth_confirmed_area_ratio_vs_color_table"]))
        if debug.get("plane_inlier_ratio") is not None:
            inlier_ratios.append(float(debug["plane_inlier_ratio"]))

    if not heights or not normals:
        return {"sample_count": 0}

    normal_reference = normals[0]
    normal_drift_deg = max(_angle_deg(normal_reference, normal) for normal in normals)
    return {
        "sample_count": len(heights),
        "world_height_mean_m": float(np.mean(heights)),
        "world_height_range_m": float(max(heights) - min(heights)),
        "world_height_std_m": float(np.std(heights)),
        "normal_drift_deg_max": float(normal_drift_deg),
        "median_residual_mm_max": float(max(residuals_mm)) if residuals_mm else None,
        "median_residual_mm_mean": float(np.mean(residuals_mm)) if residuals_mm else None,
        "color_depth_overlap_ratio_min": float(min(overlap_ratios)) if overlap_ratios else None,
        "plane_inlier_ratio_min": float(min(inlier_ratios)) if inlier_ratios else None,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="汇总桌面标定多姿态采样结果")
    parser.add_argument("--run-dir", required=True)
    parser.add_argument("--height-range-threshold-mm", type=float, default=10.0)
    parser.add_argument("--normal-drift-threshold-deg", type=float, default=3.0)
    parser.add_argument("--residual-threshold-mm", type=float, default=15.0)
    parser.add_argument("--overlap-threshold", type=float, default=0.60)
    parser.add_argument("--min-samples", type=int, default=3)
    args = parser.parse_args()

    run_dir = Path(args.run_dir).expanduser().resolve()
    samples = load_samples(run_dir)
    summary = summarize(samples)
    if summary.get("sample_count", 0) < args.min_samples:
        print(f"table calibration summary failed: insufficient samples under {run_dir}")
        return 1

    summary["passes"] = bool(
        summary["world_height_range_m"] * 1000.0 <= args.height_range_threshold_mm
        and summary["normal_drift_deg_max"] <= args.normal_drift_threshold_deg
        and (summary["median_residual_mm_max"] or 9999.0) <= args.residual_threshold_mm
        and (summary["color_depth_overlap_ratio_min"] or 0.0) >= args.overlap_threshold
    )

    summary_path = run_dir / "summary.json"
    summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0 if summary["passes"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
