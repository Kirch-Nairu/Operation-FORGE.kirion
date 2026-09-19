---
id: SHARED-CROSSWALK-0001
type: doctrine
status: APPROVED
authority: doctrine
---
# Evidence Crosswalk

KIRION Forge and Project Second Brain each define an evidence vocabulary, and Second Brain's runtime harness defines a third. This document is the single normative mapping between them. It is byte-identical in both repositories; changing one copy without the other is a governance defect.

## The three vocabularies answer different questions

They were never three competing ladders. They are three axes, and a complete evidence claim carries a position on each.

| Axis | Question | Owner | Shape |
|---|---|---|---|
| **Demonstration strength** | How strongly was this shown? | Forge `doctrine/evidence-model.md` | Total order, `E0`–`E7` |
| **Capability set** | What was actually performed? | SB `harness/config/evidence-levels.json` | Unordered set |
| **Claim standing** | Is this still true, and how do we know? | SB `cognitive-os/06_CERTAINTY_AND_EVIDENCE.md` | State machine over time |

A claim can be `E4` (strong demonstration), carry `{IMPLEMENTED, TESTED}` (what was done), and be `STALE` (the demonstration referenced a commit that no longer represents the system). All three are true simultaneously and none is derivable from the others. This is why all three survive.

## Normative mapping

### Harness capability set → Forge evidence level

A capability set maps to the **highest** Forge level all its members jointly support. Where a set spans levels, the claim takes the lowest level that no member contradicts.

| Harness capability | Forge level | Forge type | Forge provenance |
|---|---|---|---|
| `INTENDED` | `E0 — Assumed` | — | — |
| `IMPLEMENTED` | `E1 — Source inspected` | `SOURCE` | `DIRECTLY_OBSERVED` |
| `TESTED` (reported) | `E2 — Reported execution` | `UNIT` / `INTEGRATION` | `REPORTED` |
| `TESTED` (in CI) | `E4 — Automated validation` | `UNIT` / `INTEGRATION` / `BUILD` | `AUTOMATED` |
| `OBSERVED` | `E5 — Runtime acceptance` | `RUNTIME` | `DIRECTLY_OBSERVED` |
| `OBSERVED` + `DEPLOYED` | `E6 — Deployed observation` | `RUNTIME` | `DIRECTLY_OBSERVED` |
| `DEPLOYED` alone | `E0` | — | — |
| `DURABLE` | *not a level* — see below | — | — |
| `VERIFIED` | raises provenance to `REPRODUCED`; does not raise the level | — | `REPRODUCED` |

Two entries need care.

**`TESTED` is level-ambiguous by design.** Forge separates a worker asserting a test passed (`E2`) from an automated system running it (`E4`). The harness capability does not carry that distinction, so it must be supplied from the run's provenance: a `TESTED` claim whose evidence is a CI job identifier is `E4`; a `TESTED` claim whose evidence is a writer's report is `E2`. **When provenance is absent, `TESTED` resolves to `E2`.** Resolving upward on missing information is exactly the silent inflation both systems exist to prevent.

**`DURABLE` is not a demonstration.** It asserts that the state a claim refers to is immutably identified. In Forge terms it is the binding of evidence to an exact SHA, which `doctrine/evidence-model.md` requires of every material claim. It is therefore a **precondition on all levels at `E4` and above**, not a rung. A claim at `E4`+ without `DURABLE` is not a higher-level claim; it is an unanchored one, and it must be recorded as `E2 / REPORTED`.

### Forge evidence level → certainty state

Certainty is not a function of level alone, because certainty degrades with time and level does not. The mapping gives the **ceiling** a level permits; the actual state may be lower, and may be `STALE`, `DISPROVEN`, or `CONTESTED` regardless of level.

| Forge level | Certainty ceiling |
|---|---|
| `E0` | `HYPOTHESIS` |
| `E1`–`E2` | `SUPPORTED` |
| `E3`–`E4` | `VERIFIED` |
| `E5` | `VERIFIED` |
| `E6` | `OBSERVED_IN_OPERATION` |
| `E7` | `PRODUCTION_PROVEN` |

`E5` does not reach `OBSERVED_IN_OPERATION`. Runtime acceptance in a test or staging runtime is not operation. This is the most frequently attempted inflation and it is refused here explicitly.

`UNKNOWN` and `NOT_APPLICABLE` have no level equivalent. `NOT_APPLICABLE` is a statement about scope, not about certainty, and must never be recorded as a passing claim.

## Rules that bind both systems

1. **Downgrade is free; upgrade requires evidence.** Any translation that raises a level, capability, or certainty state must cite the specific new evidence that justifies it. Translation alone never raises standing.
2. **Crossing a boundary does not launder a claim.** A claim entering Forge from a harness run carries its origin (`run_id`, `context_sha256`, evidence hash). A claim entering the Brain from a Forge acceptance carries the candidate SHA and the acceptance record path.
3. **Absent information resolves downward.** Every ambiguity in this table resolves to the weaker reading.
4. **`NOT RUN`, `NOT VERIFIED`, `BLOCKED`, and `UNKNOWN` are results.** Both systems treat them as valid terminal states, not as failures to be worked around. `BLOCKED` specifically means the gate could not execute and is never evidence about the thing the gate would have checked.
5. **Time invalidates.** `VERIFIED` and above decay to `STALE` when the anchored state changes. Neither system re-verifies automatically; a stale claim that is presented as current is a governance defect, not a stale fact.

## Where each vocabulary governs

- Inside a harness run, and in any `evidence.json` the harness consumes: **harness capabilities**.
- In a Forge writer report, evidence manifest, acceptance record, or promotion decision: **Forge `E`-levels with type and provenance**.
- In any durable Brain note, truth-ledger entry, decision record, or assumption: **certainty states**.

Emitting a vocabulary outside its governing surface is permitted only alongside its translation under this table, and the translation must be shown, not implied.

See also: [[SYSTEM_BOUNDARY]].
