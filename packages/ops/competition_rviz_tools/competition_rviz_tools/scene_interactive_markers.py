from __future__ import annotations

import json
import re
from typing import Callable

import rclpy
from geometry_msgs.msg import Pose
from interactive_markers.interactive_marker_server import InteractiveMarkerServer
from interactive_markers.menu_handler import MenuHandler
from rclpy.node import Node
from std_msgs.msg import String
from visualization_msgs.msg import InteractiveMarker
from visualization_msgs.msg import InteractiveMarkerControl
from visualization_msgs.msg import Marker

from dualarm_interfaces.msg import SceneObjectArray

from competition_rviz_tools import COMMAND_CLEAR_SELECTION
from competition_rviz_tools import COMMAND_EXECUTE_BALL_CLOSE
from competition_rviz_tools import COMMAND_EXECUTE_PICK
from competition_rviz_tools import COMMAND_HOME_LEFT
from competition_rviz_tools import COMMAND_HOME_RIGHT
from competition_rviz_tools import COMMAND_MOVE_TO_CAP_WORKSPACE
from competition_rviz_tools import COMMAND_OPEN_CAP
from competition_rviz_tools import COMMAND_PICK_CUP
from competition_rviz_tools import COMMAND_PLAN_BALL_PAIR
from competition_rviz_tools import COMMAND_POUR
from competition_rviz_tools import COMMAND_PAUSE_COMPETITION
from competition_rviz_tools import COMMAND_REFRESH_SCENE
from competition_rviz_tools import COMMAND_RELEASE_BALL
from competition_rviz_tools import COMMAND_RUN_COMPETITION
from competition_rviz_tools import COMMAND_SCAN_BASKET
from competition_rviz_tools import COMMAND_SCAN_TABLE
from competition_rviz_tools import COMMAND_SELECT_GRASP_TARGET
from competition_rviz_tools import COMMAND_STOP_COMPETITION
from competition_rviz_tools import COMMAND_PREVIEW_PICK
from competition_rviz_tools import COMMAND_ALIGN_POUR
from competition_rviz_tools import COMMAND_ABORT
from competition_rviz_tools import COMMAND_YIELD_LEFT
from competition_rviz_tools import COMMAND_YIELD_RIGHT
from competition_rviz_tools import DEFAULT_COMMAND_TOPIC
from competition_rviz_tools import DEFAULT_SCENE_OBJECT_TOPIC


class SceneInteractiveMarkers(Node):
    """发布 RViz InteractiveMarker 控制面板和场景对象右键菜单。"""

    def __init__(self) -> None:
        super().__init__("scene_interactive_markers")
        self.declare_parameter("frame_id", "world")
        self.declare_parameter("command_topic", DEFAULT_COMMAND_TOPIC)
        self.declare_parameter("scene_topic", DEFAULT_SCENE_OBJECT_TOPIC)
        self.declare_parameter("server_namespace", "competition_rviz_scene")
        self.declare_parameter("panel_x", 0.0)
        self.declare_parameter("panel_y", -0.45)
        self.declare_parameter("panel_z", 0.55)

        self._frame_id = str(self.get_parameter("frame_id").value)
        self._command_topic = str(self.get_parameter("command_topic").value)
        self._scene_topic = str(self.get_parameter("scene_topic").value)
        self._server_namespace = str(self.get_parameter("server_namespace").value)
        self._panel_pose = self._build_pose(
            float(self.get_parameter("panel_x").value),
            float(self.get_parameter("panel_y").value),
            float(self.get_parameter("panel_z").value),
        )

        self._command_pub = self.create_publisher(String, self._command_topic, 10)
        self._server = InteractiveMarkerServer(self, self._server_namespace)
        self._panel_menu = self._build_panel_menu()
        self._object_menu = self._build_object_menu()
        self._marker_to_object_id: dict[str, str] = {}
        self.create_subscription(SceneObjectArray, self._scene_topic, self._handle_scene, 10)

        self._publish_panel()
        self.get_logger().info(
            f"RViz interactive markers 已启动: namespace={self._server_namespace}, scene_topic={self._scene_topic}"
        )

    def destroy_node(self) -> bool:
        self._server.shutdown()
        return super().destroy_node()

    def _build_panel_menu(self) -> MenuHandler:
        menu = MenuHandler()
        menu.insert("扫描桌面", callback=self._publish_fixed_command(COMMAND_SCAN_TABLE))
        menu.insert("扫描篮筐", callback=self._publish_fixed_command(COMMAND_SCAN_BASKET))
        menu.insert("左臂让行", callback=self._publish_fixed_command(COMMAND_YIELD_LEFT))
        menu.insert("右臂让行", callback=self._publish_fixed_command(COMMAND_YIELD_RIGHT))
        menu.insert("左臂回 home", callback=self._publish_fixed_command(COMMAND_HOME_LEFT))
        menu.insert("右臂回 home", callback=self._publish_fixed_command(COMMAND_HOME_RIGHT))
        menu.insert("运行整场比赛", callback=self._publish_fixed_command(COMMAND_RUN_COMPETITION))
        menu.insert("暂停比赛流程", callback=self._publish_fixed_command(COMMAND_PAUSE_COMPETITION))
        menu.insert("停止比赛流程", callback=self._publish_fixed_command(COMMAND_STOP_COMPETITION))
        menu.insert("中止当前任务", callback=self._publish_fixed_command(COMMAND_ABORT))
        menu.insert("刷新场景对象", callback=self._publish_fixed_command(COMMAND_REFRESH_SCENE))
        menu.insert("清空 RViz 选择", callback=self._publish_fixed_command(COMMAND_CLEAR_SELECTION))
        return menu

    def _build_object_menu(self) -> MenuHandler:
        menu = MenuHandler()
        menu.insert("设为抓取目标", callback=self._publish_object_command(COMMAND_SELECT_GRASP_TARGET))
        menu.insert("预抓取规划", callback=self._publish_object_command(COMMAND_PREVIEW_PICK))
        menu.insert("执行抓取", callback=self._publish_object_command(COMMAND_EXECUTE_PICK))
        menu.insert("移动到开盖工作位", callback=self._publish_object_command(COMMAND_MOVE_TO_CAP_WORKSPACE))
        menu.insert("执行开盖", callback=self._publish_object_command(COMMAND_OPEN_CAP))
        menu.insert("抓杯", callback=self._publish_object_command(COMMAND_PICK_CUP))
        menu.insert("对位倒水", callback=self._publish_object_command(COMMAND_ALIGN_POUR))
        menu.insert("执行倒水", callback=self._publish_object_command(COMMAND_POUR))
        menu.insert("规划双臂接球", callback=self._publish_object_command(COMMAND_PLAN_BALL_PAIR))
        menu.insert("执行双臂闭合", callback=self._publish_object_command(COMMAND_EXECUTE_BALL_CLOSE))
        menu.insert("执行放球", callback=self._publish_object_command(COMMAND_RELEASE_BALL))
        menu.insert("刷新场景对象", callback=self._publish_fixed_command(COMMAND_REFRESH_SCENE))
        menu.insert("清空 RViz 选择", callback=self._publish_fixed_command(COMMAND_CLEAR_SELECTION))
        return menu

    def _publish_panel(self) -> None:
        marker = InteractiveMarker()
        marker.header.frame_id = self._frame_id
        marker.name = "competition_operator_panel"
        marker.description = "Competition Operator"
        marker.scale = 0.28
        marker.pose = self._panel_pose
        marker.controls.append(self._make_visual_control("operator_panel", Marker.CUBE, (0.10, 0.10, 0.04), (0.05, 0.35, 0.85, 0.9)))
        marker.controls.append(self._make_label_control("operator_panel_label", "右键打开比赛控制菜单", z_offset=0.08))
        self._server.insert(marker)
        self._panel_menu.apply(self._server, marker.name)
        self._server.applyChanges()

    def _handle_scene(self, scene: SceneObjectArray) -> None:
        self._server.clear()
        self._marker_to_object_id = {}
        self._publish_panel()
        for scene_object in scene.objects:
            if not scene_object.id:
                continue
            marker = self._make_scene_object_marker(scene_object)
            self._server.insert(marker)
            self._object_menu.apply(self._server, marker.name)
        self._server.applyChanges()

    def _make_scene_object_marker(self, scene_object) -> InteractiveMarker:
        marker = InteractiveMarker()
        marker.header.frame_id = scene_object.pose.header.frame_id or self._frame_id
        marker.name = "scene_object_" + self._safe_name(scene_object.id)
        marker.description = f"{scene_object.id} [{scene_object.semantic_type}]"
        marker.scale = max(float(scene_object.size.x), float(scene_object.size.y), float(scene_object.size.z), 0.08)
        marker.pose = scene_object.pose.pose
        self._marker_to_object_id[marker.name] = scene_object.id
        color = self._semantic_color(scene_object.semantic_type)
        marker.controls.append(self._make_visual_control(scene_object.id, Marker.CUBE, (0.08, 0.08, 0.08), color))
        marker.controls.append(self._make_label_control(scene_object.id + "_label", scene_object.id, z_offset=0.10))
        return marker

    def _publish_fixed_command(self, command: str) -> Callable:
        def _callback(_feedback) -> None:
            self._command_pub.publish(String(data=command))
            self.get_logger().info(f"已发布 RViz 操作命令: {command}")

        return _callback

    def _publish_object_command(self, command: str) -> Callable:
        def _callback(feedback) -> None:
            object_id = self._marker_to_object_id.get(feedback.marker_name, feedback.marker_name.removeprefix("scene_object_"))
            payload = {"command": command, "object_id": object_id, "marker_name": feedback.marker_name}
            self._command_pub.publish(String(data=json.dumps(payload, ensure_ascii=False, sort_keys=True)))
            self.get_logger().info(f"已发布 RViz 对象命令: {payload}")

        return _callback

    @staticmethod
    def _build_pose(x: float, y: float, z: float) -> Pose:
        pose = Pose()
        pose.position.x = x
        pose.position.y = y
        pose.position.z = z
        pose.orientation.w = 1.0
        return pose

    @staticmethod
    def _make_visual_control(name: str, marker_type: int, scale: tuple[float, float, float], color: tuple[float, float, float, float]) -> InteractiveMarkerControl:
        marker = Marker()
        marker.ns = name
        marker.type = marker_type
        marker.scale.x = scale[0]
        marker.scale.y = scale[1]
        marker.scale.z = scale[2]
        marker.color.r = color[0]
        marker.color.g = color[1]
        marker.color.b = color[2]
        marker.color.a = color[3]

        control = InteractiveMarkerControl()
        control.always_visible = True
        control.interaction_mode = InteractiveMarkerControl.BUTTON
        control.markers.append(marker)
        return control

    @staticmethod
    def _make_label_control(name: str, text: str, z_offset: float) -> InteractiveMarkerControl:
        marker = Marker()
        marker.ns = name
        marker.type = Marker.TEXT_VIEW_FACING
        marker.text = text
        marker.pose.position.z = z_offset
        marker.scale.z = 0.045
        marker.color.r = 0.95
        marker.color.g = 0.95
        marker.color.b = 0.85
        marker.color.a = 1.0

        control = InteractiveMarkerControl()
        control.always_visible = True
        control.interaction_mode = InteractiveMarkerControl.NONE
        control.markers.append(marker)
        return control

    @staticmethod
    def _semantic_color(semantic_type: str) -> tuple[float, float, float, float]:
        semantic = semantic_type.lower()
        if "ball" in semantic:
            return (0.95, 0.18, 0.08, 0.85)
        if "basket" in semantic:
            return (0.05, 0.55, 0.95, 0.75)
        if "cap" in semantic or "bottle" in semantic:
            return (0.10, 0.80, 0.45, 0.80)
        return (0.85, 0.65, 0.18, 0.70)

    @staticmethod
    def _safe_name(raw: str) -> str:
        return re.sub(r"[^A-Za-z0-9_]+", "_", raw).strip("_") or "unnamed"


def main(args: list[str] | None = None) -> None:
    rclpy.init(args=args)
    node = SceneInteractiveMarkers()
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
