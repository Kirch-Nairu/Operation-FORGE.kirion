# Sandbox Model

Forge treats implementation environments as bounded and disposable.

## Principle

> **Ephemeral execution. Durable authority.**

The sandbox may be a VM, container, worktree, clone, cloud computer, CI worker, or other isolated environment.

## What sandboxes are for

Inside a bounded sandbox, agents may aggressively:

- install dependencies;
- compile;
- generate code;
- mutate candidate files;
- run migrations against disposable data;
- execute fuzzers;
- run browser or device tests;
- test destructive failure paths where safe;
- discard unsuccessful approaches.

## What a sandbox is not

A sandbox is not automatically:

- accepted repository authority;
- production truth;
- durable memory;
- evidence of deployment;
- permission to mutate stable branches.

## Sandbox loss

Forge should tolerate complete sandbox loss. Before an execution window expires or a blocker requires stopping, preserve enough state to reconstruct the work through commits, reports, evidence, or continuity artifacts.

## Dirty state

Uncommitted sandbox state is not automatically bad. A dishonest checkpoint commit is worse than a truthful report that says coherent work remains uncommitted.

Commit only when the state is meaningful, allowed, and recoverable.