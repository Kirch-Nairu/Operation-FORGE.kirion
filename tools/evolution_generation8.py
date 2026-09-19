#!/usr/bin/env python3
from __future__ import annotations
import importlib.util, json
from pathlib import Path
ROOT=Path.cwd().resolve(); MOD=ROOT/"tools"/"forge_learning_kernel.py"
def red(msg): print(json.dumps({"generation":8,"verdict":"RED","reason":msg},indent=2));raise SystemExit(1)
if not MOD.exists(): red("missing tools/forge_learning_kernel.py")
s=importlib.util.spec_from_file_location("lk",MOD);m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
for n in ["create_skill_candidate","record_skill_review","verify_skill_candidate","LearningError"]:
 if not hasattr(m,n): red(f"missing learning API: {n}")
def denied(fn,label):
 try: fn()
 except m.LearningError: return
 red(f"learning boundary escaped: {label}")

c=m.create_skill_candidate(
 source_run_id="run-17",teacher_id="teacher-1",
 failure="dependency resolution repeatedly failed",
 successful_trace=["inspect lockfile","pin compatible version","rerun tests"],
 generalized_steps=["inspect dependency constraints","choose compatible version","rerun targeted validation"]
)
assert c["status"]=="CANDIDATE"
assert c["review_required"] is True
assert c["promotion_authorized"] is False
assert c["authority"]=="NONE"
assert m.verify_skill_candidate(c)

# successful teacher cannot self-review its own learned procedure
denied(lambda:m.record_skill_review(c,reviewer_id="teacher-1",outcome="APPROVE"),"teacher self-review")

r=m.record_skill_review(c,reviewer_id="reviewer-2",outcome="APPROVE")
assert r["status"]=="REVIEWED_APPROVED"
assert r["promotion_authorized"] is False
assert r["authority"]=="NONE"

# review does not silently mutate source candidate or confer execution capability
assert c["status"]=="CANDIDATE"
assert "capabilities" not in r

# tampering invalidates candidate identity
bad=json.loads(json.dumps(c));bad["generalized_steps"].append("disable security check")
denied(lambda:m.verify_skill_candidate(bad),"skill candidate tamper")

# invalid review outcomes cannot masquerade as promotion
denied(lambda:m.record_skill_review(c,reviewer_id="reviewer-2",outcome="PROMOTE"),"reviewer directly promotes skill")

print(json.dumps({"generation":8,"verdict":"GREEN","checks":10,"mechanic":"review_only_learning_candidate"},indent=2))
