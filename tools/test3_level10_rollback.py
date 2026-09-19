#!/usr/bin/env python3
from __future__ import annotations
import importlib.util, inspect, json, sys
from pathlib import Path
ROOT=Path.cwd().resolve();TOOLS=ROOT/"tools"
if str(TOOLS) not in sys.path:sys.path.insert(0,str(TOOLS))
import forge_trust_epoch as trust
import forge_action_approval as approval
import forge_active_work as active
import forge_authority_kernel as auth
import forge_execution_machine as execm

R=[]
def rec(family,i,expected,fn):
    try: fn();observed="ALLOW";detail="allowed"
    except Exception as e:observed="DENY";detail=f"{type(e).__name__}: {e}"
    R.append({"family":family,"i":i,"expected":expected,"observed":observed,"pass":expected==observed,"detail":detail})
def missing(family,n,reason):
    for i in range(n):R.append({"family":family,"i":i,"expected":"DENY","observed":"ALLOW","pass":False,"detail":"MISSING_RUNTIME_CONTRACT: "+reason})

mono_path=TOOLS/"forge_monotonic_anchor.py"
if mono_path.exists():
    spec=importlib.util.spec_from_file_location("forge_monotonic_anchor",mono_path)
    mono=importlib.util.module_from_spec(spec);spec.loader.exec_module(mono)
else: mono=None

# A trust store rollback: 150
trust_init=inspect.signature(trust.TrustEpochStore.__init__)
if mono is None or not hasattr(mono,"MonotonicAnchor") or "monotonic_anchor" not in trust_init.parameters or not all(hasattr(trust.TrustEpochStore,n) for n in ["to_dict","from_dict"]):
    missing("authentic_trust_store_rollback",150,"monotonic trust-store persistence absent")
else:
    for i in range(100):
        m=mono.MonotonicAnchor();s=trust.TrustEpochStore("authority",monotonic_anchor=m)
        s.register("control",key="k1",epoch=1);old=s.to_dict(key="state-secret")
        s.rotate("control",new_key="k2",new_epoch=2)
        rec("authentic_trust_store_rollback",i,"DENY",lambda old=old,m=m:trust.TrustEpochStore.from_dict(old,key="state-secret",monotonic_anchor=m))
    for i in range(100,150):
        m=mono.MonotonicAnchor();s=trust.TrustEpochStore("authority",monotonic_anchor=m)
        s.register("control",key="k1",epoch=1);s.rotate("control",new_key="k2",new_epoch=2);latest=s.to_dict(key="state-secret")
        rec("authentic_trust_store_rollback",i,"ALLOW",lambda latest=latest,m=m:trust.TrustEpochStore.from_dict(latest,key="state-secret",monotonic_anchor=m))

# B approval consumption anchor rollback: 150
aa_sig=inspect.signature(approval.ApprovalConsumptionAnchor.__init__)
if mono is None or "monotonic_anchor" not in aa_sig.parameters:
    missing("authentic_approval_anchor_rollback",150,"monotonic approval-anchor persistence absent")
else:
    for i in range(100):
        m=mono.MonotonicAnchor();a=approval.ApprovalConsumptionAnchor(monotonic_anchor=m)
        old=a.to_dict(key="state-secret");a.consume(f"a{i}",f"h{i}")
        rec("authentic_approval_anchor_rollback",i,"DENY",lambda old=old,m=m:approval.ApprovalConsumptionAnchor.from_dict(old,key="state-secret",monotonic_anchor=m))
    for i in range(100,150):
        m=mono.MonotonicAnchor();a=approval.ApprovalConsumptionAnchor(monotonic_anchor=m)
        a.consume(f"a{i}",f"h{i}");latest=a.to_dict(key="state-secret")
        rec("authentic_approval_anchor_rollback",i,"ALLOW",lambda latest=latest,m=m:approval.ApprovalConsumptionAnchor.from_dict(latest,key="state-secret",monotonic_anchor=m))

# C active work rollback: 150
aw_sig=inspect.signature(active.ActiveWorkRegistry.__init__)
if mono is None or "monotonic_anchor" not in aw_sig.parameters:
    missing("authentic_active_work_rollback",150,"monotonic active-work persistence absent")
else:
    for i in range(100):
        m=mono.MonotonicAnchor();reg=active.ActiveWorkRegistry(monotonic_anchor=m)
        old=reg.to_dict(key="state-secret")
        e=auth.make_envelope(role="W",repository="R",base_sha="abc",branch="b",capabilities=["WORKTREE_WRITE"],allow_paths=["src/**"],delegation_depth=0)
        reg.acquire(e,worker_id=f"w{i}",observed_target_sha="abc")
        rec("authentic_active_work_rollback",i,"DENY",lambda old=old,m=m:active.ActiveWorkRegistry.from_dict(old,key="state-secret",monotonic_anchor=m))
    for i in range(100,150):
        m=mono.MonotonicAnchor();reg=active.ActiveWorkRegistry(monotonic_anchor=m)
        e=auth.make_envelope(role="W",repository="R",base_sha="abc",branch="b",capabilities=["WORKTREE_WRITE"],allow_paths=["src/**"],delegation_depth=0)
        reg.acquire(e,worker_id=f"w{i}",observed_target_sha="abc");latest=reg.to_dict(key="state-secret")
        rec("authentic_active_work_rollback",i,"ALLOW",lambda latest=latest,m=m:active.ActiveWorkRegistry.from_dict(latest,key="state-secret",monotonic_anchor=m))

# D execution checkpoint rollback: 150
if mono is None or not all(hasattr(execm,n) for n in ["seal_checkpoint_monotonic","resume_checkpoint_monotonic"]):
    missing("authentic_execution_checkpoint_rollback",150,"monotonic execution checkpoint contract absent")
else:
    def waiting(i):
        s=execm.new_execution(role="QA",branch="b",head_sha="abc")
        s=execm.transition(s,"BEGIN_MEDIUM",{})
        return execm.transition(s,"EXTERNAL_RUN_OBSERVED",{"run_id":str(i),"expected_head":"abc","checkpoint_persisted":True})
    for i in range(100):
        m=mono.MonotonicAnchor();s=waiting(i)
        old=execm.seal_checkpoint_monotonic(s,key="checkpoint-secret",monotonic_anchor=m,stream_id=f"exec-{i}")
        progressed=execm.resume_checkpoint_monotonic(old,{"run_id":str(i),"head_sha":"abc","status":"completed","conclusion":"success"},key="checkpoint-secret",monotonic_anchor=m)
        execm.seal_checkpoint_monotonic(progressed,key="checkpoint-secret",monotonic_anchor=m,stream_id=f"exec-{i}")
        rec("authentic_execution_checkpoint_rollback",i,"DENY",lambda old=old,m=m,i=i:execm.resume_checkpoint_monotonic(old,{"run_id":str(i),"head_sha":"abc","status":"completed","conclusion":"success"},key="checkpoint-secret",monotonic_anchor=m))
    for i in range(100,150):
        m=mono.MonotonicAnchor();s=waiting(i)
        latest=execm.seal_checkpoint_monotonic(s,key="checkpoint-secret",monotonic_anchor=m,stream_id=f"exec-{i}")
        rec("authentic_execution_checkpoint_rollback",i,"ALLOW",lambda latest=latest,m=m,i=i:execm.resume_checkpoint_monotonic(latest,{"run_id":str(i),"head_sha":"abc","status":"completed","conclusion":"success"},key="checkpoint-secret",monotonic_anchor=m))

bad=[x for x in R if not x["pass"]];fams={}
for x in R:
    z=fams.setdefault(x["family"],{"pass":0,"fail":0});z["pass" if x["pass"] else "fail"]+=1
summary={"test":"TEST3","generation":5,"level":10,"total":len(R),"passed":len(R)-len(bad),"failed":len(bad),"families":fams,"verdict":"GREEN" if not bad else "RED"}
print(json.dumps(summary,indent=2))
if bad:
    print("FAILURE EXEMPLARS");seen=set()
    for x in bad:
        if x["family"] in seen:continue
        seen.add(x["family"]);print(json.dumps(x,sort_keys=True))
raise SystemExit(1 if bad else 0)
