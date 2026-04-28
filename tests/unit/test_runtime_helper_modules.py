from pathlib import Path
from types import SimpleNamespace
import sys


REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT / "packages" / "control" / "execution_adapter" / "scripts"))
sys.path.insert(0, str(REPO_ROOT / "packages" / "ops" / "competition_console_api" / "scripts"))

from primitive_evidence import POUR_EVIDENCE_STOP_CONDITION, RESULT_UNVERIFIED_EVIDENCE, has_pour_evidence  # noqa: E402
from process_manager import is_process_running, running_process_pid  # noqa: E402


def test_pour_evidence_helper_defines_success_gate():
    assert has_pour_evidence(POUR_EVIDENCE_STOP_CONDITION)
    assert not has_pour_evidence("")
    assert RESULT_UNVERIFIED_EVIDENCE == "unverified_evidence"


def test_process_manager_helper_reports_running_process_state():
    stopped = SimpleNamespace(poll=lambda: 1, pid=42)
    running = SimpleNamespace(poll=lambda: None, pid=43)

    assert not is_process_running(None)
    assert not is_process_running(stopped)
    assert is_process_running(running)
    assert running_process_pid(running) == 43
    assert running_process_pid(stopped) is None
