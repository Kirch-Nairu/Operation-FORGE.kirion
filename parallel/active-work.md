# Active Work Ledger

The Active Work Ledger is durable coordination, not a locking service.

Minimum fields:

```text
WRITER_ID
ROLE
BRANCH
SOURCE_SHA
OWNERSHIP
DEPENDENCIES
STATUS
BLOCKERS
EXPECTED_INTEGRATION_ORDER
```

Allowed statuses:

`PLANNED`, `ACTIVE`, `BLOCKED`, `CANDIDATE_READY`, `ACCEPTED`, `REJECTED`, `QUARANTINED`, `INTEGRATED`.

Update the ledger when status materially changes. Do not use `ACCEPTED` or `INTEGRATED` merely because a branch exists or tests passed.

Use [templates/ACTIVE_WORK_LEDGER.template.md](../templates/ACTIVE_WORK_LEDGER.template.md).
