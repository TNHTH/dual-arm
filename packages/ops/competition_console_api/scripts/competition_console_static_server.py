#!/usr/bin/python3

from __future__ import annotations

import http.client
import json
import logging
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from ament_index_python.packages import get_package_prefix


API_HOST = "127.0.0.1"
API_PORT = 18080
LOGGER = logging.getLogger("competition_console_static_server")


class CompetitionConsoleStaticHandler(SimpleHTTPRequestHandler):
    def _proxy_api(self) -> None:
        content_length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(content_length) if content_length else None
        headers = {key: value for key, value in self.headers.items() if key.lower() != "host"}
        connection = http.client.HTTPConnection(API_HOST, API_PORT, timeout=30)
        try:
            connection.request(self.command, self.path, body=body, headers=headers)
            response = connection.getresponse()
            payload = response.read()
            self.send_response(response.status, response.reason)
            for key, value in response.getheaders():
                if key.lower() in {"transfer-encoding", "connection", "date", "server"}:
                    continue
                self.send_header(key, value)
            self.end_headers()
            self.wfile.write(payload)
        except Exception as exc:  # pylint: disable=broad-except
            payload = json.dumps(
                {
                    "error": "competition_console_api_unavailable",
                    "message": str(exc),
                },
                ensure_ascii=False,
            ).encode("utf-8")
            self.send_response(502, "Bad Gateway")
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
        finally:
            connection.close()

    def do_GET(self) -> None:  # noqa: N802
        if self.path.startswith("/api/"):
            self._proxy_api()
            return
        super().do_GET()

    def do_POST(self) -> None:  # noqa: N802
        if self.path.startswith("/api/"):
            self._proxy_api()
            return
        self.send_error(405, "POST only supported for /api/*")

    def do_DELETE(self) -> None:  # noqa: N802
        if self.path.startswith("/api/"):
            self._proxy_api()
            return
        self.send_error(405, "DELETE only supported for /api/*")


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s:%(name)s:%(message)s")
    repo_root = Path(get_package_prefix("competition_console_api")).parent.parent
    web_root = repo_root / "packages" / "ops" / "competition_console_web"
    dist_root = web_root / "dist"
    serve_root = dist_root if dist_root.exists() else web_root
    os.chdir(serve_root)
    host = os.environ.get("DUAL_ARM_CONSOLE_WEB_HOST", "127.0.0.1")
    port = int(os.environ.get("DUAL_ARM_CONSOLE_WEB_PORT", "18081"))
    server = ThreadingHTTPServer((host, port), CompetitionConsoleStaticHandler)
    LOGGER.info("competition_console_web static server serving %s on %s:%s", serve_root, host, port)
    server.serve_forever()


if __name__ == "__main__":
    main()
