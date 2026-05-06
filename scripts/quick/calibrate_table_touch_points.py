#!/usr/bin/env python3
from pathlib import Path
import sys

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT / "packages/quick_competition"))

from quick_competition.quick_calibration_manager import main  # noqa: E402


if __name__ == "__main__":
    main()
