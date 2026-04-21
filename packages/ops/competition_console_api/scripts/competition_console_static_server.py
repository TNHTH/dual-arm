#!/usr/bin/python3

from __future__ import annotations

import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from ament_index_python.packages import get_package_prefix


def _discover_repo_root() -> Path:
    prefix_root = Path(get_package_prefix("competition_console_api")).parent.parent
    for parent in [prefix_root, *prefix_root.parents]:
        if (parent / "packages").is_dir() and (parent / "config").is_dir():
            return parent
    return prefix_root


def main() -> None:
    repo_root = _discover_repo_root()
    web_root = repo_root / "packages" / "ops" / "competition_console_web"
    dist_root = web_root / "dist"
    serve_root = dist_root if dist_root.exists() else web_root
    os.chdir(serve_root)
    server = ThreadingHTTPServer(("0.0.0.0", 18081), SimpleHTTPRequestHandler)
    print(f"competition_console_web static server serving {serve_root} on :18081")
    server.serve_forever()


if __name__ == "__main__":
    main()
