# Operation FORGE.kirion — Entity Boundary

`Operation-FORGE.kirion` is one governed engineering entity composed of two internal systems with non-overlapping authority.

## Entity topology

- **KIRION Forge (repository root)** owns engineering authority: roles, repository mutation policy, evidence semantics, review, acceptance, integration, promotion, and recovery.
- **Project Second Brain (`second-brain/`)** owns cognition support: task classification, rigor selection, semantic routing, context compilation, lifecycle fingerprints, and cognition-side evidence gates.

Project Second Brain may derive what context or evidence is required. It may not grant repository mutation, acceptance, promotion, deployment, or other Forge authority. When cognition output and Forge authority disagree, the action is blocked until the authority state is reconciled.

## Shared contracts

The root copies of `SYSTEM_BOUNDARY.md` and `EVIDENCE_CROSSWALK.md` are the entity contracts for repository mutation and evidence interpretation. The Second Brain copies under `second-brain/` are mirrors. `tools/entity_check.py` verifies that both byte copies and their pinned SHA-256 values agree.

## Validation

Run from the repository root:

```bash
python tools/entity_check.py
```

The entity validator executes Forge structural/schema/link/shared checks, the Second Brain fail-closed graph validator, the harness test suite, and cross-component shared-contract verification. It does not convert Forge's human maturity predicates into mechanical proof.

## Integration rule

Future runtime mechanisms imported or reimplemented from other agent systems belong behind this entity boundary. Execution runtimes, subagents, tool brokers, verifiers, teacher escalation, or skill systems remain subordinate to Forge authority and may consume Second Brain cognition output without becoming a second authority plane.
