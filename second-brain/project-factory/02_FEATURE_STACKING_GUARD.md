# Feature Stacking Guard

A feature is not allowed into implementation unless it belongs to the approved phase.

## Classification labels

```text
CURRENT PHASE
NEXT PHASE
PARKED
REJECTED
NEEDS DECISION
NEEDS RESEARCH
```

## Required response

When a new feature appears mid-phase:

1. Classification
2. Reason
3. Cost/risk
4. Best action
5. Blunt note if needed

## Examples

Cloud sync during V1:

```text
Classification: PARKED
Reason: Changes architecture from local-first to distributed state.
Best action: Finish local workflow first. Revisit after V1.
```

AI scoring during lending MVP:

```text
Classification: REJECTED FOR MVP
Reason: Adds data quality, fairness, model, and cost risk.
Best action: Build manual loan tracking first.
```
