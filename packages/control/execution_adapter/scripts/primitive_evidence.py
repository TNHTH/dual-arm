#!/usr/bin/python3

from __future__ import annotations


POUR_EVIDENCE_STOP_CONDITION = "simulated_fill_spill_verified"
RESULT_UNVERIFIED_EVIDENCE = "unverified_evidence"


def has_pour_evidence(stop_condition_id: str) -> bool:
    return stop_condition_id == POUR_EVIDENCE_STOP_CONDITION
