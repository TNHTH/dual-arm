from pathlib import Path
import sys

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT / "packages/quick_competition"))

from quick_competition.quick_pose_filter import QuickPoseFilter  # noqa: E402


def test_pose_filter_requires_stable_frames():
    filt = QuickPoseFilter(min_frames=3, max_position_std_m=0.02, max_age_sec=10.0)
    filt.add_sample("ball", "table_frame", [0.0, 0.0, 0.2, 0, 0, 0, 1])
    filt.add_sample("ball", "table_frame", [0.001, 0.0, 0.2, 0, 0, 0, 1])
    assert not filt.require_stable("ball")
    filt.add_sample("ball", "table_frame", [0.002, 0.0, 0.2, 0, 0, 0, 1])
    assert filt.require_stable("ball")


def test_table_snap_does_not_overwrite_grasp_height():
    pose = [0.1, 0.2, 0.4, 0, 0, 0, 1]
    base = QuickPoseFilter.table_object_base_pose(pose, 0.0)
    assert base[2] == 0.0
    assert QuickPoseFilter.grasp_z_from_base(base[2], 0.18, 0.5) == 0.09
