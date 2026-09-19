# Exact-Action Approval

Capabilities define what classes of effects an execution may perform. Sensitive effects may require an additional **exact-action approval**.

Approval is not capability escalation.

```text
relevant tool
   ≠ authorized capability

authorized capability
   + exact sensitive action proposed
   + approval bound to exact proposal
   = executable approved action
```

## Bound fields

An action proposal binds:

- authority-envelope identity;
- required capability;
- operation name;
- exact parameters;
- target-state assumptions.

The proposal receives a deterministic SHA-256 identity. Approval tokens HMAC-sign that identity together with approver, approval ID, envelope identity, and capability.

Changing the candidate SHA, remote, branch, deployment target, expected pre-state, command parameters, capability, operation, or authority envelope invalidates the approval.

## No authority laundering

An approval request for a capability absent from the execution envelope is rejected before approval. Human approval of a specific action is therefore an additional authorization condition, not a back door around Forge's capability model.

A broader authority transition must issue a new envelope through the proper Forge authority path.

## Runtime reference

`tools/forge_action_approval.py` implements the experimental transport-neutral primitive. It deliberately does not execute the approved operation; the eventual tool broker must verify both capability and exact-action approval immediately before the side effect.

## Replay protection

A valid approval is not a reusable blanket ticket. The `ApprovalLedger` consumes the pair of approval ID and exact action identity once. Consumption is recorded only after cryptographic verification succeeds, so a bad key or altered proposal does not burn the legitimate token.

The ledger is serializable and must be persisted with resumable execution state when a sensitive action may cross an agent/session boundary. Reconstructing a conversation must not reset approval consumption.
