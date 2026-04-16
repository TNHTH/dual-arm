from __future__ import annotations

from typing import Dict, Optional, Tuple

from behavior_contract import BehaviorGripperCommand, BehaviorPlanExecutionCall, BehaviorPrimitiveCall
from dualarm_interfaces.msg import GraspTarget


HANDOVER_BEHAVIOR_STATES = {
    "GRASP_BALL_1",
    "GRASP_BALL_2",
    "HOLD_BALL_1_3S",
    "HOLD_BALL_2_3S",
    "RELEASE_BALL_1",
    "RELEASE_BALL_2",
}


def build_handover_behavior_call(
    state: str,
    assignments: Dict[str, str],
    grasp_targets: Dict[str, GraspTarget],
) -> Tuple[Optional[object], Optional[str]]:
    if state not in HANDOVER_BEHAVIOR_STATES:
        return None, None

    object_id = assignments.get("basketball" if state.endswith("1") else "soccer_ball", "")
    if not object_id:
        return None, f"{state} 缺少已分配球体 object_id"

    if state.startswith("GRASP_BALL_"):
        return (
            BehaviorPlanExecutionCall(
                behavior_group="handover",
                object_id=object_id,
                execute_last_plan=True,
                gripper_commands=[
                    BehaviorGripperCommand(
                        arm_name="left_arm",
                        object_id=object_id,
                        link_name="left_tcp",
                        attach=True,
                    ),
                    BehaviorGripperCommand(
                        arm_name="right_arm",
                        command=2,
                        position=200,
                    ),
                ],
            ),
            None,
        )

    if state.startswith("HOLD_BALL_"):
        return (
            BehaviorPrimitiveCall(
                behavior_group="handover",
                primitive_id="hold_verify",
                arm_group="left_arm",
                object_id=object_id,
                hold_duration_s=3.0,
            ),
            None,
        )

    if state.startswith("RELEASE_BALL_"):
        return (
            BehaviorPrimitiveCall(
                behavior_group="handover",
                primitive_id="release_guard",
                arm_group="left_arm",
                secondary_arm_group="right_arm",
                object_id=object_id,
                synchronized=True,
            ),
            None,
        )

    return None, f"未定义的 handover 行为状态: {state}"
