# Git Governance

## What is this?

Git governance defines exact authority, branch semantics, commit expectations, promotion, integration, rollback, recovery, history preservation, and branch lifecycle.

## When do I load it?

Load [exact-authority.md](exact-authority.md) and [branch-policy.md](branch-policy.md) before branch mutation. Load promotion/integration/rollback/recovery documents only for those transitions.

## What is canonical?

This directory is canonical for Git semantics. The state-transition procedure for promotion is [protocols/promotion.md](../protocols/promotion.md).

## Dependencies

Git governance depends on the project authority model and role boundaries. Git access does not imply promotion authority.
