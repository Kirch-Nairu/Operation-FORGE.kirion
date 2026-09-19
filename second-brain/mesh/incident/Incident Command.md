---
type: concept
domain: incident
status: ACTIVE
authority: knowledge
---
# Incident Command

Incident command is the explicit assignment of decision authority for the duration of an incident. Its purpose is not coordination for its own sake; it is to guarantee that at every moment there is exactly one identifiable party who may authorise a consequential action, and that everyone knows who it is.

Without it, the characteristic failure is not inaction but *uncoordinated action*: two responders applying conflicting mitigations, a rollback racing a forward fix, or a containment step destroying the evidence needed for diagnosis.

## Roles

**Incident Commander.** Holds decision authority. Does not debug. The commander's job is to maintain the current picture, decide between mitigation options, authorise destructive or user-visible actions, and decide when the incident is over. The commander is explicitly permitted to be less technically expert than the responders — the role is authority, not expertise.

**Operations / responders.** Investigate and execute. They propose actions; they do not unilaterally take consequential ones.

**Communications.** Owns external and internal status. Separating this from command is what prevents the commander from being consumed by status requests.

**Scribe.** Maintains the timeline in real time. Reconstructed timelines are unreliable; this role exists because memory of an incident is reliably wrong about ordering.

On a small team one person may hold several roles, but the roles must be *named*, not assumed. "Everyone is on the call" is the absence of command.

## Handover

Incidents outlast attention. A handover must transfer: current hypothesis, actions already taken and their observed effect, actions explicitly ruled out and why, outstanding risks, and who is now commander. Handover is a stated event with an acknowledgement, not a drift of participation.

## The authority question

The single most useful property of incident command is a pre-agreed answer to: *who may authorise an action that is irreversible, user-visible, or destructive?* Restarting a node, failing over a database, revoking all sessions, or taking a service offline are decisions that should route to one place. Pre-agreeing this is cheap; deciding it mid-incident is not.

For AI-assisted response this matters more, not less. An agent may propose mitigations and gather evidence, but authorisation for consequential actions remains with the human commander. See [[mesh/ai/Agent Authority Boundary]].

## Failure modes

- **Implicit command.** The most senior person present is assumed to be commanding, and is in fact debugging.
- **Commander debugging.** Authority disappears into a terminal and the incident loses its decision point.
- **No declared end.** Without an explicit resolution, monitoring relaxes while the system is still degraded.
- **Command without a timeline.** Post-incident learning depends on ordering, and ordering must be captured live.

## Local neighborhood
- [[mesh/incident/Incident Timeline]]
- [[mesh/incident/Containment Decision]]
- [[mesh/incident/Recovery Decision]]
- [[mesh/incident/Detection Signal]]
- [[mesh/incident/Impact Boundary]]
- [[mesh/incident/Incident Evidence]]
- [[mesh/incident/Post Incident Learning]]

## Bridge corridor
- [[mesh/sre/Alert Routing]]
- [[mesh/reliability/Operational Runbook]]
- [[mesh/governance/Risk Acceptance]]
- [[mesh/ai/Agent Authority Boundary]]
