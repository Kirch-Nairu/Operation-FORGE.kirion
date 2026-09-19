# Continuity Reconstruction

A fresh Maintainer or Writer should reconstruct current state from repository artifacts, not old conversation replay.

## Maintainer minimum path

1. repository `AGENTS.md`;
2. `.forge/AUTHORITY.md`, `.forge/SSOT_CURRENT.md`, `.forge/NEST.md`;
3. active architecture/ADRs relevant to the present objective;
4. active work ledger and current candidate branches;
5. current incidents/blockers;
6. Git and runtime observation;
7. cold history only when a present question requires it.

## Writer minimum path

1. bounded writer handoff;
2. repository `AGENTS.md`;
3. current authority/SSOT references named by the handoff;
4. owned-surface neighboring contracts;
5. required validation and stop conditions;
6. active dependency/collision entries when parallel work exists.

## Continuity output

A reconstructed session should be able to state role, source branch/SHA, target, scope, dependencies, known failures, selected validation gates, and next permitted action.

If that cannot be done without replaying chat history, durable continuity is incomplete.
