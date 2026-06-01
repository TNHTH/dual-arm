from __future__ import annotations

from pathlib import Path
from typing import Any, Dict

import yaml
from ament_index_python.packages import get_package_share_directory


def default_config_path() -> Path:
    return Path(get_package_share_directory("dualarm_simulation")) / "config" / "competition_gazebo_full.yaml"


def load_config(path: str = "") -> Dict[str, Any]:
    config_path = Path(path).expanduser().resolve() if path else default_config_path()
    return yaml.safe_load(config_path.read_text(encoding="utf-8")) or {}
