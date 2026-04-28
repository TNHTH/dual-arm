#!/usr/bin/python3

from __future__ import annotations

import argparse
import json
import math
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import yaml


def matrix_to_rpy(matrix: np.ndarray) -> tuple[float, float, float]:
    sy = math.sqrt(matrix[0, 0] * matrix[0, 0] + matrix[1, 0] * matrix[1, 0])
    singular = sy < 1e-6
    if not singular:
        roll = math.atan2(matrix[2, 1], matrix[2, 2])
        pitch = math.atan2(-matrix[2, 0], sy)
        yaw = math.atan2(matrix[1, 0], matrix[0, 0])
    else:
        roll = math.atan2(-matrix[1, 2], matrix[1, 1])
        pitch = math.atan2(-matrix[2, 0], sy)
        yaw = 0.0
    return roll, pitch, yaw


def main() -> int:
    parser = argparse.ArgumentParser(description="将手眼标定结果晋级到 tf_node verified 配置")
    parser.add_argument("--tf-config", required=True)
    parser.add_argument("--calibration-result", required=True)
    parser.add_argument("--parent", default="left_tcp")
    parser.add_argument("--child", default="left_camera")
    parser.add_argument("--table-validation-json", default="")
    parser.add_argument("--verified-at", default="")
    parser.add_argument("--max-translation-error-m", type=float, required=True)
    parser.add_argument("--max-rotation-error-rad", type=float, required=True)
    parser.add_argument("--report-out", default="")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    tf_config_path = Path(args.tf_config).expanduser().resolve()
    result_path = Path(args.calibration_result).expanduser().resolve()
    config = yaml.safe_load(tf_config_path.read_text(encoding="utf-8")) or {}
    result = json.loads(result_path.read_text(encoding="utf-8"))

    camera_to_gripper = np.array(result["camera_to_gripper"]["transformation_matrix"], dtype=float)
    gripper_to_camera = np.linalg.inv(camera_to_gripper)
    rotation = gripper_to_camera[:3, :3]
    translation = gripper_to_camera[:3, 3]
    roll, pitch, yaw = matrix_to_rpy(rotation)

    verified_at = args.verified_at or datetime.now(timezone.utc).isoformat()
    report = {
        "parent": args.parent,
        "child": args.child,
        "calibration_result": str(result_path),
        "camera_to_gripper": camera_to_gripper.tolist(),
        "gripper_to_camera": gripper_to_camera.tolist(),
        "verified_at": verified_at,
        "max_translation_error_m": float(args.max_translation_error_m),
        "max_rotation_error_rad": float(args.max_rotation_error_rad),
        "table_validation_json": args.table_validation_json,
    }
    if args.table_validation_json:
        validation_path = Path(args.table_validation_json).expanduser().resolve()
        if validation_path.is_file():
            report["table_validation"] = json.loads(validation_path.read_text(encoding="utf-8"))

    updated = False
    for item in config.get("transforms", []):
        if item.get("parent") == args.parent and item.get("child") == args.child:
            item["translation"] = [float(value) for value in translation.tolist()]
            item["rotation_rpy"] = [float(roll), float(pitch), float(yaw)]
            item["requires_calibration"] = True
            item["calibration_status"] = "verified"
            item["calibration_source"] = str(result_path)
            item["verified_at"] = verified_at
            item["max_translation_error_m"] = float(args.max_translation_error_m)
            item["max_rotation_error_rad"] = float(args.max_rotation_error_rad)
            updated = True
            report["updated_item"] = item
            break

    if not updated:
        raise SystemExit(f"target transform {args.parent}->{args.child} not found in {tf_config_path}")

    report_out = Path(args.report_out).expanduser().resolve() if args.report_out else result_path.with_name(
        f"promotion_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    )

    if args.dry_run:
        print(json.dumps(report, ensure_ascii=False, indent=2))
        print(yaml.safe_dump(config, sort_keys=False, allow_unicode=True))
        return 0

    tf_config_path.write_text(yaml.safe_dump(config, sort_keys=False, allow_unicode=True), encoding="utf-8")
    report_out.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"updated {tf_config_path}")
    print(f"wrote {report_out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
