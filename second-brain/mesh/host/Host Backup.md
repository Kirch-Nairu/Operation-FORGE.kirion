---
type: recovery-control
domain: host
status: ACTIVE
authority: knowledge
---
# Host Backup

Host backup distinguishes irreplaceable state from reproducible configuration. Recovery should prefer rebuilding known-good hosts from declared configuration while protecting only data and secrets that cannot be reconstructed safely.

## Local neighborhood
- [[mesh/host/Host Hardening System]]
- [[mesh/host/Disk Encryption]]
- [[mesh/host/Host Configuration Drift]]
- [[mesh/host/Package Trust]]
- [[mesh/host/System Service Hardening]]

## Bridge corridor
- [[mesh/reliability/Backup Integrity]]
- [[mesh/deployment/Build Artifact]]
