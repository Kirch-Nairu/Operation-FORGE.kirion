#!/usr/bin/env python3
from __future__ import annotations
import copy, json, os, sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT=Path.cwd().resolve()
TOOLS=ROOT/"tools"
if str(TOOLS) not in sys.path: sys.path.insert(0,str(TOOLS))

import forge_authority_kernel as auth
import forge_action_approval as approval
import forge_execution_machine as execm
import forge_fresh_verifier as verifier
import forge_learning_kernel as learning
import forge_tool_broker as broker_mod

RESULTS=[]
CALLS=[]

def invoke(fn):
    try:
        v=fn()
        return "ALLOW",repr(v)
    except Exception as e:
        return "DENY",f"{type(e).__name__}: {e}"

def record(level,family,i,expected,outcome,detail,component,severity,expected_behavior,stress,failure_class="NONE",correction=None):
    status="PASS" if expected==outcome else "MISBEHAVIOR"
    RESULTS.append({
      "scenario_id":f"L{level}-{family}-{i:03d}","level":level,"family":family,
      "stress_dimensions":stress,"expected":expected,"observed":outcome,"status":status,
      "failure_class":"NONE" if status=="PASS" else failure_class,
      "severity":"INFO" if status=="PASS" else severity,"component":component,
      "expected_behavior":expected_behavior,"observed_behavior":detail,
      "correction_hypothesis":None if status=="PASS" else correction,
      "correction_commit":None,"replay_result":None,"permanent_regression":status!="PASS"
    })

def family(level,name,count,expected,fn,component,severity,expected_behavior,stress,failure_class="NONE",correction=None):
    for i in range(count):
        out,detail=invoke(lambda i=i: fn(i))
        record(level,name,i,expected,out,detail,component,severity,expected_behavior,stress,failure_class,correction)

def make_broker():
    b=broker_mod.ToolBroker()
    b.register("read_file",capability="REPO_READ",handler=lambda **kw: CALLS.append(("read",kw)) or "ok")
    b.register("write_file",capability="WORKTREE_WRITE",path_arg="path",handler=lambda **kw: CALLS.append(("write",kw)) or "ok")
    b.register("push",capability="REMOTE_GIT_WRITE",sensitive=True,handler=lambda **kw: CALLS.append(("push",kw)) or "pushed")
    return b

def env(depth=2):
    return auth.make_envelope(role="MAINTAINER",repository="Kirch-Nairu/App",base_sha="abc123",branch="candidate",
      capabilities=["REPO_READ","WORKTREE_WRITE","TEST_EXECUTE","LOCAL_GIT_WRITE","REMOTE_GIT_WRITE"],
      allow_paths=["src/**","tests/**"],delegation_depth=depth)

def waiting(i=0,role="QA"):
    s=execm.new_execution(role=role,branch="candidate",head_sha="abc123")
    s=execm.transition(s,"BEGIN_MEDIUM",{})
    return execm.transition(s,"EXTERNAL_RUN_OBSERVED",{"run_id":str(1000+i),"expected_head":"abc123","checkpoint_persisted":True})

# L0 — 80 clean scenarios
family(0,"clean_read",20,"ALLOW",lambda i:make_broker().execute("read_file",env(),{"path":f"src/r{i}.py"}),"tool_broker","LOW","valid read succeeds",["clean","single_actor"])
family(0,"clean_write",20,"ALLOW",lambda i:make_broker().execute("write_file",env(),{"path":f"src/w{i}.py","content":"x"}),"tool_broker","LOW","valid scoped write succeeds",["clean","single_actor"])
family(0,"clean_delegate",10,"ALLOW",lambda i:auth.delegate(env(),role="WRITER",capabilities=["REPO_READ","WORKTREE_WRITE"],allow_paths=["src/**"]),"authority_kernel","LOW","bounded delegation succeeds",["clean","delegation"])
def clean_resume(i):
    s=waiting(i)
    s=execm.resume_external(s,{"run_id":str(1000+i),"head_sha":"abc123","status":"completed","conclusion":"success"})
    return execm.transition(s,"RECONCILE_SUCCESS",{})
family(0,"clean_resume",10,"ALLOW",clean_resume,"execution_machine","LOW","exact external run resumes",["clean","external"])
def clean_verify(i):
    r=verifier.make_verification_request(candidate_sha=f"c{i}",claim="build",requirement="build",procedure=["run"],worker_id="writer",evidence_refs=["ci"])
    return verifier.record_verification(r,verifier_id="fresh",outcome="SUPPORTED",observed_evidence=["ci"])
family(0,"clean_verify",10,"ALLOW",clean_verify,"fresh_verifier","LOW","fresh verifier records evidence",["clean","evidence"])
def clean_learn(i):
    c=learning.create_skill_candidate(source_run_id=f"r{i}",teacher_id="teacher",failure="x",successful_trace=["a"],generalized_steps=["b"])
    return learning.record_skill_review(c,reviewer_id="reviewer",outcome="APPROVE")
family(0,"clean_learning",10,"ALLOW",clean_learn,"learning_kernel","LOW","separate reviewer reviews skill candidate",["clean","learning"])

# L1 — 100 ordinary friction
family(1,"out_of_scope_write",20,"DENY",lambda i:make_broker().execute("write_file",env(),{"path":f".forge/x{i}","content":"x"}),"authority_kernel","HIGH","out-of-scope write denied",["scope"],"AUTHORITY_FAILURE","enforce path scope before effect")
family(1,"sensitive_without_approval",15,"DENY",lambda i:make_broker().execute("push",env(),{"remote":"origin","branch":"candidate","candidate_sha":"abc123"},target_state={"before":"z"}),"tool_broker","CRITICAL","sensitive effect requires exact approval",["approval"],"AUTHORITY_FAILURE")
def drifted_approval(i):
    b=make_broker();e=env();args={"remote":"origin","branch":"candidate","candidate_sha":"abc123"}
    p=b.proposal_for("push",e,args,target_state={"before":"z"})
    t=approval.approve_action(p,approver="HUMAN",key="secret",approval_id=f"a{i}")
    return b.execute("push",e,{**args,"candidate_sha":"other"},target_state={"before":"z"},approval_token=t,approval_key="secret",approval_ledger=approval.ApprovalLedger())
family(1,"approval_action_drift",15,"DENY",drifted_approval,"action_approval","CRITICAL","approval binds exact parameters",["approval","drift"],"AUTHORITY_FAILURE")
family(1,"wrong_external_run",10,"DENY",lambda i:execm.resume_external(waiting(i),{"run_id":"wrong","head_sha":"abc123","status":"completed","conclusion":"success"}),"execution_machine","HIGH","resume requires exact run ID",["external","stale"],"STALE_STATE")
family(1,"wrong_external_sha",10,"DENY",lambda i:execm.resume_external(waiting(i),{"run_id":str(1000+i),"head_sha":"stale","status":"completed","conclusion":"success"}),"execution_machine","HIGH","resume requires exact SHA",["external","drift"],"STALE_STATE")
def self_verify(i):
    r=verifier.make_verification_request(candidate_sha=f"v{i}",claim="x",requirement="x",procedure=["x"],worker_id="same",evidence_refs=[])
    return verifier.record_verification(r,verifier_id="same",outcome="SUPPORTED",observed_evidence=[])
family(1,"self_verification",10,"DENY",self_verify,"fresh_verifier","HIGH","worker cannot verify itself",["role"],"EVIDENCE_FAILURE")
def self_learn(i):
    c=learning.create_skill_candidate(source_run_id=f"x{i}",teacher_id="same",failure="x",successful_trace=["a"],generalized_steps=["b"])
    return learning.record_skill_review(c,reviewer_id="same",outcome="APPROVE")
family(1,"teacher_self_review",10,"DENY",self_learn,"learning_kernel","HIGH","teacher cannot review own learning",["role"],"AUTHORITY_FAILURE")
family(1,"unknown_tool",10,"DENY",lambda i:make_broker().execute(f"unknown{i}",env(),{}),"tool_broker","HIGH","unknown tools fail closed",["tool"],"AUTHORITY_FAILURE")

# L2 — 120 integrity/stale-state attacks
def tamper_cap(i):
    e=auth.make_envelope(role="REVIEWER",repository="R",base_sha="h",branch="b",capabilities=["REPO_READ"],allow_paths=["src/**"],delegation_depth=0)
    e["capabilities"].append("WORKTREE_WRITE")
    return make_broker().execute("write_file",e,{"path":f"src/t{i}.py","content":"x"})
family(2,"tampered_authority_capability",20,"DENY",tamper_cap,"authority_kernel","CRITICAL","edited capability envelope rejected",["tamper","authority"],"AUTHORITY_FAILURE","verify envelope digest at every authority boundary")

def tamper_path(i):
    e=auth.make_envelope(role="WRITER",repository="R",base_sha="h",branch="b",capabilities=["WORKTREE_WRITE"],allow_paths=["src/**"],delegation_depth=0)
    e["allow_paths"]=["**"]
    return make_broker().execute("write_file",e,{"path":f".forge/t{i}","content":"x"})
family(2,"tampered_authority_paths",20,"DENY",tamper_path,"authority_kernel","CRITICAL","edited path scope rejected",["tamper","scope"],"AUTHORITY_FAILURE","verify envelope digest before scope authorization")

def tamper_parent(i):
    p=auth.make_envelope(role="M",repository="R",base_sha="h",branch="b",capabilities=["REPO_READ"],allow_paths=["src/**"],delegation_depth=1)
    p["capabilities"].append("DEPLOY")
    return auth.delegate(p,role="CHILD",capabilities=["DEPLOY"],allow_paths=["src/**"])
family(2,"delegation_from_tampered_parent",20,"DENY",tamper_parent,"authority_kernel","CRITICAL","tampered parent cannot mint authority",["tamper","delegation"],"AUTHORITY_FAILURE","verify parent envelope before delegation")

def rollback_replay(i):
    b=make_broker();e=env();args={"remote":"origin","branch":"candidate","candidate_sha":"abc123"}
    p=b.proposal_for("push",e,args,target_state={"before":"z"})
    t=approval.approve_action(p,approver="HUMAN",key="secret",approval_id=f"rollback-{i}")
    l=approval.ApprovalLedger();stale=l.to_dict()
    b.execute("push",e,args,target_state={"before":"z"},approval_token=t,approval_key="secret",approval_ledger=l)
    rolled=approval.ApprovalLedger.from_dict(stale)
    return b.execute("push",e,args,target_state={"before":"z"},approval_token=t,approval_key="secret",approval_ledger=rolled)
family(2,"approval_ledger_rollback_replay",20,"DENY",rollback_replay,"action_approval","CRITICAL","rollback cannot resurrect consumed approval",["rollback","replay"],"AUTHORITY_FAILURE","anchor ledger generation to monotonic integrity state")

def checkpoint_bypass(i):
    s=waiting(i,role="QA")
    sealed=execm.seal_checkpoint(s,key="secret")
    raw=execm.verify_checkpoint(sealed,key="secret")
    raw["role"]="ACCEPTANCE"
    return execm.resume_external(raw,{"run_id":str(1000+i),"head_sha":"abc123","status":"completed","conclusion":"success"})
family(2,"checkpoint_verify_then_mutate_bypass",20,"DENY",checkpoint_bypass,"execution_machine","CRITICAL","resume remains integrity-bound atomically",["checkpoint","role_laundering"],"AUTHORITY_FAILURE","make sealed-checkpoint resume the enforced entrypoint")

def forged_proposal(i):
    f={"capabilities":["REMOTE_GIT_WRITE"],"envelope_sha256":f"fake{i}","allow_paths":[]}
    return approval.propose_action(f,capability="REMOTE_GIT_WRITE",operation="push",parameters={"i":i},target_state={})
family(2,"approval_from_forged_authority_envelope",20,"DENY",forged_proposal,"action_approval","CRITICAL","proposal requires valid authority envelope",["forgery","approval"],"AUTHORITY_FAILURE","verify authority envelope before proposal generation")

# L3 — 100 concurrency and target drift
def overlap(i):
    p=env(depth=1)
    a=auth.delegate(p,role="A",capabilities=["WORKTREE_WRITE"],allow_paths=["src/**"])
    b=auth.delegate(p,role="B",capabilities=["WORKTREE_WRITE"],allow_paths=["src/**"])
    return (a,b)
family(3,"overlapping_parallel_writer_scope",25,"DENY",overlap,"authority_kernel","HIGH","concurrent writers cannot silently own overlapping mutable scope",["concurrency","ownership"],"CONCURRENCY_FAILURE","add active-work lease registry with overlap detection")

family(3,"stale_child_after_target_drift",25,"DENY",
       lambda i:auth.authorize(auth.delegate(env(depth=1),role="W",capabilities=["WORKTREE_WRITE"],allow_paths=["src/**"]),"WORKTREE_WRITE",path=f"src/s{i}.py"),
       "authority_kernel","HIGH","old-base child cannot mutate after target authority moves",["stale","delegation"],"STALE_STATE","bind authorization to observed current target SHA")

family(3,"broker_write_without_target_reality_check",25,"DENY",
       lambda i:make_broker().execute("write_file",env(),{"path":f"src/d{i}.py","content":"x"}),
       "tool_broker","HIGH","effect broker rejects writes against drifted target reality",["target_drift","effect"],"STALE_STATE","supply observed target state to effect authorization")

family(3,"external_target_drift_control",25,"DENY",
       lambda i:execm.resume_external(waiting(i),{"run_id":str(1000+i),"head_sha":"moved","status":"completed","conclusion":"success"}),
       "execution_machine","HIGH","external resume rejects target drift",["target_drift","external"],"STALE_STATE")

# L4 — 100 operational chaos
def timeout_flow(i):
    s=waiting(i)
    s=execm.resume_external(s,{"run_id":str(1000+i),"head_sha":"abc123","status":"completed","conclusion":"timed_out"})
    return execm.transition(s,"CLASSIFY_FAILURE",{"classification":"ENVIRONMENT_UNRESOLVED"})
family(4,"external_timeout_blocks",25,"ALLOW",timeout_flow,"execution_machine","HIGH","timeout becomes explicit blocked recovery state",["timeout","recovery"],"RECOVERY_FAILURE")

def target_mismatch(i):
    b=make_broker();e=env();args={"remote":"origin","branch":"candidate","candidate_sha":"abc123"}
    p=b.proposal_for("push",e,args,target_state={"before":f"s{i}"})
    t=approval.approve_action(p,approver="HUMAN",key="secret",approval_id=f"chaos-{i}")
    return b.execute("push",e,args,target_state={"before":"different"},approval_token=t,approval_key="secret",approval_ledger=approval.ApprovalLedger())
family(4,"approval_target_state_drift",25,"DENY",target_mismatch,"action_approval","CRITICAL","stale target assumptions invalidate approval",["target_drift","approval"],"STALE_STATE")

def checkpoint_tamper(i):
    sealed=execm.seal_checkpoint(waiting(i),key="secret")
    bad=copy.deepcopy(sealed);bad["state"]["external"]["run_id"]="evil"
    return execm.verify_checkpoint(bad,key="secret")
family(4,"checkpoint_tamper_control",25,"DENY",checkpoint_tamper,"execution_machine","CRITICAL","signed checkpoint tamper fails closed",["tamper","recovery"],"AUTHORITY_FAILURE")

def verifier_escalation(i):
    r=verifier.make_verification_request(candidate_sha=f"z{i}",claim="runtime",requirement="runtime",procedure=["observe"],worker_id="writer",evidence_refs=["run"])
    v=verifier.record_verification(r,verifier_id="fresh",outcome="SUPPORTED",observed_evidence=["run"])
    v["promotion_authorized"]=True
    return verifier.verify_result(v,r)
family(4,"verifier_promotion_escalation",25,"DENY",verifier_escalation,"fresh_verifier","CRITICAL","verifier cannot become promotion authority",["evidence","authority"],"AUTHORITY_FAILURE")

# L5 — 100 long horizon
def checkpoint_roundtrip(i):
    s=waiting(i)
    for _ in range(20):
        s=execm.verify_checkpoint(execm.seal_checkpoint(s,key="secret"),key="secret")
        s=execm.resume_external(s,{"run_id":str(1000+i),"head_sha":"abc123","status":"in_progress","conclusion":None})
    return s["state"]
family(5,"repeated_checkpoint_roundtrip",25,"ALLOW",checkpoint_roundtrip,"execution_machine","HIGH","repeated durable round-trips preserve state",["long_horizon","serialization"],"RECOVERY_FAILURE")

def ledger_roundtrip(i):
    b=make_broker();e=env();args={"remote":"origin","branch":"candidate","candidate_sha":"abc123"}
    p=b.proposal_for("push",e,args,target_state={"before":"z"})
    t=approval.approve_action(p,approver="HUMAN",key="secret",approval_id=f"long-{i}")
    l=approval.ApprovalLedger()
    b.execute("push",e,args,target_state={"before":"z"},approval_token=t,approval_key="secret",approval_ledger=l)
    for _ in range(20): l=approval.ApprovalLedger.from_dict(l.to_dict())
    return b.execute("push",e,args,target_state={"before":"z"},approval_token=t,approval_key="secret",approval_ledger=l)
family(5,"repeated_ledger_roundtrip_replay",25,"DENY",ledger_roundtrip,"action_approval","CRITICAL","spent approval stays spent over repeated reloads",["long_horizon","replay"],"AUTHORITY_FAILURE")

def deep_delegate(i):
    p=env(depth=3)
    a=auth.delegate(p,role="A",capabilities=["WORKTREE_WRITE"],allow_paths=["src/**"])
    b=auth.delegate(a,role="B",capabilities=["WORKTREE_WRITE"],allow_paths=["src/module/**"])
    c=auth.delegate(b,role="C",capabilities=["WORKTREE_WRITE"],allow_paths=["src/module/sub/**"])
    return auth.authorize(c,"WORKTREE_WRITE",path=f"src/module/sub/{i}.py")
family(5,"deep_bounded_delegation",25,"ALLOW",deep_delegate,"authority_kernel","HIGH","deep delegation works only while narrowing scope/depth",["long_horizon","delegation"],"AUTHORITY_FAILURE")

def learning_bound(i):
    c=learning.create_skill_candidate(source_run_id=f"lh{i}",teacher_id="teacher",failure="timeout",successful_trace=["checkpoint","resume"],generalized_steps=["persist","yield"])
    r=learning.record_skill_review(c,reviewer_id="reviewer",outcome="APPROVE")
    if r.get("promotion_authorized") is False and r.get("authority")=="NONE":
        raise learning.LearningError("correctly remains non-authoritative")
    return r
family(5,"learning_stays_non_authoritative",25,"DENY",learning_bound,"learning_kernel","CRITICAL","approved learning still has no execution/promotion authority",["learning","long_horizon"],"AUTHORITY_FAILURE")

# L6 — 100 combined nightmare cases
def nightmare_authority(i):
    e=auth.make_envelope(role="REVIEWER",repository="R",base_sha="h",branch="b",capabilities=["REPO_READ"],allow_paths=["src/**"],delegation_depth=0)
    e["capabilities"].append("WORKTREE_WRITE");e["allow_paths"]=["**"]
    return make_broker().execute("write_file",e,{"path":f".forge/night{i}","content":"x"})
family(6,"nightmare_forged_authority_effect",25,"DENY",nightmare_authority,"tool_broker","CRITICAL","combined capability/path tampering cannot reach handler",["tamper","role_laundering","effect"],"AUTHORITY_FAILURE","verify envelope at broker boundary")

family(6,"nightmare_rollback_replay",25,"DENY",rollback_replay,"action_approval","CRITICAL","rollback cannot resurrect sensitive approval",["rollback","replay","sensitive"],"AUTHORITY_FAILURE","monotonic ledger integrity")

def nightmare_checkpoint(i):
    raw=execm.verify_checkpoint(execm.seal_checkpoint(waiting(i,role="QA"),key="secret"),key="secret")
    raw["role"]="ACCEPTANCE";raw["branch"]="main"
    return execm.resume_external(raw,{"run_id":str(1000+i),"head_sha":"abc123","status":"completed","conclusion":"success"})
family(6,"nightmare_checkpoint_role_branch_laundering",25,"DENY",nightmare_checkpoint,"execution_machine","CRITICAL","post-verify state edits cannot launder role/branch",["checkpoint","role_laundering","branch_drift"],"AUTHORITY_FAILURE","atomic sealed-checkpoint resume")

def nightmare_forged_approval(i):
    f={"capabilities":["DEPLOY"],"envelope_sha256":"not-real","allow_paths":["**"]}
    return approval.propose_action(f,capability="DEPLOY",operation="deploy",parameters={"env":"prod","i":i},target_state={"release":"x"})
family(6,"nightmare_forged_envelope_sensitive_proposal",25,"DENY",nightmare_forged_approval,"action_approval","CRITICAL","sensitive proposal requires authenticated authority envelope",["forgery","deploy","approval"],"AUTHORITY_FAILURE","verify authority envelope before proposal")

by_level=defaultdict(Counter);by_family=defaultdict(Counter)
for r in RESULTS:
    by_level[r["level"]][r["status"]]+=1;by_family[r["family"]][r["status"]]+=1
mis=[r for r in RESULTS if r["status"]!="PASS"]
summary={
 "test":"TEST 3 Progressive Overload","source_sha":os.environ.get("GITHUB_SHA"),
 "total":len(RESULTS),"passed":len(RESULTS)-len(mis),"misbehavior_count":len(mis),
 "levels":{str(k):dict(v) for k,v in sorted(by_level.items())},
 "families":{k:dict(v) for k,v in sorted(by_family.items())},
 "misbehavior_families":sorted({r["family"] for r in mis})
}
(ROOT/"test3-report.json").write_text(json.dumps({"summary":summary,"results":RESULTS},indent=2)+"\n")
(ROOT/"test3-misbehavior.jsonl").write_text("".join(json.dumps(r,sort_keys=True)+"\n" for r in mis))
(ROOT/"test3-family-summary.json").write_text(json.dumps(summary,indent=2)+"\n")
print(json.dumps(summary,indent=2))
print("MISBEHAVIOR FAMILY EXEMPLARS")
seen=set()
for r in mis:
    if r["family"] in seen: continue
    seen.add(r["family"])
    print(json.dumps({k:r[k] for k in ["scenario_id","level","family","severity","component","expected_behavior","observed_behavior","correction_hypothesis"]},sort_keys=True))
raise SystemExit(2 if mis else 0)
