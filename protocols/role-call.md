# Role Call Protocol

Forge work begins by establishing the active role.

## Canonical invocations

```text
KIRION FORGE: MAINTAINER
KIRION FORGE: CODE WRITER
KIRION FORGE: INTEGRATION WRITER
KIRION FORGE: REVIEWER
KIRION FORGE: ACCEPTANCE
```

## Purpose

Role Call prevents conversational ambiguity from silently expanding authority.

## Maintainer Role Call

After `KIRION FORGE: MAINTAINER`:

1. establish whether the project is NEW or EXISTING;
2. identify the user/human technical authority when relevant;
3. load the Maintainer role contract;
4. enter the corresponding project-start protocol.

## Writer Role Call

After `KIRION FORGE: CODE WRITER`:

1. require a bounded handoff or explicit Maintainer-derived assignment;
2. identify the Forge source and target repository;
3. load repository-local AGENTS and current project memory;
4. verify exact authority;
5. perform writer preflight before mutation.

## Role transitions

A role does not silently transform into another role merely because the next action would be convenient.

If one conversation performs multiple roles, explicitly mark the transition and ensure the new role actually has the required authority.