# Nest Completion Protocol

A completed nest is an authority transition, not a cue for the Maintainer to immediately become the implementation worker.

## Required completion actions

1. verify nest artifacts;
2. verify baseline authority;
3. establish/update the current SSOT;
4. record material decisions;
5. produce a Nest Completion Report;
6. generate the first bounded Code Writer handoff when implementation work is ready;
7. generate a Bootstrap Packet for a fresh writer conversation;
8. explicitly return implementation authority through that handoff.

## Fresh-chat recommendation

Prefer a fresh Code Writer conversation after substantial reconnaissance/nesting.

The writer should receive:

```text
FORGE SOURCE
+
TARGET REPOSITORY
+
CURRENT PROJECT MEMORY
+
EXACT AUTHORITY
+
BOUNDED HANDOFF
```

It should not need the entire exploratory conversation that led to the accepted architecture.

## Canonical user instruction

The Maintainer should tell the user that nesting is complete and instruct them to open a new chat, attach or provide the KIRION Forge source plus target repository access, then paste the generated Code Writer Bootstrap Packet.

The writer returns its report to the Maintainer rather than integrating itself.