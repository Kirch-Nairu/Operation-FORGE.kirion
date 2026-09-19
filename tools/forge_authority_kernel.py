#!/usr/bin/env python3
"""Capability-based authority envelopes for Forge execution."""
from __future__ import annotations
import copy, fnmatch, hashlib, hmac, json

class AuthorityError(RuntimeError):
    pass

KNOWN_CAPABILITIES={
    "REPO_READ","EXTERNAL_READ","WORKTREE_WRITE","TEST_EXECUTE",
    "LOCAL_GIT_WRITE","REMOTE_GIT_WRITE","NETWORK_WRITE","SECRET_ACCESS",
    "ACCEPT","PROMOTE","DEPLOY","DESTRUCTIVE","AUTHORITY_MUTATION"
}

def _canonical(value)->bytes:
    return json.dumps(value,sort_keys=True,separators=(",",":"),ensure_ascii=False).encode("utf-8")

def _hash(base:dict)->str:
    return hashlib.sha256(_canonical(base)).hexdigest()

def _require(cond:bool,msg:str)->None:
    if not cond: raise AuthorityError(msg)

def _envelope_base(envelope:dict)->dict:
    return {
        "version":envelope.get("version"),
        "role":envelope.get("role"),
        "repository":envelope.get("repository"),
        "base_sha":envelope.get("base_sha"),
        "branch":envelope.get("branch"),
        "capabilities":envelope.get("capabilities"),
        "allow_paths":envelope.get("allow_paths"),
        "delegation_depth":envelope.get("delegation_depth"),
        "parent_envelope_sha256":envelope.get("parent_envelope_sha256"),
    }

def verify_envelope(envelope:dict)->bool:
    _require(isinstance(envelope,dict) and envelope.get("version")==1,"unsupported authority envelope")
    caps=envelope.get("capabilities")
    paths=envelope.get("allow_paths")
    _require(isinstance(caps,list) and caps==sorted(set(caps)),"authority capabilities are not canonical")
    _require(not (set(caps)-KNOWN_CAPABILITIES),"authority envelope contains unknown capability")
    _require(isinstance(paths,list) and paths==_normalize_paths(paths),"authority paths are not canonical")
    _require(isinstance(envelope.get("delegation_depth"),int) and envelope["delegation_depth"]>=0,"invalid delegation depth")
    expected=_hash(_envelope_base(envelope))
    _require(envelope.get("envelope_sha256")==expected,"authority envelope digest mismatch")
    return True

def _normalize_paths(paths):
    out=[]
    for p in paths:
        p=str(p).strip().replace("\\","/")
        _require(bool(p) and not p.startswith("/"),"allow_paths must be repository-relative")
        _require(".." not in p.split("/"),"allow_paths may not escape repository")
        if p not in out: out.append(p)
    return sorted(out)

def make_envelope(*,role:str,repository:str,base_sha:str,branch:str,capabilities:list[str],allow_paths:list[str],delegation_depth:int=0)->dict:
    _require(bool(role and repository and base_sha and branch),"role/repository/base_sha/branch are required")
    caps=sorted(set(capabilities))
    unknown=set(caps)-KNOWN_CAPABILITIES
    _require(not unknown,f"unknown capabilities: {sorted(unknown)}")
    _require(isinstance(delegation_depth,int) and delegation_depth>=0,"delegation_depth must be >= 0")
    base={
        "version":1,
        "role":role,
        "repository":repository,
        "base_sha":base_sha,
        "branch":branch,
        "capabilities":caps,
        "allow_paths":_normalize_paths(allow_paths),
        "delegation_depth":delegation_depth,
        "parent_envelope_sha256":None,
    }
    return {**base,"envelope_sha256":_hash(base)}

def _path_allowed(patterns:list[str],path:str)->bool:
    normalized=path.replace("\\","/").lstrip("./")
    if ".." in normalized.split("/"): return False
    return any(fnmatch.fnmatchcase(normalized,p) for p in patterns)

def authorize(envelope:dict,capability:str,path:str|None=None)->bool:
    verify_envelope(envelope)
    _require(capability in KNOWN_CAPABILITIES,f"unknown capability: {capability}")
    _require(capability in envelope.get("capabilities",[]),f"capability denied: {capability}")
    if capability=="WORKTREE_WRITE":
        _require(path is not None,"WORKTREE_WRITE authorization requires a path")
        _require(_path_allowed(envelope.get("allow_paths",[]),path),f"path outside authority scope: {path}")
    return True

def _pattern_subset(child:str,parent:str)->bool:
    if child==parent: return True
    if parent=="**": return True
    if parent.endswith("/**"):
        prefix=parent[:-3].rstrip("/")
        return child.startswith(prefix+"/")
    return False

def delegate(parent:dict,*,role:str,capabilities:list[str],allow_paths:list[str])->dict:
    verify_envelope(parent)
    _require(parent.get("delegation_depth",0)>0,"delegation depth exhausted")
    child_caps=set(capabilities)
    _require(child_caps.issubset(set(parent.get("capabilities",[]))),"child capabilities exceed parent authority")
    child_paths=_normalize_paths(allow_paths)
    parent_paths=parent.get("allow_paths",[])
    for child in child_paths:
        _require(any(_pattern_subset(child,p) for p in parent_paths),f"child path scope exceeds parent: {child}")
    base={
        "version":1,
        "role":role,
        "repository":parent["repository"],
        "base_sha":parent["base_sha"],
        "branch":parent["branch"],
        "capabilities":sorted(child_caps),
        "allow_paths":child_paths,
        "delegation_depth":parent["delegation_depth"]-1,
        "parent_envelope_sha256":parent["envelope_sha256"],
    }
    return {**base,"envelope_sha256":_hash(base)}


def authorize_current(envelope:dict,capability:str,*,current_sha:str,path:str|None=None)->bool:
    """Authorize an effect only against the exact observed repository head."""
    verify_envelope(envelope)
    _require(bool(current_sha),"current_sha is required for target-bound authority")
    _require(current_sha==envelope.get("base_sha"),f"target drift: observed {current_sha} != authority base {envelope.get('base_sha')}")
    return authorize(envelope,capability,path=path)


def _signed_authority_base(envelope:dict)->dict:
    return {
        "version":1,
        "authority_issuer":envelope.get("authority_issuer"),
        "envelope_sha256":envelope.get("envelope_sha256"),
    }

def sign_envelope(envelope:dict,*,issuer_id:str,key:str)->dict:
    verify_envelope(envelope)
    _require(bool(issuer_id and key),"authority issuer and signing key are required")
    signed=copy.deepcopy(envelope)
    signed["authority_issuer"]=issuer_id
    base=_signed_authority_base(signed)
    signed["authority_signature_hmac_sha256"]=hmac.new(key.encode("utf-8"),_canonical(base),hashlib.sha256).hexdigest()
    return signed

def verify_signed_envelope(envelope:dict,*,key:str)->bool:
    verify_envelope(envelope)
    _require(bool(key),"authority verification key is required")
    _require(bool(envelope.get("authority_issuer")),"signed authority issuer missing")
    actual=str(envelope.get("authority_signature_hmac_sha256") or "")
    expected=hmac.new(key.encode("utf-8"),_canonical(_signed_authority_base(envelope)),hashlib.sha256).hexdigest()
    _require(hmac.compare_digest(actual,expected),"signed authority verification failed")
    return True

def authorize_signed_current(envelope:dict,capability:str,*,key:str,current_sha:str,path:str|None=None)->bool:
    verify_signed_envelope(envelope,key=key)
    _require(current_sha==envelope.get("base_sha"),f"target drift: observed {current_sha} != authority base {envelope.get('base_sha')}")
    return authorize(envelope,capability,path=path)
