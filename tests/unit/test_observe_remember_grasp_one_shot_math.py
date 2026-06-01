from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

import numpy as np
import pytest


MODULE_PATH = Path(__file__).resolve().parents[2] / "packages/tools/tools/scripts/observe_remember_grasp_node.py"
SPEC = importlib.util.spec_from_file_location("observe_remember_grasp_node_for_test", MODULE_PATH)
MODULE = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = MODULE
try:
    assert SPEC.loader is not None
    SPEC.loader.exec_module(MODULE)
except ModuleNotFoundError as exc:  # pragma: no cover - depends on sourced ROS env
    pytest.skip(f"ROS 2 dependency not available: {exc}", allow_module_level=True)


def test_table_plane_sign_makes_object_height_positive() -> None:
    xs, zs = np.meshgrid(np.linspace(-0.15, 0.15, 40), np.linspace(0.35, 0.65, 40))
    table = np.stack([xs.ravel(), np.full(xs.size, 0.30), zs.ravel()], axis=1)
    object_points = np.stack([xs.ravel()[:200], np.full(200, 0.24), zs.ravel()[:200]], axis=1)

    plane = MODULE.fit_table_plane_ransac(table, threshold_m=0.003, iterations=80, max_sample_points=2000)

    assert plane is not None
    assert plane.offset > 0.0
    assert np.median(np.abs(table @ plane.normal + plane.offset)) < 0.003
    assert np.median(object_points @ plane.normal + plane.offset) > 0.04


def test_runtime_table_correction_sets_table_median_z() -> None:
    table_points = np.array(
        [
            [-0.1, -0.1, 0.42],
            [0.1, -0.1, 0.42],
            [-0.1, 0.1, 0.42],
            [0.1, 0.1, 0.42],
        ],
        dtype=np.float64,
    )
    candidate = np.eye(4, dtype=np.float64)
    candidate[:3, 3] = [0.2, -0.3, 0.05]

    runtime, detail = MODULE.make_runtime_table_corrected_tf(
        candidate,
        np.array([0.0, 0.0, 1.0], dtype=np.float64),
        table_points,
        table_top_real_z=-0.07,
    )

    corrected = MODULE.transform_points(runtime, table_points)
    assert np.median(corrected[:, 2]) == pytest.approx(-0.07, abs=1e-9)
    assert detail["table_z_median_after_m"] == pytest.approx(-0.07, abs=1e-9)


def _synthetic_cloud(two_objects: bool = False):
    height_px, width_px = 80, 80
    us, vs = np.meshgrid(np.arange(width_px), np.arange(height_px))
    points = np.stack(
        [
            (us.ravel().astype(np.float64) - 40.0) / 500.0,
            np.full(us.size, 0.30, dtype=np.float64),
            0.50 + (vs.ravel().astype(np.float64) - 40.0) / 500.0,
        ],
        axis=1,
    )
    object_mask = (us >= 30) & (us < 44) & (vs >= 30) & (vs < 44)
    if two_objects:
        object_mask |= (us >= 52) & (us < 66) & (vs >= 30) & (vs < 44)
    points[object_mask.ravel(), 1] = 0.24
    cloud = MODULE.DepthPointCloud(
        points_cam=points,
        u=us.ravel().astype(np.int32),
        v=vs.ravel().astype(np.int32),
        valid_mask=np.ones((height_px, width_px), dtype=bool),
        image_shape=(height_px, width_px),
    )
    plane = MODULE.TablePlane(
        normal=np.array([0.0, -1.0, 0.0], dtype=np.float64),
        offset=0.30,
        table_points_cam=points[~object_mask.ravel()],
        inlier_count=int(np.count_nonzero(~object_mask)),
        inlier_ratio=0.95,
        median_residual_m=0.0,
    )
    return cloud, plane


def test_depth_only_segmentation_selects_single_tabletop_component() -> None:
    cloud, plane = _synthetic_cloud(two_objects=False)

    segmented = MODULE.segment_single_tabletop_object_depth_only(
        cloud,
        plane,
        min_points=100,
        single_object_required=True,
        can_geometry_filter=False,
    )

    assert segmented is not None
    assert segmented.mode == "depth_only_tabletop_single_component"
    assert segmented.points_cam.shape[0] >= 100
    assert segmented.debug["candidate_count"] == 1


def test_depth_only_segmentation_rejects_ambiguous_components() -> None:
    cloud, plane = _synthetic_cloud(two_objects=True)

    segmented = MODULE.segment_single_tabletop_object_depth_only(
        cloud,
        plane,
        min_points=100,
        single_object_required=True,
        can_geometry_filter=False,
    )

    assert segmented is not None
    assert segmented.mode == "depth_only_tabletop_ambiguous"
    assert segmented.points_cam.shape[0] == 0
    assert segmented.debug["candidate_count"] == 2


def test_rotation_between_vectors_aligns_normal_to_world_z() -> None:
    source = np.array([0.0, -1.0, 0.0], dtype=np.float64)
    target = np.array([0.0, 0.0, 1.0], dtype=np.float64)

    rotation = MODULE.rotation_between_vectors(source, target)
    aligned = rotation @ source

    assert MODULE.angle_between_vectors(aligned, target) < 1e-6
