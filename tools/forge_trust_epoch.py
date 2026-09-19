#!/usr/bin/env python3
"""Deterministic logical trust epochs for rotation, expiry, and revocation."""
from __future__ import annotations
import copy, hashlib, hmac, json, secrets

class TrustEpochError(RuntimeError):
    pass

def _require(c,m):
    if not c: raise TrustEpochError(m)

class TrustEpochStore:
    def __init__(self,domain:str,*,monotonic_anchor=None,store_id:str|None=None,generation:int=0,_restoring:bool=False):
        _require(bool(domain),"trust domain is required")
        self.domain=domain
        self.monotonic_anchor=monotonic_anchor
        self.store_id=store_id or secrets.token_hex(16)
        self.generation=int(generation)
        _require(self.generation>=0,"trust-store generation must be non-negative")
        self._issuers={}
        if self.monotonic_anchor is not None:
            self.monotonic_anchor.require_current("trust_store",self.store_id,self.generation)

    def register(self,issuer_id:str,*,key:str,epoch:int=1)->dict:
        _require(bool(issuer_id and key),"issuer and key are required")
        _require(isinstance(epoch,int) and epoch>=0,"epoch must be a non-negative integer")
        _require(issuer_id not in self._issuers,"issuer already registered")
        self._issuers[issuer_id]={"key":key,"epoch":epoch,"revoked":False}
        self._changed()
        return self.current(issuer_id)

    def rotate(self,issuer_id:str,*,new_key:str,new_epoch:int)->dict:
        cur=self._issuer(issuer_id)
        _require(bool(new_key),"new key is required")
        _require(isinstance(new_epoch,int) and new_epoch>cur["epoch"],"rotation epoch must increase")
        self._issuers[issuer_id]={"key":new_key,"epoch":new_epoch,"revoked":False}
        self._changed()
        return self.current(issuer_id)

    def revoke(self,issuer_id:str)->dict:
        cur=self._issuer(issuer_id)
        cur["revoked"]=True
        self._changed()
        return self.current(issuer_id)

    def current(self,issuer_id:str)->dict:
        return dict(self._issuer(issuer_id))

    def _issuer(self,issuer_id:str)->dict:
        _require(issuer_id in self._issuers,f"unknown trust issuer: {issuer_id}")
        return self._issuers[issuer_id]

    def signing_key(self,issuer_id:str,*,epoch:int)->str:
        cur=self._issuer(issuer_id)
        _require(not cur["revoked"],f"trust issuer revoked: {issuer_id}")
        _require(epoch==cur["epoch"],f"stale trust epoch {epoch}; current is {cur['epoch']}")
        return cur["key"]

    def verification_key(self,issuer_id:str,*,token_epoch:int,current_epoch:int,expires_epoch:int)->str:
        cur=self._issuer(issuer_id)
        _require(not cur["revoked"],f"trust issuer revoked: {issuer_id}")
        _require(isinstance(current_epoch,int) and isinstance(expires_epoch,int),"logical epochs must be integers")
        _require(token_epoch==cur["epoch"],f"token trust epoch {token_epoch} is not current issuer epoch {cur['epoch']}")
        _require(current_epoch>=token_epoch,"current epoch predates token epoch")
        _require(current_epoch<=expires_epoch,f"token expired at epoch {expires_epoch}; current is {current_epoch}")
        return cur["key"]


    def _changed(self)->None:
        self.generation+=1
        if self.monotonic_anchor is not None:
            self.monotonic_anchor.observe("trust_store",self.store_id,self.generation)

    def to_dict(self,*,key:str)->dict:
        _require(bool(key),"trust-store snapshot key is required")
        base={"version":1,"domain":self.domain,"store_id":self.store_id,"generation":self.generation,"issuers":copy.deepcopy(self._issuers)}
        sig=hmac.new(key.encode("utf-8"),json.dumps(base,sort_keys=True,separators=(",",":")).encode(),hashlib.sha256).hexdigest()
        return {**base,"signature_hmac_sha256":sig}

    @classmethod
    def from_dict(cls,snapshot:dict,*,key:str,monotonic_anchor=None):
        _require(bool(key),"trust-store snapshot verification key is required")
        _require(isinstance(snapshot,dict) and snapshot.get("version")==1,"unsupported trust-store snapshot")
        base={k:snapshot.get(k) for k in ["version","domain","store_id","generation","issuers"]}
        expected=hmac.new(key.encode("utf-8"),json.dumps(base,sort_keys=True,separators=(",",":")).encode(),hashlib.sha256).hexdigest()
        _require(hmac.compare_digest(str(snapshot.get("signature_hmac_sha256") or ""),expected),"trust-store snapshot signature mismatch")
        _require(isinstance(base["issuers"],dict),"trust-store issuers must be an object")
        store=cls(base["domain"],monotonic_anchor=monotonic_anchor,store_id=base["store_id"],generation=base["generation"],_restoring=True)
        store._issuers=copy.deepcopy(base["issuers"])
        return store
