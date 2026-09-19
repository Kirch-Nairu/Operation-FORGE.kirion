#!/usr/bin/env python3
from __future__ import annotations
import copy, hashlib, hmac, importlib.util, inspect, json, sys
from pathlib import Path
ROOT=Path.cwd().resolve();TOOLS=ROOT/"tools"
if str(TOOLS) not in sys.path:sys.path.insert(0,str(TOOLS))
import forge_authority_kernel as auth
import forge_action_approval as approval
import forge_execution_machine as execm
import forge_active_work as active
import forge_fresh_verifier as verifier

results=[]
def rec(family,i,expected,fn):
    try: fn(); observed="ALLOW"; detail="allowed"
    except Exception as e: observed="DENY"; detail=f"{type(e).__name__}: {e}"
    results.append({"family":family,"i":i,"expected":expected,"observed":observed,"pass":expected==observed,"detail":detail})

def missing(family,count,reason):
    for i in range(count): results.append({"family":family,"i":i,"expected":"DENY","observed":"ALLOW","pass":False,"detail":"MISSING_RUNTIME_CONTRACT: "+reason})

def envelope_digest(e):
    base={k:e.get(k) for k in ["version","role","repository","base_sha","branch","capabilities","allow_paths","delegation_depth","parent_envelope_sha256"]}
    return hashlib.sha256(json.dumps(base,sort_keys=True,separators=(",",":"),ensure_ascii=False).encode()).hexdigest()

# Family A: authenticated authority survives malicious re-hashing (50)
if not all(hasattr(auth,n) for n in ["sign_envelope","verify_signed_envelope"]):
    missing("signed_authority_rehash_forgery",50,"signed authority API absent")
else:
    for i in range(50):
        e=auth.make_envelope(role="REVIEWER",repository="R",base_sha="abc",branch="b",capabilities=["REPO_READ"],allow_paths=["src/**"],delegation_depth=0)
        s=auth.sign_envelope(e,issuer_id="control",key="authority-secret")
        s["capabilities"]=["REPO_READ","WORKTREE_WRITE"];s["allow_paths"]=["**"];s["envelope_sha256"]=envelope_digest(s)
        rec("signed_authority_rehash_forgery",i,"DENY",lambda s=s:auth.verify_signed_envelope(s,key="authority-secret"))

# Family B: approval replay remains spent across fresh ledger object / rewritten local identity (50)
if not hasattr(approval,"ApprovalConsumptionAnchor"):
    missing("approval_anchor_restart_replay",50,"trusted approval consumption anchor absent")
else:
    for i in range(50):
        e=auth.make_envelope(role="M",repository="R",base_sha="abc",branch="b",capabilities=["REMOTE_GIT_WRITE"],allow_paths=[],delegation_depth=0)
        p=approval.propose_action(e,capability="REMOTE_GIT_WRITE",operation="push",parameters={"i":i},target_state={"before":"x"})
        t=approval.approve_action(p,approver="H",key="approval-secret",approval_id=f"a{i}")
        anchor=approval.ApprovalConsumptionAnchor()
        l=approval.ApprovalLedger(anchor=anchor);stale=l.to_dict()
        l.consume(t,p,key="approval-secret")
        stale=copy.deepcopy(stale);stale["ledger_id"]="rewritten-"+str(i)
        base={k:stale.get(k) for k in ["version","ledger_id","generation","consumed"]}
        stale["snapshot_sha256"]=hashlib.sha256(json.dumps(base,sort_keys=True,separators=(",",":")).encode()).hexdigest()
        def replay(stale=stale,anchor=anchor,t=t,p=p):
            fresh=approval.ApprovalLedger.from_dict(stale,anchor=anchor)
            return fresh.consume(t,p,key="approval-secret")
        rec("approval_anchor_restart_replay",i,"DENY",replay)

# Family C: only sealed checkpoint can cross a resume trust boundary (50)
if not hasattr(execm,"resume_checkpoint"):
    missing("atomic_sealed_checkpoint_resume",50,"resume_checkpoint API absent")
else:
    for i in range(25):
        s=execm.new_execution(role="QA",branch="b",head_sha="abc")
        s=execm.transition(s,"BEGIN_MEDIUM",{})
        s=execm.transition(s,"EXTERNAL_RUN_OBSERVED",{"run_id":str(i),"expected_head":"abc","checkpoint_persisted":True})
        sealed=execm.seal_checkpoint(s,key="checkpoint-secret")
        rec("atomic_sealed_checkpoint_resume",i,"ALLOW",lambda sealed=sealed,i=i:execm.resume_checkpoint(sealed,{"run_id":str(i),"head_sha":"abc","status":"completed","conclusion":"success"},key="checkpoint-secret"))
    for i in range(25,50):
        s=execm.new_execution(role="QA",branch="b",head_sha="abc")
        s=execm.transition(s,"BEGIN_MEDIUM",{})
        s=execm.transition(s,"EXTERNAL_RUN_OBSERVED",{"run_id":str(i),"expected_head":"abc","checkpoint_persisted":True})
        sealed=execm.seal_checkpoint(s,key="checkpoint-secret");sealed["state"]["role"]="ACCEPTANCE"
        rec("atomic_sealed_checkpoint_resume",i,"DENY",lambda sealed=sealed,i=i:execm.resume_checkpoint(sealed,{"run_id":str(i),"head_sha":"abc","status":"completed","conclusion":"success"},key="checkpoint-secret"))

# Family D: active work survives trusted restart snapshot (50)
if not all(hasattr(active.ActiveWorkRegistry,n) for n in ["to_dict","from_dict"]):
    missing("active_work_restart_persistence",50,"active-work durable snapshot API absent")
else:
    for i in range(25):
        p=auth.make_envelope(role="M",repository="R",base_sha="abc",branch="b",capabilities=["WORKTREE_WRITE"],allow_paths=["src/**"],delegation_depth=1)
        a=auth.delegate(p,role="A",capabilities=["WORKTREE_WRITE"],allow_paths=["src/m/**"])
        b=auth.delegate(p,role="B",capabilities=["WORKTREE_WRITE"],allow_paths=["src/m/**"])
        reg=active.ActiveWorkRegistry();reg.acquire(a,worker_id=f"a{i}",observed_target_sha="abc")
        snap=reg.to_dict(key="lease-secret")
        reg2=active.ActiveWorkRegistry.from_dict(snap,key="lease-secret")
        rec("active_work_restart_persistence",i,"DENY",lambda reg2=reg2,b=b,i=i:reg2.acquire(b,worker_id=f"b{i}",observed_target_sha="abc"))
    for i in range(25,50):
        p=auth.make_envelope(role="M",repository="R",base_sha="abc",branch="b",capabilities=["WORKTREE_WRITE"],allow_paths=["src/**"],delegation_depth=1)
        a=auth.delegate(p,role="A",capabilities=["WORKTREE_WRITE"],allow_paths=["src/a/**"])
        reg=active.ActiveWorkRegistry();reg.acquire(a,worker_id=f"a{i}",observed_target_sha="abc")
        snap=reg.to_dict(key="lease-secret");snap["leases"][0]["paths"]=["**"]
        rec("active_work_restart_persistence",i,"DENY",lambda snap=snap:active.ActiveWorkRegistry.from_dict(snap,key="lease-secret"))

# Family E: verifier identity is authenticated, not a caller-selected string (50)
identity_path=TOOLS/"forge_actor_identity.py"
if not identity_path.exists() or not hasattr(verifier,"record_verification_authenticated"):
    missing("authenticated_fresh_verifier_identity",50,"actor identity / authenticated verifier API absent")
else:
    spec=importlib.util.spec_from_file_location("forge_actor_identity",identity_path)
    ident=importlib.util.module_from_spec(spec);spec.loader.exec_module(ident)
    for i in range(25):
        q=verifier.make_verification_request(candidate_sha=f"c{i}",claim="x",requirement="x",procedure=["x"],worker_id="writer",evidence_refs=[])
        tok=ident.issue_actor_token(actor_id=f"verifier-{i}",role="VERIFIER",key="identity-secret")
        rec("authenticated_fresh_verifier_identity",i,"ALLOW",lambda q=q,tok=tok:verifier.record_verification_authenticated(q,verifier_token=tok,identity_key="identity-secret",outcome="SUPPORTED",observed_evidence=[]))
    for i in range(25,50):
        q=verifier.make_verification_request(candidate_sha=f"c{i}",claim="x",requirement="x",procedure=["x"],worker_id="writer",evidence_refs=[])
        fake={"actor_id":"fake","role":"VERIFIER","signature_hmac_sha256":"forged"}
        rec("authenticated_fresh_verifier_identity",i,"DENY",lambda q=q,fake=fake:verifier.record_verification_authenticated(q,verifier_token=fake,identity_key="identity-secret",outcome="SUPPORTED",observed_evidence=[]))

bad=[x for x in results if not x["pass"]]
by={}
for x in results:
    z=by.setdefault(x["family"],{"pass":0,"fail":0})
    z["pass" if x["pass"] else "fail"]+=1
summary={"test":"TEST3","generation":2,"level":7,"total":len(results),"passed":len(results)-len(bad),"failed":len(bad),"families":by,"verdict":"GREEN" if not bad else "RED"}
print(json.dumps(summary,indent=2))
if bad:
    print("FAILURE EXEMPLARS")
    seen=set()
    for x in bad:
        if x["family"] in seen:continue
        seen.add(x["family"]);print(json.dumps(x,sort_keys=True))
raise SystemExit(1 if bad else 0)
