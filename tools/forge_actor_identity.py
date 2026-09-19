#!/usr/bin/env python3
"""HMAC-authenticated runtime actor identities for role-sensitive Forge operations."""
from __future__ import annotations
import hashlib, hmac, json

class IdentityError(RuntimeError):
    pass

def _require(c,m):
    if not c: raise IdentityError(m)

def _canonical(v):
    return json.dumps(v,sort_keys=True,separators=(",",":"),ensure_ascii=False).encode("utf-8")

def issue_actor_token(*,actor_id:str,role:str,key:str)->dict:
    _require(bool(actor_id and role and key),"actor_id, role, and identity key are required")
    base={"version":1,"actor_id":actor_id,"role":role}
    sig=hmac.new(key.encode("utf-8"),_canonical(base),hashlib.sha256).hexdigest()
    return {**base,"signature_hmac_sha256":sig}

def verify_actor_token(token:dict,*,key:str,required_role:str|None=None)->dict:
    _require(bool(key),"identity verification key is required")
    _require(isinstance(token,dict) and token.get("version")==1,"unsupported actor token")
    base={"version":1,"actor_id":token.get("actor_id"),"role":token.get("role")}
    _require(bool(base["actor_id"] and base["role"]),"actor token identity incomplete")
    expected=hmac.new(key.encode("utf-8"),_canonical(base),hashlib.sha256).hexdigest()
    _require(hmac.compare_digest(str(token.get("signature_hmac_sha256") or ""),expected),"actor identity signature mismatch")
    if required_role is not None:
        _require(base["role"]==required_role,f"actor role {base['role']} does not satisfy {required_role}")
    return base


def _temporal_actor_base(token:dict)->dict:
    return {
        "version":2,
        "actor_id":token.get("actor_id"),
        "role":token.get("role"),
        "identity_issuer":token.get("identity_issuer"),
        "identity_trust_epoch":token.get("identity_trust_epoch"),
        "identity_expires_epoch":token.get("identity_expires_epoch"),
    }

def issue_actor_token_temporal(*,actor_id:str,role:str,issuer_id:str,trust_store,current_epoch:int,expires_epoch:int)->dict:
    _require(bool(actor_id and role and issuer_id),"actor, role, and issuer are required")
    _require(isinstance(current_epoch,int) and isinstance(expires_epoch,int) and expires_epoch>=current_epoch,"invalid identity epochs")
    key=trust_store.signing_key(issuer_id,epoch=current_epoch)
    base={"version":2,"actor_id":actor_id,"role":role,"identity_issuer":issuer_id,"identity_trust_epoch":current_epoch,"identity_expires_epoch":expires_epoch}
    sig=hmac.new(key.encode("utf-8"),_canonical(base),hashlib.sha256).hexdigest()
    return {**base,"signature_hmac_sha256":sig}

def verify_actor_token_temporal(token:dict,*,trust_store,current_epoch:int,required_role:str|None=None)->dict:
    _require(isinstance(token,dict) and token.get("version")==2,"unsupported temporal actor token")
    base=_temporal_actor_base(token)
    _require(bool(base["actor_id"] and base["role"] and base["identity_issuer"]),"temporal actor identity incomplete")
    key=trust_store.verification_key(base["identity_issuer"],token_epoch=base["identity_trust_epoch"],current_epoch=current_epoch,expires_epoch=base["identity_expires_epoch"])
    expected=hmac.new(key.encode("utf-8"),_canonical(base),hashlib.sha256).hexdigest()
    _require(hmac.compare_digest(str(token.get("signature_hmac_sha256") or ""),expected),"temporal actor identity signature mismatch")
    if required_role is not None:
        _require(base["role"]==required_role,f"actor role {base['role']} does not satisfy {required_role}")
    return base
