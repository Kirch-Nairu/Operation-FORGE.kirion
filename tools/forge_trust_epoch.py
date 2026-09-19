#!/usr/bin/env python3
"""Deterministic logical trust epochs for rotation, expiry, and revocation."""
from __future__ import annotations

class TrustEpochError(RuntimeError):
    pass

def _require(c,m):
    if not c: raise TrustEpochError(m)

class TrustEpochStore:
    def __init__(self,domain:str):
        _require(bool(domain),"trust domain is required")
        self.domain=domain
        self._issuers={}

    def register(self,issuer_id:str,*,key:str,epoch:int=1)->dict:
        _require(bool(issuer_id and key),"issuer and key are required")
        _require(isinstance(epoch,int) and epoch>=0,"epoch must be a non-negative integer")
        _require(issuer_id not in self._issuers,"issuer already registered")
        self._issuers[issuer_id]={"key":key,"epoch":epoch,"revoked":False}
        return self.current(issuer_id)

    def rotate(self,issuer_id:str,*,new_key:str,new_epoch:int)->dict:
        cur=self._issuer(issuer_id)
        _require(bool(new_key),"new key is required")
        _require(isinstance(new_epoch,int) and new_epoch>cur["epoch"],"rotation epoch must increase")
        self._issuers[issuer_id]={"key":new_key,"epoch":new_epoch,"revoked":False}
        return self.current(issuer_id)

    def revoke(self,issuer_id:str)->dict:
        cur=self._issuer(issuer_id)
        cur["revoked"]=True
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
