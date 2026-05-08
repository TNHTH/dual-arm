#!/usr/bin/env python3
from pathlib import Path
import argparse
import sys


def main() -> int:
    parser = argparse.ArgumentParser(description="print latest quick run summary")
    parser.add_argument("--run-dir", default="")
    args = parser.parse_args()
    repo_root = Path(__file__).resolve().parents[2]
    if args.run_dir:
        run_dir = Path(args.run_dir)
    else:
        base = repo_root / ".artifacts/quick_runs"
        runs = sorted(base.glob("run-*")) if base.exists() else []
        if not runs:
            print("[WARN] no quick run logs found")
            return 1
        run_dir = runs[-1]
    for name in ["summary.yaml", "scoreboard.yaml", "commands.jsonl"]:
        path = run_dir / name
        print(f"===== {path} =====")
        if path.exists():
            print(path.read_text(encoding="utf-8"))
        else:
            print("[missing]")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
