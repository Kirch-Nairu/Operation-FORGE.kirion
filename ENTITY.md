# Operation FORGE.kirion — Entity Contract

## Identity

Operation FORGE.kirion is a composite engineering entity formed from two independently versioned components:

1. `forge-core/` — KIRION Forge.
2. `second-brain/` — Project Second Brain.

The entity repository does not collapse those components into one undifferentiated codebase. It pins their exact source commits and carries a deterministic overlay that reconstructs the reviewed Claude repair state from 2026-09-19.

## Authority

KIRION Forge is the **canonical control plane**.

Forge owns:

- repository mutation authority;
- role and capability boundaries;
- bounded handoffs;
- evidence semantics;
- review and acceptance;
- integration and promotion;
- deployment authority;
- recovery and reconciliation.

Project Second Brain is the **cognition plane**.

Second Brain owns:

- task classification;
- risk and rigor derivation;
- semantic lane routing;
- context compilation;
- cognition lifecycle fingerprints;
- cognition-side evidence requirements and gates.

### Non-escalation invariant

Second Brain may say that more context, evidence, verification, or rigor is required.

Second Brain may **not** grant a capability that Forge denied, mutate Forge authority, declare a candidate accepted, authorize promotion, or authorize deployment.

## Overlay provenance

The overlay in `overlays/claude-2026-09-19/` is the delta between the source snapshots uploaded for review and Claude's completed repaired trees.

The source snapshots were cross-checked against the pinned upstream heads using matching Git blob hashes for representative authority files before this entity was created.

The overlay is stored as XZ-compressed Git patches encoded as base64 text so the entity remains deterministic and reviewable.

## Materialization

`tools/materialize-entity.sh` and `tools/materialize-entity.ps1`:

1. initialize/update submodules;
2. verify exact pinned base SHAs;
3. reconstruct the compressed overlay patches;
4. verify patch SHA-256 values;
5. apply the overlays with `git apply --check` before mutation;
6. run entity verification.

The resulting submodule worktrees intentionally become dirty relative to their pinned base commits: that dirty state is the deterministic entity overlay, not untracked authority drift.

## Promotion model

This entity repository is the integration authority for the composite system. The constituent source repositories remain independently versioned. When an overlay is promoted upstream, the entity manifest should be updated to pin the new upstream commits and the promoted overlay entries should be retired.
