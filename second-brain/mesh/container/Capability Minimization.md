---
type: hardening-control
domain: container
status: ACTIVE
authority: knowledge
---
# Capability Minimization

Linux capabilities and equivalent runtime privileges are dropped by default and added only for explicit functions. Privileged mode, host namespaces, device access, and broad kernel authority are treated as major trust-boundary changes.

## Local neighborhood
- [[mesh/container/Container Runtime System]]
- [[mesh/container/Non Root Container]]
- [[mesh/container/Seccomp Profile]]
- [[mesh/container/Container Network Boundary]]
- [[mesh/container/Read Only Root Filesystem]]

## Bridge corridor
- [[mesh/host/Process Isolation]]
- [[mesh/vulnerability/Misconfiguration]]
