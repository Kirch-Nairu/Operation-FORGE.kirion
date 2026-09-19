# Hot, Warm, and Cold Memory

Forge optimizes for the smallest relevant context.

## Hot

Load directly for the active task:

- current handoff;
- exact source/target authority;
- active failure or blocker;
- owned files and dependencies;
- selected validation gates.

## Warm

Load at role startup when relevant:

- `AGENTS.md`;
- current SSOT/authority/nest records;
- active architecture and decisions;
- active work ledger;
- current integration/release constraints.

## Cold

Retrieve only on demand:

- superseded decisions;
- old handoffs;
- archived incidents;
- previous releases;
- historical evidence;
- quarantine records.

A large document is not automatically warm. Split or link when only a narrow section is routinely needed.
