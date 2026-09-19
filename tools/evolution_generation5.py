#!/usr/bin/env python3
from __future__ import annotations
import importlib.util, json
from pathlib import Path
ROOT=Path.cwd().resolve()
AUTH=ROOT/"tools"/"forge_authority_kernel.py"
APP=ROOT/"tools"/"forge_action_approval.py"

def red(msg):
    print(json.dumps({"generation":5,"verdict":"RED","reason":msg},indent=2));raise SystemExit(1)

if not APP.exists(): red("missing tools/forge_action_approval.py")

def load(path,name):
    s=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
a=load(AUTH,"auth");m=load(APP,"approval")
for name in ["propose_action","approve_action","verify_approval","ApprovalError"]:
    if not hasattr(m,name): red(f"missing approval API: {name}")

def denied(fn,label):
    try: fn()
    except (m.ApprovalError,a.AuthorityError): return
    red(f"approval violation escaped: {label}")

env=a.make_envelope(role="MAINTAINER",repository="Kirch-Nairu/App",base_sha="abc",branch="release",capabilities=["REPO_READ","REMOTE_GIT_WRITE"],allow_paths=["**"],delegation_depth=0)
proposal=m.propose_action(env,capability="REMOTE_GIT_WRITE",operation="git_push",parameters={"remote":"origin","branch":"release","candidate_sha":"abc"},target_state={"remote_branch":"release","expected_before_sha":"def"})
token=m.approve_action(proposal,approver="HUMAN_TECHNICAL_AUTHORITY",key="approval-secret",approval_id="A-001")
assert m.verify_approval(token,proposal,key="approval-secret") is True

# exact arguments are bound
for field,value in [("branch","other"),("candidate_sha","evil"),("remote","upstream")]:
    changed=json.loads(json.dumps(proposal));changed["parameters"][field]=value
    denied(lambda changed=changed:m.verify_approval(token,changed,key="approval-secret"),f"changed {field}")

# target state is bound
changed=json.loads(json.dumps(proposal));changed["target_state"]["expected_before_sha"]="moved"
denied(lambda:m.verify_approval(token,changed,key="approval-secret"),"changed target state")

# operation and capability are bound
changed=json.loads(json.dumps(proposal));changed["operation"]="force_push"
denied(lambda:m.verify_approval(token,changed,key="approval-secret"),"changed operation")
changed=json.loads(json.dumps(proposal));changed["capability"]="DEPLOY"
denied(lambda:m.verify_approval(token,changed,key="approval-secret"),"changed capability")

# envelope identity is bound
other=a.make_envelope(role="MAINTAINER",repository="Kirch-Nairu/App",base_sha="abc",branch="other",capabilities=["REPO_READ","REMOTE_GIT_WRITE"],allow_paths=["**"],delegation_depth=0)
changed=json.loads(json.dumps(proposal));changed["envelope_sha256"]=other["envelope_sha256"]
denied(lambda:m.verify_approval(token,changed,key="approval-secret"),"changed authority envelope")

# approval cannot create a capability absent from envelope
no_remote=a.make_envelope(role="MAINTAINER",repository="Kirch-Nairu/App",base_sha="abc",branch="release",capabilities=["REPO_READ"],allow_paths=["**"],delegation_depth=0)
denied(lambda:m.propose_action(no_remote,capability="REMOTE_GIT_WRITE",operation="git_push",parameters={},target_state={}),"approval laundering missing capability")

# signing key is mandatory and exact
denied(lambda:m.approve_action(proposal,approver="HUMAN",key="",approval_id="A-2"),"empty signing key")
denied(lambda:m.verify_approval(token,proposal,key="wrong"),"wrong signing key")

# token carries no blanket permission
assert token["approval_id"]=="A-001"
assert token["action_sha256"]==proposal["action_sha256"]

print(json.dumps({"generation":5,"verdict":"GREEN","checks":13,"mechanic":"exact_action_approval"},indent=2))
