# Git Recovery Recipes

These recipes favor preservation. Adapt commands to the project and verify every ref before mutation.

## Local branch diverged from remote authority

```bash
git fetch origin
git status --short
git branch backup/<branch>-before-reconcile
git log --oneline --decorate --graph --all -n 30
```

Classify the local commits before choosing rebase, merge, replacement, or quarantine. Do not jump directly to `reset --hard`.

## Unknown local-only commit

```bash
git show --stat <sha>
git branch quarantine/unknown-<shortsha> <sha>
```

Record provenance, then return authority if the commit is outside assignment.

## Dirty worktree before a reset/replacement

```bash
git status --short
git diff > /safe/location/unstaged.patch
git diff --staged > /safe/location/staged.patch
git ls-files --others --exclude-standard > /safe/location/untracked.txt
```

Prefer a Sandbox Capsule. Only after preservation and explicit authority should destructive cleanup occur.

## Candidate based on stale SHA

Do not silently rebase. Record expected source and observed authority, preserve the candidate, and return for Maintainer re-authorization.

## Accidental commit on wrong branch

Preserve the commit first:

```bash
git branch recovery/accidental-<shortsha> <sha>
```

Then restore the wrong branch only with authority and a verified target SHA.

## Polluted branch

Create or retain a quarantine ref at the polluted head. Do not rewrite the branch to hide the incident unless explicitly authorized.

## Remote authority moved during work

Finish no promotion action. Fetch, record old expected SHA, new observed SHA, candidate SHA, and dependency impact. Return authority for reconciliation.
