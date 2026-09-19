# Lane Automation Doctrine

A coding agent does not need babysitting for an approved lane.
It needs boundaries, proof gates, drift recovery, and a mandatory handoff.

## Core loop

```text
ANCHOR → PLAN → MAP → IMPLEMENT → VERIFY → REPAIR → REVERIFY → CHECK DRIFT → HANDOFF → STOP AT MANUAL CHECK
```

## Key rule

The agent may continue automatically inside the approved lane.
The agent may not expand the lane.
