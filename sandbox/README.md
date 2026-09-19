# Sandbox Operations

## What is this?

This subsystem makes disposable execution environments recoverable without confusing them with accepted checkpoints.

## When do I load it?

Load it when starting isolated execution, when an execution window is narrowing, when a VM/tool session may disappear, or when a blocked writer must hand work to a successor.

## What is canonical?

- [lifecycle.md](lifecycle.md)
- [capsule.md](capsule.md)
- [recovery.md](recovery.md)
- [environment-fingerprint.md](environment-fingerprint.md)

The operational stop/preservation transition is [protocols/sandbox-isolation.md](../protocols/sandbox-isolation.md).

## Dependencies

Capsules depend on exact Git authority, evidence records, and secret-handling rules.
