#!/usr/bin/env python3
"""Review-only learning candidates for controlled Forge self-improvement."""
from __future__ import annotations
import copy, hashlib, hmac, json

class LearningError(RuntimeError):
    pass

def _canonical(v):
    return json.dumps(v,sort_keys=True,separators=(",",":"),ensure_ascii=False).encode("utf-8")
def _sha(v): return hashlib.sha256(_canonical(v)).hexdigest()
def _require(c,m):
    if not c: raise LearningError(m)
def _base(c):
    return {k:c.get(k) for k in ["version","source_run_id","teacher_id","failure","successful_trace","generalized_steps","status","review_required","promotion_authorized","authority"]}

def create_skill_candidate(*,source_run_id:str,teacher_id:str,failure:str,successful_trace:list[str],generalized_steps:list[str])->dict:
    _require(bool(source_run_id and teacher_id and failure),"source run, teacher, and failure are required")
    _require(isinstance(successful_trace,list) and successful_trace,"successful trace is required")
    _require(isinstance(generalized_steps,list) and generalized_steps,"generalized steps are required")
    base={"version":1,"source_run_id":source_run_id,"teacher_id":teacher_id,"failure":failure,"successful_trace":copy.deepcopy(successful_trace),"generalized_steps":copy.deepcopy(generalized_steps),"status":"CANDIDATE","review_required":True,"promotion_authorized":False,"authority":"NONE"}
    return {**base,"candidate_sha256":_sha(base)}

def verify_skill_candidate(candidate:dict)->bool:
    _require(candidate.get("version")==1,"unsupported skill candidate version")
    _require(candidate.get("status")=="CANDIDATE","skill source must remain a candidate")
    _require(candidate.get("review_required") is True,"learning candidate must require review")
    _require(candidate.get("promotion_authorized") is False,"learning candidate cannot self-authorize promotion")
    _require(candidate.get("authority")=="NONE","learning candidate carries no execution authority")
    expected=_sha(_base(candidate))
    _require(hmac.compare_digest(str(candidate.get("candidate_sha256") or ""),expected),"skill candidate digest mismatch")
    return True

def record_skill_review(candidate:dict,*,reviewer_id:str,outcome:str)->dict:
    verify_skill_candidate(candidate)
    _require(bool(reviewer_id),"reviewer_id is required")
    _require(reviewer_id!=candidate.get("teacher_id"),"teacher may not review its own learned procedure")
    _require(outcome in {"APPROVE","REJECT"},"skill review can only APPROVE or REJECT; it cannot promote")
    return {
        "version":1,
        "candidate_sha256":candidate["candidate_sha256"],
        "reviewer_id":reviewer_id,
        "outcome":outcome,
        "status":"REVIEWED_APPROVED" if outcome=="APPROVE" else "REVIEWED_REJECTED",
        "authority":"NONE",
        "promotion_authorized":False,
    }
