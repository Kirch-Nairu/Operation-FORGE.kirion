# KIRION FORGE

KIRION Forge is a repository-native engineering operating system for governed AI-assisted software work.

It defines authority, roles, bounded handoffs, evidence, review, acceptance, integration, promotion, recovery, and project memory as repository truth.

## Operation FORGE.kirion entity

This repository is the integrated Forge entity. KIRION Forge remains the canonical engineering authority at the repository root; Project Second Brain is embedded at `second-brain/` as the cognition and harness component.

The entity boundary is explicit:

- Forge owns repository mutation authority, roles, evidence semantics, review, acceptance, integration, promotion, deployment, and recovery.
- Project Second Brain owns cognition support: classification, rigor selection, semantic routing, context compilation, lifecycle fingerprints, and cognition-side evidence gates.
- Cognition may require context or evidence, but it cannot grant Forge authority or override an authority denial.

See `ENTITY.md` and `ENTITY_MANIFEST.json`. Validate the integrated state with:

```bash
python tools/entity_check.py
```
