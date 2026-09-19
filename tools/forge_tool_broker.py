#!/usr/bin/env python3
"""Narrow-waist tool broker for Forge effect enforcement."""
from __future__ import annotations
import sys
from pathlib import Path

_TOOLS_DIR=Path(__file__).resolve().parent
if str(_TOOLS_DIR) not in sys.path:
    sys.path.insert(0,str(_TOOLS_DIR))

from forge_authority_kernel import authorize, authorize_current, verify_signed_envelope, authorize_signed_current, AuthorityError
from forge_action_approval import propose_action, ApprovalLedger, ApprovalError

class ToolBrokerError(RuntimeError):
    pass

TARGET_BOUND_CAPABILITIES={
    "WORKTREE_WRITE","LOCAL_GIT_WRITE","REMOTE_GIT_WRITE",
    "NETWORK_WRITE","DEPLOY","DESTRUCTIVE","AUTHORITY_MUTATION"
}

class ToolBroker:
    def __init__(self, *, authority_key:str|None=None, require_trusted_approval_anchor:bool=False):
        self._tools={}
        self.authority_key=authority_key
        self.require_trusted_approval_anchor=bool(require_trusted_approval_anchor)

    def register(self,name:str,*,capability:str,handler,sensitive:bool=False,path_arg:str|None=None):
        if not name or name in self._tools:
            raise ToolBrokerError("tool name must be unique and non-empty")
        if not callable(handler):
            raise ToolBrokerError("tool handler must be callable")
        self._tools[name]={"capability":capability,"handler":handler,"sensitive":bool(sensitive),"path_arg":path_arg}
        return self

    def _tool(self,name:str)->dict:
        if name not in self._tools:
            raise ToolBrokerError(f"unknown tool: {name}")
        return self._tools[name]

    def describe(self)->list[dict]:
        return [{"name":name,"capability":meta["capability"],"sensitive":meta["sensitive"],"path_arg":meta["path_arg"]} for name,meta in sorted(self._tools.items())]

    def _authorize_tool(self,meta:dict,envelope:dict,args:dict,observed_target_sha:str|None=None)->None:
        path=None
        if meta["path_arg"] is not None:
            if meta["path_arg"] not in args:
                raise ToolBrokerError(f"missing path argument: {meta['path_arg']}")
            path=args[meta["path_arg"]]
        if self.authority_key is not None:
            verify_signed_envelope(envelope,key=self.authority_key)
        if meta["capability"] in TARGET_BOUND_CAPABILITIES:
            if not observed_target_sha:
                raise ToolBrokerError("mutating tool requires observed_target_sha")
            if self.authority_key is not None:
                authorize_signed_current(envelope,meta["capability"],key=self.authority_key,current_sha=observed_target_sha,path=path)
            else:
                authorize_current(envelope,meta["capability"],current_sha=observed_target_sha,path=path)
        else:
            authorize(envelope,meta["capability"],path=path)

    def proposal_for(self,name:str,envelope:dict,args:dict,*,target_state:dict,observed_target_sha:str|None=None)->dict:
        meta=self._tool(name)
        self._authorize_tool(meta,envelope,args,observed_target_sha)
        if not meta["sensitive"]:
            raise ToolBrokerError("exact-action proposals are only required for sensitive tools")
        return propose_action(envelope,capability=meta["capability"],operation=name,parameters=args,target_state=target_state)

    def execute(self,name:str,envelope:dict,args:dict,*,target_state:dict|None=None,observed_target_sha:str|None=None,approval_token:dict|None=None,approval_key:str|None=None,approval_ledger:ApprovalLedger|None=None):
        meta=self._tool(name)
        if not isinstance(args,dict):
            raise ToolBrokerError("tool arguments must be an object")

        # Authority is evaluated before any handler code can run.
        self._authorize_tool(meta,envelope,args,observed_target_sha)

        if meta["sensitive"]:
            if approval_token is None or not approval_key or approval_ledger is None:
                raise ToolBrokerError("sensitive tool requires exact-action approval and durable consumption ledger")
            if self.require_trusted_approval_anchor and getattr(approval_ledger,"anchor",None) is None:
                raise ToolBrokerError("sensitive tool requires a trusted approval consumption anchor")
            proposal=propose_action(envelope,capability=meta["capability"],operation=name,parameters=args,target_state=target_state or {})
            # Consume immediately before attempting the side effect. If the handler
            # fails ambiguously, replaying the same approval remains prohibited.
            approval_ledger.consume(approval_token,proposal,key=approval_key)

        return meta["handler"](**args)
