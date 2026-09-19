# Recoverability

Forge optimizes for systems that remain understandable and recoverable after inevitable mistakes.

## Assumption

Agents will make mistakes. Humans will make mistakes. Tests may be stale. Environments may fail. Tooling may lie by omission. Conversations may expire.

Forge therefore treats recoverability as a design property rather than an emergency afterthought.

## Recoverable work has

- known starting authority;
- bounded ownership;
- preserved history;
- explicit candidate identity;
- recorded validation;
- known unresolved risks;
- clear authority return;
- enough durable memory for another worker to continue.

## Prefer preservation over concealment

When a branch contains an invalid or accidental commit, quarantine and supersede it when practical instead of rewriting shared history merely to make the graph look clean.

## Recovery hierarchy

When work fails:

1. stop uncontrolled mutation;
2. identify current observable state;
3. preserve useful evidence;
4. classify the failure;
5. determine the last trusted authority;
6. choose continue, rework, revert, quarantine, or rebuild;
7. record material lessons in durable memory.

## Success criterion

A workflow is robust when the failure of one worker does not require rediscovering the entire project.