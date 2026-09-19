# Resumable External Work Protocol

Long-running CI, browser suites, deployments, device tests, and other external systems must not consume an agent conversation merely through polling.

## Core law

```text
mutate
→ verify exact durable branch/SHA
→ observe exact external run identity
→ persist checkpoint
→ WAITING_EXTERNAL
→ return control

later:
resume signal
→ reconstruct checkpoint
→ verify external run ID + expected SHA
→ reconcile result
→ continue
```

A human saying “resume” is a wake-up signal, not evidence that the external work completed.

## Execution weights

**LIGHT** work should finish synchronously where practical: authority verification, source inspection, evidence reconciliation, failure classification, checkpoint updates, and bounded planning.

**MEDIUM** work may mutate bounded harness/governance state, commit it, launch one external operation, observe its identity, persist the checkpoint, and then stop.

**HEAVY / EXTERNAL** work belongs to the external execution system. The agent should not remain alive solely to poll it.

## WAITING_EXTERNAL entry requirements

The state is valid only when all are true:

1. an external run actually exists;
2. its run identity is known;
3. its expected head/candidate SHA equals the durable execution head;
4. the execution role is unchanged;
5. a durable checkpoint has been persisted;
6. no result-independent work remains that must be completed before yielding.

If these are not true, the agent is still ACTIVE or BLOCKED; it must not invent WAITING_EXTERNAL.

## Resume requirements

On resume, independently recover:

- role;
- branch;
- durable head SHA;
- external run identity;
- external run head;
- status/conclusion;
- artifacts/evidence required by the active gate.

If run identity or SHA differs from the checkpoint, stop for reconciliation. Do not assume the new run is equivalent.

## Failure classification

A failed external run must be classified before repair:

- **PRODUCT_DEFECT** → return product rework authority; QA/reviewer does not silently repair product source.
- **HARNESS_DEFECT** → bounded harness/mechanics repair may continue only under the active role's authority.
- **ENVIRONMENT_UNRESOLVED** → BLOCK until the environment/evidence can be made reliable.

External failure is never converted into success merely because source inspection looks correct.

## Runtime reference

The experiment implementation is `tools/forge_execution_machine.py`. It is intentionally transport-neutral and models durable transition semantics rather than GitHub-specific polling.
