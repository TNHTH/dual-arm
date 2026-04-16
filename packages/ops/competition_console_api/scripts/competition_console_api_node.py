#!/usr/bin/python3

from __future__ import annotations

import json
import os
import shlex
import signal
import subprocess
import sys
import threading
import time
from http import HTTPStatus
from pathlib import Path
from typing import Any, Optional

import rclpy
from ament_index_python.packages import get_package_prefix
from rclpy.action import ActionClient
from rclpy.node import Node

from dualarm_interfaces.action import RunCompetition


def _discover_repo_root_from_file() -> Optional[Path]:
    current = Path(__file__).resolve()
    for parent in [current.parent, *current.parents]:
        if (parent / "STATE.md").exists() and (parent / "packages").is_dir():
            return parent
    return None


_REPO_ROOT_HINT = _discover_repo_root_from_file()
if _REPO_ROOT_HINT is not None:
    helper_dir = _REPO_ROOT_HINT / "packages" / "tools" / "tools" / "scripts"
    if helper_dir.is_dir():
        sys.path.insert(0, str(helper_dir))

try:
    from dual_arm_paths import get_archive_root, get_repo_root, get_shared_root
except Exception:  # pylint: disable=broad-except
    def get_repo_root(start: Path | None = None) -> Path:
        if start is not None:
            current = start.resolve()
            for parent in [current if current.is_dir() else current.parent, *(current if current.is_dir() else current.parent).parents]:
                if (parent / "STATE.md").exists() and (parent / "packages").is_dir():
                    return parent
        if _REPO_ROOT_HINT is not None:
            return _REPO_ROOT_HINT
        return Path(get_package_prefix("competition_console_api")).parent.parent

    def get_shared_root(start: Path | None = None) -> Path:
        if os.environ.get("DUAL_ARM_SHARED_ROOT"):
            return Path(os.environ["DUAL_ARM_SHARED_ROOT"]).resolve()
        return get_repo_root(start) / ".codex" / "runtime" / "shared"

    def get_archive_root(start: Path | None = None) -> Path:
        if os.environ.get("DUAL_ARM_ARCHIVE_ROOT"):
            return Path(os.environ["DUAL_ARM_ARCHIVE_ROOT"]).resolve()
        return Path.home() / ".cleanup-archive" / "dual-arm"

try:
    from fastapi import FastAPI
    from pydantic import BaseModel
    from fastapi.responses import JSONResponse
    import uvicorn
except Exception:  # pylint: disable=broad-except
    FastAPI = None
    BaseModel = object
    JSONResponse = None
    uvicorn = None


class RunCompetitionRequest(BaseModel):
    requested_order: str = "handover,pouring"
    resume_from_checkpoint: bool = False
    checkpoint_id: str = ""
    allow_reconcile: bool = True


class BringupRequest(BaseModel):
    start_hardware: bool = False
    start_detector: bool = False
    start_camera_bridge: bool = True
    use_mock_camera_stream: bool = True
    publish_fake_joint_states: bool = True
    profile: str = "test"


class CompetitionConsoleApiNode(Node):
    def __init__(self) -> None:
        super().__init__("competition_console_api")
        self.declare_parameter("profile", "test")
        self.declare_parameter("host", "0.0.0.0")
        self.declare_parameter("port", 18080)
        self._profile = str(self.get_parameter("profile").value)
        self._host = str(self.get_parameter("host").value)
        self._port = int(self.get_parameter("port").value)
        self._repo_root = get_repo_root(_REPO_ROOT_HINT or Path(__file__).resolve())
        self._shared_root = get_shared_root(self._repo_root)
        self._archive_root = get_archive_root(self._repo_root)
        self._packages_root = self._repo_root / "packages"
        self._install_setup = self._repo_root / "install" / "setup.bash"
        self._tools_scripts_root = self._packages_root / "tools" / "tools" / "scripts"
        self._web_root = self._packages_root / "ops" / "competition_console_web"
        self._checkpoint_root = self._repo_root / ".artifacts" / "checkpoints" / "competition"
        self._checkpoint_root.mkdir(parents=True, exist_ok=True)
        self._launch_log = self._repo_root / ".artifacts" / "competition_core.log"
        self._run_client = ActionClient(self, RunCompetition, "/competition/run")
        self._last_run: dict[str, Any] = {"status": "idle"}
        self._core_process: Optional[subprocess.Popen[str]] = None
        self._acceptance_results: dict[str, Any] = {}
        if FastAPI is None or uvicorn is None:
            raise RuntimeError("competition_console_api 依赖 FastAPI/uvicorn，不允许静默降级")
        self._app = self._create_app()
        self._server_thread = None
        self.get_logger().info(
            f"competition_console_api 已启动，profile={self._profile}, port={self._port}, repo_root={self._repo_root}"
        )
        self._start_http_server()

    def _build_workspace_shell(self, inner_command: str, workdir: Optional[Path] = None) -> list[str]:
        cwd = workdir or self._repo_root
        command_parts = [
            f"cd {shlex.quote(str(cwd))}",
            "source /opt/ros/humble/setup.bash",
        ]
        if self._install_setup.exists():
            command_parts.append(f"source {shlex.quote(str(self._install_setup))}")
        command_parts.append(inner_command)
        return ["bash", "-lc", " && ".join(command_parts)]

    def _tool_script(self, script_name: str) -> Path:
        return self._tools_scripts_root / script_name

    def _create_app(self):
        app = FastAPI(title="dual-arm competition console", version="0.1.0")

        @app.get("/api/health")
        async def health():
            return {"status": "ok", "profile": self._profile, "node": self.get_name()}

        @app.get("/api/status")
        async def status():
            return {
                "profile": self._profile,
                "checkpoint_root": str(self._checkpoint_root),
                "latest_checkpoint_exists": (self._checkpoint_root / "latest.json").exists(),
                "core_running": self._core_process is not None and self._core_process.poll() is None,
                "core_pid": self._core_process.pid if self._core_process and self._core_process.poll() is None else None,
                "launch_log": str(self._launch_log),
                "repo_root": str(self._repo_root),
                "shared_root": str(self._shared_root),
                "archive_root": str(self._archive_root),
            }

        @app.post("/api/bringup/start")
        async def bringup_start(request: BringupRequest):
            if self._core_process is not None and self._core_process.poll() is None:
                return {"started": False, "status": "already_running", "pid": self._core_process.pid}
            env = os.environ.copy()
            env.setdefault("DUAL_ARM_REPO_ROOT", str(self._repo_root))
            env.setdefault("DUAL_ARM_SHARED_ROOT", str(self._shared_root))
            env.setdefault("DUAL_ARM_ARCHIVE_ROOT", str(self._archive_root))
            cmd = [
                "ros2",
                "launch",
                "dualarm_bringup",
                "competition_core.launch.py",
                f"start_hardware:={'true' if request.start_hardware else 'false'}",
                f"start_detector:={'true' if request.start_detector else 'false'}",
                f"start_camera_bridge:={'true' if request.start_camera_bridge else 'false'}",
                f"use_mock_camera_stream:={'true' if request.use_mock_camera_stream else 'false'}",
                f"publish_fake_joint_states:={'true' if request.publish_fake_joint_states else 'false'}",
            ]
            self._launch_log.parent.mkdir(parents=True, exist_ok=True)
            log_handle = self._launch_log.open("a", encoding="utf-8")
            self._core_process = subprocess.Popen(  # pylint: disable=consider-using-with
                cmd,
                cwd=self._repo_root,
                env=env,
                stdout=log_handle,
                stderr=subprocess.STDOUT,
                text=True,
                start_new_session=True,
            )
            return {"started": True, "status": "started", "pid": self._core_process.pid}

        @app.post("/api/bringup/stop")
        async def bringup_stop():
            if self._core_process is None or self._core_process.poll() is not None:
                return {"stopped": False, "status": "not_running"}
            os.killpg(os.getpgid(self._core_process.pid), signal.SIGINT)
            try:
                self._core_process.wait(timeout=5.0)
            except subprocess.TimeoutExpired:
                os.killpg(os.getpgid(self._core_process.pid), signal.SIGTERM)
            return {"stopped": True, "status": "stopped"}

        @app.get("/api/checkpoints/latest")
        async def latest_checkpoint():
            latest = self._checkpoint_root / "latest.json"
            if not latest.exists():
                return JSONResponse(status_code=HTTPStatus.NOT_FOUND, content={"error": "latest checkpoint missing"})
            return json.loads(latest.read_text(encoding="utf-8"))

        @app.get("/api/checkpoints/runs")
        async def list_runs():
            runs_dir = self._checkpoint_root / "runs"
            runs_dir.mkdir(parents=True, exist_ok=True)
            return {"runs": sorted(path.name for path in runs_dir.glob("*.jsonl"))}

        @app.get("/api/acceptance/waves")
        async def acceptance_waves():
            return {
                "waves": [
                    "workspace",
                    "resume",
                    "camera_frames",
                    "perception",
                    "scene",
                    "planning_scene",
                    "planner",
                    "execution",
                    "opening",
                    "pouring",
                    "handover",
                    "web_console",
                ]
            }

        @app.get("/api/acceptance/results")
        async def acceptance_results():
            return self._acceptance_results

        @app.post("/api/acceptance/run/{wave}")
        async def run_acceptance(wave: str):
            wave_commands = {
                "workspace": self._build_workspace_shell("colcon list --base-paths packages"),
                "resume": self._build_workspace_shell(
                    f"/usr/bin/python3 {shlex.quote(str(self._tool_script('smoke_resume_checkpoint.py')))}"
                ),
                "camera_frames": self._build_workspace_shell(
                    f"/usr/bin/python3 {shlex.quote(str(self._tool_script('smoke_camera_frames.py')))}"
                ),
                "web_console": self._build_workspace_shell(
                    "npm run build >/tmp/competition_console_build.log 2>&1 && echo ok",
                    workdir=self._web_root,
                ),
                "planning_scene": self._build_workspace_shell(
                    f"/usr/bin/python3 {shlex.quote(str(self._tool_script('smoke_planning_scene_sync.py')))}"
                ),
            }
            command = wave_commands.get(wave)
            if command is None:
                return JSONResponse(status_code=HTTPStatus.NOT_FOUND, content={"error": f"unknown wave: {wave}"})
            completed = subprocess.run(command, capture_output=True, text=True, cwd=self._repo_root, timeout=30, check=False)
            payload = {
                "wave": wave,
                "returncode": completed.returncode,
                "stdout": completed.stdout[-4000:],
                "stderr": completed.stderr[-4000:],
                "passes": completed.returncode == 0,
            }
            self._acceptance_results[wave] = payload
            return payload

        @app.get("/api/tasks/last-run")
        async def last_run():
            return self._last_run

        @app.post("/api/tasks/run")
        async def run_task(request: RunCompetitionRequest):
            if not self._run_client.wait_for_server(timeout_sec=1.0):
                return JSONResponse(status_code=HTTPStatus.SERVICE_UNAVAILABLE, content={"error": "RunCompetition action 不可用"})
            goal = RunCompetition.Goal()
            goal.start_immediately = False
            goal.requested_order = request.requested_order
            goal.resume_from_checkpoint = request.resume_from_checkpoint
            goal.checkpoint_id = request.checkpoint_id
            goal.allow_reconcile = request.allow_reconcile
            future = self._run_client.send_goal_async(goal)
            if not self._wait_for_future(future, 2.0) or future.result() is None:
                return JSONResponse(status_code=HTTPStatus.GATEWAY_TIMEOUT, content={"error": "RunCompetition goal 发送超时"})
            goal_handle = future.result()
            if not goal_handle.accepted:
                self._last_run = {"status": "rejected", "requested_order": request.requested_order}
                return {"accepted": False, "status": "rejected"}
            result_future = goal_handle.get_result_async()
            self._wait_for_future(result_future, 5.0)
            payload: dict[str, Any]
            if result_future.result() is None:
                payload = {"accepted": True, "status": "running"}
            else:
                result = result_future.result().result
                payload = {
                    "accepted": True,
                    "status": "finished",
                    "success": bool(result.success),
                    "message": result.message,
                    "final_checkpoint_id": result.final_checkpoint_id,
                    "resume_hint": result.resume_hint,
                }
            self._last_run = payload
            return payload

        @app.post("/api/tasks/resume-latest")
        async def resume_latest():
            latest = self._checkpoint_root / "latest.json"
            if not latest.exists():
                return JSONResponse(status_code=HTTPStatus.NOT_FOUND, content={"error": "latest checkpoint missing"})
            data = json.loads(latest.read_text(encoding="utf-8"))
            request = RunCompetitionRequest(
                requested_order=str(data.get("task_sequence", "handover,pouring")).strip() or " ",
                resume_from_checkpoint=True,
                checkpoint_id=str(data.get("checkpoint_id", "")),
                allow_reconcile=True,
            )
            return await run_task(request)

        return app

    def _start_http_server(self) -> None:
        config = uvicorn.Config(self._app, host=self._host, port=self._port, log_level="warning")
        server = uvicorn.Server(config)
        self._server_thread = threading.Thread(target=server.run, daemon=True)
        self._server_thread.start()

    def _wait_for_future(self, future, timeout_sec: float) -> bool:
        deadline = time.monotonic() + timeout_sec
        while time.monotonic() < deadline:
            if future.done():
                return True
            time.sleep(0.05)
        return future.done()


def main() -> None:
    rclpy.init()
    node = CompetitionConsoleApiNode()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        try:
            rclpy.shutdown()
        except Exception:  # pylint: disable=broad-except
            pass


if __name__ == "__main__":
    main()
