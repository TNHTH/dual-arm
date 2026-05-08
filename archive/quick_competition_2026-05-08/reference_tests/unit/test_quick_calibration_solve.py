from pathlib import Path
import sys

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT / "packages/quick_competition"))

from quick_competition.quick_calibration_manager import classify_rmse, solve_table_frame  # noqa: E402


def test_calibration_rmse_classification():
    assert classify_rmse(0.001) == "PASS"
    assert classify_rmse(0.003) == "WARN"
    assert classify_rmse(0.006) == "CRITICAL"


def test_solve_table_frame_accepts_well_spread_points():
    solved = solve_table_frame(
        {
            "front_left": [0.0, 0.0, 0.0],
            "front_right": [1.2, 0.0, 0.0],
            "back_left": [0.0, 0.8, 0.0],
            "back_right": [1.2, 0.8, 0.001],
        },
        1.2,
        0.8,
    )
    assert solved["quality"] in {"PASS", "WARN"}
    assert solved["rmse_m"] < 0.005
