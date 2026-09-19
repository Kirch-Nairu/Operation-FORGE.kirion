# Operation FORGE.kirion

Operation FORGE.kirion is the **composite entity** that binds:

- **KIRION Forge** — engineering authority, roles, bounded mutation, evidence, review, acceptance, integration, promotion, recovery.
- **Project Second Brain** — cognition harness, task classification, rigor selection, semantic routing, context compilation, lifecycle fingerprints, and cognition-side gates.

The two components remain separately versioned and are pinned as git submodules. Claude's repaired 2026-09-19 state is represented as deterministic overlay patches under `overlays/claude-2026-09-19/`.

## Materialize the entity

```bash
git clone --recurse-submodules https://github.com/Kirch-Nairu/Operation-FORGE.kirion.git
cd Operation-FORGE.kirion
./tools/materialize-entity.sh
```

PowerShell:

```powershell
git clone --recurse-submodules https://github.com/Kirch-Nairu/Operation-FORGE.kirion.git
Set-Location Operation-FORGE.kirion
./tools/materialize-entity.ps1
```

Then validate:

```bash
python tools/verify-entity.py
```

## Authority invariant

**Cognition may require context or evidence, but it cannot grant repository mutation, acceptance, promotion, deployment, or any other Forge authority.**

See `ENTITY.md` and `ENTITY_MANIFEST.json`.
