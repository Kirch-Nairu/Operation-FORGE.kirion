# Collision Policy

## Two writers modify the same file

Stop treating them as independent. Determine whether the changes are semantically separable, assign precedence/integration ownership, or re-scope one writer.

## Shared infrastructure required by multiple writers

Prefer a dedicated prerequisite candidate or an explicitly owned integration surface. Document downstream source expectations.

## One writer invalidates another's starting state

The affected writer does not silently rebase. Preserve its candidate, mark `BLOCKED`, and return for Maintainer reconciliation.

## Semantic collision without file collision

Different files can still change the same contract, schema, route, permission, or data behavior. Ownership must account for contracts, not only paths.
