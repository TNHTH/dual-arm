#!/usr/bin/env python3
from pathlib import Path
import sys

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT / "packages/quick_competition"))

from quick_competition.quick_competition_orchestrator import QuickCompetitionOrchestrator  # noqa: E402


def main() -> int:
    result = QuickCompetitionOrchestrator(dry_run=True, task="full").run()
    return 0 if result.success else 2


if __name__ == "__main__":
    raise SystemExit(main())
