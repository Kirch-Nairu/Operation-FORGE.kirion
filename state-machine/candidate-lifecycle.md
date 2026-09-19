# Candidate Lifecycle

Canonical states:

```text
PLANNED
→ AUTHORIZED
→ ACTIVE
→ BLOCKED / READY
→ UNDER_REVIEW
→ ACCEPTED / REWORK / REJECTED / QUARANTINED
→ INTEGRATED
→ PROMOTED
→ OBSERVED
```

## Legal transitions

- `PLANNED → AUTHORIZED`: Maintainer/human grants bounded authority.
- `AUTHORIZED → ACTIVE`: preflight succeeds and implementation begins.
- `ACTIVE → BLOCKED`: a stop condition/dependency prevents safe continuation.
- `ACTIVE → READY`: candidate and writer validation/report are complete.
- `READY → UNDER_REVIEW`: reviewer/acceptance work begins.
- `UNDER_REVIEW → ACCEPTED|REWORK|REJECTED|QUARANTINED`: independent result.
- `ACCEPTED → INTEGRATED`: when combination is required.
- `ACCEPTED|INTEGRATED → PROMOTED`: only after promotion authorization and precheck.
- `PROMOTED → OBSERVED`: post-promotion/deployed/operational observation as applicable.

## Illegal examples

- `ACTIVE → PROMOTED` by the writer;
- `READY → ACCEPTED` solely because CI is green;
- `REJECTED → PROMOTED` without a new authorized/reviewed state;
- `QUARANTINED → AUTHORITY` by ref rename alone.

Tooling may report state; doctrine/authority decides transitions.
