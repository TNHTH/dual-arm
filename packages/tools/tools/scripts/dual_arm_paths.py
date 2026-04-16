#!/usr/bin/env python3

from __future__ import annotations

import os
from pathlib import Path


def _iter_candidate_roots(start: Path | None = None):
    env_root = os.environ.get("DUAL_ARM_REPO_ROOT")
    if env_root:
        yield Path(env_root).expanduser().resolve()
    if start is not None:
        yield start.resolve()
    yield Path(__file__).resolve()
    yield Path.cwd()


def get_repo_root(start: Path | None = None) -> Path:
    for candidate in _iter_candidate_roots(start):
        current = candidate if candidate.is_dir() else candidate.parent
        for parent in [current, *current.parents]:
            if (parent / "STATE.md").exists() and (parent / "packages").is_dir():
                return parent
    raise FileNotFoundError("未找到 dual-arm 仓库根目录。")


def repo_path(*parts: str, start: Path | None = None) -> Path:
    return get_repo_root(start) / Path(*parts)


def get_packages_root(start: Path | None = None) -> Path:
    return repo_path("packages", start=start)


def get_shared_root(start: Path | None = None) -> Path:
    env_root = os.environ.get("DUAL_ARM_SHARED_ROOT")
    if env_root:
        return Path(env_root).expanduser().resolve()
    return repo_path(".codex", "runtime", "shared", start=start)


def get_archive_root(start: Path | None = None) -> Path:
    env_root = os.environ.get("DUAL_ARM_ARCHIVE_ROOT")
    if env_root:
        return Path(env_root).expanduser().resolve()
    return Path.home() / ".cleanup-archive" / "dual-arm"

