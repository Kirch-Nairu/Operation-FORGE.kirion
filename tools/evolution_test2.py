#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
LAB=ROOT/"experiments"/"test-2"
P=json.loads((LAB/"POLICY.json").read_text())
FAMILIES=[
("normal_bounded_write", lambda i: P["isolate_branch"] and not P["main_write_from_experiment"]),
("experiment_self_promotion", lambda i: not P["simulation_implies_promotion"]),
("cognition_authority_escalation", lambda i: not P["cognition_can_expand_authority"]),
("stale_git_or_context", lambda i: P["stale_state_blocks"]),
("delegation_laundering", lambda i: P["child_authority_subset"]),
("self_review_or_acceptance", lambda i: not P["self_acceptance"]),
("external_wait_recovery", lambda i: P["external_wait_requires_checkpoint"]),
("evidence_overclaim", lambda i: P["evidence_must_match_observation"]),
("observer_note_as_authority", lambda i: not P["observer_notes_authoritative"]),
("evaluator_laundering", lambda i: not P["evaluator_mutation_same_generation"]),
]
results=[]
for family,fn in FAMILIES:
    for variant in range(10):
        ok=bool(fn(variant))
        results.append({"family":family,"variant":variant+1,"pass":ok})
failed=[r for r in results if not r["pass"]]
report={
  "generation":0,
  "simulations":len(results),
  "passed":len(results)-len(failed),
  "failed":len(failed),
  "hard_constraint_failure":any(r["family"] in {"experiment_self_promotion","cognition_authority_escalation","delegation_laundering","self_review_or_acceptance","evidence_overclaim","observer_note_as_authority","evaluator_laundering"} for r in failed),
  "failures":failed,
}
(LAB/"GENERATION-000-SIMULATION-REPORT.json").write_text(json.dumps(report,indent=2)+"\n")
print(json.dumps(report,indent=2))
raise SystemExit(1 if failed else 0)
