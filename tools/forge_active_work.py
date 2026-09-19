#!/usr/bin/env python3
"""Active-work lease registry for concurrent Forge mutation ownership."""
from __future__ import annotations
import copy, fnmatch, hashlib, hmac, json
from forge_authority_kernel import verify_envelope, AuthorityError

class ActiveWorkError(RuntimeError):
    pass

def _require(cond,msg):
    if not cond: raise ActiveWorkError(msg)

def _prefix(pattern:str):
    p=pattern.replace("\\","/").strip("/")
    if p=="**": return ""
    if p.endswith("/**"): return p[:-3].rstrip("/")
    return None

def scopes_overlap(a:str,b:str)->bool:
    a=a.replace("\\","/"); b=b.replace("\\","/")
    if a=="**" or b=="**": return True
    pa,pb=_prefix(a),_prefix(b)
    if pa is not None and pb is not None:
        return pa==pb or pa.startswith(pb+"/") or pb.startswith(pa+"/")
    if pa is not None:
        return b==pa or b.startswith(pa+"/") or fnmatch.fnmatchcase(b,a)
    if pb is not None:
        return a==pb or a.startswith(pb+"/") or fnmatch.fnmatchcase(a,b)
    return fnmatch.fnmatchcase(a,b) or fnmatch.fnmatchcase(b,a) or a==b

def _digest(v):
    return hashlib.sha256(json.dumps(v,sort_keys=True,separators=(",",":")).encode()).hexdigest()

class ActiveWorkRegistry:
    def __init__(self):
        self._leases=[]

    def acquire(self,envelope:dict,*,worker_id:str,observed_target_sha:str)->dict:
        verify_envelope(envelope)
        _require(bool(worker_id),"worker_id is required")
        _require("WORKTREE_WRITE" in envelope.get("capabilities",[]),"active mutable lease requires WORKTREE_WRITE")
        _require(observed_target_sha==envelope.get("base_sha"),"cannot activate stale authority against moved target")
        candidate={
            "worker_id":worker_id,
            "repository":envelope["repository"],
            "branch":envelope["branch"],
            "base_sha":envelope["base_sha"],
            "envelope_sha256":envelope["envelope_sha256"],
            "paths":copy.deepcopy(envelope.get("allow_paths",[])),
            "status":"ACTIVE",
        }
        for lease in self._leases:
            if lease.get("status")!="ACTIVE": continue
            if lease["repository"]!=candidate["repository"] or lease["branch"]!=candidate["branch"]: continue
            for left in lease["paths"]:
                for right in candidate["paths"]:
                    _require(not scopes_overlap(left,right),
                        f"mutable ownership collision: {worker_id}:{right} overlaps {lease['worker_id']}:{left}")
        candidate["lease_id"]="lease-"+_digest(candidate)[:20]
        self._leases.append(candidate)
        return copy.deepcopy(candidate)

    def release(self,lease_id:str)->dict:
        for lease in self._leases:
            if lease["lease_id"]==lease_id:
                _require(lease["status"]=="ACTIVE","lease is not active")
                lease["status"]="RELEASED"
                return copy.deepcopy(lease)
        raise ActiveWorkError("unknown lease")

    def active(self)->list[dict]:
        return copy.deepcopy([x for x in self._leases if x.get("status")=="ACTIVE"])

    def to_dict(self,*,key:str)->dict:
        _require(bool(key),"active-work snapshot signing key is required")
        base={"version":1,"leases":copy.deepcopy(self._leases)}
        sig=hmac.new(key.encode("utf-8"),json.dumps(base,sort_keys=True,separators=(",",":")).encode(),hashlib.sha256).hexdigest()
        return {**base,"signature_hmac_sha256":sig}

    @classmethod
    def from_dict(cls,snapshot:dict,*,key:str):
        _require(bool(key),"active-work snapshot verification key is required")
        _require(isinstance(snapshot,dict) and snapshot.get("version")==1,"unsupported active-work snapshot")
        leases=snapshot.get("leases")
        _require(isinstance(leases,list),"active-work snapshot leases must be a list")
        base={"version":1,"leases":leases}
        expected=hmac.new(key.encode("utf-8"),json.dumps(base,sort_keys=True,separators=(",",":")).encode(),hashlib.sha256).hexdigest()
        _require(hmac.compare_digest(str(snapshot.get("signature_hmac_sha256") or ""),expected),"active-work snapshot signature mismatch")
        reg=cls()
        reg._leases=copy.deepcopy(leases)
        return reg
