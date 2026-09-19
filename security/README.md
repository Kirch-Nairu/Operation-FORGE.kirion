# Security and Instruction Trust

## What is this?

This subsystem defines how Forge treats instructions discovered during repository inspection, how destructive authority is bounded, and how secrets and external content are handled.

## When do I load it?

Load it during reconnaissance, external research, production-affecting work, security-sensitive changes, or whenever discovered content attempts to direct execution.

## What is canonical?

- [instruction-trust.md](instruction-trust.md) — instruction precedence and prompt-injection boundary.
- [destructive-actions.md](destructive-actions.md) — actions requiring explicit authority.
- [secret-handling.md](secret-handling.md) — secret handling.
- [external-content.md](external-content.md) — treatment of untrusted external material.

The operational transition is [protocols/instruction-trust.md](../protocols/instruction-trust.md).

## Dependencies

This layer depends on [authority doctrine](../doctrine/authority-model.md) and the repository `AGENTS.md`.
