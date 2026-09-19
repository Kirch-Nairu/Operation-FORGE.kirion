# Cognition Harness Agent Entrypoint

## Mandatory boot sequence

When this harness is available, a software agent must not begin architecture selection or implementation from model intuition alone.

### Phase 0 — Establish semantic and source reality

- Pin the Project Second Brain repository state being used.
- The preferred semantic provider is the immutable Notion snapshot.
- If Notion is being used, run `node tools/harness/notion/sync.mjs` with `PSB_NOTION_API_KEY` set before `doctor`.
- Run `node tools/harness/cli.js doctor`.
- Treat a missing/tampered/stale semantic snapshot, missing required harness source, or Git/Notion provenance mismatch as a stop condition.
- `PSB_SEMANTIC_PROVIDER=GIT` is an explicit fallback, not a silent downgrade.
- Runtime observation and repository facts outrank intended architecture and semantic memory.

### Phase 1 — Intake

Represent the request as a task document. Preserve the user's outcome and constraints. Do not silently add product requirements.

For a build/feature task, declare primary user journeys before delivery can ever pass. A primary journey is a user-visible or operator-visible path whose runtime success is material to acceptance.

### Phase 2 — Bootstrap cognition

Run:

```text
node tools/harness/cli.js bootstrap --task <task.json>
```

Read the emitted `RUN.md`, `route.json`, and `CONTEXT.md` **before** proposing architecture.

The context manifest records the semantic provider and, for Notion, the immutable semantic snapshot hash and exact Git blob provenance of every routed source.

If classification is ambiguous or the run is blocked, resolve the missing information instead of guessing.

### Phase 3 — Decide

Use routed knowledge as decision support. Record material decisions with the decision schema. For HIGH/CRITICAL work, explicitly identify authority and source of truth, trust/mutation boundaries, failure modes, reversibility/rollback, and verification evidence required to falsify the design.

### Phase 4 — Implement

Implement only after pre-design/pre-implementation BLOCK gates are satisfiable. Do not weaken policy boundaries to make tests pass.

### Phase 5 — Verify

Collect evidence claims. Evidence is capability-based, not a storytelling hierarchy:

- `INTENDED` — stated behavior only;
- `IMPLEMENTED` — executable implementation exists;
- `TESTED` — a test exercised the claim;
- `OBSERVED` — runtime behavior was directly observed;
- `DURABLE` — the exact state is durably versioned or persisted;
- `DEPLOYED` — exact state is present in target runtime;
- `VERIFIED` — independent or cross-layer verification corroborated the claim.

Claims may carry multiple capabilities.

### Phase 6 — Delivery gate

Evaluate evidence. A BLOCK failure prevents claims such as "complete", "ready", or "verified".

**Primary-journey rule:** every declared primary journey must have explicit runtime `OBSERVED` evidence with PASS status. This rule exists because SentinelOps V1 passed substantial domain/security tests yet an ordinary asset-detail route produced HTTP 500 in independent use.

### Phase 7 — Learn

A discovered failure may emit a learning candidate, but the runtime must never silently mutate engineering doctrine. Human review decides whether a candidate becomes a permanent Second Brain rule.

## Non-negotiable principle

The harness chooses the cognition route. The model reasons *inside* that route. The model may challenge a harness rule with evidence, but it may not silently bypass it.

## Graph anchor

- [[cognitive-os/hubs/OPERATING_SURFACES_SECTOR]]
