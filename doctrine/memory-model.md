# Memory Model

Forge externalizes project intelligence so execution does not depend on one agent retaining history.

## Tiers

- **Tier 0 — Model knowledge:** general capability; no project authority.
- **Tier 1 — User durable memory:** stable workflow preferences; no changing Git/runtime authority.
- **Tier 2 — Forge doctrine:** portable operating rules.
- **Tier 3 — Project durable memory:** accepted architecture, current authority, decisions, constraints, risks, continuity.
- **Tier 4 — Session state:** transient failure output, local sandbox state, current blocker.

## Progressive loading

Hot, warm, and cold memory are operationalized in [memory/hot-warm-cold.md](../memory/hot-warm-cold.md). The full lifecycle, compaction, supersession, reconciliation, and continuity rules live under [memory/](../memory/README.md).

## Authority rule

When memory conflicts with observable Git or runtime state, observable state wins for the fact being observed. Stale memory is corrected through authorized reconciliation; Git/runtime must not be rewritten merely to make memory look right.

Do not store secrets in durable memory.

## Goal

A fresh agent reconstructs enough current state from project artifacts to continue safely without replaying old conversations.
