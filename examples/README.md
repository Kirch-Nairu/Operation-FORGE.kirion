# Forge Examples

These examples are not fictional prompt samples. They are case studies derived from repositories that were actually inspected during Forge Genesis.

## Source policy

Every example must identify:

- source repository;
- source branch;
- inspected branch SHA;
- historically relevant commit SHA when the lesson depends on an earlier state transition;
- concrete files or artifacts used as evidence;
- what was observed versus what is only inferred;
- any claim that remained unverified in the source project.

A Forge example must never improve the historical story for presentation. If the source shows failures, incomplete acceptance, process noise, stale tests, or harness gaps, preserve those facts because they are part of the engineering lesson.

## Current case studies

### Talibon

`talibon/parallel-writers-integration-and-stale-tests.md`

Demonstrates parallel ownership, integration authority, stale-test classification, exact branch anchoring, and preservation of hidden backend security behavior.

### Tapost

`tapost/evidence-gated-native-acceptance.md`

Demonstrates architectural boundaries, source implementation versus runtime proof, automated evidence versus device acceptance, and explicit withholding of unsupported claims.

### SentinelOps

`sentinelops/harness-pilot-and-critical-self-evaluation.md`

Demonstrates a disposable implementation workspace, pinned external cognition-harness authority, evidence capture, runtime-over-harness precedence, and a process that is allowed to conclude that its own harness was partly noisy or incomplete.

## Why real examples matter

Doctrine teaches the rule. A real repository shows the rule surviving contact with messy engineering reality.

Forge examples therefore exist to answer:

> What did this principle look like when an actual project had branches, failures, tests, competing sources of truth, incomplete evidence, or an agent operating inside a disposable environment?

Future examples should follow the same source-anchored standard.