#!/usr/bin/env python3
from __future__ import annotations
import importlib.util, json
from pathlib import Path
ROOT=Path.cwd().resolve()
MOD=ROOT/"tools"/"forge_execution_machine.py"

def red(msg):
    print(json.dumps({"generation":3,"verdict":"RED","reason":msg},indent=2))
    raise SystemExit(1)

spec=importlib.util.spec_from_file_location("fem",MOD)
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
for name in ["seal_checkpoint","verify_checkpoint","CheckpointIntegrityError"]:
    if not hasattr(m,name): red(f"missing checkpoint integrity API: {name}")

state=m.new_execution(role="QA",branch="qa",head_sha="abc")
state=m.transition(state,"BEGIN_MEDIUM",{})
state=m.transition(state,"EXTERNAL_RUN_OBSERVED",{"run_id":"99","expected_head":"abc","checkpoint_persisted":True})

# unsigned SHA-256 envelope is tamper-evident
env=m.seal_checkpoint(state)
assert env["integrity_mode"]=="SHA256"
assert m.verify_checkpoint(env) == state
bad=json.loads(json.dumps(env))
bad["state"]["head_sha"]="evil"
try: m.verify_checkpoint(bad)
except m.CheckpointIntegrityError: pass
else: red("state tampering escaped SHA256 checkpoint verification")

# digest tampering is rejected
bad=json.loads(json.dumps(env));bad["integrity_sha256"]="0"*64
try: m.verify_checkpoint(bad)
except m.CheckpointIntegrityError: pass
else: red("integrity digest tampering escaped")

# HMAC mode requires the server-held key
signed=m.seal_checkpoint(state,key="server-secret")
assert signed["integrity_mode"]=="HMAC_SHA256"
assert m.verify_checkpoint(signed,key="server-secret")==state
for key in [None,"wrong-secret"]:
    try: m.verify_checkpoint(signed,key=key)
    except m.CheckpointIntegrityError: pass
    else: red("HMAC checkpoint verified without the correct key")

# runtime upgraded to HMAC must not silently trust old unsigned checkpoints
try: m.verify_checkpoint(env,key="server-secret")
except m.CheckpointIntegrityError: pass
else: red("unsigned checkpoint remained trusted after HMAC requirement appeared")

# role/external run edits are covered by the envelope
for mutate in [
    lambda x: x["state"].__setitem__("role","ACCEPTANCE"),
    lambda x: x["state"]["external"].__setitem__("run_id","100"),
    lambda x: x["state"].__setitem__("branch","main"),
]:
    b=json.loads(json.dumps(signed));mutate(b)
    try: m.verify_checkpoint(b,key="server-secret")
    except m.CheckpointIntegrityError: pass
    else: red("authority-bearing checkpoint mutation escaped")

print(json.dumps({"generation":3,"verdict":"GREEN","checks":9,"mechanic":"tamper_evident_execution_checkpoint"},indent=2))
