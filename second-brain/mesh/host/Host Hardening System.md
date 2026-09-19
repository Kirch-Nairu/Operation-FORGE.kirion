---
type: subhub
domain: host
status: ACTIVE
authority: knowledge
---
# Host Hardening System

Host hardening reduces a runtime host's exposed attack surface to the minimum the workload actually requires — every unnecessary service, open port, installed package, and default credential is a path an attacker doesn't have to work to find, because the operator left it open by default rather than closing it by decision.

The operating principle is subtractive, not additive: hardening is not a checklist of protections to add, it is a process of removing what is not needed. A host that runs only the services the workload requires, listens only on the ports those services need, and has no default or shared credentials has a smaller attack surface than the same host with security tooling layered on top of an otherwise-default configuration — the tooling detects; the removal prevents.

Defaults are the recurring failure mode, because a default exists to make first-run easy, not to be secure at scale: default admin accounts, default open management ports, default permissive firewall rules. None of these are vulnerabilities in the traditional sense — they're documented, intended behaviour — which is exactly why they survive in production long after the reason for leaving them has been forgotten.

Hardening decays the same way architecture does: a host hardened at provisioning time drifts as packages are added for one-off debugging and never removed, as a port is opened for a migration and never closed. Configuration drift detection exists because hardening is a state to be maintained, not a task completed once at image build time.

## Local neighborhood
- [[mesh/host/Minimal Service Baseline]]
- [[mesh/host/Patch Management]]
- [[mesh/host/SSH Hardening]]
- [[mesh/host/Sudo Policy]]
- [[mesh/host/Filesystem Permissions]]
- [[mesh/host/System Service Hardening]]

## Bridge corridors
- [[cognitive-os/hubs/SECURITY_SECTOR]]
- [[cognitive-os/hubs/PLATFORM_RELIABILITY_SECTOR]]
- [[mesh/deployment/Runtime Hardening]]
- [[mesh/operations/Administrative Access]]
