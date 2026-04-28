#!/usr/bin/python3

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Tuple


PRIMITIVE_CONTRACT_VERSION = "execution_primitive.v1"

RESULT_SUCCESS = "success"
RESULT_INVALID_REQUEST = "invalid_request"
RESULT_UNKNOWN_PRIMITIVE = "unknown_primitive"
RESULT_DRIVER_FAILURE = "driver_failure"
RESULT_TIMEOUT = "timeout"
RESULT_SYNC_VIOLATION = "sync_violation"
RESULT_CONTACT_FAILED = "contact_failed"
RESULT_DETACH_FAILED = "detach_failed"
RESULT_HOLD_FAILED = "hold_failed"
RESULT_UNVERIFIED_EVIDENCE = "unverified_evidence"
RESULT_CANCELLED = "cancelled"

SUPPORTED_RESULT_CODES: Tuple[str, ...] = (
    RESULT_SUCCESS,
    RESULT_INVALID_REQUEST,
    RESULT_UNKNOWN_PRIMITIVE,
    RESULT_DRIVER_FAILURE,
    RESULT_TIMEOUT,
    RESULT_SYNC_VIOLATION,
    RESULT_CONTACT_FAILED,
    RESULT_DETACH_FAILED,
    RESULT_HOLD_FAILED,
    RESULT_UNVERIFIED_EVIDENCE,
    RESULT_CANCELLED,
)

ARM_GROUPS: Tuple[str, ...] = ("left_arm", "right_arm", "dual_arm")
SINGLE_ARM_GROUPS: Tuple[str, ...] = ("left_arm", "right_arm")


@dataclass(frozen=True)
class PrimitiveContract:
    primitive_id: str
    family: str
    requires_object_id: bool = False
    requires_reference_object_id: bool = False
    requires_primary_waypoints: bool = False
    requires_secondary_waypoints: bool = False
    supports_synchronized: bool = False
    contact_required_for_success: bool = False
    detach_required_for_success: bool = False
    spill_detection_supported: bool = False


PRIMITIVE_CONTRACTS: Dict[str, PrimitiveContract] = {
    "cap_align_and_grasp": PrimitiveContract(
        primitive_id="cap_align_and_grasp",
        family="cap",
        requires_object_id=True,
        requires_primary_waypoints=True,
        contact_required_for_success=True,
    ),
    "cap_twist_and_unthread": PrimitiveContract(
        primitive_id="cap_twist_and_unthread",
        family="cap",
        requires_object_id=True,
        requires_primary_waypoints=True,
        requires_secondary_waypoints=True,
        supports_synchronized=True,
        contact_required_for_success=True,
    ),
    "cap_place_or_release": PrimitiveContract(
        primitive_id="cap_place_or_release",
        family="cap",
        requires_object_id=True,
        requires_primary_waypoints=True,
        detach_required_for_success=True,
    ),
    "pour_tilt": PrimitiveContract(
        primitive_id="pour_tilt",
        family="pour",
        requires_object_id=True,
        requires_reference_object_id=True,
        requires_primary_waypoints=True,
        requires_secondary_waypoints=True,
        supports_synchronized=True,
    ),
    "guarded_grasp": PrimitiveContract(
        primitive_id="guarded_grasp",
        family="grasp",
        requires_object_id=True,
        requires_primary_waypoints=True,
        contact_required_for_success=True,
    ),
    "hold_verify": PrimitiveContract(
        primitive_id="hold_verify",
        family="verify",
        requires_object_id=True,
        contact_required_for_success=True,
    ),
    "release_guard": PrimitiveContract(
        primitive_id="release_guard",
        family="release",
        requires_object_id=True,
        supports_synchronized=True,
        detach_required_for_success=True,
    ),
}


def supported_primitive_ids() -> Tuple[str, ...]:
    return tuple(PRIMITIVE_CONTRACTS.keys())


def resolve_primitive_contract(primitive_id: str) -> PrimitiveContract | None:
    return PRIMITIVE_CONTRACTS.get(primitive_id)


def primary_arm_group(arm_group: str) -> str:
    if arm_group == "dual_arm":
        return "left_arm"
    return arm_group


def secondary_arm_group(arm_group: str, requested_secondary: str) -> str:
    if requested_secondary:
        return requested_secondary
    if arm_group == "dual_arm":
        return "right_arm"
    return ""


def validate_primitive_goal(goal) -> tuple[bool, str, str, PrimitiveContract | None]:
    contract = resolve_primitive_contract(goal.primitive_id)
    if contract is None:
        return False, RESULT_UNKNOWN_PRIMITIVE, f"未知 primitive_id: {goal.primitive_id}", None

    if goal.arm_group not in ARM_GROUPS:
        return False, RESULT_INVALID_REQUEST, f"非法 arm_group: {goal.arm_group}", contract

    primary_arm = primary_arm_group(goal.arm_group)
    secondary_arm = secondary_arm_group(goal.arm_group, goal.secondary_arm_group)
    if primary_arm not in SINGLE_ARM_GROUPS:
        return False, RESULT_INVALID_REQUEST, f"非法主臂: {primary_arm}", contract
    if secondary_arm and secondary_arm not in SINGLE_ARM_GROUPS:
        return False, RESULT_INVALID_REQUEST, f"非法副臂: {secondary_arm}", contract
    if secondary_arm and secondary_arm == primary_arm:
        return False, RESULT_INVALID_REQUEST, "主臂与副臂不能相同", contract

    if goal.synchronized and not contract.supports_synchronized:
        return False, RESULT_INVALID_REQUEST, f"{goal.primitive_id} 不支持 synchronized", contract
    if goal.synchronized and not secondary_arm:
        return False, RESULT_INVALID_REQUEST, "synchronized primitive 缺少 secondary_arm_group", contract
    if contract.requires_secondary_waypoints and not (goal.synchronized or goal.arm_group == "dual_arm"):
        return False, RESULT_INVALID_REQUEST, f"{goal.primitive_id} 必须以 synchronized 或 dual_arm 执行", contract

    if contract.requires_object_id and not goal.object_id:
        return False, RESULT_INVALID_REQUEST, f"{goal.primitive_id} 缺少 object_id", contract
    if contract.requires_reference_object_id and not goal.reference_object_id:
        return False, RESULT_INVALID_REQUEST, f"{goal.primitive_id} 缺少 reference_object_id", contract
    if contract.requires_primary_waypoints and not goal.primary_cartesian_waypoints:
        return False, RESULT_INVALID_REQUEST, f"{goal.primitive_id} 缺少 primary_cartesian_waypoints", contract
    if goal.primitive_id == "guarded_grasp" and len(goal.primary_cartesian_waypoints) < 2:
        return False, RESULT_INVALID_REQUEST, "guarded_grasp 至少需要 pregrasp 和 grasp waypoint", contract
    if contract.requires_secondary_waypoints and not goal.secondary_cartesian_waypoints:
        return False, RESULT_INVALID_REQUEST, f"{goal.primitive_id} 缺少 secondary_cartesian_waypoints", contract
    if goal.primary_cartesian_waypoints and goal.secondary_cartesian_waypoints:
        if len(goal.primary_cartesian_waypoints) != len(goal.secondary_cartesian_waypoints):
            return False, RESULT_INVALID_REQUEST, "双臂 primitive waypoint 数量不一致", contract

    return True, RESULT_SUCCESS, "primitive request valid", contract
