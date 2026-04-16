#!/usr/bin/env python3

from __future__ import annotations

import sys
from pathlib import Path


PATTERNS = [
    "/home/gwh/dashgo_rl_project/workspaces/dual-arm",
    "/home/gwh/dualarms_ws",
    "/home/phoenix/roboarm/FairinoDualArm",
    "/home/phoenix/tensorrtx",
    "third_party/fairino_sdk",
    "dual-arm-shared",
]

ALLOWED_PREFIXES = (
    "archive/",
    ".codex/",
    "docs/archive/",
)

ALLOWED_FILES = {
    "archive/legacy-import-manifest.md",
    "archive/vendor-archive-manifest.md",
    "docs/reference/path-migration-map.md",
}

EXCLUDED_DIRS = {".git", ".tmp", "build", "install", "log", "dist", "test-results"}


def find_repo_root() -> Path:
    current = Path(__file__).resolve()
    for parent in [current.parent, *current.parents]:
        if (parent / "STATE.md").exists() and (parent / "packages").is_dir():
            return parent
    raise FileNotFoundError("未找到 dual-arm 仓库根目录。")


def should_skip(relative_path: Path) -> bool:
    first_part = relative_path.parts[0] if relative_path.parts else ""
    if first_part in EXCLUDED_DIRS:
        return True

    posix_path = relative_path.as_posix()
    if posix_path == "scripts/check_path_hardcodes.py":
        return True
    if posix_path in ALLOWED_FILES:
        return True
    return any(posix_path.startswith(prefix) for prefix in ALLOWED_PREFIXES)


def main() -> int:
    repo_root = find_repo_root()
    violations: list[tuple[str, int, str]] = []

    for path in repo_root.rglob("*"):
        if not path.is_file():
            continue
        relative_path = path.relative_to(repo_root)
        if path.is_symlink():
            try:
                resolved_relative = path.resolve().relative_to(repo_root).as_posix()
                if resolved_relative.startswith("archive/") or resolved_relative.startswith("docs/archive/"):
                    continue
            except ValueError:
                pass
        if should_skip(relative_path):
            continue

        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue

        for line_number, line in enumerate(text.splitlines(), start=1):
            for pattern in PATTERNS:
                if pattern in line:
                    violations.append((relative_path.as_posix(), line_number, pattern))

    if violations:
        print("检测到历史路径或旧目录名残留：")
        for file_path, line_number, pattern in violations:
            print(f"{file_path}:{line_number}: {pattern}")
        return 1

    print("路径硬编码检查通过。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
