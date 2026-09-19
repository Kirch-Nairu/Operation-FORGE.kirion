# Project Second Brain

Project Second Brain is the operating memory, planning system, decision system, and AI-governance layer for engineering work.

## V2 — Cognitive OS

V2 extends the original project factory and autonomous-lane system into an **engineering cognition system** that preserves not only what to build, but also:

- what is true and how it is known
- what is still uncertain
- what assumptions are active
- why architecture choices exist
- what alternatives were rejected
- what risks are accepted or mitigated
- what happens if assumptions fail
- how recovery is proven
- what incidents taught us
- when old decisions become stale
- how project knowledge becomes reusable patterns

## Semantic control plane

The preferred machine semantic provider is now an immutable **Notion snapshot** backed by Git provenance.

```text
Notion semantic control plane
        ↓ explicit authenticated sync
Git source-path/blob validation
        ↓
immutable local semantic snapshot
        ↓
deterministic cognition harness
        ↓
ChatGPT / Codex / MCP agent
        ↓
target Git repository + runtime evidence
```

Notion is authority for governed cognition and project memory. Git remains authority for exact source state. Observed runtime remains authority for what actually happened.

Before a Notion-backed cognition run:

```text
PSB_NOTION_API_KEY=<secret> node tools/harness/notion/sync.mjs
node tools/harness/cli.js doctor
node tools/harness/cli.js bootstrap --task <task.json>
```

The generated snapshot lives under `.harness/` and is intentionally not committed. `PSB_SEMANTIC_PROVIDER=GIT` is an explicit fallback/recovery mode; it is not a silent downgrade.

See `harness/notion/README.md` and `harness/ENTRYPOINT.md`.

For human editing/visualization in Obsidian, start at **[[cognitive-os/CENTRAL_BRAIN|CENTRAL BRAIN]]**. The Obsidian graph remains a useful projection; it is not machine authority.

## Prime directive

> **Use the least process that makes uncertainty, authority, risk, and recovery sufficiently explicit for the decision at hand.**

## Authority law

Current human authorization governs intended changes. Actual repository/runtime evidence describes current reality. Notion knowledge, memory, summaries, canvases, and graphs provide cognition and navigation; they are never allowed to impersonate live proof.

See [[cognitive-os/05_AUTHORITY_AND_TRUTH]] and [[second-brain/03_AUTHORITY_ORDER]].

## Core operating loop

```text
OBSERVE
→ FRAME
→ RESEARCH
→ PLAN
→ DECIDE
→ EXECUTE
→ VERIFY
→ DEPLOY
→ OPERATE
→ OBSERVE OUTCOME
→ LEARN
→ UPDATE KNOWLEDGE
```

Rigor scales through [[cognitive-os/02_ADAPTIVE_RIGOR]] rather than forcing production-grade ceremony onto every experiment.

## V2 control surfaces

- `cognitive-os/` — constitution, central brain, truth/certainty model, ontology, adaptive rigor.
- `planning/` — architecture, security, data, platform/operations, delivery, research, UX planning hubs.
- `decision-engine/` — decisions, reversibility, contradictions, what-if reasoning, reusable decision trees.
- `truth/` — claim/truth ledger model.
- `risk/` — risk and threat system.
- `scenario/` — failure and what-if scenarios.
- `assurance/` — verification, recovery proof, release gates.
- `incident/` — incidents, near misses, root-cause learning.
- `knowledge/` — patterns, anti-patterns, lessons and promotion rules.
- `mesh/` — atomic semantic concepts and the 23 deterministic routing lanes.
- `harness/notion/` — Notion control-plane identity, route pack, and snapshot contract.
- `templates-v2/` — quick/full governed-object templates.
- `tools/harness/` — machine-enforced routing, gates, provider integration, and lifecycle runtime.
- `schemas/` / `harness/schema/` — machine-readable governed-object and runtime contracts.

## Original system preserved

V2 composes rather than replaces the existing system:

- `second-brain/` — identity, boot sequence, memory doctrine.
- `chatgpt/` — ChatGPT project modes.
- `codex/` — Codex operating instructions.
- `cursor/` — Cursor rules and workflow commands.
- `doctrine/` — stable project laws.
- `project-factory/` — intake, hypothesis, constitution, phase design.
- `lane-automation/` — autonomous coding lane execution.
- `playbooks/` — product playbooks.
- `prompt-packs/` — copy/paste agent prompts.
- `checklists/` — repeatable gates.
- `registries/` — project, lane, parked-scope, decision and handoff ledgers.
- `evals/` — dangerous-agent-behavior tests.
- `templates/` — original implementation/handoff reports.
- `install/` — minimal product-repo instruction layer.

## Core law from V1

```text
Planning is Phase 0.
No project starts with implementation.
No feature enters code unless it passed intake, scope classification, cost scan, parent-repo mapping, and approval.
```

V2 keeps that discipline while adding richer uncertainty, architecture, security, risk, scenario, truth, and learning models.

## Agent roles

| Tool | Primary job | Must not do |
|---|---|---|
| ChatGPT | planning, architecture, research synthesis, review, decision proposals, handoffs | invent repo state or silently approve its own proposals |
| Codex | repo-backed implementation, repair, gates, commit-ready changes | expand lane scope or change approved architecture without authority |
| Cursor | fast local navigation and bounded edits | turn convenience edits into uncontrolled refactors |

See [[atlas/hubs/AI_TOOLCHAIN]] and [[mesh/ai/Agent Authority Boundary]].

## Graph philosophy

The graph is not hand-painted. The `mesh/` layer contains atomic concepts with real semantic links. Projects, doctrine, planning hubs, decisions, assurance, incidents, and operational knowledge connect to that mesh. The visual graph therefore emerges from actual engineering relationships instead of decorative link spam.

See [[atlas/GRAPH_LENSES]].
