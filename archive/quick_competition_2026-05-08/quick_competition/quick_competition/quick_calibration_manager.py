from __future__ import annotations

import argparse
import math
import sys
import time
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple

from .quick_types import find_repo_root, load_yaml, quick_config_path, save_yaml

Vector = Tuple[float, float, float]


def _sub(a: Vector, b: Vector) -> Vector:
    return (a[0] - b[0], a[1] - b[1], a[2] - b[2])


def _add(a: Vector, b: Vector) -> Vector:
    return (a[0] + b[0], a[1] + b[1], a[2] + b[2])


def _scale(a: Vector, value: float) -> Vector:
    return (a[0] * value, a[1] * value, a[2] * value)


def _dot(a: Vector, b: Vector) -> float:
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]


def _cross(a: Vector, b: Vector) -> Vector:
    return (
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    )


def _norm(a: Vector) -> float:
    return math.sqrt(_dot(a, a))


def _normalize(a: Vector) -> Vector:
    n = _norm(a)
    if n < 1e-9:
        raise ValueError("触碰点几何退化，无法归一化")
    return (a[0] / n, a[1] / n, a[2] / n)


def _rpy_from_axes(x_axis: Vector, y_axis: Vector, z_axis: Vector) -> List[float]:
    # rotation matrix columns are x/y/z axes in parent frame.
    r00, r01, r02 = x_axis[0], y_axis[0], z_axis[0]
    r10, r11, r12 = x_axis[1], y_axis[1], z_axis[1]
    r20, r21, r22 = x_axis[2], y_axis[2], z_axis[2]
    roll = math.atan2(r21, r22)
    pitch = math.atan2(-r20, math.sqrt(r21 * r21 + r22 * r22))
    yaw = math.atan2(r10, r00)
    return [roll, pitch, yaw]


def classify_rmse(rmse_m: float, pass_m: float = 0.002, warn_m: float = 0.005) -> str:
    if rmse_m < pass_m:
        return "PASS"
    if rmse_m <= warn_m:
        return "WARN"
    return "CRITICAL"


def solve_table_frame(points: Dict[str, Iterable[float]], table_length_m: float, table_width_m: float) -> Dict[str, object]:
    required = ["front_left", "front_right", "back_left"]
    missing = [name for name in required if not points.get(name)]
    if missing:
        raise ValueError(f"缺少触碰点: {', '.join(missing)}")
    p1 = tuple(float(x) for x in list(points["front_left"])[:3])  # type: ignore[index]
    p2 = tuple(float(x) for x in list(points["front_right"])[:3])  # type: ignore[index]
    p3 = tuple(float(x) for x in list(points["back_left"])[:3])  # type: ignore[index]
    x_axis = _normalize(_sub(p2, p1))
    y_temp = _normalize(_sub(p3, p1))
    if _norm(_sub(p2, p1)) < 0.20 or _norm(_sub(p3, p1)) < 0.20:
        raise ValueError("触碰点跨度过小，请尽量靠桌角采点")
    z_axis = _normalize(_cross(x_axis, y_temp))
    y_axis = _normalize(_cross(z_axis, x_axis))
    if _norm(_cross(x_axis, y_temp)) < 0.05:
        raise ValueError("触碰点近共线，无法稳定求桌面法向")
    origin = _add(p1, _add(_scale(x_axis, table_length_m / 2.0), _scale(y_axis, table_width_m / 2.0)))
    all_points: List[Vector] = [p1, p2, p3]
    if points.get("back_right"):
        all_points.append(tuple(float(x) for x in list(points["back_right"])[:3]))  # type: ignore[index]
    distances = [_dot(_sub(point, p1), z_axis) for point in all_points]
    rmse = math.sqrt(sum(item * item for item in distances) / len(distances))
    return {
        "xyz": [origin[0], origin[1], origin[2]],
        "rpy": _rpy_from_axes(x_axis, y_axis, z_axis),
        "rmse_m": rmse,
        "quality": classify_rmse(rmse),
        "x_axis": list(x_axis),
        "y_axis": list(y_axis),
        "z_axis": list(z_axis),
    }


def solve_and_update(repo_root: Path) -> int:
    path = quick_config_path(repo_root, "quick_calibration.yaml")
    config = load_yaml(path)
    table = config.get("table", {})
    points_by_arm = ((table.get("touch_points") or {}))
    for arm_key, transform_key in [("left_arm", "left_base_to_table"), ("right_arm", "right_base_to_table")]:
        points = points_by_arm.get(arm_key) or {}
        try:
            solved = solve_table_frame(points, float(table.get("length_m", 1.2)), float(table.get("width_m", 0.8)))
        except ValueError as exc:
            print(f"[WARN] {arm_key} calibration skipped: {exc}")
            continue
        target = config.setdefault("transforms", {}).setdefault(transform_key, {})
        target.update(
            {
                "xyz": solved["xyz"],
                "rpy": solved["rpy"],
                "calibrated": solved["quality"] != "CRITICAL",
                "rmse_m": solved["rmse_m"],
                "quality": solved["quality"],
            }
        )
        print(f"[OK] {arm_key} table solve quality={solved['quality']} rmse={solved['rmse_m']:.4f}m")
        if solved["quality"] == "CRITICAL":
            print("[CRITICAL] RMSE > 0.005m，请重新触碰或检查 TCP 定义。")
            save_yaml(path, config)
            return 2
    save_yaml(path, config)
    return 0


def record_touch_point(repo_root: Path, arm: str, point_name: str, tcp_pose: Optional[List[float]]) -> None:
    if tcp_pose is None:
        raise RuntimeError("--record 需要 --tcp-pose x,y,z,rx,ry,rz，硬件自动读取由 waypoint_recorder 负责")
    path = quick_config_path(repo_root, "quick_calibration.yaml")
    config = load_yaml(path)
    arm_points = config.setdefault("table", {}).setdefault("touch_points", {}).setdefault(arm, {})
    arm_points[point_name] = [float(item) for item in tcp_pose[:3]]
    save_yaml(path, config)
    print(f"[OK] recorded {arm}.{point_name}: {arm_points[point_name]}")


def _parse_pose(text: Optional[str]) -> Optional[List[float]]:
    if not text:
        return None
    return [float(item.strip()) for item in text.split(",") if item.strip()]


def spin_tf_publisher() -> None:
    try:
        import rclpy
        from rclpy.node import Node
    except Exception as exc:  # pragma: no cover - ROS 环境外只做提示。
        print(f"[WARN] rclpy unavailable: {exc}")
        return

    class CalibrationSpinNode(Node):
        def __init__(self) -> None:
            super().__init__("quick_calibration_manager")
            self.get_logger().info(
                "quick_calibration_manager 已启动。冷启动顺序：launch 基础节点 -> --solve 发布 table_frame -> orchestrator。"
            )

    rclpy.init()
    node = CalibrationSpinNode()
    try:
        rclpy.spin(node)
    finally:
        node.destroy_node()
        rclpy.shutdown()


def main() -> None:
    parser = argparse.ArgumentParser(description="quick table touch calibration manager")
    parser.add_argument("--record", nargs=2, metavar=("ARM", "POINT"))
    parser.add_argument("--tcp-pose", default="")
    parser.add_argument("--solve", action="store_true")
    parser.add_argument("--publish-tf", action="store_true")
    parser.add_argument("--spin", action="store_true")
    args, _ = parser.parse_known_args()
    repo_root = find_repo_root()
    if args.record:
        record_touch_point(repo_root, args.record[0], args.record[1], _parse_pose(args.tcp_pose))
    if args.solve:
        raise SystemExit(solve_and_update(repo_root))
    if args.publish_tf or args.spin:
        spin_tf_publisher()
    if not (args.record or args.solve or args.publish_tf or args.spin):
        parser.print_help()


if __name__ == "__main__":
    main()
