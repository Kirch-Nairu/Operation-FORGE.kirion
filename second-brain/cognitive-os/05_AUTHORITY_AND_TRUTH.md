---
id: BRAIN-TRUTH-0001
type: doctrine
status: APPROVED
authority: doctrine
tags: [truth, authority, evidence]
graph_nonvisual_relations:
  - "decision-engine/CONTRADICTION_ENGINE"
  - "truth/TRUTH_LEDGER"
---
# Authority & Truth

This extends [[second-brain/03_AUTHORITY_ORDER]] into a model that distinguishes **what may be changed** from **what is currently true**.

## Action authority

For intended action, use:

1. explicit current human instruction, when safe and in scope
2. approved project constitution / decision / lane
3. applicable doctrine and protected boundaries
4. agent proposal

Agents may propose changes to higher-order artifacts; they do not silently rewrite them.

## Reality authority

For claims about current implementation or operation, prefer:

1. directly observed production/runtime evidence for what actually happened
2. current repository state for what is implemented
3. current automated/manual verification evidence
4. approved architecture/decision for what is intended
5. matching handoff with valid branch/SHA
6. durable doctrine/patterns
7. prior memory / conversation synthesis

When sources conflict, create a discrepancy instead of picking the convenient answer.

## Evidence classes

- `RUNTIME` — observed process/system behavior
- `REPOSITORY` — source, commit, branch, config, schema
- `AUTOMATED_TEST` — executed test/gate output
- `MANUAL_VERIFICATION` — documented human validation
- `ARTIFACT` — logs, exported reports, screenshots, traces
- `DOCUMENT` — approved plan/decision/specification
- `EXTERNAL_SOURCE` — vendor/standard/public documentation
- `MEMORY` — prior conversation or recollection
- `INFERENCE` — reasoned conclusion from other evidence

## Truth handling rules

- Screenshot = observational evidence, not code proof.
- Test = evidence of tested behavior, not universal production truth.
- Production observation = proof of what occurred, not necessarily what should occur.
- Approved design = intent, not implementation proof.
- Memory = retrieval aid, not authority for volatile state.
- A contradiction creates a conflict record.

## Freshness

Claims about branch, SHA, deployment, current blockers, active permissions, external pricing, dependency behavior, or live infrastructure should carry `last_verified` and may become stale quickly.

## Related

- [[cognitive-os/06_CERTAINTY_AND_EVIDENCE]]
- TRUTH_LEDGER
- [[second-brain/02_MEMORY_MODEL]]

## Graph neighborhood

- [[cognitive-os/CENTRAL_BRAIN]]
- [[cognitive-os/01_SYSTEM_MODEL]]
- [[cognitive-os/03_GOVERNED_OBJECT_MODEL]]
- [[cognitive-os/06_CERTAINTY_AND_EVIDENCE]]
- [[cognitive-os/README]]
