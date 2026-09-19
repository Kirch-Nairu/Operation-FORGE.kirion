#!/usr/bin/env python3
from __future__ import annotations
import copy, importlib.util, inspect, json, sys
from pathlib import Path

ROOT=Path.cwd().resolve(); TOOLS=ROOT/"tools"
if str(TOOLS) not in sys.path: sys.path.insert(0,str(TOOLS))
import forge_authority_kernel as auth
import forge_actor_identity as identity
import forge_action_approval as approval
import forge_active_work as active
import forge_tool_broker as broker_mod

R=[]
def rec(family,i,expected,fn):
    try: fn(); observed="ALLOW"; detail="allowed"
    except Exception as e: observed="DENY"; detail=f"{type(e).__name__}: {e}"
    R.append({"family":family,"i":i,"expected":expected,"observed":observed,"pass":expected==observed,"detail":detail})
def missing(family,n,reason):
    for i in range(n):
        R.append({"family":family,"i":i,"expected":"DENY","observed":"ALLOW","pass":False,"detail":"MISSING_RUNTIME_CONTRACT: "+reason})

trust_path=TOOLS/"forge_trust_epoch.py"
if trust_path.exists():
    spec=importlib.util.spec_from_file_location("forge_trust_epoch",trust_path)
    trust=importlib.util.module_from_spec(spec); spec.loader.exec_module(trust)
else:
    trust=None

# A — authority rotation / expiry: 100
if trust is None or not hasattr(trust,"TrustEpochStore") or not all(hasattr(auth,n) for n in ["sign_envelope_temporal","verify_signed_envelope_temporal"]):
    missing("authority_epoch_rotation_expiry",100,"temporal authority trust contract absent")
else:
    for i in range(25):
        store=trust.TrustEpochStore("authority");store.register("control",key="k1",epoch=1)
        e=auth.make_envelope(role="M",repository="R",base_sha="abc",branch="b",capabilities=["REPO_READ"],allow_paths=["src/**"],delegation_depth=0)
        s=auth.sign_envelope_temporal(e,issuer_id="control",trust_store=store,current_epoch=1,expires_epoch=5)
        rec("authority_epoch_rotation_expiry",i,"ALLOW",lambda s=s,store=store:auth.verify_signed_envelope_temporal(s,trust_store=store,current_epoch=1))
    for i in range(25,50):
        store=trust.TrustEpochStore("authority");store.register("control",key="k1",epoch=1)
        e=auth.make_envelope(role="M",repository="R",base_sha="abc",branch="b",capabilities=["REPO_READ"],allow_paths=["src/**"],delegation_depth=0)
        s=auth.sign_envelope_temporal(e,issuer_id="control",trust_store=store,current_epoch=1,expires_epoch=3)
        rec("authority_epoch_rotation_expiry",i,"DENY",lambda s=s,store=store:auth.verify_signed_envelope_temporal(s,trust_store=store,current_epoch=4))
    for i in range(50,75):
        store=trust.TrustEpochStore("authority");store.register("control",key="k1",epoch=1)
        e=auth.make_envelope(role="M",repository="R",base_sha="abc",branch="b",capabilities=["REPO_READ"],allow_paths=["src/**"],delegation_depth=0)
        s=auth.sign_envelope_temporal(e,issuer_id="control",trust_store=store,current_epoch=1,expires_epoch=9)
        store.rotate("control",new_key="k2",new_epoch=2)
        rec("authority_epoch_rotation_expiry",i,"DENY",lambda s=s,store=store:auth.verify_signed_envelope_temporal(s,trust_store=store,current_epoch=2))
    for i in range(75,100):
        store=trust.TrustEpochStore("authority");store.register("control",key="k1",epoch=1);store.rotate("control",new_key="k2",new_epoch=2)
        e=auth.make_envelope(role="M",repository="R",base_sha="abc",branch="b",capabilities=["REPO_READ"],allow_paths=["src/**"],delegation_depth=0)
        s=auth.sign_envelope_temporal(e,issuer_id="control",trust_store=store,current_epoch=2,expires_epoch=9)
        rec("authority_epoch_rotation_expiry",i,"ALLOW",lambda s=s,store=store:auth.verify_signed_envelope_temporal(s,trust_store=store,current_epoch=2))

# B — actor identity rotation / expiry: 100
if trust is None or not all(hasattr(identity,n) for n in ["issue_actor_token_temporal","verify_actor_token_temporal"]):
    missing("actor_identity_epoch_rotation_expiry",100,"temporal actor identity contract absent")
else:
    for i in range(25):
        store=trust.TrustEpochStore("identity");store.register("identity",key="id1",epoch=1)
        t=identity.issue_actor_token_temporal(actor_id=f"a{i}",role="WRITER",issuer_id="identity",trust_store=store,current_epoch=1,expires_epoch=4)
        rec("actor_identity_epoch_rotation_expiry",i,"ALLOW",lambda t=t,store=store:identity.verify_actor_token_temporal(t,trust_store=store,current_epoch=2,required_role="WRITER"))
    for i in range(25,50):
        store=trust.TrustEpochStore("identity");store.register("identity",key="id1",epoch=1)
        t=identity.issue_actor_token_temporal(actor_id=f"a{i}",role="WRITER",issuer_id="identity",trust_store=store,current_epoch=1,expires_epoch=2)
        rec("actor_identity_epoch_rotation_expiry",i,"DENY",lambda t=t,store=store:identity.verify_actor_token_temporal(t,trust_store=store,current_epoch=3,required_role="WRITER"))
    for i in range(50,75):
        store=trust.TrustEpochStore("identity");store.register("identity",key="id1",epoch=1)
        t=identity.issue_actor_token_temporal(actor_id=f"a{i}",role="WRITER",issuer_id="identity",trust_store=store,current_epoch=1,expires_epoch=9)
        store.rotate("identity",new_key="id2",new_epoch=2)
        rec("actor_identity_epoch_rotation_expiry",i,"DENY",lambda t=t,store=store:identity.verify_actor_token_temporal(t,trust_store=store,current_epoch=2,required_role="WRITER"))
    for i in range(75,100):
        store=trust.TrustEpochStore("identity");store.register("identity",key="id1",epoch=1);store.rotate("identity",new_key="id2",new_epoch=2)
        t=identity.issue_actor_token_temporal(actor_id=f"a{i}",role="WRITER",issuer_id="identity",trust_store=store,current_epoch=2,expires_epoch=9)
        rec("actor_identity_epoch_rotation_expiry",i,"ALLOW",lambda t=t,store=store:identity.verify_actor_token_temporal(t,trust_store=store,current_epoch=2,required_role="WRITER"))

# C — temporal exact-action approvals: 100
if not all(hasattr(approval,n) for n in ["approve_action_temporal","verify_approval_temporal"]):
    missing("approval_expiry_rotation",100,"temporal approval contract absent")
else:
    def proposal(i):
        e=auth.make_envelope(role="M",repository="R",base_sha="abc",branch="b",capabilities=["REMOTE_GIT_WRITE"],allow_paths=[],delegation_depth=0)
        return approval.propose_action(e,capability="REMOTE_GIT_WRITE",operation="push",parameters={"i":i},target_state={"before":"x"})
    for i in range(25):
        p=proposal(i);t=approval.approve_action_temporal(p,approver="H",key="ap1",approval_id=f"a{i}",issued_epoch=1,expires_epoch=4)
        rec("approval_expiry_rotation",i,"ALLOW",lambda p=p,t=t:approval.verify_approval_temporal(t,p,key="ap1",current_epoch=2))
    for i in range(25,50):
        p=proposal(i);t=approval.approve_action_temporal(p,approver="H",key="ap1",approval_id=f"a{i}",issued_epoch=1,expires_epoch=2)
        rec("approval_expiry_rotation",i,"DENY",lambda p=p,t=t:approval.verify_approval_temporal(t,p,key="ap1",current_epoch=3))
    for i in range(50,75):
        p=proposal(i);t=approval.approve_action_temporal(p,approver="H",key="ap1",approval_id=f"a{i}",issued_epoch=1,expires_epoch=9)
        rec("approval_expiry_rotation",i,"DENY",lambda p=p,t=t:approval.verify_approval_temporal(t,p,key="ap2",current_epoch=2))
    for i in range(75,100):
        p=proposal(i);t=approval.approve_action_temporal(p,approver="H",key="ap1",approval_id=f"a{i}",issued_epoch=1,expires_epoch=9)
        p2=copy.deepcopy(p);p2["parameters"]={"i":"changed"}
        rec("approval_expiry_rotation",i,"DENY",lambda p2=p2,t=t:approval.verify_approval_temporal(t,p2,key="ap1",current_epoch=2))

# D — active lease expiry: 100
acq=inspect.signature(active.ActiveWorkRegistry.acquire)
if "current_epoch" not in acq.parameters or "ttl_epochs" not in acq.parameters or not hasattr(active.ActiveWorkRegistry,"prune_expired"):
    missing("active_lease_expiry",100,"lease expiry contract absent")
else:
    for i in range(50):
        p=auth.make_envelope(role="M",repository="R",base_sha="abc",branch="b",capabilities=["WORKTREE_WRITE"],allow_paths=["src/**"],delegation_depth=1)
        a=auth.delegate(p,role="A",capabilities=["WORKTREE_WRITE"],allow_paths=["src/m/**"])
        b=auth.delegate(p,role="B",capabilities=["WORKTREE_WRITE"],allow_paths=["src/m/**"])
        reg=active.ActiveWorkRegistry();reg.acquire(a,worker_id=f"a{i}",observed_target_sha="abc",current_epoch=1,ttl_epochs=3)
        rec("active_lease_expiry",i,"DENY",lambda reg=reg,b=b,i=i:reg.acquire(b,worker_id=f"b{i}",observed_target_sha="abc",current_epoch=2,ttl_epochs=3))
    for i in range(50,100):
        p=auth.make_envelope(role="M",repository="R",base_sha="abc",branch="b",capabilities=["WORKTREE_WRITE"],allow_paths=["src/**"],delegation_depth=1)
        a=auth.delegate(p,role="A",capabilities=["WORKTREE_WRITE"],allow_paths=["src/m/**"])
        b=auth.delegate(p,role="B",capabilities=["WORKTREE_WRITE"],allow_paths=["src/m/**"])
        reg=active.ActiveWorkRegistry();reg.acquire(a,worker_id=f"a{i}",observed_target_sha="abc",current_epoch=1,ttl_epochs=2)
        reg.prune_expired(current_epoch=4)
        rec("active_lease_expiry",i,"ALLOW",lambda reg=reg,b=b,i=i:reg.acquire(b,worker_id=f"b{i}",observed_target_sha="abc",current_epoch=4,ttl_epochs=2))

# E — temporal authority enforced by broker: 100
broker_sig=inspect.signature(broker_mod.ToolBroker.__init__)
if trust is None or "authority_trust_store" not in broker_sig.parameters or "current_epoch" not in broker_sig.parameters:
    missing("broker_temporal_authority",100,"temporal broker trust integration absent")
else:
    def mk_broker(store,epoch):
        b=broker_mod.ToolBroker(authority_trust_store=store,current_epoch=epoch)
        b.register("write",capability="WORKTREE_WRITE",path_arg="path",handler=lambda **kw:"ok")
        return b
    for i in range(25):
        store=trust.TrustEpochStore("authority");store.register("control",key="k1",epoch=1)
        e=auth.make_envelope(role="M",repository="R",base_sha="abc",branch="b",capabilities=["WORKTREE_WRITE"],allow_paths=["src/**"],delegation_depth=0)
        s=auth.sign_envelope_temporal(e,issuer_id="control",trust_store=store,current_epoch=1,expires_epoch=5)
        rec("broker_temporal_authority",i,"ALLOW",lambda s=s,store=store:mk_broker(store,2).execute("write",s,{"path":"src/x","content":"x"},observed_target_sha="abc"))
    for i in range(25,50):
        store=trust.TrustEpochStore("authority");store.register("control",key="k1",epoch=1)
        e=auth.make_envelope(role="M",repository="R",base_sha="abc",branch="b",capabilities=["WORKTREE_WRITE"],allow_paths=["src/**"],delegation_depth=0)
        s=auth.sign_envelope_temporal(e,issuer_id="control",trust_store=store,current_epoch=1,expires_epoch=2)
        rec("broker_temporal_authority",i,"DENY",lambda s=s,store=store:mk_broker(store,3).execute("write",s,{"path":"src/x","content":"x"},observed_target_sha="abc"))
    for i in range(50,75):
        store=trust.TrustEpochStore("authority");store.register("control",key="k1",epoch=1)
        e=auth.make_envelope(role="M",repository="R",base_sha="abc",branch="b",capabilities=["WORKTREE_WRITE"],allow_paths=["src/**"],delegation_depth=0)
        s=auth.sign_envelope_temporal(e,issuer_id="control",trust_store=store,current_epoch=1,expires_epoch=9)
        store.rotate("control",new_key="k2",new_epoch=2)
        rec("broker_temporal_authority",i,"DENY",lambda s=s,store=store:mk_broker(store,2).execute("write",s,{"path":"src/x","content":"x"},observed_target_sha="abc"))
    for i in range(75,100):
        store=trust.TrustEpochStore("authority");store.register("control",key="k1",epoch=1);store.rotate("control",new_key="k2",new_epoch=2)
        e=auth.make_envelope(role="M",repository="R",base_sha="abc",branch="b",capabilities=["WORKTREE_WRITE"],allow_paths=["src/**"],delegation_depth=0)
        s=auth.sign_envelope_temporal(e,issuer_id="control",trust_store=store,current_epoch=2,expires_epoch=9)
        rec("broker_temporal_authority",i,"ALLOW",lambda s=s,store=store:mk_broker(store,2).execute("write",s,{"path":"src/x","content":"x"},observed_target_sha="abc"))

bad=[x for x in R if not x["pass"]]; fams={}
for x in R:
    z=fams.setdefault(x["family"],{"pass":0,"fail":0}); z["pass" if x["pass"] else "fail"]+=1
summary={"test":"TEST3","generation":4,"level":9,"total":len(R),"passed":len(R)-len(bad),"failed":len(bad),"families":fams,"verdict":"GREEN" if not bad else "RED"}
print(json.dumps(summary,indent=2))
if bad:
    print("FAILURE EXEMPLARS"); seen=set()
    for x in bad:
        if x["family"] in seen: continue
        seen.add(x["family"]); print(json.dumps(x,sort_keys=True))
raise SystemExit(1 if bad else 0)
