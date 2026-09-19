---
id: BRAIN-CONSTITUTION-0001
type: doctrine
status: APPROVED
maturity: VERIFIED
authority: doctrine
source: design-baseline
tags: [brain/constitution, governance]
graph_nonvisual_relations:
  - "cognitive-os/05_AUTHORITY_AND_TRUTH"
  - "cognitive-os/06_CERTAINTY_AND_EVIDENCE"
---
# Cognitive OS Constitution

Project Second Brain V2 is an **engineering cognition system**: a locally owned, repository-backed system for planning, deciding, implementing, verifying, operating, learning, and preserving why engineering choices exist.

It extends the existing [[second-brain/00_SECOND_BRAIN_DOCTRINE|Second Brain Doctrine]] rather than replacing it.

## Mission

Preserve enough context, evidence, uncertainty, rationale, and operational history that a human or fresh agent can answer:

- What are we trying to achieve?
- What is true right now?
- How do we know?
- What are we assuming?
- What could go wrong?
- What options were considered?
- Why was this option chosen?
- What would make us reconsider?
- What should happen if a failure occurs?
- What has already been tried?
- What did we learn?

## Prime directive

> **Use the least process that makes uncertainty, authority, risk, and recovery sufficiently explicit for the decision at hand.**

## Non-negotiable laws

1. **Reality outranks recollection.** Current user authorization and actual repository/runtime evidence govern action; memory supplies context.
2. **No fake certainty.** Confidence is not evidence and agreement is not verification.
3. **No hidden state promotion.** Brainstorming does not become a decision; a decision does not become implementation proof; a screenshot does not become repository truth.
4. **Adaptive rigor.** Process intensity rises with impact, uncertainty, irreversibility, exposure, data sensitivity, and blast radius.
5. **Recovery is part of design.** Important systems must model failure, detection, containment, recovery, and verification.
6. **Contradictions remain visible.** Conflicting evidence is recorded and resolved explicitly, never silently harmonized.
7. **One canonical record.** Dashboards, graphs, canvases, and generated summaries are projections of canonical records.
8. **Learning closes the loop.** Incidents, near misses, retrospectives, and repeated project evidence may improve patterns and doctrine through review.
9. **Complexity must pay rent.** Every schema, gate, template, and automation must reduce meaningful uncertainty, risk, or coordination cost.
10. **AI is bounded.** Agents may propose, implement within scope, inspect, test, and synthesize; they may not invent proof or silently change approved architecture.

## System loop

```text
OBSERVE
→ FRAME
→ RESEARCH
→ PLAN
→ DECIDE
→ EXECUTE
→ VERIFY
→ DEPLOY
→ OPERATE
→ OBSERVE OUTCOME
→ LEARN
→ UPDATE KNOWLEDGE
```

At every transition ask:

```text
What do we know?
How do we know it?
What are we assuming?
What is the cost of being wrong?
Is the action reversible?
What detects failure?
What is the recovery path?
What evidence is required to proceed?
```

## Related

- [[cognitive-os/CENTRAL_BRAIN]]
- [[cognitive-os/02_ADAPTIVE_RIGOR]]
- 05_AUTHORITY_AND_TRUTH
- 06_CERTAINTY_AND_EVIDENCE
- [[cognitive-os/08_ANTI_BUREAUCRACY]]
- [[second-brain/03_AUTHORITY_ORDER]]

## Graph neighborhood

- [[cognitive-os/CENTRAL_BRAIN]]
- [[cognitive-os/02_ADAPTIVE_RIGOR]]
- [[cognitive-os/08_ANTI_BUREAUCRACY]]
- [[cognitive-os/README]]
