#!/usr/bin/env python3
"""Trusted monotonic high-water state for rollback detection."""
from __future__ import annotations

class MonotonicAnchorError(RuntimeError):
    pass

def _require(c,m):
    if not c: raise MonotonicAnchorError(m)

class MonotonicAnchor:
    def __init__(self):
        self._high_water={}

    def current(self,namespace:str,object_id:str)->int|None:
        return self._high_water.get((str(namespace),str(object_id)))

    def observe(self,namespace:str,object_id:str,generation:int)->int:
        _require(bool(namespace and object_id),"namespace and object_id are required")
        _require(isinstance(generation,int) and generation>=0,"generation must be a non-negative integer")
        key=(str(namespace),str(object_id));cur=self._high_water.get(key)
        _require(cur is None or generation>=cur,f"rollback detected for {namespace}/{object_id}: {generation} < trusted {cur}")
        self._high_water[key]=generation if cur is None else max(cur,generation)
        return self._high_water[key]

    def next(self,namespace:str,object_id:str)->int:
        cur=self.current(namespace,object_id)
        nxt=0 if cur is None else cur+1
        self.observe(namespace,object_id,nxt)
        return nxt

    def require_current(self,namespace:str,object_id:str,generation:int)->bool:
        self.observe(namespace,object_id,generation)
        return True
