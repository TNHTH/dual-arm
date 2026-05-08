#!/usr/bin/env python3
from pathlib import Path
import sys

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT / "packages/quick_competition"))

from quick_competition.quick_types import QUICK_CONFIG_FILES, load_yaml, quick_config_path  # noqa: E402


def main() -> int:
    ok = True
    for name in QUICK_CONFIG_FILES:
        path = quick_config_path(REPO_ROOT, name)
        try:
            data = load_yaml(path)
        except Exception as exc:
            print(f"[CRITICAL] failed to load {name}: {exc}")
            ok = False
            continue
        print(f"[OK] loaded {name}")
        if name == "quick_profile.yaml":
            if data.get("dry_run_default") is not True:
                print("[CRITICAL] dry_run_default must be true")
                ok = False
            if data.get("execution_frame") != "table_frame_corrected":
                print("[CRITICAL] execution_frame must be table_frame_corrected")
                ok = False
            if data.get("scene_source_override") != "manual":
                print("[WARN] day-one scene_source_override is not manual")
        if name == "quick_motion_limits.yaml":
            policy = data.get("move_policy", {})
            if float(policy.get("max_movecart_distance_m", 0.0)) > 0.05:
                print("[CRITICAL] max_movecart_distance_m must be <= 0.05")
                ok = False
    return 0 if ok else 2


if __name__ == "__main__":
    raise SystemExit(main())
