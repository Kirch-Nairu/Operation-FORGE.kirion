#!/usr/bin/env python3
"""Exact-action approval tokens layered on top of Forge capability envelopes."""
from __future__ import annotations
import copy, hashlib, hmac, json

class ApprovalError(RuntimeError):
    pass

def _canonical(value)->bytes:
    return json.dumps(value,sort_keys=True,separators=(",",":"),ensure_ascii=False).encode("utf-8")

def _sha(value)->str:
    return hashlib.sha256(_canonical(value)).hexdigest()

def _require(cond,msg):
    if not cond: raise ApprovalError(msg)

def _proposal_base(proposal:dict)->dict:
    return {
        "version":proposal.get("version"),
        "envelope_sha256":proposal.get("envelope_sha256"),
        "capability":proposal.get("capability"),
        "operation":proposal.get("operation"),
        "parameters":proposal.get("parameters"),
        "target_state":proposal.get("target_state"),
    }

def propose_action(envelope:dict,*,capability:str,operation:str,parameters:dict,target_state:dict)->dict:
    _require(capability in envelope.get("capabilities",[]),f"approval cannot create missing capability: {capability}")
    _require(bool(envelope.get("envelope_sha256")),"authority envelope identity is required")
    _require(bool(operation),"operation is required")
    _require(isinstance(parameters,dict) and isinstance(target_state,dict),"parameters and target_state must be objects")
    base={
        "version":1,
        "envelope_sha256":envelope["envelope_sha256"],
        "capability":capability,
        "operation":operation,
        "parameters":copy.deepcopy(parameters),
        "target_state":copy.deepcopy(target_state),
    }
    return {**base,"action_sha256":_sha(base)}

def _validate_proposal(proposal:dict)->None:
    _require(proposal.get("version")==1,"unsupported action proposal version")
    expected=_sha(_proposal_base(proposal))
    _require(hmac.compare_digest(str(proposal.get("action_sha256") or ""),expected),"action proposal digest mismatch")

def approve_action(proposal:dict,*,approver:str,key:str,approval_id:str)->dict:
    _validate_proposal(proposal)
    _require(bool(approver and approval_id),"approver and approval_id are required")
    _require(bool(key),"approval signing key is required")
    base={
        "version":1,
        "approval_id":approval_id,
        "approver":approver,
        "action_sha256":proposal["action_sha256"],
        "envelope_sha256":proposal["envelope_sha256"],
        "capability":proposal["capability"],
    }
    signature=hmac.new(key.encode("utf-8"),_canonical(base),hashlib.sha256).hexdigest()
    return {**base,"signature_hmac_sha256":signature}

def verify_approval(token:dict,proposal:dict,*,key:str)->bool:
    _require(bool(key),"approval verification key is required")
    _validate_proposal(proposal)
    _require(token.get("version")==1,"unsupported approval token version")
    _require(token.get("action_sha256")==proposal.get("action_sha256"),"approval is for a different exact action")
    _require(token.get("envelope_sha256")==proposal.get("envelope_sha256"),"approval authority envelope mismatch")
    _require(token.get("capability")==proposal.get("capability"),"approval capability mismatch")
    base={
        "version":token.get("version"),
        "approval_id":token.get("approval_id"),
        "approver":token.get("approver"),
        "action_sha256":token.get("action_sha256"),
        "envelope_sha256":token.get("envelope_sha256"),
        "capability":token.get("capability"),
    }
    expected=hmac.new(key.encode("utf-8"),_canonical(base),hashlib.sha256).hexdigest()
    _require(hmac.compare_digest(str(token.get("signature_hmac_sha256") or ""),expected),"approval signature verification failed")
    return True

class ApprovalLedger:
    """Durable one-use consumption ledger for exact-action approval tokens."""

    def __init__(self, consumed=None):
        self._consumed=[]
        self._keys=set()
        for entry in consumed or []:
            self._add_existing(entry)

    def _add_existing(self, entry):
        _require(isinstance(entry,dict),"invalid consumed approval entry")
        approval_id=str(entry.get("approval_id") or "")
        action_sha256=str(entry.get("action_sha256") or "")
        _require(bool(approval_id and action_sha256),"consumed entry requires approval_id and action_sha256")
        key=(approval_id,action_sha256)
        _require(key not in self._keys,"duplicate consumed approval entry")
        normalized={"approval_id":approval_id,"action_sha256":action_sha256}
        self._keys.add(key)
        self._consumed.append(normalized)

    def consume(self, token:dict, proposal:dict, *, key:str)->bool:
        # Verification happens before mutation: invalid attempts never burn a token.
        verify_approval(token,proposal,key=key)
        identity=(str(token.get("approval_id") or ""),str(token.get("action_sha256") or ""))
        _require(identity not in self._keys,"approval token has already been consumed")
        self._keys.add(identity)
        self._consumed.append({"approval_id":identity[0],"action_sha256":identity[1]})
        return True

    def to_dict(self)->dict:
        return {"version":1,"consumed":copy.deepcopy(self._consumed)}

    @classmethod
    def from_dict(cls, snapshot:dict):
        _require(isinstance(snapshot,dict) and snapshot.get("version")==1,"unsupported approval ledger snapshot")
        consumed=snapshot.get("consumed")
        _require(isinstance(consumed,list),"approval ledger consumed entries must be a list")
        return cls(consumed=consumed)
