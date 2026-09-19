---
type: subhub
domain: incident
status: ACTIVE
authority: evidence
---
# Incident Evidence

Incident evidence is the contemporaneous, timestamped record of what was observed, decided, and done during an incident — captured as it happens, because a reconstructed timeline written after the fact is reliably wrong about ordering, and ordering is usually the fact that matters most for root cause.

The failure this guards against: human memory of a stressful, fast-moving event compresses and reorders. Two responders debriefing an hour later will disagree about which mitigation happened first, and both will be sincere and both may be wrong. A scribe role exists specifically because live capture is a different epistemic act than recollection, not because it is more thorough — it is more accurate.

What belongs in the record, minimally: each hypothesis considered and when it was raised, each action taken and its observed effect (not its intended effect — what actually happened when it was applied), each escalation and handover with what was transferred, and the detection signal that started the clock. A record of "we fixed it" without the sequence that led there is not incident evidence; it is a conclusion with the evidence for it discarded.

The record's second purpose, beyond the incident itself, is post-incident learning: a causal chain can only be reconstructed accurately from a timeline that was captured as events occurred, not inferred afterward from memory and log timestamps that may not agree with each other.

## Local neighborhood
- [[mesh/incident/Incident Timeline]]
- [[mesh/incident/Detection Signal]]
- [[mesh/incident/Impact Boundary]]
- [[mesh/incident/Root Cause Chain]]
- [[mesh/incident/Control Failure]]
- [[incident/INCIDENT_SYSTEM]]

## Bridge corridors
- [[mesh/security/Security Logging]]
- [[mesh/data/Audit Record Integrity]]
- [[mesh/operations/Telemetry Contract]]
