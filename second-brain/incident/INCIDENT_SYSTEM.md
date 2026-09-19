---
id: ENGINE-INCIDENT-0001
type: incident-engine
status: ACTIVE
authority: doctrine
tags: [incident, learning, reliability]
graph_nonvisual_relations:
  - "risk/RISK_SYSTEM"
---
# Incident System

Incidents, near misses, failed deployments, material regressions, corruption, security events, and agent drift become permanent learning nodes when their lessons matter.

## Response loop

```text
DETECT
→ STABILIZE / CONTAIN
→ PRESERVE EVIDENCE
→ RESTORE SERVICE / INTEGRITY
→ VERIFY
→ ANALYZE
→ CORRECT
→ LEARN
→ PROMOTE PATTERN / CONTROL IF JUSTIFIED
```

## Meaningful incident record

- what happened
- impact
- detection
- timeline
- immediate containment
- recovery
- root cause
- contributing factors
- what fooled us
- why controls failed or were absent
- corrective actions
- verification
- lessons
- doctrine/checklist proposals

## Rule

Incident resolution does not erase history. It changes operational status while preserving links to affected project, release, risk, architecture, decision, and lessons.

Related: [[incident/ROOT_CAUSE_PROTOCOL]] · [[knowledge/LESSON_SYSTEM]] · RISK_SYSTEM

## Graph neighborhood

- [[cognitive-os/hubs/ASSURANCE_LEARNING_SECTOR]]
- [[incident/INCIDENT_INDEX]]
- [[incident/ROOT_CAUSE_PROTOCOL]]
- [[knowledge/LESSON_SYSTEM]]
- [[scenario/FAILURE_RESPONSE_MODEL]]
