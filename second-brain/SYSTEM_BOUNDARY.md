---
id: SHARED-BOUNDARY-0001
type: doctrine
status: APPROVED
authority: doctrine
---
# System Boundary

KIRION Forge and Project Second Brain are two systems that both define authority, evidence, memory, roles, gates, and lifecycle. Without a stated boundary, an agent holding both has two answers to every governance question and no rule for choosing. This document is that rule. It is byte-identical in both repositories; changing one copy without the other is a governance defect.

## One sentence

**Second Brain governs what should be true before and while work happens. Forge governs what may change and what counts as accepted.**

Second Brain is the read path: classification, rigor, lane routing, context compilation, stage gates. Forge is the write path: bounded handoff, candidate branch, writer report, independent acceptance, promotion, durable-memory update.

## Ownership

Each row has exactly one owner. The non-owner may reference the owner's decision; it may not make its own.

| Concern | Owner | Non-owner's position |
|---|---|---|
| Who may mutate a repository | **Forge** — `.forge/AUTHORITY.md` | The Brain never authorises a mutation. Its gates authorise *progression to the next stage*, which is not permission to commit. |
| What is accepted, and by whom | **Forge** — `doctrine/authority-model.md` | A harness `PASS` is not acceptance. The Brain has no acceptance power. |
| Exact source state | **Forge** — read directly from Git | The Brain records the SHA it observed; it does not assert current authority from a note. |
| Whether work should start, and at what rigor | **Brain** — `cognitive-os/02_ADAPTIVE_RIGOR.md`, harness classification | Forge does not reclassify. A handoff carries the rigor the harness assigned. |
| Which knowledge is in scope for a task | **Brain** — lane router and compiled context | Forge does not assemble reading lists. |
| What must be proven before a stage | **Brain** — `harness/config/gates.json` | Forge gates promotion, not stage progression. The two gate sets do not overlap and neither overrides the other. |
| Evidence vocabulary in a handoff or acceptance | **Forge** — `E0`–`E7` with type and provenance | Translate via [[EVIDENCE_CROSSWALK]]. |
| Evidence vocabulary inside a harness run | **Brain** — harness capabilities | Same. |
| Standing of a durable claim over time | **Brain** — certainty states | Forge records the level it observed; staleness is the Brain's to track. |
| Project memory across conversations | **Brain** — the mesh, truth ledger, decision records | Forge's `.forge/` memory is scoped to Forge's own development, not to governed projects. |
| Incident authority during an incident | **Brain** — `mesh/incident/Incident Command` | Forge's recovery recipes describe Git mechanics, not command. |

## The handoff between them

```text
BRAIN                                              FORGE
─────                                              ─────
task intake
  ↓
classification + rigor
  ↓
lane route + compiled context  ──── CONTEXT ────►  bounded handoff is written
  ↓                                                  ↓
stage gates (BOOTSTRAP → …)                        candidate branch
  ↓                                                  ↓
                                                   writer report
                                                     ↓
  ◄──── EVIDENCE (translated per crosswalk) ─────  independent acceptance
  ↓                                                  ↓
certainty states updated                           promotion
truth ledger / decision records                      ↓
                                                   durable-memory update
```

Two crossings, and both are typed:

**Brain → Forge carries context.** A Forge handoff originating from a harness run cites `run_id`, `context_sha256`, and the compiled document manifest. Forge does not re-derive scope; it inherits it, and the inheritance is auditable.

**Forge → Brain carries evidence.** An acceptance record entering the Brain cites the candidate SHA and the acceptance path, and its `E`-level is translated to a certainty state under [[EVIDENCE_CROSSWALK]]. The Brain does not raise standing on receipt.

## Conflict rule

When the two systems disagree about a fact, resolve in this order:

1. **Observed runtime** — what the system actually did.
2. **Exact Git state** — what the code actually is.
3. **Forge authority records** — what was actually accepted.
4. **Brain durable memory** — what we believe and why.
5. **Either system's documentation** — what we wrote down.

A note is never authority over a SHA, and a SHA is never authority over an observation. Both systems already state this internally; stating it once, here, is what makes it a shared rule rather than two parallel opinions.

## Using one without the other

Both are independently usable, and the boundary says what you lose.

- **Forge alone** is complete for governing change. You lose classification, rigor selection, and compiled context; scope comes from the Maintainer instead.
- **Brain alone** is complete for governing cognition. You lose bounded handoff, independent acceptance, and promotion; the mutation path is whatever the host repository already has. Harness `PASS` must not be read as acceptance in this configuration — this is the failure mode the boundary most exists to prevent.

## Anti-goals

- Neither system is merged into the other. The read path and the write path have different failure modes and different reviewers.
- Neither system's vocabulary is retired in favour of the other's. Both were kept because each answers a question the other does not; see [[EVIDENCE_CROSSWALK]].
- This document does not introduce a third governance layer. It contains no new gates, states, or roles.
