#!/usr/bin/python3

from __future__ import annotations

from subprocess import Popen
from typing import Optional


def is_process_running(process: Optional[Popen[str]]) -> bool:
    return process is not None and process.poll() is None


def running_process_pid(process: Optional[Popen[str]]) -> int | None:
    if not is_process_running(process):
        return None
    return process.pid
