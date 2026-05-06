from pathlib import Path
import os
import subprocess
import sys

REPO_ROOT = Path(__file__).resolve().parents[2]


def test_quick_dry_run_full_sequence_completes():
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
    assert proc.returncode == 0, proc.stdout + proc.stderr
    assert "[OK] preflight passed" in proc.stdout
    assert "[OK] pouring sequence simulated" in proc.stdout
    assert "[OK] ball cage sequence simulated" in proc.stdout
    assert "[OK] quick run log exported" in proc.stdout
