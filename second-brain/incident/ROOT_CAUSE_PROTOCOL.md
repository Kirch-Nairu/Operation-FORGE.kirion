---
id: INCIDENT-RCA-0001
type: protocol
status: ACTIVE
authority: doctrine
tags: [incident/root-cause]
---
# Root Cause Protocol

Root cause analysis is required for meaningful incidents, not every trivial defect.

## Separate

- triggering event
- root cause(s)
- contributing conditions
- latent control gaps
- detection gap
- recovery gap
- human/process factors without blame theater

## Ask

1. What condition made the incident possible?
2. Why did existing controls not prevent it?
3. Why was it not detected earlier?
4. Why was recovery easy or difficult?
5. What correction reduces recurrence most directly?
6. Is the proposed correction proportionate?

Avoid stopping at “human error” or “AI made a mistake.” Find the system condition that allowed error to become impact.

Related: [[incident/INCIDENT_SYSTEM]] · [[knowledge/LESSON_SYSTEM]]

## Graph neighborhood

- [[cognitive-os/hubs/ASSURANCE_LEARNING_SECTOR]]
- [[incident/INCIDENT_SYSTEM]]
- [[knowledge/LESSON_SYSTEM]]
