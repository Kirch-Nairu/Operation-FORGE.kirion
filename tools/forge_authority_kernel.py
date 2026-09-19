#!/usr/bin/env python3
"""Capability-based authority envelopes for Forge execution."""
from __future__ import annotations
import copy, fnmatch, hashlib, json

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
