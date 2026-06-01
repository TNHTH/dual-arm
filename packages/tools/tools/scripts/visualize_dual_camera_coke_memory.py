#!/usr/bin/python3

from __future__ import annotations

import argparse
import json
import math
import webbrowser
from pathlib import Path
from typing import Any

import numpy as np


ROOT = Path(__file__).resolve().parents[4]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="生成双相机可乐点云记忆的本地 HTML 可视化")
    parser.add_argument("--memory-json", required=True)
    parser.add_argument("--output-html", default="")
    parser.add_argument("--max-points-per-cloud", type=int, default=12000)
    parser.add_argument("--open", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    memory_json = Path(args.memory_json)
    if not memory_json.is_file():
        raise FileNotFoundError(memory_json)
    memory = json.loads(memory_json.read_text(encoding="utf-8"))
    points_path = resolve_artifact_path(memory.get("artifacts", {}).get("points_npz", ""), memory_json)
    if not points_path.is_file():
        raise FileNotFoundError(points_path)

    data = np.load(points_path)
    left_points = sample_points(data["left_points_camera_m"], int(args.max_points_per_cloud))
    right_points = sample_points(data["right_points_in_left_camera_m"], int(args.max_points_per_cloud))

    output_html = Path(args.output_html) if args.output_html else memory_json.with_name("dual_camera_coke_memory_view.html")
    payload = build_payload(memory, left_points, right_points)
    output_html.write_text(render_html(payload), encoding="utf-8")
    print(output_html)
    if args.open:
        webbrowser.open(output_html.resolve().as_uri(), new=1)
    return 0


def resolve_artifact_path(raw: str, memory_json: Path) -> Path:
    path = Path(raw)
    if path.is_absolute():
        return path
    cwd_path = Path.cwd() / path
    if cwd_path.is_file():
        return cwd_path
    memory_relative = memory_json.parent / path
    if memory_relative.is_file():
        return memory_relative
    return ROOT / path


def sample_points(points: np.ndarray, max_count: int) -> np.ndarray:
    points = np.asarray(points, dtype=np.float32)
    if points.ndim != 2 or points.shape[1] != 3:
        return np.empty((0, 3), dtype=np.float32)
    finite = np.isfinite(points).all(axis=1)
    points = points[finite]
    if max_count > 0 and points.shape[0] > max_count:
        indices = np.linspace(0, points.shape[0] - 1, max_count, dtype=np.int64)
        points = points[indices]
    return points


def build_payload(memory: dict[str, Any], left_points: np.ndarray, right_points: np.ndarray) -> dict[str, Any]:
    fusion = memory.get("fusion", {})
    bbox = fusion.get("fused_bbox_left_camera_m", {})
    center = bbox.get("center_xyz") or fusion.get("fused_target_center_left_camera_m") or [0.0, 0.0, 0.4]
    size = bbox.get("size_xyz") or [0.2, 0.2, 0.2]
    radius = max(float(max(size)), 0.1)
    return {
        "title": "Dual camera Coke memory point cloud",
        "created_at": memory.get("created_at"),
        "status": memory.get("status"),
        "left": side_summary(memory.get("left", {})),
        "right": side_summary(memory.get("right", {})),
        "fusion": {
            "status": fusion.get("status"),
            "frame": fusion.get("frame"),
            "fused_point_count": fusion.get("fused_point_count"),
            "fused_bbox_left_camera_m": bbox,
            "fused_target_center_left_camera_m": fusion.get("fused_target_center_left_camera_m"),
            "right_target_center_in_left_camera_m": fusion.get("right_target_center_in_left_camera_m"),
            "transform_status": fusion.get("transform_right_camera_to_left_camera", {}).get("status"),
            "memory_semantics": fusion.get("memory_semantics"),
        },
        "motion_gate": memory.get("right_arm_motion_gate", {}),
        "camera": {
            "center": center,
            "radius": radius,
        },
        "points": {
            "left": points_to_list(left_points),
            "right": points_to_list(right_points),
        },
    }


def side_summary(side: dict[str, Any]) -> dict[str, Any]:
    detection = side.get("target_detection", {})
    depth = side.get("depth_roi", {}).get("depth_m_stats", {})
    bbox = side.get("pointcloud_bbox_camera_m", {})
    safety = side.get("safety_gate", {})
    return {
        "score": detection.get("score"),
        "class_name": detection.get("class_name"),
        "depth_median_m": depth.get("median"),
        "target_center_camera_m": side.get("target_center_camera_m"),
        "point_count": bbox.get("point_count"),
        "bbox_size_m": bbox.get("size_xyz"),
        "safety_passes": safety.get("passes"),
        "safety_reasons": safety.get("reasons", []),
    }


def points_to_list(points: np.ndarray) -> list[list[float]]:
    rounded = np.round(points.astype(np.float64), 5)
    return rounded.tolist()


def render_html(payload: dict[str, Any]) -> str:
    payload_json = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    return f"""<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Dual Camera Coke Memory Point Cloud</title>
  <style>
    html, body {{
      margin: 0;
      height: 100%;
      overflow: hidden;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #0e1014;
      color: #e7e9ee;
    }}
    #scene {{
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      display: block;
      cursor: grab;
    }}
    #scene:active {{ cursor: grabbing; }}
    #panel {{
      position: fixed;
      left: 16px;
      top: 16px;
      width: min(390px, calc(100vw - 32px));
      max-height: calc(100vh - 32px);
      overflow: auto;
      background: rgba(16, 19, 25, 0.88);
      border: 1px solid rgba(255,255,255,0.14);
      border-radius: 8px;
      box-shadow: 0 18px 46px rgba(0,0,0,0.35);
      padding: 14px 14px 12px;
      backdrop-filter: blur(10px);
    }}
    h1 {{
      margin: 0 0 10px;
      font-size: 16px;
      font-weight: 650;
      letter-spacing: 0;
    }}
    .row {{
      display: grid;
      grid-template-columns: 122px 1fr;
      gap: 10px;
      align-items: start;
      font-size: 13px;
      line-height: 1.38;
      margin: 6px 0;
    }}
    .key {{ color: #aab2c0; }}
    .value {{ color: #f3f5f8; overflow-wrap: anywhere; }}
    .legend {{
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin: 10px 0 12px;
      font-size: 13px;
    }}
    .chip {{ display: inline-flex; align-items: center; gap: 6px; }}
    .swatch {{
      width: 10px;
      height: 10px;
      border-radius: 50%;
      display: inline-block;
    }}
    .left {{ background: #4c94ff; }}
    .right {{ background: #ff7b45; }}
    .bbox {{ background: #d8e55c; }}
    .gate {{
      margin-top: 10px;
      padding: 9px 10px;
      border: 1px solid rgba(255, 157, 92, 0.55);
      border-radius: 8px;
      color: #ffd5bd;
      background: rgba(95, 42, 16, 0.34);
      font-size: 13px;
      line-height: 1.42;
    }}
    .hint {{
      margin-top: 10px;
      color: #aab2c0;
      font-size: 12px;
      line-height: 1.42;
    }}
    button {{
      appearance: none;
      border: 1px solid rgba(255,255,255,0.18);
      border-radius: 6px;
      background: #1b222d;
      color: #e7e9ee;
      padding: 6px 9px;
      font-size: 13px;
      cursor: pointer;
    }}
    button:hover {{ background: #253040; }}
    #buttons {{ display: flex; gap: 8px; margin-top: 10px; }}
  </style>
</head>
<body>
  <canvas id="scene"></canvas>
  <section id="panel">
    <h1>双相机可乐点云记忆</h1>
    <div class="legend">
      <span class="chip"><span class="swatch left"></span>左相机点云</span>
      <span class="chip"><span class="swatch right"></span>右相机点云已变换到左相机坐标</span>
      <span class="chip"><span class="swatch bbox"></span>融合候选包围盒</span>
    </div>
    <div id="summary"></div>
    <div id="buttons">
      <button id="reset">重置视角</button>
      <button id="top">顶视图</button>
      <button id="front">正视图</button>
    </div>
    <div class="hint">鼠标左键拖动旋转，滚轮缩放。单位为米，坐标系为 left_camera_candidate。当前记忆是候选模型，不是运动授权。</div>
  </section>
  <script>
    const payload = {payload_json};
    const canvas = document.getElementById('scene');
    const ctx = canvas.getContext('2d', {{ alpha: false }});
    const summary = document.getElementById('summary');
    const state = {{
      yaw: -0.82,
      pitch: -0.42,
      zoom: 980,
      panX: 0,
      panY: 0,
      dragging: false,
      lastX: 0,
      lastY: 0
    }};

    function fmt(value, digits = 4) {{
      if (value === null || value === undefined || Number.isNaN(Number(value))) return 'n/a';
      return Number(value).toFixed(digits);
    }}

    function fmtVec(value) {{
      if (!Array.isArray(value)) return 'n/a';
      return '[' + value.map(v => fmt(v, 4)).join(', ') + ']';
    }}

    function addRow(key, value) {{
      const row = document.createElement('div');
      row.className = 'row';
      row.innerHTML = `<div class="key">${{key}}</div><div class="value">${{value}}</div>`;
      summary.appendChild(row);
    }}

    function fillSummary() {{
      const left = payload.left || {{}};
      const right = payload.right || {{}};
      const fusion = payload.fusion || {{}};
      const gate = payload.motion_gate || {{}};
      addRow('状态', payload.status || 'unknown');
      addRow('融合帧', fusion.frame || 'unknown');
      addRow('融合点数', String(fusion.fused_point_count || 0));
      addRow('左检测', `${{left.class_name || 'n/a'}} ${{fmt(left.score, 3)}}，深度 ${{fmt(left.depth_median_m, 3)}} m`);
      addRow('右检测', `${{right.class_name || 'n/a'}} ${{fmt(right.score, 3)}}，深度 ${{fmt(right.depth_median_m, 3)}} m`);
      addRow('融合中心', fmtVec(fusion.fused_target_center_left_camera_m));
      addRow('包围盒尺寸', fmtVec((fusion.fused_bbox_left_camera_m || {{}}).size_xyz));
      addRow('变换状态', fusion.transform_status || fusion.status || 'unknown');
      const gateDiv = document.createElement('div');
      gateDiv.className = 'gate';
      gateDiv.textContent = gate.motion_allowed ? '运动门禁已通过' : `运动门禁关闭：${{(gate.reasons || []).join(' / ')}}`;
      summary.appendChild(gateDiv);
    }}

    function resize() {{
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }}

    function rotatePoint(p) {{
      const cx = payload.camera.center || [0, 0, 0];
      let x = p[0] - cx[0];
      let y = p[1] - cx[1];
      let z = p[2] - cx[2];
      const cy = Math.cos(state.yaw);
      const sy = Math.sin(state.yaw);
      const cp = Math.cos(state.pitch);
      const sp = Math.sin(state.pitch);
      const x1 = cy * x + sy * z;
      const z1 = -sy * x + cy * z;
      const y1 = cp * y - sp * z1;
      const z2 = sp * y + cp * z1;
      return [x1, y1, z2];
    }}

    function project(p) {{
      const r = rotatePoint(p);
      const distance = 1.4 + Math.max(0.2, payload.camera.radius || 0.2) * 5.0;
      const perspective = distance / (distance - r[2]);
      return [
        window.innerWidth * 0.56 + state.panX + r[0] * state.zoom * perspective,
        window.innerHeight * 0.52 + state.panY - r[1] * state.zoom * perspective,
        r[2]
      ];
    }}

    function drawPointCloud(points, color, size) {{
      const projected = [];
      for (const p of points) {{
        const q = project(p);
        projected.push([q[0], q[1], q[2]]);
      }}
      projected.sort((a, b) => a[2] - b[2]);
      ctx.fillStyle = color;
      for (const p of projected) {{
        ctx.globalAlpha = 0.72;
        ctx.fillRect(p[0], p[1], size, size);
      }}
      ctx.globalAlpha = 1;
    }}

    function bboxCorners() {{
      const bbox = (payload.fusion || {{}}).fused_bbox_left_camera_m || {{}};
      const min = bbox.min_xyz;
      const max = bbox.max_xyz;
      if (!Array.isArray(min) || !Array.isArray(max)) return [];
      return [
        [min[0], min[1], min[2]], [max[0], min[1], min[2]], [max[0], max[1], min[2]], [min[0], max[1], min[2]],
        [min[0], min[1], max[2]], [max[0], min[1], max[2]], [max[0], max[1], max[2]], [min[0], max[1], max[2]]
      ];
    }}

    function drawLine(a, b, color, width = 1.5) {{
      const pa = project(a);
      const pb = project(b);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(pa[0], pa[1]);
      ctx.lineTo(pb[0], pb[1]);
      ctx.stroke();
    }}

    function drawBbox() {{
      const c = bboxCorners();
      if (!c.length) return;
      const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
      for (const [a, b] of edges) drawLine(c[a], c[b], '#d8e55c', 2);
    }}

    function drawAxes() {{
      const c = payload.camera.center || [0, 0, 0];
      const len = Math.max(0.08, (payload.camera.radius || 0.2) * 0.45);
      drawLine(c, [c[0] + len, c[1], c[2]], '#ff5f5f', 2.2);
      drawLine(c, [c[0], c[1] + len, c[2]], '#69d37a', 2.2);
      drawLine(c, [c[0], c[1], c[2] + len], '#67a7ff', 2.2);
    }}

    function drawCenter() {{
      const center = (payload.fusion || {{}}).fused_target_center_left_camera_m;
      if (!Array.isArray(center)) return;
      const p = project(center);
      ctx.fillStyle = '#fff27a';
      ctx.beginPath();
      ctx.arc(p[0], p[1], 5, 0, Math.PI * 2);
      ctx.fill();
    }}

    function draw() {{
      ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
      ctx.fillStyle = '#0e1014';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      drawAxes();
      drawPointCloud(payload.points.left || [], '#4c94ff', 2.0);
      drawPointCloud(payload.points.right || [], '#ff7b45', 2.0);
      drawBbox();
      drawCenter();
    }}

    canvas.addEventListener('mousedown', event => {{
      state.dragging = true;
      state.lastX = event.clientX;
      state.lastY = event.clientY;
    }});
    window.addEventListener('mouseup', () => {{ state.dragging = false; }});
    window.addEventListener('mousemove', event => {{
      if (!state.dragging) return;
      const dx = event.clientX - state.lastX;
      const dy = event.clientY - state.lastY;
      state.lastX = event.clientX;
      state.lastY = event.clientY;
      state.yaw += dx * 0.008;
      state.pitch = Math.max(-1.45, Math.min(1.45, state.pitch + dy * 0.008));
      draw();
    }});
    canvas.addEventListener('wheel', event => {{
      event.preventDefault();
      const factor = Math.exp(-event.deltaY * 0.001);
      state.zoom = Math.max(240, Math.min(3200, state.zoom * factor));
      draw();
    }}, {{ passive: false }});
    document.getElementById('reset').addEventListener('click', () => {{
      state.yaw = -0.82; state.pitch = -0.42; state.zoom = 980; state.panX = 0; state.panY = 0; draw();
    }});
    document.getElementById('top').addEventListener('click', () => {{
      state.yaw = 0; state.pitch = -1.2; state.zoom = 980; draw();
    }});
    document.getElementById('front').addEventListener('click', () => {{
      state.yaw = 0; state.pitch = 0; state.zoom = 980; draw();
    }});
    window.addEventListener('resize', resize);
    fillSummary();
    resize();
  </script>
</body>
</html>
"""


if __name__ == "__main__":
    raise SystemExit(main())
