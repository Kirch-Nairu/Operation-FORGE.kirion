---
type: subhub
domain: container
status: ACTIVE
authority: knowledge
---
# Container Runtime System

Container runtime security governs what a container can do to its host and to other containers once it is running — a concern distinct from, and additional to, what vulnerabilities exist in the image it was built from.

A minimal, vulnerability-free image running with an unconfined runtime is still a risk if it runs as root, mounts the host filesystem, or retains capabilities it does not need. Runtime configuration is where most container escapes actually originate: privileged mode, host namespace sharing, and excessive Linux capabilities are each individually common and each individually sufficient to defeat the isolation a container is assumed to provide.

The default posture worth stating explicitly: a container should run as a non-root user, with no privileged flag, with capabilities dropped to the minimum the workload requires (not the default set the runtime grants), and with the host filesystem, network namespace, and PID namespace unshared unless a specific, reviewed reason requires otherwise. Each of these is opt-in for a reason; treating them as default-on because a base image or example Dockerfile did is how isolation gets silently weakened.

Image provenance and runtime configuration are separate controls and both matter: a verified, signed image running with an unconfined runtime is still exploitable, and a hardened runtime running an unverified image is still running attacker-controlled code — just with a smaller blast radius if it tries to escape.

## Local neighborhood
- [[mesh/container/Immutable Image]]
- [[mesh/container/Non Root Container]]
- [[mesh/container/Capability Minimization]]
- [[mesh/container/Read Only Root Filesystem]]
- [[mesh/container/Container Resource Limit]]
- [[mesh/container/Container Health Model]]

## Bridge corridors
- [[mesh/host/Host Hardening System]]
- [[mesh/deployment/Runtime Hardening]]
- [[mesh/cicd/Release Candidate]]
- [[mesh/supply-chain/Build Provenance]]
