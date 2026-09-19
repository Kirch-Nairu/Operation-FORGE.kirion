---
type: concept
domain: testing
status: ACTIVE
authority: knowledge
---
# Release Evidence

Release evidence is the specific, checkable record that a given candidate was verified to do what the release claims — as opposed to the belief that it probably works because the pipeline usually passes.

The distinction that matters: a green CI run is evidence about the workflow that ran, not automatically evidence about the release. If the workflow ran against a stale cache, skipped a flaky suite, or tested a branch that has since diverged from the release candidate, the pipeline's outcome and the release's correctness have quietly come apart. Release evidence binds the verification explicitly to the exact artifact and exact commit being released — not to "the pipeline," but to this SHA, this build, this test run, with a recorded link between them.

What belongs in the record: the commit or artifact identifier, which checks ran and their individual results (not just an aggregate pass), what was deliberately not covered and why, and — for anything above low rigor — a runtime or staging observation, because a suite passing is not the same claim as the software behaving correctly under real conditions.

Evidence age matters. A verification performed against last week's build says nothing about today's candidate if commits have landed since. Release evidence is only valid for the exact state it was generated against; treat it as expired the moment that state changes, not as a general assurance that carries forward.

## Local neighborhood
- [[mesh/testing/Verification System]]
- [[mesh/testing/Regression Protection]]
- [[mesh/testing/Security Verification]]
- [[mesh/testing/Recovery Verification]]
- [[mesh/testing/Production Observation]]

## Bridge corridor
- [[mesh/deployment/Deployment Gate]]
- [[assurance/RELEASE_GATE_MODEL]]
- [[mesh/delivery/Definition of Done]]
