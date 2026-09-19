#!/usr/bin/env python3
from __future__ import annotations
import importlib.util, json, sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
MOD=ROOT/"tools"/"forge_execution_machine.py"

def fail(msg):
    print(json.dumps({"generation":2,"verdict":"RED","reason":msg},indent=2))
    raise SystemExit(1)

if not MOD.exists():
    fail("Missing executable resumable external-work state machine: tools/forge_execution_machine.py")

spec=importlib.util.spec_from_file_location("forge_execution_machine",MOD)
m=importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)

required=["new_execution","transition","resume_external","ExecutionError"]
for name in required:
    if not hasattr(m,name): fail(f"execution machine missing API: {name}")

def expect_error(fn,label):
    try: fn()
    except m.ExecutionError: return
    fail(f"negative scenario escaped: {label}")

# 1. happy path: exact external run is observed, checkpointed, resumed, reconciled
s=m.new_execution(role="QUALITY_ASSURANCE",branch="qa-branch",head_sha="abc123")
s=m.transition(s,"BEGIN_MEDIUM",{})
s=m.transition(s,"EXTERNAL_RUN_OBSERVED",{"run_id":"42","expected_head":"abc123","checkpoint_persisted":True})
assert s["state"]=="WAITING_EXTERNAL"
s=m.resume_external(s,{"run_id":"42","head_sha":"abc123","status":"completed","conclusion":"success"})
assert s["state"]=="RECONCILING_EXTERNAL"
s=m.transition(s,"RECONCILE_SUCCESS",{})
assert s["state"]=="ACTIVE_LIGHT"

# 2. cannot wait without an actually observed run
expect_error(lambda: m.transition(m.new_execution(role="QA",branch="b",head_sha="h"),"WAIT_EXTERNAL",{}),"wait without observed run")

# 3. cannot enter WAITING_EXTERNAL without durable checkpoint
s=m.new_execution(role="QA",branch="b",head_sha="h")
s=m.transition(s,"BEGIN_MEDIUM",{})
expect_error(lambda: m.transition(s,"EXTERNAL_RUN_OBSERVED",{"run_id":"1","expected_head":"h","checkpoint_persisted":False}),"wait without checkpoint")

# 4. resume must recover exact run identity
s=m.new_execution(role="QA",branch="b",head_sha="h")
s=m.transition(s,"BEGIN_MEDIUM",{})
s=m.transition(s,"EXTERNAL_RUN_OBSERVED",{"run_id":"7","expected_head":"h","checkpoint_persisted":True})
expect_error(lambda: m.resume_external(s,{"run_id":"8","head_sha":"h","status":"completed","conclusion":"success"}),"wrong run id")

# 5. resume must recover exact expected SHA
expect_error(lambda: m.resume_external(s,{"run_id":"7","head_sha":"other","status":"completed","conclusion":"success"}),"wrong external head")

# 6. queued/in-progress resume remains waiting, never fabricated complete
s2=m.resume_external(s,{"run_id":"7","head_sha":"h","status":"in_progress","conclusion":None})
assert s2["state"]=="WAITING_EXTERNAL"

# 7. product defect returns authority instead of QA repairing product
s3=m.resume_external(s,{"run_id":"7","head_sha":"h","status":"completed","conclusion":"failure"})
assert s3["state"]=="RECONCILING_EXTERNAL"
s3=m.transition(s3,"CLASSIFY_FAILURE",{"classification":"PRODUCT_DEFECT"})
assert s3["state"]=="REWORK_REQUIRED"

# 8. harness defect may authorize bounded QA mechanics only
s4=m.resume_external(s,{"run_id":"7","head_sha":"h","status":"completed","conclusion":"failure"})
s4=m.transition(s4,"CLASSIFY_FAILURE",{"classification":"HARNESS_DEFECT"})
assert s4["state"]=="ACTIVE_MEDIUM"

# 9. unresolved environment failure blocks
s5=m.resume_external(s,{"run_id":"7","head_sha":"h","status":"completed","conclusion":"failure"})
s5=m.transition(s5,"CLASSIFY_FAILURE",{"classification":"ENVIRONMENT_UNRESOLVED"})
assert s5["state"]=="BLOCKED"

# 10. role cannot silently change during resume
s6=m.new_execution(role="REVIEWER",branch="b",head_sha="h")
s6=m.transition(s6,"BEGIN_MEDIUM",{})
s6=m.transition(s6,"EXTERNAL_RUN_OBSERVED",{"run_id":"9","expected_head":"h","checkpoint_persisted":True})
expect_error(lambda: m.resume_external(s6,{"run_id":"9","head_sha":"h","status":"completed","conclusion":"success","role":"ACCEPTANCE"}),"role laundering on resume")

# 11. branch/head drift before external launch blocks the transition
s7=m.new_execution(role="QA",branch="b",head_sha="h")
s7=m.transition(s7,"BEGIN_MEDIUM",{})
expect_error(lambda: m.transition(s7,"EXTERNAL_RUN_OBSERVED",{"run_id":"10","expected_head":"other","checkpoint_persisted":True}),"head drift before wait")

# 12. external failure cannot be treated as success without classification
s8=m.new_execution(role="QA",branch="b",head_sha="h")
s8=m.transition(s8,"BEGIN_MEDIUM",{})
s8=m.transition(s8,"EXTERNAL_RUN_OBSERVED",{"run_id":"11","expected_head":"h","checkpoint_persisted":True})
s8=m.resume_external(s8,{"run_id":"11","head_sha":"h","status":"completed","conclusion":"failure"})
expect_error(lambda: m.transition(s8,"RECONCILE_SUCCESS",{}),"failed run reconciled as success")

# 13. completion requires explicit finalization
s9=m.new_execution(role="QA",branch="b",head_sha="h")
s9=m.transition(s9,"FINALIZE",{})
assert s9["state"]=="FINALIZING"
s9=m.transition(s9,"COMPLETE",{})
assert s9["state"]=="COMPLETE"

# 14. completed execution is immutable
expect_error(lambda: m.transition(s9,"BEGIN_MEDIUM",{}),"mutation after complete")

# 15. snapshot is JSON serializable/durable
json.dumps(s9,sort_keys=True)

print(json.dumps({"generation":2,"verdict":"GREEN","scenarios":15,"mechanic":"resumable_external_execution"},indent=2))
