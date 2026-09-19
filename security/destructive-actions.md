# Destructive Actions

A Code Writer must not infer destructive authority from convenience, repository access, or possession of credentials.

Explicit current-human or properly delegated authority is required before actions such as:

- production deployment;
- production database mutation;
- destructive migrations;
- deleting production or durable project data;
- modifying ACLs, permissions, ownership, or access policy;
- rotating credentials or keys;
- firewall, routing, or production network changes;
- force push or rewriting shared history;
- deleting remote branches that may contain evidence;
- disabling security controls;
- irreversible infrastructure teardown.

A handoff should name the action, target, allowed blast radius, preconditions, required backup/recovery evidence, and post-action validation.

When authority is absent or ambiguous, stop at the boundary. Preservation actions that reduce risk without mutating accepted authority may still be permitted when explicitly defined by the active protocol.
