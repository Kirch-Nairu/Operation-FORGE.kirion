#!/usr/bin/env python3
from __future__ import annotations
import importlib.util, json
from pathlib import Path
ROOT=Path.cwd().resolve()
MOD=ROOT/"tools"/"forge_fresh_verifier.py"

def red(msg):
 print(json.dumps({"generation":7,"verdict":"RED","reason":msg},indent=2));raise SystemExit(1)
if not MOD.exists(): red("missing tools/forge_fresh_verifier.py")
s=importlib.util.spec_from_file_location("fv",MOD);m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
for n in ["make_verification_request","record_verification","verify_result","VerificationError"]:
 if not hasattr(m,n): red(f"missing fresh-verifier API: {n}")

def denied(fn,label):
 try: fn()
 except (m.VerificationError,TypeError): return
 red(f"verification boundary escaped: {label}")

req=m.make_verification_request(candidate_sha="abc123",claim="login recovers after restart",requirement="session recovery works",procedure=["start app","login","restart","observe session"],worker_id="writer-1",evidence_refs=["test-plan:v1"])
assert req["candidate_sha"]=="abc123"
assert "worker_narrative" not in req
assert "worker_reasoning" not in req

# verifier must be distinct from implementer
denied(lambda:m.record_verification(req,verifier_id="writer-1",outcome="SUPPORTED",observed_evidence=["runtime:ok"]),"self verification")

result=m.record_verification(req,verifier_id="verifier-9",outcome="SUPPORTED",observed_evidence=["runtime:ok"])
assert result["authority"]=="EVIDENCE_ONLY"
assert result["acceptance_authorized"] is False
assert result["promotion_authorized"] is False
assert m.verify_result(result,req) is True

# exact request/candidate is bound
other=m.make_verification_request(candidate_sha="def456",claim=req["claim"],requirement=req["requirement"],procedure=req["procedure"],worker_id="writer-1",evidence_refs=["test-plan:v1"])
denied(lambda:m.verify_result(result,other),"candidate/request substitution")

# result tampering fails
bad=json.loads(json.dumps(result));bad["outcome"]="NOT_SUPPORTED"
denied(lambda:m.verify_result(bad,req),"result outcome tamper")
bad=json.loads(json.dumps(result));bad["acceptance_authorized"]=True
denied(lambda:m.verify_result(bad,req),"verifier self-grants acceptance")
bad=json.loads(json.dumps(result));bad["promotion_authorized"]=True
denied(lambda:m.verify_result(bad,req),"verifier self-grants promotion")

# worker narrative is deliberately not accepted as verification input
denied(lambda:m.make_verification_request(candidate_sha="abc",claim="x",requirement="x",procedure=[],worker_id="w",evidence_refs=[],worker_narrative="I fixed it"),"worker narrative injection")

# only bounded outcomes exist
denied(lambda:m.record_verification(req,verifier_id="v2",outcome="ACCEPT",observed_evidence=[]),"verifier returns acceptance instead of evidence")
inc=m.record_verification(req,verifier_id="v2",outcome="INCONCLUSIVE",observed_evidence=["environment unavailable"])
assert m.verify_result(inc,req)

print(json.dumps({"generation":7,"verdict":"GREEN","checks":11,"mechanic":"fresh_verifier_evidence_only_contract"},indent=2))
