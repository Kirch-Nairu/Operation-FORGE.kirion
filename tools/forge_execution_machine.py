#!/usr/bin/env python3
"""Durable, role-preserving execution state machine for asynchronous external work.

This module deliberately contains no GitHub-specific polling. It models the state
that must be durably checkpointed before an ephemeral agent yields control.
"""
from __future__ import annotations
import copy

class ExecutionError(RuntimeError):
    pass

TERMINAL={"COMPLETE","BLOCKED","REWORK_REQUIRED"}

def _require(condition: bool, message: str) -> None:
    if not condition:
        raise ExecutionError(message)

def new_execution(*, role: str, branch: str, head_sha: str) -> dict:
    _require(bool(role and branch and head_sha), "role, branch, and head_sha are required")
    return {
        "version": 1,
        "state": "ACTIVE_LIGHT",
        "role": role,
        "branch": branch,
        "head_sha": head_sha,
        "external": None,
        "last_external_conclusion": None,
        "failure_classification": None,
    }

def transition(state: dict, event: str, payload: dict | None = None) -> dict:
    payload=payload or {}
    current=state.get("state")
    _require(current not in TERMINAL, f"terminal execution state cannot transition: {current}")
    s=copy.deepcopy(state)

    if event=="BEGIN_MEDIUM":
        _require(current=="ACTIVE_LIGHT","BEGIN_MEDIUM requires ACTIVE_LIGHT")
        s["state"]="ACTIVE_MEDIUM"
        return s

    if event=="WAIT_EXTERNAL":
        raise ExecutionError("WAITING_EXTERNAL is entered only by observing an exact external run and persisting its checkpoint")

    if event=="EXTERNAL_RUN_OBSERVED":
        _require(current=="ACTIVE_MEDIUM","external launch requires ACTIVE_MEDIUM")
        run_id=str(payload.get("run_id") or "")
        expected_head=str(payload.get("expected_head") or "")
        _require(bool(run_id),"external run_id is required")
        _require(expected_head==s["head_sha"],"external run head must match the durable execution head")
        _require(payload.get("checkpoint_persisted") is True,"durable checkpoint is required before WAITING_EXTERNAL")
        s["external"]={"run_id":run_id,"expected_head":expected_head,"checkpoint_persisted":True}
        s["state"]="WAITING_EXTERNAL"
        return s

    if event=="RECONCILE_SUCCESS":
        _require(current=="RECONCILING_EXTERNAL","RECONCILE_SUCCESS requires RECONCILING_EXTERNAL")
        _require(s.get("last_external_conclusion")=="success","failed/non-success external work cannot be reconciled as success")
        s["state"]="ACTIVE_LIGHT"
        s["external"]=None
        s["last_external_conclusion"]=None
        return s

    if event=="CLASSIFY_FAILURE":
        _require(current=="RECONCILING_EXTERNAL","CLASSIFY_FAILURE requires RECONCILING_EXTERNAL")
        _require(s.get("last_external_conclusion")!="success","successful external work is not a failure")
        classification=payload.get("classification")
        _require(classification in {"PRODUCT_DEFECT","HARNESS_DEFECT","ENVIRONMENT_UNRESOLVED"},"unsupported failure classification")
        s["failure_classification"]=classification
        if classification=="PRODUCT_DEFECT":
            s["state"]="REWORK_REQUIRED"
        elif classification=="HARNESS_DEFECT":
            s["state"]="ACTIVE_MEDIUM"
            s["external"]=None
        else:
            s["state"]="BLOCKED"
        return s

    if event=="FINALIZE":
        _require(current=="ACTIVE_LIGHT","FINALIZE requires ACTIVE_LIGHT")
        s["state"]="FINALIZING"
        return s

    if event=="COMPLETE":
        _require(current=="FINALIZING","COMPLETE requires FINALIZING")
        s["state"]="COMPLETE"
        return s

    raise ExecutionError(f"unsupported transition: {current} --{event}--> ?")

def resume_external(state: dict, observed: dict) -> dict:
    _require(state.get("state")=="WAITING_EXTERNAL","resume requires WAITING_EXTERNAL")
    ext=state.get("external") or {}
    _require(ext.get("checkpoint_persisted") is True,"cannot resume an uncheckpointed external wait")

    if "role" in observed:
        _require(observed["role"]==state.get("role"),"resume may not change role authority")

    run_id=str(observed.get("run_id") or "")
    head=str(observed.get("head_sha") or "")
    _require(run_id==ext.get("run_id"),"external run identity mismatch")
    _require(head==ext.get("expected_head"),"external run head mismatch")

    status=observed.get("status")
    _require(status in {"queued","in_progress","completed"},"unsupported external run status")
    if status in {"queued","in_progress"}:
        return copy.deepcopy(state)

    conclusion=observed.get("conclusion")
    _require(conclusion in {"success","failure","cancelled","timed_out"},"completed external run requires a recognized conclusion")
    s=copy.deepcopy(state)
    s["state"]="RECONCILING_EXTERNAL"
    s["last_external_conclusion"]=conclusion
    s["external"]={**ext,"observed_status":"completed","observed_conclusion":conclusion}
    return s
