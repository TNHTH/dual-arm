#!/usr/bin/env python3

from __future__ import annotations

import sys
from pathlib import Path


def find_repo_root() -> Path:
    current = Path(__file__).resolve()
    for parent in [current.parent, *current.parents]:
        if (parent / "STATE.md").exists() and (parent / "packages").is_dir():
            return parent
    raise FileNotFoundError("未找到 dual-arm 仓库根目录。")


def main() -> int:
    repo_root = find_repo_root()
    expected: set[Path] = {repo_root}

    fixed_dirs = [
        "packages",
        "config",
        "docs",
        "scripts",
        "tests",
        "vendor",
        "archive",
        "config/system",
        "docs/operations",
        "docs/development",
        "docs/reference",
        "docs/archive",
        "docs/process",
        "tests/unit",
        "tests/integration",
        "tests/hardware",
        "tests/acceptance",
        "vendor/fairino_sdk",
        "archive/legacy",
    ]
    for relative_dir in fixed_dirs:
        path = repo_root / relative_dir
        if path.is_dir():
            expected.add(path)

    packages_root = repo_root / "packages"
    for domain_dir in packages_root.iterdir():
        if domain_dir.is_dir():
            expected.add(domain_dir)

    for package_xml in packages_root.rglob("package.xml"):
        expected.add(package_xml.parent)

    missing = sorted(path for path in expected if not (path / "README.md").exists())
    if missing:
        print("缺少 README 的目录：")
        for path in missing:
            print(path.relative_to(repo_root))
        return 1

    print(f"README 覆盖检查通过，共检查 {len(expected)} 个目录。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
