# Project Second Brain — Cognition Harness Runtime V1

This directory turns Project Second Brain from a passive engineering reference into an executable routing and evidence protocol for software agents.

The runtime does **not** depend on Obsidian. Obsidian remains the human editing and graph-visualization surface. The Markdown/Git repository is the knowledge authority consumed by the harness.

## Contract

An agent is not expected to decide which parts of the brain it feels like reading. The harness must establish a deterministic route before design or implementation:

1. normalize the task;
2. classify the task;
3. score risk and choose adaptive-rigor mode;
4. select required semantic lanes from the 23-lane mesh;
5. resolve exact source notes from the repository;
6. compile a bounded, hash-addressed context pack;
7. activate stage gates and evidence requirements;
8. block unsupported delivery claims;
9. emit reusable failure/learning candidates without silently editing doctrine.

The runtime is intentionally fail-closed. Missing required source notes, ambiguous classification, missing primary journeys for build tasks, and failed BLOCK gates stop the run.

## Quick start

```powershell
node tools/harness/cli.js doctor
node tools/harness/cli.js bootstrap --task harness/examples/sentinelops-greenfield.task.json
node tools/harness/cli.js evaluate --task harness/examples/sentinelops-greenfield.task.json --evidence path/to/evidence.json
```

`bootstrap` writes ephemeral run artifacts under `.harness/runs/<run-id>/`. `.harness/` is ignored by Git.

## Output

A bootstrap run emits `task.normalized.json`, `classification.json`, `risk.json`, `route.json`, `context.manifest.json`, `CONTEXT.md`, `gates.json`, and `RUN.md`.

Every context source carries a SHA-256 content digest. Unresolved expansion links are warnings; unresolved **required seed sources** are blocking failures.

## Agent boundary

The harness is not allowed to manufacture runtime evidence. `TESTED`, `OBSERVED`, `DURABLE`, `DEPLOYED`, and `VERIFIED` are explicit evidence capabilities attached to claims. A commit SHA does not prove runtime behavior. A unit test does not prove a browser route rendered. Documentation does not outrank observation.

See `ENTRYPOINT.md` for the mandatory operating sequence.
