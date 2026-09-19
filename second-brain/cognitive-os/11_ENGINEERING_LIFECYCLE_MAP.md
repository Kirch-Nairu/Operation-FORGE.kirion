---
id: BRAIN-LIFECYCLE-0011
type: major-hub
status: ACTIVE
authority: navigation
certainty: VERIFIED
source: repo-backed
tags: [brain/lifecycle, engineering]
---
# Engineering Lifecycle Map

The engineering lifecycle is a set of interacting evidence streams rather than a one-way waterfall. Work may loop backward whenever risk, failure, new evidence, or changed constraints invalidate an earlier assumption.

## Lifecycle streams
1. [[mesh/planning/Planning System]] — frame problem, scope, constraints, assumptions, acceptance.
2. [[mesh/decision/Decision Support System]] — compare alternatives, evidence, consequences, failure and vulnerability impact.
3. [[mesh/architecture/Architecture System]] — define authority, ownership, boundaries, interfaces, runtime and change surfaces.
4. [[mesh/security/Security Engineering System]] — model threats, attack paths, secure defaults, controls and hardening.
5. [[mesh/data/Data Architecture System]] — establish authoritative state, integrity, migration and recovery.
6. [[mesh/quality/Code Quality System]] — implement with readable, maintainable, defensive, reviewable code.
7. [[mesh/testing/Verification System]] — produce evidence proportional to consequence.
8. [[mesh/deployment/Deployment System]] — release immutable artifacts through controlled environments and rollback paths.
9. [[mesh/reliability/Reliability System]] — contain failure, recover state and operate under dependency or capacity stress.
10. [[mesh/delivery/Delivery System]] — bind engineering work to scope, quote, milestones, acceptance and support.
11. [[mesh/incident/Incident Evidence]] — preserve reality when the system fails.
12. [[mesh/governance/Engineering Doctrine]] — learn and promote reusable principles.

## Replanning triggers
- [[mesh/decision/Revisit Trigger]]
- [[mesh/governance/Change Trigger]]
- [[mesh/incident/Post Incident Learning]]
- [[truth/STALE_ASSUMPTION_PROTOCOL]]
