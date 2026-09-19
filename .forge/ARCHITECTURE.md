# KIRION Forge Architecture

## Architectural thesis

Forge is an engineering control system around AI agents rather than a monolithic autonomous developer.

Its performance principle is [Decision Surface Compression](../doctrine/decision-surface-compression.md): move repeatable project-wide reasoning into durable structures while preserving local engineering judgment.

## Major flow

```text
HUMAN TECHNICAL AUTHORITY
          ↓
      BOOTSTRAP
          ↓
 ROLE + CAPABILITY + AUTHORITY
          ↓
 PROJECT MEMORY + FORGE DOCTRINE
          ↓
       MAINTAINER
          ↓
    BOUNDED HANDOFF
          ↓
      CODE WRITER
          ↓
 SANDBOX + CANDIDATE + EVIDENCE
          ↓
 REVIEW / ACCEPTANCE
          ↓
 INTEGRATION when required
          ↓
 AUTHORIZED PROMOTION
          ↓
 OBSERVATION + MEMORY RECONCILIATION
```

## Operational layers

- `memory/` — lifecycle, reconciliation, compaction, continuity.
- `git/` — exact authority, branch semantics, promotion, rollback, recovery.
- `testing/` — risk-selected validation, failure taxonomy, evidence.
- `sandbox/` — recoverable Sandbox Capsules and environment fingerprinting.
- `security/` — instruction trust, destructive-action and secret boundaries.
- `parallel/` — active work, ownership, dependency, collision, ordering.
- `state-machine/` — legal lifecycle transitions.
- `checklists/` — repeated reasoning compressed into answerable preflights/gates.
- `schemas/` — machine-readable structural contracts.
- `tools/` and CI — read-only structural conformance checks.

## Progressive loading

Subsystem READMEs state what to load, when, what is canonical, and what they depend on. Historical context remains cold unless a current decision needs it.

## Maturity restriction

Tooling may evaluate mechanical predicates, but it cannot self-declare Forge NEST-4. Accepted maturity remains Maintainer-controlled and evidence-based.
