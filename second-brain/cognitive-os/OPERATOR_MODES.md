---
id: BRAIN-MODES-0001
type: operating-protocol
status: ACTIVE
authority: doctrine
tags: [brain/modes, cognition]
---
# Operator Modes

Modes prevent planning, implementation, verification, and incident response from contaminating one another.

## OBSERVE
Read current evidence. Do not mutate. Output facts, gaps, freshness, and contradictions.

## FRAME
Define problem, user, scope, non-goals, constraints, assumptions, and desired outcome.

## RESEARCH
Reduce a named uncertainty with bounded evidence gathering or experiments.

## PLAN
Produce architecture, threat/data/operations implications, phase boundary, scenarios, and evidence requirements.

## DECIDE
Compare options and authorize/reject/defer a choice with review triggers.

## EXECUTE
Implement only approved scope and surfaces. Preserve repository anchor and stop on material drift.

## VERIFY
Test claims. Report pass/fail/not-run/manual-pending exactly.

## RELEASE
Evaluate promotion gates, rollback/recovery, residual risk, and approval boundary.

## OPERATE
Observe health, dependency behavior, capacity, logs, security signals, and recovery readiness.

## RECOVER
Contain impact, preserve evidence, restore safe state, verify integrity, and escalate when authority is required.

## LEARN
Distill incident/retrospective evidence into lessons, candidate patterns, anti-patterns, and possible doctrine changes.

## Rule
A mode switch must be explicit when it changes authority. An audit does not silently become a repair; a plan does not silently become implementation.

Related: [[cognitive-os/QUERY_ROUTER]] · [[cognitive-os/01_SYSTEM_MODEL]] · [[atlas/hubs/AI_TOOLCHAIN]]

## Graph neighborhood

- [[cognitive-os/01_SYSTEM_MODEL]]
- [[cognitive-os/QUERY_ROUTER]]
