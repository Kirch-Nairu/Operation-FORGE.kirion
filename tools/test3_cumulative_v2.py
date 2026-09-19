#!/usr/bin/env python3
from __future__ import annotations
import copy, json, os, sys
from collections import Counter, defaultdict
from pathlib import Path
ROOT=Path.cwd().resolve(); TOOLS=ROOT/"tools"
if str(TOOLS) not in sys.path: sys.path.insert(0,str(TOOLS))
import forge_authority_kernel as auth
import forge_action_approval as approval
import forge_execution_machine as execm
import forge_fresh_verifier as verifier
import forge_learning_kernel as learning
import forge_tool_broker as broker_mod
import forge_active_work as active

R=[]
def invoke(fn):
    try: return "ALLOW",repr(fn())
    except Exception as e: return "DENY",f"{type(e).__name__}: {e}"
def fam(level,name,n,expected,fn,component,severity="HIGH"):
    for i in range(n):
        observed,detail=invoke(lambda i=i:fn(i))
        R.append({"id":f"L{level}-{name}-{i:03d}","level":level,"family":name,"expected":expected,"observed":observed,
                  "status":"PASS" if expected==observed else "MISBEHAVIOR","component":component,
                  "severity":"INFO" if expected==observed else severity,"detail":detail})

def env(depth=2,role="MAINTAINER",caps=None,paths=None):
    return auth.make_envelope(role=role,repository="R",base_sha="abc123",branch="candidate",
      capabilities=caps or ["REPO_READ","WORKTREE_WRITE","TEST_EXECUTE","LOCAL_GIT_WRITE","REMOTE_GIT_WRITE"],
      allow_paths=paths or ["src/**","tests/**"],delegation_depth=depth)

def broker():
    b=broker_mod.ToolBroker()
    b.register("read_file",capability="REPO_READ",handler=lambda **kw:"read")
    b.register("write_file",capability="WORKTREE_WRITE",path_arg="path",handler=lambda **kw:"write")
    b.register("push",capability="REMOTE_GIT_WRITE",sensitive=True,handler=lambda **kw:"push")
    return b

def waiting(i,role="QA"):
    s=execm.new_execution(role=role,branch="candidate",head_sha="abc123")
    s=execm.transition(s,"BEGIN_MEDIUM",{})
    return execm.transition(s,"EXTERNAL_RUN_OBSERVED",{"run_id":str(10000+i),"expected_head":"abc123","checkpoint_persisted":True})

# L0 100 clean
fam(0,"clean_read",20,"ALLOW",lambda i:broker().execute("read_file",env(),{"path":f"src/r{i}.py"}),"tool_broker","LOW")
fam(0,"clean_write",20,"ALLOW",lambda i:broker().execute("write_file",env(),{"path":f"src/w{i}.py","content":"x"},observed_target_sha="abc123"),"tool_broker","LOW")
fam(0,"clean_delegate",15,"ALLOW",lambda i:auth.delegate(env(),role="W",capabilities=["REPO_READ","WORKTREE_WRITE"],allow_paths=["src/**"]),"authority_kernel","LOW")
def ok_resume(i):
    s=execm.resume_external(waiting(i),{"run_id":str(10000+i),"head_sha":"abc123","status":"completed","conclusion":"success"})
    return execm.transition(s,"RECONCILE_SUCCESS",{})
fam(0,"clean_resume",15,"ALLOW",ok_resume,"execution_machine","LOW")
def ok_verify(i):
    q=verifier.make_verification_request(candidate_sha=f"c{i}",claim="build",requirement="build",procedure=["run"],worker_id="writer",evidence_refs=["ci"])
    return verifier.record_verification(q,verifier_id="fresh",outcome="SUPPORTED",observed_evidence=["ci"])
fam(0,"clean_verify",15,"ALLOW",ok_verify,"fresh_verifier","LOW")
def ok_learn(i):
    c=learning.create_skill_candidate(source_run_id=f"r{i}",teacher_id="teacher",failure="x",successful_trace=["a"],generalized_steps=["b"])
    return learning.record_skill_review(c,reviewer_id="reviewer",outcome="APPROVE")
fam(0,"clean_learning",15,"ALLOW",ok_learn,"learning_kernel","LOW")

# L1 100 friction
fam(1,"out_scope",20,"DENY",lambda i:broker().execute("write_file",env(),{"path":f".forge/{i}","content":"x"},observed_target_sha="abc123"),"authority_kernel")
fam(1,"no_approval",20,"DENY",lambda i:broker().execute("push",env(),{"remote":"origin","branch":"candidate","candidate_sha":"abc123"},target_state={"before":"x"},observed_target_sha="abc123"),"tool_broker","CRITICAL")
def action_drift(i):
    b=broker();e=env();args={"remote":"origin","branch":"candidate","candidate_sha":"abc123"}
    p=b.proposal_for("push",e,args,target_state={"before":"x"},observed_target_sha="abc123")
    t=approval.approve_action(p,approver="HUMAN",key="k",approval_id=f"a{i}")
    return b.execute("push",e,{**args,"candidate_sha":"other"},target_state={"before":"x"},observed_target_sha="abc123",approval_token=t,approval_key="k",approval_ledger=approval.ApprovalLedger())
fam(1,"action_drift",20,"DENY",action_drift,"action_approval","CRITICAL")
fam(1,"wrong_run",10,"DENY",lambda i:execm.resume_external(waiting(i),{"run_id":"wrong","head_sha":"abc123","status":"completed","conclusion":"success"}),"execution_machine")
fam(1,"wrong_sha",10,"DENY",lambda i:execm.resume_external(waiting(i),{"run_id":str(10000+i),"head_sha":"moved","status":"completed","conclusion":"success"}),"execution_machine")
def self_verify(i):
    q=verifier.make_verification_request(candidate_sha=f"s{i}",claim="x",requirement="x",procedure=["x"],worker_id="same",evidence_refs=[])
    return verifier.record_verification(q,verifier_id="same",outcome="SUPPORTED",observed_evidence=[])
fam(1,"self_verify",10,"DENY",self_verify,"fresh_verifier")
def self_learn(i):
    c=learning.create_skill_candidate(source_run_id=f"s{i}",teacher_id="same",failure="x",successful_trace=["a"],generalized_steps=["b"])
    return learning.record_skill_review(c,reviewer_id="same",outcome="APPROVE")
fam(1,"self_learning_review",10,"DENY",self_learn,"learning_kernel")

# L2 150 integrity
def tcap(i):
    e=auth.make_envelope(role="R",repository="R",base_sha="abc123",branch="candidate",capabilities=["REPO_READ"],allow_paths=["src/**"],delegation_depth=0)
    e["capabilities"].append("WORKTREE_WRITE")
    return broker().execute("write_file",e,{"path":f"src/{i}.py","content":"x"},observed_target_sha="abc123")
fam(2,"tamper_cap",25,"DENY",tcap,"authority_kernel","CRITICAL")
def tpath(i):
    e=auth.make_envelope(role="W",repository="R",base_sha="abc123",branch="candidate",capabilities=["WORKTREE_WRITE"],allow_paths=["src/**"],delegation_depth=0)
    e["allow_paths"]=["**"]
    return broker().execute("write_file",e,{"path":f".forge/{i}","content":"x"},observed_target_sha="abc123")
fam(2,"tamper_path",25,"DENY",tpath,"authority_kernel","CRITICAL")
def tparent(i):
    p=auth.make_envelope(role="M",repository="R",base_sha="abc123",branch="candidate",capabilities=["REPO_READ"],allow_paths=["src/**"],delegation_depth=1)
    p["capabilities"].append("DEPLOY")
    return auth.delegate(p,role="C",capabilities=["DEPLOY"],allow_paths=["src/**"])
fam(2,"tamper_parent",25,"DENY",tparent,"authority_kernel","CRITICAL")
def rollback(i):
    b=broker();e=env();args={"remote":"origin","branch":"candidate","candidate_sha":"abc123"}
    p=b.proposal_for("push",e,args,target_state={"before":"x"},observed_target_sha="abc123")
    t=approval.approve_action(p,approver="H",key="k",approval_id=f"rb{i}")
    l=approval.ApprovalLedger(); stale=l.to_dict()
    b.execute("push",e,args,target_state={"before":"x"},observed_target_sha="abc123",approval_token=t,approval_key="k",approval_ledger=l)
    old=approval.ApprovalLedger.from_dict(stale)
    return b.execute("push",e,args,target_state={"before":"x"},observed_target_sha="abc123",approval_token=t,approval_key="k",approval_ledger=old)
fam(2,"ledger_rollback",25,"DENY",rollback,"action_approval","CRITICAL")
def chk_mutate(i):
    raw=execm.verify_checkpoint(execm.seal_checkpoint(waiting(i),key="secret"),key="secret")
    raw["role"]="ACCEPTANCE"
    return execm.resume_external(raw,{"run_id":str(10000+i),"head_sha":"abc123","status":"completed","conclusion":"success"})
fam(2,"checkpoint_postverify_mutation",25,"DENY",chk_mutate,"execution_machine","CRITICAL")
def forged_prop(i):
    f={"version":1,"role":"X","repository":"R","base_sha":"abc123","branch":"candidate","capabilities":["REMOTE_GIT_WRITE"],"allow_paths":[],"delegation_depth":0,"parent_envelope_sha256":None,"envelope_sha256":"fake"}
    return approval.propose_action(f,capability="REMOTE_GIT_WRITE",operation="push",parameters={"i":i},target_state={})
fam(2,"forged_proposal",25,"DENY",forged_prop,"action_approval","CRITICAL")

# L3 150 corrected concurrency/target reality
def overlap(i):
    p=env(depth=1);a=auth.delegate(p,role="A",capabilities=["WORKTREE_WRITE"],allow_paths=["src/m/**"]);b=auth.delegate(p,role="B",capabilities=["WORKTREE_WRITE"],allow_paths=["src/m/**"])
    reg=active.ActiveWorkRegistry();reg.acquire(a,worker_id=f"a{i}",observed_target_sha="abc123")
    return reg.acquire(b,worker_id=f"b{i}",observed_target_sha="abc123")
fam(3,"active_overlap",30,"DENY",overlap,"active_work","HIGH")
def disjoint(i):
    p=env(depth=1);a=auth.delegate(p,role="A",capabilities=["WORKTREE_WRITE"],allow_paths=["src/a/**"]);b=auth.delegate(p,role="B",capabilities=["WORKTREE_WRITE"],allow_paths=["src/b/**"])
    reg=active.ActiveWorkRegistry();reg.acquire(a,worker_id=f"a{i}",observed_target_sha="abc123")
    return reg.acquire(b,worker_id=f"b{i}",observed_target_sha="abc123")
fam(3,"active_disjoint",20,"ALLOW",disjoint,"active_work","LOW")
def stale_child(i):
    c=auth.delegate(env(depth=1),role="W",capabilities=["WORKTREE_WRITE"],allow_paths=["src/**"])
    return auth.authorize_current(c,"WORKTREE_WRITE",current_sha="moved",path=f"src/{i}.py")
fam(3,"stale_child",25,"DENY",stale_child,"authority_kernel")
def fresh_child(i):
    c=auth.delegate(env(depth=1),role="W",capabilities=["WORKTREE_WRITE"],allow_paths=["src/**"])
    return auth.authorize_current(c,"WORKTREE_WRITE",current_sha="abc123",path=f"src/{i}.py")
fam(3,"fresh_child",25,"ALLOW",fresh_child,"authority_kernel","LOW")
fam(3,"stale_broker",25,"DENY",lambda i:broker().execute("write_file",env(),{"path":f"src/{i}.py","content":"x"},observed_target_sha="moved"),"tool_broker")
fam(3,"fresh_broker",25,"ALLOW",lambda i:broker().execute("write_file",env(),{"path":f"src/{i}.py","content":"x"},observed_target_sha="abc123"),"tool_broker","LOW")

# L4 100 chaos
def timeout(i):
    s=execm.resume_external(waiting(i),{"run_id":str(10000+i),"head_sha":"abc123","status":"completed","conclusion":"timed_out"})
    return execm.transition(s,"CLASSIFY_FAILURE",{"classification":"ENVIRONMENT_UNRESOLVED"})
fam(4,"timeout_block",25,"ALLOW",timeout,"execution_machine")
def target_drift(i):
    b=broker();e=env();args={"remote":"origin","branch":"candidate","candidate_sha":"abc123"}
    p=b.proposal_for("push",e,args,target_state={"before":"x"},observed_target_sha="abc123")
    t=approval.approve_action(p,approver="H",key="k",approval_id=f"td{i}")
    return b.execute("push",e,args,target_state={"before":"different"},observed_target_sha="abc123",approval_token=t,approval_key="k",approval_ledger=approval.ApprovalLedger())
fam(4,"approval_target_drift",25,"DENY",target_drift,"action_approval","CRITICAL")
def chk_tamper(i):
    x=execm.seal_checkpoint(waiting(i),key="secret");x["state"]["external"]["run_id"]="evil"
    return execm.verify_checkpoint(x,key="secret")
fam(4,"checkpoint_tamper",25,"DENY",chk_tamper,"execution_machine","CRITICAL")
def verify_escalate(i):
    q=verifier.make_verification_request(candidate_sha=f"v{i}",claim="x",requirement="x",procedure=["x"],worker_id="w",evidence_refs=[])
    r=verifier.record_verification(q,verifier_id="fresh",outcome="SUPPORTED",observed_evidence=[])
    r["promotion_authorized"]=True
    return verifier.verify_result(r,q)
fam(4,"verifier_escalation",25,"DENY",verify_escalate,"fresh_verifier","CRITICAL")

# L5 100 long horizon
def chk_round(i):
    s=waiting(i)
    for _ in range(20):
        s=execm.verify_checkpoint(execm.seal_checkpoint(s,key="secret"),key="secret")
        s=execm.resume_external(s,{"run_id":str(10000+i),"head_sha":"abc123","status":"in_progress","conclusion":None})
    return s["state"]
fam(5,"checkpoint_roundtrip",25,"ALLOW",chk_round,"execution_machine","LOW")
def ledger_round(i):
    b=broker();e=env();args={"remote":"origin","branch":"candidate","candidate_sha":"abc123"}
    p=b.proposal_for("push",e,args,target_state={"before":"x"},observed_target_sha="abc123")
    t=approval.approve_action(p,approver="H",key="k",approval_id=f"lr{i}")
    l=approval.ApprovalLedger();b.execute("push",e,args,target_state={"before":"x"},observed_target_sha="abc123",approval_token=t,approval_key="k",approval_ledger=l)
    for _ in range(20): l=approval.ApprovalLedger.from_dict(l.to_dict())
    return b.execute("push",e,args,target_state={"before":"x"},observed_target_sha="abc123",approval_token=t,approval_key="k",approval_ledger=l)
fam(5,"ledger_roundtrip_replay",25,"DENY",ledger_round,"action_approval","CRITICAL")
def deep(i):
    a=auth.delegate(env(depth=3),role="A",capabilities=["WORKTREE_WRITE"],allow_paths=["src/**"])
    b=auth.delegate(a,role="B",capabilities=["WORKTREE_WRITE"],allow_paths=["src/m/**"])
    c=auth.delegate(b,role="C",capabilities=["WORKTREE_WRITE"],allow_paths=["src/m/s/**"])
    return auth.authorize_current(c,"WORKTREE_WRITE",current_sha="abc123",path=f"src/m/s/{i}.py")
fam(5,"deep_delegation",25,"ALLOW",deep,"authority_kernel","LOW")
def learn_bound(i):
    c=learning.create_skill_candidate(source_run_id=f"l{i}",teacher_id="t",failure="x",successful_trace=["a"],generalized_steps=["b"])
    r=learning.record_skill_review(c,reviewer_id="r",outcome="APPROVE")
    if r["authority"]=="NONE" and r["promotion_authorized"] is False: raise learning.LearningError("correctly non-authoritative")
    return r
fam(5,"learning_boundary",25,"DENY",learn_bound,"learning_kernel","CRITICAL")

# L6 100 nightmare combinations
def nightmare_auth(i):
    e=auth.make_envelope(role="R",repository="R",base_sha="abc123",branch="candidate",capabilities=["REPO_READ"],allow_paths=["src/**"],delegation_depth=0)
    e["capabilities"].append("WORKTREE_WRITE");e["allow_paths"]=["**"]
    return broker().execute("write_file",e,{"path":f".forge/{i}","content":"x"},observed_target_sha="abc123")
fam(6,"nightmare_authority_tamper",25,"DENY",nightmare_auth,"tool_broker","CRITICAL")
fam(6,"nightmare_rollback",25,"DENY",rollback,"action_approval","CRITICAL")
def nightmare_chk(i):
    s=execm.verify_checkpoint(execm.seal_checkpoint(waiting(i,role="QA"),key="secret"),key="secret")
    s["role"]="ACCEPTANCE";s["branch"]="main"
    return execm.resume_external(s,{"run_id":str(10000+i),"head_sha":"abc123","status":"completed","conclusion":"success"})
fam(6,"nightmare_checkpoint_launder",25,"DENY",nightmare_chk,"execution_machine","CRITICAL")
fam(6,"nightmare_forged_proposal",25,"DENY",forged_prop,"action_approval","CRITICAL")

bad=[x for x in R if x["status"]!="PASS"]
by_level=defaultdict(Counter);by_family=defaultdict(Counter)
for x in R: by_level[x["level"]][x["status"]]+=1;by_family[x["family"]][x["status"]]+=1
summary={"test":"TEST3 cumulative v2","source_sha":os.environ.get("GITHUB_SHA"),"total":len(R),"passed":len(R)-len(bad),"failed":len(bad),
         "levels":{str(k):dict(v) for k,v in sorted(by_level.items())},
         "misbehavior_families":sorted({x["family"] for x in bad}),
         "verdict":"GREEN" if not bad else "RED"}
print(json.dumps(summary,indent=2))
if bad:
    print("FAILURE EXEMPLARS")
    seen=set()
    for x in bad:
        if x["family"] in seen: continue
        seen.add(x["family"]);print(json.dumps(x,sort_keys=True))
(ROOT/"test3-cumulative-v2.json").write_text(json.dumps({"summary":summary,"results":R},indent=2)+"\n")
raise SystemExit(1 if bad else 0)
