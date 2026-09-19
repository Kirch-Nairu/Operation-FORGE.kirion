---
type: subhub
domain: cloud
status: ACTIVE
authority: knowledge
---
# Cloud Infrastructure System

Cloud infrastructure shifts the security boundary from "is the perimeter secure" to "is every individually-addressable resource correctly configured" — because a cloud resource is reachable from the internet by default in a way an on-premises server behind a firewall was not, and misconfiguration, not exploitation, is the dominant cause of cloud breaches.

The shared responsibility model is the concept most often misapplied: the provider secures the infrastructure underneath the service (the hypervisor, the physical datacenter, the network fabric), and the customer secures everything they configure on top of it (bucket permissions, security group rules, IAM policies, who can assume which role). A misconfigured storage bucket is not a cloud provider failure; it is the customer side of a boundary the provider was never responsible for.

Identity is the practical perimeter in cloud infrastructure, replacing the network perimeter that no longer exists in the same form. An overly permissive IAM role, a long-lived credential instead of a short-lived one, or a cross-account trust relationship with no external ID check are each a path to resources that has nothing to do with network topology and everything to do with who was granted what.

Because resources are created and destroyed continuously and configuration lives in code more often than in a console click, drift between declared infrastructure (what the IaC says should exist) and actual infrastructure (what the provider reports exists) is a distinct, ongoing risk that a one-time review does not catch.

## Local neighborhood
- [[mesh/cloud/Account Boundary]]
- [[mesh/cloud/Virtual Network Boundary]]
- [[mesh/cloud/Cloud IAM Boundary]]
- [[mesh/cloud/Infrastructure as Code]]
- [[mesh/cloud/Cloud Audit Plane]]
- [[mesh/cloud/Cloud Cost Guardrail]]

## Bridge corridors
- [[cognitive-os/hubs/PLATFORM_RELIABILITY_SECTOR]]
- [[cognitive-os/hubs/SECURITY_SECTOR]]
- [[mesh/operations/Deployment Topology]]
- [[mesh/host/Host Hardening System]]
