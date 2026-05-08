from launch import LaunchDescription
from launch.actions import EmitEvent, LogInfo
from launch.events import Shutdown


def generate_launch_description():
    return LaunchDescription(
        [
            LogInfo(
                msg=(
                    "quick_competition 已在 2026-05-08 归档到 "
                    "archive/quick_competition_2026-05-08；production runtime 只允许 "
                    "scene_fusion -> /planning/* -> /execution/* -> /competition/run。"
                )
            ),
            EmitEvent(event=Shutdown(reason="quick_competition archived and disabled")),
        ]
    )
