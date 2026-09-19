#!/usr/bin/env python3
from __future__ import annotations
import importlib.util, inspect, json, sys
from pathlib import Path
ROOT=Path.cwd().resolve();TOOLS=ROOT/"tools"
if str(TOOLS) not in sys.path:sys.path.insert(0,str(TOOLS))
import forge_trust_epoch as trust
import forge_authority_kernel as auth
import forge_actor_identity as identity
import forge_action_approval as approval
import forge_tool_broker as broker_mod
import forge_fresh_verifier as verifier
import forge_active_work as active

R=[]
def rec(family,i,expected,fn):
    try: fn();observed="ALLOW";detail="allowed"
    except Exception as e:observed="DENY";detail=f"{type(e).__name__}: {e}"
    R.append({"family":family,"i":i,"expected":expected,"observed":observed,"pass":expected==observed,"detail":detail})
def missing(family,n,reason):
    for i in range(n):R.append({"family":family,"i":i,"expected":"DENY","observed":"ALLOW","pass":False,"detail":"MISSING_RUNTIME_CONTRACT: "+reason})

def auth_store():
    s=trust.TrustEpochStore("authority");s.register("control",key="auth-k1",epoch=1);return s
def id_store():
    s=trust.TrustEpochStore("identity");s.register("identity",key="id-k1",epoch=1);return s
def temporal_env(store,actor=None,role="MAINTAINER",caps=None,paths=None,expires=8):
    e=auth.make_envelope(role=role,repository="R",base_sha="abc",branch="b",capabilities=caps or ["REMOTE_GIT_WRITE"],allow_paths=paths or [],delegation_depth=1)
    if actor is not None and hasattr(auth,"sign_envelope_for_actor"):
        return auth.sign_envelope_for_actor(e,actor_id=actor,issuer_id="control",trust_store=store,current_epoch=1,expires_epoch=expires)
    return auth.sign_envelope_temporal(e,issuer_id="control",trust_store=store,current_epoch=1,expires_epoch=expires)

# A Temporal exact-action approval at the actual broker boundary: 150
bsig=inspect.signature(broker_mod.ToolBroker.__init__)
if "require_temporal_approval" not in bsig.parameters or not hasattr(approval.ApprovalLedger,"consume_temporal"):
    missing("temporal_sensitive_broker_approval",150,"temporal approval not enforced by sensitive ToolBroker")
else:
    for i in range(50):
        store=auth_store();e=temporal_env(store)
        b=broker_mod.ToolBroker(authority_trust_store=store,current_epoch=2,require_temporal_approval=True,require_trusted_approval_anchor=True)
        b.register("push",capability="REMOTE_GIT_WRITE",sensitive=True,handler=lambda **kw:"pushed")
        args={"remote":"origin","branch":"b","candidate_sha":"abc"}
        p=b.proposal_for("push",e,args,target_state={"before":"x"},observed_target_sha="abc")
        t=approval.approve_action_temporal(p,approver="H",key="ap",approval_id=f"v{i}",issued_epoch=1,expires_epoch=4)
        l=approval.ApprovalLedger(anchor=approval.ApprovalConsumptionAnchor())
        rec("temporal_sensitive_broker_approval",i,"ALLOW",lambda b=b,e=e,args=args,t=t,l=l:b.execute("push",e,args,target_state={"before":"x"},observed_target_sha="abc",approval_token=t,approval_key="ap",approval_ledger=l))
    for i in range(50,100):
        store=auth_store();e=temporal_env(store)
        b=broker_mod.ToolBroker(authority_trust_store=store,current_epoch=5,require_temporal_approval=True,require_trusted_approval_anchor=True)
        b.register("push",capability="REMOTE_GIT_WRITE",sensitive=True,handler=lambda **kw:"pushed")
        args={"remote":"origin","branch":"b","candidate_sha":"abc"}
        p=b.proposal_for("push",e,args,target_state={"before":"x"},observed_target_sha="abc")
        t=approval.approve_action_temporal(p,approver="H",key="ap",approval_id=f"x{i}",issued_epoch=1,expires_epoch=3)
        l=approval.ApprovalLedger(anchor=approval.ApprovalConsumptionAnchor())
        rec("temporal_sensitive_broker_approval",i,"DENY",lambda b=b,e=e,args=args,t=t,l=l:b.execute("push",e,args,target_state={"before":"x"},observed_target_sha="abc",approval_token=t,approval_key="ap",approval_ledger=l))
    for i in range(100,150):
        store=auth_store();e=temporal_env(store)
        b=broker_mod.ToolBroker(authority_trust_store=store,current_epoch=2,require_temporal_approval=True,require_trusted_approval_anchor=True)
        b.register("push",capability="REMOTE_GIT_WRITE",sensitive=True,handler=lambda **kw:"pushed")
        args={"remote":"origin","branch":"b","candidate_sha":"abc"}
        p=b.proposal_for("push",e,args,target_state={"before":"x"},observed_target_sha="abc")
        t=approval.approve_action_temporal(p,approver="H",key="ap",approval_id=f"r{i}",issued_epoch=1,expires_epoch=4)
        l=approval.ApprovalLedger(anchor=approval.ApprovalConsumptionAnchor())
        b.execute("push",e,args,target_state={"before":"x"},observed_target_sha="abc",approval_token=t,approval_key="ap",approval_ledger=l)
        rec("temporal_sensitive_broker_approval",i,"DENY",lambda b=b,e=e,args=args,t=t,l=l:b.execute("push",e,args,target_state={"before":"x"},observed_target_sha="abc",approval_token=t,approval_key="ap",approval_ledger=l))

# B Temporal authenticated worker/verifier pairing: 150
if not all(hasattr(verifier,n) for n in ["make_verification_request_temporal_authenticated","record_verification_temporal_authenticated"]):
    missing("temporal_worker_verifier_identity",150,"temporal identity not integrated into fresh verifier")
else:
    for i in range(50):
        store=id_store()
        wt=identity.issue_actor_token_temporal(actor_id=f"w{i}",role="WRITER",issuer_id="identity",trust_store=store,current_epoch=1,expires_epoch=5)
        vt=identity.issue_actor_token_temporal(actor_id=f"v{i}",role="VERIFIER",issuer_id="identity",trust_store=store,current_epoch=1,expires_epoch=5)
        q=verifier.make_verification_request_temporal_authenticated(candidate_sha=f"c{i}",claim="x",requirement="x",procedure=["x"],worker_token=wt,identity_trust_store=store,current_epoch=2,evidence_refs=[])
        rec("temporal_worker_verifier_identity",i,"ALLOW",lambda q=q,vt=vt,store=store:verifier.record_verification_temporal_authenticated(q,verifier_token=vt,identity_trust_store=store,current_epoch=2,outcome="SUPPORTED",observed_evidence=[]))
    for i in range(50,100):
        store=id_store()
        wt=identity.issue_actor_token_temporal(actor_id=f"w{i}",role="WRITER",issuer_id="identity",trust_store=store,current_epoch=1,expires_epoch=2)
        rec("temporal_worker_verifier_identity",i,"DENY",lambda wt=wt,store=store,i=i:verifier.make_verification_request_temporal_authenticated(candidate_sha=f"c{i}",claim="x",requirement="x",procedure=["x"],worker_token=wt,identity_trust_store=store,current_epoch=3,evidence_refs=[]))
    for i in range(100,150):
        store=id_store()
        wt=identity.issue_actor_token_temporal(actor_id=f"same{i}",role="WRITER",issuer_id="identity",trust_store=store,current_epoch=1,expires_epoch=5)
        vt=identity.issue_actor_token_temporal(actor_id=f"same{i}",role="VERIFIER",issuer_id="identity",trust_store=store,current_epoch=1,expires_epoch=5)
        q=verifier.make_verification_request_temporal_authenticated(candidate_sha=f"c{i}",claim="x",requirement="x",procedure=["x"],worker_token=wt,identity_trust_store=store,current_epoch=2,evidence_refs=[])
        rec("temporal_worker_verifier_identity",i,"DENY",lambda q=q,vt=vt,store=store:verifier.record_verification_temporal_authenticated(q,verifier_token=vt,identity_trust_store=store,current_epoch=2,outcome="SUPPORTED",observed_evidence=[]))

# C Temporal signed authority at ActiveWorkRegistry: 150
asig=inspect.signature(active.ActiveWorkRegistry.__init__)
if "authority_trust_store" not in asig.parameters or "current_epoch" not in asig.parameters:
    missing("temporal_active_work_authority",150,"temporal authority not enforced by ActiveWorkRegistry")
else:
    for i in range(50):
        store=auth_store();e=temporal_env(store,role="WRITER",caps=["WORKTREE_WRITE"],paths=["src/**"])
        reg=active.ActiveWorkRegistry(authority_trust_store=store,current_epoch=2)
        rec("temporal_active_work_authority",i,"ALLOW",lambda reg=reg,e=e,i=i:reg.acquire(e,worker_id=f"w{i}",observed_target_sha="abc"))
    for i in range(50,100):
        store=auth_store();e=temporal_env(store,role="WRITER",caps=["WORKTREE_WRITE"],paths=["src/**"],expires=2)
        reg=active.ActiveWorkRegistry(authority_trust_store=store,current_epoch=3)
        rec("temporal_active_work_authority",i,"DENY",lambda reg=reg,e=e,i=i:reg.acquire(e,worker_id=f"w{i}",observed_target_sha="abc"))
    for i in range(100,150):
        store=auth_store();e=temporal_env(store,role="WRITER",caps=["WORKTREE_WRITE"],paths=["src/**"],expires=9)
        store.rotate("control",new_key="auth-k2",new_epoch=2)
        reg=active.ActiveWorkRegistry(authority_trust_store=store,current_epoch=2)
        rec("temporal_active_work_authority",i,"DENY",lambda reg=reg,e=e,i=i:reg.acquire(e,worker_id=f"w{i}",observed_target_sha="abc"))

# D Actor-bound authority principal: 150
principal_path=TOOLS/"forge_execution_principal.py"
if not principal_path.exists() or not hasattr(auth,"sign_envelope_for_actor"):
    missing("actor_bound_authority_principal",150,"actor-bound authority principal contract absent")
else:
    spec=importlib.util.spec_from_file_location("forge_execution_principal",principal_path)
    principal=importlib.util.module_from_spec(spec);spec.loader.exec_module(principal)
    if not hasattr(principal,"bind_temporal_principal"):
        missing("actor_bound_authority_principal",150,"bind_temporal_principal absent")
    else:
        for i in range(50):
            ast=auth_store();ist=id_store()
            at=identity.issue_actor_token_temporal(actor_id=f"a{i}",role="WRITER",issuer_id="identity",trust_store=ist,current_epoch=1,expires_epoch=5)
            ae=temporal_env(ast,actor=f"a{i}",role="WRITER",caps=["WORKTREE_WRITE"],paths=["src/**"])
            rec("actor_bound_authority_principal",i,"ALLOW",lambda at=at,ae=ae,ast=ast,ist=ist:principal.bind_temporal_principal(actor_token=at,authority_envelope=ae,identity_trust_store=ist,authority_trust_store=ast,current_epoch=2))
        for i in range(50,100):
            ast=auth_store();ist=id_store()
            at=identity.issue_actor_token_temporal(actor_id=f"actor{i}",role="WRITER",issuer_id="identity",trust_store=ist,current_epoch=1,expires_epoch=5)
            ae=temporal_env(ast,actor=f"other{i}",role="WRITER",caps=["WORKTREE_WRITE"],paths=["src/**"])
            rec("actor_bound_authority_principal",i,"DENY",lambda at=at,ae=ae,ast=ast,ist=ist:principal.bind_temporal_principal(actor_token=at,authority_envelope=ae,identity_trust_store=ist,authority_trust_store=ast,current_epoch=2))
        for i in range(100,150):
            ast=auth_store();ist=id_store()
            at=identity.issue_actor_token_temporal(actor_id=f"a{i}",role="REVIEWER",issuer_id="identity",trust_store=ist,current_epoch=1,expires_epoch=5)
            ae=temporal_env(ast,actor=f"a{i}",role="WRITER",caps=["WORKTREE_WRITE"],paths=["src/**"])
            rec("actor_bound_authority_principal",i,"DENY",lambda at=at,ae=ae,ast=ast,ist=ist:principal.bind_temporal_principal(actor_token=at,authority_envelope=ae,identity_trust_store=ist,authority_trust_store=ast,current_epoch=2))

bad=[x for x in R if not x["pass"]];fams={}
for x in R:
    z=fams.setdefault(x["family"],{"pass":0,"fail":0});z["pass" if x["pass"] else "fail"]+=1
summary={"test":"TEST3","generation":6,"level":11,"total":len(R),"passed":len(R)-len(bad),"failed":len(bad),"families":fams,"verdict":"GREEN" if not bad else "RED"}
print(json.dumps(summary,indent=2))
if bad:
    print("FAILURE EXEMPLARS");seen=set()
    for x in bad:
        if x["family"] in seen:continue
        seen.add(x["family"]);print(json.dumps(x,sort_keys=True))
raise SystemExit(1 if bad else 0)
