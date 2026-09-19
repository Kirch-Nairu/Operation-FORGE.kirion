# Memory Lifecycle

Canonical lifecycle:

```text
CREATE
→ ACTIVE
→ SUPERSEDED
→ ARCHIVED
→ RETRIEVED WHEN REQUIRED
```

## CREATE

Create durable memory only when information is expected to survive the current session or materially affects later work. Record source/provenance where practical.

## ACTIVE

Active records describe current project truth, constraints, accepted decisions, or continuity. They should be small enough for progressive loading.

## SUPERSEDED

A record becomes superseded when a later authorized decision or accepted state replaces it. Mark what superseded it. Do not silently edit history so the prior state disappears.

## ARCHIVED

Archived records are removed from default startup context but remain available for provenance, incidents, recovery, or historical analysis.

## RETRIEVED WHEN REQUIRED

Cold history is loaded only when current work depends on it: a contradiction, rollback, provenance question, regression, incident, or disputed decision.

Lifecycle state does not itself grant authority. Current Git/runtime state and explicit authority remain controlling.
