#!/usr/bin/env python3
from __future__ import annotations
import hashlib, inspect, json, sys
from pathlib import Path
ROOT=Path.cwd().resolve();TOOLS=ROOT/"tools"
if str(TOOLS) not in sys.path:sys.path.insert(0,str(TOOLS))
import forge_authority_kernel as auth
import forge_tool_broker as broker_mod
import forge_active_work as active
import forge_action_approval as approval
import forge_actor_identity as identity
import forge_fresh_verifier as verifier

R=[]
def add(f,i,exp,fn):
    try: fn();obs="ALLOW";detail="allowed"
    except Exception as e:obs="DENY";detail=f"{type(e).__name__}: {e}"
    R.append({"family":f,"i":i,"expected":exp,"observed":obs,"pass":exp==obs,"detail":detail})
def miss(f,n,reason,expected="DENY"):
    for i in range(n):R.append({"family":f,"i":i,"expected":expected,"observed":"ALLOW","pass":False,"detail":"MISSING_RUNTIME_CONTRACT: "+reason})

def unsigned_env(caps,paths):
    return auth.make_envelope(role="M",repository="R",base_sha="abc",branch="b",capabilities=caps,allow_paths=paths,delegation_depth=1)
def signed_env(caps,paths):
    return auth.sign_envelope(unsigned_env(caps,paths),issuer_id="control",key="authority-secret")

# A: hardened broker must enforce signed authority (75)
sig=inspect.signature(broker_mod.ToolBroker.__init__)
if "authority_key" not in sig.parameters:
    miss("broker_requires_signed_authority",75,"ToolBroker hardened authority_key mode absent")
else:
    for i in range(50):
        e=signed_env(["REPO_READ"],["src/**"])
        e["capabilities"]=["REPO_READ","WORKTREE_WRITE"];e["allow_paths"]=["**"]
        base={k:e.get(k) for k in ["version","role","repository","base_sha","branch","capabilities","allow_paths","delegation_depth","parent_envelope_sha256"]}
        e["envelope_sha256"]=hashlib.sha256(json.dumps(base,sort_keys=True,separators=(",",":")).encode()).hexdigest()
        b=broker_mod.ToolBroker(authority_key="authority-secret")
        b.register("write",capability="WORKTREE_WRITE",path_arg="path",handler=lambda **kw:"ok")
        add("broker_requires_signed_authority",i,"DENY",lambda b=b,e=e:b.execute("write",e,{"path":"src/x","content":"x"},observed_target_sha="abc"))
    for i in range(50,75):
        e=signed_env(["WORKTREE_WRITE"],["src/**"])
        b=broker_mod.ToolBroker(authority_key="authority-secret")
        b.register("write",capability="WORKTREE_WRITE",path_arg="path",handler=lambda **kw:"ok")
        add("broker_requires_signed_authority",i,"ALLOW",lambda b=b,e=e:b.execute("write",e,{"path":"src/x","content":"x"},observed_target_sha="abc"))

# B: hardened active-work registry must enforce signed authority (50)
if "authority_key" not in inspect.signature(active.ActiveWorkRegistry.__init__).parameters:
    miss("active_work_requires_signed_authority",50,"ActiveWorkRegistry authority_key mode absent")
else:
    for i in range(25):
        e=signed_env(["WORKTREE_WRITE"],["src/**"]);e["allow_paths"]=["**"]
        base={k:e.get(k) for k in ["version","role","repository","base_sha","branch","capabilities","allow_paths","delegation_depth","parent_envelope_sha256"]}
        e["envelope_sha256"]=hashlib.sha256(json.dumps(base,sort_keys=True,separators=(",",":")).encode()).hexdigest()
        reg=active.ActiveWorkRegistry(authority_key="authority-secret")
        add("active_work_requires_signed_authority",i,"DENY",lambda reg=reg,e=e,i=i:reg.acquire(e,worker_id=f"w{i}",observed_target_sha="abc"))
    for i in range(25,50):
        e=signed_env(["WORKTREE_WRITE"],["src/**"]);reg=active.ActiveWorkRegistry(authority_key="authority-secret")
        add("active_work_requires_signed_authority",i,"ALLOW",lambda reg=reg,e=e,i=i:reg.acquire(e,worker_id=f"w{i}",observed_target_sha="abc"))

# C: hardened sensitive broker requires trusted consumption anchor (75)
if "require_trusted_approval_anchor" not in sig.parameters:
    miss("broker_requires_trusted_approval_anchor",75,"sensitive broker anchor requirement absent")
else:
    for i in range(50):
        e=signed_env(["REMOTE_GIT_WRITE"],[])
        b=broker_mod.ToolBroker(authority_key="authority-secret",require_trusted_approval_anchor=True)
        b.register("push",capability="REMOTE_GIT_WRITE",sensitive=True,handler=lambda **kw:"pushed")
        args={"remote":"origin","branch":"b","candidate_sha":"abc"}
        p=b.proposal_for("push",e,args,target_state={"before":"x"},observed_target_sha="abc")
        t=approval.approve_action(p,approver="H",key="approval-secret",approval_id=f"noanchor-{i}")
        ledger=approval.ApprovalLedger()
        add("broker_requires_trusted_approval_anchor",i,"DENY",lambda b=b,e=e,args=args,t=t,ledger=ledger:b.execute("push",e,args,target_state={"before":"x"},observed_target_sha="abc",approval_token=t,approval_key="approval-secret",approval_ledger=ledger))
    for i in range(50,75):
        e=signed_env(["REMOTE_GIT_WRITE"],[])
        b=broker_mod.ToolBroker(authority_key="authority-secret",require_trusted_approval_anchor=True)
        b.register("push",capability="REMOTE_GIT_WRITE",sensitive=True,handler=lambda **kw:"pushed")
        args={"remote":"origin","branch":"b","candidate_sha":"abc"}
        p=b.proposal_for("push",e,args,target_state={"before":"x"},observed_target_sha="abc")
        t=approval.approve_action(p,approver="H",key="approval-secret",approval_id=f"anchor-{i}")
        ledger=approval.ApprovalLedger(anchor=approval.ApprovalConsumptionAnchor())
        add("broker_requires_trusted_approval_anchor",i,"ALLOW",lambda b=b,e=e,args=args,t=t,ledger=ledger:b.execute("push",e,args,target_state={"before":"x"},observed_target_sha="abc",approval_token=t,approval_key="approval-secret",approval_ledger=ledger))

# D: consumption anchor itself must persist with authenticated snapshot (50)
if not all(hasattr(approval.ApprovalConsumptionAnchor,n) for n in ["to_dict","from_dict"]):
    miss("approval_anchor_authenticated_persistence",50,"trusted anchor snapshot API absent")
else:
    for i in range(25):
        a=approval.ApprovalConsumptionAnchor();a.consume(f"a{i}",f"h{i}")
        snap=a.to_dict(key="anchor-secret")
        add("approval_anchor_authenticated_persistence",i,"ALLOW",lambda snap=snap:approval.ApprovalConsumptionAnchor.from_dict(snap,key="anchor-secret"))
    for i in range(25,50):
        a=approval.ApprovalConsumptionAnchor();a.consume(f"a{i}",f"h{i}")
        snap=a.to_dict(key="anchor-secret");snap["consumed"].append({"approval_id":"evil","action_sha256":"evil"})
        add("approval_anchor_authenticated_persistence",i,"DENY",lambda snap=snap:approval.ApprovalConsumptionAnchor.from_dict(snap,key="anchor-secret"))

# E: request worker identity and verifier identity both authenticated (50)
if not hasattr(verifier,"make_verification_request_authenticated"):
    miss("authenticated_worker_verifier_pair",50,"authenticated worker request API absent")
else:
    for i in range(25):
        wt=identity.issue_actor_token(actor_id=f"writer-{i}",role="WRITER",key="identity-secret")
        vt=identity.issue_actor_token(actor_id=f"verifier-{i}",role="VERIFIER",key="identity-secret")
        q=verifier.make_verification_request_authenticated(candidate_sha=f"c{i}",claim="x",requirement="x",procedure=["x"],worker_token=wt,identity_key="identity-secret",evidence_refs=[])
        add("authenticated_worker_verifier_pair",i,"ALLOW",lambda q=q,vt=vt:verifier.record_verification_authenticated(q,verifier_token=vt,identity_key="identity-secret",outcome="SUPPORTED",observed_evidence=[]))
    for i in range(25,50):
        wt=identity.issue_actor_token(actor_id=f"same-{i}",role="WRITER",key="identity-secret")
        vt=identity.issue_actor_token(actor_id=f"same-{i}",role="VERIFIER",key="identity-secret")
        q=verifier.make_verification_request_authenticated(candidate_sha=f"c{i}",claim="x",requirement="x",procedure=["x"],worker_token=wt,identity_key="identity-secret",evidence_refs=[])
        add("authenticated_worker_verifier_pair",i,"DENY",lambda q=q,vt=vt:verifier.record_verification_authenticated(q,verifier_token=vt,identity_key="identity-secret",outcome="SUPPORTED",observed_evidence=[]))

bad=[x for x in R if not x["pass"]];families={}
for x in R:
    z=families.setdefault(x["family"],{"pass":0,"fail":0});z["pass" if x["pass"] else "fail"]+=1
summary={"test":"TEST3","generation":3,"level":8,"total":len(R),"passed":len(R)-len(bad),"failed":len(bad),"families":families,"verdict":"GREEN" if not bad else "RED"}
print(json.dumps(summary,indent=2))
if bad:
    print("FAILURE EXEMPLARS");seen=set()
    for x in bad:
        if x["family"] in seen:continue
        seen.add(x["family"]);print(json.dumps(x,sort_keys=True))
raise SystemExit(1 if bad else 0)
