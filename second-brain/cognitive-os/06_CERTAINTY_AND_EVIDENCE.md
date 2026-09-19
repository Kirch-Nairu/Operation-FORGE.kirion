---
id: BRAIN-CERTAINTY-0001
type: doctrine
status: APPROVED
authority: doctrine
tags: [certainty, evidence, epistemics]
graph_nonvisual_relations:
  - "assurance/ASSURANCE_HUB"
  - "truth/TRUTH_LEDGER"
---
# Certainty & Evidence

Certainty and evidence strength are separate. A person may feel highly confident with weak evidence; the system must represent that honestly.

## Certainty states

```text
UNKNOWN
→ HYPOTHESIS
→ SUPPORTED
→ VERIFIED
→ OBSERVED_IN_OPERATION
→ PRODUCTION_PROVEN
```

Additional states:

- `DISPROVEN`
- `STALE`
- `CONTESTED`
- `NOT_APPLICABLE` — applicability, not certainty

## Meaning

### UNKNOWN
No adequate claim yet.

### HYPOTHESIS
Plausible explanation or proposed model; not yet adequately supported.

### SUPPORTED
Multiple pieces of evidence point in the same direction, but verification is incomplete.

### VERIFIED
A defined verification procedure has been executed successfully for the claim's stated scope.

### OBSERVED_IN_OPERATION
The behavior has been seen in a real operational environment.

### PRODUCTION_PROVEN
Repeated operational evidence across meaningful conditions supports the claim; still never logically absolute.

## Evidence strength

Use a separate field:

- `NONE`
- `WEAK`
- `MODERATE`
- `STRONG`
- `VERY_STRONG`

Strength depends on relevance, independence, recency, reproducibility, and proximity to the claim.

## Confidence

If captured, confidence is a human/agent subjective estimate and must never upgrade certainty by itself.

## Promotion rules

- `HYPOTHESIS → SUPPORTED`: evidence accumulates.
- `SUPPORTED → VERIFIED`: explicit verification succeeds.
- `VERIFIED → OBSERVED_IN_OPERATION`: real operational observation exists.
- Any state → `STALE`: freshness or dependencies invalidate currency.
- Any state → `CONTESTED`: credible conflicting evidence exists.
- Any state → `DISPROVEN`: sufficient counter-evidence defeats the claim in its stated scope.

## Important distinction

A verified unit test claim may remain `VERIFIED` even when production shows different behavior. The conflict means the *system-level claim* becomes `CONTESTED`; it does not retroactively mean the unit test never passed.

## Related

- [[cognitive-os/05_AUTHORITY_AND_TRUTH]]
- TRUTH_LEDGER
- ASSURANCE_HUB

## Graph neighborhood

- [[decision-engine/DECISION_ENGINE]]
- [[cognitive-os/01_SYSTEM_MODEL]]
- [[cognitive-os/03_GOVERNED_OBJECT_MODEL]]
- [[cognitive-os/05_AUTHORITY_AND_TRUTH]]
- [[cognitive-os/QUERY_ROUTER]]
