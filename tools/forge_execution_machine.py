#!/usr/bin/env python3
"""Durable, role-preserving execution state machine for asynchronous external work.

This module deliberately contains no GitHub-specific polling. It models the state
that must be durably checkpointed before an ephemeral agent yields control.
"""
from __future__ import annotations
import copy
import hashlib
import hmac
import json

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

def _verified_state_digest(state:dict)->str:
    clean=copy.deepcopy(state)
    clean.pop("_verified_checkpoint_state_sha256",None)
    return hashlib.sha256(_canonical(clean)).hexdigest()

def resume_external(state: dict, observed: dict) -> dict:
    marker=state.get("_verified_checkpoint_state_sha256")
    if marker is not None:
        _require(hmac.compare_digest(str(marker),_verified_state_digest(state)),"verified checkpoint state changed after integrity verification")
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


class CheckpointIntegrityError(RuntimeError):
    pass

CHECKPOINT_VERSION=1

def _canonical(value: dict) -> bytes:
    return json.dumps(value,sort_keys=True,separators=(",",":"),ensure_ascii=False).encode("utf-8")

def _checkpoint_digest(base: dict, key: str | None = None) -> str:
    payload=_canonical(base)
    if key is not None:
        return hmac.new(key.encode("utf-8"),payload,hashlib.sha256).hexdigest()
    return hashlib.sha256(payload).hexdigest()

def seal_checkpoint(state: dict, key: str | None = None) -> dict:
    """Seal authority-bearing execution state for durable handoff/resumption."""
    base={
        "checkpoint_version":CHECKPOINT_VERSION,
        "integrity_mode":"HMAC_SHA256" if key is not None else "SHA256",
        "state":copy.deepcopy(state),
    }
    return {**base,"integrity_sha256":_checkpoint_digest(base,key)}

def verify_checkpoint(envelope: dict, key: str | None = None) -> dict:
    """Verify checkpoint integrity and return an isolated copy of the state.

    Providing a key makes HMAC mandatory. This prevents an unsigned checkpoint
    from remaining silently trusted after the runtime is upgraded to signing.
    """
    if not isinstance(envelope,dict):
        raise CheckpointIntegrityError("checkpoint envelope must be an object")
    if envelope.get("checkpoint_version")!=CHECKPOINT_VERSION:
        raise CheckpointIntegrityError("unsupported checkpoint version")
    mode=envelope.get("integrity_mode")
    if mode not in {"SHA256","HMAC_SHA256"}:
        raise CheckpointIntegrityError("unsupported checkpoint integrity mode")
    if mode=="HMAC_SHA256" and key is None:
        raise CheckpointIntegrityError("HMAC checkpoint requires the server-held key")
    if mode=="SHA256" and key is not None:
        raise CheckpointIntegrityError("unsigned checkpoint rejected because HMAC is now required")
    if "state" not in envelope or "integrity_sha256" not in envelope:
        raise CheckpointIntegrityError("incomplete checkpoint envelope")
    base={
        "checkpoint_version":envelope["checkpoint_version"],
        "integrity_mode":mode,
        "state":envelope["state"],
    }
    expected=_checkpoint_digest(base,key if mode=="HMAC_SHA256" else None)
    actual=str(envelope.get("integrity_sha256") or "")
    if not hmac.compare_digest(actual,expected):
        raise CheckpointIntegrityError("checkpoint integrity verification failed")
    state=copy.deepcopy(envelope["state"])
    state["_verified_checkpoint_state_sha256"]=_verified_state_digest(state)
    return state


def resume_checkpoint(envelope:dict, observed:dict, key:str|None=None)->dict:
    """Atomically verify a durable checkpoint and resume its exact external work."""
    state=verify_checkpoint(envelope,key=key)
    return resume_external(state,observed)
