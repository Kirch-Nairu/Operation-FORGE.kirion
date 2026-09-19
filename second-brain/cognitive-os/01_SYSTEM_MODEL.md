---
id: BRAIN-SYSTEM-0001
type: doctrine
status: APPROVED
authority: doctrine
tags: [brain/system-model, ontology]
graph_nonvisual_relations:
  - "assurance/ASSURANCE_HUB"
  - "cognitive-os/NOW"
  - "decision-engine/DECISION_ENGINE"
  - "incident/INCIDENT_SYSTEM"
  - "knowledge/LESSON_SYSTEM"
  - "knowledge/PATTERN_LIBRARY"
---
# Cognitive OS System Model

The system separates **state**, **knowledge**, **governance**, **execution**, and **evidence** so that one category cannot impersonate another.

## Logical layers

### 1. Volatile state
Current project phase, branch/SHA, deployment state, blocker, owner, next action, live risk, and pending decision.

Primary surface: NOW.

### 2. Durable knowledge
Concepts, patterns, anti-patterns, researched facts, architecture principles, lessons, and reusable playbooks.

Primary surfaces: PATTERN_LIBRARY, [[research/RESEARCH_INDEX]], [[atlas/00_SECOND_BRAIN_ATLAS]].

### 3. Governed decisions
Architecture decisions, broader decisions, accepted risks, overrides, and explicit scope choices.

Primary surface: DECISION_ENGINE.

### 4. Planning
Problem framing, requirements, constraints, assumptions, architecture, security, data, platform, operations, delivery, UX, and research planning.

Primary surfaces: `planning/*`.

### 5. Execution
Approved lanes, implementation boundaries, repair loops, drift recovery, and handoffs.

Primary surface: [[atlas/hubs/EXECUTION_SYSTEM]].

### 6. Assurance
Verification, test evidence, threat verification, release gates, recovery exercises, and manual boundaries.

Primary surface: ASSURANCE_HUB.

### 7. Operational learning
Incidents, near misses, regressions, failed deployments, retrospectives, root causes, lessons, and promoted patterns.

Primary surfaces: INCIDENT_SYSTEM and LESSON_SYSTEM.

## Two graphs, one truth

- **Emergent graph:** links among canonical notes reveal semantic gravity.
- **Curated canvas:** intentionally composed views for navigation and explanation.

Neither graph is authority. The graph is a projection of real relationships encoded in notes.

## Separation invariants

- A `proposal` is not an `approved decision`.
- A `decision` is not `implemented state`.
- An `implemented state` is not `verified behavior`.
- A `test result` is not `production behavior`.
- A `memory-only note` is not `repo-backed proof`.
- An `accepted risk` is not a `mitigated risk`.
- A `resolved incident` is not an erased incident.
- A `superseded decision` remains historical evidence.

## Related

- [[cognitive-os/03_GOVERNED_OBJECT_MODEL]]
- [[cognitive-os/04_RELATIONSHIP_VOCABULARY]]
- [[cognitive-os/05_AUTHORITY_AND_TRUTH]]
- [[cognitive-os/06_CERTAINTY_AND_EVIDENCE]]

## Graph neighborhood

- [[cognitive-os/03_GOVERNED_OBJECT_MODEL]]
- [[cognitive-os/04_RELATIONSHIP_VOCABULARY]]
- [[cognitive-os/05_AUTHORITY_AND_TRUTH]]
- [[cognitive-os/06_CERTAINTY_AND_EVIDENCE]]
- [[cognitive-os/OPERATOR_MODES]]
- [[cognitive-os/README]]
