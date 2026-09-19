# Parallel Work Governance

## What is this?

This subsystem coordinates multiple bounded writers without pretending Git provides semantic locking.

## When do I load it?

Load it when two or more active candidates can overlap in time or when integration ordering/dependencies matter.

## What is canonical?

- [active-work.md](active-work.md) — durable ledger.
- [ownership.md](ownership.md) — ownership semantics.
- [dependencies.md](dependencies.md) — dependency representation.
- [collision-policy.md](collision-policy.md) — overlap handling.
- [integration-order.md](integration-order.md) — ordering rules.

## Dependencies

Parallel work depends on exact source SHAs, branch policy, and explicit integration authority.
