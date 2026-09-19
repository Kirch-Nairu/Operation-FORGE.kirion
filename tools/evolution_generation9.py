#!/usr/bin/env python3
from __future__ import annotations
import importlib.util, json
from pathlib import Path
import sys
ROOT=Path.cwd().resolve()
TOOLS=ROOT/"tools"
if str(TOOLS) not in sys.path: sys.path.insert(0,str(TOOLS))
import forge_authority_kernel as a
import forge_action_approval as p
def load(path,name):
 s=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
MOD=ROOT/"tools"/"forge_tool_broker.py"
def red(msg): print(json.dumps({"generation":9,"verdict":"RED","reason":msg},indent=2));raise SystemExit(1)
if not MOD.exists(): red("missing tools/forge_tool_broker.py")
b=load(MOD,"broker")
for n in ["ToolBroker","ToolBrokerError"]:
 if not hasattr(b,n): red(f"missing broker API: {n}")
def denied(fn,label):
 try: fn()
 except (b.ToolBrokerError,a.AuthorityError,p.ApprovalError): return
 red(f"broker boundary escaped: {label}")

calls=[]
broker=b.ToolBroker()
broker.register("read_file",capability="REPO_READ",handler=lambda **kw:calls.append(("read",kw)) or "ok")
broker.register("write_file",capability="WORKTREE_WRITE",path_arg="path",handler=lambda **kw:calls.append(("write",kw)) or "ok")
broker.register("push",capability="REMOTE_GIT_WRITE",sensitive=True,handler=lambda **kw:calls.append(("push",kw)) or "pushed")

env=a.make_envelope(role="MAINTAINER",repository="Kirch-Nairu/App",base_sha="abc",branch="release",capabilities=["REPO_READ","WORKTREE_WRITE","REMOTE_GIT_WRITE"],allow_paths=["src/**"],delegation_depth=0)
assert broker.execute("read_file",env,{"path":"src/a.py"})=="ok"
assert broker.execute("write_file",env,{"path":"src/a.py","content":"x"})=="ok"
denied(lambda:broker.execute("write_file",env,{"path":".forge/x","content":"x"}),"out-of-scope write")
denied(lambda:broker.execute("push",env,{"remote":"origin","branch":"release","candidate_sha":"abc"},target_state={"before":"def"}),"sensitive action without approval")

proposal=broker.proposal_for("push",env,{"remote":"origin","branch":"release","candidate_sha":"abc"},target_state={"before":"def"})
token=p.approve_action(proposal,approver="HUMAN",key="secret",approval_id="push-1")
ledger=p.ApprovalLedger()
assert broker.execute("push",env,{"remote":"origin","branch":"release","candidate_sha":"abc"},target_state={"before":"def"},approval_token=token,approval_key="secret",approval_ledger=ledger)=="pushed"
denied(lambda:broker.execute("push",env,{"remote":"origin","branch":"release","candidate_sha":"abc"},target_state={"before":"def"},approval_token=token,approval_key="secret",approval_ledger=ledger),"approval replay through broker")

# visible/registered tool cannot bypass missing capability
weak=a.make_envelope(role="REVIEWER",repository="Kirch-Nairu/App",base_sha="abc",branch="review",capabilities=["REPO_READ"],allow_paths=["src/**"],delegation_depth=0)
denied(lambda:broker.execute("write_file",weak,{"path":"src/a.py","content":"evil"}),"registered tool implies write authority")
denied(lambda:broker.proposal_for("push",weak,{"remote":"origin"},target_state={}),"proposal for missing capability")

# denials occur before handler side effects
push_calls=[x for x in calls if x[0]=="push"]
write_calls=[x for x in calls if x[0]=="write"]
assert len(push_calls)==1
assert len(write_calls)==1

# unknown tools fail closed
denied(lambda:broker.execute("does_not_exist",env,{}),"unknown tool")

print(json.dumps({"generation":9,"verdict":"GREEN","checks":12,"mechanic":"narrow_waist_tool_broker"},indent=2))
