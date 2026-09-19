#!/usr/bin/env python3
"""Bind authenticated actor identity to actor-scoped temporal authority."""
from __future__ import annotations
import hashlib, json
from forge_actor_identity import verify_actor_token_temporal
from forge_authority_kernel import verify_signed_envelope_temporal

class PrincipalError(RuntimeError):
    pass

def _require(c,m):
    if not c: raise PrincipalError(m)

def _sha(v):
    return hashlib.sha256(json.dumps(v,sort_keys=True,separators=(",",":")).encode()).hexdigest()

def bind_temporal_principal(*,actor_token:dict,authority_envelope:dict,identity_trust_store,authority_trust_store,current_epoch:int)->dict:
    actor=verify_actor_token_temporal(actor_token,trust_store=identity_trust_store,current_epoch=current_epoch)
    verify_signed_envelope_temporal(authority_envelope,trust_store=authority_trust_store,current_epoch=current_epoch)
    subject=authority_envelope.get("authority_subject_actor_id")
    _require(bool(subject),"authority envelope is not actor-bound")
    _require(subject==actor["actor_id"],"actor identity does not own this authority envelope")
    _require(authority_envelope.get("role")==actor["role"],"actor role does not match authority role")
    base={
        "version":1,"actor_id":actor["actor_id"],"role":actor["role"],
        "authority_envelope_sha256":authority_envelope["envelope_sha256"],
        "authority_trust_epoch":authority_envelope.get("authority_trust_epoch"),
        "current_epoch":current_epoch,
    }
    return {**base,"principal_sha256":_sha(base)}
