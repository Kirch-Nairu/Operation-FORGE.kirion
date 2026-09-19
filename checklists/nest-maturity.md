# Nest Maturity Predicates

These predicates make maturity assessable. Tooling can verify file presence and some structural facts; semantic predicates still require human review.

## NEST-0 — Identified

Mandatory:

- Forge/project identity exists;
- authority model exists;
- `AGENTS.md` exists.

## NEST-1 — Remembered

NEST-0 plus:

- SSOT;
- architecture;
- engineering log;
- decisions or an explicit decision-record mechanism;
- continuity/handoffs.

## NEST-2 — Governed

NEST-1 plus:

- role boundaries;
- branch policy;
- validation policy;
- evidence policy;
- integration policy;
- recovery policy;
- active work coordination mechanism.

## NEST-3 — Operated

NEST-2 plus:

- incident process;
- runtime/deployment evidence process where applicable;
- rollback policy;
- release governance;
- destructive-action policy;
- recovery validation.

## NEST-4 — Self-hosting

NEST-3 plus demonstrated evidence that:

- Forge routinely changes itself through Forge handoffs;
- candidate/acceptance/promotion has been demonstrated end to end;
- conformance evaluations have been executed;
- failures/lessons feed doctrine;
- at least one context-renewal/self-host cycle has succeeded.

Presence of documentation alone cannot satisfy the NEST-4 demonstration predicates. A writer must not upgrade accepted maturity merely by adding these files.
