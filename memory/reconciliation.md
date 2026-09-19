# Memory Reconciliation

Memory is a representation of project truth, not the source of physical reality.

## Conflict rules

### memory != Git

Verify repository, ref, and SHA. Observable Git wins. Do not rewrite Git to make memory appear correct. Correct memory through an authorized governance update.

### memory != runtime

Reproduce or directly observe runtime behavior when possible. Runtime evidence wins for claims about current behavior. Determine whether source, deployment, configuration, data, or memory is stale.

### handoff != branch

Treat this as authority drift unless the handoff defines a safe recovery path. A writer must not silently rebase the assignment onto the new state.

### SSOT != observed behavior

Record the discrepancy. Determine whether the SSOT is stale, the runtime is on a different candidate, or an implementation defect exists. Do not let either document or runtime erase the need for classification.

## Reconciliation record

A material reconciliation should identify:

- conflicting records/states;
- observed authoritative state;
- evidence used;
- impacted claims;
- authorized correction;
- records to supersede;
- follow-up validation.

Observed authority wins; stale memory is then corrected through the proper authority process.
