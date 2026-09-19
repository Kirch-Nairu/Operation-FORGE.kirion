---
type: subhub
domain: cicd
status: ACTIVE
authority: knowledge
---
# CI CD Engineering System

CI/CD is the automated pipeline that takes a code change from commit to running system, and its central engineering property is that it should be the *only* path a change can take to reach production — because a pipeline that can be bypassed provides no guarantee at all, regardless of how thorough its checks are.

The property worth stating precisely: CI/CD does not make deployments safe, it makes them consistent and observable. Consistency means every deployment goes through the same sequence of checks, with no manual step that varies by who is deploying or how much time pressure they're under. Observability means every deployment produces a record — what changed, what was checked, what passed — that exists independent of anyone's memory of having done it.

Bypass paths are the recurring defect, and they are usually created for legitimate short-term reasons that outlive their justification: a manual deploy step added during an incident and never removed, a branch protection rule with an admin override that gets used routinely instead of exceptionally, a hotfix process that skips the normal test suite "just this once" on a rotating basis. Each bypass, individually, seems reasonable in the moment it was created; collectively, they are the actual deployment path, and the pipeline is theater for changes that happen not to need it.

The pipeline's trustworthiness is bounded by its weakest gate, not its strongest: a pipeline with excellent test coverage and a security scan that is allowed to fail without blocking the merge has, in practice, no security gate — the strong parts of the pipeline don't compensate for the part that doesn't enforce.

## Local neighborhood
- [[mesh/cicd/Pipeline Trust Boundary]]
- [[mesh/cicd/Required Checks]]
- [[mesh/cicd/Artifact Promotion]]
- [[mesh/cicd/Runner Hardening]]
- [[mesh/cicd/Release Candidate]]
- [[mesh/cicd/Rollback Readiness]]

## Bridge corridors
- [[cognitive-os/hubs/ASSURANCE_LEARNING_SECTOR]]
- [[cognitive-os/hubs/PLATFORM_RELIABILITY_SECTOR]]
- [[mesh/deployment/Deployment Gate]]
- [[mesh/supply-chain/CI Trust Boundary]]
