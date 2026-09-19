#!/usr/bin/env python3
from __future__ import annotations
import importlib.util, json
from pathlib import Path
ROOT=Path.cwd().resolve()

def load(path,name):
 s=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
a=load(ROOT/"tools/forge_authority_kernel.py","auth")
m=load(ROOT/"tools/forge_action_approval.py","approval")
def red(msg):
 print(json.dumps({"generation":6,"verdict":"RED","reason":msg},indent=2));raise SystemExit(1)
if not hasattr(m,"ApprovalLedger"): red("missing durable ApprovalLedger replay protection")

env=a.make_envelope(role="MAINTAINER",repository="Kirch-Nairu/App",base_sha="abc",branch="release",capabilities=["REMOTE_GIT_WRITE"],allow_paths=["**"],delegation_depth=0)
p=m.propose_action(env,capability="REMOTE_GIT_WRITE",operation="git_push",parameters={"branch":"release","sha":"abc"},target_state={"before":"def"})
t=m.approve_action(p,approver="HUMAN",key="secret",approval_id="A-ONE")

ledger=m.ApprovalLedger()
assert ledger.consume(t,p,key="secret") is True
try: ledger.consume(t,p,key="secret")
except m.ApprovalError: pass
else: red("same approval token replayed in same session")

# consumption must survive serialization/resumption
snapshot=ledger.to_dict()
ledger2=m.ApprovalLedger.from_dict(snapshot)
try: ledger2.consume(t,p,key="secret")
except m.ApprovalError: pass
else: red("approval replayed after ledger resume")

# a separately authorized token for the same exact action is independently consumable
t2=m.approve_action(p,approver="HUMAN",key="secret",approval_id="A-TWO")
assert ledger2.consume(t2,p,key="secret") is True

# failed verification must not consume the token
t3=m.approve_action(p,approver="HUMAN",key="secret",approval_id="A-THREE")
try: ledger2.consume(t3,p,key="wrong")
except m.ApprovalError: pass
else: red("wrong key unexpectedly consumed approval")
assert ledger2.consume(t3,p,key="secret") is True

# ledger entries bind approval id and action identity
snap=ledger2.to_dict()
assert len(snap["consumed"])==3
assert all("approval_id" in x and "action_sha256" in x for x in snap["consumed"])

print(json.dumps({"generation":6,"verdict":"GREEN","checks":7,"mechanic":"durable_one_use_approval_consumption"},indent=2))
