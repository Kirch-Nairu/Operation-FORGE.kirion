---
type: hardening-control
domain: container
status: ACTIVE
authority: knowledge
---
# Seccomp Profile

A seccomp profile restricts kernel system calls available to a workload according to runtime need. Restrictions are tested against real behavior and reviewed when runtime or dependencies change rather than copied blindly.

## Local neighborhood
- [[mesh/container/Container Runtime System]]
- [[mesh/container/Capability Minimization]]
- [[mesh/container/Non Root Container]]
- [[mesh/container/Container Drift]]
- [[mesh/container/Minimal Runtime Image]]

## Bridge corridor
- [[mesh/host/Process Isolation]]
- [[mesh/testing/Security Verification]]
