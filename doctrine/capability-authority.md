# Capability Authority Model

Forge roles describe responsibility. Runtime authority is represented separately as an explicit **capability envelope**.

## Principle

```text
tool visible ≠ tool authorized
tool relevant ≠ tool authorized
model capable ≠ actor authorized
```

An execution envelope binds:

- active role;
- repository;
- exact base SHA;
- working branch;
- explicit effect capabilities;
- repository-relative path scope;
- remaining delegation depth;
- parent envelope identity when delegated.

## Capability classes

The current mechanical vocabulary includes:

- `REPO_READ`
- `EXTERNAL_READ`
- `WORKTREE_WRITE`
- `TEST_EXECUTE`
- `LOCAL_GIT_WRITE`
- `REMOTE_GIT_WRITE`
- `NETWORK_WRITE`
- `SECRET_ACCESS`
- `ACCEPT`
- `PROMOTE`
- `DEPLOY`
- `DESTRUCTIVE`
- `AUTHORITY_MUTATION`

Capabilities are not inferred from tool discovery or task relevance.

## Delegation law

A child envelope must satisfy:

```text
child capabilities ⊆ parent capabilities
child path scope ⊆ parent path scope
child delegation depth < parent delegation depth
repository/base/branch identity inherited from parent
```

Delegation therefore cannot be used to launder deploy, remote Git, acceptance, promotion, destructive, or authority-mutation rights.

## Path authority

`WORKTREE_WRITE` requires both the capability and a repository path inside the envelope's allow-list. A global write capability with no owned path is not sufficient.

## Runtime reference

`tools/forge_authority_kernel.py` is the experimental mechanical implementation. It is deliberately small so the trusted authority surface remains reviewable.

## Sensitive effects

Possessing a capability does not mean every invocation should execute without confirmation. Sensitive operations can add the [Exact-Action Approval](exact-action-approval.md) gate. The approval is bound to the envelope and exact action and cannot create a capability absent from the envelope.
