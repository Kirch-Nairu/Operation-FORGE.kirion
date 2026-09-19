---
type: boundary
domain: cloud
status: ACTIVE
authority: knowledge
---
# Instance Metadata Boundary

Instance metadata services may expose workload identity or configuration to processes on a host. Access is restricted, hardened with provider-supported protections, and included in SSRF threat models and workload isolation design.

## Local neighborhood
- [[mesh/cloud/Cloud Infrastructure System]]
- [[mesh/cloud/Compute Image Baseline]]
- [[mesh/cloud/Cloud IAM Boundary]]
- [[mesh/cloud/Secret Store]]
- [[mesh/cloud/Virtual Network Boundary]]

## Bridge corridor
- [[mesh/vulnerability/SSRF]]
- [[mesh/identity/Service Identity]]
