from __future__ import annotations

import math
from copy import deepcopy
from typing import Dict, Optional, Tuple

from geometry_msgs.msg import PoseStamped, Quaternion

from behavior_contract import BehaviorPrimitiveCall
from dualarm_interfaces.msg import GraspTarget


CAP_POUR_BEHAVIOR_STATES = {
    "GRASP_WATER_CAP",
    "GRASP_COLA_CAP",
    "OPEN_WATER_CAP",
    "OPEN_COLA_CAP",
    "PLACE_WATER_CAP",
    "PLACE_COLA_CAP",
    "EXECUTE_WATER_POUR",
    "EXECUTE_COLA_POUR",
}


def build_cap_pour_behavior_call(
    state: str,
    assignments: Dict[str, str],
    grasp_targets: Dict[str, GraspTarget],
) -> Tuple[Optional[BehaviorPrimitiveCall], Optional[str]]:
    if state not in CAP_POUR_BEHAVIOR_STATES:
        return None, None

    bottle_key = "water_bottle" if "WATER" in state else "cola_bottle"
    bottle_id = assignments.get(bottle_key, "")
    bottle_target = grasp_targets.get(bottle_id) if bottle_id else None
    if bottle_target is None:
        return None, f"{state} 缺少 {bottle_key} grasp target"

    if state.startswith("GRASP_") and state.endswith("_CAP"):
        return (
            BehaviorPrimitiveCall(
                behavior_group="cap_pour",
                primitive_id="cap_align_and_grasp",
                arm_group=bottle_target.partner_arm_mode,
                object_id=bottle_id,
                primary_waypoints=[bottle_target.operate],
                execution_profile=bottle_target.execution_profile,
            ),
            None,
        )

    if state.startswith("OPEN_") and state.endswith("_CAP"):
        cap_waypoints = _build_cap_twist_waypoints(bottle_target)
        hold_waypoints = [deepcopy(bottle_target.grasp) for _ in cap_waypoints]
        return (
            BehaviorPrimitiveCall(
                behavior_group="cap_pour",
                primitive_id="cap_twist_and_unthread",
                arm_group=bottle_target.arm_mode,
                secondary_arm_group=bottle_target.partner_arm_mode,
                object_id=bottle_id,
                primary_waypoints=hold_waypoints,
                secondary_waypoints=cap_waypoints,
                execution_profile=bottle_target.execution_profile,
                synchronized=True,
            ),
            None,
        )

    if state.startswith("PLACE_") and state.endswith("_CAP"):
        return (
            BehaviorPrimitiveCall(
                behavior_group="cap_pour",
                primitive_id="cap_place_or_release",
                arm_group=bottle_target.partner_arm_mode,
                secondary_arm_group=bottle_target.arm_mode,
                object_id=bottle_id,
                primary_waypoints=[bottle_target.place],
                execution_profile=bottle_target.execution_profile,
            ),
            None,
        )

    if state.startswith("EXECUTE_") and state.endswith("_POUR"):
        cup_key = "cup_water" if "WATER" in state else "cup_cola"
        cup_id = assignments.get(cup_key, "")
        cup_target = grasp_targets.get(cup_id) if cup_id else None
        if cup_target is None:
            return None, f"{state} 缺少 {cup_key} grasp target"
        bottle_waypoints = _build_pour_waypoints(bottle_target)
        cup_hold_waypoints = [deepcopy(cup_target.grasp) for _ in bottle_waypoints]
        return (
            BehaviorPrimitiveCall(
                behavior_group="cap_pour",
                primitive_id="pour_tilt",
                arm_group=bottle_target.arm_mode,
                secondary_arm_group=cup_target.arm_mode,
                object_id=bottle_id,
                reference_object_id=cup_id,
                primary_waypoints=bottle_waypoints,
                secondary_waypoints=cup_hold_waypoints,
                execution_profile=bottle_target.execution_profile,
                synchronized=True,
            ),
            None,
        )

    return None, f"未定义的 cap/pour 行为状态: {state}"


def _build_cap_twist_waypoints(target: GraspTarget):
    base = deepcopy(target.operate)
    waypoints = [deepcopy(target.pregrasp), deepcopy(base)]
    for index, angle_deg in enumerate((15.0, 30.0, 45.0), start=1):
        pose = deepcopy(base)
        pose.pose.orientation = _quaternion_from_rpy(0.0, 0.0, math.radians(angle_deg))
        pose.pose.position.z += 0.003 * index
        waypoints.append(pose)
    waypoints.append(deepcopy(target.retreat))
    return waypoints


def _build_pour_waypoints(target: GraspTarget):
    base = deepcopy(target.operate)
    waypoints = [deepcopy(target.pregrasp), deepcopy(base)]
    for index, pitch_deg in enumerate((15.0, 30.0, 45.0, 55.0), start=1):
        pose = deepcopy(base)
        pose.pose.orientation = _quaternion_from_rpy(0.0, math.radians(pitch_deg), 0.0)
        pose.pose.position.z -= 0.002 * index
        pose.pose.position.x += 0.004 * index
        waypoints.append(pose)
    waypoints.append(deepcopy(base))
    waypoints.append(deepcopy(target.retreat))
    return waypoints


def _quaternion_from_rpy(roll: float, pitch: float, yaw: float) -> Quaternion:
    cy = math.cos(yaw * 0.5)
    sy = math.sin(yaw * 0.5)
    cp = math.cos(pitch * 0.5)
    sp = math.sin(pitch * 0.5)
    cr = math.cos(roll * 0.5)
    sr = math.sin(roll * 0.5)
    q = Quaternion()
    q.x = sr * cp * cy - cr * sp * sy
    q.y = cr * sp * cy + sr * cp * sy
    q.z = cr * cp * sy - sr * sp * cy
    q.w = cr * cp * cy + sr * sp * sy
    return q
