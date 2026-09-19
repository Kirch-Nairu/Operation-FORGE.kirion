# TEST 3 — Progressive Overload Behavioral Gauntlet

Source candidate: KIRCH-FORGE-ENTITY-EVOLUTION-TEST-2@80e3656a00dad5c0e3c22e38cad8a0f54bdd115d

Test 3 is cumulative behavioral stress. Every harder level keeps earlier regression families alive.

Initial baseline: 700 deterministic executable state/harness scenarios from clean-room behavior through hostile combined failures.

Audit outputs:
- test3-report.json
- test3-misbehavior.jsonl
- test3-family-summary.json

A red run completes the full corpus before failing so later defects are not hidden by the first mismatch.

These are executable harness/state simulations, not 700 independent LLM inference calls. The same corpus is intended to become an external-model/Qwen evaluation set later.
