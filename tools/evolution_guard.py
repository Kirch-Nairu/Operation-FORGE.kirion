#!/usr/bin/env python3
from __future__ import annotations
import argparse, json, sys
from pathlib import Path

EXPECTED_BASELINE="da4aacd036fc39bf6271874bd4508ed314dc0551"
EXPECTED_BRANCH="KIRCH-FORGE-ENTITY-EVOLUTION-TEST-2"
EXPECTED_AUTHORITY="Cognition may require context/evidence but cannot grant mutation, acceptance, promotion, deployment, or other Forge authority."

def load(path:Path):
    return json.loads(path.read_text(encoding="utf-8"))

def main()->int:
    ap=argparse.ArgumentParser()
    ap.add_argument("--root",default=".")
    ap.add_argument("--branch",default=None)
    ap.add_argument("--generation",type=int,default=1)
    args=ap.parse_args()
    root=Path(args.root).resolve()
    failures=[]
    def req(cond,msg):
        if not cond: failures.append(msg)
    try:
        manifest=load(root/"ENTITY_MANIFEST.json")
        policy=load(root/"experiments/test-2/POLICY.json")
        fitness=load(root/"experiments/test-2/FITNESS_MODEL.json")
        gen_path=root/f"experiments/test-2/GENERATION-{args.generation:03d}.json"
        generation=load(gen_path) if gen_path.exists() else load(root/"experiments/test-2/GENERATION-000.json")
        agents=(root/"AGENTS.md").read_text(encoding="utf-8")
        doctrine_path=root/"doctrine/self-evolution-sandbox.md"
        doctrine=doctrine_path.read_text(encoding="utf-8") if doctrine_path.exists() else ""
        ledger_path=root/"experiments/test-2/EXPERIMENT_LEDGER.jsonl"
        ledger_lines=[x for x in ledger_path.read_text(encoding="utf-8").splitlines() if x.strip()] if ledger_path.exists() else []
    except Exception as e:
        print(f"EVOLUTION GUARD: FAIL — unreadable required state: {e}")
        return 1

    req(manifest.get("authority_invariant")==EXPECTED_AUTHORITY,"entity authority invariant drifted")
    req(manifest.get("control_plane",{}).get("authority")=="canonical","Forge control-plane authority drifted")
    req(manifest.get("cognition_plane",{}).get("authority")=="derived-for-cognition","cognition authority drifted")

    branch=args.branch or generation.get("experiment_branch")
    req(branch==EXPECTED_BRANCH,f"unexpected experiment branch: {branch}")
    req(branch!="main","self-evolution may not execute on main")

    expected_policy={
      "isolate_branch":True,
      "main_write_from_experiment":False,
      "simulation_implies_promotion":False,
      "cognition_can_expand_authority":False,
      "child_authority_subset":True,
      "self_acceptance":False,
      "stale_state_blocks":True,
      "observer_notes_authoritative":False,
      "evaluator_mutation_same_generation":False,
      "external_wait_requires_checkpoint":True,
      "evidence_must_match_observation":True,
      "regression_requires_explanation":True,
    }
    for k,v in expected_policy.items():
        req(policy.get(k) is v,f"policy invariant failed: {k} expected {v!r}")

    base=generation.get("baseline",{})
    req(base.get("branch")=="main","generation baseline branch must be main")
    req(base.get("sha")==EXPECTED_BASELINE,"generation baseline SHA drifted")
    req(generation.get("experiment_branch")==EXPECTED_BRANCH,"generation experiment branch drifted")
    req(generation.get("promotion_status")=="NOT_AUTHORIZED","experiment attempted to authorize its own promotion")

    hard=set(fitness.get("hard_constraints",[]))
    req({"authority_integrity","evidence_honesty"}.issubset(hard),"fitness hard constraints weakened")

    req("[doctrine/self-evolution-sandbox.md](doctrine/self-evolution-sandbox.md)" in agents,"AGENTS.md lost self-evolution doctrine entrypoint")
    for phrase in [
        "Self-modification is not self-authorization",
        "No self-promotion",
        "Evaluator independence within a generation",
        "Observer notes are not authority",
        "Main remains protected",
    ]:
        req(phrase.lower() in doctrine.lower(),f"self-evolution doctrine lost invariant phrase: {phrase}")

    req(bool(ledger_lines),"experiment ledger missing or empty")
    seq=[]
    for line in ledger_lines:
        try: seq.append(int(json.loads(line)["sequence"]))
        except Exception: failures.append("experiment ledger contains malformed event")
    if seq:
        req(seq==list(range(len(seq))),f"experiment ledger sequence is not contiguous: {seq}")

    if failures:
        print("EVOLUTION GUARD: FAIL")
        for f in failures: print(f"- {f}")
        return 1
    print("EVOLUTION GUARD: PASS")
    print(f"branch={branch}")
    print(f"generation={args.generation}")
    print(f"baseline={EXPECTED_BASELINE}")
    return 0

if __name__=="__main__":
    raise SystemExit(main())
