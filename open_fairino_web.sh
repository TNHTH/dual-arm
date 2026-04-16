#!/usr/bin/env bash
set -euo pipefail

URL="${1:-http://192.168.58.3/index.html}"

if command -v google-chrome >/dev/null 2>&1; then
  exec google-chrome --new-window --no-proxy-server "$URL"
elif command -v chromium >/dev/null 2>&1; then
  exec chromium --new-window --no-proxy-server "$URL"
elif command -v firefox >/dev/null 2>&1; then
  exec firefox --new-window "$URL"
else
  echo "未找到可用浏览器，请手动打开: $URL" >&2
  exit 1
fi
