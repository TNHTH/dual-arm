from __future__ import annotations

import argparse
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Dict, List

import yaml

from .quick_types import (
    ITEM_COMPLETED,
    ITEM_FAILED,
    ITEM_PENDING,
    ITEM_SKIPPED_PREFLIGHT,
    RUN_ABORTED_HARDWARE,
    RUN_DRY,
    RUN_FAILED_EMPTY,
    RUN_FATAL,
    RUN_PARTIAL_SUCCESS,
    RUN_SUCCESS,
    utc_now,
)


@dataclass
class ScoreItem:
    name: str
    status: str = ITEM_PENDING
    message: str = ""


@dataclass
class QuickTaskScoreboard:
    dry_run: bool = True
    run_status: str = RUN_DRY
    items: Dict[str, ScoreItem] = field(default_factory=dict)
    fatal_message: str = ""
    started_at: str = field(default_factory=utc_now)
    finished_at: str = ""

    def ensure_item(self, name: str) -> ScoreItem:
        if name not in self.items:
            self.items[name] = ScoreItem(name)
        return self.items[name]

    def complete(self, name: str, message: str = "") -> None:
        item = self.ensure_item(name)
        item.status = ITEM_COMPLETED
        item.message = message

    def fail(self, name: str, message: str = "") -> None:
        item = self.ensure_item(name)
        item.status = ITEM_FAILED
        item.message = message

    def skip_preflight(self, name: str, message: str = "") -> None:
        item = self.ensure_item(name)
        item.status = ITEM_SKIPPED_PREFLIGHT
        item.message = message

    def fatal(self, message: str, hardware_fault: bool = False) -> None:
        self.run_status = RUN_ABORTED_HARDWARE if hardware_fault else RUN_FATAL
        self.fatal_message = message
        self.finished_at = utc_now()

    def finalize(self) -> str:
        self.finished_at = utc_now()
        if self.run_status in {RUN_ABORTED_HARDWARE, RUN_FATAL}:
            return self.run_status
        if self.dry_run:
            self.run_status = RUN_DRY
            return self.run_status
        statuses = [item.status for item in self.items.values()]
        completed = statuses.count(ITEM_COMPLETED)
        attempted = [item for item in statuses if item != ITEM_SKIPPED_PREFLIGHT]
        if completed == len(statuses) and statuses:
            self.run_status = RUN_SUCCESS
        elif completed > 0:
            self.run_status = RUN_PARTIAL_SUCCESS
        elif attempted:
            self.run_status = RUN_FAILED_EMPTY
        else:
            self.run_status = RUN_FAILED_EMPTY
        return self.run_status

    def to_dict(self) -> Dict[str, object]:
        data = asdict(self)
        data["items"] = {name: asdict(item) for name, item in self.items.items()}
        return data

    def write(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(yaml.safe_dump(self.to_dict(), allow_unicode=True, sort_keys=False), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="quick task scoreboard helper")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    board = QuickTaskScoreboard(dry_run=True)
    board.complete("dry_run")
    board.finalize()
    print(yaml.safe_dump(board.to_dict(), allow_unicode=True, sort_keys=False))


if __name__ == "__main__":
    main()
