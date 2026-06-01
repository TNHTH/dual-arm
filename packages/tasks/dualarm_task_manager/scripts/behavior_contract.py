from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List

from geometry_msgs.msg import PoseStamped


@dataclass
class BehaviorPrimitiveCall:
    behavior_group: str
    primitive_id: str
    arm_group: str
    object_id: str = ""
    reference_object_id: str = ""
    secondary_arm_group: str = ""
    primary_waypoints: List[PoseStamped] = field(default_factory=list)
    secondary_waypoints: List[PoseStamped] = field(default_factory=list)
    execution_profile: str = "default"
    hold_duration_s: float = 0.0
    synchronized: bool = False


@dataclass
class BehaviorGripperCommand:
    arm_name: str
    command: int = 2
    position: int = 255
    object_id: str = ""
    link_name: str = ""
    attach: bool = False
    detach: bool = False


@dataclass
class BehaviorPlanExecutionCall:
    behavior_group: str
    object_id: str
    execute_last_plan: bool = True
    gripper_commands: List[BehaviorGripperCommand] = field(default_factory=list)


def summarize_behavior_call(state: str, call) -> Dict[str, object]:
    if isinstance(call, BehaviorPlanExecutionCall):
        return {
            "state": state,
            "behavior_group": call.behavior_group,
            "dispatch_mode": "plan_execution",
            "object_id": call.object_id,
            "execute_last_plan": call.execute_last_plan,
            "gripper_command_count": len(call.gripper_commands),
        }

    return {
        "state": state,
        "behavior_group": call.behavior_group,
        "dispatch_mode": "primitive",
        "primitive_id": call.primitive_id,
        "object_id": call.object_id,
        "reference_object_id": call.reference_object_id,
        "arm_group": call.arm_group,
        "secondary_arm_group": call.secondary_arm_group,
        "primary_waypoint_count": len(call.primary_waypoints),
        "secondary_waypoint_count": len(call.secondary_waypoints),
        "execution_profile": call.execution_profile,
        "hold_duration_s": call.hold_duration_s,
        "synchronized": call.synchronized,
    }
