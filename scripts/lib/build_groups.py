#!/usr/bin/env python3

from __future__ import annotations

import argparse
from pathlib import Path


def find_repo_root(start: Path | None = None) -> Path:
    candidates: list[Path] = []
    if start is not None:
        candidates.append(start.resolve())
    candidates.append(Path(__file__).resolve())
    candidates.append(Path.cwd())

    for candidate in candidates:
        current = candidate if candidate.is_dir() else candidate.parent
        for parent in [current, *current.parents]:
            if (parent / "STATE.md").exists() and (parent / "packages").is_dir():
                return parent
    raise FileNotFoundError("未找到 dual-arm 仓库根目录。")


def load_groups(config_path: Path) -> dict[str, dict[str, object]]:
    groups: dict[str, dict[str, object]] = {}
    current_group: str | None = None
    in_packages = False

    for raw_line in config_path.read_text(encoding="utf-8").splitlines():
        if not raw_line.strip() or raw_line.lstrip().startswith("#"):
            continue

        indent = len(raw_line) - len(raw_line.lstrip(" "))
        line = raw_line.strip()

        if line == "groups:":
            continue

        if indent == 2 and line.endswith(":"):
            current_group = line[:-1]
            groups[current_group] = {"description": "", "packages": []}
            in_packages = False
            continue

        if current_group is None:
            continue

        if indent == 4 and line.startswith("description:"):
            groups[current_group]["description"] = line.split(":", 1)[1].strip().strip("'\"")
            in_packages = False
            continue

        if indent == 4 and line == "packages:":
            in_packages = True
            continue

        if in_packages and indent >= 6 and line.startswith("- "):
            package = line[2:].strip().strip("'\"")
            groups[current_group]["packages"].append(package)

    return groups


def main() -> None:
    parser = argparse.ArgumentParser(description="读取 dual-arm 构建分组配置。")
    parser.add_argument("--config", type=Path, default=None, help="build_groups.yaml 路径。")
    parser.add_argument("--list", action="store_true", help="列出所有分组。")
    parser.add_argument("--group", action="append", default=[], help="输出指定分组的包列表。")
    args = parser.parse_args()

    repo_root = find_repo_root()
    config_path = args.config or repo_root / "config" / "system" / "build_groups.yaml"
    groups = load_groups(config_path)

    if args.list:
        for name, payload in groups.items():
            description = str(payload.get("description", "")).strip()
            packages = payload.get("packages", [])
            print(f"{name}: {description} ({len(packages)} packages)")
        return

    requested_groups = args.group or []
    if not requested_groups:
        parser.error("请至少提供 --list 或 --group。")

    for name in requested_groups:
        if name not in groups:
            raise SystemExit(f"未知分组: {name}")
        for package in groups[name]["packages"]:
            print(package)


if __name__ == "__main__":
    main()
