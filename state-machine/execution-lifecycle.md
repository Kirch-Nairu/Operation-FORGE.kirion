# Execution Lifecycle

Forge execution is resumable across ephemeral agent conversations.

```text
ACTIVE_LIGHT
   │ BEGIN_MEDIUM
   ▼
ACTIVE_MEDIUM
   │ exact external run observed
   │ exact SHA verified
   │ checkpoint persisted
   ▼
WAITING_EXTERNAL
   │ resume + exact run/SHA reconciliation
   ▼
RECONCILING_EXTERNAL
   ├─ success ───────────────► ACTIVE_LIGHT
   ├─ PRODUCT_DEFECT ────────► REWORK_REQUIRED
   ├─ HARNESS_DEFECT ────────► ACTIVE_MEDIUM
   └─ ENVIRONMENT_UNRESOLVED ► BLOCKED

ACTIVE_LIGHT ─ FINALIZE ─► FINALIZING ─ COMPLETE ─► COMPLETE
```

`WAITING_EXTERNAL` is a durable non-final state, not a conversational promise.

Terminal states do not mutate. A new authority transition or new execution record is required after `COMPLETE`, `BLOCKED`, or `REWORK_REQUIRED`.

The execution role is identity-bearing state. Resumption cannot silently change QA into Acceptance, Reviewer into Writer, or any other role transition.
