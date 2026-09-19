#!/usr/bin/env python3
"""Fresh verifier contract: independent evidence, never self-acceptance."""
from __future__ import annotations
import copy, hashlib, hmac, json
from forge_actor_identity import verify_actor_token, verify_actor_token_temporal

class VerificationError(RuntimeError):
    pass

OUTCOMES={"SUPPORTED","NOT_SUPPORTED","INCONCLUSIVE"}

def _canonical(v):
    return json.dumps(v,sort_keys=True,separators=(",",":"),ensure_ascii=False).encode("utf-8")

def _sha(v):
    return hashlib.sha256(_canonical(v)).hexdigest()

def _require(cond,msg):
    if not cond: raise VerificationError(msg)

def _request_base(r):
    return {
        "version":r.get("version"),
        "candidate_sha":r.get("candidate_sha"),
        "claim":r.get("claim"),
        "requirement":r.get("requirement"),
        "procedure":r.get("procedure"),
        "worker_id":r.get("worker_id"),
        "evidence_refs":r.get("evidence_refs"),
    }

def _validate_request(r):
    _require(r.get("version")==1,"unsupported verification request version")
    _require(hmac.compare_digest(str(r.get("request_sha256") or ""),_sha(_request_base(r))),"verification request digest mismatch")

def make_verification_request(*,candidate_sha:str,claim:str,requirement:str,procedure:list[str],worker_id:str,evidence_refs:list[str])->dict:
    _require(bool(candidate_sha and claim and requirement and worker_id),"candidate/claim/requirement/worker are required")
    _require(isinstance(procedure,list) and isinstance(evidence_refs,list),"procedure and evidence_refs must be lists")
    base={"version":1,"candidate_sha":candidate_sha,"claim":claim,"requirement":requirement,"procedure":copy.deepcopy(procedure),"worker_id":worker_id,"evidence_refs":copy.deepcopy(evidence_refs)}
    return {**base,"request_sha256":_sha(base)}

def _result_base(r):
    return {
        "version":r.get("version"),
        "request_sha256":r.get("request_sha256"),
        "candidate_sha":r.get("candidate_sha"),
        "verifier_id":r.get("verifier_id"),
        "outcome":r.get("outcome"),
        "observed_evidence":r.get("observed_evidence"),
        "authority":r.get("authority"),
        "acceptance_authorized":r.get("acceptance_authorized"),
        "promotion_authorized":r.get("promotion_authorized"),
    }

def record_verification(request:dict,*,verifier_id:str,outcome:str,observed_evidence:list[str])->dict:
    _validate_request(request)
    _require(bool(verifier_id),"verifier_id is required")
    _require(verifier_id!=request.get("worker_id"),"worker may not act as fresh verifier for its own candidate")
    _require(outcome in OUTCOMES,f"unsupported verifier outcome: {outcome}")
    _require(isinstance(observed_evidence,list),"observed_evidence must be a list")
    base={
        "version":1,
        "request_sha256":request["request_sha256"],
        "candidate_sha":request["candidate_sha"],
        "verifier_id":verifier_id,
        "outcome":outcome,
        "observed_evidence":copy.deepcopy(observed_evidence),
        "authority":"EVIDENCE_ONLY",
        "acceptance_authorized":False,
        "promotion_authorized":False,
    }
    return {**base,"result_sha256":_sha(base)}

def verify_result(result:dict,request:dict)->bool:
    _validate_request(request)
    _require(result.get("version")==1,"unsupported verification result version")
    _require(result.get("request_sha256")==request.get("request_sha256"),"verification result belongs to another request")
    _require(result.get("candidate_sha")==request.get("candidate_sha"),"verification candidate mismatch")
    _require(result.get("verifier_id")!=request.get("worker_id"),"self-verification is invalid")
    _require(result.get("outcome") in OUTCOMES,"invalid verification outcome")
    _require(result.get("authority")=="EVIDENCE_ONLY","verifier authority escalated")
    _require(result.get("acceptance_authorized") is False,"verifier may not grant Acceptance")
    _require(result.get("promotion_authorized") is False,"verifier may not grant Promotion")
    expected=_sha(_result_base(result))
    _require(hmac.compare_digest(str(result.get("result_sha256") or ""),expected),"verification result digest mismatch")
    return True


def record_verification_authenticated(request:dict,*,verifier_token:dict,identity_key:str,outcome:str,observed_evidence:list[str])->dict:
    identity=verify_actor_token(verifier_token,key=identity_key,required_role="VERIFIER")
    return record_verification(request,verifier_id=identity["actor_id"],outcome=outcome,observed_evidence=observed_evidence)


def make_verification_request_authenticated(*,candidate_sha:str,claim:str,requirement:str,procedure:list[str],worker_token:dict,identity_key:str,evidence_refs:list[str])->dict:
    identity=verify_actor_token(worker_token,key=identity_key,required_role="WRITER")
    return make_verification_request(
        candidate_sha=candidate_sha,
        claim=claim,
        requirement=requirement,
        procedure=procedure,
        worker_id=identity["actor_id"],
        evidence_refs=evidence_refs,
    )


def make_verification_request_temporal_authenticated(*,candidate_sha:str,claim:str,requirement:str,procedure:list[str],worker_token:dict,identity_trust_store,current_epoch:int,evidence_refs:list[str])->dict:
    identity=verify_actor_token_temporal(worker_token,trust_store=identity_trust_store,current_epoch=current_epoch,required_role="WRITER")
    return make_verification_request(
        candidate_sha=candidate_sha,claim=claim,requirement=requirement,procedure=procedure,
        worker_id=identity["actor_id"],evidence_refs=evidence_refs)

def record_verification_temporal_authenticated(request:dict,*,verifier_token:dict,identity_trust_store,current_epoch:int,outcome:str,observed_evidence:list[str])->dict:
    identity=verify_actor_token_temporal(verifier_token,trust_store=identity_trust_store,current_epoch=current_epoch,required_role="VERIFIER")
    return record_verification(request,verifier_id=identity["actor_id"],outcome=outcome,observed_evidence=observed_evidence)
