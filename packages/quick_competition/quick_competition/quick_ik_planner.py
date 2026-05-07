from __future__ import annotations

from dataclasses import asdict, dataclass
import math
from typing import Any, Dict, Iterable, List, Optional

from .quick_motion_executor import MotionSafety
from .quick_task_pose_generator import GeneratedPose
from .quick_types import Result, find_repo_root, load_yaml, quick_config_path


@dataclass(frozen=True)
class QuickIKSolution:
    step_id: str
    arm: str
    object_id: str
    pose_table: List[float]
    score: float
    source: str = "computed_templates"
    joint_deg: Optional[List[float]] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class QuickIKPlanner:
    def __init__(self) -> None:
        repo_root = find_repo_root()
        self.profile = load_yaml(quick_config_path(repo_root, "quick_profile.yaml"))
        self.template_config = load_yaml(quick_config_path(repo_root, "quick_grasp_templates.yaml"))
        self.limits = load_yaml(quick_config_path(repo_root, "quick_motion_limits.yaml"))
        self.safety = MotionSafety(self.limits)
        computed_config = self.template_config.get("computed_templates", {})
        frames = self.profile.get("frames", {})
        self.require_moveit_service_default = bool(computed_config.get("require_moveit_service", True))
        self.ik_service_name = str(computed_config.get("ik_service_name", "/compute_ik"))
        self.ik_frame_id = str(computed_config.get("ik_frame_id", frames.get("world_frame", "table_frame")))
        self.ik_service_wait_timeout_s = float(computed_config.get("ik_service_wait_timeout_s", 0.25))
        self.ik_call_timeout_s = float(computed_config.get("ik_call_timeout_s", 1.0))
        self.ik_attempt_timeout_s = float(computed_config.get("ik_attempt_timeout_s", 0.05))
        self._rclpy = None
        self._node = None
        self._ik_client = None
        self._GetPositionIK = None
        self._MoveItErrorCodes = None
        self._ik_service_available: Optional[bool] = None

    def select_best(self, candidates: Iterable[GeneratedPose], require_moveit_service: Optional[bool] = None) -> Result:
        require_service = self.require_moveit_service_default if require_moveit_service is None else bool(require_moveit_service)
        accepted: List[QuickIKSolution] = []
        rejected: List[Dict[str, Any]] = []
        for candidate in candidates:
            workspace = self.safety.check_workspace_xyz(tuple(candidate.pose_table[:3]))
            if not workspace.success:
                rejected.append({"step_id": candidate.step_id, "reason": workspace.message, "code": workspace.code})
                continue
            ik_result = self._check_moveit_ik(candidate) if require_service else Result.ok("MoveIt IK service disabled by config")
            if not ik_result.success:
                rejected.append({"step_id": candidate.step_id, "reason": ik_result.message, "code": ik_result.code})
                continue
            accepted.append(
                QuickIKSolution(
                    step_id=candidate.step_id,
                    arm=candidate.arm,
                    object_id=candidate.object_id,
                    pose_table=list(candidate.pose_table),
                    score=self._score(candidate),
                    joint_deg=ik_result.data.get("joint_deg"),
                )
            )
        if not accepted:
            return Result.fail("computed pose 无可用 IK/安全候选", code="computed_pose_unavailable", rejected=rejected)
        accepted.sort(key=lambda item: item.score, reverse=True)
        return Result.ok("computed pose selected", solution=accepted[0].to_dict(), rejected=rejected)

    def _check_moveit_ik(self, candidate: GeneratedPose) -> Result:
        client_ready = self._ensure_ik_client()
        if not client_ready.success:
            return client_ready
        request = self._GetPositionIK.Request()
        request.ik_request.group_name = candidate.arm
        request.ik_request.avoid_collisions = True
        request.ik_request.ik_link_name = self._ik_link_name(candidate.arm)
        request.ik_request.pose_stamped = self._pose_stamped(candidate)
        request.ik_request.robot_state.is_diff = True
        timeout_sec = max(self.ik_attempt_timeout_s, 0.001)
        request.ik_request.timeout.sec = int(timeout_sec)
        request.ik_request.timeout.nanosec = int((timeout_sec - int(timeout_sec)) * 1_000_000_000)
        future = self._ik_client.call_async(request)
        self._rclpy.spin_until_future_complete(self._node, future, timeout_sec=self.ik_call_timeout_s)
        if not future.done() or future.result() is None:
            return Result.fail(f"{self.ik_service_name} IK 调用超时", code="moveit_ik_timeout")
        response = future.result()
        if int(response.error_code.val) != int(self._MoveItErrorCodes.SUCCESS):
            return Result.fail(f"MoveIt IK 失败 error_code={response.error_code.val}", code="moveit_ik_failed")
        joint_deg = self._joint_degrees_for_arm(candidate.arm, response.solution.joint_state)
        if len(joint_deg) != 6:
            return Result.fail("MoveIt IK 返回关节数不完整", code="moveit_ik_joint_mismatch")
        return Result.ok("MoveIt IK/collision OK", joint_deg=joint_deg, moveit_error_code=int(response.error_code.val))

    def _ensure_ik_client(self) -> Result:
        if self._ik_service_available is False:
            return Result.fail(f"{self.ik_service_name} 服务不可用", code="moveit_ik_service_unavailable")
        try:
            if self._rclpy is None:
                import rclpy  # type: ignore
                from moveit_msgs.msg import MoveItErrorCodes  # type: ignore
                from moveit_msgs.srv import GetPositionIK  # type: ignore

                self._rclpy = rclpy
                self._GetPositionIK = GetPositionIK
                self._MoveItErrorCodes = MoveItErrorCodes
            if not self._rclpy.ok():
                self._rclpy.init(args=None)
            if self._node is None:
                self._node = self._rclpy.create_node("quick_ik_planner_preflight")
            if self._ik_client is None:
                self._ik_client = self._node.create_client(self._GetPositionIK, self.ik_service_name)
            if not self._ik_client.wait_for_service(timeout_sec=self.ik_service_wait_timeout_s):
                self._ik_service_available = False
                return Result.fail(f"{self.ik_service_name} 服务不可用", code="moveit_ik_service_unavailable")
            self._ik_service_available = True
            return Result.ok("MoveIt IK service available")
        except Exception as exc:  # pylint: disable=broad-except
            self._ik_service_available = False
            return Result.fail(f"MoveIt IK client 初始化失败: {exc}", code="moveit_ik_client_error")

    def _pose_stamped(self, candidate: GeneratedPose):
        from geometry_msgs.msg import PoseStamped  # type: ignore

        pose = PoseStamped()
        pose.header.frame_id = self.ik_frame_id
        pose.pose.position.x = float(candidate.pose_table[0])
        pose.pose.position.y = float(candidate.pose_table[1])
        pose.pose.position.z = float(candidate.pose_table[2])
        roll, pitch, yaw = [math.radians(float(value)) for value in candidate.pose_table[3:6]]
        qx, qy, qz, qw = self._quaternion_from_rpy(roll, pitch, yaw)
        pose.pose.orientation.x = qx
        pose.pose.orientation.y = qy
        pose.pose.orientation.z = qz
        pose.pose.orientation.w = qw
        return pose

    def _joint_degrees_for_arm(self, arm: str, joint_state) -> List[float]:
        by_name = {name: float(pos) for name, pos in zip(joint_state.name, joint_state.position)}
        ordered = [math.degrees(by_name[name]) for name in self._joint_names(arm) if name in by_name]
        if len(ordered) == 6:
            return ordered
        return [math.degrees(float(value)) for value in list(joint_state.position)[:6]]

    @staticmethod
    def _joint_names(arm: str) -> List[str]:
        prefix = "left" if arm == "left_arm" else "right"
        return [f"{prefix}_j{index}" for index in range(1, 7)]

    @staticmethod
    def _ik_link_name(arm: str) -> str:
        return "left_tcp" if arm == "left_arm" else "right_tcp"

    @staticmethod
    def _quaternion_from_rpy(roll: float, pitch: float, yaw: float) -> tuple[float, float, float, float]:
        cy = math.cos(yaw * 0.5)
        sy = math.sin(yaw * 0.5)
        cp = math.cos(pitch * 0.5)
        sp = math.sin(pitch * 0.5)
        cr = math.cos(roll * 0.5)
        sr = math.sin(roll * 0.5)
        return (
            sr * cp * cy - cr * sp * sy,
            cr * sp * cy + sr * cp * sy,
            cr * cp * sy - sr * sp * cy,
            cr * cp * cy + sr * sp * sy,
        )

    def _score(self, candidate: GeneratedPose) -> float:
        z = float(candidate.pose_table[2])
        upright_bonus = 1.0 if candidate.keep_orientation_upright else 0.0
        return float(candidate.score_hint) + z * 0.1 + upright_bonus


def main() -> None:
    print("[OK] quick_ik_planner ready")


if __name__ == "__main__":
    main()
