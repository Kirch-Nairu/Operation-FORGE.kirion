# Implementation Surface Map

Before code, map where the project will touch the parent repo.

## Output format

```text
Likely touched:
- database migrations
- repositories/services
- local API endpoints
- UI pages/components
- permissions
- audit events
- reports
- tests/CoreSmoke

Likely untouched:
- installer
- BIR/RMO/eSales
- licensing activation
- unrelated POS flows

Forbidden:
- protected refs
- unapproved paid dependencies
- cloud sync unless approved
```

A surface map prevents random wandering.
