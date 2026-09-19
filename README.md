# KIRION Forge

**Remember durably. Build aggressively. Promote deliberately.**

KIRION Forge is a maintainer-governed, durable-memory, sandbox-first engineering operating system for coordinating AI-assisted software development through bounded authority, exact-state anchoring, structured handoffs, evidence-gated promotion, controlled integration, and recoverable execution.

> **Agents are ephemeral. Authority is explicit. Evidence is durable. Memory belongs to the project.**

## START HERE — COPY / PASTE BOOTSTRAP

If you are here to actually use Forge, do **not** begin by reading this repository from top to bottom.

Go directly to:

**[`00_START_HERE/`](00_START_HERE/README.md)**

The folder contains copy-paste launchers for:

- Maintainer / first project bootstrap;
- Code Writer;
- Integration Writer.

Attach or provide access to KIRION Forge plus the target project, paste the appropriate launcher into a fresh AI conversation, and let the agent progressively load the canonical repository sources.

The launcher is the first-line handoff surface. The repository remains the durable source of authority, doctrine, memory, evidence rules, and protocols.

## Status

KIRION Forge is in **Genesis** and remains declared **NEST-2 — Governed (Genesis)** until the Maintainer independently accepts and promotes evidence for a later maturity.

The repository history is part of the reference implementation: coherent construction waves, explicit authority boundaries, reviewable commits, durable memory, evidence-based acceptance, and deliberate promotion are design requirements rather than documentation-only claims.

## Core operating rule

> **Move fast inside the sandbox. Move carefully across authority boundaries.**

Forge is not a prompt collection or a monolithic autonomous developer. It is an engineering control system around capable agents. It separates project memory, authority, implementation, validation, integration, acceptance, and promotion so a worker can move quickly without silently becoming the source of truth.

## Operational architecture

Start with [BOOTSTRAP.md](BOOTSTRAP.md), then load only the subsystem needed for the active role:

- [Decision Surface Compression](doctrine/decision-surface-compression.md)
- [Memory](memory/README.md)
- [Git governance](git/README.md)
- [Testing and evidence](testing/README.md)
- [Sandbox recovery](sandbox/README.md)
- [Security and instruction trust](security/README.md)
- [Parallel work](parallel/README.md)
- [State machines](state-machine/README.md)
- [Checklists](checklists/README.md)
- [Schemas](schemas/README.md)
- [Tools](tools/README.md)

Run structural conformance with:

```bash
python tools/forge_check.py repo
python tools/forge_check.py schemas
python tools/forge_check.py links
python tools/forge_check.py nest
```

## Decision Surface Compression

Forge gains execution efficiency by moving repeatable project-wide reasoning into explicit authority, accepted architecture, durable memory, bounded handoffs, selected validation, evidence requirements, and controlled promotion. It does **not** eliminate writer reasoning. Writers retain local judgment for contradictions, unsafe instructions, stale assumptions, defects, implementation details, and evidence interpretation.

## Genesis restriction

Do not infer self-hosting maturity from the presence of self-hosting documentation or tooling. NEST-4 requires demonstrated operation and independent acceptance.

## Boundary with Project Second Brain

Forge governs mutation and acceptance; it does not classify tasks, route knowledge, or compile context. A companion cognition system, Project Second Brain, owns that side and hands off into Forge. If both are present, [SYSTEM_BOUNDARY.md](SYSTEM_BOUNDARY.md) states which system owns which decision, and [EVIDENCE_CROSSWALK.md](EVIDENCE_CROSSWALK.md) is the normative mapping between Forge's `E0`–`E7` ladder and the harness's evidence vocabulary. Forge is complete and usable without Second Brain present; see the boundary document for what that configuration loses.

## Operation FORGE.kirion entity

This repository is the integrated Forge entity. KIRION Forge remains the canonical engineering authority at the repository root; Project Second Brain is embedded at `second-brain/` as the cognition and harness component. See `ENTITY.md` and `ENTITY_MANIFEST.json`. Validate the integrated state with `python tools/entity_check.py`.
