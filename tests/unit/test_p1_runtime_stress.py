import os
from pathlib import Path
import subprocess
import textwrap

import pytest


REPO_ROOT = Path(__file__).resolve().parents[2]


def _run_bash_with_python(script: str, timeout: int = 30) -> subprocess.CompletedProcess[str]:
    setup = REPO_ROOT / "install" / "setup.bash"
    if not setup.exists():
        pytest.skip("install/setup.bash 不存在，跳过 ROS Python runtime stress")
    return subprocess.run(
        ["bash", "-lc", "source install/setup.bash && /usr/bin/python3 -"],
        cwd=REPO_ROOT,
        input=script,
        text=True,
        capture_output=True,
        timeout=timeout,
        check=False,
    )


def test_kdtree_atomic_claim_runtime_stress(tmp_path):
    source = tmp_path / "kdtree_stress.cpp"
    binary = tmp_path / "kdtree_stress"
    source.write_text(
        textwrap.dedent(
            r"""
            #include <iostream>
            #include <random>
            #include <vector>

            #include "depth_handler/cluster.hpp"

            int main() {
              omp_set_num_threads(8);
              std::mt19937 rng(12345);
              std::normal_distribution<float> noise(0.0f, 0.0008f);
              for (int round = 0; round < 120; ++round) {
                std::vector<Eigen::Vector3f> points;
                points.reserve(2400);
                for (int cluster = 0; cluster < 6; ++cluster) {
                  Eigen::Vector3f base(cluster * 0.2f, cluster * 0.07f, cluster * 0.03f);
                  for (int i = 0; i < 400; ++i) {
                    points.emplace_back(base.x() + noise(rng), base.y() + noise(rng), base.z() + noise(rng));
                  }
                }
                auto clusters = clusterPointsKDTree(points, 0.015f, 10, 1000);
                size_t clustered_points = 0;
                for (const auto& cluster : clusters) {
                  clustered_points += cluster.size();
                }
                if (clusters.size() != 6 || clustered_points != points.size()) {
                  std::cerr << "round=" << round
                            << " clusters=" << clusters.size()
                            << " points=" << clustered_points
                            << " expected=" << points.size() << std::endl;
                  return 1;
                }
              }
              std::cout << "kdtree stress ok" << std::endl;
              return 0;
            }
            """
        ),
        encoding="utf-8",
    )
    compile_result = subprocess.run(
        [
            "g++",
            "-std=c++17",
            "-O2",
            "-fopenmp",
            "-Ipackages/perception/depth_handler/include",
            "-I/usr/include/eigen3",
            str(source),
            "-o",
            str(binary),
        ],
        cwd=REPO_ROOT,
        text=True,
        capture_output=True,
        timeout=30,
        check=False,
    )
    assert compile_result.returncode == 0, compile_result.stderr

    env = os.environ.copy()
    env["OMP_NUM_THREADS"] = "8"
    run_result = subprocess.run(
        [str(binary)],
        cwd=REPO_ROOT,
        env=env,
        text=True,
        capture_output=True,
        timeout=30,
        check=False,
    )
    assert run_result.returncode == 0, run_result.stderr
    assert "kdtree stress ok" in run_result.stdout


def test_planning_scene_sync_cache_runtime_stress():
    script = r"""
import importlib.util
import sys
import threading
from pathlib import Path

repo = Path.cwd()
path = repo / "packages/planning/planning_scene_sync/scripts/planning_scene_sync_node.py"
spec = importlib.util.spec_from_file_location("planning_scene_sync_node_under_test", path)
module = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = module
spec.loader.exec_module(module)

node = object.__new__(module.PlanningSceneSyncNode)
node._sync_lock = threading.RLock()
node._raw_scene = module.SceneObjectArray()
node._object_cache = {}
node._object_last_seen_monotonic = {}
node._object_retention_timeout = 60.0
node._publish_and_sync = lambda wait_for_result=False: True

def make_message(round_id):
    msg = module.SceneObjectArray()
    msg.header.frame_id = "world"
    for index in range(8):
        obj = module.SceneObject()
        obj.id = f"obj_{index}"
        obj.semantic_type = "water_bottle"
        obj.confidence = 1.0
        obj.pose.header.frame_id = "world"
        obj.pose.pose.orientation.w = 1.0
        obj.pose.pose.position.x = float(round_id)
        msg.objects.append(obj)
    return msg

errors = []

def writer(tid):
    try:
        for round_id in range(250):
            node._handle_scene(make_message(tid * 1000 + round_id))
    except Exception as exc:
        errors.append(exc)

def reader():
    try:
        for _ in range(2500):
            for index in range(8):
                node._has_live_object(f"obj_{index}")
    except Exception as exc:
        errors.append(exc)

threads = [threading.Thread(target=writer, args=(index,)) for index in range(4)]
threads.extend(threading.Thread(target=reader) for _ in range(4))
for thread in threads:
    thread.start()
for thread in threads:
    thread.join()
assert not errors, errors
assert all(node._has_live_object(f"obj_{index}") for index in range(8))
print("planning_scene_sync cache stress ok")
"""
    result = _run_bash_with_python(script)
    assert result.returncode == 0, result.stderr
    assert "planning_scene_sync cache stress ok" in result.stdout


def test_competition_console_stop_runtime_stress():
    script = r"""
import importlib.util
import subprocess
import sys
import tempfile
import threading
from pathlib import Path

repo = Path.cwd()
scripts = repo / "packages/ops/competition_console_api/scripts"
sys.path.insert(0, str(scripts))
path = scripts / "competition_console_api_node.py"
spec = importlib.util.spec_from_file_location("competition_console_api_node_under_test", path)
module = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = module
spec.loader.exec_module(module)

class Logger:
    def warn(self, message):
        print(f"WARN {message}")

node = object.__new__(module.CompetitionConsoleApiNode)
node._core_process_lock = threading.Lock()
node._core_process_stopping = False
node._stop_all_jog_sessions = lambda reason: None
node.get_logger = lambda: Logger()

log_handle = tempfile.NamedTemporaryFile("w+", delete=True)
process = subprocess.Popen(
    ["sleep", "30"],
    stdout=log_handle,
    stderr=subprocess.STDOUT,
    text=True,
    start_new_session=True,
)
node._core_process = process
node._core_log_handle = log_handle
errors = []

def stopper():
    try:
        node._stop_core_process()
    except Exception as exc:
        errors.append(exc)

threads = [threading.Thread(target=stopper) for _ in range(16)]
for thread in threads:
    thread.start()
for thread in threads:
    thread.join()

assert not errors, errors
assert process.poll() is not None
assert node._core_process is None
assert node._core_log_handle is None
assert node._core_process_stopping is False
print("competition_console stop stress ok")
"""
    result = _run_bash_with_python(script)
    assert result.returncode == 0, result.stderr
    assert "competition_console stop stress ok" in result.stdout
