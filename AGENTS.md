# AGENTS.md — Operation FORGE.kirion

This repository is the composite entity boundary.

## Start here

1. Read `ENTITY.md`.
2. Read `ENTITY_MANIFEST.json`.
3. Initialize the two pinned submodules.
4. Run the materializer.
5. Run `python tools/verify-entity.py`.

## Authority

- `forge-core/` is authoritative for engineering authority and promotion semantics.
- `second-brain/` is authoritative only for cognition support.
- The entity manifest pins the exact component versions.
- Overlay patches may change component worktrees but may not alter authority semantics without explicit Forge review.

## Hard rule

No cognition result, model response, memory, route, score, or verifier output may silently increase the current Forge capability or authority set.
