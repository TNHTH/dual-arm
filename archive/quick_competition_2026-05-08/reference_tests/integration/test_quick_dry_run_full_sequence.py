from pathlib import Path
import os
import subprocess
import sys

REPO_ROOT = Path(__file__).resolve().parents[2]


def test_quick_dry_run_full_sequence_stops_at_hybrid_preflight_until_anchors_are_verified():
    env = dict(os.environ)
    env["PYTHONPATH"] = str(REPO_ROOT / "packages/quick_competition") + os.pathsep + env.get("PYTHONPATH", "")
    proc = subprocess.run(
        ["/usr/bin/python3", "-m", "quick_competition.quick_competition_orchestrator", "--dry-run", "--full"],
        cwd=REPO_ROOT,
        env=env,
        text=True,
        capture_output=True,
        timeout=20,
        check=False,
    )
    assert proc.returncode == 2, proc.stdout + proc.stderr
    assert "SKIPPED_BY_PREFLIGHT" in proc.stdout
    assert "hybrid.anchor.left_arm.home" in proc.stdout
    assert "[OK] preflight passed" not in proc.stdout
    assert "[OK] pouring sequence simulated" not in proc.stdout
