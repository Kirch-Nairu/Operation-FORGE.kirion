#!/usr/bin/env python3
"""Exact-action approval tokens layered on top of Forge capability envelopes."""
from __future__ import annotations
import copy, hashlib, hmac, json, secrets

from forge_authority_kernel import verify_envelope

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
    verify_envelope(envelope)
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
    """One-use exact-action approvals with rollback high-water detection.

    The class-level high-water is a runtime trust anchor. A production runtime
    must persist the same high-water outside the candidate-controlled snapshot
    to preserve rollback detection across process loss.
    """
    _high_water={}

    def __init__(self, consumed=None, *, ledger_id=None, generation=0, _restoring=False):
        self.ledger_id=ledger_id or secrets.token_hex(16)
        self.generation=int(generation)
        _require(self.generation>=0,"ledger generation must be non-negative")
        if _restoring:
            trusted=self._high_water.get(self.ledger_id,0)
            _require(self.generation>=trusted,f"approval ledger rollback detected: {self.generation} < trusted {trusted}")
        self._consumed=[]
        self._keys=set()
        for entry in consumed or []:
            self._add_existing(entry)
        self._high_water[self.ledger_id]=max(self._high_water.get(self.ledger_id,0),self.generation)

    def _add_existing(self, entry):
        _require(isinstance(entry,dict),"invalid consumed approval entry")
        approval_id=str(entry.get("approval_id") or "")
        action_sha256=str(entry.get("action_sha256") or "")
        _require(bool(approval_id and action_sha256),"consumed entry requires approval_id and action_sha256")
        identity=(approval_id,action_sha256)
        _require(identity not in self._keys,"duplicate consumed approval entry")
        self._keys.add(identity)
        self._consumed.append({"approval_id":approval_id,"action_sha256":action_sha256})

    def consume(self, token:dict, proposal:dict, *, key:str)->bool:
        verify_approval(token,proposal,key=key)
        identity=(str(token.get("approval_id") or ""),str(token.get("action_sha256") or ""))
        _require(identity not in self._keys,"approval token has already been consumed")
        self._keys.add(identity)
        self._consumed.append({"approval_id":identity[0],"action_sha256":identity[1]})
        self.generation+=1
        self._high_water[self.ledger_id]=max(self._high_water.get(self.ledger_id,0),self.generation)
        return True

    def to_dict(self)->dict:
        base={"version":2,"ledger_id":self.ledger_id,"generation":self.generation,"consumed":copy.deepcopy(self._consumed)}
        return {**base,"snapshot_sha256":_sha(base)}

    @classmethod
    def from_dict(cls, snapshot:dict):
        _require(isinstance(snapshot,dict) and snapshot.get("version")==2,"unsupported approval ledger snapshot")
        base={
            "version":snapshot.get("version"),
            "ledger_id":snapshot.get("ledger_id"),
            "generation":snapshot.get("generation"),
            "consumed":snapshot.get("consumed"),
        }
        _require(hmac.compare_digest(str(snapshot.get("snapshot_sha256") or ""),_sha(base)),"approval ledger snapshot digest mismatch")
        _require(bool(base["ledger_id"]) and isinstance(base["consumed"],list),"invalid approval ledger snapshot")
        return cls(consumed=base["consumed"],ledger_id=base["ledger_id"],generation=base["generation"],_restoring=True)
