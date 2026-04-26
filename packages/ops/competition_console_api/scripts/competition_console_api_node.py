#!/usr/bin/python3

from __future__ import annotations

import json
import math
import os
import re
import signal
import subprocess
import threading
import time
from http import HTTPStatus
from pathlib import Path
from typing import Any, Optional, TextIO

import rclpy
from ament_index_python.packages import get_package_prefix
from rclpy.action import ActionClient
from rclpy.node import Node
from sensor_msgs.msg import JointState

from dualarm_interfaces.action import ExecuteTrajectory
from dualarm_interfaces.action import RunCompetition
from dualarm_interfaces.srv import PlanJoint
from dualarm_interfaces.srv import SetGripper
from epg50_gripper_ros.msg import GripperStatus as GripperStatusMsg
from epg50_gripper_ros.srv import GripperStatus as GripperStatusSrv
from robo_ctrl.msg import RobotState
from robo_ctrl.srv import RobotMove, RobotMoveCart, RobotServoJoint

from competition_console_security import (
    authorize_dangerous_request,
    clamp_gripper_value,
    env_bool,
    is_dangerous_api_request,
    is_loopback_host,
    validate_jog_command,
)

try:
    from fastapi import FastAPI, Request
    from pydantic import BaseModel
    from fastapi.responses import JSONResponse
    import uvicorn
except Exception:  # pylint: disable=broad-except
    FastAPI = None
    Request = None
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
    left_robot_ip: str = "192.168.58.2"
    right_robot_ip: str = "192.168.58.3"
    camera_color_device: str = "auto"
    camera_depth_device: str = "auto"
    camera_depth_backend: str = "auto"


class ArmJogRequest(BaseModel):
    arm: str
    axis: str
    delta_mm: float = 5.0
    velocity: float = 5.0
    acceleration: float = 5.0


class ArmJogSessionRequest(BaseModel):
    arm: str
    axis: str
    delta_mm: float = 5.0
    velocity: float = 5.0
    acceleration: float = 5.0
    interval_ms: int = 250


class ArmJogStopRequest(BaseModel):
    arm: str


class ArmModeRequest(BaseModel):
    arm: str
    action: str


class GripperControlRequest(BaseModel):
    arm: str
    action: str
    position: int = 255
    speed: int = 255
    torque: int = 255


class SavePosePresetRequest(BaseModel):
    arm: str
    name: str


class MovePosePresetRequest(BaseModel):
    arm: str
    preset_id: str
    velocity: float = 5.0
    acceleration: float = 5.0
    include_gripper: bool = False


class ActionGroupStepRequest(BaseModel):
    arm: str
    preset_id: str
    include_gripper: bool = False
    delay_ms: int = 0
    stop_on_failure: bool = True


class SaveActionGroupRequest(BaseModel):
    name: str
    steps: list[ActionGroupStepRequest]


class RunActionGroupRequest(BaseModel):
    group_id: str
    velocity: float = 5.0
    acceleration: float = 5.0


class StartRecordingRequest(BaseModel):
    name: str = ""
    sample_interval_ms: int = 200


class RecordingMarkRequest(BaseModel):
    label: str = ""
    note: str = ""


class CompetitionConsoleApiNode(Node):
    def __init__(self) -> None:
        super().__init__("competition_console_api")
        self.declare_parameter("profile", "test")
        self.declare_parameter("host", os.environ.get("DUAL_ARM_CONSOLE_API_HOST", "127.0.0.1"))
        self.declare_parameter("port", 18080)
        self.declare_parameter("api_token", os.environ.get("DUAL_ARM_CONSOLE_API_TOKEN", ""))
        self.declare_parameter("allow_external_host", env_bool("DUAL_ARM_CONSOLE_ALLOW_EXTERNAL_HOST", False))
        self.declare_parameter("allow_unsafe_without_token", env_bool("DUAL_ARM_CONSOLE_ALLOW_UNSAFE_WITHOUT_TOKEN", False))
        self.declare_parameter("allow_hardware_bringup", env_bool("DUAL_ARM_CONSOLE_ALLOW_HARDWARE_BRINGUP", False))
        self.declare_parameter("max_jog_delta_mm", 10.0)
        self.declare_parameter("max_jog_cumulative_delta_mm", 50.0)
        self.declare_parameter("max_jog_duration_sec", 5.0)
        self.declare_parameter("min_jog_interval_ms", 120)
        self.declare_parameter("max_jog_velocity", 20.0)
        self.declare_parameter("max_jog_acceleration", 20.0)
        self.declare_parameter("max_gripper_speed", 160)
        self.declare_parameter("max_gripper_torque", 160)
        self._profile = str(self.get_parameter("profile").value)
        self._host = str(self.get_parameter("host").value)
        self._port = int(self.get_parameter("port").value)
        self._api_token = str(self.get_parameter("api_token").value)
        self._allow_external_host = bool(self.get_parameter("allow_external_host").value)
        self._allow_unsafe_without_token = bool(self.get_parameter("allow_unsafe_without_token").value)
        self._allow_hardware_bringup = bool(self.get_parameter("allow_hardware_bringup").value)
        self._max_jog_delta_mm = float(self.get_parameter("max_jog_delta_mm").value)
        self._max_jog_cumulative_delta_mm = float(self.get_parameter("max_jog_cumulative_delta_mm").value)
        self._max_jog_duration_sec = float(self.get_parameter("max_jog_duration_sec").value)
        self._min_jog_interval_ms = int(self.get_parameter("min_jog_interval_ms").value)
        self._max_jog_velocity = float(self.get_parameter("max_jog_velocity").value)
        self._max_jog_acceleration = float(self.get_parameter("max_jog_acceleration").value)
        self._max_gripper_speed = int(self.get_parameter("max_gripper_speed").value)
        self._max_gripper_torque = int(self.get_parameter("max_gripper_torque").value)
        if not is_loopback_host(self._host) and not self._allow_external_host:
            raise RuntimeError(
                "competition_console_api 默认禁止外部监听；如确需开放，请显式设置 allow_external_host=true 并配置 api_token"
            )
        self._repo_root = Path(get_package_prefix("competition_console_api")).parent.parent
        self._checkpoint_root = self._repo_root / ".artifacts" / "checkpoints" / "competition"
        self._checkpoint_root.mkdir(parents=True, exist_ok=True)
        self._launch_log = self._repo_root / ".artifacts" / "competition_core.log"
        self._security_log = self._repo_root / ".artifacts" / "competition_console_security.jsonl"
        self._pose_preset_path = self._repo_root / ".artifacts" / "console_pose_presets.json"
        self._action_group_path = self._repo_root / ".artifacts" / "console_action_groups.json"
        self._recording_root = self._repo_root / ".artifacts" / "console_recordings"
        self._recording_root.mkdir(parents=True, exist_ok=True)
        self._robo_ctrl_prefix = Path(get_package_prefix("robo_ctrl"))
        self._robot_mode_helper = self._robo_ctrl_prefix / "lib" / "robo_ctrl" / "robot_mode_helper"
        self._run_client = ActionClient(self, RunCompetition, "/competition/run")
        self._execute_trajectory_client = ActionClient(self, ExecuteTrajectory, "/execution/execute_trajectory")
        self._plan_joint_client = self.create_client(PlanJoint, "/planning/plan_joint")
        self._left_robot_move_client = self.create_client(RobotMove, "/L/robot_move")
        self._right_robot_move_client = self.create_client(RobotMove, "/R/robot_move")
        self._left_robot_move_cart_client = self.create_client(RobotMoveCart, "/L/robot_move_cart")
        self._right_robot_move_cart_client = self.create_client(RobotMoveCart, "/R/robot_move_cart")
        self._left_robot_servo_joint_client = self.create_client(RobotServoJoint, "/L/robot_servo_joint")
        self._right_robot_servo_joint_client = self.create_client(RobotServoJoint, "/R/robot_servo_joint")
        self._set_gripper_client = self.create_client(SetGripper, "/execution/set_gripper")
        self._left_gripper_status_client = self.create_client(GripperStatusSrv, "/gripper0/epg50_gripper/status")
        self._right_gripper_status_client = self.create_client(GripperStatusSrv, "/gripper1/epg50_gripper/status")
        self._last_run: dict[str, Any] = {"status": "idle"}
        default_bringup = BringupRequest()
        self._last_bringup_request: dict[str, Any] = (
            default_bringup.model_dump() if hasattr(default_bringup, "model_dump") else default_bringup.dict()
        )
        self._core_process: Optional[subprocess.Popen[str]] = None
        self._core_log_handle: Optional[TextIO] = None
        self._acceptance_results: dict[str, Any] = {}
        self._left_robot_state: Optional[RobotState] = None
        self._right_robot_state: Optional[RobotState] = None
        self._left_gripper_state: Optional[GripperStatusMsg] = None
        self._right_gripper_state: Optional[GripperStatusMsg] = None
        self._jog_session_lock = threading.Lock()
        self._jog_sessions: dict[str, dict[str, Any]] = {
            "left_arm": self._new_jog_session_state("left_arm"),
            "right_arm": self._new_jog_session_state("right_arm"),
        }
        self._recording_lock = threading.Lock()
        self._current_recording: Optional[dict[str, Any]] = None
        self._recording_stop_event: Optional[threading.Event] = None
        self._recording_thread: Optional[threading.Thread] = None
        self.create_subscription(RobotState, "/L/robot_state", self._handle_left_robot_state, 10)
        self.create_subscription(RobotState, "/R/robot_state", self._handle_right_robot_state, 10)
        self.create_subscription(GripperStatusMsg, "/gripper0/epg50_gripper/status_stream", self._handle_left_gripper_state, 10)
        self.create_subscription(GripperStatusMsg, "/gripper1/epg50_gripper/status_stream", self._handle_right_gripper_state, 10)
        if FastAPI is None or uvicorn is None:
            raise RuntimeError("competition_console_api 依赖 FastAPI/uvicorn，不允许静默降级")
        self._app = self._create_app()
        self._server_thread = None
        self.get_logger().info(
            f"competition_console_api 已启动，profile={self._profile}, host={self._host}, port={self._port}"
        )
        self._start_http_server()

    def _create_app(self):
        app = FastAPI(title="dual-arm competition console", version="0.1.0")

        @app.middleware("http")
        async def dangerous_api_guard(request: Request, call_next):
            if self._is_dangerous_api_request(request.method, request.url.path):
                auth_error = self._authorize_dangerous_request(request)
                if auth_error is not None:
                    self._audit_security_event(
                        "dangerous_api_rejected",
                        {
                            "method": request.method,
                            "path": request.url.path,
                            "client": request.client.host if request.client else None,
                            "reason": auth_error["error"],
                        },
                    )
                    return JSONResponse(status_code=auth_error["status_code"], content=auth_error)
            return await call_next(request)

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
                "last_bringup_request": self._last_bringup_request,
            }

        @app.post("/api/bringup/start")
        async def bringup_start(request: BringupRequest):
            if self._core_process is not None and self._core_process.poll() is None:
                return {"started": False, "status": "already_running", "pid": self._core_process.pid}
            return self._start_core_process(request)

        @app.post("/api/bringup/restart")
        async def bringup_restart(request: BringupRequest):
            self._stop_core_process()
            return self._start_core_process(request)

        @app.post("/api/bringup/stop")
        async def bringup_stop():
            if self._core_process is None or self._core_process.poll() is not None:
                return {"stopped": False, "status": "not_running"}
            self._stop_core_process()
            return {"stopped": True, "status": "stopped"}

        @app.get("/api/control/state")
        async def control_state():
            return {
                "left_robot": self._robot_state_to_dict(self._left_robot_state),
                "right_robot": self._robot_state_to_dict(self._right_robot_state),
                "core_running": self._core_process is not None and self._core_process.poll() is None,
                "jog_state": self._snapshot_jog_sessions(),
            }

        @app.get("/api/presets")
        async def list_pose_presets():
            return self._load_pose_presets()

        @app.post("/api/presets/current")
        async def save_current_pose(request: SavePosePresetRequest):
            arm_name = self._normalize_arm_name(request.arm)
            if arm_name is None:
                return JSONResponse(status_code=HTTPStatus.BAD_REQUEST, content={"error": f"unknown arm: {request.arm}"})
            state = self._left_robot_state if arm_name == "left_arm" else self._right_robot_state
            if state is None:
                return JSONResponse(status_code=HTTPStatus.SERVICE_UNAVAILABLE, content={"error": "robot_state unavailable"})
            preset = self._build_pose_preset(arm_name, request.name, state)
            presets = self._load_pose_presets()
            presets.setdefault(arm_name, []).append(preset)
            self._save_pose_presets(presets)
            payload = {"saved": True, "preset": preset, "presets": presets}
            self._recording_add_event("preset_saved", {"request": self._model_to_dict(request), "preset": preset})
            return payload

        @app.post("/api/presets/move")
        async def move_pose_preset(request: MovePosePresetRequest):
            arm_name = self._normalize_arm_name(request.arm)
            if arm_name is None:
                return JSONResponse(status_code=HTTPStatus.BAD_REQUEST, content={"error": f"unknown arm: {request.arm}"})
            presets = self._load_pose_presets()
            preset = next((item for item in presets.get(arm_name, []) if item["id"] == request.preset_id), None)
            if preset is None:
                return JSONResponse(status_code=HTTPStatus.NOT_FOUND, content={"error": f"preset missing: {request.preset_id}"})
            status_code, payload = self._execute_pose_preset(
                arm_name,
                preset,
                request.velocity,
                request.acceleration,
                include_gripper=bool(request.include_gripper),
            )
            if status_code != HTTPStatus.OK:
                return JSONResponse(status_code=status_code, content=payload)
            self._recording_add_event("preset_move", {"request": self._model_to_dict(request), "result": payload})
            return payload

        @app.delete("/api/presets/{arm}/{preset_id}")
        async def delete_pose_preset(arm: str, preset_id: str):
            arm_name = self._normalize_arm_name(arm)
            if arm_name is None:
                return JSONResponse(status_code=HTTPStatus.BAD_REQUEST, content={"error": f"unknown arm: {arm}"})
            presets = self._load_pose_presets()
            existing = presets.get(arm_name, [])
            kept = [item for item in existing if item["id"] != preset_id]
            if len(kept) == len(existing):
                return JSONResponse(status_code=HTTPStatus.NOT_FOUND, content={"error": f"preset missing: {preset_id}"})
            presets[arm_name] = kept
            self._save_pose_presets(presets)
            payload = {"deleted": True, "arm": arm_name, "preset_id": preset_id}
            self._recording_add_event("preset_deleted", payload)
            return payload

        @app.get("/api/action-groups")
        async def list_action_groups():
            return {"groups": self._load_action_groups()}

        @app.post("/api/action-groups")
        async def save_action_group(request: SaveActionGroupRequest):
            clean_name = request.name.strip()
            if not clean_name:
                return JSONResponse(status_code=HTTPStatus.BAD_REQUEST, content={"error": "action group name required"})
            if not request.steps:
                return JSONResponse(status_code=HTTPStatus.BAD_REQUEST, content={"error": "action group steps required"})
            normalized_steps: list[dict[str, Any]] = []
            for step in request.steps:
                arm_name = self._normalize_arm_name(step.arm)
                if arm_name is None:
                    return JSONResponse(status_code=HTTPStatus.BAD_REQUEST, content={"error": f"unknown arm: {step.arm}"})
                normalized_steps.append(
                    {
                        "arm": arm_name,
                        "preset_id": step.preset_id,
                        "include_gripper": bool(step.include_gripper),
                        "delay_ms": max(int(step.delay_ms), 0),
                        "stop_on_failure": bool(step.stop_on_failure),
                    }
                )
            groups = self._load_action_groups()
            group = {
                "id": f"action-group-{int(time.time() * 1000)}",
                "name": clean_name,
                "created_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
                "updated_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
                "steps": normalized_steps,
            }
            groups.append(group)
            self._save_action_groups(groups)
            payload = {"saved": True, "group": group, "groups": groups}
            self._recording_add_event("action_group_saved", {"request": self._model_to_dict(request), "group": group})
            return payload

        @app.post("/api/action-groups/run")
        async def run_action_group(request: RunActionGroupRequest):
            groups = self._load_action_groups()
            group = next((item for item in groups if item["id"] == request.group_id), None)
            if group is None:
                return JSONResponse(status_code=HTTPStatus.NOT_FOUND, content={"error": f"action group missing: {request.group_id}"})
            payload = self._run_action_group(group, request.velocity, request.acceleration)
            self._recording_add_event("action_group_run", {"request": self._model_to_dict(request), "result": payload})
            return payload

        @app.delete("/api/action-groups/{group_id}")
        async def delete_action_group(group_id: str):
            groups = self._load_action_groups()
            kept = [item for item in groups if item["id"] != group_id]
            if len(kept) == len(groups):
                return JSONResponse(status_code=HTTPStatus.NOT_FOUND, content={"error": f"action group missing: {group_id}"})
            self._save_action_groups(kept)
            payload = {"deleted": True, "group_id": group_id, "groups": kept}
            self._recording_add_event("action_group_deleted", payload)
            return payload

        @app.get("/api/recordings")
        async def list_recordings():
            return {
                "current": self._current_recording_summary(),
                "recordings": self._list_recordings(),
            }

        @app.get("/api/recordings/current")
        async def current_recording():
            return self._current_recording_summary()

        @app.post("/api/recordings/start")
        async def start_recording(request: StartRecordingRequest):
            status_code, payload = self._start_recording(request.name, request.sample_interval_ms)
            if status_code != HTTPStatus.OK:
                return JSONResponse(status_code=status_code, content=payload)
            return payload

        @app.post("/api/recordings/mark")
        async def mark_recording(request: RecordingMarkRequest):
            status_code, payload = self._recording_add_event(
                "manual_mark",
                {
                    "label": request.label.strip() or "mark",
                    "note": request.note.strip(),
                },
            )
            if status_code != HTTPStatus.OK:
                return JSONResponse(status_code=status_code, content=payload)
            return payload

        @app.post("/api/recordings/stop")
        async def stop_recording():
            status_code, payload = self._stop_recording()
            if status_code != HTTPStatus.OK:
                return JSONResponse(status_code=status_code, content=payload)
            return payload

        @app.get("/api/recordings/{recording_id}")
        async def get_recording(recording_id: str):
            recording_path = self._recording_path(recording_id)
            if not recording_path.exists():
                return JSONResponse(status_code=HTTPStatus.NOT_FOUND, content={"error": f"recording missing: {recording_id}"})
            return json.loads(recording_path.read_text(encoding="utf-8"))

        @app.delete("/api/recordings/{recording_id}")
        async def delete_recording(recording_id: str):
            recording_path = self._recording_path(recording_id)
            if not recording_path.exists():
                return JSONResponse(status_code=HTTPStatus.NOT_FOUND, content={"error": f"recording missing: {recording_id}"})
            recording_path.unlink()
            return {"deleted": True, "recording_id": recording_id, "recordings": self._list_recordings()}

        @app.post("/api/control/arm/jog")
        async def arm_jog(request: ArmJogRequest):
            arm_name = self._normalize_arm_name(request.arm)
            if arm_name is None:
                return JSONResponse(status_code=HTTPStatus.BAD_REQUEST, content={"error": f"unknown arm: {request.arm}"})
            status_code, payload = self._execute_arm_jog_once(
                arm_name,
                request.axis,
                request.delta_mm,
                request.velocity,
                request.acceleration,
            )
            if status_code != HTTPStatus.OK:
                return JSONResponse(status_code=status_code, content=payload)
            self._recording_add_event("arm_jog_once", {"request": self._model_to_dict(request), "result": payload})
            return payload

        @app.post("/api/control/arm/jog/start")
        async def arm_jog_start(request: ArmJogSessionRequest):
            arm_name = self._normalize_arm_name(request.arm)
            if arm_name is None:
                return JSONResponse(status_code=HTTPStatus.BAD_REQUEST, content={"error": f"unknown arm: {request.arm}"})
            axis = self._normalize_jog_axis(request.axis)
            if axis is None:
                return JSONResponse(status_code=HTTPStatus.BAD_REQUEST, content={"error": f"unknown axis: {request.axis}"})
            if math.isclose(float(request.delta_mm), 0.0, abs_tol=1e-9):
                return JSONResponse(status_code=HTTPStatus.BAD_REQUEST, content={"error": "delta_mm must be non-zero"})
            payload = self._start_jog_session(
                arm_name,
                axis,
                float(request.delta_mm),
                float(request.velocity),
                float(request.acceleration),
                max(int(request.interval_ms), self._min_jog_interval_ms),
            )
            if not bool(payload.get("started")):
                return JSONResponse(status_code=HTTPStatus.BAD_REQUEST, content=payload)
            self._recording_add_event("arm_jog_start", {"request": self._model_to_dict(request), "result": payload})
            return payload

        @app.post("/api/control/arm/jog/stop")
        async def arm_jog_stop(request: ArmJogStopRequest):
            arm_name = self._normalize_arm_name(request.arm)
            if arm_name is None:
                return JSONResponse(status_code=HTTPStatus.BAD_REQUEST, content={"error": f"unknown arm: {request.arm}"})
            payload = self._stop_jog_session(arm_name, "released")
            self._recording_add_event("arm_jog_stop", {"request": self._model_to_dict(request), "result": payload})
            return payload

        @app.post("/api/control/arm/mode")
        async def arm_mode(request: ArmModeRequest):
            arm_name = self._normalize_arm_name(request.arm)
            if arm_name is None:
                return JSONResponse(status_code=HTTPStatus.BAD_REQUEST, content={"error": f"unknown arm: {request.arm}"})
            action = request.action.lower().strip()
            if action not in {"manual", "recover"}:
                return JSONResponse(status_code=HTTPStatus.BAD_REQUEST, content={"error": f"unknown action: {request.action}"})
            arm_short = "L" if arm_name == "left_arm" else "R"
            robot_ip = (
                self._last_bringup_request.get("left_robot_ip", "192.168.58.2")
                if arm_name == "left_arm"
                else self._last_bringup_request.get("right_robot_ip", "192.168.58.3")
            )
            cmd = [str(self._robot_mode_helper), "--arm", arm_short, "--ip", str(robot_ip), "--normal-only"]
            if action == "manual":
                cmd.append("--manual-mode")
            else:
                cmd.append("--keep-mode")
            env = os.environ.copy()
            env["LD_PRELOAD"] = "/usr/lib/x86_64-linux-gnu/libstdc++.so.6"
            completed = subprocess.run(
                cmd,
                cwd=self._repo_root,
                env=env,
                capture_output=True,
                text=True,
                timeout=20,
                check=False,
            )
            payload = {
                "arm": arm_name,
                "action": action,
                "success": completed.returncode == 0,
                "stdout": completed.stdout[-3000:],
                "stderr": completed.stderr[-3000:],
                "returncode": completed.returncode,
            }
            self._recording_add_event("arm_mode", {"request": self._model_to_dict(request), "result": payload})
            return payload

        @app.post("/api/control/gripper")
        async def gripper_control(request: GripperControlRequest):
            arm_name = self._normalize_arm_name(request.arm)
            if arm_name is None:
                return JSONResponse(status_code=HTTPStatus.BAD_REQUEST, content={"error": f"unknown arm: {request.arm}"})
            action = request.action.lower().strip()
            if action == "enable":
                status_code, payload = self._send_gripper_command(arm_name, command=1)
            elif action == "disable":
                status_code, payload = self._send_gripper_command(arm_name, command=0)
            elif action == "open":
                status_code, payload = self._send_gripper_command(
                    arm_name,
                    command=2,
                    position=0,
                    speed=request.speed,
                    torque=request.torque,
                )
            elif action == "close":
                status_code, payload = self._send_gripper_command(
                    arm_name,
                    command=2,
                    position=255,
                    speed=request.speed,
                    torque=request.torque,
                )
            elif action == "custom":
                status_code, payload = self._send_gripper_command(
                    arm_name,
                    command=2,
                    position=request.position,
                    speed=request.speed,
                    torque=request.torque,
                )
            else:
                return JSONResponse(status_code=HTTPStatus.BAD_REQUEST, content={"error": f"unknown action: {request.action}"})
            payload["action"] = action
            if status_code != HTTPStatus.OK:
                return JSONResponse(status_code=status_code, content=payload)
            self._recording_add_event("gripper_command", {"request": self._model_to_dict(request), "result": payload})
            return payload

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
                "workspace": ["bash", "-lc", "cd /home/gwh/dual-arm && colcon list --base-paths packages"],
                "resume": ["bash", "-lc", "cd /home/gwh/dual-arm && source /opt/ros/humble/setup.bash && source install/setup.bash && /usr/bin/python3 packages/tools/tools/scripts/smoke_resume_checkpoint.py"],
                "camera_frames": ["bash", "-lc", "cd /home/gwh/dual-arm && source /opt/ros/humble/setup.bash && source install/setup.bash && /usr/bin/python3 packages/tools/tools/scripts/smoke_camera_frames.py"],
                "web_console": ["bash", "-lc", "cd /home/gwh/dual-arm/packages/ops/competition_console_web && npm run build >/tmp/competition_console_build.log 2>&1 && echo ok"],
                "planning_scene": ["bash", "-lc", "cd /home/gwh/dual-arm && source /opt/ros/humble/setup.bash && source install/setup.bash && /usr/bin/python3 packages/tools/tools/scripts/smoke_planning_scene_sync.py"],
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

    def _is_dangerous_api_request(self, method: str, path: str) -> bool:
        return is_dangerous_api_request(method, path)

    def _authorize_dangerous_request(self, request: Request) -> Optional[dict[str, Any]]:
        auth_error = authorize_dangerous_request(
            request.headers,
            api_token=self._api_token,
            allow_unsafe_without_token=self._allow_unsafe_without_token,
        )
        if auth_error is None and not self._api_token and self._allow_unsafe_without_token:
            self._audit_security_event(
                "dangerous_api_allowed_without_token",
                {"method": request.method, "path": request.url.path},
            )
        return auth_error

    def _audit_security_event(self, event_type: str, payload: dict[str, Any]) -> None:
        event = {
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
            "event": event_type,
            "payload": payload,
        }
        try:
            self._security_log.parent.mkdir(parents=True, exist_ok=True)
            with self._security_log.open("a", encoding="utf-8") as handle:
                handle.write(json.dumps(event, ensure_ascii=False) + "\n")
        except Exception as exc:  # pylint: disable=broad-except
            self.get_logger().warning(f"写入控制台安全审计日志失败: {exc}")

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

    def _wait_for_future_result(self, future, timeout_sec: float):
        if not self._wait_for_future(future, timeout_sec):
            return None
        try:
            return future.result()
        except Exception:  # pylint: disable=broad-except
            return None

    def _handle_left_robot_state(self, message: RobotState) -> None:
        self._left_robot_state = message

    def _handle_right_robot_state(self, message: RobotState) -> None:
        self._right_robot_state = message

    def _handle_left_gripper_state(self, message: GripperStatusMsg) -> None:
        self._left_gripper_state = message

    def _handle_right_gripper_state(self, message: GripperStatusMsg) -> None:
        self._right_gripper_state = message

    def _model_to_dict(self, model: Any) -> dict[str, Any]:
        if hasattr(model, "model_dump"):
            return model.model_dump()
        if hasattr(model, "dict"):
            return model.dict()
        return dict(model)

    def _normalize_arm_name(self, arm_name: str) -> Optional[str]:
        normalized = arm_name.strip().lower()
        if normalized in {"left", "left_arm"}:
            return "left_arm"
        if normalized in {"right", "right_arm"}:
            return "right_arm"
        return None

    def _normalize_jog_axis(self, axis: str) -> Optional[str]:
        normalized = axis.lower().strip()
        if normalized in {"x", "y", "z", "rx", "ry", "rz"}:
            return normalized
        return None

    def _new_jog_session_state(self, arm_name: str) -> dict[str, Any]:
        return {
            "arm": arm_name,
            "active": False,
            "axis": None,
            "delta_mm": 0.0,
            "velocity": 0.0,
            "acceleration": 0.0,
            "interval_ms": 0,
            "session_id": None,
            "started_at": None,
            "stopped_at": None,
            "stop_reason": None,
            "last_result": None,
            "cumulative_delta_mm": 0.0,
            "max_duration_sec": self._max_jog_duration_sec,
            "thread": None,
            "stop_event": None,
        }

    def _snapshot_jog_sessions(self) -> dict[str, dict[str, Any]]:
        with self._jog_session_lock:
            return {
                arm_name: {
                    "active": bool(session.get("active")),
                    "axis": session.get("axis"),
                    "delta_mm": float(session.get("delta_mm", 0.0)),
                    "velocity": float(session.get("velocity", 0.0)),
                    "acceleration": float(session.get("acceleration", 0.0)),
                    "interval_ms": int(session.get("interval_ms", 0)),
                    "session_id": session.get("session_id"),
                    "started_at": session.get("started_at"),
                    "stopped_at": session.get("stopped_at"),
                    "stop_reason": session.get("stop_reason"),
                    "last_result": session.get("last_result"),
                    "cumulative_delta_mm": float(session.get("cumulative_delta_mm", 0.0)),
                    "max_duration_sec": float(session.get("max_duration_sec", self._max_jog_duration_sec)),
                }
                for arm_name, session in self._jog_sessions.items()
            }

    def _load_pose_presets(self) -> dict[str, list[dict[str, Any]]]:
        if not self._pose_preset_path.exists():
            return {"left_arm": [], "right_arm": []}
        try:
            data = json.loads(self._pose_preset_path.read_text(encoding="utf-8"))
        except Exception:  # pylint: disable=broad-except
            return {"left_arm": [], "right_arm": []}
        return {
            "left_arm": list(data.get("left_arm", [])),
            "right_arm": list(data.get("right_arm", [])),
        }

    def _load_action_groups(self) -> list[dict[str, Any]]:
        if not self._action_group_path.exists():
            return []
        try:
            data = json.loads(self._action_group_path.read_text(encoding="utf-8"))
        except Exception:  # pylint: disable=broad-except
            return []
        return list(data.get("groups", []))

    def _save_pose_presets(self, presets: dict[str, list[dict[str, Any]]]) -> None:
        self._pose_preset_path.parent.mkdir(parents=True, exist_ok=True)
        self._pose_preset_path.write_text(
            json.dumps(
                {
                    "left_arm": presets.get("left_arm", []),
                    "right_arm": presets.get("right_arm", []),
                },
                ensure_ascii=False,
                indent=2,
            ),
            encoding="utf-8",
        )

    def _save_action_groups(self, groups: list[dict[str, Any]]) -> None:
        self._action_group_path.parent.mkdir(parents=True, exist_ok=True)
        self._action_group_path.write_text(
            json.dumps({"groups": groups}, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    def _recording_path(self, recording_id: str) -> Path:
        safe_id = re.sub(r"[^A-Za-z0-9_.-]", "_", recording_id)
        return self._recording_root / f"{safe_id}.json"

    def _list_recordings(self) -> list[dict[str, Any]]:
        recordings: list[dict[str, Any]] = []
        for path in sorted(self._recording_root.glob("*.json"), reverse=True):
            try:
                data = json.loads(path.read_text(encoding="utf-8"))
            except Exception:  # pylint: disable=broad-except
                continue
            recordings.append(
                {
                    "id": data.get("id", path.stem),
                    "name": data.get("name", path.stem),
                    "started_at": data.get("started_at"),
                    "stopped_at": data.get("stopped_at"),
                    "duration_ms": data.get("duration_ms", 0),
                    "sample_count": len(data.get("samples", [])),
                    "event_count": len(data.get("events", [])),
                    "path": str(path),
                }
            )
        return recordings

    def _current_recording_summary(self) -> dict[str, Any]:
        with self._recording_lock:
            if self._current_recording is None:
                return {"active": False}
            return {
                "active": self._current_recording.get("status") == "recording",
                "id": self._current_recording.get("id"),
                "name": self._current_recording.get("name"),
                "started_at": self._current_recording.get("started_at"),
                "sample_interval_ms": self._current_recording.get("sample_interval_ms"),
                "sample_count": len(self._current_recording.get("samples", [])),
                "event_count": len(self._current_recording.get("events", [])),
            }

    def _start_recording(self, name: str, sample_interval_ms: int) -> tuple[int, dict[str, Any]]:
        with self._recording_lock:
            if self._current_recording is not None and self._current_recording.get("status") == "recording":
                return HTTPStatus.CONFLICT, {
                    "error": "recording already active",
                    "current": {
                        "active": True,
                        "id": self._current_recording.get("id"),
                        "name": self._current_recording.get("name"),
                        "sample_count": len(self._current_recording.get("samples", [])),
                        "event_count": len(self._current_recording.get("events", [])),
                    },
                }
            recording_id = f"recording-{int(time.time() * 1000)}"
            clean_name = name.strip() or time.strftime("动作录制-%Y-%m-%d-%H-%M-%S")
            interval_ms = min(max(int(sample_interval_ms), 100), 2000)
            self._current_recording = {
                "id": recording_id,
                "name": clean_name,
                "status": "recording",
                "started_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
                "stopped_at": None,
                "sample_interval_ms": interval_ms,
                "samples": [],
                "events": [],
                "_started_monotonic": time.monotonic(),
            }
            self._current_recording["samples"].append(self._build_recording_sample_locked())
            self._recording_stop_event = threading.Event()
            self._recording_thread = threading.Thread(
                target=self._recording_loop,
                args=(recording_id, self._recording_stop_event, interval_ms / 1000.0),
                daemon=True,
            )
            self._recording_thread.start()
        self._recording_add_event("recording_started", {"name": clean_name, "sample_interval_ms": interval_ms})
        return HTTPStatus.OK, {"started": True, "recording": self._current_recording_summary()}

    def _stop_recording(self) -> tuple[int, dict[str, Any]]:
        with self._recording_lock:
            if self._current_recording is None or self._current_recording.get("status") != "recording":
                return HTTPStatus.CONFLICT, {"error": "recording not active"}
            recording_id = str(self._current_recording["id"])
            stop_event = self._recording_stop_event
            thread = self._recording_thread
        if stop_event is not None:
            stop_event.set()
        if thread is not None and thread.is_alive():
            thread.join(timeout=3.0)
        with self._recording_lock:
            assert self._current_recording is not None
            started_monotonic = float(self._current_recording.get("_started_monotonic", time.monotonic()))
            self._current_recording["status"] = "stopped"
            self._current_recording["stopped_at"] = time.strftime("%Y-%m-%dT%H:%M:%S")
            self._current_recording["duration_ms"] = int((time.monotonic() - started_monotonic) * 1000)
            self._current_recording.pop("_started_monotonic", None)
            saved_recording = json.loads(json.dumps(self._current_recording, ensure_ascii=False))
            self._recording_path(recording_id).write_text(json.dumps(saved_recording, ensure_ascii=False, indent=2), encoding="utf-8")
            self._current_recording = None
            self._recording_stop_event = None
            self._recording_thread = None
        return HTTPStatus.OK, {"stopped": True, "recording": saved_recording, "recordings": self._list_recordings()}

    def _recording_loop(self, recording_id: str, stop_event: threading.Event, interval_sec: float) -> None:
        while not stop_event.wait(interval_sec):
            with self._recording_lock:
                if self._current_recording is None or self._current_recording.get("id") != recording_id:
                    return
                if self._current_recording.get("status") != "recording":
                    return
                self._current_recording.setdefault("samples", []).append(self._build_recording_sample_locked())

    def _build_recording_sample_locked(self) -> dict[str, Any]:
        assert self._current_recording is not None
        started_monotonic = float(self._current_recording.get("_started_monotonic", time.monotonic()))
        return {
            "t_ms": int((time.monotonic() - started_monotonic) * 1000),
            "wall_time": time.strftime("%Y-%m-%dT%H:%M:%S"),
            "left_robot": self._robot_state_to_dict(self._left_robot_state),
            "right_robot": self._robot_state_to_dict(self._right_robot_state),
            "left_gripper": self._gripper_status_to_dict(self._left_gripper_state),
            "right_gripper": self._gripper_status_to_dict(self._right_gripper_state),
        }

    def _recording_add_event(self, event_type: str, payload: dict[str, Any]) -> tuple[int, dict[str, Any]]:
        with self._recording_lock:
            if self._current_recording is None or self._current_recording.get("status") != "recording":
                return HTTPStatus.CONFLICT, {"error": "recording not active"}
            started_monotonic = float(self._current_recording.get("_started_monotonic", time.monotonic()))
            event = {
                "t_ms": int((time.monotonic() - started_monotonic) * 1000),
                "wall_time": time.strftime("%Y-%m-%dT%H:%M:%S"),
                "type": event_type,
                "payload": payload,
            }
            self._current_recording.setdefault("events", []).append(event)
        return HTTPStatus.OK, {"recorded": True, "event": event, "recording": self._current_recording_summary()}

    def _build_pose_preset(self, arm_name: str, name: str, state: RobotState) -> dict[str, Any]:
        clean_name = name.strip() or f"{arm_name}-{int(time.time())}"
        return {
            "id": f"{arm_name}-{int(time.time() * 1000)}",
            "name": clean_name,
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
            "joint_positions": [
                float(state.joint_position.j1),
                float(state.joint_position.j2),
                float(state.joint_position.j3),
                float(state.joint_position.j4),
                float(state.joint_position.j5),
                float(state.joint_position.j6),
            ],
            "tcp_pose": {
                "x": float(state.tcp_pose.x),
                "y": float(state.tcp_pose.y),
                "z": float(state.tcp_pose.z),
                "rx": float(state.tcp_pose.rx),
                "ry": float(state.tcp_pose.ry),
                "rz": float(state.tcp_pose.rz),
            },
            "gripper_state": self._capture_gripper_snapshot(arm_name),
        }

    def _robot_state_to_dict(self, state: Optional[RobotState]) -> Optional[dict[str, Any]]:
        if state is None:
            return None
        return {
            "motion_done": bool(state.motion_done),
            "error_code": int(state.error_code),
            "joint_position": {
                "j1": float(state.joint_position.j1),
                "j2": float(state.joint_position.j2),
                "j3": float(state.joint_position.j3),
                "j4": float(state.joint_position.j4),
                "j5": float(state.joint_position.j5),
                "j6": float(state.joint_position.j6),
            },
            "tcp_pose": {
                "x": float(state.tcp_pose.x),
                "y": float(state.tcp_pose.y),
                "z": float(state.tcp_pose.z),
                "rx": float(state.tcp_pose.rx),
                "ry": float(state.tcp_pose.ry),
                "rz": float(state.tcp_pose.rz),
            },
            "stamp": {
                "sec": int(state.header.stamp.sec),
                "nanosec": int(state.header.stamp.nanosec),
            },
        }

    def _gripper_status_to_dict(self, state: Optional[GripperStatusMsg]) -> Optional[dict[str, Any]]:
        if state is None:
            return None
        position = int(state.position)
        return {
            "success": True,
            "slave_id": int(state.slave_id),
            "status": int(state.status),
            "gact": bool(state.gact),
            "gsta": int(state.gsta),
            "gobj": int(state.gobj),
            "mode": int(state.mode),
            "error": int(state.error),
            "position": position,
            "speed": int(state.speed),
            "force": int(state.force),
            "voltage": int(state.voltage),
            "temperature": int(state.temperature),
            "error_message": state.error_message,
            "object_status": state.object_status,
            "interpreted_state": self._interpret_gripper_position(position),
        }

    def _get_robot_state_for_arm(self, arm_name: str) -> Optional[RobotState]:
        return self._left_robot_state if arm_name == "left_arm" else self._right_robot_state

    def _robot_joint_positions(self, state: RobotState) -> list[float]:
        return [
            float(state.joint_position.j1),
            float(state.joint_position.j2),
            float(state.joint_position.j3),
            float(state.joint_position.j4),
            float(state.joint_position.j5),
            float(state.joint_position.j6),
        ]

    def _build_joint_state_target(self, arm_name: str, joint_positions: list[float]) -> JointState:
        target = JointState()
        prefix = "left" if arm_name == "left_arm" else "right"
        target.name = [f"{prefix}_j{index}" for index in range(1, 7)]
        target.position = [math.radians(float(value)) for value in joint_positions]
        return target

    def _default_gripper_slave_id(self, arm_name: str) -> int:
        return 9 if arm_name == "left_arm" else 10

    def _gripper_status_client_for_arm(self, arm_name: str):
        return self._left_gripper_status_client if arm_name == "left_arm" else self._right_gripper_status_client

    def _capture_gripper_snapshot(self, arm_name: str) -> dict[str, Any]:
        client = self._gripper_status_client_for_arm(arm_name)
        slave_id = self._default_gripper_slave_id(arm_name)
        if not client.wait_for_service(timeout_sec=0.5):
            return {
                "success": False,
                "arm": arm_name,
                "slave_id": slave_id,
                "captured_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
                "message": "gripper status service unavailable",
            }
        request = GripperStatusSrv.Request()
        request.slave_id = slave_id
        future = client.call_async(request)
        response = self._wait_for_future_result(future, 2.0)
        if response is None:
            return {
                "success": False,
                "arm": arm_name,
                "slave_id": slave_id,
                "captured_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
                "message": "gripper status timeout",
            }
        if not bool(response.success):
            return {
                "success": False,
                "arm": arm_name,
                "slave_id": slave_id,
                "captured_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
                "message": response.error_message or "gripper status failed",
                "error": int(response.error),
            }
        position = int(response.position)
        return {
            "success": True,
            "arm": arm_name,
            "slave_id": slave_id,
            "captured_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
            "status": int(response.status),
            "gact": bool(response.gact),
            "gsta": int(response.gsta),
            "gobj": int(response.gobj),
            "mode": int(response.mode),
            "error": int(response.error),
            "position": position,
            "speed": int(response.speed),
            "force": int(response.force),
            "voltage": int(response.voltage),
            "temperature": int(response.temperature),
            "error_message": response.error_message,
            "object_status": response.object_status,
            "interpreted_state": self._interpret_gripper_position(position),
        }

    def _interpret_gripper_position(self, position: int) -> str:
        if position <= 20:
            return "open"
        if position >= 235:
            return "closed"
        return "partial"

    def _send_gripper_command(
        self,
        arm_name: str,
        *,
        command: int,
        position: int = 255,
        speed: int = 255,
        torque: int = 255,
        attach_on_success: bool = False,
        detach_on_success: bool = False,
    ) -> tuple[int, dict[str, Any]]:
        if not self._set_gripper_client.wait_for_service(timeout_sec=1.0):
            return HTTPStatus.SERVICE_UNAVAILABLE, {"success": False, "error": "set_gripper service unavailable"}
        safe_speed = clamp_gripper_value(speed, 1, self._max_gripper_speed)
        safe_torque = clamp_gripper_value(torque, 1, self._max_gripper_torque)
        command_request = SetGripper.Request()
        command_request.arm_name = arm_name
        command_request.command = command
        command_request.position = clamp_gripper_value(position, 0, 255)
        command_request.speed = safe_speed
        command_request.torque = safe_torque
        command_request.attach_on_success = attach_on_success
        command_request.detach_on_success = detach_on_success
        future = self._set_gripper_client.call_async(command_request)
        response = self._wait_for_future_result(future, 12.0)
        if response is None:
            return HTTPStatus.GATEWAY_TIMEOUT, {"success": False, "error": "set_gripper timeout"}
        return HTTPStatus.OK, {
            "arm": arm_name,
            "success": bool(response.success),
            "message": response.message,
            "speed": safe_speed,
            "torque": safe_torque,
        }

    def _apply_gripper_snapshot(self, arm_name: str, snapshot: Optional[dict[str, Any]]) -> tuple[bool, dict[str, Any]]:
        if not snapshot or not bool(snapshot.get("success")):
            return False, {
                "success": False,
                "message": "preset missing valid gripper snapshot",
            }
        enable_status, enable_payload = self._send_gripper_command(arm_name, command=1)
        if enable_status != HTTPStatus.OK or not bool(enable_payload.get("success")):
            return False, {
                "success": False,
                "message": "failed to enable gripper before replay",
                "enable": enable_payload,
            }
        speed = int(snapshot.get("speed", 255)) or 255
        torque = int(snapshot.get("force", 255)) or 255
        target_position = min(max(int(snapshot.get("position", 0)), 0), 255)
        status_code, payload = self._send_gripper_command(
            arm_name,
            command=2,
            position=target_position,
            speed=speed,
            torque=torque,
        )
        payload["target_position"] = target_position
        payload["target_state"] = snapshot.get("interpreted_state")
        return status_code == HTTPStatus.OK and bool(payload.get("success")), payload

    def _execute_arm_jog_once(
        self,
        arm_name: str,
        axis: str,
        delta_mm: float,
        velocity: float,
        acceleration: float,
    ) -> tuple[int, dict[str, Any]]:
        normalized_axis = self._normalize_jog_axis(axis)
        if normalized_axis is None:
            return HTTPStatus.BAD_REQUEST, {"success": False, "error": f"unknown axis: {axis}"}
        validation_error = self._validate_jog_command(delta_mm, velocity, acceleration)
        if validation_error:
            return HTTPStatus.BAD_REQUEST, {"success": False, "error": validation_error}
        client = self._left_robot_move_cart_client if arm_name == "left_arm" else self._right_robot_move_cart_client
        if not client.wait_for_service(timeout_sec=1.0):
            return HTTPStatus.SERVICE_UNAVAILABLE, {"success": False, "error": "robot_move_cart service unavailable"}

        jog = RobotMoveCart.Request()
        setattr(jog.tcp_pose, normalized_axis, float(delta_mm))
        jog.tool = 0
        jog.user = 0
        jog.velocity = float(velocity)
        jog.acceleration = float(acceleration)
        jog.ovl = 100.0
        jog.blend_time = -1.0
        jog.config = -1
        jog.use_increment = True
        future = client.call_async(jog)
        response = self._wait_for_future_result(future, 10.0)
        if response is None:
            stop_payload = self._request_arm_stop(arm_name, "robot_move_cart_timeout")
            return HTTPStatus.GATEWAY_TIMEOUT, {
                "success": False,
                "error": "robot_move_cart timeout",
                "stop": stop_payload,
            }
        return HTTPStatus.OK, {
            "arm": arm_name,
            "axis": normalized_axis,
            "delta_mm": float(delta_mm),
            "success": bool(response.success),
            "message": response.message,
        }

    def _validate_jog_command(self, delta_mm: float, velocity: float, acceleration: float) -> Optional[str]:
        return validate_jog_command(
            delta_mm,
            velocity,
            acceleration,
            max_delta_mm=self._max_jog_delta_mm,
            max_velocity=self._max_jog_velocity,
            max_acceleration=self._max_jog_acceleration,
        )

    def _request_arm_stop(self, arm_name: str, reason: str) -> dict[str, Any]:
        client = self._left_robot_servo_joint_client if arm_name == "left_arm" else self._right_robot_servo_joint_client
        if not client.wait_for_service(timeout_sec=0.2):
            return {"requested": False, "arm": arm_name, "reason": reason, "message": "robot_servo_joint service unavailable"}
        request = RobotServoJoint.Request()
        request.command_type = 1
        future = client.call_async(request)
        response = self._wait_for_future_result(future, 1.0)
        if response is None:
            return {"requested": True, "arm": arm_name, "reason": reason, "success": False, "message": "stop request timeout"}
        return {
            "requested": True,
            "arm": arm_name,
            "reason": reason,
            "success": bool(response.success),
            "message": response.message,
        }

    def _run_jog_session(
        self,
        arm_name: str,
        session_id: str,
        stop_event: threading.Event,
        axis: str,
        delta_mm: float,
        velocity: float,
        acceleration: float,
        interval_ms: int,
    ) -> None:
        started_at = time.monotonic()
        while not stop_event.is_set():
            with self._jog_session_lock:
                session = self._jog_sessions.get(arm_name)
                if session is None or session.get("session_id") != session_id:
                    return
                cumulative_delta = float(session.get("cumulative_delta_mm", 0.0))
                if cumulative_delta + abs(float(delta_mm)) > self._max_jog_cumulative_delta_mm:
                    session["active"] = False
                    session["stopped_at"] = time.strftime("%Y-%m-%dT%H:%M:%S")
                    session["stop_reason"] = "cumulative_limit"
                    session["thread"] = None
                    session["stop_event"] = None
                    session["last_result"] = self._request_arm_stop(arm_name, "cumulative_limit")
                    return
                if time.monotonic() - started_at > self._max_jog_duration_sec:
                    session["active"] = False
                    session["stopped_at"] = time.strftime("%Y-%m-%dT%H:%M:%S")
                    session["stop_reason"] = "duration_limit"
                    session["thread"] = None
                    session["stop_event"] = None
                    session["last_result"] = self._request_arm_stop(arm_name, "duration_limit")
                    return
            _, payload = self._execute_arm_jog_once(arm_name, axis, delta_mm, velocity, acceleration)
            with self._jog_session_lock:
                session = self._jog_sessions.get(arm_name)
                if session is None or session.get("session_id") != session_id:
                    return
                session["last_result"] = payload
                if not bool(payload.get("success")):
                    session["active"] = False
                    session["stopped_at"] = time.strftime("%Y-%m-%dT%H:%M:%S")
                    session["stop_reason"] = "command_failed"
                    session["thread"] = None
                    session["stop_event"] = None
                    return
                session["cumulative_delta_mm"] = float(session.get("cumulative_delta_mm", 0.0)) + abs(float(delta_mm))
            if stop_event.wait(interval_ms / 1000.0):
                break
        with self._jog_session_lock:
            session = self._jog_sessions.get(arm_name)
            if session is None or session.get("session_id") != session_id:
                return
            session["active"] = False
            session["stopped_at"] = time.strftime("%Y-%m-%dT%H:%M:%S")
            session["thread"] = None
            session["stop_event"] = None
            session["stop_reason"] = session.get("stop_reason") or "released"

    def _start_jog_session(
        self,
        arm_name: str,
        axis: str,
        delta_mm: float,
        velocity: float,
        acceleration: float,
        interval_ms: int,
    ) -> dict[str, Any]:
        self._stop_jog_session(arm_name, "replaced")
        validation_error = self._validate_jog_command(delta_mm, velocity, acceleration)
        if validation_error:
            return {"started": False, "arm": arm_name, "error": validation_error}
        session_id = f"{arm_name}-{int(time.time() * 1000)}"
        stop_event = threading.Event()
        thread = threading.Thread(
            target=self._run_jog_session,
            args=(arm_name, session_id, stop_event, axis, delta_mm, velocity, acceleration, interval_ms),
            daemon=True,
        )
        with self._jog_session_lock:
            session = self._jog_sessions[arm_name]
            session.update(
                {
                    "active": True,
                    "axis": axis,
                    "delta_mm": float(delta_mm),
                    "velocity": float(velocity),
                    "acceleration": float(acceleration),
                    "interval_ms": int(interval_ms),
                    "session_id": session_id,
                    "started_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
                    "stopped_at": None,
                    "stop_reason": None,
                    "last_result": None,
                    "cumulative_delta_mm": 0.0,
                    "max_duration_sec": self._max_jog_duration_sec,
                    "thread": thread,
                    "stop_event": stop_event,
                }
            )
        thread.start()
        return {
            "started": True,
            "arm": arm_name,
            "axis": axis,
            "delta_mm": float(delta_mm),
            "interval_ms": int(interval_ms),
            "session_id": session_id,
            "max_duration_sec": self._max_jog_duration_sec,
            "max_cumulative_delta_mm": self._max_jog_cumulative_delta_mm,
        }

    def _stop_jog_session(self, arm_name: str, reason: str) -> dict[str, Any]:
        thread: Optional[threading.Thread] = None
        stop_event: Optional[threading.Event] = None
        last_result: Optional[dict[str, Any]] = None
        with self._jog_session_lock:
            session = self._jog_sessions.get(arm_name)
            if session is None or not bool(session.get("active")):
                return {"stopped": False, "arm": arm_name, "status": "not_running"}
            session["stop_reason"] = reason
            thread = session.get("thread")
            stop_event = session.get("stop_event")
            last_result = session.get("last_result")
        if stop_event is not None:
            stop_event.set()
        stop_payload = self._request_arm_stop(arm_name, reason)
        if thread is not None and thread.is_alive():
            thread.join(timeout=2.0)
        with self._jog_session_lock:
            session = self._jog_sessions.get(arm_name)
            if session is not None:
                session["active"] = False
                session["stopped_at"] = time.strftime("%Y-%m-%dT%H:%M:%S")
                session["thread"] = None
                session["stop_event"] = None
        return {"stopped": True, "arm": arm_name, "status": "stopped", "last_result": last_result, "stop": stop_payload}

    def _stop_all_jog_sessions(self, reason: str) -> None:
        for arm_name in ("left_arm", "right_arm"):
            self._stop_jog_session(arm_name, reason)

    def _execute_pose_preset(
        self,
        arm_name: str,
        preset: dict[str, Any],
        velocity: float,
        acceleration: float,
        *,
        include_gripper: bool = False,
    ) -> tuple[int, dict[str, Any]]:
        self._stop_all_jog_sessions("preset_execution")
        state = self._get_robot_state_for_arm(arm_name)
        target_joints = [float(value) for value in preset["joint_positions"]]
        payload: dict[str, Any] = {
            "arm": arm_name,
            "preset_id": preset["id"],
            "preset_name": preset["name"],
            "include_gripper": bool(include_gripper),
        }
        if state is not None:
            current_joints = self._robot_joint_positions(state)
            max_joint_delta = max(abs(current - target) for current, target in zip(current_joints, target_joints))
            if max_joint_delta <= 0.5:
                payload.update(
                    {
                        "success": True,
                        "message": "当前已在目标姿态附近，无需切换",
                        "max_joint_delta_deg": max_joint_delta,
                        "current_error_code": int(state.error_code),
                    }
                )
                return HTTPStatus.OK, payload
        if not self._plan_joint_client.wait_for_service(timeout_sec=1.0):
            payload.update({"success": False, "stage": "planning", "error": "plan_joint service unavailable"})
            return HTTPStatus.SERVICE_UNAVAILABLE, payload

        plan_request = PlanJoint.Request()
        plan_request.arm_group = arm_name
        plan_request.target_joints = self._build_joint_state_target(arm_name, target_joints)
        plan_request.planner_id = ""
        plan_future = self._plan_joint_client.call_async(plan_request)
        plan_response = self._wait_for_future_result(plan_future, 10.0)
        if plan_response is None:
            payload.update({"success": False, "stage": "planning", "error": "plan_joint timeout"})
            return HTTPStatus.GATEWAY_TIMEOUT, payload
        if not bool(plan_response.success):
            payload.update(
                {
                    "success": False,
                    "stage": "planning",
                    "message": plan_response.message,
                    "result_code": plan_response.result_code,
                    "failure_stage": plan_response.failure_stage,
                    "planning_time_ms": float(plan_response.planning_time_ms),
                    "current_error_code": int(state.error_code) if state is not None else None,
                }
            )
            return HTTPStatus.OK, payload

        if not self._execute_trajectory_client.wait_for_server(timeout_sec=1.0):
            payload.update({"success": False, "stage": "execution", "error": "execute_trajectory action unavailable"})
            return HTTPStatus.SERVICE_UNAVAILABLE, payload
        clear_response = self._clear_servoj_task(arm_name)

        goal = ExecuteTrajectory.Goal()
        goal.arm_group = plan_response.primary_arm_group or arm_name
        goal.secondary_arm_group = plan_response.secondary_arm_group
        goal.joint_trajectory = plan_response.joint_trajectory
        goal.secondary_joint_trajectory = plan_response.secondary_joint_trajectory
        goal.cartesian_waypoints = []
        goal.synchronized = bool(plan_response.synchronized)
        goal.use_cartesian_execution = False
        goal.execution_profile = "pose_preset"
        goal_future = self._execute_trajectory_client.send_goal_async(goal)
        goal_handle = self._wait_for_future_result(goal_future, 3.0)
        if goal_handle is None:
            payload.update({"success": False, "stage": "execution", "error": "execute_trajectory goal timeout"})
            return HTTPStatus.GATEWAY_TIMEOUT, payload
        if not goal_handle.accepted:
            payload.update({"success": False, "stage": "execution", "message": "trajectory goal rejected"})
            return HTTPStatus.OK, payload
        result_future = goal_handle.get_result_async()
        result_wrapper = self._wait_for_future_result(result_future, 30.0)
        if result_wrapper is None:
            payload.update({"success": False, "stage": "execution", "error": "execute_trajectory result timeout"})
            return HTTPStatus.GATEWAY_TIMEOUT, payload
        result = result_wrapper.result
        latest_state = self._get_robot_state_for_arm(arm_name)
        payload.update(
            {
                "success": bool(result.success),
                "stage": "execution",
                "message": result.message,
                "result_code": result.result_code,
                "planning_time_ms": float(plan_response.planning_time_ms),
            }
        )
        if clear_response is not None:
            payload["servo_clear"] = {
                "success": bool(clear_response.success),
                "message": clear_response.message,
            }
        if latest_state is not None:
            payload["current_error_code"] = int(latest_state.error_code)
            payload["current_joint_positions"] = self._robot_joint_positions(latest_state)
            payload["target_joint_positions"] = target_joints
            payload["max_joint_delta_deg"] = max(
                abs(current - target)
                for current, target in zip(self._robot_joint_positions(latest_state), target_joints)
            )
        if bool(result.success) and include_gripper:
            gripper_success, gripper_payload = self._apply_gripper_snapshot(arm_name, preset.get("gripper_state"))
            payload["gripper"] = gripper_payload
            if not gripper_success:
                payload["success"] = False
                payload["stage"] = "gripper"
                payload["message"] = "trajectory executed but gripper replay failed"
        return HTTPStatus.OK, payload

    def _run_action_group(self, group: dict[str, Any], velocity: float, acceleration: float) -> dict[str, Any]:
        self._stop_all_jog_sessions("action_group")
        presets = self._load_pose_presets()
        step_results: list[dict[str, Any]] = []
        overall_success = True
        for index, step in enumerate(group.get("steps", []), start=1):
            arm_name = self._normalize_arm_name(str(step.get("arm", "")))
            preset_id = str(step.get("preset_id", ""))
            include_gripper = bool(step.get("include_gripper", False))
            delay_ms = max(int(step.get("delay_ms", 0)), 0)
            stop_on_failure = bool(step.get("stop_on_failure", True))
            if arm_name is None:
                step_payload = {
                    "step_index": index,
                    "success": False,
                    "message": f"unknown arm in action group: {step.get('arm')}",
                    "stop_on_failure": stop_on_failure,
                }
            else:
                preset = next((item for item in presets.get(arm_name, []) if item["id"] == preset_id), None)
                if preset is None:
                    step_payload = {
                        "step_index": index,
                        "arm": arm_name,
                        "preset_id": preset_id,
                        "success": False,
                        "message": "preset missing",
                        "stop_on_failure": stop_on_failure,
                    }
                else:
                    _, step_payload = self._execute_pose_preset(
                        arm_name,
                        preset,
                        velocity,
                        acceleration,
                        include_gripper=include_gripper,
                    )
                    step_payload["step_index"] = index
                    step_payload["delay_ms"] = delay_ms
                    step_payload["stop_on_failure"] = stop_on_failure
            step_results.append(step_payload)
            if not bool(step_payload.get("success")):
                overall_success = False
                if bool(step_payload.get("stop_on_failure", True)):
                    break
            if delay_ms > 0:
                time.sleep(delay_ms / 1000.0)
        return {
            "group_id": group.get("id"),
            "group_name": group.get("name"),
            "success": overall_success,
            "steps": step_results,
            "requested_velocity": float(velocity),
            "requested_acceleration": float(acceleration),
        }

    def _clear_servoj_task(self, arm_name: str):
        client = self._left_robot_servo_joint_client if arm_name == "left_arm" else self._right_robot_servo_joint_client
        if not client.wait_for_service(timeout_sec=0.5):
            return None
        request = RobotServoJoint.Request()
        request.command_type = 1
        future = client.call_async(request)
        return self._wait_for_future_result(future, 2.0)

    def _build_core_launch_cmd(self, request: BringupRequest) -> list[str]:
        return [
            "ros2",
            "launch",
            "dualarm_bringup",
            "competition_core.launch.py",
            f"start_hardware:={'true' if request.start_hardware else 'false'}",
            f"start_detector:={'true' if request.start_detector else 'false'}",
            f"start_camera_bridge:={'true' if request.start_camera_bridge else 'false'}",
            f"use_mock_camera_stream:={'true' if request.use_mock_camera_stream else 'false'}",
            f"publish_fake_joint_states:={'true' if request.publish_fake_joint_states else 'false'}",
            f"left_robot_ip:={request.left_robot_ip}",
            f"right_robot_ip:={request.right_robot_ip}",
            f"camera_color_device:={request.camera_color_device}",
            f"camera_depth_device:={request.camera_depth_device}",
            f"camera_depth_backend:={request.camera_depth_backend}",
        ]

    def _start_core_process(self, request: BringupRequest) -> dict[str, Any]:
        if bool(request.start_hardware) and not self._allow_hardware_bringup:
            self._audit_security_event(
                "hardware_bringup_rejected",
                {"request": request.model_dump() if hasattr(request, "model_dump") else request.dict()},
            )
            return {
                "started": False,
                "status": "hardware_bringup_blocked",
                "message": "software-only default blocks start_hardware=true; set allow_hardware_bringup=true explicitly",
            }
        env = os.environ.copy()
        self._cleanup_stale_core_processes()
        cmd = self._build_core_launch_cmd(request)
        self._launch_log.parent.mkdir(parents=True, exist_ok=True)
        self._core_log_handle = self._launch_log.open("a", encoding="utf-8")
        self._core_process = subprocess.Popen(  # pylint: disable=consider-using-with
            cmd,
            cwd=self._repo_root,
            env=env,
            stdout=self._core_log_handle,
            stderr=subprocess.STDOUT,
            text=True,
            start_new_session=True,
        )
        self._last_bringup_request = request.model_dump() if hasattr(request, "model_dump") else request.dict()
        return {"started": True, "status": "started", "pid": self._core_process.pid, "request": self._last_bringup_request}

    def _stop_core_process(self) -> None:
        self._stop_all_jog_sessions("core_stopped")
        if self._core_process is None or self._core_process.poll() is not None:
            return
        os.killpg(os.getpgid(self._core_process.pid), signal.SIGINT)
        try:
            self._core_process.wait(timeout=5.0)
        except subprocess.TimeoutExpired:
            os.killpg(os.getpgid(self._core_process.pid), signal.SIGTERM)
            self._core_process.wait(timeout=5.0)
        finally:
            self._core_process = None
            if self._core_log_handle is not None:
                self._core_log_handle.close()
                self._core_log_handle = None

    def _cleanup_stale_core_processes(self) -> None:
        patterns = [
            r"ros2 launch dualarm_bringup competition_core\.launch\.py",
            r"install/.*/planning_scene_sync/.*/planning_scene_sync_node\.py",
            r"install/.*/fairino_dualarm_planner/.*/fairino_dualarm_planner_node",
            r"install/.*/execution_adapter/.*/execution_adapter_node\.py",
            r"install/.*/dualarm_task_manager/.*/dualarm_task_manager_node\.py",
            r"install/.*/epg50_gripper_ros/.*/epg50_gripper_node",
            r"install/.*/robo_ctrl/.*/robo_ctrl_node",
            r"/opt/ros/humble/lib/moveit_ros_move_group/move_group",
        ]
        completed = subprocess.run(["ps", "-eo", "pid=,args="], capture_output=True, text=True, check=False)
        if completed.returncode != 0:
            return
        current_pid = os.getpid()
        matched_pids: list[int] = []
        for line in completed.stdout.splitlines():
            if not line.strip():
                continue
            pid_text, args = line.strip().split(" ", 1)
            pid = int(pid_text)
            if pid == current_pid:
                continue
            if any(re.search(pattern, args) for pattern in patterns):
                matched_pids.append(pid)
        for pid in sorted(set(matched_pids), reverse=True):
            try:
                os.kill(pid, signal.SIGINT)
            except ProcessLookupError:
                continue
        if matched_pids:
            time.sleep(2.0)
            for pid in sorted(set(matched_pids), reverse=True):
                try:
                    os.kill(pid, 0)
                except OSError:
                    continue
                try:
                    os.kill(pid, signal.SIGKILL)
                except ProcessLookupError:
                    continue

    def shutdown(self) -> None:
        with self._recording_lock:
            recording_active = self._current_recording is not None and self._current_recording.get("status") == "recording"
        if recording_active:
            self._stop_recording()
        self._stop_all_jog_sessions("api_shutdown")
        self._stop_core_process()


def main() -> None:
    rclpy.init()
    node = CompetitionConsoleApiNode()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.shutdown()
        node.destroy_node()
        try:
            rclpy.shutdown()
        except Exception:  # pylint: disable=broad-except
            pass


if __name__ == "__main__":
    main()
